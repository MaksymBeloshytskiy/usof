// CommentCore.ts
import { CRUDRepository } from "../interfaces/CRUD";
import { CreateCommentDTO, UpdateCommentDTO, ResponseCommentDTO } from "../dtos/CommentDTO";
import { AppDataSource } from "../config/data-source";
import { Comment } from "../models/Comment";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Like } from "../models/Like";
import { Repository } from "typeorm";
import { LikeType } from "../enums/LikeTypes";

/**
 * The `CommentCore` class implements the `CRUDRepository` interface for managing comments.
 * It provides methods to create, read, update, and delete comments, as well as additional
 * functionalities such as retrieving reply counts and like/dislike counts.
 *
 * @implements {CRUDRepository<CreateCommentDTO, UpdateCommentDTO, ResponseCommentDTO>}
 */
export class CommentCore implements CRUDRepository<CreateCommentDTO, UpdateCommentDTO, ResponseCommentDTO> {
  private commentRepository: Repository<Comment> = AppDataSource.getRepository(Comment);
  private userRepository: Repository<User> = AppDataSource.getRepository(User);
  private postRepository: Repository<Post> = AppDataSource.getRepository(Post);
  private likeRepository: Repository<Like> = AppDataSource.getRepository(Like);

  private MAX_REPLY_DEPTH = 3;

  /**
   * Creates a new comment.
   *
   * @param {CreateCommentDTO} data - The data required to create a comment.
   * @returns {Promise<ResponseCommentDTO>} - The created comment as a response DTO.
   * @throws {Error} - Throws an error if the author, post, or parent comment is not found, or if the maximum reply depth is exceeded.
   *
   * @remarks
   * This method performs the following steps:
   * 1. Checks if the author exists.
   * 2. Checks if the post exists.
   * 3. If a parent comment ID is provided, checks if the parent comment exists and verifies the reply depth.
   * 4. Creates a new comment and saves it to the database.
   * 5. Reloads the saved comment with necessary fields.
   * 6. Returns the comment as a response DTO with the author's full name included.
   */
  async create(data: CreateCommentDTO): Promise<ResponseCommentDTO> {
    // Перевірка існування автора
    const author = await this.userRepository.findOne({ where: { id: data.authorId } });
    if (!author) throw new Error("Author not found");

    // Перевірка існування поста
    const post = await this.postRepository.findOne({ where: { id: data.postId } });
    if (!post) throw new Error("Post not found");

    let parentComment: Comment | undefined = undefined;
    if (data.parentCommentId) {
      // Знаходимо батьківський коментар
      const foundParentComment = await this.commentRepository.findOne({
        where: { id: data.parentCommentId },
      });
      parentComment = foundParentComment ?? undefined;
      if (!parentComment) throw new Error("Parent comment not found");

      // Перевіряємо глибину вкладеності
      const depth = await this.getReplyDepth(data.parentCommentId);
      if (depth >= this.MAX_REPLY_DEPTH) {
        throw new Error("Maximum reply depth exceeded");
      }
    }

    // Створюємо новий коментар
    const comment = this.commentRepository.create({
      content: data.content,
      author,
      post,
      parentComment,
    });

    // Зберігаємо коментар в базі даних
    await this.commentRepository.save(comment);

    // Повторно завантажуємо коментар з необхідними полями
    const savedComment = await this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoin('comment.replies', 'replies')
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.updatedAt',
        'comment.parentCommentId',
        'comment.postId',
        'comment.authorId',
        'author.id',        // Додано
        'author.fullName',  // Додано
        'replies.id',
      ])
      .where('comment.id = :id', { id: comment.id })
      .getOne();

    if (!savedComment) throw new Error('Failed to retrieve saved comment');

    // Повертаємо DTO коментаря з authorId
    return await this.toResponseCommentDTO(savedComment, { includeAuthorFullName: true });
  }

  /**
   * Finds a single comment by a specified key and value.
   *
   * @template K - The key of the ResponseCommentDTO to search by.
   * @param {K} key - The key to search for.
   * @param {ResponseCommentDTO[K]} value - The value of the key to search for.
   * @returns {Promise<ResponseCommentDTO | null>} - A promise that resolves to the found comment or null if no comment is found.
   */
  async findOneBy<K extends keyof ResponseCommentDTO>(
    key: K,
    value: ResponseCommentDTO[K]
  ): Promise<ResponseCommentDTO | null> {
    const commentAlias = 'comment';

    const queryBuilder = this.commentRepository.createQueryBuilder(commentAlias)
      .leftJoinAndSelect(`${commentAlias}.author`, 'author')
      .leftJoin(`${commentAlias}.replies`, 'replies')
      .select([
        `${commentAlias}.id`,
        `${commentAlias}.content`,
        `${commentAlias}.createdAt`,
        `${commentAlias}.updatedAt`,
        `${commentAlias}.parentCommentId`,
        `${commentAlias}.postId`,
        `${commentAlias}.authorId`,
        `author.id`,        // Додано
        `author.fullName`,  // Додано
        `replies.id`,
      ])
      .where(`${commentAlias}.${key} = :value`, { value });

    const comment = await queryBuilder.getOne();

    return comment
      ? await this.toResponseCommentDTO(comment, { includeAuthorId: true })
      : null;
  }

  /**
   * Finds all comments by a specified key and value.
   * 
   * @template K - The key of the ResponseCommentDTO to filter by.
   * @param {K} [key] - The key to filter the comments by.
   * @param {ResponseCommentDTO[K]} [value] - The value of the key to filter the comments by.
   * @returns {Promise<ResponseCommentDTO[]>} A promise that resolves to an array of ResponseCommentDTO objects.
   */
  async findAllBy<K extends keyof ResponseCommentDTO>(
    key?: K,
    value?: ResponseCommentDTO[K]
  ): Promise<ResponseCommentDTO[]> {
    const commentAlias = 'comment';

    const queryBuilder = this.commentRepository.createQueryBuilder(commentAlias)
      .leftJoinAndSelect(`${commentAlias}.author`, 'author')
      .leftJoin(`${commentAlias}.replies`, 'replies')
      .select([
        `${commentAlias}.id`,
        `${commentAlias}.content`,
        `${commentAlias}.createdAt`,
        `${commentAlias}.updatedAt`,
        `${commentAlias}.parentCommentId`,
        `${commentAlias}.postId`,
        `${commentAlias}.authorId`,
        `author.id`,        // Додано
        `author.fullName`,  // Додано
        `replies.id`,
      ]);

    if (key && value) {
      queryBuilder.where(`${commentAlias}.${key} = :value`, { value });
    }

    const comments = await queryBuilder.getMany();

    return await Promise.all(
      comments.map((comment) =>
        this.toResponseCommentDTO(comment, { includeAuthorFullName: true })
      )
    );
  }

  /**
   * Updates a comment based on the specified key and value, and returns the updated comment.
   *
   * @template K - The key of the comment to update.
   * @param {K} key - The key to identify the comment.
   * @param {ResponseCommentDTO[K]} value - The value of the key to identify the comment.
   * @param {UpdateCommentDTO} data - The data to update the comment with.
   * @returns {Promise<ResponseCommentDTO>} - The updated comment.
   * @throws {Error} - Throws an error if the comment is not found or if the updated comment cannot be retrieved.
   */
  async update<K extends keyof ResponseCommentDTO>(
    key: K,
    value: ResponseCommentDTO[K],
    data: UpdateCommentDTO
  ): Promise<ResponseCommentDTO> {
    const comment = await this.commentRepository.findOne({
      where: { [key]: value } as any,
    });
    if (!comment) throw new Error("Comment not found");

    if (data.content !== undefined) {
      comment.content = data.content;
    }

    // Зберігаємо оновлений коментар
    await this.commentRepository.save(comment);

    // Повторно завантажуємо оновлений коментар
    const updatedComment = await this.commentRepository.createQueryBuilder('comment')
      .leftJoinAndSelect('comment.author', 'author')
      .leftJoin('comment.replies', 'replies')
      .select([
        'comment.id',
        'comment.content',
        'comment.createdAt',
        'comment.updatedAt',
        'comment.parentCommentId',
        'comment.postId',
        'comment.authorId',
        'author.id',        // Додано
        'author.fullName',  // Додано
        'replies.id',
      ])
      .where('comment.id = :id', { id: comment.id })
      .getOne();

    if (!updatedComment) throw new Error('Failed to retrieve updated comment');

    // Повертаємо DTO коментаря з authorId
    return await this.toResponseCommentDTO(updatedComment, { includeAuthorId: true });
  }

  /**
   * Deletes a comment based on a specified key and value.
   *
   * @template K - The key of the comment property to search by.
   * @param {K} key - The key of the comment property to search by.
   * @param {ResponseCommentDTO[K]} value - The value of the comment property to search by.
   * @returns {Promise<void>} - A promise that resolves when the comment is deleted.
   * @throws {Error} - Throws an error if the comment is not found.
   */
  async delete<K extends keyof ResponseCommentDTO>(key: K, value: ResponseCommentDTO[K]): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { [key]: value } as any });
    if (!comment) throw new Error("Comment not found");

    await this.commentRepository.remove(comment);
  }

  /**
   * Finds the IDs of replies to a given comment.
   *
   * @param commentId - The ID of the comment for which to find replies.
   * @returns A promise that resolves to an array of reply IDs.
   */
  async findReplyIdsByComment(commentId: string): Promise<string[]> {
    const replies = await this.commentRepository.createQueryBuilder('comment')
      .select(['comment.id'])
      .where('comment.parentCommentId = :commentId', { commentId })
      .getMany();

    return replies.map(reply => reply.id);
  }

  /**
   * Retrieves the count of replies for a given comment.
   *
   * @param commentId - The ID of the comment for which to count replies.
   * @returns A promise that resolves to the number of replies for the specified comment.
   */
  async getReplyCountByComment(commentId: string): Promise<number> {
    return await this.commentRepository.count({
      where: { parentCommentId: commentId },
    });
  }

  /**
   * Recursively calculates the depth of a reply in a comment thread.
   *
   * @param commentId - The ID of the comment for which to calculate the reply depth.
   * @param depth - The current depth of the reply. Defaults to 0.
   * @returns A promise that resolves to the depth of the reply.
   */
  private async getReplyDepth(commentId: string, depth: number = 0): Promise<number> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      select: ['parentCommentId'],
    });

    if (!comment || !comment.parentCommentId) {
      return depth;
    }

    return this.getReplyDepth(comment.parentCommentId, depth + 1);
  }

  /**
   * Retrieves the like and dislike counts for a given comment.
   *
   * @param commentId - The ID of the comment to retrieve counts for.
   * @returns A promise that resolves to a tuple containing the like count and dislike count.
   *
   * @remarks
   * This method queries the `likeRepository` to count the number of likes and dislikes
   * associated with the specified comment. If no counts are found, it returns `[0, 0]`.
   *
   * @example
   * ```typescript
   * const [likeCount, dislikeCount] = await getLikeDislikeCounts('comment123');
   * console.log(`Likes: ${likeCount}, Dislikes: ${dislikeCount}`);
   * ```
   */
  private async getLikeDislikeCounts(commentId: string): Promise<[number, number]> {
    const counts = await this.likeRepository.createQueryBuilder('like')
      .select([
        'SUM(CASE WHEN like.type = :likeType THEN 1 ELSE 0 END) AS likeCount',
        'SUM(CASE WHEN like.type = :dislikeType THEN 1 ELSE 0 END) AS dislikeCount',
      ])
      .where('like.commentId = :commentId', { commentId })
      .setParameters({ likeType: LikeType.LIKE, dislikeType: LikeType.DISLIKE })
      .getRawOne();

    // Додано перевірку на наявність counts
    if (!counts) {
      return [0, 0];
    }

    return [
      parseInt(counts.likeCount, 10) || 0,
      parseInt(counts.dislikeCount, 10) || 0,
    ];
  }

  /**
   * Converts a Comment entity to a ResponseCommentDTO.
   *
   * @param comment - The comment entity to convert.
   * @param options - Optional settings for including additional author information.
   * @param options.includeAuthorId - If true, includes the author's ID in the response.
   * @param options.includeAuthorFullName - If true, includes the author's full name in the response.
   * @returns A Promise that resolves to a ResponseCommentDTO object.
   */
  private async toResponseCommentDTO(
    comment: Comment,
    options?: { includeAuthorId?: boolean; includeAuthorFullName?: boolean }
  ): Promise<ResponseCommentDTO> {
    // Обчислення кількості лайків та дизлайків
    const [likeCount, dislikeCount] = await this.getLikeDislikeCounts(comment.id);

    // Обчислення кількості відповідей
    const replyCount = await this.getReplyCountByComment(comment.id);

    // Формуємо об'єкт відповіді
    const response: ResponseCommentDTO = {
      id: comment.id,
      content: comment.content,
      author: '', // Буде встановлено нижче
      postId: comment.post?.id,  // Змінено
      parentCommentId: comment.parentCommentId ?? null,
      replyIds: comment.replies?.map((reply) => reply.id) ?? [] ?? null,
      likeCount,
      dislikeCount,
      replyCount,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    if (options?.includeAuthorId) {
      response.author = comment.author?.id ?? '';  // Додано перевірку
    } else if (options?.includeAuthorFullName) {
      response.author = comment.author?.fullName ?? '';  // Додано перевірку
    }

    return response;
  }
}
