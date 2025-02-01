import { useState, useEffect } from 'react';
import { FuelEntryForm } from './components/FuelEntryForm';
import { RecentEntriesList } from './components/RecentEntriesList';
import { BasicStats } from './components/BasicStats';
import { getRecentEntries } from './db';

function App() {
  const [lastOdometer, setLastOdometer] = useState<number>();
  const [key, setKey] = useState(0);

  useEffect(() => {
    loadLastOdometer();
  }, []);

  const loadLastOdometer = async () => {
    try {
      const entries = await getRecentEntries(1);
      if (entries.length > 0) {
        setLastOdometer(entries[0].odometer);
      }
    } catch (err) {
      console.error('Failed to load last odometer:', err);
    }
  };

  const handleSuccess = () => {
    loadLastOdometer();
    setKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              FuelLens
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FuelEntryForm
              lastOdometer={lastOdometer}
              onSuccess={handleSuccess}
            />
            <BasicStats key={`stats-${key}`} />
          </div>
          <div>
            <RecentEntriesList
              key={`list-${key}`}
              onDelete={handleSuccess}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
