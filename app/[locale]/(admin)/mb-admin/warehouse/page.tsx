"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { useNotification } from "@/hooks/useNotification";
import {
  useWarehouseParts,
  useCreateWarehousePart,
  useUpdateWarehousePart,
  useDeleteWarehousePart,
  useUpsertWarehouseParts,
  exportWarehouseToXlsx,
  downloadWarehouseTemplate,
} from "@/hooks/useWarehouseParts";
import { WarehousePartModal } from "@/components/admin/warehouse/WarehousePartModal";
import { StockStatusBadge } from "@/components/admin/warehouse/StockStatusBadge";
import { QuantityPopover } from "@/components/admin/shared/QuantityPopover";
import type { WarehousePart, WarehousePartInsert } from "@/types/database";
import type { WarehousePartFormData } from "@/lib/schemas/warehouse";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SESSION_KEY = "mb_warehouse_filters";

function saveSession(search: string, page: number) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ search, page }));
  } catch {}
}

function loadSession(): { search: string; page: number } {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return { search: "", page: 1 };
    return JSON.parse(raw);
  } catch {
    return { search: "", page: 1 };
  }
}

export default function WarehousePage() {
  const t = useTranslations("admin.warehouse");

  const [search, setSearchState] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "inStock" | "limited" | "outOfStock">("all");
  const [page, setPageState] = useState(1);

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = loadSession();
    setSearchState(saved.search);
    setDebouncedSearch(saved.search);
    setPageState(saved.page);
  }, []);

  const setSearch = (value: string) => {
    setSearchState(value);
  };

  const setPage = (value: number | ((prev: number) => number)) => {
    setPageState((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      saveSession(search, next);
      return next;
    });
  };

  // Debounce search → reset page + save to session
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageState(1);
      saveSession(search, 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<WarehousePart | null>(null);

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Import state
  const [importPreviewOpen, setImportPreviewOpen] = useState(false);
  const [importRows, setImportRows] = useState<WarehousePartInsert[]>([]);
  const [importPreviewRows, setImportPreviewRows] = useState<
    WarehousePartInsert[]
  >([]);
  const importInputRef = useRef<HTMLInputElement>(null);

  // Export loading
  const [isExporting, setIsExporting] = useState(false);

  const { notifications, dismiss, showError, showSuccess } = useNotification();

  // Data hooks
  const { data, isLoading } = useWarehouseParts({
    search: debouncedSearch,
    page,
    pageSize: 50,
  });
  const createPart = useCreateWarehousePart();
  const updatePart = useUpdateWarehousePart();
  const deletePart = useDeleteWarehousePart();
  const upsertParts = useUpsertWarehouseParts();

  const allParts = data?.parts ?? [];
  const parts = allParts.filter((p) => {
    if (statusFilter === "inStock") return p.quantity > 3;
    if (statusFilter === "limited") return p.quantity >= 1 && p.quantity <= 3;
    if (statusFilter === "outOfStock") return p.quantity === 0;
    return true;
  });
  const totalPages = data?.totalPages ?? 1;

  // Open add modal
  const openAdd = () => {
    setEditingPart(null);
    setModalOpen(true);
  };

  // Open edit modal
  const openEdit = (part: WarehousePart) => {
    setEditingPart(part);
    setModalOpen(true);
  };

  // Handle modal confirm
  const handleModalConfirm = async (formData: WarehousePartFormData) => {
    const normalized: WarehousePartInsert = {
      ...formData,
      replaced_by: formData.replaced_by ?? null,
    };
    try {
      if (editingPart) {
        await updatePart.mutateAsync({ id: editingPart.id, ...normalized });
        showSuccess(t("editPart") + " ✓");
      } else {
        await createPart.mutateAsync(normalized);
        showSuccess(t("addPart") + " ✓");
      }
    } catch (err) {
      showError(String(err));
    }
  };

  // Handle inline qty update
  const handleQtyUpdate = async (id: string, quantity: number) => {
    try {
      await updatePart.mutateAsync({ id, quantity });
    } catch (err) {
      showError(String(err));
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await deletePart.mutateAsync(id);
      setDeleteConfirmId(null);
      showSuccess(t("deleteConfirm.deleteSuccess"));
    } catch (err) {
      showError(String(err));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    try {
      const count = selectedIds.size;
      await Promise.all(
        Array.from(selectedIds).map((id) => deletePart.mutateAsync(id)),
      );
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      showSuccess(`${count} ${t("deleteConfirm.confirm")} ✓`);
    } catch (err) {
      showError(String(err));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected =
    parts.length > 0 && parts.every((p) => selectedIds.has(p.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(parts.map((p) => p.id)));
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Fetch all parts without pagination limit
      const { data: allData } = await import("@/lib/supabase/client").then(
        async ({ supabase }) => {
          return supabase
            .from("warehouse_parts")
            .select("*")
            .order("created_at", { ascending: false });
        },
      );
      if (allData) {
        await exportWarehouseToXlsx(allData as WarehousePart[]);
      }
    } catch (err) {
      showError(String(err));
    } finally {
      setIsExporting(false);
    }
  };

  // Handle import file selection
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isCsv = file.name.toLowerCase().endsWith(".csv");

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let wb: XLSX.WorkBook;
        if (isCsv) {
          // CSV: read as UTF-8 text to preserve Cyrillic characters
          const text = ev.target?.result as string;
          wb = XLSX.read(text, { type: "string" });
        } else {
          // XLSX: binary format, read as array buffer
          const data = new Uint8Array(ev.target?.result as ArrayBuffer);
          wb = XLSX.read(data, { type: "array" });
        }
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

        const parsed: WarehousePartInsert[] = [];
        for (const row of rows) {
          const name = String(row["Name"] ?? row["name"] ?? row["Наименование"] ?? row["наименование"] ?? "").trim();
          const part_number = String(
            row["Part Number"] ?? row["part_number"] ?? row["№ Част"] ?? row["Номер"] ?? "",
          ).trim();
          if (!name || !part_number) continue;

          parsed.push({
            name,
            part_number,
            manufacturer:
              String(
                row["Manufacturer"] ?? row["manufacturer"] ?? row["Производител"] ?? "MERCEDES",
              ).trim() || "MERCEDES",
            quantity: Number(row["Quantity"] ?? row["quantity"] ?? row["К-во"] ?? row["Количество"] ?? 0) || 0,
            cost_price:
              Number(row["Cost Price (EUR)"] ?? row["cost_price"] ?? row["Себест."] ?? row["Себестойност"] ?? 0) || 0,
            sale_price:
              Number(row["Sale Price (EUR)"] ?? row["sale_price"] ?? row["Продажна"] ?? row["Продажна цена"] ?? 0) || 0,
            replaced_by:
              String(row["Replaced By"] ?? row["replaced_by"] ?? row["Заменена от"] ?? "").trim() ||
              null,
          });
        }

        setImportRows(parsed);
        setImportPreviewRows(parsed.slice(0, 10));
        setImportPreviewOpen(true);
      } catch (err) {
        showError(String(err));
      }
    };

    if (isCsv) {
      reader.readAsText(file, "UTF-8");
    } else {
      reader.readAsArrayBuffer(file);
    }

    // Reset file input so same file can be selected again
    if (importInputRef.current) importInputRef.current.value = "";
  };

  // Confirm import
  const handleImportConfirm = async () => {
    const skipped = importRows.length === 0 ? 0 : 0; // all valid rows are imported (skipped during parse)
    try {
      await upsertParts.mutateAsync(importRows);
      setImportPreviewOpen(false);
      showSuccess(t("importSuccess", { imported: importRows.length, skipped }));
      setImportRows([]);
    } catch (err) {
      showError(String(err));
    }
  };

  const computeMargin = (part: WarehousePart) => {
    if (part.cost_price === 0)
      return {
        pct: "—",
        eur: `${(part.sale_price - part.cost_price).toFixed(2)} €`,
      };
    const pct =
      (((part.sale_price - part.cost_price) / part.cost_price) * 100).toFixed(
        1,
      ) + "%";
    const eur = `${(part.sale_price - part.cost_price).toFixed(2)} €`;
    return { pct, eur };
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Notifications */}
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => dismiss(notification.id)}
        />
      ))}

      <AdminHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={handleExport}
              disabled={isExporting}
              className="bg-green-600 hover:bg-green-700 text-sm shrink-0"
            >
              {t("export")}
            </Button>
            <Button
              onClick={() => importInputRef.current?.click()}
              className="bg-orange-600 hover:bg-orange-700 text-sm shrink-0"
            >
              {t("import")}
            </Button>
            <Button
              onClick={downloadWarehouseTemplate}
              className="bg-purple-600 hover:bg-purple-700 text-sm shrink-0"
            >
              {t("template")}
            </Button>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.csv"
              onChange={handleImportFile}
              className="hidden"
            />
            <Button
              onClick={openAdd}
              className="bg-blue-500 hover:bg-blue-600 text-sm shrink-0"
            >
              {t("addPart")}
            </Button>
          </div>
        }
      />

      {/* Search + Status Filter */}
      <div className="px-4 sm:px-6 py-3 border-b border-mb-border flex items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mb-silver pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="pl-9 bg-mb-anthracite border-mb-border text-white placeholder:text-mb-silver"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          style={{ backgroundColor: "#1a1a1a", colorScheme: "dark" }}
          className="h-9 border border-mb-border text-white text-sm rounded-md px-3 pr-8 appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-mb-border shrink-0"
        >
          <option value="all">{t("status.all")}</option>
          <option value="inStock">{t("status.inStock")}</option>
          <option value="limited">{t("status.limited")}</option>
          <option value="outOfStock">{t("status.outOfStock")}</option>
        </select>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 sm:px-6 py-2 bg-red-500/10 border-b border-red-500/30">
          <span className="text-sm text-white">{selectedIds.size} избрани</span>
          <Button
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Изтрий избраните
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedIds(new Set())}
            className="border-mb-border text-mb-black hover:text-white"
          >
            Откажи
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-mb-silver">
            <svg
              className="animate-spin w-6 h-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : parts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-mb-silver gap-4">
            <svg
              className="w-12 h-12 opacity-40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <p className="text-sm">{t("noResults")}</p>
            <Button onClick={openAdd} className="bg-blue-500 hover:bg-blue-600">
              {t("addFirstPart")}
            </Button>
          </div>
        ) : (
          <div className="min-w-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-mb-border text-mb-silver text-xs uppercase tracking-wider">
                  <th className="py-2 px-3 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="rounded border-mb-border bg-transparent"
                    />
                  </th>
                  <th className="text-left py-2 px-3 font-medium">
                    {t("columns.name")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.partNumber")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.manufacturer")}
                  </th>
                  <th className="text-center py-2 px-1 font-medium w-16">
                    {t("columns.quantity")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.costPrice")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.salePrice")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.margin")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.status")}
                  </th>
                  <th className="text-center py-2 px-3 font-medium">
                    {t("columns.date")}
                  </th>
                  <th className="text-right py-2 px-3 font-medium">
                    {t("columns.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {parts.map((part) => {
                  const { pct, eur } = computeMargin(part);
                  const dateStr = new Date(part.created_at).toLocaleDateString(
                    "bg-BG",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  );
                  return (
                    <tr
                      key={part.id}
                      className="border-b border-mb-border/50 hover:bg-mb-anthracite/50 transition-colors even:bg-mb-anthracite/20"
                    >
                      <td className="py-2 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(part.id)}
                          onChange={() => toggleSelect(part.id)}
                          className="rounded border-mb-border bg-transparent"
                        />
                      </td>
                      <td
                        className="py-2 px-3 text-white truncate max-w-[260px]"
                        title={part.name}
                      >
                        {part.name}
                      </td>
                      <td
                        className="py-2 px-3 text-mb-silver font-mono truncate max-w-[140px] text-center"
                        title={part.part_number}
                      >
                        {part.part_number}
                      </td>
                      <td className="py-2 px-3 text-mb-silver truncate max-w-[120px] text-center">
                        {part.manufacturer}
                      </td>
                      <td className="py-2 px-1 text-center w-16">
                        <QuantityPopover
                          value={part.quantity}
                          onChange={(qty) => handleQtyUpdate(part.id, qty)}
                          min={0}
                        />
                      </td>
                      <td className="py-2 px-3 text-center text-white tabular-nums">
                        {part.cost_price.toFixed(2)} €
                      </td>
                      <td className="py-2 px-3 text-center text-white tabular-nums">
                        {part.sale_price.toFixed(2)} €
                      </td>
                      <td className="py-2 px-3 text-center tabular-nums">
                        <div className="text-white">{pct}</div>
                        <div className="text-xs text-mb-silver">{eur}</div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <StockStatusBadge qty={part.quantity} />
                      </td>
                      <td className="py-2 px-3 text-white whitespace-nowrap text-center">
                        {dateStr}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(part)}
                            className="h-7 px-2 text-mb-silver hover:text-white hover:bg-mb-anthracite"
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
                            onClick={() => setDeleteConfirmId(part.id)}
                            className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="border-mb-border text-mb-silver hover:text-white"
            >
              ←
            </Button>
            <span className="text-mb-silver text-sm">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="border-mb-border text-mb-silver hover:text-white"
            >
              →
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <WarehousePartModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialValues={editingPart}
        onConfirm={handleModalConfirm}
      />

      {/* Delete Confirm Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("deleteConfirm.title")}
            </DialogTitle>
          </DialogHeader>
          <p className="text-mb-silver text-sm py-2">
            {t("deleteConfirm.description")}
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {t("deleteConfirm.confirm")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmId(null)}
              className="border-gray-300 text-gray-900 hover:bg-gray-100 w-full sm:w-auto"
            >
              {t("deleteConfirm.cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Dialog */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">{t("deleteConfirm.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-mb-silver text-sm py-2">
            Сигурни ли сте, че искате да изтриете {selectedIds.size} части? Това действие е необратимо.
          </p>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={handleBulkDelete}
              disabled={deletePart.isPending}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Изтрий
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBulkDeleteOpen(false)}
              className="border-gray-300 text-gray-900 hover:bg-gray-100 w-full sm:w-auto"
            >
              Отказ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Preview Dialog */}
      <Dialog open={importPreviewOpen} onOpenChange={setImportPreviewOpen}>
        <DialogContent className="bg-mb-anthracite border-mb-border text-white sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t("importPreviewTitle")}
            </DialogTitle>
            <p className="text-mb-silver text-sm">
              {t("importPreviewSubtitle", { count: importPreviewRows.length })}
            </p>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[500px]">
              <thead>
                <tr className="border-b border-mb-border text-mb-silver uppercase tracking-wider">
                  <th className="text-left py-1 px-2">{t("columns.name")}</th>
                  <th className="text-left py-1 px-2">
                    {t("columns.partNumber")}
                  </th>
                  <th className="text-right py-1 px-2">
                    {t("columns.quantity")}
                  </th>
                  <th className="text-right py-1 px-2">
                    {t("columns.costPrice")}
                  </th>
                  <th className="text-right py-1 px-2">
                    {t("columns.salePrice")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {importPreviewRows.map((row, i) => (
                  <tr key={i} className="border-b border-mb-border/30">
                    <td className="py-1 px-2 text-white">{row.name}</td>
                    <td className="py-1 px-2 text-mb-silver font-mono">
                      {row.part_number}
                    </td>
                    <td className="py-1 px-2 text-right">{row.quantity}</td>
                    <td className="py-1 px-2 text-right">{row.cost_price}</td>
                    <td className="py-1 px-2 text-right">{row.sale_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {importRows.length > 10 && (
            <p className="text-mb-silver text-xs mt-2">
              ... and {importRows.length - 10} more rows
            </p>
          )}
          <DialogFooter className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              onClick={handleImportConfirm}
              disabled={upsertParts.isPending}
              className="bg-blue-500 hover:bg-blue-600 w-full sm:w-auto"
            >
              {t("importConfirm", { count: importRows.length })}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportPreviewOpen(false)}
              className="border-mb-border text-mb-silver hover:text-white w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
