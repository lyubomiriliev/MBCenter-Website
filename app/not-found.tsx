import Link from "next/link";
import Image from "next/image";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Umami } from "@/components/analytics/Umami";

export default function NotFound() {
  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen font-sans relative overflow-hidden">
      <GoogleAnalytics sendPageView />
      <Umami />
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/glc1.avif"
          alt=""
          fill
          className="object-cover opacity-15"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/80" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        <Image
          src="/assets/logos/mbc-logo-white.png"
          alt="MB Center"
          width={400}
          height={160}
          className="mb-10 opacity-90"
          priority
        />

        <h1 className="text-[10rem] sm:text-[12rem] font-black leading-none tracking-tighter bg-gradient-to-b from-white via-white/70 to-white/20 bg-clip-text text-transparent select-none">
          404
        </h1>

        <p className="mt-2 text-xl sm:text-2xl text-neutral-300 font-light">
          Страницата не е намерена
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          The page you are looking for does not exist.
        </p>

        <Link
          href="/bg"
          className="mt-12 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-lg bg-[#00adef] hover:bg-[#00adef]/85 text-white font-semibold transition-all duration-200 shadow-xl shadow-[#00adef]/25 hover:shadow-[#00adef]/40 hover:scale-[1.02]"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z"
            />
          </svg>
          Начална страница
        </Link>
      </div>
    </div>
  );
}
