import {
  ArrowLeft,
  CheckCircle2,
  Package,
  RefreshCw,
  ShoppingBag,
  XCircle,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const fmt = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    n
  );

export function BulkPaymentResult() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const status = searchParams.get('status') || 'failed';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const responseCode = searchParams.get('responseCode');

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div
            className={`py-8 px-6 text-center ${
              isSuccess
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                : 'bg-gradient-to-br from-red-500 to-red-600'
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${
                isSuccess ? 'bg-white/20' : 'bg-white/20'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-12 w-12 text-white" />
              ) : (
                <XCircle className="h-12 w-12 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {isSuccess
                ? 'Thanh toán thành công!'
                : 'Thanh toán thất bại'}
            </h1>
            <p className="text-white/80 text-sm">
              {isSuccess
                ? 'Đơn hàng sỉ của bạn đã được thanh toán thành công'
                : 'Giao dịch không thành công. Vui lòng thử lại'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {/* Order Info */}
            {orderId && (
              <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShoppingBag className="h-5 w-5 text-[#ee4d2d]" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      Mã đơn hàng
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      #{orderId}
                    </p>
                  </div>
                </div>
                {amount && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-medium">
                      Số tiền
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {fmt(Number(amount))}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <Package className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Đơn hàng đang được xử lý
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Chúng tôi sẽ sớm chuẩn bị và giao hàng cho bạn. Bạn có thể
                    theo dõi trạng thái đơn hàng trong trang chi tiết.
                  </p>
                </div>
              </div>
            )}

            {/* Error Info */}
            {!isSuccess && responseCode && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Giao dịch không thành công
                  </p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Mã lỗi: {responseCode}. Đơn hàng vẫn được lưu, bạn có thể
                    thử thanh toán lại.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isSuccess && orderId ? (
                <>
                  <button
                    onClick={() => navigate(`/company/orders/${orderId}`)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#d73211] px-4 py-3 text-sm font-bold text-white shadow-sm hover:shadow-md hover:from-[#d73211] hover:to-[#b03030] transition-all"
                  >
                    <Package className="h-4 w-4" />
                    Xem chi tiết đơn hàng
                  </button>
                  <button
                    onClick={() => navigate('/company/orders')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Về danh sách đơn hàng
                  </button>
                </>
              ) : (
                <>
                  {orderId && (
                    <button
                      onClick={() => navigate(`/company/orders/${orderId}`)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ee4d2d] to-[#d73211] px-4 py-3 text-sm font-bold text-white shadow-sm hover:shadow-md hover:from-[#d73211] hover:to-[#b03030] transition-all"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Thử thanh toán lại
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/company/orders')}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Về danh sách đơn hàng
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
            <p className="text-xs text-center text-slate-500">
              Thanh toán qua{' '}
              <span className="font-bold text-[#005BAA]">VNPay</span> •
              Đơn hàng sỉ B2B
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
