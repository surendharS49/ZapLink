const express = require("express");
const router = express.Router();
const User = require("../models/user");
const createid = require("../utils/createid");

router.post("/register", async (req, res) => {
    try {
        const userId ="ZAP-"+await createid();
        console.log(userId);
        const { username, email, password } = req.body;
        const user = new User({ userId, username, email, password });
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }
        if (user.password !== password) {
            return res.status(400).json({ error: "Incorrect password" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/me", async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/me", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.id);
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/me", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch("/me", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;