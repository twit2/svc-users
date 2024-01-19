import mongoose from 'mongoose'
import { Limits, VersionedDoc } from '@twit2/std-library';
import { Relation } from '../types/Relation';

export const RelationModel = mongoose.model<Relation & VersionedDoc>('relation', new mongoose.Schema({
    source: {
        type: String,
        required: true,
        min: Limits.general.hard.min,
        max: Limits.general.hard.max
    },
    dest: {
        type: String,
        required: true,
        min: Limits.general.hard.min,
        max: Limits.general.hard.max
    },
    type: {
        type: Number,
        required: true
    },
    schemaVer: {
        type: Number,
        required: true,
        default: 2
    }
}));