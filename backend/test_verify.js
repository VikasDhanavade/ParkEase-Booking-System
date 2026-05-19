import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const booking = await Booking.findOne().sort({ createdAt: -1 });
    if (!booking) {
        console.log('No booking');
        process.exit();
    }
    console.log('Booking ID:', booking._id.toString());
    const res = await fetch(`http://localhost:5001/api/bookings/${booking._id.toString()}/verify`);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
    process.exit();
}
run();
