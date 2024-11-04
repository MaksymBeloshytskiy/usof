import { UserCore } from "../core/UserCore";
import { CreateUserDTO, UpdateUserDTO, ResponseUserDTO } from "../dtos/UserDTO";

export class UserAdapter {
  private userCore = new UserCore();

  /**
   * Creates a new user with the provided data.
   *
   * @param {CreateUserDTO} data - The data required to create a new user.
   * @returns {Promise<ResponseUserDTO>} A promise that resolves to the created user's data.
   */
  async createUser(data: CreateUserDTO): Promise<ResponseUserDTO> {
    return this.userCore.create(data);
  }

  /**
   * Finds a user by their unique identifier.
   *
   * @param userId - The unique identifier of the user to find.
   * @returns A promise that resolves to a `ResponseUserDTO` object if the user is found, or `null` if the user is not found.
   */
  async findUserById(userId: string): Promise<ResponseUserDTO | null> {
    return this.userCore.findOneBy("id", userId);
  }

  /**
   * Finds a user by their email address.
   *
   * @param email - The email address of the user to find.
   * @returns A promise that resolves to a ResponseUserDTO object if a user with the given email is found, or null if no user is found.
   */
  async findUserByEmail(email: string): Promise<ResponseUserDTO | null> {
    return this.userCore.findOneBy("email", email);
  }

  /**
   * Finds a user by their full name.
   *
   * @param fullName - The full name of the user to find.
   * @returns A promise that resolves to a ResponseUserDTO object if a user is found, or null if no user is found.
   */
  async findUserByFullName(fullName: string): Promise<ResponseUserDTO | null> {
    return this.userCore.findOneBy("fullName", fullName);
  }

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user to find.
   * @returns A promise that resolves to a ResponseUserDTO object if the user is found, or null if the user is not found.
   */
  async findUserByUsername(username: string): Promise<ResponseUserDTO | null> {
    return this.userCore.findOneBy("username", username);
  }

  /**
   * Retrieves all users from the user core.
   *
   * @returns {Promise<ResponseUserDTO[]>} A promise that resolves to an array of ResponseUserDTO objects.
   */
  async findAllUsers(): Promise<ResponseUserDTO[]> {
    return this.userCore.findAllBy();
  }

  /**
   * Updates a user with the given data.
   *
   * @param userId - The unique identifier of the user to be updated.
   * @param data - The data to update the user with.
   * @returns A promise that resolves to the updated user data.
   */
  async updateUser(userId: string, data: UpdateUserDTO): Promise<ResponseUserDTO> {
    return this.userCore.update("id", userId, data);
  }

  /**
   * Deletes a user by their user ID.
   *
   * @param userId - The unique identifier of the user to be deleted.
   * @returns A promise that resolves when the user has been deleted.
   */
  async deleteUser(userId: string): Promise<void> {
    return this.userCore.delete("id", userId);
  }

  /**
   * Retrieves the IDs of posts created by a specific user.
   *
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an array of post IDs.
   */
  async getUserPostIds(userId: string): Promise<string[]> {
    return this.userCore.findPostIdsByUser(userId);
  }

  /**
   * Retrieves the IDs of comments made by a specific user.
   *
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an array of comment IDs.
   */
  async getUserCommentIds(userId: string): Promise<string[]> {
    return this.userCore.findCommentIdsByUser(userId);
  }

  /**
   * Retrieves the IDs of the likes associated with a specific user.
   *
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an array of like IDs.
   */
  async getUserLikeIds(userId: string): Promise<string[]> {
    return this.userCore.findLikeIdsByUser(userId);
  }

}