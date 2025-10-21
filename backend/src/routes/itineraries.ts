import express from 'express';
import { ItineraryController } from '../controllers/ItineraryController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new itinerary
router.post('/', auth, ItineraryController.createItinerary);

// Get user's itineraries
router.get('/my-itineraries', auth, ItineraryController.getUserItineraries);

// Update an itinerary
router.put('/:id', auth, ItineraryController.updateItinerary);

// Delete an itinerary
router.delete('/:id', auth, ItineraryController.deleteItinerary);

export default router;