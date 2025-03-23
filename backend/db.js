import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: 10, // Limit connections
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test the database connection on startup
const testDbConnection = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ PostgreSQL Database Connected Successfully");
        client.release(); // Release the client back to the pool
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
        process.exit(1); // Exit process if connection fails
    }
};

testDbConnection(); // Ensure DB connection before queries

// Close pool on app shutdown
process.on("SIGINT", async () => {
    await pool.end();
    console.log("🛑 PostgreSQL Pool Closed");
    process.exit(0);
});

export default pool;
