import { PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space, message, Modal, Button } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import Swal from "sweetalert2";
import BusinessPartnersData from '../../../../../routes/MyData/BusinessPartnersData'

const FormDebtorDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false }) => {

    const form = Form.useFormInstance()

    const { locale,} = useSelector(({ settings }) => settings);
    const { documentTypes, } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [isBusinessPartnersDataModalVisible, setIsBusinessPartnersDataModalVisible] = useState(false);

    const handleCancelBusinessPartnersDataModal = () => {
        try {
            setIsBusinessPartnersDataModalVisible(false)
        } catch (error) {

        }
    }
    const callBackBusinessPartnersData = (data) => {
        setIsBusinessPartnersDataModalVisible(false)
        console.log("callback", data)
        form.setFieldsValue({
            partner_id: data?.id,
            code_id: data?.code_id,
            partner_name: data?.partner_name?.th,
            partner_credit_debt_unpaid_balance: data?.other_details?.debt_amount ?? "0.00",
            partner_credit_debt_current_balance: data?.other_details?.debt_amount ? (Number(data?.other_details?.credit_limit) - Number(data?.other_details?.debt_amount)) ?? "0.00" : "0.00",
            partner_credit_debt_payment_period: data?.other_details?.credit_term ?? "0",
            partner_credit_debt_approval_balance: data?.other_details?.credit_limit ?? "0.00",
            debt_due_date: moment(moment(new Date()).add(Number(data?.other_details?.credit_term), 'd'))
        });
    }


    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="partner_id"
                        label="ไอดีผู้จำหน่าย"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกลูกค้า"
                            },
                        ]}
                    >
                        <Input disabled={mode === "view"} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="code_id"
                        label="รหัสผู้จำหน่าย"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกลูกค้า"
                            },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_name"
                        label="ชื่อผู้จำหน่าย"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกลูกค้า"
                            },
                        ]}
                    >
                        <Input disabled addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                onClick={() => setIsBusinessPartnersDataModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_unpaid_balance"
                        label="จำนวนเงินค้างชำระ"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />

                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="ref_doc"
                        label="เลขที่อ้างอิง"
                    >
                        <Input disabled={mode === "view"} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_current_balance"
                        label="วงเงินเครดิตคงเหลือ"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_payment_period"
                        label="จำนวนวันเครดิต"
                    >
                        <InputNumber disabled className='ant-input-number-with-addon-after' stringMode min={0} precision={0} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} addonAfter={`วัน`} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_approval_balance"
                        label="วงเงินเครดิต"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="debt_due_date"
                        label="วันที่กำหนดรับชำระ"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="doc_type_id"
                        label="ประเภทเอกสาร"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                        >
                            {documentTypes.map((e, index) => <Select.Option value={e.id} key={`doc-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label="วันที่เอกสาร"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>
            </Row>
            <Modal
                maskClosable={false}
                open={isBusinessPartnersDataModalVisible}
                onCancel={handleCancelBusinessPartnersDataModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelBusinessPartnersDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <BusinessPartnersData title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackBusinessPartnersData} />
            </Modal>
        </>

    )
}

export default FormDebtorDoc