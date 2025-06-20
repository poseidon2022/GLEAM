
import { app } from "./server";
import dotenv from "dotenv";
import {pool} from "./db"
dotenv.config();

console.log("Environment variables loaded.");
console.log("API_PORT from .env:", process.env.API_PORT);
console.log("DATABASE_URL from .env:", process.env.DATABASE_URL);


async function startServer() {
    const testDBConnection = async () => {
        try {
          await pool.connect();
          console.log("✅ Database connected successfully");
        } catch (error) {
          console.error("❌ Database connection failed:", error);
        }
    };

    console.log("Attempting to start server...");

    const port = process.env.API_PORT || 3000; // Provide a fallback port

    try {

        app.listen(port, () => {
            console.log(`Application running successfully on port ${port}`);
        });
        testDBConnection();
    } catch (error) {

        console.error("Failed to start application:", error);
        process.exit(1); // Exit the process if server fails to start
    }
}

// Call the function to start the server.
startServer();
