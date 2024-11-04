// routes/commentRoutes.ts
import { Router } from "express";
import { CommentController } from "../controllers/CommentController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const commentRouter = Router();

// Отримання всіх коментарів (доступно всім)
commentRouter.get(
  "/",
  CommentController.getAllComments
);

// Отримання всіх коментарів для конкретного поста (доступно всім)
commentRouter.get(
  "/post/:postId",
  CommentController.getCommentsByPostId
);

// Отримання всіх відповідей на коментар (доступно всім)
commentRouter.get(
  "/:commentId/replies",
  CommentController.getRepliesByCommentId
);

// Отримання коментаря за ID (доступно всім)
commentRouter.get(
  "/:commentId",
  CommentController.getCommentById
);

// Створення коментаря (авторизовані користувачі)
commentRouter.post(
  "/",
  AuthMiddleware.isAuthenticated,
  CommentController.createComment
);

// Оновлення коментаря (лише автор коментаря може редагувати)
commentRouter.put(
  "/:commentId",
  AuthMiddleware.isAuthenticated,
  AuthMiddleware.isCommentAuthorOrAdmin,
  CommentController.updateComment
);

// Видалення коментаря (лише автор коментаря або адміністратор)
commentRouter.delete(
  "/:commentId",
  AuthMiddleware.isAuthenticated,
  AuthMiddleware.isCommentAuthorOrAdmin,
  CommentController.deleteComment
);

export default commentRouter;
