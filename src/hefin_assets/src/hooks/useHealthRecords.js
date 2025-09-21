import { useState, useEffect } from 'react';
import { useHefinApi } from '../contexts/HefinApiContext';

export const useHealthRecords = (recordIds) => {
  const { hefinApi } = useHefinApi();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!recordIds || recordIds.length === 0) {
        setRecords([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const healthRecords = await hefinApi.getHealthRecords(recordIds);
        setRecords(healthRecords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [hefinApi, recordIds]);

  return { records, loading, error };
};
