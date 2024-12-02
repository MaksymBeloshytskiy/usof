import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserRoles } from "../enums/UserRoles";
import { registerValidation, loginValidation } from "../validators/UserValidator";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { uploadAvatar } from "../middlewares/uploadsMiddleware";

const userRouter = Router();

userRouter.get("/:userId/avatar", UserController.getUserAvatar);

// Реєстрація користувача
userRouter.post("/register", registerValidation, UserController.register);

// Аутентифікація користувача
userRouter.post("/login", loginValidation, UserController.login);

userRouter.post("/email-verification", UserController.emailVerification);

// Вихід користувача
userRouter.post("/logout", AuthMiddleware.isAuthenticated, UserController.logout);

// Підтвердження електронної пошти
userRouter.get("/verify-email", UserController.verifyEmail);

// Запит на скидання пароля
userRouter.post("/password-reset-request", UserController.requestPasswordReset);

// Скидання пароля
userRouter.post("/password-reset", UserController.resetPassword);

// Оновлення пароля
userRouter.put("/:userId/change-password", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, UserController.changePassword);

// Отримання користувача за email
userRouter.get("/find-user-by-email", AuthMiddleware.isAuthenticated, UserController.getUserByEmail);

// Отримання користувача за ID
userRouter.get("/find-user-by-id", UserController.getUserById);

// Отримання користувача за ім'ям користувача
userRouter.get("/find-user-by-username", UserController.getUserByUsername);

// Отримання користувача за ім'ям
userRouter.get("/find-user-by-fullname", UserController.getUserByFullName);

// Отримання всіх користувачів
userRouter.get("/", AuthMiddleware.isAuthenticated, AuthMiddleware.isAuthorized(UserRoles.ADMIN), UserController.getAllUsers);

// Оновлення користувача
userRouter.put("/:userId", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, uploadAvatar, UserController.updateUserProfile);

// Видалення користувача
userRouter.delete("/:userId", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, UserController.deleteUser);

export default userRouter;
