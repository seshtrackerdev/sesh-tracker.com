import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

// Create a router for medical symptom tracking endpoints
const symptomRoutes = new Hono<{ 
  Bindings: Env,
  Variables: {
    user: AuthUser;
    isDemoAccount?: boolean;
    requestSource?: string;
  }
}>();

// Schema for medical symptom creation/updates
const symptomSchema = z.object({
  timestamp: z.string().datetime(),
  symptomType: z.string().min(1),
  severity: z.number().min(1).max(10),
  duration: z.number().min(0),
  bodyLocation: z.string().optional(),
  treatments: z.array(z.string()),
  effectivenessRating: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  associatedSession: z.string().uuid().optional()
});

/**
 * Get all medical symptoms for the authenticated user
 */
symptomRoutes.get('/', async (c) => {
  const user = c.get('user');
  
  try {
    // Query all symptoms for this user
    const { results } = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
       WHERE userId = ? 
       ORDER BY timestamp DESC`
    ).bind(user.id).all();
    
    return c.json({
      success: true,
      data: results,
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
symptomRoutes.get('/:id', async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // Get the symptom
    const symptom = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!symptom) {
      return c.json({
        success: false,
        error: 'Medical symptom not found',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    return c.json({
      success: true,
      data: symptom,
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
symptomRoutes.post('/', zValidator('json', symptomSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // Generate a unique ID for the new symptom
    const symptomId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the symptom
    await c.env.DB.prepare(
      `INSERT INTO medicalSymptoms (
        id, userId, timestamp, symptomType, severity, duration, bodyLocation, 
        treatments, effectivenessRating, notes, associatedSession, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      symptomId,
      user.id,
      data.timestamp,
      data.symptomType,
      data.severity,
      data.duration,
      data.bodyLocation || null,
      JSON.stringify(data.treatments),
      data.effectivenessRating || null,
      data.notes || null,
      data.associatedSession || null,
      now,
      now
    ).run();
    
    // Return the created symptom
    return c.json({
      success: true,
      data: {
        id: symptomId,
        userId: user.id,
        timestamp: data.timestamp,
        symptomType: data.symptomType,
        severity: data.severity,
        duration: data.duration,
        bodyLocation: data.bodyLocation,
        treatments: data.treatments,
        effectivenessRating: data.effectivenessRating,
        notes: data.notes,
        associatedSession: data.associatedSession,
        createdAt: now,
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
symptomRoutes.put('/:id', zValidator('json', symptomSchema), async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // First check if the symptom exists and belongs to this user
    const existingSymptom = await c.env.DB.prepare(
      `SELECT * FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!existingSymptom) {
      return c.json({
        success: false,
        error: 'Medical symptom not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Update the symptom
    await c.env.DB.prepare(
      `UPDATE medicalSymptoms
       SET timestamp = ?, symptomType = ?, severity = ?, duration = ?, 
           bodyLocation = ?, treatments = ?, effectivenessRating = ?, 
           notes = ?, associatedSession = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      data.timestamp,
      data.symptomType,
      data.severity,
      data.duration,
      data.bodyLocation || null,
      JSON.stringify(data.treatments),
      data.effectivenessRating || null,
      data.notes || null,
      data.associatedSession || null,
      now,
      symptomId,
      user.id
    ).run();
    
    // Return the updated symptom
    return c.json({
      success: true,
      data: {
        id: symptomId,
        userId: user.id,
        timestamp: data.timestamp,
        symptomType: data.symptomType,
        severity: data.severity,
        duration: data.duration,
        bodyLocation: data.bodyLocation,
        treatments: data.treatments,
        effectivenessRating: data.effectivenessRating,
        notes: data.notes,
        associatedSession: data.associatedSession,
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
symptomRoutes.delete('/:id', async (c) => {
  const symptomId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First check if the symptom exists and belongs to this user
    const existingSymptom = await c.env.DB.prepare(
      `SELECT id FROM medicalSymptoms 
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).first();
    
    if (!existingSymptom) {
      return c.json({
        success: false,
        error: 'Medical symptom not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Delete the symptom
    await c.env.DB.prepare(
      `DELETE FROM medicalSymptoms
       WHERE id = ? AND userId = ?`
    ).bind(symptomId, user.id).run();
    
    // Return success
    return c.json({
      success: true,
      data: { id: symptomId },
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

export default symptomRoutes; 