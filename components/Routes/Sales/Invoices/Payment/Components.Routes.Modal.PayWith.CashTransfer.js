import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Row, Col, Select, Switch, DatePicker, message, InputNumber } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import FormSelectLanguage from '../../../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../../../shares/FormLanguage/FormInputLanguage'
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import API from '../../../../../util/Api'
import { debounce, isFunction, isNumber, isPlainObject } from 'lodash';
import { RoundingNumber, NoRoundingNumber } from '../../../../shares/ConvertToCurrency';
import Swal from 'sweetalert2';
import moment from 'moment';
import BankAccountData from '../../../../../routes/MyData/BankAccountData'

const ComponentsPayWithCashTransfer = ({ icon, textButton, disabled, initForm, total = 0, callback, loading, isPartialPayment = false }) => {

    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { customerList } = useSelector(({ servicePlans }) => servicePlans);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [isBankAccountDataModalVisible, setIsBankAccountDataModalVisible] = useState(false);

    const [form] = Form.useForm()
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        form.setFieldsValue(
            {
                price_grand_total: total,
                transfer_type: "none",
                payment_paid_date: moment(Date.now())
            }
        )
        const formData = initForm.getFieldValue(), customerData = formData[!!formData["ShopPersonalCustomer"] ? "ShopPersonalCustomer" : "ShopBusinessCustomer"], isPersonal = !!formData["ShopPersonalCustomer"] ? true : false

        if (!!customerData) {
            form.setFieldsValue({ transferor_name: isPersonal ? `${customerData.customer_name?.first_name[locale.locale] ?? "-"} ${customerData.customer_name?.last_name[locale.locale] ?? ""}` : customerData.customer_name[locale.locale] })
        }
        if (customerList !== null && customerList !== undefined && customerList.length > 0) {
            // console.log("customerList",customerList)
            form.setFieldsValue({ transferor_name: customerList[0].customer_name[locale.locale] })
        }
    }, [isModalVisible])

    const [disablePaymentBtn, setDisablePaymentBtn] = useState(true);
    const [checkCash, setCheckCash] = useState("")
    const handleOk = () => {
        form.submit()
    }

    useEffect(() => {
        const formData = initForm.getFieldValue(), customerData = formData[!!formData["ShopPersonalCustomer"] ? "ShopPersonalCustomer" : "ShopBusinessCustomer"], isPersonal = !!formData["ShopPersonalCustomer"] ? true : false

        if (!!customerData) {
            form.setFieldsValue({ transferor_name: isPersonal ? `${customerData.customer_name?.first_name[locale.locale] ?? "-"} ${customerData.customer_name?.last_name[locale.locale] ?? ""}` : customerData.customer_name[locale.locale] })
        }
        if (customerList !== null && customerList !== undefined && customerList.length > 0) {
            // console.log("customerList",customerList)
            form.setFieldsValue({ transferor_name: customerList[0].customer_name[locale.locale] })
        }
    }, [customerList])

    const handleCancel = () => {
        form.resetFields()
        setDisablePaymentBtn(() => true)
        setIsModalVisible(() => false)
    }

    const onFinish = async (value) => {
        try {
            let change = (value.price_grand_total - value.cash).toLocaleString(undefined, { maximumFractionDigits: 2 })
            let change_note = ""
            let cash = value.cash

            if ((+change) < 1 && (+change) > -1) {
                change_note = (+change) > 0 ? "ชำระขาดไป " + change : (+change) < 0 ? "ชำระเกินไป " + change : ""
                cash = value.price_grand_total
            }

            const model = {
                payment_price_paid: cash,
                bank_id: value.bank_id ?? null,
                details: {
                    change: change_note !== "" ? change : "",
                    change_note: change_note,
                    remark: null,
                    transferor_name: value.transferor_name ?? null,
                    transfer_type: value.transfer_type ?? null,
                    my_bank_account_id: value.my_bank_account_id ?? null,
                    my_bank_account_name: value.my_bank_account_name ?? null,
                },
                payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                // change: value.change
            }
            // console.log('model', model)

            let isNegativeNumber = false, is_partial_payment = false

            if ((change < -1 || change > 1) && !isPartialPayment) {
                Swal.fire({
                    title: GetIntlMessages("warning ?"),
                    text: "ยอดชำระไม่ตรงกัน หรือ ยอดชำระต่างกันมากกว่า 1 บาท",
                    icon: 'warning',
                    confirmButtonColor: mainColor,
                    confirmButtonText: GetIntlMessages("submit"),
                })
                // form.setFieldsValue({ cash: null })
                setDisablePaymentBtn(true)

            } else {
                Swal.fire({
                    title: GetIntlMessages(isPartialPayment ? "ยืนยันการเพิ่มรายการชำระหรือไม่ ?" : "ยืนยันการชำระหรือไม่ ?"),
                    // text: "You won't be able to revert this!",
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: mainColor,
                    confirmButtonText: GetIntlMessages("submit"),
                    cancelButtonText: GetIntlMessages("cancel")
                }).then(async ({ isConfirmed }) => {
                    if (isConfirmed) {
                        // res = await API.post(`/shopPaymentTransaction/add`, model)
                        // res ={data :{status : "success"}}
                        if (isFunction(callback)) callback(3, model, isPartialPayment)
                        handleCancel()
                    }
                })
            }






            // if (RoundingNumber(+replaceAllComma(value.cash)) < RoundingNumber(total)) {
            //     Swal.fire(GetIntlMessages("warning"), "ยอดชำระไม่ถูกต้อง", "warning")
            // } else {
            //     if (!!value.cash) {
            //         const typeNumberChange = Number(model.cash.replaceAll(",", ""))
            //         if (Math.sign(typeNumberChange) == -1) isNegativeNumber = true
            //         if (isNegativeNumber == true) {
            //             Swal.fire(GetIntlMessages("warning"), "จำนวนติดลบ", "warning")
            //             form.setFieldsValue({ cash: null })
            //             console.log("sss", total)
            //             console.log("sss", value.cash)

            //         } else {
            //             // console.log('permission_obj :>> ', permission_obj);

            //             const { status } = initForm.getFieldValue()

            //             // console.log('status :>> ', status);

            //             switch (status) {
            //                 case "2":
            //                     Swal.fire({
            //                         title: GetIntlMessages("ต้องการพิมพ์ ใบเสร็จรับเงิน/ใบกำกับภาษี ด้วยหรือไม่ ?"),
            //                         // text: "You won't be able to revert this!",
            //                         icon: 'question',
            //                         showCancelButton: true,
            //                         showDenyButton: true,
            //                         confirmButtonColor: mainColor,
            //                         denyButtonColor: '#d33',
            //                         confirmButtonText: GetIntlMessages("print"),
            //                         denyButtonText: GetIntlMessages("ไม่พิมพ์"),
            //                         cancelButtonText: GetIntlMessages("cancel")
            //                     }).then(async (result) => {
            //                         if (result.isConfirmed) {
            //                             if (isFunction(callback)) callback(3, model, true)
            //                             handleCancel()
            //                         } else if (result.isDenied) {
            //                             if (isFunction(callback)) callback(3, model, false)
            //                             handleCancel()
            //                         }
            //                     })

            //                     break;
            //                 case "3":
            //                     if (isFunction(callback)) callback(3, model)
            //                     handleCancel()
            //                     break;

            //                 default:
            //                     break;
            //             }


            //         }
            //     }
            // }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            // console.log('error :>> ', error);
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
    const replaceAllComma = (commaValue) => {
        if (commaValue && commaValue.length > 0) {
            return commaValue.replaceAll(",", "")
        } else {
            return 0
        }
    }
    // const debounceCash = debounce((value, type) => handleChangeOrBlurCash(value, type), 800)
    const handleChangeOrBlurCash = (value, type) => {
        try {
            console.log('value :>> ', value);
            const { cash } = form.getFieldValue()
            setCheckCash(cash)

            const checkValue = value.match(new RegExp(/^(?!,$)[\d,.]+$/))

            switch (type) {
                case "change":
                    if (!!value && value == 0) setDisablePaymentBtn(true)
                    break;
                case "blur":
                    if (value && value.length > 0) {
                        let isNegativeNumber = false
                        const newValue = Number(value.replaceAll(",", ""))
                        if (Math.sign(newValue) == -1) isNegativeNumber = true

                        if (isNegativeNumber == true) {
                            cash = null
                            Swal.fire(GetIntlMessages("warning"), "จำนวนที่ท่านใส่เป็นจำนวนติดลบ !!", "warning")
                        } else {
                            cash = NoRoundingNumber(value)
                        }
                    } else {
                    }
                    break;

                default:
                    break;
            }

            form.setFieldsValue({ cash })

        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const checkPrice = (_, value) => {
        // console.log("asdf", value)
        const { cash } = form.getFieldValue()
        if (value && value.length > 0) {
            const pattern = _.type === "pattern" ? _?.pattern : ""
            const checkValue = value.match(new RegExp(pattern))
            if (checkValue === null || checkValue == 0) {
                setDisablePaymentBtn(true)
                return Promise.reject(new Error(`${_?.message}`));
            } else {
                setDisablePaymentBtn(false)
                return Promise.resolve();
            }
        }

        form.setFieldsValue({ cash })

    }


    const formatNumber = (val, isUseDecimals = true) => {
        try {
            if (isUseDecimals) {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            } else {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }

        } catch (error) {

        }
    }

    const handleCancelBankAccountDataModal = () => {
        try {
            setIsBankAccountDataModalVisible(false)
        } catch (error) {

        }
    }
    const callbackBankAccout = (data) => {
        setIsBankAccountDataModalVisible(false)
        // console.log("callback", data)
        form.setFieldsValue({
            my_bank_account_id: data.id,
            my_bank_account_name: data.account_name.th,
        });
    }

    return (
        <>
            <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon ${disabled ? "img-opacity-05" : ""}`} src={icon} />}
                <span className='pt-1'>{textButton}</span>
            </Button>

            <Modal
                maskClosable={false}
                title={`โอนเงินสด`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                // style={{ top: 20 }}
                // okButtonProps={{ disabled: configModal.mode == "view" }}
                className={`cash-modal`}
                hideSubmitButton
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    style={{ padding: "0 8%" }}
                    labelCol={{ xxl: { span: 24, offset: 0 }, lg: { span: 20, offset: 2 } }}
                    wrapperCol={{ xxl: { span: 24, offset: 0 }, lg: { span: 20, offset: 2 } }}
                >

                    <Row gutter={[30, 10]}>
                        <Col span={24}>
                            <div style={{ display: "flex", justifyContent: "center", fontSize: "24px", color: mainColor, paddingBottom: "12px" }} span={24}>
                                {GetIntlMessages("จำนวนเงินรวมที่ต้องชำระ")}
                            </div>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name="price_grand_total"
                            >
                                <InputNumber stringMode readOnly style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                    formatter={(value) => !!value ? formatNumber(value, true) : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                                {/* <Input disabled={loading} value={RoundingNumber(total)} readOnly style={{ fontSize: "24px", textAlign: "end" }} /> */}
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                label={GetIntlMessages("จำนวนเงินที่รับชำระ")}
                                name="cash"
                                rules={[{ pattern: /^(?!,$)[\d,.]+$/, required: true, message: GetIntlMessages("ตัวเลขเท่านั้น !!"), validator: checkPrice }]}
                            >
                                <InputNumber stringMode style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onChange={(value) => handleChangeOrBlurCash(value, 'change')}
                                    min={0}
                                />
                                {/* <Input disabled={loading} addonAfter={`บาท`} style={{ textAlign: "end" }} onChange={(value) => handleChangeOrBlurCash(value.target.value, 'change')} onBlur={(value) => handleChangeOrBlurCash(value.target.value, 'blur')} /> */}
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                rules={[{ required: true }]}
                                label={GetIntlMessages("ชื่อผู้โอน")}
                                name="transferor_name"
                            >
                                <Input disabled={loading} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item
                                name='my_bank_account_id'
                                label={GetIntlMessages("บัญชีที่รับเงิน")}
                                hidden
                            >
                                <Input hidden />
                            </Form.Item>
                            <Form.Item
                                name='my_bank_account_name'
                                label={GetIntlMessages("บัญชีที่รับเงิน")}
                            >
                                <Input disabled addonAfter={
                                    <Button
                                        type='text'
                                        size='small'
                                        style={{ border: 0 }}
                                        onClick={() => setIsBankAccountDataModalVisible(true)}
                                    >
                                        เลือก
                                    </Button>
                                } />
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item
                                rules={[{ required: false }]}
                                label={GetIntlMessages("รูปแบบการโอน")}
                                name="transfer_type"
                            >
                                <Select
                                    style={{ width: "100%" }}
                                    options={[
                                        { value: 'none', label: 'ไม่ระบุ' },
                                        { value: 'tranfer', label: 'โอนผ่านเลขบัญชี' },
                                        { value: 'qrcode', label: 'QR Code' },
                                    ]}
                                />
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

                    </Row>

                    <Col span={24}>
                        <Row>
                            <Col xxl={{ span: 8, offset: 4 }} lg={{ span: 10, offset: 2 }} md={12} sm={24} xs={24}>
                                <div className={`pay-box`}>
                                    <Button disabled={disablePaymentBtn} loading={loading} type='primary' onClick={() => form.submit()} className={`pay-btn`}>{isPartialPayment ? `ยืนยัน` : `รับชำระ`}</Button>
                                </div>
                            </Col>
                            <Col xl={8} lg={10} md={12} sm={24} xs={24}>
                                <div className={`pay-box`}>
                                    <Button loading={loading} type='secondary' onClick={() => handleCancel()} className={`pay-btn`}>ปิด</Button>
                                </div>
                            </Col>
                        </Row>
                    </Col>

                </Form>
            </Modal>
            <Modal
                maskClosable={false}
                open={isBankAccountDataModalVisible}
                onCancel={handleCancelBankAccountDataModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelBankAccountDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <BankAccountData title="จัดการข้อมูลบัญชีธนาคาร" callBack={callbackBankAccout} />
            </Modal>
            {/* <style global>{`
                .ant-form-item{
                    width : 100%;
                    display : flex;
                    justify-content: center;
                }
            `}</style> */}
        </>
    )
}

export default ComponentsPayWithCashTransfer