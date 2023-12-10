import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { UserModel } from "./models/UserModel";
import { UserInsertOp } from "./op/UserInsertOp";
import { Limits, User } from "@twit2/std-library";
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

    // Test to ensure the model rejects invalid user profiles
    test('profile: reject invalid profiles', async() => {
        let profiles : User[] = [];

        let profileOps : UserInsertOp[] = [
            {
                id: "12345",
                username: "testing",
                avatarURL: "invalid  not a valid url://",
            },
            {
                id: "123451111",
                username: "",
                biography: (-1) as unknown as string,
                avatarURL: "http://test.com/test.png"
            },
            {
                id: "1234523222",
                username: "",
                biography: "".repeat(Limits.userProfile.biography.max * 2),
                avatarURL: "http://test.com/test.png"
            }
        ];

        for(let op of profileOps) {
            try {
                profiles.push(await ProfileMgr.createProfile(op));
            } catch(e) { /* do nothing */ }
        }

        for(let c of profiles)
            expect(c).toBeUndefined();
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

    test('profile: update biography to some text', async() => {
        const newProfile = await ProfileMgr.updateProfile({
            id: "123458889",
            biography: "Testing 12345"
        });

        expect(newProfile.biography).toBe("Testing 12345");
    });

    test('profile: reject overflown biography update request', async() => {
        try {
            await ProfileMgr.updateProfile({
                id: "123458889",
                biography: "Testing 12345".repeat(200)
            });
        } catch(e) {
            return;
        }

        throw new Error("Biography was updated - this shouldn't happen!");
    });

    test('profile: get latest users', async() => {
        const profiles = await ProfileMgr.getLatestProfiles({ page: 0 });
        expect(profiles.data).not.toBeUndefined();
        expect(profiles.data?.length).toBe(2); // In this test, only 2 successful profiles were ever made
    })

    test('profile: verify user', async() => {
        const profile = await ProfileMgr.createProfile({
            username: "test",
            id: "test"
        });

        const updatedProfile = await ProfileMgr.setVerified({targetUser: profile.id, verified: true});
        expect(updatedProfile.verified).toBe(true);
    })

    test('profile: unverify user', async() => {
        const profile = await ProfileMgr.getProfileByName('test');
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const updatedProfile = await ProfileMgr.setVerified({targetUser: (profile as User).id, verified: false});
        expect(updatedProfile.verified).toBe(false);
    })

    test('profile: add avatar URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const newProfile = await ProfileMgr.updateAvatar({ id: profile.id, avatarURL: "/avatar/12345.png" });
        expect(newProfile.avatarURL).toBe("/avatar/12345.png");
    });

    test('profile: add banner URL', async() => {
        const profile = await ProfileMgr.getProfileByName('test') as User;
        expect(profile).not.toBeUndefined();
        expect(profile).not.toBeNull();

        const newProfile = await ProfileMgr.updateBanner({ id: profile.id, bannerURL: "/banners/12345.png" });
        expect(newProfile.bannerURL).toBe("/banners/12345.png");
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
