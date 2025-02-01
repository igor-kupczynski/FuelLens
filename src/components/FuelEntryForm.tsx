import { useState } from 'react';
import { addFuelEntry, type FuelEntry } from '../db';

interface FormData {
  date: string;
  odometer: string;
  liters: string;
  cost: string;
  notes: string;
}

interface Props {
  lastOdometer?: number;
  onSuccess?: () => void;
}

export function FuelEntryForm({ lastOdometer, onSuccess }: Props) {
  const [formData, setFormData] = useState<FormData>({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    liters: '',
    cost: '',
    notes: ''
  });
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.date || !formData.odometer || !formData.liters || !formData.cost) {
      setError('All fields except notes are required');
      return false;
    }

    const odometer = Number(formData.odometer);
    const liters = Number(formData.liters);
    const cost = Number(formData.cost);

    if (isNaN(odometer) || isNaN(liters) || isNaN(cost)) {
      setError('Invalid number format');
      return false;
    }

    if (liters <= 0 || cost <= 0) {
      setError('Fuel amount and cost must be positive');
      return false;
    }

    if (lastOdometer && odometer <= lastOdometer) {
      setError('Odometer reading must be higher than the previous entry');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const entry: Omit<FuelEntry, 'id'> = {
        date: new Date(formData.date),
        odometer: Number(formData.odometer),
        liters: Number(formData.liters),
        cost: Number(formData.cost),
        currency: 'PLN', // Hardcoded for Phase 1
        notes: formData.notes
      };

      await addFuelEntry(entry);
      
      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        odometer: '',
        liters: '',
        cost: '',
        notes: ''
      });
      
      onSuccess?.();
    } catch (err) {
      setError('Failed to save entry');
      console.error('Failed to save entry:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4 max-w-md mx-auto p-4">
      <div className="space-y-2">
        <label htmlFor="date" className="block text-sm font-medium">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="odometer" className="block text-sm font-medium">
          Odometer Reading (km)
        </label>
        <input
          type="number"
          id="odometer"
          name="odometer"
          value={formData.odometer}
          onChange={handleChange}
          step="1"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="liters" className="block text-sm font-medium">
          Fuel Amount (L)
        </label>
        <input
          type="number"
          id="liters"
          name="liters"
          value={formData.liters}
          onChange={handleChange}
          step="0.01"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="cost" className="block text-sm font-medium">
          Total Cost (PLN)
        </label>
        <input
          type="number"
          id="cost"
          name="cost"
          value={formData.cost}
          onChange={handleChange}
          step="0.01"
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Entry'}
      </button>
    </form>
  );
} 