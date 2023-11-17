import { APIRespConstructor, APIResponseCodes } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";

/**
 * Handles the my user (@me) route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export function handleMyUser(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');
    
    // TODO return user
    res.end("{}");
}