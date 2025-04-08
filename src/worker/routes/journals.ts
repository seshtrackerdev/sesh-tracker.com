import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AuthUser } from '../types/user';
import { Bindings } from '../types';

// Create a router for journal entry endpoints
const journalRoutes = new Hono<{ 
  Bindings: Bindings,
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
  }
}>();

// Schema for journal entry creation/updates
const journalEntrySchema = z.object({
  timestamp: z.string().datetime(),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  tags: z.array(z.string()),
  mood: z.number().min(1).max(10).optional(),
  associatedSession: z.string().uuid().optional(),
  isPrivate: z.boolean().default(true)
});

/**
 * Get all journal entries for the authenticated user
 */
journalRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    // Query all journal entries for this user
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM journalEntries 
       WHERE userId = ? 
       ORDER BY timestamp DESC`
    ).bind(user.id).all();
    
    return c.json({
      success: true,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch journal entries',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Get a specific journal entry by ID
 */
journalRoutes.get('/:id', async (c) => {
  const journalId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // Get the journal entry
    const journalEntry = await c.env.DB.prepare(
      `SELECT * FROM journalEntries 
       WHERE id = ? AND userId = ?`
    ).bind(journalId, user.id).first();
    
    if (!journalEntry) {
      return c.json({
        success: false,
        error: 'Journal entry not found',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    return c.json({
      success: true,
      data: journalEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch journal entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Create a new journal entry
 */
journalRoutes.post('/', zValidator('json', journalEntrySchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // Generate a unique ID for the new journal entry
    const journalId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the journal entry
    await c.env.DB.prepare(
      `INSERT INTO journalEntries (
        id, userId, timestamp, title, content, tags,
        mood, associatedSession, isPrivate, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      journalId,
      user.id,
      data.timestamp,
      data.title,
      data.content,
      JSON.stringify(data.tags),
      data.mood || null,
      data.associatedSession || null,
      data.isPrivate,
      now,
      now
    ).run();
    
    // Return the created journal entry
    return c.json({
      success: true,
      data: {
        id: journalId,
        userId: user.id,
        timestamp: data.timestamp,
        title: data.title,
        content: data.content,
        tags: data.tags,
        mood: data.mood,
        associatedSession: data.associatedSession,
        isPrivate: data.isPrivate,
        createdAt: now,
        updatedAt: now
      },
      timestamp: now
    }, 201);
  } catch (error) {
    console.error('Error creating journal entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to create journal entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Update an existing journal entry
 */
journalRoutes.put('/:id', zValidator('json', journalEntrySchema), async (c) => {
  const journalId = c.req.param('id');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // First check if the journal entry exists and belongs to this user
    const existingJournalEntry = await c.env.DB.prepare(
      `SELECT * FROM journalEntries 
       WHERE id = ? AND userId = ?`
    ).bind(journalId, user.id).first();
    
    if (!existingJournalEntry) {
      return c.json({
        success: false,
        error: 'Journal entry not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Update the journal entry
    await c.env.DB.prepare(
      `UPDATE journalEntries
       SET timestamp = ?, title = ?, content = ?, tags = ?,
           mood = ?, associatedSession = ?, isPrivate = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      data.timestamp,
      data.title,
      data.content,
      JSON.stringify(data.tags),
      data.mood || null,
      data.associatedSession || null,
      data.isPrivate,
      now,
      journalId,
      user.id
    ).run();
    
    // Return the updated journal entry
    return c.json({
      success: true,
      data: {
        id: journalId,
        userId: user.id,
        timestamp: data.timestamp,
        title: data.title,
        content: data.content,
        tags: data.tags,
        mood: data.mood,
        associatedSession: data.associatedSession,
        isPrivate: data.isPrivate,
        updatedAt: now
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to update journal entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Delete a journal entry
 */
journalRoutes.delete('/:id', async (c) => {
  const journalId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First check if the journal entry exists and belongs to this user
    const existingJournalEntry = await c.env.DB.prepare(
      `SELECT id FROM journalEntries 
       WHERE id = ? AND userId = ?`
    ).bind(journalId, user.id).first();
    
    if (!existingJournalEntry) {
      return c.json({
        success: false,
        error: 'Journal entry not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Delete the journal entry
    await c.env.DB.prepare(
      `DELETE FROM journalEntries
       WHERE id = ? AND userId = ?`
    ).bind(journalId, user.id).run();
    
    // Return success
    return c.json({
      success: true,
      data: { id: journalId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    
    return c.json({
      success: false,
      error: 'Failed to delete journal entry',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default journalRoutes; 