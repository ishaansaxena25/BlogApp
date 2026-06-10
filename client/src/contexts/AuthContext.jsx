import { useEffect, useMemo, useState } from 'react';
import { getProfile, logout as logoutRequest } from '../api';
import AuthContext from './authContextValue';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    let active = true;
    getProfile()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login(data) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      setIsLoading(false);
    },
    setUser,
    async logout() {
      try {
        await logoutRequest();
      } finally {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    },
  }), [user, token, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
