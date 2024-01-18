import { RPCServer } from "@twit2/std-library/dist/comm/rpc/RPCServer";
import { RelationMgr } from "../svc/relations/RelationMgr";

/**
 * Initializes the user profile RPC server.
 * @param server The RPC server to initialize. 
 */
function init(server: RPCServer) {
    server.defineProcedure({
        name: 'get-following',
        callback: async (uid: string, page: number) => {
            return await RelationMgr.getFollowing(page, uid);
        }
    });

    server.defineProcedure({
        name: 'get-following-stats',
        callback: async (uid: string) => {
            return await RelationMgr.getRelationStats(uid);
        }
    });
}

export const RelationRPC = {
    init
}