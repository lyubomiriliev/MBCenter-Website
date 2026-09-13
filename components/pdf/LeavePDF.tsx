import React from "react";
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

export interface LeavePDFRow {
  start_date: string;
  end_date: string;
  working_days: number;
  leave_type: "paid" | "unpaid" | "sick";
  note: string | null;
  /** Seeded opening balance: has day counts but no real dates. */
  is_opening_balance?: boolean;
}

interface LeavePDFProps {
  workerName: string;
  workerRole: string;
  year: number;
  rows: LeavePDFRow[];
  allowance: number;
  usedPaid: number;
  usedUnpaid: number;
  usedSick: number;
  generatedBy?: string | null;
}

const TYPE_LABEL: Record<LeavePDFRow["leave_type"], string> = {
  paid: "Платен",
  unpaid: "Неплатен",
  sick: "Болничен",
};

function fmtDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function createStyles(fontFamily: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 30,
      paddingBottom: 50,
      paddingHorizontal: 28,
      fontSize: 9,
      fontFamily,
      backgroundColor: "#ffffff",
      lineHeight: 1.3,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#000",
    },
    headerLeft: { width: "55%" },
    headerRight: { width: "42%", alignItems: "flex-end" },
    logo: { width: 150, height: 38, objectFit: "contain", marginBottom: 4 },
    companyName: { fontSize: 9, fontFamily, fontWeight: "bold", marginTop: 2 },
    companyInfo: { fontSize: 7.5, color: "#555", lineHeight: 1.4 },
    title: {
      fontSize: 15,
      fontFamily,
      fontWeight: "bold",
      textAlign: "right",
      letterSpacing: 0.5,
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: 10.5,
      fontFamily,
      textAlign: "right",
      color: "#333",
      marginTop: 4,
      lineHeight: 1.2,
    },
    printedAt: { fontSize: 7.5, color: "#777", textAlign: "right", marginTop: 6 },

    summaryRow: { flexDirection: "row", marginBottom: 14, gap: 6 },
    summaryBox: {
      flex: 1,
      borderWidth: 0.75,
      borderColor: "#ccc",
      borderRadius: 3,
      paddingVertical: 5,
      paddingHorizontal: 7,
      backgroundColor: "#fbfbfb",
    },
    summaryBoxAccent: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#000",
      borderRadius: 3,
      paddingVertical: 5,
      paddingHorizontal: 7,
      backgroundColor: "#f0f0f0",
    },
    summaryLabel: {
      fontSize: 6.5,
      color: "#666",
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    summaryValue: { fontSize: 12, fontFamily, fontWeight: "bold", marginTop: 2 },

    tableWrap: {
      borderWidth: 0.75,
      borderColor: "#ddd",
      borderRadius: 3,
      overflow: "hidden",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#1a1a1a",
      paddingVertical: 5,
      paddingHorizontal: 6,
    },
    th: { fontSize: 8, fontFamily, fontWeight: "bold", color: "#fff" },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#e5e5e5",
      paddingVertical: 4,
      paddingHorizontal: 6,
    },
    td: { fontSize: 8.5 },
    colNum: { width: "7%" },
    colPeriod: { width: "45%" },
    colType: { width: "20%" },
    colDays: { width: "28%", textAlign: "right" },
    noteText: { fontSize: 7.5, color: "#666", marginTop: 1 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: 5,
      paddingHorizontal: 6,
      borderTopWidth: 0.75,
      borderTopColor: "#333",
      backgroundColor: "#f7f7f7",
    },
    totalText: { fontSize: 9.5, fontFamily, fontWeight: "bold" },
    empty: { fontSize: 9, color: "#666", padding: 12, textAlign: "center" },
    footer: {
      position: "absolute",
      bottom: 22,
      left: 28,
      right: 28,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 0.5,
      borderTopColor: "#ccc",
      paddingTop: 5,
      fontSize: 7,
      color: "#888",
    },
  });
}

export function LeavePDF({
  workerName,
  workerRole,
  year,
  rows,
  allowance,
  usedPaid,
  usedUnpaid,
  usedSick,
  generatedBy,
}: LeavePDFProps) {
  const styles = createStyles(fontRegistered ? "NotoSans" : "Helvetica");
  const remaining = Math.max(0, allowance - usedPaid);

  // Oldest first reads better as a history.
  const sorted = [...rows].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  const totalDays = sorted.reduce((sum, r) => sum + (r.working_days || 0), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src="/assets/logos/mbcenter-specialist2.png"
              style={styles.logo}
            />
            <Text style={styles.companyName}>ЕМ БИ ЦЕНТЪР ООД</Text>
            <Text style={styles.companyInfo}>
              ул. Околовръстен път 155, 1700 София
            </Text>
            <Text style={styles.companyInfo}>Булстат: 207901533</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>СПРАВКА ОТПУСКИ</Text>
            <Text style={styles.subtitle}>
              {workerName} · {year} г.
            </Text>
            <Text style={styles.printedAt}>
              {workerRole}
              {"\n"}Разпечатано: {new Date().toLocaleDateString("bg-BG")}
              {generatedBy ? `\n${generatedBy}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Полагаеми дни</Text>
            <Text style={styles.summaryValue}>{allowance}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Използвани (платен)</Text>
            <Text style={styles.summaryValue}>{usedPaid}</Text>
          </View>
          <View style={styles.summaryBoxAccent}>
            <Text style={styles.summaryLabel}>Оставащи</Text>
            <Text style={styles.summaryValue}>{remaining}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Неплатен</Text>
            <Text style={styles.summaryValue}>{usedUnpaid}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Болничен</Text>
            <Text style={styles.summaryValue}>{usedSick}</Text>
          </View>
        </View>

        {sorted.length === 0 ? (
          <Text style={styles.empty}>
            Няма въведени отпуски за {year} г.
          </Text>
        ) : (
          <View style={styles.tableWrap}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, styles.colNum]}>№</Text>
              <Text style={[styles.th, styles.colPeriod]}>Период</Text>
              <Text style={[styles.th, styles.colType]}>Вид</Text>
              <Text style={[styles.th, styles.colDays]}>Работни дни</Text>
            </View>

            {sorted.map((r, i) => (
              <View key={i} style={styles.tableRow} wrap={false}>
                <Text style={[styles.td, styles.colNum]}>{i + 1}</Text>
                <View style={styles.colPeriod}>
                  <Text style={styles.td}>
                    {r.is_opening_balance
                      ? "Начален баланс"
                      : `${fmtDate(r.start_date)} - ${fmtDate(r.end_date)}`}
                  </Text>
                  {r.is_opening_balance ? (
                    <Text style={styles.noteText}>
                      Използвани преди въвеждането на системата
                    </Text>
                  ) : r.note ? (
                    <Text style={styles.noteText}>{r.note}</Text>
                  ) : null}
                </View>
                <Text style={[styles.td, styles.colType]}>
                  {TYPE_LABEL[r.leave_type]}
                </Text>
                <Text style={[styles.td, styles.colDays]}>
                  {r.working_days}
                </Text>
              </View>
            ))}

            <View style={styles.totalRow}>
              <Text style={styles.totalText}>
                Общо: {totalDays} работни дни
              </Text>
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>
            MB Center · Справка отпуски · {workerName} · {year} г.
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Стр. ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
