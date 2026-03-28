"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useNotification } from "@/hooks/useNotification";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { supabase } from "@/lib/supabase/client";
import type { Mechanic } from "@/types/database";

const OFFER_COLUMNS_KEY = "mb_offer_columns_visibility";

const DEFAULT_COLUMNS = {
  offerNumber: true,
  vehicleInfo: true,
  clientInfo: true,
  repairName: true,
  status: true,
  createdAt: true,
  totalGross: true,
  actions: true,
};

type ColumnKey = keyof typeof DEFAULT_COLUMNS;

const COLUMN_LABELS: Record<ColumnKey, { bg: string; en: string }> = {
  offerNumber: { bg: "Номер на оферта", en: "Offer Number" },
  vehicleInfo: { bg: "Автомобил", en: "Vehicle" },
  clientInfo: { bg: "Клиент", en: "Client" },
  repairName: { bg: "Наименование на ремонт", en: "Repair Name" },
  status: { bg: "Статус", en: "Status" },
  createdAt: { bg: "Дата", en: "Date" },
  totalGross: { bg: "Обща стойност", en: "Total Value" },
  actions: { bg: "Действия", en: "Actions" },
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-mb-anthracite border border-mb-border rounded-xl p-6">
      <h2 className="text-white font-semibold text-base mb-5 pb-4 border-b border-mb-border">
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-mb-silver">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-mb-black border border-mb-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-mb-silver/50 focus:outline-none focus:ring-1 focus:ring-mb-blue"
      />
      {hint && <p className="text-xs text-mb-silver/60">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const locale = useLocale();
  const { user } = useSupabaseAuthContext();
  const { notifications, dismiss, showSuccess, showError } = useNotification();

  // My account
  const [myEmail, setMyEmail] = useState("");
  const [myOldPassword, setMyOldPassword] = useState("");
  const [myNewPassword, setMyNewPassword] = useState("");
  const [myConfirmPassword, setMyConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Service account password reset
  const [resetEmail, setResetEmail] = useState("");
  const [sendingReset, setSendingReset] = useState(false);

  // Column visibility
  const [columns, setColumns] = useState<Record<ColumnKey, boolean>>(DEFAULT_COLUMNS);

  // Mechanics management
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [mechanicsLoading, setMechanicsLoading] = useState(true);
  const [newMechanicName, setNewMechanicName] = useState("");
  const [savingMechanic, setSavingMechanic] = useState(false);
  const [deletingMechanicId, setDeletingMechanicId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setMyEmail(user.email);
  }, [user]);

  useEffect(() => {
    const stored = localStorage.getItem(OFFER_COLUMNS_KEY);
    if (stored) {
      try {
        setColumns({ ...DEFAULT_COLUMNS, ...JSON.parse(stored) });
      } catch {}
    }
  }, []);

  // Load mechanics from Supabase
  useEffect(() => {
    const loadMechanics = async () => {
      setMechanicsLoading(true);
      const { data, error } = await supabase
        .from("mechanics")
        .select("*")
        .order("sort_order", { ascending: true });
      setMechanicsLoading(false);
      if (!error && data) setMechanics(data as Mechanic[]);
    };
    loadMechanics();
  }, []);

  const handleAddMechanic = async () => {
    const name = newMechanicName.trim();
    if (!name) return;
    setSavingMechanic(true);
    const maxOrder = mechanics.length > 0 ? Math.max(...mechanics.map((m) => m.sort_order)) : -1;
    const { data, error } = await supabase
      .from("mechanics")
      .insert({ name, sort_order: maxOrder + 1 } as never)
      .select()
      .single();
    setSavingMechanic(false);
    if (error) {
      showError(isBg ? "Грешка при добавяне" : "Error adding mechanic");
    } else {
      setMechanics((prev) => [...prev, data as Mechanic]);
      setNewMechanicName("");
      showSuccess(isBg ? "Механикът е добавен" : "Mechanic added");
    }
  };

  const handleDeleteMechanic = async (id: string) => {
    setDeletingMechanicId(id);
    const { error } = await supabase.from("mechanics").delete().eq("id", id);
    setDeletingMechanicId(null);
    if (error) {
      showError(isBg ? "Грешка при изтриване" : "Error deleting mechanic");
    } else {
      setMechanics((prev) => prev.filter((m) => m.id !== id));
      showSuccess(isBg ? "Механикът е изтрит" : "Mechanic deleted");
    }
  };

  const handleUpdateEmail = async () => {
    if (!myEmail.trim()) return;
    setSavingEmail(true);
    const { error } = await supabase.auth.updateUser({ email: myEmail.trim() });
    setSavingEmail(false);
    if (error) {
      showError(isBg ? "Грешка при смяна на имейл" : "Error updating email");
    } else {
      showSuccess(
        isBg
          ? "Изпратен е имейл за потвърждение на новия адрес"
          : "Confirmation email sent to the new address"
      );
    }
  };

  const handleUpdatePassword = async () => {
    if (!myOldPassword) {
      showError(isBg ? "Въведете текущата парола" : "Enter your current password");
      return;
    }
    if (!myNewPassword) return;
    if (myNewPassword !== myConfirmPassword) {
      showError(isBg ? "Паролите не съвпадат" : "Passwords do not match");
      return;
    }
    if (myNewPassword.length < 6) {
      showError(
        isBg ? "Паролата трябва да е поне 6 символа" : "Password must be at least 6 characters"
      );
      return;
    }
    setSavingPassword(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email ?? "",
      password: myOldPassword,
    });
    if (signInError) {
      setSavingPassword(false);
      showError(isBg ? "Грешна текуща парола" : "Incorrect current password");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: myNewPassword });
    setSavingPassword(false);
    if (error) {
      showError(isBg ? "Грешка при смяна на парола" : "Error updating password");
    } else {
      setMyOldPassword("");
      setMyNewPassword("");
      setMyConfirmPassword("");
      showSuccess(isBg ? "Паролата е сменена успешно" : "Password updated successfully");
    }
  };

  const handleSendReset = async () => {
    if (!resetEmail.trim()) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/${locale}/admin-login`,
    });
    setSendingReset(false);
    if (error) {
      showError(isBg ? "Грешка при изпращане" : "Error sending reset email");
    } else {
      showSuccess(
        isBg
          ? `Линк за нова парола е изпратен на ${resetEmail}`
          : `Password reset link sent to ${resetEmail}`
      );
      setResetEmail("");
    }
  };

  const toggleColumn = (key: ColumnKey) => {
    const updated = { ...columns, [key]: !columns[key] };
    setColumns(updated);
    localStorage.setItem(OFFER_COLUMNS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage", { key: OFFER_COLUMNS_KEY }));
  };

  const isBg = locale === "bg";

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title={isBg ? "Настройки" : "Settings"}
        subtitle={isBg ? "Управление на акаунти и предпочитания" : "Account management and preferences"}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-3xl">

        {/* My Account */}
        <SectionCard title={isBg ? "Моят акаунт" : "My Account"}>
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wider text-mb-silver/50 font-medium">
                {isBg ? "Смяна на имейл" : "Change Email"}
              </p>
              <InputField
                label={isBg ? "Нов имейл адрес" : "New email address"}
                type="email"
                value={myEmail}
                onChange={setMyEmail}
                placeholder="example@email.com"
                hint={
                  isBg
                    ? "Ще получите имейл за потвърждение на новия адрес"
                    : "You will receive a confirmation email at the new address"
                }
              />
              <Button
                type="button"
                onClick={handleUpdateEmail}
                disabled={savingEmail || !myEmail.trim()}
                className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50"
              >
                {savingEmail ? (isBg ? "Запазване..." : "Saving...") : (isBg ? "Смени имейл" : "Update Email")}
              </Button>
            </div>

            <div className="border-t border-mb-border pt-5 space-y-3">
              <p className="text-xs uppercase tracking-wider text-mb-silver/50 font-medium">
                {isBg ? "Смяна на парола" : "Change Password"}
              </p>
              <InputField
                label={isBg ? "Текуща парола" : "Current password"}
                type="password"
                value={myOldPassword}
                onChange={setMyOldPassword}
                placeholder="••••••••"
              />
              <InputField
                label={isBg ? "Нова парола" : "New password"}
                type="password"
                value={myNewPassword}
                onChange={setMyNewPassword}
                placeholder="••••••••"
              />
              <InputField
                label={isBg ? "Потвърди нова парола" : "Confirm new password"}
                type="password"
                value={myConfirmPassword}
                onChange={setMyConfirmPassword}
                placeholder="••••••••"
              />
              <Button
                type="button"
                onClick={handleUpdatePassword}
                disabled={savingPassword || !myNewPassword}
                className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50"
              >
                {savingPassword ? (isBg ? "Запазване..." : "Saving...") : (isBg ? "Смени парола" : "Update Password")}
              </Button>
            </div>
          </div>
        </SectionCard>

        {/* Service Account */}
        <SectionCard title={isBg ? "Сервизен акаунт" : "Service Account"}>
          <p className="text-mb-silver/70 text-sm mb-5">
            {isBg
              ? "Изпратете линк за нова парола на имейла на сервизния акаунт."
              : "Send a password reset link to the service account's email."}
          </p>

          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wider text-mb-silver/50 font-medium">
              {isBg ? "Изпрати линк за нова парола" : "Send Password Reset Link"}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder={isBg ? "Имейл на акаунта..." : "Account email..."}
                className="flex-1 bg-mb-black border border-mb-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-mb-silver/50 focus:outline-none focus:ring-1 focus:ring-mb-blue"
              />
              <Button
                type="button"
                onClick={handleSendReset}
                disabled={sendingReset || !resetEmail.trim()}
                className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 shrink-0"
              >
                {sendingReset ? (isBg ? "Изпращане..." : "Sending...") : (isBg ? "Изпрати" : "Send")}
              </Button>
            </div>
            <p className="text-xs text-mb-silver/60">
              {isBg
                ? "Акаунтът ще получи имейл с линк за смяна на паролата."
                : "The account will receive an email with a link to reset their password."}
            </p>
          </div>
        </SectionCard>

        {/* Mechanics Management */}
        <SectionCard title={isBg ? "Механици" : "Mechanics"}>
          <p className="text-mb-silver/70 text-sm mb-5">
            {isBg
              ? "Механиците по-долу се появяват в падащото меню \"Изпълнено от\" при редакция на оферта."
              : "The mechanics below appear in the \"Performed by\" dropdown when editing an offer."}
          </p>

          {/* Add mechanic */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newMechanicName}
              onChange={(e) => setNewMechanicName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddMechanic()}
              placeholder={isBg ? "Име на механик..." : "Mechanic name..."}
              className="flex-1 bg-mb-black border border-mb-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-mb-silver/50 focus:outline-none focus:ring-1 focus:ring-mb-blue"
            />
            <Button
              type="button"
              onClick={handleAddMechanic}
              disabled={savingMechanic || !newMechanicName.trim()}
              className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 shrink-0"
            >
              {savingMechanic
                ? (isBg ? "Добавяне..." : "Adding...")
                : (isBg ? "Добави" : "Add")}
            </Button>
          </div>

          {/* List of mechanics */}
          {mechanicsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-mb-black/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : mechanics.length === 0 ? (
            <p className="text-mb-silver/50 text-sm text-center py-4">
              {isBg ? "Няма добавени механици" : "No mechanics added yet"}
            </p>
          ) : (
            <div className="space-y-2">
              {mechanics.map((mechanic) => (
                <div
                  key={mechanic.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-mb-black border border-mb-border"
                >
                  <span className="text-sm text-white">{mechanic.name}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteMechanic(mechanic.id)}
                    disabled={deletingMechanicId === mechanic.id}
                    className="text-mb-silver/60 hover:text-red-400 transition-colors disabled:opacity-40 p-1 rounded"
                    title={isBg ? "Изтрий" : "Delete"}
                  >
                    {deletingMechanicId === mechanic.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Offer Table Columns */}
        <SectionCard title={isBg ? "Колони в таблицата с оферти" : "Offer Table Columns"}>
          <p className="text-mb-silver/70 text-sm mb-4">
            {isBg
              ? "Изберете кои колони да се показват в списъка с оферти"
              : "Choose which columns to display in the offers list"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(Object.keys(DEFAULT_COLUMNS) as ColumnKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleColumn(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors text-left ${
                  columns[key]
                    ? "border-mb-blue bg-mb-blue/10 text-white"
                    : "border-mb-border bg-transparent text-mb-silver hover:border-mb-silver/50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                    columns[key] ? "border-mb-blue bg-mb-blue" : "border-mb-silver/50"
                  }`}
                >
                  {columns[key] && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {isBg ? COLUMN_LABELS[key].bg : COLUMN_LABELS[key].en}
              </button>
            ))}
          </div>
        </SectionCard>

      </div>

      {notifications.map((n) => (
        <Toast key={n.id} type={n.type} message={n.message} onClose={() => dismiss(n.id)} />
      ))}
    </div>
  );
}
