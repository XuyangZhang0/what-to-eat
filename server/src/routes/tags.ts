import { Router } from 'express';
import { TagsController } from '@/controllers/tagsController.js';
import { requireAuth } from '@/middleware/auth.js';
import { 
  validateBody, 
  validateParams,
  parseIdParam
} from '@/middleware/validation.js';
import { 
  tagCreateSchema, 
  tagUpdateSchema,
  idParamSchema 
} from '@/validation/schemas.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/tags - Get all tags
router.get('/', TagsController.getTags);

// GET /api/tags/meals - Get tags used by meals
router.get('/meals', TagsController.getMealTags);

// GET /api/tags/restaurants - Get tags used by restaurants
router.get('/restaurants', TagsController.getRestaurantTags);

// GET /api/tags/unused - Get unused tags
router.get('/unused', TagsController.getUnusedTags);

// GET /api/tags/most-used - Get most used tags
router.get('/most-used', TagsController.getMostUsedTags);

// DELETE /api/tags/unused - Bulk delete unused tags
router.delete('/unused', TagsController.deleteUnusedTags);

// POST /api/tags - Create new tag
router.post('/', 
  validateBody(tagCreateSchema), 
  TagsController.createTag
);

// GET /api/tags/:id - Get single tag
router.get('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  TagsController.getTag
);

// PUT /api/tags/:id - Update tag
router.put('/:id', 
  parseIdParam,
  validateParams(idParamSchema),
  validateBody(tagUpdateSchema), 
  TagsController.updateTag
);

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', 
  parseIdParam,
  validateParams(idParamSchema), 
  TagsController.deleteTag
);

// GET /api/tags/:id/usage - Get tag usage statistics
router.get('/:id/usage', 
  parseIdParam,
  validateParams(idParamSchema), 
  TagsController.getTagUsage
);

export default router;