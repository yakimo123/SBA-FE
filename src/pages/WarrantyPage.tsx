import { Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { customerWarrantyService, type CustomerWarrantyResponse } from '../services/customerWarrantyService';

export function WarrantyPage() {
  const navigate = useNavigate();
  const [warranties, setWarranties] = useState<CustomerWarrantyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  const fetchWarranties = useCallback(async () => {
    setLoading(true);
    try {
      const data = filter === 'active'
        ? await customerWarrantyService.getMyActiveWarranties()
        : await customerWarrantyService.getMyWarranties();
      setWarranties(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchWarranties();
  }, [fetchWarranties]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <button onClick={() => navigate('/account')} className="text-gray-600 hover:text-red-600">
            Tài khoản
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Bảo hành của tôi</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-600" />
            <h1 className="text-2xl font-bold">Bảo hành của tôi</h1>
          </div>
          <Badge className="bg-blue-100 text-blue-700">
            {warranties.filter(w => w.status === 'ACTIVE' && !w.isExpired).length} đang bảo hành
          </Badge>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => setFilter('all')}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            className={filter === 'active' ? 'bg-red-600 hover:bg-red-700' : ''}
            onClick={() => setFilter('active')}
          >
            Còn hạn
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
          </div>
        ) : warranties.length === 0 ? (
          <Card className="p-12 text-center">
            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {filter === 'active' ? 'Bạn không có sản phẩm nào đang trong thời hạn bảo hành' : 'Bạn chưa có thông tin bảo hành nào'}
            </p>
            <Button onClick={() => navigate('/products')} className="bg-red-600 hover:bg-red-700">
              Mua sắm ngay
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {warranties.map((warranty) => (
              <Card key={warranty.id} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={warranty.productImage}
                    alt={warranty.productName}
                    className="w-20 h-20 object-cover rounded-lg shrink-0 bg-gray-100"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-2 text-sm">{warranty.productName}</h3>
                      <Badge className={
                        warranty.status === 'ACTIVE' && !warranty.isExpired
                          ? 'bg-green-100 text-green-700 shrink-0 text-xs'
                          : warranty.status === 'EXPIRED' || warranty.isExpired
                          ? 'bg-red-100 text-red-700 shrink-0 text-xs'
                          : warranty.status === 'CLAIMED'
                          ? 'bg-yellow-100 text-yellow-700 shrink-0 text-xs'
                          : 'bg-gray-100 text-gray-700 shrink-0 text-xs'
                      }>
                        {warranty.status === 'ACTIVE' && !warranty.isExpired ? 'Còn bảo hành'
                          : warranty.status === 'EXPIRED' || warranty.isExpired ? 'Hết hạn'
                          : warranty.status === 'CLAIMED' ? 'Đang xử lý'
                          : 'Vô hiệu'}
                      </Badge>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div>
                        Đơn hàng:{' '}
                        <span className="font-medium text-gray-900">
                          {warranty.orderType === 'NORMAL'
                            ? `Đơn lẻ #${warranty.orderId}`
                            : `Đơn B2B #${warranty.bulkOrderId}`}
                        </span>
                      </div>
                      <div>
                        Hiệu lực:{' '}
                        <span className="font-medium text-gray-900">
                          {new Date(warranty.startDate).toLocaleDateString('vi-VN')} – {new Date(warranty.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div>
                        Thời hạn: <span className="font-medium text-gray-900">{warranty.warrantyMonths} tháng</span>
                        {warranty.quantity > 1 && (
                          <> · Số lượng: <span className="font-medium text-gray-900">{warranty.quantity}</span></>
                        )}
                      </div>
                    </div>

                    {warranty.status === 'ACTIVE' && !warranty.isExpired ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-green-500 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(0, (warranty.daysRemaining / (warranty.warrantyMonths * 30)) * 100))}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-green-600 shrink-0">
                          Còn {warranty.daysRemaining} ngày
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-red-500">Đã hết hạn bảo hành</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/product/${warranty.productId}`)}
                  >
                    Xem sản phẩm
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
