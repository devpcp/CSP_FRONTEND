import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space, Tooltip, Button, Modal } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import BusinessPartnersData from '../../../../../routes/MyData/BusinessPartnersData'
import ShopPartnerDebtBillAcceptanceDoc from '../../ShopPartnerDebtBillAcceptanceDoc'

const FormTemporaryDeliveryOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false }) => {

    const form = Form.useFormInstance();

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    const customerPhoneList = Form.useWatch("customer_phone_list", { form, preserve: true })
    const [isBusinessPartnersDataModalVisible, setIsBusinessPartnersDataModalVisible] = useState(false);
    const [isShopPartnerDebtBillAcceptanceDocModalVisible, setIsShopPartnerDebtBillAcceptanceDocModalVisible] = useState(false);


    const getArrValue = (type) => {
        try {
            const fieldValue = form.getFieldValue(`${type}`)
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }

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
            partner_name: data?.partner_name?.[locale.locale],
            partner_credit_debt_unpaid_balance: data?.other_details?.debt_amount ?? "0.00",
            partner_credit_debt_current_balance: data?.other_details?.debt_amount ? (Number(data?.other_details?.credit_limit) - Number(data?.other_details?.debt_amount)) ?? "0.00" : "0.00",
            partner_credit_debt_payment_period: data?.other_details?.credit_term ?? "0",
            partner_credit_debt_approval_balance: data?.other_details?.credit_limit ?? "0.00",
            debt_due_date: moment(moment(new Date()).add(Number(data?.other_details?.credit_term), 'd'))
        });
    }

    const handleCancelShopPartnerDebtBillAcceptanceDocModal = () => {
        try {
            setIsShopPartnerDebtBillAcceptanceDocModalVisible(false)
        } catch (error) {

        }
    }
    const callBackShopPartnerDebtBillAcceptanceDoc = (data) => {
        setIsShopPartnerDebtBillAcceptanceDocModalVisible(false)
        console.log("callback", data)
        form.setFieldsValue({
            partner_id: data?.id,
            code_id: data?.code_id,
            partner_name: data?.partner_name?.th,
            doc_date: moment(doc_date),
            debt_due_date: moment(debt_due_date),
            status: mode === "add" ? `${data?.status}` : data?.status,
            shopPartnerDebtLists: data?.ShopCustomerDebtBillingNoteLists,
            remark: data?.details?.remark,
            remark_inside: data?.details?.remark_inside,
            debt_price_paid_total: null,
        })
    }




    const [detorBillingList, setDetorBillingList] = useState([])
    const debounceSearchDebtorBilling = debounce((value, type) => handleSearchDebtorBilling(value, type), 800)
    const [loadingDebtorBilling, setLoadingDebtorBilling] = useState(false)
    const handleSearchDebtorBilling = async (value, type) => {
        try {
            // console.log('value :>> ', value);
            setLoadingDebtorBilling(true)
            switch (type) {
                case "search":
                    const { data } = await API.get(`/shopCustomerDebtBillingNoteDoc/all?filter__debt_price_amount_left=false&status=active&page=1&limit=50&sort=code_id&order=desc`)

                    if (data.status === "success") {
                        // setDetorBillingList(data.data.data)
                        const newValue = data.data.data.map((e, index) => ({
                            ...e,
                            display_value: `${e?.code_id} -> ${!!e?.bus_customer_id ? e?.ShopBusinessCustomer?.customer_name[locale.locale] ?? "-" : `${e?.ShopPersonalCustomer?.customer_name?.first_name[locale.locale] ?? ""} ${e.ShopPersonalCustomer.customer_name?.last_name[locale.locale] ?? ""}`}`
                        }))

                        form.setFieldsValue({ debtor_billing_list: newValue })
                    }
                case "select":
                    const { debtor_billing_list, customer_id } = form.getFieldValue(), find = debtor_billing_list.find(where => where.id === value);

                    if (!!find && isPlainObject(find)) {

                        debtor_billing_list = debtor_billing_list.map(e => (delete e.display_value, { ...e }))
                        const { ShopCustomerDebtBillingNoteLists, doc_date, debt_due_date, status, bus_customer_id, per_customer_id, ShopBusinessCustomer, ShopPersonalCustomer, details } = find,
                            customer_type = !!bus_customer_id ? "business" : "person",
                            customer_list = customer_type === "business" ? [ShopBusinessCustomer].map(e => ({ ...e, customer_full_name: `${e.customer_name[locale.locale] ?? "-"}` })) :
                                [ShopPersonalCustomer].map(e => ({ ...e, customer_full_name: `${e.customer_name.first_name[locale.locale] ?? "-"} ${e.customer_name.last_name[locale.locale] ?? ""}` }));

                        form.setFieldsValue({
                            ...find,
                            customer_type,
                            customer_list,
                            customer_id: bus_customer_id ?? per_customer_id,
                            doc_date: moment(doc_date),
                            debt_due_date: moment(debt_due_date),
                            status: mode === "add" ? `${status}` : status,
                            shopPartnerDebtLists: ShopCustomerDebtBillingNoteLists,
                            remark: details?.remark,
                            remark_inside: details?.remark_inside,
                            debt_price_paid_total: null,
                            debtor_billing_list
                        })
                    }

                    break;

                default:
                    break;

            }
            setLoadingDebtorBilling(false)
        } catch (error) {
            console.log('error :>> ', error);
        }
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
                        label="ระยะเวลาชำระ"
                    >
                        <InputNumber disabled className='ant-input-number-with-addon-after' stringMode min={0} precision={0} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} addonAfter={`วัน`} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_approval_balance"
                        label="วงเงินอนุมัติ"
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
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="tax_type_id"
                        label={`ประเภทภาษี`}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view" || disabledWhenDeliveryDocActive}
                            onSelect={() => calculateResult()}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="tax_type_id"
                        label="อัตราภาษี (%)"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="status"
                        label="สถานะ"
                    >
                        <Select style={{ width: "100%" }} disabled>
                            <Select.Option value={mode === "add" ? "0" : 0}>ลบเอกสาร</Select.Option>
                            <Select.Option value={mode === "add" ? "1" : 1}>ใช้งานเอกสาร</Select.Option>
                            <Select.Option value={mode === "add" ? "2" : 2}>ยกเลิกเอกสาร</Select.Option>
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
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelBusinessPartnersDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <BusinessPartnersData title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackBusinessPartnersData} />
            </Modal>
            <Modal
                maskClosable={false}
                open={isShopPartnerDebtBillAcceptanceDocModalVisible}
                onCancel={handleCancelShopPartnerDebtBillAcceptanceDocModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelShopPartnerDebtBillAcceptanceDocModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <ShopPartnerDebtBillAcceptanceDoc title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackShopPartnerDebtBillAcceptanceDoc} />
            </Modal>
        </>

    )
}

export default FormTemporaryDeliveryOrderDoc