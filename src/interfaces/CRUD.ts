/**
 * Interface representing a generic CRUD repository.
 * 
 * @template CreateDTO - The type of the data transfer object used for creating a new entity.
 * @template UpdateDTO - The type of the data transfer object used for updating an existing entity.
 * @template ResponseDTO - The type of the data transfer object used for returning the entity.
 */
export interface CRUDRepository<CreateDTO, UpdateDTO, ResponseDTO> {
  /**
   * Creates a new entity.
   * 
   * @param data - The data transfer object containing the information to create the entity.
   * @returns A promise that resolves to the created entity.
   */
  create(data: CreateDTO): Promise<ResponseDTO>;

  /**
   * Finds a single entity by a specific key and value.
   * 
   * @param key - The key to search by.
   * @param value - The value of the key to search for.
   * @returns A promise that resolves to the found entity or null if no entity is found.
   */
  findOneBy<K extends keyof ResponseDTO>(key: K, value: ResponseDTO[K]): Promise<ResponseDTO | null>;

  /**
   * Finds all entities that match a specific key and value.
   * 
   * @param key - The key to search by (optional).
   * @param value - The value of the key to search for (optional).
   * @returns A promise that resolves to an array of found entities.
   */
  findAllBy<K extends keyof ResponseDTO>(key?: K, value?: ResponseDTO[K]): Promise<ResponseDTO[]>;

  /**
   * Updates an existing entity identified by a specific key and value.
   * 
   * @param key - The key to identify the entity.
   * @param value - The value of the key to identify the entity.
   * @param data - The data transfer object containing the updated information.
   * @returns A promise that resolves to the updated entity.
   */
  update<K extends keyof ResponseDTO>(key: K, value: ResponseDTO[K], data: UpdateDTO): Promise<ResponseDTO>;

  /**
   * Deletes an entity identified by a specific key and value.
   * 
   * @param key - The key to identify the entity.
   * @param value - The value of the key to identify the entity.
   * @returns A promise that resolves when the entity is deleted.
   */
  delete<K extends keyof ResponseDTO>(key: K, value: ResponseDTO[K]): Promise<void>;
}
