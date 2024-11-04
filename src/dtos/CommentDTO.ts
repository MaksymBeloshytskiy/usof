/**
 * Data Transfer Object for creating a comment.
 */
export interface CreateCommentDTO {
  content: string;
  authorId: string;
  postId: string;
  parentCommentId?: string;
}

/**
 * Data Transfer Object for updating a comment.
 * 
 * @interface UpdateCommentDTO
 * @property {string} [content] - The new content of the comment. This field is optional.
 */
export interface UpdateCommentDTO {
  content?: string;
}

/**
 * Represents a response comment data transfer object.
 */
export interface ResponseCommentDTO {
  /**
   * The unique identifier of the comment.
   */
  id: string;

  /**
   * The content of the comment.
   */
  content: string;

  /**
   * The author of the comment.
   */
  author: string;

  /**
   * The unique identifier of the post to which the comment belongs.
   * Can be null if the comment is not associated with a post.
   */
  postId: string | null;

  /**
   * The unique identifier of the parent comment if this comment is a reply.
   * Can be null if the comment is not a reply.
   */
  parentCommentId?: string | null;

  /**
   * An array of unique identifiers of replies to this comment.
   */
  replyIds?: string[];

  /**
   * The number of likes the comment has received.
   */
  likeCount: number;

  /**
   * The number of dislikes the comment has received.
   */
  dislikeCount: number;

  /**
   * The number of replies to the comment.
   */
  replyCount: number;

  /**
   * The date and time when the comment was created.
   */
  createdAt: Date;

  /**
   * The date and time when the comment was last updated.
   */
  updatedAt: Date;
}
