import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  Phone,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { getUserData, setUserData } from '../../services/api';
import { companyService } from '../../services/companyService';

export function BusinessApprovalPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // If they have companyId, they shouldn't be here really

    const { refreshUser } = useAuth();
  const [status, setStatus] = useState<string>('pending');
  const [companyName, setCompanyName] = useState<string>('Tên công ty');
  const [submittedAt, setSubmittedAt] = useState<string>(
    new Date().toLocaleDateString('vi-VN')
  );
  const [isLoading, setIsLoading] = useState(true);

  const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);

  useEffect(() => {
    // If they already have a companyId, they shouldn't be here. Send them to /company
    if (user?.role === 'COMPANY' && user?.companyId) {
      navigate('/company');
      return;
    }

    const checkRegistration = async () => {
      try {
        const reg = await companyService.getMyRegistration();
        if (reg) {
          if (reg.status === 'APPROVED' && reg.companyId) {
            // Update local user data and context
            const savedUser = getUserData();
            if (savedUser) {
              setUserData({
                ...savedUser,
                companyId: reg.companyId
              });
              refreshUser();
            }
            navigate('/company');
            return;
          }

          setStatus(reg.status?.toLowerCase() || 'pending');
          setCompanyName(reg.companyName);
          setSubmittedAt(
            reg.createdAt
              ? new Date(reg.createdAt).toLocaleDateString('vi-VN')
              : new Date().toLocaleDateString('vi-VN')
          );
        }
      } catch (err) {
        console.error('Failed to get registration status:', err);
        // Fallback to location state if API fails or hasn't created it yet
        const locState = location.state || {};
        setStatus(locState.status || 'pending');
        setCompanyName(locState.companyName || 'Tên công ty');
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [location.state, navigate, user, refreshUser]);

  const handleDocumentUpload = (file: File | null) => {
    if (file) {
      setAdditionalDocuments((prev) => [...prev, file]);
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'pending':
        return {
          icon: <Clock className="w-16 h-16 text-blue-600" />,
          title: 'Đang chờ xét duyệt',
          description:
            'Hồ sơ của bạn đang được kiểm tra bởi đội ngũ của chúng tôi',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          badgeColor: 'bg-blue-600',
        };
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-16 h-16 text-green-600" />,
          title: 'Hồ sơ đã được duyệt',
          description:
            'Chúc mừng! Tài khoản doanh nghiệp của bạn đã được phê duyệt',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100',
          badgeColor: 'bg-green-600',
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-16 h-16 text-red-600" />,
          title: 'Hồ sơ bị từ chối',
          description:
            'Rất tiếc, yêu cầu đăng ký của bạn không được chấp nhận vào lúc này',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100',
          badgeColor: 'bg-red-600',
        };
      case 'need_documents':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-orange-600" />,
          title: 'Cần bổ sung tài liệu',
          description:
            'Vui lòng cung cấp thêm tài liệu để hoàn tất quá trình xét duyệt',
          bgColor: 'bg-orange-50',
          iconBg: 'bg-orange-100',
          badgeColor: 'bg-orange-600',
        };
      default:
        return {
          icon: <Clock className="w-16 h-16 text-blue-600" />,
          title: 'Đang chờ xét duyệt',
          description:
            'Hồ sơ của bạn đang được kiểm tra bởi đội ngũ của chúng tôi',
          bgColor: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          badgeColor: 'bg-blue-600',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Status Card */}
            <Card className="shadow-lg mb-6">
              <CardHeader
                className={`text-center border-b ${statusInfo.bgColor}`}
              >
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${statusInfo.iconBg} mb-4`}
                >
                  {statusInfo.icon}
                </div>
                <CardTitle className="text-3xl mb-2">
                  {statusInfo.title}
                </CardTitle>
                <p className="text-gray-600">{statusInfo.description}</p>
                <Badge className={`${statusInfo.badgeColor} mt-4`}>
                  {status === 'pending' && 'ĐANG XỬ LÝ'}
                  {status === 'approved' && 'ĐÃ PHÊ DUYỆT'}
                  {status === 'rejected' && 'BỊ TỪ CHỐI'}
                  {status === 'need_documents' && 'CẦN BỔ SUNG'}
                </Badge>
              </CardHeader>
              <CardContent className="p-6">
                {/* Company Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Tên công ty</p>
                      <p className="font-semibold text-gray-900">
                        {companyName}
                      </p>
                    </div>
                  </div>
                  <div className="border-t mt-3 pt-3">
                    <p className="text-sm text-gray-600">Ngày nộp hồ sơ</p>
                    <p className="font-semibold text-gray-900">{submittedAt}</p>
                  </div>
                </div>

                {/* Status-specific content */}
                {status === 'pending' && (
                  <div className="space-y-4">
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Thời gian xử lý dự kiến</AlertTitle>
                      <AlertDescription>
                        Thông thường mất 2-3 ngày làm việc để xét duyệt hồ sơ.
                        Chúng tôi sẽ gửi email thông báo kết quả đến bạn ngay
                        khi hoàn tất.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="w-full h-12"
                    >
                      Về trang chủ mua sắm
                    </Button>
                  </div>
                )}

                {status === 'approved' && (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-900">
                        Sẵn sàng sử dụng
                      </AlertTitle>
                      <AlertDescription className="text-green-800">
                        Chào mừng bạn! Tài khoản doanh nghiệp của bạn đã được
                        kích hoạt thành công. Bạn có thể bắt đầu sử dụng các
                        tính năng dành riêng cho B2B ngay bây giờ.
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={() => navigate('/company')}
                      className="w-full h-12 bg-green-600 hover:bg-green-700"
                    >
                      Truy cập trang B2B ngay
                    </Button>
                  </div>
                )}

                {status === 'rejected' && (
                  <div className="space-y-4">
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertTitle>Lý do từ chối</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>
                            Mã số thuế không hợp lệ hoặc không tồn tại trong hệ
                            thống
                          </li>
                          <li>
                            Giấy chứng nhận đăng ký kinh doanh không rõ ràng
                          </li>
                          <li>
                            Thông tin người đại diện không khớp với giấy tờ
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="flex-1"
                      >
                        Về trang chủ
                      </Button>
                      <Button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        Đăng ký lại
                      </Button>
                    </div>
                  </div>
                )}

                {status === 'need_documents' && (
                  <div className="space-y-4">
                    <Alert className="border-orange-200 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertTitle className="text-orange-900">
                        Tài liệu cần bổ sung
                      </AlertTitle>
                      <AlertDescription className="text-orange-800">
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Bản sao Giấy phép kinh doanh có công chứng</li>
                          <li>
                            Chứng minh tài chính (Sao kê ngân hàng 3 tháng gần
                            nhất)
                          </li>
                          <li>
                            Hợp đồng thuê văn phòng hoặc giấy chứng nhận địa chỉ
                          </li>
                        </ul>
                      </AlertDescription>
                    </Alert>

                    <Card className="border-2 border-dashed">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">
                          Tải lên tài liệu bổ sung
                        </h3>
                        <label className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <FileText className="w-8 h-8 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            Chọn file để tải lên
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG hoặc PNG (tối đa 5MB)
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) =>
                              handleDocumentUpload(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                        {additionalDocuments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {additionalDocuments.map((doc, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 p-2 bg-green-50 rounded"
                              >
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{doc.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
                          disabled={additionalDocuments.length === 0}
                        >
                          Gửi tài liệu bổ sung
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Contact */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Cần hỗ trợ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email hỗ trợ</p>
                    <p className="font-semibold">b2b@phukiendientu.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Hotline B2B</p>
                    <p className="font-semibold">1900-xxxx (máy lẻ 2)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {status === 'pending' && (
              <Card className="shadow-lg mt-6">
                <CardHeader>
                  <CardTitle>Quy trình xét duyệt</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-0.5 h-12 bg-green-600"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-900">Nộp hồ sơ</p>
                        <p className="text-sm text-gray-600">{submittedAt}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center animate-pulse">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-0.5 h-12 bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-900">
                          Kiểm tra hồ sơ
                        </p>
                        <p className="text-sm text-blue-600">Đang xử lý...</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        </div>
                        <div className="w-0.5 h-12 bg-gray-300"></div>
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-gray-500">Phê duyệt</p>
                        <p className="text-sm text-gray-400">Chờ xử lý</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-500">
                          Kích hoạt tài khoản
                        </p>
                        <p className="text-sm text-gray-400">Chờ xử lý</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
