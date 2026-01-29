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

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

const EUR_TO_BGN = 1.95583;
const VAT_RATE = 0.2;

// Create styles function that uses current fontRegistered state
const createStyles = () => {
  const fontFamily = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      padding: 35,
      fontSize: 9,
      fontFamily: fontFamily,
      backgroundColor: "#ffffff",
      lineHeight: 1.4,
    },
    text: { fontFamily: fontFamily, fontSize: 11, lineHeight: 1.2 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
      paddingBottom: 15,
      borderBottom: "2px solid #000",
    },
    logo: {
      width: 140,
      height: 42,
      marginBottom: 8,
      objectFit: "contain",
    },
    headerLeft: {
      width: "50%",
    },
    headerRight: {
      width: "50%",
      alignItems: "flex-end",
      paddingTop: 55,
    },
    companyName: {
      fontSize: 12,
      fontWeight: 700,
      marginTop: 5,
      marginBottom: 3,
      textTransform: "uppercase",
      fontFamily: fontFamily,
    },
    companyInfo: {
      fontSize: 8.5,
      marginTop: 2,
      color: "#000",
      lineHeight: 1.5,
      fontFamily: fontFamily,
    },
    customerInfo: {
      fontSize: 9,
      marginTop: 2,
      textAlign: "right",
      fontWeight: 500,
      lineHeight: 1.5,
      fontFamily: fontFamily,
    },
    title: {
      fontSize: 16,
      fontWeight: 700,
      textAlign: "center",
      marginTop: 15,
      marginBottom: 15,
      letterSpacing: 0.5,
      fontFamily: fontFamily,
    },
    vinText: {
      fontSize: 10,
      textAlign: "center",
      marginBottom: 15,
      fontWeight: 500,
      fontFamily: fontFamily,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 700,
      marginTop: 15,
      marginBottom: 8,
      paddingBottom: 6,
      borderBottom: "2px solid #000",
      fontFamily: fontFamily,
    },
  table: {
    width: "100%",
    marginBottom: 10,
    border: "1px solid #000",
    borderCollapse: "collapse",
  },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#000",
      color: "#fff",
      padding: 2,
      fontWeight: 700,
      fontSize: 8,
      fontFamily: fontFamily,
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1px solid #ddd",
      padding: 4,
      fontSize: 8,
      minHeight: 22,
      alignItems: "center",
      fontFamily: fontFamily,
    },
  tableRowAlt: {
    backgroundColor: "#f5f5f5",
  },
  // Parts table columns (7 columns) - matching sample PDF
  // Using flex instead of width for better column sizing in react-pdf
  col1: { flex: 0.06, paddingVertical: 2, paddingHorizontal: 2 },
  col2: { flex: 0.30, paddingLeft: 5, paddingVertical: 2, paddingRight: 2 },
  col3: { flex: 0.16, paddingVertical: 2, paddingHorizontal: 2 },
  col4: { flex: 0.12, paddingVertical: 2, paddingHorizontal: 2 },
  col5: { flex: 0.08, paddingVertical: 2, paddingHorizontal: 2 },
  col6: { flex: 0.14, paddingRight: 5, paddingVertical: 2, paddingLeft: 2 },
  col7: { flex: 0.14, paddingRight: 5, paddingVertical: 2, paddingLeft: 2 },
  // Service actions columns (5 columns)
  colSvc1: { flex: 0.05, paddingHorizontal: 2 },
  colSvc2: { flex: 0.42, paddingLeft: 4, paddingRight: 2 },
  colSvc3: { flex: 0.15, paddingHorizontal: 2 },
  colSvc4: { flex: 0.19, paddingRight: 4, paddingLeft: 2 },
  colSvc5: { flex: 0.19, paddingRight: 4, paddingLeft: 2 },
    // Text styles for table cells
    colTextCenter: { textAlign: "center", fontFamily: fontFamily, fontSize: 8 },
    colTextLeft: { textAlign: "left", fontFamily: fontFamily, fontSize: 8 },
    colTextRight: { textAlign: "right", fontFamily: fontFamily, fontSize: 8 },
  summarySection: {
    marginTop: 25,
    padding: 15,
    border: "2px solid #000",
    backgroundColor: "#f9f9f9",
  },
    summaryTitle: {
      fontSize: 14,
      fontWeight: 700,
      marginBottom: 10,
      textAlign: "center",
      fontFamily: fontFamily,
    },
  summaryTable: {
    width: "100%",
    border: "1px solid #000",
  },
    summaryHeaderRow: {
      flexDirection: "row",
      backgroundColor: "#000",
      color: "#fff",
      padding: 6,
      fontWeight: 700,
      fontSize: 8.5,
      borderBottom: "2px solid #000",
      fontFamily: fontFamily,
    },
    summaryRow: {
      flexDirection: "row",
      padding: 6,
      borderBottom: "1px solid #ddd",
      fontSize: 8.5,
      minHeight: 22,
      alignItems: "center",
      fontFamily: fontFamily,
    },
  summaryCol1: { flex: 0.35, paddingLeft: 4, paddingRight: 2 },
  summaryCol2: { flex: 0.20, paddingRight: 4, paddingLeft: 2 },
  summaryCol3: { flex: 0.15, paddingHorizontal: 2 },
  summaryCol4: { flex: 0.15, paddingRight: 4, paddingLeft: 2 },
  summaryCol5: { flex: 0.15, paddingRight: 4, paddingLeft: 2 },
  summaryTotalRow: {
    backgroundColor: "#e0e0e0",
    fontWeight: 700,
  },
    footer: {
      marginTop: 30,
      paddingTop: 10,
      borderTop: "1px solid #ccc",
      fontSize: 7,
      color: "#555",
      fontFamily: fontFamily,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    footerText: {
      fontSize: 7,
      marginTop: 2,
      fontFamily: fontFamily,
      lineHeight: 1.3,
    },
    disclaimer: {
      marginTop: 8,
      fontSize: 6.5,
      color: "#888",
      lineHeight: 1.3,
      fontFamily: fontFamily,
    },
  });
};

interface OfferPDFv3Props {
  offer: OfferWithRelations;
  locale: "bg" | "en";
}

export function OfferPDFv3({ offer, locale }: OfferPDFv3Props) {
  // Create styles dynamically based on current fontRegistered state
  const styles = createStyles();
  
  // Format currency
  const formatDual = (eurValue: number) => {
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${eurValue.toFixed(2)} € / ${bgnValue.toFixed(2)} BGN`;
  };

  // Calculate parts total (with VAT)
  const partsNet = (offer.items || [])
    .filter((item) => item.type === "part")
    .reduce((sum, item) => sum + item.total, 0);
  const partsVat = partsNet * VAT_RATE;
  const partsGross = partsNet + partsVat;

  // Calculate service actions total (with VAT)
  const serviceNet = (offer.service_actions || []).reduce(
    (sum, action) => sum + action.total_eur_net,
    0
  );
  const serviceVat = serviceNet * VAT_RATE;
  const serviceGross = serviceNet + serviceVat;

  // Grand total
  const totalNet = partsNet + serviceNet;
  const totalVat = partsVat + serviceVat;
  const totalGross = partsGross + serviceGross;

  // Check if any part has a part number
  const parts = (offer.items || []).filter((item) => item.type === "part");
  const hasPartNumbers = parts.some((item) => item.part_number && item.part_number.trim() !== '');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image
              src="/assets/logos/mbcenter-specialist.png"
              style={styles.logo}
            />
            <Text style={styles.companyName}>ЕМ БИ ЦЕНТЪР ООД</Text>
            <Text style={styles.companyInfo}>
              ул. Околовръстен път 155, 1700 София
            </Text>
            <Text style={styles.companyInfo}>Булстат: 207901533</Text>
            <Text style={styles.companyInfo}>ДДС номер: BG207901533</Text>
            <Text style={styles.companyInfo}>0883788873</Text>
            <Text style={styles.companyInfo}>contact@mbcenter.bg</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.customerInfo}>
              {offer.customer_name || ""}
            </Text>
            <Text style={styles.customerInfo}>
              {offer.car_model_text || ""}
            </Text>
            <Text style={styles.customerInfo}>
              {offer.customer_phone || ""}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Оферта №{offer.offer_number}</Text>
        {offer.vin_text && (
          <Text style={styles.vinText}>VIN: {offer.vin_text.toUpperCase()}</Text>
        )}

        {/* Parts Table */}
        {parts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Части</Text>
            <View style={styles.table} wrap={false}>
              <View style={styles.tableHeader}>
                <View style={styles.col1}><Text style={styles.colTextCenter}>№</Text></View>
                <View style={styles.col2}><Text style={styles.colTextLeft}>Продукт</Text></View>
                <View style={styles.col3}><Text style={styles.colTextCenter}>Производител</Text></View>
                {hasPartNumbers && <View style={styles.col4}><Text style={styles.colTextCenter}>№ част</Text></View>}
                <View style={styles.col5}><Text style={styles.colTextCenter}>К-во</Text></View>
                <View style={styles.col6}><Text style={styles.colTextRight}>Цена на брой (с ДДС)</Text></View>
                <View style={styles.col7}><Text style={styles.colTextRight}>Обща цена (с ДДС)</Text></View>
              </View>
              {parts
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((item, index) => {
                  const unitPriceGross = item.unit_price * (1 + VAT_RATE);
                  const totalGross = item.total * (1 + VAT_RATE);
                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.tableRow,
                        index % 2 === 1 ? styles.tableRowAlt : {},
                      ]}
                    >
                      <View style={styles.col1}><Text style={styles.colTextCenter}>{index + 1}</Text></View>
                      <View style={styles.col2}><Text style={styles.colTextLeft}>{item.description || "-"}</Text></View>
                      <View style={styles.col3}><Text style={styles.colTextCenter}>{item.brand || "-"}</Text></View>
                      {hasPartNumbers && <View style={styles.col4}><Text style={styles.colTextCenter}>{item.part_number || "-"}</Text></View>}
                      <View style={styles.col5}><Text style={styles.colTextCenter}>{item.quantity}</Text></View>
                      <View style={styles.col6}><Text style={styles.colTextRight}>{formatDual(unitPriceGross)}</Text></View>
                      <View style={styles.col7}><Text style={styles.colTextRight}>{formatDual(totalGross)}</Text></View>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* Service Actions Table */}
        {offer.service_actions && offer.service_actions.length > 0 && (
          <>
            <Text style={styles.sectionTitle} break>Сервизни активности</Text>
            <View style={styles.table} wrap={false}>
              <View style={styles.tableHeader}>
                <View style={styles.colSvc1}><Text style={styles.colTextCenter}>№</Text></View>
                <View style={styles.colSvc2}><Text style={styles.colTextLeft}>Сервизна дейност</Text></View>
                <View style={styles.colSvc3}><Text style={styles.colTextCenter}>Време за ремонт</Text></View>
                <View style={styles.colSvc4}><Text style={styles.colTextRight}>Цена на час (с ДДС)</Text></View>
                <View style={styles.colSvc5}><Text style={styles.colTextRight}>Цена за ремонт (с ДДС)</Text></View>
              </View>
              {offer.service_actions
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((action, index) => {
                  const hourlyRateGross =
                    action.price_per_hour_eur_net * (1 + VAT_RATE);
                  const totalGross = action.total_eur_net * (1 + VAT_RATE);
                  return (
                    <View
                      key={action.id}
                      style={[
                        styles.tableRow,
                        index % 2 === 1 ? styles.tableRowAlt : {},
                      ]}
                    >
                      <View style={styles.colSvc1}><Text style={styles.colTextCenter}>{index + 1}</Text></View>
                      <View style={styles.colSvc2}><Text style={styles.colTextLeft}>{action.action_name || "-"}</Text></View>
                      <View style={styles.colSvc3}><Text style={styles.colTextCenter}>{action.time_required_text || "-"}</Text></View>
                      <View style={styles.colSvc4}><Text style={styles.colTextRight}>{formatDual(hourlyRateGross)}</Text></View>
                      <View style={styles.colSvc5}><Text style={styles.colTextRight}>{formatDual(totalGross)}</Text></View>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Обобщена оферта</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryHeaderRow}>
              <View style={styles.summaryCol1}><Text style={styles.colTextLeft}>Вид на разходите</Text></View>
              <View style={styles.summaryCol2}><Text style={styles.colTextRight}>Обща стойност (без ДДС)</Text></View>
              <View style={styles.summaryCol3}><Text style={styles.colTextCenter}>Ставка на ДДС</Text></View>
              <View style={styles.summaryCol4}><Text style={styles.colTextRight}>ДДС</Text></View>
              <View style={styles.summaryCol5}><Text style={styles.colTextRight}>Обща стойност (с ДДС)</Text></View>
            </View>
            {offer.items &&
              offer.items.filter((i) => i.type === "part").length > 0 && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCol1}><Text style={styles.colTextLeft}>Части</Text></View>
                  <View style={styles.summaryCol2}><Text style={styles.colTextRight}>{formatDual(partsNet)}</Text></View>
                  <View style={styles.summaryCol3}><Text style={styles.colTextCenter}>20%</Text></View>
                  <View style={styles.summaryCol4}><Text style={styles.colTextRight}>{formatDual(partsVat)}</Text></View>
                  <View style={styles.summaryCol5}><Text style={styles.colTextRight}>{formatDual(partsGross)}</Text></View>
                </View>
              )}
            {offer.service_actions && offer.service_actions.length > 0 && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol1}><Text style={styles.colTextLeft}>Сервизни активности</Text></View>
                <View style={styles.summaryCol2}><Text style={styles.colTextRight}>{formatDual(serviceNet)}</Text></View>
                <View style={styles.summaryCol3}><Text style={styles.colTextCenter}>20%</Text></View>
                <View style={styles.summaryCol4}><Text style={styles.colTextRight}>{formatDual(serviceVat)}</Text></View>
                <View style={styles.summaryCol5}><Text style={styles.colTextRight}>{formatDual(serviceGross)}</Text></View>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <View style={styles.summaryCol1}><Text style={styles.colTextLeft}>Обща стойност</Text></View>
              <View style={styles.summaryCol2}><Text style={styles.colTextRight}>{formatDual(totalNet)}</Text></View>
              <View style={styles.summaryCol3}><Text style={styles.colTextCenter}></Text></View>
              <View style={styles.summaryCol4}><Text style={styles.colTextRight}></Text></View>
              <View style={styles.summaryCol5}><Text style={styles.colTextRight}>{formatDual(totalGross)}</Text></View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text>София</Text>
            <Text>{new Date(offer.created_at).toLocaleString("bg-BG")}</Text>
          </View>
          {offer.created_by_name && (
            <Text style={styles.footerText}>
              Този документ е създаден от: {offer.created_by_name}
            </Text>
          )}
          <Text style={styles.footerText}>и-мейл: contact@mbcenter.bg</Text>
          <Text style={styles.disclaimer}>
            Цените, посочени в тази оферта, са валидни в момента на нейното
            създаване. Възможни са промени поради непредвидени увеличения на
            разходите за продукти, суровини, валутни колебания или други
            причини.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

