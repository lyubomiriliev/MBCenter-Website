import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { OfferWithRelations } from "@/types/database";

/**
 * Сервизна поръчка — the printed sheet handed to the mechanic together with
 * the car key. Mirrors the mechanics' offer view (car, ASSYST PLUS, repair,
 * parts, service notes) without any prices. Every field the mechanic fills in
 * by hand (ASSYST PLUS, "Изпълнено от", service notes) is printed blank.
 */

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

const INK = "#111111";
const MUTED = "#6b6b6b";
const LINE = "#c9c9c9";
const FILL = "#f3f3f3";

const createStyles = () => {
  const fontFamily = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 40,
      paddingHorizontal: 32,
      fontSize: 10,
      fontFamily,
      color: INK,
      backgroundColor: "#ffffff",
      // No lineHeight here: on the Page it stops the fixed footer rendering.
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      // Top-aligned so the logo sits level with the СЕРВИЗНА ПОРЪЧКА line,
      // not centred against the whole title/number/date block.
      alignItems: "flex-start",
      paddingBottom: 8,
      marginBottom: 12,
      borderBottom: `2px solid ${INK}`,
    },
    // Box matches the PNG's 936×181 ratio so no empty band pushes it down.
    // marginTop centres the MBCENTER wordmark on the title's capital letters.
    logo: { width: 150, height: 29, marginTop: 3.2 },
    headerRight: { alignItems: "flex-end" },
    title: { fontSize: 18, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1.2 },
    titleNumber: { fontSize: 13, fontWeight: 700, marginTop: 4 },
    headerMeta: { fontSize: 9, color: MUTED, marginTop: 2 },

    section: {
      border: `1px solid ${LINE}`,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 8,
    },
    sectionTitleSpaced: {
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: 2,
      marginBottom: 8,
    },
    divider: { borderTop: `1px solid ${LINE}`, marginTop: 2, marginBottom: 8 },

    row: { flexDirection: "row", marginHorizontal: -6 },
    col: { flex: 1, paddingHorizontal: 6, marginBottom: 8 },
    label: { fontSize: 8.5, color: MUTED, marginBottom: 2 },
    value: { fontSize: 11 },
    valueMono: { fontSize: 11, letterSpacing: 0.5 },
    plateText: { fontSize: 13, fontWeight: 700, letterSpacing: 1 },

    // Blank box the mechanic writes into.
    blank: {
      height: 22,
      border: `1px solid ${INK}`,
      borderRadius: 3,
    },
    blankWithUnit: { flexDirection: "row", alignItems: "center" },
    blankFlex: {
      flex: 1,
      height: 22,
      border: `1px solid ${INK}`,
      borderRadius: 3,
      marginRight: 8,
    },
    unitOption: { flexDirection: "row", alignItems: "center", marginLeft: 6 },
    checkbox: {
      width: 10,
      height: 10,
      border: `1px solid ${INK}`,
      marginRight: 3,
    },
    unitText: { fontSize: 9 },

    text: { fontSize: 11 },
    textMuted: { fontSize: 11, color: MUTED },

    tableHeader: {
      flexDirection: "row",
      backgroundColor: FILL,
      borderBottom: `1px solid ${INK}`,
      paddingVertical: 5,
      fontSize: 8.5,
      fontWeight: 700,
      color: MUTED,
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: `1px solid ${LINE}`,
      paddingVertical: 5,
      alignItems: "center",
    },
    cellNum: { width: 26, paddingLeft: 4 },
    cellName: { flex: 2, paddingRight: 8 },
    cellPart: { flex: 1.2, paddingRight: 8 },
    cellQty: { width: 44, textAlign: "right", paddingRight: 4 },
    cellCheck: { width: 34, alignItems: "center" },

    notesLine: { borderBottom: `1px solid ${LINE}`, height: 22 },

    footer: {
      position: "absolute",
      bottom: 16,
      left: 32,
      right: 32,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: `1px solid ${LINE}`,
      paddingTop: 5,
    },
    footerText: { fontSize: 8, color: MUTED },
  });
};

type Styles = ReturnType<typeof createStyles>;

const Blank = ({ styles }: { styles: Styles }) => <View style={styles.blank} />;

const UnitChoice = ({ styles }: { styles: Styles }) => (
  <>
    <View style={styles.unitOption}>
      <View style={styles.checkbox} />
      <Text style={styles.unitText}>км</Text>
    </View>
    <View style={styles.unitOption}>
      <View style={styles.checkbox} />
      <Text style={styles.unitText}>мили</Text>
    </View>
  </>
);

// Above this much reception text the repair block is allowed to continue on
// the next page; a block that can't wrap and is taller than a page gets cut.
const MAX_ATOMIC_NOTES_CHARS = 600;
const MAX_ATOMIC_NOTES_LINES = 10;

// Built from a string: the tsconfig target predates the regex "u" flag.
const EMOJI = new RegExp("[\\p{Extended_Pictographic}\\u{FE0F}\\u{200D}]", "gu");

/** Drops emoji: NotoSans has no glyphs for them, so they print as garbage. */
const clean = (value: string | null | undefined): string =>
  (value ?? "").replace(EMOJI, "").trim();

/**
 * Hyphenation for typed-in text: lets a very long word with no spaces (e.g. a
 * part name pasted without them) wrap inside its column instead of running
 * over the next one. Normal words are never split.
 */
const splitLongWords = (word: string): string[] =>
  word.length > 18 ? (word.match(/.{1,10}/g) ?? [word]) : [word];

interface WorkOrderPDFProps {
  offer: OfferWithRelations;
}

export const WorkOrderPDF = ({ offer }: WorkOrderPDFProps) => {
  const styles = createStyles();

  const model =
    clean(
      [offer.car_model_text, offer.car_model_detail].filter(Boolean).join(" "),
    ) || "-";
  const plate = clean(offer.license_plate).toUpperCase();
  const vin = clean(offer.vin_text).toUpperCase();
  const repairName = clean(offer.repair_name);
  const receptionNotes = clean(offer.notes_service);
  const repairBlockFitsPage =
    repairName.length + receptionNotes.length <= MAX_ATOMIC_NOTES_CHARS &&
    receptionNotes.split("\n").length <= MAX_ATOMIC_NOTES_LINES;
  const mileageUnit = offer.mileage_unit === "miles" ? "мили" : "км";
  const parts = (offer.items || [])
    .filter((item) => item.type === "part")
    .sort((a, b) => a.sort_order - b.sort_order);
  const number = offer.offer_number || "";
  const printedAt = new Date().toLocaleString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const renderPartRow = (part: (typeof parts)[number], i: number) => (
    <View key={part.id} style={styles.tableRow} wrap={false}>
      <Text style={[styles.cellNum, { color: MUTED }]}>{i + 1}</Text>
      <Text style={styles.cellName} hyphenationCallback={splitLongWords}>
        {clean(part.description) || "-"}
      </Text>
      <Text style={styles.cellPart} hyphenationCallback={splitLongWords}>
        {clean(part.part_number) || "-"}
      </Text>
      <Text style={styles.cellQty}>{part.quantity}</Text>
      <View style={styles.cellCheck}>
        <View style={styles.checkbox} />
      </View>
    </View>
  );

  return (
    <Document title={`Сервизна поръчка №${number}`}>
      <Page size="A4" style={styles.page}>
        {/* Footer — fixed elements must come first to repeat on every page */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            MB Center · Сервизна поръчка № {number}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Стр. ${pageNumber} / ${totalPages}`
            }
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image
            src="/assets/logos/mbcenter-specialist2.png"
            style={styles.logo}
          />
          <View style={styles.headerRight}>
            <Text style={styles.title}>СЕРВИЗНА ПОРЪЧКА</Text>
            <Text style={styles.titleNumber}>№ {number}</Text>
            <Text style={styles.headerMeta}>Отпечатана на {printedAt}</Text>
          </View>
        </View>

        {/* Car info + ASSYST PLUS */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Информация за автомобила</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Модел</Text>
              <Text style={styles.value} hyphenationCallback={splitLongWords}>
                {model}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Регистрационен номер</Text>
              {plate ? (
                <Text
                  style={styles.plateText}
                  hyphenationCallback={splitLongWords}
                >
                  {plate}
                </Text>
              ) : (
                <Blank styles={styles} />
              )}
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>VIN номер</Text>
              <Text
                style={styles.valueMono}
                hyphenationCallback={splitLongWords}
              >
                {vin || "-"}
              </Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Пробег</Text>
              {offer.mileage ? (
                <Text style={styles.value}>
                  {offer.mileage.toLocaleString("bg-BG")} {mileageUnit}
                </Text>
              ) : (
                <View style={styles.blankWithUnit}>
                  <View style={styles.blankFlex} />
                  <UnitChoice styles={styles} />
                </View>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitleSpaced}>ASSYST PLUS</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Оставащо време (дни)</Text>
              <Blank styles={styles} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Оставащ пробег</Text>
              <View style={styles.blankWithUnit}>
                <View style={styles.blankFlex} />
                <UnitChoice styles={styles} />
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Сервизен код</Text>
              <Blank styles={styles} />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Код на обслужване</Text>
              <Blank styles={styles} />
            </View>
          </View>
        </View>

        {/* Repair name with reception notes below it, performed-by on the
            right. Long notes may continue on the next page instead of being
            cut off. */}
        <View style={styles.section} wrap={!repairBlockFitsPage}>
          <View style={styles.row}>
            <View style={[styles.col, { flex: 2, marginBottom: 0 }]}>
              <Text style={styles.sectionTitle}>Наименование на ремонт</Text>
              <Text
                style={repairName ? styles.text : styles.textMuted}
                hyphenationCallback={splitLongWords}
              >
                {repairName || "-"}
              </Text>
              <Text
                style={[styles.sectionTitle, { marginTop: 10 }]}
                minPresenceAhead={40}
              >
                Забележки от приемна
              </Text>
              <Text
                style={receptionNotes ? styles.text : styles.textMuted}
                hyphenationCallback={splitLongWords}
              >
                {receptionNotes || "-"}
              </Text>
            </View>
            <View style={styles.col} wrap={false}>
              <Text style={styles.sectionTitle}>Изпълнено от</Text>
              <Blank styles={styles} />
            </View>
          </View>
        </View>

        {/* Parts — rows never split; the table may continue on the next page.
            The title, header and first row stay together so the title can
            never be left alone at the bottom of a page. */}
        {parts.length > 0 && (
          <View style={styles.section}>
            <View wrap={false}>
              <Text style={styles.sectionTitle}>Части ({parts.length})</Text>
              <View style={styles.tableHeader}>
                <Text style={styles.cellNum}>#</Text>
                <Text style={styles.cellName}>ИМЕ НА ПРОДУКТ</Text>
                <Text style={styles.cellPart}>№ ЧАСТ</Text>
                <Text style={styles.cellQty}>К-ВО</Text>
                <View style={styles.cellCheck} />
              </View>
              {renderPartRow(parts[0], 0)}
            </View>
            {parts.slice(1).map((part, i) => renderPartRow(part, i + 1))}
          </View>
        )}

        {/* Service notes — blank ruled lines for the mechanic */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Забележки от сервиза</Text>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={styles.notesLine} />
          ))}
        </View>
      </Page>
    </Document>
  );
};
