import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product } from '../types/product';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&q=80';

interface ProductCardProps {
  product: Product;
  imageUrl?: string;
}

export function ProductCard({
  product,
  imageUrl = PLACEHOLDER_IMG,
}: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const wishlisted = isInWishlist(product.productId);
  const isInStock = product.status === 'AVAILABLE' && product.quantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    addToCart({
      id: String(product.productId),
      name: product.productName,
      price: product.price,
      image: imageUrl,
      category: product.categoryName ?? '',
    });
  };

  const handleNavigate = () => {
    navigate(`/product/${product.productId}`);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow pb-6">
      <button onClick={handleNavigate} className="block w-full text-left">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <ImageWithFallback
            src={imageUrl}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {!isInStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-medium">Hết hàng</span>
            </div>
          )}
          {product.discountPercent && product.discountPercent > 0 && (
            <Badge className="absolute top-2 left-4 bg-red-600">
              -{product.discountPercent}%
            </Badge>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (wishlisted) {
                removeFromWishlist(product.productId);
              } else {
                addToWishlist(product.productId);
              }
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow transition-colors"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
              }`}
            />
          </button>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 mb-1">
            {product.brandName ?? product.categoryName ?? '—'}
          </p>
          <h3 className="font-medium mb-2 line-clamp-2 h-12 text-sm">
            {product.productName}
          </h3>
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700">
                {product.rating || 0}
              </span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">
              Đã bán {product.soldCount || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs ${product.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              Kho: {product.quantity}
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-red-600 font-bold text-lg">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-gray-400 line-through text-xs">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>
      </button>
      <div className="px-4 pb-4">
        <Button
          className="w-full bg-red-600 hover:bg-red-700"
          size="sm"
          disabled={!isInStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Thêm vào giỏ
        </Button>
      </div>
    </Card>
  );
}
