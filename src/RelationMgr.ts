import Ajv from "ajv";
import { APIError, APIResponseCodes, Limits, PaginatedAPIData } from "@twit2/std-library";
import { RelationManipulationOp } from "./op/RelationManipulationOp";
import { Relation, RelationType } from "./types/Relation";
import { ProfileMgr } from "./ProfileMgr";
import { RelationStore } from "./RelationStore";

const ajv = new Ajv();
const PAGE_SIZE = 10;

const relationManipulationSchema = {
    type: "object",
    properties: {
        source: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max },
        dest: { type: "string", minLength: Limits.general.hard.min, maxLength: Limits.general.hard.max }
    },
    required: ["source", "dest"],
    additionalProperties: false
}

/**
 * Checks whether the source and destination users are real users.
 */
async function manipulationPreCheck(op: RelationManipulationOp) {
    if(!ajv.validate(relationManipulationSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    if(!await ProfileMgr.getProfileById(op.source))
        throw new Error("Source profile does not exist.");

    if(!await ProfileMgr.getProfileById(op.dest))
        throw new Error("Destination profile does not exist.");
}

/**
 * Follows a user.
 */
async function follow(op: RelationManipulationOp): Promise<Relation> {
    await manipulationPreCheck(op);

    if(await isBlocked({ source: op.dest, dest: op.source }))
        throw new Error("Cannot follow user which blocked you.");

    if(await isBlocked(op))
        throw new Error("Cannot follow blocked user.");

    if(await hasFollowed(op))
        throw new Error("Source user has already followed destination user!");

    return await RelationStore.createRelation({
        source: op.source,
        dest: op.dest,
        type: RelationType.FOLLOW
    });
}

/**
 * Unfollows a user.
 */
async function unfollow(op: RelationManipulationOp): Promise<void> {
    await manipulationPreCheck(op);

    if(!await hasFollowed(op))
        throw new Error("User is not followed.");

    await RelationStore.deleteRelation({ ...op, ...{ type: RelationType.FOLLOW } });
}

/**
 * Blocks a user.
 */
async function block(op: RelationManipulationOp): Promise<Relation> {
    await manipulationPreCheck(op);

    // Remove follow relation for both users when block is in effect
    if(await isBlocked(op))
        throw new Error("User is already blocked.");

    if(await hasFollowed(op))
        await unfollow(op);

    if(await hasFollowed({ source: op.dest, dest: op.source }))
        await unfollow({ source: op.dest, dest: op.source });

    return await RelationStore.createRelation({ ...op, ...{ type: RelationType.BLOCK } });
}

/**
 * Checks whether User A (source) has blocked User B (dest).
 */
async function isBlocked(op: RelationManipulationOp): Promise<boolean> {
    await manipulationPreCheck(op);

    return await RelationStore.findRelation({ source: op.source, dest: op.dest, type: RelationType.BLOCK }) != null;
}

/**
 * Checks whether User A (source) has followed User B (dest).
 */
async function hasFollowed(op: RelationManipulationOp): Promise<boolean> {
    await manipulationPreCheck(op);

    return await RelationStore.findRelation({ source: op.source, dest: op.dest, type: RelationType.FOLLOW }) != null;
}

/**
 * Gets relations for the specified user.
 * @param userId The ID of the user to get relations for.
 */
async function getRelations(page: number, userId: string): Promise<PaginatedAPIData<Relation>> {
    return { pageSize: PAGE_SIZE, currentPage: page, data: await RelationStore.getRelations(page, PAGE_SIZE, userId) };
}

/**
 * Gets followers for the specified user.
 * @param userId The ID of the user to get followers for.
 */
async function getFollowers(page: number, userId: string): Promise<PaginatedAPIData<Relation>> {
    return { pageSize: PAGE_SIZE, currentPage: page, data: await RelationStore.getFollowers(page, PAGE_SIZE, userId) };
}

/**
 * Gets follow list for the specified user.
 * @param userId The ID of the user to get followers for.
 */
async function getFollowing(page: number, userId: string): Promise<PaginatedAPIData<Relation>> {
    return { pageSize: PAGE_SIZE, currentPage: page, data: await RelationStore.getFollowing(page, PAGE_SIZE, userId) };
}

/**
 * Gets blocked users list for the specified user.
 * @param userId The ID of the user to get followers for.
 */
async function getBlockedUsers(page: number, userId: string): Promise<PaginatedAPIData<Relation>> {
    return { pageSize: PAGE_SIZE, currentPage: page, data: await RelationStore.getBlockedUsers(page, PAGE_SIZE, userId) };
}

export const RelationMgr = {
    follow,
    unfollow,
    hasFollowed,
    block,
    isBlocked,
    getRelations,
    getFollowers,
    getFollowing,
    getBlockedUsers
}