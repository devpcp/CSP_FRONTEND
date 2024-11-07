"use client";
import React from "react";
import dynamic from "next/dynamic";
import PDFFile from '../components/PDF/pages/pdf';
import PDFInvoiceComponent from '../components/PDF/pages/InvoiceComponent';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <p>Loading...</p>,
    }
);

const PDFView = () => {
    const router = useRouter();

    let { pages } = router.query;
    const [pagesPDF, setPagesPDF] = useState("")

    useEffect(() => {
        if (pages) {
            switch (pages) {
                case "test":
                    setPagesPDF(<PDFFile />)
                    break;
                case "invoice":
                    setPagesPDF(<PDFInvoiceComponent />)
                    break;
                default:
                    setPagesPDF(<PDFFile />)
                    break;
            }
        }
    }, [pages])
    return (
        <PDFViewer children={pagesPDF} style={{ display: "block", height: "100vh", width: "100vw", border: "none" }}></PDFViewer>
    );
};

export default PDFView;