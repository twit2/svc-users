import './RelationMgr.test';

jest.mock('../profile/ProfileStore', ()=>({
    ...jest.requireActual('../profile/ProfileStore'),
    ProfileStore: require('../profile/ProfileStore.mock').ProfileStore
}));

jest.mock('./RelationStore', ()=>({
    ...jest.requireActual('./RelationStore'),
    RelationStore: require('./RelationStore.mock').RelationStore
}));