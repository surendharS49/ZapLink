const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'https://zap-link-sepia.vercel.app',
    // Add any other frontend URLs you're using
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors());

// Explicitly handle preflight requests
app.options('*', cors(corsOptions));

// Add this middleware to handle additional CORS headers manually
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', true);
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running ✅');
});

// Routes
const users = require("./routes/users");
const url = require("./routes/url");
const redirect = require("./routes/redirect");
const connectDB = require("./src/database");

// API routes
app.use("/api/url", url);
app.use("/api/users", users);
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