import { Search, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { UserResponse, userService } from '../../services/userService';
import { voucherService } from '../../services/voucherService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Column, DataTable } from './DataTable';
import { Modal } from './Modal';

interface VoucherAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucherId: number;
  voucherCode: string;
}

export function VoucherAssignModal({
  isOpen,
  onClose,
  voucherId,
  voucherCode,
}: VoucherAssignModalProps) {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'CUSTOMER' | 'COMPANY'>(
    'ALL'
  );
  const [isAssigning, setIsAssigning] = useState(false);

  const fetchUsers = async (query = '', role: string = roleFilter) => {
    try {
      const data = await userService.getUsers({
        keyword: query,
        size: 100,
        role: role === 'ALL' ? undefined : role,
      });
      setUsers(data.content);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers('', roleFilter);
      setSelectedUsers([]);
      setSearchQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, roleFilter]);

  const handleRoleFilterChange = (role: 'ALL' | 'CUSTOMER' | 'COMPANY') => {
    setRoleFilter(role);
    setSelectedUsers([]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchQuery, roleFilter);
  };

  const handleAssign = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    setIsAssigning(true);
    try {
      const userIds = selectedUsers
        .map((u) => u.userId)
        .filter((id) => id !== undefined && id !== null);

      if (userIds.length === 0) {
        toast.error('Không tìm thấy ID người dùng hợp lệ để cấp phát');
        return;
      }

      await voucherService.assignVoucherBulk(voucherId, userIds);
      toast.success(
        `Đã tặng voucher ${voucherCode} cho ${selectedUsers.length} người dùng`
      );
      onClose();
    } catch (error) {
      console.error('Error assigning voucher:', error);
      toast.error('Lỗi khi cấp phát voucher');
    } finally {
      setIsAssigning(false);
    }
  };

  const columns: Column<UserResponse>[] = [
    {
      header: 'ID',
      accessor: 'userId',
      render: (u) => (
        <span className="font-mono text-gray-500 font-medium">#{u.userId}</span>
      ),
    },
    {
      header: 'Họ tên',
      accessor: 'fullName',
      render: (u) => (
        <span className="font-bold text-gray-900">{u.fullName}</span>
      ),
    },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Số điện thoại',
      accessor: 'phoneNumber',
      render: (u) =>
        u.phoneNumber || (
          <span className="text-gray-400 italic">Chưa cập nhật</span>
        ),
    },
    {
      header: 'Vai trò',
      accessor: 'role',
      render: (u) => {
        const roleColors: Record<string, string> = {
          ADMIN: 'bg-red-100 text-red-700',
          CUSTOMER: 'bg-blue-100 text-blue-700',
          COMPANY: 'bg-indigo-100 text-indigo-700',
        };
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
              roleColors[u.role] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {u.role}
          </span>
        );
      },
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (u) => (
        <span
          className={`flex items-center gap-1.5 ${u.isActive ? 'text-green-600' : 'text-gray-400'}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${u.isActive ? 'bg-green-600' : 'bg-gray-400'}`}
          />
          {u.isActive ? 'Hoạt động' : 'Khóa'}
        </span>
      ),
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cấp phát Voucher: ${voucherCode}`}
      size="2xl"
    >
      <div className="space-y-4">
        {/* Role filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-600 mr-1">
            Lọc theo vai trò:
          </span>
          {(['ALL', 'CUSTOMER', 'COMPANY'] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => handleRoleFilterChange(role)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                roleFilter === role
                  ? role === 'COMPANY'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                    : role === 'CUSTOMER'
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-gray-700 text-white border-gray-700 shadow'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
              }`}
            >
              {role === 'ALL'
                ? 'Tất cả'
                : role === 'COMPANY'
                  ? 'Doanh nghiệp'
                  : 'Khách hàng'}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
              className="pl-12 h-14 text-lg border-purple-100 focus:border-purple-300 focus:ring-purple-200"
            />
          </div>
          <Button
            type="submit"
            className="h-14 px-8 text-lg bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-100"
          >
            Tìm kiếm
          </Button>
        </form>

        <div className="max-h-[500px] overflow-auto rounded-xl border border-purple-100 shadow-inner bg-gray-50/30">
          <DataTable
            columns={columns}
            data={users}
            keyField="userId"
            selectable={true}
            onSelectionChange={setSelectedUsers}
            pageSize={10}
          />
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-6">
          <div className="flex flex-col">
            <span className="text-base text-gray-500">
              Người dùng được chọn
            </span>
            <span className="text-2xl font-black text-purple-600">
              {selectedUsers.length} / {users.length}
            </span>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-14 px-8 text-lg hover:bg-gray-50 border-gray-200"
            >
              Hủy bỏ
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isAssigning || selectedUsers.length === 0}
              className="h-14 bg-orange-500 hover:bg-orange-600 px-10 text-lg font-bold shadow-lg shadow-orange-100 transition-all active:scale-95"
            >
              <UserPlus className="mr-2 h-6 w-6" />
              {isAssigning ? 'Đang cấp phát...' : 'Hoàn tất Cấp phát'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
