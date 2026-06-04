import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import City from './models/City.js';
import ParkingLot from './models/ParkingLot.js';
import Slot from './models/Slot.js';
import Booking from './models/Booking.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding');

        await User.deleteMany({});
        await City.deleteMany({});
        await ParkingLot.deleteMany({});
        await Slot.deleteMany({});
        await Booking.deleteMany({});

        const adminHash = await bcrypt.hash('admin123', 10);
        const userHash = await bcrypt.hash('user123', 10);

        const admin = await User.create({
            name: "Admin", email: "admin@park.com", passwordHash: adminHash, role: "admin"
        });

        const user = await User.create({
            name: "Test User", email: "user@park.com", passwordHash: userHash, role: "user"
        });

        const city = await City.create({
            name: "Pune", state: "Maharashtra"
        });

        const lotA = await ParkingLot.create({
            name: "Lot A", location: "MG Road, Pune", totalSlots: 10, cityId: city._id
        });

        const lotB = await ParkingLot.create({
            name: "Lot B", location: "FC Road, Pune", totalSlots: 6, cityId: city._id
        });

        const slotsA = [];
        for (let i = 1; i <= 10; i++) {
            slotsA.push({ lotId: lotA._id, slotNumber: `A${i}`, floor: "Ground" });
        }
        await Slot.insertMany(slotsA);

        const slotsB = [];
        for (let i = 1; i <= 6; i++) {
            slotsB.push({ lotId: lotB._id, slotNumber: `B${i}` });
        }
        const createdSlotsB = await Slot.insertMany(slotsB);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrow10am = new Date(tomorrow.setHours(10, 0, 0, 0));
        const tomorrow12pm = new Date(tomorrow.setHours(12, 0, 0, 0));

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterday10am = new Date(yesterday.setHours(10, 0, 0, 0));
        const yesterday12pm = new Date(yesterday.setHours(12, 0, 0, 0));

        await Booking.create([
            {
                userId: user._id, lotId: lotB._id, slotId: createdSlotsB[0]._id,
                startTime: tomorrow10am, endTime: tomorrow12pm, vehicleNumber: "MH12AB1234",
                status: 'active', amount: 100
            },
            {
                userId: user._id, lotId: lotB._id, slotId: createdSlotsB[1]._id,
                startTime: yesterday10am, endTime: yesterday12pm, vehicleNumber: "MH14XY5678",
                status: 'active', amount: 100 
            }
        ]);

        console.log('Data seeded successfully!');
        const uCount = await User.countDocuments();
        const plCount = await ParkingLot.countDocuments();
        const sCount = await Slot.countDocuments();
        const bCount = await Booking.countDocuments();
        console.log(`Users: ${uCount}, Lots: ${plCount}, Slots: ${sCount}, Bookings: ${bCount}`);
        
        mongoose.disconnect();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedDB();
