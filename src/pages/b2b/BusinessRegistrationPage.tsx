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
import { useState } from 'react';
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

export interface BusinessRegistrationData {
  // Company Information
  companyName: string;
  taxId: string;
  industry: string;
  companySize: string;

  // Representative Information
  representativeName: string;
  position: string;
  email: string;
  phone: string;

  // Company Address
  businessAddress: string;
  billingAddress: string;

  // Documents
  businessCertificate: File | null;
  representativeId: File | null;
  authorizationLetter: File | null;
}

export function BusinessRegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<BusinessRegistrationData>({
    companyName: '',
    taxId: '',
    industry: '',
    companySize: '',
    representativeName: '',
    position: '',
    email: '',
    phone: '',
    businessAddress: '',
    billingAddress: '',
    businessCertificate: null,
    representativeId: null,
    authorizationLetter: null,
  });

  const [sameAsBusinessAddress, setSameAsBusinessAddress] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({
    businessCertificate: false,
    representativeId: false,
    authorizationLetter: false,
  });

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = <K extends keyof BusinessRegistrationData>(
    field: K,
    value: BusinessRegistrationData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (
    field: keyof BusinessRegistrationData,
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
      updateField('billingAddress', formData.businessAddress);
    }
  };

  const canProceedStep1 =
    formData.companyName &&
    formData.taxId &&
    formData.industry &&
    formData.companySize;
  const canProceedStep2 =
    formData.representativeName &&
    formData.position &&
    formData.email &&
    formData.phone;
  const canProceedStep3 =
    formData.businessAddress &&
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

  const handleSubmit = () => {
    // Chuyển hướng sang trang xác thực và truyền email qua state
    navigate('/verify-business', { state: { email: formData.email } });
  };

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
              <div className="space-y-2">
                <Label
                  htmlFor="companyName"
                  className="text-base font-semibold"
                >
                  Tên công ty <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="companyName"
                  placeholder="VD: Công ty TNHH Công nghệ ABC"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-base font-semibold">
                  Mã số thuế <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="taxId"
                  placeholder="VD: 0123456789"
                  value={formData.taxId}
                  onChange={(e) => updateField('taxId', e.target.value)}
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  Nhập mã số thuế 10-13 ký tự
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-base font-semibold">
                  Lĩnh vực kinh doanh <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => updateField('industry', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Chọn lĩnh vực kinh doanh" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">Bán lẻ</SelectItem>
                    <SelectItem value="wholesale">Bán sỉ</SelectItem>
                    <SelectItem value="technology">
                      Công nghệ thông tin
                    </SelectItem>
                    <SelectItem value="electronics">
                      Điện tử - Điện máy
                    </SelectItem>
                    <SelectItem value="ecommerce">
                      Thương mại điện tử
                    </SelectItem>
                    <SelectItem value="education">Giáo dục</SelectItem>
                    <SelectItem value="healthcare">Y tế</SelectItem>
                    <SelectItem value="services">Dịch vụ</SelectItem>
                    <SelectItem value="manufacturing">Sản xuất</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="companySize"
                  className="text-base font-semibold"
                >
                  Quy mô công ty <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={formData.companySize}
                  onValueChange={(value) => updateField('companySize', value)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Chọn quy mô công ty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 nhân viên</SelectItem>
                    <SelectItem value="11-50">11-50 nhân viên</SelectItem>
                    <SelectItem value="51-200">51-200 nhân viên</SelectItem>
                    <SelectItem value="201-500">201-500 nhân viên</SelectItem>
                    <SelectItem value="500+">Trên 500 nhân viên</SelectItem>
                  </SelectContent>
                </Select>
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
                  <CardTitle className="text-2xl">
                    Thông tin Người đại diện
                  </CardTitle>
                  <CardDescription>
                    Thông tin người đại diện được ủy quyền của công ty
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
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
                <Label htmlFor="position" className="text-base font-semibold">
                  Chức vụ <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="position"
                  placeholder="VD: Giám đốc, Trưởng phòng Kinh doanh"
                  value={formData.position}
                  onChange={(e) => updateField('position', e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">
                  Email <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="VD: nguyenvana@company.com"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="h-12"
                />
                <p className="text-sm text-gray-500">
                  Email này sẽ được dùng để xác thực tài khoản
                </p>
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
                    Địa chỉ công ty và tài liệu xác minh
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Addresses */}
              <div className="space-y-2">
                <Label
                  htmlFor="businessAddress"
                  className="text-base font-semibold"
                >
                  Địa chỉ trụ sở <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="businessAddress"
                  placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh"
                  value={formData.businessAddress}
                  onChange={(e) => {
                    updateField('businessAddress', e.target.value);
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

              <div className="space-y-2">
                <Label
                  htmlFor="billingAddress"
                  className="text-base font-semibold"
                >
                  Địa chỉ xuất hóa đơn <span className="text-red-600">*</span>
                </Label>
                <Textarea
                  id="billingAddress"
                  placeholder="VD: 456 Đường DEF, Phường UVW, Quận 3, TP. Hồ Chí Minh"
                  value={formData.billingAddress}
                  onChange={(e) =>
                    updateField('billingAddress', e.target.value)
                  }
                  disabled={sameAsBusinessAddress}
                  className="min-h-[80px]"
                />
              </div>

              {/* Document Uploads */}
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">
                  Tài liệu xác minh
                </h3>

                <div className="space-y-4">
                  {/* Business Certificate */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label className="text-base font-semibold">
                          Giấy chứng nhận đăng ký kinh doanh{' '}
                          <span className="text-red-600">*</span>
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          File PDF, JPG hoặc PNG (tối đa 5MB)
                        </p>
                      </div>
                      {uploadedFiles.businessCertificate && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadedFiles.businessCertificate
                          ? 'Đã tải lên - Chọn file khác'
                          : 'Chọn file để tải lên'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
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

                  {/* Representative ID */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label className="text-base font-semibold">
                          CMND/CCCD người đại diện{' '}
                          <span className="text-red-600">*</span>
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          File PDF, JPG hoặc PNG (tối đa 5MB)
                        </p>
                      </div>
                      {uploadedFiles.representativeId && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadedFiles.representativeId
                          ? 'Đã tải lên - Chọn file khác'
                          : 'Chọn file để tải lên'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
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

                  {/* Authorization Letter (Optional) */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Label className="text-base font-semibold">
                          Giấy ủy quyền (nếu có)
                        </Label>
                        <p className="text-sm text-gray-500 mt-1">
                          File PDF, JPG hoặc PNG (tối đa 5MB)
                        </p>
                      </div>
                      {uploadedFiles.authorizationLetter && (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      )}
                    </div>
                    <label className="flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed rounded-lg cursor-pointer hover:bg-white transition-colors">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uploadedFiles.authorizationLetter
                          ? 'Đã tải lên - Chọn file khác'
                          : 'Chọn file để tải lên'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            'authorizationLetter',
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
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Quay lại
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedStep3}
                  className="px-8 bg-red-600 hover:bg-red-700"
                >
                  <FileText className="mr-2 w-4 h-4" />
                  Gửi đăng ký
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Đã có tài khoản doanh nghiệp?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-red-600 hover:underline font-semibold"
            >
              Đăng nhập
            </button>
          </p>
          <p className="mt-2">
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <button className="text-red-600 hover:underline">
              Điều khoản dịch vụ
            </button>{' '}
            và{' '}
            <button className="text-red-600 hover:underline">
              Chính sách bảo mật
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
