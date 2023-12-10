import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from "./models/UserModel";
import { TestingUtils, User } from "@twit2/std-library";
import { ProfileMgr } from "./ProfileMgr";

describe('user profile manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-user-test" });

        // Init models
        await UserModel.init();
    });

    // Check if we can make a basic user profile
    test('profile: create basic profile', async() => {
        let user = await ProfileMgr.createProfile({
            id: "1234567",
            username: "hello"
        });

        expect(user.avatarURL).toBe('');
        expect(user.biography).toBe('');
        expect(user.displayName).toBe('');
        expect(user.username).toBe("hello");
        expect(user.id).not.toBeUndefined();
    });

    test('profile: should not create profile with same username', async ()=>{
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.createProfile({
                id: "1234567",
                username: "hello"
            });
        }, "User was made.");
    });

    test('profile: id lookup should succeed', async() => {
        let user = await ProfileMgr.getProfileById("1234567");
        expect(user).not.toBeUndefined();
    });

    test('profile: should reject invalid id', async() =>{
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.createProfile({ id: "", username: "username123" })
        }, "id was not rejected");
    });

    test('profile: should reject empty username', async() =>{
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.createProfile({ id: "12345", username: "" })
        }, "empty username was not rejected");
    });

    test('profile: should reject non-alphanumeric username', async() =>{
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.createProfile({ id: "12345", username: "😳😳😳" })
        }, "username was not rejected");
    });

    test('profile: reject invalid avatar URL on profile creation', async() =>{
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.createProfile({ id: "12345777", username: "test6645", avatarURL: 'urltest asdf][324' })
        }, "avatarURL was not rejected");
    });

    test('profile: create extended profile (bio + avatarUrl)', async() =>{
        let user = await ProfileMgr.createProfile({
            id: "123458889",
            username: "hello2",
            biography: "User profile text",
            avatarURL: "https://example.com/image.png"
        });

        expect(user.avatarURL).not.toBeUndefined();
        expect(user.biography).toBe("User profile text");
    });

    test('profile: update should fail without valid user', async()=>{
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.updateProfile({ id: "oops" })}, "Update succeeded");
    });

    test('profile: update biography to some text', async() => {
        const newProfile = await ProfileMgr.updateProfile({
            id: "123458889",
            biography: "Testing 12345"
        });

        expect(newProfile.biography).toBe("Testing 12345");
    });

    test('profile: update display name to some text', async() => {
        const newProfile = await ProfileMgr.updateProfile({
            id: "123458889",
            displayName: "Testing 12345"
        });

        expect(newProfile.displayName).toBe("Testing 12345");
    });

    test('profile: reject overflown biography update request', async() => {
        await TestingUtils.mustFailAsync(async()=>{
            await ProfileMgr.updateProfile({
                id: "123458889",
                biography: "Testing 12345".repeat(200)
            });
        }, "biography was updated");
    });

    test('profile: get latest users should reject invalid filter', async() => {
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.getLatestProfiles({ filter: "invalid" as any, page: 0 })}, "Filter was valid");
    });

    test('profile: get latest users', async() => {
        const profiles = await ProfileMgr.getLatestProfiles({ filter: "latest", page: 0 });
        expect(profiles.data).not.toBeUndefined();
        expect(profiles.data?.length).toBe(2); // In this test, only 2 successful profiles were ever made
    });

    test('profile: get latest verified users', async() => {
        const profiles = await ProfileMgr.getLatestProfiles({ filter: "verified", page: 0 });
        expect(profiles.data).not.toBeUndefined();
        expect(profiles.data?.length).toBe(0); // No verified profiles were ever made.
    });

    test('profile: get latest unverified users', async() => {
        const profiles = await ProfileMgr.getLatestProfiles({ filter: "unverified", page: 0 });
        expect(profiles.data).not.toBeUndefined();
        expect(profiles.data?.length).toBe(2); // All profiles are unverified as of now
    })

    test('profile: verify user', async() => {
        const profile = await ProfileMgr.createProfile({
            username: "test",
            id: "test"
        });

        const updatedProfile = await ProfileMgr.setVerified({targetUser: profile.id, verified: true});
        expect(updatedProfile.verified).toBe(true);
    });

    test('profile: unverify user', async() => {
        const profile = await ProfileMgr.getProfileByName('test');
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const updatedProfile = await ProfileMgr.setVerified({targetUser: (profile as User).id, verified: false});
        expect(updatedProfile.verified).toBe(false);
    });

    test('profile: add avatar URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const newProfile = await ProfileMgr.updateAvatar({ id: profile.id, avatarURL: "/avatars/12345.png" });
        expect(newProfile.avatarURL).toBe("/avatars/12345.png");
    });

    test('profile: reject invalid avatar URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.updateAvatar({ id: profile.id, avatarURL: "invalidparts"})}, "invalid avatarURL was accepted");
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.updateAvatar({ id: profile.id, avatarURL: "/repository/invalid"})}, "avatarURL with invalid repository was accepted");
    });

    test('profile: add banner URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const newProfile = await ProfileMgr.updateBanner({ id: profile.id, bannerURL: "/banners/12345.png" });
        expect(newProfile.bannerURL).toBe("/banners/12345.png");
    });

    test('profile: reject invalid banner URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.updateBanner({ id: profile.id, bannerURL: "invalidparts"})}, "invalid bannerURL was accepted");
        await TestingUtils.mustFailAsync(async()=>{await ProfileMgr.updateBanner({ id: profile.id, bannerURL: "/repository/invalid"})}, "bannerURL with invalid repository was accepted");
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
