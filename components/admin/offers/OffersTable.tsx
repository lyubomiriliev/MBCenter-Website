'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { useOffers, useUpdateOfferStatus, useDeleteOffer } from '@/hooks/useOffers';
import { OfferStatusBadge } from './OfferStatusBadge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { OfferWithRelations, OfferStatus } from '@/types/database';

const EUR_TO_BGN = 1.95583;

interface OffersTableProps {
  isMechanicView?: boolean;
  filters?: {
    status: OfferStatus | 'all';
    search: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

const columnHelper = createColumnHelper<OfferWithRelations>();

export function OffersTable({ isMechanicView = false, filters }: OffersTableProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const basePath = isMechanicView ? `/${locale}/mb-admin-mechanics` : `/${locale}/mb-admin`;
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | null>(null);

  const { data, isLoading, error } = useOffers({ 
    page, 
    pageSize: 20,
    status: filters?.status,
    search: filters?.search,
    dateFrom: filters?.dateFrom?.toISOString(),
    dateTo: filters?.dateTo?.toISOString(),
  });
  const updateStatus = useUpdateOfferStatus();

  const columns = [
    columnHelper.accessor('offer_number', {
      header: () => t('offers.columns.offerNumber'),
      cell: (info) => (
        <Link
          href={`${basePath}/offers/${info.row.original.id}`.replace(/\/+$/, '')}
          className="text-mb-blue hover:underline font-medium"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.customer_name || row.client?.name, {
      id: 'client',
      header: () => t('offers.columns.client'),
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor((row) => {
      if (row.car_model_text) return row.car_model_text;
      if (row.car) return `${row.car.model} ${row.car.year || ''}`;
      return null;
    }, {
      id: 'car',
      header: () => t('offers.columns.car'),
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('status', {
      header: () => t('offers.columns.status'),
      cell: (info) => (
        <button
          onClick={() => {
            setEditingOffer(info.row.original);
            setSelectedStatus(info.row.original.status);
            setStatusDialogOpen(true);
          }}
          className="hover:opacity-80 transition-opacity"
        >
          <OfferStatusBadge status={info.getValue()} />
        </button>
      ),
    }),
    columnHelper.accessor('total_gross', {
      header: () => <div className="text-center">{t('offers.columns.total')}</div>,
      cell: (info) => {
        const eur = info.getValue();
        const bgn = eur * EUR_TO_BGN;
        return (
          <div className="text-center">
            <div className="font-medium">€{eur.toFixed(2)}</div>
            <div className="text-xs text-mb-silver">{bgn.toFixed(2)} лв.</div>
          </div>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => t('offers.columns.date'),
      cell: (info) => format(new Date(info.getValue()), 'dd.MM.yyyy'),
    }),
  ];

  const table = useReactTable({
    data: data?.offers || [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <OffersTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">
        {t('offers.error')}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border border-mb-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-mb-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-mb-silver">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-mb-border hover:bg-mb-anthracite/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-mb-silver"
                >
                  {t('offers.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
          <p className="text-sm text-mb-silver order-2 sm:order-1">
            {t('offers.showing', {
              from: (page - 1) * 20 + 1,
              to: Math.min(page * 20, data.totalCount),
              total: data.totalCount,
            })}
          </p>
          <div className="flex gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-mb-border"
            >
              {t('offers.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="border-mb-border"
            >
              {t('offers.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Status edit dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border max-w-md">
          <DialogHeader>
            <DialogTitle>{t('offers.editStatus')}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {editingOffer && `${t('offers.columns.offerNumber')}: ${editingOffer.offer_number}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={selectedStatus || editingOffer?.status}
              onValueChange={(value) => setSelectedStatus(value as OfferStatus)}
            >
              <SelectTrigger className="w-full bg-gray-100 text-gray-900 border-mb-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-gray-900">
                <SelectItem value="draft" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                  {t('offers.status.draft')}
                </SelectItem>
                <SelectItem value="sent" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                  {t('offers.status.sent')}
                </SelectItem>
                <SelectItem value="approved" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                  {t('offers.status.approved')}
                </SelectItem>
                <SelectItem value="finished" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                  {t('offers.status.finished')}
                </SelectItem>
                <SelectItem value="cancelled" className="text-gray-900 focus:bg-gray-100 focus:text-gray-900">
                  {t('offers.status.cancelled')}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setStatusDialogOpen(false);
                setEditingOffer(null);
                setSelectedStatus(null);
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-red-500"
            >
              {t('offers.deleteConfirm.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (editingOffer && selectedStatus) {
                  updateStatus.mutate({
                    id: editingOffer.id,
                    status: selectedStatus,
                  });
                  setStatusDialogOpen(false);
                  setEditingOffer(null);
                  setSelectedStatus(null);
                }
              }}
              disabled={!selectedStatus || updateStatus.isPending}
              className="bg-mb-blue hover:bg-mb-blue/90"
            >
              {updateStatus.isPending ? t('form.saving') : t('form.updateOffer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function OffersTableSkeleton() {
  return (
    <div className="rounded-lg border border-mb-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-mb-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20 bg-mb-anthracite" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-mb-border">
              {Array.from({ length: 6 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full bg-mb-anthracite" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

