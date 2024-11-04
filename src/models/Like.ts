import { 
    Entity, 
    PrimaryGeneratedColumn, 
    ManyToOne, 
    Column, 
    CreateDateColumn, 
    JoinColumn,
    UpdateDateColumn
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { LikeType } from "../enums/LikeTypes";

/**
 * Represents a Like entity in the database.
 * 
 * @entity
 * @table likes
 */
@Entity("likes")
export class Like {
    /**
     * Unique identifier for the Like entity.
     * 
     * @primaryGeneratedColumn
     * @type {string}
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    /**
     * The user who authored the like.
     * 
     * @manyToOne
     * @joinColumn authorId
     * @type {User}
     */
    @ManyToOne(() => User, (user) => user.likes, { onDelete: "CASCADE" })
    @JoinColumn({ name: "authorId" })
    author!: User;

    /**
     * The post that was liked. Nullable.
     * 
     * @manyToOne
     * @joinColumn postId
     * @type {Post | undefined}
     */
    @ManyToOne(() => Post, (post) => post.likes, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "postId" })
    post?: Post;

    /**
     * The comment that was liked. Nullable.
     * 
     * @manyToOne
     * @joinColumn commentId
     * @type {Comment | undefined}
     */
    @ManyToOne(() => Comment, (comment) => comment.likes, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "commentId" })
    comment?: Comment;

    /**
     * The type of the like.
     * 
     * @column
     * @type {LikeType}
     */
    @Column({ type: "enum", enum: LikeType })
    type!: LikeType;

    /**
     * The date and time when the like was created.
     * 
     * @createDateColumn
     * @type {Date}
     */
    @CreateDateColumn()
    createdAt!: Date;

    /**
     * The date and time when the like was last updated.
     * 
     * @updateDateColumn
     * @type {Date}
     */
    @UpdateDateColumn()
    updatedAt!: Date;
}
