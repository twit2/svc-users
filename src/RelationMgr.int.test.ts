import './ProfileMgr.test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { RelationModel } from './models/RelationModel';
import { UserModel } from './models/UserModel';

let mongoServer: MongoMemoryServer;

beforeAll(async()=> {
    // Setup server
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "t2-user-test" });

    // Init models
    await RelationModel.init();
    await UserModel.init();
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongoServer.stop();
});