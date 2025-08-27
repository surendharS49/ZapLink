// server.js
const express = require("express"); 
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/database");

dotenv.config();
const app = express();

// Parse JSON
app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: "https://zap-link-sepia.vercel.app", // your frontend
    methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type','Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight

// Routes
const users = require("./routes/users");
const url = require("./routes/url");
const redirect = require("./routes/redirect");

// Health check routes
app.get('/healthz', (req, res) => {
    console.log("Health check route hit");
    res.send('OK');
});

app.get('/', (req, res) => {
    console.log("✅ Root health check route hit");
    res.send('API running ✅');
});

// API routes
app.use("/api/users", users);
app.use("/api/url", url);

// Redirect route (dynamic) — last to avoid conflicts
app.use("/rd", redirect);

// Start server after DB connection
const PORT = proces
