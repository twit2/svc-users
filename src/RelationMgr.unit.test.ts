import './RelationMgr.test';

jest.mock('./ProfileStore', ()=>({
    ...jest.requireActual('./ProfileStore'),
    ProfileStore: require('./ProfileStore.mock').ProfileStore
}));

jest.mock('./RelationStore', ()=>({
    ...jest.requireActual('./RelationStore'),
    RelationStore: require('./RelationStore.mock').RelationStore
}));