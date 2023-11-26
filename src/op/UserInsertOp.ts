export interface UserInsertOp {
    id: string;
    username: string;
    biography?: string;
    avatarURL?: string;
    displayName?: string;
}