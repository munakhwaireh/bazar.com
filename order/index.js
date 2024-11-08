const express = require('express');
const axios = require('axios');
const fs = require('fs').promises; // Using promises for fs
const app = express();
const PORT = 3003;
const path = require('path');
app.use(express.json());

// Function to log purchases in orders.csv

const logOrder = async (book) => {
  const newOrder = {
    id: book.id,
    title: book.title,
    timestamp: new Date().toISOString(),
  };

  const csvLine = `${newOrder.id},${newOrder.title},${newOrder.timestamp}\n`;
  try {
    await fs.appendFile('/order/order.csv', csvLine);
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

      res.json({ message:`Purchased: ${book.title}`, status: "Success" });
    } else {
      res.json({ message: "Out of stock", status: "Failed" });
    }
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
});


app.post('/updatePrice/:id', async (req, res) => {
	
  const itemId = parseInt(req.params.id);
  const { price } = req.body;
  try {
	  
	  
	//  await axios.post('http://catalog:3002/reload');
    // Fetch book details from the catalog
    const catalogResponse = await axios.get(`http://catalog:3002/info/${itemId}`);
    const book = catalogResponse.data;

   
	   
	   // if (book) { // Check if the book was found
      await updateP(itemId, price); // Call to update the price

      res.json({ message: `Updated price for:${book.title} `, status: "Success" });
  //  } else {
    //  res.status(404).json({ message: "Book not found", status: "Failed" }); // Handle case where book isn't found
   // }
    
  } catch (error) {
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
});



app.post('/updateQuantity/:id', async (req, res) => {
	
  const itemId = parseInt(req.params.id);
  const { quantity } = req.body;
  try {
	  
	  
	//  await axios.post('http://catalog:3002/reload');
    // Fetch book details from the catalog
    const catalogResponse = await axios.get(`http://catalog:3002/info/${itemId}`);
    const book = catalogResponse.data;

   
	   
	   // if (book) { // Check if the book was found
      await updateQ(itemId, quantity); // Call to update the price

      res.json({ message: `Updated quantity for:${book.title} `, status: "Success" });
  //  } else {
    //  res.status(404).json({ message: "Book not found", status: "Failed" }); // Handle case where book isn't found
   // }
    
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

const updateP = async (itemId,price) => {
  try {
    const data = await fs.readFile('/catalog/catalog.csv', 'utf8'); // Change to /catalog
    const rows = data.split('\n');
    const header = rows[0];
    const books = rows.slice(1).map(row => row.split(','));

    const updatedBooks = books.map(book => {
      if (parseInt(book[0]) === itemId ) {
      //  book[3] = price; 
		
		book[3] = parseFloat(price).toFixed(2);
      }
      return book;
    });

    const updatedData = [header, ...updatedBooks.map(row => row.join(','))].join('\n');
    await fs.writeFile('/catalog/catalog.csv', updatedData); // Change to /catalog
    console.log("Catalog CSV file updated.");
	//await loadCatalog();
	
  } catch (err) {
    console.error("Error updating catalog:", err);
  }
};


const updateQ = async (itemId,quantity) => {
  try {
    const data = await fs.readFile('/catalog/catalog.csv', 'utf8'); // Change to /catalog
    const rows = data.split('\n');
    const header = rows[0];
    const books = rows.slice(1).map(row => row.split(','));

    const updatedBooks = books.map(book => {
      if (parseInt(book[0]) === itemId ) {
      //  book[3] = price; 
		
		book[4] = parseInt(quantity);
      }
      return book;
    });

    const updatedData = [header, ...updatedBooks.map(row => row.join(','))].join('\n');
    await fs.writeFile('/catalog/catalog.csv', updatedData); // Change to /catalog
    console.log("Catalog CSV file updated.");
	//await loadCatalog();
	
  } catch (err) {
    console.error("Error updating catalog:", err);
  }
};





app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));
