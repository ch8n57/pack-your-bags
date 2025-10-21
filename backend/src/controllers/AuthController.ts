import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database';
import { validate } from 'class-validator';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All required fields must be provided' });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const user = userRepository.create({
        firstName,
        lastName,
        email,
        password: await bcrypt.hash(password, 10),
        phoneNumber,
        role: 'user'
      });

      // Validate user entity
      const errors = await validate(user);
      if (errors.length > 0) {
        return res.status(400).json({ message: 'Validation failed', errors });
      }

      // Save user
      const savedUser = await userRepository.save(user);
      
      // Create JWT token
      const token = jwt.sign(
        { userId: savedUser.id, email: savedUser.email, role: savedUser.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '24h' }
      );

      // Return success with token
      res.status(201).json({ 
        message: 'User registered successfully',
        token,
        user: {
          id: savedUser.id,
          firstName: savedUser.firstName,
          lastName: savedUser.lastName,
          email: savedUser.email,
          role: savedUser.role
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Error registering user' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      // Find user
      const user = await userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '1h' }
      );

      res.json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Error logging in' });
    }
  }
}