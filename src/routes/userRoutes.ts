import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserRoles } from "../enums/UserRoles";
import { registerValidation, loginValidation } from "../validators/UserValidator";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const userRouter = Router();

// Використання статичних методів контролера

// Реєстрація користувача
userRouter.post("/register", registerValidation, UserController.register);

// Аутентифікація користувача
userRouter.post("/login", loginValidation, UserController.login);

// Вихід користувача
userRouter.post("/logout", AuthMiddleware.isAuthenticated, UserController.logout);

// Підтвердження електронної пошти
userRouter.get("/verify-email", UserController.verifyEmail);

// Запит на скидання пароля
userRouter.post("/password-reset-request", UserController.requestPasswordReset);

// Скидання пароля
userRouter.post("/password-reset", UserController.resetPassword);

// Отримання користувача за email
userRouter.get("/find-user-by-email", AuthMiddleware.isAuthenticated, UserController.getUserByEmail);

// Отримання користувача за ID
userRouter.get("/find-user-by-id", AuthMiddleware.isAuthenticated, UserController.getUserById);

// Отримання користувача за ім'ям користувача
userRouter.get("/find-user-by-username", AuthMiddleware.isAuthenticated, UserController.getUserByUsername);

// Отримання всіх користувачів
userRouter.get("/", AuthMiddleware.isAuthenticated, AuthMiddleware.isAuthorized(UserRoles.ADMIN), UserController.getAllUsers);

// Оновлення користувача
userRouter.put("/:userId", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, UserController.updateUser);

// Оновлення картинки профілю
// userRouter.patch("/update-profile-picture", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, UserController.updateUserProfilePicture);

// Видалення користувача
userRouter.delete("/:userId", AuthMiddleware.isAuthenticated, AuthMiddleware.isUserOrAdmin, UserController.deleteUser);

export default userRouter;
