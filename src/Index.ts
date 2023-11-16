import { configDotenv } from 'dotenv';
import express from 'express';

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3201;

app.use(express.json());

// Routes
// ------------------------------------------------

/**
 * Main entry point for program.
 */
async function main() {
    // Listen at the port
    app.listen(port, () => {
        console.log(`User service active at port ${port}`);
    });
}

main()