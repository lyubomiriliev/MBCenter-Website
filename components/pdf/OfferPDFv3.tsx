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

// Font registration is handled by registerPDFFonts() which is called before PDF generation
// This ensures fonts are loaded as data URLs before react-pdf tries to use them
let fontRegistered = false;

// This will be set to true when fonts are registered via registerPDFFonts()
export function setFontRegistered(value: boolean) {
  fontRegistered = value;
}

const EUR_TO_BGN = 1.95583;
const VAT_RATE = 0.2;

// Updated styles to match the sample PDF
const styles = StyleSheet.create({
  page: {
    padding: 35,
    fontSize: 9,
    fontFamily: fontRegistered ? "NotoSansCyrillic" : "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    paddingBottom: 10,
  },
  logo: {
    width: 200,
    height: 60,
    marginBottom: 10,
  },
  headerLeft: {
    width: "50%",
  },
  headerRight: {
    width: "45%",
    alignItems: "flex-end",
    paddingTop: 5,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 5,
    marginBottom: 3,
    textTransform: "uppercase",
  },
  companyInfo: {
    fontSize: 8.5,
    marginTop: 2,
    color: "#000",
    lineHeight: 1.5,
  },
  customerInfo: {
    fontSize: 10,
    marginTop: 2,
    textAlign: "right",
    fontWeight: 500,
    lineHeight: 1.6,
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: 1,
  },
  vinText: {
    fontSize: 11,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "2px solid #000",
  },
  table: {
    width: "100%",
    marginBottom: 20,
    border: "2px solid #000",
    borderCollapse: "collapse",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    color: "#fff",
    padding: 7,
    fontWeight: 700,
    fontSize: 8.5,
    borderBottom: "2px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ddd",
    padding: 6,
    fontSize: 8.5,
    minHeight: 28,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f5f5f5",
  },
  // Parts table columns (7 columns) - matching sample PDF
  col1: { width: "6%", textAlign: "center", paddingVertical: 2 },
  col2: { width: "30%", paddingLeft: 5, paddingVertical: 2 },
  col3: { width: "16%", textAlign: "center", paddingVertical: 2 },
  col4: { width: "12%", textAlign: "center", paddingVertical: 2 },
  col5: { width: "8%", textAlign: "center", paddingVertical: 2 },
  col6: { width: "14%", textAlign: "right", paddingRight: 5, paddingVertical: 2 },
  col7: { width: "14%", textAlign: "right", paddingRight: 5, paddingVertical: 2 },
  // Service actions columns (5 columns)
  colSvc1: { width: "5%", textAlign: "center" },
  colSvc2: { width: "42%", paddingLeft: 4 },
  colSvc3: { width: "15%", textAlign: "center" },
  colSvc4: { width: "19%", textAlign: "right", paddingRight: 4 },
  colSvc5: { width: "19%", textAlign: "right", paddingRight: 4 },
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
  },
  summaryRow: {
    flexDirection: "row",
    padding: 6,
    borderBottom: "1px solid #ddd",
    fontSize: 8.5,
    minHeight: 22,
    alignItems: "center",
  },
  summaryCol1: { width: "35%", paddingLeft: 4 },
  summaryCol2: { width: "20%", textAlign: "right", paddingRight: 4 },
  summaryCol3: { width: "15%", textAlign: "center" },
  summaryCol4: { width: "15%", textAlign: "right", paddingRight: 4 },
  summaryCol5: { width: "15%", textAlign: "right", paddingRight: 4 },
  summaryTotalRow: {
    backgroundColor: "#e0e0e0",
    fontWeight: 700,
  },
  footer: {
    marginTop: 25,
    paddingTop: 12,
    borderTop: "2px solid #ccc",
    fontSize: 8,
    color: "#333",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 3,
  },
  footerText: {
    fontSize: 8,
    marginTop: 2,
  },
  disclaimer: {
    marginTop: 10,
    fontSize: 7,
    color: "#777",
    lineHeight: 1.4,
  },
});

interface OfferPDFv3Props {
  offer: OfferWithRelations;
  locale: "bg" | "en";
}

export function OfferPDFv3({ offer, locale }: OfferPDFv3Props) {
  // Format currency
  const formatBGN = (eurValue: number) => {
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${bgnValue.toFixed(2)} BGN`;
  };

  const formatEUR = (eurValue: number) => {
    return `(${eurValue.toFixed(2)} EUR)`;
  };

  const formatDual = (eurValue: number) => {
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${bgnValue.toFixed(2)} BGN (${eurValue.toFixed(2)} EUR)`;
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
          <Text style={styles.vinText}>VIN: {offer.vin_text}</Text>
        )}

        {/* Parts Table */}
        {offer.items && offer.items.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Части</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>№</Text>
                <Text style={styles.col2}>Продукт</Text>
                <Text style={styles.col3}>Производител</Text>
                <Text style={styles.col4}>№ част</Text>
                <Text style={styles.col5}>К-во</Text>
                <Text style={styles.col6}>Цена на брой (с ДДС)</Text>
                <Text style={styles.col7}>Обща цена (с ДДС)</Text>
              </View>
              {offer.items
                .filter((item) => item.type === "part")
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
                      <Text style={styles.col1}>{index + 1}</Text>
                      <Text style={styles.col2}>{item.description}</Text>
                      <Text style={styles.col3}>{item.brand || "-"}</Text>
                      <Text style={styles.col4}>{item.part_number || "-"}</Text>
                      <Text style={styles.col5}>{item.quantity}</Text>
                      <Text style={styles.col6}>
                        {formatDual(unitPriceGross)}
                      </Text>
                      <Text style={styles.col7}>{formatDual(totalGross)}</Text>
                    </View>
                  );
                })}
            </View>
          </>
        )}

        {/* Service Actions Table */}
        {offer.service_actions && offer.service_actions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Сервизни активности</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.colSvc1}>№</Text>
                <Text style={styles.colSvc2}>Сервизна дейност</Text>
                <Text style={styles.colSvc3}>Време за ремонт</Text>
                <Text style={styles.colSvc4}>Цена на час (с ДДС)</Text>
                <Text style={styles.colSvc5}>Цена за ремонт (с ДДС)</Text>
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
                      <Text style={styles.colSvc1}>{index + 1}</Text>
                      <Text style={styles.colSvc2}>{action.action_name}</Text>
                      <Text style={styles.colSvc3}>
                        {action.time_required_text || "-"}
                      </Text>
                      <Text style={styles.colSvc4}>
                        {formatBGN(hourlyRateGross)}
                      </Text>
                      <Text style={styles.colSvc5}>
                        {formatDual(totalGross)}
                      </Text>
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
              <Text style={styles.summaryCol1}>Вид на разходите</Text>
              <Text style={styles.summaryCol2}>Обща стойност (без ДДС)</Text>
              <Text style={styles.summaryCol3}>Ставка на ДДС</Text>
              <Text style={styles.summaryCol4}>ДДС</Text>
              <Text style={styles.summaryCol5}>Обща стойност (с ДДС)</Text>
            </View>
            {offer.items &&
              offer.items.filter((i) => i.type === "part").length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryCol1}>Части</Text>
                  <Text style={styles.summaryCol2}>
                    {formatBGN(partsNet)}
                  </Text>
                  <Text style={styles.summaryCol3}>20%</Text>
                  <Text style={styles.summaryCol4}>
                    {formatBGN(partsVat)}
                  </Text>
                  <Text style={styles.summaryCol5}>
                    {formatDual(partsGross)}
                  </Text>
                </View>
              )}
            {offer.service_actions && offer.service_actions.length > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryCol1}>Сервизни активности</Text>
                <Text style={styles.summaryCol2}>
                  {formatBGN(serviceNet)}
                </Text>
                <Text style={styles.summaryCol3}>20%</Text>
                <Text style={styles.summaryCol4}>
                  {formatBGN(serviceVat)}
                </Text>
                <Text style={styles.summaryCol5}>
                  {formatDual(serviceGross)}
                </Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <Text style={styles.summaryCol1}>Обща стойност</Text>
              <Text style={styles.summaryCol2}>{formatBGN(totalNet)}</Text>
              <Text style={styles.summaryCol3}></Text>
              <Text style={styles.summaryCol4}></Text>
              <Text style={styles.summaryCol5}>{formatDual(totalGross)}</Text>
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

