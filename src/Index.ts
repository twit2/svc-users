import { configDotenv } from 'dotenv';
import express from 'express';
import { ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { handleGetUser } from './routes/UserRetrieve'; 
import { UserWorker } from './UserWorker';
import { ProfileStore } from './ProfileStore';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3201;

app.use(express.json());

// Use session verifier
app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------
app.get('/@me', handleGetUser);
app.get('/:id', handleGetUser);

app.use(ErrorHandlingMiddleware.handle);

/**
 * Main entry point for program.
 */
async function main() {
    await ProfileStore.init();
    await UserWorker.init(process.env.MQ_URL as string);

    // Listen at the port
    app.listen(port, () => {
        console.log(`User service active at port ${port}`);
    });
}

main();