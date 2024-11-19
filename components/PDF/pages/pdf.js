import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import moment from 'moment'

Font.register({
  family: 'THSarabunNew',
  src: '/assets/fonts/THSarabunNew.ttf'
});
// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: "#fff",
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    paddingTop: 50,
    paddingLeft: 30,
    paddingRight: 30,
    lineHeight: 1.2,
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
  Col100: {
    display: "block",
    flex: "0 0 100%",
    maxWidth: "100%",
    // backgroundColor: "yellow"
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
  },
  Col33: {
    display: "block",
    flex: "0 0 33.33333333%",
    maxWidth: "33.33333333%",
    // backgroundColor: "green"
  },
  Col25: {
    display: "block",
    flex: "0 0 25%",
    maxWidth: "25%",
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
      minHeight: "60vh",
      // backgroundColor: "orange",
      padding: "30px 0"
    },
    seqNumber: {
      // border: "1px",
      width: "5%",
      textAlign: "center"
    },
    productName: {
      // border: "1px",
      width: "40%"
    },
    dot: {
      // border: "1px",
      width: "5%",
      textAlign: "center"
    },
    amount: {
      // border: "1px",
      width: "5%",
      textAlign: "right"
    },
    priceUnit: {
      // border: "1px",
      width: "10%",
      textAlign: "right"
    },
    priceDiscount: {
      // border: "1px",
      width: "10%",
      textAlign: "right"
    },
    priceDiscount2: {
      // border: "1px",
      width: "10%",
      textAlign: "right"
    },
    priceDiscount3: {
      // border: "1px",
      width: "10%",
      textAlign: "right"
    },
    priceGrandTotal: {
      // border: "1px",
      width: "10%",
      textAlign: "right"
    },
  },
  rowTable: {
    flexDirection: "row",
    display: "flex",
    flexFlow: "row wrap",
    minWidth: 0,
    paddingBottom: "8px"
  },
  footer: {
    price: {
      textAlign: "right",
      paddingBottom: "8px"
    }
  }
});

// Create Document Component
const MyDocument = ({ docData }) => {

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={"true"}>
        <View style={styles.row}>
          <View style={styles.Col5}>
          </View>
          <View style={styles.Col45}>
            <Text>{docData?.customerData?.customer_name}</Text>
            <Text>{docData?.customerData?.customer_address}</Text>
            <Text>{docData?.customerData?.customer_address_2}</Text>
            <Text>{docData?.customerData?.customer_address_3}</Text>
            <Text>{docData?.customerData?.customer_mobile}</Text>
            <Text>{docData?.customerData?.customer_tax_id}</Text>
          </View>
          <View style={styles.Col25}>
            <View style={styles.invoiceDateContainer}>
              {/* <Text>{docData?.customerName}</Text> */}
            </View>
          </View>
          <View style={styles.Col25}>
            <View style={styles.invoiceDateContainer}>
              <Text>{docData?.documentData?.code_id}</Text>
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
          {docData?.documentData?.product_list.map((e) => (
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
                <Text>{e?.price_discount}</Text>
              </View>
              <View style={styles.table.priceDiscount2}>
                <Text>{e?.price_discount_2}</Text>
              </View>
              <View style={styles.table.priceDiscount3}>
                <Text>{e?.price_discount_3}</Text>
              </View>
              <View style={styles.table.priceGrandTotal}>
                <Text>{e?.price_grand_total}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.Col10}>
          </View>
          <View style={styles.Col40}>
            <Text>{docData?.documentData?.remark}</Text>
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
              <Text>{docData?.documentData?.price_grand_total}</Text>
            </View>
          </View>
        </View>
      </Page>
      {/* <Page size="A4" style={styles.page} wrap={"true"}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page> */}
    </Document>
  );
}

export default MyDocument;