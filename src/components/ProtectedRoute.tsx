import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  /** Role(s) được phép truy cập. Nếu không truyền thì chỉ cần đăng nhập. */
  requiredRole?: string | string[];
  /** URL redirect khi chưa đăng nhập */
  redirectTo?: string;
}

/**
 * Component bảo vệ route:
 * - Chưa đăng nhập → redirect tới /login (giữ lại from path)
 * - Đăng nhập nhưng sai role → redirect tới /unauthorized
 * - OK → render children (Outlet)
 */
export function ProtectedRoute({
  requiredRole,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Đang load auth state → không render gì
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600" />
      </div>
    );
  }

  // Chưa đăng nhập → redirect login, lưu current path
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  // Kiểm tra role nếu cần
  if (requiredRole && user) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
}


