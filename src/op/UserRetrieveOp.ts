export interface UserRetrieveOp {
    id: string;
    displayName?: string | null;
    username: string;
    avatarURL?: string | null;
    biography?: string | null;
    dateJoined: Date;
    followCount: number;
    followingCount: number;
}