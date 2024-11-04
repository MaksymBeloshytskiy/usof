// CommentAdapter.ts
import { CommentAdapterInterface } from "../interfaces/CommentAdapterInterface";
import { CreateCommentDTO, UpdateCommentDTO, ResponseCommentDTO } from "../dtos/CommentDTO";
import { CommentCore } from "../core/CommentCore";

export class CommentAdapter implements CommentAdapterInterface {
  private commentCore: CommentCore;

  constructor() {
    this.commentCore = new CommentCore();
  }

  /**
   * Creates a new comment using the provided data.
   *
   * @param {CreateCommentDTO} data - The data required to create a new comment.
   * @returns {Promise<ResponseCommentDTO>} A promise that resolves to the created comment.
   */
  async createComment(data: CreateCommentDTO): Promise<ResponseCommentDTO> {
    return await this.commentCore.create(data);
  }

  /**
   * Retrieves a comment by its unique identifier.
   *
   * @param id - The unique identifier of the comment.
   * @returns A promise that resolves to a ResponseCommentDTO object if the comment is found, or null if not.
   */
  async getCommentById(id: string): Promise<ResponseCommentDTO | null> {
    return await this.commentCore.findOneBy("id", id);
  }

  /**
   * Retrieves all comments.
   *
   * @returns {Promise<ResponseCommentDTO[]>} A promise that resolves to an array of ResponseCommentDTO objects.
   */
  async getAllComments(): Promise<ResponseCommentDTO[]> {
    return await this.commentCore.findAllBy();
  }

  /**
   * Retrieves all top-level comments for a given post ID.
   *
   * @param postId - The ID of the post for which to retrieve comments.
   * @returns A promise that resolves to an array of ResponseCommentDTO objects representing the top-level comments.
   */
  async getCommentsByPostId(postId: string): Promise<ResponseCommentDTO[]> {
    // Отримуємо всі коментарі з заданим postId
    const comments = await this.commentCore.findAllBy("postId", postId);

    // Фільтруємо коментарі верхнього рівня (parentCommentId === null)
    const topLevelComments = comments.filter(comment => comment.parentCommentId === null);

    return topLevelComments;
  }

  /**
   * Updates a comment with the given ID using the provided data.
   *
   * @param {string} id - The ID of the comment to update.
   * @param {UpdateCommentDTO} data - The data to update the comment with.
   * @returns {Promise<ResponseCommentDTO>} A promise that resolves to the updated comment.
   */
  async updateComment(id: string, data: UpdateCommentDTO): Promise<ResponseCommentDTO> {
    return await this.commentCore.update("id", id, data);
  }

  /**
   * Deletes a comment by its ID.
   *
   * @param id - The unique identifier of the comment to be deleted.
   * @returns A promise that resolves when the comment has been successfully deleted.
   */
  async deleteComment(id: string): Promise<void> {
    await this.commentCore.delete("id", id);
  }

  /**
   * Retrieves all replies associated with a specific comment ID.
   *
   * @param commentId - The ID of the comment for which to retrieve replies.
   * @returns A promise that resolves to an array of ResponseCommentDTO objects representing the replies.
   */
  async getRepliesByCommentId(commentId: string): Promise<ResponseCommentDTO[]> {
    return await this.commentCore.findAllBy("parentCommentId", commentId);
  }
}
