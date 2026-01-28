const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 4000;

// Middleware – convert request body to JSON
app.use(express.json());

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
