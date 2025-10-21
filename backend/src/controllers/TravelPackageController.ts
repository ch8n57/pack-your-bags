import { Request, Response } from 'express';
import { TravelPackage } from '../models/TravelPackage';
import { AppDataSource } from '../config/database';

export class TravelPackageController {
  static async getAllPackages(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const packages = await packageRepository.find({ where: { isAvailable: true } });
      res.json(packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      res.status(500).json({ message: 'Error fetching travel packages' });
    }
  }

  static async getPackageById(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const travelPackage = await packageRepository.findOne({ where: { id: req.params.id } });
      
      if (!travelPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      res.json(travelPackage);
    } catch (error) {
      console.error('Error fetching package:', error);
      res.status(500).json({ message: 'Error fetching travel package' });
    }
  }

  static async searchPackages(req: Request, res: Response) {
    try {
      const { destination, minPrice, maxPrice, duration } = req.query;
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      
      let query = packageRepository.createQueryBuilder('package')
        .where('package.isAvailable = :isAvailable', { isAvailable: true });

      if (destination) {
        query = query.andWhere('LOWER(package.destination) LIKE LOWER(:destination)', 
          { destination: `%${destination}%` });
      }

      if (minPrice) {
        query = query.andWhere('package.price >= :minPrice', { minPrice });
      }

      if (maxPrice) {
        query = query.andWhere('package.price <= :maxPrice', { maxPrice });
      }

      if (duration) {
        query = query.andWhere('package.duration <= :duration', { duration });
      }

      const packages = await query.getMany();
      res.json(packages);
    } catch (error) {
      console.error('Error searching packages:', error);
      res.status(500).json({ message: 'Error searching travel packages' });
    }
  }

  static async createPackage(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const newPackage = packageRepository.create(req.body);
      await packageRepository.save(newPackage);
      res.status(201).json(newPackage);
    } catch (error) {
      console.error('Error creating package:', error);
      res.status(500).json({ message: 'Error creating travel package' });
    }
  }

  static async updatePackage(req: Request, res: Response) {
    try {
      const packageRepository = AppDataSource.getRepository(TravelPackage);
      const travelPackage = await packageRepository.findOne({ where: { id: req.params.id } });
      
      if (!travelPackage) {
        return res.status(404).json({ message: 'Package not found' });
      }
      
      packageRepository.merge(travelPackage, req.body);
      const results = await packageRepository.save(travelPackage);
      res.json(results);
    } catch (error) {
      console.error('Error updating package:', error);
      res.status(500).json({ message: 'Error updating travel package' });
    }
  }
}