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

export interface CheckFormData {
  inspectionDate: string;
  mechanic: string;
  clientName: string;
  carModel: string;
  carModelDetail: string;
  licensePlate: string;
  vin: string;

  mileage: {
    odometer: string;
    assessment: string; // "match" | "manipulated"
    note: string;
    mileageUnit?: "km" | "miles";
  };

  tires: {
    tread_condition: string; // "good" | "worn" | "replace"
    mixed_tires: boolean;
  };

  brakes: {
    front_pads: string; // "good" | "worn" | "replace"
    front_discs: string; // "good" | "lipped" | "below_min"
    rear_pads: string;
    rear_discs: string;
  };

  suspension: {
    front_suspension: string; // "good" | "play" | "repair"
    front_suspension_note: string;
    rear_suspension: string;
    rear_suspension_note: string;
    shocks_springs: string; // "good" | "leaking" | "broken"
    steering: string; // "good" | "leak_play"
    steering_note: string;
  };

  corrosion: {
    chassis: string; // "none" | "surface" | "deep"
    sills: string; // "good" | "starting" | "rusted"
    exhaust: string; // "good" | "rusted" | "holes"
  };

  fluids: {
    engine_oil: string; // "ok" | "low" | "replace"
    coolant: string; // "ok" | "low" | "replace"
    brake_fluid: string; // "ok" | "replace"
    leaks: string; // "none" | "sweat" | "active"
    leaks_note: string;
  };

  summary: string[];
}

/* ------------------------------------------------------------------ */
/*  Font state                                                         */
/* ------------------------------------------------------------------ */

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

// Returns green / yellow / red based on severity
function statusColor(level: "good" | "warn" | "bad"): string {
  if (level === "good") return "#16a34a"; // green-600
  if (level === "warn") return "#d97706"; // amber-600
  return "#dc2626"; // red-600
}

function statusBg(level: "good" | "warn" | "bad"): string {
  if (level === "good") return "#dcfce7"; // green-100
  if (level === "warn") return "#fef3c7"; // amber-100
  return "#fee2e2"; // red-100
}

/* Maps field values → severity level */
function tireConditionLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "worn") return "warn";
  return "bad";
}
function padLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "worn") return "warn";
  return "bad";
}
function discLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "lipped") return "warn";
  return "bad";
}
function suspLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "play") return "warn";
  return "bad";
}
function shocksLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "leaking") return "warn";
  return "bad";
}
function steeringLevel(v: string): "good" | "warn" | "bad" {
  return v === "good" ? "good" : "bad";
}
function chassisLevel(v: string): "good" | "warn" | "bad" {
  if (v === "none") return "good";
  if (v === "surface") return "warn";
  return "bad";
}
function sillsLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "starting") return "warn";
  return "bad";
}
function exhaustLevel(v: string): "good" | "warn" | "bad" {
  if (v === "good") return "good";
  if (v === "rusted") return "warn";
  return "bad";
}
function oilLevel(v: string): "good" | "warn" | "bad" {
  if (v === "ok") return "good";
  if (v === "low") return "warn";
  return "bad";
}
function leaksLevel(v: string): "good" | "warn" | "bad" {
  if (v === "none") return "good";
  if (v === "sweat") return "warn";
  return "bad";
}
function mileageLevel(v: string): "good" | "warn" | "bad" {
  return v === "match" ? "good" : "bad";
}
function brakeFluidLevel(v: string): "good" | "warn" | "bad" {
  return v === "ok" ? "good" : "warn";
}

/* Human-readable labels for each value */
const LABELS: Record<string, string> = {
  // tires
  good: "Добро",
  worn: "Захабени",
  replace: "За смяна",
  // discs
  lipped: "Имат ръб / Криви",
  below_min: "Под минимум",
  // suspension
  play: "Има луфт / Напукани",
  repair: "За ремонт",
  // shocks
  leaking: "Омаслени",
  broken: "Счупена пружина",
  // steering
  leak_play: "Теч / Луфт",
  // corrosion chassis
  none: "Няма",
  surface: "Повърхностна",
  deep: "Дълбока / Изгнило",
  // sills
  starting: "Започваща ръжда",
  rusted: "Изгнили",
  // exhaust
  holes: "Пробита / Заварки",
  // fluids
  ok: "В норма",
  low: "Ниско ниво",
  // brake fluid
  // ok covered above
  // leaks
  sweat: "Леко омасляване",
  active: "Активен теч",
  // mileage
  match: "Съответства",
  manipulated: "Има съмнения / Манипулиран",
  // brake fluid replace
};

function label(v: string): string {
  if (LABELS[v]) return LABELS[v];
  if (v === "replace") return "За смяна";
  if (v === "good") return "Добро";
  if (v === "ok") return "В норма";
  return v || "-";
}

function padLabel(v: string): string {
  if (v === "good") return "Добри";
  if (v === "worn") return "Износени";
  return "За смяна";
}
function discLabel(v: string): string {
  if (v === "good") return "Добри";
  if (v === "lipped") return "Имат ръб / Криви";
  return "Под минимум";
}
function suspLabel(v: string): string {
  if (v === "good") return "Здраво";
  if (v === "play") return "Има луфт / Напукани";
  return "За ремонт";
}
function shocksLabel(v: string): string {
  if (v === "good") return "Изправни";
  if (v === "leaking") return "Омаслени";
  return "Счупена пружина";
}
function steeringLabel(v: string): string {
  return v === "good" ? "Изправна" : "Теч / Луфт";
}
function exhaustLabel(v: string): string {
  if (v === "good") return "Здрава";
  if (v === "rusted") return "Ръждясала";
  return "Пробита / Заварки";
}
function sillsLabel(v: string): string {
  if (v === "good") return "Здрави";
  if (v === "starting") return "Започваща ръжда";
  return "Изгнили";
}
function leaksLabel(v: string): string {
  if (v === "none") return "Няма (Сух)";
  if (v === "sweat") return "Леко омасляване";
  return "Активен теч";
}
function oilLabel(v: string): string {
  if (v === "ok") return "В норма";
  if (v === "low") return "Ниско ниво";
  return "За смяна";
}
function brakeFluidLabel(v: string): string {
  return v === "ok" ? "В норма" : "За смяна (>3% влага)";
}
function chassisLabel(v: string): string {
  if (v === "none") return "Няма";
  if (v === "surface") return "Повърхностна";
  return "Дълбока / Изгнило";
}
function mileageLabel(v: string): string {
  return v === "match" ? "Съответства" : "Има съмнения / Манипулиран";
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const createStyles = () => {
  const ff = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 28,
      paddingBottom: 44,
      paddingHorizontal: 32,
      fontSize: 8,
      fontFamily: ff,
      backgroundColor: "#fff",
      lineHeight: 1.4,
    },

    /* ── Header ── */
    headerContainer: {
      alignItems: "center",
      marginBottom: 10,
    },
    logo: {
      width: 130,
      height: 32,
      objectFit: "contain",
      marginBottom: 8,
    },
    headerTitle: {
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: 0.5,
      textAlign: "center",
    },
    headerDivider: {
      borderTop: "1px solid #000",
      marginTop: 8,
      marginBottom: 14,
      width: "100%",
    },

    /* ── Info grid (3-col) ── */
    infoGrid: {
      flexDirection: "row",
      marginBottom: 4,
    },
    infoCell: {
      flex: 1,
      paddingRight: 12,
    },
    infoCellLast: {
      flex: 1,
      paddingRight: 0,
    },
    infoCellLabel: {
      fontSize: 7,
      fontWeight: 700,
      color: "#888",
      textTransform: "uppercase",
      marginBottom: 3,
      letterSpacing: 0.4,
    },
    infoCellValue: {
      fontSize: 9.5,
      color: "#111",
      fontWeight: 700,
      borderBottom: "1px solid #ccc",
      paddingBottom: 4,
      minHeight: 16,
    },
    infoGridDivider: {
      borderTop: "0.5px solid #e5e7eb",
      marginTop: 10,
      marginBottom: 10,
    },

    /* ── Section ── */
    sectionTitle: {
      fontSize: 9.5,
      fontWeight: 700,
      color: "#111",
      borderBottom: "1.5px solid #111",
      paddingBottom: 4,
      marginTop: 14,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    sectionNumber: {
      fontSize: 9.5,
      fontWeight: 700,
      color: "#111",
      marginRight: 6,
    },

    /* ── Table rows ── */
    tableRow: {
      flexDirection: "row",
      alignItems: "center",
      borderBottom: "0.5px solid #e5e7eb",
      paddingVertical: 5,
      minHeight: 22,
    },
    tableRowAlt: {
      backgroundColor: "#f9fafb",
    },
    rowLabel: {
      width: 200,
      fontSize: 8.5,
      color: "#374151",
      paddingRight: 10,
      fontWeight: 700,
    },
    rowValue: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    rowNote: {
      fontSize: 8,
      color: "#6b7280",
      marginLeft: 8,
    },

    /* ── Status badge ── */
    badge: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      fontSize: 8,
      fontWeight: 700,
    },

    /* ── Checkbox indicator ── */
    checkRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkBox: {
      width: 9,
      height: 9,
      border: "1px solid #374151",
      marginRight: 5,
      justifyContent: "center",
      alignItems: "center",
    },
    checkBoxFilled: {
      width: 5,
      height: 5,
      backgroundColor: "#374151",
    },
    checkLabel: {
      fontSize: 8.5,
      color: "#374151",
    },

    /* ── Recommendations ── */
    recoTitle: {
      fontSize: 9.5,
      fontWeight: 700,
      color: "#111",
      borderBottom: "1.5px solid #111",
      paddingBottom: 4,
      marginTop: 14,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.3,
    },
    recoItem: {
      flexDirection: "row",
      marginBottom: 5,
      alignItems: "flex-start",
    },
    recoNum: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#374151",
      width: 16,
    },
    recoText: {
      flex: 1,
      fontSize: 8.5,
      color: "#111",
      borderBottom: "0.5px solid #d1d5db",
      paddingBottom: 3,
    },

    /* ── Signatures ── */
    signaturesContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 40,
      paddingHorizontal: 10,
    },
    signatureCol: {
      alignItems: "flex-start",
      width: 180,
    },
    sigLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      marginBottom: 18,
    },
    sigLine: {
      borderBottom: "1px solid #000",
      width: "100%",
      marginBottom: 4,
    },
    sigSub: {
      fontSize: 7.5,
      color: "#111",
    },

    /* ── Footer ── */
    pageFooter: {
      position: "absolute",
      bottom: 18,
      left: 32,
      right: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: "0.5px solid #e5e7eb",
      paddingTop: 6,
    },
    footerText: {
      fontSize: 7,
      color: "#9ca3af",
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Badge({
  text,
  level,
  styles,
}: {
  text: string;
  level: "good" | "warn" | "bad";
  styles: any;
}) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: statusBg(level), color: statusColor(level) },
      ]}
    >
      <Text style={{ color: statusColor(level), fontSize: 8, fontWeight: 700 }}>
        {text}
      </Text>
    </View>
  );
}

function CheckItem({
  checked,
  text,
  styles,
}: {
  checked: boolean;
  text: string;
  styles: any;
}) {
  return (
    <View style={styles.checkRow}>
      <View style={styles.checkBox}>
        {checked && <View style={styles.checkBoxFilled} />}
      </View>
      <Text style={styles.checkLabel}>{text}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

interface CheckPDFProps {
  data: CheckFormData;
  checkNumber?: string;
}

export function CheckPDF({ data, checkNumber }: CheckPDFProps) {
  const styles = createStyles();

  const formatDate = (d: string) => {
    if (!d) return "-";
    const [y, m, day] = d.split("-");
    return `${day}.${m}.${y}`;
  };

  const summaryLines = data.summary ? data.summary.filter(Boolean) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.headerContainer}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src="/assets/logos/mbcenter-specialist2.png"
            style={styles.logo}
          />
          <Text style={styles.headerTitle}>
            ПРОТОКОЛ ЗА ТЕХНИЧЕСКО СЪСТОЯНИЕ
            {checkNumber ? ` - №${checkNumber}` : ""}
          </Text>
        </View>
        <View style={styles.headerDivider} />

        {/* ── Info grid row 1: Date | Client | Model ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>ДАТА НА ПРЕГЛЕД</Text>
            <Text style={styles.infoCellValue}>
              {formatDate(data.inspectionDate)}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>ИМЕ НА КЛИЕНТ</Text>
            <Text style={styles.infoCellValue}>{data.clientName}</Text>
          </View>
          <View style={styles.infoCellLast}>
            <Text style={styles.infoCellLabel}>МАРКА И МОДЕЛ</Text>
            <Text style={styles.infoCellValue}>{data.carModel || "-"}</Text>
          </View>
        </View>

        {/* ── Info grid row 2: Exact model | Plate | VIN | Mechanic ── */}
        <View style={[styles.infoGrid, { marginTop: 10 }]}>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>ТОЧЕН МОДЕЛ</Text>
            <Text style={styles.infoCellValue}>
              {data.carModelDetail || "-"}
            </Text>
          </View>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>РЕГ. НОМЕР</Text>
            <Text style={styles.infoCellValue}>{data.licensePlate || "-"}</Text>
          </View>
          <View style={styles.infoCellLast}>
            <Text style={styles.infoCellLabel}>VIN (РАМА)</Text>
            <Text style={styles.infoCellValue}>
              {data.vin ? data.vin.toUpperCase() : "-"}
            </Text>
          </View>
        </View>

        {/* ── Info grid row 3: Mechanic ── */}
        <View style={[styles.infoGrid, { marginTop: 10 }]}>
          <View style={styles.infoCell}>
            <Text style={styles.infoCellLabel}>МЕХАНИК / ПРЕГЛЕЖДАЩ</Text>
            <Text style={styles.infoCellValue}>{data.mechanic || "-"}</Text>
          </View>
          <View style={styles.infoCell} />
          <View style={styles.infoCellLast} />
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 1. ПРОБЕГ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>1. </Text>
            Пробег на автомобила
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Показание на километраж</Text>
            <View style={styles.rowValue}>
              <Text style={{ fontSize: 10, fontWeight: 700, color: "#111" }}>
                {data.mileage.odometer ? `${data.mileage.odometer} ${data.mileage.mileageUnit === "miles" ? "МИ" : "КМ"}` : "-"}
              </Text>
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Оценка на реален пробег</Text>
            <View style={styles.rowValue}>
              <Badge
                text={mileageLabel(data.mileage.assessment)}
                level={mileageLevel(data.mileage.assessment)}
                styles={styles}
              />
              {data.mileage.note ? (
                <Text style={styles.rowNote}>{data.mileage.note}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 2. ГУМИ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>2. </Text>
            Състояние на гумите
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Общо състояние грайфер</Text>
            <View style={styles.rowValue}>
              <Badge
                text={label(data.tires.tread_condition)}
                level={tireConditionLevel(data.tires.tread_condition)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Различни гуми</Text>
            <View style={styles.rowValue}>
              <CheckItem
                checked={data.tires.mixed_tires}
                text="Наличие на различни гуми (марка / шарка)"
                styles={styles}
              />
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 3. СПИРАЧНА СИСТЕМА */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>3. </Text>
            Спирачна система
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Предни накладки</Text>
            <View style={styles.rowValue}>
              <Badge
                text={padLabel(data.brakes.front_pads)}
                level={padLevel(data.brakes.front_pads)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Предни дискове</Text>
            <View style={styles.rowValue}>
              <Badge
                text={discLabel(data.brakes.front_discs)}
                level={discLevel(data.brakes.front_discs)}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Задни накладки</Text>
            <View style={styles.rowValue}>
              <Badge
                text={padLabel(data.brakes.rear_pads)}
                level={padLevel(data.brakes.rear_pads)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Задни дискове</Text>
            <View style={styles.rowValue}>
              <Badge
                text={discLabel(data.brakes.rear_discs)}
                level={discLevel(data.brakes.rear_discs)}
                styles={styles}
              />
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 4. ОКАЧВАНЕ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>4. </Text>
            Окачване и ходова част
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>
              Предно окачване{"\n"}(Носачи / Тампони / Шарнири)
            </Text>
            <View style={styles.rowValue}>
              <Badge
                text={suspLabel(data.suspension.front_suspension)}
                level={suspLevel(data.suspension.front_suspension)}
                styles={styles}
              />
              {data.suspension.front_suspension_note ? (
                <Text style={styles.rowNote}>
                  {data.suspension.front_suspension_note}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>
              Задно окачване{"\n"}(Носачи / Тампони)
            </Text>
            <View style={styles.rowValue}>
              <Badge
                text={suspLabel(data.suspension.rear_suspension)}
                level={suspLevel(data.suspension.rear_suspension)}
                styles={styles}
              />
              {data.suspension.rear_suspension_note ? (
                <Text style={styles.rowNote}>
                  {data.suspension.rear_suspension_note}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Амортисьори и пружини</Text>
            <View style={styles.rowValue}>
              <Badge
                text={shocksLabel(data.suspension.shocks_springs)}
                level={shocksLevel(data.suspension.shocks_springs)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Кормилна система</Text>
            <View style={styles.rowValue}>
              <Badge
                text={steeringLabel(data.suspension.steering)}
                level={steeringLevel(data.suspension.steering)}
                styles={styles}
              />
              {data.suspension.steering_note ? (
                <Text style={styles.rowNote}>
                  {data.suspension.steering_note}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 5. КОРОЗИЯ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>5. </Text>
            Корозия и купе (ръжда)
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Шаси и под автомобила</Text>
            <View style={styles.rowValue}>
              <Badge
                text={chassisLabel(data.corrosion.chassis)}
                level={chassisLevel(data.corrosion.chassis)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Прагове и вежди</Text>
            <View style={styles.rowValue}>
              <Badge
                text={sillsLabel(data.corrosion.sills)}
                level={sillsLevel(data.corrosion.sills)}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Изпускателна система (Гърнета)</Text>
            <View style={styles.rowValue}>
              <Badge
                text={exhaustLabel(data.corrosion.exhaust)}
                level={exhaustLevel(data.corrosion.exhaust)}
                styles={styles}
              />
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* 6. ТЕЧНОСТИ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <View wrap={false}>
          <Text style={styles.sectionTitle}>
            <Text style={styles.sectionNumber}>6. </Text>
            Течности и течове
          </Text>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Моторно масло</Text>
            <View style={styles.rowValue}>
              <Badge
                text={oilLabel(data.fluids.engine_oil)}
                level={oilLevel(data.fluids.engine_oil)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Антифриз (Охладителна течност)</Text>
            <View style={styles.rowValue}>
              <Badge
                text={oilLabel(data.fluids.coolant)}
                level={oilLevel(data.fluids.coolant)}
                styles={styles}
              />
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.rowLabel}>Спирачна течност</Text>
            <View style={styles.rowValue}>
              <Badge
                text={brakeFluidLabel(data.fluids.brake_fluid)}
                level={brakeFluidLevel(data.fluids.brake_fluid)}
                styles={styles}
              />
            </View>
          </View>

          <View style={[styles.tableRow, styles.tableRowAlt]}>
            <Text style={styles.rowLabel}>Видими течове двигател / кутия</Text>
            <View style={styles.rowValue}>
              <Badge
                text={leaksLabel(data.fluids.leaks)}
                level={leaksLevel(data.fluids.leaks)}
                styles={styles}
              />
              {data.fluids.leaks_note ? (
                <Text style={styles.rowNote}>{data.fluids.leaks_note}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* ПРЕПОРЪКИ */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {summaryLines.length > 0 && (
          <View wrap={false}>
            <Text style={styles.recoTitle}>Препоръки от механика</Text>
            {summaryLines.map((line, i) => (
              <View key={i} style={styles.recoItem}>
                <Text style={styles.recoNum}>{i + 1}.</Text>
                <Text style={styles.recoText}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Signatures ── */}
        <View style={styles.signaturesContainer}>
          <View style={styles.signatureCol}>
            <Text style={styles.sigLabel}>Предал автомобила:</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigSub}>/подпис на клиент/</Text>
          </View>
          <View style={styles.signatureCol}>
            <Text style={styles.sigLabel}>Приел и прегледал:</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigSub}>/подпис на механик/</Text>
          </View>
        </View>

        {/* ── Page footer ── */}
        <View style={styles.pageFooter} fixed>
          <Text style={styles.footerText}>
            MB Center - Протокол за Техническо Състояние
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
