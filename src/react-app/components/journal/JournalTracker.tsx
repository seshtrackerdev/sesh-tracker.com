import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import 'react-toastify/dist/ReactToastify.css';

// Type for journal entry
interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  tags: string[];
  mood?: number;
  createdAt: string;
  isPrivate: boolean;
}

const JournalTracker: React.FC = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(null);

  // Fetch journal entries
  const fetchJournalEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/journal');
      const data = await response.json();
      
      if (data.success) {
        setJournalEntries(data.data);
      } else {
        setError(data.error || 'Failed to fetch journal entries');
        toast.error(data.error || 'Failed to fetch journal entries');
      }
    } catch (err) {
      console.error('Error fetching journal entries:', err);
      setError('Failed to fetch journal entries. Please try again.');
      toast.error('Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Load entries on component mount
  useEffect(() => {
    fetchJournalEntries();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to write journal entries');
      return;
    }
    
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter some content for your journal entry');
      return;
    }
    
    try {
      setLoading(true);
      
      const journalEntry: JournalEntry = {
        userId: user.id,
        title: title.trim(),
        content: content.trim(),
        tags,
        mood,
        isPrivate,
        createdAt: new Date().toISOString(),
      };
      
      // If editing, update the entry
      if (isEditing && currentEntryId) {
        const response = await fetch(`/api/v1/journal/${currentEntryId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(journalEntry),
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Journal entry updated successfully');
          fetchJournalEntries(); // Refresh the list
          resetForm();
        } else {
          toast.error(data.error || 'Failed to update journal entry');
        }
      } 
      // Otherwise create a new entry
      else {
        const response = await fetch('/api/v1/journal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(journalEntry),
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Journal entry saved successfully');
          fetchJournalEntries(); // Refresh the list
          resetForm();
        } else {
          toast.error(data.error || 'Failed to save journal entry');
        }
      }
    } catch (err) {
      console.error('Error saving journal entry:', err);
      toast.error('Failed to save journal entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setTitle('');
    setContent('');
    setMood(undefined);
    setTags([]);
    setTagInput('');
    setIsPrivate(true);
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
  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setMood(entry.mood);
    setTags(entry.tags);
    setIsPrivate(entry.isPrivate);
    setIsEditing(true);
    setCurrentEntryId(entry.id || null);
  };

  // Handle deleting an entry
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        const response = await fetch(`/api/v1/journal/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Journal entry deleted successfully');
          fetchJournalEntries(); // Refresh the list
        } else {
          toast.error(data.error || 'Failed to delete journal entry');
        }
      } catch (err) {
        console.error('Error deleting journal entry:', err);
        toast.error('Failed to delete journal entry. Please try again.');
      }
    }
  };

  return (
    <div className="journal-tracker">
      <h2 className="text-2xl font-semibold mb-4">Journal Entries</h2>
      
      {/* Journal Entry Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-3">{isEditing ? 'Edit Journal Entry' : 'New Journal Entry'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a title for your journal entry"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Content *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Write your thoughts, experiences, or reflections..."
              required
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Current Mood (optional)</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={mood || 5}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full flex-grow"
              />
              <button 
                type="button"
                onClick={() => setMood(undefined)}
                className="ml-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            {mood !== undefined && (
              <div className="text-center text-sm text-gray-600 mt-1">
                Mood: {mood}/10
              </div>
            )}
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
                placeholder="Add tags (e.g., reflection, goals, gratitude)"
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
                      className="ml-1.5 inline-flex text-blue-400 hover:text-blue-600 focus:outline-none"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2 text-gray-700">Private entry (only visible to you)</span>
            </label>
          </div>
          
          <div className="flex justify-end space-x-2">
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Journal Entries List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Your Journal History</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading && <p>Loading...</p>}
        
        {!loading && journalEntries.length === 0 && (
          <p className="text-gray-500">No journal entries yet. Start journaling above!</p>
        )}
        
        {journalEntries.length > 0 && (
          <div className="space-y-4">
            {journalEntries.map((entry) => (
              <div key={entry.id} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-xl font-medium">{entry.title}</h4>
                      {entry.mood !== undefined && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Mood: {entry.mood}/10
                        </span>
                      )}
                      {entry.isPrivate && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Private
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {format(new Date(entry.createdAt), 'PPP p')}
                    </div>
                    <div className="mt-2 whitespace-pre-line">
                      {entry.content.length > 200 ? 
                        <>
                          {entry.content.substring(0, 200)}...
                          <button 
                            className="text-blue-500 hover:text-blue-700 text-sm ml-1"
                            onClick={() => handleEdit(entry)}
                          >
                            Read more
                          </button>
                        </> : 
                        entry.content
                      }
                    </div>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {entry.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

export default JournalTracker; 