import { UserRoles } from "../enums/UserRoles";

/**
 * Data Transfer Object for creating a new user.
 * 
 * @interface CreateUserDTO
 * @property {string} username - The username of the user.
 * @property {string} fullName - The full name of the user.
 * @property {string} passwordHash - The hashed password of the user.
 * @property {string} email - The email address of the user.
 */
export interface CreateUserDTO {
    username: string;
    fullName: string;
    passwordHash: string; 
    email: string;
}

/**
 * Data Transfer Object for updating a user.
 * 
 * @property {string} [username] - The username of the user.
 * @property {string} [fullName] - The full name of the user.
 * @property {string} [passwordHash] - The hashed password of the user.
 * @property {string} [email] - The email address of the user.
 * @property {UserRoles} [role] - The role of the user.
 * @property {string} [profilePicture] - The profile picture URL of the user.
 * @property {boolean} [isVerified] - Indicates if the user is verified.
 * @property {Date} updatedAt - This field should be automatically updated.
 */
export interface UpdateUserDTO {
    username?: string;
    fullName?: string;
    passwordHash?: string;
    email?: string;
    role?: UserRoles;
    profilePicture?: string;
    isVerified?: boolean;
    updatedAt: Date;  // Це поле повинне бути автоматично оновлене
}

/**
 * Interface representing the response data for a user.
 */
export interface ResponseUserDTO {
    /**
     * Unique identifier for the user.
     */
    id: string;

    /**
     * Username of the user.
     * @optional
     */
    username?: string;

    /**
     * Full name of the user.
     * @optional
     */
    fullName?: string;

    /**
     * Hashed password of the user.
     * @optional
     */
    passwordHash?: string;

    /**
     * Email address of the user.
     * @optional
     */
    email?: string;

    /**
     * Role of the user.
     * @optional
     */
    role?: string;

    /**
     * URL to the profile picture of the user.
     * @optional
     */
    profilePicture?: string;

    /**
     * Indicates whether the user is verified.
     * @optional
     */
    isVerified?: boolean;

    /**
     * Rating of the user.
     * @optional
     */
    rating?: number;

    /**
     * Date when the user was created.
     * @optional
     */
    createdAt?: Date;

    /**
     * Date when the user was last updated.
     * @optional
     */
    updatedAt?: Date;
}
