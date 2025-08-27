const mongoose = require("mongoose");

const userClickSchema = new mongoose.Schema({
    linkId: { type: mongoose.Schema.Types.ObjectId, ref: "Link", required: true },
    userId: { type: String, required: true },
    clicks: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("UserClick", userClickSchema);
