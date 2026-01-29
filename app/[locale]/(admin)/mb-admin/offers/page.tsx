'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { OffersTable } from '@/components/admin/offers/OffersTable';
import { OfferFilters } from '@/components/admin/offers/OfferFilters';
import { Button } from '@/components/ui/button';
import type { OfferStatus } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { OfferPDFv3 } from '@/components/pdf/OfferPDFv3';
import type { OfferWithRelations } from '@/types/database';
import { Toast } from '@/components/ui/toast';
import { useNotification } from '@/hooks/useNotification';

export default function OffersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();

  const [filters, setFilters] = useState<{
    status: OfferStatus | 'all';
    search: string;
    dateFrom?: Date;
    dateTo?: Date;
  }>({
    status: 'all',
    search: '',
  });

  const [isDownloading, setIsDownloading] = useState(false);
  
  const { notifications, dismiss, showError } = useNotification();

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Register fonts first (critical for Cyrillic support)
      const { registerPDFFonts } = await import('@/lib/pdf-fonts');
      const { setFontRegistered } = await import('@/components/pdf/OfferPDFv3');
      const fontsReady = await registerPDFFonts();
      setFontRegistered(fontsReady);

      if (!fontsReady) {
        console.warn('Fonts not loaded, PDFs will use Helvetica fallback');
      }

      // Fetch all offers with applied filters
      let query = supabase
        .from('offers')
        .select(`
          *,
          client:clients(id, name, phone, email),
          car:cars(id, model, year, vin, license_plate, mileage),
          items:offer_items(*),
          service_actions(*)
        `)
        .order('created_at', { ascending: false })
        .order('sort_order', { referencedTable: 'offer_items', ascending: true })
        .order('sort_order', { referencedTable: 'service_actions', ascending: true });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.search) {
        query = query.or(`offer_number.ilike.%${filters.search}%,customer_name.ilike.%${filters.search}%,customer_phone.ilike.%${filters.search}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      const { data: offers, error } = await query;

      if (error) throw error;
      if (!offers || offers.length === 0) {
        alert(t('offers.noOffersToDownload') || 'No offers to download');
        setIsDownloading(false);
        return;
      }

      // Create ZIP file
      const zip = new JSZip();
      const folder = zip.folder('offers');

      // Generate PDFs for each offer
      for (const offer of offers as OfferWithRelations[]) {
        try {
          // Generate PDF with fonts registered
          const pdfDoc = <OfferPDFv3 offer={offer} locale={locale as 'bg' | 'en'} />;
          const blob = await pdf(pdfDoc).toBlob();
          
          // Add to ZIP with safe filename
          const fileName = `Offer_${offer.offer_number}_${offer.customer_name || 'Unknown'}.pdf`
            .replace(/[^a-zA-Z0-9_\-\.]/g, '_');
          folder?.file(fileName, blob);
        } catch (err) {
          console.error(`Error generating PDF for offer ${offer.offer_number}:`, err);
        }
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MBCenter_Offers_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading offers:', error);
      showError(t('offers.downloadError'));
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Notifications */}
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => dismiss(notification.id)}
        />
      ))}
      
      <AdminHeader
        title={t('offers.title')}
        subtitle={t('offers.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="bg-green-600 hover:bg-green-700 text-sm sm:text-base shrink-0"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="hidden sm:inline">{t('offers.downloading')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span className="hidden sm:inline">{t('offers.downloadAll')}</span>
                  <span className="sm:hidden">ZIP</span>
                </>
              )}
            </Button>
            <Link href={`/${locale}/mb-admin/create-offer`}>
              <Button className="bg-mb-blue hover:bg-mb-blue/90 text-sm sm:text-base shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('offers.newOffer')}
              </Button>
            </Link>
          </div>
        }
      />
      <div className="flex-1 min-w-0 overflow-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <OfferFilters onFiltersChange={setFilters} />
        <OffersTable filters={filters} />
      </div>
    </div>
  );
}

