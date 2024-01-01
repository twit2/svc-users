export enum RelationType {
    /**
     * Follow relation - used to specify a follower.
     */
    FOLLOW = 0,

    /**
     * Blocked user relation - used to specify that a user is blocked.
     */
    BLOCK = 1
};

/**
 * Represents a user relation.
 * 
 * `source` defines the user for which this relation belongs.
 * `dest` defines the target user for which the relation applies.
 * 
 * For example, if User A is following User B, the `source` would be User A, the `dest` would be User B, and the type would be `0`.
 */
export interface Relation {
    type: RelationType;
    source: string;
    dest: string;
}