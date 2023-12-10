import { APIRespConstructor } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { ProfileMgr } from "../ProfileMgr";

/**
 * Handles the latest user retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetLatestUsers(req: Request, res: Response, next: NextFunction) {
    const filter = req.params.filter as any; // TS will complain
    res.contentType('json');

    const profiles = await ProfileMgr.getLatestProfiles({ filter, page: parseInt((req.params as any).page) });

    if(profiles.data) {
        profiles.data.map(profile => ({
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
        }));
    }

    res.send(APIRespConstructor.success(profiles));
}