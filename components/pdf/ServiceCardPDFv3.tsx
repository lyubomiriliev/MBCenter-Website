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
const VAT_RATE = 0.2;

// Create styles function that uses current fontRegistered state
const createStyles = () => {
  const fontFamily = fontRegistered ? "NotoSans" : "Helvetica";
  return StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 30,
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
      marginBottom: 12,
      paddingBottom: 10,
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
      paddingTop: 54,
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
      marginTop: 1,
      color: "#000",
      lineHeight: 1.4,
      fontFamily: fontFamily,
    },
    customerInfo: {
      fontSize: 11,
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
      letterSpacing: 0.5,
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
      border: "1px solid #000",
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: "#000",
      color: "#fff",
      paddingVertical: 4,
      paddingHorizontal: 2,
      fontWeight: 700,
      fontSize: 9,
      borderBottom: "1px solid #000",
      fontFamily: fontFamily,
      minHeight: 20,
    },
    tableRow: {
      flexDirection: "row",
      borderBottom: "1px solid #000",
      paddingVertical: 4,
      paddingHorizontal: 2,
      fontSize: 10,
      minHeight: 22,
      alignItems: "center",
      fontFamily: fontFamily,
    },
    tableRowAlt: {
      backgroundColor: "#f9f9f9",
    },
    col1: { flex: 0.06, paddingVertical: 2, paddingHorizontal: 2 },
    col2: { flex: 0.24, paddingLeft: 4, paddingVertical: 2, paddingRight: 2 },
    col3: { flex: 0.2, paddingVertical: 2, paddingHorizontal: 2 },
    colPartNum: { flex: 0.12, paddingVertical: 2, paddingHorizontal: 2 },
    col4: { flex: 0.08, paddingVertical: 2, paddingHorizontal: 2 },
    col5: { flex: 0.28, paddingRight: 4, paddingVertical: 2, paddingLeft: 2 },
    col6: { flex: 0.28, paddingRight: 4, paddingVertical: 2, paddingLeft: 2 },
    colSvc1: { flex: 0.05, paddingHorizontal: 2 },
    colSvc2: { flex: 0.24, paddingLeft: 4, paddingRight: 2 },
    colSvc3: { flex: 0.3, paddingHorizontal: 2 },
    colSvc4: { flex: 0.2, paddingRight: 4, paddingLeft: 2 },
    colSvc5: { flex: 0.28, paddingRight: 4, paddingLeft: 2 },
    // Text styles for table cells
    colTextCenter: {
      textAlign: "center",
      fontFamily: fontFamily,
      fontSize: 9,
    },
    colTextLeft: { textAlign: "left", fontFamily: fontFamily, fontSize: 9 },
    colTextRight: { textAlign: "right", fontFamily: fontFamily, fontSize: 9 },
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
      paddingVertical: 4,
      paddingHorizontal: 2,
      fontWeight: 700,
      fontSize: 9,
      borderBottom: "1px solid #000",
      fontFamily: fontFamily,
      minHeight: 20,
    },
    summaryRow: {
      flexDirection: "row",
      paddingVertical: 5,
      paddingHorizontal: 2,
      borderBottom: "1px solid #000",
      fontSize: 9,
      fontFamily: fontFamily,
    },
    summaryCol1: { flex: 0.24, paddingLeft: 3, paddingRight: 2 },
    summaryCol2: { flex: 0.38, paddingRight: 3, paddingLeft: 2 },
    summaryCol3: { flex: 0.24, paddingHorizontal: 2 },
    summaryCol4: { flex: 0.18, paddingRight: 3, paddingLeft: 2 },
    summaryCol5: { flex: 0.35, paddingRight: 3, paddingLeft: 2 },
    summaryTotalRow: {
      backgroundColor: "#e0e0e0",
      fontWeight: 700,
      fontSize: 14,
    },
    footer: {
      marginTop: 20,
      paddingTop: 10,
      borderTop: "1px solid #ccc",
      fontSize: 7,
      color: "#555",
      fontFamily: fontFamily,
    },
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 3,
    },
    footerText: {
      fontSize: 8,
      marginTop: 2,
      fontFamily: fontFamily,
    },
  });
};

interface ServiceCardPDFv3Props {
  offer: OfferWithRelations;
  locale: "bg" | "en";
}

function formatTimeDisplay(timeText: string | null): string {
  if (!timeText) return "-";
  const t = timeText.trim();
  if (!t) return "-";
  const hours = parseTimeToHours(t);
  if (hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0 && m > 0) return `${h}ч ${m}мин`;
  if (h > 0) return `${h}ч`;
  if (m > 0) return `${m}мин`;
  return "-";
}

export function ServiceCardPDFv3({ offer, locale }: ServiceCardPDFv3Props) {
  const styles = createStyles();

  const formatDual = (eurValue: number) => {
    if (isNaN(eurValue) || eurValue == null) return "0.00 EUR / 0.00 BGN";
    const bgnValue = eurValue * EUR_TO_BGN;
    return `${eurValue.toFixed(2)} EUR / ${bgnValue.toFixed(2)} BGN`;
  };

  // Calculate parts total (with VAT) - use unit_price * quantity when total not fetched
  const partsNet = (offer.items || [])
    .filter((item) => item.type === "part")
    .reduce(
      (sum, item) =>
        sum + (item.total ?? item.unit_price * (item.quantity ?? 0)),
      0
    );
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
  const partsItems = (offer.items || []).filter((item) => item.type === "part");
  const sortedParts = [...partsItems].sort(
    (a, b) => a.sort_order - b.sort_order
  );

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
              <Text style={styles.customerInfoLabel}>Клиент:</Text>{" "}
              {offer.customer_name || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Модел:</Text>{" "}
              {[offer.car_model_text, offer.car_model_detail]
                .filter(Boolean)
                .join(" ") || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Рег. номер:</Text>{" "}
              {offer.license_plate || ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Пробег:</Text>{" "}
              {offer.mileage ?? ""}
            </Text>
            <Text style={styles.customerInfo}>
              <Text style={styles.customerInfoLabel}>Тел:</Text>{" "}
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
          <Text style={styles.vinText}>
            VIN: {offer.vin_text.toUpperCase()}
          </Text>
        )}

        {/* Parts Table - WITH part number column (service cards have part numbers) */}
        {sortedParts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Части</Text>
            <View style={styles.table} wrap={true}>
              <View style={styles.tableHeader} wrap={false}>
                <View style={styles.col1}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    №
                  </Text>
                </View>
                <View style={styles.col2}>
                  <Text style={[styles.colTextLeft, { color: "#fff" }]}>
                    Продукт
                  </Text>
                </View>
                <View style={styles.col3}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    Производител
                  </Text>
                </View>
                <View style={styles.colPartNum}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    № част
                  </Text>
                </View>
                <View style={styles.col4}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    К-во
                  </Text>
                </View>
                <View style={styles.col5}>
                  <Text style={[styles.colTextRight, { color: "#fff" }]}>
                    Цена на брой (с ДДС)
                  </Text>
                </View>
                <View style={styles.col6}>
                  <Text style={[styles.colTextRight, { color: "#fff" }]}>
                    Обща цена (с ДДС)
                  </Text>
                </View>
              </View>
              {sortedParts.map((item, index) => {
                const unitPriceGross = item.unit_price * (1 + VAT_RATE);
                const lineTotalNet =
                  item.total ?? item.unit_price * (item.quantity ?? 0);
                const totalGross = lineTotalNet * (1 + VAT_RATE);
                return (
                  <View
                    key={item.id}
                    style={[
                      styles.tableRow,
                      index % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <View style={styles.col1}>
                      <Text style={styles.colTextCenter}>{index + 1}</Text>
                    </View>
                    <View style={styles.col2}>
                      <Text style={styles.colTextLeft}>
                        {item.description || "-"}
                      </Text>
                    </View>
                    <View style={styles.col3}>
                      <Text style={styles.colTextCenter}>
                        {item.brand || "-"}
                      </Text>
                    </View>
                    <View style={styles.colPartNum}>
                      <Text style={styles.colTextCenter}>
                        {item.part_number || "-"}
                      </Text>
                    </View>
                    <View style={styles.col4}>
                      <Text style={styles.colTextCenter}>{item.quantity}</Text>
                    </View>
                    <View style={styles.col5}>
                      <Text style={styles.colTextRight}>
                        {formatDual(unitPriceGross)}
                      </Text>
                    </View>
                    <View style={styles.col6}>
                      <Text style={styles.colTextRight}>
                        {formatDual(totalGross)}
                      </Text>
                    </View>
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
            <View style={styles.table} wrap={true}>
              <View style={styles.tableHeader} wrap={false}>
                <View style={styles.colSvc1}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    №
                  </Text>
                </View>
                <View style={styles.colSvc2}>
                  <Text style={[styles.colTextLeft, { color: "#fff" }]}>
                    Сервизна дейност
                  </Text>
                </View>
                <View style={styles.colSvc3}>
                  <Text style={[styles.colTextCenter, { color: "#fff" }]}>
                    Време за ремонт
                  </Text>
                </View>
                <View style={styles.colSvc4}>
                  <Text style={[styles.colTextRight, { color: "#fff" }]}>
                    Цена на час (с ДДС)
                  </Text>
                </View>
                <View style={styles.colSvc5}>
                  <Text style={[styles.colTextRight, { color: "#fff" }]}>
                    Цена за ремонт (с ДДС)
                  </Text>
                </View>
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
                      <View style={styles.colSvc1}>
                        <Text style={styles.colTextCenter}>{index + 1}</Text>
                      </View>
                      <View style={styles.colSvc2}>
                        <Text style={styles.colTextLeft}>
                          {action.action_name || "-"}
                        </Text>
                      </View>
                      <View style={styles.colSvc3}>
                        <Text style={styles.colTextCenter}>
                          {action.is_fixed_price
                            ? ""
                            : formatTimeDisplay(action.time_required_text)}
                        </Text>
                      </View>
                      <View style={styles.colSvc4}>
                        <Text style={styles.colTextRight}>
                          {action.is_fixed_price
                            ? ""
                            : formatDual(hourlyRateGross)}
                        </Text>
                      </View>
                      <View style={styles.colSvc5}>
                        <Text style={styles.colTextRight}>
                          {formatDual(totalGross)}
                        </Text>
                      </View>
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
            <View style={styles.summaryHeaderRow} wrap={false}>
              <View style={styles.summaryCol1}>
                <Text style={styles.colTextLeft}>Вид на разходите</Text>
              </View>
              <View style={styles.summaryCol2}>
                <Text style={styles.colTextRight}>Обща стойност (без ДДС)</Text>
              </View>
              <View style={styles.summaryCol3}>
                <Text style={styles.colTextCenter}>Ставка на ДДС</Text>
              </View>
              <View style={styles.summaryCol4}>
                <Text style={styles.colTextRight}>ДДС</Text>
              </View>
              <View style={styles.summaryCol5}>
                <Text style={styles.colTextRight}>Обща стойност (с ДДС)</Text>
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
                      {formatDual(partsNet)}
                    </Text>
                  </View>
                  <View style={styles.summaryCol3}>
                    <Text style={styles.colTextCenter}>20%</Text>
                  </View>
                  <View style={styles.summaryCol4}>
                    <Text style={styles.colTextRight}>
                      {formatDual(partsVat)}
                    </Text>
                  </View>
                  <View style={styles.summaryCol5}>
                    <Text style={styles.colTextRight}>
                      {formatDual(partsGross)}
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
                    {formatDual(serviceNet)}
                  </Text>
                </View>
                <View style={styles.summaryCol3}>
                  <Text style={styles.colTextCenter}>20%</Text>
                </View>
                <View style={styles.summaryCol4}>
                  <Text style={styles.colTextRight}>
                    {formatDual(serviceVat)}
                  </Text>
                </View>
                <View style={styles.summaryCol5}>
                  <Text style={styles.colTextRight}>
                    {formatDual(serviceGross)}
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
                <Text style={styles.colTextRight}>{formatDual(totalVat)}</Text>
              </View>
              <View style={styles.summaryCol5}>
                <Text style={styles.colTextRight}>
                  {formatDual(totalGross)}
                </Text>
              </View>
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
