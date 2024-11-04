import { LikeType } from '../enums/LikeTypes';

/**
 * Data Transfer Object for creating a like.
 * 
 * @interface CreateLikeDTO
 * @property {string} authorId - The ID of the author who is creating the like.
 * @property {string} [postId] - The ID of the post being liked. Optional if liking a comment.
 * @property {string} [commentId] - The ID of the comment being liked. Optional if liking a post.
 * @property {LikeType} type - The type of like being created.
 */
export interface CreateLikeDTO {
  authorId: string;
  postId?: string;
  commentId?: string;
  type: LikeType;
}

/**
 * Data Transfer Object (DTO) for updating a like.
 * 
 * @typedef {Object} UpdateLikeDTO
 * @property {LikeType} [type] - The type of the like, which is optional.
 */
export interface UpdateLikeDTO {
  type?: LikeType;
}

/**
 * @typedef ResponseLikeDTO
 * @property {string} id - The unique identifier for the like.
 * @property {string} authorId - The unique identifier for the author of the like.
 * @property {string} [postId] - The unique identifier for the post that is liked (optional).
 * @property {string} [commentId] - The unique identifier for the comment that is liked (optional).
 * @property {LikeType} type - The type of the like.
 * @property {Date} createdAt - The date and time when the like was created.
 * @property {Date} updatedAt - The date and time when the like was last updated.
 */
export interface ResponseLikeDTO {
  id: string;
  authorId: string;
  postId?: string;
  commentId?: string;
  type: LikeType;
  createdAt: Date;
  updatedAt: Date;
}