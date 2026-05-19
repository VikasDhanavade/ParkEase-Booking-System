import mongoose from 'mongoose';
import City from './models/City.js';
import ParkingLot from './models/ParkingLot.js';
import Slot from './models/Slot.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const citiesData = [
            { name: 'Mumbai', state: 'Maharashtra' },
            { name: 'Pune', state: 'Maharashtra' },
            { name: 'Nagpur', state: 'Maharashtra' }
        ];

        for (const cData of citiesData) {
            let city = await City.findOne({ name: cData.name });
            if (!city) {
                city = new City(cData);
                await city.save();
                console.log('Created city:', city.name);
            } else {
                console.log('City already exists:', city.name);
            }

            // Create lots for each city
            const lotsData = [];
            if (cData.name === 'Mumbai') {
                lotsData.push(
                    { name: 'Bandra Kurla Complex', location: 'BKC, Mumbai', type: 'Premium', totalSlots: 30, carPrice: 100, bikePrice: 40 },
                    { name: 'Marine Drive Public', location: 'Marine Drive, Mumbai', type: 'Government', totalSlots: 50, carPrice: 40, bikePrice: 15 },
                    { name: 'Phoenix Mall Parking', location: 'Lower Parel, Mumbai', type: 'Mall', totalSlots: 40, carPrice: 80, bikePrice: 30 }
                );
            } else if (cData.name === 'Pune') {
                lotsData.push(
                    { name: 'Hinjewadi IT Park', location: 'Phase 1, Hinjewadi', type: 'Private', totalSlots: 80, carPrice: 60, bikePrice: 20 },
                    { name: 'Pune Station Parking', location: 'Pune Railway Station', type: 'Government', totalSlots: 60, carPrice: 30, bikePrice: 10 }
                );
            } else if (cData.name === 'Nagpur') {
                lotsData.push(
                    { name: 'Sitabuldi Fort Parking', location: 'Sitabuldi, Nagpur', type: 'Standard', totalSlots: 40, carPrice: 40, bikePrice: 15 },
                    { name: 'Nagpur Airport Parking', location: 'Dr. Babasaheb Ambedkar Airport', type: 'Premium', totalSlots: 50, carPrice: 90, bikePrice: 40 }
                );
            }

            for (const lData of lotsData) {
                let lot = await ParkingLot.findOne({ name: lData.name, cityId: city._id });
                if (!lot) {
                    lData.cityId = city._id;
                    lot = new ParkingLot(lData);
                    await lot.save();
                    console.log('Created lot:', lot.name);

                    // Create slots
                    const slotsToInsert = [];
                    for (let i = 1; i <= lData.totalSlots; i++) {
                        slotsToInsert.push({
                            lotId: lot._id,
                            slotNumber: `S${i}`,
                            floor: 'Ground',
                            status: 'available'
                        });
                    }
                    await Slot.insertMany(slotsToInsert);
                    console.log(`Created ${slotsToInsert.length} slots for ${lot.name}`);
                } else {
                    console.log('Lot already exists:', lot.name);
                }
            }
        }
    } catch(e) {
        console.error(e);
    }
    process.exit();
});
