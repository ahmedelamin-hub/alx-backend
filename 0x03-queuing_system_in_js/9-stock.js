import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';

// Create Redis client and use promisify to handle Redis async/await
const client = createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Array of products
const listProducts = [
    { itemId: 1, itemName: 'Suitcase 250', price: 50, initialAvailableQuantity: 4 },
    { itemId: 2, itemName: 'Suitcase 450', price: 100, initialAvailableQuantity: 10 },
    { itemId: 3, itemName: 'Suitcase 650', price: 350, initialAvailableQuantity: 2 },
    { itemId: 4, itemName: 'Suitcase 1050', price: 550, initialAvailableQuantity: 5 }
];

// Function to get a product by id
function getItemById(id) {
    return listProducts.find((product) => product.itemId === parseInt(id));
}

// Function to reserve stock by item ID
async function reserveStockById(itemId, stock) {
    return setAsync(`item.${itemId}`, stock);
}

// Function to get the current reserved stock by item ID
async function getCurrentReservedStockById(itemId) {
    const stock = await getAsync(`item.${itemId}`);
    return stock;
}

// Create Express server
const app = express();
const port = 1245;

// Route to get all products
app.get('/list_products', (req, res) => {
    res.json(listProducts);
});

// Route to get a product by ID
app.get('/list_products/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const product = getItemById(itemId);

    if (!product) {
        return res.json({ status: 'Product not found' });
    }

    const currentQuantity = await getCurrentReservedStockById(itemId) || product.initialAvailableQuantity;

    res.json({
        itemId: product.itemId,
        itemName: product.itemName,
        price: product.price,
        initialAvailableQuantity: product.initialAvailableQuantity,
        currentQuantity: parseInt(currentQuantity)
    });
});

// Route to reserve a product
app.get('/reserve_product/:itemId', async (req, res) => {
    const itemId = req.params.itemId;
    const product = getItemById(itemId);

    if (!product) {
        return res.json({ status: 'Product not found' });
    }

    const currentStock = await getCurrentReservedStockById(itemId) || product.initialAvailableQuantity;

    if (parseInt(currentStock) <= 0) {
        return res.json({
            status: 'Not enough stock available',
            itemId: product.itemId
        });
    }

    const newStock = parseInt(currentStock) - 1;
    await reserveStockById(itemId, newStock);

    res.json({
        status: 'Reservation confirmed',
        itemId: product.itemId
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
