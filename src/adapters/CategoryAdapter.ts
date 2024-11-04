import { CategoryCore } from "../core/CategoryCore";
import { CreateCategoryDTO, UpdateCategoryDTO, ResponseCategoryDTO } from "../dtos/CategoryDTO";

export class CategoryAdapter {
  private categoryCore = new CategoryCore();

  /**
   * Creates a new category using the provided data.
   *
   * @param data - The data transfer object containing the information needed to create a category.
   * @returns A promise that resolves to a response data transfer object containing the created category details.
   */
  async createCategory(data: CreateCategoryDTO): Promise<ResponseCategoryDTO> {
    return this.categoryCore.create(data);
  }

  /**
   * Finds a category by its ID.
   *
   * @param categoryId - The unique identifier of the category to find.
   * @returns A promise that resolves to a `ResponseCategoryDTO` if the category is found, or `null` if not.
   */
  async findCategoryById(categoryId: string): Promise<ResponseCategoryDTO | null> {
    return this.categoryCore.findOneBy("id", categoryId);
  }

  /**
   * Finds a category by its title.
   *
   * @param title - The title of the category to find.
   * @returns A promise that resolves to a `ResponseCategoryDTO` object if a category with the given title is found, or `null` if no such category exists.
   */
  async findCategoryByTitle(title: string): Promise<ResponseCategoryDTO | null> {
    return this.categoryCore.findOneBy("title", title);
  }

  /**
   * Retrieves all categories.
   *
   * @returns {Promise<ResponseCategoryDTO[]>} A promise that resolves to an array of ResponseCategoryDTO objects.
   */
  async findAllCategories(): Promise<ResponseCategoryDTO[]> {
    return this.categoryCore.findAllBy();
  }

  /**
   * Updates a category with the given data.
   *
   * @param categoryId - The ID of the category to update.
   * @param data - The data to update the category with.
   * @returns A promise that resolves to the updated category data.
   */
  async updateCategory(categoryId: string, data: UpdateCategoryDTO): Promise<ResponseCategoryDTO> {
    return this.categoryCore.update("id", categoryId, data);
  }

  /**
   * Deletes a category by its ID.
   *
   * @param categoryId - The ID of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   */
  async deleteCategory(categoryId: string): Promise<void> {
    return this.categoryCore.delete("id", categoryId);
  }
}