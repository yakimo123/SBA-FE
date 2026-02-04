import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface UseAuthGuardOptions {
    redirectTo?: string;
    requiredRole?: string | string[];
}

/**
 * Hook để bảo vệ routes yêu cầu authentication
 */
export function useAuthGuard(options: UseAuthGuardOptions = {}) {
    const { redirectTo = '/login', requiredRole } = options;
    const { isAuthenticated, isLoading, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            // Redirect to login, save current location for redirect back
            navigate(redirectTo, {
                replace: true,
                state: { from: location.pathname }
            });
            return;
        }

        // Check role if required
        if (requiredRole && user) {
            const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
            if (!roles.includes(user.role)) {
                // User doesn't have required role
                navigate('/unauthorized', { replace: true });
                return;
            }
        }

        setIsAuthorized(true);
    }, [isAuthenticated, isLoading, user, navigate, redirectTo, requiredRole, location.pathname]);

    return { isAuthorized, isLoading };
}

/**
 * Hook để redirect user đã đăng nhập khỏi trang login/register
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (isLoading) return;

        if (isAuthenticated) {
            // Redirect to previous page or default
            const from = (location.state as { from?: string })?.from || redirectTo;
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo, location.state]);

    return { isLoading };
}

/**
 * Hook để xử lý form login/register
 */
export function useAuthForm() {
    const { login, register, isLoading, error, clearError } = useAuth();

    const handleLogin = useCallback(async (email: string, password: string) => {
        try {
            await login(email, password);
            return { success: true };
        } catch {
            return { success: false };
        }
    }, [login]);

    const handleRegister = useCallback(async (
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
    }, [register]);

    return {
        handleLogin,
        handleRegister,
        isLoading,
        error,
        clearError,
    };
}

export default useAuthGuard;
