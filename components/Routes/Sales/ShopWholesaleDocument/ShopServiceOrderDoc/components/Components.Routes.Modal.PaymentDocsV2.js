import { Button, Col, Form, Row, Table } from 'antd'
import React from 'react'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalFullScreen from '../../../../../shares/ModalFullScreen'
import { useState } from 'react'
import { DollarCircleOutlined } from '@ant-design/icons'
import API from '../../../../../../util/Api'
import { useEffect } from 'react'
import { get } from 'lodash'
import { useSelector } from 'react-redux'
import { RoundingNumber } from '../../../../../shares/ConvertToCurrency'
import ComponentsPayWithCash from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.Cash'
import ComponentsPayWithCreditCard from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.CreaditCard'
import ComponentsPayWithCashTransfer from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.CashTransfer'
import Promotions from '../../../Invoices/DocumentsAndPromotions/Components.Routes.Modal.Promotions'
import ComponentsDiscount from '../../../Invoices/Discount/Components.Routes.Modal.Discount'

const PaymentDocsV2 = ({ docId, title ,loading }) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [columns, setColumns] = useState([])
    const [discountColumns, setDiscountColumns] = useState([])
    const [depositColumns, setDepositColumns] = useState([])
    const [dataSource, setDataSource] = useState([])

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);

    const [form] = Form.useForm()

    useEffect(() => {
        setTableColumns()
    }, [])

    const setTableColumns = () => {
        try {
            const _column = [], discountColumn = [], depositColumn = [];
            _column.push(
                {
                    title: () => GetIntlMessages("order"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    render: (text, record, index) => index + 1,
                },
                {
                    title: () => GetIntlMessages("code"),
                    dataIndex: 'details',
                    key: 'details',
                    width: "20%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                    render: (text, record, index) => <div style={{ textAlign: "start" }}>{get(text, `meta_data.ShopProduct.Product.master_path_code_id`, "-")}</div>,
                },
                {
                    title: () => GetIntlMessages("ชื่อสินค้า"),
                    dataIndex: 'details',
                    key: 'details',
                    width: "40%",
                    align: "center",
                    render: (text, record, index) => <div style={{ textAlign: "start" }}>{get(text, `meta_data.ShopProduct.Product.product_name.${locale.locale}`, "-")}</div>,
                },
                {
                    title: () => GetIntlMessages("ราคา/หน่วย"),
                    dataIndex: 'price_unit',
                    key: 'price_unit',
                    width: "15%",
                    align: "center",
                    render: (text, record, index) => <div style={{ textAlign: "end" }}>{RoundingNumber(text) ?? "-"}</div>,
                },
                {
                    title: () => GetIntlMessages("ราคารวม"),
                    dataIndex: 'price_grand_total',
                    key: 'price_grand_total',
                    width: "15%",
                    align: "center",
                    render: (text, record, index) => <div style={{ textAlign: "end" }}>{RoundingNumber(text) ?? "-"}</div>,
                },
            )
            setColumns(() => [..._column])

            discountColumn.push(
                {
                    title: () => GetIntlMessages("order"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    render: (text, record, index) => index + 1,
                },
                {
                    title: () => GetIntlMessages("รายการส่วนลด"),
                    dataIndex: '',
                    key: '',
                    width: "40%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
                {
                    title: () => GetIntlMessages("จำนวน"),
                    dataIndex: '',
                    key: '',
                    width: "40%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
                {
                    title: () => GetIntlMessages("ราคา"),
                    dataIndex: '',
                    key: '',
                    width: "20%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
                {
                    title: () => GetIntlMessages("ลบ"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
            )
            setDiscountColumns(() => [...discountColumn])

            depositColumn.push(
                {
                    title: () => GetIntlMessages("order"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    render: (text, record, index) => index + 1,
                },
                {
                    title: () => GetIntlMessages("เลขที่มัดจำ"),
                    dataIndex: '',
                    key: '',
                    width: "40%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
                {
                    title: () => GetIntlMessages("จำนวนเงิน"),
                    dataIndex: '',
                    key: '',
                    width: "20%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
                {
                    title: () => GetIntlMessages("ลบ"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    // render: (text, record, index) =>console.log('record :>> ', record),
                },
            )
            setDepositColumns(() => [...depositColumn])
        } catch (error) {

        }
    }

    const handleVisibleModal = async () => {
        try {
            const { data } = await API.get(`/shopServiceOrderDoc/byId/${docId}`)
            console.log('data handleVisibleModal:>> ', data);
            if (data.status === "success") {
                const list_service_product = data.data.ShopServiceOrderLists, model = data.data
                setDataSource(() => [...list_service_product])
                form.setFieldsValue({ ...model })
            }
            setIsModalVisible(true)
        } catch (error) {

        }
    }

    const getValue = (type, isNumber = false) => {
        try {
            if (isNumber) {
                return !!form.getFieldValue(type) ? RoundingNumber(form.getFieldValue(type)) : "0.00"
            } else {
                return !!form.getFieldValue(type) ? form.getFieldValue(type) : null
            }

        } catch (error) {

        }
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <Button type='primary' onClick={handleVisibleModal} icon={<DollarCircleOutlined style={{ fontSize: 16 }} />} loading={loading} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "#85BB65", border: 0 }}>{GetIntlMessages("รับชำระ")}</Button>

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                // onOk={handleOk}
                onCancel={() => setIsModalVisible(false)}
                // onCancel={()=>setIsModalVisible(()=>false)}
                hideSubmitButton
            // mode={configModal.mode}
            title={title ?? `ชำระเงิน`}
            // loading={loading}
            >
                <Form
                    form={form}
                >
                    <Row>
                        <Col lg={12} md={24} sm={24} xs={24}>
                            <div className="container-fluid" >
                                <div id="invoices-container">
                                    <div className='detail-before-table'>
                                        <div className="invoices-totalprice pt-3 pb-2">
                                            <div>ราคารวม</div>
                                            <div>{getValue("price_sub_total", true)} บาท</div>
                                        </div>

                                        <div className="invoices-price-paid">
                                            <div className="invoices-text-detail">
                                                ราคาทั้งหมดที่ต้องจ่าย (บาท)
                                            </div>
                                            <div className="invoices-text-price">
                                                {getValue("price_grand_total", true)} บาท
                                            </div>
                                        </div>

                                        <div className="invoices-price-detail">
                                            <div className="invoices-discount-coupon">
                                                <div className="invoices-text-discount-detail">
                                                    ส่วนลดคูปอง (บาท)
                                                </div>
                                                <div className="invoices-text-discount-price">
                                                    {MatchRound(0)}
                                                </div>
                                            </div>
                                            <div className="invoices-discount-other">
                                                <div className="invoices-text-discount-detail">
                                                    ส่วนลดอื่นๆ (บาท)
                                                </div>
                                                <div className="invoices-text-discount-price">
                                                    {getValue("price_discount_total", true)}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            <Table
                                // id="table-list"
                                key={(record) => record.id}
                                columns={columns}
                                dataSource={dataSource}
                                pagination={false}
                                scroll={{ x: 400 }}
                                locale={{ emptyText: "ไม่มีข้อมูล..กรุณาเพิ่มรายาการ" }}
                            />

                            <Table
                                // id="table-list"
                                className='mt-4'
                                columns={discountColumns}
                                dataSource={[]}
                                pagination={false}
                                scroll={{ x: 400 }}
                                locale={{ emptyText: "ไม่มีข้อมูล..กดเพิ่มรายการ" }}
                            />

                            <Table
                                // id="table-list"
                                className='mt-4'
                                columns={depositColumns}
                                dataSource={[]}
                                pagination={false}
                                scroll={{ x: 400 }}
                                locale={{ emptyText: "ไม่มีข้อมูล..กดเพิ่มรายการ" }}
                            />

                        </Col>

                        <Col lg={12} md={24} xs={24}>
                            <div className="pt-3 pb-2">
                                <div className="border-bottom pb-2"><h1>รูปแบบการชำระเงิน</h1></div>
                                <div className="p-3">
                                    <Row gutter={[20]}>
                                        <Col lg={6} md={6} sm={12} xs={12}>
                                            <div>
                                                <ComponentsPayWithCash
                                                    icon={"/assets/images/icon/cash.svg"}
                                                    textButton={"เงินสด"}
                                                    initForm={form}
                                                    total={getValue("price_grand_total")}
                                                // callback={callbackPayment}
                                                // loading={loading}
                                                />
                                            </div>
                                        </Col>
                                        <Col lg={6} md={6} sm={12} xs={12}>
                                            <div>
                                                <ComponentsPayWithCreditCard
                                                    icon={"/assets/images/icon/credit-card.svg"}
                                                    textButton={"เครดิต/เดบิต"}
                                                    initForm={form}
                                                    total={getValue("price_grand_total")}
                                                // callback={callbackPayment}
                                                // loading={loading}
                                                // disabled
                                                />
                                            </div>
                                        </Col>
                                        <Col lg={6} md={6} sm={12} xs={12}>
                                            <div>
                                                <ComponentsPayWithCashTransfer
                                                    icon={"/assets/images/icon/money-transfer.svg"}
                                                    textButton={"เครดิต/เดบิต"}
                                                    initForm={form}
                                                    total={getValue("price_grand_total")}
                                                // callback={callbackPayment}
                                                // loading={loading}
                                                // disabled
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            </div>

                            <div className="pt-3 pb-2">
                                <div className="border-bottom pb-2"><h1>จัดการเอกสาร/โปรโมชั่น</h1></div>
                                <div className="p-3 flex-container-herder">
                                    <div className="pr-5">
                                        <Promotions
                                            icon={"/assets/images/icon/promotion.svg"}
                                            textButton={"โปรโมชั่น"}
                                            disabled
                                        />
                                    </div>
                                    {/* <div className="pr-5">
                                        <DepositReceipt textButton={"หักเงินมัดจำ"} disabled />
                                     </div> */}
                                </div>
                            </div>

                            <div className="pt-3 pb-2">
                                <div className="border-bottom pb-2">รายการส่วนลด</div>
                                <div className="p-3 flex-container-herder">
                                    <div className="pr-5">
                                        <ComponentsDiscount
                                            icon={"/assets/images/icon/discount.svg"}
                                            textButton={"ส่วนลด"}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Form>

            </ModalFullScreen >

            <style>
                {
                    `
                    .ant-table-thead .ant-table-cell {
                        background-color: #C0C0C0;
                      }
                    `
                }
            </style>
        </>
    )
}

export default PaymentDocsV2