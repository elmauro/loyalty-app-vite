import { useEffect, useState } from 'react';

export const useFetch = (fn: () => Promise<any>, deps = []) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fn()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
};
