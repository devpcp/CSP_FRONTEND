import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({
  family: 'THSarabunNew',
  src: '/assets/fonts/THSarabunNew.ttf'
});
// Create styles
const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    fontFamily: 'THSarabunNew',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 50,
    paddingRight: 50,
    lineHeight: 1.5,
    flexDirection: "column"
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  },
  label: {
    fontSize: 18,
  }
});

// Create Document Component
const MyDocument = () => (

  <Document>
    <Page size="A4" style={styles.page} wrap={"true"}>
      <View style={styles.section}>
        <Image
          style={styles.logo}
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png"
        />
        <Text style={styles.label}>ข้อมูลลูกค้า</Text>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
        <View style={styles.section}>
          <Text>Section #2</Text>
        </View>
      </View>
      <View style={styles.section}>
        <Text>Section #2</Text>
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

export default MyDocument;