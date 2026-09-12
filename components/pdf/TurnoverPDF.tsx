import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

export interface TurnoverPDFRow {
  entry_date: string;
  vehicle: string | null;
  license_plate: string | null;
  repair_name: string | null;
  client_name: string | null;
  amount: number;
  amount_cash: number;
  amount_card: number;
  amount_bank: number;
  parts_cost: number;
  source: string;
  service_card_number: string | null;
}

interface TurnoverPDFProps {
  /** Heading period, e.g. "12 септември 2026" or "септември 2026". */
  periodLabel: string;
  rows: TurnoverPDFRow[];
  /** Day notes, keyed by YYYY-MM-DD. */
  notes?: Record<string, string>;
  /** Profit is owner-level information, so it is only passed in for admins. */
  includeProfit?: boolean;
  /** Shown in the footer so a printout can be traced back. */
  generatedBy?: string | null;
}

const fmtMoney = (n: number) => `${(Number(n) || 0).toFixed(2)} EUR`;

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

function methodSummary(r: TurnoverPDFRow) {
  const parts: string[] = [];
  if (r.amount_cash > 0) parts.push(`Брой ${r.amount_cash.toFixed(2)}`);
  if (r.amount_card > 0) parts.push(`Карта ${r.amount_card.toFixed(2)}`);
  if (r.amount_bank > 0) parts.push(`Банка ${r.amount_bank.toFixed(2)}`);
  return parts.length ? parts.join(" + ") : "-";
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
    titleBlock: {
      marginBottom: 14,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: "#333",
    },
    title: { fontSize: 15, fontFamily, fontWeight: "bold", textAlign: "center" },
    subtitle: {
      fontSize: 10,
      fontFamily,
      textAlign: "center",
      color: "#666",
      marginTop: 3,
    },
    summaryRow: { flexDirection: "row", marginBottom: 12, gap: 6 },
    summaryBox: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ddd",
      borderRadius: 3,
      padding: 6,
    },
    summaryLabel: { fontSize: 7, color: "#666", textTransform: "uppercase" },
    summaryValue: { fontSize: 12, fontFamily, fontWeight: "bold", marginTop: 2 },
    dayBlock: { marginBottom: 12 },
    dayHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "#eee",
      paddingVertical: 4,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: "#999",
    },
    dayTitle: { fontSize: 10, fontFamily, fontWeight: "bold" },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#333",
      backgroundColor: "#f7f7f7",
      paddingVertical: 3,
      paddingHorizontal: 4,
    },
    th: { fontSize: 7.5, fontFamily, fontWeight: "bold", color: "#333" },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#ddd",
      paddingVertical: 3,
      paddingHorizontal: 4,
    },
    td: { fontSize: 8 },
    colVehicle: { width: "26%" },
    colClient: { width: "17%" },
    colMethod: { width: "23%" },
    colSource: { width: "16%" },
    colAmount: { width: "18%", textAlign: "right" },
    dayTotal: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingTop: 3,
      paddingHorizontal: 4,
    },
    dayTotalText: { fontSize: 9, fontFamily, fontWeight: "bold" },
    noteBox: {
      marginTop: 4,
      padding: 5,
      backgroundColor: "#fafafa",
      borderLeftWidth: 2,
      borderLeftColor: "#999",
    },
    noteLabel: { fontSize: 7, color: "#666", textTransform: "uppercase" },
    noteText: { fontSize: 8.5, marginTop: 2 },
    empty: { fontSize: 9, color: "#666", padding: 10, textAlign: "center" },
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

export function TurnoverPDF({
  periodLabel,
  rows,
  notes = {},
  includeProfit = false,
  generatedBy,
}: TurnoverPDFProps) {
  const styles = createStyles(fontRegistered ? "NotoSans" : "Helvetica");

  const totals = rows.reduce(
    (acc, r) => {
      acc.cash += Number(r.amount_cash) || 0;
      acc.card += Number(r.amount_card) || 0;
      acc.bank += Number(r.amount_bank) || 0;
      acc.all += Number(r.amount) || 0;
      acc.cost += Number(r.parts_cost) || 0;
      return acc;
    },
    { cash: 0, card: 0, bank: 0, all: 0, cost: 0 },
  );

  // Group by day so each day carries its own total and Забележки.
  const byDay = new Map<string, TurnoverPDFRow[]>();
  for (const r of rows) {
    const list = byDay.get(r.entry_date) ?? [];
    list.push(r);
    byDay.set(r.entry_date, list);
  }
  // A day with a note but no entries still deserves a block.
  for (const day of Object.keys(notes)) {
    if ((notes[day] ?? "").trim() && !byDay.has(day)) byDay.set(day, []);
  }
  const days = Array.from(byDay.entries()).sort((a, b) =>
    a[0].localeCompare(b[0]),
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>ДНЕВЕН ОБОРОТ</Text>
          <Text style={styles.subtitle}>{periodLabel}</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Брой</Text>
            <Text style={styles.summaryValue}>{fmtMoney(totals.cash)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Карта</Text>
            <Text style={styles.summaryValue}>{fmtMoney(totals.card)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Банка</Text>
            <Text style={styles.summaryValue}>{fmtMoney(totals.bank)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Общо</Text>
            <Text style={styles.summaryValue}>{fmtMoney(totals.all)}</Text>
          </View>
        </View>

        {includeProfit && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Себестойност (части)</Text>
              <Text style={styles.summaryValue}>{fmtMoney(totals.cost)}</Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Печалба</Text>
              <Text style={styles.summaryValue}>
                {fmtMoney(totals.all - totals.cost)}
              </Text>
            </View>
          </View>
        )}

        {days.length === 0 ? (
          <Text style={styles.empty}>Няма записи за този период.</Text>
        ) : (
          days.map(([day, dayRows]) => {
            const dayTotal = dayRows.reduce(
              (sum, r) => sum + (Number(r.amount) || 0),
              0,
            );
            const note = (notes[day] ?? "").trim();
            return (
              <View key={day} style={styles.dayBlock} wrap={false}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{fmtDate(day)}</Text>
                  <Text style={styles.dayTitle}>{fmtMoney(dayTotal)}</Text>
                </View>

                {dayRows.length > 0 && (
                  <>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.th, styles.colVehicle]}>
                        Автомобил / Ремонт
                      </Text>
                      <Text style={[styles.th, styles.colClient]}>Клиент</Text>
                      <Text style={[styles.th, styles.colMethod]}>
                        Начин на плащане
                      </Text>
                      <Text style={[styles.th, styles.colSource]}>Източник</Text>
                      <Text style={[styles.th, styles.colAmount]}>Сума</Text>
                    </View>

                    {dayRows.map((r, i) => (
                      <View key={i} style={styles.tableRow}>
                        <View style={styles.colVehicle}>
                          <Text style={styles.td}>
                            {r.vehicle || "-"}
                            {r.license_plate ? ` · ${r.license_plate}` : ""}
                          </Text>
                          {r.repair_name ? (
                            <Text style={[styles.td, { color: "#666" }]}>
                              {r.repair_name}
                            </Text>
                          ) : null}
                        </View>
                        <Text style={[styles.td, styles.colClient]}>
                          {r.client_name || "-"}
                        </Text>
                        <Text style={[styles.td, styles.colMethod]}>
                          {methodSummary(r)}
                        </Text>
                        <Text style={[styles.td, styles.colSource]}>
                          {r.source === "service_card"
                            ? `Серв. карта ${r.service_card_number ?? ""}`.trim()
                            : "Ръчно"}
                        </Text>
                        <Text style={[styles.td, styles.colAmount]}>
                          {fmtMoney(r.amount)}
                        </Text>
                      </View>
                    ))}

                    <View style={styles.dayTotal}>
                      <Text style={styles.dayTotalText}>
                        Общо за деня: {fmtMoney(dayTotal)}
                      </Text>
                    </View>
                  </>
                )}

                {note ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteLabel}>Забележки</Text>
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}

        <View style={styles.footer} fixed>
          <Text>
            MB Center · Разпечатано на{" "}
            {new Date().toLocaleDateString("bg-BG")}
            {generatedBy ? ` · ${generatedBy}` : ""}
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
