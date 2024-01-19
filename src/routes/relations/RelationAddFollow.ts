import { NextFunction, Request, Response } from "express";
import { RelationMgr } from "../../svc/relations/RelationMgr";
import { APIRespConstructor, WithT2Session } from "@twit2/std-library";

/**
 * Handles the user follow route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleFollowUser(req: Request, res: Response, next: NextFunction) {
    let source = (req as Request & WithT2Session).session.id;
    let dest = req.body.dest;

    res.send(APIRespConstructor.success(await RelationMgr.follow({ source, dest })));
}