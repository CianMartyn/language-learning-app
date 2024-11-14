// Import dependencies
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db'); // MongoDB connection file

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse incoming JSON requests

// Connect to MongoDB
connectDB();

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));

// Define a default route
app.get('/', (req, res) => res.send('API is running'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
