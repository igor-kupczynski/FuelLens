import { useEffect, useState } from 'react';
import { getRecentEntries, deleteFuelEntry, type FuelEntry } from '../db';

interface Props {
  onDelete?: () => void;
}

export function RecentEntriesList({ onDelete }: Props) {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [swipedItemId, setSwipedItemId] = useState<number | null>(null);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const recentEntries = await getRecentEntries();
      setEntries(recentEntries);
    } catch (err) {
      setError('Failed to load entries');
      console.error('Failed to load entries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, id: number) => {
    setTouchStart(e.touches[0].clientX);
    setSwipedItemId(id);
  };

  const handleTouchMove = (e: React.TouchEvent, id: number) => {
    if (!touchStart || swipedItemId !== id) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50) { // Threshold for delete action
      handleDelete(id);
      setTouchStart(null);
      setSwipedItemId(null);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFuelEntry(id);
      await loadEntries();
      onDelete?.();
    } catch (err) {
      setError('Failed to delete entry');
      console.error('Failed to delete entry:', err);
    }
  };

  const calculateEfficiency = (entry: FuelEntry, prevEntry?: FuelEntry) => {
    if (!prevEntry) return null;
    const distance = entry.odometer - prevEntry.odometer;
    return (entry.liters * 100) / distance;
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="text-center p-4">No entries yet</div>;
  }

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Recent Entries</h2>
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const prevEntry = index < entries.length - 1 ? entries[index + 1] : undefined;
          const efficiency = calculateEfficiency(entry, prevEntry);

          return (
            <div
              key={entry.id}
              onTouchStart={(e) => handleTouchStart(e, entry.id!)}
              onTouchMove={(e) => handleTouchMove(e, entry.id!)}
              className="bg-white p-4 rounded shadow transition-transform"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">
                    {new Date(entry.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.odometer} km | {entry.liters.toFixed(2)} L
                  </div>
                  <div className="text-sm text-gray-600">
                    {entry.cost.toFixed(2)} {entry.currency}
                  </div>
                  {efficiency && (
                    <div className="text-sm text-gray-600">
                      {efficiency.toFixed(1)} L/100km
                    </div>
                  )}
                </div>
                {entry.notes && (
                  <div className="text-sm text-gray-500 italic">
                    {entry.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 