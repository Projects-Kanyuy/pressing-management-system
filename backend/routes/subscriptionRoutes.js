import express from 'express';
import { initiateSubscription, changeSubscriptionPlan } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/initiate').post(initiateSubscription);
router.route('/change-plan').post(protect, changeSubscriptionPlan);

export default router;