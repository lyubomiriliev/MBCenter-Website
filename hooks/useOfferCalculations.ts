'use client';

import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import type { OfferFormData, OfferItemFormData } from '@/lib/schemas/offer';
import { VAT_RATE, EUR_TO_BGN } from '@/lib/schemas/offer';

interface CalculationResult {
  // Parts calculations
  partsSubtotal: number;
  partsCount: number;
  
  // Labor calculations
  laborSubtotal: number;
  laborCount: number;
  
  // Totals
  subtotal: number;
  discountAmount: number;
  netTotal: number;
  vatAmount: number;
  grossTotal: number;
  
  // BGN conversions
  subtotalBGN: number;
  discountAmountBGN: number;
  netTotalBGN: number;
  vatAmountBGN: number;
  grossTotalBGN: number;
  
  // Formatted values
  formatted: {
    partsSubtotal: string;
    laborSubtotal: string;
    subtotal: string;
    discountAmount: string;
    netTotal: string;
    vatAmount: string;
    grossTotal: string;
    subtotalBGN: string;
    discountAmountBGN: string;
    netTotalBGN: string;
    vatAmountBGN: string;
    grossTotalBGN: string;
  };
}

function formatEUR(value: number): string {
  return `€${value.toFixed(2)}`;
}

function formatBGN(value: number): string {
  return `${value.toFixed(2)} лв.`;
}

export function useOfferCalculations(
  control: Control<OfferFormData>
): CalculationResult {
  // Watch the separate arrays and discount
  const parts = useWatch({ control, name: 'parts' }) || [];
  const serviceActions = useWatch({ control, name: 'serviceActions' }) || [];
  const discountPercent = useWatch({ control, name: 'discountPercent' }) || 0;

  return useMemo(() => {
    // Calculate parts subtotal
    const partsSubtotal = parts.reduce((sum: number, part: any) => {
      const qty = part.quantity || 1;
      const price = part.unitPrice || 0;
      return sum + (price * qty);
    }, 0);

    // Calculate labor subtotal from service actions
    const laborSubtotal = serviceActions.reduce((sum: number, action: any) => {
      const timeStr = action.timeRequired || "0h 0min";
      const hourMatch = timeStr.match(/(\d+)h/);
      const minMatch = timeStr.match(/(\d+)min/);
      const hours = (hourMatch ? parseInt(hourMatch[1]) : 0) + (minMatch ? parseInt(minMatch[1]) : 0) / 60;
      const price = action.pricePerHour || 0;
      return sum + (hours * price);
    }, 0);

    // Calculate totals
    const subtotal = partsSubtotal + laborSubtotal;
    const discountAmount = subtotal * (discountPercent / 100);
    const netTotal = subtotal - discountAmount;
    const vatAmount = netTotal * VAT_RATE;
    const grossTotal = netTotal + vatAmount;

    // Convert to BGN
    const subtotalBGN = subtotal * EUR_TO_BGN;
    const discountAmountBGN = discountAmount * EUR_TO_BGN;
    const netTotalBGN = netTotal * EUR_TO_BGN;
    const vatAmountBGN = vatAmount * EUR_TO_BGN;
    const grossTotalBGN = grossTotal * EUR_TO_BGN;

    return {
      partsSubtotal,
      partsCount: parts.length,
      laborSubtotal,
      laborCount: serviceActions.length,
      subtotal,
      discountAmount,
      netTotal,
      vatAmount,
      grossTotal,
      subtotalBGN,
      discountAmountBGN,
      netTotalBGN,
      vatAmountBGN,
      grossTotalBGN,
      formatted: {
        partsSubtotal: formatEUR(partsSubtotal),
        laborSubtotal: formatEUR(laborSubtotal),
        subtotal: formatEUR(subtotal),
        discountAmount: formatEUR(discountAmount),
        netTotal: formatEUR(netTotal),
        vatAmount: formatEUR(vatAmount),
        grossTotal: formatEUR(grossTotal),
        subtotalBGN: formatBGN(subtotalBGN),
        discountAmountBGN: formatBGN(discountAmountBGN),
        netTotalBGN: formatBGN(netTotalBGN),
        vatAmountBGN: formatBGN(vatAmountBGN),
        grossTotalBGN: formatBGN(grossTotalBGN),
      },
    };
  }, [parts, serviceActions, discountPercent]);
}

