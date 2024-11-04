import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    ManyToOne, 
    OneToMany, 
    JoinColumn,
    CreateDateColumn, 
    UpdateDateColumn 
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Like } from "./Like";

/**
 * Represents a comment entity in the database.
 * 
 * @entity
 */
@Entity("comments")
export class Comment {
    /**
     * Unique identifier for the comment.
     * @type {string}
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    /**
     * The content of the comment.
     * @type {string}
     */
    @Column("text")
    content!: string;

    /**
     * The author of the comment.
     * @type {User}
     */
    @ManyToOne(() => User, (user) => user.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "authorId" })
    author!: User;

    /**
     * The post to which the comment belongs.
     * @type {Post}
     */
    @ManyToOne(() => Post, (post) => post.comments, { onDelete: "CASCADE" })
    @JoinColumn({ name: "postId" })
    post!: Post;

    /**
     * The ID of the parent comment, if this comment is a reply.
     * @type {string}
     * @optional
     */
    @Column({ nullable: true })
    parentCommentId?: string;
    
    /**
     * The parent comment, if this comment is a reply.
     * @type {Comment}
     * @optional
     */
    @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "parentCommentId" })
    parentComment?: Comment;

    /**
     * The replies to this comment.
     * @type {Comment[]}
     * @optional
     */
    @OneToMany(() => Comment, (comment) => comment.parentComment)
    replies?: Comment[];

    /**
     * The likes associated with this comment.
     * @type {Like[]}
     */
    @OneToMany(() => Like, (like) => like.comment)
    likes!: Like[];

    /**
     * The date and time when the comment was created.
     * @type {Date}
     */
    @CreateDateColumn()
    createdAt!: Date;

    /**
     * The date and time when the comment was last updated.
     * @type {Date}
     */
    @UpdateDateColumn()
    updatedAt!: Date;
}
