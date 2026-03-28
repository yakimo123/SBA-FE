import { Building2, Mail, Phone, User, MessageCircle } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

const ZALO_LINK = 'https://zalo.me/0569613822'; // Thay bằng link Zalo thật của bạn

export function CompanyAccount() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 font-['Fira_Sans']">
      <div>
        <h1 className="font-['Fira_Code'] text-3xl font-bold -[#7f1d1d]">Tài khoản</h1>
        <p className="mt-1 text-sm text-gray-500">Thông tin tài khoản công ty</p>
      </div>

      <div className="max-w-lg rounded-xl border border-red-100 bg-white p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ee4d2d] text-white text-2xl font-bold">
            {(user?.fullName || user?.name || 'C')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{user?.fullName || user?.name}</p>
            <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-[#d73211]">
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

      <div className="fixed bottom-8 right-8 z-50">
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full bg-[#008fe5] hover:bg-[#006bb3] text-white px-5 py-3 shadow-lg transition-all duration-200 text-base font-semibold"
          style={{ boxShadow: '0 4px 24px 0 rgba(0,143,229,0.18)' }}
        >
          <MessageCircle className="w-5 h-5" />
          Hỗ trợ Zalo
        </a>
      </div>
    </div>
  );
}
