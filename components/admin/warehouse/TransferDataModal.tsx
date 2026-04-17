"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

interface OfferSuggestion {
  id: string;
  offer_number: string;
  car_model_text: string | null;
  customer_name: string | null;
}

interface TransferDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceOfferId: string;
  sourceOfferNumber: string;
  onSuccess?: (targetOfferNumber: string) => void;
}

export function TransferDataModal({
  open,
  onOpenChange,
  sourceOfferId,
  sourceOfferNumber,
  onSuccess,
}: TransferDataModalProps) {
  const t = useTranslations("admin.warehouse.transfer");
  const router = useRouter();
  const locale = useLocale();

  const [offers, setOffers] = useState<OfferSuggestion[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setSelectedId("");
      setQuery("");
      setIsOpen(false);
      setError("");
      return;
    }
    setIsLoading(true);
    supabase
      .from("offers")
      .select("id, offer_number, car_model_text, customer_name")
      .neq("id", sourceOfferId)
      .order("customer_name", { ascending: true, nullsFirst: false })
      .limit(200)
      .then(({ data }) => {
        setOffers((data as OfferSuggestion[]) ?? []);
        setIsLoading(false);
      });
  }, [open, sourceOfferId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !inputRef.current?.parentElement?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const filtered = query.trim()
    ? offers.filter((o) => {
        const q = query.toLowerCase();
        return (
          o.offer_number.toLowerCase().includes(q) ||
          (o.car_model_text ?? "").toLowerCase().includes(q) ||
          (o.customer_name ?? "").toLowerCase().includes(q)
        );
      })
    : offers;

  const selectedOffer = offers.find((o) => o.id === selectedId) ?? null;

  const handleSelect = (offer: OfferSuggestion) => {
    setSelectedId(offer.id);
    setQuery("");
    setIsOpen(false);
  };

  const handleTransfer = async () => {
    if (!selectedId) return;
    const resolved = offers.find((o) => o.id === selectedId);
    if (!resolved) return;

    setIsTransferring(true);
    setError("");

    try {
      const targetId = resolved.id;

      const [itemsRes, actionsRes] = await Promise.all([
        supabase
          .from("offer_items")
          .select("type, description, brand, part_number, unit_price, quantity, total, sort_order")
          .eq("offer_id", sourceOfferId)
          .order("sort_order"),
        supabase
          .from("service_actions")
          .select("action_name, time_required_text, price_per_hour_eur_net, total_eur_net, is_fixed_price, fixed_price_amount, sort_order")
          .eq("offer_id", sourceOfferId)
          .order("sort_order"),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (actionsRes.error) throw actionsRes.error;

      const [targetItemsRes, targetActionsRes] = await Promise.all([
        supabase
          .from("offer_items")
          .select("sort_order")
          .eq("offer_id", targetId)
          .order("sort_order", { ascending: false })
          .limit(1),
        supabase
          .from("service_actions")
          .select("sort_order")
          .eq("offer_id", targetId)
          .order("sort_order", { ascending: false })
          .limit(1),
      ]);

      const baseItemOrder = ((targetItemsRes.data as { sort_order: number }[] | null)?.[0]?.sort_order ?? -1) + 1;
      const baseActionOrder = ((targetActionsRes.data as { sort_order: number }[] | null)?.[0]?.sort_order ?? -1) + 1;

      if (itemsRes.data && itemsRes.data.length > 0) {
        const newItems = itemsRes.data.map((item, i) => ({
          offer_id: targetId,
          type: item.type,
          description: item.description,
          brand: item.brand,
          part_number: item.part_number,
          unit_price: item.unit_price,
          quantity: item.quantity,
          total: item.total,
          sort_order: baseItemOrder + i,
        }));
        const { error: itemsErr } = await supabase.from("offer_items").insert(newItems);
        if (itemsErr) throw itemsErr;
      }

      if (actionsRes.data && actionsRes.data.length > 0) {
        const newActions = actionsRes.data.map((action, i) => ({
          offer_id: targetId,
          action_name: action.action_name,
          time_required_text: action.time_required_text,
          price_per_hour_eur_net: action.price_per_hour_eur_net,
          total_eur_net: action.total_eur_net,
          is_fixed_price: action.is_fixed_price,
          fixed_price_amount: action.fixed_price_amount,
          sort_order: baseActionOrder + i,
        }));
        const { error: actionsErr } = await supabase.from("service_actions").insert(newActions);
        if (actionsErr) throw actionsErr;
      }

      onOpenChange(false);
      onSuccess?.(resolved.offer_number);
      router.push(`/${locale}/mb-admin/offers/edit?id=${targetId}`);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md px-6">
        <DialogHeader>
          <DialogTitle className="text-white">{t("title")}</DialogTitle>
          <p className="text-mb-silver text-sm">{t("subtitle")}</p>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label className="text-gray-200">{t("offerNumber")}</Label>

            {/* Combobox */}
            <div className="relative">
              <div
                className="flex items-center bg-gray-100 border border-mb-border rounded-md px-3 h-10 cursor-text"
                onClick={() => {
                  setIsOpen(true);
                  inputRef.current?.focus();
                }}
              >
                {!isOpen && selectedOffer ? (
                  <span className="text-gray-900 text-sm truncate flex-1">
                    <span className="font-mono font-medium">{selectedOffer.offer_number}</span>
                    {(selectedOffer.car_model_text || selectedOffer.customer_name) && (
                      <span className="text-gray-500 ml-2 text-xs">
                        {[selectedOffer.car_model_text, selectedOffer.customer_name].filter(Boolean).join(" — ")}
                      </span>
                    )}
                  </span>
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    placeholder={isLoading ? "Зареждане..." : t("offerNumberPlaceholder")}
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-gray-900 text-sm outline-none placeholder:text-gray-400 min-w-0"
                  />
                )}
                <svg
                  className={`w-4 h-4 text-gray-500 shrink-0 ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isOpen && (
                <div
                  ref={listRef}
                  className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-64 overflow-y-auto"
                >
                  {filtered.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">
                      {query ? "Няма намерени оферти" : "Няма оферти"}
                    </div>
                  ) : (
                    filtered.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(o)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center gap-2 ${
                          selectedId === o.id ? "bg-gray-100" : ""
                        }`}
                      >
                        <span className="font-mono font-medium text-gray-900">{o.offer_number}</span>
                        {(o.car_model_text || o.customer_name) && (
                          <span className="text-gray-500 text-xs truncate">
                            {[o.car_model_text, o.customer_name].filter(Boolean).join(" — ")}
                          </span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedOffer && (
            <div className="rounded-lg bg-mb-black/50 border border-mb-border px-4 py-2 text-sm">
              <span className="text-mb-silver">Оферта #</span>
              <span className="text-white font-mono">{selectedOffer.offer_number}</span>
              {selectedOffer.car_model_text && (
                <span className="text-mb-silver"> — {selectedOffer.car_model_text}</span>
              )}
              {selectedOffer.customer_name && (
                <span className="text-mb-silver"> — {selectedOffer.customer_name}</span>
              )}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedId || isTransferring}
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          >
            {isTransferring ? t("transferring") : t("confirmButton")}
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
