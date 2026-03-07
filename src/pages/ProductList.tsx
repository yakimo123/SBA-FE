import { Grid3x3, List, ShoppingCart, SlidersHorizontal, Star } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ProductCard } from '../components/ProductCard';
import { ProductCardSkeleton, ProductListSkeleton } from '../components/ProductSkeleton';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { useCart } from '../contexts/CartContext';
import { categoryService } from '../services/categoryService';
import { brandService } from '../services/brandService';
import { productService } from '../services/productService';
import { Category, Brand, Product } from '../types/product';

const PLACEHOLDER_IMG =
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&q=80';
const PAGE_SIZE = 12;
const MAX_PRICE = 50000000;

export function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('categoryId');
  const { addToCart } = useCart();

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(true);
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE]);
  const [keyword, setKeyword] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
    initialCategory ? [Number(initialCategory)] : []
  );
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingFilters, setIsLoadingFilters] = useState(true);
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Load filter options once
  useEffect(() => {
    const loadFilters = async () => {
      setIsLoadingFilters(true);
      try {
        const [catData, brandData] = await Promise.all([
          categoryService.getCategories(0, 100),
          brandService.getBrands(0, 100),
        ]);
        let fetchedCats = catData.content ?? [];
        if (fetchedCats.length === 0) {
          fetchedCats = [
            { categoryId: 991, categoryName: 'Electronics' },
            { categoryId: 992, categoryName: 'Fashion' },
            { categoryId: 993, categoryName: 'Shoes' },
          ];
        }

        let fetchedBrands = brandData.content ?? [];
        if (fetchedBrands.length === 0) {
          fetchedBrands = [
            { brandId: 881, brandName: 'Nike' },
            { brandId: 882, brandName: 'Adidas' },
            { brandId: 883, brandName: 'Apple' },
          ];
        }

        setCategories(fetchedCats);
        setBrands(fetchedBrands);
      } catch {
        // Non-critical — filters just won't be populated
      } finally {
        setIsLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);

  // Fetch products whenever filters change
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = { page, size: PAGE_SIZE };
      if (keyword.trim()) params.keyword = keyword.trim();
      if (selectedCategoryIds.length === 1) params.categoryId = selectedCategoryIds[0];
      if (selectedBrandIds.length === 1) params.brandId = selectedBrandIds[0];

      const data = await productService.getProducts(params as Parameters<typeof productService.getProducts>[0]);
      setProducts(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải sản phẩm';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [page, keyword, selectedCategoryIds, selectedBrandIds]);



  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [keyword, selectedCategoryIds, selectedBrandIds]);

  const toggleCategory = (id: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  // Client-side price filter (applied after API fetch) + sort
  const displayedProducts = products
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const getProductImage = (_product: Product): string => {
    // Products from the API may not have a direct image URL — use placeholder
    return PLACEHOLDER_IMG;
  };

  const isInStock = (product: Product) =>
    product.status === 'AVAILABLE' && product.quantity > 0;

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: String(product.productId),
      name: product.productName,
      price: product.price,
      image: getProductImage(product),
      category: product.categoryName ?? '',
    });
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
          <span className="text-gray-900">Sản phẩm</span>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <aside className="w-64 shrink-0 hidden md:block">
              <Card className="p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">Bộ lọc</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategoryIds([]);
                      setSelectedBrandIds([]);
                      setPriceRange([0, MAX_PRICE]);
                      setKeyword('');
                    }}
                  >
                    Xóa tất cả
                  </Button>
                </div>

                {/* Search keyword */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Tìm kiếm</h4>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Tên sản phẩm..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {isLoadingFilters ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                        ))}
                      </div>
                    ) : categories.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Chưa có danh mục</p>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.categoryId} className="flex items-center">
                          <Checkbox
                            id={`cat-${cat.categoryId}`}
                            checked={selectedCategoryIds.includes(cat.categoryId)}
                            onCheckedChange={() => toggleCategory(cat.categoryId)}
                          />
                          <Label
                            htmlFor={`cat-${cat.categoryId}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {cat.categoryName}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Thương hiệu</h4>
                  <div className="space-y-2">
                    {isLoadingFilters ? (
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                        ))}
                      </div>
                    ) : brands.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Chưa có thương hiệu</p>
                    ) : (
                      brands.map((brand) => (
                        <div key={brand.brandId} className="flex items-center">
                          <Checkbox
                            id={`brand-${brand.brandId}`}
                            checked={selectedBrandIds.includes(brand.brandId)}
                            onCheckedChange={() => toggleBrand(brand.brandId)}
                          />
                          <Label
                            htmlFor={`brand-${brand.brandId}`}
                            className="ml-2 text-sm cursor-pointer"
                          >
                            {brand.brandName}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Khoảng giá</h4>
                  <Slider
                    min={0}
                    max={MAX_PRICE}
                    step={500000}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-3"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                    <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                  </div>
                </div>

                {/* In Stock */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <Checkbox id="instock" defaultChecked />
                    <Label htmlFor="instock" className="ml-2 text-sm cursor-pointer">
                      Chỉ hiện sản phẩm còn hàng
                    </Label>
                  </div>
                </div>
              </Card>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Bộ lọc
                </Button>
                <span className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{totalElements}</span> sản phẩm
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 hidden md:inline">Sắp xếp:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Phổ biến</SelectItem>
                    <SelectItem value="price-asc">Giá thấp - cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao - thấp</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filter Badges */}
            {(selectedCategoryIds.length > 0 || selectedBrandIds.length > 0 || keyword) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {keyword && (
                  <Badge variant="secondary" className="gap-1">
                    Tìm: "{keyword}"
                    <button onClick={() => setKeyword('')} className="ml-1 hover:text-red-600">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategoryIds.map((id) => {
                  const cat = categories.find((c) => c.categoryId === id);
                  return cat ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {cat.categoryName}
                      <button
                        onClick={() => toggleCategory(id)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
                {selectedBrandIds.map((id) => {
                  const brand = brands.find((b) => b.brandId === id);
                  return brand ? (
                    <Badge key={id} variant="secondary" className="gap-1">
                      {brand.brandName}
                      <button
                        onClick={() => toggleBrand(id)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
                <button
                  onClick={fetchProducts}
                  className="ml-2 underline hover:text-red-900"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductListSkeleton key={i} />
                  ))}
                </div>
              )
            ) : displayedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2">Không có sản phẩm</h3>
                <p className="text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    imageUrl={getProductImage(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayedProducts.map((product) => (
                  <Card
                    key={product.productId}
                    className="overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4 p-4">
                      <button
                        onClick={() => navigate(`/product/${product.productId}`)}
                        className="w-48 h-48 shrink-0 relative overflow-hidden bg-gray-100 rounded-lg"
                      >
                        <ImageWithFallback
                          src={getProductImage(product)}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </button>
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => navigate(`/product/${product.productId}`)}
                          className="text-left"
                        >
                          <h3 className="font-medium text-lg mb-2">{product.productName}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm text-gray-600">
                                Tồn kho: {product.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            {product.categoryName && (
                              <Badge variant="secondary">{product.categoryName}</Badge>
                            )}
                            {product.brandName && (
                              <Badge variant="outline">{product.brandName}</Badge>
                            )}
                          </div>
                        </button>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <div className="text-red-600 font-bold text-xl">
                              {product.price.toLocaleString('vi-VN')}₫
                            </div>
                          </div>
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!isInStock(product)}
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Thêm vào giỏ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && !isLoading && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Trước
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={p === page ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {p + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Tiếp →
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
