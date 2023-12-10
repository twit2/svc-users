import { APIError, APIResponseCodes, Limits, PaginatedAPIData, Regexes, User } from "@twit2/std-library";
import { UserInsertOp } from "./op/UserInsertOp";
import { ProfileStore } from "./ProfileStore";
import { UserUpdateOp } from "./op/UserUpdateOp";
import Ajv from "ajv";
import { UserAvatarUpdateOp } from "./op/UserAvatarUpdateOp";
import { UserVerifyOp } from "./op/UserVerifyOp";
import { UserBannerUpdateOp } from "./op/UserBannerUpdateOp";
import { UserGetProfileListOp } from "./op/UserGetProfileListOp";

const ajv = new Ajv();
const PAGE_SIZE = 10;

/**
 * Registers a new user profile.
 * @param op The profile to create.
 */
async function createProfile(op: UserInsertOp): Promise<User> {
    const schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            username: { type: "string", minLength: Limits.uam.username.min, maxLength: Limits.uam.username.max, pattern: '^[a-zA-Z0-9_]*$' },
            avatarURL: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max },
            biography: { type: "string", minLength: Limits.userProfile.biography.min, maxLength: Limits.userProfile.biography.max }
        },
        required: ["id", "username"],
        additionalProperties: false
    }

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    // Check avatar URL
    if(op.avatarURL) {
        if((op.avatarURL !== '') && (!Regexes.url_basic.test(op.avatarURL)))
            throw new Error("Invalid avatar URL.");
    }

    const prevProfile = await ProfileStore.findUserByUName(op.username);

    if(prevProfile)
        throw new Error("User profile already exists for this username!");

    // Create the user.
    const user : User = {
        id: op.id,
        username: op.username,
        dateJoined: new Date(),
        avatarURL: op.avatarURL ?? '',
        bannerURL: '',
        biography: op.biography ?? '',
        displayName: op.displayName ?? '',
        verified: false,
        following: [],
        followers: []
    };

    await ProfileStore.createUser(user);
    return user;
}

/**
 * Updates a user profile.
 * @param op The profile update operation.
 */
async function updateProfile(op: UserUpdateOp): Promise<User> {
    const schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            displayName: { type: "string", minLength: Limits.userProfile.displayName.min, maxLength: Limits.userProfile.displayName.max },
            biography: { type: "string", minLength: Limits.userProfile.biography.min, maxLength: Limits.userProfile.biography.max }
        },
        required: ["id"],
        additionalProperties: false
    }

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await ProfileStore.updateUser(op.id, op);
}

/**
 * Updates the user's avatar URL.
 * @param op The update operation.
 */
async function updateAvatar(op: UserAvatarUpdateOp): Promise<User> {
    const schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            avatarURL: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max }
        },
        required: ["id", "avatarURL"],
        additionalProperties: false
    };

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    // Ensure avatar URL is correct
    // It should be in the CDN format
    const urlParts = op.avatarURL.split('/');
    
    if((urlParts.length !== 3) || (urlParts[1] !== "avatars"))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await ProfileStore.updateUserAvatar(op);
}

/**
 * Updates the user's banner URL.
 * @param op The update operation.
 */
async function updateBanner(op: UserBannerUpdateOp): Promise<User> {
    const schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            bannerURL: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max }
        },
        required: ["id", "bannerURL"],
        additionalProperties: false
    };

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    // Ensure banner URL is correct
    // It should be in the CDN format
    const urlParts = op.bannerURL.split('/');
    
    if((urlParts.length !== 3) || (urlParts[1] !== "banners"))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await ProfileStore.updateUserBanner(op);
}

/**
 * Retrieves a profile by username.
 * @param username The username to retrieve the profile for.
 */
async function getProfileByName(username: string) {
    return ProfileStore.findUserByUName(username);
}

/**
 * Retrieves the latest profiles.
 */
async function getLatestProfiles(op: UserGetProfileListOp): Promise<PaginatedAPIData<User>> {
    const VALID_FILTERS = ["latest", "verified", "unverified"];

    const schema = {
        type: "object",
        properties: {
            filter: { type: "string" },
            page: { type: "number" }
        },
        required: ["page"],
        additionalProperties: false
    }

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    if(!VALID_FILTERS.includes(op.filter))
        throw new Error("Invalid filter.");
    
    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: await ProfileStore.getLatestProfiles(op.filter, op.page, PAGE_SIZE)
    };
}

/**
 * Verifies a user.
 */
async function setVerified(op: UserVerifyOp) {
    const schema = {
        type: "object",
        properties: {
            targetUser: { type: "string" },
            verified: { type: "boolean" }
        },
        required: ["targetUser", "verified"],
        additionalProperties: false
    }

    if(!ajv.validate(schema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await ProfileStore.updateUser(op.targetUser, {
        id: op.targetUser,
        verified: op.verified
    });
}

/**
 * Retrieves a profile by id.
 * @param username The user id to retrieve the profile for.
 */
async function getProfileById(id: string) {
    return ProfileStore.findUserById(id);
}

export const ProfileMgr = {
    createProfile,
    updateProfile,
    getProfileByName,
    getLatestProfiles,
    getProfileById,
    updateAvatar,
    updateBanner,
    setVerified
}