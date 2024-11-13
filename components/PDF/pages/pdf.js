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
    backgroundColor: "#fff",
    fontFamily: 'THSarabunNew',
    fontSize: 16,
    paddingTop: 96,
    paddingLeft: 37.8,
    paddingRight: 37.8,
    lineHeight: 1.5,
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
    backgroundColor: "yellow"
  },
  Col50: {
    display: "block",
    flex: "0 0 50%",
    maxWidth: "50%",
    // backgroundColor: "red"
  },
  Col33: {
    display: "block",
    flex: "0 0 33.33333333%",
    maxWidth: "33.33333333%",
    backgroundColor: "green"
  },
  Col25: {
    display: "block",
    flex: "0 0 25%",
    maxWidth: "25%",
    backgroundColor: "green"
  },
  invoiceDateContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
});

// Create Document Component
const MyDocument = ({ docData }) => {
  console.log("docData", docData)

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={"true"}>
        <View style={styles.row}>
          <View style={styles.Col50}>
            <Image
              style={styles.image}
              src={docData.logoTopLeft}
            />
            <Text>{docData?.shopName}</Text>
            <Text>{docData?.shopName}</Text>
            <Text>{docData?.shopName}</Text>
            <Text>{docData?.shopName}</Text>
          </View>
          <View style={styles.Col50}>
            <View style={styles.invoiceDateContainer}>
              <Text>{docData?.customerName}</Text>
            </View>
          </View>
        </View>

      </Page>
      <Page size="A4" style={styles.page} wrap={"true"}>
        <View style={styles.section}>
          <Text>Section #1</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </Page>
    </Document>
  );
}

export default MyDocument;