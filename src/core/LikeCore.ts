import { CRUDRepository } from "../interfaces/CRUD";
import { CreateLikeDTO, UpdateLikeDTO, ResponseLikeDTO } from "../dtos/LikeDTO";
import { AppDataSource } from "../config/data-source";
import { Like } from "../models/Like";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { Repository } from "typeorm";
import { LikeType } from "../enums/LikeTypes";

/**
 * The LikeCore class implements CRUD operations for managing likes in the application.
 * It interacts with the like, user, post, and comment repositories to perform various operations.
 */
export class LikeCore implements CRUDRepository<CreateLikeDTO, UpdateLikeDTO, ResponseLikeDTO> {
    private likeRepository: Repository<Like> = AppDataSource.getRepository(Like);
    private userRepository: Repository<User> = AppDataSource.getRepository(User);
    private postRepository: Repository<Post> = AppDataSource.getRepository(Post);
    private commentRepository: Repository<Comment> = AppDataSource.getRepository(Comment);

    // Створення лайку або дизлайку
    /**
     * Creates a new like based on the provided data.
     * 
     * @param data - The data required to create a like, including authorId, postId, and/or commentId.
     * @returns A promise that resolves to a ResponseLikeDTO object representing the created like.
     * @throws Will throw an error if the author, post, or comment is not found.
     */
    async create(data: CreateLikeDTO): Promise<ResponseLikeDTO> {
        const author = await this.userRepository.findOne({ where: { id: data.authorId } });
        if (!author) throw new Error("Author not found");

        let post: Post | undefined = undefined;
        let comment: Comment | undefined = undefined;

        if (data.postId) {
            const foundPost = await this.postRepository.findOne({ where: { id: data.postId } });
            if (!foundPost) throw new Error("Post not found");
            post = foundPost;
        }

        if (data.commentId) {
            const foundComment = await this.commentRepository.findOne({ where: { id: data.commentId } });
            comment = foundComment ? foundComment : undefined;
            if (!comment) throw new Error("Comment not found");
        }

        const like = this.likeRepository.create({
            ...data,
            author,
            post,
            comment,
        });

        const savedLike = await this.likeRepository.save(like);
        return this.toResponseLikeDTO(savedLike);
    }

    // Знаходження одного лайку за параметром
    /**
     * Finds a single like entity based on a specified key and value.
     *
     * @template K - The key of the ResponseLikeDTO to search by.
     * @param {K} key - The key to search for.
     * @param {ResponseLikeDTO[K]} value - The value to search for.
     * @returns {Promise<ResponseLikeDTO | null>} A promise that resolves to the found like entity as a ResponseLikeDTO, or null if no like entity is found.
     */
    async findOneBy<K extends keyof ResponseLikeDTO>(key: K, value: ResponseLikeDTO[K]): Promise<ResponseLikeDTO | null> {
        const like = await this.likeRepository.findOne({
            where: { [key]: value },
            relations: ["author", "post", "comment"],
        });
        return like ? this.toResponseLikeDTO(like) : null;
    }

    // Знаходження всіх лайків за параметром (може бути пост або коментар)
    /**
     * Finds all likes based on the specified key and value.
     * If no key and value are provided, it returns all likes.
     *
     * @template K - The key of the ResponseLikeDTO to filter by.
     * @param {K} [key] - The key to filter the likes by.
     * @param {ResponseLikeDTO[K]} [value] - The value to filter the likes by.
     * @returns {Promise<ResponseLikeDTO[]>} A promise that resolves to an array of ResponseLikeDTO objects.
     */
    async findAllBy<K extends keyof ResponseLikeDTO>(key?: K, value?: ResponseLikeDTO[K]): Promise<ResponseLikeDTO[]> {
        const likes = key && value
            ? await this.likeRepository.find({ where: { [key]: value }, relations: ["author", "post", "comment"] })
            : await this.likeRepository.find({ relations: ["author", "post", "comment"] });

        return likes.map(this.toResponseLikeDTO);
    }

    // Оновлення типу лайку
    /**
     * Updates a like entity based on the specified key and value, and updates it with the provided data.
     * 
     * @template K - The key of the ResponseLikeDTO to search by.
     * @param {K} key - The key to search for the like entity.
     * @param {ResponseLikeDTO[K]} value - The value of the key to search for the like entity.
     * @param {UpdateLikeDTO} data - The data to update the like entity with.
     * @returns {Promise<ResponseLikeDTO>} - A promise that resolves to the updated like entity in the form of ResponseLikeDTO.
     * @throws {Error} - Throws an error if the like entity is not found.
     */
    async update<K extends keyof ResponseLikeDTO>(key: K, value: ResponseLikeDTO[K], data: UpdateLikeDTO): Promise<ResponseLikeDTO> {
        const like = await this.likeRepository.findOne({
            where: { [key]: value },
            relations: ["author", "post", "comment"],
        });

        if (!like) throw new Error("Like not found");

        Object.assign(like, data);
        like.updatedAt = new Date();

        const updatedLike = await this.likeRepository.save(like);
        return this.toResponseLikeDTO(updatedLike);
    }

    // Видалення лайку
    /**
     * Deletes a like entry from the repository based on a specified key and value.
     *
     * @template K - The key of the ResponseLikeDTO to search by.
     * @param {K} key - The key to search for the like entry.
     * @param {ResponseLikeDTO[K]} value - The value associated with the key to search for the like entry.
     * @returns {Promise<void>} - A promise that resolves when the like entry is deleted.
     * @throws {Error} - Throws an error if the like entry is not found.
     */
    async delete<K extends keyof ResponseLikeDTO>(key: K, value: ResponseLikeDTO[K]): Promise<void> {
        const like = await this.likeRepository.findOne({ where: { [key]: value } });
        if (!like) throw new Error("Like not found");
        await this.likeRepository.remove(like);
    }

    // Підрахунок кількості лайків та дизлайків для поста або коментаря
    /**
     * Counts the number of likes for a given target (post or comment) and like type.
     *
     * @param targetId - The ID of the target (post or comment) for which to count likes.
     * @param target - The type of target, either "post" or "comment".
     * @param type - The type of like to count.
     * @returns A promise that resolves to the number of likes for the specified target and like type.
     * @throws Will throw an error if an invalid target is specified.
     */
    async countLikesForTarget(targetId: string, target: "post" | "comment", type: LikeType): Promise<number> {
        if (target === "post") {
            return await this.likeRepository.count({ where: { post: { id: targetId }, type } });
        } else if (target === "comment") {
            return await this.likeRepository.count({ where: { comment: { id: targetId }, type } });
        } else {
            throw new Error("Invalid target specified for counting likes");
        }
    }

    // Пошук лайку користувача для поста або коментаря
    /**
     * Finds a user's like for a specific target, which can be either a post or a comment.
     *
     * @param authorId - The ID of the author (user) who liked the target.
     * @param postId - (Optional) The ID of the post that was liked.
     * @param commentId - (Optional) The ID of the comment that was liked.
     * @returns A promise that resolves to a ResponseLikeDTO if a like is found, or null if no like is found.
     */
    async findUserLikeForTarget(authorId: string, postId?: string, commentId?: string): Promise<ResponseLikeDTO | null> {
        let like: Like | undefined;

        if (postId) {
            like = (await this.likeRepository.findOne({
                where: { author: { id: authorId }, post: { id: postId } },
                relations: ["author", "post"],
            })) || undefined;
        } else if (commentId) {
            like = (await this.likeRepository.findOne({
                where: { author: { id: authorId }, comment: { id: commentId } },
                relations: ["author", "comment"],
            })) || undefined;
        }

        return like ? this.toResponseLikeDTO(like) : null;
    }

    // Конвертація Entity Like до DTO Like
    /**
     * Converts a Like entity to a ResponseLikeDTO.
     *
     * @param like - The Like entity to be converted.
     * @returns The converted ResponseLikeDTO object.
     */
    private toResponseLikeDTO(like: Like): ResponseLikeDTO {
        return {
            id: like.id,
            authorId: like.author.id,
            postId: like.post ? like.post.id : undefined,
            commentId: like.comment ? like.comment.id : undefined,
            type: like.type as LikeType,
            createdAt: like.createdAt,
            updatedAt: like.updatedAt,
        };
    }
}
