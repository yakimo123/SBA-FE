import { Grid3x3, List, ShoppingCart,SlidersHorizontal, Star } from 'lucide-react';
import { useEffect,useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Slider } from '../components/ui/slider';
import { useCart } from '../contexts/CartContext';
import { allProducts, brands,categories } from '../data/mockData';

export function ProductListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const { addToCart } = useCart();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialCategory]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const filteredProducts = allProducts.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes('Tất cả') && !selectedCategories.includes(product.category)) {
      return false;
    }
    if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return 0; // Mock: would use date in real app
      default:
        return b.reviews - a.reviews;
    }
  });

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
                      setSelectedCategories([]);
                      setSelectedBrands([]);
                      setPriceRange([0, 5000000]);
                    }}
                  >
                    Xóa tất cả
                  </Button>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Danh mục</h4>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat} className="flex items-center">
                        <Checkbox
                          id={`cat-${cat}`}
                          checked={selectedCategories.includes(cat)}
                          onCheckedChange={() => toggleCategory(cat)}
                        />
                        <Label htmlFor={`cat-${cat}`} className="ml-2 text-sm cursor-pointer">
                          {cat}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Thương hiệu</h4>
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand} className="flex items-center">
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <Label htmlFor={`brand-${brand}`} className="ml-2 text-sm cursor-pointer">
                          {brand}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Khoảng giá</h4>
                  <Slider
                    min={0}
                    max={5000000}
                    step={100000}
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
                  <span className="font-medium text-gray-900">{sortedProducts.length}</span> sản phẩm
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
                    <SelectItem value="newest">Mới nhất</SelectItem>
                    <SelectItem value="price-asc">Giá thấp - cao</SelectItem>
                    <SelectItem value="price-desc">Giá cao - thấp</SelectItem>
                    <SelectItem value="rating">Đánh giá</SelectItem>
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

            {/* Active Filters */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategories.map(cat => (
                  <Badge key={cat} variant="secondary" className="gap-1">
                    {cat}
                    <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                ))}
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="secondary" className="gap-1">
                    {brand}
                    <button onClick={() => toggleBrand(brand)} className="ml-1 hover:text-red-600">×</button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Products Grid */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="block w-full text-left"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gray-100">
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-600">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </Badge>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-medium">Hết hàng</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2 line-clamp-2 h-12 text-sm">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}</span>
                          <span className="text-xs text-gray-500">({product.reviews})</span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-red-600 font-bold">
                            {product.price.toLocaleString('vi-VN')}₫
                          </span>
                          {product.originalPrice && (
                            <span className="text-gray-400 text-sm line-through">
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
                        disabled={!product.inStock}
                        onClick={() => addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image,
                          category: product.category
                        })}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Thêm vào giỏ
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex gap-4 p-4">
                      <button
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="w-48 h-48 shrink-0 relative overflow-hidden bg-gray-100 rounded-lg"
                      >
                        <ImageWithFallback
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.originalPrice && (
                          <Badge className="absolute top-2 left-2 bg-red-600">
                            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </Badge>
                        )}
                      </button>
                      <div className="flex-1 flex flex-col">
                        <button
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="text-left"
                        >
                          <h3 className="font-medium text-lg mb-2">{product.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span>{product.rating}</span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-600 text-sm">{product.reviews} đánh giá</span>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary">{product.category}</Badge>
                            <Badge variant="outline">{product.brand}</Badge>
                          </div>
                        </button>
                        <div className="mt-auto flex items-center justify-between">
                          <div>
                            <div className="text-red-600 font-bold text-xl">
                              {product.price.toLocaleString('vi-VN')}₫
                            </div>
                            {product.originalPrice && (
                              <div className="text-gray-400 line-through">
                                {product.originalPrice.toLocaleString('vi-VN')}₫
                              </div>
                            )}
                          </div>
                          <Button
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!product.inStock}
                            onClick={() => addToCart({
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              image: product.image,
                              category: product.category
                            })}
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
          </div>
        </div>
      </div>
    </div>
  );
}
