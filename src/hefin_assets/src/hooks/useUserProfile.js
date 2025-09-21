import { useState, useEffect } from 'react';
import { useHefinApi } from '../contexts/HefinApiContext';

export const useUserProfile = () => {
  const { hefinApi, isAuthenticated } = useHefinApi();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        const userProfile = await hefinApi.getUserProfile();
        setProfile(userProfile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [hefinApi, isAuthenticated]);

  return { profile, loading, error };
};
