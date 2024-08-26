import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import { isArray } from 'lodash'
import React from 'react'
import Fieldset from '../../../../../shares/Fieldset'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'

const ComponentsRoutesModalTab2customerInfo = () => {
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

    return (
        <>
            <Row gutter={[20]}>
                <Col lg={12} xs={24}>
                    <Row>
                        <Col span={24}>
                            <Form.Item label="ประเภทลูกค้า" name={`customer_type`}>
                                <Select style={{ width: "100%" }} disabled showArrow={false}>
                                    <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                    <Select.Option value="business">ธุรกิจ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="customer_id"
                                label="ชื่อลูกค้า"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    // notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled
                                >
                                    {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{e.customer_name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="customer_id"
                                label="หมายเลขประจำตัวผู้เสียภาษี"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    // notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled
                                >
                                    {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{customerType === "person" ? e?.id_card_number ?? "-" : e?.tax_id ?? "-"}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="ที่อยู่"
                            >
                                <Input.TextArea disabled rows={9} />
                            </Form.Item>
                        </Col>
                    </Row>

                </Col>
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
                                    <DatePicker placeholder='' style={{ width: "100%" }} disabled format={"DD/MM/YYYY"}/>
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
            </Row>
        </>
    )
}

export default ComponentsRoutesModalTab2customerInfo