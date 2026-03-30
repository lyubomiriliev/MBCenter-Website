"use client";

import { useSearchParams } from "next/navigation";
import { EarningsEditPage } from "@/components/admin/earnings/EarningsEditPage";
import { Suspense } from "react";

function EditPageContent() {
  const searchParams = useSearchParams();
  const workerId = searchParams.get("id");
  const workerType = searchParams.get("type") as "mechanic" | "receptionist";
  const month = parseInt(searchParams.get("month") || "0", 10);
  const year = parseInt(searchParams.get("year") || "0", 10);

  if (!workerId || !workerType || !month || !year) {
    return <div>Invalid parameters</div>;
  }

  return (
    <EarningsEditPage
      workerId={workerId}
      workerType={workerType}
      month={month}
      year={year}
    />
  );
}

export default function EarningsEditRoute() {
  return (
    <Suspense fallback={<div className="p-4 text-mb-silver">Зареждане...</div>}>
      <EditPageContent />
    </Suspense>
  );
}
