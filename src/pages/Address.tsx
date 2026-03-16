import { Edit2, MapPin, Phone, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { provinceService } from '../services/provinceService';
import { userService } from '../services/userService';
import { District, Province, Ward } from '../types/address';

interface AddressInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

export function AddressPage() {
  const { user } = useAuth();
  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    name: user?.fullName || user?.name || '',
    phone: user?.phoneNumber || user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for editing
  const [formData, setFormData] = useState<AddressInfo>({
    name: user?.fullName || user?.name || '',
    phone: user?.phoneNumber || user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
    city: '',
    district: '',
    ward: '',
  });

  // Update form data when user context changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: user?.fullName || user?.name || prev.name,
      phone: user?.phoneNumber || user?.phone || prev.phone,
      email: user?.email || prev.email,
    }));
  }, [user?.userId, user?.fullName, user?.name, user?.phoneNumber, user?.phone, user?.email]);

  // Address lookup state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null);

  // Fetch provinces
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await provinceService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (selectedProvinceCode) {
      const fetchDistricts = async () => {
        try {
          const data = await provinceService.getDistricts(selectedProvinceCode);
          setDistricts(data);
          setWards([]);
        } catch (error) {
          console.error('Failed to fetch districts:', error);
        }
      };
      fetchDistricts();
    }
  }, [selectedProvinceCode]);

  // Fetch wards when district changes
  useEffect(() => {
    if (selectedDistrictCode) {
      const fetchWards = async () => {
        try {
          const data = await provinceService.getWards(selectedDistrictCode);
          setWards(data);
        } catch (error) {
          console.error('Failed to fetch wards:', error);
        }
      };
      fetchWards();
    }
  }, [selectedDistrictCode]);

  // Fetch user address info
  const fetchUserAddress = useCallback(async () => {
    if (!user?.userId) return;
    setIsLoading(true);
    try {
      const fullUser = await userService.getUserById(user.userId);
      if (fullUser) {
        let parsedCity = '';
        let parsedDistrict = '';
        let parsedWard = '';
        let parsedAddress = '';

        // Parse address to extract city, district, ward
        if (fullUser.address) {
          const addressParts = fullUser.address.split(',').map(part => part.trim());
          
          if (addressParts.length >= 4) {
            // Format: address, ward, district, city
            parsedAddress = addressParts[0];
            parsedWard = addressParts[1];
            parsedDistrict = addressParts[2];
            parsedCity = addressParts[3];
          } else if (addressParts.length === 3) {
            // Format: address, district, city
            parsedAddress = addressParts[0];
            parsedDistrict = addressParts[1];
            parsedCity = addressParts[2];
          } else if (addressParts.length === 2) {
            // Format: address, city
            parsedAddress = addressParts[0];
            parsedCity = addressParts[1];
          } else {
            parsedAddress = fullUser.address;
          }
        }

        const addressData: AddressInfo = {
          name: fullUser.fullName || user?.fullName || user?.name || '',
          phone: fullUser.phoneNumber || user?.phoneNumber || user?.phone || '',
          email: fullUser.email || user?.email || '',
          address: parsedAddress,
          city: parsedCity,
          district: parsedDistrict,
          ward: parsedWard,
        };
        
        setAddressInfo(addressData);
        setFormData(addressData);

        // Set province code for cascading select
        if (parsedCity) {
          const province = provinces.find(p => p.name === parsedCity);
          if (province) {
            setSelectedProvinceCode(province.code);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user address:', error);
      toast.error('Không thể tải thông tin địa chỉ');
    } finally {
      setIsLoading(false);
    }
  }, [user?.userId, user?.fullName, user?.name, user?.phoneNumber, user?.phone, user?.email, provinces]);

  useEffect(() => {
    fetchUserAddress();
  }, [fetchUserAddress]);

  const handleOpenEditDialog = () => {
    setFormData(addressInfo);
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleUpdateAddress = async () => {
    if (!user?.userId) {
      toast.error('Vui lòng đăng nhập');
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullAddress = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city,
      ]
        .filter(Boolean)
        .join(', ');

      await userService.updateUser(user.userId, {
        fullName: formData.name,
        phoneNumber: formData.phone,
        address: fullAddress,
      });

      setAddressInfo(formData);
      toast.success('Cập nhật địa chỉ thành công');
      handleCloseEditDialog();
      fetchUserAddress();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Có lỗi xảy ra khi cập nhật địa chỉ');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Address Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">Địa chỉ giao hàng</h2>
          <Button
            onClick={handleOpenEditDialog}
            className="bg-red-600 hover:bg-red-700"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Cập nhật
          </Button>
        </div>

        {/* Address Display */}
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
          {/* Name */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tên</p>
              <p className="font-medium text-gray-900">{addressInfo.name || 'Chưa cập nhật'}</p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="font-medium text-gray-900">{addressInfo.phone || 'Chưa cập nhật'}</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Địa chỉ</p>
              <p className="font-medium text-gray-900">
                {addressInfo.address || 'Chưa cập nhật'}
              </p>
              {(addressInfo.ward || addressInfo.district || addressInfo.city) && (
                <p className="text-sm text-gray-600 mt-1">
                  {[addressInfo.ward, addressInfo.district, addressInfo.city]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Address Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cập nhật địa chỉ giao hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân và địa chỉ giao hàng của bạn
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Customer Info */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Họ và tên *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Số điện thoại *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">Địa chỉ giao hàng</h4>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                  <Select
                    onValueChange={(value) => {
                      const province = provinces.find(
                        (p) => String(p.code) === value
                      );
                      if (province) {
                        setFormData({
                          ...formData,
                          city: province.name,
                          district: '',
                          ward: '',
                        });
                        setSelectedProvinceCode(province.code);
                        setSelectedDistrictCode(null);
                      }
                    }}
                    value={
                      selectedProvinceCode
                        ? String(selectedProvinceCode)
                        : undefined
                    }
                  >
                    <SelectTrigger id="city" className="w-full">
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {provinces.map((p) => (
                        <SelectItem key={p.code} value={String(p.code)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <Select
                      onValueChange={(value) => {
                        const district = districts.find(
                          (d) => String(d.code) === value
                        );
                        if (district) {
                          setFormData({
                            ...formData,
                            district: district.name,
                            ward: '',
                          });
                          setSelectedDistrictCode(district.code);
                        }
                      }}
                      value={
                        selectedDistrictCode
                          ? String(selectedDistrictCode)
                          : undefined
                      }
                      disabled={!selectedProvinceCode}
                    >
                      <SelectTrigger id="district" className="w-full">
                        <SelectValue placeholder="Chọn Quận/Huyện" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {districts.map((d) => (
                          <SelectItem key={d.code} value={String(d.code)}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <Select
                      onValueChange={(value) => {
                        const ward = wards.find(
                          (w) => String(w.code) === value
                        );
                        if (ward) {
                          setFormData({ ...formData, ward: ward.name });
                        }
                      }}
                      value={
                        formData.ward
                          ? wards
                              .find((w) => w.name === formData.ward)
                              ?.code.toString()
                          : undefined
                      }
                      disabled={!selectedDistrictCode}
                    >
                      <SelectTrigger id="ward" className="w-full">
                        <SelectValue placeholder="Chọn Phường/Xã" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {wards.map((w) => (
                          <SelectItem key={w.code} value={String(w.code)}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Địa chỉ cụ thể *</Label>
                  <Input
                    id="address"
                    placeholder="Số nhà, tên đường..."
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button
              onClick={handleUpdateAddress}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
