import { PostStatus } from "../enums/PostStatus";
import { CRUDRepository } from "../interfaces/CRUD";
import { CreatePostDTO, UpdatePostDTO, ResponsePostDTO } from "../dtos/PostDTO";
import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { Category } from "../models/Category";
import { LikeType } from "../enums/LikeTypes";
import { Repository, In } from "typeorm";

/**
 * The `PostCore` class implements the `CRUDRepository` interface for managing posts.
 * It provides methods to create, read, update, and delete posts, as well as additional
 * methods for retrieving paginated posts, counting comments, and fetching posts by user.
 */
export class PostCore implements CRUDRepository<CreatePostDTO, UpdatePostDTO, ResponsePostDTO> {
    private postRepository: Repository<Post> = AppDataSource.getRepository(Post);
    private userRepository: Repository<User> = AppDataSource.getRepository(User);
    private categoryRepository: Repository<Category> = AppDataSource.getRepository(Category);

    /**
     * Creates a new post with the given data.
     *
     * @param {CreatePostDTO} data - The data to create the post with.
     * @returns {Promise<ResponsePostDTO>} A promise that resolves to the created post's response DTO.
     * @throws {Error} If the author is not found or some categories are not found.
     */
    async create(data: CreatePostDTO): Promise<ResponsePostDTO> {
        // Знаходимо автора за його ID
        const author = await this.userRepository.findOne({ where: { id: data.authorId } });
        if (!author) throw new Error("Author not found");

        // Знаходимо категорії за їхніми ID
        const categories = await this.categoryRepository.find({
            where: { id: In(data.categoryIds) },
        });
        if (categories.length !== data.categoryIds.length) {
            throw new Error("Some categories not found");
        }

        // Створюємо новий пост
        const post = this.postRepository.create({
            title: data.title,
            content: data.content,
            status: PostStatus.ACTIVE,
            author: author,
            categories: categories,
        });

        const savedPost = await this.postRepository.save(post);

        // Додаємо кількості зв'язків
        const likesCount = await this.postRepository.count({
            where: { id: savedPost.id, likes: { type: LikeType.LIKE } },
            relations: ["likes"],
        });

        const dislikesCount = await this.postRepository.count({
            where: { id: savedPost.id, likes: { type: LikeType.DISLIKE } },
            relations: ["likes"],
        });

        const commentsCount = await this.postRepository.count({
            where: { id: savedPost.id },
            relations: ["comments"],
        });

        return {
            ...this.toResponsePostDTO({
                ...savedPost,
                likesCount,
                dislikesCount,
                commentsCount,
            }),
        };
    }

    /**
     * Finds a single post by a specified key and value.
     *
     * This method constructs a query to find a post based on the provided key and value.
     * It joins related entities such as the author and categories, and also maps the counts
     * of likes, dislikes, and comments to the resulting post.
     *
     * @template K - The key of the ResponsePostDTO to search by.
     * @param {K} key - The key to search by (e.g., 'id', 'title').
     * @param {ResponsePostDTO[K]} value - The value of the key to search for.
     * @returns {Promise<ResponsePostDTO | null>} - A promise that resolves to the found post or null if no post is found.
     */
    async findOneBy<K extends keyof ResponsePostDTO>(
        key: K,
        value: ResponsePostDTO[K]
    ): Promise<ResponsePostDTO | null> {
        const queryBuilder = this.postRepository.createQueryBuilder("post");

        // Приєднуємо необхідні зв'язки та вибираємо потрібні поля
        queryBuilder
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.categories", "category")
            // Додаємо кількість лайків (LIKE)
            .loadRelationCountAndMap("post.likesCount", "post.likes", "likes", qb => qb.where("likes.type = :likeType", { likeType: LikeType.LIKE }))
            // Додаємо кількість дизлайків (DISLIKE)
            .loadRelationCountAndMap("post.dislikesCount", "post.likes", "dislikes", qb => qb.where("dislikes.type = :dislikeType", { dislikeType: LikeType.DISLIKE }))
            // Додаємо кількість коментарів
            .loadRelationCountAndMap("post.commentsCount", "post.comments")
            .select([
                "post.id",
                "post.title",
                "post.content",
                "post.status",
                "post.createdAt",
                "post.updatedAt",
                "author.fullName",
                "category.title",
            ])
            .where(`post.${key} = :value`, { value });

        const post = await queryBuilder.getOne();

        if (!post) return null;

        return this.toResponsePostDTO(post as Post & {
            likesCount: number;
            dislikesCount: number;
            commentsCount: number;
        });
    }

    /**
     * Finds all posts by a specified key and value.
     * 
     * This method constructs a query to fetch posts from the repository, including related entities such as author, categories,
     * and counts for likes, dislikes, and comments. If a key and value are provided, it filters the posts based on the specified key and value.
     * 
     * @template K - The key of the ResponsePostDTO to filter by.
     * @param {K} [key] - The key to filter posts by.
     * @param {ResponsePostDTO[K]} [value] - The value to filter posts by.
     * @returns {Promise<ResponsePostDTO[]>} - A promise that resolves to an array of ResponsePostDTO objects.
     */
    async findAllBy<K extends keyof ResponsePostDTO>(
        key?: K,
        value?: ResponsePostDTO[K]
    ): Promise<ResponsePostDTO[]> {
        const queryBuilder = this.postRepository.createQueryBuilder("post");

        // Приєднуємо необхідні зв'язки та вибираємо потрібні поля
        queryBuilder
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.categories", "category")
            // Додаємо кількість лайків (LIKE)
            .loadRelationCountAndMap("post.likesCount", "post.likes", "likes", qb => qb.where("likes.type = :likeType", { likeType: LikeType.LIKE }))
            // Додаємо кількість дизлайків (DISLIKE)
            .loadRelationCountAndMap("post.dislikesCount", "post.likes", "dislikes", qb => qb.where("dislikes.type = :dislikeType", { dislikeType: LikeType.DISLIKE }))
            // Додаємо кількість коментарів
            .loadRelationCountAndMap("post.commentsCount", "post.comments")
            .select([
                "post.id",
                "post.title",
                "post.content",
                "post.status",
                "post.createdAt",
                "post.updatedAt",
                "author.fullName",
                "category.title",
            ]);

        if (key && value) {
            queryBuilder.where(`post.${key} = :value`, { value });
        }

        const posts = await queryBuilder.getMany();

        return posts.map((post) => this.toResponsePostDTO(post as Post & {
            likesCount: number;
            dislikesCount: number;
            commentsCount: number;
        }));
    }

    /**
     * Updates a post based on the provided key and value, and updates the post with the given data.
     * 
     * @template K - The key of the ResponsePostDTO to search by.
     * @param {K} key - The key to search for the post.
     * @param {ResponsePostDTO[K]} value - The value of the key to search for the post.
     * @param {UpdatePostDTO} data - The data to update the post with.
     * @returns {Promise<ResponsePostDTO>} - The updated post data.
     * @throws {Error} - Throws an error if the post is not found or if some categories are not found.
     */
    async update<K extends keyof ResponsePostDTO>(
        key: K,
        value: ResponsePostDTO[K],
        data: UpdatePostDTO
    ): Promise<ResponsePostDTO> {
        const post = await this.postRepository.findOne({ where: { [key]: value } });
        if (!post) throw new Error("Post not found");

        if (data.title !== undefined) post.title = data.title;
        if (data.content !== undefined) post.content = data.content;
        if (data.status !== undefined) post.status = data.status;
        if (data.updatedAt !== undefined) post.updatedAt = data.updatedAt;

        if (data.categoryIds) {
            // Знаходимо категорії за їхніми ID
            const categories = await this.categoryRepository.find({
                where: { id: In(data.categoryIds) },
            });
            if (categories.length !== data.categoryIds.length) {
                throw new Error("Some categories not found");
            }
            post.categories = categories;
        }

        const updatedPost = await this.postRepository.save(post);

        const likesCount = await this.postRepository.count({
            where: { id: updatedPost.id, likes: { type: LikeType.LIKE } },
            relations: ["likes"],
        });

        const dislikesCount = await this.postRepository.count({
            where: { id: updatedPost.id, likes: { type: LikeType.DISLIKE } },
            relations: ["likes"],
        });

        const commentsCount = await this.postRepository.count({
            where: { id: updatedPost.id },
            relations: ["comments"],
        });

        return this.toResponsePostDTO({
            ...updatedPost,
            likesCount,
            dislikesCount,
            commentsCount,
        });
    }

    /**
     * Deletes a post from the repository based on a specified key and value.
     *
     * @template K - The key of the post property to search by.
     * @param {K} key - The key of the post property to search by.
     * @param {ResponsePostDTO[K]} value - The value of the post property to search by.
     * @returns {Promise<void>} - A promise that resolves when the post is deleted.
     * @throws {Error} - Throws an error if the post is not found.
     */
    async delete<K extends keyof ResponsePostDTO>(key: K, value: ResponsePostDTO[K]): Promise<void> {
        const post = await this.postRepository.findOne({ where: { [key]: value } });
        if (!post) throw new Error("Post not found");
        await this.postRepository.remove(post);
    }

    /**
     * Retrieves a paginated list of posts with their associated metadata.
     *
     * @param page - The page number to retrieve.
     * @param limit - The number of posts to retrieve per page.
     * @returns A promise that resolves to an object containing the paginated posts and the total number of posts.
     * 
     * The returned object has the following structure:
     * - posts: An array of ResponsePostDTO objects representing the posts.
     * - total: The total number of posts available.
     *
     * Each post in the `posts` array includes:
     * - id: The unique identifier of the post.
     * - title: The title of the post.
     * - content: The content of the post.
     * - status: The status of the post.
     * - createdAt: The creation date of the post.
     * - updatedAt: The last update date of the post.
     * - author: The full name of the author of the post.
     * - categories: The titles of the categories associated with the post.
     * - likesCount: The number of likes the post has received.
     * - dislikesCount: The number of dislikes the post has received.
     * - commentsCount: The number of comments on the post.
     */
    async getPaginatedPosts(page: number, limit: number): Promise<{ posts: ResponsePostDTO[]; total: number }> {
        const queryBuilder = this.postRepository.createQueryBuilder("post");

        queryBuilder
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.categories", "category")
            // Додаємо кількість лайків (LIKE)
            .loadRelationCountAndMap("post.likesCount", "post.likes", "likes", qb => qb.where("likes.type = :likeType", { likeType: LikeType.LIKE }))
            // Додаємо кількість дизлайків (DISLIKE)
            .loadRelationCountAndMap("post.dislikesCount", "post.likes", "dislikes", qb => qb.where("dislikes.type = :dislikeType", { dislikeType: LikeType.DISLIKE }))
            // Додаємо кількість коментарів
            .loadRelationCountAndMap("post.commentsCount", "post.comments")
            .select([
                "post.id",
                "post.title",
                "post.content",
                "post.status",
                "post.createdAt",
                "post.updatedAt",
                "author.fullName",
                "category.title",
            ])
            .where("post.status = :activeStatus", { activeStatus: PostStatus.ACTIVE })
            .orderBy("post.createdAt", "DESC")
            .skip((page - 1) * limit)
            .take(limit);

        const [posts, total] = await queryBuilder.getManyAndCount();

        return {
            posts: posts.map((post) => this.toResponsePostDTO(post as Post & {
                likesCount: number;
                dislikesCount: number;
                commentsCount: number;
            })),
            total,
        };
    }

    /**
     * Retrieves the count of comments for a specific post.
     *
     * @param postId - The ID of the post for which to count comments.
     * @returns A promise that resolves to the number of comments for the specified post.
     */
    async getCommentCountByPost(postId: string): Promise<number> {
        const count = await this.postRepository
            .createQueryBuilder("post")
            .leftJoin("post.comments", "comments")
            .where("post.id = :postId", { postId })
            .select("COUNT(comments.id)", "count")
            .getRawOne();

        return parseInt(count.count, 10);
    }

    /**
     * Retrieves all posts created by a specific user.
     *
     * This method constructs a query to fetch posts authored by the specified user,
     * including related data such as the author's full name, post categories, and counts
     * for likes, dislikes, and comments. The results are ordered by the post creation date
     * in descending order.
     *
     * @param userId - The ID of the user whose posts are to be retrieved.
     * @returns A promise that resolves to an array of ResponsePostDTO objects representing the user's posts.
     */
    async getAllPostsByUser(userId: string): Promise<ResponsePostDTO[]> {
        const queryBuilder = this.postRepository.createQueryBuilder("post");

        queryBuilder
            .leftJoinAndSelect("post.author", "author")
            .leftJoinAndSelect("post.categories", "category")
            // Додаємо кількість лайків (LIKE)
            .loadRelationCountAndMap("post.likesCount", "post.likes", "likes", qb => qb.where("likes.type = :likeType", { likeType: LikeType.LIKE }))
            // Додаємо кількість дизлайків (DISLIKE)
            .loadRelationCountAndMap("post.dislikesCount", "post.likes", "dislikes", qb => qb.where("dislikes.type = :dislikeType", { dislikeType: LikeType.DISLIKE }))
            // Додаємо кількість коментарів
            .loadRelationCountAndMap("post.commentsCount", "post.comments")
            .select([
                "post.id",
                "post.title",
                "post.content",
                "post.status",
                "post.createdAt",
                "post.updatedAt",
                "author.fullName",
                "category.title",
            ])
            .where("author.id = :userId", { userId })
            .orderBy("post.createdAt", "DESC");

        const posts = await queryBuilder.getMany();

        return posts.map((post) => this.toResponsePostDTO(post as Post & {
            likesCount: number;
            dislikesCount: number;
            commentsCount: number;
        }));
    }
    
    /**
     * Converts a Post object along with its associated counts into a ResponsePostDTO.
     *
     * @param post - The Post object to be converted, including likesCount, dislikesCount, and commentsCount.
     * @returns A ResponsePostDTO containing the post's details and associated counts.
     */
    private toResponsePostDTO(post: Post & {
        likesCount: number;
        dislikesCount: number;
        commentsCount: number;
    }): ResponsePostDTO {
        const authorFullName = post.author ? post.author.fullName : "Unknown";
        const categoryTitles = post.categories ? post.categories.map((category) => category.title) : [];

        return {
            id: post.id,
            title: post.title,
            content: post.content,
            status: post.status as PostStatus,
            author: authorFullName,
            categoryTitles: categoryTitles,
            likesCount: post.likesCount,
            dislikesCount: post.dislikesCount,
            commentsCount: post.commentsCount,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        };
    }
}