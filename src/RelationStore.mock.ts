import { Relation, RelationType } from "./types/Relation";

const relations : Relation[] = [];

function _mock_paginate<T>(arr: any[], start: number, limit: number): T[] {
    const items : T[] = [];
    let max = start + limit;
    
    if(max > arr.length)
        max = arr.length;

    for(let x = start; x < max; x++)
        items.push(arr[x]);

    return items;
}

/**
 * Initializes the relation store.
 */
async function init() {
    // Dummy
}

/**
 * Creates a new relation.
 * @param op The relation to create.
 */
async function createRelation(op: Relation): Promise<Relation> {
    // Simulate model conditions
    if(typeof op.dest !== 'string')
        throw new Error("DTO: Invalid dest");

    if(typeof op.source !== 'string')
        throw new Error("DTO: Invalid source");

    if(typeof op.type !== 'number')
        throw new Error("DTO: Invalid number");

    const relIdx = relations.push(op) - 1;
    return relations[relIdx];
}

/**
 * Gets an existing relation.
 */
async function findRelation(op: Relation): Promise<Relation | null> {
    for(let rel of relations)
        if((rel.dest === op.dest) && (rel.source === op.source) && (rel.type === op.type))
            return rel;

    return null;
}

/**
 * Deletes a relation.
 */
async function deleteRelation(op: Relation): Promise<void> {
    const rel = await findRelation(op);

    if(!rel)
        throw new Error("Relation does not exist.");

    const relIdx = relations.findIndex(x => x === rel);
    relations.splice(relIdx, 1);
}

/**
 * Gets all relations for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get relations for.
 */
async function getRelations(page: number, limit: number, userId: string): Promise<Relation[]> {
    return _mock_paginate(relations.filter(x => x.source === userId), page * limit, limit);
}

/**
 * Gets all followers for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get followers for.
 */
async function getFollowers(page: number, limit: number, userId: string): Promise<Relation[]> {
    return _mock_paginate(relations.filter(x => (x.dest === userId) && (x.type === RelationType.FOLLOW)), page * limit, limit);
}

/**
 * Gets all following users for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get following users for.
 */
async function getFollowing(page: number, limit: number, userId: string): Promise<Relation[]> {
    return _mock_paginate(relations.filter(x => (x.source === userId) && (x.type === RelationType.FOLLOW)), page * limit, limit);
}

/**
 * Gets all blocked users for the specified user ID.
 * @param page The page number.
 * @param limit The page limit.
 * @param userId The ID of the user to get blocked users for.
 */
async function getBlockedUsers(page: number, limit: number, userId: string): Promise<Relation[]> {
    return _mock_paginate(relations.filter(x => (x.source === userId) && (x.type === RelationType.BLOCK)), page * limit, limit);
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