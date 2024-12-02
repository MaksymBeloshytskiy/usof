import { Request, Response } from "express";
import { LikeAdapter } from "../adapters/LikeAdapter";
import { ErrorUtil } from "../utils/errorUtil";
import { ConnectionPoolClosedEvent } from "typeorm";

export class LikeController {
    private static likeAdapter: LikeAdapter = new LikeAdapter();

    // Лайк або дизлайк для поста
    static async likeOrDislikePost(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const { type, authorId } = req.body; // type: 'like' або 'dislike'

        if (!type || (type !== "like" && type !== "dislike")) {
            res.status(400).json({ message: "Invalid type" });
            return;
        }

        if (!authorId || authorId == undefined || !postId) {
            res.status(400).json({ message: "Author id is required" });
            return;
        }

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
    static async likeOrDislikeComment(req: Request, res: Response): Promise<void> {
        const { commentId } = req.params;
        const { type } = req.body; // type: 'like' або 'dislike'
        const authorId = req.query.authorId as string;

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

    static async checkUserPostLike(req: Request, res: Response): Promise<void> {
        const { postId } = req.params;
        const authorId = req.query.authorId as string;
    
        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForPost(authorId, postId);
            const userReaction = existingLike ? existingLike.type : null;
    
            res.status(200).json({ userReaction });
    
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }
    

    static async checkUserCommentLike(req: Request, res: Response): Promise<void> {
        const { commentId } = req.params;
        const authorId = req.query.authorId as string;
        
        try {
            const existingLike = await LikeController.likeAdapter.findUserLikeForComment(authorId, commentId);
            const userReaction = existingLike ? existingLike.type : null;

            res.status(200).json({ userReaction }); 
        } catch (error) {
            ErrorUtil.handleError(res, error);
        }
    }
}
