import { Request, Response } from 'express';
import { UserModel } from '@/models/User.js';
import { AuthUtils } from '@/utils/auth.js';
import { asyncHandler } from '@/middleware/errorHandler.js';

export class AuthController {
  // Register a new user
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { username, email, password, preferences } = req.body;

    // Check if user already exists
    if (UserModel.emailExists(email)) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }

    if (UserModel.usernameExists(username)) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Hash password
    const password_hash = await AuthUtils.hashPassword(password);

    // Create user
    const user = UserModel.create({
      username,
      email,
      password_hash,
      preferences: preferences || {}
    });

    // Generate token
    const token = AuthUtils.generateToken({
      user_id: user.id,
      username: user.username,
      email: user.email
    });

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'User registered successfully'
    });
  });

  // Login user
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Find user by email
    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = AuthUtils.generateToken({
      user_id: user.id,
      username: user.username,
      email: user.email
    });

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    res.json({
      success: true,
      data: {
        user: userResponse,
        token
      },
      message: 'Login successful'
    });
  });

  // Get current user profile
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const user = UserModel.findById(req.user.user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = user;

    res.json({
      success: true,
      data: userResponse
    });
  });

  // Update user profile
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { username, email, preferences } = req.body;
    const userId = req.user.user_id;

    // Check if new email/username already exists (excluding current user)
    if (email) {
      const existingUser = UserModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }

    if (username) {
      const existingUser = UserModel.findByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }
    }

    // Update user
    const updatedUser = UserModel.update(userId, {
      username,
      email,
      preferences
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove password hash from response
    const { password_hash: _, ...userResponse } = updatedUser;

    res.json({
      success: true,
      data: userResponse,
      message: 'Profile updated successfully'
    });
  });

  // Change password
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Get current user
    const user = UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await AuthUtils.comparePassword(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Password validation is now handled by Joi middleware

    // Hash new password
    const newPasswordHash = await AuthUtils.hashPassword(newPassword);

    // Update password
    const updatedUser = UserModel.update(userId, { 
      password_hash: newPasswordHash
    });

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password'
      });
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  });

  // Refresh token
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    const newToken = AuthUtils.refreshToken(token);
    if (!newToken) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    res.json({
      success: true,
      data: {
        token: newToken
      },
      message: 'Token refreshed successfully'
    });
  });

  // Logout (client-side token removal, but we can track it server-side if needed)
  static logout = asyncHandler(async (req: Request, res: Response) => {
    // In a stateless JWT system, logout is handled client-side
    // But we can add token blacklisting here if needed
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
}