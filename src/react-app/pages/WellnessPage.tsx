import { useState } from 'react';
import { Tab } from '@headlessui/react';
import MoodTracker from '../components/mood/MoodTracker';
import MedicalSymptomTracker from '../components/medical/MedicalSymptomTracker';
import JournalTracker from '../components/journal/JournalTracker';
import { useAuth } from '../hooks/useAuth';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// Type for the selected tab in the headlessui/react Tab component
interface TabProps {
  selected: boolean;
}

const WellnessPage = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);

  // Redirect to login if no user is authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Please log in</strong>
          <span className="block sm:inline"> to access your wellness tracking features.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Wellness Tracking</h1>
      <p className="mb-8">Track your mood, medical symptoms, and keep a journal to monitor your overall wellness.</p>
      
      <div className="w-full max-w-6xl mx-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab
              className={({ selected }: TabProps) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Mood Tracking
            </Tab>
            <Tab
              className={({ selected }: TabProps) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Medical Symptoms
            </Tab>
            <Tab
              className={({ selected }: TabProps) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Journal
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-2">
            <Tab.Panel className="rounded-xl bg-white p-3">
              <MoodTracker />
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3">
              <MedicalSymptomTracker />
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-white p-3">
              <JournalTracker />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
};

export default WellnessPage; 