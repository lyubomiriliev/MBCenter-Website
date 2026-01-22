"use client";

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
  arrayMove,
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
import { type OfferFormData } from "@/lib/schemas/offer";

interface PartRowProps {
  index: number;
  onRemove: () => void;
}

function PartRow({ index, onRemove }: PartRowProps) {
  const t = useTranslations("admin.form");
  const { register, watch } = useFormContext<OfferFormData>();

  const quantity = watch(`parts.${index}.quantity`) || 1;
  const unitPrice = watch(`parts.${index}.unitPrice`) || 0;
  const total = quantity * unitPrice;

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
      className="grid grid-cols-12 gap-3 p-4 bg-mb-anthracite/50 rounded border border-mb-border"
    >
      {/* Drag Handle */}
      <div className="col-span-1 flex items-center">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-mb-anthracite rounded"
          {...attributes}
          {...listeners}
        >
          <svg
            className="w-5 h-5 text-mb-silver"
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
      </div>

      {/* Number */}
      <div className="col-span-1 flex items-center">
        <span className="text-white font-medium">{index + 1}</span>
      </div>

      {/* Product Name */}
      <div className="col-span-3">
        <Label htmlFor={`parts.${index}.description`}>{t("productName")}</Label>
        <Input
          {...register(`parts.${index}.description`)}
          placeholder={t("productName")}
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Brand */}
      <div className="col-span-2">
        <Label htmlFor={`parts.${index}.brand`}>{t("brand")}</Label>
        <Input
          {...register(`parts.${index}.brand`)}
          placeholder={t("brand")}
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Part Number */}
      <div className="col-span-2">
        <Label htmlFor={`parts.${index}.partNumber`}>{t("partNumber")}</Label>
        <Input
          {...register(`parts.${index}.partNumber`)}
          placeholder={t("partNumber")}
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-1">
        <Label htmlFor={`parts.${index}.quantity`}>{t("qty")}</Label>
        <Input
          type="number"
          {...register(`parts.${index}.quantity`, { valueAsNumber: true })}
          placeholder="1"
          min="1"
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Unit Price */}
      <div className="col-span-1">
        <Label htmlFor={`parts.${index}.unitPrice`}>{t("unitPrice")}</Label>
        <Input
          type="number"
          step="0.01"
          {...register(`parts.${index}.unitPrice`, { valueAsNumber: true })}
          placeholder="0.00"
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Total (read-only) */}
      <div className="col-span-1">
        <Label>{t("total")}</Label>
        <div className="px-3 py-2 bg-mb-anthracite border border-mb-border rounded text-mb-blue font-medium">
          €{total.toFixed(2)}
        </div>
      </div>

      {/* Remove button */}
      <div className="col-span-12 flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="border-red-500 text-red-500 hover:bg-red-500/10"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          {t("remove")}
        </Button>
      </div>
    </div>
  );
}

export function PartsFieldArray() {
  const t = useTranslations("admin.form");
  const { control } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "parts",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex(
        (field) => `part-${fields.indexOf(field)}` === active.id
      );
      const newIndex = fields.findIndex(
        (field) => `part-${fields.indexOf(field)}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const addPart = () => {
    append({
      type: "part" as const,
      description: "",
      brand: "",
      partNumber: "",
      unitPrice: 0,
      quantity: 1,
    });
  };

  return (
    <Card className="bg-mb-anthracite border-mb-border">
      <CardHeader className="flex flex-row items-center justify-between">
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
          onClick={addPart}
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
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-mb-silver">
            {t("noPartsAdded")}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((_, index) => `part-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <PartRow
                  key={field.id}
                  index={index}
                  onRemove={() => remove(index)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}


