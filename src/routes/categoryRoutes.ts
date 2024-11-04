import { Router } from "express";
import { CategoryController } from "../controllers/CategoryController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const categoryRouter = Router();

// Створення категорії (тільки адміністратор)
categoryRouter.post(
    "/",
    AuthMiddleware.isAuthenticated,
    AuthMiddleware.isAuthorized("admin"),
    CategoryController.createCategory
);

// Отримання всіх категорій (доступно всім)
categoryRouter.get(
    "/",
    AuthMiddleware.isAuthenticated, // Перевірка автентифікації
    CategoryController.getAllCategories
);

// Отримання категорії за ID (доступно всім)
categoryRouter.get(
    "/:categoryId",
    AuthMiddleware.isAuthenticated, // Перевірка автентифікації
    CategoryController.getCategoryById
);

// Отримання категорії за назвою (доступно всім)
categoryRouter.get(
    "/:categoryTitle",
    AuthMiddleware.isAuthenticated, // Перевірка автентифікації
    CategoryController.getCategoryByTitle
);

// Оновлення категорії (тільки адміністратор)
categoryRouter.put(
    "/:categoryId",
    AuthMiddleware.isAuthenticated,
    AuthMiddleware.isAuthorized("admin"),
    CategoryController.updateCategory
);

// Видалення категорії (тільки адміністратор)
categoryRouter.delete(
    "/:categoryId",
    AuthMiddleware.isAuthenticated,
    AuthMiddleware.isAuthorized("admin"),
    CategoryController.deleteCategory
);

export default categoryRouter;
