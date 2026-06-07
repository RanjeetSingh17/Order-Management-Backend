const express = require('express');
const cors = require('cors');
const pool=require("./db")
// const { subscribeToTopic } = require('./firebaseAdmin');
const {verifyToken} =require('./middleware/middleware')
const {
    createBeverage, deleteBeverageById, deleteSnackById,
    deleteMealById, getAllBeverages, getBeverageById,
    getMealsById, getAllMeals, createMeal,
    createSnacks, getSnacksById, getAllSnacks , createMenuItem,
    getAllMenuItems,
    orderCompleted,
    getMenuItemById,
    deleteMenuItemById,
    getRawMaterials,updateInventory,addInventoryItem , updateMenuItemAvailability , updateMenuItemSpecial
    ,getBottom10MenuItems,gettop10menuItems,createComboItem,getCombos,deleteCombos
    ,getOrdersToBeServed , getContactUsMessages
} = require('./queries');
const clients={};
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.use(cors({
    origin: ['https://order-management-frontend-two.vercel.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// const router = require('rou')

app.get('/contact-us', async (req, res) => {
    try {
        const messages = await getContactUsMessages();
        console.log("Contact us response in the backend is ",messages);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/signup', async (req, res) => {
    const { email, password, name, role } = req.body;
    
    try {
      // Check if user already exists
      const userCheck = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (userCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const result = await pool.query(
        'INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role',
        [email, hashedPassword, name, role]
      );
      
      res.status(201).json({
        success: true,
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  });

  app.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
  
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
  
      const user = result.rows[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword || user.role !== role) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed', details: error.message });
    }
  });
  
app.put('/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, name, selling_price } = req.body;

        if (quantity === undefined || !name || selling_price === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const query = `
            UPDATE menu_items 
            SET quantity = $1,
                name = $2,
                selling_price = $3
            WHERE id = $4 
            RETURNING *
        `;

        const result = await pool.query(query, [quantity, name, selling_price, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating item:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add this new PUT endpoint for availability
app.put('/menu-items/:id/availability', async (req, res) => {
    console.log('Received availability update request:', {
        id: req.params.id,
        body: req.body
    });
    
    try {
        const { id } = req.params;
        const { availability } = req.body;
        res.setHeader('Content-Type', 'application/json');
        
        if (typeof availability !== 'boolean') {
            return res.status(400).json({ 
                error: 'Availability must be a boolean value' 
            });
        }

        const updatedItem = await updateMenuItemAvailability(id, availability);
        console.log('Updated item:', updatedItem);
        
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error in availability update:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.put('/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {quantity,name,selling_price} = req.body;
        if(!quantity || !name || !selling_price  || !Number.isInteger(Number(quantity)) ||
        !Number.isInteger(Number(selling_price))){
            return res.status(400).json({
                error:"Bad request, missing or invalid item details"
            })
        }
        const query = `
            UPDATE menu_items 
            SET quantity = $1,
            name=$2,
            selling_price=$3
            WHERE id = $4 
            RETURNING *
        `;
        
        const result = await pool.query(query, [quantity,name,selling_price, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating item:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// app.post('/subscribe-to-topic', async (req, res) => {
//     try {
//         const { token } = req.body;

//         if (!token) {
//             return res.status(400).json({ error: 'FCM token is required' });
//         }

//         await subscribeToTopic(token);
//         res.json({ success: true, message: 'Successfully subscribed to notifications' });
//     } catch (error) {
//         console.error('Error subscribing to topic:', error);
//         res.status(500).json({ error: 'Failed to subscribe to topic', details: error.message });
//     }
// });

app.get('/', (req, res) => {
    res.send('Hello Everyone this is the backend server for the project');
});

app.post('/beverages', async (req, res) => {
    try {
        const newBeverage = await createBeverage(req.body);
        res.status(201).json(newBeverage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/meals', async (req, res) => {
    try {
        const newMeal = await createMeal(req.body);
        res.status(201).json(newMeal);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server error' });
    }
});

app.post('/snacks', async (req, res) => {
    try {
        const newSnack = await createSnacks(req.body);
        res.status(201).json(newSnack);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
});

app.get('/beverages', async (req, res) => {
    try {
        const beverages = await getAllBeverages();
        res.json(beverages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/snacks', async (req, res) => {
    try {
        const snacks = await getAllSnacks();
        res.json(snacks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server error' });
    }
});

app.get('/meals', async (req, res) => {
    try {
        const meals = await getAllMeals();
        res.json(meals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/beverages/:id', async (req, res) => {
    try {
        const beverage = await getBeverageById(req.params.id);
        if (beverage) {
            res.json(beverage);
        } else {
            res.status(404).json({ error: 'Beverage not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/snacks/:id', async (req, res) => {
    try {
        const snack = await getSnacksById(req.params.id);
        if (snack) {
            res.json(snack);
        } else {
            res.status(404).json({ error: 'Snack not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/meals/:id', async (req, res) => {
    try {
        const meal = await getMealsById(req.params.id);
        if (meal) {
            res.json(meal);
        } else {
            res.status(404).json({ error: 'Meal not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/beverages/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Received delete request for beverage ID:', id);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid beverage ID' });
        }

        const deletedBeverage = await deleteBeverageById(id);

        if (!deletedBeverage) {
            return res.status(404).json({ error: 'Beverage not found' });
        }

        res.json({
            message: 'Beverage deleted successfully',
            id: deletedBeverage.id
        });

    } catch (error) {
        console.error('Server error while deleting beverage:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.delete('/meals/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Received delete request for meal ID:', id);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid meal ID' });
        }

        const deletedMeal = await deleteMealById(id);

        if (!deletedMeal) {
            return res.status(404).json({ error: 'Meal not found' });
        }

        res.json({
            message: 'Meal deleted successfully',
            id: deletedMeal.id
        });

    } catch (error) {
        console.error('Server error while deleting meal:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.delete('/snacks/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Received delete request for snack ID:', id);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid snack ID' });
        }

        const deletedSnack = await deleteSnackById(id);

        if (!deletedSnack) {
            return res.status(404).json({ error: 'Snack not found' });
        }

        res.json({
            message: 'Snack deleted successfully',
            id: deletedSnack.id
        });

    } catch (error) {
        console.error('Server error while deleting snack:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.post('/menu-items', async (req, res) => {
    try {
        console.log(req.body)
        const newItem = await createMenuItem(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        console.error('Menu item creation error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.get('/menu-items', async (req, res) => {
    try {
        const { type } = req.query;
        const items = await getAllMenuItems(type);
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/menu-items/:id', async (req, res) => {
    try {
        const item = await getMenuItemById(req.params.id);
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ error: 'Item not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/menu-items/:id', async (req, res) => {
    try {
        const { id } = req.params;

        console.log('Received delete request for item ID:', id);

        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid item ID' });
        }

        const deletedItem = await deleteMenuItemById(id);

        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({
            message: 'Item deleted successfully',
            id: deletedItem.id
        });

    } catch (error) {
        console.error('Server error while deleting item:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

app.get("/inventory-items",async (req,res)=>{
    try{
        const items=await getRawMaterials()
        res.status(201).json(items)
    }
    catch(err){
        res.status(500).json({
            error:"Error fetching inventory items"
        })
    }
})
app.put("/update-inventory/:id",async(req,res)=>{
    try
    {
    console.log("Enterted the route of update inventory")
    const {id}=req.params
    const {quantity,price_per_unit}=req.body
    console.log(quantity)
    await updateInventory(id,quantity,price_per_unit)
    res.status(201).json({message:"Updated successfully"})
    }
    catch(err){
        res.status(500).json({
            error:"Error updating inventory items"
        })
    }
})
app.post("/add-inventory-item",async(req,res)=>{
    try{
        const{name,price,quantity,unit}=req.body
        await addInventoryItem(name,quantity,price,unit);
        return res.status(200).json({message:"Successfully added"})
    }
    catch(err){
        console.log(err.message)
        return res.status(500).json({message:
            "Unable to add item to inventory"
        })
    }
})

app.put('/menu-items/:id/special', async (req, res) => {
    console.log('Received special status update request:', {
        id: req.params.id,
        body: req.body
    });
    
    try {
        const { id } = req.params;
        const { special } = req.body;
        res.setHeader('Content-Type', 'application/json');
        
        if (typeof special !== 'boolean') {
            return res.status(400).json({ 
                error: 'Special status must be a boolean value' 
            });
        }

        const updatedItem = await updateMenuItemSpecial(id, special);
        console.log('Updated item:', updatedItem);
        
        res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error in special status update:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});


app.get('/top',async(req,res)=>{
    try{
        console.log("Entering the function");
        const items=await gettop10menuItems();
        // console.log("Items in backend are ",items);
        res.json({
            status:200,
            result:items.rows
        })
    }catch(error){
        console.error(error.message);
        res.status(500).json({error:'error in top 10 routing'})
    }
})

app.get('/bottom',async(req,res)=>{
    try{
        const items=await getBottom10MenuItems();
        // console.log("Bottom 10 items are ",items);
        res.json({
            status:200,
            result:items.rows
        })
    }catch(error){
        console.error(error.message);
        res.status(500).json({error:'error in bottom 10 routing'})
    }
})
app.post('/combos', async (req, res) => {
    try {
      const newCombo = await createComboItem(req.body);
      res.status(201).json(newCombo);
    } catch (error) {
      console.error('Combo item creation error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
  
app.get('/getCombos',async(req,res)=>{
    try{
        const combos=await getCombos();
        res.json({
            status:200,result:combos
        })
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            error:'error in fetching combos '
        })
    }
})

app.delete('/delete-combos/:id',async(req,res)=>{
    try{
        const{id}=req.params;
        console.log("Id is ",id);
        if(!id || isNaN(parseInt(id))){
            return res.status(400).json({
                error:'Invalid item id'
            })
        }
        const deletedCombo=await deleteCombos(id);
        if(!deletedCombo){
            return res.status(404).json({
                error:'Item not found'
            })
        }
        res.json({
            message:'Item deleted successfully',
            id:deletedCombo.id
        })
    }catch(error){
        console.log("error in deleting api ");
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
})

app.get('/getOrdersToBeServed',async(req,res)=>{
    try{
        const ordersToBeServed=await getOrdersToBeServed();
        res.json({
            status:200,result:ordersToBeServed.rows
        })
    }catch(error){
        console.error(error.message);
        res.status(500).json({
            error:"error in fetching orderToBeServed"
        })
    }
})
app.get('/orderUpdates',async(req,res)=>{
    res.setHeader('Content-Type','text/event-stream')
    res.setHeader('Cache-Control','no-cache');
    res.setHeader('Connection','keep-alive');
    res.setHeader('Access-Control-Allow-Origin','*');
    try{
        const ordersToBeServed=await getOrdersToBeServed();
        res.write(`data:${JSON.stringify({
            event:'initial',
            status:200,
            result:ordersToBeServed.rows
        })}\n\n`)
        
    }catch(error){
        console.error('Error sending initial data: ',error.message);
        res.write(`data:${JSON.stringify({
            event:'error',
            error:'Error fetching initial orders'
        })}\n\n`)
    }
    const clientId=Date.now();
    clients[clientId]=res;
    console.log(`Client connected: ${clientId},total clients: ${Object.keys(clients).length}`)

    req.on('close',()=>{
        delete clients[clientId];
        console.log(`Client disconnected: ${clientId},remaining clients: ${Object.keys(clients).length}`)
    })
})
function notifyOrderUpdate() {
    // Only fetch new data if we have connected clients
    if (Object.keys(clients).length > 0) {
        getOrdersToBeServed()
            .then(result => {
                const data = JSON.stringify({
                    event: 'update',
                    status: 200,
                    result: result.rows,
                    timestamp: new Date().toISOString()
                });
                console.log("Entered the code ",data);
                // Broadcast to all connected clients
                Object.keys(clients).forEach(clientId => {
                    clients[clientId].write(`data: ${data}\n\n`);
                });
            })
            .catch(error => {
                console.error('Error broadcasting update:', error.message);
                const errorData = JSON.stringify({
                    event: 'error',
                    error: 'Failed to fetch updated orders'
                });
                
                Object.keys(clients).forEach(clientId => {
                    clients[clientId].write(`data: ${errorData}\n\n`);
                });
            });
    }
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/triggerOrderUpdate', (req, res) => {
    console.log("Received request to /triggerOrderUpdate");
    try {
        notifyOrderUpdate(); // Ensure this function is defined
        console.log("Order update trigger")
        res.status(200).json({ success: true, message: 'Order update broadcast initiated' });
    } catch (error) {
        console.error("Error triggering order update:", error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/orderCompleted', async (req, res) => {
    console.log("Entered the function for marking order completed");
  
    try {
      const { id } = req.body; // ✅ safely extract the id from request body
  
      if (!id) {
        return res.status(400).json({ error: 'Order ID is required' }); // 🚨 handle missing ID
      }
  
      const updatedOrder = await orderCompleted(id); // ✅ pass only the id
      res.status(200).json({ success: true, data: updatedOrder }); // 📦 return structured response
    } catch (error) {
      console.error('Order marking route error', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message,
      });
    }
  });
  

app.listen(port, () => {
    console.log(`Backend Server Started on port ${port}`);
});