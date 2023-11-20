import { MsgQueue } from '@twit2/std-library';
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
    await server.init('user-service');
    ProfileRPC.init(server);
}

export const UserWorker = {
    init
}