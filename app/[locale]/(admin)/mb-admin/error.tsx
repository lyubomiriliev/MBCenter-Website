"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-0 p-8 text-white">
      <div className="max-w-md w-full bg-mb-anthracite border border-mb-border rounded-xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold">Възникна грешка</h2>
        <p className="text-mb-silver text-sm">
          Нещо се обърка при зареждането на страницата. Опитайте отново или се върнете назад.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg bg-mb-blue hover:bg-mb-blue/80 text-white text-sm font-medium transition-colors"
          >
            Опитай отново
          </button>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg border border-mb-border text-mb-silver hover:text-white text-sm font-medium transition-colors"
          >
            Начало
          </button>
        </div>
      </div>
    </div>
  );
}
