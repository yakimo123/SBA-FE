import { ShieldX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    const role = user?.role?.toUpperCase();
    if (role === 'ADMIN') {
      navigate('/admin');
    } else if (role === 'COMPANY') {
      navigate('/company');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <ShieldX className="h-10 w-10 text-red-500" />
      </div>
      <div>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Không có quyền truy cập</h1>
        <p className="text-gray-500">
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu đây là nhầm lẫn.
        </p>
      </div>
      <Button onClick={handleGoBack} className="bg-blue-600 hover:bg-blue-700">
        Quay về trang chủ
      </Button>
    </div>
  );
}
