import { Hono } from 'hono';
import { z } from 'zod';

// Create a router for journal entry tracking endpoints
const journalRoutes = new Hono<{ 
  Bindings: Env,
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
  }
}>();

// Schema for journal entry creation/updates
const journalEntrySchema = z.object({
  userId: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()),
  mood: z.number().min(1).max(10).optional(),
  isPrivate: z.boolean().default(true),
  createdAt: z.string().datetime()
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
    
    // Parse tags
    const parsedEntry = {
      ...journalEntry,
      tags: typeof journalEntry.tags === 'string' 
        ? JSON.parse(journalEntry.tags) 
        : journalEntry.tags
    };
    
    return c.json({
      success: true,
      data: parsedEntry,
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
journalRoutes.post('/', async (c) => {
  const user = c.get('user');
  const data = await c.req.json();
  
  try {
    // Validate the data
    const validatedData = journalEntrySchema.parse(data);
    
    // Generate a unique ID for the new journal entry
    const journalId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the journal entry
    await c.env.DB.prepare(
      `INSERT INTO journalEntries (id, userId, title, content, tags, mood, isPrivate, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      journalId,
      user.id,
      validatedData.title,
      validatedData.content,
      JSON.stringify(validatedData.tags),
      validatedData.mood || null,
      validatedData.isPrivate ? 1 : 0,
      validatedData.createdAt || now,
      now
    ).run();
    
    // Return the created journal entry
    return c.json({
      success: true,
      data: {
        id: journalId,
        userId: user.id,
        title: validatedData.title,
        content: validatedData.content,
        tags: validatedData.tags,
        mood: validatedData.mood,
        isPrivate: validatedData.isPrivate,
        createdAt: validatedData.createdAt || now,
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
journalRoutes.put('/:id', async (c) => {
  const journalId = c.req.param('id');
  const user = c.get('user');
  const data = await c.req.json();
  
  try {
    // Validate the data
    const validatedData = journalEntrySchema.parse(data);
    
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
       SET title = ?, content = ?, tags = ?, mood = ?, isPrivate = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      validatedData.title,
      validatedData.content,
      JSON.stringify(validatedData.tags),
      validatedData.mood || null,
      validatedData.isPrivate ? 1 : 0,
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
        title: validatedData.title,
        content: validatedData.content,
        tags: validatedData.tags,
        mood: validatedData.mood,
        isPrivate: validatedData.isPrivate,
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
      message: 'Journal entry deleted successfully',
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