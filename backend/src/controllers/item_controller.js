import { db } from "../server.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";
import { allowedAvatars } from "../utils/avatarsList.js";
import { emailUtils } from "../utils/emailUtils.js";
import bcrypt from 'bcrypt';
import { verifyTokenOwner } from "../utils/verifyTokenOwner.js";
import path from 'path';
import fs from 'fs';

//Avatar Array:
const avatars = allowedAvatars;

const isAllowedImgType = (buffer) => {
	if (!buffer || buffer.length < 8) {
		return false;
	}

	const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
	const isPng = pngSignature.every((byte, index) => buffer[index] === byte);
	if (isPng) {
		return true;
	}

	const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[buffer.length - 2] === 0xFF && buffer[buffer.length - 1] === 0xD9;
	return isJpeg;
}

export const validateName = async (request, response) => {
	try {
		const { name } = request.body;

		if (!name || typeof name != 'string') {
			return response.code(400).send({ message: "Invalid or missing name"});
		}
		let sanitizedName;

		try {
			sanitizedName = sanitizeInput.sanitizeUsername(name);
		} catch (error) {
			return response.code(400).send({ message: error.message || "Invalid name" });
		}

		const existingUser = db.prepare("SELECT * FROM users WHERE name = ?").get(sanitizedName);
		if (existingUser) {
			return response.code(409).send({ message: "Nickname is already taken"});
		}
		return response.code(200).send({ message: "Name is available" });
	}
	catch (error) {
		request.log.error("validateName error: ", error);
		return response.code(500).send({ message: "Internal server error" });
	}
};

export const validateEmail = async (request, response) => {
	try {
		const { email } = request.body;
		const sanitizedEmail = sanitizeInput.sanitizeEmail(email);

		const isExistingEmail = db
			.prepare("SELECT * FROM users WHERE email = ?")
			.get(sanitizedEmail);
			if (isExistingEmail) {
				return response.code(409).send({ message: "This email is already used"});
			} else {
				return response.code(200).send({ message: "Email is available" });
			}
	} catch (error) {
		request.log.error("validateEmail error: ", error);
		return response.code(500).send({ message: "Internal server error" });
	}
};

export const validatePasswordbyEmail = async (request, response) => {
	try {
		const { email, password } = request.body;

		const sanitiziedEmail = sanitizeInput.sanitizeEmail(email);

		const user = db
			.prepare("SELECT * FROM users WHERE email = ?")
			.get(sanitiziedEmail);
		if (!user) return response.code(401).send({ message: "User not found" });

		const isPasswordMatch = await comparePassword(password, user.password);
		if (!isPasswordMatch) {
			return response.code(401).send({ message: "Invalid password" });
		}

		// Update lastLoginAt immediately when password verification succeeds
		const updateLastLogin = db.prepare("UPDATE users SET lastLoginAt = datetime('now') WHERE userID = ?");
		updateLastLogin.run(user.userID);

		if (user['2FA']) {
			db.prepare('DELETE FROM two_factor_auth WHERE userID = ? AND used = 0').run(user.userID);
			const verificationCode = emailUtils.generateAuthCode();
			const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now
			const saltRounds = 11;
			const hashedCode = await bcrypt.hash(verificationCode, saltRounds);

			db.prepare(`
				INSERT INTO two_factor_auth (userID, code, expiresAt, attempts)
				VALUES (?, ?, ?, ?)
			`).run(user.userID, hashedCode, expiresAt, 0);

			await emailUtils.sendAuthCodeEmail(user.email, user.name, verificationCode);

			const temporaryToken = request.server.jwt.sign({
				userID: user.userID,
				email: user.email,
				name: user.name,
				has2FA: true,
				requires2FA: true,
				temp: true
			}, { expiresIn: '10m' });

			return response.code(200).send({
				message: "Verification code sent",
				requires2FA: true,
				temporaryToken: temporaryToken,
				user: {
					userID: user.userID,
					email: user.email,
					name: user.name,
					avatarUrl: sanitizeInput.avatarPathCheck(user.avatarUrl, allowedAvatars),
					has2FA: true,
					verified2FA: false
				}
			});

		} else {
			const fullToken = request.server.jwt.sign({
				userID: user.userID,
				email: user.email,
				name: user.name,
				has2FA: false,
				verified2FA: false,
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60,
				lastActivity: Math.floor(Date.now() / 1000)
			}, { expiresIn: '3h' });

			return response.code(200).send({
				message: "Login successful",
				requires2FA: false,
				token: fullToken,
				user: {
					userID: user.userID,
					email: user.email,
					name: user.name,
					avatarUrl: sanitizeInput.avatarPathCheck(user.avatarUrl, allowedAvatars),
					has2FA: false,
					verified2FA: false
				}
			});
		}
	} catch (error) {
		console.error("validatePasswordByEmail error: ", error);
		return response.code(500).send({ message: "Internal server error" });
	}
};

export const validatePasswordByUserID = async (request, response) => {
    try {
        const { userID, password } = request.body;
        
        if (!userID || !password) {
            return response.code(400).send({ 
                message: "userID and password are required" 
            });
        }
        
        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }
        
        const user = db
            .prepare("SELECT userID, password FROM users WHERE userID = ?")
            .get(sanitizedUserID);
        
        if (!user) {
            return response.code(404).send({ message: "User not found" });
        }
        const isValidPassword = await comparePassword(password, user.password);
        
        if (isValidPassword) {
            return response.code(200).send({
                message: "Password is valid",
                userID: user.userID 
            });
        } else {
            return response.code(401).send({ message: "Invalid password" });
        }
        
    } catch (error) {
        request.log.error("Password validation error:", error);
        return response.code(500).send({
            message: "Internal server error",
        });
    }
};

export async function addNewUser(request, response) {
  try {
    const { name, email, password } = request.body;

    const sanitizedName = sanitizeInput.sanitizeUsername(name);
    const sanitizedEmail = sanitizeInput.sanitizeEmail(email);

	if (sanitizedName.length < 2 || sanitizedName.length > 7) {
		return response.code(400).send({ 
			message: "Name must be between 2 and 7 characters" });
	}

	const existingName = db.prepare("SELECT * FROM users WHERE name = ?").get(sanitizedName);
	if (existingName) {
		return response.code(409).send({ message: "This name is already used", conflictType: "name" });
	}

	const existingEmail = db.prepare("SELECT * FROM users WHERE email = ?").get(sanitizedEmail);
	if (existingEmail) {
		return response.code(409).send({ message: "This email is already used", conflictType: "email" });
	}
	
	const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
    const hashedPassword = await hashPassword(password);
    const createdAt = new Date().toISOString();

    const result = db
      .prepare(
        "INSERT INTO users (name, email, password, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        sanitizedName,
        sanitizedEmail,
        hashedPassword,
        randomAvatarUrl,
        createdAt,
      );
    response.code(201).send({
      id: result.lastInsertRowid,
      name: sanitizedName,
      email: sanitizedEmail,
      avatarUrl: randomAvatarUrl,
      created_at: createdAt,
    });
  } catch (error) {
    request.log.error("Failed to add new user:", error);
    return response.code(500).send();
  }
}

export const getUserByEmail = async (request, reply) => {
	try {
		const { email } = request.params;
		const sanitiziedEmail = sanitizeInput.sanitizeEmail(email);
		const user = db
			.prepare("SELECT name FROM users WHERE email = ?")
			.get(sanitiziedEmail);
		if (user) {
			return reply.code(200).send({
			name: sanitizeInput.sanitizeUsername(user.name),
			});
		}
		return reply.code(404).send({
			message: "User not found",
		});
	} catch (error) {
		request.log.error("Failed to get user:", error);
		return reply.code(500).send({
			message: "Internal server error",
		});
	}
};

export const getUserInfoByEmail = async (request, reply) => {
    try {
        const { email } = request.params;
        const sanitiziedEmail = sanitizeInput.sanitizeEmail(email);
        
        const user = db
            .prepare("SELECT userID, name, avatarUrl FROM users WHERE email = ?")
            .get(sanitiziedEmail);
        if (user) {
            return reply.code(200).send({
                userID: user.userID,
                name: sanitizeInput.sanitizeUsername(user.name),
                avatarUrl: sanitizeInput.avatarPathCheck(user.avatarUrl, avatars)
            });
        }
        return reply.code(404).send({
            message: "User not found",
        });
    } catch (error) {
        request.log.error("Failed to get user:", error);
        return reply.code(500).send({
            message: "Internal server error",
        });
    }
};

export const getUserById = async (request, reply) => {
    try {
        const { userID } = request.params;
        
        if (!userID) {
            return reply.code(400).send({ message: "UserID is required" });
        }

        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return reply.code(400).send({ message: "Invalid userID format" });
        }

        const user = db.prepare("SELECT userID, name, avatarUrl FROM users WHERE userID = ?").get(sanitizedUserID);
        
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }

        return reply.code(200).send({
          userID: user.userID,
          name: user.name,
          avatarUrl: sanitizeInput.avatarPathCheck(user.avatarUrl, avatars)
        });

    } catch (error) {
        console.error('getUserById error:', error);
        return reply.code(500).send({ message: "Internal server error" });
    }
};

export const getUsersExceptUserID = async (request, reply) => {
    try {
        const { userID } = request.params;
        const sanitizedUserID = parseInt(userID);
        
        if (isNaN(sanitizedUserID)) {
            console.log('Invalid userID - not a number');
            return reply.code(400).send({ message: "Invalid userID" });
        }
        const users = db
            .prepare(`
                SELECT userID, name, avatarUrl 
                FROM users 
                WHERE userID != ?
                    AND userID != 1
                    AND userID != 2
                    AND userID != 0
                    AND name NOT LIKE 'anon%'
                ORDER BY userID
            `)
            .all(sanitizedUserID);

        const formattedUsers = users.map((user) => ({
          userID: user.userID,
          name: sanitizeInput.sanitizeUsername(user.name),
          avatarUrl: sanitizeInput.avatarPathCheck(user.avatarUrl, avatars),
        }));
        
        console.log('Formatted users:', formattedUsers);
        
        return reply.code(200).send(formattedUsers);
        
    } catch (error) {
        console.error("getUsersExceptUserID error:", error);
        console.error("Error stack:", error.stack);
        return reply.code(500).send({
            message: "Internal server error",
        });
    }
};

export const getUserFriendsByUserID = async (request, reply) => {
    try {
        const { userID } = request.params;
        const sanitizedUserID = parseInt(userID);
        
        if (isNaN(sanitizedUserID)) {
            return reply.code(400).send({ message: "Invalid userID" });
        }

        const friends = db.prepare(`
            SELECT u.userID, u.name, u.avatarUrl, u.lastLoginAt
            FROM friends f
            JOIN users u ON f.user2ID = u.userID
            WHERE f.user1ID = ?
                AND name NOT LIKE 'anon%'
            ORDER BY u.name
        `).all(sanitizedUserID);
        
        const formattedFriends = friends.map(friend => ({
            userID: friend.userID,
            name: sanitizeInput.sanitizeUsername(friend.name),
            avatarUrl: sanitizeInput.avatarPathCheck(friend.avatarUrl, avatars),
            lastLoginedAt: friend.lastLoginAt
        }));
        
        return reply.code(200).send(formattedFriends);
        
    } catch (error) {
        request.log.error("Failed to get friends by userID:", error);
        return reply.code(500).send({
            message: "Internal server error",
        });
    }
};

export const addFriendByUserID = async (request, response) => {
    try {
        const { user1ID, user2ID } = request.body;

        if (!user1ID || !user2ID) {
            return response.code(400).send({ message: "user1ID and user2ID are required" });
        }

        const sanitizedUser1ID = parseInt(user1ID);
        const sanitizedUser2ID = parseInt(user2ID);

        if (isNaN(sanitizedUser1ID) || isNaN(sanitizedUser2ID)) {
            return response.code(400).send({ message: "Invalid userID format" });
        }

        // Check if user1 exists
        const user1 = db.prepare("SELECT userID FROM users WHERE userID = ?").get(sanitizedUser1ID);
        if (!user1) {
            return response.code(404).send({ message: "User not found" });
        }

        // Check if user2 (friend) exists
        const user2 = db.prepare("SELECT userID FROM users WHERE userID = ?").get(sanitizedUser2ID);
        if (!user2) {
            return response.code(404).send({ message: "Friend not found" });
        }

        // Check if user is trying to add themselves
        if (sanitizedUser1ID === sanitizedUser2ID) {
            return response.code(400).send({ message: "Cannot add yourself as a friend" });
        }

        // Check if friendship already exists (one-sided only)
        const existingFriendship = db.prepare(
            "SELECT * FROM friends WHERE user1ID = ? AND user2ID = ?"
        ).get(sanitizedUser1ID, sanitizedUser2ID);

        if (existingFriendship) {
            return response.code(409).send({ message: "Already friends" });
        }

        // Add the friendship (one-sided)
        const registeredAt = new Date().toISOString();
        const result = db.prepare(
            "INSERT INTO friends (user1ID, user2ID, registeredAt) VALUES (?, ?, ?)"
        ).run(sanitizedUser1ID, sanitizedUser2ID, registeredAt);

        return response.code(201).send({ 
            message: "Friend added successfully",
            friendshipID: result.lastInsertRowid 
        });

    } catch (error) {
        request.log.error("addFriendByUserID error: ", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};


export function updateAvatarUrl(request, response) {
	try {
        const { userID, avatarUrl } = request.body;

		if (!userID || !avatarUrl) {
			return response.code(400).send({ error: "userID and avatarUrl are required" });
		}

		const sanitizedUserID = parseInt(userID);
		if (isNaN(sanitizedUserID)) {
			return response.code(400).send({ error: "Invalid userID format" });
		}

		const ownerError = verifyTokenOwner(request, sanitizedUserID);
		if (ownerError) {
			return response.code(ownerError.code).send({ error: ownerError.error });
		}

		let sanitizedAvatarUrl = avatarUrl.trim();

		try {
			if (sanitizedAvatarUrl.startsWith('/uploadAvatars/')) {
				const baseUrl = sanitizeInput.sanitizeUploadAvatarPath(sanitizedAvatarUrl);

				const expectedPrefix = `/uploadAvatars/avatar_${sanitizedUserID}.`;
				if (!baseUrl.startsWith(expectedPrefix)) {
					return response.code(403).send({ error: "You can only use your own uploaded avatar" });
				}

				const timestamp = Date.now();
				sanitizedAvatarUrl = `${baseUrl.split("?")[0]}?t=${timestamp}`;				
			} else {
				sanitizedAvatarUrl = sanitizeInput.avatarPathCheck(sanitizedAvatarUrl, avatars);
			}
		} catch (error) {
			return response.code(400).send({ error: error.message || "Invalid avatarUrl" });
		}

        const result = db
          .prepare("UPDATE users SET avatarUrl = ? WHERE userID = ?")
          .run(sanitizedAvatarUrl, sanitizedUserID);

        if (result.changes === 0) {
			return response.code(404).send({ error: "Item not found" });
		}

        return response.code(200).send({ message: "Avatar updated successfully", avatarUrl: sanitizedAvatarUrl, });
    } catch (error) {
        return response.code(400).send({ 
            error: error.message || "Invalid input data" });
    }
}

export const uploadAvatar = async (request, response) => {
    try {
        let userIDValue;
        let fileBuffer;
        let fileMimetype;

        const parts = request.parts();
        
        for await (const part of parts) {
            if (part.type === 'field') {
                if (part.fieldname === 'userID') {
                    userIDValue = part.value;
                }
            } else if (part.type === 'file') {
                if (part.fieldname === 'avatar') {
                    fileBuffer = await part.toBuffer();
                    fileMimetype = part.mimetype;
                }
            }
        }

        // Validate we have both userID and file
        if (!userIDValue) {
            return response.code(400).send({ error: 'userID is required' });
        }

        if (!fileBuffer) {
            return response.code(400).send({ error: 'No file uploaded' });
        }

        const sanitizedUserID = parseInt(userIDValue);

        if(isNaN(sanitizedUserID)){
            return response.code(400).send({ error: 'Invalid userID' });
        }

        const ownerError = verifyTokenOwner(request, sanitizedUserID);
        if (ownerError){
            return response.code(ownerError.code).send({ error: ownerError.error });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if(!allowedTypes.includes(fileMimetype)){
            return response.code(400).send({ error: 'Only JPEG and PNG images are allowed' });
        }

		if (!isAllowedImgType(fileBuffer)) {
			return response.code(400).send({ error: 'File content is not valid JPEG or PNG image' });
		}

        const fileSizeInMB = fileBuffer.length / (1024 * 1024);
        if (fileSizeInMB > 2){
            return response.code(400).send({ error: 'File size must be less than 2MB' });
        }

        const uploadDir = path.join(process.cwd(), 'uploadAvatars');
        if(!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileExtension = fileMimetype.split('/')[1];
        const fileName = `avatar_${sanitizedUserID}.${fileExtension}`;
        const filePath = path.join(uploadDir, fileName);

        // Delete old avatar if it exists (any extension)
        const files = fs.readdirSync(uploadDir);
        const oldAvatars = files.filter(file => file.startsWith(`avatar_${sanitizedUserID}.`));
        
        for (const oldAvatar of oldAvatars) {
            const oldPath = path.join(uploadDir, oldAvatar);
            try {
                fs.unlinkSync(oldPath);
                console.log(`✅ Deleted old avatar: ${oldPath}`);
            } catch (err) {
                request.log.warn('Failed to delete old avatar:', err);
            }
        }

        // Save the new file as current
        await fs.promises.writeFile(filePath, fileBuffer);
        console.log(`✅ Saved new avatar as current: ${filePath}`);
        const timestamp = Date.now();
        const avatarUrl = `/uploadAvatars/${fileName}?t=${timestamp}`;
        const result = db.prepare('UPDATE users SET avatarUrl = ? WHERE userID = ?').run(avatarUrl, sanitizedUserID);
        if(result.changes === 0){
            fs.unlinkSync(filePath);
            return response.code(404).send({ error: 'User not found' });
        }
        
        return response.code(200).send({
            message: 'Avatar uploaded successfully',
            avatarUrl: avatarUrl
        });
    } catch (error) {
        request.log.error('Upload avatar error:', error);
        return response.code(500).send({ error: 'Failed to upload avatar' });
    }
}

export const updateUserName = async (request, response) => {
    try {
        const { userID, name } = request.body;

        if (!userID || !name) {
            return response.code(400).send({ message: "userID and name are required" });
        }

        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }

		const ownerError = verifyTokenOwner(request, sanitizedUserID);
		if (ownerError) {
			return response.code(ownerError.code).send({ error: ownerError.error });
		}

        const existingUser = db.prepare("SELECT userID, name FROM users WHERE userID = ?").get(sanitizedUserID);
        if (!existingUser) {
            return response.code(404).send({ message: "User not found" });
        }

        let sanitizedName;
        try {
            sanitizedName = sanitizeInput.sanitizeUsername(name);
        } catch (error) {
            return response.code(400).send({ message: error.message || "Invalid name" });
        }
        if (sanitizedName.length < 2 || sanitizedName.length > 7) {
            return response.code(400).send({ message: "Name must be between 2 and 7 characters" });
        }
        if (sanitizedName !== existingUser.name) {
            const nameExists = db.prepare("SELECT userID FROM users WHERE name = ? AND userID != ?").get(sanitizedName, sanitizedUserID);
            if (nameExists) {
                return response.code(409).send({ message: "This name is already used", conflictType: "name" });
            }
        } else {
            return response.code(400).send({ message: "New nickname must be different from the current nickname" });
        }

        // Update name
        const result = db.prepare("UPDATE users SET name = ? WHERE userID = ?").run(sanitizedName, sanitizedUserID);

        if (result.changes === 0) {
            return response.code(500).send({ message: "Failed to update nickname" });
        }

        return response.code(200).send({
            message: "Nickname updated successfully",
            userID: sanitizedUserID,
            name: sanitizedName
        });

    } catch (error) {
        request.log.error("updateUserName error:", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};

export const updateUserEmail = async (request, response) => {
    try {
        const { userID, email } = request.body;

        if (!userID || !email) {
            return response.code(400).send({ message: "userID and email are required" });
        }

        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }

		const ownerError = verifyTokenOwner(request, sanitizedUserID);
		if (ownerError) {
			return response.code(ownerError.code).send({ error: ownerError.error });
		}

        const existingUser = db.prepare("SELECT userID, email FROM users WHERE userID = ?").get(sanitizedUserID);
        if (!existingUser) {
            return response.code(404).send({ message: "User not found" });
        }

        let sanitizedEmail;
        try {
            sanitizedEmail = sanitizeInput.sanitizeEmail(email);
        } catch (error) {
            return response.code(400).send({ message: error.message || "Invalid email" });
        }
        if (sanitizedEmail !== existingUser.email) {
            const emailExists = db.prepare("SELECT userID FROM users WHERE email = ? AND userID != ?").get(sanitizedEmail, sanitizedUserID);
            if (emailExists) {
                return response.code(409).send({ message: "This email is already used", conflictType: "email" });
            }
        } else {
            return response.code(400).send({ message: "New email must be different from the current email" });
        }

        // Update email
        const result = db.prepare("UPDATE users SET email = ? WHERE userID = ?").run(sanitizedEmail, sanitizedUserID);

        if (result.changes === 0) {
            return response.code(500).send({ message: "Failed to update email" });
        }

        return response.code(200).send({
            message: "Email updated successfully",
            userID: sanitizedUserID,
            email: sanitizedEmail
        });

    } catch (error) {
        request.log.error("updateUserEmail error:", error);
        return response.code(500).send({ message: "Internal server error" });
    }
};

export const getUserEmailById = async (request, reply) => {
    try {
        const { userID } = request.params;
        if (!userID) {
            return reply.code(400).send({ message: "UserID is required" });
        }

        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return response.code(400).send({ message: "Invalid userID" });
        }
        const user = db.prepare("SELECT email FROM users WHERE userID = ?").get(sanitizedUserID);
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        return reply.code(200).send({ email: user.email });
    } catch (error) {
        console.error('getUserEmailById error:', error);
        return reply.code(500).send({ message: "Internal server error" });
    }
};

////////////////////////////// CONTROLLER //////////////////////////////

const itemController = {
    // Core validation
    validateName,
    validateEmail,
    validatePasswordbyEmail,
    validatePasswordByUserID,
    
    // User management
    addNewUser,
    getUserByEmail,
    getUserInfoByEmail,
    getUserById,
    getUsersExceptUserID,
    getUserEmailById,
    updateAvatarUrl,
    uploadAvatar,
    updateUserEmail,
    updateUserName,
    
    // Friends management
    addFriendByUserID,
    getUserFriendsByUserID
};

export default itemController;
