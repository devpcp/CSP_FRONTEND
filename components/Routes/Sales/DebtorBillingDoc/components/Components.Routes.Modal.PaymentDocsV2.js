import { Button, Col, Divider, Form, Row, Table, Dropdown, message, Tooltip, Space ,Checkbox } from 'antd'
import React from 'react'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import ModalFullScreen from '../../../../shares/ModalFullScreen'
import { useState } from 'react'
import { DollarCircleOutlined, DownOutlined, FileExcelOutlined } from '@ant-design/icons'
import API from '../../../../../util/Api'
import { useEffect, useCallback } from 'react'
import { get, isArray, isEmpty, isFunction, isPlainObject } from 'lodash'
import { useSelector } from 'react-redux'
import { RoundingNumber } from '../../../../shares/ConvertToCurrency'
import ComponentsPayWithCash from '../../Invoices/Payment/Components.Routes.Modal.PayWith.Cash'
import ComponentsPayWithCreditCard from '../../Invoices/Payment/Components.Routes.Modal.PayWith.CreaditCard'
import ComponentsPayWithCashTransfer from '../../Invoices/Payment/Components.Routes.Modal.PayWith.CashTransfer'
import PartialPayment from '../../Invoices/Payment/Components.Routes.Modal.PayWith.PartialPayment'
import Promotions from '../../Invoices/DocumentsAndPromotions/Components.Routes.Modal.Promotions'
import ComponentsDiscount from '../../Invoices/Discount/Components.Routes.Modal.Discount'
import Swal from 'sweetalert2'
import CarPreloader from '../../../../_App/CarPreloader'
import moment from 'moment'
import PrintOut from '../../../../shares/PrintOut'

const PaymentDocsV2 = ({ docId, title, loading, handleCancelDebtDoc, initForm, carPreLoading, setCarPreLoading }) => {
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [columns, setColumns] = useState([])
    const [discountColumns, setDiscountColumns] = useState([])
    const [depositColumns, setDepositColumns] = useState([])
    const [dataSource, setDataSource] = useState([])

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth)

    const [form] = Form.useForm()
    const isPartialPaymentStatus = Form.useWatch("payment_method_list", { form, preserve: true })

    useEffect(() => {
        setTableColumns()
    }, [])

    const setTableColumns = () => {
        try {
            const _column = [], discountColumn = [], depositColumn = [];
            _column.push(
                {
                    title: () => GetIntlMessages("ลำดับ"),
                    dataIndex: 'num',
                    key: 'num',
                    align: "center",
                    width: "2%",
                    render: (text, record, index) => {
                        // index += ((configTable.page - 1) * configTable.limit)
                        return index + 1
                    },
                },
                {
                    // title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `เลขที่ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
                    title: () => GetIntlMessages("เลขที่เอกสาร"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                    render: (text, record) => get(record , `ShopServiceOrderDoc.code_id`, record.code_id)
                },
                // {
                //     title: () => GetIntlMessages("เลขที่ใบกำกับ(จากใบส่งของขั่วคราว)"),
                //     dataIndex: 'ShopTemporaryDeliveryOrderDocs',
                //     key: 'ShopTemporaryDeliveryOrderDocs',
                //     width: "15%",
                //     align: "center",
                //     render: (text, record) => text?.find(where => where.status === 1)?.code_id ?? record.ShopTemporaryDeliveryOrderDoc.code_id ?? "-",
                //     // render: (text, record) => console.log('record :>> ', record),
                // },
                // {
                //     title: () => GetIntlMessages("วันที่"),
                //     dataIndex: 'doc_date',
                //     key: 'doc_date',
                //     width: "5%",
                //     align: "center",
                //     // render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
                // },
                // {
                //     title: () => GetIntlMessages("ครบกำหนด"),
                //     dataIndex: '',
                //     key: '',
                //     width: "10%",
                //     align: "center",
                //     render: (text, record) => "-",
                // },
                {
                    title: () => GetIntlMessages("จำนวนเงิน"),
                    dataIndex: '',
                    key: '',
                    width: "10%",
                    align: "center",
                    render : (text, record) =><div style={{ textAlign: "end" }}>{RoundingNumber(Number(get(record,`ShopServiceOrderDoc.debt_price_amount`,0)))  ?? RoundingNumber(Number(record.debt_price_amount)) ?? "-"}</div>
                    // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>,
                },
                {
                    title: () => GetIntlMessages("ยอดคงเหลือ"),
                    dataIndex: '',
                    key: '',
                    width: "10%",
                    align: "center",
                    render : (text, record) =><div style={{ textAlign: "end" }}>{RoundingNumber(Number(get(record,`ShopServiceOrderDoc.debt_price_amount_left`,0)))  ?? RoundingNumber(Number(record.debt_price_amount_left)) ?? "-"}</div>
                    // render : (text, record) =><div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>
                },
                {
                    title: () => GetIntlMessages("ยอดชำระ"),
                    dataIndex: 'debt_price_paid_total',
                    key: 'debt_price_paid_total',
                    width: "10%",
                    align: "center",
                    render : (text,record) => RoundingNumber(text) ?? "-"
                    // render: (text, record, index) => (
                    //     <>
                    //         <Form.Item rules={[RegexMultiPattern() ,RegexMultiPattern("4" ,GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`debt-price-paid-total-${index}`} style={{ margin: 0 }} name={["shopCustomerDebtLists",index,"debt_price_paid_total"]}>
                    //             <InputNumber stringMode style={{width : "100%"}} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                    //                 parser={(value) => value.replace(/\$\s?|(,*)/g, '')} onBlur={()=>calculateResult()}/>
                    //         </Form.Item>
                    //     </>
                    // )
                    // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
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
                },
                {
                    title: () => GetIntlMessages("จำนวน"),
                    dataIndex: '',
                    key: '',
                    width: "40%",
                    align: "center",
                },
                {
                    title: () => GetIntlMessages("ราคา"),
                    dataIndex: '',
                    key: '',
                    width: "20%",
                    align: "center",
                },
                {
                    title: () => GetIntlMessages("ลบ"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
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
                },
                {
                    title: () => GetIntlMessages("จำนวนเงิน"),
                    dataIndex: '',
                    key: '',
                    width: "20%",
                    align: "center",
                },
                {
                    title: () => GetIntlMessages("ลบ"),
                    dataIndex: '',
                    key: '',
                    width: "5%",
                    align: "center",
                },
            )
            setDepositColumns(() => [...depositColumn])
        } catch (error) {

        }
    }


    const handleVisibleModal = async () => {
        try {
            // setCarPreLoading(true)
            const { data } = await API.get(`/shopCustomerDebtDoc/byId/${docId}`) , {ShopCustomerDebtLists ,ShopPaymentTransactions} = data.data
            if (data.status === "success") {
                const payment_method_list = ShopPaymentTransactions?.map(e => ({...e ,type : e.payment_method , cash : e.payment_price_paid , showDeleteBtn : false})).filter(where => !where.canceled_payment_by) ?? []
                setDataSource(() => [...ShopCustomerDebtLists])
                form.setFieldsValue({ ...data.data ,payment_method_list})
            }
            // setCarPreLoading(false)
            setIsModalVisible(true)
        } catch (error) {
            // setCarPreLoading(() => false)
            console.log('error handleVisibleModal:>> ', error);
        }
    }

    const handleCancel = () => {
        try {
            form.resetFields()
            setIsModalVisible(false)
            form.setFieldsValue({ isFormModalVisible: false })
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

    /**
     * 
     * @param {number} type - payment method
     * * 1 -> เงินสด
     * * 2 -> บัตรเครดิต
     * * 3 -> เงินโอน
     * * 4 -> Partial Payment
     * @param {object} value - payment information
     * @param {boolean} isPartialPayment - is it Partial payment
     */
    const callbackPayment = async (type, value, isPartialPayment) => {
        try {
            setPaymentLoading(true)
            const { shop_id } = authUser.UsersProfile, { id, doc_date, ShopServiceOrderDoc } = form.getFieldValue()

            let res
            let model
            switch (type) {
                case 1:
                    model = {
                        shop_id,
                        shop_customer_debt_doc_id : id,
                        doc_date,
                        payment_method: type,
                        payment_price_paid: value.payment_price_paid,
                        is_partial_payment: isPartialPayment,
                        details: {
                            change: value.change,
                            actual_paid: value.cash,
                            remark: value.remark ?? null,
                        }
                    }
                    break;
                case 2:
                    model = {
                        shop_id,
                        shop_customer_debt_doc_id : id,
                        doc_date,
                        payment_method: type,
                        payment_price_paid: value.payment_price_paid,
                        is_partial_payment: isPartialPayment,
                        bank_name_list_id: value.bank_id,
                        details: value.details
                    }
                    break;
                case 3:
                    model = {
                        shop_id,
                        shop_customer_debt_doc_id : id,
                        doc_date,
                        payment_method: type,
                        payment_price_paid: value.payment_price_paid,
                        is_partial_payment: isPartialPayment,
                        bank_name_list_id: value.bank_id,
                        details: value.details
                    }
                    break;
                case 4:
                    model = {
                        shop_id,
                        shop_customer_debt_doc_id : id,
                        doc_date,
                        shopPaymentTransactions: value.shopPaymentTransactions.filter(where => !where.id)

                    }
                    break;

                default:
                    break;
            }

            // console.log('model :>> ', model);
            // res = { data: { status: "success" } }
            if (type !== 4) {
                res = await API.post(`/shopPaymentTransaction/add`, model)
            } else {
                res = await API.post(`/shopPaymentTransaction/addPartialPayments`, model)
            }

            // console.log('res :>> ', res);
            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("ชำระสำเร็จ!! ต้องการพิมพ์เอกสารลูกหนี้หรือไม่หรือไม่ ?"),
                    icon: 'question',
                    showCancelButton: true,
                    showDenyButton: true,
                    confirmButtonColor: mainColor,
                    denyButtonColor: "red",
                    denyButtonText: GetIntlMessages("ไม่พิมพ์"),
                    confirmButtonText: GetIntlMessages("print"),
                    cancelButtonText: GetIntlMessages("cancel")
                }).then(async (result) => {
                    setPaymentLoading(true)
                    if(result.isConfirmed){
                        let url = `/printOut/pdf/${docId}?price_use=true&doc_type_name=ใบเสร็จรับเงิน&foot_sign_left=ผู้จ่ายเงิน&foot_sign_right=ผู้รับเงิน`
                        const { data } = await API.get(url)
                        if (data.status === "success") {
                            Swal.fire('พิมพ์สำเร็จ !!',"","success").then((val)=> {if(val.isConfirmed) handleCancel() , handleCancelDebtDoc();})
                            window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                        }else{
                            Swal.fire('พิมพ์ไม่สำเร็จสำเร็จ !!',`${data.data}`,"error")
                        }
                       
                    }else if(result.isDenied){
                        handleCancel()
                        handleCancelDebtDoc()
                    }else{
                        handleCancel()
                        handleCancelDebtDoc()
                    }
                    
                    setPaymentLoading(false)
                })
            } else {
                Swal.fire('ชำระไม่สำเร็จ!!', `${res.data.data}`, "error")
            }

            setPaymentLoading(false)
        } catch (error) {
            setPaymentLoading(false)
        }
    }
    /*End Payment*/

    /* Dropdown Cancel Payment Doc */
    const items = [
        { label: 'ยกเลิกการชำระ', key: 1, danger: true },
    ];

    const handleCanceledPaymentDoc = (e) => {
        try {
            let isPartialPayment = false
            const { details, ShopPaymentTransactions } = initForm.getFieldValue(), currentDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

            ShopPaymentTransactions = ShopPaymentTransactions.filter(where => !where.canceled_payment_by)

            if (!!ShopPaymentTransactions && isArray(ShopPaymentTransactions) && ShopPaymentTransactions.length > 1) {
                isPartialPayment = true
            }
            const model = {
                canceled_payment_date: currentDate,
            }

            let res
            Swal.fire({
                title: GetIntlMessages(`ยืนยันการ "ยกเลิกการชำระ" หรือไม่ !?`),
                text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการยกเลิกครั้งนี้ได้ !!"),
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setCarPreLoading(true)
                    if (isPartialPayment) {
                        for (let i = 0; i < ShopPaymentTransactions.length; i++) {
                            res = await API.put(`/shopPaymentTransaction/put/${ShopPaymentTransactions[i].id}`, model)
                            if ((i + 1) === ShopPaymentTransactions.length && res.data.status === "success") {
                                Swal.fire({
                                    title: GetIntlMessages("ยกเลิกสำเร็จ !!"),
                                    icon: "success",
                                    timer: 2000,
                                    timerProgressBar: true,
                                    confirmButtonColor: mainColor,
                                    confirmButtonText: GetIntlMessages("submit")
                                })
                                handleCancel()
                                handleCancelDebtDoc()
                            }else if((i + 1) === ShopPaymentTransactions.length && res.data.status !== "success"){
                                Swal.fire({
                                    title: GetIntlMessages("ยกเลิกไม่สำเร็จ !!"),
                                    text : "มีบางอย่างผิดพลาด..กรุณาติดต่อเจ้าหน้าที่",
                                    icon: "error",
                                    confirmButtonColor: mainColor,
                                    confirmButtonText: GetIntlMessages("submit")
                                })
                            }
                        }
                    } else {
                        res = await API.put(`/shopPaymentTransaction/put/${ShopPaymentTransactions[0].id}`, model)
                        if (res.data.status === "success") {
                            Swal.fire({
                                title: GetIntlMessages("ยกเลิกสำเร็จ !!"),
                                icon: "success",
                                timer: 2000,
                                timerProgressBar: true,
                                confirmButtonColor: mainColor,
                                confirmButtonText: GetIntlMessages("submit")
                            })
                            handleCancel()
                            handleCancelDebtDoc()
                        }else{
                            Swal.fire({
                                title: GetIntlMessages("ยกเลิกไม่สำเร็จ !!"),
                                text : "มีบางอย่างผิดพลาด..กรุณาติดต่อเจ้าหน้าที่",
                                icon: "error",
                                confirmButtonColor: mainColor,
                                confirmButtonText: GetIntlMessages("submit")
                            })
                        }
                    }
                    setCarPreLoading(false)
                }

            })
            // console.log('model :>> ', model);
        } catch (error) {
            console.log('error :>> ', error);
        }

    };

    const menuProps = {
        items,
        onClick: handleCanceledPaymentDoc,
    };

    /* End Dropdown Cancel Payment Doc */

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            {
                (initForm.getFieldValue("status") == 1 && initForm.getFieldValue("payment_paid_status") === 1 )? (
                    <Button
                        type="primary"
                        // onClick={handleCarLoading}
                        onClick={handleVisibleModal}
                        icon={<DollarCircleOutlined style={{ fontSize: 16 }} />}
                        loading={loading}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#85BB65",
                            border: 0,
                        }}
                    >
                        {GetIntlMessages("รับชำระ")}
                    </Button>
                ) : initForm.getFieldValue("status") == 1 && initForm.getFieldValue("payment_paid_status") === 2 ? (
                    <Dropdown.Button
                        icon={<DownOutlined />}
                        menu={menuProps}
                        className="payment-doc-dropdown-btn"
                        onClick={() => handleVisibleModal()}
                        disabled={initForm.getFieldValue("payment_paid_status") !== 2}
                    >
                        <Space
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <DollarCircleOutlined style={{ fontSize: 16, paddingBottom: 6 }} />
                            {GetIntlMessages("รับชำระ")}
                        </Space>
                    </Dropdown.Button>

                ) : (
                    <Button
                        type="danger"
                        // style={{ width: "100%" }}
                        onClick={() => handleCanceledPaymentDoc({ key: 1 })}
                        icon={<FileExcelOutlined style={{ fontSize: 18 }} />}
                        // icon={<DollarCircleOutlined style={{ fontSize: 16 }} />}
                        loading={loading}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {GetIntlMessages("ยกเลิกการชำระ")}
                    </Button>
                )}

            <ModalFullScreen
                maskClosable={false}
                // visible={Form.useWatch("isFormModalVisible", {form , preserve : true})}
                visible={isModalVisible}
                // onOk={handleOk}
                onCancel={handleCancel}
                // onCancel={()=>setIsModalVisible(()=>false)}
                hideSubmitButton
                // mode={configModal.mode}
                title={title ?? `ชำระเงิน`}
            // loading={loading}
            >
                {paymentLoading ? (
                    <CarPreloader />
                ) : (
                    <Form form={form}>
                        <Row gutter={[30]}>
                            <Col lg={12} md={24} sm={24} xs={24}>
                                <div className="container-fluid">
                                    <div id="invoices-container">
                                        <div className="detail-before-table">
                                            <div className="invoices-totalprice pt-3 pb-2">
                                                <div>ราคารวม</div>
                                                <div>{getValue("debt_price_paid_total", true)} บาท</div>
                                            </div>

                                            <div className="invoices-price-paid">
                                                <div className="invoices-text-detail">
                                                    ราคาทั้งหมดที่ต้องจ่าย (บาท)
                                                </div>
                                                <div className="invoices-text-price">
                                                    {getValue("debt_price_paid_total", true)} บาท
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
                                    className="mt-4"
                                    columns={discountColumns}
                                    dataSource={[]}
                                    pagination={false}
                                    scroll={{ x: 400 }}
                                    locale={{ emptyText: "ไม่มีข้อมูล..กดเพิ่มรายการ" }}
                                />

                                <Table
                                    // id="table-list"
                                    className="mt-4"
                                    columns={depositColumns}
                                    dataSource={[]}
                                    pagination={false}
                                    scroll={{ x: 400 }}
                                    locale={{ emptyText: "ไม่มีข้อมูล..กดเพิ่มรายการ" }}
                                />
                            </Col>

                            <Col lg={12} md={24} xs={24}>
                                <div className="pt-3 pb-2">
                                    <div className="border-bottom pb-2">
                                        <h1>รูปแบบการชำระเงิน</h1>
                                    </div>
                                    <div className="p-3">
                                        <Row gutter={[20, 10]}>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <ComponentsPayWithCash
                                                        icon={"/assets/images/icon/cash.svg"}
                                                        textButton={"เงินสด"}
                                                        initForm={form}
                                                        total={getValue("debt_price_paid_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0  && initForm.getFieldValue("payment_paid_status") === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
                                                            // isPartialPaymentStatus.length > 1
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <ComponentsPayWithCreditCard
                                                        icon={"/assets/images/icon/credit-card.svg"}
                                                        textButton={"เครดิต/เดบิต"}
                                                        initForm={form}
                                                        total={getValue("debt_price_paid_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0  && initForm.getFieldValue("payment_paid_status") === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
                                                            // isPartialPaymentStatus.length > 1
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <ComponentsPayWithCashTransfer
                                                        icon={"/assets/images/icon/money-transfer.svg"}
                                                        textButton={"โอนเงินสด"}
                                                        initForm={form}
                                                        total={getValue("debt_price_paid_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0  && initForm.getFieldValue("payment_paid_status") === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
                                                            // isPartialPaymentStatus.length > 1
                                                        }
                                                    />
                                                </div>
                                            </Col>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <PartialPayment
                                                        icon={
                                                            <div style={{ width: "100%", height: "100%" }}>
                                                                <img
                                                                    style={{
                                                                        width: "30%",
                                                                        marginTop: 20,
                                                                        marginBottom: 0,
                                                                    }}
                                                                    src="/assets/images/icon/cash.svg"
                                                                />
                                                                <Divider
                                                                    style={{
                                                                        marginTop: "20%",
                                                                        marginBottom: 0,
                                                                        height: "2rem",
                                                                        paddingTop: "40%",
                                                                    }}
                                                                    type="vertical"
                                                                />
                                                                <img
                                                                    style={{
                                                                        width: "35%",
                                                                        paddingTop: 20,
                                                                        margin: 0,
                                                                    }}
                                                                    src="/assets/images/icon/credit-card.svg"
                                                                />
                                                                <Divider
                                                                    style={{
                                                                        padding: 0,
                                                                        marginTop: 10,
                                                                        marginBottom: 0,
                                                                    }}
                                                                />
                                                                <img
                                                                    style={{
                                                                        width: "40%",
                                                                        padding: 0,
                                                                        margin: 0,
                                                                    }}
                                                                    src="/assets/images/icon/money-transfer.svg"
                                                                />
                                                            </div>
                                                        }
                                                        textButton={"Partial Payment"}
                                                        initForm={form}
                                                        total={getValue("debt_price_paid_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        isPartialPayment
                                                    // disabled
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </div>

                                <div className="pt-3 pb-2">
                                    <div className="border-bottom pb-2">
                                        <h1>จัดการเอกสาร/โปรโมชั่น</h1>
                                    </div>
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
                                    <div className="border-bottom pb-2">
                                        <h1>รายการส่วนลด</h1>
                                    </div>
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
                )}
            </ModalFullScreen>

            <style>
                {`
                    .ant-table-thead .ant-table-cell {
                        background-color: #C0C0C0;
                      }
                    `}
            </style>
        </>
    );
}

export default PaymentDocsV2