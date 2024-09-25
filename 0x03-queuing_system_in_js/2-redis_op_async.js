import { createClient, print } from 'redis';
import { promisify } from 'util';

// Create a Redis client
const client = createClient();

// Handle successful connection
client.on('connect', () => {
    console.log('Redis client connected to the server');
});

// Handle connection errors
client.on('error', (err) => {
    console.log(`Redis client not connected to the server: ${err.message}`);
});

// Promisify the Redis get method
const getAsync = promisify(client.get).bind(client);

// Function to set a new school in Redis
function setNewSchool(schoolName, value) {
    client.set(schoolName, value, print); // 'print' provides the confirmation message
}

// Async function to get school value from Redis
async function displaySchoolValue(schoolName) {
    try {
        const value = await getAsync(schoolName); // Use await to get the value
        console.log(value); // Log the value of the schoolName key
    } catch (err) {
        console.error(err);
    }
}

// Call the functions as requested
displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');

