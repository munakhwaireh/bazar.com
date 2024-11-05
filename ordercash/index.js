const express = require('express');
const axios = require('axios');
const fs = require('fs').promises; // Using promises for fs
const app = express();
const PORT = 3005
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

app.post('/add_new_book', async (req, res) => {
    const { id, title, topic, price, quantity,message } = req.body; // Destructuring directly from req.body

    // Ensure all required fields are present
   

    // Format the book data as a CSV row
    const newCsvRow = `${id},${title},${topic},${price},${quantity}`;

    try {
        // Read the current contents of the file
        const data = await fs.readFile('/catalogcash/catalogcash.csv', 'utf8');

        // Split file contents into an array of lines
        const lines = data.split('\n');

        // Insert the new row at the second line
        lines.splice(1, 0, newCsvRow);

        // Keep only the first three lines
        if (lines.length > 3) {
            lines.splice(3); // Remove lines from the 4th onwards
        }

        // Join the lines back into a single string
        const updatedData = lines.join('\n');

        // Write the updated contents back to catalogcash.csv
        await fs.writeFile('/catalogcash/catalogcash.csv', updatedData);

              const response3 = await axios.post(`http://catalogcash:3004/add_book`, { id, title, topic, price, quantity,message });

        // Successfully added
        res.json({ message: "Book inserted successfully, keeping only the first three entries." });
    } catch (err) {
        console.error("Error processing catalogcash.csv:", err);
        return res.status(500).json({ message: "Error processing catalogcash.csv", error: err.message });
    }





});


app.post('/remove_book/:id', async (req, res) => {
 // const { id } = req.body; // Expecting the book id to be passed in the request body
  
 const id = parseInt(req.params.id);
  if (!id) {
    return res.status(400).json({ message: "Book id is required" });
  }

  try {
    // Read the current contents of catalogcash.csv
    const data = await fs.readFile('/catalogcash/catalogcash.csv', 'utf8');

    // Split the file content into lines and filter out the header
    const lines = data.split('\n');
    const header = lines[0]; // Keep the header row

    // Filter the books, keeping only those that do not match the given id
    const updatedLines = [header, ...lines.slice(1).filter(line => {
      const [bookId] = line.split(',');
      return parseInt(bookId) !== parseInt(id);
    })];

    // Check if a book was actually removed
    if (lines.length === updatedLines.length) {
      //return res.status(404).json({ message: "Book not found in catalogcash.csv" });
	  
	  res.json({ message: "Book removed successfully from catalogcash.csv" });
    }

    // Join the filtered lines back into a single CSV string
    const updatedData = updatedLines.join('\n');

    // Write the updated content back to catalogcash.csv
    await fs.writeFile('/catalogcash/catalogcash.csv', updatedData);

    // Notify any other relevant services, if necessary (e.g., if you have cache updates)/////////////////////////////////////
    //await axios.post(`http://catalogcash:3004/remove_book`, { id });
          const response341v = await axios.post(`http://catalogcash:3004/remove_my_book/${id}`);
    // Respond to the client indicating success
    res.json({ message: "Book removed successfully from catalogcash.csv" });
  } catch (err) {
    console.error("Error processing catalogcash.csv:", err);
    res.status(500).json({ message: "Error processing catalogcash.csv", error: err.message });
  }
});





app.listen(PORT, () => console.log(`Ordercash service running on port ${PORT}`));
