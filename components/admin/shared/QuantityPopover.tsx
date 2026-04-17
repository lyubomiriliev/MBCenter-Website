"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Inline quantity popover - appears when clicking directly on a qty number.
 * showConfirm=true  → shows +/- plus a checkmark save button (direct-click mode)
 * showConfirm=false → shows only +/- (inside Edit Part modal, not used here)
 */
export function QuantityPopover({
  value,
  onChange,
  showConfirm = true,
  min = 1,
}: {
  value: number;
  onChange: (next: number) => void;
  showConfirm?: boolean;
  min?: number;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const commit = () => {
    onChange(Math.max(min, draft));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-flex items-center justify-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="min-w-[28px] text-center text-white text-sm tabular-nums px-1 py-0.5 rounded hover:bg-mb-anthracite transition-colors cursor-pointer"
      >
        {value}
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-50 flex items-center gap-1 bg-mb-anthracite border border-mb-border rounded-lg shadow-xl px-2 py-1.5">
          <button
            type="button"
            onClick={() => setDraft((d) => Math.max(min, d - 1))}
            className="w-7 h-7 flex items-center justify-center rounded bg-mb-black hover:bg-mb-blue/20 text-white text-lg font-bold border border-mb-border transition-colors"
          >
            −
          </button>
          <input
            type="number"
            min={min}
            value={draft}
            onChange={(e) => setDraft(Math.max(min, Number(e.target.value) || min))}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setOpen(false);
            }}
            className="w-12 text-center bg-white text-gray-900 border border-mb-border rounded text-sm py-0.5 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setDraft((d) => d + 1)}
            className="w-7 h-7 flex items-center justify-center rounded bg-mb-black hover:bg-mb-blue/20 text-white text-lg font-bold border border-mb-border transition-colors"
          >
            +
          </button>
          {showConfirm && (
            <button
              type="button"
              onClick={commit}
              className="w-7 h-7 flex items-center justify-center rounded bg-green-600 hover:bg-green-700 text-white border border-green-700 transition-colors"
              aria-label="Confirm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
