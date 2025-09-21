import React, { createContext, useContext, useEffect, useState } from 'react';
import { hefinApi } from '../api/hefinApi';

const HefinApiContext = createContext();

export const HefinApiProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initApi = async () => {
      try {
        await hefinApi.init();
        setIsAuthenticated(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initApi();
  }, []);

  return (
    <HefinApiContext.Provider value={{
      hefinApi,
      isAuthenticated,
      isLoading,
      error
    }}>
      {children}
    </HefinApiContext.Provider>
  );
};

export const useHefinApi = () => useContext(HefinApiContext);
