import React from "react";
import { StyleSheet, Image, Text, View, Page, Document } from "@react-pdf/renderer";
import InvoiceNo from "./InvoiceNo";
import InvoiceBillTo from "./InvoiceBillTo";
import InvoiceItemsTable from "./InvoiceItemsTable";
import InvoiceData from "./InvoiceData";
import { useEffect, useState } from "react";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
    flexDirection: "column"
  },
  logo: {
    width: 84,
    height: 70
  },
  mainHeader: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

const InvoiceComponent = () => {

  const [invoice, setInvoice] = useState(InvoiceData)
  useEffect(() => {
    setInvoice(InvoiceData)
  })

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap={"true"}>
        <View>
          <View style={styles.mainHeader}>
            <Image
              style={styles.logo}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png"
            />
            <Text>Hello, {invoice.fullname}!</Text>
          </View>
          <InvoiceNo invoice={invoice} />
          <InvoiceBillTo invoice={invoice} />
          <InvoiceItemsTable invoice={invoice} />
        </View>
      </Page>
    </Document>
  );
};

export default InvoiceComponent;