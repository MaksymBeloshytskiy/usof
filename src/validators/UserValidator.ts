import { body } from "express-validator";

/**
 * An array of validation rules for user registration.
 * 
 * The following fields are validated:
 * - `username`: Must be at least 5 characters long.
 * - `email`: Must be a valid email address.
 * - `password`: Must be at least 6 characters long.
 * - `fullName`: Must not be empty.
 * 
 * Each validation rule includes a custom error message that will be returned if the validation fails.
 */
export const registerValidation = [
    body("username").isLength({ min: 5 }).withMessage("Username must be at least 5 characters long"),
    body("email").isEmail().withMessage("Must be a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("fullName").notEmpty().withMessage("Full name is required"),
];

/**
 * An array of validation rules for user login.
 * 
 * This validation ensures that both the username and password fields are not empty.
 * 
 * - `username`: Must not be empty. If empty, an error message "Username is required" will be returned.
 * - `password`: Must not be empty. If empty, an error message "Password is required" will be returned.
 */
export const loginValidation = [
    body("username").notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
];
