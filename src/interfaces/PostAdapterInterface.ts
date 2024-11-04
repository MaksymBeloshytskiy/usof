import { CreatePostDTO, UpdatePostDTO, ResponsePostDTO } from "../dtos/PostDTO";

/**
 * Interface representing the operations that can be performed on posts.
 */
export interface PostAdapterInterface {
  /**
   * Creates a new post.
   * @param data - The data required to create a new post.
   * @returns A promise that resolves to the created post.
   */
  createPost(data: CreatePostDTO): Promise<ResponsePostDTO>;

  /**
   * Retrieves a post by its ID.
   * @param id - The ID of the post to retrieve.
   * @returns A promise that resolves to the retrieved post, or null if not found.
   */
  getPostById(id: string): Promise<ResponsePostDTO | null>;

  /**
   * Retrieves all posts.
   * @returns A promise that resolves to an array of all posts.
   */
  getAllPosts(): Promise<ResponsePostDTO[]>;

  /**
   * Updates an existing post.
   * @param id - The ID of the post to update.
   * @param data - The data to update the post with.
   * @returns A promise that resolves to the updated post.
   */
  updatePost(id: string, data: UpdatePostDTO): Promise<ResponsePostDTO>;

  /**
   * Deletes a post by its ID.
   * @param id - The ID of the post to delete.
   * @returns A promise that resolves when the post is deleted.
   */
  deletePost(id: string): Promise<void>;

  /**
   * Retrieves a paginated list of posts.
   * @param page - The page number to retrieve.
   * @param limit - The number of posts per page.
   * @returns A promise that resolves to an object containing the posts and the total number of posts.
   */
  getPaginatedPosts(page: number, limit: number): Promise<{ posts: ResponsePostDTO[]; total: number }>;
}
