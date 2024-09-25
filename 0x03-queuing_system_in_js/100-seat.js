import express from 'express';
import { createClient } from 'redis';
import { promisify } from 'util';
import kue from 'kue';

// Create Redis client and promisify Redis functions
const client = createClient();
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

// Create Kue queue
const queue = kue.createQueue();

// Initialize the number of available seats and reservation flag
let reservationEnabled = true;

// Reserve seats function to set the available_seats key in Redis
async function reserveSeat(number) {
    await setAsync('available_seats', number);
}

// Get current available seats from Redis
async function getCurrentAvailableSeats() {
    const seats = await getAsync('available_seats');
    return parseInt(seats);
}

// Initialize the seats to 50 when the server starts
reserveSeat(50);

// Create Express server
const app = express();
const port = 1245;

// Route to get the number of available seats
app.get('/available_seats', async (req, res) => {
    const availableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats: availableSeats });
});

// Route to reserve a seat
app.get('/reserve_seat', (req, res) => {
    if (!reservationEnabled) {
        return res.json({ status: 'Reservation are blocked' });
    }

    const job = queue.create('reserve_seat').save((err) => {
        if (err) {
            return res.json({ status: 'Reservation failed' });
        }
        return res.json({ status: 'Reservation in process' });
    });

    // Handle job completion and failure
    job.on('complete', () => {
        console.log(`Seat reservation job ${job.id} completed`);
    });

    job.on('failed', (err) => {
        console.log(`Seat reservation job ${job.id} failed: ${err.message}`);
    });
});

// Route to process the queue
app.get('/process', (req, res) => {
    res.json({ status: 'Queue processing' });

    queue.process('reserve_seat', async (job, done) => {
        const availableSeats = await getCurrentAvailableSeats();

        // Check if there are available seats
        if (availableSeats <= 0) {
            reservationEnabled = false;
            return done(new Error('Not enough seats available'));
        }

        // Decrease the number of available seats by 1
        const newAvailableSeats = availableSeats - 1;
        await reserveSeat(newAvailableSeats);

        // If no more seats, disable reservations
        if (newAvailableSeats === 0) {
            reservationEnabled = false;
        }

        done();
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
