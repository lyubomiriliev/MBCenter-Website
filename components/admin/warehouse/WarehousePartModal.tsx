"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WarehousePart } from "@/types/database";
import type { WarehousePartFormData } from "@/lib/schemas/warehouse";

interface WarehousePartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: WarehousePart | null;
  onConfirm: (data: WarehousePartFormData) => void;
}

export function WarehousePartModal({
  open,
  onOpenChange,
  initialValues,
  onConfirm,
}: WarehousePartModalProps) {
  const t = useTranslations("admin.warehouse");

  const [name, setName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [manufacturer, setManufacturer] = useState("MERCEDES");
  const [quantity, setQuantity] = useState(0);
  const [costPrice, setCostPrice] = useState(0);
  const [costPriceInput, setCostPriceInput] = useState("");
  const [salePrice, setSalePrice] = useState(0);
  const [salePriceInput, setSalePriceInput] = useState("");
  const [replacedBy, setReplacedBy] = useState("");
  const [error, setError] = useState("");

  const reset = useCallback((vals: WarehousePart | null) => {
    if (vals) {
      setName(vals.name);
      setPartNumber(vals.part_number);
      setManufacturer(vals.manufacturer);
      setQuantity(vals.quantity);
      setCostPrice(vals.cost_price);
      setCostPriceInput(vals.cost_price !== 0 ? vals.cost_price.toString() : "");
      setSalePrice(vals.sale_price);
      setSalePriceInput(vals.sale_price !== 0 ? vals.sale_price.toString() : "");
      setReplacedBy(vals.replaced_by ?? "");
    } else {
      setName("");
      setPartNumber("");
      setManufacturer("MERCEDES");
      setQuantity(0);
      setCostPrice(0);
      setCostPriceInput("");
      setSalePrice(0);
      setSalePriceInput("");
      setReplacedBy("");
    }
    setError("");
  }, []);

  useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  const margin =
    costPrice === 0
      ? "—"
      : ((salePrice - costPrice) / costPrice * 100).toFixed(1) + "%";
  const profit = (salePrice - costPrice).toFixed(2) + " €";

  const handleOk = () => {
    const trimmedName = name.trim();
    const trimmedPartNumber = partNumber.trim();

    if (!trimmedName) {
      setError(t("errors.nameRequired"));
      return;
    }
    if (!trimmedPartNumber) {
      setError(t("errors.partNumberRequired"));
      return;
    }
    if (quantity < 0) {
      setError(t("errors.quantityInvalid"));
      return;
    }
    if (costPrice < 0 || salePrice < 0) {
      setError(t("errors.priceInvalid"));
      return;
    }

    onConfirm({
      name: trimmedName,
      part_number: trimmedPartNumber,
      manufacturer: manufacturer || "MERCEDES",
      quantity,
      cost_price: costPrice,
      sale_price: salePrice,
      replaced_by: replacedBy.trim() || undefined,
    });
    onOpenChange(false);
  };

  const handlePriceChange = (
    val: string,
    setInput: (v: string) => void,
    setNum: (v: number) => void
  ) => {
    if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
      setInput(val);
      const numVal = val.replace(",", ".");
      setNum(numVal === "" ? 0 : Number(numVal) || 0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md px-6">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initialValues ? t("editPart") : t("addPart")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Name — full width */}
          <div className="space-y-2">
            <Label htmlFor="wh-name" className="text-gray-200">
              {t("fields.name")} *
            </Label>
            <Input
              id="wh-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("fields.name")}
              className="bg-gray-100 text-gray-900 border-mb-border"
            />
          </div>

          {/* Part Number | Replaced By */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wh-pn" className="text-gray-200">
                {t("fields.partNumber")} *
              </Label>
              <Input
                id="wh-pn"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder={t("fields.partNumber")}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-rb" className="text-gray-200">
                {t("fields.replacedBy")}
              </Label>
              <Input
                id="wh-rb"
                value={replacedBy}
                onChange={(e) => setReplacedBy(e.target.value)}
                placeholder={t("fields.replacedByPlaceholder")}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
          </div>

          {/* Manufacturer | Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wh-mfr" className="text-gray-200">
                {t("fields.manufacturer")}
              </Label>
              <Input
                id="wh-mfr"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="MERCEDES"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-200">{t("fields.quantity")}</Label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(0, q - 1))}
                  className="w-8 h-9 flex items-center justify-center rounded bg-mb-black hover:bg-mb-blue/20 text-white text-lg font-bold border border-mb-border transition-colors shrink-0"
                >
                  −
                </button>
                <Input
                  type="number"
                  min={0}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))}
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
            </div>
          </div>

          {/* Cost Price & Sale Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="wh-cost" className="text-gray-200">
                {t("fields.costPrice")} (€)
              </Label>
              <Input
                id="wh-cost"
                type="text"
                inputMode="decimal"
                value={costPriceInput}
                onChange={(e) =>
                  handlePriceChange(e.target.value, setCostPriceInput, setCostPrice)
                }
                onBlur={() => { if (costPriceInput !== "" && costPrice !== 0) setCostPriceInput(costPrice.toString()); }}
                placeholder="0.00"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wh-sale" className="text-gray-200">
                {t("fields.salePrice")} (€)
              </Label>
              <Input
                id="wh-sale"
                type="text"
                inputMode="decimal"
                value={salePriceInput}
                onChange={(e) =>
                  handlePriceChange(e.target.value, setSalePriceInput, setSalePrice)
                }
                onBlur={() => { if (salePriceInput !== "" && salePrice !== 0) setSalePriceInput(salePrice.toString()); }}
                placeholder="0.00"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
          </div>

          {/* Live margin/profit */}
          <div className="flex items-center gap-4 rounded-lg bg-mb-black/50 border border-mb-border px-4 py-2 text-sm">
            <div className="flex-1">
              <span className="text-mb-silver">{t("fields.margin")}: </span>
              <span className="text-white font-medium tabular-nums">{margin}</span>
            </div>
            <div className="flex-1">
              <span className="text-mb-silver">{t("fields.profit")}: </span>
              <span className="text-white font-medium tabular-nums">{profit}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleOk}
            className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
          >
            {t("confirm")}
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
