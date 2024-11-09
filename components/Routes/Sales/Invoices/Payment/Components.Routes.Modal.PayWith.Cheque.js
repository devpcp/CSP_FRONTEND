import React from 'react';
import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Row, Col, Select, Switch, message, DatePicker, InputNumber } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import FormSelectLanguage from '../../../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../../../shares/FormLanguage/FormInputLanguage'
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import RegexMultiPattern from '../../../../shares/RegexMultiPattern';
import API from '../../../../../util/Api'
import { isFunction, isPlainObject } from 'lodash';
import { RoundingNumber } from '../../../../shares/ConvertToCurrency';
import moment from 'moment';
import Swal from 'sweetalert2';
import ChequeData from '../../../../../routes/MyData/ChequeData';

const ComponentsPayWithCheque = ({ icon, textButton, initForm, total, callback, loading, disabled }) => {

    const { bankNameList } = useSelector(({ master }) => master);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const [form] = Form.useForm()
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isChequeDataModalVisible, setIsChequeDataModalVisible] = useState(false);

    const handleOk = () => {
        form.submit()
    }


    useEffect(() => {
        form.setFieldsValue(
            {
                price_grand_total: total,
                payment_paid_date: moment(Date.now()),
            }
        )
    }, [isModalVisible])

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log('value', value)
            const model = {
                bank_name_list_id: value.bank_name_list_id ?? null,
                // doc_date : moment(new Date()).format("YYYY-MM-DD"),
                payment_price_paid: value?.payment_price_paid ?? "0.00",
                details: {
                    remark: value.remark ?? null,
                    received_payment_account: value.received_payment_account ?? null,
                    bank_branch: value.bank_branch ?? null,
                    cheque_number: value.cheque_number ?? null,
                    cheque_date: moment(value.cheque_date).format("YYYY-MM-DD") ?? null,
                    cheque_received_date: moment(value.cheque_received_date).format("YYYY-MM-DD") ?? null,
                    cheque_id: value.cheque_id ?? null,
                    check_amount: value.check_amount ?? "0.00",
                    cheque_amount_remaining: value.cheque_amount_remaining ?? "0.00"
                },
                payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
            }
            let change = Number(value?.payment_price_paid) - Number(total)
            if (change < -1 || change > 1) {
                Swal.fire('ยอดเงินไม่ตรงที่ต้องชำระ!!', '', 'warning')
                // form.setFieldValue("payment_price_paid", null)
            } else {
                Swal.fire({
                    title: GetIntlMessages("ยืนยันการชำระหรือไม่ ?"),
                    // title: GetIntlMessages(isPartialPayment ? "ยืนยันการเพิ่มรายการชำระหรือไม่ ?" :"ยืนยันการชำระหรือไม่ ?" ),
                    // text: "You won't be able to revert this!",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: mainColor,
                    confirmButtonText: GetIntlMessages("submit"),
                    cancelButtonText: GetIntlMessages("cancel")
                }).then(async ({ isConfirmed }) => {
                    if (isConfirmed) {
                        if (isFunction(callback)) {
                            // console.log('model :>> ', model);
                            callback(4, model, false)
                        }
                    }
                })
            }



            // console.log('model', model)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const formItemLayout = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 },
            xxl: { span: 6 }
        },
        wrapperCol: {
            xs: { span: 24 },
            xxl: { span: 18 }
        }
    }
    const formItemLayoutSpecify = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 },
            xxl: { span: 4 }
        },
        wrapperCol: {
            xs: { span: 24 },
            xxl: { span: 20 }
        }
    }
    const formItemLayoutNote = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 },
            // xxl: { span: 2 }
        },
        wrapperCol: {
            xs: { span: 24 },
            // xxl: { span: 22 }
        }
    }
    const handleCancelChequeDataModal = () => {
        try {
            setIsChequeDataModalVisible(false)
        } catch (error) {

        }
    }
    const callbackCheque = (data) => {
        setIsChequeDataModalVisible(false)
        console.log("callback", data)
        form.setFieldsValue({
            cheque_id: data.id,
            cheque_no: data.check_no,
            bank_name_list_id: data.bank_id,
            bank_branch: data.check_branch,
            received_payment_account: data.details.shop_bank_name,
            cheque_number: data.check_no,
            cheque_date: moment(new Date(data.check_date), "YYYY-MM-DD"),
            cheque_received_date: moment(new Date(data.check_receive_date), "YYYY-MM-DD"),
            payment_price_paid: data.check_amount,
            check_amount: data.check_amount,
            cheque_amount_remaining: data.details.cheque_amount_remaining

        });
    }

    // console.log('initForm.getFieldValue() :>> ', initForm.getFieldValue());
    return (
        <>
            <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon`} src={icon} />}
                {textButton}
            </Button>

            <Modal
                maskClosable={false}
                title={`เลือกรายการชำระเช็ค`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                // okButtonProps={{ disabled: configModal.mode == "view" }}
                className={`cash-modal`}
                hideSubmitButton
                footer={null}
            >
                <Form
                    form={form}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    initialValues={{ customer_id: initForm.getFieldValue("bus_customer_id") ?? initForm.getFieldValue("per_customer_id") }}
                >
                    <Row gutter={[0, 0]}>
                        {/* <div className='detail-before-table'> */}



                        <Col span={24}>
                            <div className={`custom-ant-item-total-price`}>
                                {GetIntlMessages(`จํานวนเงินที่ต้องชำระ(ไม่เกิน) : ${RoundingNumber(total)} บาท`)}
                            </div>
                        </Col>
                        <div style={{ height: "30px" }} hidden>
                            <Col span={12}>
                                <FormSelectLanguage config={{
                                    form,
                                    field: ["type_name"],
                                    disabled: false
                                }} onChange={(value) => setFormLocale(value)} />
                            </Col>
                        </div>

                        <Row gutter={[30, 10]} style={{ padding: "30px" }}>
                            <Col xs={12}>
                                <Form.Item
                                    name='cheque_id'
                                    label={GetIntlMessages("บัญชีที่รับเงิน")}
                                    hidden
                                >
                                    <Input hidden />
                                </Form.Item>
                                <Form.Item
                                    name='cheque_amount_remaining'
                                    label={GetIntlMessages("บัญชีที่รับเงิน")}
                                    hidden
                                >
                                    <Input hidden />
                                </Form.Item>
                                <Form.Item
                                    name='cheque_no'
                                    label={GetIntlMessages("เลขที่เช็ค")}
                                >
                                    <Input disabled addonAfter={
                                        <Button
                                            type='text'
                                            size='small'
                                            style={{ border: 0 }}
                                            onClick={() => setIsChequeDataModalVisible(true)}
                                        >
                                            เลือก
                                        </Button>
                                    } />
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item
                                    rules={[{ required: true }]}
                                    label={GetIntlMessages("วันเวลารับชำระ")}
                                    name="payment_paid_date"
                                >
                                    <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY HH:mm"} showTime={{ format: 'HH:mm' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayoutSpecify}
                                    name='customer_id'
                                    label={GetIntlMessages("ลูกค้า")}
                                    rules={[RegexMultiPattern()]}
                                >
                                    <Select disabled>
                                        {[initForm.getFieldValue(!!initForm.getFieldValue("bus_customer_id") ? "ShopBusinessCustomer" : "ShopPersonalCustomer")].map((e, index) => (<Select.Option key={`customer-${index}-${e?.id}`} value={e?.id}>{!!initForm.getFieldValue("bus_customer_id") ? e?.customer_name?.[locale.locale] : `${e?.customer_name?.first_name?.[locale.locale]} ${e?.customer_name?.last_name?.[locale.locale]}`}</Select.Option>))}
                                    </Select>
                                    {/* <Input disabled /> */}
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='bank_name_list_id'
                                    // {...formItemLayout}
                                    label={GetIntlMessages("เช็คธนาคาร")}
                                    rules={[RegexMultiPattern()]}
                                >
                                    <Select disabled dropdownMatchSelectWidth={false}>
                                        {bankNameList.map((e, index) => (<Select.Option key={`bank-${index}-${e.id}`} value={e.id}>{e.bank_name[locale.locale]}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayout}
                                    name='bank_branch'
                                    label={GetIntlMessages("สาขา")}
                                    rules={[RegexMultiPattern()]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='received_payment_account'
                                    // {...formItemLayoutSpecify}
                                    label={GetIntlMessages("เข้าบัญชี")}
                                    rules={[RegexMultiPattern()]}
                                >
                                    {/* <Select dropdownMatchSelectWidth={false}>
                                        {bankNameList.map((e, index) => (<Select.Option key={`bank-${index}-${e.id}`} value={e.id}>{e.bank_name[locale.locale]}</Select.Option>))}
                                    </Select> */}
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayout}
                                    name='cheque_number'
                                    label={GetIntlMessages("เลขที่เช็ค")}
                                    // rules={[{ required: true }]}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayout}
                                    name='cheque_date'
                                    label={GetIntlMessages("วันที่เช็ค")}
                                    // rules={[{ required: true }]}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <DatePicker disabled format={"DD/MM/YYYY"} style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayout}
                                    name='cheque_received_date'
                                    label={GetIntlMessages("วันที่รับเช็ค")}
                                    // rules={[{ required: true }]}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    {/* <Input /> */}
                                    <DatePicker disabled format={"DD/MM/YYYY"} style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name='check_amount'
                                    label={GetIntlMessages("จำนวนเงินหน้าเช็ค")}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <InputNumber disabled stringMode min={0} precision={2} style={{ width: "100%" }} step="0.01"

                                        formatter={(value) => !!value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    // {...formItemLayout}
                                    name='payment_price_paid'
                                    label={GetIntlMessages("จำนวนเงินที่ชำระ")}
                                    validateTrigger={['onChange', 'onBlur']}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <InputNumber
                                        stringMode min={0}
                                        precision={2}
                                        style={{ width: "100%" }}
                                        step="0.01"
                                        formatter={(value) => !!value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        max={form.getFieldValue().cheque_amount_remaining ?? form.getFieldValue().check_amount}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    // {...formItemLayoutSpecify}
                                    label={GetIntlMessages("หมายเหตุ")}
                                    // rules={[{ required: true }]}
                                    name="remark"
                                >
                                    <Input.TextArea rows={3} />
                                </Form.Item>
                                {/* <FormInputLanguage importedComponentsLayouts={formItemLayoutNote} icon={formLocale} label={GetIntlMessages("หมายเหตุ")} name="remark" isTextArea /> */}
                            </Col>

                        </Row>


                        {/* </div> */}
                        <Col span={24}>
                            <Row>
                                <Col xxl={{ span: 8, offset: 4 }} lg={{ span: 10, offset: 2 }} md={12} sm={24} xs={24}>
                                    <div className={`pay-box`}>
                                        <Button type='primary' onClick={() => form.submit()} className={`pay-btn`}>รับชำระ</Button>
                                    </div>
                                </Col>
                                <Col xxl={{ span: 8, offset: 4 }} lg={{ span: 10, offset: 2 }} md={12} sm={24} xs={24}>
                                    <div>
                                        <Button onClick={() => handleCancel()} className={`pay-btn`}>ปิด</Button>
                                    </div>
                                </Col>
                            </Row>
                            {/* <div className={`pay-box`}>
                                <Button type='primary' onClick={() => form.submit()} className={`pay-btn`}>ยืนยัน</Button>
                            </div> */}
                        </Col>
                    </Row>

                </Form>
            </Modal>
            <Modal
                maskClosable={false}
                open={isChequeDataModalVisible}
                onCancel={handleCancelChequeDataModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelChequeDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <ChequeData title="จัดการข้อมูลเช็ค" callBack={callbackCheque} />
            </Modal>
            {/* <style global>{`
            
            .detail-before-table{
                overflow-x : hidden;
                width : 100%;
            }
            .custom-ant-item-total-price{
                text-align : left;
                margin-bottom : 10px;
            }
            
            `}</style> */}
        </>
    )
}

export default ComponentsPayWithCheque