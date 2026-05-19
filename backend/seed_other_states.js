import mongoose from 'mongoose';
import City from './models/City.js';
import ParkingLot from './models/ParkingLot.js';
import Slot from './models/Slot.js';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    try {
        const citiesData = [
            { name: 'Bangalore', state: 'Karnataka' },
            { name: 'New Delhi', state: 'Delhi' },
            { name: 'Hyderabad', state: 'Telangana' },
            { name: 'Chennai', state: 'Tamil Nadu' }
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
            if (cData.name === 'Bangalore') {
                lotsData.push(
                    { name: 'UB City Premium Parking', location: 'Vittal Mallya Rd', type: 'Premium', totalSlots: 50, carPrice: 150, bikePrice: 50 },
                    { name: 'Kempegowda Int. Airport', location: 'Devanahalli', type: 'Premium', totalSlots: 100, carPrice: 200, bikePrice: 80 },
                    { name: 'Cubbon Park Public', location: 'Cubbon Park', type: 'Government', totalSlots: 60, carPrice: 40, bikePrice: 15 }
                );
            } else if (cData.name === 'New Delhi') {
                lotsData.push(
                    { name: 'Connaught Place Hub', location: 'Rajiv Chowk', type: 'Government', totalSlots: 80, carPrice: 70, bikePrice: 25 },
                    { name: 'Select Citywalk Mall', location: 'Saket', type: 'Mall', totalSlots: 120, carPrice: 100, bikePrice: 40 },
                    { name: 'NDLS Railway Parking', location: 'Paharganj', type: 'Government', totalSlots: 150, carPrice: 50, bikePrice: 20 }
                );
            } else if (cData.name === 'Hyderabad') {
                lotsData.push(
                    { name: 'HITEC City IT Park', location: 'Madhapur', type: 'Private', totalSlots: 90, carPrice: 60, bikePrice: 20 },
                    { name: 'Charminar Tourist Parking', location: 'Charminar', type: 'Standard', totalSlots: 40, carPrice: 50, bikePrice: 20 }
                );
            } else if (cData.name === 'Chennai') {
                lotsData.push(
                    { name: 'Marina Beach Parking', location: 'Marina Beach', type: 'Standard', totalSlots: 70, carPrice: 30, bikePrice: 10 },
                    { name: 'Express Avenue Mall', location: 'Royapettah', type: 'Mall', totalSlots: 100, carPrice: 80, bikePrice: 30 }
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
