import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { TokenUtil } from "./tokenUtil";  // Централізований сервіс для роботи з токенами
dotenv.config();

dotenv.config();  // Load .env variables

// Create a Nodemailer transporter using your SMTP settings
/**
 * Creates a Nodemailer transporter object using SMTP configuration from environment variables.
 * 
 * The transporter is configured with the following properties:
 * - `host`: The SMTP server host, specified by the `SMTP_HOST` environment variable.
 * - `port`: The SMTP server port, specified by the `SMTP_PORT` environment variable.
 * - `auth`: An object containing the authentication credentials:
 *   - `user`: The username for authentication, specified by the `SMTP_USER` environment variable.
 *   - `pass`: The password for authentication, specified by the `SMTP_PASS` environment variable.
 * 
 * @constant {Object} transporter - The Nodemailer transporter object.
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export class EmailUtil {
  // Відправка email для підтвердження електронної пошти
  /**
   * Sends an email confirmation to the specified user.
   *
   * @param userEmail - The email address of the user to send the confirmation to.
   * @param userId - The ID of the user to generate the confirmation token for.
   * @returns A promise that resolves when the email has been sent.
   *
   * This function generates a confirmation token that is valid for 10 minutes,
   * creates a confirmation link containing the token, and sends an email to the
   * specified user with the confirmation link.
   */
  static async sendEmailConfirmation(userEmail: string, userId: string): Promise<void> {
    const confirmationToken = TokenUtil.generateToken({ id: userId }, '10m');  // Генеруємо токен на 10 хвилин
    const confirmationLink = `http://localhost:5173/verify-email?token=${confirmationToken}`;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: "Email Confirmation",
        html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
          <h2 style="color: #4CAF50;">Email Confirmation</h2>
          <p style="margin-bottom: 20px;">Thank you for registering. Please confirm your email by clicking the button below:</p>
          <a href="${confirmationLink}" 
             style="
                display: inline-block;
                padding: 10px 20px;
                font-size: 16px;
                color: #fff;
                background-color: #4CAF50;
                text-decoration: none;
                border-radius: 5px;
                text-align: center;
              ">
            Confirm Email
          </a>
          <p style="margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}


  // Відправка email для відновлення пароля
  /**
   * Sends a password recovery email to the specified user.
   *
   * This function generates a recovery token valid for 5 minutes and constructs
   * a recovery link containing the token. It then sends an email to the user
   * with the recovery link.
   *
   * @param userEmail - The email address of the user who requested password recovery.
   * @param userId - The unique identifier of the user who requested password recovery.
   * @returns A promise that resolves when the email has been sent.
   */
  static async sendPasswordRecovery(userEmail: string, userId: string): Promise<void> {
    const recoveryToken = TokenUtil.generateToken({ id: userId }, '5m'); // Генеруємо токен на 5 хвилин
    const recoveryLink = `http://localhost:5173/reset-password?token=${recoveryToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: "Password Recovery",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">Password Recovery</h2>
          <p style="color: #555; font-size: 16px;">
            Click the button below to reset your password:
          </p>
          <a href="${recoveryLink}" style="text-decoration: none; display: inline-block; padding: 12px 24px; color: white; background-color: #007BFF; border-radius: 5px; font-size: 16px; font-weight: bold; margin-top: 20px;">
            Reset Password
          </a>
          <p style="color: #888; font-size: 14px; margin-top: 20px;">
            If you didn’t request this email, you can safely ignore it.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  }

}
