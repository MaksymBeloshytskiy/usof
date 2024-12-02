import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsUUID } from "class-validator";
import { PostStatus } from "../enums/PostStatus";

/**
 * Validator for creating a new post.
 * 
 * @class CreatePostValidator
 * 
 * @property {string} title - The title of the post. Must be a non-empty string.
 * @property {string} content - The content of the post. Must be a non-empty string.
 * @property {string} authorId - The UUID of the author. Must be a valid UUID.
 * @property {string[]} categoryIds - An array of category UUIDs. Must be a non-empty array of valid UUIDs.
 */
export class CreatePostValidator {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsUUID()
  authorId!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  categoryIds!: string[];
}

/**
 * Validator class for updating a post.
 * 
 * @class UpdatePostValidator
 * 
 * @property {string} [title] - The title of the post.
 * @property {string} [content] - The content of the post.
 * @property {PostStatus} [status] - The status of the post.
 * @property {string[]} [categoryIds] - An array of category IDs associated with the post.
 * @property {Date} updatedAt - The date when the post was last updated.
 */
export class UpdatePostValidator {
  @IsString()
  title?: string;

  @IsString()
  content?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID("4", { each: true })
  categoryIds?: string[];
}