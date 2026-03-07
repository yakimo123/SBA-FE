import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function BusinessVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Lấy email từ state khi điều hướng tới
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const canResend = timeLeft === 0;

  useEffect(() => {
    if (timeLeft === 0) return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập đầy đủ mã OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    // Mock verification
    setTimeout(() => {
      // Simulate success
      setIsVerifying(false);
      navigate('/approval-pending'); // Chuyển hướng sau khi xác thực thành công
    }, 1500);
  };

  const handleResend = () => {
    setOtp(['', '', '', '', '', '']);
    setTimeLeft(300);
    setError('');
    // Mock resend OTP
  };

  const otpComplete = otp.every((digit) => digit !== '');

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <Mail className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Xác thực Email
          </h1>
          <p className="text-gray-600">
            Chúng tôi đã gửi mã OTP đến email
            <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <CardTitle>Nhập mã OTP</CardTitle>
            <CardDescription>Mã xác thực gồm 6 chữ số</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-bold"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {canResend ? (
                  'Mã đã hết hạn'
                ) : (
                  <>
                    Mã có hiệu lực trong{' '}
                    <span className="font-semibold text-red-600">
                      {formatTime(timeLeft)}
                    </span>
                  </>
                )}
              </span>
            </div>

            {/* Verify Button */}
            <Button
              onClick={handleVerify}
              disabled={!otpComplete || isVerifying}
              className="w-full h-12 bg-red-600 hover:bg-red-700 mb-4"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="mr-2 w-4 h-4 animate-spin" />
                  Đang xác thực...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 w-4 h-4" />
                  Xác thực
                </>
              )}
            </Button>

            {/* Resend Button */}
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Không nhận được mã?{' '}
              </span>
              <Button
                variant="link"
                onClick={handleResend}
                disabled={!canResend}
                className="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Gửi lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Alert */}
        <Alert className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng kiểm tra cả hộp thư spam/junk nếu không tìm thấy email. Nếu
            vẫn không nhận được, vui lòng liên hệ hotline 1900-xxxx.
          </AlertDescription>
        </Alert>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Button
            variant="link"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900"
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
}
