import { Hono } from 'hono';
import { Context } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { v4 as uuidv4 } from 'uuid';
import { AuthUser } from '../types/user';
import { Bindings } from '../types';

// Custom context type with authenticated user
interface DashboardContext {
  user: AuthUser;
}

// Create a new Hono app with typed bindings and variables
const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: AuthUser };
}>();

// Schema for dashboard creation/updates
const dashboardSchema = z.object({
  name: z.string().min(1).max(100),
  layoutData: z.string().min(2), // Minimum JSON structure
  isDefault: z.boolean().optional(),
  version: z.number().optional()
});

// Schema for widget creation/updates
const widgetSchema = z.object({
  dashboardId: z.string().uuid(),
  widgetTypeId: z.string().min(1),
  props: z.string(), // JSON stringified props
  showTitle: z.boolean().optional()
});

// Get all dashboards for the authenticated user
app.get('/', async (c) => {
  const user = c.get('user');

  try {
    // Query dashboards from the database
    const { results } = await c.env.DB.prepare(
      `SELECT id, name, is_default, created_at, updated_at 
       FROM dashboards 
       WHERE user_id = ? 
       ORDER BY updated_at DESC`
    )
    .bind(user.id)
    .all();

    return c.json(results);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return c.json({ error: 'Failed to fetch dashboards' }, 500);
  }
});

/**
 * Get a specific dashboard by ID
 */
app.get('/:id', async (c) => {
  const dashboardId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First get the dashboard
    const dashboard = await c.env.DB.prepare(
      `SELECT * FROM dashboards 
       WHERE id = ? AND userId = ?`
    ).bind(dashboardId, user.id).first();
    
    if (!dashboard) {
      return c.json({
        success: false,
        error: 'Dashboard not found',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Then get all widgets for this dashboard
    const { results: widgets } = await c.env.DB.prepare(
      `SELECT * FROM widgets 
       WHERE dashboardId = ?`
    ).bind(dashboardId).all();
    
    // Combine into a single response
    return c.json({
      success: true,
      data: {
        dashboard,
        widgets
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch dashboard',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Create a new dashboard
 */
app.post('/', zValidator('json', dashboardSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // Generate a unique ID for the new dashboard
    const dashboardId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the dashboard
    await c.env.DB.prepare(
      `INSERT INTO dashboards (id, userId, name, layoutData, isDefault, version, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      dashboardId,
      user.id,
      data.name,
      data.layoutData,
      data.isDefault || false,
      data.version || 1,
      now,
      now
    ).run();
    
    // Return the created dashboard
    return c.json({
      success: true,
      data: {
        id: dashboardId,
        userId: user.id,
        name: data.name,
        layoutData: data.layoutData,
        isDefault: data.isDefault || false,
        version: data.version || 1,
        createdAt: now,
        updatedAt: now
      },
      timestamp: now
    }, 201);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    
    return c.json({
      success: false,
      error: 'Failed to create dashboard',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Update an existing dashboard
 */
app.put('/:id', zValidator('json', dashboardSchema), async (c) => {
  const dashboardId = c.req.param('id');
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // First check if the dashboard exists and belongs to this user
    const existingDashboard = await c.env.DB.prepare(
      `SELECT * FROM dashboards 
       WHERE id = ? AND userId = ?`
    ).bind(dashboardId, user.id).first() as { version: number; isDefault: boolean; createdAt: string } | null;
    
    if (!existingDashboard) {
      return c.json({
        success: false,
        error: 'Dashboard not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Check for version conflicts (optimistic concurrency control)
    if (data.version && existingDashboard.version > data.version) {
      return c.json({
        success: false,
        error: 'Version conflict - dashboard has been modified since last fetch',
        code: 'VERSION_CONFLICT',
        currentVersion: existingDashboard.version,
        timestamp: new Date().toISOString()
      }, 409);
    }
    
    const now = new Date().toISOString();
    const newVersion = existingDashboard.version + 1;
    
    // Update the dashboard
    await c.env.DB.prepare(
      `UPDATE dashboards 
       SET name = ?, layoutData = ?, isDefault = ?, version = ?, updatedAt = ?
       WHERE id = ? AND userId = ?`
    ).bind(
      data.name,
      data.layoutData,
      data.isDefault || existingDashboard.isDefault,
      newVersion,
      now,
      dashboardId,
      user.id
    ).run();
    
    // Return the updated dashboard
    return c.json({
      success: true,
      data: {
        id: dashboardId,
        userId: user.id,
        name: data.name,
        layoutData: data.layoutData,
        isDefault: data.isDefault || existingDashboard.isDefault,
        version: newVersion,
        createdAt: existingDashboard.createdAt,
        updatedAt: now
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    
    return c.json({
      success: false,
      error: 'Failed to update dashboard',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Delete a dashboard
 */
app.delete('/:id', async (c) => {
  const dashboardId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First check if the dashboard exists and belongs to this user
    const dashboard = await c.env.DB.prepare(
      `SELECT * FROM dashboards 
       WHERE id = ? AND userId = ?`
    ).bind(dashboardId, user.id).first();
    
    if (!dashboard) {
      return c.json({
        success: false,
        error: 'Dashboard not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Start a transaction to delete the dashboard and its widgets
    const deleteWidgetsStmt = c.env.DB.prepare(
      `DELETE FROM widgets WHERE dashboardId = ?`
    ).bind(dashboardId);
    
    const deleteDashboardStmt = c.env.DB.prepare(
      `DELETE FROM dashboards WHERE id = ? AND userId = ?`
    ).bind(dashboardId, user.id);
    
    // Execute both deletions
    await c.env.DB.batch([deleteWidgetsStmt, deleteDashboardStmt]);
    
    return c.json({
      success: true,
      data: { id: dashboardId, deleted: true },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    
    return c.json({
      success: false,
      error: 'Failed to delete dashboard',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

// Widget CRUD operations

/**
 * Create a new widget for a dashboard
 */
app.post('/widgets', zValidator('json', widgetSchema), async (c) => {
  const user = c.get('user');
  const data = c.req.valid('json');
  
  try {
    // First check if the dashboard exists and belongs to this user
    const dashboard = await c.env.DB.prepare(
      `SELECT * FROM dashboards 
       WHERE id = ? AND userId = ?`
    ).bind(data.dashboardId, user.id).first();
    
    if (!dashboard) {
      return c.json({
        success: false,
        error: 'Dashboard not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    // Generate a unique ID for the new widget
    const widgetId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    // Insert the widget
    await c.env.DB.prepare(
      `INSERT INTO widgets (id, dashboardId, widgetTypeId, props, showTitle, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      widgetId,
      data.dashboardId,
      data.widgetTypeId,
      data.props,
      data.showTitle ?? true,
      now,
      now
    ).run();
    
    // Update the dashboard version and timestamp
    await c.env.DB.prepare(
      `UPDATE dashboards 
       SET version = version + 1, updatedAt = ?
       WHERE id = ?`
    ).bind(now, data.dashboardId).run();
    
    // Return the created widget
    return c.json({
      success: true,
      data: {
        id: widgetId,
        dashboardId: data.dashboardId,
        widgetTypeId: data.widgetTypeId,
        props: data.props,
        showTitle: data.showTitle ?? true,
        createdAt: now,
        updatedAt: now
      },
      timestamp: now
    }, 201);
  } catch (error) {
    console.error('Error creating widget:', error);
    
    return c.json({
      success: false,
      error: 'Failed to create widget',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Update a widget
 */
app.put('/widgets/:id', async (c) => {
  const widgetId = c.req.param('id');
  const user = c.get('user');
  const data = await c.req.json();
  
  try {
    // First get the widget and verify dashboard ownership
    const widget = await c.env.DB.prepare(
      `SELECT w.*, d.userId 
       FROM widgets w
       JOIN dashboards d ON w.dashboardId = d.id
       WHERE w.id = ? AND d.userId = ?`
    ).bind(widgetId, user.id).first();
    
    if (!widget) {
      return c.json({
        success: false,
        error: 'Widget not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Update the widget
    await c.env.DB.prepare(
      `UPDATE widgets 
       SET props = ?, showTitle = ?, updatedAt = ?
       WHERE id = ?`
    ).bind(
      data.props || widget.props,
      data.showTitle ?? widget.showTitle,
      now,
      widgetId
    ).run();
    
    // Update the dashboard version and timestamp
    await c.env.DB.prepare(
      `UPDATE dashboards 
       SET version = version + 1, updatedAt = ?
       WHERE id = ?`
    ).bind(now, widget.dashboardId).run();
    
    return c.json({
      success: true,
      data: {
        id: widgetId,
        dashboardId: widget.dashboardId,
        widgetTypeId: widget.widgetTypeId,
        props: data.props || widget.props,
        showTitle: data.showTitle ?? widget.showTitle,
        updatedAt: now
      },
      timestamp: now
    });
  } catch (error) {
    console.error('Error updating widget:', error);
    
    return c.json({
      success: false,
      error: 'Failed to update widget',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Delete a widget
 */
app.delete('/widgets/:id', async (c) => {
  const widgetId = c.req.param('id');
  const user = c.get('user');
  
  try {
    // First get the widget and verify dashboard ownership
    const widget = await c.env.DB.prepare(
      `SELECT w.*, d.userId, d.id as dashboardId
       FROM widgets w
       JOIN dashboards d ON w.dashboardId = d.id
       WHERE w.id = ? AND d.userId = ?`
    ).bind(widgetId, user.id).first();
    
    if (!widget) {
      return c.json({
        success: false,
        error: 'Widget not found or access denied',
        timestamp: new Date().toISOString()
      }, 404);
    }
    
    const now = new Date().toISOString();
    
    // Delete the widget
    await c.env.DB.prepare(
      `DELETE FROM widgets 
       WHERE id = ?`
    ).bind(widgetId).run();
    
    // Update the dashboard version and timestamp
    await c.env.DB.prepare(
      `UPDATE dashboards 
       SET version = version + 1, updatedAt = ?
       WHERE id = ?`
    ).bind(now, widget.dashboardId).run();
    
    return c.json({
      success: true,
      data: { id: widgetId, deleted: true },
      timestamp: now
    });
  } catch (error) {
    console.error('Error deleting widget:', error);
    
    return c.json({
      success: false,
      error: 'Failed to delete widget',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Get all templates
 */
app.get('/templates', async (c) => {
  try {
    // In the future, these could be loaded from the database
    // For now, return hardcoded templates
    const templates = [
      {
        id: 'empty',
        name: 'Empty Dashboard',
        description: 'Start with a blank dashboard and build it from scratch.',
        thumbnail: '/assets/templates/empty-dashboard.png'
      },
      {
        id: 'sessions',
        name: 'Sessions Overview',
        description: 'Track and analyze your sessions with charts and statistics.',
        thumbnail: '/assets/templates/sessions-dashboard.png'
      },
      {
        id: 'inventory',
        name: 'Inventory Management',
        description: 'Track your inventory, expiration dates, and consumption rates.',
        thumbnail: '/assets/templates/inventory-dashboard.png'
      }
    ];
    
    return c.json({
      success: true,
      data: templates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    
    return c.json({
      success: false,
      error: 'Failed to fetch templates',
      timestamp: new Date().toISOString()
    }, 500);
  }
});

/**
 * Get a specific template
 */
app.get('/templates/:id', async (c) => {
  const templateId = c.req.param('id');
  
  // Hardcoded template data with widgets
  // In the future, this could be loaded from a database
  const templates: Record<string, any> = {
    'empty': {
      id: 'empty',
      name: 'Empty Dashboard',
      dashboard: {
        name: 'My Dashboard',
        layoutData: JSON.stringify({
          rows: [
            {
              id: crypto.randomUUID(),
              layout: {
                id: crypto.randomUUID(),
                columns: [
                  { id: crypto.randomUUID(), widthPercentage: 100 }
                ]
              },
              index: 1,
              name: 'Row 1',
              showTitle: true
            }
          ]
        }),
        isDefault: false,
        version: 1
      },
      widgets: []
    },
    'sessions': {
      id: 'sessions',
      name: 'Sessions Overview',
      dashboard: {
        name: 'Sessions Dashboard',
        layoutData: JSON.stringify({
          rows: [
            {
              id: crypto.randomUUID(),
              layout: {
                id: crypto.randomUUID(),
                columns: [
                  { id: crypto.randomUUID(), widthPercentage: 33.33, widgetId: 'stats' },
                  { id: crypto.randomUUID(), widthPercentage: 33.33, widgetId: 'chart' },
                  { id: crypto.randomUUID(), widthPercentage: 33.33, widgetId: 'strains' }
                ]
              },
              index: 1,
              name: 'Statistics',
              showTitle: true
            },
            {
              id: crypto.randomUUID(),
              layout: {
                id: crypto.randomUUID(),
                columns: [
                  { id: crypto.randomUUID(), widthPercentage: 100, widgetId: 'recent' }
                ]
              },
              index: 2,
              name: 'Recent Sessions',
              showTitle: true
            }
          ]
        }),
        isDefault: false,
        version: 1
      },
      widgets: [
        {
          id: 'stats',
          widgetTypeId: 'statistics-card',
          props: JSON.stringify({
            title: 'Session Statistics',
            stats: [
              { label: 'Total Sessions', value: '0' },
              { label: 'This Week', value: '0' },
              { label: 'Average Duration', value: '0 min' }
            ]
          }),
          showTitle: true
        },
        {
          id: 'chart',
          widgetTypeId: 'consumption-trend',
          props: JSON.stringify({
            title: 'Consumption Trends',
            period: 'week'
          }),
          showTitle: true
        },
        {
          id: 'recent',
          widgetTypeId: 'recent-sessions',
          props: JSON.stringify({
            title: 'Recent Sessions',
            limit: 5
          }),
          showTitle: true
        },
        {
          id: 'strains',
          widgetTypeId: 'strain-effectiveness',
          props: JSON.stringify({
            title: 'Top Strains',
            limit: 5
          }),
          showTitle: true
        }
      ]
    },
    'inventory': {
      id: 'inventory',
      name: 'Inventory Management',
      dashboard: {
        name: 'Inventory Dashboard',
        layoutData: JSON.stringify({
          rows: [
            {
              id: crypto.randomUUID(),
              layout: {
                id: crypto.randomUUID(),
                columns: [
                  { id: crypto.randomUUID(), widthPercentage: 30, widgetId: 'inv-stats' },
                  { id: crypto.randomUUID(), widthPercentage: 70, widgetId: 'inv-chart' }
                ]
              },
              index: 1,
              name: 'Inventory Overview',
              showTitle: true
            },
            {
              id: crypto.randomUUID(),
              layout: {
                id: crypto.randomUUID(),
                columns: [
                  { id: crypto.randomUUID(), widthPercentage: 50, widgetId: 'low-stock' },
                  { id: crypto.randomUUID(), widthPercentage: 50, widgetId: 'expiring' }
                ]
              },
              index: 2,
              name: 'Inventory Alerts',
              showTitle: true
            }
          ]
        }),
        isDefault: false,
        version: 1
      },
      widgets: [
        {
          id: 'inv-stats',
          widgetTypeId: 'statistics-card',
          props: JSON.stringify({
            title: 'Inventory Statistics',
            stats: [
              { label: 'Total Items', value: '0' },
              { label: 'Total Weight', value: '0g' },
              { label: 'Estimated Value', value: '$0' }
            ]
          }),
          showTitle: true
        },
        {
          id: 'inv-chart',
          widgetTypeId: 'consumption-trend',
          props: JSON.stringify({
            title: 'Inventory Breakdown',
            chartType: 'pie'
          }),
          showTitle: true
        },
        {
          id: 'low-stock',
          widgetTypeId: 'low-inventory',
          props: JSON.stringify({
            title: 'Low Stock Items',
            limit: 5
          }),
          showTitle: true
        },
        {
          id: 'expiring',
          widgetTypeId: 'expiring-items',
          props: JSON.stringify({
            title: 'Expiring Soon',
            limit: 5
          }),
          showTitle: true
        }
      ]
    }
  };
  
  const template = templates[templateId];
  
  if (!template) {
    return c.json({
      success: false,
      error: 'Template not found',
      timestamp: new Date().toISOString()
    }, 404);
  }
  
  return c.json({
    success: true,
    data: template,
    timestamp: new Date().toISOString()
  });
});

export default app; 