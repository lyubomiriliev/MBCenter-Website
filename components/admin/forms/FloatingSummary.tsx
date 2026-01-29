"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { useOfferCalculations } from "@/hooks/useOfferCalculations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OfferFormData } from "@/lib/schemas/offer";
import { EUR_TO_BGN } from "@/lib/schemas/offer";

interface FloatingSummaryProps {
  children?: React.ReactNode;
  prepayments?: number[];
  onRemovePrepayment?: (index: number) => void;
}

export function FloatingSummary({ children, prepayments = [], onRemovePrepayment }: FloatingSummaryProps) {
  const t = useTranslations("admin.form");
  const { control, watch } = useFormContext<OfferFormData>();
  const calculations = useOfferCalculations(control);
  const discountPercent = watch("discountPercent") || 0;
  const prepaymentsTotal = prepayments.reduce((a, b) => a + b, 0);
  const amountDueEur = Math.max(0, calculations.grossTotal - prepaymentsTotal);
  const amountDueBgn = amountDueEur * EUR_TO_BGN;

  return (
    <div className="space-y-4">
      <Card className="bg-mb-anthracite border-mb-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg
              className="w-5 h-5 text-mb-blue"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            {t("summary")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Parts Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-mb-silver flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {t("parts")} ({calculations.partsCount})
            </span>
            <span className="text-white">
              {calculations.formatted.partsSubtotal}
            </span>
          </div>

          {/* Labor Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-mb-silver flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {t("labor")} ({calculations.laborCount})
            </span>
            <span className="text-white">
              {calculations.formatted.laborSubtotal}
            </span>
          </div>

          <Separator className="bg-mb-border" />

          {/* Subtotal */}
          <div className="flex justify-between items-center">
            <span className="text-mb-silver">{t("subtotal")}</span>
            <div className="text-right">
              <div className="text-white">
                {calculations.formatted.subtotal}
              </div>
              <div className="text-xs text-mb-silver">
                {calculations.formatted.subtotalBGN}
              </div>
            </div>
          </div>

          {/* Discount */}
          {discountPercent > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-400">
                {t("discount")} ({discountPercent}%)
              </span>
              <div className="text-right text-green-400">
                <div>-{calculations.formatted.discountAmount}</div>
                <div className="text-xs">
                  -{calculations.formatted.discountAmountBGN}
                </div>
              </div>
            </div>
          )}

          {/* Net Total */}
          <div className="flex justify-between items-center">
            <span className="text-mb-silver">{t("netTotal")}</span>
            <div className="text-right">
              <div className="text-white">
                {calculations.formatted.netTotal}
              </div>
              <div className="text-xs text-mb-silver">
                {calculations.formatted.netTotalBGN}
              </div>
            </div>
          </div>

          {/* VAT */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-mb-silver">{t("vat")}</span>
            <div className="text-right">
              <div className="text-white">
                {calculations.formatted.vatAmount}
              </div>
              <div className="text-xs text-mb-silver">
                {calculations.formatted.vatAmountBGN}
              </div>
            </div>
          </div>

          <Separator className="bg-mb-border" />

          {/* Grand Total */}
          <div className="flex justify-between items-center">
            <span className="text-white font-bold text-lg">{t("total")}</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-mb-blue">
                {calculations.formatted.grossTotal}
              </div>
              <div className="text-sm text-mb-silver">
                {calculations.formatted.grossTotalBGN}
              </div>
            </div>
          </div>

          {/* Prepayments */}
          {prepayments.length > 0 && (
            <>
              <Separator className="bg-mb-border" />
              {prepayments.map((amt, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-mb-silver">{t("prepayment")} {i + 1}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-green-400">
                      <div>-€{amt.toFixed(2)}</div>
                      <div className="text-xs">-{(amt * EUR_TO_BGN).toFixed(2)} лв.</div>
                    </div>
                    {onRemovePrepayment && (
                      <button
                        type="button"
                        onClick={() => onRemovePrepayment(i)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/10"
                        aria-label={t("remove")}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="text-white font-bold">{t("amountDue")}</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-mb-blue">
                    €{amountDueEur.toFixed(2)}
                  </div>
                  <div className="text-sm text-mb-silver">
                    {amountDueBgn.toFixed(2)} лв.
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons Section */}
      {children && <div className="space-y-3">{children}</div>}
    </div>
  );
}
