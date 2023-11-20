import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { UserInsertOp } from "../op/UserInsertOp";
import { ProfileMgr } from "../ProfileMgr";

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
        name: 'get-profile-by-id',
        callback: async (id: string) => {
            return await ProfileMgr.getProfileById(id);
        }
    });
}

export const ProfileRPC = {
    init
}