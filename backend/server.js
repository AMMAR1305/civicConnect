const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");   // ✅ ADD THIS
const path = require("path");

dotenv.config();
console.log(process.env.MONGO_URI)
const app = express();
const PORT = process.env.PORT || 4000;

// ✅ CORS middleware (IMPORTANT – must be before routes)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://civic-connect-liard-xi.vercel.app",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".vercel.app")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// Middleware – convert request body to JSON with increased size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with enhanced debugging
console.log("🔄 Attempting to connect to MongoDB...");
console.log("🔗 Connection URI:", process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:[^@]+@/, ':****@') : 'NOT FOUND');

mongoose
  .connect(process.env.MONGO_URI, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log("📍 Connected to database:", mongoose.connection.db.databaseName);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Failed");
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      codeName: err.codeName
    });
    
    // Suggest solutions based on error type
    if (err.message.includes('ECONNREFUSED') || err.message.includes('querySrv')) {
      console.log("\n💡 Possible solutions:");
      console.log("1. Check if your cluster is running in MongoDB Atlas");
      console.log("2. Verify network access (IP whitelist) in Atlas");
      console.log("3. Get a fresh connection string from Atlas");
      console.log("4. Check if cluster URL is correct in .env file");
    }
  });

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/complaints", require("./routes/complaintRoutes"));

app.get("/api", (req, res) => {
  res.send("Hello World! Backend is working ");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
