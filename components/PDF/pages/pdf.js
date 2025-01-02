import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import moment from 'moment'

Font.register(
  {
    family: 'THSarabunNew',
    fonts: [
      {
        src: '/assets/fonts/THSarabunNew.ttf'
      },
      {
        src: '/assets/fonts/THSarabunNewBold.ttf',
        fontStyle: 'normal',
        fontWeight: 700
      },
    ]

  },
);
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: "#fff",
    fontFamily: 'THSarabunNew',
    fontSize: 15,
    paddingTop: 60,
    paddingLeft: 10,
    paddingRight: 10,
    lineHeight: 1.05,
    flexFlow: "row wrap",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  row: {
    flexDirection: "row",
    display: "flex",
    flexFlow: "row wrap",
    minWidth: 0
  },
  rowHeader: {
    flexDirection: "row",
    display: "flex",
    flexFlow: "row wrap",
    minWidth: 0,
    paddingBottom: "30px",
    fontSize: 16,
  },
  rowFooter: {
    flexDirection: "row",
    display: "flex",
    flexFlow: "row wrap",
    minWidth: 0,
    paddingTop: "36.5px",
  },
  Col100: {
    display: "block",
    flex: "0 0 100%",
    maxWidth: "100%",
    // backgroundColor: "yellow"
  },
  Col60: {
    display: "block",
    flex: "0 0 60%",
    maxWidth: "60%",
    // backgroundColor: "red"
  },
  Col50: {
    display: "block",
    flex: "0 0 50%",
    maxWidth: "50%",
    // backgroundColor: "red"
  },
  Col45: {
    display: "block",
    flex: "0 0 45%",
    maxWidth: "45%",
    // backgroundColor: "red"
  },
  Col40: {
    display: "block",
    flex: "0 0 40%",
    maxWidth: "40%",
    // backgroundColor: "red"
    // border: "1px solid black",
  },
  Col35: {
    display: "block",
    flex: "0 0 35%",
    maxWidth: "35%",
    // backgroundColor: "green"
  },
  Col33: {
    display: "block",
    flex: "0 0 33.33333333%",
    maxWidth: "33.33333333%",
    // backgroundColor: "green"
  },
  Col30: {
    display: "block",
    flex: "0 0 30%",
    maxWidth: "30%",
    // backgroundColor: "red"
  },
  Col25: {
    display: "block",
    flex: "0 0 25%",
    maxWidth: "25%",
    // backgroundColor: "green"
  },
  Col23: {
    display: "block",
    flex: "0 0 23%",
    maxWidth: "23%",
    // backgroundColor: "green"
  },
  Col20: {
    display: "block",
    flex: "0 0 20%",
    maxWidth: "20%",
    // backgroundColor: "green"
  },
  Col15: {
    display: "block",
    flex: "0 0 15%",
    maxWidth: "15%",
    // backgroundColor: "green"
  },
  Col13: {
    display: "block",
    flex: "0 0 13%",
    maxWidth: "13%",
    // backgroundColor: "green"
  },
  Col10: {
    display: "block",
    flex: "0 0 10%",
    maxWidth: "10%",
    // backgroundColor: "green"
  },
  Col5: {
    display: "block",
    flex: "0 0 5%",
    maxWidth: "5%",
    // backgroundColor: "green"
  },
  invoiceDateContainer: {
    flexDirection: "row",
    justifyContent: "flex-start"
  },
  table: {
    area: {
      minHeight: "326px",
      maxHeight: "326px",
      // border: "1px solid black",
      // paddingBottom: "34px"
    },
    seqNumber: {
      // border: "1px",
      width: "28px",
      textAlign: "center"
    },
    productName: {
      // border: "1px",
      width: "247px"
    },
    dot: {
      // border: "1px",
      width: "40px",
      textAlign: "center"
    },
    amount: {
      // border: "1px",
      width: "33px",
      textAlign: "center"
    },
    priceUnit: {
      // border: "1px",
      width: "42.519px",
      textAlign: "right"
    },
    priceDiscount: {
      // border: "1px",
      width: "37.8498px",
      textAlign: "right"
    },
    priceDiscount2: {
      // border: "1px",
      width: "37.8498px",
      textAlign: "right"
    },
    priceDiscount3: {
      // border: "1px",
      width: "37.8498px",
      textAlign: "right"
    },
    priceGrandTotal: {
      // border: "1px",
      width: "68.0304px",
      textAlign: "right"
    },
  },
  rowTable: {
    flexDirection: "row",
    display: "flex",
    flexFlow: "row wrap",
    minWidth: 0,
    paddingBottom: "0px"
  },
  footer: {
    note: {
      textAlign: "right",
      paddingBottom: "8px",
      paddingLeft: "51px"
    },
    price: {
      textAlign: "right",
      paddingBottom: "10px"
    },
    priceGrandTotalFooter: {
      textAlign: "right",
      paddingBottom: "10px",
      fontSize: "18px",
    }
  },
  focusPoint: {
    fontSize: "19px",
    fontWeight: "bold"
  }
});

// Create Document Component
const MyDocument = ({ docData }) => {

  return (
    <Document>
      {docData.item_per_pages?.map((el => (
        <Page size="A4" style={styles.page} wrap={"true"}>
          <View style={styles.rowHeader}>
            <View style={styles.Col10}>
            </View>
            <View style={styles.Col60}>
              <Text style={styles.focusPoint}>{docData?.customerData?.customer_name}</Text>
              <Text>{docData?.customerData?.customer_address}</Text>
              <Text>{docData?.customerData?.customer_address_2}</Text>
              <Text>{docData?.customerData?.customer_address_3}</Text>
              <Text>{docData?.customerData?.customer_mobile}</Text>
              <Text>{docData?.customerData?.customer_tax_id}</Text>
            </View>
            <View style={styles.Col13}>
              <View style={styles.invoiceDateContainer}>
              </View>
            </View>
            <View style={styles.Col15}>
              <View style={styles.invoiceDateContainer}>
                <Text style={styles.focusPoint}>{docData?.documentData?.code_id}</Text>
              </View>
              <View style={styles.invoiceDateContainer}>
                <Text>{docData?.documentData?.doc_date}</Text>
              </View>
              <View style={styles.invoiceDateContainer}>
                <Text>{docData?.documentData?.due_date}</Text>
              </View>
              <View style={styles.invoiceDateContainer}>
                <Text>{docData?.documentData?.sales_man}</Text>
              </View>
              <View style={styles.invoiceDateContainer}>
                <Text>{docData?.documentData?.warehouse}</Text>
              </View>
              <View style={styles.invoiceDateContainer}>
                <Text>{docData?.documentData?.doc_time}</Text>
              </View>
            </View>
          </View>

          <View style={styles.table.area}>
            {el.items?.map((e) => (
              <View style={styles.rowTable}>
                <View style={styles.table.seqNumber}>
                  <Text>{e?.seq_number}</Text>
                </View>
                <View style={styles.table.productName}>
                  <Text>{e?.product_name}</Text>
                </View>
                <View style={styles.table.dot}>
                  <Text>{e?.dot_mfd}</Text>
                </View>
                <View style={styles.table.amount}>
                  <Text>{e?.amount}</Text>
                </View>
                <View style={styles.table.priceUnit}>
                  <Text>{e?.price_unit}</Text>
                </View>
                <View style={styles.table.priceDiscount}>
                  <Text>{e?.price_discount === "0.00" ? "0" : e?.price_discount}</Text>
                </View>
                <View style={styles.table.priceDiscount2}>
                  <Text>{e?.price_discount_2 === "0.00" ? "0" : e?.price_discount_2}</Text>
                </View>
                <View style={styles.table.priceDiscount3}>
                  <Text>{e?.price_discount_3 === "0.00" ? "0" : e?.price_discount_3}</Text>
                </View>
                <View style={styles.table.priceGrandTotal}>
                  <Text>{e?.price_grand_total}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.rowFooter}>
            <View style={styles.Col10}>
            </View>
            <View style={styles.Col40}>
              <Text style={{ paddingTop: "-10px" }}>{docData?.documentData?.remark}</Text>
            </View>
            <View style={styles.Col25}>
            </View>
            <View style={styles.Col25}>
              <View style={styles.footer.price}>
                <Text>{docData?.documentData?.price_sub_total}</Text>
              </View>
              <View style={styles.footer.price}>
                <Text>{docData?.documentData?.price_discount_total}</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.Col10}>
            </View>
            <View style={styles.Col40}>
              <Text>{docData?.documentData?.thai_bath_text}</Text>
            </View>
            <View style={styles.Col25}>
            </View>
            <View style={styles.Col25}>
              <View style={styles.footer.price}>
                <Text style={styles.focusPoint}>{docData?.documentData?.price_grand_total}</Text>
              </View>
            </View>
          </View>
        </Page>
      )))}

    </Document>
  );
}

export default MyDocument;