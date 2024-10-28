const express = require('express');
const axios = require('axios');
const fs = require('fs').promises; // Using promises for fs
const app = express();
const PORT = 3003;
const path = require('path');

// Function to log purchases in orders.csv
const logOrder = async (book) => {
  const newOrder = {
    id: book.id,
    title: book.title,
    timestamp: new Date().toISOString(),
  };

  const csvLine = `${newOrder.id},${newOrder.title},${newOrder.timestamp}\n`;
  try {
    await fs.appendFile('orders.csv', csvLine);
    console.log("Order logged:", newOrder);
  } catch (err) {
    console.error("Error logging order:", err);
  }
};

// Purchase endpoint
app.post('/purchase/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);

  try {
    // Fetch book details from the catalog
    const catalogResponse = await axios.get(`http://catalog:3002/info/${itemId}`);
    const book = catalogResponse.data;

    if (book && book.quantity > 0) {
      // Update the catalog CSV to reduce quantity
      await updateCatalog(itemId);

      // Log the order in orders.csv
      await logOrder(book);

      res.json({ message: `Purchased: ${book.title}`, status: "Success" });
    } else {
      res.json({ message: "Out of stock", status: "Failed" });
    }
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
});

// Function to update the catalog CSV file by reducing quantity
// Function to update the catalog CSV file by reducing quantity
const updateCatalog = async (itemId) => {
  try {
    const data = await fs.readFile('/catalog/catalog.csv', 'utf8'); // Change to /catalog
    const rows = data.split('\n');
    const header = rows[0];
    const books = rows.slice(1).map(row => row.split(','));

    const updatedBooks = books.map(book => {
      if (parseInt(book[0]) === itemId && parseInt(book[4]) > 0) {
        book[4] = parseInt(book[4]) - 1;  // Decrease quantity by 1
      }
      return book;
    });

    const updatedData = [header, ...updatedBooks.map(row => row.join(','))].join('\n');
    await fs.writeFile('/catalog/catalog.csv', updatedData); // Change to /catalog
    console.log("Catalog CSV file updated.");
  } catch (err) {
    console.error("Error updating catalog:", err);
  }
};

app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));
