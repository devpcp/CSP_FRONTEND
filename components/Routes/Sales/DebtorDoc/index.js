import { CarOutlined, FileAddOutlined, UserOutlined, DownOutlined, DollarOutlined, FileImageOutlined } from '@ant-design/icons'
import { Button, Col, Form, message, Row, Tabs, Dropdown, Space, Menu, Badge, Modal } from 'antd'
import { forEach, get, isArray, isEmpty, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../util/Api'
import GetIntlMessages from '../../../../util/GetIntlMessages'
import { RoundingNumber, takeOutComma } from '../../../shares/ConvertToCurrency'
import ModalFullScreen from '../../../shares/ModalFullScreen'
import PrintOut from '../../../shares/PrintOut'
import SearchInput from '../../../shares/SearchInput'
import TableList from '../../../shares/TableList'
import CarPreloader from '../../../_App/CarPreloader'
import FormTemporaryDeliveryOrderDoc from './components/Components.Routes.Modal.FormDebtorDoc'
import Tab1ServiceAndProductV2 from './components/Components.Routes.Modal.Tab1.DocumentDebtLists'
import TabPaymentInfo from './components/Components.Routes.Modal.Tab.PaymentInfo'
import PaymentDocs from './components/Components.Routes.Modal.PaymentDocsV2'
import Tab4DocImage from './components/Components.Routes.Modal.Tab4.DocImage'
import { UploadImageCustomPathMultiple, DeleteImageCustomPathMultiple } from '../../../shares/FormUpload/API'

const DebtorDoc = ({ docTypeId }) => {

    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes } = useSelector(({ master }) => master);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี
    const [disabledWhenDeliveryDocActive, setDisabledWhenDeliveryDocActive] = useState(false)
    const [disabledWhenTaxInvoiceDocActive, setDisabledWhenTaxInvoiceDocActive] = useState(false)
    const [paymentTransactions, setPaymentTransactions] = useState([])
    const [isEditImageModalVisible, setIsEditImageModalVisible] = useState(false);

    const [form] = Form.useForm();
    const [formEditImage] = Form.useForm();
    const [idEdit, setIsIdEdit] = useState(null);

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        // getTextDocumentTypes()
        getMasterData()
        // configPrintOut()
    }, [])




    /**
    * ค่าเริ่มต้นของ
    *  - configTable = Config ตาราง
    *  - configSort = เรียงลำดับ ของ ตาราง
    *  - modelSearch = ตัวแปล Search
    */
    const init = {
        configTable: {
            page: 1,
            total: 0,
            limit: 10,
            sort: "code",
            order: "descend",
            column: {
                created_by: false,
                created_date: false,
                updated_by: true,
                updated_date: true,
                status: true
            },
            title: {
                not_use_system: "ยกเลิกเอกสาร"
            },
            disabled: {
                active_btn: disabledWhenDeliveryDocActive ? true : false,
                block_btn: true,
                delete_btn: true,
            }
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "active",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const getMasterData = async () => {
        try {
            const [value1] = await Promise.all([getTextDocumentTypes()])
            const find = value1.find(where => where.id === docTypeId)
            setDocumentTypesName(find.type_name[locale.locale])

        } catch (error) {

        }
    }

    const [documentTypesName, setDocumentTypesName] = useState("")
    const getTextDocumentTypes = async () => {
        try {
            const { data } = await API.get(`/master/documentTypes`);
            return data.status === "success" ? data.data ?? [] : []
        } catch (error) {

        }

    }

    const { enable_ShopSalesTransaction_legacyStyle } = authUser?.UsersProfile?.ShopsProfile?.shop_config
    /**
     * ตั้งค่าหน้า
     */
    const configPage = (type) => {
        try {
            // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
            const { status } = form.getFieldValue()
            if (!!status) status = status.toString()
            switch (type) {
                case "title":
                    if (enable_ShopSalesTransaction_legacyStyle) {
                        if (status === "2") {
                            return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                        } else if (status === "3") {
                            return GetIntlMessages("ใบกำกับภาษี")
                            // return GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี")
                        }
                    }
                    break;
                case "table-status-2":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ยกเลิกเอกสาร")
                    // if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                    break;
                case "table-status-3":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ลบเอกสาร")
                    // if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบกำกับภาษี")
                    break;
                case "btn-status":
                    if (enable_ShopSalesTransaction_legacyStyle && status === "1") return GetIntlMessages("สร้างใบส่งสินค้าชั่วคราว")
                    break;
                case "btn-payment":
                    if (enable_ShopSalesTransaction_legacyStyle && status === "2") return GetIntlMessages("สร้างใบกำกับภาษี")
                    break;
                case "style":
                    if (enable_ShopSalesTransaction_legacyStyle) return { width: "auto" }
                    break;

                default: return null
            }
        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setColumnsTable(value.status)
        setModelSearch(value)
        getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /** 
    * ตั้งค่า Form ค้นหา 
    *  - search = list input ค้นหา
    *  - col = ของ antd 
    *  - button = ตั้งค่าปุ่มด้านขวา
    *    - download = ปุ่ม download 
    *    - import = ปุ่ม import 
    *    - export = ปุ่ม export 
    * */
    const configSearch = {
        search: [
            {
                index: 1,
                type: "input",
                name: "search",
                label: GetIntlMessages("search"),
                placeholder: GetIntlMessages("search"),
                list: null,
            },
            {
                index: 1,
                type: "select",
                name: "status",
                label: GetIntlMessages("สถานะใบรับชำระลูกหนี้"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    {
                        key: GetIntlMessages("all-status"),
                        value: "default",
                    },
                    {
                        key: GetIntlMessages("ใช้งานเอกสาร"),
                        value: "active",
                    },
                    {
                        key: GetIntlMessages("ยกเลิกเอกสาร"),
                        value: "block",
                    },
                    // {
                    //     key: configPage("table-status-3") ?? GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี"),
                    //     value: "delete",
                    // },
                ],
            },
        ],
        col: 8,
        button: {
            create: true,
            name: {
                add: GetIntlMessages(`สร้าง`),
            },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    const getCustomerDataTable = (record, type) => {
        // ShopPersonalCustomers ลูกค้าบุคคลธรรมดา
        // ShopBusinessCustomers ลูกค้าธุรกิจ
        const { ShopPersonalCustomer, ShopBusinessCustomer } = record;
        const model = {
            code: null,
            type: null,
            name: null,
            mobile_no: null,
            tel_no: null,
        };
        if (isPlainObject(ShopPersonalCustomer)) { //ลูกค้าบุคคลธรรมดา
            const { first_name, last_name } = ShopPersonalCustomer.customer_name
            const { mobile_no, tel_no, master_customer_code_id } = ShopPersonalCustomer
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = first_name[locale.locale] + " " + last_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าบุคคลธรรมดา"
        } else if (isPlainObject(ShopBusinessCustomer)) { // ลูกค้าธุรกิจ
            const { mobile_no, tel_no, master_customer_code_id } = ShopBusinessCustomer
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = ShopBusinessCustomer.customer_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าธุรกิจ"
        } else {
            return "-";
        }
        return model[type] ?? "-"
    }

    const setColumnsTable = (searchStatus) => {
        const _column = [];
        _column.push(
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 100,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: () => GetIntlMessages(`เลขที่${configPage("table-status-2")}`),
                dataIndex: 'details',
                key: 'details',
                width: 180,
                align: "center",
                render: (text, record) => get(text, `ShopDocumentCode.TRN.code_id` ?? "-", "-")
            },
            {
                title: () => GetIntlMessages(`เลขที่${configPage("table-status-3")}`),
                dataIndex: 'details',
                key: 'details',
                width: 180,
                align: "center",
                render: (text, record) => get(text, `ShopDocumentCode.INV.code_id` ?? "-", "-")
            },
            {
                title: () => GetIntlMessages("เลขที่เอกสาร"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 180,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "start" }}>{text ?? ""}</div>
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            // {
            //     title: () => GetIntlMessages("เลขทะเบียน"),
            //     dataIndex: 'ShopVehicleCustomer',
            //     key: 'ShopVehicleCustomer',
            //     width: 150,
            //     align: "center",
            //     // render: (text, record) => console.log('record :>> ', record),
            //     render: (text, record) => isPlainObject(text) ? text.details.registration : "-",
            // },
            {
                title: () => GetIntlMessages("รหัสลูกค้า"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => getCustomerDataTable(record, "code"),
            },
            {
                title: () => GetIntlMessages("ชื่อลูกค้า"),
                dataIndex: '',
                key: '',
                width: 250,
                // align: "center",
                render: (text, record) => getCustomerDataTable(record, "name"),
            },
            {
                title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                render: (text, record) => !!text ? <div style={{ textAlign: "end" }}>{RoundingNumber((text)) ?? "-"}</div> : "-",
            },
            {
                title: () => GetIntlMessages("สถานะการชำระเงิน"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('record :>> ', record),
                render: (text, record) => {
                    const payment_paid_status = get(record, `payment_paid_status`, null)
                    switch (payment_paid_status) {
                        case 1:
                        case 2:
                            return (
                                <PaymentDocs fromTable={true} debtDocObj={record} docId={record?.id} title={`ชำระเงิน ใบรับชำระลูกหนี้ ${record?.code_id ?? ""}`} handleCancelDebtDoc={handleCancel} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                // <span className='color-red font-16'>ยังไม่ชำระ</span>
                            )
                        case 2:
                            return (
                                <span style={{ color: "orange", fontSize: 16 }}>ค้างชำระ</span>
                            )
                        case 3:
                            return (
                                <span className='color-green font-16'>ชำระเงินแล้ว</span>
                            )
                        case 4:
                            return (
                                <span style={{ color: "#DFFF00", fontSize: 16 }}>ชําระเกิน</span>
                            )

                        default:
                            return (
                                <span> - </span>
                            )
                    }
                },
            },
            {
                title: () => GetIntlMessages("พิมพ์"),
                dataIndex: 'details',
                key: 'details',
                width: 120,
                align: "center",
                render: (text, record) => {
                    let DebtorBillingPrintButton = {}
                    if (record?.details?.ref_doc !== "") {
                        DebtorBillingPrintButton = { print_out_DebtorBilling: { status: true, name: "ใบวางบิล/ใบแจ้งหนี้", price_use: 1, documentIdPerbutton: record?.details?.ref_doc } }
                    }

                    return (
                        <PrintOut morePrintOuts={{ ...DebtorBillingPrintButton, print_out_Debtor: { status: true, name: "ใบรับชำระลูกหนี้", price_use: 1, footSign: { left: "ผู้ชำระ", right: "ผู้รับชำระ" } }, print_out_invoices: { status: true, name: "ใบเสร็จรับเงิน", price_use: 1, footSign: { left: "ผู้จ่ายเงิน", right: "ผู้รับเงิน" } } }} textButton={GetIntlMessages("print")} loading={loading} documentId={record?.id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: 10 }} docTypeId={docTypeId} />
                    )
                },
            },
            {
                title: () => GetIntlMessages("รูป"),
                dataIndex: 'details',
                key: 'details',
                width: 120,
                align: "center",
                render: (text, record) => {

                    let { upload_payment_list } = record.details
                    let checkPaymentImage = isArray(upload_payment_list) ? upload_payment_list.length > 0 : false

                    let checkHaveImage = checkPaymentImage
                    return (
                        <>
                            <Badge dot={checkHaveImage}>
                                <Button type='text' onClick={() => handleOpenEditImageModal(record)} icon={<FileImageOutlined style={{ fontSize: "18px" }} />}></Button>
                            </Badge>
                        </>
                    )
                },

            },
            // {
            //     title: () => GetIntlMessages("หมายเหตุ(ภายใน)"),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 250,
            //     align: "center",
            //     render: (text, record) => get(text, `remark_inside`, "-") ?? "-",
            // },

        )
        switch (enable_ShopSalesTransaction_legacyStyle) {
            case true:
                if (searchStatus === "1") {
                    delete _column[1]
                    delete _column[2]
                } else if (searchStatus === "2") {
                    delete _column[2]
                } else if (searchStatus === "3") {
                    delete _column[1]
                } else {
                    delete _column[1]
                    delete _column[2]
                }
                break;

            default:
                delete _column[1]
                delete _column[2]
                break;
        }

        setColumns(_column)
    }



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch?.status ?? "active" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopCustomerDebtDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}`)
            // const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
            // console.log('res :>> ', res);
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data = data.map(e => {
                    if (e.payment_paid_status !== 1) {
                        e.___update = false
                    }
                    e.___delete = false
                    e.isuse = e.status === 2 ? 0 : e.status == 0 ? 2 : e.status
                    return {
                        ...e
                    }
                });
                // console.log('data :>> ', data);
                setColumnsTable(_status)
                setListSearchDataTable(() => data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                // console.log(`res.data`, res.data)
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            setLoading(true)
            // delete,active,block
            //เนื่องจาก
            const status = isuse === 0 ? 2 : isuse == 2 ? 0 : 1 // api 0 คือ ลบเอกสาร แต่ front 0 คือ ยกเลิก , api 2 คือ ยกเลิก แต่ front 2 คือ ลบ 
            // // console.log('changeStatus :>> ', status, id);
            // console.log('isuse', isuse)

            Swal.fire({
                title: GetIntlMessages(`ยืนยันการ${status === 0 ? `ลบเอกสาร` : status === 2 ? `ยกเลิกเอกสาร` : "เปลี่ยนเป็นสถานะปกติ"}หรือไม่ !?`),
                text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการยกเลิกเอกสารครั้งนี้ได้ !!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoading(true)
                    const { data } = await API.put(`/shopCustomerDebtDoc/put/${id}`, { status })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status
                        })
                        Swal.fire(
                            'บันทึกข้อมูลสำเร็จ!!',
                            `เอกสารถูก${status === 0 ? `ลบเอกสาร` : status ? `ยกเลิกเอกสาร` : "เปลี่ยนเป็นสถานะปกติ"}แล้ว`,
                            'success'
                        )
                    } else {
                        Swal.fire(
                            'มีบางอย่างผิดพลาด !!!',
                            'แก้ไขไม่สำเร็จ',
                            'error'
                        )
                    }
                    setLoading(false)
                }
            })
            setLoading(false)
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        modeKey: null,
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [checkedIsuse, setCheckedIsuse] = useState(false);

    const handleCancel = () => {
        setLoading(() => true)
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        setDisabledWhenDeliveryDocActive(false)
        setDisabledWhenTaxInvoiceDocActive(false)
        setActiveKeyTab("1")
        setIsIdEdit(null)
        form.setFieldsValue({
            isModalVisible: false
        })
        // docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" ? form.setFieldsValue({
        //     customer_type: "business",
        // }) : ""
        // setIsModeInvoices(false)

        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        //  window.location.reload()
        setLoading(() => false)
    }

    // const [, set] = useState(second)
    /* addEditView */
    const addEditViewModal = async (mode, id, isPayment, isInovices) => {
        try {
            setLoading(true)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/shopCustomerDebtDoc/byId/${id}`)
                // console.log('data addEditViewModal :>> ', data);
                if (data.status == "success") {
                    // setDataSendToComponeteToPrint(data.data)
                    setIsIdEdit(id)
                    setFormValueData(data.data)
                }
            } else {
                form.setFieldsValue({
                    customer_type: "business",
                    doc_type_id: docTypeId,
                    tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                    user_list: [],
                    user_id: authUser.id,
                    status: "1",
                    doc_date: moment(new Date()),
                    isModalVisible: true,
                    list_service_product: [],
                    vehicles_customers_list: [],
                    customer_list: [],
                    customer_phone_list: [],
                    // repair_man_list : [],
                    easy_search_list: [],
                    debtor_billing_list: [],
                    upload_payment_list: [],
                    upload_remove_list: []
                })
            }
            // setActiveKeyTab("1")
            setIsModalVisible(true)
            setLoading(false)
        } catch (error) {
            console.log('error addEditViewModal:>> ', error);
        }
        // setMode(_mode)

    }

    const setFormValueData = async (value) => {
        try {
            setCarPreLoading(true)
            // console.log('value setFormValueData:>> ', value);
            const { ShopCustomerDebtLists, details, bus_customer_id, per_customer_id, ShopPersonalCustomer, ShopBusinessCustomer } = value, customer_type = !!per_customer_id ? "person" : "business", debtor_billing_list = [];;
            const filterPayment = value.ShopPaymentTransactions.filter(where => !where.canceled_payment_by && !where.canceled_payment_date);
            setPaymentTransactions(filterPayment)
            // console.log("filterPayment", filterPayment)
            ShopCustomerDebtLists.sort((a, b) => a.seq_number - b.seq_number)
            function customCustomerName(arr, type) {
                if (type === "person") {
                    return arr.map(e => { return { ...e, customer_full_name: `${e.customer_name.first_name[locale.locale]} ${e.customer_name.last_name[locale.locale]}` } })
                } else {
                    return arr.map(e => { return { ...e, customer_full_name: `${e.customer_name[locale.locale]}` } })
                }
            }
            if (!!details.ref_doc) {
                const { data } = await API.get(`/shopCustomerDebtBillingNoteDoc/byId/${details.ref_doc}`)
                if (data.status === "success") {
                    debtor_billing_list = [data.data]
                }

            }

            const model = {
                ...value,
                ref_doc: details.ref_doc ?? null,
                debtor_billing_list,
                shopCustomerDebtLists: ShopCustomerDebtLists.map(e => {

                    return {
                        ...e,
                        doc_type_code_id: e.ShopCustomerDebtCreditNoteDoc !== null ? e.ShopCustomerDebtCreditNoteDoc?.doc_type_code_id : e.ShopCustomerDebtCreditNoteDocT2 !== null ? e.ShopCustomerDebtCreditNoteDocT2?.code_id_prefix : e.ShopCustomerDebtDebitNoteDoc?.doc_type_code_id
                    }
                }),
                doc_date: moment(value.doc_date),
                debt_due_date: moment(value.debt_due_date),
                customer_type,
                customer_list: customer_type === "person" ? customCustomerName([ShopPersonalCustomer], customer_type) : customCustomerName([ShopBusinessCustomer], customer_type),
                customer_id: customer_type === "person" ? per_customer_id : bus_customer_id,
                remark: details.remark ?? null,
                remark_inside: details.remark_inside ?? null,
                upload_payment_list: details?.upload_payment_list ?? [],
                upload_remove_list: [],
            }

            if (isArray(filterPayment) && filterPayment.length > 0) {

                function getPaymentData(arr, key) {
                    switch (key) {
                        case "payment_method":
                            return arr.map(e => {
                                switch (e[key]) {
                                    case 1:
                                        return "เงินสด"
                                    case 2:
                                        return "เครดิต/เดบิต"
                                    case 3:
                                        return "โอนเงินสด"
                                    case 4:
                                        return "เช็ค"
                                    case 5:
                                        return "ลูกหนี้"
                                    default:
                                        return "-"
                                }
                            })
                        // return arr.map(e => e[key] === 1 ? "เงินสด" : e.payment_method === 2 ? "เครดิต/เดบิต" : "โอนเงินสด")

                        case "payment_price_paid":
                            if (filterPayment.length === 1) {
                                return arr.map(e => RoundingNumber(e?.["details"]?.["actual_paid"] ?? e?.[key]) ?? null).filter(where => where !== null) ?? null
                            } else {
                                return arr.map(e => e["payment_method"] === 1 ? `${RoundingNumber(e[key])} (เงินสด)` : e.payment_method === 2 ? `${RoundingNumber(e[key])} (เครดิต/เดบิต)` : e.payment_method === 3 ? `${RoundingNumber(e[key])} (โอนเงินสด)` : e.payment_method === 4 ? `${RoundingNumber(e[key])} (เช็ค)` : e.payment_method === 5 ? `${RoundingNumber(e[key])} (ลูกหนี้)` : "ไม่ระบุ")
                            }
                        case "change":
                            if (filterPayment.length === 1) {
                                return arr.map(e => RoundingNumber(e?.["details"][key]) ?? null).filter(where => where !== null) ?? null
                            }
                        case "payment_paid_date":
                            return !!arr[arr.length - 1][key] ? moment(arr[arr.length - 1][key]) : null
                        case "remark":
                            return arr.map(e => e["payment_method"] === 1 ? e["details"][key] : e.payment_method === 2 ? e["details"][key] : e["details"][key]).filter(where => where !== null).join(" , ")
                        default:
                            break;
                    }

                }

                let payment_type = getPaymentData(
                    filterPayment,
                    "payment_method"
                ),
                    price = getPaymentData(filterPayment, "payment_price_paid"),
                    change = getPaymentData(filterPayment, "change"),
                    payment_date = getPaymentData(
                        filterPayment,
                        "payment_paid_date"
                    ),
                    remark = getPaymentData(filterPayment, "remark");
                model.payment = {
                    payment_type,
                    price,
                    payment_date,
                    remark,
                    change,
                }
                model.filterPayment = filterPayment
            }
            console.log("modelmodel", model)
            form.setFieldsValue({ ...model })
            calculateResult();
            setCarPreLoading(false)
        } catch (error) {
            setCarPreLoading(false)
            console.log('error setFormValueData:>> ', error);
        }
    }

    /* Tabs*/
    const handleChangeTabs = (key) => {
        try {
            setActiveKeyTab(() => key)
        } catch (error) {

        }
    }
    /* end Tabs*/

    const ModalFullScreenTitle = ({ title, isShowTittle }) => {
        const { code_id, TRN_code_id, INV_code_id } = form.getFieldValue()
        const { status } = form.getFieldValue()
        // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
        const isShowButtonstatus1 = () => {

            return (configModal.mode == "edit") && status == 1 && isShowTittle == false
        }

        const onClickButtonstatus1 = () => {
            const { id, list_service_product } = form.getFieldValue()

            let checkObjIsEmpty = false
            let countEmpty = 0
            const emptyListLog = []
            list_service_product.map((e, index) => {
                if (isEmpty(e) || !e?.id) countEmpty++, emptyListLog.push(index)
            })
            if (countEmpty == list_service_product.length) checkObjIsEmpty = true
            if (isArray(list_service_product) && checkObjIsEmpty === true) {
                Swal.fire({
                    title: 'ไม่มีสินค้าในรายการ !!',
                    icon: 'warning',
                    confirmButtonColor: mainColor,
                    confirmButtonText: 'ตกลง',
                    cancelButtonText: 'ยกเลิก'
                })
            } else {
                if (emptyListLog.length > 0) {
                    Swal.fire({
                        title: `รายการที่ ${emptyListLog.map(e => e).join(" , ")} มีข้อมูลไม่ครบถ้วน!!`,
                        // text: "สถานะจะถูกเปลี่ยนเป็นดำเนินการเรียบร้อย",
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonColor: mainColor,
                        confirmButtonText: 'ตกลง',
                        // cancelButtonText: 'ยกเลิก'
                    })
                } else {
                    Swal.fire({
                        title: 'ยืนยันการทำรายการ?',
                        text: `สถานะจะถูกเปลี่ยนเป็น ${configPage("table-status-2") ?? `ดำเนินการเรียบร้อย`}`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'ตกลง',
                        cancelButtonText: 'ยกเลิก'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await onFinish(form.getFieldValue(), true)
                            await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: 2 }).then(async ({ data }) => {
                                if (data.status != "success") {
                                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                                } else {
                                    const { ShopDocumentCode } = data.data.details
                                    Swal.fire(
                                        'บันทึกสำเร็จ',
                                        `เปลี่ยนสถานะเป็น${configPage("table-status-2") ?? `ดำเนินการเรียบร้อย`}`,
                                        'success'
                                    )
                                    form.setFieldsValue({ status: data.data.status, TRN_code_id: ShopDocumentCode?.TRN?.code_id ?? null })
                                    setConfigModal(() => ({ ...configModal, mode: 'edit', modeKey: null }))

                                    await getDataSearch({
                                        page: configTable.page,
                                        search: modelSearch.search,
                                        _status: modelSearch.status,
                                    })
                                    // handleCancel()
                                }

                            })

                        }
                    })
                }

            }


        }
        return (
            <>
                {isShowTittle ?
                    <>
                        <span className='pr-2'> {GetIntlMessages(configModal.mode == "view" ? "view-data" : configModal.mode == "edit" ? "edit-data" : "สร้าง")} {`${configPage("title") ?? title} ${form.getFieldValue("is_draft") ? `(ฉบับร่าง)` : ""}`}</span>
                        <span >{(enable_ShopSalesTransaction_legacyStyle === false) ? code_id : status == 1 ? code_id : status == 2 ? TRN_code_id : status == 3 ? INV_code_id : null}</span>
                    </>
                    : null}

                {
                    isShowButtonstatus1() ?
                        <span style={{ paddingLeft: 15 }}>
                            <Button style={{ borderColor: "#000000" }} onClick={onClickButtonstatus1}>{configPage("btn-status") ?? GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? "ยืนยันใบสั่งขาย" : "ดำเนินการเรียบร้อย")}</Button>
                        </span> : null
                }
            </>
        )
    }

    /* end Modal */

    /*finish*/
    const handleOk = (modeKey) => {
        try {
            // form.submit()
            setLoading(() => true)
            // console.log('modeKey :>> ', modeKey);
            setConfigModal({ ...configModal, modeKey })
            // form.validateFields().then(async (values) => {
            //     console.log('values validateFields:>> ', values);
            //     // await onFinish(values)
            //     // setIsModalVisible(false)
            //     // if (modeKey == 2) handleCancel()

            // }).catch((errorInfo) => console.log('errorInfo :>> ', errorInfo));
            form.submit()
            setLoading(() => false)
        } catch (error) {
            console.log('error handleOk:>> ', error);
        }

    }

    const onFinish = async (values) => {
        try {
            console.log('values :>> ', values);
            setLoading(true)
            setCarPreLoading(true)

            const {
                customer_type,
                debt_price_paid_total,
                customer_id,
                shopCustomerDebtLists,
                doc_date,
                debt_due_date,
                remark,
                remark_inside,
                customer_credit_debt_unpaid_balance,
                customer_credit_debt_current_balance,
                customer_credit_debt_approval_balance,
                customer_credit_debt_payment_period,
            } = values;


            let shopId = authUser?.UsersProfile?.shop_id
            let directory = "shopDebtorDocument"
            let upload_payment_list = []

            if (values.upload_payment_list) {
                if (values?.upload_payment_list?.fileList?.length > 0) {
                    await Promise.all(values.upload_payment_list.fileList.map(async (e, index) => {
                        await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "payment" }).then(({ data }) => {
                            if (data.status === "success") {
                                try {
                                    upload_payment_list.push(
                                        {
                                            uid: index,
                                            name: e.name,
                                            status: 'done',
                                            url: process.env.NEXT_PUBLIC_DIRECTORY + data.data.path,
                                            path: data.data.path
                                        }
                                    )
                                    e.url = process.env.NEXT_PUBLIC_DIRECTORY + data.data.path
                                    e.path = data.data.path
                                } catch (error) {
                                    console.log("error: ", error)
                                }
                            } else if (data.status === "failed") {
                                e.path = e.url.split(process.env.NEXT_PUBLIC_DIRECTORY)[1]
                                // message.error(`รูปที่ ${index + 1} : ${data.data}`)
                            }
                        })
                    })
                    )
                }
            }

            if (values.upload_remove_list) {
                if (values?.upload_remove_list?.length > 0) {
                    await Promise.all(values.upload_remove_list.map(async (e, index) => {
                        await DeleteImageCustomPathMultiple(e.path).then(({ data }) => {
                            if (data.status === "success") {
                                try {

                                } catch (error) {
                                    console.log("error: ", error)
                                }
                            } else if (data.status === "failed") {
                            }
                        })
                    })
                    )
                }
            }


            const model = {
                shop_id: authUser.UsersProfile.shop_id,
                doc_type_id: docTypeId,
                doc_date: moment(doc_date).format("YYYY-MM-DD"),
                debt_due_date: moment(debt_due_date).format("YYYY-MM-DD"),
                [customer_type === "person" ? "per_customer_id" : "bus_customer_id"]: customer_id,
                customer_credit_debt_unpaid_balance: !!customer_credit_debt_unpaid_balance ? MatchRound(customer_credit_debt_unpaid_balance) : '0.00',
                customer_credit_debt_current_balance: !!customer_credit_debt_current_balance ? MatchRound(customer_credit_debt_current_balance) : '0.00',
                customer_credit_debt_approval_balance: !!customer_credit_debt_approval_balance ? MatchRound(customer_credit_debt_approval_balance) : '0.00',
                customer_credit_debt_payment_period,
                debt_price_paid_total: !!debt_price_paid_total ? MatchRound(debt_price_paid_total) : "0.00",
                details: {
                    ref_doc: values.ref_doc ?? null,
                    remark,
                    remark_inside,
                    upload_payment_list: await values.upload_payment_list.fileList === undefined ? await values.upload_payment_list : values.upload_payment_list.fileList,
                },
                shopCustomerDebtLists: !!shopCustomerDebtLists && shopCustomerDebtLists.length > 0 ?
                    shopCustomerDebtLists.map((e, index) => {
                        const _model = {
                            id:
                                !!e?.is_new_item && e?.is_new_item === true
                                    ? null
                                    : e.id,
                            // id: configModal.mode === 'add' ? null : e?.is_draft === false ? null : e.id,
                            // id: e.is_draft === false ? null : e.id,
                            seq_number: index + 1,
                            // shop_service_order_doc_id: e?.is_draft === false ? e.id : e.shop_service_order_doc_id,
                            doc_date: moment(e.doc_date).format("YYYY-MM-DD"),
                            debt_due_date: !!e.debt_due_date
                                ? moment(e.debt_due_date).format("YYYY-MM-DD")
                                : moment(
                                    moment(e?.doc_date).add(
                                        Number(
                                            form.getFieldValue(
                                                "customer_credit_debt_payment_period"
                                            )
                                        ),
                                        "d"
                                    )
                                ).format("YYYY-MM-DD"),
                            debt_price_amount: MatchRound(+e.debt_price_amount) ?? "0.00",
                            debt_price_amount_left: MatchRound(+e.debt_price_amount_left) ?? "0.00",
                            debt_price_paid_total: !!e.debt_price_paid_total ? MatchRound(e?.debt_price_paid_total ?? 0) : "0.00",
                            debt_price_paid_adjust: !!e.debt_price_paid_adjust ? MatchRound(e?.debt_price_paid_adjust ?? 0) : "0.00",
                            [e.doc_type_code_id === "CCN"
                                ? "shop_customer_debt_cn_doc_id"
                                : e.doc_type_code_id === "CDN"
                                    ? "shop_customer_debt_dn_doc_id"
                                    : e.doc_type_code_id === "NCN" ?
                                        "shop_customer_debt_cn_doc_id_t2"
                                        : "shop_service_order_doc_id"]: docValue(e, index, values.ref_doc)
                        };

                        return _model
                    })
                    : []
            }
            // console.log("configModal.mode", configModal.mode)
            console.log('model :>> ', model);
            // console.log('test', model.shopCustomerDebtLists.shop_service_order_doc_id)


            let res

            if (configModal.mode === "add") {
                res = await API.post(`/shopCustomerDebtDoc/add`, model)
            } else if (configModal.mode === "edit") {
                const { id } = form.getFieldValue()
                res = await API.put(`/shopCustomerDebtDoc/put/${id}`, model)
            }

            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบรับชำระลูกหนี้สำเร็จ !!"),
                    icon: "success",
                    timer: 2000
                })
                handleCancel()

            } else {
                Swal.fire({
                    title: GetIntlMessages("บันทึกไม่สำเร็จ..กรุณาติดต่อเจ้าหน้าที่ !!"),
                    text: res.data.data,
                    icon: "error",
                })
            }

            setLoading(false)
            setCarPreLoading(false)

        } catch (error) {
            setLoading(false)
            setCarPreLoading(false)
            console.log('error :>> ', error);
        }
    }

    const resultSubmit = (res) => {
        try {
            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบรับชำระลูกหนี้สำเร็จ !!"),
                    icon: "success",
                    timer: 2000
                })
                handleCancel()

            } else {
                Swal.fire({
                    title: GetIntlMessages("บันทึกไม่สำเร็จ..กรุณาติดต่อเจ้าหน้าที่ !!"),
                    text: res.data.data,
                    icon: "error",
                })
            }
        } catch (error) {

        }
    }

    const onFinishFailed = () => {
        try {

        } catch (error) {

        }
    }
    /*end finish*/

    const calculateResult = () => {
        try {
            const { list_service_product, price_discount_bill, tax_type_id, shopCustomerDebtLists } = form.getFieldValue()
            price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0, debt_price_paid_total = 0, total_balance = 0, debt_price_paid_adjust = 0;

            function summaryFromTable(arr, key, mutiplyWithAmount = false) {
                if (mutiplyWithAmount) {
                    return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                } else {
                    return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
                }

            }
            console.log("shopCustomerDebtLists", shopCustomerDebtLists)
            if (!!shopCustomerDebtLists && isArray(shopCustomerDebtLists) && shopCustomerDebtLists.length > 0) {
                // debt_price_paid_total = summaryFromTable(shopCustomerDebtLists, "debt_price_paid_total")
                total_balance = summaryFromTable(shopCustomerDebtLists, "debt_price_amount_left")
                debt_price_paid_total = summaryFromTable(shopCustomerDebtLists, "debt_price_paid_total")
                debt_price_paid_adjust = summaryFromTable(shopCustomerDebtLists, "debt_price_paid_adjust")
                // console.log(debt_price_paid_total)
                // console.log(debt_price_paid_adjust)
                console.log("total_balance", total_balance)
                let isNegativeNumeber = false
                if (Math.sign(price_sub_total) == -1) {
                    isNegativeNumeber = true
                }
                price_sub_total = isNegativeNumeber ? (total_balance + debt_price_paid_total) : total_balance - (debt_price_paid_total + debt_price_paid_adjust)
            }


            form.setFieldsValue({
                debt_price_paid_total,
                total_balance,
                price_sub_total
            })
        } catch (error) {
            console.log('error calculateResult :>> ', error);
        }
    }

    /*invoices button*/
    const [taxInvoiceTypeAbbActive, setTaxInvoiceTypeAbbActive] = useState(null)
    const [taxInvoiceTypeInvActive, setTaxInvoiceTypeInvActive] = useState(null)
    const handleMenuClick = async (e) => {
        try {
            setLoading(true)
            const { shop_service_order_doc_id, ShopServiceOrderDoc } = form.getFieldValue(), findTaxInovicesActiveDoc = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === id && where.status === 1);
            const model = {
                shop_service_order_doc_id,
                [e.key === "1" ? "is_abb" : "is_inv"]: true
            }
            let res

            Swal.fire({
                title: `ยืนยันการสร้างใบกำกับภาษี${e.key === "1" ? `อย่างย่อ` : `เต็มรูป`} หรือไม่ ?`,
                // text: res.data.data, 
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: GetIntlMessages("submit"),
                confirmButtonColor: mainColor
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setCarPreLoading(true)
                    // res = await API.post(`/shopTaxInvoiceDoc/add`, model)
                    if ((isArray(ShopServiceOrderDoc?.ShopTaxInvoiceDocs) && ShopServiceOrderDoc?.ShopTaxInvoiceDocs.length === 0) || !findTaxInovicesActiveDoc) {
                        res = await API.post(`/shopTaxInvoiceDoc/add`, model)
                    } else {
                        delete model.shop_service_order_doc_id
                        res = await API.put(`/shopTaxInvoiceDoc/put/${findTaxInovicesActiveDoc.id}`, model)
                    }

                    if (res.data.status === "success") {
                        Swal.fire({ title: `สร้างใบกำกับภาษี${e.key === "1" ? `อย่างย่อ` : `เต็มรูป`}สำเร็จ !!`, icon: 'success', timer: 2000, timerProgressBar: true })
                        // addEditViewModal("edit", id)
                        handleCancel()
                    } else {
                        Swal.fire({ title: 'มีบางอย่างผิดพลาด !!', text: res.data.data, icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                    }
                    setCarPreLoading(false)
                }
            })
            setLoading(false)
        } catch (error) {
            setCarPreLoading(false)
            setLoading(false)
        }
    }

    const menu = (
        <Menu
            items={[
                {
                    key: '1',
                    label: 'อย่างย่อ',
                    disabled: taxInvoiceTypeAbbActive,
                    onClick: handleMenuClick,
                },
                {
                    key: '2',
                    label: 'เต็มรูป',
                    onClick: handleMenuClick,
                    disabled: taxInvoiceTypeInvActive,
                },
            ]}
        />
    );
    /*end invoices button*/

    let DebtorBillingPrintButton = {}
    if (form.getFieldValue("ref_doc") !== "") {
        DebtorBillingPrintButton = { print_out_DebtorBilling: { status: true, name: "ใบวางบิล/ใบแจ้งหนี้", price_use: 1, documentIdPerbutton: form.getFieldValue("ref_doc") } }
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    const handleCancelEditImageModal = () => {
        try {
            formEditImage.resetFields()
            setIsEditImageModalVisible(false)
        } catch (error) {

        }
    }

    const handleOpenEditImageModal = (value) => {
        try {
            console.log("value", value)
            formEditImage.resetFields()

            formEditImage.setFieldsValue({
                id: value.id,
                upload_payment_list: value.details?.upload_payment_list ?? [],
                upload_remove_list: [],
                ShopCustomerDebtLists: value.ShopCustomerDebtLists,
                customer_credit_debt_payment_period: value.customer_credit_debt_payment_period,
                details: value.details,
                ref_doc: value?.details?.ref_doc ?? null
            })
            setIsEditImageModalVisible(true)
        } catch (error) {

        }
    }

    const handleOkEditImageModal = () => {
        formEditImage.submit()
    }

    const onFinishEditImage = async (values) => {
        try {
            setLoading(true)
            setCarPreLoading(true)
            console.log("vl", values)
            let idEdit = values.id

            let shopId = authUser?.UsersProfile?.shop_id
            let directory = "shopDebtorDocument"
            let upload_payment_list = []


            if (values.upload_payment_list) {
                if (values?.upload_payment_list?.fileList?.length > 0) {
                    await Promise.all(values.upload_payment_list.fileList.map(async (e, index) => {
                        await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "payment" }).then(({ data }) => {
                            if (data.status === "success") {
                                try {
                                    upload_payment_list.push(
                                        {
                                            uid: index,
                                            name: e.name,
                                            status: 'done',
                                            url: process.env.NEXT_PUBLIC_DIRECTORY + data.data.path,
                                            path: data.data.path
                                        }
                                    )
                                    e.url = process.env.NEXT_PUBLIC_DIRECTORY + data.data.path
                                    e.path = data.data.path
                                } catch (error) {
                                    console.log("error: ", error)
                                }
                            } else if (data.status === "failed") {
                                e.path = e.url.split(process.env.NEXT_PUBLIC_DIRECTORY)[1]
                                // message.error(`รูปที่ ${index + 1} : ${data.data}`)
                            }
                        })
                    })
                    )
                }
            }

            if (values.upload_remove_list) {
                if (values?.upload_remove_list?.length > 0) {
                    await Promise.all(values.upload_remove_list.map(async (e, index) => {
                        await DeleteImageCustomPathMultiple(e.path).then(({ data }) => {
                            if (data.status === "success") {
                                try {

                                } catch (error) {
                                    console.log("error: ", error)
                                }
                            } else if (data.status === "failed") {
                            }
                        })
                    })
                    )
                }
            }


            const model = {
                shopCustomerDebtLists: values.ShopCustomerDebtLists.map((e, index) => {
                    let doc_type_code_id = findDocType(e)
                    const _model = {
                        id: e.id,
                        seq_number: e.seq_number,
                        doc_date: moment(e.doc_date).format("YYYY-MM-DD"),
                        debt_due_date: !!e.debt_due_date
                            ? moment(e.debt_due_date).format("YYYY-MM-DD")
                            : moment(
                                moment(e?.doc_date).add(
                                    Number(
                                        form.getFieldValue(
                                            "customer_credit_debt_payment_period"
                                        )
                                    ),
                                    "d"
                                )
                            ).format("YYYY-MM-DD"),
                        debt_price_amount: MatchRound(+e.debt_price_amount) ?? "0.00",
                        debt_price_amount_left: MatchRound(+e.debt_price_amount_left) ?? "0.00",
                        debt_price_paid_total: !!e.debt_price_paid_total ? MatchRound(e?.debt_price_paid_total ?? 0) : "0.00",
                        debt_price_paid_adjust: !!e.debt_price_paid_adjust ? MatchRound(e?.debt_price_paid_adjust ?? 0) : "0.00",
                        [doc_type_code_id === "CCN"
                            ? "shop_customer_debt_cn_doc_id"
                            : doc_type_code_id === "CDN"
                                ? "shop_customer_debt_dn_doc_id"
                                : doc_type_code_id === "NCN" ?
                                    "shop_customer_debt_cn_doc_id_t2"
                                    : "shop_service_order_doc_id"]: docValue(e, index, values.ref_doc)
                    };

                    return _model

                }),
                details: values.details,
            }


            delete model.details.meta_data
            model.details.upload_payment_list = await values.upload_payment_list.fileList === undefined ? await values.upload_payment_list : values.upload_payment_list.fileList
            console.log(model)
            let res
            res = await API.put(`/shopCustomerDebtDoc/put/${values.id}`, model)
            if (res) {
                setLoading(false)
                setCarPreLoading(false)
                handleCancelEditImageModal()
                getDataSearch({
                    search: init.modelSearch.search ?? "",
                    _status: init.modelSearch.status,
                    limit: init.configTable.limit,
                    page: init.configTable.page,
                    sort: init.configSort.sort,
                    order: (init.configSort.order === "descend" ? "desc" : "asc"),
                    doc_date_startDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[0] ?? null : null,
                    doc_date_endDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[1] ?? null : null,
                    payment_paid_status: init.modelSearch.payment_paid_status,
                })
            }

        } catch (error) {
            console.log("finish edit image error", error)
        }
    }

    const findDocType = (e) => {
        if (e?.ShopServiceOrderDoc) {
            return e?.ShopServiceOrderDoc?.code_id_prefix
        } else if (e?.ShopCustomerDebtDebitNoteDoc) {
            return e?.ShopCustomerDebtDebitNoteDoc?.code_id_prefix
        } else if (e?.ShopCustomerDebtCreditNoteDoc) {
            return e?.ShopCustomerDebtCreditNoteDoc?.code_id_prefix
        } else if (e?.ShopCustomerDebtCreditNoteDocT2) {
            return e?.ShopCustomerDebtCreditNoteDocT2?.code_id_prefix
        }
    }

    const docValue = (e, index, ref_doc) => {
        let result
        if (configModal.mode === 'add') {
            if (!!ref_doc) {
                if (e?.is_new_item === true) {
                    result = e?.id
                } else {
                    if (!!e.ShopCustomerDebtCreditNoteDoc) {
                        result = e?.shop_customer_debt_cn_doc_id
                    } else if (!!e.ShopCustomerDebtDebitNoteDoc) {
                        result = e?.shop_customer_debt_dn_doc_id
                    } else if (e.shop_customer_debt_cn_doc_id_t2) {
                        result = e?.shop_customer_debt_cn_doc_id_t2
                    } else {
                        result = e?.shop_service_order_doc_id
                    }
                }
            } else {
                if (e?.is_new_item === true) {
                    result = e?.id
                } else {
                    if (!!e.ShopCustomerDebtCreditNoteDoc) {
                        result = e?.shop_customer_debt_cn_doc_id
                    } else if (!!e.ShopCustomerDebtDebitNoteDoc) {
                        result = e?.shop_customer_debt_dn_doc_id
                    } else if (e.ShopCustomerDebtCreditNoteDocT2) {
                        result = e?.shop_customer_debt_cn_doc_id_t2
                    } else {
                        result = e?.shop_service_order_doc_id
                    }
                }
            }
        }
        if (configModal.mode === 'edit') {
            if (!!ref_doc) {
                if (e?.is_new_item === true) {
                    result = e?.id
                } else {
                    if (!!e.ShopCustomerDebtCreditNoteDoc) {
                        result = e?.shop_customer_debt_cn_doc_id
                    } else if (!!e.ShopCustomerDebtDebitNoteDoc) {
                        result = e?.shop_customer_debt_dn_doc_id
                    } else if (e.ShopCustomerDebtCreditNoteDocT2) {
                        result = e?.shop_customer_debt_cn_doc_id_t2
                    } else {
                        result = e?.shop_service_order_doc_id
                    }
                }
            } else {

                if (e?.is_new_item === true) {
                    result = e?.id
                } else {
                    if (!!e.ShopCustomerDebtCreditNoteDoc) {
                        result = e?.shop_customer_debt_cn_doc_id
                    } else if (!!e.ShopCustomerDebtDebitNoteDoc) {
                        result = e?.shop_customer_debt_dn_doc_id
                    } else if (e.ShopCustomerDebtCreditNoteDocT2) {
                        result = e?.shop_customer_debt_cn_doc_id_t2
                    } else {
                        result = e?.shop_service_order_doc_id
                    }
                }
            }
        }
        return result
    }

    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} />
            {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} specificFunction={specificFunction} /> */}

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                mode={configModal.mode}
                title={<ModalFullScreenTitle title={`ใบรับชำระลูกหนี้` ?? documentTypesName} isShowTittle={true} />}
                loading={loading}
                CustomsButton={() => {
                    return (
                        <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
                            <>
                                <Row gutter={[10, 10]} justify="end" style={{ width: "100%" }}>
                                    <>
                                        <Col xxl={{ span: 4, offset: 8 }} lg={6} md={12} xs={24} >
                                            <Button loading={loading} style={{ width: "100%" }} onClick={() => handleCancel()}>{configModal.mode === "view" ? GetIntlMessages("ปิด") : GetIntlMessages("cancel")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view" || disabledWhenDeliveryDocActive || disabledWhenTaxInvoiceDocActive} >
                                            <Button loading={loading} onClick={() => handleOk()} style={{ width: "100%" }} type='primary'>{GetIntlMessages("บันทึก")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("status") != 1}>
                                            <PrintOut morePrintOuts={{ ...DebtorBillingPrintButton, print_out_Debtor: { status: true, name: "ใบรับชำระลูกหนี้", price_use: 1, footSign: { left: "ผู้ชำระ", right: "ผู้รับชำระ" } }, print_out_invoices: { status: form.getFieldValue("payment_paid_status") === 3 ? true : false, name: "ใบเสร็จรับเงิน", price_use: 1, footSign: { left: "ผู้จ่ายเงิน", right: "ผู้รับเงิน" } } }} textButton={GetIntlMessages("print")} loading={loading} documentId={form.getFieldValue("id")} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: 10 }} docTypeId={docTypeId} />
                                        </Col>
                                        {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode !== "edit" || form.getFieldValue("is_draft") === false || form.getFieldValue("status") != 1} >
                                            <Button loading={loading} onClick={() => confirmOrder()} type="text" style={{ width: "100%", borderColor: "black", overflow: "hidden", padding: 0 }}>{GetIntlMessages("ยืนยันใบส่งสินค้าชั่วคราว")}</Button>
                                        </Col> */}
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("is_draft") === true || form.getFieldValue("status") != 1} >
                                            <PaymentDocs loading={loading || carPreLoading} docId={form.getFieldValue("id")} title={`ชำระเงิน ใบรับชำระลูกหนี้ ${form.getFieldValue("code_id") ?? ""}`} handleCancelDebtDoc={handleCancel} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                        </Col>
                                        {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view" || form.getFieldValue("is_draft") !== false || disabledWhenDeliveryDocActive || form.getFieldValue("status") != 1}>
                                            <Button loading={loading} onClick={() => createDeliveryOrderDoc()} type="text" style={{ overflow: "hidden", width: "100%", borderColor: "black", padding: 2 }}>{GetIntlMessages("สร้างใบส่งของชั่วคราว")}</Button>
                                        </Col> */}
                                        {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("is_draft") === true || form.getFieldValue("status") != 1 || (taxInvoiceTypeAbbActive && taxInvoiceTypeInvActive)}>
                                            <Dropdown overlay={menu} style={{ width: "100%" }} loading={loading}>
                                                <Button onClick={(e) => e.preventDefault()} style={{ width: "100%", padding: 4 }}>
                                                    <Space>
                                                        สร้างใบกำกับภาษี
                                                        <DownOutlined />
                                                    </Space>
                                                </Button>
                                            </Dropdown>
                                        </Col> */}
                                    </>
                                </Row>
                            </>
                        </div>
                    )
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout={"vertical"}
                    labelWrap
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    scrollToFirstError={true}
                    initialValues={{
                        customer_credit_debt_unpaid_balance: null,
                        customer_credit_debt_current_balance: null,
                        customer_credit_debt_approval_balance: null,
                        customer_credit_debt_payment_period: null,
                        remark: null,
                        remark_inside: null,
                        debt_price_paid_total: null,
                        debtor_billing_list: []
                    }}
                >
                    {
                        carPreLoading ? <CarPreloader />
                            :
                            <div className="container-fluid">
                                <div className='pr-5 pl-5 detail-before-table'>
                                    {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                                    <FormTemporaryDeliveryOrderDoc mode={configModal.mode} calculateResult={calculateResult} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} form={form} />
                                </div>
                                <div className='tab-detail'>
                                    <Tabs
                                        defaultActiveKey="1"
                                        activeKey={activeKeyTab}
                                        onChange={handleChangeTabs}
                                        items={[
                                            {
                                                label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> เอกสาร</span>),
                                                key: '1',
                                                children: <Tab1ServiceAndProductV2 calculateResult={calculateResult} mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />,
                                            },
                                            {
                                                label: (<span><DollarOutlined style={{ fontSize: 18 }} /> ข้อมูลการชำระเงิน</span>),
                                                key: '2',
                                                children: <TabPaymentInfo data={paymentTransactions} />,
                                            },
                                            {
                                                label: (<span><FileImageOutlined style={{ fontSize: 18 }} /> รูปภาพ</span>),
                                                key: '3',
                                                children: <Tab4DocImage mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />,
                                            },
                                        ]}
                                    />

                                    {/* </Tabs> */}
                                </div>
                            </div>
                    }
                    <Form.Item name="upload_payment_list">

                    </Form.Item>
                    <Form.Item name="upload_remove_list">

                    </Form.Item>
                </Form>
            </ModalFullScreen>

            <Modal
                maskClosable={false}
                open={isEditImageModalVisible}
                onCancel={handleCancelEditImageModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleOkEditImageModal()}>{GetIntlMessages("บันทึก")}</Button>
                        <Button onClick={() => handleCancelEditImageModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <Form
                    form={formEditImage}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout={"vertical"}
                    labelWrap
                    onFinish={onFinishEditImage}
                    // onFinishFailed={onFinishFailed}
                    scrollToFirstError={true}
                >
                    <Form.Item name="id" hidden></Form.Item>
                    <Form.Item name="details" hidden> </Form.Item>
                    <Form.Item name="upload_payment_list" hidden></Form.Item>
                    <Form.Item name="upload_remove_list" hidden></Form.Item>
                    <Form.Item name="ShopCustomerDebtLists" hidden></Form.Item>
                    <Form.Item name="customer_credit_debt_payment_period" hidden></Form.Item>
                    <Tab4DocImage mode={"edit"} />
                </Form>
            </Modal>
        </>
    )
}

export default DebtorDoc