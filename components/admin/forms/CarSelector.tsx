'use client';

import { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { MERCEDES_MODELS, MERCEDES_CLASSES, searchModels } from '@/lib/data/mercedes-models';
import type { OfferFormData } from '@/lib/schemas/offer';
import { cn } from '@/lib/utils';

export function CarSelector() {
  const t = useTranslations('admin.form');
  const { register, setValue, watch, formState: { errors } } = useFormContext<OfferFormData>();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedModel = watch('carModel');

  const filteredModels = useMemo(() => {
    if (!search) return MERCEDES_MODELS.slice(0, 50); // Show first 50 by default
    return searchModels(search);
  }, [search]);

  // Group models by class
  const groupedModels = useMemo(() => {
    const groups: Record<string, typeof MERCEDES_MODELS> = {};
    filteredModels.forEach(model => {
      if (!groups[model.class]) {
        groups[model.class] = [];
      }
      groups[model.class].push(model);
    });
    return groups;
  }, [filteredModels]);

  const handleSelectModel = (modelName: string) => {
    setValue('carModel', modelName);
    setOpen(false);
    setSearch('');
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white flex items-center gap-2">
        <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
        {t('carInfo')}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Model Selector */}
        <div className="space-y-2">
          <Label htmlFor="carModel">{t('carModel')} *</Label>
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
                {selectedModel || t('selectModel')}
                <svg className="ml-2 h-4 w-4 shrink-0 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0 bg-mb-anthracite border-mb-border" align="start">
              <Command className="bg-transparent">
                <CommandInput 
                  placeholder={t('searchModel')} 
                  value={search}
                  onValueChange={setSearch}
                  className="border-mb-border bg-gray-100 text-gray-900"
                />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>{t('noModelFound')}</CommandEmpty>
                  {Object.entries(groupedModels).map(([className, models]) => (
                    <CommandGroup key={className} heading={className}>
                      {models.map((model) => (
                        <CommandItem
                          key={model.id}
                          value={model.name}
                          onSelect={() => handleSelectModel(model.name)}
                          className="cursor-pointer"
                        >
                          <span>{model.name}</span>
                          <span className="ml-auto text-xs text-mb-silver">
                            {model.years[0]}-{model.years[model.years.length - 1]}
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

        {/* Year */}
        <div className="space-y-2">
          <Label htmlFor="carYear">{t('carYear')} *</Label>
          <Input
            type="number"
            min="1990"
            max={currentYear}
            {...register('carYear', { valueAsNumber: true })}
            placeholder={currentYear.toString()}
            className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
          />
          {errors.carYear && (
            <p className="text-xs text-red-400">{errors.carYear.message}</p>
          )}
        </div>

        {/* VIN */}
        <div className="space-y-2">
          <Label htmlFor="vinText">{t('carVin')}</Label>
          <Input
            {...register('vinText')}
            placeholder="WDB1234567890"
            className="bg-gray-100 text-gray-900 border-mb-border uppercase placeholder:text-gray-500"
            maxLength={17}
          />
        </div>

        {/* License Plate */}
        <div className="space-y-2">
          <Label htmlFor="carLicensePlate">{t('carLicensePlate')}</Label>
          <Input
            {...register('carLicensePlate')}
            placeholder="СА 1234 АВ"
            className="bg-gray-100 text-gray-900 border-mb-border uppercase placeholder:text-gray-500"
          />
        </div>

        {/* Mileage */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="carMileage">{t('carMileage')}</Label>
          <div className="relative">
            <Input
              type="number"
              min="0"
              {...register('carMileage', { valueAsNumber: true })}
              placeholder="0"
              className="bg-gray-100 text-gray-900 border-mb-border pr-12 placeholder:text-gray-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver text-sm">км</span>
          </div>
        </div>
      </div>
    </div>
  );
}

