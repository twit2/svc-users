import './ProfileMgr.test';

jest.mock('./ProfileStore', ()=>({
    ...jest.requireActual('./ProfileStore'),
    ProfileStore: require('./ProfileStore.mock').ProfileStore
}));