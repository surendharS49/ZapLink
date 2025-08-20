const express = require("express");
const router = express.Router();
const Link = require("../models/link");
const createid = require("../utils/createid");

router.post("/create", async (req, res) => {
    try {

        const url = req.body.url;
        const id = "URI-"+await createid();
        const userId = req.body.userId;
        const shortUrl = `http://zaplink/${id}`;
        const link = new Link({ urlId: id, originalUrl: url, shortUrl, userId});
        await link.save();
        res.json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const link = await Link.findById(req.params.id);
        res.json(link);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

