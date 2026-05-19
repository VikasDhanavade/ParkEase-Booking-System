import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import ParkingLot from '../models/ParkingLot.js';
import { sendEmail } from '../utils/email.js';
import User from '../models/User.js';
import os from 'os';

export const createBooking = async (req, res) => {
    try {
        const { slotId, lotId, startTime, endTime, vehicleNumber, vehicleType } = req.body;

        if (!slotId || !lotId || !startTime || !endTime || !vehicleNumber || !vehicleType) {
            return res.status(400).json({ message: 'All fields including vehicle type are required' });
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: 'Invalid Date format' });
        }

        if (start >= end) {
            return res.status(400).json({ message: 'endTime must be after startTime' });
        }

        if (start < new Date(Date.now() - 15 * 60000)) {
            return res.status(400).json({ message: 'startTime cannot be excessively in the past (15 min grace period allowed)' });
        }

        const slot = await Slot.findById(slotId);
        if (!slot) {
             return res.status(404).json({ message: 'Slot not found' });
        }

        if (slot.lotId.toString() !== lotId) {
             return res.status(400).json({ message: 'Slot does not belong to the specified parking lot' });
        }

        if (slot.status === 'blocked') {
            return res.status(400).json({ message: 'Slot is currently blocked' });
        }

        const overlappingBooking = await Booking.findOne({
            slotId,
            status: 'active',
            startTime: { $lt: end },
            endTime: { $gt: start }
        });

        if (overlappingBooking) {
            return res.status(409).json({ message: 'Slot already booked for this time period' });
        }

        const hoursDiff = Math.abs(end - start) / 36e5;
        
        if (hoursDiff < 1) {
            return res.status(400).json({ message: 'Minimum booking duration is 1 hour' });
        }

        const lot = await ParkingLot.findById(lotId);
        const totalHours = Math.ceil(hoursDiff);
        const ratePerHour = vehicleType === 'bike' ? (lot.bikePrice || 20) : (lot.carPrice || 50);
        const amount = totalHours * ratePerHour;

        const newBooking = new Booking({
            userId: req.user.id,
            lotId,
            slotId,
            startTime: start,
            endTime: end,
            vehicleNumber,
            vehicleType,
            amount
        });


        let secureLocalIp = 'localhost';
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                if (net.family === 'IPv4' && !net.internal) {
                    secureLocalIp = net.address;
                }
            }
        }

        // Ensure user obj is populated for the QR Code Data 
        const user = await User.findById(req.user.id);
        const qrContent = `http://${secureLocalIp}:3000/ticket.html?id=${newBooking._id}`;
        newBooking.qrCodeData = qrContent;

        const savedBooking = await newBooking.save();

        // Send confirmation email internally gracefully natively seamlessly
        if (user && lot) {
            const duration = Math.ceil(Math.abs(end - start) / 36e5);
            const htmlTemplate = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #0d6efd; text-align: center;">ParkEase Confirmation</h2>
                    <p style="font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                    <p style="font-size: 16px;">Your parking slot has been booked successfully with ParkEase.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px;">
                        <h3 style="margin-top: 0; color: #333;">Booking Details:</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Booking ID:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${newBooking._id}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Parking Lot:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${lot.name} (${lot.location})</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Slot Number:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${slot.slotNumber}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Vehicle:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${vehicleNumber}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Start Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${start.toLocaleString()}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>End Time:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${end.toLocaleString()}</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Duration:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee;">${duration} Hour(s)</td></tr>
                            <tr><td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td><td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #198754;">₹${amount}</td></tr>
                        </table>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <span style="background-color: #198754; color: white; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Status: Confirmed ✔️</span>
                        </div>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #555;">Thank you for choosing ParkEase.</p>
                    <p style="font-size: 14px; color: #555;">Regards,<br><strong>ParkEase Team</strong></p>
                </div>
            `;

            await sendEmail({
                to: user.email,
                subject: 'ParkEase - Parking Booking Confirmed',
                text: `Hello ${user.name},\n\nYour parking slot has been booked successfully with ParkEase.\n\nBooking Details:\n\nBooking ID: ${newBooking._id}\nParking Lot: ${lot.name}\nSlot Number: ${slot.slotNumber}\nVehicle Number: ${vehicleNumber}\nDate: ${start.toLocaleDateString()}\nStart Time: ${start.toLocaleTimeString()}\nEnd Time: ${end.toLocaleTimeString()}\nDuration: ${duration} Hour(s)\nAmount: ₹${amount}\nStatus: Confirmed\n\nThank you for choosing ParkEase.\n\nRegards,\nParkEase Team`,
                html: htmlTemplate
            });
        }

        res.status(201).json(savedBooking);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .populate('slotId', 'slotNumber floor')
            .populate('lotId', 'name location');
        
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.startTime <= new Date()) {
            return res.status(400).json({ message: 'Cannot cancel a booking that has already started' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Send cancellation email
        const user = await User.findById(req.user.id);
        if (user) {
            await sendEmail({
                to: user.email,
                subject: 'Parking Slot Booking Cancelled',
                text: `Hi ${user.name},\n\nYour parking slot booking has been successfully cancelled.\n\nThank you for using ParkEase!`
            });
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const checkoutBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        const booking = await Booking.findOne({ _id: bookingId, userId: req.user.id }).populate('lotId');
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Only active bookings can be checked out' });
        }

        const now = new Date();
        
        // Overstay penalty logic
        if (now > booking.endTime) {
            const extraHours = Math.ceil(Math.abs(now - booking.endTime) / 36e5);
            const ratePerHour = booking.vehicleType === 'bike' ? (booking.lotId.bikePrice || 20) : (booking.lotId.carPrice || 50);
            
            // Double hourly charges penalty
            const penalty = extraHours * (ratePerHour * 2); 
            booking.amount += penalty;
            booking.penaltyAmount = penalty;
        }

        booking.status = 'completed';
        await booking.save();

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Retrieve a single strict booking securely for external QR Ticket verification flow!
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate('lotId', 'name location')
            .populate('slotId', 'slotNumber floor');
            
        if (!booking) {
            return res.status(404).json({ message: 'Booking essentially missing or invalid' });
        }
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error or severely invalid URL pattern lookup' });
    }
};
