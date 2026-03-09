import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&q=80';

export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [removingAll, setRemovingAll] = useState(false);

  const handleRemove = async (productId: number) => {
    setRemovingIds((prev) => new Set(prev).add(productId));
    // Wait for CSS exit animation
    setTimeout(async () => {
      await removeFromWishlist(productId);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 350);
  };

  const handleClearAll = async () => {
    setRemovingAll(true);
    // Wait for CSS exit animation, then actually clear
    setTimeout(async () => {
      await clearWishlist();
      setRemovingAll(false);
    }, 400);
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    addToCart({
      id: String(item.productId),
      name: item.productName,
      price: 0,
      image: item.productImageUrl || PLACEHOLDER_IMG,
      category: '',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-64 rounded bg-gray-200 animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0 && !removingAll) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Danh sách yêu thích trống</h2>
            <p className="text-gray-600 mb-6">
              Hãy thêm những sản phẩm bạn yêu thích để theo dõi và mua sắm dễ dàng hơn!
            </p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-red-600 hover:bg-red-700"
            >
              Khám phá sản phẩm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900">Yêu thích</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            Sản phẩm yêu thích
            <Badge variant="secondary" className="ml-3 text-base">
              {wishlistItems.length}
            </Badge>
          </h1>
          {wishlistItems.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleClearAll}
              disabled={removingAll}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wishlistItems.map((item, index) => {
            const isRemoving = removingIds.has(item.productId) || removingAll;
            return (
              <Card
                key={item.productId}
                data-wishlist-card
                className={`overflow-hidden group hover:shadow-lg transition-all duration-350 ${
                  isRemoving ? 'removing' : ''
                }`}
                style={removingAll ? { transitionDelay: `${index * 60}ms` } : undefined}
              >
                <button
                  onClick={() => navigate(`/product/${item.productId}`)}
                  className="block w-full text-left"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={item.productImageUrl || PLACEHOLDER_IMG}
                      alt={item.productName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-2 line-clamp-2 h-12 text-sm">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Thêm ngày {new Date(item.createdDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </button>
                <div className="px-4 pb-4 flex gap-2">
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    size="sm"
                    onClick={() => handleAddToCart(item)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Thêm vào giỏ
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 text-red-500 hover:bg-red-50"
                    onClick={() => handleRemove(item.productId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
