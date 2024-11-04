import { PostStatus } from "../enums/PostStatus";

/**
 * Data Transfer Object for creating a new post.
 * 
 * @typedef {CreatePostDTO}
 * 
 * @property {string} title - The title of the post.
 * @property {string} content - The content of the post.
 * @property {string} authorId - The ID of the author creating the post.
 * @property {string[]} categoryIds - An array of category IDs to which the post belongs.
 */
export interface CreatePostDTO {
  title: string;
  content: string;
  authorId: string;
  categoryIds: string[];
}

/**
 * Data Transfer Object for updating a post.
 * 
 * @interface UpdatePostDTO
 * 
 * @property {string} [title] - The title of the post.
 * @property {string} [content] - The content of the post.
 * @property {PostStatus} [status] - The status of the post.
 * @property {string[]} [categoryIds] - The IDs of the categories the post belongs to.
 * @property {Date} updatedAt - The date when the post was last updated.
 */
export interface UpdatePostDTO {
  title?: string;
  content?: string;
  status?: PostStatus;
  categoryIds?: string[];
  updatedAt: Date;
}

/**
 * Represents the data transfer object for a response post.
 */
export interface ResponsePostDTO {
  /**
   * The unique identifier of the post.
   */
  id: string;

  /**
   * The title of the post.
   */
  title: string;

  /**
   * The content of the post.
   */
  content: string;

  /**
   * The status of the post.
   */
  status: PostStatus;

  /**
   * The author of the post.
   */
  author: string;

  /**
   * The titles of the categories the post belongs to.
   */
  categoryTitles: string[];

  /**
   * The number of likes the post has received.
   */
  likesCount: number;

  /**
   * The number of dislikes the post has received.
   */
  dislikesCount: number;

  /**
   * The number of comments on the post.
   */
  commentsCount: number;

  /**
   * The date and time when the post was created.
   */
  createdAt: Date;

  /**
   * The date and time when the post was last updated.
   */
  updatedAt: Date;
}