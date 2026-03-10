import DOMPurify from 'dompurify';
import {
  Award,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Share2,
  Shield,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductDetailSkeleton } from '../components/ProductSkeleton';
import { Avatar } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { productAttributeService } from '../services/attributeService';
import { mediaService } from '../services/mediaService';
import { productService } from '../services/productService';
import reviewService, {
  type RatingStatsResponse,
  type ReviewResponse,
} from '../services/reviewService';
import { Media, Product, ProductAttribute } from '../types/product';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=800&q=80';

const REVIEWS_PAGE_SIZE = 5;

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Review states
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStatsResponse | null>(null);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  // New review form
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const loadReviews = useCallback(async (productId: number, page: number) => {
    setIsLoadingReviews(true);
    try {
      const reviewsRes = await reviewService.getReviews({
        productId,
        page,
        size: REVIEWS_PAGE_SIZE,
        sortBy: 'reviewDate',
        sortDir: 'desc',
      });
      setReviews(reviewsRes.content || []);
      setReviewTotalPages(reviewsRes.totalPages || 0);
    } catch {
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const numericId = Number(id);
      const productData = await productService.getProductById(numericId);
      setProduct(productData);

      // If product has imageUrls, we use them. Otherwise fallback to mediaService
      if (productData.imageUrls && productData.imageUrls.length > 0) {
        setMediaList(
          productData.imageUrls.map((url, i) => ({
            mediaId: i,
            productId: numericId,
            type: 'IMAGE',
            url,
          }))
        );
      } else {
        const mediaData = await mediaService
          .getProductMedia(numericId)
          .catch(() => []);
        setMediaList(mediaData);
      }

      const attrData = await productAttributeService
        .getProductAttributes(numericId)
        .catch(() => []);
      setAttributes(attrData ?? []);

      // Fetch rating stats
      try {
        const stats = await reviewService.getRatingStats(numericId);
        setRatingStats(stats);
      } catch {
        setRatingStats(null);
      }

      // Fetch reviews
      await loadReviews(numericId, 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id, loadReviews]);

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
          <p className="text-gray-600 mb-6">
            {error ?? 'Sản phẩm không tồn tại hoặc đã bị xóa.'}
          </p>
          <Button
            onClick={() => navigate('/products')}
            className="bg-red-600 hover:bg-red-700"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  // Build image gallery from media list; fallback to placeholder
  const galleryImages: string[] =
    mediaList.filter((m) => m.type === 'IMAGE').map((m) => m.url).length > 0
      ? mediaList.filter((m) => m.type === 'IMAGE').map((m) => m.url)
      : product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : [PLACEHOLDER_IMG];

  const isInStock = product.status === 'AVAILABLE' && product.quantity > 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: String(product.productId),
        name: product.productName,
        price: product.price,
        image: galleryImages[0],
        category: product.categoryName ?? '',
      });
    }
  };

  const handleReviewPageChange = async (page: number) => {
    setReviewPage(page);
    await loadReviews(product.productId, page);
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitReview = async () => {
    if (!user || !isAuthenticated || !newComment.trim()) return;
    setIsSubmitting(true);
    setReviewError(null);
    setReviewSuccess(false);
    try {
      await reviewService.createReview(user.userId, {
        productId: product.productId,
        rating: newRating,
        comment: newComment.trim(),
      });
      setNewComment('');
      setNewRating(5);
      setReviewSuccess(true);
      // Reload reviews and stats
      await Promise.all([
        loadReviews(product.productId, 0),
        reviewService.getRatingStats(product.productId).then(setRatingStats).catch(() => {}),
      ]);
      setReviewPage(0);
    } catch (err: unknown) {
      const errorMap: Record<number, string> = {
        409: 'Bạn đã đánh giá sản phẩm này rồi',
        400: 'Thông tin đánh giá không hợp lệ',
        401: 'Vui lòng đăng nhập để đánh giá',
        403: 'Bạn không có quyền thực hiện thao tác này',
      };
      let message = 'Đã có lỗi xảy ra, vui lòng thử lại sau';
      if (err && typeof err === 'object' && 'response' in err) {
        const status = (err as { response: { status: number } }).response?.status;
        if (status && errorMap[status]) {
          message = errorMap[status];
        }
      }
      setReviewError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToReviews = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Rating stats helpers
  const avgRating = ratingStats?.averageRating ?? 0;
  const totalReviews = ratingStats?.totalReviews ?? 0;
  const ratingDistribution = ratingStats
    ? [
        { stars: 5, count: ratingStats.fiveStar },
        { stars: 4, count: ratingStats.fourStar },
        { stars: 3, count: ratingStats.threeStar },
        { stars: 2, count: ratingStats.twoStar },
        { stars: 1, count: ratingStats.oneStar },
      ].map((item) => ({
        ...item,
        percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0,
      }))
    : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-red-600"
          >
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
          <span className="text-gray-900 line-clamp-1">
            {product.productName}
          </span>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div>
            <Card className="overflow-hidden mb-4">
              <div className="relative aspect-square bg-gray-100">
                <ImageWithFallback
                  src={galleryImages[currentImageIndex]}
                  alt={product.productName}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                {!isInStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      Hết hàng
                    </span>
                  </div>
                )}
                {galleryImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) =>
                            (prev - 1 + galleryImages.length) %
                            galleryImages.length
                        )
                      }
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex(
                          (prev) => (prev + 1) % galleryImages.length
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </Card>
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {galleryImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    currentImageIndex === index
                      ? 'border-red-600'
                      : 'border-transparent'
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
                  <Badge
                    variant="secondary"
                    className="mb-2 text-[#c9521a] bg-[#fdf1eb] border-none"
                  >
                    {product.brandName}
                  </Badge>
                )}
                <h1 className="text-3xl font-bold mb-3 tracking-tight text-[#1a1612]">
                  {product.productName}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-[#1a1612]">
                      {avgRating ? avgRating.toFixed(1) : (product.rating || '0.0')}
                    </span>
                  </div>
                  <span className="text-gray-300">•</span>
                  <button
                    onClick={scrollToReviews}
                    className="text-gray-600 text-sm hover:text-red-600 underline-offset-2 hover:underline"
                  >
                    {totalReviews > 0 ? `${totalReviews} đánh giá` : 'Chưa có đánh giá'}
                  </button>
                  <span className="text-gray-300">•</span>
                  <span
                    className={`text-sm font-semibold ${isInStock ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {isInStock
                      ? `Còn ${product.quantity} sản phẩm`
                      : 'Hết hàng'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    isInWishlist(product.productId)
                      ? removeFromWishlist(product.productId)
                      : addToWishlist(product.productId)
                  }
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isInWishlist(product.productId)
                        ? 'fill-red-500 text-red-500'
                        : ''
                    }`}
                  />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Price */}
            <Card className="p-6 mb-6 bg-[#faf9f7] border-[#e8e3da] shadow-none">
              <div className="flex items-center gap-4 mb-1">
                <span className="text-4xl font-black text-[#c9521a]">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                {product.discountPercent && product.discountPercent > 0 && (
                  <Badge className="bg-[#c9521a] hover:bg-[#c9521a] text-white border-none py-1 px-2">
                    -{product.discountPercent}%
                  </Badge>
                )}
              </div>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400 line-through text-lg">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                )}

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#e8e3da]">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Phân phối bởi:</span>
                  <span className="font-semibold text-[#1a1612]">
                    {product.supplierName || 'SBA Shop'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Danh mục:</span>
                  <span className="font-semibold text-[#1a1612] uppercase text-[0.75rem] tracking-wider">
                    {product.categoryName}
                  </span>
                </div>
              </div>
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
                  <span className="w-12 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.quantity, quantity + 1))
                    }
                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                Còn {product.quantity} sản phẩm
              </span>
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
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="description">Mô tả</TabsTrigger>
              <TabsTrigger value="specs">
                Thông số ({attributes.length})
              </TabsTrigger>
            </TabsList>

            {/* Description */}
            <TabsContent value="description">
              <div className="prose prose-sm max-w-none text-[#1a1612]">
                <h3 className="text-lg font-bold mb-4 border-b pb-2">
                  Thông tin chi tiết
                </h3>
                {product.descriptionDetails ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(product.descriptionDetails),
                    }}
                    className="description-content [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4"
                  />
                ) : (
                  <p className="text-gray-500 italic">
                    {product.description ||
                      'Chưa có mô tả chi tiết cho sản phẩm này.'}
                  </p>
                )}
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
                    <div
                      key={attr.productAttributeId}
                      className="flex py-3 border-b"
                    >
                      <span className="w-40 text-gray-600">
                        {attr.attributeName ??
                          `Thuộc tính #${attr.attributeId}`}
                      </span>
                      <span className="font-medium flex-1">{attr.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        {/* Reviews Section */}
        <Card className="mb-8 p-6" ref={reviewSectionRef}>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" />
            Đánh giá sản phẩm
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Rating Summary */}
            <div className="md:col-span-1">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-red-600 mb-2">
                  {avgRating ? avgRating.toFixed(1) : '0.0'}
                </div>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{totalReviews} đánh giá</p>
              </div>
              {ratingDistribution.length > 0 && (
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5 w-10 shrink-0 justify-end">
                        <span className="text-sm">{item.stars}</span>
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={item.percentage} className="flex-1" />
                      <span className="text-sm text-gray-600 w-8 text-right">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews List */}
            <div className="md:col-span-2">
              {isLoadingReviews ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="border-b pb-6 animate-pulse">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                        <div className="flex-1">
                          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                          <div className="h-3 w-24 bg-gray-200 rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-full bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Chưa có đánh giá nào</p>
                  <p className="text-sm">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.reviewId} className="border-b pb-6">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-10 h-10 bg-gray-200" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{review.userFullName}</span>
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Đã mua hàng
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.reviewDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>

                        {/* Admin reply */}
                        {review.replyComment && (
                          <div className="mt-3 ml-6 p-3 bg-gray-50 rounded-lg border-l-2 border-red-400">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-red-600">
                                {review.repliedByFullName || 'Quản trị viên'}
                              </span>
                              {review.replyDate && (
                                <span className="text-xs text-gray-400">
                                  {new Date(review.replyDate).toLocaleDateString('vi-VN')}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{review.replyComment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {reviewTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewPage === 0}
                        onClick={() => handleReviewPageChange(reviewPage - 1)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: reviewTotalPages }, (_, i) => (
                        <Button
                          key={i}
                          variant={i === reviewPage ? 'default' : 'outline'}
                          size="sm"
                          className={i === reviewPage ? 'bg-red-600 hover:bg-red-700' : ''}
                          onClick={() => handleReviewPageChange(i)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewPage >= reviewTotalPages - 1}
                        onClick={() => handleReviewPageChange(reviewPage + 1)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Write a Review */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Viết đánh giá</h3>
            {isAuthenticated && user ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Đánh giá của bạn
                  </label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="p-0.5"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || newRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {newRating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Nhận xét
                  </label>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    className="w-full border rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-400 text-right mt-1">
                    {newComment.length}/1000
                  </div>
                </div>
                {reviewError && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    Cảm ơn bạn đã đánh giá sản phẩm!
                  </div>
                )}
                <Button
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-3">
                  Bạn cần đăng nhập để viết đánh giá
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  Đăng nhập
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
