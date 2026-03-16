import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
}

/**
 * Bảo vệ route - kiểm tra authentication và role.
 * - Chưa đăng nhập → redirect về /login
 * - Sai role → redirect về /unauthorized
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userRole = user.role?.toUpperCase();
    const normalizedRoles = roles.map((r) => r.toUpperCase());

    if (!normalizedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    // Special check: If user is COMPANY but has no companyId, they are still pending approval.
    // They should not access protected /company/* routes yet.
    if (userRole === 'COMPANY' && !user.companyId) {
      // Check if we are trying to access a B2B feature
      if (location.pathname.startsWith('/company')) {
        return <Navigate to="/approval-pending" replace />;
      }
    }
  }

  return <>{children || <Outlet />}</>;
}
