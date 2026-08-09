"use client";

import { useMemo } from "react";
import { useWatch } from "react-hook-form";
import type { Control } from "react-hook-form";
import type { OfferFormData } from "@/lib/schemas/offer";
import { parseTimeToHours } from "@/lib/utils";

interface CalculationResult {
  partsSubtotal: number;
  partsCount: number;
  totalCost: number;
  totalProfit: number;
  totalProfitMargin: number | null;
  laborSubtotal: number;
  laborCount: number;
  totalHours: number;
  subtotal: number;
  partsDiscountAmount: number;
  servicesDiscountAmount: number;
  discountAmount: number;
  netTotal: number;
  vatAmount: number;
  grossTotal: number;
  formatted: {
    partsSubtotal: string;
    laborSubtotal: string;
    subtotal: string;
    partsDiscountAmount: string;
    servicesDiscountAmount: string;
    discountAmount: string;
    netTotal: string;
    vatAmount: string;
    grossTotal: string;
  };
}

function formatEUR(value: number): string {
  return `${value.toFixed(2)} €`;
}

export function calculateOffer(
  parts: any[],
  serviceActions: any[],
  discountPartsPercent: number,
  discountServicesPercent: number,
): CalculationResult {
    const partsSubtotal = parts.reduce((sum: number, part: any) => {
      const qty = part.quantity || 1;
      const price = part.unitPrice || 0;
      return sum + price * qty;
    }, 0);

    const totalCost = parts.reduce((sum: number, part: any) => {
      if (!part.costPrice) return sum;
      const qty = part.quantity || 1;
      return sum + part.costPrice * qty;
    }, 0);

    const partsWithCost = parts.filter((p: any) => p.costPrice > 0);
    const revenueForCostedParts = partsWithCost.reduce((sum: number, part: any) => {
      return sum + (part.unitPrice || 0) * (part.quantity || 1);
    }, 0);
    const totalProfit = revenueForCostedParts - totalCost;
    const totalProfitMargin = totalCost > 0
      ? (totalProfit / totalCost) * 100
      : null;

    const laborSubtotal = serviceActions.reduce((sum: number, action: any) => {
      if (action.isFixedPrice && action.fixedPriceAmount) {
        return sum + (action.fixedPriceAmount || 0);
      }
      const hours = parseTimeToHours(action.timeRequired || "0");
      const price = action.pricePerHour || 0;
      return sum + hours * price;
    }, 0);

    const totalHours = serviceActions.reduce((sum: number, action: any) => {
      return sum + parseTimeToHours(action.timeRequired || "0");
    }, 0);

    // Discounts applied to subtotals (prices already include VAT)
    const partsDiscountAmount = partsSubtotal * (discountPartsPercent / 100);
    const servicesDiscountAmount =
      laborSubtotal * (discountServicesPercent / 100);
    const totalDiscountAmount = partsDiscountAmount + servicesDiscountAmount;

    // Prices are already with VAT; no separate VAT added
    const subtotal = partsSubtotal + laborSubtotal;
    const grossBeforeDiscount = subtotal;
    const grossTotal = grossBeforeDiscount - totalDiscountAmount;
    const netTotal = grossTotal;
    const vatAmount = 0;

    return {
      partsSubtotal,
      partsCount: parts.length,
      totalCost,
      totalProfit,
      totalProfitMargin,
      laborSubtotal,
      laborCount: serviceActions.length,
      totalHours,
      subtotal,
      partsDiscountAmount,
      servicesDiscountAmount,
      discountAmount: totalDiscountAmount,
      netTotal,
      vatAmount,
      grossTotal,
      formatted: {
        partsSubtotal: formatEUR(partsSubtotal),
        laborSubtotal: formatEUR(laborSubtotal),
        subtotal: formatEUR(subtotal),
        partsDiscountAmount: formatEUR(partsDiscountAmount),
        servicesDiscountAmount: formatEUR(servicesDiscountAmount),
        discountAmount: formatEUR(totalDiscountAmount),
        netTotal: formatEUR(netTotal),
        vatAmount: formatEUR(vatAmount),
        grossTotal: formatEUR(grossTotal),
      },
    };
}

export function useOfferCalculations(
  control: Control<OfferFormData>
): CalculationResult {
  const parts = useWatch({ control, name: "parts" }) || [];
  const serviceActions = useWatch({ control, name: "serviceActions" }) || [];
  const discountPartsPercent =
    useWatch({ control, name: "discountPartsPercent" }) || 0;
  const discountServicesPercent =
    useWatch({ control, name: "discountServicesPercent" }) || 0;

  return useMemo(
    () => calculateOffer(parts, serviceActions, discountPartsPercent, discountServicesPercent),
    [parts, serviceActions, discountPartsPercent, discountServicesPercent]
  );
}
