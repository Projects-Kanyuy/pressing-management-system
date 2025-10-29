// server/routes/planRoutes.js

import express from 'express';
import {
  getPlans,
  getAllPlansAdmin,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
} from '../controllers/planController.js';
import { protectDirectoryAdmin } from '../middleware/directoryAdminMiddleware.js';

const router = express.Router();

// @route   /api/plans
// @desc    Routes for subscription plans

// --- PUBLIC ROUTES ---
// Get all active plans for the public pricing page
router.route('/').get(getPlans);

// --- ADMIN-ONLY ROUTES ---
// The protectDirectoryAdmin middleware will be applied to all subsequent routes in this chain.
router.use(protectDirectoryAdmin);

// Get ALL plans (including inactive ones) for the admin panel
router.route('/all').get(getAllPlansAdmin);

// Get a single plan by ID, create a new plan, or delete a plan
router
  .route('/:id')
  .get(getPlanById)
  .put(updatePlan)
  .delete(deletePlan);

// Create a new plan
router.route('/').post(createPlan);


export default router;