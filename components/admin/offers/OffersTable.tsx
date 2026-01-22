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
}

const columnHelper = createColumnHelper<OfferWithRelations>();

export function OffersTable({ isMechanicView = false }: OffersTableProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const basePath = isMechanicView ? `/${locale}/mb-admin-mechanics` : `/${locale}/mb-admin-x77`;
  
  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<string | null>(null);

  const { data, isLoading, error } = useOffers({ page, pageSize: 20 });
  const updateStatus = useUpdateOfferStatus();
  const deleteOffer = useDeleteOffer();

  const columns = [
    columnHelper.accessor('offer_number', {
      header: () => t('offers.columns.offerNumber'),
      cell: (info) => (
        <Link 
          href={`${basePath}/offers/${info.row.original.id}`}
          className="text-mb-blue hover:underline font-medium"
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor((row) => row.client?.name, {
      id: 'client',
      header: () => t('offers.columns.client'),
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor((row) => row.car?.model, {
      id: 'car',
      header: () => t('offers.columns.car'),
      cell: (info) => {
        const car = info.row.original.car;
        if (!car) return '-';
        return `${car.model} ${car.year || ''}`;
      },
    }),
    columnHelper.accessor('status', {
      header: () => t('offers.columns.status'),
      cell: (info) => <OfferStatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('total_gross', {
      header: () => t('offers.columns.total'),
      cell: (info) => {
        const eur = info.getValue();
        const bgn = eur * EUR_TO_BGN;
        return (
          <div className="text-right">
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
    columnHelper.display({
      id: 'actions',
      header: () => t('offers.columns.actions'),
      cell: (info) => (
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <Select
            value={info.row.original.status}
            onValueChange={(value) => {
              updateStatus.mutate({
                id: info.row.original.id,
                status: value as OfferStatus,
              });
            }}
          >
            <SelectTrigger className="w-32 h-8 text-xs bg-gray-100 text-gray-900 border-mb-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-mb-anthracite border-mb-border">
              <SelectItem value="draft">{t('offers.status.draft')}</SelectItem>
              <SelectItem value="sent">{t('offers.status.sent')}</SelectItem>
              <SelectItem value="approved">{t('offers.status.approved')}</SelectItem>
              <SelectItem value="finished">{t('offers.status.finished')}</SelectItem>
              <SelectItem value="cancelled">{t('offers.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>

          {/* Edit button */}
          <Link href={`${basePath}/offers/${info.row.original.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
          </Link>

          {/* Delete button - only for admins */}
          {!isMechanicView && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => {
                setOfferToDelete(info.row.original.id);
                setDeleteDialogOpen(true);
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      ),
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
      <div className="rounded-lg border border-mb-border overflow-hidden">
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
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-mb-silver">
            {t('offers.showing', {
              from: (page - 1) * 20 + 1,
              to: Math.min(page * 20, data.totalCount),
              total: data.totalCount,
            })}
          </p>
          <div className="flex gap-2">
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

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border">
          <DialogHeader>
            <DialogTitle>{t('offers.deleteConfirm.title')}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {t('offers.deleteConfirm.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-mb-border"
            >
              {t('offers.deleteConfirm.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (offerToDelete) {
                  deleteOffer.mutate(offerToDelete);
                  setDeleteDialogOpen(false);
                  setOfferToDelete(null);
                }
              }}
            >
              {t('offers.deleteConfirm.confirm')}
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
            {Array.from({ length: 7 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20 bg-mb-anthracite" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-mb-border">
              {Array.from({ length: 7 }).map((_, j) => (
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

