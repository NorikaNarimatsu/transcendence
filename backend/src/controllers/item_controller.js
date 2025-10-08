import { v4 as uuidv4 } from "uuid";
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

////////////////////////////// GET //////////////////////////////
export function getItems(request, response) {
	try {
		const items = db.prepare("SELECT * FROM users").all();

		const sanitiziedItems = items.map(item => ({
			id: item.id,
			name: sanitizeInput.sanitizeUsername(item.name),
			email: sanitizeInput.sanitizeEmail(item.email),
			avatarUrl: item.avatarUrl,
			created_at: item.created_at
		}))
		response.send(sanitiziedItems);

	} catch (error) {
		request.log.error("getItems error: ", error);
		return response.code(500).send({ error: "Internal server error" });
	}
}

export function getItem(request, response) {
	try {
		const { id } = request.params;

		if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
		return response.code(400).send({ error: "Invalid or missing id" });
		}

		const item = db.prepare("SELECT * FROM users WHERE id = ?").get(id);
		if (!item) {
		response.code(404).send({ error: "Item not found" });
		} else {
		response.send({
			id: item.id,
			name: sanitizeInput.sanitizeUsername(item.name),
			email: sanitizeInput.sanitizeEmail(item.email),
			avatarUrl: item.avatarUrl,
			created_at: item.created_at
			});
		}
	} catch (error) {
		request.log.error("getItem error: ", error);
		return response.code(500).send({ error: "Internal server error" });
	}
}
////////////////////////////// POST //////////////////////////////

// export function addItem(request, response) {
//   const { name, email, password } = request.body;
//   const finalAvatarUrl = avatarUrl || avatars[Math.floor(Math.random() * avatars.length)];
//   const uuid = uuidv4(); // Generate a unique UUID
//   const responseult = db.prepare('INSERT INTO items (uuid, name, email, password, avatarUrl) VALUES (?, ?, ?, ?, ?)').run(uuid, name, email, password, finalAvatarUrl);
//   response.code(201).send({ id: responseult.lastInsertRowid, name , email, avatarUrl: finalAvatarUrl, created_at: new Date().toISOString()});
// };

export function addItem(request, response) {
	const { name, email, password } = request.body;

	const sanitiziedName = sanitizeInput.sanitizeUsername(name);
	const sanitiziedEmail = sanitizeInput.sanitizeEmail(email);

	const randomAvatarUrl = avatars[Math.floor(Math.random() * avatars.length)];
	const uuid = uuidv4(); // Generate a unique UUID
	const result = db
	.prepare(
		"INSERT INTO users (uuid, name, email, password, avatarUrl) VALUES (?, ?, ?, ?, ?)"
	)
	.run(uuid, sanitiziedName, sanitiziedEmail, password, randomAvatarUrl);
	response.code(201).send({
	id: result.lastInsertRowid,
	name: sanitiziedName,
	email: sanitiziedEmail,
	avatarUrl: randomAvatarUrl,
	created_at: new Date().toISOString(),
	});
}

////////////////////////////// PUT //////////////////////////////

export function updateItem(request, response) {
	try {
    const { id } = request.params;
    const { name } = request.body;
    const { email } = request.body;
    const { password } = request.body;
    const { avatarUrl } = request.body;
    // TODO for Gosia -> is this really needed here?
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return response.code(400).send({ error: "Invalid or missing id" });
    }
    const sanitiziedName = name ? sanitizeInput.sanitizeUsername(name) : null;
    const sanitiziedEmail = email ? sanitizeInput.sanitizeEmail(email) : null;

    const responseult = db
      .prepare(
        "UPDATE users SET name = COALESCE(?, name), avatarUrl = COALESCE(?, avatarUrl) WHERE id = ?"
      )
      .run(sanitiziedName, avatarUrl, id);
    if (responseult.changes === 0) {
      response.code(404).send({ error: "Item not found" });
    } else {
      response.send({
        id,
        name: sanitiziedName,
        email: sanitiziedEmail,
        password,
        avatarUrl: avatarUrl,
      });
    }
  } catch (error) {
		request.log.error("update error: ", error);
		return response.code(400).send({ 
			error: error.message || "Invalid input data" });
	}
}

////////////////////////////// DELETE //////////////////////////////

export function deleteItem(request, response) {
	try {
		const { id } = request.params;
		// TODO for Gosia -> is this really needed here?
		if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
			return response.code(400).send({ error: "Invalid or missing id" });
		}
	
		const responseult = db.prepare("DELETE FROM users WHERE id = ?").run(parseInt(id));
		if (responseult.changes === 0) {
		response.code(404).send({ error: "Item not found" });
		} else {
		response.code(204).send({ message: `Item has been removed` });
		}
	} catch (error) {
		request.log.error("deleteItem error: ", error);
		return response.code(500).send({ error: "Internal server error" });
	}
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




////////////////////////////// NEW VALIDATION //////////////////////////////


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
//    |-- POST /validate-name ------->|
//    |   { "name": "Norika" }        |
//    |                               |
//    |                         Validates name
//    |                         Storesponse in DB
//    |                               |
//    |<- responseponse 200 ---------------|
//    |   { "message": "success" }    |

////////////////////////////// NEW VALIDATION //////////////////////////////


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

export const validatePasswordbyName = async (request, response) => {
	try {
		const { name, password } = request.body;

		const sanitiziedName = sanitizeInput.sanitizeUsername(name);
		const user = db.prepare("SELECT * FROM users WHERE name = ?").get(sanitiziedName); // use 'name'
		if (!user) return response.code(401).send({ message: "User not found" });

		//TODO for Gosia - should I also validate here password? in case of frontend bypass
		const isPasswordValid = await comparePassword(password, user.password);

		if (isPasswordValid) return response.code(200).send();
		else return response.code(401).send({ message: "Invalid password" });
	} catch (error) {
		return response.code(500).send();
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
    const uuid = uuidv4(); // Generate a unique UUID

    const result = db
      .prepare(
        "INSERT INTO users (uuid, name, email, password, avatarUrl) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        uuid,
        sanitizedName,
        sanitizedEmail,
        hashedPassword,
        randomAvatarUrl
      );
    response.code(201).send({
      id: result.lastInsertRowid,
      name: sanitizedName,
      email: sanitizedEmail,
      avatarUrl: randomAvatarUrl,
      created_at: new Date().toISOString(),
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
			.prepare("SELECT name, avatarUrl FROM users WHERE email = ?")
			.get(sanitiziedEmail);
		if (user) {
			return reply.code(200).send({
			name: sanitizeInput.sanitizeUsername(user.name),
			avatar: user.avatarUrl,
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

export const getAllUsers = async (request, response) => {
	try {
		const users = db
			.prepare("SELECT id, name, avatarUrl FROM users ORDER BY name")
			.all();
		return response.code(200).send(users);
	} catch (error) {
		request.log.error("Failed to get all users:", error);
		return response.code(500).send({
			message: "Internal server error",
		});
	}
};

export const getAllUsersExceptCurrent = async (request, response) => {
	try {
		const { email } = request.params;
		const sanitizedEmail = sanitizeInput.sanitizeEmail(email);
		const users = db
			.prepare(
			"SELECT id, name, avatarUrl FROM users WHERE email != ? ORDER BY name"
			)
			.all(sanitizedEmail);
			const sanitiziedUsers = users.map(user => ({
				id: user.id,
				name: sanitizeInput.sanitizeUsername(user.name),
				avatarUrl: user.avatarUrl
			}))
		return response.code(200).send(sanitiziedUsers);
	} catch (error) {
		request.log.error("Failed to get all users:", error);
		return response.code(500).send({
			message: "Internal server error",
		});
	}
};

////////////////////////////// CONTROLLER //////////////////////////////

const itemController = {
  getItems,
  getItem,
  addItem,
  deleteItem,
  updateItem,
//   validateAndAddItem,
  validateName,
  validateEmail,
  validatePasswordbyEmail,
  validatePasswordbyName,
  addNewUser,
  getUserByEmail,
  getAllUsers,
  getUserInfoByEmail,
  getAllUsersExceptCurrent,
};

export default itemController;
