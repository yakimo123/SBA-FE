import { Building2, Mail, Phone, User } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

export function CompanyAccount() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-['Fira_Sans']">
      <div>
        <h1 className="font-['Fira_Code'] text-3xl font-bold text-blue-900">Tài khoản</h1>
        <p className="mt-1 text-sm text-gray-500">Thông tin tài khoản công ty</p>
      </div>

      <div className="max-w-lg rounded-xl border border-blue-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white text-2xl font-bold">
            {(user?.fullName || user?.name || 'C')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.fullName || user?.name}</p>
            <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              B2B Company
            </span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 py-4">
            <User className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Họ và tên</p>
              <p className="text-sm font-medium text-gray-900">{user?.fullName || user?.name || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4">
            <Mail className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900">{user?.email || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Số điện thoại</p>
              <p className="text-sm font-medium text-gray-900">{user?.phoneNumber || user?.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 py-4">
            <Building2 className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Vai trò</p>
              <p className="text-sm font-medium text-gray-900">{user?.role || '—'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
