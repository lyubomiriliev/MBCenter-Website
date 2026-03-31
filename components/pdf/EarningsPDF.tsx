import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

export interface MechanicEarningEntry {
  vehicle: string;
  repairName: string;
  repairTime: number;
  hourlyRate: number;
  total: number;
  date: string;
}

export interface ReceptionistEarningEntry {
  vehicle: string;
  repairName: string;
  repairTotal: number;
  turnoverPct: number;
  earnings: number;
  date: string;
}

interface MechanicEarningsPDFProps {
  workerName: string;
  month: string;
  year: string;
  entries: MechanicEarningEntry[];
  card?: number;
  fines?: number;
}

interface ReceptionistEarningsPDFProps {
  workerName: string;
  month: string;
  year: string;
  entries: ReceptionistEarningEntry[];
  fixedSalary?: number;
  card?: number;
  cash?: number;
  fines?: number;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("bg-BG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const createStyles = () => {
  const fontFamily = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 30,
      paddingBottom: 50,
      paddingLeft: 30,
      paddingRight: 30,
      fontSize: 10,
      fontFamily,
      backgroundColor: "#ffffff",
      lineHeight: 1.3,
    },
    titleBlock: {
      marginBottom: 20,
      paddingBottom: 10,
      borderBottomWidth: 2,
      borderBottomColor: "#333",
    },
    title: {
      fontSize: 16,
      fontFamily,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 10,
      fontFamily,
      textAlign: "center",
      color: "#666",
    },
    tableHeader: {
      flexDirection: "row",
      borderBottomWidth: 1.5,
      borderBottomColor: "#333",
      paddingBottom: 4,
      marginBottom: 2,
      backgroundColor: "#f5f5f5",
      paddingTop: 4,
      paddingLeft: 4,
      paddingRight: 4,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#ccc",
      paddingVertical: 3,
      paddingLeft: 4,
      paddingRight: 4,
    },
    tableRowAlt: {
      flexDirection: "row",
      borderBottomWidth: 0.5,
      borderBottomColor: "#ccc",
      paddingVertical: 3,
      paddingLeft: 4,
      paddingRight: 4,
      backgroundColor: "#fafafa",
    },
    cellLeft: { flex: 1, fontSize: 9, fontFamily },
    cellRight: { width: 60, textAlign: "right", fontSize: 9, fontFamily },
    cellMid: { width: 50, textAlign: "center", fontSize: 9, fontFamily },
    cellHeader: { fontSize: 8, fontFamily, fontWeight: "bold", textTransform: "uppercase" },
    summarySection: {
      marginTop: 16,
      borderTopWidth: 2,
      borderTopColor: "#333",
      paddingTop: 8,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 3,
      paddingHorizontal: 4,
    },
    summaryRowHighlight: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 5,
      paddingHorizontal: 4,
      backgroundColor: "#f0f0f0",
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
      marginTop: 4,
    },
    summaryLabel: { fontSize: 10, fontFamily },
    summaryValue: { fontSize: 10, fontFamily, textAlign: "right", minWidth: 80 },
    summaryBold: { fontSize: 11, fontFamily, fontWeight: "bold" },
    summaryValueBold: {
      fontSize: 11,
      fontFamily,
      fontWeight: "bold",
      textAlign: "right",
      minWidth: 80,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 30,
      right: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    signatureBlock: {
      width: "40%",
      borderTopWidth: 1,
      borderTopColor: "#999",
      borderTopStyle: "dashed",
      paddingTop: 4,
    },
    signatureLabel: { fontSize: 8, fontFamily, color: "#666" },
    footerDate: { fontSize: 8, fontFamily, color: "#666" },
  });
};

/* ================================================================== */
/*  MECHANIC EARNINGS PDF                                              */
/* ================================================================== */

export function MechanicEarningsPDF({
  workerName,
  month,
  year,
  entries,
  card,
  fines,
}: MechanicEarningsPDFProps) {
  const styles = createStyles();
  const totalEarnings = entries.reduce((s, e) => s + e.total, 0);
  const net50 = totalEarnings * 0.5;
  const cardAmount = card || 0;
  const finesAmount = fines || 0;
  const cashAmount = net50 - cardAmount - finesAmount;

  const now = new Date();
  const dateStr = now.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {`Заработка – ${workerName} – ${month} ${year}`}
          </Text>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cellLeft, styles.cellHeader]}>Автомобил</Text>
          <Text style={[styles.cellLeft, styles.cellHeader]}>Ремонт</Text>
          <Text style={[styles.cellMid, styles.cellHeader]}>Часове</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Ставка</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Сума</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Дата</Text>
        </View>

        {/* Entries */}
        {entries.map((e, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.cellLeft}>{e.vehicle || "—"}</Text>
            <Text style={styles.cellLeft}>{e.repairName || "—"}</Text>
            <Text style={styles.cellMid}>{e.repairTime}</Text>
            <Text style={styles.cellRight}>€{e.hourlyRate}</Text>
            <Text style={styles.cellRight}>€{e.total.toFixed(2)}</Text>
            <Text style={styles.cellRight}>{formatDate(e.date)}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRowHighlight}>
            <Text style={styles.summaryBold}>Общо заработено</Text>
            <Text style={styles.summaryValueBold}>€{totalEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Нето 50%</Text>
            <Text style={styles.summaryValue}>€{net50.toFixed(2)}</Text>
          </View>
          {cardAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Карта</Text>
              <Text style={styles.summaryValue}>-€{cardAmount.toFixed(2)}</Text>
            </View>
          )}
          {finesAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Глоби</Text>
              <Text style={styles.summaryValue}>-€{finesAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRowHighlight}>
            <Text style={styles.summaryBold}>В БРОЙ</Text>
            <Text style={styles.summaryValueBold}>€{cashAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerDate}>
            {dateStr} {timeStr}
          </Text>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Подпис на служителя</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

/* ================================================================== */
/*  RECEPTIONIST EARNINGS PDF                                          */
/* ================================================================== */

export function ReceptionistEarningsPDF({
  workerName,
  month,
  year,
  entries,
  fixedSalary,
  card,
  cash,
  fines,
}: ReceptionistEarningsPDFProps) {
  const styles = createStyles();
  const totalEarnings = entries.reduce((s, e) => s + e.earnings, 0);
  const fixedAmount = fixedSalary || 0;
  const cardAmount = card || 0;
  const cashAmount = cash || 0;
  const finesAmount = fines || 0;
  const totalSalary = totalEarnings + fixedAmount;
  const remaining = totalSalary - cardAmount - finesAmount - cashAmount;

  const now = new Date();
  const dateStr = now.toLocaleDateString("bg-BG", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeStr = now.toLocaleTimeString("bg-BG", { hour: "2-digit", minute: "2-digit" });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {`Заработка – ${workerName} – ${month} ${year}`}
          </Text>
        </View>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.cellLeft, styles.cellHeader]}>Автомобил</Text>
          <Text style={[styles.cellLeft, styles.cellHeader]}>Ремонт</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Сума ремонт</Text>
          <Text style={[styles.cellMid, styles.cellHeader]}>%</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Заработка</Text>
          <Text style={[styles.cellRight, styles.cellHeader]}>Дата</Text>
        </View>

        {/* Entries */}
        {entries.map((e, i) => (
          <View key={i} style={i % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
            <Text style={styles.cellLeft}>{e.vehicle || "—"}</Text>
            <Text style={styles.cellLeft}>{e.repairName || "—"}</Text>
            <Text style={styles.cellRight}>€{e.repairTotal.toFixed(2)}</Text>
            <Text style={styles.cellMid}>{e.turnoverPct}%</Text>
            <Text style={styles.cellRight}>€{e.earnings.toFixed(2)}</Text>
            <Text style={styles.cellRight}>{formatDate(e.date)}</Text>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Заработка общо</Text>
            <Text style={styles.summaryValue}>€{totalEarnings.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Твърдо</Text>
            <Text style={styles.summaryValue}>€{fixedAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRowHighlight}>
            <Text style={styles.summaryBold}>Обща заплата</Text>
            <Text style={styles.summaryValueBold}>€{totalSalary.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Карта</Text>
            <Text style={styles.summaryValue}>-€{cardAmount.toFixed(2)}</Text>
          </View>
          {finesAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Глоби</Text>
              <Text style={styles.summaryValue}>-€{finesAmount.toFixed(2)}</Text>
            </View>
          )}
          {cashAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>В Брой</Text>
              <Text style={styles.summaryValue}>-€{cashAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRowHighlight}>
            <Text style={styles.summaryBold}>Остатък</Text>
            <Text style={styles.summaryValueBold}>€{remaining.toFixed(2)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerDate}>
            {dateStr} {timeStr}
          </Text>
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Подпис на служителя</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
