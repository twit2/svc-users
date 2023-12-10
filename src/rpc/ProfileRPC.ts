import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { UserInsertOp } from "../op/UserInsertOp";
import { ProfileMgr } from "../ProfileMgr";
import { UserAvatarUpdateOp } from "../op/UserAvatarUpdateOp";
import { UserBannerUpdateOp } from "../op/UserBannerUpdateOp";

/**
 * Initializes the user profile RPC server.
 * @param server The RPC server to initialize. 
 */
function init(server: RPCServer) {
    server.defineProcedure({
        name: 'create-profile',
        callback: async (op: UserInsertOp) => {
            return await ProfileMgr.createProfile(op);
        }
    });

    server.defineProcedure({
        name: 'update-avatar',
        callback: async (op: UserAvatarUpdateOp) => {
            return await ProfileMgr.updateAvatar(op);
        }
    });

    server.defineProcedure({
        name: 'update-banner',
        callback: async (op: UserBannerUpdateOp) => {
            return await ProfileMgr.updateBanner(op);
        }
    });

    server.defineProcedure({
        name: 'get-profile-by-id',
        callback: async (id: string) => {
            return await ProfileMgr.getProfileById(id);
        }
    });
}

export const ProfileRPC = {
    init
}