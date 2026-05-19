import ParkingLot from '../models/ParkingLot.js';
import Slot from '../models/Slot.js';
import Booking from '../models/Booking.js';

export const getAllLots = async (req, res) => {
    try {
        const query = {};
        if (req.query.cityId) {
            query.cityId = req.query.cityId;
        }
        const lots = await ParkingLot.find(query).populate('cityId', 'name');
        res.json(lots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getLotById = async (req, res) => {
    try {
        const lot = await ParkingLot.findById(req.params.id);
        if (!lot) {
            return res.status(404).json({ message: 'Parking lot not found' });
        }
        res.json(lot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getLotSlots = async (req, res) => {
    try {
        const { startTime, endTime } = req.query;

        if (!startTime || !endTime) {
            return res.status(400).json({ message: 'startTime and endTime are required' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid Date format for startTime or endTime' });
        }

        if (start >= end) {
             return res.status(400).json({ message: 'startTime must be before endTime' });
        }

        if (start < new Date(Date.now() - 15 * 60000)) {
             return res.status(400).json({ message: 'startTime cannot be excessively in the past (15 min grace period allowed)' });
        }

        const lotId = req.params.id;

        const lot = await ParkingLot.findById(lotId);
        if(!lot) {
             return res.status(404).json({ message: 'Parking lot not found' });
        }

        const slots = await Slot.find({ lotId });

        const overlappingBookings = await Booking.find({
            lotId,
            status: 'active',
            startTime: { $lt: end },
            endTime: { $gt: start }
        });

        const bookedSlotIds = new Set(overlappingBookings.map(b => b.slotId.toString()));

        const slotsWithStatus = slots.map(slot => {
            const slotObj = slot.toObject();
            if (slot.status !== 'available') {
                slotObj.availabilityStatus = slot.status;
            } else if (bookedSlotIds.has(slot._id.toString())) {
                slotObj.availabilityStatus = 'booked';
            } else {
                slotObj.availabilityStatus = 'available';
            }
            return slotObj;
        });

        res.json(slotsWithStatus);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
