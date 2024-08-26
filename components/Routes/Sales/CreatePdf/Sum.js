import { Row, Col } from "antd";
import React from "react";
import { isPlainObject } from "lodash";
import { ArabicNumberToText } from "../../../shares/NumberToCharacter";
// import 'antd/dist/antd.css';
import Signature from './Signature'

const Sum = ({ props, mainColor, locale, authUser, docTypeId }) => {

    const importcertificate = '054fada4-1025-4d0a-bdff-53cb6091c406'; //ใบนำเข้า
    const temporaryinvoice = '67c45df3-4f84-45a8-8efc-de22fef31978'; //ใบส่งของชั่วคราว
    const fullreceipt = 'e67f4a64-52dd-4008-9ef0-0121e7a65d48'; //ใบเสร็จเต็มรูป
    const summaryreceipt = 'b39bcb5d-6c72-4979-8725-c384c80a66c3'; //ใบเสร็จอย่างย่อ
    const repairorder = '7ef3840f-3d7f-43de-89ea-dce215703c16'; //ใบสั่งซ่อม

    const Checknote = (docTypeId) => {
        // switch (docTypeId) {
        //     case temporaryinvoice:
                return (
                    <>
                        <Col span={24}>
                            1. กรณีชำระเงินโดยเช็ค กรุณาสั่งจ่ายเช็คขีดคร่อมในนาม "บริษัท โปรคอนซัลท์พลัส จำกัด" เท่านั้น
                        </Col>
                        <Col span={24}>
                            2. กรณีชำระเงินโดยการโอน กรุณาโอนที่ธนาคารกรุงเทพ เลขที่บัญชี 245-0-84380-6 ชื่อบัญชี บจ.โปรคอนซัลท์พลัส เท่านั้น
                        </Col>
                        <Col span={24}>
                            3. บริษัทฯ ขอสงวนสิทธิ์ในการแก้ไขใบกำกับภาษีภายใน 7 วันนับจากวันที่ระบุในใบกำกับภาษี (ผิด ตก ยกเว้น E. & OE.)
                        </Col>
                    </>
                );

            // default:
            //     break;
        // }
    }

    const netTotalWithOutVat = () => {
        let result;
        if (isPlainObject(props.tableData)) {
            const netTotal = props.tableData.details.calculate_result.net_total;
            const vat = props.tableData.details.calculate_result.vat;
            result = netTotal - vat;
            return result.toLocaleString() ?? 0;
        }
    };

    return (
        <>
            <Row justify={"space-between"} style={{ paddingTop: "30px" }}>
                <Col span={24} offset={16}>
                    <Row justify={"space-between"}>
                        <Col span={12} style={{ color: mainColor }}>
                            รวมเป็นเงิน
                        </Col>
                        <Col span={12} style={{ textAlign: "end" }}>
                            {isPlainObject(props.tableData)
                                ? `${props.tableData.details.calculate_result.net_total_text} บาท `
                                : null}
                        </Col>

                        <Col span={12} style={{ color: mainColor }}>
                            ส่วนลด
                        </Col>
                        <Col span={12} style={{ textAlign: "end" }}>
                            {isPlainObject(props.tableData)
                                ? `${props.tableData.details.calculate_result.vat.toLocaleString()} บาท`
                                : null}
                        </Col>
                        <Col span={12} style={{ color: mainColor }}>
                            จำนวนเงินหลังหักส่วนลด
                        </Col>
                        <Col span={12} style={{ textAlign: "end" }}>
                            {isPlainObject(props.tableData)
                                ? `${props.tableData.details.calculate_result.vat.toLocaleString()} บาท`
                                : null}
                        </Col>
                        <Col span={12} style={{ color: mainColor }}>
                            ภาษีมูลค่าเพิ่ม 7%
                        </Col>
                        <Col span={12} style={{ textAlign: "end" }}>
                            {netTotalWithOutVat()} บาท
                        </Col>
                    </Row>
                </Col>
                <Col span={24} >
                    <Row>
                        <Col span={16}>
                            <ArabicNumberToText
                                convertNumber={
                                    isPlainObject(props.tableData)
                                        ? props.tableData.details.calculate_result
                                            .net_total_text
                                        : 0
                                }
                            />
                        </Col>
                        <Col span={8}>
                            <div
                                style={{
                                    backgroundColor: "rgb(220,220,220)",
                                    color: mainColor,
                                }}
                            >
                                จำนวนเงินรวมทั้งสิ้น :{" "}
                                {isPlainObject(props.tableData)
                                    ? `${props.tableData.details.calculate_result.net_total_text} บาท `
                                    : null}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row style={{ paddingTop: "100px" }}>
                <Col span={24} style={{ color: mainColor }}>
                    หมายเหตุ
                </Col>
                {
                    Checknote(docTypeId)
                }
            </Row>
            <Row style={{ marginBottom: '300px' }}>
                {isPlainObject(props.tableData) ? <Signature props={props} locale={locale} /> : null}
            </Row>
        </>

    );
};

export default Sum;
