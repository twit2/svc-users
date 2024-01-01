import mongoose from "mongoose";
import { RelationModel } from "./models/RelationModel";
import { Relation, RelationType } from "./types/Relation";
import { PaginatedAPIData } from "@twit2/std-library";

/**
 * Initializes the relation store.
 */
/* istanbul ignore next */
async function init() {
    if(process.env.DB_URL == null)
        throw new Error("[relation] No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        console.log(`[relation] Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`[relation] Connected to database.`);
    } catch(e) {
        console.error("[relation] Cannot connect to database server.");
        return;
    }

    // Init models
    await RelationModel.init();
}

/**
 * Creates a new relation.
 * @param op The relation to create.
 */
async function createRelation(op: Relation): Promise<Relation> {
    return (await new RelationModel(op).save()).toJSON();
}

/**
 * Gets an existing relation.
 */
async function findRelation(op: Relation): Promise<Relation | null> {
    const rel = (await RelationModel.findOne(op));
    
    if(!rel)
        return null;

    return rel.toJSON();
}

/**
 * Deletes a relation.
 */
async function deleteRelation(op: Relation): Promise<void> {
    const rel = await findRelation(op);

    if(!rel)
        throw new Error("Relation does not exist.");

    await RelationModel.deleteOne(op);
}

/**
 * Gets all relations for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get relations for.
 */
async function getRelations(page: number, limit: number, userId: string): Promise<Relation[]> {
    return (await RelationModel.find({ source: userId }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Gets all followers for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get followers for.
 */
async function getFollowers(page: number, limit: number, userId: string): Promise<Relation[]> {
    return (await RelationModel.find({ dest: userId, type: RelationType.FOLLOW }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Gets all following users for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get following users for.
 */
async function getFollowing(page: number, limit: number, userId: string): Promise<Relation[]> {
    return (await RelationModel.find({ source: userId, type: RelationType.FOLLOW }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Gets all blocked users for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get blocked users for.
 */
async function getBlockedUsers(page: number, limit: number, userId: string): Promise<Relation[]> {
    return (await RelationModel.find({ source: userId, type: RelationType.BLOCK }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

export const RelationStore = {
    findRelation,
    createRelation,
    deleteRelation,
    getRelations,
    getFollowers,
    getFollowing,
    getBlockedUsers,
    init
}