const express = require("express");
const router = express.Router();
const Link = require("../models/link");
const UserClick = require("../models/userClick");
const createid = require("../utils/createid");
const createuniqueid = require("../utils/createuniqueid");
const auth = require("../utils/auth");
const env = require("dotenv");
env.config();
const baseUrl = process.env.BASE_URL;

// Create a new short link
router.post("/create", auth, async (req, res) => {
    try {
        const { title, url, customSlug } = req.body;
        const userId = req.user.userId;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }
        
        // Normalize URL
        let formattedUrl = url.startsWith("http") ? url : `http://${url}`;

        // Check if link already exists
        const existingLink = await Link.findOne({ originalUrl: formattedUrl });
        if (existingLink) {
            const existingClick = await UserClick.findOne({ userId, linkId: existingLink._id });
            if (existingClick) {
                return res.status(200).json({
                    message: "Link already exists for this user",
                    link: existingLink,
                    userClick: existingClick
                });
            }
        }

        // Check for custom slug conflict
        if (customSlug) {
            const slugExists = await Link.findOne({ shortUrl: `${baseUrl}/rd/${customSlug}` });
            if (slugExists) {
                return res.status(400).json({ error: "Custom slug already taken" });
            }
        }

        // Create new link
        const id = "URI-" + await createid();
        const uniqueId = await createuniqueid();
        const shortUrl = customSlug
            ? `${baseUrl}/rd/${customSlug}`
            : `${baseUrl}/rd/${uniqueId}`;

        const link = new Link({
            urlId: id,
            title: title ? title : "Untitled",
            originalUrl: formattedUrl,
            shortUrl,
            uniqueId,
            status: "active"
        });
        await link.save();

        const userClick = new UserClick({ linkId: link._id, userId, clicks: 0 });
        await userClick.save();

        res.status(201).json({
            message: "Link created successfully",
            link,
            userClick
        });
    } catch (err) {
        console.error("Create Link Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Get all links for the logged-in user
router.get("/all", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const clicks = await UserClick.find({ userId }).populate("linkId");

        res.json({
            message: "User links fetched successfully",
            links: clicks.map(c => ({
                linkId: c.linkId._id,
                title: c.linkId.title,
                urlId: c.linkId.urlId,
                originalUrl: c.linkId.originalUrl,
                shortUrl: c.linkId.shortUrl,
                uniqueId: c.linkId.uniqueId,
                status: c.linkId.status,
                clicks: c.clicks,
                createdAt: c.linkId.createdAt,
                updatedAt: c.linkId.updatedAt
            }))
        });
    } catch (err) {
        console.error("Get All Links Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Get per-user and total click stats
router.get("/stats/:uniqueId", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const link = await Link.findOne({ uniqueId: req.params.uniqueId });
        if (!link) return res.status(404).json({ error: "Link not found" });

        // User-specific stats
        const userStats = await UserClick.findOne({ linkId: link._id, userId });

        // Global stats (sum across all users)
        const globalStats = await UserClick.aggregate([
            { $match: { linkId: link._id } },
            { $group: { _id: null, total: { $sum: "$clicks" } } }
        ]);

        res.json({
            message: "Click stats fetched successfully",
            linkId: link.urlId,
            userClicks: userStats ? userStats.clicks : 0,
            totalClicks: globalStats.length > 0 ? globalStats[0].total : 0
        });
    } catch (err) {
        console.error("Get Click Stats Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});
router.put("/:uniqueId", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const link = await Link.findOne({ uniqueId: req.params.uniqueId });
        if (!link) return res.status(404).json({ error: "Link not found" });

        const ownership = await UserClick.findOne({ linkId: link._id, userId });
        if (!ownership) return res.status(403).json({ error: "Not authorized to update this link" });

        const updatedLink = await Link.findOneAndUpdate(
            { uniqueId: req.params.uniqueId },
            { $set: { title: req.body.title ? req.body.title : "Untitled", originalUrl: req.body.url } },
            { new: true }
        );

        res.json({
            message: "Link updated successfully",
            link: updatedLink
        });
    } catch (err) {
        console.error("Update Link Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

// Delete a link (and associated clicks) only if owned by user
router.delete("/:uniqueId", auth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const link = await Link.findOne({ uniqueId: req.params.uniqueId });
        if (!link) return res.status(404).json({ error: "Link not found" });

        const ownership = await UserClick.findOne({ linkId: link._id, userId });
        if (!ownership) return res.status(403).json({ error: "Not authorized to delete this link" });

        await Link.deleteOne({ _id: link._id });
        await UserClick.deleteMany({ linkId: link._id });

        res.json({
            message: "Link deleted successfully",
            link
        });
    } catch (err) {
        console.error("Delete Link Error:", err);
        res.status(500).json({ error: err.message || "Internal server error" });
    }
});

module.exports = router;
