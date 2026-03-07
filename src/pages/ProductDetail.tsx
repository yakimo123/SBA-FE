import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductDetailSkeleton } from '../components/ProductSkeleton';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/productService';
import { mediaService } from '../services/mediaService';
import { productAttributeService } from '../services/attributeService';
import { Product, Media, ProductAttribute } from '../types/product';
import { reviews } from '../data/mockData';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80';

const ratingDistribution = [
  { stars: 5, count: 156, percentage: 64 },
  { stars: 4, count: 65, percentage: 27 },
  { stars: 3, count: 18, percentage: 7 },
  { stars: 2, count: 4, percentage: 1 },
  { stars: 1, count: 2, percentage: 1 },
];

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [productData, mediaData, attrData] = await Promise.all([
        productService.getProductById(Number(id)),
        mediaService.getProductMedia(Number(id)).catch(() => [] as Media[]),
        productAttributeService.getProductAttributes(Number(id)).catch(() => [] as ProductAttribute[]),
      ]);
      setProduct(productData);
      setMediaList(mediaData ?? []);
      setAttributes(attrData ?? []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    window.scrollTo(0, 0);
  }, [loadProduct]);

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-4 w-48 rounded bg-gray-200 animate-pulse mb-6" />
          <ProductDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center py-16">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-gray-600 mb-6">{error ?? 'Sản phẩm không tồn tại hoặc đã bị xóa.'}</p>
          <Button onClick={() => navigate('/products')} className="bg-red-600 hover:bg-red-700">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // Build image gallery from media list; fallback to placeholder
  const imageUrls: string[] =
    mediaList.filter((m) => m.type === 'IMAGE').map((m) => m.url).length > 0
      ? mediaList.filter((m) => m.type === 'IMAGE').map((m) => m.url)
      : [PLACEHOLDER_IMG];

  const isInStock = product.status === 'AVAILABLE' && product.quantity > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.productId),
        name: product.productName,
        price: product.price,
        image: imageUrls[0],
        category: product.categoryName ?? '',
      });
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button onClick={() => navigate('/')} className="text-gray-600 hover:text-red-600">
            Trang chủ
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={() => navigate('/products')}
            className="text-gray-600 hover:text-red-600"
          >
            {product.categoryName ?? 'Sản phẩm'}
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 line-clamp-1">{product.productName}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <Card className="overflow-hidden mb-4">
              <div className="relative aspect-square bg-gray-100">
                <ImageWithFallback
                  src={imageUrls[currentImageIndex]}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
                {!isInStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">Hết hàng</span>
                  </div>
                )}
                {imageUrls.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </Card>
            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
              {imageUrls.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? 'border-red-600' : 'border-transparent'
                    }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.productName} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                {product.brandName && (
                  <Badge variant="outline" className="mb-2">
                    {product.brandName}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="font-medium ml-1">4.8</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    Còn {product.quantity} sản phẩm
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <Card className="p-6 mb-4 bg-gray-50">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-red-600">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
              </div>
              <p className="text-sm text-gray-600">Giá đã bao gồm VAT</p>
            </Card>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Giao nhanh 2-4h</div>
                  <div className="text-xs text-gray-600">Miễn phí ship</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Bảo hành 12 tháng</div>
                  <div className="text-xs text-gray-600">Chính hãng</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Đổi trả 30 ngày</div>
                  <div className="text-xs text-gray-600">Miễn phí</div>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-sm text-gray-600">Còn {product.quantity} sản phẩm</span>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-red-600 hover:bg-red-700 h-12 text-lg"
                disabled={!isInStock}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Thêm vào giỏ hàng
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="flex-1 h-12 text-lg"
                disabled={!isInStock}
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
              >
                Mua ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Details Tabs */}
        <Card className="mb-8">
          <Tabs defaultValue="description" className="p-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specs">
                Thông số ({attributes.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
            </TabsList>

            {/* Description */}
            <TabsContent value="description">
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">
                  {product.description ?? 'Chưa có mô tả cho sản phẩm này.'}
                </p>
              </div>
            </TabsContent>

            {/* Specs — from product attributes API */}
            <TabsContent value="specs">
              <h3 className="text-xl font-bold mb-4">Thông số kỹ thuật</h3>
              {attributes.length === 0 ? (
                <p className="text-gray-500">Chưa có thông số kỹ thuật.</p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {attributes.map((attr) => (
                    <div key={attr.productAttributeId} className="flex py-3 border-b">
                      <span className="w-40 text-gray-600">
                        {attr.attributeName ?? `Thuộc tính #${attr.attributeId}`}
                      </span>
                      <span className="font-medium flex-1">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Reviews — still uses mock data */}
            <TabsContent value="reviews">
              <div className="grid md:grid-cols-3 gap-8 mb-8">
                <div className="md:col-span-1">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-red-600 mb-2">4.8</div>
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-600">245 đánh giá</p>
                  </div>
                  <div className="space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-2">
                        <span className="text-sm w-8">{item.stars} ⭐</span>
                        <Progress value={item.percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-8">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-10 h-10 bg-gray-200" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.user}</span>
                              {review.verified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Đã mua hàng
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                      }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-6">
                    Xem thêm đánh giá
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
