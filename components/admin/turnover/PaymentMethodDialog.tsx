"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types/database";

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

interface PaymentMethodDialogProps {
  open: boolean;
  /** Total the customer owes — pre-filled onto the first chosen method. */
  total: number;
  /** Resolves with the split, or null when the user cancels. */
  onConfirm: (splits: PaymentSplit[]) => void;
  onCancel: () => void;
  /** Shown under the title so the user knows which card they are paying. */
  subtitle?: string;
}

const METHODS: { key: PaymentMethod; bg: string; en: string }[] = [
  { key: "cash", bg: "Брой", en: "Cash" },
  { key: "card", bg: "Карта", en: "Card" },
  { key: "bank", bg: "Банка", en: "Bank" },
];

const round2 = (n: number) => Math.round(n * 100) / 100;

export function PaymentMethodDialog({
  open,
  total,
  onConfirm,
  onCancel,
  subtitle,
}: PaymentMethodDialogProps) {
  const isBg = useLocale() === "bg";

  // Single-method mode is the common case; splitting is opt-in.
  const [splitMode, setSplitMode] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [amounts, setAmounts] = useState<Record<PaymentMethod, string>>({
    cash: "",
    card: "",
    bank: "",
  });
  const [error, setError] = useState("");

  // Reset every time the dialog opens so a previous card's split never leaks.
  useEffect(() => {
    if (!open) return;
    setSplitMode(false);
    setMethod("cash");
    setAmounts({ cash: "", card: "", bank: "" });
    setError("");
  }, [open]);

  const parsed = useMemo(() => {
    const toNum = (v: string) => {
      const n = parseFloat(v.replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    return {
      cash: toNum(amounts.cash),
      card: toNum(amounts.card),
      bank: toNum(amounts.bank),
    };
  }, [amounts]);

  const splitTotal = round2(parsed.cash + parsed.card + parsed.bank);
  const remaining = round2(total - splitTotal);

  const handleConfirm = () => {
    if (!splitMode) {
      if (!(total > 0)) {
        setError(
          isBg
            ? "Сумата на картата е нула — добавете позиции преди плащане."
            : "The card total is zero — add items before recording a payment.",
        );
        return;
      }
      onConfirm([{ method, amount: round2(total) }]);
      return;
    }

    const splits = METHODS.map(({ key }) => ({
      method: key,
      amount: round2(parsed[key]),
    })).filter((s) => s.amount > 0);

    if (splits.length === 0) {
      setError(
        isBg ? "Въведете поне една сума." : "Enter at least one amount.",
      );
      return;
    }
    if (Math.abs(remaining) > 0.01) {
      setError(
        isBg
          ? `Сборът (${splitTotal.toFixed(2)} €) не съвпада с общата сума (${total.toFixed(2)} €).`
          : `The split (${splitTotal.toFixed(2)} €) does not match the total (${total.toFixed(2)} €).`,
      );
      return;
    }
    onConfirm(splits);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel();
      }}
    >
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isBg ? "Как е направено плащането?" : "How was the payment made?"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {subtitle && <p className="text-sm text-mb-silver">{subtitle}</p>}

          <div className="flex items-baseline justify-between rounded-lg bg-mb-black px-3 py-2">
            <span className="text-sm text-mb-silver">
              {isBg ? "Обща сума" : "Total"}
            </span>
            <span className="text-lg font-semibold text-white">
              {total.toFixed(2)} €
            </span>
          </div>

          {!splitMode ? (
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMethod(m.key);
                    setError("");
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-sm font-medium transition-colors",
                    method === m.key
                      ? "border-mb-blue bg-mb-blue text-white"
                      : "border-mb-border bg-mb-black text-mb-silver hover:text-white",
                  )}
                >
                  {isBg ? m.bg : m.en}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {METHODS.map((m) => (
                <div key={m.key} className="flex items-center gap-3">
                  <Label className="w-20 shrink-0 text-gray-200">
                    {isBg ? m.bg : m.en}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    inputMode="decimal"
                    value={amounts[m.key]}
                    onChange={(e) => {
                      setAmounts((prev) => ({
                        ...prev,
                        [m.key]: e.target.value,
                      }));
                      setError("");
                    }}
                    placeholder="0.00"
                    className="bg-gray-100 text-gray-900 border-mb-border"
                  />
                </div>
              ))}
              <div className="flex justify-between text-sm">
                <span className="text-mb-silver">
                  {isBg ? "Остатък" : "Remaining"}
                </span>
                <span
                  className={cn(
                    "font-semibold",
                    Math.abs(remaining) < 0.01
                      ? "text-green-400"
                      : "text-amber-400",
                  )}
                >
                  {remaining.toFixed(2)} €
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              const next = !splitMode;
              // Entering split mode: seed the selected method with the total
              // so the common "mostly cash, a bit on card" case is one edit.
              if (next) {
                setAmounts({
                  cash: "",
                  card: "",
                  bank: "",
                  [method]: total > 0 ? total.toFixed(2) : "",
                } as Record<PaymentMethod, string>);
              }
              setSplitMode(next);
              setError("");
            }}
            className="text-sm text-mb-blue hover:underline"
          >
            {splitMode
              ? isBg
                ? "← Единичен начин на плащане"
                : "← Single payment method"
              : isBg
                ? "Раздели плащането по няколко начина"
                : "Split across multiple methods"}
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            {isBg ? "Отказ" : "Cancel"}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-mb-blue hover:bg-mb-blue/90"
          >
            {isBg ? "Потвърди" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
