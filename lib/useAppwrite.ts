import { useCallback, useEffect, useState } from 'react';

const useAppwrite = <T>(fetchFunction: () => Promise<T>, deps: any[] = []) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFunction();
      setData(response);
    } catch (err: any) {
      console.error('Fetch error:', err.message || err);
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]); // re-run when deps change

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    setData,
  };
};

export default useAppwrite;
