import { Request, Response } from "express";
import { PostAdapter } from "../adapters/PostAdapter";
import { BadRequestError, BaseError } from "../errors/CustomErrors";
import { UserAdapter } from "../adapters/UserAdapter";
import { NotFoundError } from "../errors/CustomErrors";

export class PostController {
  private postAdapter: PostAdapter;

  constructor() {
    this.postAdapter = new PostAdapter();
  }

  async createPost(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      const post = await this.postAdapter.createPost(data);
      res.status(201).json(post);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.postId;
      const post = await this.postAdapter.getPostById(id);
      res.json(post);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await this.postAdapter.getAllPosts();
      res.json(posts);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string; // Отримуємо userId із запиту
  
      if (!userId) {
        throw new BadRequestError("User ID is required");
      }
  
      const userAdapter = new UserAdapter();
      const user = await userAdapter.findUserById(userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
  
      const posts = await this.postAdapter.getAllUserPosts(userId);
      res.json(posts);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }    

  async updatePost(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.postId;
      const data = req.body;

      console.log(id);
      console.log(data);
      const post = await this.postAdapter.updatePost(id, data);
      res.json(post);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async deletePost(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.postId;
      await this.postAdapter.deletePost(id);
      res.status(204).send();
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getPaginatedPosts(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const searchTerm = req.query.searchTerm as string;
      const sortOption = req.query.sortOption as string;
      const sortOrder = (req.query.sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC';
      const category = req.query.category as string;
  
      const result = await this.postAdapter.getPaginatedPosts(page, limit, searchTerm, sortOption, sortOrder, category);
      res.json(result);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  private handleError(res: Response, error: any): void {
    if (error instanceof BaseError) {
      res.status(error.statusCode).json({ message: error.message, errors: error.errors });
    } else {
      console.error(error); // Логування помилки
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
