import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Row, Col, Select, Switch, message, DatePicker, InputNumber } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import FormSelectLanguage from '../../../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../../../shares/FormLanguage/FormInputLanguage'
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import API from '../../../../../util/Api'
import { isFunction, isPlainObject, get, debounce, isNumber } from 'lodash';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import { RoundingNumber, NoRoundingNumber, takeOutComma } from '../../../../shares/ConvertToCurrency';
import Swal from 'sweetalert2';
import moment from 'moment';

const ComponentsPayWithCreditCard = ({ icon, textButton, disabled, initForm, total = 0, callback, loading, isPartialPayment = false }) => {

    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const [form] = Form.useForm()
    const [isModalVisible, setIsModalVisible] = useState(false);

    const [payMethodListAll, setPayMethodListAll] = useState([]);
    const [creditDebitTypeListAll, setCreditDebitTypeListAll] = useState([]);
    const [bankListAll, setBankListAll] = useState([]);
    const [checkCash, setCheckCash] = useState("")
    const [disablePaymentBtn, setDisablePaymentBtn] = useState(true);

    useEffect(() => {
        form.setFieldsValue(
            {
                price_grand_total: total,
                payment_paid_date: moment(Date.now()),
            }
        )
    }, [isModalVisible])

    useEffect(async () => {
        const promise1 = getCreditDebitPayMethodListAll()
        const promise2 = getCreditDebitTypeListAll()
        const promise3 = getBankListAll()

        const [values1, values2, values3] = await Promise.all([promise1, promise2, promise3])
        setPayMethodListAll(() => values1)
        setCreditDebitTypeListAll(() => values2)
        setBankListAll(() => values3)
    }, [])


    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setDisablePaymentBtn(() => true)
        setIsModalVisible(() => false)
    }

    const onFinish = async (value) => {
        try {
            console.log('value', value)
            // 73c99e3a-8266-480d-a3d0-3c989154cd7f - payment_method_id -> จ่ายเต็มจำนวน
            // let cash = takeOutComma(value.cash),  payment_price_paid = value.price_grand_total; 
            let payment_price_paid = takeOutComma(value.cash);
            const model = {
                // cash: value.cash,
                payment_price_paid,
                bank_name_list_id: value.bank_id ?? null,

                details: {
                    payment_method_id: value.payment_method_id ?? null,
                    payment_method_text: null,
                    card_type_id: value.card_type_id ?? null,
                    card_type_text: null,
                    remark: value.remark ?? null,
                    card_4_end_code: value.card_4_end_code ?? null,
                },
                payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                // change: value.change
            }
            model.details.card_type_text = creditDebitTypeListAll.find(where => where.id === value.card_type_id)?.name
            model.details.payment_method_text = payMethodListAll.find(where => where.id === value.payment_method_id)?.name
            model.details.bank_name = bankListAll.find(where => where.id === value.bank_id)?.bank_name
            console.log('model :>> ', model);

            let isNegativeNumber = false, isValid = true;
            if ((Number(payment_price_paid) !== Number(value.price_grand_total) && isPartialPayment === false)) {
                Swal.fire({ title: GetIntlMessages("warning"), text: "จำนวนเงินที่ชำระไม่เพียงพอ", icon: "warning", confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                form.setFieldsValue({ cash: null })
                setDisablePaymentBtn(true)
                isValid = false
            }
            // switch (value.payment_method_id) {
            //     case "73c99e3a-8266-480d-a3d0-3c989154cd7f":
            //         if(Number(cash) !== Number(value.price_grand_total)) {
            //             Swal.fire({title : GetIntlMessages("warning"), text : "จำนวนเงินที่ชำระไม่เพียงพอ", icon :"warning" ,confirmButtonText : GetIntlMessages("submit") , confirmButtonColor : mainColor})
            //             form.setFieldsValue({ cash: null})
            //             setDisablePaymentBtn(true)
            //             isValid = false
            //         }
            //         break;

            //     default: 
            //     isValid = true
            //         break;
            // }

            if (isValid === true) {
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
                        if (isFunction(callback)) callback(2, model, isPartialPayment)
                        handleCancel()
                    }
                })
            }




            // model.card_type_text = creditDebitTypeListAll.find(where => where.id === value.card_type_id)?.name
            // model.payment_method_text = payMethodListAll.find(where => where.id === value.payment_method_id)?.name
            // model.bank_name = bankListAll.find(where => where.id === value.bank_id)?.bank_name
            // console.log('total', RoundingNumber(total))
            // console.log('value.cash', RoundingNumber(+replaceAllComma(value.cash)))
            // let isNegativeNumber = false
            // if (RoundingNumber(+replaceAllComma(value.cash)) < RoundingNumber(total)) {
            //     Swal.fire(GetIntlMessages("warning"), "ยอดชำระไม่ถูกต้อง", "warning")
            // } else {
            //     if (!!value.cash) {
            //         const typeNumberChange = Number(model.cash.replaceAll(",", ""))
            //         if (Math.sign(typeNumberChange) == -1) isNegativeNumber = true
            //         if (isNegativeNumber == true) {
            //             Swal.fire(GetIntlMessages("warning"), "จำนวนติดลบ", "warning")
            //             form.setFieldsValue({ cash: null })
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
            //                             if (isFunction(callback)) callback(2, model, true)
            //                             handleCancel()
            //                         } else if (result.isDenied) {
            //                             if (isFunction(callback)) callback(2, model, false)
            //                             handleCancel()
            //                         }
            //                     })

            //                     break;
            //                 case "3":
            //                     if (isFunction(callback)) callback(2, model)
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
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const formItemLayout = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 }
        },
        wrapperCol: {
            xs: { span: 24 }
        }
    }

    const getCreditDebitPayMethodListAll = async () => {
        const { data } = {
            "data": {
                "status": "success",
                "data": [
                    {
                        "id": "73c99e3a-8266-480d-a3d0-3c989154cd7f",
                        "name": {
                            "th": "เต็มจำนวน",
                            "en": "เต็มจำนวน"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "dff4ba51-7356-4228-97af-ba7d51dee60a",
                        "name": {
                            "th": "ผ่อน 3 เดือน",
                            "en": "ผ่อน 3 เดือน"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "f7f1eb08-0d14-40c5-9e20-c833cd43117c",
                        "name": {
                            "th": "ผ่อน 6 เดือน",
                            "en": "ผ่อน 6 เดือน"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "fd39b90c-9692-4622-97f9-6943e9f16cf0",
                        "name": {
                            "th": "ผ่อน 10 เดือน",
                            "en": "ผ่อน 10 เดือน"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "cd68844e-790d-4ca3-a508-375da3b5fe42",
                        "name": {
                            "th": "อื่น ๆ",
                            "en": "อื่น ๆ"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                ]
            }
        }
        // setPayMethodListAll(()=> data.data)
        return data.data
    }

    const getCreditDebitTypeListAll = async () => {
        const { data } = {
            "data": {
                "status": "success",
                "data": [
                    {
                        "id": "5770864a-8e0b-4245-b146-c9640de471c2",
                        "name": {
                            "th": "VISA",
                            "en": "VISA"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "4619c611-1184-4f7c-9270-b15a28cfccc4",
                        "name": {
                            "th": "MASTERCARD",
                            "en": "MASTERCARD"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "98a897cf-02c4-464e-8417-94b7575b1234",
                        "name": {
                            "th": "UNIONPAY",
                            "en": "UNIONPAY"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "f70ec864-ae9a-4ccb-b0a3-eb40b7042a83",
                        "name": {
                            "th": "อื่น ๆ",
                            "en": "อื่น ๆ"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                ]
            }
        }
        // setCreditDebitTypeListAll(()=>data.data)
        return data.data
    }

    const getBankListAll = async () => {
        const { data } = await API.get(`/master/bankNameList/all?sort=bank_name.th&order=asc&limit=99`);
        // console.log('data.data :>> ', data.data);
        return data.data.data
    }
    const replaceAllComma = (commaValue) => {
        if (commaValue && commaValue.length > 0) {
            return commaValue.replaceAll(",", "")
        } else {
            return 0
        }
    }
    const debounceCash = debounce((value, type) => handleChangeOrBlurCash(value, type), 800)
    const handleChangeOrBlurCash = (value, type) => {
        try {
            const { cash } = form.getFieldValue()
            setCheckCash(cash)

            const checkValue = value.match(new RegExp(/^(?!,$)[\d,.]+$/))

            switch (type) {
                case "change":
                    if (checkValue === null) {
                    } else {
                        if (value && value.length > 0) {
                            const result = Number(replaceAllComma(NoRoundingNumber(value))) - Number(replaceAllComma(NoRoundingNumber(total)))

                        } else {
                        }
                    }
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
        console.log("asdf", value)
        const { cash } = form.getFieldValue()
        if (value && value.length > 0) {
            const pattern = _.type === "pattern" ? _?.pattern : ""
            const checkValue = value.match(new RegExp(pattern))
            if (checkValue === null) {
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

    return (
        <>
            <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon ${disabled ? "img-opacity-05" : ""}`} src={icon} />}
                <span className='pt-1'>{textButton}</span>
            </Button>

            <Modal
                maskClosable={false}
                title={`บัตรเครดิต/เดบิตการ์ด`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
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

                >

                    <Row gutter={[0, 0]}>
                        <Col span={24} hidden>
                            <FormSelectLanguage config={{
                                form,
                                field: ["type_name"],
                                disabled: false
                            }} onChange={(value) => setFormLocale(value)} />
                        </Col>
                        <Col xs={24}>
                            <Row>
                                {/* <Col style={{ display: "flex", justifyContent: "center", fontSize: "24px", color: mainColor, paddingBottom: "12px" }} span={24}>
                                    {GetIntlMessages("จำนวนเงินรวมที่ต้องชำระ")}
                                </Col> */}
                                <Col span={24}>
                                    <Form.Item
                                        name="price_grand_total"
                                        label={(<div style={{ fontSize: "24px", color: mainColor }}>
                                            {GetIntlMessages("จำนวนเงินรวมที่ต้องชำระ")}
                                        </div>)}
                                        labelCol={{ xxl: { span: 12, offset: 6 }, lg: { span: 16, offset: 9 }, sm: { span: 16, offset: 8 }, xs: { span: 20, offset: 4 } }}
                                    >
                                        {/* <Input value={RoundingNumber(total)} readOnly style={{ fontSize: "24px", textAlign: "end" }} /> */}
                                        <InputNumber stringMode readOnly style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                            formatter={(value) => !!value ? formatNumber(value, true) : ""}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                        <Col xs={24}>

                            <Row gutter={[0, 0]}>
                                <Col span={24}>
                                    <Row gutter={[10, 10]}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="bank_id"
                                                label={GetIntlMessages("ธนาคารเจ้าของบัตร")}
                                            // rules={[{ required: true }]}
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {bankListAll.map((e, index) => <Select.Option key={`bank-index` + e.id} value={e.id}>{get(e, `bank_name.${locale.locale}`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                name="card_4_end_code"
                                                label={GetIntlMessages("เลขของบัตร 4 ตัวท้าย")}
                                                rules={[
                                                    { pattern: /^(?!,$)[\d,.]+$/, required: false, message: GetIntlMessages("ตัวเลขเท่านั้น !!") },
                                                    { max: 4, message: GetIntlMessages("กรุณากรอกข้อมูลให้ครบ 4 ตัว !!") },
                                                    { min: 4, message: GetIntlMessages("กรุณากรอกข้อมูลให้ครบ 4 ตัว !!") },
                                                ]}
                                            >
                                                <Input maxLength={4} style={{ textAlign: "end" }}></Input>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={24}>
                                    <Row gutter={[10, 10]}>
                                        <Col span={12}>
                                            <Form.Item
                                                label={GetIntlMessages("รูปแบบการรูดบัตร")}
                                                // rules={[{ required: true }]}
                                                name="payment_method_id"

                                            >
                                                <Select
                                                    allowClear
                                                    showSearch
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {payMethodListAll.map((e, index) => <Select.Option key={`payment-method-index` + e.id} value={e.id}>{get(e, `name.${locale.locale}`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item
                                                label={GetIntlMessages("ชนิดบัตร")}
                                                // rules={[{ required: true }]}
                                                name="card_type_id"
                                            >
                                                <Select
                                                    showSearch
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                >
                                                    {creditDebitTypeListAll.map((e, index) => <Select.Option key={`card-type-index` + e.id} value={e.id}>{get(e, `name.${locale.locale}`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={24}>
                                    <Form.Item
                                        rules={[{ required: true }]}
                                        label={GetIntlMessages("วันเวลารับชำระ")}
                                        name="payment_paid_date"
                                    >
                                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY HH:mm"} showTime={{ format: 'HH:mm' }} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item
                                        label={GetIntlMessages("จำนวนเงินที่รับชำระ")}
                                        name="cash"
                                        rules={[{ pattern: /^(?!,$)[\d,.]+$/, required: true, message: GetIntlMessages("ตัวเลขเท่านั้น !!"), validator: checkPrice }]}
                                    >
                                        <Input autoComplete='new-password' disabled={loading} addonAfter={`บาท`} style={{ textAlign: "end" }} onChange={(value) => handleChangeOrBlurCash(value.target.value, 'change')} onBlur={(value) => handleChangeOrBlurCash(value.target.value, 'blur')} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="remark"
                                label={GetIntlMessages("หมายเหตุ")}
                            >
                                <div className={`custom-ant-item`}>
                                    <Input.TextArea rows={3} />
                                </div>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Row>
                                <Col span={12}>
                                    <div className={`pay-box`}>
                                        <Button disabled={disablePaymentBtn} type='primary' onClick={() => form.submit()} className={`pay-btn`}>{isPartialPayment ? `ยืนยัน` : `รับชำระ`}</Button>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className={`pay-box`}>
                                        <Button loading={loading} type='secondary' onClick={() => handleCancel()} className={`pay-btn`}>ปิด</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                </Form>
            </Modal >

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

export default ComponentsPayWithCreditCard