import { ArrowLeft, Calendar,Heart, Mail, MapPin, Phone, ShoppingBag, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

export function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/customers')}
          className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-['Fira_Code'] text-2xl font-bold text-purple-900">Customer Profile</h1>
          <p className="font-['Fira_Sans'] text-gray-600">ID: {id}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-lg bg-white p-6 shadow-sm text-center">
            <div className="mx-auto h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-3xl font-bold mb-4">
              N
            </div>
            <h2 className="text-xl font-bold text-gray-900">Nguyen Van A</h2>
            <span className="inline-block mt-2 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Active</span>
            
            <div className="mt-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail className="h-4 w-4" />
                <span>vana@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="h-4 w-4" />
                <span>+84 123 456 789</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Joined Jan 2023</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 border-t pt-6">
               <div className="text-center">
                 <p className="text-2xl font-bold text-gray-900">15</p>
                 <p className="text-xs text-gray-500 uppercase">Orders</p>
               </div>
               <div className="text-center">
                 <p className="text-2xl font-bold text-gray-900">₫25M</p>
                 <p className="text-xs text-gray-500 uppercase">Spent</p>
               </div>
            </div>
          </div>
        </div>

        {/* Details Tabs/Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Recent Orders */}
          <div className="rounded-lg bg-white shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-['Fira_Code'] font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> Recent Orders
              </h3>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div>
                      <p className="font-['Fira_Code'] font-medium text-purple-900">#ORD-240{i}</p>
                      <p className="text-sm text-gray-500">Jan 2{i}, 2024</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">₫{i},500,000</p>
                      <p className="text-sm text-gray-500">3 items</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">Delivered</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
             {/* Product Reviews */}
             <div className="rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-['Fira_Code'] font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="h-4 w-4" /> Recent Reviews
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <p className="text-sm text-gray-900 font-medium">iPhone 15 Pro Max</p>
                  <p className="text-sm text-gray-600 italic">"Great product, highly recommend!"</p>
                </div>
              </div>
            </div>

            {/* Favorites */}
             <div className="rounded-lg bg-white shadow-sm border border-gray-200">
              <div className="border-b border-gray-200 px-6 py-4">
                <h3 className="font-['Fira_Code'] font-semibold text-gray-900 flex items-center gap-2">
                  <Heart className="h-4 w-4" /> Wishlist
                </h3>
              </div>
              <div className="p-6 space-y-3">
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-gray-100 rounded"></div>
                   <div>
                     <p className="text-sm font-medium text-gray-900">MacBook Air M2</p>
                     <p className="text-xs text-gray-500">Added Jan 15</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 bg-gray-100 rounded"></div>
                   <div>
                     <p className="text-sm font-medium text-gray-900">Sony WH-1000XM5</p>
                     <p className="text-xs text-gray-500">Added Jan 10</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
