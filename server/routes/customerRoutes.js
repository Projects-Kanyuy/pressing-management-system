// server/routes/customerRoutes.js
import express from 'express';
import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
} from '../controllers/customerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { checkSubscription } from '../middleware/subscriptionCheckMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, checkSubscription, createCustomer) // Staff and Admin can create
    .get(protect, checkSubscription, getCustomers);   // Staff and Admin can view

router.route('/:id')
    .get(protect, checkSubscription, getCustomerById)
    .put(protect, checkSubscription, updateCustomer)
    .delete(protect, checkSubscription, authorize('admin'), deleteCustomer); // Only Admin can delete

export default router;