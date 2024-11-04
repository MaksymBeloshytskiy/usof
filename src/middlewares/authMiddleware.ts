import { NextFunction, Response } from "express";
import { CustomRequest } from "../interfaces/CustomRequest";
import { TokenUtil } from "../utils/tokenUtil";
import redisClient from "../config/redis";
import dotenv from "dotenv";
import { AppDataSource } from "../config/data-source";
import { Post } from "../models/Post";
import { Comment } from "../models/Comment";
import {
  BaseError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  InternalServerError,
} from "../errors/CustomErrors";
dotenv.config();

export class AuthMiddleware {
  // Перевірка автентифікації користувача та валідності токена
  /**
   * Middleware to check if the user is authenticated.
   * 
   * This middleware verifies the presence and validity of the authorization token
   * in the request headers. It checks if the token is blacklisted, verifies the token,
   * and attaches the decoded user information to the request object.
   * 
   * @param req - The request object, extended with custom properties.
   * @param res - The response object.
   * @param next - The next middleware function in the stack.
   * 
   * @throws {UnauthorizedError} If the authorization header is missing or invalid.
   * @throws {UnauthorizedError} If the token is blacklisted.
   * @throws {UnauthorizedError} If the token structure is invalid.
   * @throws {Error} If the token has expired.
   * @throws {Error} If the token is invalid.
   * @throws {Error} For any other internal server errors during authentication.
   * 
   * @returns {Promise<void>} A promise that resolves to void.
   */
  static async isAuthenticated(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.headers.authorization) {
        throw new UnauthorizedError("Access denied. No authorization header provided.");
      }

      const [scheme, token] = req.headers.authorization.split(" ");
      if (scheme !== "Bearer" || !token) {
        throw new UnauthorizedError("Access denied. Invalid authorization format.");
      }

      // Перевірка, чи токен не знаходиться в чорному списку
      const isBlacklisted = await redisClient.get(`blacklist:${token}`);
      if (isBlacklisted) {
        throw new UnauthorizedError("Token has been blacklisted. Access denied.");
      }

      // Верифікація токена
      const decoded = TokenUtil.verifyToken(token);

      if (!decoded || !decoded.id || !decoded.role) {
        throw new UnauthorizedError("Invalid token structure. Access denied.");
      }

      // Зберігаємо інформацію про користувача в запиті
      req.currentUser = decoded;

      // Передаємо управління наступному middleware
      next();
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ error: error.message });
      } else if (error instanceof Error && error.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token has expired. Please log in again." });
      } else if (error instanceof Error && error.name === "JsonWebTokenError") {
        res.status(401).json({ error: "Invalid token. Access denied." });
      } else {
        console.error("Authentication error:", error);
        res.status(500).json({ error: "Internal server error during authentication." });
      }
    }
  }

  // Метод для перевірки ролі
  /**
   * Middleware to check if the current user is authorized based on their role.
   *
   * @param role - The role required to access the route.
   * @returns A middleware function that checks the user's role and either allows
   *          the request to proceed or returns an error response.
   *
   * @throws {UnauthorizedError} If no user data is available in the request.
   * @throws {ForbiddenError} If the user's role does not match the required role.
   */
  static isAuthorized(role: string) {
    return (req: CustomRequest, res: Response, next: NextFunction): void => {
      try {
        if (!req.currentUser) {
          throw new UnauthorizedError("Access denied. No user data available.");
        }

        // Перевірка ролі користувача
        if (req.currentUser.role !== role) {
          throw new ForbiddenError(`Access denied. Only ${role}s are allowed.`);
        }

        // Передаємо управління наступному middleware
        next();
      } catch (error) {
        if (error instanceof BaseError) {
          res.status(error.statusCode).json({ error: error.message });
        } else {
          console.error("Authorization error:", error);
          res.status(500).json({ error: "Internal server error during authorization." });
        }
      }
    };
  }

  // Перевірка на те, чи може користувач змінювати інформацію про себе або чи є адміністратором
  /**
   * Middleware to check if the current user is either the owner of the account or an admin.
   * 
   * @param req - The request object, extended with `currentUser` containing user data.
   * @param res - The response object.
   * @param next - The next middleware function in the stack.
   * 
   * @throws {UnauthorizedError} If no user data is available in the request.
   * @throws {NotFoundError} If the user ID is missing in the request parameters.
   * @throws {ForbiddenError} If the user is neither the owner of the account nor an admin.
   * 
   * @returns {Promise<void>} A promise that resolves to void.
   */
  static async isUserOrAdmin(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.currentUser) {
        throw new UnauthorizedError("Access denied. No user data available.");
      }

      const userId = req.currentUser.id;
      const userRole = req.currentUser.role;

      // Отримуємо ID користувача з параметрів запиту
      const requestedUserId = req.params.userId;

      if (!requestedUserId) {
        throw new NotFoundError("User ID is missing in the request parameters.");
      }

      // Перевірка, чи користувач є власником або адміністратором
      if (userId === requestedUserId || userRole === "admin") {
        // Користувач авторизований
        next();
      } else {
        throw new ForbiddenError(
          "Access denied. You are not the owner of this account or an admin."
        );
      }
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error("Authorization error:", error);
        res
          .status(500)
          .json({ error: "Internal server error during authorization." });
      }
    }
  }


  // Метод для перевірки, чи є користувач автором поста або адміністратором
  /**
   * Middleware to check if the current user is the author of the post or an admin.
   * 
   * This middleware function checks if the user making the request is either the author of the post
   * specified in the request parameters or has an admin role. If the user is authorized, the request
   * is passed to the next middleware or route handler. Otherwise, an appropriate error response is sent.
   * 
   * @param req - The request object, expected to contain the current user and post ID in the parameters.
   * @param res - The response object used to send error responses if the user is not authorized.
   * @param next - The next middleware or route handler to be called if the user is authorized.
   * 
   * @throws {UnauthorizedError} If the current user is not available in the request.
   * @throws {NotFoundError} If the post ID is missing in the request parameters or the post is not found.
   * @throws {ForbiddenError} If the user is neither the author of the post nor an admin.
   * @throws {BaseError} If any other known error occurs during authorization.
   * @throws {Error} If an unknown error occurs during authorization.
   */
  static async isPostAuthorOrAdmin(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.currentUser) {
        throw new UnauthorizedError("Access denied. No user data available.");
      }

      const userId = req.currentUser.id;
      const userRole = req.currentUser.role;

      // Отримуємо ID поста з параметрів запиту
      const postId = req.params.postId || req.params.id;

      if (!postId) {
        throw new NotFoundError("Post ID is missing in the request parameters.");
      }

      // Отримуємо репозиторій Post з AppDataSource
      const postRepository = AppDataSource.getRepository(Post);

      // Отримуємо пост з бази даних
      const post = await postRepository.findOne({
        where: { id: postId },
        relations: ["author"],
      });

      if (!post) {
        throw new NotFoundError("Post not found.");
      }

      // Перевіряємо, чи є користувач автором поста або адміністратором
      if (post.author.id === userId || userRole === "admin") {
        // Користувач авторизований
        next();
      } else {
        throw new ForbiddenError(
          "Access denied. You are not the author of this post or an admin."
        );
      }
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error("Authorization error:", error);
        res
          .status(500)
          .json({ error: "Internal server error during authorization." });
      }
    }
  }

  // Метод для перевірки, чи є користувач автором коментаря або адміністратором
  /**
   * Middleware to check if the current user is the author of the comment or an admin.
   * 
   * @param req - The request object, extended with custom properties.
   * @param res - The response object.
   * @param next - The next middleware function in the stack.
   * 
   * @throws {UnauthorizedError} If there is no user data available in the request.
   * @throws {NotFoundError} If the comment ID is missing in the request parameters or the comment is not found.
   * @throws {ForbiddenError} If the user is neither the author of the comment nor an admin.
   * 
   * @returns {Promise<void>} A promise that resolves to void.
   */
  static async isCommentAuthorOrAdmin(
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.currentUser) {
        throw new UnauthorizedError("Access denied. No user data available.");
      }

      const userId = req.currentUser.id;
      const userRole = req.currentUser.role;

      // Отримуємо ID коментаря з параметрів запиту
      const commentId = req.params.commentId || req.params.id;

      if (!commentId) {
        throw new NotFoundError("Comment ID is missing in the request parameters.");
      }

      // Отримуємо репозиторій Comment з AppDataSource
      const commentRepository = AppDataSource.getRepository(Comment);

      // Отримуємо коментар з бази даних
      const comment = await commentRepository.findOne({
        where: { id: commentId },
        relations: ["author"],
      });

      if (!comment) {
        throw new NotFoundError("Comment not found.");
      }

      // Перевіряємо, чи є користувач автором коментаря або адміністратором
      if (comment.author.id === userId || userRole === "admin") {
        // Користувач авторизований
        next();
      } else {
        throw new ForbiddenError(
          "Access denied. You are not the author of this comment or an admin."
        );
      }
    } catch (error) {
      if (error instanceof BaseError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        console.error("Authorization error:", error);
        res
          .status(500)
          .json({ error: "Internal server error during authorization." });
      }
    }
  }
}
