import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

type Product = {
  productId: number | string;
  productName: string;
  mainImage?: string;
  price?: number;
  discountPercent?: number;
  rating?: number;
  categoryName?: string;
  brandName?: string;
};

type PublicSearchResults = {
  products: Product[];
  categories: Array<{ categoryId: number | string; categoryName: string }>;
  brands: Array<{ brandId: number | string; brandName: string }>;
  vouchers: Array<{
    voucherCode: string;
    description?: string;
    discountPercent?: number;
  }>;
};

export function SearchResultsPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') ?? '').trim();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PublicSearchResults>({
    products: [],
    categories: [],
    brands: [],
    vouchers: [],
  });

  const API_BASE_URL = useMemo(() => {
    return (
      (import.meta as unknown as { env: { VITE_API_URL?: string } }).env
        .VITE_API_URL || 'http://localhost:8080'
    );
  }, []);

  useEffect(() => {
    if (!q) {
      setResults({ products: [], categories: [], brands: [], vouchers: [] });
      return;
    }

    let cancelled = false;

    (async () => {
      const url = `${API_BASE_URL}/api/public/search?q=${encodeURIComponent(q)}&limit=20`;
      try {
        setLoading(true);
        const res = await fetch(url);
        const raw = await res.text();
        const data = raw ? JSON.parse(raw) : null;
        const payload = (data as any)?.data ?? data;

        if (!cancelled) {
          setResults({
            products: payload?.products ?? [],
            categories: payload?.categories ?? [],
            brands: payload?.brands ?? [],
            vouchers: payload?.vouchers ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setResults({ products: [], categories: [], brands: [], vouchers: [] });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [API_BASE_URL, q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900">
          Kết quả tìm kiếm: <span className="text-red-600">{q || '...'}</span>
        </h1>
        <Link to="/products" className="text-sm text-gray-600 hover:text-red-600">
          Xem tất cả sản phẩm
        </Link>
      </div>

      {loading && (
        <div className="mt-6 text-sm text-gray-600">Đang tải kết quả...</div>
      )}

      {!loading && (results.products?.length ?? 0) === 0 && q && (
        <div className="mt-10 text-center">
          <div className="text-2xl">🔍</div>
          <div className="mt-2 text-base font-semibold text-gray-900">
            Không tìm thấy sản phẩm cho '{q}'
          </div>
          <div className="mt-1 text-sm text-gray-600">
            Hãy thử từ khóa khác.
          </div>
        </div>
      )}

      {(results.products?.length ?? 0) > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {results.products.map((p) => (
            <Link
              key={p.productId}
              to={`/product/${p.productId}`}
              className="group rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition"
            >
              <div className="aspect-square bg-gray-50">
                {p.mainImage ? (
                  <img
                    src={p.mainImage}
                    alt={p.productName}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <div className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-red-600">
                  {p.productName}
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-red-600">
                    {typeof p.price === 'number'
                      ? `${p.price.toLocaleString('vi-VN')}₫`
                      : ''}
                  </div>
                  {typeof p.discountPercent === 'number' && (
                    <div className="text-xs text-gray-600">
                      -{p.discountPercent}%
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

