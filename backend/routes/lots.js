import express from 'express';
import { getAllLots, getLotById, getLotSlots } from '../controllers/lotController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllLots);
router.get('/:id', getLotById);
router.get('/:id/slots', auth, getLotSlots);

export default router;
