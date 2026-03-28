"use client";

import { useTranslations } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { CheckInspectionForm } from "@/components/admin/forms/CheckInspectionForm";

export default function CreateCheckPage() {
  const t = useTranslations("admin");

  return (
    <div className="flex relative flex-col flex-1 min-h-0">
      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <AdminHeader
          title={t("checks.createCheck")}
          subtitle={t("checks.createCheckSubtitle")}
        />
        <div className="flex bg-black flex-1 min-w-0 min-h-0 overflow-hidden">
          <CheckInspectionForm />
        </div>
      </div>
    </div>
  );
}
