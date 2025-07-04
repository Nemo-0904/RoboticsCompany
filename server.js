// backend/server.js



const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve static HTML files like success.html

// Routes
app.use("/api/auth", require("./public/routes/auth"));
app.use("/api/products", require("./public/routes/products"));
app.use("/api/payment", require("./public/routes/payment"));

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
