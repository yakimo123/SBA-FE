import { Facebook, Instagram, Mail, MapPin, Phone,Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from './ui/button';
import { Input } from './ui/input';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">PK</span>
              </div>
              <div>
                <div className="font-bold text-white">PHỤ KIỆN ĐIỆN TỬ</div>
              </div>
            </div>
            <p className="text-sm mb-4">
              Cung cấp phụ kiện điện tử, công nghệ chính hãng với giá tốt nhất thị trường.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Categories */}
          <div>
            <h3 className="font-bold text-white mb-4">Sản phẩm</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-red-500">Phụ kiện điện thoại</Link></li>
              <li><Link to="/products" className="hover:text-red-500">Phụ kiện laptop</Link></li>
              <li><Link to="/products" className="hover:text-red-500">Thiết bị âm thanh</Link></li>
              <li><Link to="/products" className="hover:text-red-500">Phụ kiện gaming</Link></li>
              <li><Link to="/products" className="hover:text-red-500">Thiết bị lưu trữ</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="font-bold text-white mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-red-500">Chính sách bảo hành</a></li>
              <li><a href="#" className="hover:text-red-500">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-red-500">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-red-500">Phương thức thanh toán</a></li>
              <li><a href="#" className="hover:text-red-500">Câu hỏi thường gặp</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 shrink-0" />
                <span>180 Cao Lỗ, P.4, Q.8, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>1900-xxxx (8:00 - 22:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>support@phukiendientu.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-sm mb-2">Đăng ký nhận tin khuyến mãi</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email của bạn" 
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button className="bg-red-600 hover:bg-red-700">
                  Gửi
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 Phukiendientu.com - Công ty TNHH Thương Mại Điện Tử Tech Solutions</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-red-500">Điều khoản sử dụng</a>
              <a href="#" className="hover:text-red-500">Chính sách bảo mật</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
