// server/routes/publicRoutes.js
import express from 'express';
import {initiateRegistration, finalizeRegistration, getPublicDirectory, getBusinessBySlug, getTenantPriceList } from '../controllers/publicController.js';
const router = express.Router();
router.post('/initiate-registration', initiateRegistration); // Step 1
router.post('/finalize-registration', finalizeRegistration);
router.get('/directory', getPublicDirectory);
router.get('/directory/:slug', getBusinessBySlug);
router.get('/tenants/:tenantId/prices', getTenantPriceList);
export default router;