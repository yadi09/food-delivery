import pool from "../db.js";

// Create a new user
export const createUser = async (name, email, hashedPassword) => {
    try {
        const result = await pool.query(
            `INSERT INTO users (name, email, password) 
             VALUES ($1, $2, $3) 
             RETURNING id, name, email`,
            [name, email, hashedPassword]
        );
        return result.rows[0]; // Returns only necessary fields
    } catch (error) {
        console.error("Error creating user:", error.message);
        throw new Error("Database error while creating user.");
    }
};

// Get user by email (excluding sensitive data like password)
export const getUserByEmail = async (email) => {
    try {
        console.log("Fetching user by email...");
        const result = await pool.query(
            "SELECT id, name, email, password FROM users WHERE email = $1",
            [email]
        );
        console.log("After fetching user by email...")
        return result.rows[0] || null; // Return null if no user found
    } catch (error) {
        console.error("Error fetching user:", error.message);
        throw new Error("Database error while fetching user.");
    }
};
