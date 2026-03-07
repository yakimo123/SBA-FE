/** Skeleton card shown while products are loading */
export function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-100 bg-white animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
                <div className="h-3 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="h-8 w-full rounded bg-gray-200 mt-2" />
            </div>
        </div>
    );
}

/** Horizontal skeleton for list view */
export function ProductListSkeleton() {
    return (
        <div className="flex gap-4 rounded-lg border border-gray-100 bg-white p-4 animate-pulse">
            <div className="w-48 h-48 shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-3 py-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-1/4 rounded bg-gray-200" />
                <div className="h-6 w-1/3 rounded bg-gray-200" />
                <div className="h-10 w-32 rounded bg-gray-200 mt-4" />
            </div>
        </div>
    );
}

/** Full-page skeleton for product detail */
export function ProductDetailSkeleton() {
    return (
        <div className="grid lg:grid-cols-2 gap-8 animate-pulse">
            <div className="space-y-3">
                <div className="aspect-square rounded-lg bg-gray-200" />
                <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square rounded-lg bg-gray-200" />
                    ))}
                </div>
            </div>
            <div className="space-y-4 py-2">
                <div className="h-4 w-1/4 rounded bg-gray-200" />
                <div className="h-8 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-10 w-1/3 rounded bg-gray-200" />
                <div className="h-28 w-full rounded bg-gray-200" />
                <div className="h-12 w-full rounded bg-gray-200" />
            </div>
        </div>
    );
}
