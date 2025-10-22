import express from 'express';
import { TravelPackageController } from '../controllers/TravelPackageController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', TravelPackageController.getAllPackages);
router.get('/search', TravelPackageController.searchPackages);
router.get('/:id', TravelPackageController.getPackageById);

// Admin only routes
router.post('/', [auth, adminAuth], TravelPackageController.createPackage);
router.put('/:id', [auth, adminAuth], TravelPackageController.updatePackage);
router.patch('/:id/unavailable', [auth, adminAuth], TravelPackageController.makePackageUnavailable);
router.delete('/:id', [auth, adminAuth], TravelPackageController.deletePackage);

export default router;