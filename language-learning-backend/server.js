const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./db');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/users', require('./routes/userRoutes'));

// Default route
app.get('/', (req, res) => res.send('API is running...'));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
