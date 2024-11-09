import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Row, Col, Select, Switch, Divider, Table, InputNumber, Popconfirm, message } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import FormSelectLanguage from '../../../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../../../shares/FormLanguage/FormInputLanguage'
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import PayWithCashTransfer from './Components.Routes.Modal.PayWith.CashTransfer';
import PayWithCash from './Components.Routes.Modal.PayWith.Cash';
import PayWithCreaditCard from './Components.Routes.Modal.PayWith.CreaditCard';
import API from '../../../../../util/Api'
import { get, isArray, isFunction, isPlainObject, result } from 'lodash';
import { CreditCardOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { RoundingNumber } from '../../../../shares/ConvertToCurrency';
import moment from 'moment';
import Swal from 'sweetalert2';

const ComponentsPayWithPartialPayment = ({ icon, textButton, loading, total, callback, initForm, isPartialPayment = false }) => {

    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [columns, setColumns] = useState([])

    const [form] = Form.useForm()
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        let total_payment_price_paid = 0, price_balance = 0, payment_method_list = []

        if (isPartialPayment) {
            payment_method_list = !!initForm.getFieldValue("payment_method_list") ? initForm.getFieldValue("payment_method_list").map((e) => {
                total_payment_price_paid += Number(e.payment_price_paid)
                return { ...e, payment_method_name: e.payment_method === 1 ? "เงินสด" : e.payment_method === 2 ? "เครดิต/เดบิต" : "โอนเงินสด" }
            }) : []
        }

        price_balance = RoundingNumber(Number(total) - Number(total_payment_price_paid)) ?? "0.00"
        form.setFieldsValue({ price_grand_total: total, total_payment_price_paid, price_balance, payment_method_list })
    }, [isModalVisible])

    useEffect(() => {
        setColumnsTable()
    }, [])

    const setColumnsTable = () => {
        try {
            const _column = []
            _column.push(
                {
                    title: GetIntlMessages("order"),
                    width: "2%",
                    align: "center",
                    render: (text, record, index) => index + 1,
                },
                {
                    title: GetIntlMessages("ประเภทชำระเงิน"),
                    dataIndex: "payment_method_name",
                    key: "payment_method_name",
                    width: "8%",
                    align: "center",
                    render: (text, record, index) => text ?? "-",
                },
                {
                    title: GetIntlMessages("จำนวน"),
                    dataIndex: "",
                    key: "",
                    width: "10%",
                    align: "center",
                    render: (text, record, index) => <div style={{ textAlign: "end" }}>{RoundingNumber(record?.cash ?? record?.payment_price_paid) ?? "-"}</div>,
                },
                {
                    title: GetIntlMessages("ธนาคาร"),
                    dataIndex: "bank_name",
                    key: "bank_name",
                    width: "10%",
                    align: "center",
                    render: (text, record, index) => get(text, `${locale.locale}`, "-"),
                },
                // {
                //     title: GetIntlMessages("เงินทอน"),
                //     dataIndex: "change",
                //     key: "change",
                //     width: "10%",
                //     align: "center",
                //     render: (text, record, index) => <div style={{ textAlign: "end" }}>{RoundingNumber(text) ?? "-"}</div>,
                // },
                {
                    title: GetIntlMessages("เลขบัตร"),
                    // title: GetIntlMessages("เลขบัตร / เลขเอกสารอ้างอิง"),
                    dataIndex: "card_4_end_code",
                    key: "card_4_end_code",
                    width: "10%",
                    align: "center",
                    render: (text, record, index) => text ?? "-",
                },
                {
                    title: GetIntlMessages("หมายเหตุ"),
                    dataIndex: "remark",
                    key: "remark",
                    width: "10%",
                    align: "center",
                    render: (text, record, index) => text ?? "-",
                },
                {
                    dataIndex: "manage",
                    title: "จัดการ",
                    width: "1%",
                    // render: (text, record, index) => console.log('record :>> ', record)
                    render: (text, record, index) => {
                        if (record.showDeleteBtn) {
                            return (
                                <>
                                    {/* // <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")}> */}
                                    <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => deleleteList(index)}>
                                        <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                                    </Popconfirm>
                                </>
                            )
                        }
                    }
                },
            )

            setColumns(_column)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const deleleteList = (index) => {
        try {
            const { payment_method_list } = form.getFieldValue()
            payment_method_list.splice(index, 1)

            let total_payment_price_paid = 0, price_balance = 0
            payment_method_list.map((e) => {
                if (e.type === 1) {
                    total_payment_price_paid += Number(e.cash)
                } else {
                    total_payment_price_paid += Number(e.payment_price_paid)
                }
            })
            price_balance = (total - total_payment_price_paid).toLocaleString(undefined, { minimumFractionDigits: 2 })

            form.setFieldsValue({ payment_method_list, total_payment_price_paid, price_balance })
        } catch (error) {

        }
    }

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log('value', value)
            const model = {
                shopPaymentTransactions: value.payment_method_list.map((e) => {
                    switch (e.type) {
                        case 1:
                            return {
                                id: e.id ?? null,
                                payment_method: e.type,
                                payment_price_paid: e.cash,
                                is_partial_payment: isPartialPayment,
                                details: {
                                    change: e.change,
                                    remark: e.remark ?? null,
                                },
                                payment_paid_date: moment(e.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                            }
                        case 2:
                            return {
                                id: e.id ?? null,
                                payment_method: e.type,
                                payment_price_paid: e.payment_price_paid,
                                bank_name_list_id: e.bank_name_list_id ?? null,
                                is_partial_payment: isPartialPayment,
                                details: {
                                    payment_method_id: e.payment_method_id ?? null,
                                    payment_method_text: null,
                                    card_type_id: e.card_type_id ?? null,
                                    card_type_text: null,
                                    remark: e.remark ?? null,
                                    card_4_end_code: e.card_4_end_code ?? null,
                                },
                                payment_paid_date: moment(e.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                            }
                        case 3:
                            return {
                                id: e.id ?? null,
                                payment_method: e.type,
                                payment_price_paid: e.payment_price_paid,
                                bank_name_list_id: e.bank_name_list_id ?? null,
                                is_partial_payment: isPartialPayment,
                                details: {
                                    remark: null,
                                    transferor_name: e.transferor_name ?? null,
                                },
                                payment_paid_date: moment(e.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                            }

                        default:
                            break;
                    }

                }),
            }
            // console.log("model", model)
            if (isArray(value.payment_method_list) && value.payment_method_list.length > 0) {
                Swal.fire({
                    title: GetIntlMessages("ยืนยันการชำระเงินหรือไม่ ?"),
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages("submit"),
                    confirmButtonColor: mainColor,
                    cancelButtonText: GetIntlMessages("cancel")
                }).then((result) => {
                    if (result.isConfirmed) {
                        if (isFunction(callback)) callback(0, model, isPartialPayment)
                        handleCancel()
                    }
                })
            }

        } catch (error) {
            console.log('error :>> ', error);
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
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

    const callbackPayment = async (type, value) => {
        try {
            const { payment_method_list } = form.getFieldValue(), newList = [];

            let model
            switch (type) {
                case 1:
                    model = {
                        type,
                        payment_method_name: "เงินสด",
                        cash: value.cash,
                        change: value.change,
                        payment_price_paid: value.payment_price_paid,
                        remark: value.remark,
                        showDeleteBtn: true,
                        payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                    }
                    break;
                case 2:
                    model = {
                        type,
                        payment_method_name: "เครดิต/เดบิต",
                        payment_price_paid: value.payment_price_paid,
                        ...value.details,
                        showDeleteBtn: true,
                        payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                    }
                    break;
                case 3:
                    model = {
                        type,
                        payment_method_name: "โอนเงินสด",
                        payment_price_paid: value.payment_price_paid,
                        bank_name_list_id: value.bank_name_list_id,
                        ...value.details,
                        showDeleteBtn: true,
                        payment_paid_date: moment(value.payment_paid_date).format("YYYY-MM-DD HH:mm:ss")
                    }
                    break;

                default:
                    break;
            }
            newList = [...payment_method_list, model]
            let total_payment_price_paid = 0, price_balance = 0
            newList.map((e) => {
                if (e.type === 1) {
                    total_payment_price_paid += Number(e.cash)
                } else {
                    total_payment_price_paid += Number(e.payment_price_paid)
                }
            })
            price_balance = (total - total_payment_price_paid).toLocaleString(undefined, { minimumFractionDigits: 2 })

            form.setFieldsValue({ payment_method_list: newList, total_payment_price_paid, price_balance })
        } catch (error) {

        }
    }


    return (
        <>
            <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon`} src={icon} />}
                {textButton}
            </Button>

            <Modal
                maskClosable={false}
                title={`Partial Payment`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                className={`cash-modal-partial-payment`}
                hideSubmitButton
                footer={null}

            >
                <Form
                    form={form}
                    // labelCol={{ span: 24 }}
                    // wrapperCol={{ span: 24 }}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    style={{ overflowX: "hidden" }}
                >
                    <Row gutter={[30, 10]}>
                        <Col span={12}>
                            <Form.Item
                                name="price_grand_total"
                                label={GetIntlMessages("ยอดรวม")}
                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                            >
                                {/* <Input readOnly addonAfter={`บาท`} /> */}
                                <InputNumber stringMode readOnly className='ant-input-number-after-addon-20-percent' style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                    formatter={(value) => formatNumber(value, true)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter={`บาท`}
                                />
                            </Form.Item>

                            <Form.Item
                                name="total_payment_price_paid"
                                label={GetIntlMessages("จ่ายแล้ว")}
                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                            >
                                <InputNumber stringMode readOnly className='ant-input-number-after-addon-20-percent' style={{ fontSize: "24px", textAlign: "end", width: "100%" }}
                                    formatter={(value) => formatNumber(value, true)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    addonAfter={`บาท`}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Row justify="center">
                                <Col xxl={{ span: 12, offset: 2 }} lg={{ span: 12, offset: 6 }}>
                                    <div style={{ fontSize: "24px", color: mainColor }}>
                                        {GetIntlMessages("ยอดคงเหลือ")}
                                    </div>
                                </Col>
                                <Col span={22}>
                                    <Form.Item
                                        name="price_balance"
                                        style={{ margin: 0 }}
                                        wrapperCol={{ span: 24 }}
                                    >
                                        <Input.TextArea readOnly autoSize style={{ fontSize: "2rem", textAlign: "end" }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                        </Col>
                    </Row>

                    <Divider style={{ backgroundColor: "#ffcc00" }} />

                    <Row gutter={[30, 10]} style={{ display: "felx", justifyContent: "center", marginBottom: "20px" }}>
                        <Col>
                            {/* <PayWithCash icon={`https://icon-library.com/images/cash-icon-png/cash-icon-png-27.jpg`} textButton={`เงินสด`} /> */}
                            <PayWithCash icon={"/assets/images/icon/cash.svg"} textButton={`เงินสด`} callback={callbackPayment} total={total} isPartialPayment />
                        </Col>
                        <Col>
                            {/* <PayWithCreaditCard icon={`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAflBMVEX///8aGhoAAAAUFBQNDQ1lZWU6Ojrc3Nw3Nzc0NDTp6emJiYkYGBgHBwcQEBBYWFivr6/w8PBLS0swMDBTU1O/v7/29vZtbW3R0dHFxcUkJCR3d3fY2NiQkJDn5+egoKCpqamampp2dnZMTEzKyspoaGhCQkKUlJQhISG2trYttGzcAAAEhElEQVR4nO2d63aiMBRGIUHxQqB4oSrW2o51xvd/weGmgAaocAIs/PZPjs1imyuRk2oaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI/sP1Y26xf26mNP5reeBgVaer+wgq98uibxcx3Gu9YpgDPHbS5octG1SAmCm40Fe1uBMZw1VPT0fgsGirrXyPCdXUuybKNPpCMfe28iuLkKciacUZ9wxK37sE0DQ8eICxHLbZMvSgnbZTIEGk79QmZJFYoV3Y0RskoU2ax2EW+xId8168yq8HZxQ2VvtYvwRdMS1JLUgPBrl7Cwo1GUESwclOCyaES1F7VLGEetgC8Jb4qWZXyD49oFJIZTwnuiZQrDKmDYOTCsBIadQ2W4NPsK0XwYPDr1leT+Ghv2HRjCsP/AEIb9B4Yw7D8whGH/gSEM+w8MYdh/YPgLQ95XyAzHk34yJjLkk9oFqGaCPe8qYNg5MKwEhp0Dw0pg2DkwrASGnQPDSl7Z0DU3p/0hc2Fmnk5m/beRa6LKcD8fi+hlj93oEl3Y+Mv47Y/l96nB/T6PGsPNijEeZzsYLBRan5m47icINr00vOtnUGLoM/u2A2QF7dRz0gvRRfanvcaqwNCd3JJodCtMOTLFQ+KX0SjF4ynoDV1upCYsaI97WeKXxdrqjfSGu0yDFD/BCGpId1Stpgllv4XcMM3zCqvQ1bSFIRPUdbul7Tlqw1NOcK5pRyb1C6N/aRQqoDZcZAdNdihLTmwpC4XYcJOtMft8S8qRV+InkUQpxIa+uDPI1ekd7STaEBtOs22S7a9ZR0WVmF21atv5A59eSfB4C67LgrSGbrZNWsLNt9pHw2yuvC99hTn5Dr5lwX/JwuhdFtxdOzmtYU6I78q7YWD4lZazlX4yydtclwUv0iAbKTHM3Ul47avccJ6W8y5P6Y/H25F8To0TQ4uCngrDy73h318bOgX3Ga18CsarOLgqCLoqDHNNLRwqP8sNP9JyPqSftFgUnMuDIgr60iDXNRWGZm6k0b2CDnQzPKbluExSiVbSU2dMUk9WMp8e5MFr2bSGnpGdHILJwCw3zD5CmWfJiHgdivbjx5i4BSeSv7ytJojnw1yfCCcDq2Q+tFg+/9ud3eOVBUv/Mo0RG+bW2WH+tLyTxBij8qJpIDbMrWEsO3z8LWmkrTwEUz9b5Ea9sJkWzAJ6vDBvAWpDL1uJ9jgcXot6YktbNeTP+LkpMdymKZoSs5OhSuj3abLLGM69cNUsFWxw2shTKNhNnGfapQiHyx+JYmuCSnaEj5nlSbT0nN/vJ3JW/yCOZ1Gy520u0oVU1N1Oy+zKirN/NIeo/QpFv8xsV8HCybBtWzD2HV64BGsyEVwwggvTVk96UfbrmnuZjxZnx/+8bvwe3vzRObhwPNx/VC34hbQSGHYODCt5GcMBnxM1/LO+hn9e2/DP3Bv+uYnDP/vyBc4vHf4ZtC9wjvDwz4J+gfO8X+BMdm345+qHDP1/IwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAh8R+s8WbNRmDw4QAAAABJRU5ErkJggg==`} textButton={`Credit Card`} /> */}
                            <PayWithCreaditCard icon={"/assets/images/icon/credit-card.svg"} textButton={`เครดิต/เดบิต`} callback={callbackPayment} total={total} isPartialPayment />
                        </Col>
                        <Col>
                            {/* <PayWithCashTransfer icon={`https://www.freeiconspng.com/thumbs/money-transfer-icon/dollar-exchange-money-transfer-icon-21.png`} textButton={`โอนเงินสด`} /> */}
                            <PayWithCashTransfer icon={"/assets/images/icon/money-transfer.svg"} textButton={`โอนเงินสด`} callback={callbackPayment} total={total} isPartialPayment initForm={initForm} />
                        </Col>
                    </Row>

                    <Form.Item name="payment_method_list" />

                    <Table
                        id="table-list"
                        columns={columns}
                        dataSource={Form.useWatch("payment_method_list", form)}
                        locale={{ emptyText: "ไม่มีข้อมูล..กรุณาเพิ่มรายาการ" }}
                        scroll={{ x: 900 }}
                        pagination={false}
                    />

                    <Row className='mt-4'>
                        <Col span={24}>
                            <Row>
                                <Col xxl={{ span: 8, offset: 4 }} lg={{ span: 10, offset: 2 }} md={12} sm={24} xs={24}>
                                    <div className={`pay-box`}>
                                        <Button loading={loading} type='primary' disabled={(isArray(form.getFieldValue("payment_method_list")) && form.getFieldValue("payment_method_list").length === 0) || form.getFieldValue("price_balance") < 0} onClick={() => form.submit()} className={`pay-btn`}>รับชำระ</Button>
                                    </div>
                                </Col>
                                <Col xxl={8} lg={10} md={12} sm={24} xs={24}>
                                    <div className={`pay-box`}>
                                        <Button loading={loading} type='secondary' onClick={() => handleCancel()} className={`pay-btn`}>ปิด</Button>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {/* <div className={`pay-box mt-4`}>
                        <Button type='primary' onClick={() => form.submit()} className={`pay-btn`}>ยืนยัน</Button>
                    </div> */}

                </Form>
            </Modal>


        </>
    )
}

export default ComponentsPayWithPartialPayment