const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        const mongoUrl = process.env.MONGO_URI;
        console.log("MongoDB connected");
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

    } catch (error) {
        console.log("Database connection error: "+error);
        process.exit(1);
    }
};
module.exports = connectDB;