export function Skeleton({ className = "", width, height }: { className?: string; width?: string; height?: string }) {
  return (
    <div
      className={`animate-pulse bg-surface-800 rounded-lg ${className}`}
      style={{ width: width || "100%", height: height || "20px" }}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton width="40px" height="32px" />
          <Skeleton className="flex-1" height="32px" />
          <Skeleton width="80px" height="32px" />
          <Skeleton width="60px" height="32px" />
          <Skeleton width="80px" height="32px" />
          <Skeleton width="120px" height="32px" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-3">
      <Skeleton width="100px" height="14px" />
      <Skeleton width="160px" height="28px" />
      <Skeleton width="60px" height="12px" />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl p-5 space-y-4">
      <div>
        <Skeleton width="140px" height="18px" />
        <Skeleton width="80px" height="12px" className="mt-2" />
      </div>
      <Skeleton height="280px" />
    </div>
  );
}