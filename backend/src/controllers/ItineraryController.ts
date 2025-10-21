import { Request, Response } from 'express';
import { Itinerary } from '../models/Itinerary';
import { TravelPackage } from '../models/TravelPackage';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class ItineraryController {
  static async createItinerary(req: AuthRequest, res: Response) {
    try {
      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const userRepository = AppDataSource.getRepository(User);

      const { travelPackageId, title, description, items } = req.body;

      const travelPackage = await packageRepository.findOne({ where: { id: travelPackageId } });
      if (!travelPackage) {
        return res.status(404).json({ message: 'Travel package not found' });
      }

      const user = await userRepository.findOne({ where: { id: req.user?.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const itinerary = itineraryRepository.create({
        user,
        travelPackage,
        title,
        description,
        items
      });

      await itineraryRepository.save(itinerary);
      res.status(201).json(itinerary);
    } catch (error) {
      console.error('Error creating itinerary:', error);
      res.status(500).json({ message: 'Error creating itinerary' });
    }
  }

  static async getUserItineraries(req: AuthRequest, res: Response) {
    try {
      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      
      const itineraries = await itineraryRepository.find({
        where: { user: { id: req.user?.userId } },
        relations: ['travelPackage'],
        order: {
          createdAt: 'DESC'
        }
      });

      res.json(itineraries);
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      res.status(500).json({ message: 'Error fetching itineraries' });
    }
  }

  static async updateItinerary(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, items } = req.body;

      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      const itinerary = await itineraryRepository.findOne({ 
        where: { 
          id,
          user: { id: req.user?.userId }
        }
      });

      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      itinerary.title = title;
      itinerary.description = description;
      itinerary.items = items;
      itinerary.updatedAt = new Date();

      await itineraryRepository.save(itinerary);
      res.json(itinerary);
    } catch (error) {
      console.error('Error updating itinerary:', error);
      res.status(500).json({ message: 'Error updating itinerary' });
    }
  }

  static async deleteItinerary(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const itineraryRepository = AppDataSource.getRepository(Itinerary);
      
      const itinerary = await itineraryRepository.findOne({ 
        where: { 
          id,
          user: { id: req.user?.userId }
        }
      });

      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }

      await itineraryRepository.remove(itinerary);
      res.json({ message: 'Itinerary deleted successfully' });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      res.status(500).json({ message: 'Error deleting itinerary' });
    }
  }
}