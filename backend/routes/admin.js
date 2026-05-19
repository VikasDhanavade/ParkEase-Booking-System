import express from 'express';
import { createLot, updateLot, deleteLot, createSlot, updateSlotStatus, deleteSlot, getAllSlots, getBookings, getStats, createCity, deleteCity } from '../controllers/adminController.js';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';

const router = express.Router();

router.use(auth, adminOnly);

router.post('/cities', createCity);
router.delete('/cities/:id', deleteCity);

router.post('/lots', createLot);
router.patch('/lots/:id', updateLot);
router.delete('/lots/:id', deleteLot);
router.post('/slots', createSlot);
router.get('/slots', getAllSlots);
router.patch('/slots/:id', updateSlotStatus);
router.delete('/slots/:id', deleteSlot);
router.get('/bookings', getBookings);
router.get('/stats', getStats);

export default router;
