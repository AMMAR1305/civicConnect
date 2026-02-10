const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");   // ✅ ADD THIS
const path = require("path");

dotenv.config();

const app = express();
const PORT = 4000;

// ✅ CORS middleware (IMPORTANT – must be before routes)
app.use(cors());

// Middleware – convert request body to JSON with increased size limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed", err);
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
