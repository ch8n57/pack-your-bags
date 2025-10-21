import express from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Create a new review
router.post('/', auth, ReviewController.createReview);

// Get reviews for a package
router.get('/package/:packageId', ReviewController.getPackageReviews);

// Moderate a review (admin only)
router.patch('/:reviewId/moderate', [auth, adminAuth], ReviewController.moderateReview);

export default router;