/**
 * useMoodData - Hook for managing mood tracking data
 */
import { useState, useEffect, useCallback } from 'react';
import { moodService, MoodEntry } from '../services/MoodService';

export interface UseMoodDataOptions {
  autoLoad?: boolean;
}

export function useMoodData(options: UseMoodDataOptions = {}) {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load mood entries
  const loadMoodEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const entries = await moodService.getMoodEntries();
      setMoodEntries(entries);
    } catch (err) {
      console.error('Error loading mood entries:', err);
      setError('Failed to load mood data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new mood entry
  const createMoodEntry = useCallback(async (entry: MoodEntry) => {
    setLoading(true);
    setError(null);
    
    try {
      const createdEntry = await moodService.createMoodEntry(entry);
      if (createdEntry) {
        setMoodEntries(prev => [createdEntry, ...prev]);
      }
      return createdEntry;
    } catch (err) {
      console.error('Error creating mood entry:', err);
      setError('Failed to save mood data. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing mood entry
  const updateMoodEntry = useCallback(async (id: string, entry: MoodEntry) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedEntry = await moodService.updateMoodEntry(id, entry);
      if (updatedEntry) {
        setMoodEntries(prev => 
          prev.map(item => item.id === id ? updatedEntry : item)
        );
      }
      return updatedEntry;
    } catch (err) {
      console.error(`Error updating mood entry ${id}:`, err);
      setError('Failed to update mood data. Please try again later.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a mood entry
  const deleteMoodEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await moodService.deleteMoodEntry(id);
      if (success) {
        setMoodEntries(prev => prev.filter(item => item.id !== id));
      }
      return success;
    } catch (err) {
      console.error(`Error deleting mood entry ${id}:`, err);
      setError('Failed to delete mood data. Please try again later.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data on mount if autoLoad is true
  useEffect(() => {
    if (options.autoLoad !== false) {
      loadMoodEntries();
    }
  }, [loadMoodEntries, options.autoLoad]);

  return {
    moodEntries,
    loading,
    error,
    loadMoodEntries,
    createMoodEntry,
    updateMoodEntry,
    deleteMoodEntry
  };
} 