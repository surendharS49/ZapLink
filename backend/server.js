const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();

// Allowed frontend URLs
// const allowedOrigins = [
//   'http://127.0.0.1:5501',
//   'https://zap-link-sepia.vercel.app'
// ];

// CORS middleware
app.use(cors({
  origin: "*",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running ✅');
});


// Routes
const users = require("./routes/users");
const url = require("./routes/url");
const redirect = require("./routes/redirect");
const connectDB = require("./src/database");

// Health check

// API routes
app.use("/api/users", users);
app.use("/api/url", url);
app.use("/rd", redirect);

const PORT = process.env.PORT || 3000;

// Connect DB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ DB connection failed:', err);
    process.exit(1);
  });
