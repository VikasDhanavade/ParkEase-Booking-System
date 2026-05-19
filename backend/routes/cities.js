import express from 'express';
import { getCities } from '../controllers/adminController.js'; // reusing the admin getCities controller for now since it just fetches active cities

const router = express.Router();

router.get('/', getCities);

export default router;
