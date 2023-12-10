const mongoose = require('mongoose');
const { Limits } = require('@twit2/std-library');
const { configDotenv } = require('dotenv');

const oldSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        min: Limits.userProfile.displayName.min,
        max: Limits.userProfile.displayName.max
    },
    username: {
        type: String,
        min: Limits.uam.username.min,
        max: Limits.uam.username.max
    },
    avatarURL: {
        type: String,
        min: Limits.general.hard.min,
        max: Limits.general.hard.max
    },
    biography: {
        type: String,
        min: Limits.userProfile.biography.min,
        max: Limits.userProfile.biography.max,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    dateJoined: {
        type: Date,
    },
    followers: {
        type: [],
    },
    following: {
        type: [],
    },
    schemaVer: {
        type: Number,
        default: 1
    }
});

const OldUserModel = mongoose.model('userOld2', oldSchema, 'users');

const newSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        min: Limits.userProfile.displayName.min,
        max: Limits.userProfile.displayName.max
    },
    username: {
        type: String,
        min: Limits.uam.username.min,
        max: Limits.uam.username.max
    },
    avatarURL: {
        type: String,
        min: Limits.general.hard.min,
        max: Limits.general.hard.max
    },
    bannerURL: {
        type: String,
        required: false,
        min: Limits.general.hard.min,
        max: Limits.general.hard.max
    },
    biography: {
        type: String,
        min: Limits.userProfile.biography.min,
        max: Limits.userProfile.biography.max,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    dateJoined: {
        type: Date,
    },
    followers: {
        type: [],
    },
    following: {
        type: [],
    },
    schemaVer: {
        type: Number,
        default: 2
    }
});

const NewUserModel = mongoose.model('userNew2', newSchema, 'users');

configDotenv();

async function migrate() {
    if(process.env.DB_URL == null)
        throw new Error("No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
    } catch(e) {
        console.error("Cannot connect to database server.");
        return;
    }

    const oldData = await OldUserModel.find().exec();

    for(let doc of oldData) {
        const docJson = doc.toJSON();

        if(docJson.schemaVer >= 2)
            continue; // Don't update updated documents

        console.log(`Migrating ${doc.id}...`);
        
        const newDoc = new NewUserModel({
            ...docJson,
            ...{
                bannerURL: '',
                schemaVer: 2
            }
        });

        await NewUserModel.findByIdAndUpdate(doc._id, newDoc, { new: true, upsert: true });
    }

    await mongoose.disconnect();
}

module.exports = migrate;