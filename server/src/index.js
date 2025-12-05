require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const tasksRouter = require("./routes/tasks");
const voiceRouter = require("./routes/voice");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// routes
app.use("/api/tasks", tasksRouter);
app.use("/api/voice", voiceRouter);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error", err);
  });
