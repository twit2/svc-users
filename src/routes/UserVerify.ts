import { APIRespConstructor } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { ProfileMgr } from "../svc/profile/ProfileMgr";
import { UserRetrieveOp } from "../op/UserRetrieveOp";

/**
 * Handles the administrative user verify route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleVerifyUser(req: Request, res: Response, next: NextFunction) {
    const targetId = req.params.id;

    res.contentType('json');

    const profile = await ProfileMgr.setVerified({
        targetUser: targetId,
        verified: req.body.verified,
    });

    // Send updated object
    const usrObj : UserRetrieveOp = {
        avatarURL: profile.avatarURL ?? null,
        bannerURL: profile.bannerURL ?? null,
        dateJoined: profile.dateJoined,
        biography: profile.biography ?? null,
        displayName: profile.displayName ?? null,
        username: profile.username,
        id: profile.id,
        verified: profile.verified,
        followCount: profile.followers.length,
        followingCount: profile.following.length
    }

    res.send(APIRespConstructor.success(usrObj));
}