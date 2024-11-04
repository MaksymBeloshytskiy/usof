import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn, 
} from "typeorm";

/**
 * Represents a category entity in the database.
 * 
 * @class Category
 */
@Entity("categories")
export class Category {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    title!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
