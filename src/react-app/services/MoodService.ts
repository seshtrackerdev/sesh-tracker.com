/**
 * MoodService - Service for mood tracking API interactions
 */
import { apiClient } from './ApiClient';

export interface MoodEntry {
  id?: string;
  timestamp: string;
  mood: number; // Scale from 1-10
  activities: string[]; // Array of activities done
  factors: string[]; // Factors that may have influenced mood
  notes?: string;
  associatedSession?: string; // Optional reference to a session
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MoodService class for interacting with mood tracking APIs
 */
export class MoodService {
  /**
   * Get all mood entries for the current user
   */
  async getMoodEntries(): Promise<MoodEntry[]> {
    try {
      const response = await apiClient.get('/mood');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching mood entries:', error);
      return [];
    }
  }

  /**
   * Get a specific mood entry by ID
   */
  async getMoodEntry(id: string): Promise<MoodEntry | null> {
    try {
      const response = await apiClient.get(`/mood/${id}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching mood entry ${id}:`, error);
      return null;
    }
  }

  /**
   * Create a new mood entry
   */
  async createMoodEntry(entry: MoodEntry): Promise<MoodEntry | null> {
    try {
      const response = await apiClient.post('/mood', entry);
      return response.data || null;
    } catch (error) {
      console.error('Error creating mood entry:', error);
      return null;
    }
  }

  /**
   * Update an existing mood entry
   */
  async updateMoodEntry(id: string, entry: MoodEntry): Promise<MoodEntry | null> {
    try {
      const response = await apiClient.put(`/mood/${id}`, entry);
      return response.data || null;
    } catch (error) {
      console.error(`Error updating mood entry ${id}:`, error);
      return null;
    }
  }

  /**
   * Delete a mood entry
   */
  async deleteMoodEntry(id: string): Promise<boolean> {
    try {
      await apiClient.delete(`/mood/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting mood entry ${id}:`, error);
      return false;
    }
  }
}

// Create a singleton instance
export const moodService = new MoodService();

// Export default for convenience
export default moodService; 