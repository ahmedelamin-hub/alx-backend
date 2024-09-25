import { createClient, print } from 'redis';

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

// Function to set new school in Redis
function setNewSchool(schoolName, value) {
    client.set(schoolName, value, print); // 'print' provides the confirmation message
}

// Function to get school value from Redis
function displaySchoolValue(schoolName) {
    client.get(schoolName, (err, reply) => {
        if (err) {
            console.error(err);
        } else {
            console.log(reply); // Log the value of the schoolName key
        }
    });
}

// Call the functions as requested
displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
