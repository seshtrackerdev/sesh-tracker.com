import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

// Type for medical symptom
interface MedicalSymptom {
  id?: string;
  userId: string;
  symptom: string;
  severity: number;
  duration: string;
  notes: string;
  tags: string[];
  createdAt: string;
}

// Common symptom options
const COMMON_SYMPTOMS = [
  'Headache', 'Nausea', 'Fatigue', 'Dizziness', 
  'Pain', 'Insomnia', 'Anxiety', 'Stress'
];

const MedicalSymptomTracker: React.FC = () => {
  const { user } = useAuth();
  const [symptoms, setSymptoms] = useState<MedicalSymptom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSymptomId, setCurrentSymptomId] = useState<string | null>(null);

  // Fetch symptoms
  const fetchSymptoms = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/medical-symptoms');
      const data = await response.json();
      
      if (data.success) {
        setSymptoms(data.data);
      } else {
        setError(data.error || 'Failed to fetch medical symptoms');
        toast.error(data.error || 'Failed to fetch medical symptoms');
      }
    } catch (err) {
      console.error('Error fetching medical symptoms:', err);
      setError('Failed to fetch medical symptoms. Please try again.');
      toast.error('Failed to fetch medical symptoms');
    } finally {
      setLoading(false);
    }
  };

  // Load symptoms on component mount
  useEffect(() => {
    fetchSymptoms();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to record symptoms');
      return;
    }
    
    if (!symptom.trim()) {
      toast.error('Please enter a symptom');
      return;
    }
    
    try {
      setLoading(true);
      
      const newSymptom: MedicalSymptom = {
        userId: user.id,
        symptom: symptom.trim(),
        severity,
        duration: duration.trim(),
        notes: notes.trim(),
        tags,
        createdAt: new Date().toISOString(),
      };
      
      // If editing, update the symptom
      if (isEditing && currentSymptomId) {
        const response = await fetch(`/api/v1/medical-symptoms/${currentSymptomId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSymptom),
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Symptom updated successfully');
          fetchSymptoms(); // Refresh the list
          resetForm();
        } else {
          toast.error(data.error || 'Failed to update symptom');
        }
      } 
      // Otherwise create a new symptom
      else {
        const response = await fetch('/api/v1/medical-symptoms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newSymptom),
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Symptom recorded successfully');
          fetchSymptoms(); // Refresh the list
          resetForm();
        } else {
          toast.error(data.error || 'Failed to record symptom');
        }
      }
    } catch (err) {
      console.error('Error saving symptom:', err);
      toast.error('Failed to save symptom. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setSymptom('');
    setSeverity(5);
    setDuration('');
    setNotes('');
    setTags([]);
    setTagInput('');
    setIsEditing(false);
    setCurrentSymptomId(null);
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

  // Handle editing a symptom
  const handleEdit = (symptomData: MedicalSymptom) => {
    setSymptom(symptomData.symptom);
    setSeverity(symptomData.severity);
    setDuration(symptomData.duration);
    setNotes(symptomData.notes);
    setTags(symptomData.tags);
    setIsEditing(true);
    setCurrentSymptomId(symptomData.id || null);
  };

  // Handle deleting a symptom
  const handleDelete = async (id: string | undefined) => {
    if (!id) return;
    
    if (window.confirm('Are you sure you want to delete this symptom?')) {
      try {
        const response = await fetch(`/api/v1/medical-symptoms/${id}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (data.success) {
          toast.success('Symptom deleted successfully');
          fetchSymptoms(); // Refresh the list
        } else {
          toast.error(data.error || 'Failed to delete symptom');
        }
      } catch (err) {
        console.error('Error deleting symptom:', err);
        toast.error('Failed to delete symptom. Please try again.');
      }
    }
  };

  // Select a common symptom
  const selectCommonSymptom = (selected: string) => {
    setSymptom(selected);
  };

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <h1 className="text-2xl font-bold mb-6">Medical Symptom Tracker</h1>
      
      {/* Symptom Entry Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium mb-3">{isEditing ? 'Edit Symptom' : 'Record New Symptom'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Symptom Name *</label>
            <input
              type="text"
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter symptom name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Common Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((commonSymptom) => (
                <button
                  key={commonSymptom}
                  type="button"
                  onClick={() => selectCommonSymptom(commonSymptom)}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
                >
                  {commonSymptom}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Severity (1-10)</label>
            <input
              type="range"
              min="1"
              max="10"
              value={severity}
              onChange={(e) => setSeverity(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 - Very Mild</span>
              <span>5 - Moderate</span>
              <span>10 - Severe</span>
            </div>
            <div className="text-center font-bold text-xl mt-2">
              {severity} / 10
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Duration</label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 hours, all day, 3 days"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Additional details about the symptom"
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
                placeholder="Add tags (e.g., chronic, acute, after-medication)"
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
      
      {/* Symptoms List */}
      <div>
        <h3 className="text-lg font-medium mb-3">Your Symptom History</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading && <p>Loading...</p>}
        
        {!loading && symptoms.length === 0 && (
          <p className="text-gray-500">No symptoms recorded yet. Start tracking your symptoms above!</p>
        )}
        
        {symptoms.length > 0 && (
          <div className="space-y-4">
            {symptoms.map((symptomData) => (
              <div key={symptomData.id} className="bg-white shadow-md rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="text-lg font-medium">{symptomData.symptom}</h4>
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Severity: {symptomData.severity}/10
                      </span>
                      {symptomData.duration && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Duration: {symptomData.duration}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-500 text-sm">
                      {format(new Date(symptomData.createdAt), 'PPP p')}
                    </div>
                    {symptomData.notes && <p className="mt-2">{symptomData.notes}</p>}
                    {symptomData.tags && symptomData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {symptomData.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(symptomData)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(symptomData.id)}
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

export default MedicalSymptomTracker; 