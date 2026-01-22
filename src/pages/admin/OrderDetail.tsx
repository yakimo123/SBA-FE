import {
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Printer,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/orders')}
            className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="font-['Fira_Code'] text-2xl font-bold text-purple-900 flex items-center gap-3">
              Order #{id}
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                Delivered
              </span>
            </h1>
            <p className="font-['Fira_Sans'] text-gray-600">
              Placed on Jan 22, 2024 at 10:30 AM
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-['Fira_Sans'] font-semibold text-gray-700 hover:bg-gray-50">
            <Printer className="h-5 w-5" /> Print Invoice
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 font-['Fira_Sans'] font-semibold text-white shadow-md hover:bg-orange-600">
            Update Status
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Order Items */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Order Items
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="h-16 w-16 rounded-lg bg-gray-100"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-purple-900">
                        Product Name {item}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Variation: Black, XL
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₫500,000</p>
                      <p className="text-sm text-gray-500">Qty: 1</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₫1,000,000</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>₫30,000</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>₫1,030,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Order Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="relative space-y-6 pl-4 border-l-2 border-gray-200">
                <div className="relative">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-green-500 text-white">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="pl-6 pt-2">
                    <h4 className="font-semibold text-gray-900">Delivered</h4>
                    <p className="text-sm text-gray-500">
                      Jan 24, 2024 at 14:00 PM
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-blue-500 text-white">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="pl-6 pt-2">
                    <h4 className="font-semibold text-gray-900">Shipped</h4>
                    <p className="text-sm text-gray-500">
                      Jan 23, 2024 at 09:00 AM
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-purple-500 text-white">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="pl-6 pt-2">
                    <h4 className="font-semibold text-gray-900">Processing</h4>
                    <p className="text-sm text-gray-500">
                      Jan 22, 2024 at 11:00 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Customer
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nguyen Van A</p>
                  <p className="text-xs text-gray-500">Customer since 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                email@example.com
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                +84 123 456 789
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Shipping Address
              </h2>
            </div>
            <div className="p-6">
              <div className="flex gap-3 text-sm text-gray-600">
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <p>
                  123 Le Loi Street, Ben Thanh Ward, District 1, Ho Chi Minh
                  City, Vietnam
                </p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="font-['Fira_Code'] text-lg font-semibold text-gray-900">
                Payment Info
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <CreditCard className="h-4 w-4" />
                Visa ending in 4242
              </div>
              <p className="text-sm text-gray-500">Paid on Jan 22, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
