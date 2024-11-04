import argon2 from "argon2";

export class HashUtil {
  // Хешування пароля
  /**
   * Hashes a password using the Argon2 algorithm.
   *
   * @param password - The plain text password to be hashed.
   * @returns A promise that resolves to the hashed password.
   */
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
  }

  // Перевірка пароля
  /**
   * Verifies a password against a given hash using the argon2 algorithm.
   *
   * @param hash - The hashed password to verify against.
   * @param password - The plain text password to verify.
   * @returns A promise that resolves to a boolean indicating whether the password matches the hash.
   */
  static async verifyPassword(hash: string, password: string): Promise<boolean> {
    return await argon2.verify(hash, password);
  }
}
