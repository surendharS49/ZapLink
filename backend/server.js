// server.js
const express = require("express"); 
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./src/database");

dotenv.config();
const app = express();

app.use(express.json());

const corsOptions = {
    origin: "https://zap-link-sepia.vercel.app",
    methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
    allowedHeaders: ['Content-Type','Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

const users = require("./routes/users");
const url = require("./routes/url");
const redirect = require("./routes/redirect");

app.get('/healthz', (req, res) => {
    console.log("Health check route hit");
    res.send('OK');
});

// Health check route — must be first
app.get('/', (req, res) => {
    console.log("✅ Health check route hit");
    res.send('API running ✅');
});

// API routes
app.use("/api/users", users);
app.use("/api/url", url);

// Redirect route (dynamic) — last to avoid conflicts
app.use("/rd", redirect);

const PORT = process.env.PORT || 3000;

// Connect DB then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ DB connection failed:', err);
    process.exit(1); 
  });
