import express from 'express';
import { initiateSubscription, changeSubscriptionPlan, verifyPaymentAndFinalize } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.route('/initiate').post(initiateSubscription);
router.route('/change-plan').post(protect, changeSubscriptionPlan);
router.route('/verify-payment').post(verifyPaymentAndFinalize);

export default router;