import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

// Types
interface JournalEntry {
  id: string;
  userId: string;
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  mood?: number;
  associatedSession?: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// Common journal tags
const COMMON_TAGS = [
  'Reflection', 'Cannabis', 'Health', 'Wellness', 'Medical',
  'Experience', 'Strain Notes', 'Personal', 'Ideas', 'Goals'
];

const JournalEntryComponent: React.FC = () => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  
  // Fetch journal entries
  useEffect(() => {
    const fetchJournalEntries = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/journals', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Parse tags which are stored as JSON strings
          const parsedEntries = data.data.map((entry: any) => ({
            ...entry,
            tags: typeof entry.tags === 'string' ? JSON.parse(entry.tags) : entry.tags,
          }));
          
          setJournalEntries(parsedEntries);
        } else {
          setError(data.error || 'Failed to fetch journal entries');
        }
      } catch (err) {
        setError('Error fetching journal entries. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchJournalEntries();
    }
  }, [user]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setCustomTag('');
    setMood(undefined);
    setIsPrivate(true);
    setEditingJournalId(null);
  };
  
  // Load journal entry for editing
  const handleEditJournal = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedTags(entry.tags || []);
    setMood(entry.mood);
    setIsPrivate(entry.isPrivate);
    setEditingJournalId(entry.id);
    
    // Scroll to form
    document.getElementById('journal-form')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validation
    if (!title.trim()) {
      toast.error('Please enter a title for your journal entry');
      return;
    }
    
    if (!content.trim()) {
      toast.error('Please enter some content for your journal entry');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare data
      const journalData = {
        timestamp: new Date().toISOString(),
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        mood,
        isPrivate
      };
      
      // Determine if this is an update or new entry
      const isUpdate = Boolean(editingJournalId);
      const url = isUpdate
        ? `/api/v1/journals/${editingJournalId}`
        : '/api/v1/journals';
        
      // Submit the data
      const response = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(journalData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        if (isUpdate) {
          setJournalEntries(entries => 
            entries.map(entry => 
              entry.id === editingJournalId ? data.data : entry
            )
          );
          toast.success('Journal entry updated successfully!');
        } else {
          setJournalEntries(entries => [data.data, ...entries]);
          toast.success('Journal entry added successfully!');
        }
        
        // Reset form
        resetForm();
      } else {
        toast.error(data.error || 'Failed to save journal entry');
      }
    } catch (err) {
      toast.error('Error saving journal entry. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle delete
  const handleDeleteJournal = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this journal entry?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/v1/journals/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setJournalEntries(entries => entries.filter(entry => entry.id !== id));
        toast.success('Journal entry deleted successfully!');
        
        // If we were editing this entry, reset the form
        if (editingJournalId === id) {
          resetForm();
        }
      } else {
        toast.error(data.error || 'Failed to delete journal entry');
      }
    } catch (err) {
      toast.error('Error deleting journal entry. Please try again.');
      console.error(err);
    }
  };
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // Add custom tag
  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()]);
      setCustomTag('');
    }
  };
  
  // Render loading state
  if (loading) {
    return <div className="p-4 text-center">Loading journal entries...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }
  
  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Journal</h1>
      
      {/* Journal Entry Form */}
      <div id="journal-form" className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingJournalId ? 'Edit Journal Entry' : 'Create New Journal Entry'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              placeholder="Give your journal entry a title..."
              required
            />
          </div>
          
          {/* Content */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" htmlFor="content">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
              rows={8}
              placeholder="Write your thoughts, experiences, reflections..."
              required
            />
          </div>
          
          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COMMON_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedTags.includes(tag) 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex mt-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add custom tag..."
                className="flex-grow px-3 py-2 border rounded-l text-sm"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="bg-indigo-500 text-white px-3 py-2 rounded-r text-sm"
                disabled={!customTag.trim()}
              >
                Add
              </button>
            </div>
          </div>
          
          {/* Mood */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Mood ({mood ?? 'Not Specified'})
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={mood || 5}
              onChange={(e) => setMood(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1">
              <span>Low</span>
              <span>Neutral</span>
              <span>High</span>
            </div>
            <button
              type="button"
              onClick={() => setMood(undefined)}
              className="text-sm text-blue-500 mt-1"
            >
              Clear Mood
            </button>
          </div>
          
          {/* Privacy Setting */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                id="privacy"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                Make this entry private
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Private entries are visible only to you and not shared with any integrated apps.
            </p>
          </div>
          
          {/* Submit/Cancel Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border rounded text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded text-sm disabled:opacity-50"
            >
              {isSubmitting
                ? 'Saving...'
                : editingJournalId
                  ? 'Update Entry'
                  : 'Save Entry'
              }
            </button>
          </div>
        </form>
      </div>
      
      {/* Journal Entries List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Journal Entries</h2>
        
        {journalEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            You haven't created any journal entries yet. Start journaling above!
          </p>
        ) : (
          <div className="space-y-6">
            {journalEntries.map(entry => (
              <div 
                key={entry.id} 
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">{entry.title}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(entry.timestamp), 'MMMM d, yyyy h:mm a')}
                      {entry.isPrivate && (
                        <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                          Private
                        </span>
                      )}
                      {entry.mood && (
                        <span className="ml-2">
                          Mood: {entry.mood}/10
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditJournal(entry)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteJournal(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {/* Preview of content, limited to few lines */}
                <div className="prose prose-sm max-w-none mb-4">
                  {entry.content.length > 300 
                    ? `${entry.content.substring(0, 300)}...` 
                    : entry.content}
                </div>
                
                {/* Show "Read more" if content is truncated */}
                {entry.content.length > 300 && (
                  <button 
                    onClick={() => handleEditJournal(entry)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 mb-4"
                  >
                    Read more
                  </button>
                )}
                
                {/* Tags */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalEntryComponent; 