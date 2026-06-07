const pool = require('./db');
// const { sendNotification } = require('./firebaseAdmin');



const createBeverage = async (beverageData) => {
    const {
        snackName: name,
        quantity,
        wholesalePrice: wholesale_price,
        sellPrice: selling_price,
        image,
        availability = true
    } = beverageData;

    const query = `
        INSERT INTO beverages (
            name, quantity, wholesale_price, selling_price,
            availability, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [
            name,
            quantity,
            wholesale_price,
            selling_price,
            availability,
            image
        ]);
        // await sendNotification(
        //     'New Beverage Added',
        //     `${name} has been added to the beverages menu`
        // );

        return result.rows[0];
    } catch (error) {
        console.error('Error creating beverage:', error);
        throw error;
    }
};


const createMeal = async (mealsData) => {
    const {
        snackName: name,
        quantity,
        wholesalePrice: wholesale_price,
        sellPrice: selling_price,
        image,
        availability = true
    } = mealsData;

    const query = `
        INSERT INTO meals (
            name,quantity,  wholesale_price, selling_price,
 availability, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [
            name,
            quantity,
            wholesale_price, selling_price,
            availability,
            image
        ]);

        // await sendNotification(
        //     'New meal Added',
        //     `${name} has been added to the meal menu`
        // );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating meals:', error);
        throw error;
    }
};
const createSnacks = async (snacksData) => {
    const {
        snackName: name,
        quantity,
        wholesalePrice: wholesale_price,
        sellPrice: selling_price,
        image,
        availability = true
    } = snacksData;

    const query = `
        INSERT INTO snacks (
            name,quantity, wholesale_price, selling_price,
      availability, image_url
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    try {
        const result = await pool.query(query, [
            name,
            quantity,
            wholesale_price, selling_price,
            availability,
            image
        ]);
        // await sendNotification(
        //     'New Snack Added',
        //     `${name} has been added to the Snack menu`
        // );
        return result.rows[0];
    } catch (error) {
        console.error('Error creating snacks:', error);
        throw error;
    }
};

const getAllBeverages = async () => {
    const query = 'SELECT * FROM beverages ORDER BY created_at DESC';

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching beverages:', error);
        throw error;
    }
};
const getAllMeals = async () => {
    const query = 'SELECT * FROM meals ORDER BY created_at DESC';

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching meals:', error);
        throw error;
    }
};
const getAllSnacks = async () => {
    const query = 'SELECT * FROM snacks ORDER BY created_at DESC';

    try {
        const result = await pool.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching snacks:', error);
        throw error;
    }
};

const getBeverageById = async (id) => {
    const query = 'SELECT * FROM beverages WHERE id = $1';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching beverage:', error);
        throw error;
    }
};
const getSnacksById = async (id) => {
    const query = 'SELECT * FROM snacks WHERE id = $1';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching snacks:', error);
        throw error;
    }
};

const getMealsById = async (id) => {
    const query = 'SELECT * FROM meals WHERE id = $1';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching meals:', error);
        throw error;
    }
};

const deleteBeverageById = async (id) => {
    const query = 'DELETE FROM beverages WHERE id = $1 RETURNING *';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting beverage:', error);
        throw error;
    }
};
const deleteMealById = async (id) => {
    const query = 'DELETE FROM meals WHERE id = $1 RETURNING *';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting meal:', error);
        throw error;
    }
};

const deleteSnackById = async (id) => {
    const query = 'DELETE FROM snacks WHERE id = $1 RETURNING *';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting snack:', error);
        throw error;
    }
};

const createMenuItem = async (itemData) => {
    const {
      snackName: name,
      quantity,
      wholesalePrice: wholesale_price,
      sellPrice: selling_price,
      image,
      category: item_type,
      availability = true,
      description = '',
    } = itemData;
  
    const query = `
      INSERT INTO menu_items (
        name, description, quantity, wholesale_price, 
        selling_price, item_type, availability, image_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (name, item_type) DO UPDATE
      SET quantity = $3, 
          wholesale_price = $4, 
          selling_price = $5, 
          availability = $7, 
          image_url = $8
      RETURNING *;
    `;
  
    try {
      const result = await pool.query(query, [
        name,
        description,
        quantity,
        wholesale_price,
        selling_price,
        item_type,
        availability,
        image,
      ]);
  
      if (!result.rows[0]) {
        throw new Error('Failed to insert or update item');
      }
  
    //   await sendNotification(
    //     `New ${item_type} Added`,
    //     `${name} has been added to the menu`
    //   );
  
      return result.rows[0];
    } catch (error) {
      console.error('Error creating menu item:', error);
      throw new Error(`Failed to create menu item: ${error.message}`);
    }
  };

const getAllMenuItems = async (itemType = null) => {
    const query = itemType 
        ? 'SELECT * FROM menu_items WHERE item_type = $1 ORDER BY created_at DESC'
        : 'SELECT * FROM menu_items ORDER BY created_at DESC';

    try {
        const result = await pool.query(query, itemType ? [itemType] : []);
        return result.rows;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        throw error;
    }
};

const getMenuItemById = async (id) => {
    const query = 'SELECT * FROM menu_items WHERE id = $1';
    try {
        const result = await pool.query(query, [id]);
        console.log("Result in the backend is",result);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching menu item:', error);
        throw error;
    }
};

const deleteMenuItemById = async (id) => {
    const query = 'DELETE FROM menu_items WHERE id = $1 RETURNING *';

    try {
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error deleting menu item:', error);
        throw error;
    }
};
const getRawMaterials= async ()=>{
    try{
        console.log("ENtered the function for getting the entries ");
        const result=await pool.query("SELECT * from raw_materials")
        console.log("Results for the server for gettting the data is ",result.rows)
        return result.rows;
    }
    catch(err){
        console.error("Error fetching menu items",err.message)
        throw err
    }
}
const updateInventory = async (id, quantity, price) => {
    try {
        console.log("Entered the update entry function in the backend");
        console.log("ID is:", id);
        console.log("ID, quantity, and price are:", id, quantity, price);
        
        const result = await pool.query(
            `UPDATE raw_materials 
             SET quantity = $1, price_per_unit = $2 
             WHERE id = $3`,
            [quantity, price, id]
        );
        
        console.log("Update result:", result);
        return result.rows;
    } catch (err) {
        console.error("Error updating inventory item:", err.message);
        throw err;
    }
};
const addInventoryItem = async (item_name, item_quantity, item_price, item_unit) => {
    const query = `
      INSERT INTO raw_materials (item_name, quantity, price_per_unit, unit) 
      VALUES ($1, $2, $3, $4)
    `;
    try {
        await pool.query(query, [item_name, item_quantity, item_price, item_unit]);
    } catch (error) {
        console.error('Error adding inventory item:', error);
        throw error;
    }
};


const updateMenuItemAvailability = async (id, availability) => {
    try {
        console.log('Updating item in database:', { id, availability });
        
        const query = `
            UPDATE menu_items 
            SET availability = $1 
            WHERE id = $2 
            RETURNING *
        `;
        
        const result = await pool.query(query, [availability, id]);
        console.log('Database result:', result.rows[0]);
        
        if (result.rows.length === 0) {
            throw new Error('Menu item not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};

const updateMenuItemSpecial = async (id, special) => {
    try {
        console.log('Updating special status in database:', { id, special });
        
        const query = `
            UPDATE menu_items 
            SET special = $1 
            WHERE id = $2 
            RETURNING *
        `;
        
        const result = await pool.query(query, [special, id]);
        console.log('Database result:', result.rows[0]);
        
        if (result.rows.length === 0) {
            throw new Error('Menu item not found');
        }
        
        return result.rows[0];
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};

const gettop10menuItems=async()=>{
    const query='SELECT * FROM menu_items ORDER BY ordered DESC LIMIT 10';
    try{
        const result=await pool.query(query);
        return result;
    }catch(error){
        console.error('Error fetching 10 menu items: ',error);
        throw error;
    }
}
const getBottom10MenuItems=async()=>{
    const query='SELECT * FROM menu_items ORDER BY ordered ASC LIMIT 10';
    try{
        const result=await pool.query(query);
        return result;
    }catch(error){
        console.error('Error fetch 10 bottom menu items: ',error);
        throw error;
    }
}

const createComboItem = async (itemData) => {
    const {
      name, description, totalPrice, imageUrl, availability, item1Id, item2Id, discountedPrice,
    } = itemData;
  
    const query = `
      INSERT INTO combos (
        name, description, total_price, image_url, availability, item1_id, item2_id, discounted_price
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
  
    const values = [name, description, totalPrice, imageUrl, availability ?? true, item1Id, item2Id, discountedPrice];
  
    try {
      const result = await pool.query(query, values);
  
      if (!result.rows[0]) {
        throw new Error('Failed to insert or update item');
      }
  
      return result.rows[0];
    } catch (error) {
      console.error('Error creating combo item:', error);
      throw new Error(`Failed to create combo item: ${error.message}`);
    }
};

const getCombos = async () => {
    console.log("Enter the get combos function")
    const query = `
      SELECT 
        c.id AS combo_id,
        c.name AS combo_name,
        c.description,
        c.total_price,
        c.discounted_price,
        c.image_url AS combo_image,
        c.availability,
        c.created_at,
        mi1.name AS item1_name,
        mi1.selling_price AS item1_price,
        mi1.image_url AS item1_image,
        mi1.item_type AS item1_type,
        mi2.name AS item2_name,
        mi2.selling_price AS item2_price,
        mi2.image_url AS item2_image,
        mi2.item_type AS item2_type
      FROM 
        combos c
      LEFT JOIN 
        menu_items mi1 ON c.item1_id = mi1.id
      LEFT JOIN 
        menu_items mi2 ON c.item2_id = mi2.id;
    `;
  
    try {
      const result = await pool.query(query);
    //   console.log("Combos with item details: ", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error fetching combos from backend: ", error);
      throw error;
    }
};
  
const deleteCombos=async(id)=>{
    const query='DELETE FROM combos WHERE id=$1 RETURNING *';
    try{
        const result=await pool.query(query,[id]);
        return result.rows[0];
    }catch(error){
        console.error('Error delete combos',error)
        throw error 
    }
};

const getOrdersToBeServed = async (id) => {
    try {
      const query = `
      SELECT 
      o.order_no,
      o.order_id,
      o.order_date,
      o.order_status,
      o.price,
      o.service_charge,
      o.user_id,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'item_name', mi.name, 
          'quantity', oi.quantity
        )
      ) AS items
    FROM 
      orders o
    JOIN 
      order_items oi ON o.order_id = oi.order_id
    JOIN 
      menu_items mi ON oi.item_id = mi.id
    GROUP BY 
      o.order_no,o.order_id, o.order_date, o.order_status, o.price, o.service_charge, o.user_id
    ORDER BY 
      o.order_date DESC, o.order_id;
    `;
      const result = await pool.query(query);
      return result;
    } catch (error) {
      console.error('Error fetching ordersToBeServed', error);
      throw error;
    }
  };

  const getContactUsMessages = async () => {
    try {
        const result = await pool.query(
            'SELECT * FROM contact_us ORDER BY created_at DESC'
        );
        console.log("Result from the contact us ",result.rows);
        return result.rows;
    } catch (error) {
        console.error('Error in getContactUsMessages:', error);
        throw error;
    }
};
const orderCompleted = async (id) => {
    try {
      const result = await pool.query(
        `UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *`,
        ['COMPLETED', id]
      );
      console.log("Result for mark order completed as", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Error in marking order as completed", error);
      throw error;
    }
  };
  
  
  
module.exports = {
    orderCompleted,
    createBeverage,
    getAllBeverages,
    getBeverageById,
    getAllMeals,
    createMeal,
    getMealsById,
    getAllSnacks,
    getSnacksById,
    createSnacks,
    deleteBeverageById,
    deleteSnackById,
    deleteMealById,
    createMenuItem,
    getAllMenuItems,
    getMenuItemById,
    deleteMenuItemById,
    getRawMaterials,
    getOrdersToBeServed,
    updateInventory,addInventoryItem , updateMenuItemAvailability , updateMenuItemSpecial,
    gettop10menuItems,getBottom10MenuItems,createComboItem,getCombos,deleteCombos , getContactUsMessages
};