import { MsgQueue, SessionVerifierMiddleware } from '@twit2/std-library';

/**
 * Initializes the user worker.
 * @param url The worker url.
 */
async function init(url: string) {
    const mq = new MsgQueue.providers.RabbitMQQueueProvider();
    await mq.setup(url);

    // Create RPC client
    const rpcc = new MsgQueue.rpc.RPCClient(mq);
    await rpcc.init('t2a-session-verif');
    SessionVerifierMiddleware.init(rpcc);
}

export const UserWorker = {
    init
}