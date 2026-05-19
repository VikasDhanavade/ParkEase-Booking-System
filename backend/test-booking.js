import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

const run = async () => {
    await connectDB();
    const latestBooking = await Booking.findOne().sort({ createdAt: -1 });
    if (!latestBooking) {
        console.log("NO BOOKINGS FOUND IN DB!");
        process.exit(1);
    }
    console.log("Latest Booking ID:", latestBooking._id.toString());
    
    try {
        const res = await fetch(`http://localhost:5001/api/bookings/${latestBooking._id}/verify`);
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Response:", text);
    } catch(err) {
        console.log("Fetch Error:", err);
    }
    process.exit(0);
};
run();
