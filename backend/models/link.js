const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    urlId: {
        type: String,
        required: true,
    },
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Link = mongoose.model("Link", linkSchema);

module.exports = Link;
