const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3002;

let catalog = [];

// Function to load the catalog data from the CSV file
const loadCatalog = () => {
  catalog = [];
  fs.createReadStream('catalog.csv')
    .pipe(csv())
    .on('data', (row) => {
      catalog.push({
        id: parseInt(row.id),
        title: row.title,
        topic: row.topic,
        price: parseFloat(row.price),
        quantity: parseInt(row.quantity),
      });
    })
    .on('end', () => {
      console.log('Catalog loaded from CSV file.');
    });
};

// Load the catalog initially at startup
loadCatalog();

// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
  const topic = req.params.topic;
  const result = catalog.filter((book) => book.topic === topic);
  res.json(result);
});

// Endpoint to get book information by ID
app.get('/info/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = catalog.find((item) => item.id === id);
  res.json(book || { message: "Book not found" });
});

// Function to update the catalog CSV file by reducing quantity
const updateCatalog = async (itemId) => {
  try {
    const data = await fs.readFile('catalog.csv', 'utf8');
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
    await fs.writeFile('catalog.csv', updatedData);
    console.log("Catalog CSV file updated.");

    loadCatalog(); // Reload catalog after updating it
  } catch (err) {
    console.error("Error updating catalog:", err);
  }
};

// Route to update book price by item ID
app.put('/update/:id', async (req, res) => {
  const itemId = parseInt(req.params.id);
  const { price } = req.body; // New price from the request body

  try {
    const data = await fs.readFile('catalog.csv', 'utf8');
    const rows = data.split('\n');
    const header = rows[0];
    const books = rows.slice(1).map(row => row.split(','));

    // Update the book price if found
    const updatedBooks = books.map(book => {
      if (parseInt(book[0]) === itemId) {
        book[3] = parseFloat(price).toFixed(2);  // Update price column (3rd index)
      }
      return book;
    });

    const updatedData = [header, ...updatedBooks.map(row => row.join(','))].join('\n');
    await fs.writeFile('catalog.csv', updatedData);
    console.log("Catalog CSV file updated with new price.");

    // Reload the catalog to ensure data is updated
    reloadCatalog(); // Call your function to reload the catalog

    res.json({ message: "Price updated successfully" });
  } catch (err) {
    console.error("Error updating catalog:", err);
    res.status(500).json({ message: "Error updating book price", error: err.message });
  }
});


// Start the server
app.listen(PORT, () => console.log(`Catalog service running on port ${PORT}`));
