import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AuthUser } from '../types/user';
import { Bindings } from '../types';

// Create a router for mood tracking endpoints
const moodRoutes = new Hono<{ 
  Bindings: Bindings,
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
  }
}>();

// Schema for mood entry creation/updates
const moodEntrySchema = z.object({
  userId: z.string(),
  rating: z.number().min(1).max(10),
  note: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime()
});

/**
 * Get all mood entries for the authenticated user
 */
moodRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    // Query all mood entries for this user
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM moodEntries 
       WHERE userId = ? 
       ORDER BY createdAt DESC`
    ).bind(user.id).all();
    
    // Parse tags which are stored as JSON strings
    const parsedResults = results.map(entry => ({
      ...entry,
      tags: typeof entry.tags === 'string' ? JSON.parse(entry.tags) : entry.tags
    }));
    
    return c.json({
      success: true,
      data: parsedResults,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch mood entries',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Get a specific mood entry by ID
 */
moodRoutes.get('/:id', async (c) => {
  const moodId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // Get the mood entry
    const moodEntry = await c.env.DB.prepare(
      `SELECT * FROM moodEntries 
       WHERE id = ? AND userId = ?`
    ).bind(moodId, user.id).first();
    
    if (!moodEntry) {
      return c.json({
        success: false,
        error: 'Mood entry not found',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Parse tags
    const parsedEntry = {
      ...moodEntry,
      tags: typeof moodEntry.tags === 'string' 
        ? JSON.parse(moodEntry.tags) 
        : moodEntry.tags
    };
    
    return c.json({
      success: true,
      data: parsedEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching mood entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch mood entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Create a new mood entry
 */
moodRoutes.post('/', zValidator('json', moodEntrySchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // Generate a unique ID for the new mood entry
    const moodId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the mood entry
    await c.env.DB.prepare(
      `INSERT INTO moodEntries (id, userId, rating, note, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      moodId,
      user.id,
      data.rating,
      data.note,
      JSON.stringify(data.tags),
      data.createdAt || now,
      now
    ).run();
    
    // Return the created mood entry
    return c.json({
      success: true,
      data: {
        id: moodId,
        userId: user.id,
        rating: data.rating,
        note: data.note,
        tags: data.tags,
        createdAt: data.createdAt || now,
        updatedAt: now
      },
      timestamp: now
    }, 201);
  } catch (error) {
    console.error('Error creating mood entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to create mood entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Update an existing mood entry
 */
moodRoutes.put('/:id', zValidator('json', moodEntrySchema), async (c) => {
  const moodId = c.req.param('id');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // First check if the mood entry exists and belongs to this user
    const existingMoodEntry = await c.env.DB.prepare(
      `SELECT * FROM moodEntries 
       WHERE id = ? AND userId = ?`
    ).bind(moodId, user.id).first();
    
    if (!existingMoodEntry) {
      return c.json({
        success: false,
        error: 'Mood entry not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Update the mood entry
    await c.env.DB.prepare(
      `UPDATE moodEntries
       SET rating = ?, note = ?, tags = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      data.rating,
      data.note,
      JSON.stringify(data.tags),
      now,
      moodId,
      user.id
    ).run();
    
    // Return the updated mood entry
    return c.json({
      success: true,
      data: {
        id: moodId,
        userId: user.id,
        rating: data.rating,
        note: data.note,
        tags: data.tags,
        updatedAt: now
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating mood entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to update mood entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Delete a mood entry
 */
moodRoutes.delete('/:id', async (c) => {
  const moodId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First check if the mood entry exists and belongs to this user
    const existingMoodEntry = await c.env.DB.prepare(
      `SELECT id FROM moodEntries 
       WHERE id = ? AND userId = ?`
    ).bind(moodId, user.id).first();
    
    if (!existingMoodEntry) {
      return c.json({
        success: false,
        error: 'Mood entry not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Delete the mood entry
    await c.env.DB.prepare(
      `DELETE FROM moodEntries
       WHERE id = ? AND userId = ?`
    ).bind(moodId, user.id).run();
    
    // Return success
    return c.json({
      success: true,
      data: { id: moodId },
      message: 'Mood entry deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to delete mood entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default moodRoutes; 