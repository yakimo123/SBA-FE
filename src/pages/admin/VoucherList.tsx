import { Copy, Edit, Plus, Trash2, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Column, DataTable } from '../../components/admin/DataTable';
import { VoucherAssignModal } from '../../components/admin/VoucherAssignModal';
import { VoucherFormModal } from '../../components/admin/VoucherFormModal';
import {
  VoucherRequest,
  VoucherResponse,
  voucherService,
} from '../../services/voucherService';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export function VoucherList() {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(
    null
  );
  const [assigningVoucher, setAssigningVoucher] =
    useState<VoucherResponse | null>(null);

  const fetchVouchers = useCallback(async () => {
    try {
      const data = await voucherService.getVouchers({ size: 100 });
      setVouchers(data.content);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      toast.error('Không thể tải danh sách voucher');
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleCreateVoucher = async (data: VoucherRequest) => {
    try {
      await voucherService.createVoucher(data);
      toast.success('Đã tạo voucher mới thành công');
      fetchVouchers();
    } catch (error) {
      console.error('Error creating voucher:', error);
      toast.error('Lỗi khi tạo voucher');
      throw error;
    }
  };

  const handleUpdateVoucher = async (data: VoucherRequest) => {
    if (!editingVoucher) return;
    try {
      await voucherService.updateVoucher(editingVoucher.voucherId, data);
      toast.success('Đã cập nhật voucher thành công');
      fetchVouchers();
    } catch (error) {
      console.error('Error updating voucher:', error);
      toast.error('Lỗi khi cập nhật voucher');
      throw error;
    }
  };

  const handleDeleteVoucher = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) return;
    try {
      await voucherService.deleteVoucher(id);
      toast.success('Đã xóa voucher');
      fetchVouchers();
    } catch (error) {
      console.error('Error deleting voucher:', error);
      toast.error('Lỗi khi xóa voucher');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.info(`Đã sao chép mã: ${code}`);
  };

  const columns: Column<VoucherResponse>[] = [
    {
      header: 'Mã',
      accessor: 'voucherCode',
      render: (v) => (
        <span className="rounded bg-gray-100 px-2 py-1 font-['Fira_Code'] font-medium text-purple-900 border border-purple-100">
          {v.voucherCode}
        </span>
      ),
    },
    {
      header: 'Giảm giá',
      accessor: 'discountValue',
      render: (v) => (
        <span className="font-bold text-green-600">
          {v.discountType === 'PERCENT'
            ? `${v.discountValue}%`
            : formatCurrency(v.discountValue)}
        </span>
      ),
    },
    {
      header: 'Loại',
      accessor: 'discountType',
      render: (v) => (
        <span className="text-sm text-gray-600">
          {v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
        </span>
      ),
    },
    {
      header: 'Sử dụng',
      accessor: 'usedCount',
      render: (v) => (
        <div className="w-full min-w-[120px]">
          <div className="flex justify-between text-xs font-medium mb-1.5">
            <span>{v.usedCount} đã dùng</span>
            <span>{v.usageLimit} giới hạn</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${v.usedCount >= v.usageLimit ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{
                width: `${Math.min((v.usedCount / v.usageLimit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Hết hạn',
      accessor: 'validTo',
      render: (v) => (
        <span className="text-sm">
          {new Date(v.validTo).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessor: 'isActive',
      render: (v) => {
        const isExpired = new Date(v.validTo) < new Date();
        const isFull = v.usedCount >= v.usageLimit;

        let statusText = 'Đang hoạt động';
        let statusClass = 'bg-green-100 text-green-800';

        if (isExpired) {
          statusText = 'Hết hạn';
          statusClass = 'bg-red-100 text-red-800';
        } else if (isFull) {
          statusText = 'Hết lượt';
          statusClass = 'bg-orange-100 text-orange-800';
        } else if (!v.isActive) {
          statusText = 'Tạm ngưng';
          statusClass = 'bg-gray-100 text-gray-800';
        }

        return (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusClass}`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      header: 'Thao tác',
      accessor: 'voucherId',
      sortable: false,
      render: (v) => (
        <div className="flex gap-1">
          <button
            onClick={() => handleCopyCode(v.voucherCode)}
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
            title="Copy Code"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setAssigningVoucher(v);
              setIsAssignModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-orange-500 hover:bg-orange-50 transition-colors"
            title="Tặng cho khách hàng"
          >
            <UserPlus className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              setEditingVoucher(v);
              setIsFormModalOpen(true);
            }}
            className="rounded-lg p-1.5 text-purple-600 hover:bg-purple-50 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteVoucher(v.voucherId)}
            className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors"
            title="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fira_Code'] text-3xl font-bold text-purple-900">
            Vouchers
          </h1>
          <p className="mt-1 font-['Fira_Sans'] text-gray-600">
            Quản lý mã khuyến mãi và các chương trình ưu đãi
          </p>
        </div>
        <button
          onClick={() => {
            setEditingVoucher(null);
            setIsFormModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 hover:shadow-orange-300"
        >
          <Plus className="h-5 w-5" /> Tạo Voucher
        </button>
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <DataTable
          columns={columns}
          data={vouchers}
          keyField="voucherId"
          pageSize={10}
        />
      </div>

      <VoucherFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingVoucher(null);
        }}
        onSubmit={editingVoucher ? handleUpdateVoucher : handleCreateVoucher}
        initialData={editingVoucher}
        title={editingVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher mới'}
      />

      {assigningVoucher && (
        <VoucherAssignModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setAssigningVoucher(null);
          }}
          voucherId={assigningVoucher.voucherId}
          voucherCode={assigningVoucher.voucherCode}
        />
      )}
    </div>
  );
}
