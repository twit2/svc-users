import { APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { ProfileMgr } from "../../svc/profile/ProfileMgr";
import { UserRetrieveOp } from "../../op/UserRetrieveOp";

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

    // Check retrieval method
    // If the ID starts with an @, we should look for a username
    let profile;
    
    if(targetId.startsWith("@"))
        profile = await ProfileMgr.getProfileByName(targetId.substring(1));
    else
        profile = await ProfileMgr.getProfileById(targetId);

    if(profile == null) {
        res.status(404);
        res.send(APIRespConstructor.fromCode(APIResponseCodes.NOT_FOUND));
        return;
    }
    
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