import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { RelationMgr } from "../../svc/relations/RelationMgr";

/**
 * Handles the relation state retrieval.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetRelationState(req: Request, res: Response, next: NextFunction) {
    let source = (req as Request & WithT2Session).session.id;
    let dest = req.params.id;

    res.send(APIRespConstructor.success(await RelationMgr.getState({ source, dest })));
}