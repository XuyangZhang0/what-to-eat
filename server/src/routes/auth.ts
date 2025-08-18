import { Router } from 'express';
import { AuthController } from '@/controllers/authController.js';
import { validateBody } from '@/middleware/validation.js';
import { requireAuth } from '@/middleware/auth.js';
import { 
  userRegisterSchema, 
  userLoginSchema, 
  userUpdateSchema,
  userChangePasswordSchema
} from '@/validation/schemas.js';

const router = Router();

// Public routes
router.post('/register', validateBody(userRegisterSchema), AuthController.register);
router.post('/login', validateBody(userLoginSchema), AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected routes
router.use(requireAuth); // All routes below require authentication

router.get('/me', AuthController.getProfile);
router.put('/me', validateBody(userUpdateSchema), AuthController.updateProfile);
router.post('/change-password', validateBody(userChangePasswordSchema), AuthController.changePassword);
router.post('/logout', AuthController.logout);

export default router;