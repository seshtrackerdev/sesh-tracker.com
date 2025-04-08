import { Hono } from 'hono';
import { z } from 'zod';
import { AuthUser } from '../types/user';
import { Bindings } from '../types';

// Create a router for medical symptom tracking endpoints
const medicalSymptomRoutes = new Hono<{ 
  Bindings: Bindings,
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
  }
}>();

// Schema for medical symptom entry creation/updates
const symptomEntrySchema = z.object({
  userId: z.string(),
  symptom: z.string().min(1),
  severity: z.number().min(1).max(10),
  duration: z.string(),
  notes: z.string(),
  tags: z.array(z.string()),
  createdAt: z.string().datetime()
});

/**
 * Get all medical symptoms for the authenticated user
 */
medicalSymptomRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    // Query all symptom entries for this user
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
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
    console.error('Error fetching medical symptoms:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch medical symptoms',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Get a specific medical symptom by ID
 */
medicalSymptomRoutes.get('/:id', async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // Get the symptom entry
    const symptomEntry = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!symptomEntry) {
      return c.json({
        success: false,
        error: 'Medical symptom not found',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Parse tags
    const parsedEntry = {
      ...symptomEntry,
      tags: typeof symptomEntry.tags === 'string' 
        ? JSON.parse(symptomEntry.tags) 
        : symptomEntry.tags
    };
    
    return c.json({
      success: true,
      data: parsedEntry,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching medical symptom:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch medical symptom',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Create a new medical symptom
 */
medicalSymptomRoutes.post('/', async (c) => {
  const user = c.get('user');
  const data = await c.req.json();
  
  try {
    // Validate the data
    const validatedData = symptomEntrySchema.parse(data);
    
    // Generate a unique ID for the new symptom entry
    const symptomId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the symptom entry
    await c.env.DB.prepare(
      `INSERT INTO medicalSymptoms (id, userId, symptom, severity, duration, notes, tags, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      symptomId,
      user.id,
      validatedData.symptom,
      validatedData.severity,
      validatedData.duration,
      validatedData.notes,
      JSON.stringify(validatedData.tags),
      validatedData.createdAt || now,
      now
    ).run();
    
    // Return the created symptom entry
    return c.json({
      success: true,
      data: {
        id: symptomId,
        userId: user.id,
        symptom: validatedData.symptom,
        severity: validatedData.severity,
        duration: validatedData.duration,
        notes: validatedData.notes,
        tags: validatedData.tags,
        createdAt: validatedData.createdAt || now,
        updatedAt: now
      },
      timestamp: now
    }, 201);
  } catch (error) {
    console.error('Error creating medical symptom:', error);
    
    return c.json({
      success: false,
      error: 'Failed to create medical symptom',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Update an existing medical symptom
 */
medicalSymptomRoutes.put('/:id', async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  const data = await c.req.json();
  
  try {
    // Validate the data
    const validatedData = symptomEntrySchema.parse(data);
    
    // First check if the symptom entry exists and belongs to this user
    const existingSymptomEntry = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!existingSymptomEntry) {
      return c.json({
        success: false,
        error: 'Medical symptom not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Update the symptom entry
    await c.env.DB.prepare(
      `UPDATE medicalSymptoms
       SET symptom = ?, severity = ?, duration = ?, notes = ?, tags = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      validatedData.symptom,
      validatedData.severity,
      validatedData.duration,
      validatedData.notes,
      JSON.stringify(validatedData.tags),
      now,
      symptomId,
      user.id
    ).run();
    
    // Return the updated symptom entry
    return c.json({
      success: true,
      data: {
        id: symptomId,
        userId: user.id,
        symptom: validatedData.symptom,
        severity: validatedData.severity,
        duration: validatedData.duration,
        notes: validatedData.notes,
        tags: validatedData.tags,
        updatedAt: now
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating medical symptom:', error);
    
    return c.json({
      success: false,
      error: 'Failed to update medical symptom',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Delete a medical symptom
 */
medicalSymptomRoutes.delete('/:id', async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First check if the symptom entry exists and belongs to this user
    const existingSymptomEntry = await c.env.DB.prepare(
      `SELECT id FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!existingSymptomEntry) {
      return c.json({
        success: false,
        error: 'Medical symptom not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Delete the symptom entry
    await c.env.DB.prepare(
      `DELETE FROM medicalSymptoms
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).run();
    
    // Return success
    return c.json({
      success: true,
      data: { id: symptomId },
      message: 'Medical symptom deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting medical symptom:', error);
    
    return c.json({
      success: false,
      error: 'Failed to delete medical symptom',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

export default medicalSymptomRoutes; 