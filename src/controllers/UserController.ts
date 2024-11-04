import { Request, Response } from "express";
import { CustomRequest } from "../interfaces/CustomRequest";
import { validationResult } from "express-validator";
import { UserAdapter } from "../adapters/UserAdapter";
import { HashUtil } from "../utils/hashUtil";
import { TokenUtil, Payload } from "../utils/tokenUtil";
import { EmailUtil } from "../utils/emailUtil";
import { ErrorUtil } from "../utils/errorUtil";
import redisClient from "../config/redis";

export class UserController {
    private static userAdapter: UserAdapter = new UserAdapter();

    // Спільна функція для перевірки валідації
    /**
     * Handles validation errors for the given request.
     * 
     * This method checks for validation errors in the request. If any errors are found,
     * it sends a response with the error messages and returns `true`. If no errors are found,
     * it returns `false`.
     * 
     * @param req - The request object to validate.
     * @param res - The response object to send error messages.
     * @returns `true` if validation errors are found and handled, otherwise `false`.
     */
    private static handleValidationErrors(req: Request, res: Response): boolean {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            ErrorUtil.handleValidationError(res, errors.array().map(err => err.msg).join(", "));
            return true;
        }
        return false;
    }

    // Реєстрація нового користувача
    /**
     * Registers a new user.
     * 
     * This method handles the registration process for a new user. It first validates the request,
     * then hashes the user's password, creates a new user record, and sends an email confirmation
     * if the email is provided.
     * 
     * @param req - The request object containing user registration details.
     * @param res - The response object used to send back the HTTP response.
     * 
     * @throws Will throw an error if the user's email is undefined or if any other error occurs during the process.
     */
    static async register(req: Request, res: Response) {
        if (UserController.handleValidationErrors(req, res)) return;

        try {
            const { username, password, fullName, email } = req.body;
            const hashedPassword = await HashUtil.hashPassword(password);
    
            const newUser = await UserController.userAdapter.createUser({
                username: username.toLowerCase(), // Переводимо ім'я користувача в нижній регістр
                passwordHash: hashedPassword, // Обов'язково передаємо хешований пароль
                fullName: fullName,
                email: email,
            });
    
            if (newUser.email) {
                await EmailUtil.sendEmailConfirmation(newUser.email, newUser.id);
            } else {
                throw new Error("User email is undefined");
            }
            res.status(201).json(newUser);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Логін користувача
    /**
     * Handles user login.
     * 
     * This method validates the request, checks the provided username and password,
     * and generates a token if the credentials are valid.
     * 
     * @param req - The request object containing the username and password in the body.
     * @param res - The response object used to send the response back to the client.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle and respond with appropriate errors if validation fails,
     *         user is not found, password is invalid, or any other error occurs.
     */
    static async login(req: Request, res: Response): Promise<void> {
        if (UserController.handleValidationErrors(req, res)) return;

        try {
            let { username, password } = req.body;

            // Приводимо username до нижнього регістру для консистентності
            username = username.toLowerCase();

            // Пошук користувача за username
            const user = await UserController.userAdapter.findUserByUsername(username);

            // Перевірка наявності користувача та пароля
            if (!user) {
                return ErrorUtil.handleUnauthorizedError(res, "User not found");
            }

            if (!user.passwordHash) {
                return ErrorUtil.handleUnauthorizedError(res, "Password not found for user");
            }

            // Перевірка пароля
            const isPasswordValid = await HashUtil.verifyPassword(user.passwordHash, password);
            if (!isPasswordValid) {
                return ErrorUtil.handleUnauthorizedError(res, "Invalid password");
            }

            // Генерація токену
            const payload: Payload = { id: user.id, role: user.role };
            const token = TokenUtil.generateToken(payload, "1d");

            res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Логаут користувача
    /**
     * Logs out the user by blacklisting the provided token.
     * 
     * @param req - The request object containing the authorization header with the token.
     * @param res - The response object used to send the status and message back to the client.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle any errors that occur during the process using the ErrorUtil.
     */
    static async logout(req: Request, res: Response): Promise<void> {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            if (!token) {
                res.status(400).json({ error: "No token provided" });
                return;
            }

            await redisClient.set(`blacklist:${token}`, "true");
            await redisClient.expire(`blacklist:${token}`, 3600);

            res.status(200).json({ message: "Logout successful" });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Верифікація email користувача
    /**
     * Verifies the user's email address using a token provided in the query parameters.
     * 
     * @param req - The request object containing the query parameters.
     * @param res - The response object used to send the response.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle and respond with appropriate error messages if:
     * - The verification token is missing.
     * - The token is invalid or expired.
     * - The user is not found.
     * 
     * If the user's email is already verified, it will respond with a message indicating so.
     * If the verification is successful, it will update the user's verification status and respond with a success message.
     */
    static async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            // Отримуємо токен з query параметрів
            const token = req.query.token as string;

            if (!token) {
                return ErrorUtil.handleValidationError(res, "Verification token is missing");
            }

            // Перевіряємо токен і отримуємо payload
            const payload = TokenUtil.verifyToken(token);
            if (!payload) {
                return ErrorUtil.handleUnauthorizedError(res, "Invalid or expired token");
            }

            // Знаходимо користувача за ID з payload
            const user = await UserController.userAdapter.findUserById(payload.id);
            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            if (user.isVerified) {
                res.status(200).json({ message: "Email is already verified" });
                return;
            }

            // Оновлюємо статус верифікації користувача
            const updatedUser = await UserController.userAdapter.updateUser(user.id, {
                isVerified: true,
                updatedAt: new Date()
            });

            res.status(200).json({ message: "Email successfully verified", user: updatedUser });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Запит на скидання пароля
    /**
     * Handles the request to reset a user's password.
     * 
     * This method validates the request, checks if the user exists by their email,
     * and sends a password recovery email if the user is found. If the user is not found,
     * it returns a not found error. Any other errors are handled and returned as well.
     * 
     * @param req - The request object containing the user's email in the body.
     * @param res - The response object used to send back the appropriate response.
     * @returns A promise that resolves to void.
     */
    static async requestPasswordReset(req: Request, res: Response): Promise<void> {
        if (UserController.handleValidationErrors(req, res)) return;

        try {
            const { email } = req.body;
            const user = await UserController.userAdapter.findUserByEmail(email);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            await EmailUtil.sendPasswordRecovery(email, user.id);
            res.status(200).json({ message: "Password reset email has been sent" });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Скидання пароля
    /**
     * Resets the user's password.
     * 
     * This method verifies the provided token, finds the user associated with the token,
     * hashes the new password, updates the user's password in the database, and returns
     * the updated user information.
     * 
     * @param req - The request object containing the token and new password in the body.
     * @param res - The response object used to send back the updated user information or an error.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle and respond with an error if the token is invalid, the user is not found,
     *         or if there is an issue with hashing the password or updating the user.
     */
    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token, password } = req.body;
            const payload = TokenUtil.verifyToken(token);

            const user = await UserController.userAdapter.findUserById(payload.id);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            const hashedPassword = await HashUtil.hashPassword(password);
            const updatedUser = await UserController.userAdapter.updateUser(user.id, {
                passwordHash: hashedPassword,
                updatedAt: new Date()
            });

            res.status(200).json(updatedUser);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримати користувача за ID
    /**
     * Retrieves a user by their ID.
     *
     * @param req - The request object containing the user ID in the parameters.
     * @param res - The response object used to send the user data or an error message.
     * @returns A promise that resolves to void.
     *
     * @throws Will handle any errors that occur during the process and send an appropriate response.
     */
    static async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const user = await UserController.userAdapter.findUserById(userId);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            res.status(200).json(user);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отриати користувача за username
    /**
     * Retrieves a user by their username.
     * 
     * @param req - The request object containing the username parameter.
     * @param res - The response object used to send the user data or an error message.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle any errors that occur during the process and send an appropriate response.
     */
    static async getUserByUsername(req: Request, res: Response): Promise<void> {
        try {
            const { username } = req.params;
            const user = await UserController.userAdapter.findUserByUsername(username);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            res.status(200).json(user);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    /**
     * Retrieves a user by their full name.
     * 
     * @param req - The request object containing the full name parameter.
     * @param res - The response object used to send the user data or an error message.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle any errors that occur during the process and send an appropriate response.
     */
    static async getUserByFullName(req: Request, res: Response): Promise<void> {
        try {
            const { fullName } = req.params;
            const user = await UserController.userAdapter.findUserByFullName(fullName);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            res.status(200).json(user);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримати користувача за email
    /**
     * Retrieves a user by their email address.
     * 
     * @param req - The request object containing the email parameter.
     * @param res - The response object used to send back the user data or an error message.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle and respond with an error if one occurs during the process.
     */
    static async getUserByEmail(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.params;
            const user = await UserController.userAdapter.findUserByEmail(email);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            res.status(200).json(user);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримати всіх користувачів
    /**
     * Retrieves all users from the database.
     *
     * @param {CustomRequest} req - The request object.
     * @param {Response} res - The response object.
     * @returns {Promise<void>} A promise that resolves when the users are retrieved and the response is sent.
     *
     * @throws Will call ErrorUtil.handleError if there is an error during the retrieval process.
     */
    static async getAllUsers(req: CustomRequest, res: Response): Promise<void> {
        try {
            const users = await UserController.userAdapter.findAllUsers();
            res.status(200).json(users);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Оновити користувача
    /**
     * Updates a user with the given userId using the data provided in the request body.
     * 
     * @param req - The request object containing the userId parameter and the data to update.
     * @param res - The response object used to send back the updated user or an error.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle any errors that occur during the update process using ErrorUtil.
     */
    static async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Перевірка наявності користувача
            const user = await UserController.userAdapter.findUserById(userId);
            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            const updatedUser = await UserController.userAdapter.updateUser(userId, req.body);
            res.status(200).json(updatedUser);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // static async updateUserProfilePicture(req: Request & { file?: Express.Multer.File }, res: Response): Promise<void> {
    //     try {
    //         const { userId } = req.body;
    //         const user = await UserController.userAdapter.findUserById(userId);

    //         if (!user) {
    //             return ErrorUtil.handleNotFoundError(res, "User");
    //         }

    //         if (req.file) {
    //             const profilePicture = req.file.filename;
    //             const updatedUser = await UserController.userAdapter.updateUser(userId, {
    //                 profilePicture,
    //                 updatedAt: new Date()
    //             });
    //             res.status(200).json(updatedUser);
    //         } else {
    //             return ErrorUtil.handleValidationError(res, "No file uploaded");
    //         }
    //     } catch (error) {
    //         ErrorUtil.handleError(res, error);
    //     }
    // }

    // Видалити користувача
    /**
     * Deletes a user by their userId.
     * 
     * @param req - The request object containing the userId parameter.
     * @param res - The response object used to send back the success message or an error.
     * @returns A promise that resolves to void.
     * 
     * @throws Will handle any errors that occur during the deletion process using ErrorUtil.
     */
    static async deleteUser(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const user = await UserController.userAdapter.findUserById(userId);

            if (!user) {
                return ErrorUtil.handleNotFoundError(res, "User");
            }

            await UserController.userAdapter.deleteUser(userId);
            res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }
}
