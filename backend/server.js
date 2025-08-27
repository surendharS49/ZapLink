const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "https://zap-link-sepia.vercel.app/", // Replace "*" with your frontend URL in production
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
const users=require("./routes/users");
const url=require("./routes/url");
const redirect=require("./routes/redirect");
const connectDB = require("./src/database");

connectDB().then(() => {
    console.log("Database connected");
}).catch((err) => {
    console.log(err);
    process.exit(1);
});

app.get("/", (req, res) => res.send("OK"));

app.use("/api/users", users);
app.use("/api/url", url);
app.use("/", redirect);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});