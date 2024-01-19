import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { RelationMgr } from "../../svc/relations/RelationMgr";

/**
 * Handles the user unfollow route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleUnfollowUser(req: Request, res: Response, next: NextFunction) {
    let source = (req as Request & WithT2Session).session.id;
    let dest = req.body.dest;

    res.send(APIRespConstructor.success(await RelationMgr.unfollow({ source, dest })));
}