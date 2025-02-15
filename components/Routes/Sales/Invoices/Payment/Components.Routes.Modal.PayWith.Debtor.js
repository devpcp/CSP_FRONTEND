import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, message, Row, Col, InputNumber, DatePicker } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import { isFunction, isPlainObject } from 'lodash';
import { CloseOutlined } from '@ant-design/icons';
import { RoundingNumber, NoRoundingNumber, takeOutComma } from '../../../../shares/ConvertToCurrency';
import API from '../../../../../util/Api';
import Swal from "sweetalert2";
import CarPreloader from '../../../../_App/CarPreloader';
import moment from 'moment';

const ComponentsPayWithDebtor = ({ icon, textButton, disabled, callback, total = 0, loading, initForm, isPartialPayment = false }) => {

    const [form] = Form.useForm()
    // const form = Form.useFormInstance()
    const [isModalVisible, setIsModalVisible] = useState(false);
    // const [change, setChange] = useState(0)
    const [checkCash, setCheckCash] = useState("")

    const { mainColor } = useSelector(({ settings }) => settings)
    const { permission_obj } = useSelector(({ permission }) => permission)

    useEffect(() => {
        form.setFieldsValue(
            {
                price_grand_total: total,
                cash: (+total).toFixed(2),
                payment_paid_date: moment(Date.now()),
            }
        )
        setDisableSubmitCash(false)
    }, [isModalVisible])

    useEffect(() => {
        if (checkCash && checkCash.length > 0) setDisableSubmitCash(false)
        else setDisableSubmitCash(true)
    }, [checkCash])


    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setCheckCash("")
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log('value', value)
            let cash = takeOutComma(value.cash), change = takeOutComma(value.change)
            let payment_price_paid = isPartialPayment ? value.cash : value.price_grand_total;
            const model = {
                cash,
                remark: value.remark ?? null,
                change,
                payment_price_paid,
                payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
            }

            let isNegativeNumber = false
            // let is_partial_payment = false
            if (!!value.change && value.change.length > 0) {
                if (Math.sign(change) == -1) isNegativeNumber = true
            }

            if (isNegativeNumber === true && !isPartialPayment) {
                Swal.fire(GetIntlMessages("warning"), "เงินทอนติดลบ", "warning")
                form.setFieldsValue({ cash: null, change: null })
                setDisableSubmitCash(true)
                // Swal.fire({
                //     title: GetIntlMessages("จำนวนเงินทอนติดลบท่านต้องการแบ่งจ่าย ใช่หรือไม่ ?"),
                //     // text: "You won't be able to revert this!",
                //     icon: 'question',
                //     showCancelButton: true,
                //     // showDenyButton: true,
                //     confirmButtonColor: mainColor,
                //     // denyButtonColor: '#d33',
                //     confirmButtonText: GetIntlMessages("submit"),
                //     // denyButtonText: GetIntlMessages("ไม่พิมพ์"),
                //     cancelButtonText: GetIntlMessages("cancel")
                // }).then(async (result) => {
                //     if (result.isConfirmed) {
                //         is_partial_payment = true
                //         if (is_partial_payment === true) {
                //             if (isFunction(callback)) callback(1, model, is_partial_payment)
                //             handleCancel()
                //         }
                //     }
                // })
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
                        if (isFunction(callback)) callback(5, model, isPartialPayment)
                        handleCancel()
                    }
                })
                // setIsModalVisible(true)
                // handleCancel()
            }
















            // const model = {
            //     cash: value.cash,
            //     remark: value.remark,
            //     change: value.change
            // }
            // // console.log('model', model)

            // let isNegativeNumber = false

            // if (value.change && value.change.length > 0) {
            //     const typeNumberChange = Number(model.change.replaceAll(",", ""))
            //     if (Math.sign(typeNumberChange) == -1) isNegativeNumber = true
            //     if (isNegativeNumber == true) {
            //         Swal.fire(GetIntlMessages("warning"), "เงินทอนติดลบ", "warning")
            //         form.setFieldsValue({ cash: null, change: null })
            //     } else {
            //         // console.log('permission_obj :>> ', permission_obj);

            //         const { status } = initForm.getFieldValue()

            //         // console.log('status :>> ', status);

            //         switch (status) {
            //             case "2":
            //                 Swal.fire({
            //                     title: GetIntlMessages("ต้องการพิมพ์ ใบเสร็จรับเงิน/ใบกำกับภาษี ด้วยหรือไม่ ?"),
            //                     // text: "You won't be able to revert this!",
            //                     icon: 'question',
            //                     showCancelButton: true,
            //                     showDenyButton: true,
            //                     confirmButtonColor: mainColor,
            //                     denyButtonColor: '#d33',
            //                     confirmButtonText: GetIntlMessages("print"),
            //                     denyButtonText: GetIntlMessages("ไม่พิมพ์"),
            //                     cancelButtonText: GetIntlMessages("cancel")
            //                 }).then(async (result) => {
            //                     if (result.isConfirmed) {
            //                         if (isFunction(callback)) callback(1, model, true)
            //                         handleCancel()
            //                     } else if (result.isDenied) {
            //                         if (isFunction(callback)) callback(1, model, false)
            //                         handleCancel()
            //                     }
            //                 })

            //                 break;
            //             case "3":
            //                 if (isFunction(callback)) callback(1, model)
            //                 handleCancel()
            //                 break;

            //             default:
            //                 break;
            //         }


            //     }
            // }

            // if(value.change === null || value.change == 0) 

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const handleChangeOrBlurCash = (value, type) => {
        try {
            const { cash, change } = form.getFieldValue()
            setCheckCash(cash)
            function replaceAllComma(commaValue) {
                if (commaValue && commaValue.length > 0) {
                    return commaValue.replaceAll(",", "")
                } else {
                    return 0
                }
            }
            const checkValue = value.match(new RegExp(/^(?!,$)[\d,.]+$/))

            switch (type) {
                case "change":
                    if (checkValue === null) {
                        change = null
                    } else {
                        if (value && value.length > 0) {
                            const result = Number(replaceAllComma(NoRoundingNumber(value))) - Number(replaceAllComma(NoRoundingNumber(total)))
                            change = RoundingNumber(result) === null ? "0.00" : RoundingNumber(result)
                        } else {
                            change = null
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
                            change = null
                            Swal.fire(GetIntlMessages("warning"), "จำนวนที่ท่านใส่เป็นจำนวนติดลบ !!", "warning")
                        } else {
                            cash = NoRoundingNumber(value)
                        }
                    } else {
                        change = null
                    }
                    break;

                default:
                    break;
            }

            form.setFieldsValue({ cash, change })

        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const [disableSubmitCash, setDisableSubmitCash] = useState(false)

    const checkPrice = (_, value) => {
        const { cash, change } = form.getFieldValue()
        if (value && value.length > 0) {
            const pattern = _.type === "pattern" ? _?.pattern : ""
            const checkValue = value.match(new RegExp(pattern))
            if (checkValue === null) {
                setDisableSubmitCash(true)
                change = null
                return Promise.reject(new Error(`${_?.message}`));
            } else {
                setDisableSubmitCash(false)
                return Promise.resolve();
            }
        }

        form.setFieldsValue({ cash, change })

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
            <Button loading={loading} className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon ${disabled ? "img-opacity-05" : ""}`} src={icon} />}
                <span className='pt-1'>{textButton}</span>
            </Button>

            <Modal
                maskClosable={false}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                title={`บันทึกลูกหนี้`}
                footer={null}
                className={`cash-modal`}
            >
                {
                    loading === true ?
                        <CarPreloader />
                        :
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            style={{ padding: "0 4%" }}
                            labelCol={{ xxl: { span: 24, offset: 0 }, lg: { span: 20, offset: 2 } }}
                            wrapperCol={{ xxl: { span: 24, offset: 0 }, lg: { span: 20, offset: 2 } }}
                        >
                            <Form.Item
                                // name="total"
                                name="price_grand_total"
                                label={(<div style={{ fontSize: "24px", color: mainColor }}>
                                    {GetIntlMessages("จำนวนเงินรวมที่ต้องชำระ")}
                                </div>)}
                                labelCol={{ xxl: { span: 12, offset: 6 }, lg: { span: 16, offset: 9 }, sm: { span: 16, offset: 8 }, xs: { span: 20, offset: 4 } }}
                            >
                                {/* <div className={`custom-ant-item-total-price`}>
                                    <div style={{ display: "flex", justifyContent: "center", fontSize: "24px", color: mainColor, paddingBottom: "12px" }} span={24}>
                                        {GetIntlMessages("จำนวนเงินรวมที่ต้องชำระ")}
                                    </div>
                                    <Input value={RoundingNumber(total)} readOnly style={{ fontSize: "24px", textAlign: "end" }} />
                                </div> */}
                                {/* <Input value={RoundingNumber(total)} readOnly style={{ fontSize: "24px", textAlign: "end" }} /> */}
                                <InputNumber stringMode readOnly style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                    formatter={(value) => !!value ? formatNumber(value, true) : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />

                            </Form.Item>

                            <Form.Item
                                name="cash"
                                label={GetIntlMessages("จำนวนเงินที่รับชำระ")}
                                rules={[{ pattern: /^(?!,$)[\d,.]+$/, required: true, message: GetIntlMessages("ตัวเลขเท่านั้น !!"), validator: checkPrice }]}
                            >
                                <Input style={{ textAlign: "end" }} addonAfter={`บาท`} onPressEnter={() => form.submit()} onChange={(e) => {
                                    handleChangeOrBlurCash(e.target.value, "change")
                                }}
                                    onBlur={(e) => handleChangeOrBlurCash(e.target.value, "blur")}
                                />
                            </Form.Item>

                            <Form.Item
                                label={GetIntlMessages("เงินทอน")}
                                name="change"
                                hidden
                            >
                                <Input readOnly style={{ textAlign: "end" }} addonAfter={`บาท`} />
                            </Form.Item>


                            <Form.Item
                                rules={[{ required: true }]}
                                label={GetIntlMessages("วันเวลารับชำระ")}
                                name="payment_paid_date"
                            >
                                <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY HH:mm"} showTime={{ format: 'HH:mm' }} />
                            </Form.Item>


                            <Form.Item
                                label={GetIntlMessages("หมายเหตุ")}
                                name="remark"
                            >
                                <div className={`custom-ant-item`}>
                                    <Input.TextArea rows={3} />
                                </div>
                            </Form.Item>
                            <Col span={24}>
                                <Row>
                                    <Col xxl={{ span: 8, offset: 4 }} lg={{ span: 10, offset: 2 }} md={12} sm={24} xs={24}>
                                        <div className={`pay-box`}>
                                            <Button loading={loading} disabled={disableSubmitCash} type='primary' onClick={() => form.submit()} className={`pay-btn`}>{isPartialPayment ? `ยืนยัน` : `รับเงิน`}</Button>
                                        </div>
                                    </Col>
                                    <Col xxl={8} lg={10} md={12} sm={24} xs={24}>
                                        <div className={`pay-box`}>
                                            <Button loading={loading} type='secondary' onClick={() => handleCancel()} className={`pay-btn`}>ปิด</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Form>
                }

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

export default ComponentsPayWithDebtor