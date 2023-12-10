import { AdminVeriferMiddleware, MsgQueue, SessionVerifierMiddleware } from '@twit2/std-library';
import { ProfileRPC } from './rpc/ProfileRPC';

/**
 * Initializes the user worker.
 * @param url The worker url.
 */
async function init(url: string) {
    const mq = new MsgQueue.providers.RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup RPC server for user profile stuff
    const server = new MsgQueue.rpc.RPCServer(mq);
    await server.init('t2-user-service');
    ProfileRPC.init(server);

    // Setup rpc client
    const rpcc = new MsgQueue.rpc.RPCClient(mq);
    await rpcc.init('t2-auth-service');
    await SessionVerifierMiddleware.init(rpcc);
    await AdminVeriferMiddleware.init(rpcc);
}

export const UserWorker = {
    init
}