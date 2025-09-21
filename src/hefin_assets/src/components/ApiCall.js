import React from 'react';

export const withApiCall = (Component) => {
  return function WrappedComponent(props) {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    
    const executeApiCall = async (apiFunction, ...args) => {
      try {
        setLoading(true);
        setError(null);
        return await apiFunction(...args);
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    return (
      <Component
        {...props}
        apiCall={executeApiCall}
        apiLoading={loading}
        apiError={error}
      />
    );
  };
};
