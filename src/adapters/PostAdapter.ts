// adapters/PostAdapter.ts

import { PostAdapterInterface } from "../interfaces/PostAdapterInterface";
import { PostCore } from "../core/PostCore";
import { CreatePostDTO as CreatePostDTOInterface, UpdatePostDTO as UpdatePostDTOInterface, ResponsePostDTO } from "../dtos/PostDTO";
import { validateOrReject } from "class-validator";
import { plainToClass } from "class-transformer";
import { CreatePostValidator, UpdatePostValidator } from "../validators/PostValidator";
import { ValidationError, NotFoundError, InternalServerError } from "../errors/CustomErrors";

export class PostAdapter implements PostAdapterInterface {
  private postCore: PostCore;

  constructor() {
    this.postCore = new PostCore();
  }

  /**
   * Creates a new post using the provided data.
   *
   * @param data - The data required to create a new post, adhering to the CreatePostDTOInterface.
   * @returns A promise that resolves to a ResponsePostDTO containing the created post details.
   * @throws ValidationError - If the provided data fails validation.
   * @throws InternalServerError - If an error occurs during the creation of the post.
   */
  async createPost(data: CreatePostDTOInterface): Promise<ResponsePostDTO> {
    const createPostDTO = plainToClass(CreatePostValidator, data);

    try {
      await validateOrReject(createPostDTO, { whitelist: true });
    } catch (errors) {
      throw new ValidationError("Validation failed", this.formatValidationErrors(errors));
    }

    try {
      return await this.postCore.create(createPostDTO);
    } catch (error: any) {
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Retrieves a post by its ID.
   *
   * @param {string} id - The ID of the post to retrieve.
   * @returns {Promise<ResponsePostDTO | null>} A promise that resolves to the post data if found, or null if not found.
   * @throws {NotFoundError} If the post is not found.
   * @throws {InternalServerError} If an internal server error occurs.
   */
  async getPostById(id: string): Promise<ResponsePostDTO | null> {
    try {
      const post = await this.postCore.findOneBy("id", id);
      if (!post) {
        throw new NotFoundError("Post not found");
      }
      return post;
    } catch (error: any) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Retrieves all posts made by a specific user.
   *
   * @param userId - The unique identifier of the user whose posts are to be retrieved.
   * @returns A promise that resolves to an array of ResponsePostDTO objects representing the user's posts.
   * @throws InternalServerError if there is an issue retrieving the posts.
   */
  async getAllUserPosts(userId: string): Promise<ResponsePostDTO[]> {
    try {
      return await this.postCore.getAllPostsByUser(userId);
    } catch (error: any) {
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Retrieves all posts.
   *
   * @returns {Promise<ResponsePostDTO[]>} A promise that resolves to an array of ResponsePostDTO objects.
   * @throws {InternalServerError} If an error occurs while retrieving the posts.
   */
  async getAllPosts(): Promise<ResponsePostDTO[]> {
    try {
      return await this.postCore.findAllBy();
    } catch (error: any) {
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Updates a post with the given ID using the provided data.
   *
   * @param id - The ID of the post to update.
   * @param data - The data to update the post with.
   * @returns A promise that resolves to the updated post data.
   * @throws {ValidationError} If the provided data fails validation.
   * @throws {NotFoundError} If the post with the given ID is not found.
   * @throws {InternalServerError} If an unexpected error occurs during the update.
   */
  async updatePost(id: string, data: UpdatePostDTOInterface): Promise<ResponsePostDTO> {
    const updatePostDTO = plainToClass(UpdatePostValidator, data);

    try {
      await validateOrReject(updatePostDTO, { whitelist: true });
    } catch (errors) {
      throw new ValidationError("Validation failed", this.formatValidationErrors(errors));
    }

    try {
      return await this.postCore.update("id", id, updatePostDTO);
    } catch (error: any) {
      if (error.message === "Post not found") {
        throw new NotFoundError("Post not found");
      }
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Deletes a post by its ID.
   *
   * @param {string} id - The ID of the post to delete.
   * @returns {Promise<void>} - A promise that resolves when the post is deleted.
   * @throws {NotFoundError} - If the post with the given ID is not found.
   * @throws {InternalServerError} - If an internal server error occurs.
   */
  async deletePost(id: string): Promise<void> {
    try {
      await this.postCore.delete("id", id);
    } catch (error: any) {
      if (error.message === "Post not found") {
        throw new NotFoundError("Post not found");
      }
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Retrieves a paginated list of posts.
   *
   * @param {number} page - The page number to retrieve.
   * @param {number} limit - The number of posts per page.
   * @returns {Promise<{ posts: ResponsePostDTO[]; total: number }>} A promise that resolves to an object containing the list of posts and the total number of posts.
   * @throws {InternalServerError} If an error occurs while retrieving the posts.
   */
  async getPaginatedPosts(
    page: number, 
    limit: number, 
    searchTerm?: string, 
    sortOption?: string, 
    sortOrder?: 'ASC' | 'DESC', 
    category?: string
  ): Promise<{ posts: ResponsePostDTO[]; total: number }> {
    try {
      return await this.postCore.getPaginatedPosts(page, limit, searchTerm, sortOption, sortOrder, category);
    } catch (error: any) {
      console
      throw new InternalServerError(error.message);
    }
  }

  /**
   * Formats validation errors into a more readable structure.
   *
   * @param errors - The array of validation errors to format.
   * @returns An array of formatted validation errors, each containing the property and constraints.
   */
  private formatValidationErrors(errors: any): any {
    return errors.map((err: any) => {
      return {
        property: err.property,
        constraints: err.constraints,
      };
    });
  }
}
