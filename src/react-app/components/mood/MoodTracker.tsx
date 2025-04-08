import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import { useMoodData } from '../../hooks/useMoodData';
import { MoodEntry } from '../../services/MoodService';
import 'react-toastify/dist/ReactToastify.css';

const MoodTracker: React.FC = () => {
  const { user } = useAuth();
  const { 
    moodEntries, 
    loading, 
    error,
    createMoodEntry, 
    updateMoodEntry,
    deleteMoodEntry
  } = useMoodData({ autoLoad: true });
  
  // Form state
  const [rating, setRating] = useState(5);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to record mood');
      return;
    }
    
    try {
      const moodEntry: MoodEntry = {
        timestamp: new Date().toISOString(),
        mood: rating,
        activities: tags,
        factors: [],
        notes: note,
      };
      
      // If editing, update the entry
      if (isEditing && currentEntryId) {
        const result = await updateMoodEntry(currentEntryId, moodEntry);
        
        if (result) {
          toast.success('Mood entry updated successfully');
          resetForm();
        } else {
          toast.error('Failed to update mood entry');
        }
      } 
      // Otherwise create a new entry
      else {
        const result = await createMoodEntry(moodEntry);
        
        if (result) {
          toast.success('Mood entry recorded successfully');
          resetForm();
        } else {
          toast.error('Failed to record mood entry');
        }
      }
    } catch (err) {
      console.error('Error saving mood entry:', err);
      toast.error('Failed to save mood entry. Please try again.');
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setRating(5);
    setNote('');
    setTags([]);
    setTagInput('');
    setIsEditing(false);
    setCurrentEntryId(null);
  };

  // Handle adding tags
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Handle removing tags
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle editing an entry
  const handleEdit = (entry: MoodEntry) => {
    if (!entry.id) return;
    
    setRating(entry.mood);
    setNote(entry.notes || '');
    setTags(entry.activities || []);
    setIsEditing(true);
    setCurrentEntryId(entry.id);
  };

  // Handle deleting an entry
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this mood entry?')) {
      const success = await deleteMoodEntry(id);
      
      if (success) {
        toast.success('Mood entry deleted successfully');
      } else {
        toast.error('Failed to delete mood entry');
      }
    }
  };

  return (
    <div className="mood-tracker">
      <h2 className="text-2xl font-semibold mb-4">Track Your Mood</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Mood Entry Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-3">{isEditing ? 'Edit Mood Entry' : 'New Mood Entry'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">How are you feeling? (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 - Very Bad</span>
              <span>5 - Neutral</span>
              <span>10 - Excellent</span>
            </div>
            <div className="text-center font-bold text-xl mt-2">
              {rating} / 10
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Notes (optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="How are you feeling today? What might be affecting your mood?"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Tags (optional)</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add tags (e.g., work, exercise, sleep)"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Mood Entries List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Your Mood History</h3>
        {loading && <p>Loading entries...</p>}
        
        {moodEntries.length === 0 && !loading ? (
          <p className="text-gray-500">No mood entries yet. Start tracking your mood above!</p>
        ) : (
          <div className="space-y-4">
            {moodEntries.map((entry) => (
              <div key={entry.id} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-xl mr-2">{entry.mood}/10</span>
                      <span className="text-gray-500 text-sm">
                        {entry.timestamp ? format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a') : ''}
                      </span>
                    </div>
                    {entry.notes && <p className="text-gray-700 mb-2">{entry.notes}</p>}
                    
                    {entry.activities && entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {entry.activities.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodTracker; 