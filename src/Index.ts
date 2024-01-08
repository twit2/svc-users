import { configDotenv } from 'dotenv';
import express from 'express';
import { AdminVeriferMiddleware, ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { handleGetUser } from './routes/profile/UserRetrieve'; 
import { UserWorker } from './UserWorker';
import { ProfileStore } from './svc/profile/ProfileStore';
import { handleUpdateUser } from './routes/profile/UserUpdate';
import { handleGetLatestUsers } from './routes/profile/UserGetLatest';
import { handleVerifyUser } from './routes/profile/UserVerify';
import { RelationStore } from './svc/relations/RelationStore';
import { handleGetRelationList } from './routes/relations/RelationGetFollowedList';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT ?? 3201;

app.use(express.json());

// Use session verifier
app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------
app.get('/@me', handleGetUser);
app.patch('/@me', handleUpdateUser);
app.get('/relations/:relation/:username/:page', handleGetRelationList);
app.get('/:filter/:page', handleGetLatestUsers);
app.get('/:id', handleGetUser);

app.use(AdminVeriferMiddleware.handle);
app.post('/:id/verify', handleVerifyUser);

app.use(ErrorHandlingMiddleware.handle);

/**
 * Main entry point for program.
 */
async function main() {
    await ProfileStore.init();
    await RelationStore.init();
    await UserWorker.init(process.env.MQ_URL as string);

    // Listen at the port
    app.listen(port, () => {
        console.log(`User service active at port ${port}`);
    });
}

main();