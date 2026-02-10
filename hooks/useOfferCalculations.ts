"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { OfferFormData } from "@/lib/schemas/offer";
import { VAT_RATE, EUR_TO_BGN } from "@/lib/schemas/offer";
import { parseTimeToHours } from "@/lib/utils";

interface CalculationResult {
  partsSubtotal: number;
  partsCount: number;
  laborSubtotal: number;
  laborCount: number;
  subtotal: number;
  partsDiscountAmount: number;
  servicesDiscountAmount: number;
  discountAmount: number;
  netTotal: number;
  vatAmount: number;
  grossTotal: number;
  subtotalBGN: number;
  partsDiscountAmountBGN: number;
  servicesDiscountAmountBGN: number;
  discountAmountBGN: number;
  netTotalBGN: number;
  vatAmountBGN: number;
  grossTotalBGN: number;
  formatted: {
    partsSubtotal: string;
    laborSubtotal: string;
    subtotal: string;
    partsDiscountAmount: string;
    partsDiscountAmountBGN: string;
    servicesDiscountAmount: string;
    servicesDiscountAmountBGN: string;
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
  const parts = useWatch({ control, name: "parts" }) || [];
  const serviceActions = useWatch({ control, name: "serviceActions" }) || [];
  const discountPercent = useWatch({ control, name: "discountPercent" }) || 0;
  const discountPartsPercent =
    useWatch({ control, name: "discountPartsPercent" }) || 0;
  const discountServicesPercent =
    useWatch({ control, name: "discountServicesPercent" }) || 0;

  return useMemo(() => {
    const partsSubtotal = parts.reduce((sum: number, part: any) => {
      const qty = part.quantity || 1;
      const price = part.unitPrice || 0;
      return sum + price * qty;
    }, 0);

    const laborSubtotal = serviceActions.reduce((sum: number, action: any) => {
      if (action.isFixedPrice && action.fixedPriceAmount) {
        return sum + (action.fixedPriceAmount || 0);
      }
      const hours = parseTimeToHours(action.timeRequired || "0");
      const price = action.pricePerHour || 0;
      return sum + hours * price;
    }, 0);

    // Calculate gross for parts and services (add VAT)
    const partsGross = partsSubtotal * (1 + VAT_RATE);
    const servicesGross = laborSubtotal * (1 + VAT_RATE);

    // Discounts are applied to gross amounts (with VAT)
    const partsDiscountAmount = partsGross * (discountPartsPercent / 100);
    const servicesDiscountAmount =
      servicesGross * (discountServicesPercent / 100);
    const totalDiscountAmount = partsDiscountAmount + servicesDiscountAmount;

    const subtotal = partsSubtotal + laborSubtotal;
    const grossBeforeDiscount = partsGross + servicesGross;
    const grossTotal = grossBeforeDiscount - totalDiscountAmount;
    const netTotal = grossTotal / (1 + VAT_RATE);
    const vatAmount = grossTotal - netTotal;

    // Convert to BGN
    const subtotalBGN = subtotal * EUR_TO_BGN;
    const partsDiscountAmountBGN = partsDiscountAmount * EUR_TO_BGN;
    const servicesDiscountAmountBGN = servicesDiscountAmount * EUR_TO_BGN;
    const discountAmountBGN = totalDiscountAmount * EUR_TO_BGN;
    const netTotalBGN = netTotal * EUR_TO_BGN;
    const vatAmountBGN = vatAmount * EUR_TO_BGN;
    const grossTotalBGN = grossTotal * EUR_TO_BGN;

    return {
      partsSubtotal,
      partsCount: parts.length,
      laborSubtotal,
      laborCount: serviceActions.length,
      subtotal,
      partsDiscountAmount,
      servicesDiscountAmount,
      discountAmount: totalDiscountAmount,
      netTotal,
      vatAmount,
      grossTotal,
      subtotalBGN,
      partsDiscountAmountBGN,
      servicesDiscountAmountBGN,
      discountAmountBGN,
      netTotalBGN,
      vatAmountBGN,
      grossTotalBGN,
      formatted: {
        partsSubtotal: formatEUR(partsSubtotal),
        laborSubtotal: formatEUR(laborSubtotal),
        subtotal: formatEUR(subtotal),
        partsDiscountAmount: formatEUR(partsDiscountAmount),
        partsDiscountAmountBGN: formatBGN(partsDiscountAmountBGN),
        servicesDiscountAmount: formatEUR(servicesDiscountAmount),
        servicesDiscountAmountBGN: formatBGN(servicesDiscountAmountBGN),
        discountAmount: formatEUR(totalDiscountAmount),
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
  }, [
    parts,
    serviceActions,
    discountPercent,
    discountPartsPercent,
    discountServicesPercent,
  ]);
}
