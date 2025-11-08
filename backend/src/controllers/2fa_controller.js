import { db} from '../server.js';
import { emailUtils } from '../utils/emailUtils.js';
import { comparePassword } from '../utils/passwordUtils.js';
import bcrypt from 'bcrypt';
import { checkPassword } from '../utils/passwordValidationUtils.js';
import { sanitizeInput } from '../utils/sanitizeInput.js';
import { verifyTokenOwner } from '../utils/verifyTokenOwner.js';
import { allowedAvatars } from '../utils/avatarsList.js';

const twoFactorController = {
  enable2FA: async (request, response) => {
    try {
      const { userID } = request.body;

      const sanitizedUserID = parseInt(userID);
	  if (isNaN(sanitizedUserID)) {
		return response.code(400).send({ message: "Invalid userID" });
	  }

	  const ownerError = verifyTokenOwner(request, sanitizedUserID);
	  if (ownerError) {
		return response.code(ownerError.code).send({ error: ownerError.error });
	  }

      const user = db
        .prepare(
          'SELECT userID, email, name, "2FA" FROM users WHERE userID = ?'
        )
        .get(sanitizedUserID);

      if (!user) {
        return response.code(404).send({ error: "User not found" });
      }

      if (user["2FA"]) {
        return response.code(400).send({ error: "2FA already enabled" });
      }

      db.prepare('UPDATE users SET "2FA" = 1 WHERE userID = ?').run(
        sanitizedUserID
      );

      return response.send({
        success: true,
        message: "2FA enabled successfully",
        user: {
          userID: user.userID,
          email: sanitizeInput.sanitizeEmail(user.email),
          name: sanitizeInput.sanitizeUsername(user.name),
          has2FA: true,
        },
      });
    } catch (error) {
      return response.code(500).send({ error: "Server error" });
    }
  },

  disable2FA: async (request, response) => {
    try {
      const { userID, password } = request.body;
      const sanitizedUserID = parseInt(userID);
	  if (isNaN(sanitizedUserID)) {
		return response.code(400).send({ message: "Invalid userID" });
	  }

	  const ownerError = verifyTokenOwner(request, sanitizedUserID);
	  if (ownerError) {
		return response.code(ownerError.code).send({ error: ownerError.error });
	  }

    const passwordCheck = checkPassword(password);
    if (!passwordCheck.valid) {
      return response.code(400).send({ error: passwordCheck.error });
    }

      const user = db
        .prepare(
          'SELECT userID, email, name, password, "2FA" FROM users WHERE userID = ?'
        )
        .get(sanitizedUserID);

      if (!user || !user["2FA"]) {
        return response.code(400).send({ error: "2FA not enabled" });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return response.code(400).send({ error: "Invalid password" });
      }

      db.prepare('UPDATE users SET "2FA" = 0 WHERE userID = ?').run(
        sanitizedUserID
      );
      db.prepare(
        "DELETE FROM two_factor_auth WHERE userID = ? AND used = 0"
      ).run(sanitizedUserID);

      return response.send({
        success: true,
        message: "2FA disabled successfully",
        user: {
          userID: user.userID,
          email: sanitizeInput.sanitizeEmail(user.email),
          name: sanitizeInput.sanitizeUsername(user.name),
          has2FA: false,
        },
      });
    } catch (error) {
      return response.code(500).send({ error: "Server error" });
    }
  },

  sendVerificationCode: async (request, response) => {
    try {
      const { userID } = request.body;
      const sanitizedUserID = parseInt(userID);
      if (isNaN(sanitizedUserID) || sanitizedUserID <= 0) {
        return response.code(400).send({ error: "Invalid userID" });
      }
	  const ownerError = verifyTokenOwner(request, sanitizedUserID);
	  if (ownerError) {
		return response.code(ownerError.code).send({ error: ownerError.error });
	  }

      const user = db
        .prepare(
          'SELECT userID, email, name, "2FA" FROM users WHERE userID = ?'
        )
        .get(sanitizedUserID);

      if (!user || !user["2FA"]) {
        return response.code(400).send({ error: "2FA not enabled" });
      }

      const maxCodesInTenMin = 3;

      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const recentCodesCount = db
        .prepare(
          `
				SELECT COUNT(*) as count FROM two_factor_auth
				WHERE userID = ? AND createdAt >= ?
				`
        )
        .get(sanitizedUserID, tenMinAgo).count;

      if (recentCodesCount >= maxCodesInTenMin) {
        return response
          .header("Retry-After", String(10 * 60))
          .code(429)
          .send({
            error:
              "You have reached the limit of codes sent per 10 minutes. Please try again later.",
          });
      }

      db.prepare(
        "DELETE FROM two_factor_auth WHERE userID = ? AND used = 0"
      ).run(sanitizedUserID);

      const code = emailUtils.generateAuthCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

      const saltRounds = 12;
      const hashedCode = await bcrypt.hash(code, saltRounds);

      db.prepare(
        `
				INSERT INTO two_factor_auth (userID, code, expiresAt, attempts)
				VALUES (?, ?, ?, ?)
			`
      ).run(sanitizedUserID, hashedCode, expiresAt, 0);

      const emailSent = await emailUtils.sendAuthCodeEmail(
        user.email,
        user.name,
        code
      );

      if (!emailSent) {
        return response
          .code(500)
          .send({ error: "Failed to send verification email" });
      }

      return response.send({
        success: true,
        message: "Verification code sent with email",
      });
    } catch (error) {
      return response.code(500).send({ error: "Server error" });
    }
  },

  verifyCode: async (request, response) => {
    try {
      const { userID, code } = request.body;
      const sanitizedUserID = parseInt(userID);
      if (isNaN(sanitizedUserID) || sanitizedUserID <= 0) {
        return response.code(400).send({ error: "Invalid userID" });
      }

      const ownerError = verifyTokenOwner(request, sanitizedUserID);
	  if (ownerError) {
		return response.code(ownerError.code).send({ error: ownerError.error });
	  }

      if (!code || typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
        return response.code(400).send({ error: "Invalid code format" });
      }

      const codeRecord = db.prepare(`
		SELECT * FROM two_factor_auth
		WHERE userID = ? AND used = 0
		ORDER BY createdAt DESC LIMIT 1
	`).get(sanitizedUserID);

      if (!codeRecord) {
        return response.code(400).send({ error: "Invalid code" });
      }

      if (new Date() > new Date(codeRecord.expiresAt)) {
        return response.code(400).send({ error: "Code expired" });
      }

      const maxAttempts = 5;
      const currentAttempts = codeRecord.attempts ?? 0;
      if (currentAttempts >= maxAttempts) {
        return response
          .code(429)
          .send({
            error: "Code verification attempts exceeded",
            attemptsLeft: 0,
          });
      }

      const isCodeValid = await bcrypt.compare(code, codeRecord.code);
      if (!isCodeValid) {
        db.prepare(
          "UPDATE two_factor_auth SET attempts = attempts + 1 WHERE codeID = ?"
        ).run(codeRecord.codeID);
        const attemptsLeft = maxAttempts - (currentAttempts + 1);
        return response.code(400).send({ error: "Invalid code", attemptsLeft });
      }

      db.prepare("UPDATE two_factor_auth SET used = 1 WHERE codeID = ?").run(
        codeRecord.codeID
      );

      const user = db
        .prepare(
          "SELECT userID, email, name, avatarUrl FROM users WHERE userID = ?"
        )
        .get(sanitizedUserID);

      const fullToken = request.server.jwt.sign(
        {
          userID: user.userID,
          email: sanitizeInput.sanitizeEmail(user.email),
          name: sanitizeInput.sanitizeUsername(user.name),
          has2FA: true,
          verified2FA: true,
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hrs
          lastActivity: Math.floor(Date.now() / 1000),
        },
        { expiresIn: "3h" }
      );

      const userResponse = {};
      userResponse["userID"] = user.userID;
      userResponse["email"] = sanitizeInput.sanitizeEmail(user.email);
      userResponse["name"] = sanitizeInput.sanitizeUsername(user.name);
      userResponse["avatarUrl"] = sanitizeInput.avatarPathCheck(user.avatarUrl, allowedAvatars);
      userResponse["has2FA"] = true;
      userResponse["verified2FA"] = true;

      const responseData = {
        success: true,
        message: "Code verified successfully",
        token: fullToken,
        user: userResponse,
      };
      return response.send(responseData);
    } catch (error) {
      return response.code(500).send({ error: "Server error" });
    }
  },

  get2FAstatus: async (request, response) => {
    try {
      const userID = request.query.userID;
	  const sanitizedUserID = parseInt(userID);

	  if (isNaN(sanitizedUserID) || sanitizedUserID <= 0) {
		return response.code(400).send({ error: "Invalid userID" });
	  }

	  const ownerError = verifyTokenOwner(request, sanitizedUserID);
	  if (ownerError) {
		return response.code(ownerError.code).send({ error: ownerError.error });
	  }

      const user = db
        .prepare(
          'SELECT userID, email, name, "2FA" FROM users WHERE userID = ?'
        )
        .get(sanitizedUserID);

      if (!user) {
        return response.code(404).send({ error: "User not found" });
      }

      return response.send({
        userID: user.userID,
        email: sanitizeInput.sanitizeEmail(user.email),
        name: sanitizeInput.sanitizeUsername(user.name),
        has2FA: !!user["2FA"],
        code: user["2FA"] ? "enabled" : "disabled",
      });
    } catch (error) {
      return response.code(500).send({ error: "Server error" });
    }
  },
};

export default twoFactorController;