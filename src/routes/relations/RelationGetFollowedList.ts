import { APIError, APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { RelationMgr } from "../../svc/relations/RelationMgr";
import { ProfileMgr } from "../../svc/profile/ProfileMgr";

/**
 * Gets a list of followed users.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetRelationList(req: Request, res: Response, next: NextFunction) {
    let uid;
    const relation = req.params.relation;
    const username = req.params.username.substring(1);
    const page = parseInt(req.params.page);

    if(username === "@me")
        uid = (req as Request & WithT2Session).session.id;
    else
        uid = (await ProfileMgr.getProfileByName(username))?.id;

    if(!uid) {
        res.status(404);
        res.send(APIRespConstructor.fromCode(APIResponseCodes.NOT_FOUND));
        return;
    }

    switch(relation) {
        case "following":
            return await RelationMgr.getFollowing(page, uid);
        case "followers":
            return await RelationMgr.getFollowers(page, uid);
        case "blocked":
            return await RelationMgr.getBlockedUsers(page, uid);
        default:
            throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);
    }
}