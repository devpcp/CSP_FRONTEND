import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, message, Row, Col, InputNumber } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import { isFunction, isPlainObject } from 'lodash';
import { CloseOutlined } from '@ant-design/icons';
import { RoundingNumber, NoRoundingNumber, takeOutComma } from '../../../../shares/ConvertToCurrency';
import API from '../../../../../util/Api';
import Swal from "sweetalert2";
import CarPreloader from '../../../../_App/CarPreloader';

const ComponentsPayWithCash = ({ icon, textButton, disabled, callback, total = 0, loading, initForm, isPartialPayment = false }) => {

    const [form] = Form.useForm()
    // const form = Form.useFormInstance()
    const [isModalVisible, setIsModalVisible] = useState(false);
    // const [change, setChange] = useState(0)
    const [checkCash, setCheckCash] = useState("")

    const { mainColor } = useSelector(({ settings }) => settings)
    const { permission_obj } = useSelector(({ permission }) => permission)

    useEffect(() => {
        form.setFieldsValue({ price_grand_total: total, cash: total })
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
            let cash = takeOutComma(value.cash), change = takeOutComma(value.change), payment_price_paid = value.price_grand_total;
            const model = {
                cash,
                remark: value.remark ?? null,
                change,
                payment_price_paid
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
                        if (isFunction(callback)) callback(6, model, isPartialPayment)
                        handleCancel()
                    }
                })
                // setIsModalVisible(true)
                // handleCancel()
            }
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
                title={`บันทึกเจ้าหนี้`}
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
                                // label={GetIntlMessages("จำนวนเงินที่รับชำระ")}
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

export default ComponentsPayWithCash