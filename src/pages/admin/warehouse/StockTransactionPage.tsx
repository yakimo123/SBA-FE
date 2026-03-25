import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { BranchResponse, branchService } from '../../../services/branchService';
import {
  StockTransaction,
  StockTransactionParams,
  warehouseService,
} from '../../../services/warehouseService';
import { PageResponse } from '../../../types/auth';

const TRANSACTION_TYPES = ['IMPORT', 'EXPORT', 'RESERVED', 'RELEASED'] as const;

export function StockTransactionPage() {
  const [data, setData] = useState<PageResponse<StockTransaction>>({
    content: [],
    number: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  });

  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<BranchResponse[]>([]);

  // Filters
  const [branchId, setBranchId] = useState<number | ''>('');
  const [type, setType] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [bulkOrderId, setBulkOrderId] = useState<string>('');

  const [page, setPage] = useState(0);
  const size = 20;

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, branchId, type, orderId, bulkOrderId]);

  const loadBranches = async () => {
    try {
      const b = await branchService.getAllBranches();
      setBranches(b);
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: StockTransactionParams = {
        page,
        size,
        sort: 'createdDate,desc',
      };
      if (branchId) params.branchId = Number(branchId);
      if (type)
        params.type = type as 'IMPORT' | 'EXPORT' | 'RESERVED' | 'RELEASED';
      if (orderId) params.orderId = Number(orderId);
      if (bulkOrderId) params.bulkOrderId = Number(bulkOrderId);

      const res = await warehouseService.getStockTransactions(params);
      setData(res);
    } catch (err) {
      console.error('Failed to load stock transactions', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTypeColor = (txType: string) => {
    switch (txType) {
      case 'IMPORT':
        return { bg: '#e8f4fd', text: '#1a6fa8' };
      case 'EXPORT':
        return { bg: '#fdf2f2', text: '#b03030' };
      case 'RESERVED':
        return { bg: '#fef6eb', text: '#905a10' };
      case 'RELEASED':
        return { bg: '#edf7f2', text: '#2d7a4f' };
      default:
        return { bg: '#f3f4f6', text: '#4b5563' };
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        background: '#fff',
        borderRadius: '8px',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <h1 style={{ fontSize: '24px', marginBottom: '24px', fontWeight: 600 }}>
        Chi Tiết Giao Dịch Kho (Stock Ledger)
      </h1>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#4b5563',
            }}
          >
            Chi nhánh
          </label>
          <select
            value={branchId}
            onChange={(e) => {
              setBranchId(e.target.value ? Number(e.target.value) : '');
              setPage(0);
            }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
            }}
          >
            <option value="">Tất cả / Chưa chọn</option>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#4b5563',
            }}
          >
            Loại giao dịch
          </label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(0);
            }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
            }}
          >
            <option value="">Tất cả</option>
            {TRANSACTION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#4b5563',
            }}
          >
            Mã Đơn Tách Lẻ (Order ID)
          </label>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: 'absolute', left: '10px', top: '12px' }}
            />
            <input
              type="text"
              placeholder="Tìm theo Order ID"
              value={orderId}
              onChange={(e) => {
                setOrderId(e.target.value);
                setPage(0);
              }}
              style={{
                width: '100%',
                padding: '10px 10px 10px 34px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#4b5563',
            }}
          >
            Mã Đơn Sỉ (Bulk Order ID)
          </label>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: 'absolute', left: '10px', top: '12px' }}
            />
            <input
              type="text"
              placeholder="Tìm theo Bulk Order ID"
              value={bulkOrderId}
              onChange={(e) => {
                setBulkOrderId(e.target.value);
                setPage(0);
              }}
              style={{
                width: '100%',
                padding: '10px 10px 10px 34px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Đang tải dữ liệu...
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                ></th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Mã GD
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Loại
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Chi nhánh
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Mã tham chiếu
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Ngày tạo
                </th>
                <th
                  style={{
                    padding: '12px 16px',
                    fontWeight: 500,
                    color: '#6b7280',
                    fontSize: '14px',
                  }}
                >
                  Ghi chú
                </th>
              </tr>
            </thead>
            <tbody>
              {data.content.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: 'center',
                      padding: '24px',
                      color: '#6b7280',
                    }}
                  >
                    Không tìm thấy dữ liệu
                  </td>
                </tr>
              ) : (
                data.content.map((tx) => {
                  const isExpanded = expandedRows.has(tx.id);
                  const colors = getTypeColor(tx.type);

                  return (
                    <React.Fragment key={tx.id}>
                      <tr
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          cursor: 'pointer',
                          backgroundColor: isExpanded ? '#f9fafb' : '#fff',
                        }}
                        onClick={() => toggleRow(tx.id)}
                      >
                        <td style={{ padding: '12px 16px', width: '40px' }}>
                          {isExpanded ? (
                            <ChevronDown size={18} color="#6b7280" />
                          ) : (
                            <ChevronRight size={18} color="#6b7280" />
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                          #{tx.id}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span
                            style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor: colors.bg,
                              color: colors.text,
                            }}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {tx.branchName || `Chi nhánh ${tx.branchId}`}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {tx.orderId && (
                            <div style={{ fontSize: '14px' }}>
                              Order: #{tx.orderId}
                            </div>
                          )}
                          {tx.bulkOrderId && (
                            <div style={{ fontSize: '14px' }}>
                              Bulk Order: #{tx.bulkOrderId}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {new Date(tx.createdDate).toLocaleString('vi-VN')}
                        </td>
                        <td
                          style={{
                            padding: '12px 16px',
                            color: '#6b7280',
                            fontSize: '14px',
                          }}
                        >
                          {tx.note}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr
                          style={{
                            backgroundColor: '#f9fafb',
                            borderBottom: '1px solid #e5e7eb',
                          }}
                        >
                          <td></td>
                          <td colSpan={6} style={{ padding: '16px' }}>
                            <h4
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                marginBottom: '12px',
                              }}
                            >
                              Chi tiết hàng hóa
                            </h4>
                            <table
                              style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                              }}
                            >
                              <thead>
                                <tr
                                  style={{
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: '#f3f4f6',
                                  }}
                                >
                                  <th
                                    style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      fontSize: '13px',
                                      color: '#4b5563',
                                      fontWeight: 600,
                                    }}
                                  >
                                    ID
                                  </th>
                                  <th
                                    style={{
                                      padding: '8px 12px',
                                      textAlign: 'left',
                                      fontSize: '13px',
                                      color: '#4b5563',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Tên sản phẩm
                                  </th>
                                  <th
                                    style={{
                                      padding: '8px 12px',
                                      textAlign: 'right',
                                      fontSize: '13px',
                                      color: '#4b5563',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Số lượng
                                  </th>
                                  <th
                                    style={{
                                      padding: '8px 12px',
                                      textAlign: 'right',
                                      fontSize: '13px',
                                      color: '#4b5563',
                                      fontWeight: 600,
                                    }}
                                  >
                                    Đơn giá
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {tx.items.map((item) => (
                                  <tr
                                    key={item.id}
                                    style={{
                                      borderBottom: '1px solid #e5e7eb',
                                    }}
                                  >
                                    <td
                                      style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                      }}
                                    >
                                      #{item.productId}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                      }}
                                    >
                                      {item.productName}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {item.quantity}
                                    </td>
                                    <td
                                      style={{
                                        padding: '8px 12px',
                                        fontSize: '13px',
                                        textAlign: 'right',
                                      }}
                                    >
                                      {item.price
                                        ? item.price.toLocaleString('vi-VN') +
                                          ' đ'
                                        : '-'}
                                    </td>
                                  </tr>
                                ))}
                                {(!tx.items || tx.items.length === 0) && (
                                  <tr>
                                    <td
                                      colSpan={4}
                                      style={{
                                        padding: '16px',
                                        textAlign: 'center',
                                        color: '#6b7280',
                                      }}
                                    >
                                      Không có chi tiết hàng hoá
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && data.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '24px',
            gap: '8px',
          }}
        >
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#fff',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            Trang trước
          </button>
          <span style={{ padding: '8px 16px' }}>
            Trang {page + 1} / {data.totalPages}
          </span>
          <button
            disabled={page >= data.totalPages - 1}
            onClick={() => setPage(page + 1)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              backgroundColor: '#fff',
              cursor: page >= data.totalPages - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Trang tiếp
          </button>
        </div>
      )}
    </div>
  );
}
