"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useFormContext, useWatch } from "react-hook-form";
import { calculateOffer } from "@/hooks/useOfferCalculations";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { OfferFormData } from "@/lib/schemas/offer";
import { EUR_TO_BGN } from "@/lib/schemas/offer";

interface FloatingSummaryProps {
  children?: React.ReactNode;
  prepayments?: number[];
  onRemovePrepayment?: (index: number) => void;
}

export function FloatingSummary({
  children,
  prepayments = [],
  onRemovePrepayment,
}: FloatingSummaryProps) {
  const t = useTranslations("admin.form");
  const { profile } = useSupabaseAuthContext();
  const isAdmin = profile?.role === "admin";
  const { control } = useFormContext<OfferFormData>();
  const rawParts = useWatch({ control, name: "parts" });
  const rawServiceActions = useWatch({ control, name: "serviceActions" });
  const discountPartsPercent = useWatch({ control, name: "discountPartsPercent" }) || 0;
  const discountServicesPercent = useWatch({ control, name: "discountServicesPercent" }) || 0;
  const calculations = useMemo(
    () => calculateOffer(rawParts || [], rawServiceActions || [], discountPartsPercent, discountServicesPercent),
    [rawParts, rawServiceActions, discountPartsPercent, discountServicesPercent]
  );
  const prepaymentsTotal = prepayments.reduce((a, b) => a + b, 0);
  const amountDueEur = Math.max(0, calculations.grossTotal - prepaymentsTotal);
  const amountDueBgn = amountDueEur * EUR_TO_BGN;

  return (
    <div className="space-y-4 mr-0 lg:mr-6 lg:fixed lg:top-30 rounded-lg lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:z-10">
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
              {calculations.formatted.partsSubtotal}{" "}
              <span className="text-mb-silver text-xs">({t("inclVat")})</span>
            </span>
          </div>

          {/* Labor Subtotal */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-mb-silver flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {t("labor")} ({calculations.laborCount})
            </span>
            <span className="text-white">
              {calculations.formatted.laborSubtotal}{" "}
              <span className="text-mb-silver text-xs">({t("inclVat")})</span>
            </span>
          </div>

          {/* Total Time (hours) */}
          {calculations.totalHours > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-mb-silver flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                {t("time")}
              </span>
              <span className="text-white">
                {(() => {
                  const h = Math.floor(calculations.totalHours);
                  const m = Math.round((calculations.totalHours - h) * 60);
                  return `${h.toString().padStart(2, "0")}ч ${m.toString().padStart(2, "0")}мин`;
                })()}
              </span>
            </div>
          )}

          {/* Parts Discount */}
          {discountPartsPercent > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-400">
                {t("discountParts")} ({discountPartsPercent}%)
              </span>
              <div className="text-right text-green-400">
                <div>-{calculations.formatted.partsDiscountAmount}</div>
                <div className="text-xs">
                  -{calculations.formatted.partsDiscountAmountBGN}
                </div>
              </div>
            </div>
          )}

          {/* Services Discount */}
          {discountServicesPercent > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-green-400">
                {t("discountServices")} ({discountServicesPercent}%)
              </span>
              <div className="text-right text-green-400">
                <div>-{calculations.formatted.servicesDiscountAmount}</div>
                <div className="text-xs">
                  -{calculations.formatted.servicesDiscountAmountBGN}
                </div>
              </div>
            </div>
          )}

          <Separator className="bg-mb-border" />

          {/* VAT Breakdown (20% of total) */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-mb-silver">СТАВКА {t("vat")} (20%)</span>
            <div className="text-right text-mb-silver">
              <div>{(calculations.grossTotal / 6).toFixed(2)} €</div>
              <div className="text-xs">
                {((calculations.grossTotal / 6) * EUR_TO_BGN).toFixed(2)} лв.
              </div>
            </div>
          </div>

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

          {/* Delivery cost + profit rows for parts with known cost — admin only */}
          {isAdmin && calculations.totalCost > 0 && (
            <>
              <div className="flex justify-between items-center text-sm pt-1 border-t border-mb-border/40">
                <span className="text-mb-silver">Доставна цена на части</span>
                <div className="text-right">
                  <div className="text-white">{calculations.totalCost.toFixed(2)} €</div>
                  <div className="text-xs text-mb-silver">{(calculations.totalCost * EUR_TO_BGN).toFixed(2)} лв.</div>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-mb-silver">
                  Печалба от части
                  {calculations.totalProfitMargin !== null && (
                    <span className="ml-1 text-xs text-green-400">
                      ({calculations.totalProfitMargin.toFixed(1)}%)
                    </span>
                  )}
                </span>
                <div className="text-right">
                  <div className={calculations.totalProfit >= 0 ? "text-green-400 font-medium" : "text-red-400 font-medium"}>
                    {calculations.totalProfit >= 0 ? "+" : ""}{calculations.totalProfit.toFixed(2)} €
                  </div>
                  <div className="text-xs text-mb-silver">
                    {(calculations.totalProfit * EUR_TO_BGN).toFixed(2)} лв.
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Prepayments */}
          {prepayments.length > 0 && (
            <>
              <Separator className="bg-mb-border" />
              {prepayments.map((amt, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-mb-silver">{t("prepayment")}</span>
                  <div className="flex items-center gap-2">
                    <div className="text-right text-green-400">
                      <div>-{amt.toFixed(2)} €</div>
                      <div className="text-xs">
                        -{(amt * EUR_TO_BGN).toFixed(2)} лв.
                      </div>
                    </div>
                    {onRemovePrepayment && (
                      <button
                        type="button"
                        onClick={() => onRemovePrepayment(i)}
                        className="p-1 rounded text-red-400 hover:bg-red-500/10"
                        aria-label={t("remove")}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
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
                    {amountDueEur.toFixed(2)} €
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

      {children && <div className="space-y-3">{children}</div>}
    </div>
  );
}
