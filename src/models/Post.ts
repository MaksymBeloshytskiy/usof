// Post.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    OneToMany,
    JoinTable,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";
import { Category } from "./Category";
import { Like } from "./Like";
import { PostStatus } from "../enums/PostStatus";

/**
 * Represents a blog post within the system.
 */
@Entity("posts")
export class Post {
    /**
     * The unique identifier for the post (UUID).
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    /**
     * The title of the post.
     */
    @Column()
    title!: string;

    /**
     * The content of the post in text format.
     */
    @Column("text")
    content!: string;

    /**
     * The status of the post, indicating whether it is active, archived, etc.
     * @default PostStatus.ACTIVE
     */
    @Column({ type: "enum", enum: PostStatus, default: PostStatus.ACTIVE })
    status!: PostStatus;

    /**
     * The identifier of the author who created the post.
     * This field cannot be null.
     */
    @Column({ nullable: false })
    authorId!: string;

    /**
     * The author of the post.
     * Establishes a many-to-one relationship with the User entity.
     * The `eager` option ensures that the author is automatically loaded with the post.
     */
    @ManyToOne(() => User, (user) => user.posts, { onDelete: "CASCADE", eager: true })
    @JoinColumn({ name: "authorId" })
    author!: User;

    /**
     * The categories associated with the post.
     * Establishes a many-to-many relationship with the Category entity.
     * The `eager` option ensures that categories are automatically loaded with the post.
     */
    @ManyToMany(() => Category, { eager: true })
    @JoinTable({
        name: "post_categories", // Name of the join table
        joinColumn: {
            name: "postId",
            referencedColumnName: "id",
        },
        inverseJoinColumn: {
            name: "categoryId",
            referencedColumnName: "id",
        },
    })
    categories!: Category[];

    /**
     * The comments associated with the post.
     * Establishes a one-to-many relationship with the Comment entity.
     * The `lazy` option returns a promise, allowing for deferred loading of comments.
     */
    @OneToMany(() => Comment, (comment) => comment.post, { lazy: true })
    comments!: Promise<Comment[]>;

    /**
     * The likes associated with the post.
     * Establishes a one-to-many relationship with the Like entity.
     * The `lazy` option returns a promise, allowing for deferred loading of likes.
     */
    @OneToMany(() => Like, (like) => like.post, { lazy: true })
    likes!: Promise<Like[]>;

    /**
     * The date and time when the post was created.
     * Automatically managed by TypeORM.
     */
    @CreateDateColumn()
    createdAt!: Date;

    /**
     * The date and time when the post was last updated.
     * Automatically managed by TypeORM.
     */
    @UpdateDateColumn()
    updatedAt!: Date;
}
