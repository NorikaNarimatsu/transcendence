import { db } from "../server.js";
import { hashPassword, comparePassword } from "../utils/passwordUtils.js";
import { sanitizeInput } from "../utils/sanitizeInput.js";

//////// Avatar Array //////
const avatars = [
  "/avatars/Avatar_1.png",
  "/avatars/Avatar_2.png",
  "/avatars/Avatar_3.png",
  "/avatars/Avatar_4.png",
  "/avatars/Avatar_5.png",
  "/avatars/Avatar_6.png",
  "/avatars/Avatar_7.png",
  "/avatars/Avatar_8.png",
  "/avatars/Avatar_9.png",
];


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

		//TODO for Gosia - should I also validate here password? in case of frontend bypass
		const isPasswordMatch = await comparePassword(password, user.password);
		if (isPasswordMatch) return response.code(200).send();
		else return response.code(401).send({ message: "Invalid password" });
	} catch (error) {
		request.log.error("validatePasswordbyEmail error: ", error);
		return response.code(500).send();
	}
};

// export const validatePasswordbyName = async (request, response) => {
// 	try {
// 		const { name, password } = request.body;

// 		const sanitiziedName = sanitizeInput.sanitizeUsername(name);
// 		const user = db.prepare("SELECT * FROM users WHERE name = ?").get(sanitiziedName); // use 'name'
// 		if (!user) return response.code(401).send({ message: "User not found" });

// 		//TODO for Gosia - should I also validate here password? in case of frontend bypass
// 		const isPasswordValid = await comparePassword(password, user.password);

// 		if (isPasswordValid) return response.code(200).send();
// 		else return response.code(401).send({ message: "Invalid password" });
// 	} catch (error) {
// 		return response.code(500).send();
// 	}
// };

export const validatePasswordByUserID = async (request, reply) => {
    try {
        const { userID, password } = request.body;
        
        if (!userID || !password) {
            return reply.code(400).send({ 
                message: "userID and password are required" 
            });
        }
        
        const sanitizedUserID = parseInt(userID);
        if (isNaN(sanitizedUserID)) {
            return reply.code(400).send({ message: "Invalid userID" });
        }
        
        // Get user by userID
        const user = db
            .prepare("SELECT userID, password FROM users WHERE userID = ?")
            .get(sanitizedUserID);
        
        if (!user) {
            return reply.code(404).send({ message: "User not found" });
        }
        const isValidPassword = await comparePassword(password, user.password);
        
        if (isValidPassword) {
            return reply.code(200).send({ 
                message: "Password is valid",
                userID: user.userID 
            });
        } else {
            return reply.code(401).send({ message: "Invalid password" });
        }
        
    } catch (error) {
        request.log.error("Password validation error:", error);
        return reply.code(500).send({
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
        createdAt
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
            .prepare("SELECT userID, name, avatarUrl FROM users WHERE email = ?") // ADD userID
            .get(sanitiziedEmail);
        if (user) {
            return reply.code(200).send({
                userID: user.userID,  // ADD userID to response
                name: sanitizeInput.sanitizeUsername(user.name),
                avatarUrl: user.avatarUrl,
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
            avatarUrl: user.avatarUrl
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
                    AND name NOT LIKE 'deleted_user_%'
                ORDER BY userID
            `)
            .all(sanitizedUserID);

        const formattedUsers = users.map(user => ({
            userID: user.userID,
            name: user.name,
            avatarUrl: user.avatarUrl
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

// Simplified version for one-sided friendship
export const getUserFriendsByUserID = async (request, reply) => {
    try {
        const { userID } = request.params;
        const sanitizedUserID = parseInt(userID);
        
        if (isNaN(sanitizedUserID)) {
            return reply.code(400).send({ message: "Invalid userID" });
        }
        
        // Get friends where this user is user1ID (one-sided friendship)
        const friends = db.prepare(`
            SELECT u.userID, u.name, u.avatarUrl
            FROM friends f
            JOIN users u ON f.user2ID = u.userID
            WHERE f.user1ID = ?
                AND name NOT LIKE 'deleted_user_%'
            ORDER BY u.name
        `).all(sanitizedUserID);
        
        // Format response to match SelectedPlayer interface
        const formattedFriends = friends.map(friend => ({
            userID: friend.userID,
            name: friend.name,
            avatarUrl: friend.avatarUrl
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
    
    // Friends management
    addFriendByUserID,
    getUserFriendsByUserID
  };

export default itemController;







// ////////////////////////////// POST //////////////////////////////

// export function addItem(request, response) {
// 	const { name, email, password } = request.body;

// 	const sanitiziedName = sanitizeInput.sanitizeUsername(name);
// 	const sanitiziedEmail = sanitizeInput.sanitizeEmail(email);

// 	const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
// 	const createdAt = new Date().toISOString();
// 	const result = db
// 	.prepare(
// 		"INSERT INTO users (name, email, password, avatarUrl, createdAt) VALUES (?, ?, ?, ?, ?)"
// 	)
// 	.run(sanitiziedName, sanitiziedEmail, password, randomAvatarUrl, createdAt);
// 	response.code(201).send({
// 	id: result.lastInsertRowid,
// 	name: sanitiziedName,
// 	email: sanitiziedEmail,
// 	avatarUrl: randomAvatarUrl,
// 	createdAt: createdAt,
// 	});
// }

// ////////////////////////////// PUT //////////////////////////////

// export function updateItem(request, response) {
// 	try {
//     const { id } = request.params;
//     const { name } = request.body;
//     const { email } = request.body;
//     const { password } = request.body;
//     const { avatarUrl } = request.body;
//     // TODO for Gosia -> is this really needed here?
//     if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
//       return response.code(400).send({ error: "Invalid or missing id" });
//     }
//     const sanitiziedName = name ? sanitizeInput.sanitizeUsername(name) : null;
//     const sanitiziedEmail = email ? sanitizeInput.sanitizeEmail(email) : null;

//     const responseult = db
//       .prepare(
//         "UPDATE users SET name = COALESCE(?, name), avatarUrl = COALESCE(?, avatarUrl) WHERE userID = ?"
//       )
//       .run(sanitiziedName, avatarUrl, id);
//     if (responseult.changes === 0) {
//       response.code(404).send({ error: "Item not found" });
//     } else {
//       response.send({
//         id,
//         name: sanitiziedName,
//         email: sanitiziedEmail,
//         password,
//         avatarUrl: avatarUrl,
//       });
//     }
//   } catch (error) {
// 		request.log.error("update error: ", error);
// 		return response.code(400).send({ 
// 			error: error.message || "Invalid input data" });
// 	}
// }

// ////////////////////////////// DELETE //////////////////////////////

// export function deleteItem(request, response) {
// 	try {
// 		const { id } = request.params;
// 		// TODO for Gosia -> is this really needed here?
// 		if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
// 			return response.code(400).send({ error: "Invalid or missing id" });
// 		}
	
// 		const responseult = db.prepare("DELETE FROM users WHERE userID = ?").run(parseInt(id));
// 		if (responseult.changes === 0) {
// 		response.code(404).send({ error: "Item not found" });
// 		} else {
// 		response.code(204).send({ message: `Item has been removed` });
// 		}
// 	} catch (error) {
// 		request.log.error("deleteItem error: ", error);
// 		return response.code(500).send({ error: "Internal server error" });
// 	}
// }


//TODO for Gosia - should this also be sanitizied, or can sanitizeName be used in the next function instead
// export const validateItem = (name) => {
// 	if (typeof name !== "string") throw new Error("Invalid name");
// 	const sanitiziedName = sanitizeInput.sanitizeUsername(name);
// 	if (!sanitiziedName.match(/^[A-Za-z0-9]+$/))
// 		throw new Error("Name must contain only letters and numbers");
// 	if (sanitiziedName.length < 2 || sanitiziedName.length > 7)
// 		throw new Error("Name must be between 2 and 7 characters");
// 	return true;
// };

// // Combined function using existing addItem
// export const validateAndAddItem = async (request, response) => {
// 	try {
// 		const { name } = request.body; // request.body now contains: { name: "whatever user typed" }
// 		validateItem(name);
// 		return addItem(request, response);
// 	} catch (error) {
// 		request.log.error(error);
// 		return response.code(400).send({
// 			message: error.message || "Validation failed",
// 		});
// 	}
// };

// Frontend                        Backend
//    |                               |
//    |-- POST /validateName ------->|
//    |   { "name": "Norika" }        |
//    |                               |
//    |                         Validates name
//    |                         Storesponse in DB
//    |                               |
//    |<- responseponse 200 ---------------|
//    |   { "message": "success" }    |
