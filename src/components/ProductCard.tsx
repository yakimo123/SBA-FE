import { ShoppingCart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { ImageWithFallback } from './figma/ImageWithFallback';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { useCart } from '../contexts/CartContext';
import { Product } from '../types/product';

const PLACEHOLDER_IMG =
    'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&q=80';

interface ProductCardProps {
    product: Product;
    imageUrl?: string;
}

export function ProductCard({ product, imageUrl = PLACEHOLDER_IMG }: ProductCardProps) {
    const navigate = useNavigate();
    const { addToCart } = useCart();

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
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
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
                    {product.status === 'AVAILABLE' && (
                        <Badge className="absolute top-2 left-2 bg-green-600">Còn hàng</Badge>
                    )}
                </div>
                <div className="p-4">
                    <p className="text-xs text-gray-400 mb-1">
                        {product.brandName ?? product.categoryName ?? '—'}
                    </p>
                    <h3 className="font-medium mb-2 line-clamp-2 h-12 text-sm">
                        {product.productName}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">Còn {product.quantity}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-red-600 font-bold">
                            {product.price.toLocaleString('vi-VN')}₫
                        </span>
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
