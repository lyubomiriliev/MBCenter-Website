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
import type { OfferFormData, ServiceActionFormData } from "@/lib/schemas/offer";
import { parseTimeToHours } from "@/lib/utils";

function AddEditServiceActionModal({
  open,
  onOpenChange,
  initialValues,
  editIndex,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues: ServiceActionFormData | null;
  editIndex: number | null;
  onConfirm: (action: ServiceActionFormData) => void;
}) {
  const t = useTranslations("admin.form");
  const [actionName, setActionName] = useState("");
  const [timeInput, setTimeInput] = useState("1");
  const [pricePerHour, setPricePerHour] = useState(65);
  const [priceInput, setPriceInput] = useState("65");
  const [error, setError] = useState("");

  const reset = useCallback((vals: ServiceActionFormData | null) => {
    if (vals) {
      setActionName(vals.actionName);
      setTimeInput(vals.timeRequired ?? "1");
      const price = vals.pricePerHour ?? 65;
      setPricePerHour(price);
      setPriceInput(price.toString());
    } else {
      setActionName("");
      setTimeInput("1");
      setPricePerHour(65);
      setPriceInput("65");
    }
    setError("");
  }, []);

  useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  const handleOpen = useCallback(
    (isOpen: boolean) => onOpenChange(isOpen),
    [onOpenChange]
  );

  const handleOk = () => {
    const name = actionName.trim();
    if (!name) {
      setError(t("serviceActionNameRequired"));
      return;
    }
    if (pricePerHour < 0) {
      setError("Price per hour must be positive");
      return;
    }
    const parsedHours = parseTimeToHours(timeInput);
    if (parsedHours <= 0) {
      setError("Time must be greater than 0");
      return;
    }
    onConfirm({
      actionName: name,
      timeRequired: timeInput.trim(),
      pricePerHour: Number(pricePerHour) || 0,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editIndex !== null ? t("editServiceAction") : t("addServiceAction")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="modal-action-name" className="text-gray-200">
              {t("serviceActionName")} *
            </Label>
            <Input
              id="modal-action-name"
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              placeholder={t("serviceActionName")}
              className="bg-gray-100 text-gray-900 border-mb-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-time" className="text-gray-200">
              {t("timeRequired")}
            </Label>
            <Input
              id="modal-time"
              type="text"
              value={timeInput}
              onChange={(e) => {
                const val = e.target.value;
                // Allow format: 1, 1:30, 0:10, etc
                if (val === '' || /^[0-9]*:?[0-9]*$/.test(val)) {
                  setTimeInput(val);
                }
              }}
              placeholder="1:30"
              className="bg-gray-100 text-gray-900 border-mb-border"
            />
            <p className="text-xs text-mb-silver">{t("timeFormatExamples")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="modal-price-hr" className="text-gray-200">
              {t("pricePerHour")} *
            </Label>
            <Input
              id="modal-price-hr"
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => {
                const val = e.target.value;
                // Allow only digits, dot, and comma
                if (val === '' || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                  setPriceInput(val);
                  const numVal = val.replace(',', '.');
                  setPricePerHour(numVal === '' ? 0 : Number(numVal) || 0);
                }
              }}
              onBlur={() => {
                // Format on blur
                if (priceInput && !isNaN(Number(priceInput.replace(',', '.')))) {
                  setPriceInput(pricePerHour.toString());
                }
              }}
              placeholder="0.00"
              className="bg-gray-100 text-gray-900 border-mb-border"
            />
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
          <Button type="button" onClick={handleOk} className="bg-green-500 hover:bg-green-600">
            {t("ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceActionRowProps {
  index: number;
  onRemove: () => void;
  onEdit: () => void;
}

function ServiceActionRow({ index, onRemove, onEdit }: ServiceActionRowProps) {
  const t = useTranslations("admin.form");
  const { watch } = useFormContext<OfferFormData>();

  const timeRequired = watch(`serviceActions.${index}.timeRequired`) ?? "";
  const pricePerHour = watch(`serviceActions.${index}.pricePerHour`) ?? 0;
  const actionName = watch(`serviceActions.${index}.actionName`) ?? "";
  const totalHours = parseTimeToHours(timeRequired);
  const total = totalHours * pricePerHour;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `service-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_32px_1fr_80px_350px_60px_auto] gap-3 items-center py-1.5 px-2 rounded border border-mb-border bg-mb-anthracite/50 even:bg-mb-anthracite/30 min-w-[560px]"
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
      <div className="text-white text-sm truncate text-left" title={actionName}>
        {actionName || "—"}
      </div>
      <div className="text-mb-silver text-sm flex items-center justify-center" title={timeRequired}>
        {timeRequired || "—"}
      </div>
      <div className="text-white text-sm tabular-nums flex items-center justify-center">€{Number(pricePerHour).toFixed(2)}</div>
      <div className="text-green-400 text-sm font-medium tabular-nums flex items-center justify-center">€{total.toFixed(2)}</div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="h-7 px-2 text-mb-silver hover:text-white hover:bg-mb-anthracite"
          aria-label={t("editServiceAction")}
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

export function ServiceActionsFieldArray() {
  const t = useTranslations("admin.form");
  const { control, getValues, setValue } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "serviceActions" });

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<ServiceActionFormData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = fields.findIndex((_, i) => `service-${i}` === active.id);
    const newIdx = fields.findIndex((_, i) => `service-${i}` === over.id);
    if (oldIdx !== -1 && newIdx !== -1) move(oldIdx, newIdx);
  };

  const openAdd = () => {
    setEditIndex(null);
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    const a = getValues(`serviceActions.${index}`);
    setEditIndex(index);
    setModalInitial(
      a
        ? {
            actionName: a.actionName ?? "",
            timeRequired: a.timeRequired ?? "",
            pricePerHour: Number(a.pricePerHour) ?? 0,
          }
        : null
    );
    setModalOpen(true);
  };

  const handleModalConfirm = (action: ServiceActionFormData) => {
    if (editIndex !== null) {
      setValue(`serviceActions.${editIndex}`, action, { shouldValidate: true });
    } else {
      append(action);
    }
    setModalOpen(false);
  };

  return (
    <Card className="bg-mb-anthracite border-mb-border">
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t("serviceActions")} ({fields.length})
        </CardTitle>
        <Button type="button" onClick={openAdd} size="sm" className="bg-green-500 hover:bg-green-600">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addServiceAction")}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {fields.length === 0 ? (
          <div className="text-center py-6 text-mb-silver text-sm">{t("noServiceActionsAdded")}</div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1 min-w-0">
            <div className="grid grid-cols-[auto_32px_1fr_200px_200px_200px_auto] gap-3 items-center py-1.5 px-2 text-xs font-medium text-mb-silver uppercase tracking-wider border-b border-mb-border mb-1 min-w-[560px]">
              <div />
              <div className="flex items-center justify-center">#</div>
              <div className="flex items-center justify-start">{t("serviceActionName")}</div>
              <div className="flex items-center justify-center">{t("timeRequired")}</div>
              <div className="flex items-center justify-center">{t("pricePerHour")}</div>
              <div className="flex items-center justify-center">{t("total")}</div>
              <div />
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={fields.map((_, i) => `service-${i}`)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <ServiceActionRow
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

      <AddEditServiceActionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={modalInitial}
        editIndex={editIndex}
        onConfirm={handleModalConfirm}
      />
    </Card>
  );
}
