import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET = "" } = process.env;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

/**
 * Represents the payload of a token.
 */
export class Payload {
  id!: string;
  role?: string;
};

export class TokenUtil {
  // Універсальна функція для генерації токенів (роль опціональна)
  /**
   * Generates a JSON Web Token (JWT) for the given payload.
   *
   * @param payload - The data to be encoded in the token.
   * @param expiresIn - The duration for which the token is valid (e.g., '1h', '2d').
   * @returns The generated JWT as a string.
   */
  static generateToken(payload: Payload, expiresIn: string): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  // Верифікація токена (роль опціональна)
  /**
   * Verifies the provided JWT token and returns the decoded payload.
   *
   * @param token - The JWT token to verify.
   * @returns The decoded payload if the token is valid.
   * @throws Will throw an error if the token is invalid or expired.
   */
  static verifyToken(token: string): Payload {
    try {
      return jwt.verify(token, JWT_SECRET) as Payload;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }
}
