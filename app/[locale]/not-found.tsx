import { useTranslations } from 'next-intl';
import { Link } from '@/routing';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex items-center justify-center bg-mb-black px-6">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <p className="text-2xl text-mb-silver mb-8">Page Not Found</p>
        <Link
          href="/"
          className="bg-mb-blue text-white px-8 py-4 rounded-button hover:opacity-90 transition-opacity font-medium inline-block"
        >
          {t('nav.home')}
        </Link>
      </div>
    </div>
  );
}


