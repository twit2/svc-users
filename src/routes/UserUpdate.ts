import { APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { ProfileMgr } from "../ProfileMgr";
import { UserRetrieveOp } from "../op/UserRetrieveOp";

/**
 * Handles the user update route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleUpdateUser(req: Request, res: Response, next: NextFunction) {
    const targetId = (req as Request & WithT2Session).session.id;

    res.contentType('json');

    const profile = await ProfileMgr.updateProfile({
        id: targetId,
        biography: req.body.biography,
        displayName: req.body.displayName
    });

    // Send updated object
    const usrObj : UserRetrieveOp = {
        avatarURL: profile.avatarURL ?? null,
        dateJoined: profile.dateJoined,
        biography: profile.biography ?? null,
        displayName: profile.displayName ?? null,
        username: profile.username,
        id: profile.id,
        followCount: profile.followers.length,
        followingCount: profile.following.length
    }

    res.send(APIRespConstructor.success(usrObj));
}