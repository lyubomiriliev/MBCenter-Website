export default function EditOfferLoading() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:flex-row lg:items-start lg:p-8">
      <div className="flex-1 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
              <div className="h-10 bg-white/10 rounded" />
            </div>
          </div>
        ))}
      </div>
      <div className="lg:w-80 xl:w-88">
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4 animate-pulse">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-6 w-40 bg-white/10 rounded" />
          <div className="h-px bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
          <div className="h-10 bg-white/10 rounded" />
        </div>
      </div>
    </div>
  );
}
