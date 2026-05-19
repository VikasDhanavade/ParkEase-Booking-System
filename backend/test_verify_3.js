import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create a dummy booking
    const newBooking = new Booking({
        userId: new mongoose.Types.ObjectId(),
        lotId: new mongoose.Types.ObjectId(),
        slotId: new mongoose.Types.ObjectId(),
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        vehicleNumber: "TEST1234",
        vehicleType: "car",
        amount: 50
    });
    await newBooking.save();
    
    console.log("Created:", newBooking._id);
    
    const res = await fetch(`http://localhost:5001/api/bookings/${newBooking._id}/verify`);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Body:', text);
    
    await Booking.findByIdAndDelete(newBooking._id);
    process.exit();
}
run();
