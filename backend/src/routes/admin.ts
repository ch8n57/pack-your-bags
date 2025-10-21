import express from 'express';
import { AdminController } from '../controllers/AdminController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

router.get('/users', [auth, adminAuth], AdminController.manageUsers);
router.put('/packages/:id', [auth, adminAuth], AdminController.updatePackage);
router.get('/bookings/:id', [auth, adminAuth], AdminController.viewBooking);
router.get('/reports', [auth, adminAuth], AdminController.generateReports);

export default router;
