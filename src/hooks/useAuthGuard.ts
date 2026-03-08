import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requiredRole?: string | string[];
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const { redirectTo = '/login', requiredRole } = options;
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate(redirectTo, {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    if (requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!user?.role || !roles.includes(user.role)) {
        navigate('/unauthorized', { replace: true });
        return;
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    navigate,
    redirectTo,
    requiredRole,
    location.pathname,
  ]);

  // Tính toán trực tiếp, không dùng state
  const isAuthorized =
    !isLoading &&
    isAuthenticated &&
    (() => {
      if (!requiredRole) return true;
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      return !!user?.role && roles.includes(user.role);
    })();

  return { isAuthorized, isLoading };
}

export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const from = (location.state as { from?: string })?.from || redirectTo;
    navigate(from, { replace: true });
  }, [isAuthenticated, isLoading, navigate, redirectTo, location.state]);

  return { isLoading };
}

export function useAuthForm() {
  const { login, register, isLoading, error, clearError } = useAuth();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        await login(email, password);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [login]
  );

  const handleRegister = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
      phoneNumber?: string
    ) => {
      try {
        await register(fullName, email, password, phoneNumber);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [register]
  );

  return { handleLogin, handleRegister, isLoading, error, clearError };
}

export default useAuthGuard;
