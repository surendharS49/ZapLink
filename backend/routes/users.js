const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const User = require("../models/user");
const createid = require("../utils/createid");
const auth = require("../utils/auth");

// Helper function for input validation
function validateRegisterInput({ firstName, lastName, username, email, phone, password }) {
    if (!firstName || !lastName || !username || !email || !phone || !password) {
        return "All fields except bio are required";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Invalid email format";
    if (!/^\d{8,15}$/.test(phone)) return "Phone number must be 8-15 digits";
    if (password.length < 6) return "Password must be at least 6 characters";
    return null;
}

// Register
router.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, username, email, phone, password, bio } = req.body;

        const validationError = validateRegisterInput({ firstName, lastName, username, email, phone, password });
        if (validationError) return res.status(400).json({ error: validationError });

        const userId = "ZAP-" + await createid();
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            userId,
            firstName,
            lastName,
            username,
            email,
            phone,
            bio: bio || "",
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ id: user._id, userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
            token
        });

    } catch (err) {
        console.error("Register Error:", err);
        if (err.code === 11000) {
            return res.status(400).json({ error: "Email or username already exists" });
        }
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: "Incorrect password" });

        const token = jwt.sign({ id: user._id, userId: user.userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
            token
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Get Profile
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId }).select("-password");
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ user });
    } catch (err) {
        console.error("Get Profile Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Update Profile
router.put("/me", auth, async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }
        updates.updatedAt = Date.now();

        const user = await User.findOneAndUpdate(
            { userId: req.user.userId },
            updates,
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Delete Profile
router.delete("/me", auth, async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ userId: req.user.userId });
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({
            message: "User deleted successfully",
            user: {
                userId: user.userId,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        console.error("Delete Profile Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

module.exports = router;
