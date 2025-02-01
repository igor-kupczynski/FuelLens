import Dexie, { Table } from 'dexie';

export interface FuelEntry {
  id?: number;
  date: Date;
  odometer: number;
  liters: number;
  cost: number;
  currency: string;
  notes?: string;
}

export class FuelLensDatabase extends Dexie {
  fuelEntries!: Table<FuelEntry, number>;

  constructor() {
    super('FuelLens');
    this.version(1).stores({
      fuelEntries: '++id, date, odometer'
    });
  }
}

export const db = new FuelLensDatabase();

// Helper functions for common database operations
export const addFuelEntry = async (entry: Omit<FuelEntry, 'id'>) => {
  return await db.fuelEntries.add(entry);
};

export const getRecentEntries = async (limit = 5) => {
  return await db.fuelEntries
    .orderBy('date')
    .reverse()
    .limit(limit)
    .toArray();
};

export const getAllEntries = async () => {
  return await db.fuelEntries
    .orderBy('date')
    .toArray();
};

export const deleteFuelEntry = async (id: number) => {
  return await db.fuelEntries.delete(id);
};

export const getBasicStats = async () => {
  const entries = await getAllEntries();
  
  if (entries.length < 2) {
    return null;
  }

  const totalDistance = entries[entries.length - 1].odometer - entries[0].odometer;
  const totalFuel = entries.reduce((sum, entry) => sum + entry.liters, 0);
  const totalCost = entries.reduce((sum, entry) => sum + entry.cost, 0);
  
  const avgConsumption = (totalFuel * 100) / totalDistance; // L/100km
  const costPerKm = totalCost / totalDistance;

  // Calculate consumption trend
  const recentEntries = entries.slice(-3);
  const trend = recentEntries.length >= 2 
    ? calculateTrend(recentEntries)
    : 'neutral';

  return {
    avgConsumption,
    costPerKm,
    totalCost,
    totalDistance,
    trend
  };
};

function calculateTrend(entries: FuelEntry[]): 'improving' | 'worsening' | 'neutral' {
  if (entries.length < 2) return 'neutral';
  
  const consumptions = [];
  for (let i = 1; i < entries.length; i++) {
    const distance = entries[i].odometer - entries[i-1].odometer;
    const consumption = (entries[i].liters * 100) / distance;
    consumptions.push(consumption);
  }
  
  const diff = consumptions[consumptions.length - 1] - consumptions[0];
  if (Math.abs(diff) < 0.1) return 'neutral';
  return diff < 0 ? 'improving' : 'worsening';
} 