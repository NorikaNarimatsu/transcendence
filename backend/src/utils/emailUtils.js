import sgMail from '@sendgrid/mail';

class EmailUtils {
	constructor() {
		sgMail.setApiKey(process.env.SENDGRID_API_KEY);
		this.fromEmail = process.env.FROM_EMAIL;
	}

	generateAuthCode() {
		return Math.floor(100000 + Math.random() * 900000).toString();
	}

	async sendAuthCodeEmail(userEmail, userName, authCode) {
		const msg = {
				to: userEmail,
				from: this.fromEmail,
				subject: 'Transcendence - 2FA Code',
				html: this.createEmailContent(userName, authCode)
			};

		try {
			await sgMail.send(msg);
			// console.log('2FA code successfully sent to: ', userEmail);
			return true;
		} catch (error) {
			console.error('Error sending 2FA code:', error);
			return false;
		}
	}

	createEmailContent(userName, authCode) {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="utf-8">
				<style>
					body {
						font-family: Arial, sans-serif;
						background-color: #f5f5f5;
						margin: 0;
						padding: 20px;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						background-color: #ffffff;
						padding: 30px;
						border-radius: 10px;
						box-shadow: 0 2px 10 px rgba(0,0,0,0.1);
					}
					h2 {
						color: #7c3aed;
						margin-top: 0;
					}
					.code-box {
						background-color: #f0f0f0;
						border: 2px solid #7c3aed;
						border-radius: 8px;
						padding: 20px;
						text-align: center;
						margin: 20px 0;
					}
					.code {
						font-size: 36px;
						font-weight: bold;
						color: #1900a7;
						letter-spacing: 8px;
						margin: 0;
						font-family: 'Courier New', monospace;
					}
					.warning {
						color: #666;
						font-size: 14px;
						margin-top: 10px;
					}
					.footer {
						margin-top: 30px;
						padding-top: 20px;
						border-top: 1px solid #e0e0e0;
						color: #999;
						font-size: 12px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h2>Hello ${userName}!</h2>
					<p>Your verification code for SNEG Transcendence is:</p>

					<div class="code-box">
					<p class="code">${authCode}</p>
					</div>

					<p class="warning">This code is valid for the next 10 minutes only.</p>
					<p>If you did not request this code, please ignore this email.</p>

					<div class="footer">
					<p>Best regards,<br><strong>The SNEG Transcendence Team</stron></p>
					</div>
				</div>
			</body>
			</html>
					`;
				}
			}

export const emailUtils = new EmailUtils();