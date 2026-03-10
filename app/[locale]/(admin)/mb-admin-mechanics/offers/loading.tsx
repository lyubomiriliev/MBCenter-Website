export default function OffersLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4">
      <div className="h-8 w-48 bg-white/10 rounded animate-pulse" />
      <div className="h-12 w-full bg-white/10 rounded animate-pulse" />
      <div className="rounded-lg border border-white/10 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 p-3 border-b border-white/5 last:border-0"
          >
            {Array.from({ length: 7 }).map((_, j) => (
              <div
                key={j}
                className="h-4 bg-white/10 rounded animate-pulse flex-1"
                style={{ animationDelay: `${(i * 7 + j) * 20}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
