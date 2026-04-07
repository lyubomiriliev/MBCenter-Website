"use client";

import { useState, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MERCEDES_MODELS, searchModels } from "@/lib/data/mercedes-models";
import type { OfferFormData } from "@/lib/schemas/offer";
import { cn } from "@/lib/utils";

/** Renders only the Модел dropdown field — used inside a parent grid layout. */
export function CarSelector() {
  const t = useTranslations("admin.form");
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<OfferFormData>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedModel = watch("carModel");

  const filteredModels = useMemo(() => {
    if (!search) return MERCEDES_MODELS.slice(0, 50);
    return searchModels(search);
  }, [search]);

  const groupedModels = useMemo(() => {
    const groups: Record<string, typeof MERCEDES_MODELS> = {};
    filteredModels.forEach((model) => {
      if (!groups[model.class]) {
        groups[model.class] = [];
      }
      groups[model.class].push(model);
    });
    return groups;
  }, [filteredModels]);

  const handleSelectModel = (modelName: string) => {
    setValue("carModel", modelName, { shouldDirty: true, shouldValidate: true });
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="carModel">{t("carModel")} *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between bg-gray-100 text-gray-900 border-mb-border",
              !selectedModel && "text-gray-500"
            )}
          >
            {selectedModel || t("selectModel")}
            <svg
              className="ml-2 h-4 w-4 shrink-0 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[400px] p-0 bg-white border-gray-200 text-gray-900"
          align="start"
        >
          <Command className="bg-white text-gray-900 [&_[cmdk-input-wrapper]]:border-gray-200">
            <CommandInput
              placeholder={t("searchModel")}
              value={search}
              onValueChange={setSearch}
              className="border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-500"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty className="text-gray-600">
                {t("noModelFound")}
              </CommandEmpty>
              {Object.entries(groupedModels).map(([className, models]) => (
                <CommandGroup
                  key={className}
                  heading={className}
                  className="[&_[cmdk-group-heading]]:text-gray-600"
                >
                  {models.map((model) => (
                    <CommandItem
                      key={model.id}
                      value={model.name}
                      onSelect={() => handleSelectModel(model.name)}
                      className="cursor-pointer text-gray-900 data-[selected=true]:bg-gray-100 data-[selected=true]:text-gray-900"
                    >
                      <span>{model.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        {model.years[0]}-
                        {model.years[model.years.length - 1]}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {errors.carModel && (
        <p className="text-xs text-red-400">{errors.carModel.message}</p>
      )}
    </div>
  );
}
