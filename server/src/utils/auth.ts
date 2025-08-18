import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '@/models/types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export class AuthUtils {
  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate JWT token
  static generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const options: any = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload as object, JWT_SECRET, options);
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Extract token from Authorization header
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  // Generate a secure random token (for password reset, etc.)
  static generateRandomToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Validate password strength
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  // Refresh token (generate new token with same payload but updated expiration)
  static refreshToken(token: string): string | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      // Remove the iat and exp fields to generate a fresh token
      const { iat, exp, ...payload } = decoded;
      
      return this.generateToken(payload);
    } catch {
      return null;
    }
  }
}