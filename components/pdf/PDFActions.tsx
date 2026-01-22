'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OfferPDFv3 } from './OfferPDFv3';
import { ServiceCardPDFv3 } from './ServiceCardPDFv3';
import type { OfferWithRelations } from '@/types/database';

interface PDFActionsProps {
  offer: OfferWithRelations;
  variant?: 'button' | 'dropdown';
}

export function PDFActions({ offer, variant = 'dropdown' }: PDFActionsProps) {
  const t = useTranslations('admin.offers');
  const locale = useLocale() as 'bg' | 'en';
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const generatePDF = async (type: 'offer' | 'serviceCard') => {
    setIsGenerating(type);
    
    try {
      const PDFComponent = type === 'offer' 
        ? <OfferPDFv3 offer={offer} locale={locale} />
        : <ServiceCardPDFv3 offer={offer} locale={locale} />;
      
      const blob = await pdf(PDFComponent).toBlob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'offer' 
        ? `offer-${offer.offer_number}.pdf`
        : `service-card-${offer.offer_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const openPDFInNewTab = async (type: 'offer' | 'serviceCard') => {
    setIsGenerating(type);
    
    try {
      const PDFComponent = type === 'offer' 
        ? <OfferPDFv3 offer={offer} locale={locale} />
        : <ServiceCardPDFv3 offer={offer} locale={locale} />;
      
      const blob = await pdf(PDFComponent).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  if (variant === 'button') {
    return (
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generatePDF('offer')}
          disabled={!!isGenerating}
          className="w-full border-mb-border"
        >
          {isGenerating === 'offer' ? (
            <LoadingSpinner />
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {t('generateOffer')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generatePDF('serviceCard')}
          disabled={!!isGenerating}
          className="w-full border-mb-border"
        >
          {isGenerating === 'serviceCard' ? (
            <LoadingSpinner />
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {t('generateServiceCard')}
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-mb-border">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
          <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-mb-anthracite border-mb-border">
        <DropdownMenuItem 
          onClick={() => generatePDF('offer')}
          disabled={!!isGenerating}
          className="cursor-pointer"
        >
          {isGenerating === 'offer' ? <LoadingSpinner /> : (
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 002-2V8l-6-6H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          {t('downloadOffer')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => openPDFInNewTab('offer')}
          disabled={!!isGenerating}
          className="cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {t('openOffer')}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-mb-border" />
        <DropdownMenuItem 
          onClick={() => generatePDF('serviceCard')}
          disabled={!!isGenerating}
          className="cursor-pointer"
        >
          {isGenerating === 'serviceCard' ? <LoadingSpinner /> : (
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          {t('downloadServiceCard')}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => openPDFInNewTab('serviceCard')}
          disabled={!!isGenerating}
          className="cursor-pointer"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {t('openServiceCard')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

