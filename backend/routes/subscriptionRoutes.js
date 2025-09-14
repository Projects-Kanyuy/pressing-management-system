// server/routes/subscriptionRoutes.js
import express from 'express';
import { changeSubscriptionPlan } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js'; // Use the TENANT protect middleware
const router = express.Router();

// This route must be protected so we know which tenant is making the request
router.route('/change-plan').post(protect, changeSubscriptionPlan);

export default router;