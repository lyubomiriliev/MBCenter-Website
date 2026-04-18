"use client";

import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, Suspense } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CheckInspectionForm } from "@/components/admin/forms/CheckInspectionForm";

function EditCheckContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const t = useTranslations("admin");
  const inspectionId = searchParams.get("id");
  const locale = params.locale as string;

  useEffect(() => {
    if (!inspectionId) {
      router.replace(`/${locale}/mb-admin/checks`);
    }
  }, [inspectionId, locale, router]);

  if (!inspectionId) return null;

  return (
    <div className="flex relative flex-col flex-1 min-h-0">
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <AdminHeader
          title={t("checks.editCheck")}
          subtitle={`ID: ${inspectionId.slice(0, 8)}...`}
        />
        <div className="flex bg-black flex-1 min-w-0 min-h-0 overflow-hidden">
          <CheckInspectionForm inspectionId={inspectionId} />
        </div>
      </div>
    </div>
  );
}

export default function EditCheckPage() {
  return (
    <Suspense fallback={<div className="p-4 text-mb-silver">Зареждане...</div>}>
      <EditCheckContent />
    </Suspense>
  );
}
