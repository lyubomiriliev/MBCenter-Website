"use client";

import { useState, useCallback, useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
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
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [priceInput, setPriceInput] = useState("0");
  const [error, setError] = useState("");

  const reset = useCallback(
    (vals: PartItemFormData | null) => {
      if (vals) {
        setDescription(vals.description);
        setBrand(vals.brand ?? "");
        setPartNumber(vals.partNumber ?? "");
        setQuantity(vals.quantity ?? 1);
        setUnitPrice(vals.unitPrice ?? 0);
      } else {
        setDescription("");
        setBrand("");
        setPartNumber("");
        setQuantity(1);
        setUnitPrice(0);
      }
      setError("");
    },
    []
  );

  useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  const handleOpen = useCallback(
    (isOpen: boolean) => onOpenChange(isOpen),
    [onOpenChange]
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
    onConfirm({
      type: "part",
      description: desc,
      brand: brand || undefined,
      partNumber: partNumber || undefined,
      unitPrice: Number(unitPrice) || 0,
      quantity: Number(quantity) || 1,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editIndex !== null ? t("editPart") : t("addPart")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="modal-desc" className="text-gray-200">
              {t("productName")} *
            </Label>
            <Input
              id="modal-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("productName")}
              className="bg-gray-100 text-gray-900 border-mb-border"
            />
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
            <div className="space-y-2">
              <Label htmlFor="modal-pn" className="text-gray-200">
                {t("partNumber")}
              </Label>
              <Input
                id="modal-pn"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder={t("partNumber")}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-qty" className="text-gray-200">
                {t("qty")} *
              </Label>
              <Input
                id="modal-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
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
                  // Allow only digits, dot, and comma
                  if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                    setPriceInput(val);
                    const numVal = val.replace(',', '.');
                    setUnitPrice(numVal === '' ? 0 : Number(numVal) || 0);
                  }
                }}
                onBlur={() => {
                  // Format on blur
                  if (priceInput && !isNaN(Number(priceInput.replace(',', '.')))) {
                    setPriceInput(unitPrice.toString());
                  }
                }}
                placeholder="0.00"
                className="bg-gray-100 text-gray-900 border-mb-border"
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-red-500 hover:bg-red-600 text-white border-red-500"
          >
            {t("cancel")}
          </Button>
          <Button type="button" onClick={handleOk} className="bg-blue-500 hover:bg-blue-600">
            {t("ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface PartRowProps {
  index: number;
  onRemove: () => void;
  onEdit: () => void;
}

function PartRow({ index, onRemove, onEdit }: PartRowProps) {
  const t = useTranslations("admin.form");
  const { watch } = useFormContext<OfferFormData>();

  const quantity = watch(`parts.${index}.quantity`) ?? 1;
  const unitPrice = watch(`parts.${index}.unitPrice`) ?? 0;
  const total = quantity * unitPrice;
  const description = watch(`parts.${index}.description`) ?? "";
  const brand = watch(`parts.${index}.brand`) ?? "";
  const partNumber = watch(`parts.${index}.partNumber`) ?? "";

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
      className="grid grid-cols-[auto_32px_1fr_120px_250px_90px_120px_60px_auto] gap-3 items-center py-1.5 px-2 rounded border border-mb-border bg-mb-anthracite/50 even:bg-mb-anthracite/30 min-w-[640px]"
    >
      <button
        type="button"
        className="p-1 cursor-grab active:cursor-grabbing hover:bg-mb-anthracite rounded text-mb-silver"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </button>
      <div className="text-mb-silver text-sm flex items-center justify-center">{index + 1}</div>
      <div className="text-white text-sm truncate text-left" title={description}>
        {description || "—"}
      </div>
      <div className="text-mb-silver text-sm truncate flex items-center justify-center" title={brand}>
        {brand || "—"}
      </div>
      <div className="text-mb-silver text-sm truncate font-mono flex items-center justify-center" title={partNumber}>
        {partNumber || "—"}
      </div>
      <div className="text-white text-sm tabular-nums flex items-center justify-center">{quantity}</div>
      <div className="text-white text-sm tabular-nums flex items-center justify-center">€{Number(unitPrice).toFixed(2)}</div>
      <div className="text-mb-blue text-sm font-medium tabular-nums flex items-center justify-center">€{total.toFixed(2)}</div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2 text-mb-silver hover:text-white hover:bg-mb-anthracite"
          aria-label={t("editPart")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          aria-label={t("remove")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </div>
  );
}

export function PartsFieldArray() {
  const t = useTranslations("admin.form");
  const { control, getValues, setValue } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "parts" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<PartItemFormData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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
        : null
    );
    setModalOpen(true);
  };

  const handleModalConfirm = (part: PartItemFormData) => {
    if (editIndex !== null) {
      setValue(`parts.${editIndex}`, part, { shouldValidate: true });
    } else {
      append(part);
    }
    setModalOpen(false);
  };

  return (
    <Card className="bg-mb-anthracite border-mb-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          {t("parts")} ({fields.length})
        </CardTitle>
        <Button type="button" onClick={openAdd} size="sm" className="bg-blue-500 hover:bg-blue-600">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addPart")}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {fields.length === 0 ? (
          <div className="text-center py-6 text-mb-silver text-sm">{t("noPartsAdded")}</div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1 min-w-0">
            <div className="grid grid-cols-[auto_32px_1fr_200px_200px_150px_120px_90px_auto] gap-3 items-center py-1.5 px-2 text-xs font-medium text-mb-silver uppercase tracking-wider border-b border-mb-border mb-1 min-w-[640px]">
              <div />
              <div className="flex items-center justify-center">#</div>
              <div className="flex items-center justify-start">{t("productName")}</div>
              <div className="flex items-center justify-center">{t("brand")}</div>
              <div className="flex items-center justify-center">{t("partNumber")}</div>
              <div className="flex items-center justify-center">{t("qty")}</div>
              <div className="flex items-center justify-center">{t("unitPrice")}</div>
              <div className="flex items-center justify-center">{t("total")}</div>
              <div />
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={fields.map((_, i) => `part-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <PartRow
                    key={field.id}
                    index={index}
                    onRemove={() => remove(index)}
                    onEdit={() => openEdit(index)}
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
