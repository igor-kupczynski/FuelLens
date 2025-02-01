import { useEffect, useState } from 'react';
import { getBasicStats } from '../db';

interface Stats {
  avgConsumption: number;
  costPerKm: number;
  totalCost: number;
  totalDistance: number;
  trend: 'improving' | 'worsening' | 'neutral';
}

export function BasicStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getBasicStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load statistics');
      console.error('Failed to load statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 p-4">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="text-center p-4">
        Not enough data to calculate statistics
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '↓';
      case 'worsening':
        return '↑';
      default:
        return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'worsening':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Average Consumption</div>
          <div className="text-lg font-medium flex items-center gap-2">
            {stats.avgConsumption.toFixed(1)} L/100km
            <span className={getTrendColor(stats.trend)}>
              {getTrendIcon(stats.trend)}
            </span>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Cost per Kilometer</div>
          <div className="text-lg font-medium">
            {stats.costPerKm.toFixed(2)} PLN/km
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Distance</div>
          <div className="text-lg font-medium">
            {stats.totalDistance.toFixed(0)} km
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-600">Total Cost</div>
          <div className="text-lg font-medium">
            {stats.totalCost.toFixed(2)} PLN
          </div>
        </div>
      </div>
    </div>
  );
} 