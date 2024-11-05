const express = require('express');

const axios = require('axios');
//const fs = require('fs').promises;
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3002;
const path = require('path');
app.use(express.json());

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
    })
    .on('error', (error) => {
      console.error("Error loading catalog:", error);
    });
};
// Load the catalog initially at startup
loadCatalog();

const updateCatalogEntry = (id, newData) => {
  const index = catalog.findIndex(book => book.id === id);
  
  if (index !== -1) {
    // Update the existing entry with new data
    catalog[index] = { ...catalog[index], ...newData };
    console.log(`Book with ID ${id} updated successfully.`);
  } else {
    console.log(`Book with ID ${id} not found.`);
  }
};

// Example usage of the update function
const newData = {
  title: "Updated Title",
  price: 25.99,
  quantity: 10
};
// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
  const topic = req.params.topic;
  const result = catalog.filter((book) => book.topic === topic);
  res.json(result);
});

// Endpoint to get book information by ID
app.get('/info/:id',(req, res) => {
	
  const id = parseInt(req.params.id);
  const book = catalog.find((item) => item.id === id);
 
  
  if (book) {
    res.json({
        id: book.id,
        title: book.title,
        topic: book.topic,
        price: book.price,
        quantity: book.quantity,
        message: "Book from big memory"
    });
} else {
    res.json({
        message: "Book not found in big memory"
    });
}
  
 
 //updateCatalogEntry(1, newData); 
  
  
  //res.json(book || { message: "Book not found in big memory" });
});

// Function to update the catalog CSV file by reducing quantity

// Start the server
app.listen(PORT, () => console.log(`Catalog service running on port ${PORT}`));
