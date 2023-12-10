export interface UserRetrieveOp {
    id: string;
    displayName?: string | null;
    username: string;
    avatarURL?: string | null;
    bannerURL?: string | null;
    biography?: string | null;
    dateJoined: Date;
    verified: boolean;
    followCount: number;
    followingCount: number;
}