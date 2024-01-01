import mongoose from "mongoose";
import { UserModel } from "./models/UserModel";
import { User } from '@twit2/std-library'
import { UserUpdateOp } from "./op/UserUpdateOp";
import { UserAvatarUpdateOp } from "./op/UserAvatarUpdateOp";
import { UserBannerUpdateOp } from "./op/UserBannerUpdateOp";

/**
 * Initializes the user store.
 */
/* istanbul ignore next */
async function init() {
    if(process.env.DB_URL == null)
        throw new Error("[profile] No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        console.log(`[profile] Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`[profile] Connected to database.`);
    } catch(e) {
        console.error("[profile] Cannot connect to database server.");
        return;
    }

    // Init models
    await UserModel.init();
}

/**
 * Creates a user profile.
 * @param user The user to push.
 */
async function createUser(user: User) {
    await new UserModel(user).save();
}

/**
 * Finds a user by username.
 * @param username The username to use.
 */
async function findUserByUName(username: string): Promise<User | null> {
    return await UserModel.findOne({ username }).exec();
}

/**
 * Finds a user by ID.
 * @param id The ID to use.
 * @returns The found credential.
 */
async function findUserById(id: string): Promise<User | null> {
    return await UserModel.findOne({ id }).exec();
}

/**
 * Updates a user profile.
 * @param id The ID of the user to update.
 * @param newUser The new user profile object to use.
 */
async function updateUser(id: string, newUser: UserUpdateOp): Promise<User> {
    const user = await UserModel.findOne({ id });
    
    if(!user)
        throw new Error("User does not exist.");

    if(newUser.displayName !== undefined)
        user.displayName = newUser.displayName;

    if(newUser.biography !== undefined)
        user.biography = newUser.biography;

    if(newUser.verified !== undefined)
        user.verified = newUser.verified;
    
    await user.save();
    return user.toJSON();
}

/**
 * Gets the latest profiles/
 * @param op The operation arguments.
 */
async function getLatestProfiles(filter: string, page: number, limit: number) {
    switch(filter) {
        case "unverified":
            return await UserModel.find({ verified: false }).sort({ dateJoined: -1 }).skip(page * limit).limit(limit);
        case "verified":
            return await UserModel.find({ verified: true }).sort({ dateJoined: -1 }).skip(page * limit).limit(limit);
        case "latest":
            return await UserModel.find().sort({ dateJoined: -1 }).skip(page * limit).limit(limit);
        default:
            throw new Error("Invalid filter.");
    }
}

/**
 * Updates the user avatar URL.
 * @param url 
 */
async function updateUserAvatar(op: UserAvatarUpdateOp) {
    const user = await UserModel.findOne({ id: op.id });

    if(!user)
        throw new Error("User does not exist.");

    user.avatarURL = op.avatarURL;

    await user.save();
    return user.toJSON();
}

/**
 * Updates the user banner URL.
 * @param url 
 */
async function updateUserBanner(op: UserBannerUpdateOp) {
    const user = await UserModel.findOne({ id: op.id });

    if(!user)
        throw new Error("User does not exist.");

    user.bannerURL = op.bannerURL;

    await user.save();
    return user.toJSON();
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