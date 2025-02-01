import 'fake-indexeddb/auto';
import { db, addFuelEntry, getRecentEntries, getAllEntries, deleteFuelEntry, getBasicStats, clearAllEntries } from './index';

describe('FuelLensDatabase', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should add a fuel entry', async () => {
    const entry = {
      date: new Date(),
      odometer: 1000,
      liters: 50,
      cost: 100,
      currency: 'USD',
      notes: 'Test entry'
    };
    const id = await addFuelEntry(entry);
    const entries = await getAllEntries();
    expect(entries.length).toBe(1);
    expect(entries[0].id).toBe(id);
  });

  it('should retrieve recent entries', async () => {
    const entry1 = { date: new Date('2023-01-01'), odometer: 1000, liters: 50, cost: 100, currency: 'USD' };
    const entry2 = { date: new Date('2023-01-02'), odometer: 1100, liters: 40, cost: 80, currency: 'USD' };
    await addFuelEntry(entry1);
    await addFuelEntry(entry2);
    const recentEntries = await getRecentEntries(1);
    expect(recentEntries.length).toBe(1);
    expect(recentEntries[0].odometer).toBe(1100);
  });

  it('should delete a fuel entry', async () => {
    const entry = { date: new Date(), odometer: 1000, liters: 50, cost: 100, currency: 'USD' };
    const id = await addFuelEntry(entry);
    await deleteFuelEntry(id);
    const entries = await getAllEntries();
    expect(entries.length).toBe(0);
  });

  it('should calculate basic stats', async () => {
    const entry1 = { date: new Date('2023-01-01'), odometer: 500, liters: 50, cost: 100, currency: 'USD' };
    const entry2 = { date: new Date('2023-01-02'), odometer: 900, liters: 40, cost: 80, currency: 'USD' };
    await addFuelEntry(entry1);
    await addFuelEntry(entry2);
    const stats = await getBasicStats();
    expect(stats).toEqual({
      avgConsumption: 10,
      costPerKm: 0.2,
      totalCost: 180,
      totalDistance: 900,
      trend: 'neutral'
    });
  });


  it('should calculate upward trend', async () => {
    const entry1 = { date: new Date('2023-01-01'), odometer: 500, liters: 50, cost: 100, currency: 'USD' };
    const entry2 = { date: new Date('2023-01-02'), odometer: 900, liters: 40, cost: 80, currency: 'USD' };
    const entry3 = { date: new Date('2023-01-03'), odometer: 1000, liters: 12, cost: 24, currency: 'USD' };
    await addFuelEntry(entry1);
    await addFuelEntry(entry2);
    await addFuelEntry(entry3);
    const stats = await getBasicStats();
    expect(stats).toEqual({
      avgConsumption: 10.2,
      costPerKm: 0.204,
      totalCost: 204,
      totalDistance: 1000,
      trend: 'worsening'
    });
  });

  it('should calculate downward trend', async () => {
    const entry1 = { date: new Date('2023-01-01'), odometer: 500, liters: 50, cost: 100, currency: 'USD' };
    const entry2 = { date: new Date('2023-01-02'), odometer: 900, liters: 40, cost: 80, currency: 'USD' };
    const entry3 = { date: new Date('2023-01-03'), odometer: 1000, liters: 12, cost: 24, currency: 'USD' };
    const entry4 = { date: new Date('2023-01-04'), odometer: 1100, liters: 8, cost: 16, currency: 'USD' };
    await addFuelEntry(entry1);
    await addFuelEntry(entry2);
    await addFuelEntry(entry3);
    await addFuelEntry(entry4);
    const stats = await getBasicStats();
    expect(stats).toEqual({
      avgConsumption: 10,
      costPerKm: 0.2,
      totalCost: 220,
      totalDistance: 1100,
      trend: 'improving'
    });
  });

  it('should clear all entries', async () => {
    const entries = [
      { date: new Date('2023-01-01'), odometer: 500, liters: 50, cost: 100, currency: 'USD' },
      { date: new Date('2023-01-02'), odometer: 900, liters: 40, cost: 80, currency: 'USD' },
      { date: new Date('2023-01-03'), odometer: 1000, liters: 12, cost: 24, currency: 'USD' }
    ];

    // Add multiple entries
    for (const entry of entries) {
      await addFuelEntry(entry);
    }

    // Verify entries were added
    let allEntries = await getAllEntries();
    expect(allEntries.length).toBe(3);

    // Clear all entries
    await clearAllEntries();

    // Verify all entries were removed
    allEntries = await getAllEntries();
    expect(allEntries.length).toBe(0);
  });
}); 