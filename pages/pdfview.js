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
                            price_discount_percent: MatchRoundComma(e?.price_discount_percent),
                            price_discount_percent_2: MatchRoundComma(e?.details?.price_discount_percent_2),
                            price_discount_percent_3: MatchRoundComma(e?.details?.price_discount_percent_3),
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
        let pp = [
            {
                "seq_number": 1,
                "product_name": "OT 245/40R18 KC2000",
                "dot_mfd": "4024",
                "amount": "4",
                "price_unit": "2,176.00",
                "price_discount": "2.00",
                "price_discount_2": "96.00",
                "price_discount_3": "754.00",
                "price_grand_total": "8,704.00"
            },
            {
                "seq_number": 2,
                "product_name": "OT 245/70R16/10PR SA2000",
                "dot_mfd": "3924",
                "amount": "2",
                "price_unit": "2,295.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "4,590.00"
            },
            {
                "seq_number": 3,
                "product_name": "OT 225/60R18 EK1000",
                "dot_mfd": "4024",
                "amount": "4",
                "price_unit": "1,827.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "7,308.00"
            },
            {
                "seq_number": 4,
                "product_name": "OT 215/50R17 KC2000",
                "dot_mfd": "3924",
                "amount": "10",
                "price_unit": "1,449.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "14,490.00"
            },
            {
                "seq_number": 5,
                "product_name": "OT 195/50R15 EK1000",
                "dot_mfd": "2724",
                "amount": "3",
                "price_unit": "999.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "2,997.00"
            },
            {
                "seq_number": 6,
                "product_name": "OT 205/55R16 KC1000",
                "dot_mfd": "4024",
                "amount": "20",
                "price_unit": "1,488.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "29,760.00"
            },
            {
                "seq_number": 7,
                "product_name": "OT 205/55R16 KC1000",
                "dot_mfd": "4024",
                "amount": "8",
                "price_unit": "2,808.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "22,464.00"
            },
            {
                "seq_number": 8,
                "product_name": "OT 205/55R16 KC2000",
                "dot_mfd": "4024",
                "amount": "4",
                "price_unit": "1,610.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "6,440.00"
            },
            {
                "seq_number": 9,
                "product_name": "OT 215/45R17 KC2000",
                "dot_mfd": "2724",
                "amount": "8",
                "price_unit": "1,377.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "11,016.00"
            },
            {
                "seq_number": 10,
                "product_name": "OT 215/55R17 KC2000",
                "dot_mfd": "4724",
                "amount": "20",
                "price_unit": "1,610.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "32,200.00"
            },
            {
                "seq_number": 11,
                "product_name": "OT 225/55R17 KC2000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "1,680.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "16,800.00"
            },
            {
                "seq_number": 12,
                "product_name": "OT 235/45R18 KC2000",
                "dot_mfd": "4024",
                "amount": "11",
                "price_unit": "2,180.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "23,980.00"
            },
            {
                "seq_number": 13,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 14,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 15,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 16,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 17,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 18,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 19,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 20,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 21,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 22,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 23,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 24,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 25,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            },
            {
                "seq_number": 26,
                "product_name": "OT 265/65R17 SA1000",
                "dot_mfd": "2724",
                "amount": "10",
                "price_unit": "2,520.00",
                "price_discount": "0.00",
                "price_discount_2": "0.00",
                "price_discount_3": "0.00",
                "price_grand_total": "25,200.00"
            }
        ]


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
                // product_list: pp,
                remark: model?.details?.remark,
                // remark: "ส่งขนส่ง Kerry",
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
        let page_size = 20
        let cal_page = Math.ceil(newDocData?.documentData?.product_list.length / page_size)
        let page_total = []

        for (let i = 1; i <= cal_page; i++) {
            page_total.push(i)
        }

        newDocData.page_total = page_total
        let item_per_pages = []
        newDocData.page_total.map((e, i) => {
            item_per_pages.push(
                {
                    pages: i + 1,
                    items: []
                }
            )
            newDocData.documentData.product_list.map((e2, i2) => {
                if (item_per_pages[i].items.length < page_size) {
                    if (!e2.add) {
                        item_per_pages[i].items.push(e2)
                        e2.add = true
                    }
                }
            })
        })

        newDocData.item_per_pages = item_per_pages
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