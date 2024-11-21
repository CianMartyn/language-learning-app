const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Example API endpoint
app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
