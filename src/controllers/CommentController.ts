// CommentController.ts
import { Request, Response } from "express";
import { CommentAdapter } from "../adapters/CommentAdapter";
import { CustomRequest } from "../interfaces/CustomRequest";
import { ErrorUtil } from "../utils/errorUtil";

export class CommentController {
  private static commentAdapter = new CommentAdapter();

  static async createComment(req: CustomRequest, res: Response): Promise<void> {
    const { content, postId, parentCommentId } = req.body;
    const authorId = req.currentUser!.id;

    try {
      const newComment = await CommentController.commentAdapter.createComment({
        content,
        authorId,
        postId,
        parentCommentId,
      });
      res.status(201).json(newComment);
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }

  static async getCommentById(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;

    try {
      const comment = await CommentController.commentAdapter.getCommentById(commentId);
      if (comment) {
        res.status(200).json(comment);
      } else {
        res.status(404).json({ message: "Comment not found" });
      }
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }

    static async getAllComments(req: Request, res: Response): Promise<void> {
        try {
        const comments = await CommentController.commentAdapter.getAllComments();
        res.status(200).json(comments);
        } catch (error) {
        ErrorUtil.handleError(res, error);
        }
    }

  static async getCommentsByPostId(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;

    try {
      const comments = await CommentController.commentAdapter.getCommentsByPostId(postId);
      res.status(200).json(comments);
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }

  static async updateComment(req: CustomRequest, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { content } = req.body;

    try {
      const existingComment = await CommentController.commentAdapter.getCommentById(commentId);
      if (!existingComment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      const updatedComment = await CommentController.commentAdapter.updateComment(commentId, { content });
      res.status(200).json(updatedComment);
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }

  static async deleteComment(req: CustomRequest, res: Response): Promise<void> {
    const { commentId } = req.params;

    try {
      const existingComment = await CommentController.commentAdapter.getCommentById(commentId);
      if (!existingComment) {
        res.status(404).json({ message: "Comment not found" });
        return;
      }

      await CommentController.commentAdapter.deleteComment(commentId);
      res.status(204).end();
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }

  static async getRepliesByCommentId(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;

    try {
      const replies = await CommentController.commentAdapter.getRepliesByCommentId(commentId);
      res.status(200).json(replies);
    } catch (error) {
      ErrorUtil.handleError(res, error);
    }
  }
}
