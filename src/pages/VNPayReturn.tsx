import { Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  PaymentTransactionResponse,
  vnpayService,
} from '../services/vnpayService';

export function VNPayReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>(
    'loading'
  );
  const [transaction, setTransaction] =
    useState<PaymentTransactionResponse | null>(null);

  useEffect(() => {
    const handleReturn = async () => {
      const params: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        params[key] = value;
      });

      // Detect bulk order from vnp_OrderInfo
      const orderInfo = params['vnp_OrderInfo'] || '';
      const isBulkOrder = orderInfo.toUpperCase().includes('BULK');

      try {
        const result = await vnpayService.processReturn(params);
        setTransaction(result);

        if (isBulkOrder) {
          // Redirect to bulk payment result page
          const bulkParams = new URLSearchParams({
            status: result.status === 'SUCCESS' ? 'success' : 'failed',
            orderId: String(result.orderId),
            amount: String(result.amount),
            ...(result.responseCode && result.status !== 'SUCCESS'
              ? { responseCode: result.responseCode }
              : {}),
          });
          navigate(`/company/orders/payment-result?${bulkParams.toString()}`, {
            replace: true,
          });
          return;
        }

        if (result.status === 'SUCCESS') {
          navigate('/checkout', {
            replace: true,
            state: {
              vnpaySuccess: true,
              orderId: result.orderId,
              totalAmount: result.amount,
            },
          });
        } else {
          setStatus('failed');
        }
      } catch {
        // Fallback: read responseCode directly from URL to show UI even if API fails
        const responseCode = params['vnp_ResponseCode'];

        if (isBulkOrder) {
          const bulkParams = new URLSearchParams({
            status: responseCode === '00' ? 'success' : 'failed',
            ...(responseCode && responseCode !== '00'
              ? { responseCode }
              : {}),
          });
          navigate(`/company/orders/payment-result?${bulkParams.toString()}`, {
            replace: true,
          });
          return;
        }

        if (responseCode === '00') {
          navigate('/checkout', {
            replace: true,
            state: { vnpaySuccess: true },
          });
        } else {
          setStatus('failed');
        }
      }
    };

    handleReturn();
  }, [searchParams, navigate]);

  if (status === 'loading') {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Đang xử lý kết quả thanh toán...
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Vui lòng không đóng trình duyệt
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="bg-[#005BAA] text-white text-lg font-bold px-4 py-2 rounded-lg tracking-widest">
            VNPay
          </div>
        </div>

        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Thanh toán thất bại</h2>
        <p className="text-gray-600 mb-6">
          Giao dịch không thành công. Đơn hàng của bạn vẫn được lưu, bạn có
          thể thử thanh toán lại hoặc chọn phương thức khác.
        </p>

        {transaction && transaction.responseCode && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg mb-6 text-sm text-left">
            <span className="text-gray-500">Mã lỗi: </span>
            <span className="font-medium text-red-700">
              {transaction.responseCode}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('/cart')}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Quay lại giỏ hàng
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Về trang chủ
          </Button>
        </div>
      </Card>
    </div>
  );
}
