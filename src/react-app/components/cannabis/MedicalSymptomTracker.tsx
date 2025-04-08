import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Label, Slider } from '../ui';
import { PlusCircle, FileText } from 'lucide-react';
import './MedicalSymptomTracker.css';

export interface Symptom {
  id: string;
  name: string;
  intensityBefore?: number;
  intensityAfter?: number;
}

interface MedicalSymptomTrackerProps {
  sessionId?: string; // Optional: link symptoms to a specific session
  onSymptomsUpdate: (symptoms: Symptom[]) => void;
  initialSymptoms?: Symptom[];
}

export const MedicalSymptomTracker: React.FC<MedicalSymptomTrackerProps> = ({
  sessionId,
  onSymptomsUpdate,
  initialSymptoms = [],
}) => {
  const [symptoms, setSymptoms] = useState<Symptom[]>(initialSymptoms);
  const [newSymptomName, setNewSymptomName] = useState('');

  const handleAddSymptom = useCallback(() => {
    if (newSymptomName.trim() === '') return;
    const newSymptom: Symptom = {
      id: crypto.randomUUID(),
      name: newSymptomName.trim(),
      intensityBefore: 0,
      intensityAfter: 0,
    };
    const updatedSymptoms = [...symptoms, newSymptom];
    setSymptoms(updatedSymptoms);
    onSymptomsUpdate(updatedSymptoms);
    setNewSymptomName('');
  }, [newSymptomName, symptoms, onSymptomsUpdate]);

  /* Comment out unused function
  const handleRemoveSymptom = useCallback((idToRemove: string) => {
    const updatedSymptoms = symptoms.filter(symptom => symptom.id !== idToRemove);
    setSymptoms(updatedSymptoms);
    onSymptomsUpdate(updatedSymptoms);
  }, [symptoms, onSymptomsUpdate]);
  */

  const handleIntensityChange = useCallback(
    (id: string, type: 'before' | 'after', value: number) => {
      const updatedSymptoms = symptoms.map((symptom) => {
        if (symptom.id === id) {
          return {
            ...symptom,
            [type === 'before' ? 'intensityBefore' : 'intensityAfter']: value,
          };
        }
        return symptom;
      });
      setSymptoms(updatedSymptoms);
      onSymptomsUpdate(updatedSymptoms);
    },
    [symptoms, onSymptomsUpdate]
  );

  const handleExportReport = useCallback(() => {
    console.log('Exporting symptom report for session:', sessionId, symptoms);
    const reportContent = symptoms
      .map(s => `${s.name}, Before: ${s.intensityBefore ?? 'N/A'}, After: ${s.intensityAfter ?? 'N/A'}`)
      .join('\n');
    alert(`Symptom Report:\n${reportContent}`);
  }, [symptoms, sessionId]);

  return (
    <Card className="medical-symptom-tracker">
      <CardHeader>
        <CardTitle>Medical Symptom Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="add-symptom-section">
          <Label htmlFor="new-symptom" className="sr-only">Add New Symptom</Label>
          <Input
            id="new-symptom"
            type="text"
            value={newSymptomName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSymptomName(e.target.value)}
            placeholder="Add symptom (e.g., Headache)"
            className="symptom-input"
          />
          <Button onClick={handleAddSymptom} size="sm" variant="outline">
            <PlusCircle className="mr-2 h-4 w-4" /> Add
          </Button>
        </div>

        {symptoms.length === 0 && <p className="no-symptoms-message">No symptoms added yet.</p>}

        <div className="symptoms-list">
          {symptoms.map((symptom) => (
            <div key={symptom.id} className="symptom-item">
              <h4 className="symptom-name">{symptom.name}</h4>
              <div className="intensity-sliders">
                <div className="slider-group">
                  <Label>Intensity Before Session (0-10)</Label>
                  <Slider
                    value={[symptom.intensityBefore ?? 0]}
                    onValueChange={([value]: number[]) => handleIntensityChange(symptom.id, 'before', value)}
                    max={10}
                    step={1}
                    className="intensity-slider"
                  />
                  <span>{symptom.intensityBefore ?? 0}</span>
                </div>
                <div className="slider-group">
                  <Label>Intensity After Session (0-10)</Label>
                  <Slider
                    value={[symptom.intensityAfter ?? 0]}
                    onValueChange={([value]: number[]) => handleIntensityChange(symptom.id, 'after', value)}
                    max={10}
                    step={1}
                    className="intensity-slider"
                  />
                   <span>{symptom.intensityAfter ?? 0}</span>
                </div>
              </div>
              {/* Add remove symptom button if needed */}
            </div>
          ))}
        </div>

        {symptoms.length > 0 && (
           <Button onClick={handleExportReport} variant="secondary" className="export-button">
             <FileText className="mr-2 h-4 w-4" /> Export Report
           </Button>
        )}
      </CardContent>
    </Card>
  );
}; 