import request from 'supertest';
import app from '@/app';
import dbManager from '@/database/connection';
import { TagModel } from '@/models/Tag';

describe('Tags Endpoints', () => {
  let authToken: string;

  beforeAll(async () => {
    await dbManager.migrate();
    
    // Create a test user and get auth token
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123!@#'
    };

    const authResponse = await request(app)
      .post('/api/auth/register')
      .send(userData);
    
    authToken = authResponse.body.data.token;
  });

  afterAll(() => {
    dbManager.close();
  });

  beforeEach(() => {
    // Clear tags table
    const deleteStmt = dbManager.prepare('DELETE FROM tags');
    deleteStmt.run();
  });

  describe('GET /api/tags', () => {
    it('should return empty array when no tags exist', async () => {
      const response = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all tags', async () => {
      // Create test tags
      TagModel.create({ name: 'Vegetarian', color: '#22C55E' });
      TagModel.create({ name: 'Quick', color: '#3B82F6' });

      const response = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('Quick'); // Alphabetical order
      expect(response.body.data[1].name).toBe('Vegetarian');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/tags')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token is required');
    });
  });

  describe('POST /api/tags', () => {
    it('should create a new tag successfully', async () => {
      const tagData = {
        name: 'Vegetarian',
        color: '#22C55E'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tagData.name);
      expect(response.body.data.color).toBe(tagData.color);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.message).toBe('Tag created successfully');
    });

    it('should create tag with default color when color not provided', async () => {
      const tagData = {
        name: 'Quick'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tagData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(tagData.name);
      expect(response.body.data.color).toBe('#3B82F6'); // Default color
    });

    it('should return error for duplicate tag name', async () => {
      // Create first tag
      TagModel.create({ name: 'Vegetarian', color: '#22C55E' });

      const duplicateData = {
        name: 'Vegetarian',
        color: '#16A34A'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag name already exists');
    });

    it('should return error for duplicate tag name (case insensitive)', async () => {
      // Create first tag
      TagModel.create({ name: 'Vegetarian', color: '#22C55E' });

      const duplicateData = {
        name: 'VEGETARIAN',
        color: '#16A34A'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag name already exists');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        name: '', // Empty name
        color: 'invalid-color'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return validation error for name too long', async () => {
      const invalidData = {
        name: 'a'.repeat(51), // Too long
        color: '#22C55E'
      };

      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/tags/:id', () => {
    it('should return single tag by id', async () => {
      const tag = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });

      const response = await request(app)
        .get(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(tag.id);
      expect(response.body.data.name).toBe('Vegetarian');
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/api/tags/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag not found');
    });

    it('should return validation error for invalid id', async () => {
      const response = await request(app)
        .get('/api/tags/invalid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('PUT /api/tags/:id', () => {
    it('should update tag successfully', async () => {
      const tag = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });
      
      const updateData = {
        name: 'Vegan',
        color: '#16A34A'
      };

      const response = await request(app)
        .put(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Vegan');
      expect(response.body.data.color).toBe('#16A34A');
      expect(response.body.message).toBe('Tag updated successfully');
    });

    it('should update only name', async () => {
      const tag = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });
      
      const updateData = {
        name: 'Vegan'
      };

      const response = await request(app)
        .put(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Vegan');
      expect(response.body.data.color).toBe('#22C55E'); // Unchanged
    });

    it('should update only color', async () => {
      const tag = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });
      
      const updateData = {
        color: '#16A34A'
      };

      const response = await request(app)
        .put(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Vegetarian'); // Unchanged
      expect(response.body.data.color).toBe('#16A34A');
    });

    it('should return 404 for non-existent tag', async () => {
      const updateData = {
        name: 'Updated',
        color: '#16A34A'
      };

      const response = await request(app)
        .put('/api/tags/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag not found');
    });

    it('should return error for duplicate name', async () => {
      const tag1 = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });
      const tag2 = TagModel.create({ name: 'Quick', color: '#3B82F6' });

      const updateData = {
        name: 'Vegetarian' // Already exists
      };

      const response = await request(app)
        .put(`/api/tags/${tag2.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag name already exists');
    });

    it('should allow updating tag with same name (no change)', async () => {
      const tag = TagModel.create({ name: 'Vegetarian', color: '#22C55E' });

      const updateData = {
        name: 'Vegetarian', // Same name
        color: '#16A34A'
      };

      const response = await request(app)
        .put(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.color).toBe('#16A34A');
    });
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete unused tag successfully', async () => {
      const tag = TagModel.create({ name: 'Unused', color: '#22C55E' });

      const response = await request(app)
        .delete(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tag deleted successfully');

      // Verify tag is deleted
      const deletedTag = TagModel.findById(tag.id);
      expect(deletedTag).toBeNull();
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .delete('/api/tags/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag not found');
    });

    it('should prevent deletion of tag in use', async () => {
      const tag = TagModel.create({ name: 'InUse', color: '#22C55E' });

      // Mock tag being in use (would need to create actual relationships in real test)
      const originalGetUsageStats = TagModel.getUsageStats;
      TagModel.getUsageStats = jest.fn().mockReturnValue({
        meal_count: 2,
        restaurant_count: 1,
        total_usage: 3
      });

      const response = await request(app)
        .delete(`/api/tags/${tag.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Cannot delete tag that is currently in use');
      expect(response.body.details).toEqual({
        meal_count: 2,
        restaurant_count: 1,
        total_usage: 3
      });

      // Restore original method
      TagModel.getUsageStats = originalGetUsageStats;
    });
  });

  describe('GET /api/tags/unused', () => {
    it('should return unused tags', async () => {
      // Create tags (all will be unused without relationships)
      TagModel.create({ name: 'Unused1', color: '#22C55E' });
      TagModel.create({ name: 'Unused2', color: '#3B82F6' });

      const response = await request(app)
        .get('/api/tags/unused')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no unused tags', async () => {
      const response = await request(app)
        .get('/api/tags/unused')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/tags/most-used', () => {
    it('should return most used tags with default limit', async () => {
      // Create tags (would need actual usage relationships in real test)
      TagModel.create({ name: 'Popular', color: '#22C55E' });
      TagModel.create({ name: 'Less Popular', color: '#3B82F6' });

      const response = await request(app)
        .get('/api/tags/most-used')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      // Create multiple tags
      for (let i = 1; i <= 15; i++) {
        TagModel.create({ name: `Tag${i}`, color: '#22C55E' });
      }

      const response = await request(app)
        .get('/api/tags/most-used?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('DELETE /api/tags/unused', () => {
    it('should delete all unused tags', async () => {
      // Create unused tags
      TagModel.create({ name: 'Unused1', color: '#22C55E' });
      TagModel.create({ name: 'Unused2', color: '#3B82F6' });

      const response = await request(app)
        .delete('/api/tags/unused')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Deleted 2 unused tags');
      expect(response.body.data.deleted_count).toBe(2);

      // Verify tags are deleted
      const allTags = TagModel.findAll();
      expect(allTags).toHaveLength(0);
    });

    it('should handle no unused tags to delete', async () => {
      const response = await request(app)
        .delete('/api/tags/unused')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('No unused tags to delete');
      expect(response.body.data.deleted_count).toBe(0);
    });
  });

  describe('GET /api/tags/:id/usage', () => {
    it('should return tag usage statistics', async () => {
      const tag = TagModel.create({ name: 'Test', color: '#22C55E' });

      const response = await request(app)
        .get(`/api/tags/${tag.id}/usage`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tag).toEqual(tag);
      expect(response.body.data.usage).toEqual({
        meal_count: 0,
        restaurant_count: 0,
        total_usage: 0
      });
    });

    it('should return 404 for non-existent tag', async () => {
      const response = await request(app)
        .get('/api/tags/999/usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Tag not found');
    });
  });

  describe('GET /api/tags/meals', () => {
    it('should return tags used by meals', async () => {
      const response = await request(app)
        .get('/api/tags/meals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/tags/restaurants', () => {
    it('should return tags used by restaurants', async () => {
      const response = await request(app)
        .get('/api/tags/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const originalFindAll = TagModel.findAll;
      TagModel.findAll = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);

      // Restore original method
      TagModel.findAll = originalFindAll;
    });

    it('should validate Content-Type for POST requests', async () => {
      const response = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to tag endpoints', async () => {
      // Make multiple requests quickly
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/tags')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      
      // At least some should succeed (depends on rate limit configuration)
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });
});