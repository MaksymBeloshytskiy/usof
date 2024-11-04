import { CreateCommentDTO, UpdateCommentDTO, ResponseCommentDTO } from "../dtos/CommentDTO";

/**
 * Interface representing the operations for managing comments.
 */
export interface CommentAdapterInterface {
    /**
     * Creates a new comment.
     * @param data - The data required to create a comment.
     * @returns A promise that resolves to the created comment.
     */
    createComment(data: CreateCommentDTO): Promise<ResponseCommentDTO>;

    /**
     * Retrieves a comment by its ID.
     * @param id - The ID of the comment to retrieve.
     * @returns A promise that resolves to the comment if found, or null if not found.
     */
    getCommentById(id: string): Promise<ResponseCommentDTO | null>;

    /**
     * Retrieves all comments associated with a specific post ID.
     * @param postId - The ID of the post to retrieve comments for.
     * @returns A promise that resolves to an array of comments.
     */
    getCommentsByPostId(postId: string): Promise<ResponseCommentDTO[]>;

    /**
     * Updates an existing comment.
     * @param id - The ID of the comment to update.
     * @param data - The data to update the comment with.
     * @returns A promise that resolves to the updated comment.
     */
    updateComment(id: string, data: UpdateCommentDTO): Promise<ResponseCommentDTO>;

    /**
     * Deletes a comment by its ID.
     * @param id - The ID of the comment to delete.
     * @returns A promise that resolves when the comment is deleted.
     */
    deleteComment(id: string): Promise<void>;

    /**
     * Retrieves all replies associated with a specific comment ID.
     * @param commentId - The ID of the comment to retrieve replies for.
     * @returns A promise that resolves to an array of replies.
     */
    getRepliesByCommentId(commentId: string): Promise<ResponseCommentDTO[]>;
}
