import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import { isArray } from 'lodash'
import React from 'react'
import Fieldset from '../../../../shares/Fieldset'
import GetIntlMessages from '../../../../../util/GetIntlMessages'

const ComponentsRoutesModalTabPaymentInfo = (paymentTransactions) => {
    const form = Form.useFormInstance()

    const customerType = Form.useWatch("customer_type", form)

    const getArrValue = (type) => {
        try {
            const watchData = Form.useWatch(type, { form, preserve: true })
            // console.log('watchData :>> ', watchData);
            return !!watchData && isArray(watchData) ? watchData ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }
    console.log("paymentTransactions", paymentTransactions.data)

    const methodCash = (e) => {
        console.log("daaaa", e.payment_method)
        return (
            <div>
                hi
                <label>{e.payment_method}</label>
                {/* <Row gutter={[20]}>
                    <Col lg={12} xs={24}>
                        <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>ข้อมูลการชำระเงิน</span>)}>
                            <Row>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("ประเภทการชำระ")} name={["payment", "payment_type"]}>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("จำนวน")} name={["payment", "price"]}>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("เงินทอน")} name={["payment", "change"]}>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("วันเวลาที่ชำระเงิน")} name={["payment", "payment_date"]}>
                                        <DatePicker placeholder='' style={{ width: "100%" }} disabled showTime />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("หมายเหตุ")} name={["payment", "remark"]}>
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Fieldset>
                    </Col>
                </Row> */}
            </div>
        )
    }


    return (
        <Col lg={24} xs={24}>
            <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>ข้อมูลการชำระเงิน</span>)}>
                <Row>
                    <Col span={24}>
                        <Form.Item label={GetIntlMessages("ประเภทการชำระ")} name={["payment", "payment_type"]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={GetIntlMessages("จำนวน")} name={["payment", "price"]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={GetIntlMessages("เงินทอน")} name={["payment", "change"]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={GetIntlMessages("วันเวลาที่ชำระเงิน")} name={["payment", "payment_date"]}>
                            <DatePicker placeholder='' style={{ width: "100%" }} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label={GetIntlMessages("หมายเหตุ")} name={["payment", "remark"]}>
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>
            </Fieldset>
        </Col>
    )
    // isArray(paymentTransactions.data) ? paymentTransactions.data.map((e) => {
    //     // e.payment_method === 1 ? return <><label>{e.payment_method}</label></> : <></>
    //     return e.payment_method === 1 ? <><label>{e.payment_method}</label></> : <></>
    //     // switch (e.payment_method) {
    //     //     case 1:
    //     //         {methodCash(e)}
    //     //         <div>
    //     //             <label>tetset</label>
    //     //         </div>
    //     //         break;

    //     //     default:
    //     //         break;
    //     // }
    // }
    // ) : null)


}

export default ComponentsRoutesModalTabPaymentInfo