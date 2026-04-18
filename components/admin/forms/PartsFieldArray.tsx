"use client";

import { useState, useCallback, useEffect, useRef, useMemo, memo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { OfferFormData, PartItemFormData } from "@/lib/schemas/offer";
import { QuantityPopover } from "@/components/admin/shared/QuantityPopover";
import { supabase } from "@/lib/supabase/client";
interface WarehouseSuggestion {
  id: string;
  name: string;
  part_number: string;
  manufacturer: string | null;
  sale_price: number | null;
  cost_price: number | null;
  quantity: number | null;
}

function rankSuggestions(items: WarehouseSuggestion[], term: string, field: "name" | "part_number"): WarehouseSuggestion[] {
  const t = term.toLowerCase();
  const score = (item: WarehouseSuggestion) => {
    const val = (item[field] ?? "").toLowerCase();
    if (val === t) return 0;           // exact
    if (val.startsWith(t)) return 1;   // prefix
    if (val.includes(` ${t}`)) return 2; // word boundary
    return 3;                          // substring anywhere
  };
  return [...items].sort((a, b) => score(a) - score(b));
}

function AddEditPartModal({
  open,
  onOpenChange,
  initialValues,
  editIndex,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: PartItemFormData | null;
  editIndex: number | null;
  onConfirm: (part: PartItemFormData) => void;
}) {
  const t = useTranslations("admin.form");
  const tWh = useTranslations("admin.warehouse.warehouseLookup");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("MERCEDES");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [priceInput, setPriceInput] = useState("0");
  // warehouseCostPrice holds the cost_price from the selected warehouse record;
  // it persists even when the user edits the sale price, so margin/profit stay live.
  const [warehouseCostPrice, setWarehouseCostPrice] = useState<number | null>(null);
  const [error, setError] = useState("");

  // "Добави в склада" state
  const [whExistsState, setWhExistsState] = useState<"unknown" | "exists" | "notExists">("unknown");
  const [showDeliveryPrompt, setShowDeliveryPrompt] = useState(false);
  const [deliveryPriceInput, setDeliveryPriceInput] = useState("0");
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [addingToWarehouse, setAddingToWarehouse] = useState(false);
  const [warehouseSuccess, setWarehouseSuccess] = useState(false);

  // Warehouse lookup state (by part number)
  const [wsSuggestions, setWsSuggestions] = useState<WarehouseSuggestion[]>([]);
  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [wsMatchedPart, setWsMatchedPart] = useState<WarehouseSuggestion | null>(null);
  const pnDropdownRef = useRef<HTMLDivElement>(null);

  // Warehouse lookup state (by name)
  const [wsNameSuggestions, setWsNameSuggestions] = useState<WarehouseSuggestion[]>([]);
  const [wsNameDropdownOpen, setWsNameDropdownOpen] = useState(false);
  const nameDropdownRef = useRef<HTMLDivElement>(null);
  const skipNameSearch = useRef(false);
  const skipPnSearch = useRef(false);

  const reset = useCallback((vals: PartItemFormData | null) => {
    if (vals) {
      setDescription(vals.description);
      setBrand(vals.brand ?? "");
      setPartNumber(vals.partNumber ?? "");
      setQuantity(vals.quantity ?? 1);
      setUnitPrice(vals.unitPrice ?? 0);
      setPriceInput((vals.unitPrice ?? 0).toString());
      setWarehouseCostPrice(vals.costPrice ?? null);
    } else {
      setDescription("");
      setBrand("MERCEDES");
      setPartNumber("");
      setQuantity(1);
      setUnitPrice(0);
      setPriceInput("0");
      setWarehouseCostPrice(null);
    }
    setError("");
    setWsSuggestions([]);
    setWsDropdownOpen(false);
    setWsMatchedPart(null);
    setWsNameSuggestions([]);
    setWsNameDropdownOpen(false);
    setWhExistsState("unknown");
    setShowDeliveryPrompt(false);
    setDeliveryPriceInput("0");
    setDeliveryPrice(0);
    setWarehouseSuccess(false);
    skipNameSearch.current = true;
    skipPnSearch.current = true;
  }, []);

  useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  // Check warehouse existence when part number changes (debounced)
  useEffect(() => {
    const trimmed = partNumber.trim();
    if (!trimmed) {
      setWhExistsState("unknown");
      setWarehouseSuccess(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("warehouse_parts")
          .select("id")
          .eq("part_number", trimmed)
          .maybeSingle();
        setWhExistsState(data ? "exists" : "notExists");
        if (data) setWarehouseSuccess(false);
      } catch {
        setWhExistsState("unknown");
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [partNumber]);

  // Debounced warehouse lookup by part number
  useEffect(() => {
    if (skipPnSearch.current) {
      skipPnSearch.current = false;
      return;
    }
    const term = partNumber.trim();
    if (term.length < 2) {
      setWsSuggestions([]);
      setWsDropdownOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("warehouse_parts")
          .select("id, name, part_number, manufacturer, sale_price, cost_price, quantity")
          .ilike("part_number", `%${term}%`)
          .limit(20);
        if (data && data.length > 0) {
          setWsSuggestions(rankSuggestions(data as WarehouseSuggestion[], term, "part_number"));
          setWsDropdownOpen(true);
        } else {
          setWsSuggestions([]);
          setWsDropdownOpen(false);
        }
      } catch {
        // silently ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [partNumber]);

  // Debounced warehouse lookup by name
  useEffect(() => {
    if (skipNameSearch.current) {
      skipNameSearch.current = false;
      return;
    }
    const term = description.trim();
    if (term.length < 2) {
      setWsNameSuggestions([]);
      setWsNameDropdownOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from("warehouse_parts")
          .select("id, name, part_number, manufacturer, sale_price, cost_price, quantity")
          .ilike("name", `%${term}%`)
          .limit(20);
        if (data && data.length > 0) {
          setWsNameSuggestions(rankSuggestions(data as WarehouseSuggestion[], term, "name"));
          setWsNameDropdownOpen(true);
        } else {
          setWsNameSuggestions([]);
          setWsNameDropdownOpen(false);
        }
      } catch {
        // silently ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [description]);

  // Close dropdowns on outside click
  useEffect(() => {
    if (!wsDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (pnDropdownRef.current && !pnDropdownRef.current.contains(e.target as Node)) {
        setWsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [wsDropdownOpen, pnDropdownRef]);

  useEffect(() => {
    if (!wsNameDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (nameDropdownRef.current && !nameDropdownRef.current.contains(e.target as Node)) {
        setWsNameDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [wsNameDropdownOpen, nameDropdownRef]);

  const handleSelectSuggestion = (match: WarehouseSuggestion) => {
    skipNameSearch.current = true;
    skipPnSearch.current = true;
    setDescription(match.name);
    setBrand(match.manufacturer ?? "");
    setPartNumber(match.part_number ?? "");
    setUnitPrice(match.sale_price ?? 0);
    setPriceInput((match.sale_price ?? 0).toString());
    setWarehouseCostPrice(match.cost_price ?? null);
    setWsMatchedPart(match);
    setWhExistsState("exists");
    setWsDropdownOpen(false);
    setWsNameDropdownOpen(false);
  };

  const handleSelectNameSuggestion = (match: WarehouseSuggestion) => {
    skipNameSearch.current = true;
    skipPnSearch.current = true;
    setDescription(match.name);
    setBrand(match.manufacturer ?? "");
    setPartNumber(match.part_number ?? "");
    setUnitPrice(match.sale_price ?? 0);
    setPriceInput((match.sale_price ?? 0).toString());
    setWarehouseCostPrice(match.cost_price ?? null);
    setWsMatchedPart(match);
    setWhExistsState("exists");
    setWsNameDropdownOpen(false);
    setWsDropdownOpen(false);
  };

  const handleOpen = useCallback(
    (isOpen: boolean) => onOpenChange(isOpen),
    [onOpenChange],
  );

  const handleOk = () => {
    const desc = description.trim();
    if (!desc) {
      setError(t("productNameRequired"));
      return;
    }
    if (quantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }
    if (unitPrice < 0) {
      setError("Price must be positive");
      return;
    }

    const part: PartItemFormData = {
      type: "part",
      description: desc,
      brand: brand || undefined,
      partNumber: partNumber || undefined,
      unitPrice: Number(unitPrice) || 0,
      quantity: Number(quantity) || 1,
      costPrice: warehouseCostPrice ?? undefined,
    };

    onConfirm(part);
    onOpenChange(false);
  };

  const handleAddToWarehouse = async () => {
    if (!showDeliveryPrompt) {
      setShowDeliveryPrompt(true);
      return;
    }
    const trimmedPN = partNumber.trim();
    if (!trimmedPN) return;
    setAddingToWarehouse(true);
    try {
      await supabase.from("warehouse_parts").insert({
        name: description.trim() || trimmedPN,
        part_number: trimmedPN,
        manufacturer: brand || "MERCEDES",
        quantity: 0,
        cost_price: deliveryPrice,
        sale_price: unitPrice,
      } as never);
      setWhExistsState("exists");
      setWarehouseSuccess(true);
      setShowDeliveryPrompt(false);
    } catch {
      // silently ignore
    } finally {
      setAddingToWarehouse(false);
    }
  };

  // Fix #2: live margin/profit — always based on warehouseCostPrice (frozen when part selected)
  // and current unitPrice (updated on every keystroke).
  const liveCost = warehouseCostPrice ?? (wsMatchedPart?.cost_price ?? null);
  const liveMargin = liveCost !== null && liveCost > 0
    ? (((unitPrice - liveCost) / liveCost) * 100).toFixed(1) + "%"
    : liveCost !== null && liveCost === 0
    ? "—"
    : null;
  const liveProfit = liveCost !== null
    ? (unitPrice - liveCost).toFixed(2) + " €"
    : null;

  const wsStockColor = wsMatchedPart
    ? (wsMatchedPart.quantity ?? 0) > 3
      ? "text-green-400"
      : (wsMatchedPart.quantity ?? 0) >= 1
      ? "text-yellow-400"
      : "text-red-400"
    : "";

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md px-6">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editIndex !== null ? t("editPart") : t("addPart")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2" ref={nameDropdownRef}>
            <Label htmlFor="modal-desc" className="text-gray-200">
              {t("productName")} *
            </Label>
            <div className="relative">
              <Input
                id="modal-desc"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setWsMatchedPart(null);
                }}
                onFocus={(e) => {
                  const t = e.target;
                  setTimeout(
                    () => t.setSelectionRange(t.value.length, t.value.length),
                    0,
                  );
                }}
                placeholder={t("productName")}
                className="bg-gray-100 text-gray-900 border-mb-border"
                autoComplete="off"
              />
              {wsNameDropdownOpen && wsNameSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 z-[200] bg-mb-anthracite border border-mb-border rounded-lg shadow-xl overflow-y-auto max-h-60">
                  {wsNameSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectNameSuggestion(s);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-mb-black/60 transition-colors border-b border-mb-border/30 last:border-0"
                    >
                      <div className="text-white text-sm truncate">{s.name}</div>
                      <div className="text-mb-silver text-xs font-mono">{s.part_number}</div>
                      <div className="text-xs text-mb-blue tabular-nums">{(s.sale_price ?? 0).toFixed(2)} €</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-brand" className="text-gray-200">
                {t("brand")}
              </Label>
              <Input
                id="modal-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={t("brand")}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-2" ref={pnDropdownRef}>
              <Label htmlFor="modal-pn" className="text-gray-200">
                {t("partNumber")}
              </Label>
              <div className="relative">
                <Input
                  id="modal-pn"
                  value={partNumber}
                  onChange={(e) => {
                    setPartNumber(e.target.value);
                    setWsMatchedPart(null);
                    setWsNameDropdownOpen(false);
                    setWarehouseSuccess(false);
                    setShowDeliveryPrompt(false);
                  }}
                  placeholder={t("partNumber")}
                  className="bg-gray-100 text-gray-900 border-mb-border"
                  autoComplete="off"
                />
                {wsDropdownOpen && wsSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-[200] bg-mb-anthracite border border-mb-border rounded-lg shadow-xl overflow-y-auto max-h-60">
                    {wsSuggestions.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion(s);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-mb-black/60 transition-colors border-b border-mb-border/30 last:border-0"
                      >
                        <div className="text-white text-sm font-mono">{s.part_number}</div>
                        <div className="text-mb-silver text-xs truncate">{s.name}</div>
                        <div className="text-xs text-mb-blue tabular-nums">{(s.sale_price ?? 0).toFixed(2)} €</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-200">
                {t("qty")} *
              </Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-9 flex items-center justify-center rounded bg-mb-black hover:bg-mb-blue/20 text-white text-lg font-bold border border-mb-border transition-colors shrink-0"
                >
                  −
                </button>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="bg-gray-100 text-gray-900 border-mb-border text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-9 flex items-center justify-center rounded bg-mb-black hover:bg-mb-blue/20 text-white text-lg font-bold border border-mb-border transition-colors shrink-0"
                >
                  +
                </button>
              </div>
              {wsMatchedPart && (
                <div className={`text-xs text-center ${wsStockColor}`}>
                  {tWh("stock")}: {wsMatchedPart.quantity}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-price" className="text-gray-200">
                {t("unitPrice")} *
              </Label>
              <Input
                id="modal-price"
                type="text"
                inputMode="decimal"
                value={priceInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                    setPriceInput(val);
                    const numVal = val.replace(",", ".");
                    setUnitPrice(numVal === "" ? 0 : Number(numVal) || 0);
                  }
                }}
                onBlur={() => {
                  if (priceInput && !isNaN(Number(priceInput.replace(",", ".")))) {
                    setPriceInput(unitPrice.toString());
                  }
                }}
                placeholder="0.00"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
              {/* Fix #2: live margin/profit based on warehouseCostPrice + current unitPrice */}
              {liveCost !== null && (
                <div className="text-xs text-mb-silver space-y-0.5">
                  <div>Доставна цена: {liveCost.toFixed(2)} €</div>
                  <div>
                    Марж: <span className="text-white">{liveMargin}</span>
                    {" / "}
                    Печалба: <span className="text-white">{liveProfit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fix #1: "Добави в склада" button */}
          {partNumber.trim() && (
            <div className="space-y-2">
              {warehouseSuccess ? (
                <p className="text-sm text-green-400">Частта е добавена в склада.</p>
              ) : whExistsState === "exists" ? (
                <p className="text-xs text-mb-silver italic">Вече е в склада</p>
              ) : whExistsState === "notExists" ? (
                <>
                  {showDeliveryPrompt && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="delivery-price" className="text-gray-200 text-xs whitespace-nowrap shrink-0">
                        Доставна цена (€)
                      </Label>
                      <Input
                        id="delivery-price"
                        type="text"
                        inputMode="decimal"
                        value={deliveryPriceInput}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                            setDeliveryPriceInput(val);
                            const n = val.replace(",", ".");
                            setDeliveryPrice(n === "" ? 0 : Number(n) || 0);
                          }
                        }}
                        placeholder="0.00"
                        className="bg-gray-100 text-gray-900 border-mb-border h-8 text-sm"
                      />
                    </div>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    disabled={addingToWarehouse}
                    onClick={handleAddToWarehouse}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    {addingToWarehouse ? "…" : "Добави в склада"}
                  </Button>
                </>
              ) : null}
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleOk}
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          >
            {t("ok")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-red-600 hover:bg-red-700 text-white border-red-600 w-full sm:w-auto"
          >
            {t("cancel")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PartRowProps {
  index: number;
  remove: (index: number) => void;
  openEdit: (index: number) => void;
}

const PartRow = memo(function PartRow({ index, remove, openEdit }: PartRowProps) {
  const t = useTranslations("admin.form");
  const { control, setValue } = useFormContext<OfferFormData>();

  const quantity = useWatch({ control, name: `parts.${index}.quantity` }) ?? 1;
  const unitPrice = useWatch({ control, name: `parts.${index}.unitPrice` }) ?? 0;
  const total = quantity * unitPrice;
  const description = useWatch({ control, name: `parts.${index}.description` }) ?? "";
  const brand = useWatch({ control, name: `parts.${index}.brand` }) ?? "";
  const partNumber = useWatch({ control, name: `parts.${index}.partNumber` }) ?? "";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `part-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid min-w-[860px] grid-cols-[32px_24px_minmax(220px,28rem)_120px_minmax(150px,220px)_60px_130px_120px_80px] gap-3 items-center rounded border border-mb-border bg-mb-anthracite/50 px-2 py-1.5 even:bg-mb-anthracite/30 shrink-0"
    >
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing hover:bg-mb-anthracite rounded text-mb-silver"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </button>
      <div className="text-mb-silver text-sm flex items-center justify-center">
        {index + 1}
      </div>
      <div
        className="text-white text-sm truncate text-left min-w-0"
        title={description}
      >
        {description || "-"}
      </div>
      <div
        className="min-w-0 text-mb-silver text-sm truncate flex items-center justify-center"
        title={brand}
      >
        {brand || "-"}
      </div>
      <div
        className="min-w-0 text-mb-silver text-sm truncate font-mono flex items-center justify-center"
        title={partNumber}
      >
        {partNumber || "-"}
      </div>
      <div className="flex items-center justify-center">
        <QuantityPopover
          value={quantity}
          onChange={(next) =>
            setValue(`parts.${index}.quantity`, next, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          showConfirm={true}
        />
      </div>
      <div className="text-white text-sm tabular-nums flex items-center justify-end">
        {Number(unitPrice).toFixed(2)} €
      </div>
      <div className="text-mb-blue text-sm font-medium tabular-nums flex items-center justify-end shrink-0">
        {total.toFixed(2)} €
      </div>
      <div className="flex items-center gap-1 justify-end shrink-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => openEdit(index)}
          className="h-7 px-2 text-mb-silver hover:text-white hover:bg-mb-anthracite"
          aria-label={t("editPart")}
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
        </Button>
      </div>
    </div>
  );
});

export function PartsFieldArray() {
  const t = useTranslations("admin.form");
  const { control, getValues, setValue } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "parts",
  });

  const sortableItems = useMemo(() => fields.map((_, i) => `part-${i}`), [fields]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<PartItemFormData | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = fields.findIndex((_, i) => `part-${i}` === active.id);
    const newIdx = fields.findIndex((_, i) => `part-${i}` === over.id);
    if (oldIdx !== -1 && newIdx !== -1) move(oldIdx, newIdx);
  };

  const openAdd = () => {
    setEditIndex(null);
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    const p = getValues(`parts.${index}`);
    setEditIndex(index);
    setModalInitial(
      p
        ? {
            type: "part",
            description: p.description ?? "",
            brand: p.brand ?? "",
            partNumber: p.partNumber ?? "",
            unitPrice: Number(p.unitPrice) ?? 0,
            quantity: Number(p.quantity) ?? 1,
          }
        : null,
    );
    setModalOpen(true);
  };

  const handleModalConfirm = (part: PartItemFormData) => {
    if (editIndex !== null) {
      setValue(`parts.${editIndex}`, part, { shouldValidate: true, shouldDirty: true });
    } else {
      append(part);
    }
    setModalOpen(false);
  };

  return (
    <Card className="bg-mb-anthracite border-mb-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          {t("parts")} ({fields.length})
        </CardTitle>
        <Button
          type="button"
          onClick={openAdd}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t("addPart")}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {fields.length === 0 ? (
          <div className="text-center py-6 text-mb-silver text-sm">
            {t("noPartsAdded")}
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto -mx-1 px-1 pb-1">
            <div className="grid min-w-[860px] grid-cols-[32px_24px_minmax(220px,28rem)_120px_minmax(140px,220px)_60px_130px_120px_80px] gap-3 items-center py-1.5 px-2 text-xs font-medium text-mb-silver uppercase tracking-wider border-b border-mb-border mb-1 shrink-0">
              <div />
              <div className="flex items-center justify-center">#</div>
              <div className="flex min-w-0 items-center justify-start leading-tight">
                {t("productName")}
              </div>
              <div className="flex min-w-0 items-center justify-center text-center leading-tight">
                {t("brand")}
              </div>
              <div className="flex min-w-0 items-center justify-center text-center leading-tight">
                {t("partNumber")}
              </div>
              <div className="flex items-center justify-end">{t("qty")}</div>
              <div className="flex items-center justify-end">
                {t("unitPrice")}
              </div>
              <div className="flex items-center justify-end">
                {t("lineTotal")}
              </div>
              <div />
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableItems}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <PartRow
                    key={field.id}
                    index={index}
                    remove={remove}
                    openEdit={openEdit}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </CardContent>

      <AddEditPartModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={modalInitial}
        editIndex={editIndex}
        onConfirm={handleModalConfirm}
      />
    </Card>
  );
}
