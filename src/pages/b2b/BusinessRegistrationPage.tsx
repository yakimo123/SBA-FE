import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle,
  FileText,
  MapPin,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Progress } from '../../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { companyService } from '../../services/companyService';
import { CreateCompanyRequest } from '../../types';

export function BusinessRegistrationPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    taxCode: '',
    industry: '',
    employeeCount: 0,
    representativeName: '',
    representativePosition: '',
    email: '',
    phone: '',
    address: '',
    billingAddress: '',
    foundingDate: '',
    businessType: '',
    logoUrl: '',
    // Documents (Local state only, or can be uploaded separately)
    businessCertificate: null as File | null,
    representativeId: null as File | null,
    authorizationLetter: null as File | null,
  });

  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    businessCertificate: false,
    representativeId: false,
    authorizationLetter: false,
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/register-business' } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = (
    field: string,
    value: string | number | File | boolean | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: 'businessCertificate' | 'representativeId' | 'authorizationLetter',
    file: File | null
  ) => {
    updateField(field, file);
    if (file) {
      setUploadedFiles((prev) => ({ ...prev, [field]: true }));
    } else {
      setUploadedFiles((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSameAddressChange = (checked: boolean) => {
    setSameAsBusinessAddress(checked);
    if (checked) {
      updateField('billingAddress', formData.address);
    }
  };

  const canProceedStep1 =
    formData.companyName &&
    formData.taxCode &&
    formData.industry &&
    formData.employeeCount > 0 &&
    formData.businessType;

  const canProceedStep2 =
    formData.representativeName &&
    formData.representativePosition &&
    formData.email &&
    formData.phone;

  const canProceedStep3 =
    formData.address &&
    formData.billingAddress &&
    uploadedFiles.businessCertificate &&
    uploadedFiles.representativeId;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    if (!user?.userId) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const requestData: CreateCompanyRequest = {
        companyName: formData.companyName,
        taxCode: formData.taxCode,
        email: formData.email,
        phone: formData.phone,
        representativeName: formData.representativeName,
        representativePosition: formData.representativePosition,
        userId: user.userId,
        address: formData.address || undefined,
        foundingDate: formData.foundingDate || undefined,
        businessType: formData.businessType || undefined,
        employeeCount: formData.employeeCount || undefined,
        industry: formData.industry || undefined,
        logoUrl: formData.logoUrl || undefined,
      };

      await companyService.register(requestData);

      // Navigate to approval pending page
      navigate('/approval-pending');
    } catch (err: unknown) {
      console.error('Registration failed:', err);
      const errorMessage =
        (err as any).response?.data?.message ||
        'Đã có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại.';
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Đăng ký tài khoản Doanh nghiệp
          </h1>
          <p className="text-lg text-gray-600">
            Trở thành đối tác B2B và nhận ưu đãi đặc biệt cho doanh nghiệp
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div
              className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                {currentStep > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <span className="font-semibold text-sm hidden sm:inline">
                Thông tin công ty
              </span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${currentStep >= 2 ? 'bg-red-600' : 'bg-gray-200'}`}
            />
            <div
              className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                {currentStep > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <span className="font-semibold text-sm hidden sm:inline">
                Người đại diện
              </span>
            </div>
            <div
              className={`flex-1 h-1 mx-4 ${currentStep >= 3 ? 'bg-red-600' : 'bg-gray-200'}`}
            />
            <div
              className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
              >
                3
              </div>
              <span className="font-semibold text-sm hidden sm:inline">
                Địa chỉ & Giấy tờ
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center font-medium">
            {submitError}
          </div>
        )}

        {/* Step 1: Company Information */}
        {currentStep === 1 && (
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Thông tin Công ty</CardTitle>
                  <CardDescription>
                    Vui lòng cung cấp thông tin chi tiết về doanh nghiệp của bạn
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-base font-semibold"
                  >
                    Tên công ty <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    placeholder="VD: Công ty TNHH SBA"
                    value={formData.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxCode" className="text-base font-semibold">
                    Mã số thuế <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="taxCode"
                    placeholder="VD: 0123456789"
                    value={formData.taxCode}
                    onChange={(e) => updateField('taxCode', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="businessType"
                    className="text-base font-semibold"
                  >
                    Loại hình doanh nghiệp{' '}
                    <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) =>
                      updateField('businessType', value)
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn loại hình" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TNHH">TNHH</SelectItem>
                      <SelectItem value="Cổ phần">Cổ phần</SelectItem>
                      <SelectItem value="Tư nhân">
                        Doanh nghiệp tư nhân
                      </SelectItem>
                      <SelectItem value="Liên doanh">Liên doanh</SelectItem>
                      <SelectItem value="100% Vốn nước ngoài">
                        100% Vốn nước ngoài
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="foundingDate"
                    className="text-base font-semibold"
                  >
                    Ngày thành lập
                  </Label>
                  <Input
                    id="foundingDate"
                    type="date"
                    value={formData.foundingDate}
                    onChange={(e) =>
                      updateField('foundingDate', e.target.value)
                    }
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-base font-semibold">
                    Lĩnh vực kinh doanh <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => updateField('industry', value)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Retail">Bán lẻ</SelectItem>
                      <SelectItem value="Wholesale">Bán sỉ</SelectItem>
                      <SelectItem value="Technology">
                        Công nghệ thông tin
                      </SelectItem>
                      <SelectItem value="Manufacturing">Sản xuất</SelectItem>
                      <SelectItem value="Logistics">Vận tải</SelectItem>
                      <SelectItem value="F&B">Thực phẩm & Đồ uống</SelectItem>
                      <SelectItem value="Other">Khác</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="employeeCount"
                    className="text-base font-semibold"
                  >
                    Quy mô nhân sự <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.employeeCount.toString()}
                    onValueChange={(value) =>
                      updateField('employeeCount', parseInt(value))
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn số lượng nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">Dưới 10 nhân sự</SelectItem>
                      <SelectItem value="50">10 - 50 nhân sự</SelectItem>
                      <SelectItem value="200">51 - 200 nhân sự</SelectItem>
                      <SelectItem value="500">201 - 500 nhân sự</SelectItem>
                      <SelectItem value="1000">Trên 500 nhân sự</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="px-6"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep1}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  Tiếp theo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Representative Information */}
        {currentStep === 2 && (
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Người đại diện</CardTitle>
                  <CardDescription>
                    Thông tin người đại diện pháp luật hoặc người được ủy quyền
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="representativeName"
                    className="text-base font-semibold"
                  >
                    Họ và tên <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="representativeName"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.representativeName}
                    onChange={(e) =>
                      updateField('representativeName', e.target.value)
                    }
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="representativePosition"
                    className="text-base font-semibold"
                  >
                    Chức vụ <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="representativePosition"
                    placeholder="VD: Giám đốc"
                    value={formData.representativePosition}
                    onChange={(e) =>
                      updateField('representativePosition', e.target.value)
                    }
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold">
                    Email công việc <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="VD: a.nguyen@company.com"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold">
                    Số điện thoại <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="VD: 0912345678"
                    value={formData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="px-6">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceedStep2}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  Tiếp theo
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Address & Documents */}
        {currentStep === 3 && (
          <Card className="shadow-lg">
            <CardHeader className="border-b bg-linear-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Địa chỉ & Giấy tờ</CardTitle>
                  <CardDescription>
                    Địa chỉ trụ sở và các tài liệu pháp lý
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address" className="text-base font-semibold">
                  Địa chỉ trụ sở chính <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="address"
                  placeholder="Nhập địa chỉ đầy đủ theo GPKD"
                  value={formData.address}
                  onChange={(e) => {
                    updateField('address', e.target.value);
                    if (sameAsBusinessAddress) {
                      updateField('billingAddress', e.target.value);
                    }
                  }}
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sameAddress"
                  checked={sameAsBusinessAddress}
                  onChange={(e) => handleSameAddressChange(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                />
                <Label htmlFor="sameAddress" className="cursor-pointer">
                  Địa chỉ xuất hóa đơn giống địa chỉ trụ sở
                </Label>
              </div>

              {!sameAsBusinessAddress && (
                <div className="space-y-2">
                  <Label
                    htmlFor="billingAddress"
                    className="text-base font-semibold"
                  >
                    Địa chỉ xuất hóa đơn <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="billingAddress"
                    placeholder="Nhập địa chỉ xuất hóa đơn"
                    value={formData.billingAddress}
                    onChange={(e) =>
                      updateField('billingAddress', e.target.value)
                    }
                    className="min-h-[80px]"
                  />
                </div>
              )}

              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tài liệu xác minh
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <Label className="font-semibold">
                        GP Kinh doanh <span className="text-red-600">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        PDF/Ảnh (Tối đa 5MB)
                      </p>
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full h-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium">
                        {uploadedFiles.businessCertificate
                          ? 'Đã tải lên'
                          : 'Tải lên'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            'businessCertificate',
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </label>
                  </div>

                  <div className="border rounded-lg p-4 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <Label className="font-semibold">
                        CMND/CCCD đại diện{' '}
                        <span className="text-red-600">*</span>
                      </Label>
                      <p className="text-xs text-gray-500 mb-3">
                        Mặt trước & Mặt sau
                      </p>
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full h-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-medium">
                        {uploadedFiles.representativeId
                          ? 'Đã tải lên'
                          : 'Tải lên'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            'representativeId',
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="px-6">
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3 || isSubmitting}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đăng ký'}
                  {!isSubmitting && <FileText className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 pb-12">
          <p>
            Bằng việc gửi đăng ký, bạn xác nhận các thông tin trên là chính xác
            và đồng ý với{' '}
            <button className="text-red-600 hover:underline">
              Điều khoản dịch vụ B2B
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
