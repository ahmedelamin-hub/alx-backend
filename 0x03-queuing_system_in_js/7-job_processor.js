import kue from 'kue';

// Create the blacklisted numbers array
const blacklistedNumbers = ['4153518780', '4153518781'];

// Create a Kue queue
const queue = kue.createQueue();

// Function to send notification
function sendNotification(phoneNumber, message, job, done) {
    // Track job progress at 0%
    job.progress(0, 100);

    // If the phone number is blacklisted, fail the job
    if (blacklistedNumbers.includes(phoneNumber)) {
        return done(new Error(`Phone number ${phoneNumber} is blacklisted`));
    }

    // Track job progress at 50%
    job.progress(50, 100);

    // Log the notification message
    console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);

    // Complete the job
    done();
}

// Process jobs from the 'push_notification_code_2' queue, handling two jobs at a time
queue.process('push_notification_code_2', 2, (job, done) => {
    const { phoneNumber, message } = job.data;
    sendNotification(phoneNumber, message, job, done);
});
