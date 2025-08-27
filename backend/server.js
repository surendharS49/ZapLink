const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const app = express();

app.use(express.json());
const corsOptions = {
    origin: ['http://localhost:3000', 'https://zap-link-sepia.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  };

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

const users=require("./routes/users");
const url=require("./routes/url");
const redirect=require("./routes/redirect");
const connectDB = require("./src/database");

app.get('/', (req, res) => {
    console.log("Health check route hit");
    res.send('API running ✅');
  });


app.use("/api/users", users);
app.use("/api/url", url);
app.use("/rd", redirect);


const PORT = process.env.PORT || 3000;

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
