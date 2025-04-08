import { Hono } from 'hono';
import { AuthUser } from '../types/user';
import { Bindings, AppContext } from '../types';
import { z } from 'zod';

const dashboardRoutes = new Hono<AppContext>();

// --- Existing Dashboard CRUD would go here --- 
// (e.g., GET /, POST /, PUT /:id, DELETE /:id)

// --- Widget Data Endpoints ---

/**
 * Endpoint to fetch data for the Status Indicators widget.
 */
dashboardRoutes.get('/widgets/status-indicators', async (c) => {
  const user = c.get('user'); // Get user from auth middleware context
  if (!user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const db = c.env.DB; // Get D1 binding

  // Placeholder: Define thresholds (ideally from widget config or user prefs)
  const lowStockThreshold = 5; // Example quantity threshold
  const expiryThresholdDays = 7; // Example days until expiry

  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const expiryCutoff = now + (expiryThresholdDays * 24 * 60 * 60);

  try {
    // Query for low stock items
    const lowStockStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM inventory 
       WHERE userId = ? AND quantity <= ? AND isActive = 1`
    ).bind(user.id, lowStockThreshold);
    const lowStockResult = await lowStockStmt.first<{ count: number }>();

    // Query for expiring soon items (using expiryDate stored as UNIX timestamp seconds)
    const expiringStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM inventory 
       WHERE userId = ? AND expiryDate IS NOT NULL AND expiryDate <= ? AND isActive = 1`
    ).bind(user.id, expiryCutoff);
    const expiringResult = await expiringStmt.first<{ count: number }>();

    return c.json({
      success: true,
      data: {
        lowStockItemsCount: lowStockResult?.count ?? 0,
        expiringSoonItemsCount: expiringResult?.count ?? 0,
        // Add other relevant indicators here if needed
      }
    });

  } catch (error) {
    console.error('Error fetching status indicator data:', error);
    return c.json({ success: false, error: 'Failed to fetch widget data' }, 500);
  }
});

// --- Other widget data endpoints --- 

export default dashboardRoutes; 