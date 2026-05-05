"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  RowSelectionState,
  ColumnDef,
  VisibilityState,
} from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  useOffers,
  useUpdateOfferStatus,
  useDeleteOffer,
  useCloneOffer,
  type OfferSortColumn,
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
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { TransferDataModal } from "@/components/admin/warehouse/TransferDataModal";

const EUR_TO_BGN = 1.95583;

function getColumnsKey(role: string): string {
  if (role === "reception") return "mb_offer_columns_visibility_reception";
  if (role === "mechanic") return "mb_offer_columns_visibility_mechanic";
  return "mb_offer_columns_visibility_admin";
}

const SETTINGS_TO_COLUMN_ID: Record<string, string> = {
  offerNumber: "offer_number",
  clientInfo: "client",
  vehicleInfo: "car",
  repairName: "repairName",
  status: "status",
  createdAt: "created_at",
  totalGross: "total_gross",
  actions: "actions",
};

function loadColumnVisibility(key: string): VisibilityState {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    const settings = JSON.parse(stored) as Record<string, boolean>;
    const visibility: VisibilityState = {};
    for (const [settingsKey, columnId] of Object.entries(
      SETTINGS_TO_COLUMN_ID,
    )) {
      if (settingsKey in settings) {
        visibility[columnId] = settings[settingsKey];
      }
    }
    return visibility;
  } catch {
    return {};
  }
}

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
  const { profile } = useSupabaseAuthContext();
  const columnsKey = getColumnsKey(profile?.role ?? "admin");

  const SORT_STORAGE_KEY = isMechanicView
    ? "mb_offers_sort_mechanic"
    : "mb_offers_sort_admin";

  function loadSort(): { sortBy: OfferSortColumn; sortDir: "asc" | "desc" } {
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return { sortBy: "last_edited_at", sortDir: "desc" };
  }

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [sortBy, setSortBy] = useState<OfferSortColumn>(
    () => loadSort().sortBy,
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    () => loadSort().sortDir,
  );

  const page = Math.max(1, Number(searchParams.get("page") || 1));

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const nextPage = typeof value === "function" ? value(page) : value;
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [page, pathname, router, searchParams],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  useEffect(() => {
    setColumnVisibility(loadColumnVisibility(columnsKey));
    const onStorage = (e: StorageEvent) => {
      if (e.key === columnsKey)
        setColumnVisibility(loadColumnVisibility(columnsKey));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [columnsKey]);

  const LAST_VIEWED_KEY = isMechanicView
    ? "mb_last_viewed_offer_mechanic"
    : "mb_last_viewed_offer_admin";

  const [lastViewedOfferId, setLastViewedOfferId] = useState<string | null>(
    () => {
      try {
        return sessionStorage.getItem(LAST_VIEWED_KEY);
      } catch {
        return null;
      }
    },
  );

  const handleOfferClick = useCallback(
    (offerId: string) => {
      try {
        sessionStorage.setItem(LAST_VIEWED_KEY, offerId);
      } catch {}
      setLastViewedOfferId(offerId);
    },
    [LAST_VIEWED_KEY],
  );

  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    if (
      prev?.status !== filters?.status ||
      prev?.search !== filters?.search ||
      prev?.dateFrom !== filters?.dateFrom ||
      prev?.dateTo !== filters?.dateTo
    ) {
      prevFiltersRef.current = filters;
      setPage(1);
    }
  }, [filters, setPage]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferWithRelations | null>(
    null,
  );
  const [selectedStatus, setSelectedStatus] = useState<OfferStatus | null>(
    null,
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSourceOffer, setTransferSourceOffer] = useState<{
    id: string;
    offer_number: string;
  } | null>(null);
  const [pageSize, setPageSize] = useState(17);

  useEffect(() => {
    const handleResize = () => {
      // 1920px is typical 1080p, > 1920px covers 2K (1440p / 2560px) and 4K
      if (window.innerWidth > 1920) {
        setPageSize(17);
      } else {
        setPageSize(17);
      }
    };
    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data, isLoading, error } = useOffers({
    page,
    pageSize,
    status: filters?.status,
    search: filters?.search,
    dateFrom: filters?.dateFrom?.toISOString(),
    dateTo: filters?.dateTo?.toISOString(),
    sortBy,
    sortDir,
  });
  const updateStatus = useUpdateOfferStatus();
  const deleteOffer = useDeleteOffer();
  const cloneOffer = useCloneOffer();

  const handleSort = useCallback(
    (col: OfferSortColumn) => {
      const newDir =
        sortBy === col ? (sortDir === "desc" ? "asc" : "desc") : "desc";
      const newCol = col;
      setSortBy(newCol);
      setSortDir(newDir);
      setPage(1);
      try {
        localStorage.setItem(
          SORT_STORAGE_KEY,
          JSON.stringify({ sortBy: newCol, sortDir: newDir }),
        );
      } catch {}
    },
    [sortBy, sortDir, SORT_STORAGE_KEY],
  );

  const SortIcon = useCallback(
    ({ col }: { col: OfferSortColumn }) => {
      if (sortBy !== col) {
        return (
          <svg
            className="w-4 h-4 ml-1.5 opacity-30 inline-block"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
        );
      }
      return sortDir === "desc" ? (
        <svg
          className="w-4 h-4 ml-1.5 inline-block"
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
      ) : (
        <svg
          className="w-4 h-4 ml-1.5 inline-block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    },
    [sortBy, sortDir],
  );

  const prefetchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetchOffer = useCallback(
    (offerId: string) => {
      if (prefetchTimerRef.current) clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = setTimeout(async () => {
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
              assyst_remaining_time, assyst_remaining_mileage,
              assyst_service_code, assyst_service_description, assyst_mileage_unit,
              client:clients(id, name, phone, email),
              car:cars(id, model, year, vin, license_plate, mileage),
              items:offer_items(id, offer_id, type, description, brand, part_number, unit_price, quantity, total, sort_order),
              service_actions(id, offer_id, action_name, time_required_text, price_per_hour_eur_net, total_eur_net, is_fixed_price, fixed_price_amount, sort_order)
            `,
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
      }, 150);
    },
    [queryClient],
  );

  const handleClone = useCallback(
    (offer: OfferWithRelations) => {
      cloneOffer.mutate(offer.id);
    },
    [cloneOffer],
  );

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

    if (selectedIds.length === 0) return;

    await supabase.from("offers").delete().in("id", selectedIds);
    queryClient.invalidateQueries({ queryKey: ["offers"] });
    setRowSelection({});
    setBulkDeleteDialogOpen(false);
  };

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const columns = useMemo(
    () => [
      !isMechanicView &&
        columnHelper.display({
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
          header: () => (
            <button
              onClick={() => handleSort("offer_number")}
              className="flex items-center hover:text-mb-blue hover:underline transition-colors"
            >
              {t("offers.columns.offerNumber")}
              <SortIcon col="offer_number" />
            </button>
          ),
          cell: (info) => (
            <Link
              href={`${basePath}/offers/edit?id=${info.row.original.id}`}
              className="text-mb-blue hover:underline font-medium"
              onClick={() => handleOfferClick(info.row.original.id)}
            >
              {info.getValue()}
            </Link>
          ),
        },
      ),
      columnHelper.accessor((row) => row.customer_name || row.client?.name, {
        id: "client",
        header: () => (
          <button
            onClick={() => handleSort("customer_name")}
            className="flex items-center hover:text-mb-blue hover:underline transition-colors"
          >
            {t("offers.columns.client")}
            <SortIcon col="customer_name" />
          </button>
        ),
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
        },
      ),
      columnHelper.accessor((row) => row.vin_text || row.car?.vin, {
        id: "vin",
        meta: { className: "hidden lg:table-cell" },
        header: () => t("offers.columns.vin"),
        cell: (info) => {
          const v = info.getValue();
          return v ? v.toUpperCase() : "-";
        },
      }),
      columnHelper.accessor(
        (row) => row.license_plate || row.car?.license_plate,
        {
          id: "licensePlate",
          meta: { className: "hidden md:table-cell" },
          header: () => t("offers.columns.licensePlate"),
          cell: (info) => info.getValue() || "-",
        },
      ),
      columnHelper.accessor(
        (row) => (row as { repair_name?: string | null }).repair_name ?? "",
        {
          id: "repairName",
          meta: { className: "hidden xl:table-cell" },
          header: () => t("form.repairName"),
          cell: (info) => {
            const v = info.getValue();
            if (!v) return "-";
            return (
              <span
                className="block max-w-[200px] xl:max-w-[380px] 2xl:max-w-none 2xl:whitespace-normal"
                title={v}
              >
                {v}
              </span>
            );
          },
        },
      ),
      columnHelper.accessor("status", {
        header: () => (
          <button
            onClick={() => handleSort("status")}
            className="flex items-center hover:text-mb-blue hover:underline transition-colors"
          >
            {t("offers.columns.status")}
            <SortIcon col="status" />
          </button>
        ),
        cell: (info) =>
          isMechanicView ? (
            <OfferStatusBadge status={info.getValue()} />
          ) : (
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
      !isMechanicView &&
        columnHelper.accessor("total_gross", {
          meta: { className: "hidden sm:table-cell" },
          header: () => (
            <button
              onClick={() => handleSort("total_gross")}
              className="flex items-center w-full justify-center hover:text-white transition-colors"
            >
              {t("offers.columns.total")}
              <SortIcon col="total_gross" />
            </button>
          ),
          cell: (info) => {
            const eur = info.getValue();
            const bgn = eur * EUR_TO_BGN;
            return (
              <div className="text-center">
                <div className="font-medium">{eur.toFixed(2)} €</div>
                <div className="text-xs text-mb-silver">
                  {bgn.toFixed(2)} лв.
                </div>
              </div>
            );
          },
        }),
      columnHelper.accessor(
        (row) => (row as any).service_card_generated_at || row.created_at,
        {
          id: "created_at",
          meta: { className: isMechanicView ? "" : "hidden sm:table-cell" },
          header: () => (
            <button
              onClick={() => handleSort("last_edited_at")}
              className="flex items-center hover:text-mb-blue hover:underline transition-colors"
            >
              {t("offers.columns.date")}
              <SortIcon col="last_edited_at" />
            </button>
          ),
          cell: (info) => format(new Date(info.getValue()), "dd.MM.yyyy"),
        },
      ),
      !isMechanicView &&
        columnHelper.display({
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
                  onClick={() => {
                    setTransferSourceOffer({
                      id: info.row.original.id,
                      offer_number: info.row.original.offer_number,
                    });
                    setTransferModalOpen(true);
                  }}
                  className="cursor-pointer text-white bg-purple-600 hover:bg-purple-700 focus:bg-purple-700 hover:text-white focus:text-white"
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
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  {t("warehouse.transfer.title")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    handleOfferClick(info.row.original.id);
                    router.push(
                      `${basePath}/offers/edit?id=${info.row.original.id}`,
                    );
                  }}
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
    ],
    [
      isMechanicView,
      t,
      basePath,
      router,
      handleClone,
      handleSort,
      handleOfferClick,
      setDeletingOfferId,
      setEditingOffer,
      setSelectedStatus,
      setStatusDialogOpen,
      SortIcon,
    ],
  );

  const table = useReactTable({
    data: data?.offers || [],
    columns: columns.filter((c): c is ColumnDef<OfferWithRelations, any> =>
      Boolean(c),
    ),
    state: { rowSelection, columnVisibility },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
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
                    className={`text-mb-silver whitespace-nowrap text-[13px] font-bold uppercase tracking-wider ${(header.column.columnDef.meta as any)?.className ?? ""}`}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
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
                  className={`border-mb-border hover:bg-mb-anthracite/50 ${
                    row.original.id === lastViewedOfferId
                      ? "bg-mb-blue/[0.15]"
                      : ""
                  }`}
                  onMouseEnter={() => prefetchOffer(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={[
                        cell.column.id === "repairName"
                          ? "whitespace-nowrap 2xl:whitespace-normal"
                          : "whitespace-nowrap",
                        (cell.column.columnDef.meta as any)?.className ?? "",
                      ].join(" ")}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
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
        <div className="flex flex-col items-center gap-3 mt-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border-mb-border text-black hover:text-black font-medium disabled:opacity-50"
            >
              {t("offers.previous")}
            </Button>

            <div className="flex items-center gap-1 mx-2 sm:mx-4">
              {Array.from({ length: data.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === data.totalPages ||
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`w-8 h-8 sm:w-9 sm:h-9 p-0 ${
                        page === pageNum
                          ? "bg-mb-blue font-bold text-white shadow-md shadow-mb-blue/20 hover:bg-mb-blue"
                          : "border-mb-border text-black hover:text-black hover:bg-gray-100 font-medium"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                } else if (
                  (pageNum === page - 2 && page > 3) ||
                  (pageNum === page + 2 && page < data.totalPages - 2)
                ) {
                  return (
                    <span key={pageNum} className="text-mb-silver px-1">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="border-mb-border text-black hover:text-black font-medium disabled:opacity-50"
            >
              {t("offers.next")}
            </Button>
          </div>
          <p className="text-sm text-mb-silver opacity-80 mt-1">
            {t("offers.showing", {
              from: (page - 1) * pageSize + 1,
              to: Math.min(page * pageSize, data.totalCount),
              total: data.totalCount,
            })}
          </p>
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

      {/* Transfer data modal */}
      {transferSourceOffer && (
        <TransferDataModal
          open={transferModalOpen}
          onOpenChange={(open) => {
            setTransferModalOpen(open);
            if (!open) setTransferSourceOffer(null);
          }}
          sourceOfferId={transferSourceOffer.id}
          sourceOfferNumber={transferSourceOffer.offer_number}
        />
      )}

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
