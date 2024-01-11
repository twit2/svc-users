import { APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { RelationMgr } from "../../svc/relations/RelationMgr";
import { ProfileMgr } from "../../svc/profile/ProfileMgr";

/**
 * Handles the retrieval of user relation stats.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetUserRelationStats(req: Request, res: Response, next: NextFunction) {
    let uid;
    const username = req.params.username.substring(1);

    if(username === "@me")
        uid = (req as Request & WithT2Session).session.id;
    else
        uid = (await ProfileMgr.getProfileByName(username))?.id;

    if(!uid) {
        res.status(404);
        res.send(APIRespConstructor.fromCode(APIResponseCodes.NOT_FOUND));
        return;
    }

    res.send(APIRespConstructor.success(await RelationMgr.getRelationStats(uid)));
}