import { LikeCore } from "../core/LikeCore";
import { CreateLikeDTO, ResponseLikeDTO } from "../dtos/LikeDTO";
import { LikeType } from "../enums/LikeTypes";

export class LikeAdapter {
    private likeCore = new LikeCore();

    /**
     * Creates a new like entry.
     *
     * @param {CreateLikeDTO} data - The data required to create a like.
     * @returns {Promise<ResponseLikeDTO>} A promise that resolves to the created like data.
     */
    async createLike(data: CreateLikeDTO): Promise<ResponseLikeDTO> {
        return this.likeCore.create(data);
    }

    /**
     * Updates the type of a like with the given like ID.
     *
     * @param likeId - The ID of the like to update.
     * @param type - The new type to set for the like.
     * @returns A promise that resolves to a ResponseLikeDTO object containing the updated like information.
     */
    async updateLikeType(likeId: string, type: LikeType): Promise<ResponseLikeDTO> {
        return this.likeCore.update("id", likeId, { type });
    }    

    /**
     * Finds a user's like for a specific post.
     *
     * @param authorId - The ID of the author (user) who liked the post.
     * @param postId - The ID of the post to check for a like.
     * @returns A promise that resolves to a ResponseLikeDTO if the like is found, or null if not.
     */
    async findUserLikeForPost(authorId: string, postId: string): Promise<ResponseLikeDTO | null> {
        return this.likeCore.findUserLikeForTarget(authorId, postId, undefined);
    }

    /**
     * Finds a user's like for a specific comment.
     *
     * @param authorId - The ID of the user who liked the comment.
     * @param commentId - The ID of the comment that was liked.
     * @returns A promise that resolves to a ResponseLikeDTO if the like is found, or null if not.
     */
    async findUserLikeForComment(authorId: string, commentId: string): Promise<ResponseLikeDTO | null> {
        return this.likeCore.findUserLikeForTarget(authorId, undefined, commentId);
    }

    /**
     * Counts the number of likes and dislikes for a given target (post or comment).
     *
     * @param postId - The ID of the post to count likes and dislikes for.
     * @param commentId - The ID of the comment to count likes and dislikes for.
     * @returns A promise that resolves to an object containing the number of likes and dislikes.
     * @throws Will throw an error if neither postId nor commentId is provided.
     */
    async countLikesDislikesByTarget(postId?: string, commentId?: string): Promise<{ likes: number; dislikes: number }> {
        if (postId) {
            const likes = await this.likeCore.countLikesForTarget(postId, "post", LikeType.LIKE);
            const dislikes = await this.likeCore.countLikesForTarget(postId, "post", LikeType.DISLIKE);
            return { likes, dislikes };
        } else if (commentId) {
            const likes = await this.likeCore.countLikesForTarget(commentId, "comment", LikeType.LIKE);
            const dislikes = await this.likeCore.countLikesForTarget(commentId, "comment", LikeType.DISLIKE);
            return { likes, dislikes };
        } else {
            throw new Error("Invalid target ID provided for counting likes and dislikes");
        }
    }

    /**
     * Deletes a like by its ID.
     *
     * @param likeId - The ID of the like to be deleted.
     * @returns A promise that resolves when the like is deleted.
     */
    async deleteLike(likeId: string): Promise<void> {
        return this.likeCore.delete("id", likeId);
    }
}
