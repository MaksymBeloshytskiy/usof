import { CRUDRepository } from "../interfaces/CRUD";
import { CreateCategoryDTO, UpdateCategoryDTO, ResponseCategoryDTO } from "../dtos/CategoryDTO";
import { AppDataSource } from "../config/data-source";
import { Category } from "../models/Category";
import { Post } from "../models/Post";

/**
 * The CategoryCore class implements CRUD operations for categories.
 * It interacts with the category repository to perform create, read, update, and delete operations.
 * 
 * @implements {CRUDRepository<CreateCategoryDTO, UpdateCategoryDTO, ResponseCategoryDTO>}
 */
export class CategoryCore implements CRUDRepository<CreateCategoryDTO, UpdateCategoryDTO, ResponseCategoryDTO> {
  private categoryRepository = AppDataSource.getRepository(Category);
  private postRepository = AppDataSource.getRepository(Post);

  /**
   * Creates a new category using the provided data and saves it to the repository.
   *
   * @param {CreateCategoryDTO} data - The data to create a new category.
   * @returns {Promise<ResponseCategoryDTO>} A promise that resolves to the created category in the response format.
   */
  async create(data: CreateCategoryDTO): Promise<ResponseCategoryDTO> {
    const category = this.categoryRepository.create(data);
    const savedCategory = await this.categoryRepository.save(category);
    return this.toResponseCategoryDTO(savedCategory);
  }

  /**
   * Finds a single category by a specified key and value.
   *
   * @template K - The key of the category property to search by.
   * @param {K} key - The key of the category property to search by.
   * @param {ResponseCategoryDTO[K]} value - The value of the category property to match.
   * @returns {Promise<ResponseCategoryDTO | null>} A promise that resolves to the found category as a ResponseCategoryDTO, or null if no category is found.
   */
  async findOneBy<K extends keyof ResponseCategoryDTO>(key: K, value: ResponseCategoryDTO[K]): Promise<ResponseCategoryDTO | null> {
    const category = await this.categoryRepository.findOne({ where: { [key]: value } });
    return category ? this.toResponseCategoryDTO(category) : null;
  }

  /**
   * Finds all categories optionally filtered by a specific key-value pair.
   *
   * @template K - The key of the ResponseCategoryDTO to filter by.
   * @param {K} [key] - The key to filter categories by.
   * @param {ResponseCategoryDTO[K]} [value] - The value to filter categories by.
   * @returns {Promise<ResponseCategoryDTO[]>} A promise that resolves to an array of ResponseCategoryDTO objects.
   */
  async findAllBy<K extends keyof ResponseCategoryDTO>(key?: K, value?: ResponseCategoryDTO[K]): Promise<ResponseCategoryDTO[]> {
    const categories = key && value ? await this.categoryRepository.find({ where: { [key]: value } }) : await this.categoryRepository.find();
    return categories.map(this.toResponseCategoryDTO);
  }

  /**
   * Updates a category based on a specified key and value, applying the provided update data.
   *
   * @template K - The key of the category property to search by.
   * @param {K} key - The key of the category property to search by.
   * @param {ResponseCategoryDTO[K]} value - The value of the category property to search by.
   * @param {UpdateCategoryDTO} data - The data to update the category with.
   * @returns {Promise<ResponseCategoryDTO>} - A promise that resolves to the updated category data.
   * @throws {Error} - Throws an error if the category is not found.
   */
  async update<K extends keyof ResponseCategoryDTO>(key: K, value: ResponseCategoryDTO[K], data: UpdateCategoryDTO): Promise<ResponseCategoryDTO> {
    const category = await this.categoryRepository.findOne({ where: { [key]: value } });
    if (!category) throw new Error("Category not found");
    Object.assign(category, data);
    const updatedCategory = await this.categoryRepository.save(category);
    return this.toResponseCategoryDTO(updatedCategory);
  }

  /**
   * Deletes a category from the repository based on a specified key and value.
   *
   * @template K - The key of the category property to search by.
   * @param {K} key - The key of the category property to search by.
   * @param {ResponseCategoryDTO[K]} value - The value of the category property to search by.
   * @returns {Promise<void>} - A promise that resolves when the category is deleted.
   * @throws {Error} - Throws an error if the category is not found.
   */
  async delete<K extends keyof ResponseCategoryDTO>(key: K, value: ResponseCategoryDTO[K]): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { [key]: value } });
    if (!category) throw new Error("Category not found");
    await this.categoryRepository.remove(category);
  }

  /**
   * Converts a Category entity to a ResponseCategoryDTO.
   *
   * @param category - The Category entity to be converted.
   * @returns The converted ResponseCategoryDTO.
   */
  private toResponseCategoryDTO(category: Category): ResponseCategoryDTO {
    return {
      id: category.id,
      title: category.title,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}
