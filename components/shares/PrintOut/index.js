import { Button, message, Modal, Dropdown, Menu, Space, Row, Col } from "antd";
import React, { useState, useEffect } from "react";
import API from '../../../util/Api'
import GetIntlMessages from '../../../util/GetIntlMessages';
import { PrinterOutlined, DownOutlined, SettingOutlined } from "@ant-design/icons";
import { isPlainObject } from "lodash";

/**
 * @param {{documentId : string, morePrintOuts : object , loading : boolean , style : object , textButton : string , printOutHeadTitle : string}} 
 * @param documentId - UUID of document
 * @param morePrintOuts - e.g. {key(any name): { status: true, name: "ใบเบิกสินค้า", price_use: 2 }},
 * @param loading - Set button into loading stage
 * @param style - Set style of the print out button
 * @param textButton - Title of the button
 * @param printOutHeadTitle - Header of print out (not work on dropdown print out button)
 */
const PrintOut = ({ documentId, morePrintOuts, loading = false, style, textButton, printOutHeadTitle, customFootSign, customPriceUse, docTypeId, settingPrint = {} }) => {


    const [loadingPrintOut, setLoadingPrintOut] = useState(false)
    /**
     * 
     * @param name - name of the document to display on website and header title on pdf printing (type -> string)
     * @param priceUse - status for showing summary price details while printing (1 = true / 2 = false) (type -> number/string)
     */
    const printOutPdf = async (name, priceUse, footSign, documentIdPerbutton) => {
        try {
            console.log("formSettingPrint3", settingPrint)
            const { doc_date_show, vehicle_data_show } = settingPrint
            setLoadingPrintOut(() => true)
            documentId = documentIdPerbutton !== undefined && documentIdPerbutton !== null ? documentIdPerbutton : documentId
            let url = `/printOut/pdf/${documentId}?price_use=${priceUse == 1 ? true : false}${name ? `&doc_type_name=${name}` : ""}${vehicle_data_show !== undefined ? `&vehicle_data_show=${vehicle_data_show}` : ""}${doc_date_show !== undefined ? `&doc_date_show=${doc_date_show}` : ""}${isPlainObject(footSign) ? `&foot_sign_left=${footSign.left}&foot_sign_right=${footSign.right}` : ""}${docTypeId ? `&doc_type_id=${docTypeId}` : ""}`
            const { data } = await API.get(url)
            if (data.status === "success") {
                window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
            }
            setLoadingPrintOut(() => false)
        } catch (error) {
            // console.log('error', error)
            setLoadingPrintOut(() => false)
            message.error(GetIntlMessages("บางอย่างผิดพลาด !!"))
        }
    }

    const checkAllValueIsFalse = () => {
        let allFalse = false
        const btnStatus = []
        if (isPlainObject(morePrintOuts)) {
            Object.entries(morePrintOuts).map(e => {
                if (isPlainObject(e[1])) {
                    btnStatus.push(e[1]["status"])
                }
            })
            allFalse = btnStatus.every(value => value === false)
            return allFalse
        } else {
            return allFalse
        }
    }

    const menu = () => {
        try {
            const items = Object.entries(morePrintOuts).map((e, index) => {
                if (isPlainObject(e[1])) {
                    if (e[1]["status"] === true) {
                        return {
                            key: index,
                            label: e[1]["name"],
                            onClick: () => printOutPdf(e[1]["name"], e[1]["price_use"], e[1]["footSign"], e[1]["documentIdPerbutton"] ?? null)
                        }
                    }
                }
            })
            return (
                <Menu
                    items={items}
                />
            )
        } catch (error) {

        }
    };


    return (
        <>
            {
                isPlainObject(morePrintOuts) && checkAllValueIsFalse() != true ?
                    <div>
                        <Dropdown overlay={() => menu()} style={{ width: "100%" }} >
                            <Button loading={loading} type="primary" onClick={(e) => e.preventDefault()} style={{ width: "100%", padding: 4 }}>
                                <Space>
                                    <PrinterOutlined style={{ fontSize: "20px", color: "white" }} />
                                    {GetIntlMessages("print")}
                                    <DownOutlined />
                                </Space>
                            </Button>
                        </Dropdown>
                    </div>
                    :
                    <Button loading={loading || loadingPrintOut} style={style ?? { width: 100 }} type="primary" onClick={() => printOutPdf(printOutHeadTitle, customPriceUse, customFootSign)}>
                        <span className='pr-2'><PrinterOutlined style={{ fontSize: "20px", color: "white" }} /></span>{textButton ?? GetIntlMessages("print")}
                    </Button>

            }

        </>
    );
};

export default PrintOut;
