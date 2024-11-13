"use client";
import React from "react";
import dynamic from "next/dynamic";
import PDFFile from '../components/PDF/pages/pdf';
import PDFInvoiceComponent from '../components/PDF/pages/InvoiceComponent';
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import API from '../util/Api'
import { useSelector } from 'react-redux'
import CarPreloader from '../components/_App/CarPreloader'

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <CarPreloader />,
    }
);

const PDFView = () => {
    const router = useRouter();
    let { pages, documentId, docTypeId, docTypeAPIName, shopId } = router.query;
    const [docData, setDocData] = useState({})
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    useEffect(async () => {
        setDocData({})
        let model = {}
        let userData = {}
        if (docTypeAPIName, shopId, documentId) {
            model = await getById(docTypeAPIName, documentId)
            userData = await getShopUser()
        }
        console.log("models", model)
        console.log("userDatas", userData)
        const ShopsProfile = userData?.UsersProfile?.ShopsProfile
        const { ShopPersonalCustomer, ShopBusinessCustomer } = model

        let customer_type = ShopBusinessCustomer ? "business" : "person"
        let customer_data = customer_type === "business" ? ShopBusinessCustomer : ShopPersonalCustomer
        let customer_full_name = customer_type === "person" ? `${customer_data?.customer_name?.first_name[locale.locale] ?? "-"} ${customer_data?.customer_name?.last_name[locale.locale] ?? ""}` : `${customer_data?.customer_name[locale.locale] ?? "-"}`;
        let customer_branch = customer_type === "person" ? "" : customer_data?.other_details?.branch === "office" ? " (สำนักงานใหญ่)" : " (" + customer_data?.other_details?.branch_code + " " + customer_data?.other_details?.branch_name + ")"

        let shop_name = ShopsProfile?.shop_name[locale.locale]
        let shop_branch = ShopsProfile?.shop_config?.branch === "office" ? " (สำนักงานใหญ่)" : " (" + ShopsProfile?.shop_config?.branch_code + " " + ShopsProfile?.shop_config?.branch_name + ")"

        let newDocData = {
            logoTopLeft: `${process.env.NEXT_PUBLIC_DIRECTORY}/assets/shops/${userData?.UsersProfile?.ShopsProfile?.id}/${userData?.UsersProfile?.ShopsProfile?.id}.jpeg`,
            customerName: `${customer_full_name}${customer_branch}`,
            shopName: `${shop_name}${shop_branch}`,
            shopAddress: ShopsProfile?.address[locale.locale]
        }
        setDocData(newDocData)
    }, [pages])

    const getById = async (docTypeAPIName, documentId) => {
        let model
        switch (docTypeAPIName) {
            case "shopTemporaryDeliveryOrderDoc":
                model = await getShopTemporaryDeliveryOrderDoc(documentId)
                break;
        }
        return model
    }

    const getShopTemporaryDeliveryOrderDoc = async (document_id) => {
        const { data } = await API.get(`/shopTemporaryDeliveryOrderDoc/byId/${document_id}`)
        return data.data
    }

    const getShopUser = async () => {
        const { data } = await API.get(`/user/mydata_1`)
        return data.data
    }

    const getSubDistrict = async (district_id) => {
        const { data } = await API.get(`/master/subDistrict?district_id=${district_id}`)
        return data.data
    }

    const getDistrict = async (district_id) => {
        const { data } = await API.get(`/master/subDistrict?district_id=${district_id}`)
        return data.data
    }

    const switchPages = (pages) => {
        if (pages) {

            switch (pages) {
                case "test":
                    return (<PDFFile docData={docData} />)
                case "invoice":
                    return (<PDFInvoiceComponent />)
                default:
                    return (<PDFFile docData={docData} />)
            }

        }
    }

    return (
        // <></>
        <>
            {docData ?
                <PDFViewer style={{ display: "block", height: "100vh", width: "100vw", border: "none" }}>
                    {switchPages(pages)}
                </PDFViewer>
                :
                <></>
            }
        </>

    );
};

export default PDFView;