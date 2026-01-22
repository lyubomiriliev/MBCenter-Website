'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OfferFormData } from '@/lib/schemas/offer';
import { cn } from '@/lib/utils';

export function ItemsFieldArray() {
  const t = useTranslations('admin.form');
  const { control, register, formState: { errors }, setValue, watch } = useFormContext<OfferFormData>();
  
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'items',
  });

  const addPart = () => {
    append({
      type: 'part',
      description: '',
      unitPrice: 0,
      quantity: 1,
    });
  };

  const addLabor = () => {
    append({
      type: 'labor',
      description: '',
      unitPrice: 0,
      quantity: 1,
    });
  };

  // Separate items by type for display
  const partsItems = fields.filter((_, index) => watch(`items.${index}.type`) === 'part');
  const laborItems = fields.filter((_, index) => watch(`items.${index}.type`) === 'labor');

  return (
    <div className="space-y-6">
      {/* Parts Section */}
      <Card className="bg-mb-anthracite border-mb-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {t('parts')} ({partsItems.length})
          </CardTitle>
          <Button type="button" onClick={addPart} size="sm" className="bg-mb-blue hover:bg-mb-blue/90">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addPart')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => {
            const itemType = watch(`items.${index}.type`);
            if (itemType !== 'part') return null;
            
            return (
              <ItemRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            );
          })}
          {partsItems.length === 0 && (
            <p className="text-sm text-mb-silver text-center py-4">{t('noPartsAdded')}</p>
          )}
        </CardContent>
      </Card>

      {/* Labor Section */}
      <Card className="bg-mb-anthracite border-mb-border">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-mb-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t('labor')} ({laborItems.length})
          </CardTitle>
          <Button type="button" onClick={addLabor} size="sm" className="bg-mb-blue hover:bg-mb-blue/90">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('addLabor')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => {
            const itemType = watch(`items.${index}.type`);
            if (itemType !== 'labor') return null;
            
            return (
              <ItemRow
                key={field.id}
                index={index}
                onRemove={() => remove(index)}
                register={register}
                errors={errors}
                setValue={setValue}
                watch={watch}
              />
            );
          })}
          {laborItems.length === 0 && (
            <p className="text-sm text-mb-silver text-center py-4">{t('noLaborAdded')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface ItemRowProps {
  index: number;
  onRemove: () => void;
  register: any;
  errors: any;
  setValue: any;
  watch: any;
}

function ItemRow({ index, onRemove, register, errors, setValue, watch }: ItemRowProps) {
  const t = useTranslations('admin.form');
  const unitPrice = watch(`items.${index}.unitPrice`) || 0;
  const quantity = watch(`items.${index}.quantity`) || 1;
  const total = unitPrice * quantity;

  return (
    <div className="flex items-start gap-3 p-3 bg-mb-black rounded-lg border border-mb-border">
      {/* Description */}
      <div className="flex-1">
        <Input
          {...register(`items.${index}.description`)}
          placeholder={t('itemDescription')}
          className="bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
        />
        {errors.items?.[index]?.description && (
          <p className="text-xs text-red-400 mt-1">
            {errors.items[index].description.message}
          </p>
        )}
      </div>

      {/* Unit Price */}
      <div className="w-28">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-mb-silver text-sm">€</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
            placeholder="0.00"
            className="pl-7 bg-mb-anthracite border-mb-border"
          />
        </div>
      </div>

      {/* Quantity */}
      <div className="w-20">
        <Input
          type="number"
          min="1"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          placeholder="1"
          className="bg-mb-anthracite border-mb-border text-center"
        />
      </div>

      {/* Total (calculated) */}
      <div className="w-28 flex items-center justify-end">
        <span className="text-white font-medium">€{total.toFixed(2)}</span>
      </div>

      {/* Remove button */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-10 w-10 p-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </Button>
    </div>
  );
}

