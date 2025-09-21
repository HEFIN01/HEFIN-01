import React, { useState } from 'react';
import { AuthClient } from "@dfinity/auth-client";

const Auth = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: "https://identity.ic0.app",
      onSuccess: () => {
        onLogin(authClient.getIdentity());
        setLoading(false);
      },
    });
  };

  return (
    <div className="auth-container">
      <button onClick={login} disabled={loading}>
        {loading ? "Connecting..." : "Login with Internet Identity"}
      </button>
    </div>
  );
};

export default Auth;
