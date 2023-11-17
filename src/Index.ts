import { configDotenv } from 'dotenv';
import express from 'express';
import { SessionVerifierMiddleware } from '@twit2/std-library';
import { handleMyUser } from './routes/MyUser'; 
import { UserWorker } from './UserWorker';

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
app.get('/@me', handleMyUser);

/**
 * Main entry point for program.
 */
async function main() {
    UserWorker.init(process.env.MQ_URL as string);

    // Listen at the port
    app.listen(port, () => {
        console.log(`User service active at port ${port}`);
    });
}

main();