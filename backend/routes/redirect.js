const express = require("express");
const router = express.Router();
const Link = require("../models/link");
const UserClick = require("../models/userClick");
const auth = require("../utils/auth");

// Redirect & increment clicks
router.get("/:uniqueId",async (req, res, next) => {
    const staticPaths = ["healthz", "api", "favicon.ico"]; // add more if needed

    if (staticPaths.includes(req.params.uniqueId)) {
        return next(); // skip redirect for these paths
    }
    try {
        console.log("uniqueId: ", req.params.uniqueId);
        const link = await Link.findOne({ uniqueId: req.params.uniqueId });
        if (!link) return res.status(404).json({ error: "Link not found" });

        // Increment clicks using link._id
        const userClick = await UserClick.findOneAndUpdate(
            { linkId: link._id },
            { $inc: { clicks: 1 } },
            { upsert: true, new: true }
        );

        console.log(`Redirecting link ${link.urlId} for user ${userClick.userId}. Total clicks: ${userClick.clicks}`);

        res.redirect(link.originalUrl);
    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;