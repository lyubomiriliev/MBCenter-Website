"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  createColumnHelper,
  RowSelectionState,
  ColumnDef,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  useOffers,
  useUpdateOfferStatus,
  useDeleteOffer,
  useCloneOffer,
} from "@/hooks/useOffers";
import { OfferStatusBadge } from "./OfferStatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { OfferWithRelations, OfferStatus } from "@/types/database";

const EUR_TO_BGN = 1.95583;

interface OffersTableProps {
  isMechanicView?: boolean;
  filters?: {
    status: OfferStatus | "all";
    search: string;
    dateFrom?: Date;
    dateTo?: Date;
  };
}

const columnHelper = createColumnHelper<OfferWithRelations>();

export function OffersTable({
  isMechanicView = false,
  filters,
}: OffersTableProps) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const basePath = isMechanicView
    ? `/${locale}/mb-admin-mechanics`
    : `/${locale}/mb-admin`;
  const queryClient = useQueryClient();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [page, setPage] = useState(1);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | null>(
    null
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

  const { data, isLoading, error } = useOffers({
    page,
    pageSize: 20,
    status: filters?.status,
    search: filters?.search,
    dateFrom: filters?.dateFrom?.toISOString(),
    dateTo: filters?.dateTo?.toISOString(),
  });
  const updateStatus = useUpdateOfferStatus();
  const deleteOffer = useDeleteOffer();
  const cloneOffer = useCloneOffer();

  const prefetchOffer = async (offerId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ["offer", offerId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("offers")
          .select(
            `
            id, offer_number, customer_name, customer_phone, customer_email,
            client_id, car_model_text, car_model_detail, repair_name, car_year, vin_text,
            license_plate, mileage, mileage_unit, car_id, created_by_name, discount_percent,
            discount_parts_percent, discount_services_percent,
            notes, notes_internal, notes_service, performed_by, prepayments_eur,
            service_card_number, service_card_generated_at,
            status, total_net, total_gross,
            created_at, updated_at,
            client:clients(id, name, phone, email),
            car:cars(id, model, year, vin, license_plate, mileage),
            items:offer_items(id, offer_id, type, description, brand, part_number, unit_price, quantity, total, sort_order),
            service_actions(id, offer_id, action_name, time_required_text, price_per_hour_eur_net, total_eur_net, is_fixed_price, fixed_price_amount, sort_order)
          `
          )
          .eq("id", offerId)
          .order("sort_order", {
            referencedTable: "offer_items",
            ascending: true,
          })
          .order("sort_order", {
            referencedTable: "service_actions",
            ascending: true,
          })
          .single();

        if (error) throw error;
        return data as OfferWithRelations;
      },
      staleTime: 60 * 1000,
    });
  };

  const handleClone = async (offer: OfferWithRelations) => {
    cloneOffer.mutate(offer.id, {
      onSuccess: () => {
        // List refetches via query invalidation
      },
    });
  };

  const handleDelete = async (offerId: string) => {
    deleteOffer.mutate(offerId, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setDeletingOfferId(null);
      },
    });
  };

  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection)
      .filter((key) => rowSelection[key])
      .map((idx) => data?.offers[Number(idx)]?.id)
      .filter(Boolean) as string[];

    await Promise.all(
      selectedIds.map((id) => supabase.from("offers").delete().eq("id", id))
    );
    queryClient.invalidateQueries({ queryKey: ["offers"] });
    setRowSelection({});
    setBulkDeleteDialogOpen(false);
  };

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const columns = useMemo(() => [
    !isMechanicView && columnHelper.display({
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          className="rounded border-mb-border bg-transparent"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="rounded border-mb-border bg-transparent"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    }),
    columnHelper.accessor(
      (row) => row.service_card_number || row.offer_number,
      {
        id: "offer_number",
        header: () => t("offers.columns.offerNumber"),
        cell: (info) => (
          <Link
            href={`${basePath}/offers/edit?id=${info.row.original.id}`}
            className="text-mb-blue hover:underline font-medium"
          >
            {info.getValue()}
          </Link>
        ),
      }
    ),
    columnHelper.accessor((row) => row.customer_name || row.client?.name, {
      id: "client",
      header: () => t("offers.columns.client"),
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor(
      (row) => {
        const model =
          row.car_model_text ||
          (row.car ? `${row.car.model} ${row.car.year || ""}` : null);
        const detail = (row as any).car_model_detail;
        if (model && detail) return `${model} ${detail}`;
        return model;
      },
      {
        id: "car",
        header: () => t("offers.columns.car"),
        cell: (info) => info.getValue() || "-",
      }
    ),
    columnHelper.accessor(
      (row) => row.vin_text || row.car?.vin,
      {
        id: "vin",
        header: () => t("offers.columns.vin"),
        cell: (info) => {
          const v = info.getValue();
          return v ? v.toUpperCase() : "-";
        },
      }
    ),
    columnHelper.accessor(
      (row) => row.license_plate || row.car?.license_plate,
      {
        id: "licensePlate",
        header: () => t("offers.columns.licensePlate"),
        cell: (info) => info.getValue() || "-",
      }
    ),
    columnHelper.accessor(
      (row) => (row as { repair_name?: string | null }).repair_name ?? "",
      {
        id: "repairName",
        header: () => t("form.repairName"),
        cell: (info) => {
          const v = info.getValue();
          if (!v) return "-";
          return v.length > 40 ? `${v.slice(0, 40)}…` : v;
        },
      }
    ),
    columnHelper.accessor("status", {
      header: () => t("offers.columns.status"),
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
    !isMechanicView && columnHelper.accessor("total_gross", {
      header: () => (
        <div className="text-center">{t("offers.columns.total")}</div>
      ),
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
    columnHelper.accessor(
      (row) => row.service_card_generated_at || row.created_at,
      {
        id: "created_at",
        header: () => t("offers.columns.date"),
        cell: (info) => format(new Date(info.getValue()), "dd.MM.yyyy"),
      }
    ),
    !isMechanicView && columnHelper.display({
      id: "actions",
      header: () => t("offers.columns.actions"),
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 rounded-md border border-mb-border text-mb-silver hover:text-white hover:bg-mb-black/50"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-mb-anthracite border-mb-border text-white"
          >
            <DropdownMenuItem
              onClick={() => handleClone(info.row.original)}
              className="cursor-pointer text-white hover:bg-mb-black hover:text-white focus:bg-mb-black focus:text-white"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              {t("form.clone")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`${basePath}/offers/edit?id=${info.row.original.id}`)
              }
              className="cursor-pointer text-white hover:bg-mb-black hover:text-white focus:bg-mb-black focus:text-white"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              {t("form.editDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setDeletingOfferId(info.row.original.id);
                setDeleteDialogOpen(true);
              }}
              className="cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-white focus:bg-red-500/10 focus:text-white"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              {t("form.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [isMechanicView, t, basePath, router, handleClone, setDeletingOfferId, setEditingOffer, setSelectedStatus, setStatusDialogOpen]);

  const table = useReactTable({
    data: data?.offers || [],
    columns: columns.filter(
      (c): c is ColumnDef<OfferWithRelations, any> => Boolean(c),
    ),
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: !isMechanicView,
  });

  if (isLoading) {
    return <OffersTableSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">{t("offers.error")}</div>
    );
  }

  return (
    <>
      {!isMechanicView && selectedCount > 0 && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <span className="text-sm text-white">{selectedCount} избрани</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBulkDeleteDialogOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white border-red-500"
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t("form.bulkDelete")}
          </Button>
        </div>
      )}

      <div className="rounded-lg border border-mb-border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-mb-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-mb-silver whitespace-nowrap"
                  >
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
                  onMouseEnter={() => prefetchOffer(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
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
                  {t("offers.noResults")}
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
            {t("offers.showing", {
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
              {t("offers.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="border-mb-border"
            >
              {t("offers.next")}
            </Button>
          </div>
        </div>
      )}

      {/* Status edit dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border max-w-md">
          <DialogHeader>
            <DialogTitle>{t("offers.editStatus")}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {editingOffer &&
                `${t("offers.columns.offerNumber")}: ${
                  editingOffer.offer_number
                }`}
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
                <SelectItem
                  value="draft"
                  className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {t("offers.status.draft")}
                </SelectItem>
                <SelectItem
                  value="sent"
                  className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {t("offers.status.sent")}
                </SelectItem>
                <SelectItem
                  value="parts_ordered"
                  className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {t("offers.status.parts_ordered")}
                </SelectItem>
                <SelectItem
                  value="finished"
                  className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {t("offers.status.finished")}
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className="text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                >
                  {t("offers.status.cancelled")}
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
              {t("offers.deleteConfirm.cancel")}
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
              {updateStatus.isPending
                ? t("form.saving")
                : t("form.updateOffer")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single delete dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border max-w-md">
          <DialogHeader>
            <DialogTitle>{t("offers.deleteConfirm.title")}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {t("offers.deleteConfirm.description")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingOfferId(null);
              }}
              className="border-mb-border"
            >
              {t("offers.deleteConfirm.cancel")}
            </Button>
            <Button
              onClick={() => deletingOfferId && handleDelete(deletingOfferId)}
              disabled={deleteOffer.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteOffer.isPending
                ? t("form.saving")
                : t("offers.deleteConfirm.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk delete dialog */}
      <Dialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border max-w-md">
          <DialogHeader>
            <DialogTitle>{t("offers.deleteConfirm.title")}</DialogTitle>
            <DialogDescription className="text-mb-silver">
              {t("form.bulkDeleteConfirm")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkDeleteDialogOpen(false)}
              className="border-mb-border"
            >
              {t("offers.deleteConfirm.cancel")}
            </Button>
            <Button
              onClick={handleBulkDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t("offers.deleteConfirm.confirm")}
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
            {Array.from({ length: 8 }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-20 bg-mb-anthracite" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-mb-border">
              {Array.from({ length: 8 }).map((_, j) => (
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
