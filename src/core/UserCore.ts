import { CRUDRepository } from "../interfaces/CRUD";
import { CreateUserDTO, UpdateUserDTO, ResponseUserDTO } from "../dtos/UserDTO";
import { AppDataSource } from "../config/data-source";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { Like } from "../models/Like";

/**
 * Class representing the core functionalities for user management.
 * Implements CRUD operations and additional user-related queries.
 */
export class UserCore implements CRUDRepository<CreateUserDTO, UpdateUserDTO, ResponseUserDTO> {
  private userRepository = AppDataSource.getRepository(User);
  private postRepository = AppDataSource.getRepository(Post);
  private commentRepository = AppDataSource.getRepository(Comment);
  private likeRepository = AppDataSource.getRepository(Like);

  /**
   * Creates a new user with the provided data.
   *
   * @param data - The data to create a new user.
   * @returns A promise that resolves to the created user's response DTO.
   */
  async create(data: CreateUserDTO): Promise<ResponseUserDTO> {
    const user = this.userRepository.create(data);
    const savedUser = await this.userRepository.save(user);
    return this.toResponseUserDTO(savedUser);
  }

  /**
   * Finds a user by a specified key and value.
   *
   * @template K - The key of the user property to search by.
   * @param {K} key - The key of the user property to search by.
   * @param {ResponseUserDTO[K]} value - The value of the user property to search for.
   * @returns {Promise<ResponseUserDTO | null>} A promise that resolves to the user data transfer object if found, otherwise null.
   */
  async findOneBy<K extends keyof ResponseUserDTO>(key: K, value: ResponseUserDTO[K]): Promise<ResponseUserDTO | null> {
    const user = await this.userRepository.findOne({ where: { [key]: value } });
    return user ? this.toResponseUserDTO(user) : null;
  }

  /**
   * Finds all users by a specified key and value.
   * 
   * @template K - The key of the user property to filter by.
   * @param {K} [key] - The key of the user property to filter by.
   * @param {ResponseUserDTO[K]} [value] - The value of the user property to filter by.
   * @returns {Promise<ResponseUserDTO[]>} A promise that resolves to an array of ResponseUserDTO objects.
   */
  async findAllBy<K extends keyof ResponseUserDTO>(key?: K, value?: ResponseUserDTO[K]): Promise<ResponseUserDTO[]> {
    const users = key && value ? await this.userRepository.find({ where: { [key]: value } }) : await this.userRepository.find();
    return users.map(this.toResponseUserDTO);
  }

  /**
   * Updates a user entity based on a specified key and value, and applies the provided update data.
   *
   * @template K - The key of the user property to search by.
   * @param {K} key - The key of the user property to search by.
   * @param {ResponseUserDTO[K]} value - The value of the user property to search by.
   * @param {UpdateUserDTO} data - The data to update the user with.
   * @returns {Promise<ResponseUserDTO>} - A promise that resolves to the updated user data transfer object.
   * @throws {Error} - Throws an error if the user is not found.
   */
  async update<K extends keyof ResponseUserDTO>(key: K, value: ResponseUserDTO[K], data: UpdateUserDTO): Promise<ResponseUserDTO> {
    const user = await this.userRepository.findOne({ where: { [key]: value } });
    if (!user) throw new Error("User not found");
    Object.assign(user, data);
    const updatedUser = await this.userRepository.save(user);
    return this.toResponseUserDTO(updatedUser);
  }

  /**
   * Deletes a user from the repository based on a specified key and value.
   *
   * @template K - The key of the user property to search by.
   * @param {K} key - The key of the user property to search by.
   * @param {ResponseUserDTO[K]} value - The value of the user property to search by.
   * @returns {Promise<void>} A promise that resolves when the user is deleted.
   * @throws {Error} If the user is not found.
   */
  async delete<K extends keyof ResponseUserDTO>(key: K, value: ResponseUserDTO[K]): Promise<void> {
    const user = await this.userRepository.findOne({ where: { [key]: value } });
    if (!user) throw new Error("User not found");
    await this.userRepository.remove(user);
  }

  /**
   * Finds and returns an array of post IDs authored by a specific user.
   *
   * @param userId - The ID of the user whose posts are to be retrieved.
   * @returns A promise that resolves to an array of post IDs.
   */
  async findPostIdsByUser(userId: string): Promise<string[]> {
    const posts = await this.postRepository.find({ where: { author: { id: userId } }, select: ["id"] });
    return posts.map(post => post.id);
  }

  /**
   * Finds and returns the IDs of comments made by a specific user.
   *
   * @param userId - The ID of the user whose comment IDs are to be retrieved.
   * @returns A promise that resolves to an array of comment IDs.
   * @throws An error if the user is not found.
   */
  async findCommentIdsByUser(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    const comments = await this.commentRepository.find({ where: { author: user }, select: ["id"] });
    return comments.map(comment => comment.id);
  }

  /**
   * Finds and returns an array of like IDs associated with a given user.
   *
   * @param userId - The ID of the user whose like IDs are to be retrieved.
   * @returns A promise that resolves to an array of like IDs.
   * @throws An error if the user is not found.
   */
  async findLikeIdsByUser(userId: string): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error("User not found");
    const likes = await this.likeRepository.find({ where: { author: user }, select: ["id"] });
    return likes.map(like => like.id);
  }

  /**
   * Converts a User entity to a ResponseUserDTO.
   *
   * @param user - The User entity to be converted.
   * @returns The corresponding ResponseUserDTO object.
   */
  private toResponseUserDTO(user: User): ResponseUserDTO {
    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      passwordHash: user.passwordHash,
      email: user.email,
      profilePicture: user.profilePicture,
      role: user.role,
      isVerified: user.isVerified,
      rating: user.rating,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}