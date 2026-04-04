"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { OfferStatus } from "@/types/database";

interface OfferFiltersProps {
  onFiltersChange?: (filters: {
    status: OfferStatus | "all";
    search: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) => void;
}

const FILTERS_SESSION_KEY = "mb_offers_filters";

function saveFilters(filters: {
  status: OfferStatus | "all";
  search: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  sessionStorage.setItem(FILTERS_SESSION_KEY, JSON.stringify(filters));
}

function loadFilters() {
  try {
    const raw = sessionStorage.getItem(FILTERS_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as {
      status: OfferStatus | "all";
      search: string;
      dateFrom?: string;
      dateTo?: string;
    };
  } catch {
    return null;
  }
}

export function clearOfferFilters() {
  sessionStorage.removeItem(FILTERS_SESSION_KEY);
}

export function OfferFilters({ onFiltersChange }: OfferFiltersProps) {
  const t = useTranslations("admin.offers");
  const [status, setStatus] = useState<OfferStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  // Restore from sessionStorage on mount
  useEffect(() => {
    const saved = loadFilters();
    if (!saved) return;
    const restoredDateFrom = saved.dateFrom
      ? new Date(saved.dateFrom)
      : undefined;
    const restoredDateTo = saved.dateTo ? new Date(saved.dateTo) : undefined;
    setStatus(saved.status);
    setSearch(saved.search);
    setDateFrom(restoredDateFrom);
    setDateTo(restoredDateTo);
    onFiltersChange?.({
      status: saved.status,
      search: saved.search,
      dateFrom: restoredDateFrom,
      dateTo: restoredDateTo,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (value: OfferStatus | "all") => {
    setStatus(value);
    saveFilters({
      status: value,
      search,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    });
    onFiltersChange?.({ status: value, search, dateFrom, dateTo });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    saveFilters({
      status,
      search: value,
      dateFrom: dateFrom?.toISOString(),
      dateTo: dateTo?.toISOString(),
    });
    onFiltersChange?.({ status, search: value, dateFrom, dateTo });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date);
    saveFilters({
      status,
      search,
      dateFrom: date?.toISOString(),
      dateTo: dateTo?.toISOString(),
    });
    onFiltersChange?.({ status, search, dateFrom: date, dateTo });
  };

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date);
    saveFilters({
      status,
      search,
      dateFrom: dateFrom?.toISOString(),
      dateTo: date?.toISOString(),
    });
    onFiltersChange?.({ status, search, dateFrom, dateTo: date });
  };

  const handleClearFilters = () => {
    setStatus("all");
    setSearch("");
    setDateFrom(undefined);
    setDateTo(undefined);
    clearOfferFilters();
    onFiltersChange?.({
      status: "all",
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters = status !== "all" || search || dateFrom || dateTo;

  return (
    <div className="relative bg-mb-anthracite border border-mb-border rounded-lg p-4 overflow-hidden">
      {/* Decorative car image */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <Image
          src="/assets/images/mb-pattern.webp"
          alt=""
          fill
          className="object-cover object-right opacity-[0.15] scale-100 translate-x-1/3"
          priority={false}
        />
      </div>
      <div className="relative z-10 flex flex-col 2xl:flex-row gap-3">
        {/* Row 1: Search + Status (side by side on all sizes) — on 2xl+ merges with date row */}
        <div className="flex gap-3 items-end">
          {/* Search */}
          <div className="flex-1 min-w-0 2xl:w-80 2xl:flex-none">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {t("filters.search")}
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mb-silver"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder={t("filters.searchPlaceholder")}
                className="pl-10 bg-gray-100 text-gray-900 border-mb-border placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Status */}
          <div className="w-[160px] shrink-0">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {t("filters.status")}
            </label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger className="bg-gray-100 text-gray-900 border-mb-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 text-mb-anthracite border-mb-border">
                <SelectItem value="all">{t("filters.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="sent">{t("status.sent")}</SelectItem>
                <SelectItem value="parts_ordered">
                  {t("status.parts_ordered")}
                </SelectItem>
                <SelectItem value="finished">{t("status.finished")}</SelectItem>
                <SelectItem value="cancelled">
                  {t("status.cancelled")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Date From + Date To (+ clear button) — on 2xl+ sits inline with row 1 */}
        <div className="flex gap-3 items-end flex-1 min-w-0">
          {/* Date From */}
          <div className="flex-1 min-w-0 2xl:w-44 2xl:flex-none">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {t("filters.dateFrom")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-100 text-gray-900 border-mb-border",
                    !dateFrom && "text-gray-500",
                  )}
                >
                  <svg
                    className="mr-2 h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dateFrom
                    ? format(dateFrom, "dd.MM.yyyy")
                    : t("filters.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-mb-anthracite border-mb-border"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="flex-1 min-w-0 2xl:w-44 2xl:flex-none">
            <label className="text-xs text-mb-silver mb-1.5 block">
              {t("filters.dateTo")}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-100 text-gray-900 border-mb-border",
                    !dateTo && "text-gray-500",
                  )}
                >
                  <svg
                    className="mr-2 h-4 w-4 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {dateTo
                    ? format(dateTo, "dd.MM.yyyy")
                    : t("filters.selectDate")}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-mb-anthracite border-mb-border"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleClearFilters}
              className="text-mb-silver hover:text-white shrink-0"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              {t("filters.clear")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
