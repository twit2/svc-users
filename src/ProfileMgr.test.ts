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

        expect(user.avatarURL).toBeUndefined();
        expect(user.biography).toBeUndefined();
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

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
