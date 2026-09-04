/**
 * AuthContext.jsx - Admin authentication context
 *
 * Login flow (cookie-based):
 *  1. POST /api/auth/login  -> server verifies bcrypt
 *  2. Server sets HttpOnly cookie __Host-admin_session
 *  3. Browser automatically sends cookie on every subsequent request
 *  4. PUT /api/content/* requires a valid session (checked server-side)
 *  5. POST /api/auth/logout destroys the session + clears the cookie
 *
 * The client never sees, stores, or forwards a token.
 * Session TTL is managed entirely server-side (15 min idle).
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '@/utils/apiBase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading,       setIsLoading]       = useState(true); // true until status check resolves
  const [error,           setError]           = useState('');

  // Bootstrap: check session status on mount.
  // Restores auth state across page refreshes without exposing any token.
  useEffect(() => {
    fetch(`${API_BASE}/api/auth/status`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setIsAuthenticated(Boolean(data.authenticated)); })
      .catch(() => { setIsAuthenticated(false); })
      .finally(() => { setIsLoading(false); });
  }, []);

  // Login
  const login = useCallback(async (password) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setIsAuthenticated(true);
        return true;
      }

      if (res.status === 429) {
        setError('Too many failed attempts. Locked for 15 minutes.');
      } else {
        setError(data.error || 'Invalid credentials.');
      }
      return false;

    } catch {
      setError('Cannot reach server. Is it running?');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(async (reason = '') => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Best-effort; even if request fails, clear local state
    }
    setIsAuthenticated(false);
    if (reason) setError(reason);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
