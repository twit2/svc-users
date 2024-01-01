import { TestingUtils, User, generateId } from "@twit2/std-library";
import { ProfileMgr } from "./ProfileMgr";
import { RelationMgr } from "./RelationMgr";
import { RelationType } from "./types/Relation";

describe('relation manager tests', ()=>{
    let profileA: User;
    let profileB: User;

    test('user A should follow existing user B', async()=>{
        profileA = await ProfileMgr.createProfile({
            username: "userA",
            id: generateId({ workerId: 0, procId: 1 })
        });

        profileB = await ProfileMgr.createProfile({
            username: "userB",
            id: generateId({ workerId: 0, procId: 1 })
        });  

        const dto = { source: profileA.id, dest: profileB.id };
        const relation = await RelationMgr.follow(dto);
        expect(relation.source).toBe(profileA.id);
        expect(relation.dest).toBe(profileB.id);
        expect(relation.type).toBe(RelationType.FOLLOW);
        expect(await RelationMgr.hasFollowed(dto)).toBe(true);
    });

    test('user A should not follow existing user B again', async()=>{
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: profileA.id, dest: profileB.id })}, "User was followed");
    });

    test('user A should not follow non existent user B', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: profileA.id, dest: "abc" })}, "User was followed");
    });

    test('nonexistent user A should not follow user B', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: "abc", dest: profileB.id })}, "n/a user a followed user B");
    });

    test('nonexistent user A should not follow non existent user B', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: "abc", dest: "defg" })}, "n/a user a followed n/a user B");
    });

    test('user A should not unfollow non existent user B', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.unfollow({ source: profileA.id, dest: "abc" })}, "user A unfollowed null user B");
    });

    test('user A should not unfollow non existent user B', async() => {
        const dto = { source: profileA.id, dest: profileB.id };
        await RelationMgr.unfollow(dto);
        expect(await RelationMgr.hasFollowed(dto)).toBe(false);
    });

    test('user A should not unfollow unfollowed user B', async () => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.unfollow({ source: profileA.id, dest: profileB.id })}, "user A unfollowed unfollowed user B");
    });

    test('user A should block abusive user B', async ()=> {
        const dto = { source: profileA.id, dest: profileB.id };
        const rel = await RelationMgr.block(dto);
        expect(rel.type).toBe(RelationType.BLOCK);
        expect(await RelationMgr.isBlocked(dto)).toBe(true);
        expect(await RelationMgr.hasFollowed(dto)).toBe(false);
        expect(await RelationMgr.hasFollowed({ source: dto.dest, dest: dto.source })).toBe(false);
    });

    test('user A should not block abusive user B again', async ()=> {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.block({ source: profileA.id, dest: profileB.id })}, "user A blocked user B again");
    });

    test('user A should not be able to follow blocked user B', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: profileA.id, dest: profileB.id })}, "user A followed blocked user B");
    });

    test('blocked user B should be prevented from following victim A', async() => {
        await TestingUtils.mustFailAsync(async()=>{await RelationMgr.follow({ source: profileB.id, dest: profileA.id })}, "blocked user B followed victim A");
    });

    test('user A relations list should not be empty at this point', async() => {
        const relations = await RelationMgr.getRelations(0, profileA.id)
        expect(relations.data).not.toBeUndefined();
        expect(relations.data?.length).toBe(1);
    });

    test('user A blocked users list should not be empty at this point', async() => {
        const relations = await RelationMgr.getBlockedUsers(0, profileA.id)
        expect(relations.data).not.toBeUndefined();
        expect(relations.data?.length).toBe(1);
    });

    test('user A blocked followers list should be empty at this point', async() => {
        const relations = await RelationMgr.getFollowers(0, profileA.id)
        expect(relations.data).not.toBeUndefined();
        expect(relations.data?.length).toBe(0);
    });

    test('user A blocked following list should be empty at this point', async() => {
        const relations = await RelationMgr.getFollowing(0, profileA.id)
        expect(relations.data).not.toBeUndefined();
        expect(relations.data?.length).toBe(0);
    });
});