const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
    urlId: { type: String, required: true },
    title: { type: String, required: true },
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true },
    uniqueId: { type: String, required: true, unique: true },
    status: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Link", linkSchema);
