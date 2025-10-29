// server/routes/currencyRoutes.js

import express from 'express';
import { getConversionRates, geolocate } from '../controllers/currencyController.js';

const router = express.Router();

// GET /api/currency/rates
router.get('/rates', getConversionRates);

// GET /api/currency/geolocate
router.get('/geolocate', geolocate);

export default router;