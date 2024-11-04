import { Router } from "express";
import userRouter from "./userRoutes";
import categoryRouter from "./categoryRoutes";
import postRouter from "./postRoutes";
import commentRouter from "./commentRoutes";
import likesRouter from "./likeRoutes";
import { AuthMiddleware } from "../middlewares/authMiddleware";
import { CustomRequest } from "../interfaces/CustomRequest";

// Створимо основний маршрутизатор
const router = Router();

// Перевірка токена
router.get("/verify-token", AuthMiddleware.isAuthenticated, (req: CustomRequest, res) => {
    if (req.currentUser) {
        res.status(200).json(req.currentUser);
    } else {
        res.status(401).json({ error: "Invalid token" });
    }
});

// Інтеграція маршрутів користувача
router.use("/users", userRouter);
router.use("/categories", categoryRouter);
router.use("/posts", postRouter);
router.use("/comments", commentRouter);
router.use("/likes", likesRouter);

export default router;
