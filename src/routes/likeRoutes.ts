import { Router } from "express";
import { LikeController } from "../controllers/LikeController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const likeRouter = Router();

// Перевірка чи користувач поставив лайк раніше
likeRouter.get(
    "/post/:postId/check",
    AuthMiddleware.isAuthenticated,
    LikeController.checkUserPostLike
);

likeRouter.get(
    "/comment/:commentId/check",
    AuthMiddleware.isAuthenticated,
    LikeController.checkUserCommentLike
);

// Лайк або дизлайк для поста
likeRouter.post(
    "/post/:postId",
    AuthMiddleware.isAuthenticated,
    LikeController.likeOrDislikePost
);

// Лайк або дизлайк для коментаря
likeRouter.post(
    "/comment/:commentId",
    AuthMiddleware.isAuthenticated,
    LikeController.likeOrDislikeComment
);

// Отримати кількість лайків та дизлайків для поста
likeRouter.get(
    "/post/:postId/count",
    LikeController.getPostLikesDislikesCount
);

// Отримати кількість лайків та дизлайків для коментаря
likeRouter.get(
    "/comment/:commentId/count",
    LikeController.getCommentLikesDislikesCount
);

export default likeRouter;
