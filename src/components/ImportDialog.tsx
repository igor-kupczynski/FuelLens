import { useState } from 'react';
import { read, utils } from 'xlsx';
import { addFuelEntry, type FuelEntry } from '../db';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportProgress {
  total: number;
  current: number;
  success: number;
  failed: number;
}

export function ImportDialog({ onClose, onSuccess }: Props) {
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string>('');
  const [progress, setProgress] = useState<ImportProgress | null>(null);

  const processExcelData = async (data: unknown[][]) => {
    const entries: Omit<FuelEntry, 'id'>[] = [];
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 4) continue;

      const [dateStr, odometerStr, litersStr, costStr] = row;
      
      // Parse date
      let date: Date;
      try {
        if (typeof dateStr === 'number') {
          // Excel date number
          date = new Date((dateStr - 25569) * 86400 * 1000);
        } else {
          date = new Date(dateStr as string);
        }
        if (isNaN(date.getTime())) continue;
      } catch {
        continue;
      }

      // Parse numbers
      const odometer = Number(odometerStr);
      const liters = Number(litersStr);
      const cost = Number(costStr);

      if (isNaN(odometer) || isNaN(liters) || isNaN(cost)) continue;
      if (odometer <= 0 || liters <= 0 || cost <= 0) continue;

      entries.push({
        date,
        odometer,
        liters,
        cost,
        currency: 'PLN',
        notes: 'Imported from Excel'
      });
    }

    // Sort by date
    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Import entries
    setProgress({
      total: entries.length,
      current: 0,
      success: 0,
      failed: 0
    });

    for (let i = 0; i < entries.length; i++) {
      try {
        await addFuelEntry(entries[i]);
        setProgress(prev => prev ? {
          ...prev,
          current: i + 1,
          success: prev.success + 1
        } : null);
      } catch (err) {
        setProgress(prev => prev ? {
          ...prev,
          current: i + 1,
          failed: prev.failed + 1
        } : null);
        console.error('Failed to import entry:', err);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setError('');
    setProgress(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

      await processExcelData(jsonData);
      onSuccess();
    } catch (err) {
      setError('Failed to import file');
      console.error('Failed to import file:', err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Import from Excel</h2>
        
        <div className="space-y-4">
          {!isImporting && !progress && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Excel File
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="w-full"
              />
            </div>
          )}

          {isImporting && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2">Importing...</div>
            </div>
          )}

          {progress && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-blue-600 rounded"
                  style={{
                    width: `${(progress.current / progress.total) * 100}%`
                  }}
                ></div>
              </div>
              <div className="text-sm text-gray-600">
                Processed {progress.current} of {progress.total} entries
              </div>
              <div className="text-sm">
                <span className="text-green-600">
                  {progress.success} successful
                </span>
                {progress.failed > 0 && (
                  <span className="text-red-600 ml-2">
                    {progress.failed} failed
                  </span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 