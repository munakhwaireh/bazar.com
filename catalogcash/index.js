const express = require('express');

const axios = require('axios');
//const fs = require('fs').promises;
const fs = require('fs');
const csv = require('csv-parser');
const app = express();
const PORT = 3004;
const path = require('path');
app.use(express.json());

let catalog = [];

// Function to load the catalog data from the CSV file
const loadCatalog = () => {
  catalog = [];
  
  fs.createReadStream('catalogcash.csv')
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

app.post('/add_book', (req, res) => {
  const { id, title, topic, price, quantity } = req.body; // Destructure book data from request body

  // Ensure all required fields are present
  if (!id || !title || !topic || !price ) {
    return res.status(400).json({ message: "Missing book fields: id, title, topic, price, quantity are required" });
  }

  // Create new book object
  const newBook = {
    id: parseInt(id),
    title,
    topic,
    price: parseFloat(price),
    quantity: parseInt(quantity),
  };

  // Insert the new book at the start of the catalog
  catalog.unshift(newBook);

  // Ensure the catalog has a maximum of 2 books
  if (catalog.length > 2) {
    catalog.pop(); // Remove the last book if the catalog exceeds 2 books
  }

  // Respond with the updated catalog
  res.json({ message: "Book added successfully", catalog });
});

app.post('/remove_my_book/:id', (req, res) => {
  const id = parseInt(req.params.id); // Parse the `id` from the URL parameter

  // Find the index of the book in the catalog array
  const bookIndex = catalog.findIndex((book) => book.id === id);

  // If the book is not found, return a 404 response
  if (bookIndex === -1) {
    return res.status(404).json({ message: "Book not found" });
  }
  else{
	   catalog.splice(bookIndex, 1);
  }

  // Remove the book from the catalog
 

  // Respond with a success message and the updated catalog
  res.json({ message: "Book removed successfully", catalog });
});

// Endpoint to search for books by topic
app.get('/search/:topic', (req, res) => {
  const topic = req.params.topic;
  const result = catalog.filter((book) => book.topic === topic);
 
 const size = result.length;
res.json(result);
   
 
 
});

// Endpoint to get book information by ID
app.get('/info/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const book = catalog.find((item) => item.id === id);
  
 
  
    if (book) {
    res.json({
        id: book.id,
        title: book.title,
        topic: book.topic,
        price: book.price,
        quantity: book.quantity,
        message: "Book from small cash"
    });
} else {
    res.json({
        message: "Book not found in small cash"
    });
}
  
  
  //res.json(book || { message: "Book not found in big memory" });
});
/*
app.post('/add_new_book',  (req, res) => {
    const { book } = req.body; // Destructuring book from req.body

    // Ensure all required fields are present
    if (!book.id || !book.title || !book.topic || !book.price || !book.quantity) {
        return res.status(400).json({ message: "Missing book fields: id, title, topic, price, quantity are required" });
    }

    // Format the book data as a CSV row
    const newCsvRow = `${book.id},${book.title},${book.topic},${book.price},${book.quantity}`;

    // Path to the catalogcash.csv file in the same directory
    //const filePath = path.join(__dirname, 'catalogcash.csv');

    try {
        // Read the current contents of the file
        const data = await fs.readFile('catalogcash.csv', 'utf8');

        // Split file contents into an array of lines
        const lines = data.split('\n');

        // Insert the new row at the second line
        lines.splice(1, 0, newCsvRow);

        // Join the lines back into a single string
        const updatedData = lines.join('\n');

        // Write the updated contents back to catalogcash.csv
        await fs.writeFile('catalogcash.csv', updatedData);

        // Successfully added
        res.json({ message: "Book inserted on the second line of catalogcash.csv successfully" });
    } catch (err) {
        console.error("Error processing catalogcash.csv:", err);
        return res.status(500).json({ message: "Error processing catalogcash.csv", error: err.message });
    }
});
// Start the server
*/

app.listen(PORT, () => console.log(`Catalogcash service running on port ${PORT}`));
