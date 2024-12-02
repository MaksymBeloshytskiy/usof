import { Router } from "express";
import { PostController } from "../controllers/PostController";
import { AuthMiddleware } from "../middlewares/authMiddleware";

const postRouter = Router();
const postController = new PostController(); // Створюємо екземпляр контролера

postRouter.get(
  "/paginated",
  postController.getPaginatedPosts.bind(postController)
);

// Створення поста (авторизовані користувачі)
postRouter.post(
  "/create",
  AuthMiddleware.isAuthenticated,
  postController.createPost.bind(postController)
);

postRouter.get(
  "/user-posts",
  postController.getUserPosts.bind(postController)
);

postRouter.delete(
  "/delete/:postId",
  AuthMiddleware.isAuthenticated,
  AuthMiddleware.isPostAuthorOrAdmin,
  postController.deletePost.bind(postController)
);

postRouter.put(
  "/update/:postId",
  AuthMiddleware.isAuthenticated,
  AuthMiddleware.isPostAuthorOrAdmin,
  postController.updatePost.bind(postController)
);

// Отримання поста за ID (доступно всім)
postRouter.get(
  "/:postId",
  postController.getPostById.bind(postController)
);

// Отримання всіх постів (доступно всім)
postRouter.get(
  "/",
  AuthMiddleware.isAuthenticated,
  postController.getAllPosts.bind(postController)
);

export default postRouter;
