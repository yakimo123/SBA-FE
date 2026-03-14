import Autoplay from 'embla-carousel-autoplay';
import {
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Headphones,
  MapPin,
  MessageCircle,
  Shield,
  Star,
  Truck,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '../components/ui/carousel';
import bannerService, { Banner } from '../services/bannerService';
import { BranchResponse, branchService } from '../services/branchService';
import brandService from '../services/brandService';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import { Brand, Category, Product } from '../types/product';

const features = [
  {
    icon: Truck,
    title: 'Giao hàng nhanh 2-4h',
    description: 'Miễn phí ship nội thành',
  },
  {
    icon: Shield,
    title: 'Bảo hành dài hạn',
    description: 'Đổi trả trong 30 ngày',
  },
  {
    icon: Headphones,
    title: 'Hỗ trợ 24/7',
    description: 'Tư vấn miễn phí',
  },
  {
    icon: CreditCard,
    title: 'Trả góp 0%',
    description: 'Qua thẻ tín dụng',
  },
];

// Categories are now displayed using image URLs

// Default fallback slides in case API fails
const defaultHeroSlides = [
  {
    badge: '🎉 Mega Sale - Giảm đến 50%',
    title: 'Phụ Kiện Điện Tử\nChính Hãng & Cao Cấp',
    description: 'Miễn phí giao hàng 2-4 giờ • Bảo hành 30 ngày • Trả góp 0%.',
    image:
      'https://images.unsplash.com/photo-1672044631233-22b268dc6416?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBoZWFkcGhvbmVzJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NjgwMjg5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    gradient: 'from-red-600 via-red-500 to-orange-500',
    cta: 'Mua ngay',
    ctaSecondary: 'Xem deal hot',
    link: '/products',
  },
  {
    badge: '🎧 Gaming Gear',
    title: 'Phụ Kiện Gaming\nChơi Game Đỉnh Cao',
    description: 'Tai nghe, chuột, bàn phím cơ từ các thương hiệu hàng đầu.',
    image:
      'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=1080',
    gradient: 'from-purple-700 via-purple-600 to-indigo-500',
    cta: 'Khám phá ngay',
    ctaSecondary: 'Xem thêm',
    link: '/products',
  },
  {
    badge: '📱 Phụ kiện điện thoại',
    title: 'Ốp Lưng & Sạc Nhanh\nBảo Vệ Thiết Bị',
    description: 'Ốp iPhone, Samsung chính hãng. Sạc nhanh PD 65W giá tốt.',
    image:
      'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?q=80&w=1080',
    gradient: 'from-blue-700 via-blue-600 to-cyan-500',
    cta: 'Mua ngay',
    ctaSecondary: 'Xem ưu đãi',
    link: '/products',
  },
];

const defaultSideBanners = [
  {
    title: 'Săn Voucher',
    subtitle: 'Giảm đến 50%',
    gradient: 'from-orange-500 to-red-500',
    icon: '🎫',
    link: '/products',
    image: '',
  },
  {
    title: 'Freeship',
    subtitle: 'Đơn từ 0đ',
    gradient: 'from-emerald-500 to-teal-600',
    icon: '🚚',
    link: '/products',
    image: '',
  },
];

// Convert API banner to slide format
const convertBannerToSlide = (banner: Banner) => ({
  badge: banner.subtitle || '',
  title: banner.title,
  description: banner.description || '',
  image: banner.imageUrl,
  gradient: 'from-red-600 via-red-500 to-orange-500',
  cta: banner.buttonText || 'Mua ngay',
  ctaSecondary: 'Xem thêm',
  link: banner.buttonLink || '/products',
});

// Convert API banner to side banner format
const convertBannerToSideBanner = (banner: Banner, index: number) => ({
  title: banner.title,
  subtitle: banner.subtitle || '',
  gradient: index === 0 ? 'from-orange-500 to-red-500' : 'from-emerald-500 to-teal-600',
  icon: index === 0 ? '🎫' : '🚚',
  link: banner.buttonLink || '/products',
  image: banner.imageUrl || '',
});

export function HomePage() {
  const navigate = useNavigate();

  // Banner carousel state
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  const onSelect = useCallback(() => {
    if (!carouselApi) return;
    setCurrentSlide(carouselApi.selectedScrollSnap());
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect();
    carouselApi.on('select', onSelect);
    return () => { carouselApi.off('select', onSelect); };
  }, [carouselApi, onSelect]);

  // State
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiFlashSale, setApiFlashSale] = useState<Product[]>([]);
  const [apiNewProducts, setApiNewProducts] = useState<Product[]>([]);
  const [apiBestSellers, setApiBestSellers] = useState<Product[]>([]);
  const [apiBrands, setApiBrands] = useState<Brand[]>([]);
  const [apiBranches, setApiBranches] = useState<BranchResponse[]>([]);
  const [heroSlides, setHeroSlides] = useState(defaultHeroSlides);
  const [sideBanners, setSideBanners] = useState(defaultSideBanners);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch banners first
        const bannerRes = await bannerService.getHomeBanners();
        const banners = bannerRes.data;

        // Convert API banners to slides and side banners
        if (banners.main && banners.main.length > 0) {
          setHeroSlides(banners.main.map(convertBannerToSlide));
        }

        // Combine rightTop and rightBottom for side banners (max 2)
        const rightBanners = [...(banners.rightTop || []), ...(banners.rightBottom || [])].slice(0, 2);
        if (rightBanners.length > 0) {
          setSideBanners(rightBanners.map((b, i) => convertBannerToSideBanner(b, i)));
        }

        // Fetch other data in parallel
        const [catRes, flashRes, newRes, bestRes, brandRes, branchRes] =
          await Promise.all([
            categoryService.getCategories(0, 10),
            productService.getProducts({
              sort: 'discountPercent,desc',
              size: 4,
            }),
            productService.getProducts({ sort: 'createdDate,desc', size: 4 }),
            productService.getProducts({ sort: 'soldCount,desc', size: 4 }),
            brandService.getBrands(0, 20),
            branchService.getBranches({ size: 10 }),
          ]);

        setApiCategories(catRes.content || []);
        setApiFlashSale(flashRes.content || []);
        setApiNewProducts(newRes.content || []);
        setApiBestSellers(bestRes.content || []);

        // Filter for partner brands if isPartner field exists, otherwise show all
        const allBrands = brandRes.content || [];
        setApiBrands(allBrands.filter((b) => b.isPartner !== false));

        setApiBranches(branchRes.content || []);
      } catch (error) {
        console.error('Failed to fetch home page data:', error);
        // Keep default fallback data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 font-medium animate-pulse">
            Đang tải trải nghiệm premium...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 relative overflow-hidden">
      {/* Background Decor Blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[5%] -left-[10%] w-[40%] h-[40%] bg-red-100/40 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[25%] -right-[10%] w-[35%] h-[35%] bg-indigo-100/40 rounded-full blur-[100px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[50%] -left-[5%] w-[30%] h-[30%] bg-blue-100/30 rounded-full blur-[120px]" />
        <div className="absolute top-[75%] -right-[5%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[130px] animate-pulse [animation-delay:1s]" />
        <div className="absolute bottom-[5%] left-[10%] w-[25%] h-[25%] bg-orange-100/20 rounded-full blur-[100px]" />
      </div>

      {/* Hero Banner – 3 panels: banner chính cao bằng 2 banner phụ */}
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-3 md:min-h-[460px] items-stretch">
          {/* Main Carousel (left) – cao bằng tổng 2 banner phụ */}
          <div className="min-h-[320px] md:min-h-[460px] md:h-full">
            <Carousel
              opts={{ loop: true }}
              plugins={[autoplayPlugin.current]}
              setApi={setCarouselApi}
              className="relative h-full rounded-xl overflow-hidden"
            >
              <CarouselContent className="ml-0 h-full">
                {heroSlides.map((slide, index) => (
                  <CarouselItem key={index} className="pl-0 h-full">
                    <div className="relative h-full min-h-[320px] md:min-h-[460px] w-full overflow-hidden rounded-xl">
                    {/* Ảnh full nền */}
                    <ImageWithFallback
                      src={slide.image}
                      alt={slide.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {/* Overlay nhẹ để chữ đọc được, ảnh vẫn rõ */}
                    <div
                      className="absolute inset-0 bg-linear-to-r from-black/50 via-black/25 to-transparent"
                      aria-hidden
                    />
                    {/* Nội dung đè lên ảnh – font Outfit */}
                    <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-10 py-8 md:py-12 font-['Outfit',sans-serif]">
                      <div className="max-w-xl">
                        <Badge className="bg-white/20 text-white mb-3 backdrop-blur-md border-0 font-semibold">
                          {slide.badge}
                        </Badge>
                        <h1 className="text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight text-white drop-shadow-md">
                          {slide.title.split('\n').map((line, i) => (
                            <span key={i}>
                              {i > 0 && <br />}
                              {line}
                            </span>
                          ))}
                        </h1>
                        <p className="text-sm mb-5 text-white/90 max-w-md drop-shadow-sm font-medium">
                          {slide.description}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            size="lg"
                            className="bg-white text-red-600 hover:bg-gray-100 font-bold shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(slide.link);
                            }}
                          >
                            {slide.cta}
                            <ChevronRight className="ml-1 w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation Arrows */}
            <button
              onClick={() => carouselApi?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors shadow-md"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => carouselApi?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => carouselApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? 'w-7 bg-white shadow'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </Carousel>
          </div>

          {/* Side Banners (right) – 2 ô bằng nhau, tổng cao = banner chính */}
          <div className="hidden md:flex flex-col gap-3 h-full">
            {sideBanners.map((banner, index) => (
              <button
                key={index}
                type="button"
                onClick={() => navigate(banner.link)}
                className="relative flex-1 min-h-0 rounded-xl overflow-hidden text-white p-5 flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer text-left"
              >
                {/* Ảnh nền banner phụ (hiện khi có image từ API) */}
                {'image' in banner && banner.image ? (
                  <>
                    <ImageWithFallback
                      src={banner.image}
                      alt={banner.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" aria-hidden />
                  </>
                ) : (
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${banner.gradient}`}
                    aria-hidden
                  />
                )}
                <div className="relative z-10">
                  <span className="text-2xl mb-2 block">{banner.icon}</span>
                  <h3 className="text-lg font-bold leading-tight drop-shadow-sm">
                    {banner.title}
                  </h3>
                  <p className="text-xl font-extrabold mt-1 drop-shadow-sm">
                    {banner.subtitle}
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-1 text-xs font-semibold text-white/90 mt-3 drop-shadow-sm">
                  Xem ngay <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-sm">{feature.title}</div>
                  <div className="text-xs text-gray-600">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Danh mục nổi bật</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(apiCategories.length > 0 ? apiCategories : []).map(
            (category, index) => {
              return (
                <button
                  key={category.categoryId || index}
                  onClick={() =>
                    navigate(`/products?categoryId=${category.categoryId}`)
                  }
                  className="group"
                >
                  <Card className="p-4 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-none bg-white">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform bg-gray-50 overflow-hidden border border-gray-100/50 shadow-sm">
                      {category.imageUrl ? (
                        <ImageWithFallback
                          src={category.imageUrl}
                          alt={category.categoryName}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-400 font-bold text-xl uppercase">
                          {category.categoryName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-gray-800 group-hover:text-red-600 transition-colors text-sm line-clamp-1">
                      {category.categoryName}
                    </div>
                  </Card>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Flash Sale */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-linear-to-r from-red-600 to-orange-500 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h2 className="text-2xl font-bold">FLASH SALE</h2>
                <p className="text-sm text-white/80">
                  Giảm đến 50% - Số lượng có hạn
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <span className="text-sm">Kết thúc trong:</span>
              <div className="flex gap-2">
                <div className="bg-white text-red-600 px-2 py-1 rounded font-bold">
                  12
                </div>
                <div>:</div>
                <div className="bg-white text-red-600 px-2 py-1 rounded font-bold">
                  45
                </div>
                <div>:</div>
                <div className="bg-white text-red-600 px-2 py-1 rounded font-bold">
                  23
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              className="border-white text-red-500 hover:bg-white hover:text-red-600"
              onClick={() => navigate('/products')}
            >
              Xem tất cả
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(apiFlashSale.length > 0 ? apiFlashSale : []).map((product) => (
            <button
              key={product.productId}
              onClick={() => navigate(`/product/${product.productId}`)}
              className="group text-left"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={
                      product.mainImage ||
                      'https://images.unsplash.com/photo-1672044631233-22b268dc6416?q=80&w=1080'
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {product.discountPercent && (
                    <Badge className="absolute top-2 left-2 bg-red-600">
                      -{product.discountPercent}%
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2 h-12">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating || 5.0}</span>
                    <span className="text-xs text-gray-500">
                      ({product.soldCount || 0} đã bán)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-bold text-lg">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-sm line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                  <div className="mt-2 bg-red-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(((product.soldCount || 10) / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Đã lưu kho {product.quantity} sản phẩm
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* New Products */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm mới</h2>
          <Button variant="outline" onClick={() => navigate('/products')}>
            Xem tất cả
            <ChevronRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(apiNewProducts.length > 0 ? apiNewProducts : []).map((product) => (
            <button
              key={product.productId}
              onClick={() => navigate(`/product/${product.productId}`)}
              className="group text-left"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={
                      product.mainImage ||
                      'https://images.unsplash.com/photo-1583573864191-af3ab094887a?q=80&w=1080'
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-2 left-2 bg-green-600">
                    Mới
                  </Badge>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-2 line-clamp-2 h-12">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{product.rating || 5.0}</span>
                    <span className="text-xs text-gray-500">
                      ({product.soldCount || 0})
                    </span>
                  </div>
                  <span className="text-red-600 font-bold text-lg">
                    {product.price.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-linear-to-r from-purple-600 to-purple-400 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Trả góp 0%</h3>
            <p className="mb-4">Duyệt nhanh chóng, nhận hàng ngay</p>
            <Button className="bg-white text-purple-600 hover:bg-gray-100 font-bold">
              Tìm hiểu thêm
            </Button>
          </div>
          <div className="bg-linear-to-r from-blue-600 to-blue-400 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-2">Tích điểm đổi quà</h3>
            <p className="mb-4">Mua sắm nhiều, nhận ưu đãi lớn</p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 font-bold">
              Xem quà tặng
            </Button>
          </div>
        </div>
      </div>

      {/* Brand Partners */}
      <div className="bg-gray-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">Đối tác chiến lược</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sản phẩm phân phối chính hãng từ các thương hiệu hàng đầu
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {(apiBrands.length > 0 ? apiBrands : []).map((brand, index) => (
              <button
                key={brand.brandId || index}
                onClick={() => navigate(`/products?brandId=${brand.brandId}`)}
                className="group"
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 border-none bg-white h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-indigo-100">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.brandName}
                        className="w-10 h-10 object-contain transition-all opacity-100 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-xl font-black italic text-indigo-300 group-hover:text-indigo-600 transition-colors">
                        {brand.brandName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-sm text-gray-700 group-hover:text-indigo-600 transition-colors">
                    {brand.brandName}
                  </div>
                  {brand.isPartner && (
                    <Badge
                      variant="outline"
                      className="mt-2 text-[10px] py-0 border-indigo-200 text-indigo-500"
                    >
                      Đối tác
                    </Badge>
                  )}
                </Card>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Best Sellers */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Bán chạy nhất</h2>
            <p className="text-gray-500 text-sm mt-1">
              Những sản phẩm được tin dùng nhiều nhất
            </p>
          </div>
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 font-medium"
            onClick={() => navigate('/products')}
          >
            Xem thêm <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(apiBestSellers.length > 0 ? apiBestSellers : []).map((product) => (
            <button
              key={product.productId}
              onClick={() => navigate(`/product/${product.productId}`)}
              className="group text-left"
            >
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none bg-white">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <ImageWithFallback
                    src={
                      product.mainImage ||
                      'https://images.unsplash.com/photo-1619134766535-618a81622941?q=80&w=1080'
                    }
                    alt={product.productName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant="secondary"
                      className="bg-white/90 backdrop-blur-sm shadow-sm"
                    >
                      Hot
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-10 text-sm leading-tight">
                    {product.productName}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(product.rating || 5) ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      ({product.soldCount || 0})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-red-600 font-bold text-lg">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    {product.originalPrice && (
                      <span className="text-gray-400 text-xs line-through">
                        {product.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {/* B2B Banner */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-900 via-purple-900 to-red-900 text-white p-8 md:p-16">
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-white/20 text-white mb-6 backdrop-blur-md border-white/20">
              Chương trình Doanh nghiệp
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              Cung cấp sỉ cho <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-red-400">
                Cửa hàng & Doanh nghiệp
              </span>
            </h2>
            <ul className="space-y-4 mb-10">
              {[
                'Chiết khấu lên đến 30% cho đơn hàng số lượng lớn',
                'Hỗ trợ công nợ và VAT đầy đủ cho doanh nghiệp',
                'Giao hàng hỏa tốc trong 2 giờ tại nội thành',
                'Chính sách bảo hành và đổi trả ưu tiên',
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                className="bg-white text-indigo-900 hover:bg-gray-100 font-bold px-8 cursor-pointer"
                onClick={() => navigate('/register-business')}
              >
                Đăng ký đối tác ngay
              </Button>
            </div>
          </div>

          {/* Abstract Background Elements */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500 rounded-full blur-[120px]" />
          </div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500 rounded-full blur-[100px] opacity-30" />
        </div>
      </div>

      {/* Store Locator Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-red-600 font-semibold mb-4">
                <MapPin className="w-5 h-5" />
                <span>Mạng lưới toàn quốc</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Trải nghiệm sản phẩm trực tiếp tại hệ thống showroom
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Hệ thống cửa hàng luôn sẵn sàng đón tiếp. Quý khách có thể đến
                trải nghiệm sản phẩm, nhận tư vấn kỹ thuật và bảo hành nhanh
                chóng.
              </p>

              <div className="space-y-4">
                {(apiBranches.length > 0 ? apiBranches : [])
                  .slice(0, 3)
                  .map((branch) => (
                    <button
                      key={branch.branchId}
                      onClick={() => {
                        const url =
                          branch.mapsUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            branch.address
                          )}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-red-500 hover:bg-red-50/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center shrink-0 group-hover:bg-red-600 transition-colors">
                        <MapPin className="w-6 h-6 text-red-600 group-hover:text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="font-bold group-hover:text-red-600 transition-colors truncate">
                            {branch.branchName}
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-red-500 flex items-center gap-1 shrink-0 ml-2">
                            Chỉ đường <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {branch.address}
                        </div>
                        <div className="text-sm text-red-600 font-medium mt-1">
                          SĐT: {branch.contactNumber}
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden aspect-square md:aspect-4/3 bg-gray-100 shadow-2xl border-2 border-white">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  apiBranches[0]?.address || 'Hồ Chí Minh, Việt Nam'
                )}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
              <div className="absolute top-4 left-4 p-3 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-white/20 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-bold">
                    Showroom đang mở cửa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Support Widget */}
      <div className="fixed bottom-8 right-6 md:right-10 z-50 flex flex-col gap-3">
        {/* Zalo / Support Button */}
        <button
          className="group relative flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-blue-200/50 transition-all hover:-translate-y-1"
          onClick={() => window.open('https://zalo.me/your_id', '_blank')}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Hỗ trợ Zalo
          </span>
        </button>

        {/* Back to Top Button */}
        <button
          className="group relative flex items-center justify-center w-12 h-12 bg-white/80 backdrop-blur-md text-gray-900 border border-gray-200 rounded-full shadow-md hover:bg-white transition-all"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ArrowUp className="w-5 h-5" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Lên đầu trang
          </span>
        </button>
      </div>
    </div>
  );
}
