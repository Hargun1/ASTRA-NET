import { useState, useEffect, useCallback } from 'react';
import { fetchAllNASAData, NASASpaceWeatherData } from '../services/nasaApi';

interface UseNASADataReturn {
  data: NASASpaceWeatherData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useNASAData = (autoRefreshInterval: number = 5 * 60 * 1000): UseNASADataReturn => {
  const [data, setData] = useState<NASASpaceWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const nasaData = await fetchAllNASAData();
      setData(nasaData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch NASA data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every N minutes
    const interval = setInterval(fetchData, autoRefreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchData, autoRefreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    lastUpdated,
  };
};

export default useNASAData;
