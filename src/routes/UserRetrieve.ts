import { APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { ProfileMgr } from "../ProfileMgr";
import { UserRetrieveOp } from "../op/UserRetrieveOp";

/**
 * Handles the user retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetUser(req: Request, res: Response, next: NextFunction) {
    let targetId: string;

    if(req.params.id != null)
        targetId = req.params.id;
    else
        targetId = (req as Request & WithT2Session).session.id;

    res.contentType('json');

    // Retrieve profile
    const profile = await ProfileMgr.getProfileById(targetId);

    if(profile == null) {
        res.status(404);
        res.send(APIRespConstructor.fromCode(APIResponseCodes.NOT_FOUND));
        return;
    }
    
    const usrObj : UserRetrieveOp = {
        avatarUrl: profile.avatarURL ?? null,
        dateJoined: profile.dateJoined,
        biography: profile.biography ?? null,
        displayName: profile.displayName ?? null,
        username: profile.username,
        id: profile.id,
        followCount: profile.followers.length,
        followingCount: profile.following.length
    }

    res.send(usrObj);
}