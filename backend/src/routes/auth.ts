import express from 'express';
import { AuthController } from '../controllers/AuthController';
// Lazy import to avoid adding new dependency if not installed in environment
let rateLimit: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  rateLimit = require('express-rate-limit');
} catch {
  rateLimit = () => (req: any, _res: any, next: any) => next();
}

const router = express.Router();

// Basic rate limiting for auth endpoints
const authLimiter = rateLimit({ windowMs: 2 * 60 * 1000, max: 20 });

// Auth routes
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);

export default router;