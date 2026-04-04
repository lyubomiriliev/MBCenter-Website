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
import { parseTimeToHours } from "@/lib/utils";

export let fontRegistered = false;
export const setFontRegistered = (v: boolean) => {
  fontRegistered = !!v;
};

const EUR_TO_BGN = 1.95583;

// Create styles function that uses current fontRegistered state
const createStyles = () => {
  const fontFamily = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 40,
      paddingBottom: 8,
      paddingLeft: 30,
      paddingRight: 30,
      fontSize: 11,
      fontFamily: fontFamily,
      backgroundColor: "#ffffff",
      lineHeight: 1.3,
    },
    text: { fontFamily: fontFamily, fontSize: 13, lineHeight: 1.2 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginTop: -32,
      marginBottom: 12,
      paddingBottom: 10,
      borderBottom: "2px solid #000",
    },
    logo: {
      width: 160,
      height: 40,
      marginBottom: 0,
      objectFit: "contain",
    },
    headerLeft: {
      width: "50%",
    },
    headerRight: {
      width: "50%",
      alignItems: "flex-end",
      paddingTop: 44,
    },
    companyName: {
      fontSize: 13,
      fontWeight: 700,
      marginTop: 4,
      marginBottom: 2,
      fontFamily: fontFamily,
    },
    companyInfo: {
      fontSize: 10,
      marginTop: 2,
      color: "#000",
      lineHeight: 1.5,
      fontFamily: fontFamily,
    },
    customerInfo: {
      fontSize: 10,
      marginTop: 2,
      textAlign: "right",
      lineHeight: 1.5,
      fontFamily: fontFamily,
    },
    customerInfoLabel: {
      fontWeight: 700,
      fontFamily: fontFamily,
    },
    title: {
      fontSize: 18,
      fontWeight: 700,
      textAlign: "center",
      marginTop: 6,
      marginBottom: 4,
      letterSpacing: 0,
      fontFamily: fontFamily,
    },
    vinText: {
      fontSize: 10,
      textAlign: "center",
      marginBottom: 5,
      marginTop: 8,
      fontWeight: 500,
      fontFamily: fontFamily,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: 700,
      marginTop: 10,
      marginBottom: 6,
      color: "#000",
      fontFamily: fontFamily,
    },
    table: {
      width: "100%",
      marginBottom: 15,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#000",
      color: "#fff",
      paddingVertical: 0,
      paddingHorizontal: 2,
      fontWeight: 700,
      fontSize: 9,
      fontFamily: fontFamily,
      borderTop: "1px solid #000",
      borderLeft: "1px solid #000",
      borderRight: "1px solid #000",
      borderBottom: "1px solid #000",
      alignItems: "center",
      minHeight: 22,
    },
    tableRow: {
      flexDirection: "row",
      borderTop: "1px solid #000",
      borderLeft: "1px solid #000",
      borderRight: "1px solid #000",
      borderBottom: "1px solid #000",
      marginTop: -1,
      paddingVertical: 0,
      paddingHorizontal: 2,
      fontSize: 10,
      minHeight: 22,
      fontFamily: fontFamily,
    },
    tableRowAlt: {
      backgroundColor: "#ffffff",
    },
    col1: {
      flex: 0.04,
      paddingVertical: 4,
      paddingHorizontal: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
      alignItems: "center",
    },
    col2: {
      flex: 0.27,
      paddingLeft: 4,
      paddingVertical: 4,
      paddingRight: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    colPartNum: {
      flex: 0.25,
      paddingVertical: 4,
      paddingHorizontal: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    col3: {
      flex: 0.12,
      paddingVertical: 4,
      paddingHorizontal: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    col4: {
      flex: 0.05,
      paddingVertical: 4,
      paddingHorizontal: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    col5: {
      flex: 0.12,
      paddingRight: 4,
      paddingVertical: 4,
      paddingLeft: 2,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    col6: {
      flex: 0.18,
      paddingRight: 4,
      paddingVertical: 4,
      paddingLeft: 2,
      justifyContent: "center",
    },
    colSvc1: {
      flex: 0.05,
      paddingHorizontal: 2,
      paddingVertical: 4,
      borderRight: "1px solid #000",
      justifyContent: "center",
      alignItems: "center",
    },
    colSvc2: {
      flex: 0.36,
      paddingLeft: 4,
      paddingRight: 2,
      paddingVertical: 4,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    colSvc3: {
      flex: 0.19,
      paddingHorizontal: 2,
      paddingVertical: 4,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    colSvc4: {
      flex: 0.17,
      paddingRight: 4,
      paddingLeft: 2,
      paddingVertical: 4,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    colSvc5: {
      flex: 0.2,
      paddingRight: 4,
      paddingLeft: 2,
      paddingVertical: 4,
      justifyContent: "center",
    },
    // Text styles for table cells
    colTextCenter: {
      textAlign: "center",
      fontFamily: fontFamily,
      fontSize: 10,
    },
    colTextLeft: { textAlign: "left", fontFamily: fontFamily, fontSize: 10 },
    colTextRight: { textAlign: "center", fontFamily: fontFamily, fontSize: 10 },
    summarySection: {
      marginTop: 20,
      padding: 12,
      border: "2px solid #000",
      backgroundColor: "#ffffff",
    },
    summaryTitle: {
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 8,
      textAlign: "left",
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
      paddingVertical: 0,
      paddingHorizontal: 2,
      fontWeight: 700,
      fontSize: 9,
      borderBottom: "1px solid #000",
      fontFamily: fontFamily,
      minHeight: 18,
    },
    summaryRow: {
      flexDirection: "row",
      paddingVertical: 0,
      paddingHorizontal: 2,
      borderBottom: "1px solid #000",
      fontSize: 9,
      fontFamily: fontFamily,
    },
    summaryCol1: {
      flex: 0.3,
      paddingLeft: 3,
      paddingRight: 2,
      paddingVertical: 5,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    summaryCol2: {
      flex: 0.35,
      paddingRight: 3,
      paddingLeft: 2,
      paddingVertical: 5,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    summaryCol3: {
      flex: 0.24,
      paddingHorizontal: 2,
      paddingVertical: 5,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    summaryCol4: {
      flex: 0.16,
      paddingRight: 3,
      paddingLeft: 2,
      paddingVertical: 5,
      borderRight: "1px solid #000",
      justifyContent: "center",
    },
    summaryCol5: {
      flex: 0.35,
      paddingRight: 3,
      paddingLeft: 2,
      paddingVertical: 5,
      justifyContent: "center",
    },
    summaryTotalRow: {
      backgroundColor: "#e0e0e0",
      fontWeight: 700,
      fontSize: 14,
    },
    summaryTotalAmountText: {
      fontSize: 11,
      fontWeight: 700,
      fontFamily: fontFamily,
    },
    footer: {
      marginTop: 20,
      paddingTop: 10,
      borderTop: "1px solid #ccc",
      fontFamily: fontFamily,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 3,
      marginBottom: 4,
    },
    footerRowText: {
      fontSize: 10,
      color: "#000",
      fontFamily: fontFamily,
    },
    footerText: {
      fontSize: 10,
      marginTop: 2,
      color: "#000",
      fontFamily: fontFamily,
    },
    disclaimer: {
      marginTop: 8,
      fontSize: 8.5,
      color: "#888",
      lineHeight: 1.3,
      fontFamily: fontFamily,
    },
    stampRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 50,
    },
    stampField: {
      width: "40%",
    },
    stampLabel: {
      fontSize: 8.5,
      fontWeight: 700,
      color: "#000",
      marginBottom: 18,
      fontFamily: fontFamily,
    },
    stampLine: {
      borderBottom: "1px solid #000",
      width: "100%",
      marginBottom: 4,
    },
    stampSub: {
      fontSize: 7.5,
      color: "#9ca3af",
      fontFamily: fontFamily,
    },
    stampDots: {
      fontSize: 9,
      color: "#aaa",
      letterSpacing: 2,
      fontFamily: fontFamily,
    },
  });
};

interface ServiceCardPDFv3Props {
  offer: OfferWithRelations;
  locale: "bg" | "en";
  prepayments?: number[];
}

function formatTimeDisplay(timeText: string | null): string {
  if (!timeText) return "-";
  const t = timeText.trim();
  if (!t) return "-";
  const hours = parseTimeToHours(t);
  if (hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  const hh = h.toString().padStart(2, "0");
  const mm = m.toString().padStart(2, "0");
  return `${hh}ч ${mm} мин`;
}

export function ServiceCardPDFv3({
  offer,
  locale,
  prepayments = [],
}: ServiceCardPDFv3Props) {
  const styles = createStyles();

  // EUR only (for per-row values)
  const formatEur = (eurValue: number) => {
    if (isNaN(eurValue) || eurValue == null) return "0.00 €";
    return `${eurValue.toFixed(2)} €`;
  };

  // EUR + лв. (for totals only)
  const formatDual = (eurValue: number) => {
    if (isNaN(eurValue) || eurValue == null) return "0.00 € / 0.00 лв.";
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${eurValue.toFixed(2)} € / ${bgnValue.toFixed(2)} лв.`;
  };

  // Discount percentages from offer
  const discountPartsPercent = (offer as any).discount_parts_percent ?? 0;
  const discountServicesPercent = (offer as any).discount_services_percent ?? 0;

  // Calculate parts total - input prices already include VAT (gross)
  const partsGrossBeforeDiscount = (offer.items || [])
    .filter((item) => item.type === "part")
    .reduce(
      (sum, item) =>
        sum + (item.total ?? item.unit_price * (item.quantity ?? 0)),
      0,
    );
  const partsDiscountAmount =
    partsGrossBeforeDiscount * (discountPartsPercent / 100);
  const partsGross = partsGrossBeforeDiscount - partsDiscountAmount;
  const partsNet = partsGross / 1.2;
  const partsVat = partsGross - partsNet;

  // Calculate service actions total - input prices already include VAT (gross)
  const serviceGrossBeforeDiscount = (offer.service_actions || []).reduce(
    (sum, action) => sum + action.total_eur_net, // Note: despite the name, this is actually gross
    0,
  );
  const serviceDiscountAmount =
    serviceGrossBeforeDiscount * (discountServicesPercent / 100);
  const serviceGross = serviceGrossBeforeDiscount - serviceDiscountAmount;
  const serviceNet = serviceGross / 1.2;
  const serviceVat = serviceGross - serviceNet;

  // Grand total
  const totalGross = partsGross + serviceGross;
  const totalNet = partsNet + serviceNet;
  const totalVat = partsVat + serviceVat;
  const partsItems = (offer.items || []).filter((item) => item.type === "part");
  const sortedParts = [...partsItems].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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
            <Text style={styles.companyInfo}>ДДС номер: BG207901533</Text>
            <Text style={styles.companyInfo}>Тел. +359883788873</Text>
            <Text style={styles.companyInfo}>contact@mbcenter.bg</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Клиент:</Text>{" "}
              {offer.customer_name || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Тел:</Text>{" "}
              {offer.customer_phone || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Модел:</Text>{" "}
              {[offer.car_model_text, offer.car_model_detail]
                .filter(Boolean)
                .join(" ") || ""}
            </Text>
            {offer.vin_text && (
              <Text style={styles.customerInfo}>
                <Text style={styles.customerInfoLabel}>VIN:</Text>{" "}
                {offer.vin_text.toUpperCase()}
              </Text>
            )}
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Рег. номер:</Text>{" "}
              {offer.license_plate || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Пробег:</Text>{" "}
              {offer.mileage ? `${offer.mileage} км.` : ""}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Сервизна карта{" "}
          {offer.service_card_number
            ? `№${offer.service_card_number}`
            : offer.offer_number
              ? `№${offer.offer_number}`
              : "(чернова)"}
        </Text>

        {/* Parts Table - WITH part number column (service cards have part numbers) */}
        {sortedParts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Части</Text>
            <View style={styles.table} wrap={true}>
              {sortedParts.map((item, index) => {
                const unitPriceGross = item.unit_price;
                const totalGross =
                  item.total ?? item.unit_price * (item.quantity ?? 0);
                return (
                  <View key={item.id} wrap={false}>
                    {index === 0 && (
                      <View style={styles.tableHeader}>
                        <View style={styles.col1}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>№</Text>
                        </View>
                        <View style={styles.col2}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>Продукт</Text>
                        </View>
                        <View style={styles.colPartNum}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>№ Част</Text>
                        </View>
                        <View style={styles.col3}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>Производител</Text>
                        </View>
                        <View style={styles.col4}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>К-во</Text>
                        </View>
                        <View style={styles.col5}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>Цена на брой</Text>
                        </View>
                        <View style={styles.col6}>
                          <Text style={[styles.colTextCenter, { color: "#fff", fontSize: 8 }]}>Обща цена (с ДДС)</Text>
                        </View>
                      </View>
                    )}
                    <View style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                      <View style={styles.col1}>
                        <Text style={styles.colTextCenter}>{index + 1}</Text>
                      </View>
                      <View style={styles.col2}>
                        <Text style={styles.colTextLeft}>
                          {item.description || "-"}
                        </Text>
                      </View>
                      <View style={styles.colPartNum}>
                        <Text style={styles.colTextCenter}>
                          {item.part_number || "-"}
                        </Text>
                      </View>
                      <View style={styles.col3}>
                        <Text style={styles.colTextCenter}>
                          {item.brand || "-"}
                        </Text>
                      </View>
                      <View style={styles.col4}>
                        <Text style={styles.colTextCenter}>{item.quantity}</Text>
                      </View>
                      <View style={styles.col5}>
                        <Text style={styles.colTextCenter}>
                          {formatEur(unitPriceGross)}
                        </Text>
                      </View>
                      <View style={styles.col6}>
                        <Text style={styles.colTextCenter}>
                          {formatEur(totalGross)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {offer.service_actions && offer.service_actions.length > 0 && (
          <View break={sortedParts.length >= 15}>
            <View style={styles.table} wrap={true}>
              <View wrap={false}>
                <Text style={styles.sectionTitle}>Сервизни активности</Text>
                <View style={styles.tableHeader}>
                  <View style={styles.colSvc1}>
                    <Text style={[styles.colTextCenter, { color: "#fff" }]}>№</Text>
                  </View>
                  <View style={styles.colSvc2}>
                    <Text style={[styles.colTextLeft, { color: "#fff" }]}>Сервизна дейност</Text>
                  </View>
                  <View style={styles.colSvc3}>
                    <Text style={[styles.colTextCenter, { color: "#fff" }]}>Време за ремонт</Text>
                  </View>
                  <View style={styles.colSvc4}>
                    <Text style={[styles.colTextCenter, { color: "#fff" }]}>Цена на час</Text>
                  </View>
                  <View style={styles.colSvc5}>
                    <Text style={[styles.colTextCenter, { color: "#fff" }]}>Обща цена (с ДДС)</Text>
                  </View>
                </View>
              </View>
              {offer.service_actions
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((action, index) => (
                  <View key={action.id} wrap={false} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                    <View style={styles.colSvc1}>
                      <Text style={styles.colTextCenter}>{index + 1}</Text>
                    </View>
                    <View style={styles.colSvc2}>
                      <Text style={styles.colTextLeft}>{action.action_name || "-"}</Text>
                    </View>
                    <View style={styles.colSvc3}>
                      <Text style={styles.colTextCenter}>
                        {action.is_fixed_price ? "-" : formatTimeDisplay(action.time_required_text)}
                      </Text>
                    </View>
                    <View style={styles.colSvc4}>
                      <Text style={styles.colTextCenter}>
                        {action.is_fixed_price ? "-" : formatEur(action.price_per_hour_eur_net)}
                      </Text>
                    </View>
                    <View style={styles.colSvc5}>
                      <Text style={styles.colTextCenter}>{formatEur(action.total_eur_net)}</Text>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.summarySection} wrap={false}>
          <Text style={styles.summaryTitle}>Обобщение</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryHeaderRow} wrap={false}>
              <View style={styles.summaryCol1}>
                <Text
                  style={[styles.colTextLeft, { color: "#fff", fontSize: 9.5 }]}
                >
                  Вид на разходите
                </Text>
              </View>
              <View style={styles.summaryCol2}>
                <Text style={[styles.colTextRight, { color: "#fff" }]}>
                  Обща стойност
                </Text>
              </View>
              <View style={styles.summaryCol3}>
                <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                  Ставка на ДДС
                </Text>
              </View>
              <View style={styles.summaryCol4}>
                <Text style={[styles.colTextRight, { color: "#fff" }]}>
                  ДДС
                </Text>
              </View>
              <View style={styles.summaryCol5}>
                <Text
                  style={[
                    styles.colTextRight,
                    { color: "#fff", fontSize: 9.5 },
                  ]}
                >
                  Обща стойност (с ДДС)
                </Text>
              </View>
            </View>
            {offer.items &&
              offer.items.filter((i) => i.type === "part").length > 0 && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCol1}>
                    <Text style={styles.colTextLeft}>Части</Text>
                  </View>
                  <View style={styles.summaryCol2}>
                    <Text style={styles.colTextRight}>
                      {formatEur(partsNet)}
                    </Text>
                  </View>
                  <View style={styles.summaryCol3}>
                    <Text style={styles.colTextCenter}>20%</Text>
                  </View>
                  <View style={styles.summaryCol4}>
                    <Text style={styles.colTextRight}>
                      {formatEur(partsVat)}
                    </Text>
                  </View>
                  <View style={styles.summaryCol5}>
                    <Text style={styles.colTextRight}>
                      {formatEur(partsGross)}
                    </Text>
                  </View>
                </View>
              )}
            {offer.service_actions && offer.service_actions.length > 0 && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol1}>
                  <Text style={styles.colTextLeft}>Сервизни активности</Text>
                </View>
                <View style={styles.summaryCol2}>
                  <Text style={styles.colTextRight}>
                    {formatEur(serviceNet)}
                  </Text>
                </View>
                <View style={styles.summaryCol3}>
                  <Text style={styles.colTextCenter}>20%</Text>
                </View>
                <View style={styles.summaryCol4}>
                  <Text style={styles.colTextRight}>
                    {formatEur(serviceVat)}
                  </Text>
                </View>
                <View style={styles.summaryCol5}>
                  <Text style={styles.colTextRight}>
                    {formatEur(serviceGross)}
                  </Text>
                </View>
              </View>
            )}
            {/* Discount rows */}
            {discountPartsPercent > 0 && partsItems.length > 0 && (
              <View style={styles.summaryRow}>
                <View style={styles.summaryCol1}>
                  <Text style={styles.colTextLeft}>
                    Отстъпка за части ({discountPartsPercent}%)
                  </Text>
                </View>
                <View style={styles.summaryCol2}>
                  <Text style={styles.colTextRight}>
                    -{formatEur(partsDiscountAmount / 1.2)}
                  </Text>
                </View>
                <View style={styles.summaryCol3}>
                  <Text style={styles.colTextCenter}>20%</Text>
                </View>
                <View style={styles.summaryCol4}>
                  <Text style={styles.colTextRight}>
                    -
                    {formatEur(partsDiscountAmount - partsDiscountAmount / 1.2)}
                  </Text>
                </View>
                <View style={styles.summaryCol5}>
                  <Text style={styles.colTextRight}>
                    -{formatEur(partsDiscountAmount)}
                  </Text>
                </View>
              </View>
            )}
            {discountServicesPercent > 0 &&
              offer.service_actions &&
              offer.service_actions.length > 0 && (
                <View style={styles.summaryRow}>
                  <View style={styles.summaryCol1}>
                    <Text style={styles.colTextLeft}>
                      Отстъпка за сервизни дейности ({discountServicesPercent}%)
                    </Text>
                  </View>
                  <View style={styles.summaryCol2}>
                    <Text style={styles.colTextRight}>
                      -{formatEur(serviceDiscountAmount / 1.2)}
                    </Text>
                  </View>
                  <View style={styles.summaryCol3}>
                    <Text style={styles.colTextCenter}>20%</Text>
                  </View>
                  <View style={styles.summaryCol4}>
                    <Text style={styles.colTextRight}>
                      -
                      {formatEur(
                        serviceDiscountAmount - serviceDiscountAmount / 1.2,
                      )}
                    </Text>
                  </View>
                  <View style={styles.summaryCol5}>
                    <Text style={styles.colTextRight}>
                      -{formatEur(serviceDiscountAmount)}
                    </Text>
                  </View>
                </View>
              )}
            <View style={[styles.summaryRow, styles.summaryTotalRow]}>
              <View style={styles.summaryCol1}>
                <Text style={styles.colTextLeft}>Обща стойност</Text>
              </View>
              <View style={styles.summaryCol2}>
                <Text style={styles.colTextRight}>{formatDual(totalNet)}</Text>
              </View>
              <View style={styles.summaryCol3}>
                <Text style={styles.colTextCenter}>20%</Text>
              </View>
              <View style={styles.summaryCol4}>
                <Text style={styles.colTextRight}>{formatEur(totalVat)}</Text>
              </View>
              <View style={styles.summaryCol5}>
                <Text
                  style={[styles.colTextRight, styles.summaryTotalAmountText]}
                >
                  {formatDual(totalGross)}
                </Text>
              </View>
            </View>
            {/* Advance Payments (if any) */}
            {prepayments.map((prepayment, index) => (
              <View key={index} style={styles.summaryRow}>
                <View style={styles.summaryCol1}>
                  <Text style={styles.colTextLeft}>
                    Авансово плащане{" "}
                    {prepayments.length > 1 ? `${index + 1}` : ""}
                  </Text>
                </View>
                <View style={styles.summaryCol2}>
                  <Text style={styles.colTextRight}>
                    -{formatEur(prepayment)}
                  </Text>
                </View>
                <View style={styles.summaryCol3}>
                  <Text style={styles.colTextCenter} />
                </View>
                <View style={styles.summaryCol4}>
                  <Text style={styles.colTextRight} />
                </View>
                <View style={styles.summaryCol5}>
                  <Text style={styles.colTextRight}>
                    -{formatEur(prepayment)}
                  </Text>
                </View>
              </View>
            ))}
            {/* Amount Due (if there are prepayments) */}
            {prepayments.length > 0 && (
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <View style={styles.summaryCol1}>
                  <Text style={styles.colTextLeft}>Сума за плащане</Text>
                </View>
                <View style={styles.summaryCol2}>
                  <Text style={styles.colTextRight} />
                </View>
                <View style={styles.summaryCol3}>
                  <Text style={styles.colTextCenter} />
                </View>
                <View style={styles.summaryCol4}>
                  <Text style={styles.colTextRight} />
                </View>
                <View style={styles.summaryCol5}>
                  <Text
                    style={[styles.colTextRight, styles.summaryTotalAmountText]}
                  >
                    {formatDual(
                      Math.max(
                        0,
                        totalGross - prepayments.reduce((a, b) => a + b, 0),
                      ),
                    )}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerRowText}>гр. София</Text>
            <Text style={styles.footerRowText}>
              {new Date(offer.service_card_generated_at || offer.created_at).toLocaleString("bg-BG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
          {offer.created_by_name && (
            <Text style={styles.footerText}>
              Този документ е създаден от: {offer.created_by_name}
            </Text>
          )}
          <Text style={styles.footerText}>Имейл: contact@mbcenter.bg</Text>
          <View style={styles.stampRow}>
            <View style={styles.stampField}>
              <View style={styles.stampLine} />
              <Text style={styles.stampSub}>/Печат и подпис/</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
