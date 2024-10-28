const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3001;

// Route to search books by topic
app.get('/search/:topic', async (req, res) => {
  const topic = req.params.topic;
  try {
    // Forward the search request to the catalog service
    const response = await axios.get(`http://catalog:3002/search/${topic}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching search results", error: error.message });
  }
});

// Route to get book information by item ID
app.get('/info/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    // Forward the info request to the catalog service
    const response = await axios.get(`http://catalog:3002/info/${itemId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching item info", error: error.message });
  }
});

// Route to make a purchase by item ID
app.post('/purchase/:id', async (req, res) => {
  const itemId = req.params.id;
  try {
    // Forward the purchase request to the order service
    const response = await axios.post(`http://order:3003/purchase/${itemId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
});

// Route to update book price by item ID
app.put('/update/:id', async (req, res) => {
  const itemId = req.params.id;
  const { price } = req.body; // Assuming the new price is sent in the request body
  try {
    // Forward the update request to the catalog service
    const response = await axios.put(`http://catalog:3002/update/${itemId}`, { price });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error updating book price", error: error.message });
  }
});

app.listen(PORT, () => console.log(`Frontend service running on port ${PORT}`));
