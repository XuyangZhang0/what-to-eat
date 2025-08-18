import { Request, Response } from 'express';
import { TagModel } from '@/models/Tag.js';
import { asyncHandler } from '@/middleware/errorHandler.js';

export class TagsController {
  // Get all tags
  static getTags = asyncHandler(async (req: Request, res: Response) => {
    const tags = TagModel.findAll();

    res.json({
      success: true,
      data: tags
    });
  });

  // Get single tag by ID
  static getTag = asyncHandler(async (req: Request, res: Response) => {
    const tagId = Number(req.params.id);
    const tag = TagModel.findById(tagId);

    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    res.json({
      success: true,
      data: tag
    });
  });

  // Create new tag
  static createTag = asyncHandler(async (req: Request, res: Response) => {
    const { name, color } = req.body;

    // Check if tag name already exists
    if (TagModel.nameExists(name)) {
      return res.status(409).json({
        success: false,
        error: 'Tag name already exists'
      });
    }

    const tag = TagModel.create({ name, color });

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag created successfully'
    });
  });

  // Update tag
  static updateTag = asyncHandler(async (req: Request, res: Response) => {
    const tagId = Number(req.params.id);
    const { name, color } = req.body;

    const existingTag = TagModel.findById(tagId);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Check if new name already exists (excluding current tag)
    if (name && TagModel.nameExists(name, tagId)) {
      return res.status(409).json({
        success: false,
        error: 'Tag name already exists'
      });
    }

    const updatedTag = TagModel.update(tagId, { name, color });

    if (!updatedTag) {
      return res.status(404).json({
        success: false,
        error: 'Failed to update tag'
      });
    }

    res.json({
      success: true,
      data: updatedTag,
      message: 'Tag updated successfully'
    });
  });

  // Delete tag
  static deleteTag = asyncHandler(async (req: Request, res: Response) => {
    const tagId = Number(req.params.id);

    const existingTag = TagModel.findById(tagId);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    // Check if tag is being used
    const usageStats = TagModel.getUsageStats(tagId);
    if (usageStats.total_usage > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete tag that is currently in use',
        details: {
          meal_count: usageStats.meal_count,
          restaurant_count: usageStats.restaurant_count,
          total_usage: usageStats.total_usage
        }
      });
    }

    const deleted = TagModel.delete(tagId);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete tag'
      });
    }

    res.json({
      success: true,
      message: 'Tag deleted successfully'
    });
  });

  // Get tags used by meals
  static getMealTags = asyncHandler(async (req: Request, res: Response) => {
    const tags = TagModel.getMealTags();

    res.json({
      success: true,
      data: tags
    });
  });

  // Get tags used by restaurants
  static getRestaurantTags = asyncHandler(async (req: Request, res: Response) => {
    const tags = TagModel.getRestaurantTags();

    res.json({
      success: true,
      data: tags
    });
  });

  // Get tag usage statistics
  static getTagUsage = asyncHandler(async (req: Request, res: Response) => {
    const tagId = Number(req.params.id);

    const existingTag = TagModel.findById(tagId);
    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found'
      });
    }

    const usageStats = TagModel.getUsageStats(tagId);

    res.json({
      success: true,
      data: {
        tag: existingTag,
        usage: usageStats
      }
    });
  });

  // Get unused tags
  static getUnusedTags = asyncHandler(async (req: Request, res: Response) => {
    const unusedTags = TagModel.getUnusedTags();

    res.json({
      success: true,
      data: unusedTags
    });
  });

  // Get most used tags
  static getMostUsedTags = asyncHandler(async (req: Request, res: Response) => {
    const limit = Number(req.query.limit) || 10;
    const mostUsedTags = TagModel.getMostUsedTags(limit);

    res.json({
      success: true,
      data: mostUsedTags
    });
  });

  // Bulk delete unused tags
  static deleteUnusedTags = asyncHandler(async (req: Request, res: Response) => {
    const unusedTags = TagModel.getUnusedTags();
    
    if (unusedTags.length === 0) {
      return res.json({
        success: true,
        message: 'No unused tags to delete',
        data: { deleted_count: 0 }
      });
    }

    let deletedCount = 0;
    for (const tag of unusedTags) {
      if (TagModel.delete(tag.id)) {
        deletedCount++;
      }
    }

    res.json({
      success: true,
      message: `Deleted ${deletedCount} unused tags`,
      data: { deleted_count: deletedCount }
    });
  });
}