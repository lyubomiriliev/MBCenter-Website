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

interface ServiceActionRowProps {
  index: number;
  onRemove: () => void;
}

function ServiceActionRow({ index, onRemove }: ServiceActionRowProps) {
  const t = useTranslations("admin.form");
  const { register, watch } = useFormContext<OfferFormData>();
  
  // Parse time to calculate total
  const timeRequired = watch(`serviceActions.${index}.timeRequired`) || "0h 0min";
  const pricePerHour = watch(`serviceActions.${index}.pricePerHour`) || 0;
  
  // Parse time string like "2h 20min" to decimal hours
  const parseTime = (timeStr: string): number => {
    const hourMatch = timeStr.match(/(\d+)h/);
    const minMatch = timeStr.match(/(\d+)min/);
    
    const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    
    return hours + (minutes / 60);
  };
  
  const totalHours = parseTime(timeRequired);
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
          <svg className="w-5 h-5 text-mb-silver" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>
      </div>

      {/* Number */}
      <div className="col-span-1 flex items-center">
        <span className="text-white font-medium">{index + 1}</span>
      </div>

      {/* Service Action Name */}
      <div className="col-span-5">
        <Label htmlFor={`serviceActions.${index}.actionName`}>{t("serviceActionName")}</Label>
        <Input
          {...register(`serviceActions.${index}.actionName`)}
          placeholder={t("serviceActionName")}
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Time Required */}
      <div className="col-span-2">
        <Label htmlFor={`serviceActions.${index}.timeRequired`}>{t("timeRequired")}</Label>
        <Input
          {...register(`serviceActions.${index}.timeRequired`)}
          placeholder="0h 40min"
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
        <p className="text-xs text-mb-silver mt-1">{t("timeFormat")}: 2h 20min</p>
      </div>

      {/* Price Per Hour */}
      <div className="col-span-2">
        <Label htmlFor={`serviceActions.${index}.pricePerHour`}>{t("pricePerHour")}</Label>
        <Input
          type="number"
          step="0.01"
          {...register(`serviceActions.${index}.pricePerHour`, { valueAsNumber: true })}
          placeholder="0.00"
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
      </div>

      {/* Total (read-only) */}
      <div className="col-span-1">
        <Label>{t("total")}</Label>
        <div className="px-3 py-2 bg-mb-anthracite border border-mb-border rounded text-green-500 font-medium">
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
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t("remove")}
        </Button>
      </div>
    </div>
  );
}

export function ServiceActionsFieldArray() {
  const t = useTranslations("admin.form");
  const { control } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "serviceActions",
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
      const oldIndex = fields.findIndex((field) => `service-${fields.indexOf(field)}` === active.id);
      const newIndex = fields.findIndex((field) => `service-${fields.indexOf(field)}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        move(oldIndex, newIndex);
      }
    }
  };

  const addServiceAction = () => {
    append({
      actionName: "",
      timeRequired: "",
      pricePerHour: 0,
    });
  };

  return (
    <Card className="bg-mb-anthracite border-mb-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t("serviceActions")} ({fields.length})
        </CardTitle>
        <Button type="button" onClick={addServiceAction} size="sm" className="bg-green-500 hover:bg-green-600">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t("addServiceAction")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-mb-silver">
            {t("noServiceActionsAdded")}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((_, index) => `service-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <ServiceActionRow
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



