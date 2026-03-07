import { ShieldX } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { getDefaultRouteForRole } from '../constants/roles';
import { useAuth } from '../contexts/AuthContext';

export function UnauthorizedPage() {
  const { user, logout } = useAuth();
  const homeRoute = getDefaultRouteForRole(user?.role);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldX className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
        <p className="text-gray-600 mb-8">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={homeRoute}>
            <Button className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
              Về trang chủ
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={logout}
            className="w-full sm:w-auto"
          >
            Đăng nhập tài khoản khác
          </Button>
        </div>
      </div>
    </div>
  );
}


