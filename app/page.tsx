import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">MB Center Sofia</h1>
        <p className="text-xl text-mb-silver mb-12">
          Mercedes-Benz Service Center
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/bg"
            className="bg-mb-blue text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg"
          >
            Български
          </Link>
          <Link
            href="/en"
            className="bg-mb-blue text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg"
          >
            English
          </Link>
        </div>
      </div>
    </div>
  );
}
