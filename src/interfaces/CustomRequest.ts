import { Request } from "express";
import { Payload } from "../utils/tokenUtil";

/**
 * CustomRequest interface extends the standard Request interface to include an optional currentUser property.
 * 
 * @property {Payload} [currentUser] - An optional property that represents the current user.
 */
export interface CustomRequest extends Request {
    currentUser?: Payload;
}
