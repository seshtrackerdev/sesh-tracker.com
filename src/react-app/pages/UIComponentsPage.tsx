import React, { useState } from 'react';
import { Button, Card, Input, Badge } from '../components/ui';
import {
  StrainCard,
  EffectTag,
  TerpeneProfile,
  QuickSessionButton,
  MinimalSessionForm,
  InsightfulSessionForm,
  MedicalSymptomTracker,
  ConsumptionAnalytics,
} from '../components/cannabis';
import type { Strain } from '../components/cannabis/StrainCard';
import type { Terpene } from '../components/cannabis/TerpeneProfile';
import type { ConsumptionMethod } from '../components/cannabis/ConsumptionMethodSelector';
import type { Symptom } from '../components/cannabis/MedicalSymptomTracker';
import type { SessionData } from '../components/cannabis/MinimalSessionForm';
import type { InsightfulSessionData } from '../components/cannabis/InsightfulSessionForm';
import '../styles/UIComponentsPage.css';

// Define StrainItem locally for mockInventory
interface StrainItem {
  id: string;
  name: string;
  type: 'indica' | 'sativa' | 'hybrid'; // Match type used in forms
}

const mockStrain: Strain = {
  id: '1',
  name: 'Cosmic Dream',
  type: 'Hybrid',
  thc: 22.5,
  cbd: 0.8,
  description: 'A balanced hybrid known for its uplifting yet relaxing effects. Notes of citrus and pine.',
  effects: ['Relaxed', 'Happy', 'Uplifted', 'Creative', 'Focused'],
  terpenes: [{ name: 'Myrcene', value: 0.5 }, { name: 'Limonene', value: 0.3 }],
  imageUrl: 'https://via.placeholder.com/300x200?text=Cosmic+Dream',
  userRating: 4.5,
  purchaseDate: '2024-04-01',
  price: 45.00,
  quantity: '3.5g'
};

const mockInventory: StrainItem[] = [
  { id: '1', name: 'Cosmic Dream', type: 'hybrid' },
  { id: '2', name: 'Granddaddy Purple', type: 'indica' },
  { id: '3', name: 'Sour Diesel', type: 'sativa' },
];

const mockTerpenes: Terpene[] = [
  { name: 'Limonene', percentage: 0.8, color: '#fde047', flavor: 'Citrus', effects: ['Uplifting', 'Stress Relief'] },
  { name: 'Myrcene', percentage: 0.6, color: '#a3e635', flavor: 'Earthy, Musky', effects: ['Relaxing', 'Sedative'] },
  { name: 'Pinene', percentage: 0.4, color: '#4ade80', flavor: 'Pine', effects: ['Alertness', 'Memory Aid'] },
  { name: 'Caryophyllene', percentage: 0.3, color: '#f97316', flavor: 'Peppery, Spicy', effects: ['Pain Relief', 'Anti-inflammatory'] },
];

const mockMethodData: { id: ConsumptionMethod; label: string }[] = [
  { id: 'smoking', label: 'Smoking (Pipe)' },
  { id: 'vaping', label: 'Vaping (Cartridge)' },
  { id: 'edible', label: 'Edible (Gummy)' },
  { id: 'tincture', label: 'Tincture' },
  { id: 'topical', label: 'Topical' },
  { id: 'concentrate', label: 'Concentrate (Dab)' },
  { id: 'other', label: 'Other Method' },
];

const handleLog = (component: string, data: any) => {
  console.log(`[${component}]:`, data);
};

const UIComponentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('cannabis');
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedMethodId, setSelectedMethodId] = useState<ConsumptionMethod | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);

  return (
    <div className="ui-components-page">
      <div className="ui-components-header">
        <h1>UI & Cannabis Components</h1>
        <p>Showcase of reusable components in the SeshTracker system.</p>
      </div>

      <div className="tabs-container">
        <ul className="tabs-list">
          {[
            { id: 'cannabis', label: 'Cannabis Components' },
            { id: 'buttons', label: 'Buttons' },
            { id: 'inputs', label: 'Inputs' },
            { id: 'cards', label: 'Cards' },
            { id: 'badges', label: 'Badges' },
          ].map(tab => (
            <li key={tab.id} className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}>
              <button onClick={() => setActiveTab(tab.id)}>{tab.label}</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="ui-components-content">
        {activeTab === 'cannabis' && (
          <div className="component-section">
            <h2>Cannabis Components</h2>
            <p>Components specifically designed for cannabis tracking and information.</p>

            <div className="component-subsection">
              <h3>Strain Information</h3>
              <div className="component-grid">
                <div className="component-item-full">
                  <h4>Strain Card</h4>
                  <StrainCard strain={mockStrain} onClick={() => handleLog('StrainCard', 'Clicked!')} />
                </div>
                <div className="component-item">
                  <h4>Effect Tags</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <EffectTag effect="Relaxed" category="physical" />
                    <EffectTag effect="Creative" category="mental" />
                    <EffectTag effect="Pain Relief" category="medicinal" intensity={4} />
                    <EffectTag effect="Anxiety" category="negative" removable onRemove={() => handleLog('EffectTag', 'Remove Anxiety')} />
                    <EffectTag effect="Earthy" category="flavor" size="sm" />
                  </div>
                </div>
                <div className="component-item">
                  <h4>Terpene Profile</h4>
                  <TerpeneProfile terpenes={mockTerpenes} maxDisplay={4} showFlavors onTerpeneClick={(t) => handleLog('TerpeneProfile', t)} />
                </div>
              </div>
            </div>

            <div className="component-subsection">
              <h3>Session Logging</h3>
              <div className="component-grid">
                <div className="component-item-full">
                  <h4>Quick Session Button</h4>
                  <QuickSessionButton 
                    label="Quick Track Sesh"
                    description="Just start/stop the timer"
                    onSessionStart={() => handleLog('QuickSessionButton', 'Started')}
                    onSessionEnd={(duration: number) => handleLog('QuickSessionButton', `Ended - Duration: ${duration}s`)}
                    onSessionCancel={() => handleLog('QuickSessionButton', 'Cancelled')}
                  />
                </div>
                <div className="component-item-full">
                  <h4>Consumption Method Buttons (Example)</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {mockMethodData.map(method => (
                      <Button 
                        key={method.id} 
                        variant={selectedMethodId === method.id ? 'primary' : 'outline'}
                        onClick={() => {
                          setSelectedMethodId(method.id);
                          handleLog('ConsumptionMethodSelector', { method: method.id });
                        }}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </div>
                  {selectedMethodId && <p>Selected Method ID: {selectedMethodId}</p>}
                </div>

                <div className="component-item-full">
                  <h4>Minimal Session Form</h4>
                  <MinimalSessionForm
                    inventory={mockInventory}
                    onSessionStart={() => handleLog('MinimalSessionForm', 'Started')}
                    onSessionEnd={(data: SessionData) => handleLog('MinimalSessionForm', data)}
                    onSessionCancel={() => handleLog('MinimalSessionForm', 'Cancelled')}
                  />
                </div>
                 <div className="component-item-full">
                   <h4>Insightful Session Form</h4>
                   <InsightfulSessionForm 
                     inventory={mockInventory}
                     onSessionStart={() => handleLog('InsightfulSessionForm', 'Started')}
                     onSessionEnd={(data: InsightfulSessionData) => handleLog('InsightfulSessionForm', data)}
                     onSessionCancel={() => handleLog('InsightfulSessionForm', 'Cancelled')}
                   />
                 </div>
              </div>
            </div>

            <div className="component-subsection">
              <h3>Analytics & Medical Tracking</h3>
              <div className="component-grid">
                <div className="component-item-full">
                  <h4>Consumption Analytics</h4>
                  <ConsumptionAnalytics userId="showcase-user-123" />
                </div>
                <div className="component-item-full">
                  <h4>Medical Symptom Tracker</h4>
                  <MedicalSymptomTracker 
                    onSymptomsUpdate={(updatedSymptoms: Symptom[]) => {
                      handleLog('MedicalSymptomTracker', updatedSymptoms);
                      setSymptoms(updatedSymptoms);
                    }}
                    initialSymptoms={symptoms}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'buttons' && (
          <div className="component-section">
            <h2>Buttons</h2>
            <p>Buttons are used to trigger actions or events.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Primary Button</h3>
                <Button variant="primary">Primary Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Secondary Button</h3>
                <Button variant="secondary">Secondary Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Outline Button</h3>
                <Button variant="outline">Outline Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Ghost Button</h3>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Danger Button</h3>
                <Button variant="danger">Danger Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Success Button</h3>
                <Button variant="success">Success Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Disabled Button</h3>
                <Button variant="primary" disabled>Disabled Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Icon Button</h3>
                <Button variant="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </Button>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'inputs' && (
          <div className="component-section">
            <h2>Inputs</h2>
            <p>Input components for collecting user data.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Text Input</h3>
                <Input 
                  type="text" 
                  placeholder="Enter text here"
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
                />
              </div>
              
              <div className="component-item">
                <h3>Password Input</h3>
                <Input 
                  type="password" 
                  placeholder="Enter password"
                />
              </div>
              
              <div className="component-item">
                <h3>Disabled Input</h3>
                <Input 
                  type="text" 
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="component-section">
            <h2>Cards</h2>
            <p>Cards are containers for content and actions about a single subject.</p>
            
            <div className="component-grid">
              <div className="component-item-full">
                <h3>Basic Card</h3>
                <Card>
                  <div className="p-4">
                    <h3>Card Title</h3>
                    <p>This is a basic card component.</p>
                  </div>
                </Card>
              </div>
              
              <div className="component-item-full">
                <h3>Interactive Card</h3>
                <Card interactive>
                  <h3>Interactive Card</h3>
                  <p>This card has hover and active states to indicate that it's interactive.</p>
                  <Button variant="primary" size="small">Learn More</Button>
                </Card>
              </div>
              
              <div className="component-item-full">
                <h3>Elevated Card</h3>
                <Card elevated>
                  <h3>Elevated Card</h3>
                  <p>This card has a more pronounced shadow to create depth in the interface.</p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="component-section">
            <h2>Badges</h2>
            <p>Badges are used to highlight status, labels, or counts.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Primary Badge</h3>
                <Badge variant="primary">Primary</Badge>
              </div>
              
              <div className="component-item">
                <h3>Secondary Badge</h3>
                <Badge variant="secondary">Secondary</Badge>
              </div>
              
              <div className="component-item">
                <h3>Success Badge</h3>
                <Badge variant="success">Success</Badge>
              </div>
              
              <div className="component-item">
                <h3>Warning Badge</h3>
                <Badge variant="warning">Warning</Badge>
              </div>
              
              <div className="component-item">
                <h3>Danger Badge</h3>
                <Badge variant="danger">Danger</Badge>
              </div>
              
              <div className="component-item">
                <h3>Info Badge</h3>
                <Badge variant="info">Info</Badge>
              </div>
              
              <div className="component-item">
                <h3>Outline Badge</h3>
                <Badge variant="outline">Outline</Badge>
              </div>
              
              <div className="component-item">
                <h3>Count Badge</h3>
                <Badge variant="count">5</Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIComponentsPage; 