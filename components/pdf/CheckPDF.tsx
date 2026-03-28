import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Svg, Path } from "@react-pdf/renderer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CheckFormData {
  inspectionDate: string;
  mechanic: string;
  clientName: string;
  carModel: string;
  licensePlate: string;
  vin: string;
  
  mileage: {
    odometer: string;
    assessment: string; // "match" | "manipulated"
    note: string;
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
/*  Font state (set from form before generation)                       */
/* ------------------------------------------------------------------ */

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const createStyles = () => {
  const ff = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 30,
      paddingBottom: 40,
      paddingHorizontal: 30,
      fontSize: 8,
      fontFamily: ff,
      backgroundColor: "#fff",
      lineHeight: 1.4,
    },
    /* Header */
    headerContainer: {
      marginTop: -22,
      alignItems: "center",
      marginBottom: 16,
    },
    logo: {
      width: 140,
      height: 35,
      objectFit: "contain",
      marginBottom: 10,
    },
    headerProto: {
      fontSize: 14,
      fontWeight: 700,
    },
    headerDivider: {
      borderTop: "0.5px solid #000",
      marginTop: 8,
      marginBottom: 20,
      width: "100%",
    },
    /* Info grid */
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 22,
    },
    infoCol: {
      width: "47%",
      flexDirection: "column",
    },
    infoLabel: {
      fontSize: 8,
      fontWeight: 700,
      color: "#555",
      marginBottom: 8,
    },
    infoValueContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #000",
      paddingBottom: 4,
    },
    infoValue: {
      fontSize: 10,
      fontFamily: ff,
      color: "#000",
      minHeight: 14,
    },
    chevronIcon: {
      width: 10,
      height: 10,
    },
    /* Section headers */
    sectionHeader: {
      backgroundColor: "#000",
      color: "#fff",
      paddingVertical: 5,
      paddingHorizontal: 8,
      fontSize: 11.5,
      fontWeight: 700,
      marginTop: 6,
      marginBottom: 10,
    },
    /* Rows */
    rowUnderline: {
      flexDirection: "row",
      alignItems: "center",
      borderBottom: "1px dashed #ddd",
      paddingBottom: 6,
      marginBottom: 8,
      minHeight: 18,
    },
    label: {
      width: 185,
      paddingRight: 12,
      fontSize: 9.5,
      fontWeight: 700,
      color: "#333",
    },
    labelSmall: {
      width: 185,
      paddingRight: 12,
      fontSize: 9.5,
      fontWeight: 700,
      color: "#333",
    },
    valueBlock: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
    },
    /* Radio / Checkbox */
    controlWrap: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 16,
    },
    radioOuter: {
      width: 10.5,
      height: 10.5,
      borderRadius: 6,
      border: "1px solid #000",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 4,
    },
    radioInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "#000",
    },
    checkboxOuter: {
      width: 10.5,
      height: 10.5,
      border: "1px solid #000",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 4,
    },
    checkboxInner: {
      width: 6,
      height: 6,
      backgroundColor: "#000",
    },
    controlLabel: {
      fontSize: 9.5,
      color: "#333",
      paddingTop: 1.5,
    },
    /* Notes */
    noteLine: {
      flex: 1,
      borderBottom: "1px dashed #ccc",
      minHeight: 14,
      fontSize: 9.5,
      marginLeft: 10,
      paddingBottom: 1,
      color: "#000",
    },
    /* Recommendations */
    recoLine: {
      borderBottom: "1px solid #999",
      height: 20,
      marginBottom: 6,
      fontSize: 10.5,
      color: "#000",
    },
    /* Footer signatures */
    signatures: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 40,
      paddingHorizontal: 20,
    },
    signatureCol: {
      alignItems: "center",
      width: 160,
    },
    sigLabel: {
      fontSize: 9,
      fontWeight: 700,
      marginBottom: 16,
      alignSelf: "flex-start",
    },
    sigLine: {
      borderBottom: "1px dotted #000",
      width: "100%",
      height: 10,
      marginBottom: 4,
    },
    sigSub: {
      fontSize: 8,
      color: "#666",
    },
  });
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const Radio = ({ checked, label, styles }: { checked: boolean; label: string; styles: any }) => (
  <View style={styles.controlWrap}>
    <View style={styles.radioOuter}>
      {checked && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.controlLabel}>{label}</Text>
  </View>
);

const Checkbox = ({ checked, label, styles }: { checked: boolean; label: string; styles: any }) => (
  <View style={styles.controlWrap}>
    <View style={styles.checkboxOuter}>
      {checked && <View style={styles.checkboxInner} />}
    </View>
    <Text style={styles.controlLabel}>{label}</Text>
  </View>
);

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
    return `${day} - ${m} - ${y}`;
  };

  // Convert summary text into lines for the recommendation section
  const summaryLines = data.summary ? data.summary.filter(Boolean) : [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Image
            src="/assets/logos/mbcenter-specialist2.png"
            style={styles.logo}
          />
          <Text style={styles.headerProto}>ПРОТОКОЛ ЗА ТЕХНИЧЕСКО СЪСТОЯНИЕ</Text>
        </View>
        <View style={styles.headerDivider} />

        {/* Info Grid */}
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>МЕХАНИК:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{data.mechanic}</Text>
              <Svg style={styles.chevronIcon} viewBox="0 0 24 24">
                <Path d="M6 9l6 6 6-6" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ДАТА:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{formatDate(data.inspectionDate)}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ИМЕ НА КЛИЕНТ:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{data.clientName}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>МАРКА И МОДЕЛ:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{data.carModel}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.infoRow, { marginBottom: 14 }]}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>РЕГИСТРАЦИОНЕН НОМЕР:</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{data.licensePlate}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>VIN (РАМА):</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{data.vin ? data.vin.toUpperCase() : ""}</Text>
            </View>
          </View>
        </View>

        {/* 1. ПРОБЕГ */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>1. ПРОБЕГ НА АВТОМОБИЛА</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.label}>Показание на километраж:</Text>
            <Text style={[styles.infoValue, { flex: 0.5, marginLeft: 10 }]}>{data.mileage.odometer}</Text>
            <View style={{ flex: 0.5 }} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Оценка на реален пробег:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.mileage.assessment === "match"} label="Съответства" styles={styles} />
            <Radio checked={data.mileage.assessment === "manipulated"} label="Има съмнения / Манипулиран" styles={styles} />
            <Text style={styles.noteLine}>{data.mileage.note}</Text>
          </View>
        </View>

        {/* 2. ГУМИ */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>2. СЪСТОЯНИЕ НА ГУМИТЕ</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.label}>Общо състояние грайфер:</Text>
            <View style={styles.valueBlock}>
              <Radio checked={data.tires.tread_condition === "good"} label="Добро" styles={styles} />
              <Radio checked={data.tires.tread_condition === "worn"} label="Захабени" styles={styles} />
              <Radio checked={data.tires.tread_condition === "replace"} label="За смяна" styles={styles} />
            </View>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Различни гуми:</Text>
          <View style={styles.valueBlock}>
            <Checkbox checked={data.tires.mixed_tires} label="Наличие на различни гуми (марка/шарка)" styles={styles} />
          </View>
        </View>

        {/* 3. СПИРАЧНА СИСТЕМА */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>3. СПИРАЧНА СИСТЕМА</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.label}>Предни накладки:</Text>
            <View style={styles.valueBlock}>
              <Radio checked={data.brakes.front_pads === "good"} label="Добри" styles={styles} />
              <Radio checked={data.brakes.front_pads === "worn"} label="Износени" styles={styles} />
              <Radio checked={data.brakes.front_pads === "replace"} label="За смяна" styles={styles} />
            </View>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Предни дискове:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.brakes.front_discs === "good"} label="Добри" styles={styles} />
            <Radio checked={data.brakes.front_discs === "lipped"} label="Имат ръб / Криви" styles={styles} />
            <Radio checked={data.brakes.front_discs === "below_min"} label="Под минимум" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Задни накладки:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.brakes.rear_pads === "good"} label="Добри" styles={styles} />
            <Radio checked={data.brakes.rear_pads === "worn"} label="Износени" styles={styles} />
            <Radio checked={data.brakes.rear_pads === "replace"} label="За смяна" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Задни дискове:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.brakes.rear_discs === "good"} label="Добри" styles={styles} />
            <Radio checked={data.brakes.rear_discs === "lipped"} label="Имат ръб / Криви" styles={styles} />
            <Radio checked={data.brakes.rear_discs === "below_min"} label="Под минимум" styles={styles} />
          </View>
        </View>

        {/* 4. ОКАЧВАНЕ */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>4. ОКАЧВАНЕ И ХОДОВА ЧАСТ</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.label}>Предно окачване (Носачи / Тампони / Шарнири):</Text>
            <View style={styles.valueBlock}>
              <Radio checked={data.suspension.front_suspension === "good"} label="Здраво" styles={styles} />
              <Radio checked={data.suspension.front_suspension === "play"} label="Има луфт / Напукани" styles={styles} />
              <Radio checked={data.suspension.front_suspension === "repair"} label="За ремонт" styles={styles} />
              <Text style={styles.noteLine}>{data.suspension.front_suspension_note}</Text>
            </View>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Задно окачване (Носачи / Тампони):</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.suspension.rear_suspension === "good"} label="Здраво" styles={styles} />
            <Radio checked={data.suspension.rear_suspension === "play"} label="Има луфт / Напукани" styles={styles} />
            <Radio checked={data.suspension.rear_suspension === "repair"} label="За ремонт" styles={styles} />
            <Text style={styles.noteLine}>{data.suspension.rear_suspension_note}</Text>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Амортисьори и пружини:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.suspension.shocks_springs === "good"} label="Изправни" styles={styles} />
            <Radio checked={data.suspension.shocks_springs === "leaking"} label="Омаслени" styles={styles} />
            <Radio checked={data.suspension.shocks_springs === "broken"} label="Счупена пружина" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.label}>Кормилна система:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.suspension.steering === "good"} label="Изправна" styles={styles} />
            <Radio checked={data.suspension.steering === "leak_play"} label="Теч / Луфт" styles={styles} />
            <Text style={styles.noteLine}>{data.suspension.steering_note}</Text>
          </View>
        </View>

        {/* 5. КОРОЗИЯ */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>5. КОРОЗИЯ И КУПЕ (РЪЖДА)</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.labelSmall}>Шаси и под автомобила:</Text>
            <View style={styles.valueBlock}>
              <Radio checked={data.corrosion.chassis === "none"} label="Няма" styles={styles} />
              <Radio checked={data.corrosion.chassis === "surface"} label="Повърхностна" styles={styles} />
              <Radio checked={data.corrosion.chassis === "deep"} label="Дълбока / Изгнило" styles={styles} />
            </View>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.labelSmall}>Прагове и вежди:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.corrosion.sills === "good"} label="Здрави" styles={styles} />
            <Radio checked={data.corrosion.sills === "starting"} label="Започваща ръжда" styles={styles} />
            <Radio checked={data.corrosion.sills === "rusted"} label="Изгнили" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.labelSmall}>Изпускателна система (Гърнета):</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.corrosion.exhaust === "good"} label="Здрава" styles={styles} />
            <Radio checked={data.corrosion.exhaust === "rusted"} label="Ръждясала" styles={styles} />
            <Radio checked={data.corrosion.exhaust === "holes"} label="Пробита / Заварки" styles={styles} />
          </View>
        </View>

        {/* 6. ТЕЧНОСТИ */}
        <View wrap={false}>
          <Text style={styles.sectionHeader}>6. ТЕЧНОСТИ И ТЕЧОВЕ</Text>
          <View style={styles.rowUnderline}>
            <Text style={styles.labelSmall}>Моторно масло:</Text>
            <View style={styles.valueBlock}>
              <Radio checked={data.fluids.engine_oil === "ok"} label="В норма" styles={styles} />
              <Radio checked={data.fluids.engine_oil === "low"} label="Ниско ниво" styles={styles} />
              <Radio checked={data.fluids.engine_oil === "replace"} label="За смяна" styles={styles} />
            </View>
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.labelSmall}>Антифриз (Охладителна течност):</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.fluids.coolant === "ok"} label="В норма" styles={styles} />
            <Radio checked={data.fluids.coolant === "low"} label="Ниско ниво" styles={styles} />
            <Radio checked={data.fluids.coolant === "replace"} label="За смяна / Мътен" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.labelSmall}>Спирачна течност:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.fluids.brake_fluid === "ok"} label="В норма" styles={styles} />
            <Radio checked={data.fluids.brake_fluid === "replace"} label="За смяна (>3% влага)" styles={styles} />
          </View>
        </View>
        <View style={styles.rowUnderline} wrap={false}>
          <Text style={styles.labelSmall}>Видими течове двигател / кутия:</Text>
          <View style={styles.valueBlock}>
            <Radio checked={data.fluids.leaks === "none"} label="Няма (Сух)" styles={styles} />
            <Radio checked={data.fluids.leaks === "sweat"} label="Леко омасляване" styles={styles} />
            <Radio checked={data.fluids.leaks === "active"} label="Активен теч" styles={styles} />
            <Text style={styles.noteLine}>{data.fluids.leaks_note}</Text>
          </View>
        </View>

        {/* Recommendations */}
        {summaryLines.length > 0 && (
          <View wrap={false}>
            <Text style={styles.sectionHeader}>ПРЕПОРЪКИ ОТ МЕХАНИКА</Text>
            {summaryLines.map((line, i) => (
              <View key={i} style={{ flexDirection: "row", marginBottom: 4 }}>
                <Text style={{ fontSize: 9, fontWeight: 700, marginRight: 8 }}>{i + 1}.</Text>
                <Text style={styles.recoLine}>{line}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatures}>
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

      </Page>
    </Document>
  );
}
