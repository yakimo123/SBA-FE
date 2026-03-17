import { Copy, Edit, Plus, Search, Tag, Trash2, UserPlus } from 'lucide-react';
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

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

  .vl-root {
    font-family: 'DM Sans', sans-serif;
    background: #f5f3ef;
    min-height: 100vh;
    color: #1a1612;
    padding: 32px;
  }

  .vl-header {
    display: flex; align-items: flex-end;
    justify-content: space-between; gap: 16px; margin-bottom: 28px;
  }
  .vl-header-left { display: flex; align-items: center; gap: 16px; }
  .vl-icon-badge {
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, #c9521a 0%, #e07040 100%);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(201,82,26,0.35); flex-shrink: 0;
  }
  .vl-icon-badge svg { color: white; width: 24px; height: 24px; }
  .vl-title {
    font-family: 'DM Serif Display', serif; font-size: 2rem;
    font-weight: 400; color: #1a1612; line-height: 1;
    margin: 0 0 4px; letter-spacing: -0.5px;
  }
  .vl-count-pill {
    display: inline-flex; align-items: center;
    background: #eeecf8; color: #4a3f8f;
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    font-weight: 500; padding: 2px 8px; border-radius: 20px;
    margin-left: 8px; letter-spacing: 0.02em;
  }
  .vl-subtitle { font-size: 0.875rem; color: #9c9085; margin: 0; }
  .vl-divider {
    width: 32px; height: 2px;
    background: linear-gradient(90deg, #c9521a 0%, transparent 100%);
    border-radius: 2px; margin: 4px 0 0 68px;
  }
  .vl-add-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #c9521a 0%, #e07040 100%);
    color: white; border: none; border-radius: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; box-shadow: 0 4px 14px rgba(201,82,26,0.3);
    transition: all 0.2s; white-space: nowrap;
  }
  .vl-add-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(201,82,26,0.38); }

  .vl-table-card {
    background: #ffffff; border: 1px solid #e8e3da;
    border-radius: 16px;
    box-shadow: 0 1px 3px rgba(26,22,18,0.06), 0 1px 2px rgba(26,22,18,0.04);
    overflow: hidden;
  }
  .vl-table-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid #e8e3da;
    background: #faf9f7;
  }
  .vl-search-wrap { position: relative; display: flex; align-items: center; }
  .vl-search-wrap svg {
    position: absolute; left: 10px; color: #9c9085;
    width: 14px; height: 14px; pointer-events: none;
  }
  .vl-search {
    padding: 7px 12px 7px 32px; border: 1px solid #e8e3da;
    border-radius: 8px; background: #ffffff;
    font-family: 'DM Sans', sans-serif; font-size: 0.85rem;
    color: #1a1612; outline: none; width: 220px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  .vl-search:focus { border-color: #c9521a; box-shadow: 0 0 0 3px rgba(201,82,26,0.12); }
  .vl-table-meta { font-size: 0.8rem; color: #9c9085; }

  .vl-table { width: 100%; border-collapse: collapse; }
  .vl-table thead tr { border-bottom: 1px solid #e8e3da; }
  .vl-table th {
    padding: 11px 20px; text-align: left;
    font-family: 'DM Mono', monospace; font-size: 0.69rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: #9c9085; background: #faf9f7;
  }
  .vl-table td {
    padding: 14px 20px; border-bottom: 1px solid #e8e3da;
    vertical-align: middle; transition: background 0.12s;
  }
  .vl-table tbody tr:last-child td { border-bottom: none; }
  .vl-table tbody tr:hover td { background: #fdf1eb; }

  .vl-code-text {
    font-family: 'DM Mono', monospace; font-size: 0.8rem;
    font-weight: 600; color: #4a3f8f;
    background: #eeecf8; border: 1px solid rgba(74,63,143,0.2);
    border-radius: 5px; padding: 3px 8px; display: inline-block;
  }
  .vl-discount-text {
    font-family: 'DM Mono', monospace; font-size: 0.82rem;
    font-weight: 600; color: #2d7a4f;
  }
  .vl-expiry-text {
    font-family: 'DM Mono', monospace; font-size: 0.78rem;
    color: #5c5347;
  }
  .vl-expiry-expired { color: #b03030; }

  .vl-status-active {
    display: inline-flex; align-items: center; gap: 5px;
    background: #edf7f2; color: #2d7a4f;
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .vl-status-expired {
    display: inline-flex; align-items: center; gap: 5px;
    background: #fdf2f2; color: #b03030;
    font-size: 0.73rem; font-weight: 600; padding: 3px 10px;
    border-radius: 20px; letter-spacing: 0.02em;
  }
  .vl-status-dot {
    width: 5px; height: 5px; border-radius: 50%; background: currentColor;
  }

  .vl-actions { display: flex; gap: 6px; align-items: center; }
  .vl-btn {
    display: flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; border-radius: 7px;
    border: 1px solid #e8e3da; background: #ffffff;
    cursor: pointer; transition: all 0.15s;
  }
  .vl-btn-copy { color: #9c9085; }
  .vl-btn-copy:hover { background: #faf9f7; border-color: #9c9085; color: #1a1612; }
  .vl-btn-edit { color: #4a3f8f; }
  .vl-btn-edit:hover { background: #eeecf8; border-color: #4a3f8f; }
  .vl-btn-delete { color: #b03030; }
  .vl-btn-delete:hover { background: #fdf2f2; border-color: #f5c2c2; }

  .vl-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 64px 20px; gap: 12px;
  }
  .vl-empty-icon {
    width: 56px; height: 56px; border-radius: 14px;
    background: #faf9f7; border: 1px solid #e8e3da;
    display: flex; align-items: center; justify-content: center; color: #9c9085;
  }
  .vl-empty-text { font-size: 0.9rem; color: #9c9085; margin: 0; }

  .vl-row-invalid td {
    opacity: 0.6;
    filter: grayscale(0.5);
    background: #f9f8f6 !important;
  }
  .vl-btn-disabled {
    cursor: not-allowed !important;
    opacity: 0.5;
    background: #f5f5f5 !important;
    border-color: #e0e0e0 !important;
    color: #9e9e9e !important;
  }
`;

export function VoucherList() {
  const [vouchers, setVouchers] = useState<VoucherResponse[]>([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherResponse | null>(
    null
  );
  const [assigningVoucher, setAssigningVoucher] =
    useState<VoucherResponse | null>(null);
  const [search, setSearch] = useState('');

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

  const filtered = vouchers.filter(
    (v) =>
      v.voucherCode.toLowerCase().includes(search.toLowerCase()) ||
      v.discountValue.toString().includes(search.toLowerCase())
  );

  const columns: Column<VoucherResponse>[] = [
    {
      header: 'Mã',
      accessor: 'voucherCode',
      render: (v) => <span className="vl-code-text">{v.voucherCode}</span>,
    },
    {
      header: 'Giảm giá',
      accessor: 'discountValue',
      render: (v) => (
        <span className="vl-discount-text">
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
        <span style={{ fontSize: '0.9rem', color: '#5c5347' }}>
          {v.discountType === 'PERCENT' ? 'Phần trăm' : 'Cố định'}
        </span>
      ),
    },
    {
      header: 'Sử dụng',
      accessor: 'usedCount',
      render: (v) => (
        <div style={{ minWidth: 120 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginBottom: 4,
              color: '#5c5347',
            }}
          >
            <span>{v.usedCount} đã dùng</span>
            <span>{v.usageLimit} giới hạn</span>
          </div>
          <div
            style={{
              height: 6,
              background: '#e8e3da',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: v.usedCount >= v.usageLimit ? '#b03030' : '#c9521a',
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
        <span className="vl-expiry-text">
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

        let statusText = 'Hoạt động';
        let statusClass = 'vl-status-active';

        if (isExpired) {
          statusText = 'Hết hạn';
          statusClass = 'vl-status-expired';
        } else if (isFull) {
          statusText = 'Hết lượt';
          statusClass = 'vl-status-expired';
        } else if (!v.isActive) {
          statusText = 'Tạm ngưng';
          statusClass = 'vl-status-expired';
        }

        return (
          <span className={statusClass}>
            <span className="vl-status-dot" />
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
        <div className="vl-actions">
          <button
            onClick={() => handleCopyCode(v.voucherCode)}
            className="vl-btn vl-btn-copy"
            title="Copy Code"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => {
              if (v.isValid) {
                setAssigningVoucher(v);
                setIsAssignModalOpen(true);
              }
            }}
            className={`vl-btn ${!v.isValid ? 'vl-btn-disabled' : ''}`}
            style={{ color: v.isValid ? '#c9521a' : '#9e9e9e' }}
            title={v.isValid ? 'Tặng cho khách hàng' : 'Voucher không khả dụng'}
            disabled={!v.isValid}
          >
            <UserPlus size={14} />
          </button>
          <button
            onClick={() => {
              setEditingVoucher(v);
              setIsFormModalOpen(true);
            }}
            className="vl-btn vl-btn-edit"
            title="Sửa"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => handleDeleteVoucher(v.voucherId)}
            className="vl-btn vl-btn-delete"
            title="Xóa"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="vl-root">
      <style>{css}</style>

      <div className="vl-header">
        <div className="vl-header-left">
          <div className="vl-icon-badge">
            <Tag />
          </div>
          <div>
            <h1 className="vl-title">
              Vouchers
              {vouchers.length > 0 && (
                <span className="vl-count-pill">{vouchers.length}</span>
              )}
            </h1>
            <div className="vl-divider" />
            <p className="vl-subtitle" style={{ marginTop: 6 }}>
              Manage discount codes and promotions
            </p>
          </div>
        </div>
        <button
          type="button"
          className="vl-add-btn"
          onClick={() => {
            setEditingVoucher(null);
            setIsFormModalOpen(true);
          }}
        >
          <Plus size={17} /> Create Voucher
        </button>
      </div>

      <div className="vl-table-card">
        <div className="vl-table-toolbar">
          <div className="vl-search-wrap">
            <Search />
            <input
              className="vl-search"
              placeholder="Search vouchers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="vl-table-meta">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          keyField="voucherId"
          pageSize={10}
          getRowClassName={(v) => (!v.isValid ? 'vl-row-invalid' : '')}
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
