import { Request, Response } from "express";
import { LikeAdapter } from "../adapters/LikeAdapter";
import { ErrorUtil } from "../utils/errorUtil";
import { CustomRequest } from "../interfaces/CustomRequest";

export class LikeController {
    private static likeAdapter: LikeAdapter = new LikeAdapter();

    // Лайк або дизлайк для поста
    static async likeOrDislikePost(req: CustomRequest, res: Response): Promise<void> {
        const { postId } = req.params;
        const { type } = req.body; // type: 'like' або 'dislike'
        const authorId = req.currentUser!.id;

        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForPost(authorId, postId);

            if (!existingLike) {
                const newLike = await LikeController.likeAdapter.createLike({
                    authorId,
                    postId,
                    type,
                });
                res.status(201).json(newLike);
            } else {
                if (existingLike.type === type) {
                    await LikeController.likeAdapter.deleteLike(existingLike.id);
                    res.status(204).end();
                } else {
                    const updatedLike = await LikeController.likeAdapter.updateLikeType(existingLike.id, type);
                    res.status(200).json(updatedLike);
                }
            }
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Лайк або дизлайк для коментаря
    static async likeOrDislikeComment(req: CustomRequest, res: Response): Promise<void> {
        const { commentId } = req.params;
        const { type } = req.body; // type: 'like' або 'dislike'
        const authorId = req.currentUser!.id;

        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForComment(authorId, commentId);

            if (!existingLike) {
                const newLike = await LikeController.likeAdapter.createLike({
                    authorId,
                    commentId,
                    type,
                });
                res.status(201).json(newLike);
            } else {
                if (existingLike.type === type) {
                    await LikeController.likeAdapter.deleteLike(existingLike.id);
                    res.status(204).end();
                } else {
                    const updatedLike = await LikeController.likeAdapter.updateLikeType(existingLike.id, type);
                    res.status(200).json(updatedLike);
                }
            }
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    static async checkUserPostLike(req: CustomRequest, res: Response): Promise<void> {
        const { postId } = req.params;
        const authorId = req.currentUser!.id;

        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForPost(authorId, postId);
            res.status(200).json({ hasLiked: !!existingLike });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    static async checkUserCommentLike(req: CustomRequest, res: Response): Promise<void> {
        const { commentId } = req.params;
        const authorId = req.currentUser!.id;

        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForComment(authorId, commentId);
            res.status(200).json({ hasLiked: !!existingLike });
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримати кількість лайків та дизлайків для поста
    static async getPostLikesDislikesCount(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;

        try {
            const likesDislikes = await LikeController.likeAdapter.countLikesDislikesByTarget(postId);
            res.status(200).json(likesDislikes);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }

    // Отримати кількість лайків та дизлайків для коментаря
    static async getCommentLikesDislikesCount(req: Request, res: Response): Promise<void> {
        const { commentId } = req.params;

        try {
            const likesDislikes = await LikeController.likeAdapter.countLikesDislikesByTarget(commentId);
            res.status(200).json(likesDislikes);
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }
}
