/**
 * Data Transfer Object for creating a new category.
 */
export interface CreateCategoryDTO {
  title: string;
}

/**
 * Data Transfer Object for updating a category.
 * 
 * @interface UpdateCategoryDTO
 * 
 * @property {string} [title] - The new title of the category. This field is optional.
 * @property {Date} updatedAt - The date and time when the category was last updated.
 */
export interface UpdateCategoryDTO {
  title?: string;
  updatedAt: Date;
}

/**
 * Represents the data transfer object for a category response.
 */
export interface ResponseCategoryDTO {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}
  