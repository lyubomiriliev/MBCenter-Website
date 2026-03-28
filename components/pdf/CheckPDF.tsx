import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CheckItem {
  label: string;
  value: string;
  note: string;
}

export interface TireData {
  brand: string;
  dot: string;
  tread: string;
  condition: string;
  note: string;
}

export interface CheckFormData {
  inspectionDate: string;
  mechanic: string;
  clientName: string;
  carModel: string;
  licensePlate: string;
  vin: string;
  tires: {
    frontLeft: TireData;
    frontRight: TireData;
    rearLeft: TireData;
    rearRight: TireData;
  };
  corrosion: CheckItem[];
  fluids: CheckItem[];
  mileage: {
    odometer: string;
    assessment: string;
    note: string;
  };
  glass: CheckItem[];
  summary: string;
}

/* ------------------------------------------------------------------ */
/*  Font state (set from form before generation)                       */
/* ------------------------------------------------------------------ */

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

/* ------------------------------------------------------------------ */
/*  Value label maps                                                   */
/* ------------------------------------------------------------------ */

const corrosionLabels: Record<string, string> = {
  none: "Няма / Заводски вид",
  surface: "Повърхностна ръжда",
  deep: "Дълбока корозия / Изгнило",
};

const fluidLabels: Record<string, Record<string, string>> = {
  "Моторно масло (Ниво и вид)": {
    ok: "В норма / Бистро",
    low: "Под минимума",
    dirty: "Черно / Задължителна смяна",
  },
  "Антифриз (Охладителна течност)": {
    ok: "В норма",
    low: "Ниско ниво / Мътен",
    oil: "Масло в антифриза!",
  },
  "Спирачна течност": {
    ok: "Съдържание на влага ОК",
    dirty: "За смяна (>3% влага)",
  },
  "Видими течове по двигателя/кутията": {
    none: "Напълно сух",
    sweat: "Леко омасляване",
    active: "Активен теч",
  },
};

const glassLabels: Record<string, Record<string, string>> = {
  "Челно стъкло (Предно)": {
    ok: "Здраво / Оригинално",
    chips: "Шупли / Драскотини",
    broken: "Спукано (За смяна)",
  },
  "Странични и задно стъкла": {
    ok: "Здрави",
    scratched: "Надраскани",
    broken: "Счупени",
  },
  "Външни огледала (Механизъм/Прибиране)": {
    ok: "Работят коректно",
    damaged: "Счупен корпус/стъкло",
    broken: "Не работи прибиране/подгрев",
  },
};

const mileageLabels: Record<string, string> = {
  match: "Съответства (Реален)",
  suspect: "Има съмнения",
  manipulated: "Манипулиран!",
};

const tireCondLabels: Record<string, string> = {
  ok: "ОК",
  uneven: "Неравномерно",
  bad: "За смяна",
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const createStyles = () => {
  const ff = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 8,
      paddingBottom: 40,
      paddingHorizontal: 30,
      fontSize: 9,
      fontFamily: ff,
      backgroundColor: "#fff",
      lineHeight: 1.4,
    },
    /* Header */
    header: {
      flexDirection: "column",
      alignItems: "center",
      marginBottom: 14,
      paddingBottom: 12,
      borderBottom: "2.5px solid #1a1a2e",
    },
    logo: {
      width: 160,
      height: 40,
      objectFit: "contain",
      marginBottom: 8,
    },
    headerTitleWrap: {
      alignItems: "center" as const,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 700,
      fontFamily: ff,
      color: "#1a1a2e",
      textTransform: "uppercase",
      textAlign: "center",
      marginBottom: 8,
    },
    headerSubtitle: {
      fontSize: 0,
      fontWeight: 700,
      fontFamily: ff,
      color: "#1a1a2e",
      textTransform: "uppercase",
      textAlign: "center",
    },
    /* Info grid */
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginBottom: 14,
    },
    infoItem: {
      width: "33.33%",
      paddingRight: 8,
      paddingBottom: 6,
    },
    infoLabel: {
      fontSize: 7,
      fontWeight: 700,
      color: "#666",
      marginBottom: 2,
      fontFamily: ff,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 9,
      fontFamily: ff,
      color: "#1a1a2e",
      borderBottom: "1px solid #ccc",
      paddingBottom: 2,
      minHeight: 14,
    },
    /* Section header */
    sectionHeader: {
      backgroundColor: "#f8f9fa",
      color: "#1a1a2e",
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 10,
      fontWeight: 700,
      fontFamily: ff,
      marginTop: 8,
      marginBottom: 2,
      borderBottom: "1px solid #1a1a2e",
    },
    /* Check row (3-col grid) */
    checkRow: {
      flexDirection: "row",
      borderBottom: "1px solid #e0e0e0",
      paddingVertical: 0,
      minHeight: 22,
    },
    checkLabel: {
      flex: 2,
      fontSize: 9,
      fontWeight: 600,
      color: "#2c3e50",
      fontFamily: ff,
      paddingVertical: 4,
      paddingRight: 4,
      paddingLeft: 2,
      justifyContent: "center",
    },
    checkValue: {
      flex: 3,
      fontSize: 8,
      color: "#333",
      fontFamily: ff,
      paddingVertical: 4,
      justifyContent: "center",
    },
    checkNote: {
      flex: 2,
      fontSize: 8,
      color: "#555",
      fontFamily: ff,
      paddingVertical: 4,
      paddingLeft: 4,
      justifyContent: "center",
    },
    /* Value pill */
    valuePill: {
      backgroundColor: "#e8f5e9",
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      fontSize: 8,
      color: "#2e7d32",
      fontFamily: ff,
      alignSelf: "flex-start",
    },
    valuePillWarning: {
      backgroundColor: "#fff3e0",
      color: "#e65100",
    },
    valuePillDanger: {
      backgroundColor: "#ffebee",
      color: "#c62828",
    },
    /* Tire table */
    tireHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#f8f9fa",
      paddingVertical: 2,
      paddingHorizontal: 4,
      borderBottom: "1px solid #1a1a2e",
    },
    tireRow: {
      flexDirection: "row",
      borderBottom: "1px solid #e0e0e0",
      paddingVertical: 0,
      paddingHorizontal: 4,
      minHeight: 20,
    },
    tireCol1: { flex: 1.5, justifyContent: "center", paddingVertical: 4 },
    tireCol2: { flex: 1, justifyContent: "center", paddingVertical: 4 },
    tireCol3: { flex: 1, justifyContent: "center", paddingVertical: 4 },
    tireCol4: { flex: 1, justifyContent: "center", paddingVertical: 4 },
    tireCol5: { flex: 1.5, justifyContent: "center", paddingVertical: 4 },
    tireHeaderText: {
      fontSize: 8,
      fontWeight: 700,
      color: "#1a1a2e",
      fontFamily: ff,
    },
    tireCellText: {
      fontSize: 8,
      color: "#333",
      fontFamily: ff,
    },
    /* Mileage */
    mileageValue: {
      fontSize: 12,
      fontWeight: 700,
      color: "#1a1a2e",
      fontFamily: ff,
    },
    /* Summary */
    summaryBox: {
      borderTop: "1px solid #ccc",
      borderBottom: "1px solid #ccc",
      borderLeft: "1px solid #ccc",
      borderRight: "1px solid #ccc",
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
      borderBottomLeftRadius: 3,
      borderBottomRightRadius: 3,
      padding: 10,
      marginTop: 6,
      minHeight: 60,
      fontSize: 9,
      fontFamily: ff,
      color: "#333",
      lineHeight: 1.5,
    },
    /* Footer */
    footer: {
      position: "absolute",
      bottom: 15,
      left: 30,
      right: 30,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 7,
      color: "#999",
      fontFamily: ff,
      borderTop: "1px solid #e0e0e0",
      paddingTop: 5,
    },
    emptyText: {
      fontSize: 8,
      color: "#999",
      fontFamily: ff,
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const dangerValues = new Set([
  "deep",
  "oil",
  "active",
  "manipulated",
  "bad",
  "broken",
]);
const warningValues = new Set([
  "surface",
  "low",
  "dirty",
  "sweat",
  "suspect",
  "uneven",
  "chips",
  "scratched",
  "damaged",
]);

function ValuePill({
  value,
  label,
  styles,
}: {
  value: string;
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!value) return <Text style={styles.emptyText}>—</Text>;
  const isDanger = dangerValues.has(value);
  const isWarning = warningValues.has(value);
  const pillStyle = isDanger
    ? [styles.valuePill, styles.valuePillDanger]
    : isWarning
      ? [styles.valuePill, styles.valuePillWarning]
      : styles.valuePill;
  return <Text style={pillStyle}>{label}</Text>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CheckPDFProps {
  data: CheckFormData;
}

export function CheckPDF({ data }: CheckPDFProps) {
  const styles = createStyles();

  const formatDate = (d: string) => {
    if (!d) return "—";
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  const tireRows: [string, TireData][] = [
    ["Предна Лява", data.tires.frontLeft],
    ["Предна Дясна", data.tires.frontRight],
    ["Задна Лява", data.tires.rearLeft],
    ["Задна Дясна", data.tires.rearRight],
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ─── Header ─── */}
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src="/assets/logos/mbcenter-specialist2.png"
            style={styles.logo}
          />
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>
              Подробен Протокол за Техническо Състояние
            </Text>
          </View>
        </View>

        {/* ─── Info grid ─── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Дата на преглед</Text>
            <Text style={styles.infoValue}>
              {formatDate(data.inspectionDate)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Механик / Преглеждащ</Text>
            <Text style={styles.infoValue}>{data.mechanic || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Име на Клиент</Text>
            <Text style={styles.infoValue}>{data.clientName || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Марка и Модел</Text>
            <Text style={styles.infoValue}>{data.carModel || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Регистрационен Номер</Text>
            <Text style={styles.infoValue}>{data.licensePlate || "—"}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>VIN (Рама)</Text>
            <Text style={styles.infoValue}>{data.vin || "—"}</Text>
          </View>
        </View>

        {/* ─── 1. Tires ─── */}
        <Text style={styles.sectionHeader}>1. Състояние на Гумите</Text>
        <View>
          <View style={styles.tireHeaderRow}>
            <View style={styles.tireCol1}>
              <Text style={styles.tireHeaderText}>Позиция</Text>
            </View>
            <View style={styles.tireCol2}>
              <Text style={styles.tireHeaderText}>Марка / Сезон</Text>
            </View>
            <View style={styles.tireCol3}>
              <Text style={styles.tireHeaderText}>ДОТ (Година)</Text>
            </View>
            <View style={styles.tireCol4}>
              <Text style={styles.tireHeaderText}>Грайфер (мм)</Text>
            </View>
            <View style={styles.tireCol5}>
              <Text style={styles.tireHeaderText}>Състояние</Text>
            </View>
          </View>
          {tireRows.map(([pos, tire], i) => (
            <View
              key={i}
              style={[
                styles.tireRow,
                i % 2 === 1 ? { backgroundColor: "#f8f9fa" } : {},
              ]}
            >
              <View style={styles.tireCol1}>
                <Text style={[styles.tireCellText, { fontWeight: 600 }]}>
                  {pos}
                </Text>
              </View>
              <View style={styles.tireCol2}>
                <Text style={styles.tireCellText}>{tire.brand || "—"}</Text>
              </View>
              <View style={styles.tireCol3}>
                <Text style={styles.tireCellText}>{tire.dot || "—"}</Text>
              </View>
              <View style={styles.tireCol4}>
                <Text style={styles.tireCellText}>
                  {tire.tread ? `${tire.tread} мм` : "—"}
                </Text>
              </View>
              <View style={styles.tireCol5}>
                <ValuePill
                  value={tire.condition}
                  label={tireCondLabels[tire.condition] || "—"}
                  styles={styles}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ─── 2. Corrosion ─── */}
        <Text style={styles.sectionHeader}>2. Корозия и Купе (Ръжда)</Text>
        {data.corrosion.map((item, i) => (
          <View key={i} style={styles.checkRow} wrap={false}>
            <View style={styles.checkLabel}>
              <Text>{item.label}</Text>
            </View>
            <View style={styles.checkValue}>
              <ValuePill
                value={item.value}
                label={corrosionLabels[item.value] || "—"}
                styles={styles}
              />
            </View>
            <View style={styles.checkNote}>
              <Text>{item.note || ""}</Text>
            </View>
          </View>
        ))}

        {/* ─── 3. Fluids ─── */}
        <Text style={styles.sectionHeader}>3. Течности и Течове</Text>
        {data.fluids.map((item, i) => (
          <View key={i} style={styles.checkRow} wrap={false}>
            <View style={styles.checkLabel}>
              <Text>{item.label}</Text>
            </View>
            <View style={styles.checkValue}>
              <ValuePill
                value={item.value}
                label={fluidLabels[item.label]?.[item.value] || "—"}
                styles={styles}
              />
            </View>
            <View style={styles.checkNote}>
              <Text>{item.note || ""}</Text>
            </View>
          </View>
        ))}

        {/* ─── 4. Mileage ─── */}
        <Text style={styles.sectionHeader}>4. Пробег на автомобила</Text>
        <View style={styles.checkRow} wrap={false}>
          <View style={styles.checkLabel}>
            <Text>Показание на километраж</Text>
          </View>
          <View style={styles.checkValue}>
            <Text style={styles.mileageValue}>
              {data.mileage.odometer
                ? `${Number(data.mileage.odometer).toLocaleString("bg-BG")} км`
                : "—"}
            </Text>
          </View>
          <View style={styles.checkNote}>
            <Text>{""}</Text>
          </View>
        </View>
        <View style={styles.checkRow} wrap={false}>
          <View style={styles.checkLabel}>
            <Text>Оценка на реален пробег</Text>
          </View>
          <View style={styles.checkValue}>
            <ValuePill
              value={data.mileage.assessment}
              label={mileageLabels[data.mileage.assessment] || "—"}
              styles={styles}
            />
          </View>
          <View style={styles.checkNote}>
            <Text>{data.mileage.note || ""}</Text>
          </View>
        </View>

        {/* ─── 5. Glass ─── */}
        <Text style={styles.sectionHeader}>5. Стъкла и Огледала</Text>
        {data.glass.map((item, i) => (
          <View key={i} style={styles.checkRow} wrap={false}>
            <View style={styles.checkLabel}>
              <Text>{item.label}</Text>
            </View>
            <View style={styles.checkValue}>
              <ValuePill
                value={item.value}
                label={glassLabels[item.label]?.[item.value] || "—"}
                styles={styles}
              />
            </View>
            <View style={styles.checkNote}>
              <Text>{item.note || ""}</Text>
            </View>
          </View>
        ))}

        {/* ─── Summary ─── */}
        <Text style={[styles.sectionHeader, { marginTop: 14 }]}>
          Обобщение и Препоръки от Механика
        </Text>
        <View style={styles.summaryBox}>
          <Text>{data.summary || "Няма добавени забележки."}</Text>
        </View>

        {/* ─── Footer ─── */}
        <View style={styles.footer} fixed>
          <Text>MB Center — Протокол за Техническо Състояние</Text>
          <Text>{formatDate(data.inspectionDate)}</Text>
        </View>
      </Page>
    </Document>
  );
}
