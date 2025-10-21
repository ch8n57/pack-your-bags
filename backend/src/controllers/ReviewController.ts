import { Request, Response } from 'express';
import { Review } from '../models/Review';
import { TravelPackage } from '../models/TravelPackage';
import { User } from '../models/User';
import { AppDataSource } from '../config/database';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export class ReviewController {
  static async createReview(req: AuthRequest, res: Response) {
    try {
      const reviewRepository = AppDataSource.getRepository(Review);
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const userRepository = AppDataSource.getRepository(User);

      const { travelPackageId, rating, comment } = req.body;
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }

      const travelPackage = await packageRepository.findOne({ where: { id: travelPackageId } });
      if (!travelPackage) {
        return res.status(404).json({ message: 'Travel package not found' });
      }

      const user = await userRepository.findOne({ where: { id: req.user?.userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const review = reviewRepository.create({
        user,
        travelPackage,
        rating,
        comment,
        status: 'pending'
      });

      await reviewRepository.save(review);
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Error creating review' });
    }
  }

  static async getPackageReviews(req: Request, res: Response) {
    try {
      const { packageId } = req.params;
      const reviewRepository = AppDataSource.getRepository(Review);
      
      const reviews = await reviewRepository.find({
        where: { 
          travelPackage: { id: packageId },
          status: 'approved'
        },
        relations: ['user'],
        order: {
          createdAt: 'DESC'
        }
      });

      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Error fetching reviews' });
    }
  }

  static async moderateReview(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const { reviewId } = req.params;
      const { status } = req.body;

      const reviewRepository = AppDataSource.getRepository(Review);
      const review = await reviewRepository.findOne({ where: { id: reviewId } });

      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }

      review.status = status;
      await reviewRepository.save(review);

      res.json(review);
    } catch (error) {
      console.error('Error moderating review:', error);
      res.status(500).json({ message: 'Error moderating review' });
    }
  }
}