"use client";

import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  /** Value as YYYY-MM-DD, the shape the turnover queries use. */
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** Days before this are not selectable. YYYY-MM-DD. */
  min?: string;
  /** Days after this are not selectable. YYYY-MM-DD. */
  max?: string;
  className?: string;
}

/** YYYY-MM-DD → Date, parsed as local time so the day never shifts. */
function parseKey(key: string): Date | undefined {
  if (!key) return undefined;
  const [y, m, d] = key.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Date → YYYY-MM-DD, local, avoiding the toISOString UTC shift. */
function toKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

/**
 * A date field matching the one on the offers list: a button showing the
 * chosen day, opening a calendar. Shared so the log filters and the turnover
 * reports look and behave the same, instead of each using a raw
 * <input type="date"> that renders differently per browser.
 */
export function DateRangeField({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  className,
}: Props) {
  const selected = parseKey(value);
  const minDate = parseKey(min ?? "");
  const maxDate = parseKey(max ?? "");

  return (
    <div className={cn("min-w-0", className)}>
      <label className="text-xs text-mb-silver mb-1.5 block">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal bg-gray-100 text-gray-900 border-mb-border hover:bg-white",
              !selected && "text-gray-500",
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
            {selected ? format(selected, "dd.MM.yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          // z-[210]: the Dialog sits at z-[200], so the default z-50 would
          // render the calendar behind it and it would look like the field
          // simply does not open.
          className="w-auto p-0 bg-mb-anthracite border-mb-border z-[210]"
          align="start"
        >
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(date) => onChange(date ? toKey(date) : "")}
            disabled={
              minDate || maxDate
                ? (date: Date) =>
                    (minDate ? date < minDate : false) ||
                    (maxDate ? date > maxDate : false)
                : undefined
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
