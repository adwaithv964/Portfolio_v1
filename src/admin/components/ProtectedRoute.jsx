import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

/**
 * ProtectedRoute — wraps any admin page.
 * Waits for the /api/auth/status bootstrap check (isLoading) before
 * deciding to redirect, to prevent a flash-to-login on page refresh.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/adwaith-ctrl-0x1', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // While the status check is in-flight, render nothing (no redirect yet)
  if (isLoading) return null;
  if (!isAuthenticated) return null;
  return children;
}
