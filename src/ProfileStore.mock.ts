import { Limits, User } from '@twit2/std-library'
import { UserUpdateOp } from "./op/UserUpdateOp";
import { UserAvatarUpdateOp } from "./op/UserAvatarUpdateOp";
import { UserBannerUpdateOp } from "./op/UserBannerUpdateOp";
import Ajv from "ajv";

const ajv = new Ajv();

const mockProfileSchema = {
    type: "object",
    properties: {
        id: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max },
        displayName: { type: "string" },
        dateJoined: { type: "object" },
        followers: { type: "array" },
        following: { type: "array" },
        username: { type: "string", minLength: Limits.uam.username.min, maxLength: Limits.uam.username.max, pattern: '^[a-zA-Z0-9_]*$' },
        avatarURL: { type: "string", minLength: 0, maxLength: Limits.general.hard.max },
        bannerURL: { type: "string", minLength: 0, maxLength: Limits.general.hard.max },
        biography: { type: "string", minLength: 0, maxLength: Limits.userProfile.biography.max },
        verified: { type: "boolean" }
    },
    required: ["id", "username", "dateJoined", "followers", "following"],
    additionalProperties: false
}

function _mock_paginate<T>(arr: any[], start: number, limit: number): T[] {
    const items : T[] = [];
    let max = start + limit;
    
    if(max > arr.length)
        max = arr.length;

    for(let x = start; x < max; x++)
        items.push(arr[x]);

    return items;
}

function _dateComparer(a: User, b: User): number {
    if(a.dateJoined > b.dateJoined) return 1;
    else if(a.dateJoined < b.dateJoined) return -1;
    return 0;
}

/**
 * Initializes the user store.
 */
async function init() {
    // Dummy function
}

const users : User[] = [];

/**
 * Creates a user profile.
 * @param user The user to push.
 */
async function createUser(user: User) {
    if(!ajv.validate(mockProfileSchema, user))
        throw new Error("Invalid schema.");

    // Satisfy default condition for 'verified' in user model.
    if(user.verified === undefined)
        user.verified = false;

    // Satisfy date format
    if(!(user.dateJoined instanceof Date))
        throw new Error("Not a date.");

    const userIdx = users.push(user) - 1;
    return users[userIdx];
}

/**
 * Finds a user by username.
 * @param username The username to use.
 */
async function findUserByUName(username: string): Promise<User | null> {
    return users.find(x => x.username === username) ?? null;
}

/**
 * Finds a user by ID.
 * @param id The ID to use.
 * @returns The found credential.
 */
async function findUserById(id: string): Promise<User | null> {
    return users.find(x => x.id === id) ?? null;
}

/**
 * Updates a user profile.
 * @param id The ID of the user to update.
 * @param newUser The new user profile object to use.
 */
async function updateUser(id: string, newUser: UserUpdateOp): Promise<User> {
    const user = await findUserById(id);
    
    if(!user)
        throw new Error("User does not exist.");

    if(newUser.displayName !== undefined)
        user.displayName = newUser.displayName;

    if(newUser.biography !== undefined)
        user.biography = newUser.biography;

    if(newUser.verified !== undefined)
        user.verified = newUser.verified;

    return user;
}

/**
 * Gets the latest profiles/
 * @param op The operation arguments.
 */
async function getLatestProfiles(filter: string, page: number, limit: number) {
    let profiles;

    switch(filter) {
        case "unverified":
            return _mock_paginate(users.filter(x => x.verified === false).sort(_dateComparer), page * limit, limit);
        case "verified":
            return _mock_paginate(users.filter(x => x.verified === true).sort(_dateComparer), page * limit, limit);
        case "latest":
            return _mock_paginate(users.sort(_dateComparer), page * limit, limit);
        default:
            throw new Error("Invalid filter.");
    }
}

/**
 * Updates the user avatar URL.
 * @param url 
 */
async function updateUserAvatar(op: UserAvatarUpdateOp) {
    const user = await findUserById(op.id);

    if(!user)
        throw new Error("User does not exist.");

    user.avatarURL = op.avatarURL;

    return user;
}

/**
 * Updates the user banner URL.
 * @param url 
 */
async function updateUserBanner(op: UserBannerUpdateOp) {
    const user = await findUserById(op.id);

    if(!user)
        throw new Error("User does not exist.");

    user.bannerURL = op.bannerURL;

    return user;
}

export const ProfileStore = {
    init,
    createUser,
    updateUser,
    findUserByUName,
    findUserById,
    getLatestProfiles,
    updateUserAvatar,
    updateUserBanner
}