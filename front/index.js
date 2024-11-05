const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3001;
app.use(express.json());
// Route to search books by topic
app.get('/search/:topic', async (req, res) => {
  const topic = req.params.topic;
  try {
    // Forward the search request to the catalog service
    //const response = await axios.get(`http://catalog:3002/search/${topic}`);

    // If data is not empty, send it back
   
    const responseA = await axios.get(`http://catalogcash:3004/search/${topic}`);
    if (responseA.data.length === 2) {
		 res.json({ message: "we found 2 books in small cash", data: responseA.data });
		
	}else{
		
		const response = await axios.get(`http://catalog:3002/search/${topic}`);


		if (Array.isArray(response.data) && response.data.length === 0) {
		return res.json({ message: "No books found for the specified topic no mem and no cash", data: [] });
		
		}else   {
			
			 const [book1, book2] = response.data;
				 
              const response33 = await axios.post(`http://ordercash:3005/add_new_book`, {
        id: book1.id,
        title: book1.title,
        topic: book1.topic,
        price: book1.price,
        quantity: book1.quantity,
       
      });

      const response44 = await axios.post(`http://ordercash:3005/add_new_book`,{
        id: book2.id,
        title: book2.title,
        topic: book2.topic,
        price: book2.price,
        quantity: book2.quantity,
      
      });
			if (responseA.data.length === 0) {
				
				
				res.json({ message: "we found 2 books in big memory", data: response.data });
			}
			else {
				
				
				
				res.json({ message: "we found books in mem and cash", data: response.data });
			}
		
		
	      }
	
		
		
		
    }
   
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
	const response1=await axios.get(`http://catalogcash:3004/info/${itemId}`);
	const msg1=response1.data.message;
	const specificMessage1 = 'Book from small cash';
	
	 if (msg1 === specificMessage1) {
             res.json(response1.data);
        } else {
              
			  
			  const response2 = await axios.get(`http://catalog:3002/info/${itemId}`);
			  
			  if(response2.data.message==="Book from big memory"){
              const response3 = await axios.post(`http://ordercash:3005/add_new_book`, response2.data);
              res.json(response2.data);}
			  else {
				  
				   res.json({
        message: "Book not found in big memory and not found in small cash"
    });
			  }
	  
    
	
		}
	

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
	
	
	  const responselllds = await axios.post(`http://ordercash:3005/remove_book/${itemId}`);
	  

	
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error processing purchase", error: error.message });
  }
});

// Route to update book price by item ID
app.post('/updatePrice/:id', async (req, res) => {
  const itemId = req.params.id;
  const { price } = req.body; // Assuming the new price is sent in the request body
  try {
    // Forward the update request to the catalog service
    const response = await axios.post(`http://order:3003/updatePrice/${itemId}`, { price });
	
	  const responselll = await axios.post(`http://ordercash:3005/remove_book/${itemId}`);
	  

	
	
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error updating book price", error: error.message });
  }
});


app.post('/updateQuantity/:id', async (req, res) => {
  const itemId = req.params.id;
  const { quantity } = req.body; // Assuming the new price is sent in the request body
  try {
    // Forward the update request to the catalog service
    const response = await axios.post(`http://order:3003/updateQuantity/${itemId}`, { quantity });
	
	  const responselll = await axios.post(`http://ordercash:3005/remove_book/${itemId}`);
	  

	
	
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error updating book price", error: error.message });
  }
});



app.listen(PORT, () => console.log(`Frontend service running on port ${PORT}`));
