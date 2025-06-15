require('dotenv').config(); // Keep this one at the very top

const express = require('express');
const cors = require('cors');

const mongoose = require('mongoose');
const app = express();
const connectDB =require('./config/db');

// Load environment variables (remove the second call)
// dotenv.config();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use("/api/checkout", require("./routes/checkout")); // Moved checkout to be more logical with other APIs
// Suggestion: Prefix /api to payment routes


// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});