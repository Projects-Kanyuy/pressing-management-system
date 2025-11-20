// server/routes/priceRoutes.js
import express from 'express';
import { getPrices, upsertPrices } from '../controllers/priceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { checkSubscription } from '../middleware/subscriptionCheckMiddleware.js';
const router = express.Router();
router.route('/')
.get(protect, checkSubscription, getPrices)
.put(protect, checkSubscription, authorize('admin'), upsertPrices);
export default router;