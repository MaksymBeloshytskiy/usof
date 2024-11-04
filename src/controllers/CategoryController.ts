import { Request, Response } from "express";
import { CategoryAdapter } from "../adapters/CategoryAdapter";
import { validationResult } from "express-validator";
import { ErrorUtil } from "../utils/errorUtil";

export class CategoryController {
    private static categoryAdapter: CategoryAdapter = new CategoryAdapter();

    // Створення категорії
    static async createCategory(req: Request, res: Response): Promise<void> {
        // Перевірка валідації
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return ErrorUtil.handleValidationError(res, errors.array().map(err => err.msg).join(", "));
        }

        try {
            const categoryData = req.body;
            const newCategory = await CategoryController.categoryAdapter.createCategory(categoryData);
            res.status(201).json(newCategory);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримання категорії за ID
    static async getCategoryById(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId } = req.params;
            const category = await CategoryController.categoryAdapter.findCategoryById(categoryId);
            if (!category) {
                return ErrorUtil.handleNotFoundError(res, "Category");
            }
            res.status(200).json(category);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримання категорії за назвою
    static async getCategoryByTitle(req: Request, res: Response): Promise<void> {
        try {
            const { title } = req.params;
            const category = await CategoryController.categoryAdapter.findCategoryByTitle(title);
            if (!category) {
                return ErrorUtil.handleNotFoundError(res, "Category");
            }
            res.status(200).json(category);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    } 

    // Отримання всіх категорій
    static async getAllCategories(req: Request, res: Response): Promise<void> {
        try {
            const categories = await CategoryController.categoryAdapter.findAllCategories();
            res.status(200).json(categories);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Оновлення категорії
    static async updateCategory(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId } = req.params;
            const categoryData = req.body;
            const updatedCategory = await CategoryController.categoryAdapter.updateCategory(categoryId, categoryData);
            res.status(200).json(updatedCategory);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Видалення категорії
    static async deleteCategory(req: Request, res: Response): Promise<void> {
        try {
            const { categoryId } = req.params;
            await CategoryController.categoryAdapter.deleteCategory(categoryId);
            res.status(204).end();
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }
}
