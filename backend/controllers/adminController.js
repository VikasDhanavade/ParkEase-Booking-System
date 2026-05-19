import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';
import City from '../models/City.js';

export const createCity = async (req, res) => {
    try {
        const { name, state } = req.body;
        if (!name || !state) return res.status(400).json({ message: 'City name and state are required' });
        
        const newCity = new City({ name, state });
        await newCity.save();
        res.status(201).json(newCity);
    } catch (error) {
        console.error(error);
        if (error.code === 11000) return res.status(400).json({ message: 'City already exists' });
        res.status(500).json({ message: 'Server error' });
    }
};

export const getCities = async (req, res) => {
    try {
        const cities = await City.find({ status: 'active' }).sort({ name: 1 });
        res.json(cities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteCity = async (req, res) => {
    try {
        const city = await City.findById(req.params.id);
        if (!city) return res.status(404).json({ message: 'City not found' });
        
        const lotsCount = await ParkingLot.countDocuments({ cityId: city._id });
        if (lotsCount > 0) {
            return res.status(400).json({ message: 'Cannot delete city. There are parking lots associated with it.' });
        }
        
        await city.deleteOne();
        res.json({ message: 'City deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createLot = async (req, res) => {
    try {
        const { name, cityId, location, totalSlots, carPrice, bikePrice, type } = req.body;

        if (!name || !cityId || !location || !totalSlots) {
            return res.status(400).json({ message: 'Name, cityId, location and totalSlots are required' });
        }

        const newLot = new ParkingLot({
            name,
            cityId,
            location,
            totalSlots,
            carPrice: carPrice || 50,
            bikePrice: bikePrice || 20,
            type: type || 'Standard'
        });

        const savedLot = await newLot.save();

        // Dynamically automatically bulk-generate physical mapping slots logically mapping to this exact structure cleanly
        const slotsToInsert = [];
        const tSlots = Number(totalSlots);
        for (let i = 1; i <= tSlots; i++) {
            slotsToInsert.push({
                lotId: savedLot._id,
                slotNumber: `S${i}`,
                floor: 'Ground',
                status: 'available'
            });
        }
        
        if (slotsToInsert.length > 0) {
            await Slot.insertMany(slotsToInsert);
        }

        res.status(201).json(savedLot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateLot = async (req, res) => {
    try {
        const lot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lot) return res.status(404).json({ message: 'Lot not found' });
        
        // Ensure slots dynamically sync correctly up natively if an admin physically increased total slots numerically
        if (req.body.totalSlots) {
            const currentSlotCount = await Slot.countDocuments({ lotId: lot._id });
            const requiredCount = Number(req.body.totalSlots);
            
            if (requiredCount > currentSlotCount) {
                const slotsToMap = [];
                for (let i = currentSlotCount + 1; i <= requiredCount; i++) {
                    slotsToMap.push({
                        lotId: lot._id,
                        slotNumber: `S${i}`,
                        floor: 'Ground',
                        status: 'available'
                    });
                }
                await Slot.insertMany(slotsToMap);
            }
        }
        
        res.json(lot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteLot = async (req, res) => {
    try {
        const lot = await ParkingLot.findById(req.params.id);
        if (!lot) return res.status(404).json({ message: 'Lot not found' });
        
        // Also wipe out physically mapped slots when deleting an entire lot natively securely
        await Slot.deleteMany({ lotId: lot._id });
        await lot.deleteOne();
        
        res.json({ message: 'Lot and associated slots deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const createSlot = async (req, res) => {
    try {
        const { lotId, slotNumber, floor } = req.body;

        if (!lotId || !slotNumber) {
            return res.status(400).json({ message: 'lotId and slotNumber are required' });
        }

        const lot = await ParkingLot.findById(lotId);
        if (!lot) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }

        const newSlot = new Slot({
            lotId,
            slotNumber,
            floor,
            status: 'available'
        });

        const savedSlot = await newSlot.save();
        res.status(201).json(savedSlot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateSlotStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !['available', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Status must be available or blocked' });
        }

        const slot = await Slot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        slot.status = status;
        const updatedSlot = await slot.save();
        
        res.json(updatedSlot);
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
};

export const deleteSlot = async (req, res) => {
    try {
        const slot = await Slot.findById(req.params.id);
        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        await slot.deleteOne();
        res.json({ message: 'Slot deleted successfully' });
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
};

export const getAllSlots = async (req, res) => {
    try {
        const slots = await Slot.find().populate('lotId', 'name');
        res.json(slots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBookings = async (req, res) => {
    try {
        const { lotId, date } = req.query;
        let query = {};

        if (lotId) {
            query.lotId = lotId;
        }

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            
            query.startTime = { $gte: startDate, $lt: endDate };
        }

        const bookings = await Booking.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'name email')
            .populate('slotId', 'slotNumber')
            .populate('lotId', 'name');

        res.json(bookings);
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
};

export const getStats = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const activeBookings = await Booking.countDocuments({ status: 'active' });
        const totalLots = await ParkingLot.countDocuments();
        const totalSlots = await Slot.countDocuments();

        const allValidBookings = await Booking.find({ status: { $in: ['active', 'completed'] } });
        const totalRevenue = allValidBookings.reduce((sum, b) => sum + (b.amount || 0), 0);

        res.json({
            totalBookings,
            activeBookings,
            totalRevenue,
            totalLots,
            totalSlots
        });
    } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Server error' });
    }
};
