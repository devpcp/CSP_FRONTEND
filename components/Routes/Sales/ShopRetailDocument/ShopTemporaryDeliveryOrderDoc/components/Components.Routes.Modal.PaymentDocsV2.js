import { Button, Col, Divider, Form, Row, Table, Dropdown, message, Tooltip, Space, Checkbox } from 'antd'
import React from 'react'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalFullScreen from '../../../../../shares/ModalFullScreen'
import { useState } from 'react'
import { DollarCircleOutlined, DownOutlined, FileExcelOutlined, DollarOutlined, BankOutlined } from '@ant-design/icons'
import API from '../../../../../../util/Api'
import { useEffect, useCallback } from 'react'
import { get, isArray, isEmpty, isFunction, isPlainObject } from 'lodash'
import { useSelector } from 'react-redux'
import { RoundingNumber } from '../../../../../shares/ConvertToCurrency'
import ComponentsPayWithCash from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.Cash'
import ComponentsPayWithCreditCard from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.CreaditCard'
import ComponentsPayWithCashTransfer from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.CashTransfer'
import PartialPayment from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.PartialPayment'
import Debtor from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.Debtor'
import Cheque from '../../../Invoices/Payment/Components.Routes.Modal.PayWith.Cheque'
import Promotions from '../../../Invoices/DocumentsAndPromotions/Components.Routes.Modal.Promotions'
import ComponentsDiscount from '../../../Invoices/Discount/Components.Routes.Modal.Discount'
import Swal from 'sweetalert2'
import CarPreloader from '../../../../../_App/CarPreloader'
import moment from 'moment'

const PaymentDocsV2 = ({ docId, title, loading, handleCancelTemDoc, initForm, carPreLoading, setCarPreLoading, fromTable = false, serviceOrderDocObj = null }) => {
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
                    width: "30%",
                    align: "center",
                    render: (text, record, index) => {
                        if (text.change_name_status) {
                            return (
                                <div style={{ textAlign: "start" }}>{get(text, `changed_name`, "-")}</div>
                            )
                        } else {
                            return (
                                <div style={{ textAlign: "start" }}>{get(text, `meta_data.ShopProduct.Product.product_name.${locale.locale}`, "-")}</div>
                            )
                        }
                    },
                },
                // {
                //     title: () => GetIntlMessages("เปลื่ยนชื่อ"),
                //     dataIndex: 'details',
                //     key: 'details',
                //     width: "5%",
                //     align: "center",
                //     render: (text, record, index) => (<Checkbox disabled checked={text.change_name_status} />),
                // },
                {
                    title: () => GetIntlMessages("จำนวน"),
                    dataIndex: 'amount',
                    key: 'amount',
                    width: "10%",
                    align: "center",
                    render: (text, record, index) => !!text ? Number(text).toLocaleString() : "-",
                },
                {
                    title: () => GetIntlMessages("ราคา/หน่วย"),
                    dataIndex: 'price_unit',
                    key: 'price_unit',
                    width: "10%",
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
            const { data } = await API.get(`/shopTemporaryDeliveryOrderDoc/byId/${docId}`), { ShopPaymentTransactions } = isPlainObject(serviceOrderDocObj) ? serviceOrderDocObj : initForm.getFieldValue("ShopServiceOrderDoc")
            // console.log('data :>> ', data);
            if (data.status === "success") {
                const list_service_product = data.data.ShopTemporaryDeliveryOrderLists, model = data.data, payment_method_list = [...ShopPaymentTransactions]
                payment_method_list = payment_method_list.map(e => ({ ...e, type: e.payment_method, cash: e.payment_price_paid, showDeleteBtn: false })).filter(where => !where.canceled_payment_by)
                setDataSource(() => [...list_service_product])
                form.setFieldsValue({ ...model, payment_method_list })
                // const { shop_service_order_doc_id, id } = data.data
                // let res
                // res = await API.get(`/shopPaymentTransaction/all?shop_service_order_doc_id=${shop_service_order_doc_id}&shop_temporary_delivery_order_doc_id=${id}&filterShowOnlyNonCanceledPayment=false&page=1&limit=999999&sort=created_date&order=desc`)
                // // console.log('res :>> ', res);
                // if (res.data.status === "success") {

                //     const list_service_product = data.data.ShopTemporaryDeliveryOrderLists, model = data.data, payment_method_list = [...res.data.data.data]
                //     setDataSource([...list_service_product])
                //     form.setFieldsValue({ ...model, payment_method_list })
                // }

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
     * * 5 -> ลูกหนี้
     * @param {object} value - payment information
     * @param {boolean} isPartialPayment - is it Partial payment
     */
    const callbackPayment = async (type, value, isPartialPayment) => {
        try {
            setPaymentLoading(true)
            // console.log('value callbackPayment:>> ', value);
            const { shop_id } = authUser.UsersProfile, { shop_service_order_doc_id, doc_date, ShopServiceOrderDoc } = form.getFieldValue()
            /*เช็คว่าเป็นใบกำกับภาษีอย่างย่อหรือเต็มรูป*/
            const findTaxInovicesActiveDoc = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === shop_service_order_doc_id && where.status === 1) ?? null

            let res
            let model
            switch (type) {
                case 0:
                    model = {
                        shop_id,
                        shop_service_order_doc_id,
                        doc_date,
                        shopPaymentTransactions: value.shopPaymentTransactions.filter(where => !where.id)
                    }
                    break;
                case 1:
                    model = {
                        shop_id,
                        shop_service_order_doc_id,
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
                        shop_service_order_doc_id,
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
                        shop_service_order_doc_id,
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
                        shop_service_order_doc_id,
                        doc_date,
                        payment_method: type,
                        is_partial_payment: isPartialPayment,
                        ...value
                        // shopPaymentTransactions: value.shopPaymentTransactions.filter(where => !where.id)

                    }
                    break;
                case 5:
                    model = {
                        shop_id,
                        shop_service_order_doc_id,
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


                default:
                    break;
            }

            // console.log('model eiei:>> ', model);
            if (type !== 0) {
                res = await API.post(`/shopPaymentTransaction/add`, model)
            } else {
                res = await API.post(`/shopPaymentTransaction/addPartialPayments`, model)
            }

            // console.log('res :>> ', res);
            if (res.data.status === "success") {

                if (type === 4) {
                    try {
                        let resUpdateCheque
                        const { data } = await API.get(`/shopCheckCustomer/byid/${model.details.cheque_id}`)
                        if (data.status == "success") {
                            let dataApi = data.data[0]

                            let calRemaining = +model.details.cheque_amount_remaining - +model.payment_price_paid
                            let modelUpdateCheque = {}
                            modelUpdateCheque.details = dataApi.details
                            modelUpdateCheque.details.cheque_amount_remaining = MatchRound(calRemaining)
                            modelUpdateCheque.details.cheque_use_status = calRemaining <= 0 ? false : true

                            resUpdateCheque = await API.put(`/shopCheckCustomer/put/${model.details.cheque_id}`, modelUpdateCheque)
                        }
                    } catch (error) {
                        console.log("update Chque error : ", error)
                    }
                }

                let inputOptions = {
                    is_abb: GetIntlMessages("อย่างย่อ"),
                    is_inv: GetIntlMessages("เต็มรูป"),
                }
                if (isPlainObject(findTaxInovicesActiveDoc)) {
                    if (findTaxInovicesActiveDoc.is_abb) delete inputOptions.is_abb
                    if (findTaxInovicesActiveDoc.is_inv) delete inputOptions.is_inv
                }



                if (isEmpty(inputOptions)) {
                    Swal.fire({ title: 'ชำระสำเร็จ!!', icon: "success", timer: 2000, timerProgressBar: true, confirmButtonColor: mainColor, confirmButtonText: GetIntlMessages("submit") })
                    handleCancel()
                    if (isFunction(handleCancelTemDoc)) handleCancelTemDoc()
                } else {
                    Swal.fire({
                        title: GetIntlMessages("ชำระสำเร็จ!! ต้องการสร้างใบกำกับภาษีหรือไม่ ?"),
                        icon: 'question',
                        showCancelButton: true,
                        showDenyButton: true,
                        confirmButtonColor: mainColor,
                        denyButtonColor: "red",
                        input: "select",
                        inputOptions,
                        denyButtonText: GetIntlMessages("ไม่สร้าง"),
                        confirmButtonText: GetIntlMessages("สร้าง"),
                        cancelButtonText: GetIntlMessages("cancel")
                    }).then(async (result) => {
                        setPaymentLoading(true)
                        if (result.isConfirmed) {
                            let resTax
                            const DeliveryOrderModel = {
                                shop_service_order_doc_id,
                                [result.value]: true
                            }

                            if (!isPlainObject(findTaxInovicesActiveDoc)) {
                                resTax = await API.post(`/shopTaxInvoiceDoc/add`, DeliveryOrderModel)
                            } else {
                                delete DeliveryOrderModel.shop_service_order_doc_id
                                resTax = await API.put(`/shopTaxInvoiceDoc/put/${findTaxInovicesActiveDoc.id}`, DeliveryOrderModel)
                            }
                            if (resTax.data.status === "success") {
                                Swal.fire({ title: 'สร้างสำเร็จ!!', icon: "success", timer: 2000, timerProgressBar: true, confirmButtonColor: mainColor, confirmButtonText: GetIntlMessages("submit") })
                                handleCancel()
                                if (isFunction(handleCancelTemDoc)) handleCancelTemDoc()
                            } else {
                                Swal.fire({ title: 'สร้างไม่สำเร็จ!!', icon: "error", timer: 2000, timerProgressBar: true, confirmButtonColor: mainColor, confirmButtonText: GetIntlMessages("submit") })
                            }
                        } else if (result.isDenied) {
                            Swal.fire({ title: 'ชำระสำเร็จ!!', icon: "success", timer: 2000, timerProgressBar: true })
                            handleCancel()
                            if (isFunction(handleCancelTemDoc)) handleCancelTemDoc()
                        } else {
                            handleCancel()
                            if (isFunction(handleCancelTemDoc)) handleCancelTemDoc()
                        }
                        setPaymentLoading(false)
                    })
                }

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
            const { details, ShopServiceOrderDoc } = initForm.getFieldValue(), { ShopPaymentTransactions } = ShopServiceOrderDoc, { user_id } = details, currentDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

            ShopPaymentTransactions = ShopPaymentTransactions.filter(where => !where.canceled_payment_by)

            if (!!ShopPaymentTransactions && isArray(ShopPaymentTransactions) && ShopPaymentTransactions.length > 1) {
                isPartialPayment = true
            }
            const model = {
                canceled_payment_by: user_id,
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

                                handleCancelTemDoc()
                            } else if ((i + 1) === ShopPaymentTransactions.length && res.data.status !== "success") {
                                Swal.fire({
                                    title: GetIntlMessages("ยกเลิกไม่สำเร็จ !!"),
                                    text: "มีบางอย่างผิดพลาด..กรุณาติดต่อเจ้าหน้าที่",
                                    icon: "error",
                                    confirmButtonColor: mainColor,
                                    confirmButtonText: GetIntlMessages("submit")
                                })
                            }
                        }
                    } else {
                        res = await API.put(`/shopPaymentTransaction/put/${ShopPaymentTransactions[0].id}`, model)
                        if (res.data.status === "success") {
                            // console.log(" res.data.data", res.data.data)

                            if (res.data.data.current.payment_method === 4) {
                                try {
                                    let resUpdateCheque
                                    const { data } = await API.get(`/shopCheckCustomer/byid/${res.data.data.current.details.cheque_id}`)
                                    if (data.status == "success") {
                                        let dataApi = data.data[0]

                                        let calRemaining = (+dataApi.details.cheque_amount_remaining) + (+res.data.data.current.payment_price_paid)

                                        let modelUpdateCheque = {}
                                        modelUpdateCheque.details = dataApi.details
                                        modelUpdateCheque.details.cheque_amount_remaining = MatchRound(calRemaining)
                                        modelUpdateCheque.details.cheque_use_status = calRemaining <= 0 ? false : true

                                        resUpdateCheque = await API.put(`/shopCheckCustomer/put/${res.data.data.current.details.cheque_id}`, modelUpdateCheque)

                                    }
                                } catch (error) {
                                    console.log("updateCancelCheque", error)
                                }
                            }

                            Swal.fire({
                                title: GetIntlMessages("ยกเลิกสำเร็จ !!"),
                                icon: "success",
                                timer: 2000,
                                timerProgressBar: true,
                                confirmButtonColor: mainColor,
                                confirmButtonText: GetIntlMessages("submit")
                            })
                            handleCancelTemDoc()
                        } else {
                            Swal.fire({
                                title: GetIntlMessages("ยกเลิกไม่สำเร็จ !!"),
                                text: "มีบางอย่างผิดพลาด..กรุณาติดต่อเจ้าหน้าที่",
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
            {fromTable !== true ?
                (initForm.getFieldValue("status") == 1 && initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 1 || (initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 2) && initForm.getFieldValue("ShopServiceOrderDoc")?.ShopPaymentTransactions.filter(where => !where.canceled_payment_by && !where.canceled_payment_date).map(e => e?.is_partial_payment ?? false).every(val => val === false)) ? (
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
                ) : initForm.getFieldValue("status") == 1 && initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 2 ? (
                    <Dropdown.Button
                        icon={<DownOutlined />}
                        menu={menuProps}
                        className="payment-doc-dropdown-btn"
                        onClick={() => handleVisibleModal()}
                        disabled={initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status !== 2}
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
                ) : serviceOrderDocObj?.payment_paid_status === 2 ?
                    <Button
                        type="text"
                        // onClick={handleCarLoading}
                        onClick={handleVisibleModal}
                        loading={loading}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: 0,
                            color: "orange",
                            fontSize: 16
                        }}
                    >
                        {GetIntlMessages("ค้างชำระ")}
                    </Button>
                    :
                    <Button
                        type="text"
                        // onClick={handleCarLoading}
                        onClick={handleVisibleModal}
                        loading={loading}
                        style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            border: 0,
                            color: "red",
                            fontSize: 16
                        }}
                    >
                        {GetIntlMessages("ยังไม่ชำระ")}
                    </Button>
            }

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
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0 && initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
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
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0 && initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
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
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        disabled={
                                                            !!isPartialPaymentStatus && isPartialPaymentStatus.length !== 0 && initForm.getFieldValue("ShopServiceOrderDoc")?.payment_paid_status === 2 && isPartialPaymentStatus.every(val => val.is_partial_payment === true) ? true : false
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
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                        isPartialPayment
                                                    // disabled
                                                    />
                                                </div>
                                            </Col>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <Debtor
                                                        icon={
                                                            <DollarOutlined style={{ fontSize: "5.5rem" }} />
                                                        }
                                                        textButton={"ลูกหนี้"}
                                                        initForm={form}
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                    // isPartialPayment
                                                    // disabled
                                                    />
                                                </div>
                                            </Col>
                                            <Col xl={6} lg={12} md={6} sm={12} xs={12}>
                                                <div>
                                                    <Cheque
                                                        icon={
                                                            <BankOutlined style={{ fontSize: "5.5rem" }} />
                                                        }
                                                        textButton={"เช็ค"}
                                                        initForm={form}
                                                        total={getValue("price_grand_total")}
                                                        callback={callbackPayment}
                                                        loading={loading || paymentLoading}
                                                    // isPartialPayment
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