// src/database.js
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URI;
        await mongoose.connect(mongoUrl); 
        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ Database connection error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;
