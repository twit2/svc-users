import mongoose, { Schema } from 'mongoose'
import { Limits, VersionedDoc, User } from '@twit2/std-library';

export const UserModel = mongoose.model<User & VersionedDoc>('user', new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: false,
        min: Limits.userProfile.displayName.min,
        max: Limits.userProfile.displayName.max
    },
    username: {
        type: String,
        required: true,
        min: Limits.uam.username.min,
        max: Limits.uam.username.max
    },
    avatarURL: {
        type: String,
        required: false,
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
        required: false,
        min: Limits.userProfile.biography.min,
        max: Limits.userProfile.biography.max,
    },
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    dateJoined: {
        type: Date,
        required: true
    },
    followers: {
        type: [],
        required: true
    },
    following: {
        type: [],
        required: true
    },
    schemaVer: {
        type: Number,
        required: true,
        default: 2
    }
}));