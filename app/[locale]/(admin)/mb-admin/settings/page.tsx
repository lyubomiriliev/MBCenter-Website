"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { useNotification } from "@/hooks/useNotification";
import { useSupabaseAuthContext } from "@/components/admin/SupabaseAuthContext";
import { authClient as supabase } from "@/lib/supabase/client";
import type { Mechanic, Receptionist } from "@/types/database";


function getColumnsKey(account: string) {
  return `mb_offer_columns_visibility_${account}`;
}

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

type AccountKey = "admin" | "reception" | "mechanic";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-mb-silver/70 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-mb-black border border-mb-border rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder:text-mb-silver/40 focus:outline-none focus:ring-1 focus:ring-mb-blue"
        />
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShow((v) => !v);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver/50 hover:text-white transition-colors"
          tabIndex={-1}
        >
          {show ? (
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
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
              />
            </svg>
          ) : (
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      </div>
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
  suffix,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-mb-silver/70 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-mb-black border border-mb-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-mb-silver/40 focus:outline-none focus:ring-1 focus:ring-mb-blue ${suffix ? "pr-10" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mb-silver/60 text-xs font-medium">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-mb-silver/50">{hint}</p>}
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-mb-silver/40">
          {title}
        </span>
        <div className="flex-1 h-px bg-mb-border" />
      </div>
      {children}
    </div>
  );
}

function PersonList({
  loading,
  items,
  deletingId,
  onDelete,
  emptyLabel,
  deleteLabel,
}: {
  loading: boolean;
  items: { id: string; name: string }[];
  deletingId: string | null;
  onDelete: (id: string) => void;
  emptyLabel: string;
  deleteLabel: string;
}) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-11 bg-mb-black/50 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p className="text-mb-silver/40 text-sm text-center py-5 border border-dashed border-mb-border rounded-lg">
        {emptyLabel}
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-mb-black border border-mb-border group hover:border-mb-border/80 transition-colors"
        >
          <span className="text-sm text-white">{item.name}</span>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={deletingId === item.id}
            className="text-mb-silver/40 hover:text-red-400 transition-colors disabled:opacity-40 p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
            title={deleteLabel}
          >
            {deletingId === item.id ? (
              <svg
                className="w-4 h-4 animate-spin"
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
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

function AddPersonRow({
  value,
  onChange,
  onAdd,
  placeholder,
  saving,
  addLabel,
  addingLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  onAdd: () => void;
  placeholder: string;
  saving: boolean;
  addLabel: string;
  addingLabel: string;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onAdd()}
        placeholder={placeholder}
        className="flex-1 bg-mb-black border border-mb-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-mb-silver/40 focus:outline-none focus:ring-1 focus:ring-mb-blue"
      />
      <Button
        type="button"
        onClick={onAdd}
        disabled={saving || !value.trim()}
        className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 shrink-0 px-4"
      >
        {saving ? addingLabel : addLabel}
      </Button>
    </div>
  );
}

type TabId = "account" | "team" | "display" | "earnings";

export default function SettingsPage() {
  const locale = useLocale();
  const { user } = useSupabaseAuthContext();
  const { notifications, dismiss, showSuccess, showError } = useNotification();

  const [activeTab, setActiveTab] = useState<TabId>("account");

  const ACCOUNT_EMAILS: Record<AccountKey, string | null> = {
    admin: null,
    reception: "reception@mbcenter.bg",
    mechanic: "service@mbcenter.bg",
  };

  // Account selector
  const [selectedAccount, setSelectedAccount] = useState<AccountKey>("admin");
  const [sendingReset, setSendingReset] = useState(false);

  // Admin account fields
  const [myEmail, setMyEmail] = useState("");
  const [myOldPassword, setMyOldPassword] = useState("");
  const [myNewPassword, setMyNewPassword] = useState("");
  const [myConfirmPassword, setMyConfirmPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Non-admin account fields (reception / mechanic)
  const [otherNewEmail, setOtherNewEmail] = useState("");
  const [otherNewPassword, setOtherNewPassword] = useState("");
  const [otherConfirmPassword, setOtherConfirmPassword] = useState("");
  const [savingOtherEmail, setSavingOtherEmail] = useState(false);
  const [savingOtherPassword, setSavingOtherPassword] = useState(false);

  // Column visibility
  const [selectedAccountForColumns, setSelectedAccountForColumns] =
    useState<AccountKey>("admin");
  const [columns, setColumns] =
    useState<Record<ColumnKey, boolean>>(DEFAULT_COLUMNS);

  // Mechanics
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [mechanicsLoading, setMechanicsLoading] = useState(true);
  const [newMechanicName, setNewMechanicName] = useState("");
  const [savingMechanic, setSavingMechanic] = useState(false);
  const [deletingMechanicId, setDeletingMechanicId] = useState<string | null>(
    null,
  );

  // Document creators
  const [creators, setCreators] = useState<string[]>([]);
  const [newCreatorName, setNewCreatorName] = useState("");

  // Earnings
  const [mechanicEarningsRate, setMechanicEarningsRate] = useState("");
  const [receptionistEarningsPercent, setReceptionistEarningsPercent] =
    useState("");
  const [savingEarnings, setSavingEarnings] = useState(false);

  // Receptionists
  const [receptionistsList, setReceptionistsList] = useState<Receptionist[]>(
    [],
  );
  const [receptionistsLoading, setReceptionistsLoading] = useState(true);
  const [newReceptionistName, setNewReceptionistName] = useState("");
  const [savingReceptionist, setSavingReceptionist] = useState(false);
  const [deletingReceptionistId, setDeletingReceptionistId] = useState<
    string | null
  >(null);

  const isBg = locale === "bg";

  useEffect(() => {
    if (user?.email) setMyEmail(user.email);
  }, [user]);

  useEffect(() => {
    const key = getColumnsKey(selectedAccountForColumns);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        setColumns({ ...DEFAULT_COLUMNS, ...JSON.parse(stored) });
      } catch {
        setColumns(DEFAULT_COLUMNS);
      }
    } else {
      setColumns(DEFAULT_COLUMNS);
    }
  }, [selectedAccountForColumns]);

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await (supabase.from("app_settings").select("*") as any);
      if (data) {
        const mech = data.find((s: any) => s.key === "mechanic_rate")?.value;
        const rec = data.find((s: any) => s.key === "receptionist_pct")?.value;
        if (mech !== undefined) setMechanicEarningsRate(String(mech));
        if (rec !== undefined) setReceptionistEarningsPercent(String(rec));
        const creatorsRow = data.find((s: any) => s.key === "document_creators");
        if (creatorsRow?.value_text) {
          try {
            setCreators(JSON.parse(creatorsRow.value_text));
          } catch {}
        }
      }
    };
    loadSettings();
  }, []);

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

  useEffect(() => {
    const loadReceptionists = async () => {
      setReceptionistsLoading(true);
      const { data, error } = await supabase
        .from("receptionists")
        .select("*")
        .order("sort_order", { ascending: true });
      setReceptionistsLoading(false);
      if (!error && data) setReceptionistsList(data as Receptionist[]);
    };
    loadReceptionists();
  }, []);

  const handleAddMechanic = async () => {
    const name = newMechanicName.trim();
    if (!name) return;
    setSavingMechanic(true);
    const maxOrder =
      mechanics.length > 0
        ? Math.max(...mechanics.map((m) => m.sort_order))
        : -1;
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

  const handleAddReceptionist = async () => {
    const name = newReceptionistName.trim();
    if (!name) return;
    setSavingReceptionist(true);
    const maxOrder =
      receptionistsList.length > 0
        ? Math.max(...receptionistsList.map((r) => r.sort_order))
        : -1;
    const { data, error } = await supabase
      .from("receptionists")
      .insert({ name, sort_order: maxOrder + 1 } as never)
      .select()
      .single();
    setSavingReceptionist(false);
    if (error) {
      showError(isBg ? "Грешка при добавяне" : "Error adding receptionist");
    } else {
      setReceptionistsList((prev) => [...prev, data as Receptionist]);
      setNewReceptionistName("");
      showSuccess(isBg ? "Приемчикът е добавен" : "Receptionist added");
    }
  };

  const handleDeleteReceptionist = async (id: string) => {
    setDeletingReceptionistId(id);
    const { error } = await supabase
      .from("receptionists")
      .delete()
      .eq("id", id);
    setDeletingReceptionistId(null);
    if (error) {
      showError(isBg ? "Грешка при изтриване" : "Error deleting receptionist");
    } else {
      setReceptionistsList((prev) => prev.filter((r) => r.id !== id));
      showSuccess(isBg ? "Приемчикът е изтрит" : "Receptionist deleted");
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
          : "Confirmation email sent to the new address",
      );
    }
  };

  const handleUpdatePassword = async () => {
    if (!myOldPassword) {
      showError(
        isBg ? "Въведете текущата парола" : "Enter your current password",
      );
      return;
    }
    if (!myNewPassword) return;
    if (myNewPassword !== myConfirmPassword) {
      showError(isBg ? "Паролите не съвпадат" : "Passwords do not match");
      return;
    }
    if (myNewPassword.length < 6) {
      showError(
        isBg
          ? "Паролата трябва да е поне 6 символа"
          : "Password must be at least 6 characters",
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
    const { error } = await supabase.auth.updateUser({
      password: myNewPassword,
    });
    setSavingPassword(false);
    if (error) {
      showError(
        isBg ? "Грешка при смяна на парола" : "Error updating password",
      );
    } else {
      setMyOldPassword("");
      setMyNewPassword("");
      setMyConfirmPassword("");
      showSuccess(
        isBg ? "Паролата е сменена успешно" : "Password updated successfully",
      );
    }
  };

  const handleSendReset = async (email: string) => {
    if (!email.trim()) return;
    setSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/${locale}/admin-login`,
    });
    setSendingReset(false);
    if (error) {
      showError(isBg ? "Грешка при изпращане" : "Error sending reset email");
    } else {
      showSuccess(
        isBg
          ? `Линк за нова парола е изпратен на ${email}`
          : `Password reset link sent to ${email}`,
      );
    }
  };

  const handleUpdateOtherEmail = async () => {
    const currentEmail = ACCOUNT_EMAILS[selectedAccount];
    if (!currentEmail || !otherNewEmail.trim()) return;
    setSavingOtherEmail(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, newEmail: otherNewEmail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showSuccess(
        isBg
          ? "Имейлът е сменен успешно"
          : "Email updated successfully",
      );
      setOtherNewEmail("");
    } catch (err: any) {
      showError(
        isBg
          ? `Грешка при смяна на имейл: ${err.message}`
          : `Error updating email: ${err.message}`,
      );
    } finally {
      setSavingOtherEmail(false);
    }
  };

  const handleUpdateOtherPassword = async () => {
    const currentEmail = ACCOUNT_EMAILS[selectedAccount];
    if (!currentEmail || !otherNewPassword) return;
    if (otherNewPassword !== otherConfirmPassword) {
      showError(isBg ? "Паролите не съвпадат" : "Passwords do not match");
      return;
    }
    if (otherNewPassword.length < 6) {
      showError(
        isBg
          ? "Паролата трябва да е поне 6 символа"
          : "Password must be at least 6 characters",
      );
      return;
    }
    setSavingOtherPassword(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentEmail, newPassword: otherNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showSuccess(
        isBg
          ? "Паролата е сменена успешно"
          : "Password updated successfully",
      );
      setOtherNewPassword("");
      setOtherConfirmPassword("");
    } catch (err: any) {
      showError(
        isBg
          ? `Грешка при смяна на парола: ${err.message}`
          : `Error updating password: ${err.message}`,
      );
    } finally {
      setSavingOtherPassword(false);
    }
  };

  const toggleColumn = (key: ColumnKey) => {
    const updated = { ...columns, [key]: !columns[key] };
    setColumns(updated);
    const storageKey = getColumnsKey(selectedAccountForColumns);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    window.dispatchEvent(new StorageEvent("storage", { key: storageKey }));
  };

  const handleAddCreator = async () => {
    const name = newCreatorName.trim();
    if (!name || creators.includes(name)) return;
    const updated = [...creators, name];
    setCreators(updated);
    setNewCreatorName("");
    await (supabase.from("app_settings") as any).upsert(
      { key: "document_creators", value_text: JSON.stringify(updated) },
      { onConflict: "key" }
    );
    showSuccess(isBg ? "Създателят е добавен" : "Creator added");
  };

  const handleDeleteCreator = async (name: string) => {
    const updated = creators.filter((c) => c !== name);
    setCreators(updated);
    await (supabase.from("app_settings") as any).upsert(
      { key: "document_creators", value_text: JSON.stringify(updated) },
      { onConflict: "key" }
    );
    showSuccess(isBg ? "Създателят е премахнат" : "Creator removed");
  };

  const handleSaveEarnings = async () => {
    setSavingEarnings(true);
    const { error: err1 } = await supabase.from("app_settings").upsert(
      {
        key: "mechanic_rate",
        value: Number(mechanicEarningsRate) || 0,
      } as any,
      { onConflict: "key" },
    );
    const { error: err2 } = await supabase.from("app_settings").upsert(
      {
        key: "receptionist_pct",
        value: Number(receptionistEarningsPercent) || 0,
      } as any,
      { onConflict: "key" },
    );
    setSavingEarnings(false);
    if (err1 || err2) {
      showError(isBg ? "Грешка при запазване" : "Error saving settings");
    } else {
      showSuccess(
        isBg
          ? "Настройките за заплащане са запазени"
          : "Earnings settings saved",
      );
    }
  };

  const accountOptions: { value: AccountKey; label: string }[] = [
    { value: "admin", label: isBg ? "Админ" : "Admin" },
    { value: "reception", label: isBg ? "Приемчик" : "Receptionist" },
    { value: "mechanic", label: isBg ? "Механик" : "Mechanic" },
  ];

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    {
      id: "account",
      label: isBg ? "Акаунт" : "Account",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "team",
      label: isBg ? "Екип" : "Team",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "display",
      label: isBg ? "Изглед" : "Display",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
          />
        </svg>
      ),
    },
    {
      id: "earnings",
      label: isBg ? "Заплащане" : "Earnings",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader
        title={isBg ? "Настройки" : "Settings"}
        subtitle={
          isBg
            ? "Управление на акаунти и предпочитания"
            : "Account management and preferences"
        }
      />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl w-full">
        {/* Tab bar */}
        <div className="flex gap-1 bg-mb-anthracite border border-mb-border rounded-xl p-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-mb-blue text-white shadow-sm"
                  : "text-mb-silver/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Account tab */}
        {activeTab === "account" && (
          <div className="space-y-6">
            {/* Account selector */}
            <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
              <SubSection title={isBg ? "Избор на акаунт" : "Select Account"}>
                <div className="grid grid-cols-3 gap-2">
                  {accountOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSelectedAccount(opt.value);
                        setOtherNewEmail("");
                        setOtherNewPassword("");
                        setOtherConfirmPassword("");
                      }}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        selectedAccount === opt.value
                          ? "border-mb-blue bg-mb-blue/10 text-white"
                          : "border-mb-border text-mb-silver/60 hover:text-white hover:border-mb-silver/40"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </SubSection>
            </div>

            {/* Admin-only fields */}
            {selectedAccount === "admin" && (
              <>
                <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
                  <SubSection title={isBg ? "Смяна на имейл" : "Change Email"}>
                    <InputField
                      label={isBg ? "Нов имейл адрес" : "New email address"}
                      type="email"
                      value={myEmail}
                      onChange={setMyEmail}
                      placeholder="example@email.com"
                      hint={
                        isBg
                          ? "Ще получите имейл за потвърждение"
                          : "You will receive a confirmation email"
                      }
                    />
                    <Button
                      type="button"
                      onClick={handleUpdateEmail}
                      disabled={savingEmail || !myEmail.trim()}
                      className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {savingEmail
                        ? isBg
                          ? "Запазване..."
                          : "Saving..."
                        : isBg
                          ? "Смени имейл"
                          : "Update Email"}
                    </Button>
                  </SubSection>
                </div>

                <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
                  <SubSection
                    title={isBg ? "Смяна на парола" : "Change Password"}
                  >
                    <PasswordField
                      label={isBg ? "Текуща парола" : "Current password"}
                      value={myOldPassword}
                      onChange={setMyOldPassword}
                      placeholder="••••••••"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordField
                        label={isBg ? "Нова парола" : "New password"}
                        value={myNewPassword}
                        onChange={setMyNewPassword}
                        placeholder="••••••••"
                      />
                      <PasswordField
                        label={isBg ? "Потвърди парола" : "Confirm password"}
                        value={myConfirmPassword}
                        onChange={setMyConfirmPassword}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleUpdatePassword}
                      disabled={savingPassword || !myNewPassword}
                      className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {savingPassword
                        ? isBg
                          ? "Запазване..."
                          : "Saving..."
                        : isBg
                          ? "Смени парола"
                          : "Update Password"}
                    </Button>
                  </SubSection>
                </div>
              </>
            )}

            {/* Email & password change for non-admin accounts */}
            {selectedAccount !== "admin" && (
              <>
                <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
                  <SubSection title={isBg ? "Смяна на имейл" : "Change Email"}>
                    <p className="text-sm text-mb-silver/60">
                      {isBg
                        ? `Текущ имейл: ${ACCOUNT_EMAILS[selectedAccount]}`
                        : `Current email: ${ACCOUNT_EMAILS[selectedAccount]}`}
                    </p>
                    <InputField
                      label={isBg ? "Нов имейл адрес" : "New email address"}
                      type="email"
                      value={otherNewEmail}
                      onChange={setOtherNewEmail}
                      placeholder="example@email.com"
                    />
                    <Button
                      type="button"
                      onClick={handleUpdateOtherEmail}
                      disabled={savingOtherEmail || !otherNewEmail.trim()}
                      className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {savingOtherEmail
                        ? isBg
                          ? "Запазване..."
                          : "Saving..."
                        : isBg
                          ? "Смени имейл"
                          : "Update Email"}
                    </Button>
                  </SubSection>
                </div>

                <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
                  <SubSection
                    title={isBg ? "Смяна на парола" : "Change Password"}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PasswordField
                        label={isBg ? "Нова парола" : "New password"}
                        value={otherNewPassword}
                        onChange={setOtherNewPassword}
                        placeholder="••••••••"
                      />
                      <PasswordField
                        label={isBg ? "Потвърди парола" : "Confirm password"}
                        value={otherConfirmPassword}
                        onChange={setOtherConfirmPassword}
                        placeholder="••••••••"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleUpdateOtherPassword}
                      disabled={savingOtherPassword || !otherNewPassword}
                      className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 w-full sm:w-auto"
                    >
                      {savingOtherPassword
                        ? isBg
                          ? "Запазване..."
                          : "Saving..."
                        : isBg
                          ? "Смени парола"
                          : "Update Password"}
                    </Button>
                  </SubSection>
                </div>
              </>
            )}
          </div>
        )}

        {/* Team tab */}
        {activeTab === "team" && (
          <div className="space-y-6">
            {/* Document Creators */}
            <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
              <SubSection
                title={isBg ? "Създатели на документи" : "Document Creators"}
              >
                <p className="text-sm text-mb-silver/60">
                  {isBg
                    ? 'Появяват се в полето "Създадена от" при нова оферта.'
                    : 'Appear in the "Created by" field when creating a new offer.'}
                </p>
                <AddPersonRow
                  value={newCreatorName}
                  onChange={setNewCreatorName}
                  onAdd={handleAddCreator}
                  placeholder={isBg ? "Име на създател..." : "Creator name..."}
                  saving={false}
                  addLabel={isBg ? "Добави" : "Add"}
                  addingLabel={isBg ? "Добавяне..." : "Adding..."}
                />
                {creators.length === 0 ? (
                  <p className="text-mb-silver/40 text-sm text-center py-5 border border-dashed border-mb-border rounded-lg">
                    {isBg ? "Няма добавени създатели" : "No creators added yet"}
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {creators.map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-mb-black border border-mb-border group hover:border-mb-border/80 transition-colors"
                      >
                        <span className="text-sm text-white">{name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCreator(name)}
                          className="text-mb-silver/40 hover:text-red-400 transition-colors p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title={isBg ? "Премахни" : "Remove"}
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
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </SubSection>
            </div>

            {/* Mechanics */}
            <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
              <SubSection title={isBg ? "Механици" : "Mechanics"}>
                <p className="text-sm text-mb-silver/60">
                  {isBg
                    ? 'Появяват се в менюто "Изпълнено от" при редакция на оферта.'
                    : 'Appear in the "Performed by" dropdown when editing an offer.'}
                </p>
                <AddPersonRow
                  value={newMechanicName}
                  onChange={setNewMechanicName}
                  onAdd={handleAddMechanic}
                  placeholder={isBg ? "Име на механик..." : "Mechanic name..."}
                  saving={savingMechanic}
                  addLabel={isBg ? "Добави" : "Add"}
                  addingLabel={isBg ? "Добавяне..." : "Adding..."}
                />
                <PersonList
                  loading={mechanicsLoading}
                  items={mechanics}
                  deletingId={deletingMechanicId}
                  onDelete={handleDeleteMechanic}
                  emptyLabel={
                    isBg ? "Няма добавени механици" : "No mechanics added yet"
                  }
                  deleteLabel={isBg ? "Изтрий" : "Delete"}
                />
              </SubSection>
            </div>

            {/* Receptionists */}
            <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-4">
              <SubSection title={isBg ? "Приемчици" : "Receptionists"}>
                <p className="text-sm text-mb-silver/60">
                  {isBg
                    ? "Появяват се в падащото меню за заработки."
                    : "Appear in the earnings dropdown."}
                </p>
                <AddPersonRow
                  value={newReceptionistName}
                  onChange={setNewReceptionistName}
                  onAdd={handleAddReceptionist}
                  placeholder={
                    isBg ? "Име на приемчик..." : "Receptionist name..."
                  }
                  saving={savingReceptionist}
                  addLabel={isBg ? "Добави" : "Add"}
                  addingLabel={isBg ? "Добавяне..." : "Adding..."}
                />
                <PersonList
                  loading={receptionistsLoading}
                  items={receptionistsList}
                  deletingId={deletingReceptionistId}
                  onDelete={handleDeleteReceptionist}
                  emptyLabel={
                    isBg
                      ? "Няма добавени приемчици"
                      : "No receptionists added yet"
                  }
                  deleteLabel={isBg ? "Изтрий" : "Delete"}
                />
              </SubSection>
            </div>
          </div>
        )}

        {/* Display tab */}
        {activeTab === "display" && (
          <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-5">
            <SubSection title={isBg ? "Колони в таблицата" : "Table Columns"}>
              <p className="text-sm text-mb-silver/60">
                {isBg
                  ? "Изберете кои колони да се показват в списъка с оферти за всеки акаунт."
                  : "Choose which columns to display in the offers list per account."}
              </p>

              <div className="grid grid-cols-3 gap-2">
                {accountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedAccountForColumns(opt.value)}
                    className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      selectedAccountForColumns === opt.value
                        ? "border-mb-blue bg-mb-blue/10 text-white"
                        : "border-mb-border text-mb-silver/60 hover:text-white hover:border-mb-silver/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {(Object.keys(DEFAULT_COLUMNS) as ColumnKey[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleColumn(key)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-all text-left ${
                      columns[key]
                        ? "border-mb-blue bg-mb-blue/10 text-white"
                        : "border-mb-border bg-transparent text-mb-silver/60 hover:border-mb-silver/40 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        columns[key]
                          ? "border-mb-blue bg-mb-blue"
                          : "border-mb-silver/40"
                      }`}
                    >
                      {columns[key] && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 10 8"
                        >
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
            </SubSection>
          </div>
        )}

        {/* Earnings tab */}
        {activeTab === "earnings" && (
          <div className="bg-mb-anthracite border border-mb-border rounded-xl p-5 space-y-6">
            <SubSection
              title={
                isBg ? "Настройки на заплащането" : "Earnings Configuration"
              }
            >
              <p className="text-sm text-mb-silver/60">
                {isBg
                  ? "Настройте начина на изчисляване на заплащането."
                  : "Configure earnings calculation for your team."}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="bg-mb-black border border-mb-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-mb-blue/10 border border-mb-blue/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-mb-blue"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isBg ? "Механик" : "Mechanic"}
                      </p>
                      <p className="text-xs text-mb-silver/50">
                        {isBg ? "Почасова ставка" : "Hourly rate"}
                      </p>
                    </div>
                  </div>
                  <InputField
                    label={isBg ? "Ставка" : "Rate"}
                    type="number"
                    value={mechanicEarningsRate}
                    onChange={setMechanicEarningsRate}
                    placeholder="0.00"
                    suffix="€/h"
                  />
                </div>

                <div className="bg-mb-black border border-mb-border rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-mb-blue/10 border border-mb-blue/20 flex items-center justify-center shrink-0">
                      <svg
                        className="w-4 h-4 text-mb-blue"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isBg ? "Приемчик" : "Receptionist"}
                      </p>
                      <p className="text-xs text-mb-silver/50">
                        {isBg ? "% от оборота" : "% of turnover"}
                      </p>
                    </div>
                  </div>
                  <InputField
                    label={isBg ? "Процент" : "Percentage"}
                    type="number"
                    value={receptionistEarningsPercent}
                    onChange={setReceptionistEarningsPercent}
                    placeholder="0.0"
                    suffix="%"
                  />
                </div>
              </div>

              <Button
                type="button"
                onClick={handleSaveEarnings}
                disabled={savingEarnings}
                className="bg-mb-blue hover:bg-mb-blue/90 disabled:opacity-50 w-full sm:w-auto"
              >
                {savingEarnings
                  ? isBg
                    ? "Запазване..."
                    : "Saving..."
                  : isBg
                    ? "Запази настройките"
                    : "Save Settings"}
              </Button>
            </SubSection>
          </div>
        )}
      </div>

      {notifications.map((n) => (
        <Toast
          key={n.id}
          type={n.type}
          message={n.message}
          onClose={() => dismiss(n.id)}
        />
      ))}
    </div>
  );
}
