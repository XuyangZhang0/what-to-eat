import { Request, Response, NextFunction } from 'express';
import { AuthUtils } from '@/utils/auth.js';
import { UserModel } from '@/models/User.js';
import { JWTPayload } from '@/models/types.js';

// User interface is extended in types/express.d.ts

export const authenticateToken = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token is required'
      });
      return;
    }

    const decoded = AuthUtils.verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Verify user still exists in database
    const user = UserModel.findById(decoded.user_id);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Add user info to request
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error during authentication'
    });
  }
};

export const optionalAuth = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const token = AuthUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = AuthUtils.verifyToken(token);
      
      if (decoded) {
        const user = UserModel.findById(decoded.user_id);
        if (user) {
          req.user = decoded;
        }
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't want to fail the request
    console.error('Optional authentication error:', error);
    next();
  }
};

export const requireAuth = authenticateToken;