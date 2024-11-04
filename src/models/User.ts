import { 
    Entity,
    PrimaryGeneratedColumn,
    Column, 
    OneToMany, 
    CreateDateColumn, 
    UpdateDateColumn 
} from "typeorm";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { Like } from "./Like";
import { UserRoles } from "../enums/UserRoles";

@Entity("users")
export class User {
    /**
     * Unique identifier for the user (UUID).
     */
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    /**
     * Unique username.
     */
    @Column({ unique: true })
    username!: string;

    /**
     * User's password hash.
     */
    @Column()
    passwordHash!: string;

    /**
     * User's full name.
     */
    @Column()
    fullName!: string;

    /**
     * User's email (unique).
     */
    @Column({ unique: true })
    email!: string;

    /**
     * URL of the user's profile picture.
     * @optional
     */
    @Column({ nullable: true })
    profilePicture?: string;

    /**
     * User's role in the system.
     * @default UserRoles.USER
     */
    @Column({ 
        type: "enum",
        enum: UserRoles,
        default: UserRoles.USER
    })
    role!: UserRoles;

    /**
     * Flag indicating whether the user is verified.
     * @default false
     */
    @Column({ default: false })
    isVerified!: boolean;

    /**
     * User's rating.
     * @default 0
     */
    @Column({ default: 0 })
    rating!: number;

    /**
     * Posts created by the user.
     */
    @OneToMany(() => Post, (post) => post.author)
    posts!: Post[];

    /**
     * Comments left by the user.
     */
    @OneToMany(() => Comment, (comment) => comment.author)
    comments!: Comment[];

    /**
     * Likes given by the user.
     */
    @OneToMany(() => Like, (like) => like.author)
    likes!: Like[];

    /**
     * Date when the user record was created.
     */
    @CreateDateColumn()
    createdAt!: Date;

    /**
     * Date when the user record was last updated.
     */
    @UpdateDateColumn()
    updatedAt!: Date;
}
