import mongoose from "mongoose";
import { UserModel } from "./models/UserModel";
import { User } from '@twit2/std-library'

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

export const ProfileStore = {
    init,
    createUser,
    findUserByUName,
    findUserById
}