"use client";

import { useState, useCallback, useEffect, useMemo, memo } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { OfferFormData, ServiceActionFormData } from "@/lib/schemas/offer";
import { EUR_TO_BGN } from "@/lib/schemas/offer";
import { parseTimeToHours } from "@/lib/utils";
import {
  useFixedActivities,
  useAddFixedActivity,
  useUpdateFixedActivity,
  useDeleteFixedActivity,
} from "@/hooks/useFixedActivities";

export type FixedActivityItem = { id: string; name: string; priceEur: number };

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
  const [isFixedPrice, setIsFixedPrice] = useState(false);
  const [actionName, setActionName] = useState("");
  const [timeInput, setTimeInput] = useState("1");
  const [pricePerHour, setPricePerHour] = useState(65);
  const [priceInput, setPriceInput] = useState("65");
  const [fixedPriceAmount, setFixedPriceAmount] = useState(0);
  const [fixedPriceInput, setFixedPriceInput] = useState("0");
  const [error, setError] = useState("");
  const { data: fixedActivities = [] } = useFixedActivities();
  const addActivityMut = useAddFixedActivity();
  const updateActivityMut = useUpdateFixedActivity();
  const deleteActivityMut = useDeleteFixedActivity();
  const [addNewModalOpen, setAddNewModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FixedActivityItem | null>(null);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityPrice, setNewActivityPrice] = useState("0");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [activityPopoverOpen, setActivityPopoverOpen] = useState(false);

  const reset = useCallback((vals: ServiceActionFormData | null, activities: FixedActivityItem[]) => {
    if (vals) {
      setActionName(vals.actionName);
      setTimeInput(vals.timeRequired ?? "1");
      const price = vals.pricePerHour ?? 65;
      setPricePerHour(price);
      setPriceInput(price.toString());
      setIsFixedPrice(vals.isFixedPrice ?? false);
      setFixedPriceAmount(vals.fixedPriceAmount ?? 0);
      setFixedPriceInput((vals.fixedPriceAmount ?? 0).toString());
      const match = activities.find(
        (a) =>
          a.name === vals.actionName &&
          (vals.fixedPriceAmount == null ||
            a.priceEur === vals.fixedPriceAmount),
      );
      setSelectedActivityId(match?.id ?? "");
    } else {
      setActionName("");
      setTimeInput("1");
      setPricePerHour(65);
      setPriceInput("65");
      setIsFixedPrice(false);
      setFixedPriceAmount(0);
      setFixedPriceInput("0");
      setSelectedActivityId("");
    }
    setError("");
    setAddNewModalOpen(false);
    setNewActivityName("");
    setNewActivityPrice("0");
  }, []);

  const activitiesForReset = useMemo(
    () => fixedActivities.map((a) => ({ id: a.id, name: a.name, priceEur: a.price_eur })),
    [fixedActivities],
  );

  useEffect(() => {
    if (open) reset(initialValues, activitiesForReset);
  }, [open, initialValues, reset, activitiesForReset]);

  const handleOk = () => {
    const name = actionName.trim();
    if (!name) {
      setError(t("serviceActionNameRequired"));
      return;
    }

    if (isFixedPrice) {
      if (fixedPriceAmount <= 0) {
        setError("Фиксираната цена трябва да е положителна");
        return;
      }
      onConfirm({
        actionName: name,
        timeRequired: "",
        pricePerHour: 0,
        isFixedPrice: true,
        fixedPriceAmount: fixedPriceAmount,
      });
    } else {
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
        isFixedPrice: false,
        fixedPriceAmount: undefined,
      });
    }
    onOpenChange(false);
  };

  const handleAddNewFixedActivity = async () => {
    const trimmed = newActivityName.trim();
    const price = parseFloat(newActivityPrice.replace(",", ".")) || 0;
    if (trimmed && price > 0) {
      if (editingActivity) {
        await updateActivityMut.mutateAsync({ id: editingActivity.id, name: trimmed, priceEur: price });
        if (selectedActivityId === editingActivity.id) {
          setActionName(trimmed);
          setFixedPriceAmount(price);
          setFixedPriceInput(price.toString());
        }
        setEditingActivity(null);
      } else {
        const item = await addActivityMut.mutateAsync({ name: trimmed, priceEur: price });
        setActionName(trimmed);
        setFixedPriceAmount(price);
        setFixedPriceInput(price.toString());
        setSelectedActivityId(item.id);
      }
      setNewActivityName("");
      setNewActivityPrice("0");
      setAddNewModalOpen(false);
    }
  };

  const handleSelectActivity = (id: string) => {
    setSelectedActivityId(id);
    const act = fixedActivities.find((a) => a.id === id);
    if (act) {
      setActionName(act.name);
      setFixedPriceAmount(act.price_eur);
      setFixedPriceInput(act.price_eur.toString());
    }
  };

  const handleRemoveActivity = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteActivityMut.mutate(id);
    if (selectedActivityId === id) {
      setSelectedActivityId("");
      setActionName("");
      setFixedPriceAmount(0);
      setFixedPriceInput("0");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editIndex !== null
              ? t("editServiceAction")
              : t("addServiceAction")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {/* Rate Type Toggle */}
          <div className="space-y-2">
            <Label className="text-gray-200">{t("rateType")}</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!isFixedPrice}
                  onChange={() => setIsFixedPrice(false)}
                  className="text-mb-blue"
                />
                <span className="text-sm">{t("pricePerHourLabel")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={isFixedPrice}
                  onChange={() => setIsFixedPrice(true)}
                  className="text-mb-blue"
                />
                <span className="text-sm">{t("fixedPrice")}</span>
              </label>
            </div>
          </div>

          {isFixedPrice ? (
            <>
              {/* Fixed Price: Dropdown to select activity */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  {t("serviceActionName")} *
                </Label>
                <div className="space-y-2">
                  {fixedActivities.length > 0 ? (
                    <Popover
                      open={activityPopoverOpen}
                      onOpenChange={setActivityPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-gray-100 text-gray-900 border-mb-border h-10 font-normal"
                        >
                          <span className="truncate">
                            {selectedActivityId
                              ? (() => {
                                  const act = fixedActivities.find(
                                    (a) => a.id === selectedActivityId,
                                  );
                                  return act
                                    ? `${act.name} — €${act.price_eur.toFixed(
                                        2,
                                      )} / ${(
                                        act.price_eur * EUR_TO_BGN
                                      ).toFixed(2)} лв.`
                                    : t("selectFixedActivity");
                                })()
                              : t("selectFixedActivity")}
                          </span>
                          <svg
                            className="h-4 w-4 opacity-50 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[var(--radix-popover-trigger-width)] max-h-60 overflow-y-auto p-1 bg-white border-gray-200 text-gray-900"
                        align="start"
                      >
                        {fixedActivities.map((act) => (
                          <div
                            key={act.id}
                            className="flex items-center gap-1 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              handleSelectActivity(act.id);
                              setActivityPopoverOpen(false);
                            }}
                          >
                            <span className="flex-1 truncate min-w-0">
                              {act.name} — €{act.price_eur.toFixed(2)} /{" "}
                              {(act.price_eur * EUR_TO_BGN).toFixed(2)} лв.
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingActivity({ id: act.id, name: act.name, priceEur: act.price_eur });
                                setNewActivityName(act.name);
                                setNewActivityPrice(act.price_eur.toString());
                                setActivityPopoverOpen(false);
                                setAddNewModalOpen(true);
                              }}
                              className="shrink-0 p-0.5 rounded text-blue-500 hover:bg-blue-100"
                              aria-label="Edit"
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
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveActivity(e, act.id);
                              }}
                              className="shrink-0 p-0.5 rounded text-red-400 hover:bg-red-100"
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
                          </div>
                        ))}
                      </PopoverContent>
                    </Popover>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingActivity(null);
                      setNewActivityName("");
                      const lastPrice = fixedActivities.length > 0
                        ? fixedActivities[fixedActivities.length - 1].price_eur
                        : 0;
                      setNewActivityPrice(lastPrice > 0 ? lastPrice.toString() : "0");
                      setAddNewModalOpen(true);
                    }}
                    className="border-mb-border text-sm"
                  >
                    + {t("addFixedActivity")}
                  </Button>
                </div>
              </div>

              {/* Add / Edit Fixed Activity Modal */}
              <Dialog
                open={addNewModalOpen}
                onOpenChange={(v) => {
                  if (!v) {
                    setEditingActivity(null);
                    setNewActivityName("");
                    setNewActivityPrice("0");
                  }
                  setAddNewModalOpen(v);
                }}
              >
                <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      {editingActivity
                        ? "Редактирай дейност"
                        : t("addFixedActivity")}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label className="text-gray-200">
                        {t("serviceActionName")} *
                      </Label>
                      <Input
                        value={newActivityName}
                        onChange={(e) => setNewActivityName(e.target.value)}
                        placeholder={t("serviceActionName")}
                        className="bg-gray-100 text-gray-900 border-mb-border"
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-200">
                        {t("fixedPriceAmount")} (EUR) *
                      </Label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={newActivityPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val))
                            setNewActivityPrice(val);
                        }}
                        placeholder="0.00"
                        className="bg-gray-100 text-gray-900 border-mb-border"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAddNewModalOpen(false)}
                      className="bg-red-500 hover:bg-red-600 text-white border-red-500"
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddNewFixedActivity}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      {t("ok")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Fixed Price Amount - editable when activity selected */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  {t("fixedPriceAmount")} *
                </Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={fixedPriceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                      setFixedPriceInput(val);
                      const numVal = val.replace(",", ".");
                      setFixedPriceAmount(
                        numVal === "" ? 0 : Number(numVal) || 0,
                      );
                    }
                  }}
                  placeholder="0.00"
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
              </div>
            </>
          ) : (
            <>
              {/* Hourly Rate: Activity Name */}
              <div className="space-y-2">
                <Label className="text-gray-200">
                  {t("serviceActionName")} *
                </Label>
                <Input
                  value={actionName}
                  onChange={(e) => setActionName(e.target.value)}
                  placeholder={t("serviceActionName")}
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-200">{t("timeRequired")}</Label>
                <Input
                  type="text"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="1:30"
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
                <p className="text-xs text-mb-silver">
                  {t("timeFormatExamples")}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-200">{t("pricePerHour")} *</Label>
                <Input
                  type="text"
                  inputMode="decimal"
                  value={priceInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || /^[0-9]*[.,]?[0-9]*$/.test(val)) {
                      setPriceInput(val);
                      const numVal = val.replace(",", ".");
                      setPricePerHour(numVal === "" ? 0 : Number(numVal) || 0);
                    }
                  }}
                  onBlur={() => {
                    if (
                      priceInput &&
                      !isNaN(Number(priceInput.replace(",", ".")))
                    ) {
                      setPriceInput(pricePerHour.toString());
                    }
                  }}
                  placeholder="0.00"
                  className="bg-gray-100 text-gray-900 border-mb-border"
                />
                {(() => {
                  const hours = parseTimeToHours(timeInput);
                  const rate = Number(pricePerHour) || 0;
                  if (hours <= 0 || rate <= 0) return null;
                  const totalWithVat = rate * hours;
                  return (
                    <p className="text-sm mt-4 text-mb-silver">
                      Обща стойност: €{totalWithVat.toFixed(2)} {t("withVat")}
                    </p>
                  );
                })()}
              </div>
            </>
          )}
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
          <Button
            type="button"
            onClick={handleOk}
            className="bg-green-500 hover:bg-green-600"
          >
            {t("ok")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ServiceActionRowProps {
  index: number;
  remove: (index: number) => void;
  openEdit: (index: number) => void;
}

const ServiceActionRow = memo(function ServiceActionRow({ index, remove, openEdit }: ServiceActionRowProps) {
  const t = useTranslations("admin.form");
  const { control } = useFormContext<OfferFormData>();

  const timeRequired = useWatch({ control, name: `serviceActions.${index}.timeRequired` }) ?? "";
  const pricePerHour = useWatch({ control, name: `serviceActions.${index}.pricePerHour` }) ?? 0;
  const actionName = useWatch({ control, name: `serviceActions.${index}.actionName` }) ?? "";
  const isFixed = useWatch({ control, name: `serviceActions.${index}.isFixedPrice` }) ?? false;
  const fixedAmount = useWatch({ control, name: `serviceActions.${index}.fixedPriceAmount` }) ?? 0;

  const totalHours = parseTimeToHours(timeRequired);
  const total = isFixed ? fixedAmount : totalHours * pricePerHour;

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
      className="grid min-w-[820px] grid-cols-[32px_24px_minmax(220px,1fr)_140px_180px_140px_80px] gap-3 items-center rounded border border-mb-border bg-mb-anthracite/50 px-2 py-1.5 even:bg-mb-anthracite/30"
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
        className="min-w-0 text-white text-sm truncate text-left"
        title={actionName}
      >
        {actionName || "—"}
      </div>
      <div
        className="text-mb-silver text-sm flex items-center justify-center"
        title={timeRequired}
      >
        {isFixed ? "-" : timeRequired || "-"}
      </div>
      <div className="text-white text-sm tabular-nums flex items-center justify-end">
        {isFixed ? "-" : `€${Number(pricePerHour).toFixed(2)}`}
      </div>
      <div className="text-green-400 text-sm font-medium tabular-nums flex items-center justify-end">
        €{total.toFixed(2)}
      </div>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => openEdit(index)}
          className="h-7 px-2 text-mb-silver hover:text-white hover:bg-mb-anthracite"
          aria-label={t("editServiceAction")}
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

export function ServiceActionsFieldArray() {
  const t = useTranslations("admin.form");
  const { control, getValues, setValue } = useFormContext<OfferFormData>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "serviceActions",
  });

  const sortableItems = useMemo(() => fields.map((_, i) => `service-${i}`), [fields]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] =
    useState<ServiceActionFormData | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
            isFixedPrice: a.isFixedPrice ?? false,
            fixedPriceAmount: a.fixedPriceAmount ?? undefined,
          }
        : null,
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
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {t("serviceActions")} ({fields.length})
        </CardTitle>
        <Button
          type="button"
          onClick={openAdd}
          size="sm"
          className="bg-green-500 hover:bg-green-600"
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
          {t("addServiceAction")}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        {fields.length === 0 ? (
          <div className="text-center py-6 text-mb-silver text-sm">
            {t("noServiceActionsAdded")}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-1 px-1 min-w-0">
            <div className="grid min-w-[820px] grid-cols-[32px_24px_minmax(220px,1fr)_140px_180px_140px_80px] gap-3 items-center py-1.5 px-2 text-xs font-medium text-mb-silver uppercase tracking-wider border-b border-mb-border mb-1">
              <div />
              <div className="flex items-center justify-center">#</div>
              <div className="flex min-w-0 items-center justify-start leading-tight">
                {t("serviceActionName")}
              </div>
              <div className="flex items-center justify-center text-center leading-tight">
                {t("timeRequired")}
              </div>
              <div className="flex items-center justify-end text-right leading-tight">
                {t("pricePerHour")}
              </div>
              <div className="flex items-center justify-end text-right leading-tight">
                {t("total")}
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
                  <ServiceActionRow
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
