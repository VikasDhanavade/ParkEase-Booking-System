import express from 'express';
import { createBooking, getMyBookings, cancelBooking, checkoutBooking, getBookingById } from '../controllers/bookingController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public QR Code Ticket Verification Route natively!
router.get('/:id/verify', getBookingById);

router.post('/', auth, createBooking);
router.get('/me', auth, getMyBookings);
router.delete('/:id', auth, cancelBooking);
router.patch('/:id/checkout', auth, checkoutBooking);

export default router;
