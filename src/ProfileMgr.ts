import { Regexes, User, generateId } from "@twit2/std-library";
import { UserInsertOp } from "./op/UserInsertOp";
import { ProfileStore } from "./ProfileStore";

/**
 * Registers a new user profile.
 * @param op The profile to create.
 */
async function createProfile(op: UserInsertOp): Promise<User> {
    if(op.avatarURL && (!Regexes.url_basic.test(op.avatarURL)))
        throw new Error("Invalid avatar URL.");

    const prevProfile = await ProfileStore.findUserByUName(op.username);

    if(prevProfile)
        throw new Error("User profile already exists for this username!");

    // Create the user.
    const user : User = {
        id: generateId({ workerId: process.pid, procId: process.ppid }),
        username: op.username,
        dateJoined: new Date(),
        avatarURL: op.avatarURL,
        biography: op.biography,
        following: [],
        followers: []
    };

    await ProfileStore.createUser(user);
    return user;
}

/**
 * Retrieves a profile by username.
 * @param username The username to retrieve the profile for.
 */
async function getProfile(username: string) {
    return ProfileStore.findUserByUName(username);
}

export const ProfileMgr = {
    createProfile,
    getProfile
}