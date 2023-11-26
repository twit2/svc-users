import mongoose from "mongoose";
import { UserModel } from "./models/UserModel";
import { User } from '@twit2/std-library'
import { UserUpdateOp } from "./op/UserUpdateOp";

/**
 * Initializes the user store.
 */
async function init() {
    if(process.env.DB_URL == null)
        throw new Error("No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        console.log(`Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`Connected to database.`);
    } catch(e) {
        console.error("Cannot connect to database server.");
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

    if(newUser.avatarURL)
        user.avatarURL = newUser.avatarURL;

    if(newUser.displayName)
        user.displayName = newUser.displayName;

    if(newUser.biography)
        user.biography = newUser.biography;
    
    await user.save();
    return user.toJSON();
}

export const ProfileStore = {
    init,
    createUser,
    updateUser,
    findUserByUName,
    findUserById
}