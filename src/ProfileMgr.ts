import { APIError, APIResponseCodes, GenericPagedOp, Limits, PaginatedAPIData, Regexes, User, generateId } from "@twit2/std-library";
import { UserInsertOp } from "./op/UserInsertOp";
import { ProfileStore } from "./ProfileStore";
import { UserUpdateOp } from "./op/UserUpdateOp";
import Ajv from "ajv";
import { UserAvatarUpdateOp } from "./op/UserAvatarUpdateOp";

const ajv = new Ajv();
const PAGE_SIZE = 10;

const genericPageSchema = {
    type: "object",
    properties: {
        page: { type: "number" }
    },
    required: ["page"],
    additionalProperties: false
}

/**
 * Registers a new user profile.
 * @param op The profile to create.
 */
async function createProfile(op: UserInsertOp): Promise<User> {
    const schema = {
        type: "object",
        properties: {
            id: { type: "string" },
            username: { type: "string" },
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
        biography: op.biography ?? '',
        displayName: op.displayName ?? '',
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
    
    if((urlParts.length !== 3) && (urlParts[0] !== "avatar"))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await ProfileStore.updateUserAvatar(op);
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
async function getLatestProfiles(op: GenericPagedOp): Promise<PaginatedAPIData<User>> {
    if(!ajv.validate(genericPageSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: await ProfileStore.getLatestProfiles(op.page, PAGE_SIZE)
    };
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
    updateAvatar
}