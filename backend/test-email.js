import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import {dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendTestEmail = async () => {
	const msg = {
    to: "gosia.stencel@gmail.com",
    from: process.env.FROM_EMAIL,
    subject: "Test Email from Transcendence",
    html: createEmailContent("Gosia", "123456"),
  };

  try {
	console.log('attempting to send test email');
	console.log('from: ', process.env.FROM_EMAIL);
	console.log('to: ', msg.to);
	console.log('sendgrid api key configured: ', !!process.env.SENDGRID_API_KEY);

	await sgMail.send(msg);
	console.log("test email sent successfully");
  } catch (error) {
	console.error("Error sending test email:", error);
	if (error.response) {
		console.error('response headers: ', error.response.headers);
		console.error('response body: ', error.response.body);
	}
}
};

const createEmailContent = (userName, authCode) => {
	return `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8">
			<style>
				body {
					font-family: 'Arial', sans-serif;
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
					color: #7a63fe;
					margin-top: 0;
				}
				.code-box {
					background-color: #f0f0f0;
					border: 2px solid #7a63fe;
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
					color: #ec8fc7;
					font-size: 14px;
					margin-top: 10px;
				}
				.footer {
					margin-top: 30px;
					padding-top: 20px;
					border-top: 1px solid #e0e0e0;
					color: #ec8fc7;
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
};


sendTestEmail();