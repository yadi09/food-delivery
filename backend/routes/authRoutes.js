import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { createUser, getUserByEmail } from "../models/userModel.js";

const router = express.Router();

// Register a new user
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Invalid email"),
        body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { name, email, password } = req.body;

        try {
            console.log("hashedPassword....");

            let user = await getUserByEmail(email);
            if (user) return res.status(400).json({ message: "User already exists" });


            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await createUser(name, email, hashedPassword);

            const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

// Login User
router.post(
    "/login",
    [
        body("email").isEmail().withMessage("Invalid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;

        try {
            let user = await getUserByEmail(email);
            if (!user) return res.status(400).json({ message: "Invalid credentials" });

            console.log("email & password:", email, password);
            console.log("User Datas...:", user);
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

export default router;
