# Sesh-Tracker Data Storage Strategy

This document outlines our comprehensive data storage strategy across Cloudflare's storage products to provide optimal performance, cost-effectiveness, and scalability.

## 1. Data Storage Overview

We use a multi-tier approach to store different types of data:

| Data Type | Storage Mechanism | Rationale |
|-----------|-------------------|-----------|
| Relational Data | D1 Database | For structured data with relationships |
| Binary/Media | R2 Storage | For images, documents, and other binary data |
| Frequently Accessed Data | Workers KV | For high-read, low-write data like reference lists |
| Real-time/Transient Data | Durable Objects | For consistency in real-time, high-write scenarios |
| Time-series Analytics | D1 + Partitioning | For historical data with time-based queries |

## 2. D1 Database Strategy

### Primary Tables Structure

Our D1 database contains two categories of tables:

1. **Core Tables**: Fundamental user data (users, sessions, inventory)
2. **Extension Tables**: Enhanced tracking and social features (medical_symptoms, journal_entries)

### Partitioning Strategy

For high-volume time-series data (like sessions, metrics), we implement a partitioning strategy:

- Monthly partitioning for recent data (< 1 year)
- Yearly partitioning for historical data (> 1 year)

Example query for partitioned sessions:
```sql
-- Query recent sessions from current partition
SELECT * FROM sessions_2023_04 WHERE userId = ? ORDER BY timestamp DESC LIMIT 10

-- Query across partitions for historical analysis (handled by query middleware)
-- Middleware translates this to individual partition queries and combines results
SELECT * FROM sessions WHERE userId = ? AND timestamp BETWEEN ? AND ? LIMIT 100
```

### JSON Storage

We use JSON columns for flexible schema needs while maintaining a structured core:

- Define core fields as proper columns for querying
- Use JSON for variable or complex attributes
- Extract commonly queried fields from JSON to dedicated columns over time

## 3. R2 Storage Organization

```
r2-storage/
├── user-media/
│   ├── {userId}/
│   │   ├── profile/
│   │   │   └── {imageId}.jpg
│   │   ├── sessions/
│   │   │   └── {sessionId}/
│   │   │       ├── {imageId}.jpg
│   │   │       └── {videoId}.mp4
│   │   └── journals/
│   │       └── {journalId}/
│   │           └── {imageId}.jpg
├── strain-images/
│   └── {strainId}.jpg
├── product-images/
│   └── {productId}/
│       └── {imageId}.jpg
└── dispensary-images/
    └── {dispensaryId}/
        └── {imageId}.jpg
```

### Media Processing

- All uploaded images are automatically processed to create:
  - Thumbnail (200px)
  - Medium size (800px)
  - Original (preserved but compressed)
- Reference path: `/user-media/{userId}/sessions/{sessionId}/{imageId}-{size}.jpg`

## 4. Workers KV Strategy

We use Workers KV for:

1. **Reference Data Caching**
   - Strain information
   - Product catalog
   - Dispensary details

2. **User Preferences & Settings**
   - UI preferences
   - Dashboard layouts

3. **Search Indices**
   - Strain name lookup
   - Product name search

Structure:

```
KV_NAMESPACE: SESH_TRACKER

// Reference data with TTL
KEY: "strains:list" → JSON array of basic strain data
KEY: "strain:{id}" → JSON object with complete strain data

// User preferences (fast access)
KEY: "user:{id}:preferences" → JSON object of user preferences 
KEY: "user:{id}:dashboard:layout" → JSON object of dashboard layout

// Search indices
KEY: "search:strains:{term}" → Array of IDs matching search term
```

## 5. Durable Objects Strategy

Durable Objects are used for:

1. **Active Session Tracking**
   - Real-time session recording
   - Concurrent modifications

2. **User Presence & Status**
   - Online status
   - Activity tracking

3. **Rate Limiting & Quotas**
   - Subscription limits enforcement
   - API rate limiting

Implementation:

```typescript
// Active session tracking
export class ActiveSessionDO {
  private session: any;
  private participants: Map<string, WebSocket> = new Map();
  
  // Methods for updating session state with consistency guarantees
  async recordDataPoint(dataPoint) {
    this.session.dataPoints.push(dataPoint);
    this.notifyParticipants();
    
    // Every 10 points, persist to D1
    if (this.session.dataPoints.length % 10 === 0) {
      await this.persistToDatabase();
    }
  }
}
```

## 6. Data Migration & Lifecycle

### Data Lifecycle Policies

1. **Hot Data** (0-3 months):
   - Stored in both KV and D1
   - Highly accessible with no retrieval delays

2. **Warm Data** (3-12 months):
   - Primarily D1 with monthly partitioning
   - Some aggregated data in KV

3. **Cold Data** (1+ years):
   - Yearly partitions in D1
   - Automatic summarization for trends/analysis

### Archival Strategy

For regulatory compliance and long-term storage:

1. Quarterly export of cold data to R2 as JSON archives
2. Annual pruning of detailed session data while maintaining aggregated metrics
3. User-initiated data export to comply with privacy regulations

## 7. Analytics Data Flow

```
Raw Data → Real-time Processing → Temporary Storage → Batch Processing → Analytics Storage
  (D1)    →   (Worker + DO)     →      (KV)        →    (Cron)       →   (D1 metrics)
```

For each user session:
1. Raw data points collected in D1
2. Real-time calculations in Durable Objects
3. Hourly aggregation via scheduled Workers
4. Daily/weekly/monthly rollups stored in metrics tables

## 8. Development Guidelines

### Working with Different Storage Types

When implementing features, follow these guidelines:

**D1 Database:**
- Use for core entity data and relationships
- Include timestamp fields for all records
- Be cautious with ALTER TABLE in production

**R2 Storage:**
- Never store file paths in D1 directly, use object IDs
- Generate signed URLs for client access
- Use metadata for searchable attributes

**Workers KV:**
- Remember 25MB value size limit
- Set appropriate TTLs for cached data
- Use bulk operations when possible

**Durable Objects:**
- Reserve for state that requires coordination
- Implement proper error handling for failed transactions
- Document concurrency patterns

## 9. Performance Considerations

- **Query Optimization:**
  - Use the `EXPLAIN QUERY PLAN` feature to analyze query performance
  - Create indices for frequently queried columns
  - Limit the use of complex joins

- **Connection Pooling:**
  - Reuse database connections within a request
  - Implement retry logic for connection failures

- **Caching Strategy:**
  - Implement cache warming for predictable user actions
  - Use staggered cache expiration to prevent thundering herd

## 10. Scaling Roadmap

As the application scales, we will implement:

1. **Phase 1: Current Architecture**
   - Single D1 database with partitioning
   - Basic KV caching

2. **Phase 2: Scaling to 100k users**
   - Expanded KV namespace usage for read offloading
   - Durable Objects for high-write coordination
   - Background analytics processing

3. **Phase 3: Enterprise Scale**
   - Multiple regional deployments
   - Read replicas for analytics
   - Advanced caching with request coalescing 