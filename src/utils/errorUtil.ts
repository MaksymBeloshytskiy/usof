// utils/ErrorUtil.ts
import { Response } from "express";

export class ErrorUtil {
    /**
     * Handles errors by sending an appropriate JSON response with a status code of 500.
     *
     * @param res - The response object to send the error response.
     * @param error - The error object that was caught. If it is an instance of `Error`, 
     *                the error message will be sent in the response. Otherwise, a generic 
     *                "Unknown error occurred" message will be sent.
     */
    static handleError(res: Response, error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }

    /**
     * Handles validation errors by sending a 400 status response with the error message.
     *
     * @param res - The response object to send the error message.
     * @param error - The validation error message to be sent in the response.
     */
    static handleValidationError(res: Response, error: string) {
        res.status(400).json({ error });
    }

    /**
     * Handles the not found error by sending a 404 status code and a JSON response with an error message.
     *
     * @param res - The response object to send the error response.
     * @param entity - The name of the entity that was not found.
     */
    static handleNotFoundError(res: Response, entity: string) {
        res.status(404).json({ error: `${entity} not found` });
    }

    /**
     * Handles unauthorized errors by sending a 401 status code and a JSON response with an error message.
     *
     * @param res - The response object to send the error message.
     * @param message - The error message to send. Defaults to "Unauthorized".
     */
    static handleUnauthorizedError(res: Response, message: string = "Unauthorized") {
        res.status(401).json({ error: message });
    }

    /**
     * Handles a forbidden error by sending a 403 status code and a JSON response with an error message.
     *
     * @param res - The response object to send the error response.
     * @param message - The error message to send in the response. Defaults to "Forbidden".
     */
    static handleForbiddenError(res: Response, message: string = "Forbidden") {
        res.status(403).json({ error: message });
    }
}
