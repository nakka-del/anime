const LoadingSkeleton = ({ count = 8 }) => (
  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="glass overflow-hidden rounded-[28px]">
        <div className="aspect-[3/4] animate-pulse bg-white/8" />
        <div className="space-y-3 p-5">
          <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/8" />
          <div className="h-4 w-full animate-pulse rounded-full bg-white/8" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/8" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
