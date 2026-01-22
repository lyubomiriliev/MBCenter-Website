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
let fontRegistered = false;

// This will be set to true when fonts are registered via registerPDFFonts()
export function setFontRegistered(value: boolean) {
  fontRegistered = value;
}

const EUR_TO_BGN = 1.95583;
const VAT_RATE = 0.2;

// Same styles but adjusted for service card (no part number column)
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: fontRegistered ? "NotoSansCyrillic" : "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: "2px solid #000",
  },
  logo: {
    width: 180,
    height: 50,
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 4,
    marginBottom: 2,
  },
  companyInfo: {
    fontSize: 8,
    marginTop: 1,
    color: "#000",
    lineHeight: 1.4,
  },
  customerInfo: {
    fontSize: 10,
    marginTop: 1,
    textAlign: "right",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    textAlign: "center",
    marginVertical: 15,
    letterSpacing: 0.5,
  },
  vinText: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 15,
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: "1px solid #333",
  },
  table: {
    width: "100%",
    marginBottom: 15,
    border: "1px solid #000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#000",
    color: "#fff",
    padding: 6,
    fontWeight: 700,
    fontSize: 8,
    borderBottom: "1px solid #000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #ccc",
    padding: 5,
    fontSize: 8,
    minHeight: 25,
  },
  tableRowAlt: {
    backgroundColor: "#f9f9f9",
  },
  // Service card parts table (6 columns - no part number)
  col1: { width: "6%", textAlign: "center" },
  col2: { width: "38%", paddingLeft: 4 },
  col3: { width: "18%", textAlign: "center" },
  col4: { width: "10%", textAlign: "center" },
  col5: { width: "14%", textAlign: "right", paddingRight: 4 },
  col6: { width: "14%", textAlign: "right", paddingRight: 4 },
  // Service actions columns (5 columns)
  colSvc1: { width: "5%", textAlign: "center" },
  colSvc2: { width: "42%", paddingLeft: 4 },
  colSvc3: { width: "15%", textAlign: "center" },
  colSvc4: { width: "19%", textAlign: "right", paddingRight: 4 },
  colSvc5: { width: "19%", textAlign: "right", paddingRight: 4 },
  summarySection: {
    marginTop: 20,
    padding: 12,
    border: "2px solid #000",
    backgroundColor: "#f5f5f5",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
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
    padding: 5,
    fontWeight: 700,
    fontSize: 8,
    borderBottom: "1px solid #000",
  },
  summaryRow: {
    flexDirection: "row",
    padding: 5,
    borderBottom: "1px solid #ccc",
    fontSize: 8,
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
    marginTop: 20,
    paddingTop: 10,
    borderTop: "1px solid #ccc",
    fontSize: 7,
    color: "#555",
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
});

interface ServiceCardPDFv3Props {
  offer: OfferWithRelations;
  locale: "bg" | "en";
}

export function ServiceCardPDFv3({ offer, locale }: ServiceCardPDFv3Props) {
  // Format currency
  const formatBGN = (eurValue: number) => {
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${bgnValue.toFixed(2)} BGN`;
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
        <Text style={styles.title}>
          Сервизна карта{" "}
          {offer.offer_number ? `№${offer.offer_number}` : "(чернова)"}
        </Text>
        {offer.vin_text && (
          <Text style={styles.vinText}>VIN: {offer.vin_text}</Text>
        )}

        {/* Parts Table - WITHOUT part number column */}
        {offer.items && offer.items.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Части</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>№</Text>
                <Text style={styles.col2}>Продукт</Text>
                <Text style={styles.col3}>Производител</Text>
                <Text style={styles.col4}>К-во</Text>
                <Text style={styles.col5}>Цена на брой (с ДДС)</Text>
                <Text style={styles.col6}>Обща цена (с ДДС)</Text>
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
                      <Text style={styles.col4}>{item.quantity}</Text>
                      <Text style={styles.col5}>
                        {formatDual(unitPriceGross)}
                      </Text>
                      <Text style={styles.col6}>{formatDual(totalGross)}</Text>
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
          <Text style={styles.summaryTitle}>Обобщение</Text>
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
        </View>
      </Page>
    </Document>
  );
}

