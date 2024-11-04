import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import { Like } from "../models/Like";
import { Category } from "../models/Category";

import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const TestDataSource = new DataSource({
    type: "sqlite",
    database: ":memory:",
    dropSchema: true,
    entities: [User, Post, Comment, Like, Category],
    synchronize: true,
    logging: false,
});

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: true,  // Only use synchronize for development; use migrations for production
    logging: true,
    entities: [User, Post, Comment, Like, Category],
    subscribers: [],
    migrations: [],
});
