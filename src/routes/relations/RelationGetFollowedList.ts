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

    let data;

    switch(relation) {
        case "following":
            data = await RelationMgr.getFollowing(page, uid);
            break;
        case "followers":
            data = await RelationMgr.getFollowers(page, uid);
            break;
        case "blocked":
            data = await RelationMgr.getBlockedUsers(page, uid);
            break;
        default:
            throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);
    }

    res.send(APIRespConstructor.success(data));
}