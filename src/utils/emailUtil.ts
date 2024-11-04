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
    const confirmationLink = `http://localhost:${process.env.PORT}/api/users/verify-email?token=${confirmationToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: "Email Confirmation",
      html: `
        <h2>Email Confirmation</h2>
        <p>Please confirm your email by clicking the link below:</p>
        <a href="${confirmationLink}">Confirm Email</a>
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
    const recoveryToken = TokenUtil.generateToken({ id: userId }, '5m');  // Генеруємо токен на 5 хвилин
    const recoveryLink = `http://localhost:${process.env.PORT}/reset-password?token=${recoveryToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: userEmail,
      subject: "Password Recovery",
      html: `
        <h2>Password Recovery</h2>
        <p>Click the link below to reset your password:</p>
        <a href="${recoveryLink}">Reset Password</a>
      `,
    };

    await transporter.sendMail(mailOptions);
  }
}
