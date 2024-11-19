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
import moment from "moment";
import ThaiBahtText from 'thai-baht-text'

const PDFViewer = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
    {
        ssr: false,
        loading: () => <CarPreloader />,
    }
);

const PDFView = () => {
    const MatchRoundComma = (value) => (Math.round(+value * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)
    const router = useRouter();
    let { pages, documentId, docTypeId, docTypeAPIName, shopId } = router.query;
    const [docData, setDocData] = useState({})
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    useEffect(async () => {
        setDocData({})
        let model = {}
        let userData = {}
        let shopUser = []
        let product_list = []
        if (docTypeAPIName, shopId, documentId) {
            model = await getById(docTypeAPIName, documentId)
            userData = await getUserData()
            shopUser = await getShopUser()
        }
        console.log("models", model)
        console.log("userDatas", userData)
        const ShopsProfile = userData?.UsersProfile?.ShopsProfile
        const { ShopPersonalCustomer, ShopBusinessCustomer, details } = model

        switch (docTypeAPIName) {
            case "shopTemporaryDeliveryOrderDoc":
                model?.ShopTemporaryDeliveryOrderLists.map((e) => {
                    if (product_list.find(x => x.product_list === e.shop_product_id && x.dot_mfd === e.dot_mfd && x.price_unit === e.price_unit)) {
                        product_list.findIndex(x => x.product_list === e.shop_product_id && x.dot_mfd === e.dot_mfd && x.price_unit === e.price_unit)
                    } else {
                        product_list.push({
                            seq_number: e?.seq_number,
                            product_name: e?.details.meta_data.ShopProduct.Product.product_name[locale.locale],
                            dot_mfd: e?.dot_mfd,
                            amount: e?.amount,
                            price_unit: MatchRoundComma(e?.price_unit),
                            price_discount: MatchRoundComma(e?.price_discount),
                            price_discount_2: MatchRoundComma(e?.details.price_discount_2),
                            price_discount_3: MatchRoundComma(e?.details.price_discount_3),
                            price_grand_total: MatchRoundComma(e?.price_grand_total),
                        })
                    }
                })
                break;

            default:
                break;
        }


        let customer_type = ShopBusinessCustomer ? "business" : "person"
        let customer_data = customer_type === "business" ? ShopBusinessCustomer : ShopPersonalCustomer
        let customer_full_name = customer_type === "person" ? `${customer_data?.customer_name?.first_name[locale.locale] ?? "-"} ${customer_data?.customer_name?.last_name[locale.locale] ?? ""}` : `${customer_data?.customer_name[locale.locale] ?? "-"}`;
        let customer_branch = customer_type === "person" ? "" : customer_data?.other_details?.branch ? customer_data?.other_details?.branch === "office" ? " (สำนักงานใหญ่)" : " (" + customer_data?.other_details?.branch_code + " " + customer_data?.other_details?.branch_name + ")" : ""
        let customer_address = `${customer_data?.address ? customer_data?.address[locale.locale] : ""}`
        let customer_zip_code = `${customer_data?.SubDistrict ? customer_data?.SubDistrict?.zip_code : ""}`
        let customer_subdistrict = `${customer_data?.Province ? customer_data?.Province?.prov_name_th === "กรุงเทพมหานคร" ? "แขวง" : "ตำบล" : ""} ${customer_data?.SubDistrict ? customer_data?.SubDistrict?.name_th : "-"}`
        let customer_district = `${customer_data?.Province ? customer_data?.Province?.prov_name_th === "กรุงเทพมหานคร" ? "เขต" : "อำเภอ" : ""} ${customer_data?.District ? customer_data?.District?.name_th : "-"}`
        let customer_province = `จังหวัด ${customer_data?.Province ? customer_data?.Province?.prov_name_th : "-"}`
        let customer_tax_id = `เลขประจำตัวผู้เสียภาษี ${customer_data?.tax_id ? customer_data?.tax_id : "-"}`
        let customer_mobile = `เบอร์มือถือ ${customer_data?.mobile_no ? customer_data?.mobile_no?.mobile_no_1 ?? "-" : "-"}`

        let shop_name = ShopsProfile?.shop_name[locale.locale]
        let shop_branch = ShopsProfile?.shop_config?.branch === "office" ? " (สำนักงานใหญ่)" : " (" + ShopsProfile?.shop_config?.branch_code + " " + ShopsProfile?.shop_config?.branch_name + ")"
        let shop_local_name = ShopsProfile?.shop_name?.shop_local_name

        let debt_due_date = customer_data?.other_details?.debt_due_date ?? 0
        let doc_date = moment(model?.doc_date).format("DD/MM/YYYY")
        let doc_time = moment(model?.created_date).format("HH:mm")
        let due_date = moment(model?.doc_date).add('days', debt_due_date).format("DD/MM/YYYY")
        let sales_man = shopUser?.find(x => x?.id === details?.sales_man[0])?.UsersProfile?.fname[locale.locale]

        let newDocData = {
            customerData: {
                customer_name: `${customer_full_name}${customer_branch}`,
                customer_address: customer_address,
                customer_address_2: `${customer_subdistrict} ${customer_district}`,
                customer_address_3: `${customer_province} ${customer_zip_code}`,
                customer_tax_id: customer_tax_id,
                customer_mobile: customer_mobile,
            },
            documentData: {
                code_id: model?.code_id,
                doc_date: doc_date,
                due_date: due_date,
                sales_man: sales_man,
                warehouse: shop_local_name,
                doc_time: doc_time,
                product_list: product_list,
                remark: model?.details?.remark,
                price_sub_total: MatchRoundComma(model?.price_sub_total),
                price_discount_total: MatchRoundComma(model?.price_discount_total),
                price_grand_total: MatchRoundComma(model?.price_grand_total),
                thai_bath_text: ThaiBahtText(+MatchRound(model?.price_grand_total ?? 0))
            },
            shopData: {
                shop_name: `${shop_name}${shop_branch}`,
                shop_address: ShopsProfile?.address[locale.locale],
                shop_logo: `${process.env.NEXT_PUBLIC_DIRECTORY}/assets/shops/${userData?.UsersProfile?.ShopsProfile?.id}/${userData?.UsersProfile?.ShopsProfile?.id}.jpeg`,
            },
        }
        console.log("newDocData", newDocData)
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

    const getUserData = async () => {
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

    const getShopUser = async () => {
        const { data } = await API.get(`/shopUser/all?limit=9999&page=1&sort=user_name&order=desc&status=default&selectInAuth=false`)
        return data.data.data
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