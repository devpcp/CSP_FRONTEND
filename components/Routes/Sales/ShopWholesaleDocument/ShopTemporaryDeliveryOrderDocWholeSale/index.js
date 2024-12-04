import { CarOutlined, FileAddOutlined, UserOutlined, DownOutlined, FileImageOutlined, InfoCircleTwoTone, SettingOutlined } from '@ant-design/icons'
import { Button, Col, Form, message, Row, Tabs, Dropdown, Space, Menu, Checkbox, Input, Modal, Result, Select, Tooltip, Typography, Badge, Popover } from 'antd'
import { get, isArray, isEmpty, isPlainObject, isFunction } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import { RoundingNumber, takeOutComma } from '../../../../shares/ConvertToCurrency'
import ModalFullScreen from '../../../../shares/ModalFullScreen'
import PrintOut from '../../../../shares/PrintOut'
import SearchInput from '../../../../shares/SearchInput'
import TableList from '../../../../shares/TableList'
import CarPreloader from '../../../../_App/CarPreloader'
import FormTemporaryDeliveryOrderDoc from './components/Components.Routes.Modal.FormTemporaryDeliveryOrderDoc'
import Tab1ServiceAndProductV2 from './components/Components.Routes.Modal.Tab1.ServiceAndProductV2 copy'
import Tab2CustomerInfo from './components/Components.Routes.Modal.Tab2.CustomerInfoV2'
// import Tab3VehicleInfo from './components/Components.Routes.Modal.Tab3.VehicleInfo'
import PaymentDocs from './components/Components.Routes.Modal.PaymentDocsV2'
import Tab4DocImage from './components/Components.Routes.Modal.Tab4.DocImage'
import { UploadImageCustomPathMultiple, DeleteImageCustomPathMultiple } from '../../../../shares/FormUpload/API'
import BusinessCustomersData from '../../../../../routes/MyData/BusinessCustomersData'
import PersonalCustomersData from '../../../../../routes/MyData/PersonalCustomersData'
import { useRouter } from 'next/router'

const { Text, Link } = Typography;

const ShopTemporaryDeliveryOrderDocWholeSale = ({ docTypeId, title = null, callBack, }) => {

    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes, paymentStatus } = useSelector(({ master }) => master);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี
    const [disabledWhenDeliveryDocActive, setDisabledWhenDeliveryDocActive] = useState(false)
    const [disabledWhenTaxInvoiceDocActive, setDisabledWhenTaxInvoiceDocActive] = useState(false)


    const [isCreateINVModalVisible, setIsCreateINVModalVisible] = useState(false);
    const [isCheckABB, setIsCheckABB] = useState(false);
    const [isCheckINV, setIsCheckINV] = useState(false);
    const [isCustomerDataModalVisible, setIsCustomerDataModalVisible] = useState(false);
    const [customerType, setCustomerType] = useState(false);
    const [customerPickToCreateINV, setCustomerPickToCreateINV] = useState(false);
    const [customerPickToCreateINVName, setCustomerPickToCreateINVName] = useState("");
    const [isEditImageModalVisible, setIsEditImageModalVisible] = useState(false);

    const router = useRouter();


    const [form] = Form.useForm();
    const [formSettingPrint] = Form.useForm();
    const [formEditImage] = Form.useForm();
    const [idEdit, setIsIdEdit] = useState(null);

    const [settingPrint, setSettingPrint] = useState({})

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
            payment_paid_status: modelSearch.payment_paid_status,
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
            payment_paid_status: null,
            select_date: [],
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

    const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile?.shop_config
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
        getDataSearch({
            search: value.search,
            _status: value.status,
            page: init.configTable.page,
            doc_date_startDate: isArray(value.select_date) ? value.select_date[0] ?? null : null,
            doc_date_endDate: isArray(value.select_date) ? value.select_date[1] ?? null : null,
            payment_paid_status: value.payment_paid_status,
        })
    }

    /** เครีย Filter */
    const onClearFilterSearch = (type) => {
        try {
            const searchModel = {
                ...modelSearch,
            };
            console.log(type)
            switch (type) {
                case "payment_paid_status":
                    searchModel[type] = null;
                    break;
                case "select_date":
                    searchModel[type] = null;
                    break;
                default:
                    break;
            }
            setModelSearch((previousValue) => searchModel);
        } catch (error) { }
    };

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
            doc_date_startDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[1] ?? null : null,
            payment_paid_status: init.modelSearch.payment_paid_status,
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
                type: "rangepicker",
                name: "select_date",
                label: `เลือกวันเริ่มต้น - เลือกวันสิ้นสุด`,
                // placeholder: "เลือกการแสดงผลของสต๊อค",
                allowClear: true,
                showSearch: true,
            },
            {
                index: 1,
                type: "select",
                name: "payment_paid_status",
                label: GetIntlMessages("select-paid-status"),
                placeholder: GetIntlMessages("select-paid-status"),
                allowClear: true,
                showSearch: true,
                list: isArray(paymentStatus) ? paymentStatus : [],
            },
            {
                index: 1,
                type: "select",
                name: "status",
                label: GetIntlMessages("สถานะใบสั่งซ่อม"),
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
                        key: configPage("table-status-2") ?? GetIntlMessages("ยกเลิกเอกสาร"),
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
            create: false,
            name: {
                add: GetIntlMessages(`สร้าง${documentTypesName}`),
            },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        onClearFilterSearch
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
                width: 50,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            // {
            //     title: () => (<>{GetIntlMessages("พิมพ์")}  <Popover trigger="click" content={<PopOverSettingPrint />} title="ตั้งค่าการพิมพ์"><Button type='primary' icon={<SettingOutlined />}></Button></Popover></>),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 120,
            //     align: "center",
            //     render: (text, record) => {
            //         console.log("authUser", authUser)
            //         let query = {
            //             pages: "test",
            //             documentId: record?.id,
            //             docTypeId: docTypeId,
            //             docTypeAPIName: "shopTemporaryDeliveryOrderDoc",
            //             shopId: authUser?.UsersProfile?.ShopsProfile?.id
            //         }

            //         return (
            //             <Button onClick={() => window.open(`/pdfview?${new URLSearchParams(query).toString()}`)}>
            //                 ปริ้น
            //             </Button>
            //         )
            //     },
            // },
            // {
            //     title: () => GetIntlMessages(`เลขที่${configPage("table-status-2")}`),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 180,
            //     align: "center",
            //     render: (text, record) => get(text, `ShopDocumentCode.TRN.code_id` ?? "-", "-")
            // },
            // {
            //     title: () => GetIntlMessages(`เลขที่${configPage("table-status-3")}`),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 180,
            //     align: "center",
            //     render: (text, record) => get(text, `ShopDocumentCode.INV.code_id` ?? "-", "-")
            // },
            {
                title: () => GetIntlMessages("ใบส่งสินค้า/ใบแจ้งหนี้"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                sorter: true,
                render: (text, record) => {
                    if (isFunction(callBack)) {
                        return (
                            <Link href="#" onClick={() => callBack(record)}>
                                <Tooltip title={
                                    <>
                                        <div>เลขที่ใบสั่งขาย : {record?.ShopServiceOrderDoc?.code_id}</div>
                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.doc_date).format("DD/MM/YYYY")}</div>
                                        {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs.length !== 0 ?
                                            <>
                                                {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_code_id !== null ?
                                                    <>
                                                        <div>อย่างย่อ : {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_code_id}</div>
                                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_doc_date).format("DD/MM/YYYY")}</div>
                                                    </>
                                                    : ""
                                                }

                                                {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_code_id !== null ?
                                                    <>
                                                        <div>ใบกำกับภาษี : {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_code_id}</div>
                                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_doc_date).format("DD/MM/YYYY")}</div>
                                                    </>
                                                    : ""
                                                }
                                            </>
                                            : ""
                                        }
                                    </>
                                }>
                                    <div style={{ textAlign: "center" }}>{text ?? "-"}</div>
                                </Tooltip>
                            </Link>
                        )
                    } else {
                        return (
                            <div style={{ textAlign: "start" }}>
                                <Tooltip title={
                                    <>
                                        <div>เลขที่ใบสั่งขาย : {record?.ShopServiceOrderDoc?.code_id}</div>
                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.doc_date).format("DD/MM/YYYY")}</div>
                                        {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs.length !== 0 ?
                                            <>
                                                {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_code_id !== null ?
                                                    <>
                                                        <div>อย่างย่อ : {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_code_id}</div>
                                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.abb_doc_date).format("DD/MM/YYYY")}</div>
                                                    </>
                                                    : ""
                                                }

                                                {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_code_id !== null ?
                                                    <>
                                                        <div>ใบกำกับภาษี : {record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_code_id}</div>
                                                        <div>วันที่ : {moment(record?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_doc_date).format("DD/MM/YYYY")}</div>
                                                    </>
                                                    : ""
                                                }
                                            </>
                                            : ""
                                        }
                                    </>
                                }>
                                    <div style={{ textAlign: "center" }}><Text>{text}</Text></div>
                                </Tooltip>
                            </div>
                        )
                    }
                },
            },
            {
                title: () => GetIntlMessages("เลขที่ใบสั่งขาย"),
                dataIndex: 'ShopServiceOrderDoc',
                key: 'ShopServiceOrderDoc',
                width: 150,
                align: "center",
                use: !isFunction(callBack) ?? true,
                render: (text, record) => <div style={{ textAlign: "start" }}>{text?.code_id ?? ""}</div>
            },
            {
                title: () => GetIntlMessages("ใบกำกับภาษีเต็มรูป"),
                dataIndex: 'ShopServiceOrderDoc',
                key: 'ShopServiceOrderDoc',
                width: 150,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => <div style={{ textAlign: "start" }}>{text?.ShopTaxInvoiceDocs[0]?.inv_code_id ?? ""}</div>
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                sorter: true,
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
                title: () => GetIntlMessages("สำนักงาน"),
                dataIndex: 'ShopBusinessCustomer',
                key: 'ShopBusinessCustomer',
                width: 130,
                render: (text, record) => {
                    try {
                        switch (record.ShopBusinessCustomer.other_details.branch) {
                            case "office":
                                return "สำนักงานใหญ่"
                            case "branch":
                                return `สาขา${record.ShopBusinessCustomer.other_details.branch_code === record.ShopBusinessCustomer.other_details.branch_name ? " " : ` ${record.ShopBusinessCustomer.other_details.branch_code} `}${record.ShopBusinessCustomer.other_details.branch_name}`
                            default:
                                return "-"
                        }
                    } catch (error) {
                        return "-"
                    }

                },
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
                dataIndex: 'ShopServiceOrderDoc',
                key: 'ShopServiceOrderDoc',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('record :>> ', record),
                render: (text, record) => {
                    const payment_paid_status = get(text, `payment_paid_status`, null)
                    switch (payment_paid_status) {
                        case 1:
                            if (record?.is_draft === true) {
                                return (
                                    // <span className='color-red font-16'>ยังไม่ชำระ</span>
                                    <Button
                                        // type="text"
                                        // onClick={handleCarLoading}
                                        type="primary"
                                        onClick={() => confirmOrder(true, record?.ShopTemporaryDeliveryOrderLists, record?.id)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            border: 0,
                                            // color: "#707070",
                                            fontSize: 16
                                        }}
                                    >
                                        {GetIntlMessages("ยืนยันเอกสาร")}
                                    </Button>

                                )
                            } else {
                                return (
                                    <PaymentDocs fromTable={true} serviceOrderDocObj={record?.ShopServiceOrderDoc} docId={record?.id} title={`ชำระเงิน ใบส่งของชั่วคราว ${record?.code_id ?? ""}`} handleCancelTemDoc={handleCancel} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                )
                            }

                        case 2:
                            return (
                                <PaymentDocs fromTable={true} serviceOrderDocObj={record?.ShopServiceOrderDoc} docId={record?.id} title={`ชำระเงิน ใบส่งของชั่วคราว ${record?.code_id ?? ""}`} handleCancelTemDoc={handleCancel} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                            )
                        case 3:
                            return (
                                <span className='color-green font-16'>ชำระเงินแล้ว</span>
                            )
                        case 4:
                            return (
                                <span style={{ color: "#DFFF00", fontSize: 16 }}>ชําระเกิน</span>
                            )
                        case 5:
                            return (
                                <span style={{ color: "#993333	", fontSize: 16 }}>ลูกหนี้การค้า</span>
                            )

                        default:
                            return (
                                <span> - </span>
                            )
                    }
                },
            },
            {
                title: () => (<>{GetIntlMessages("พิมพ์")}  <Popover trigger="click" content={<PopOverSettingPrint />} title="ตั้งค่าการพิมพ์"><Button type='primary' icon={<SettingOutlined />}></Button></Popover></>),
                dataIndex: 'details',
                key: 'details',
                width: 120,
                align: "center",
                render: (text, record) => {
                    return (
                        <PrintOut customPriceUse={1} customFootSign={(authUser?.UsersProfile?.ShopsProfile?.id === "db945efe-17c8-4c43-a437-31204fe3b8af") ? { left: `ผู้รับสินค้า`, right: `ผู้ส่งสินค้า` } : null} textButton={"พิมพ์"} printOutHeadTitle={(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : (authUser?.UsersProfile?.ShopsProfile?.id === "db945efe-17c8-4c43-a437-31204fe3b8af") ? "ใบส่งสินค้าชั่วคราว" : "ใบส่งสินค้า/ใบแจ้งหนี้"} documentId={record?.id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} docTypeId={docTypeId} settingPrint={settingPrint} />
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

                    let { upload_car_list, upload_payment_list, upload_product_list } = record.details
                    let checkCarImage = isArray(upload_car_list) ? upload_car_list.length > 0 : false
                    let checkPaymentImage = isArray(upload_payment_list) ? upload_payment_list.length > 0 : false
                    let checkProductImage = isArray(upload_product_list) ? upload_product_list.length > 0 : false

                    let checkHaveImage = checkCarImage || checkPaymentImage || checkProductImage
                    return (
                        <>
                            <Badge dot={checkHaveImage} >
                                <Button type='text' onClick={() => handleOpenEditImageModal(record)} icon={<FileImageOutlined style={{ fontSize: "18px" }} />}></Button>
                            </Badge>
                        </>
                    )
                },

            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: 'cheque_number',
                key: 'cheque_number',
                width: 100,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record)}>เลือก</Button>
                ),
            },
        )
        // switch (enable_ShopSalesTransaction_legacyStyle) {
        //     case true:
        //         if (searchStatus === "1") {
        //             delete _column[1]
        //             delete _column[2]
        //         } else if (searchStatus === "2") {
        //             delete _column[2]
        //         } else if (searchStatus === "3") {
        //             delete _column[1]
        //         } else {
        //             delete _column[1]
        //             delete _column[2]
        //         }
        //         break;

        //     default:
        //         delete _column[1]
        //         delete _column[2]
        //         break;
        // }

        _column.map((x) => { x.use === undefined ? x.use = true : null })
        setColumns(_column.filter(x => x.use === true));
    }

    const PopOverSettingPrint = () => {
        return (
            <Form
                form={formSettingPrint}
                layout={"vertical"}
                initialValues={{
                    doc_date_show: true,
                    vehicle_data_show: true
                }}
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name={"doc_date_show"} label="แสดงวันที่">
                            <Select
                                onChange={() => handleChangeSettingPrint("doc_date")}
                                style={{ width: "100%" }}
                                options={[
                                    {
                                        value: true,
                                        label: 'แสดง',
                                    },
                                    {
                                        value: false,
                                        label: 'ไม่แสดง',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        {/* <Form.Item name={"vehicle_data_show"} label="แสดงข้อมูลรถยนต์">
                            <Select
                                onChange={() => handleChangeSettingPrint("doc_date")}
                                style={{ width: "100%" }}
                                options={[
                                    {
                                        value: true,
                                        label: 'แสดง',
                                    },
                                    {
                                        value: false,
                                        label: 'ไม่แสดง',
                                    },
                                ]}
                            />
                        </Form.Item> */}
                    </Col>
                </Row>
                <Text style={{ color: "red" }}>***เมื่อมีการปรับเปลี่ยนข้อมูลแล้วกดค้นหาอีก 1 ครั้งเพื่อใช้งานการตั้งค่า</Text>
            </Form>
        )
    }

    const handleChangeSettingPrint = () => {
        try {
            const { vehicle_data_show, doc_date_show } = formSettingPrint.getFieldsValue()
            let model = {
                vehicle_data_show,
                doc_date_show
            }
            setSettingPrint(model)
        } catch (error) {
            console.log("error", error)
        }

    }

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = "active", doc_date_startDate = isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? "" : null, doc_date_endDate = isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? "" : null, payment_paid_status = modelSearch.payment_paid_status }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopTemporaryDeliveryOrderDoc/all?search=${search}&status=${_status}&ShopServiceOrderDoc__doc_sales_type=2&page=${page}&limit=${limit}&sort=${sort}&order=${order}${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}${payment_paid_status ? `&ShopServiceOrderDoc__payment_paid_status=${payment_paid_status}` : ""}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data = data.map(e => {
                    const { ShopServiceOrderDoc, shop_service_order_doc_id } = e, { payment_paid_status, ShopPaymentTransactions, ShopTaxInvoiceDocs } = ShopServiceOrderDoc;
                    /*เช็คว่าเป็นใบกำกับภาษีอย่างย่อหรือเต็มรูป*/
                    const find = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === shop_service_order_doc_id && where.status === 1) ?? null

                    const newShopPaymentTransactionsArr = ShopPaymentTransactions.filter(where => !where.canceled_payment_by && !where.canceled_payment_date).map(e => e.is_partial_payment) ?? []
                    const isPartialPaymentStatus = !!newShopPaymentTransactionsArr && newShopPaymentTransactionsArr.length === 0 ? false : newShopPaymentTransactionsArr.every(val => val === true)

                    if (e.status === 2) {
                        e.___block = false
                        e.___update = false;
                        // e.___delete = false;
                    } else if (e.is_draft === false && ((payment_paid_status === 2 && isPartialPaymentStatus === true) || payment_paid_status === 3 || isPlainObject(find))) {
                        e.___update = false;
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
                setLoading(() => true)
                if (result.isConfirmed) {
                    setLoading(true)
                    const { data } = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${id}`, { status })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status,
                            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
                            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
                            payment_paid_status: modelSearch.payment_paid_status,
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
        setCarPreLoading(() => true)
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        setDisabledWhenDeliveryDocActive(false)
        setDisabledWhenTaxInvoiceDocActive(false)
        setIsIdEdit(null)
        setActiveKeyTab("1")
        form.setFieldsValue({
            isModalVisible: false,
            customer_phone_list: []
        })
        // docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" ? form.setFieldsValue({
        //     customer_type: "business",
        // }) : ""
        // setIsModeInvoices(false)
        console.log("configta,", configTable)
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
            payment_paid_status: modelSearch.payment_paid_status,
            limit: configTable.limit,
        })
        //  window.location.reload()
        setCarPreLoading(false)
        setLoading(() => false)
    }

    // const [, set] = useState(second)
    /* addEditView */
    const addEditViewModal = async (mode, id, isPayment, isInovices) => {
        try {
            setLoading(true)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/shopTemporaryDeliveryOrderDoc/byId/${id}`)
                // console.log('data addEditViewModal :>> ', data);
                if (data.status == "success") {
                    // setDataSendToComponeteToPrint(data.data)
                    setIsIdEdit(id)
                    setFormValueData(data.data)
                }
            } else {
                form.setFieldsValue({
                    customer_type: "person",
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

                    upload_product_list: [],
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

    const setFormValueData = (value) => {
        try {
            console.log('value :>> ', value);
            const list_service_product = [], isPersonal = !!value.ShopPersonalCustomer ? true : false, { ShopTemporaryDeliveryOrderLists, vehicle_customer_id, ShopVehicleCustomer, shop_service_order_doc_id, ShopServiceOrderDoc } = value;
            const customerData = value[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`], filterPayment = ShopServiceOrderDoc.ShopPaymentTransactions.filter(where => !where.canceled_payment_by && !where.canceled_payment_date);
            let customer_phone_list = [], address = `${customerData?.address?.[locale.locale] ?? ""} ${customerData?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${customerData?.District?.[`name_${locale.locale}`] ?? ""} ${customerData?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${customerData?.SubDistrict?.zip_code ?? ""}`;
            list_service_product = [...ShopTemporaryDeliveryOrderLists]

            setCustomerType(isPersonal ? "person" : "business")
            setCustomerPickToCreateINVName(isPersonal ? `${value?.ShopPersonalCustomer.customer_name?.first_name[locale.locale] ?? null} ${value?.ShopPersonalCustomer.customer_name?.last_name[locale.locale] ?? null}` : value?.ShopBusinessCustomer.customer_name[locale.locale])

            const model = {
                ...value,
                doc_date: moment(value.doc_date),
                customer_type: isPersonal ? "person" : "business",
                customer_id: isPersonal ? value.ShopPersonalCustomer.id : value.ShopBusinessCustomer.id,
                customer_phone: value.details?.customer_phone,
                customer_list: [value[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`]].map((e, index) => {
                    if (!isEmpty(e?.mobile_no)) customer_phone_list.push(e?.mobile_no[`mobile_no_${index + 1}`])
                    return {
                        ...e,
                        customer_code: e.master_customer_code_id,
                        customer_type: isPersonal ? "person" : "business",
                        customer_branch: e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + e.other_details.branch_name + ")",
                        customer_full_name: isPersonal ? `${e?.customer_name?.first_name[locale.locale] ?? null} ${e?.customer_name?.last_name[locale.locale] ?? null}` : e?.customer_name[locale.locale]
                    }
                }),
                customer_phone_list,
                customer_phone: customer_phone_list[0],
                address,
                vehicle_customer_id,
                vehicles_customers_list: [ShopVehicleCustomer],
                user_id: value.details.user_id,
                remark: value.details.remark,
                remark_inside: value.details.remark_inside,
                repair_man: value.details.repair_man,
                sales_man: value.details.sales_man,
                // repair_man_list: form.getFieldValue("repair_man_list"),
                status: `${value.status}`,
                previous_mileage: value.details?.previous_mileage ?? null,
                current_mileage: value.details?.current_mileage ?? null,
                doc_type_id: docTypeId,

                upload_product_list: value.details?.upload_product_list ?? [],
                upload_payment_list: value.details?.upload_payment_list ?? [],
                upload_remove_list: [],

                tags: isPersonal ? value.ShopPersonalCustomer?.tags ?? [].map((e) => (e.id)) ?? [] : value.ShopBusinessCustomer?.tags ?? [].map((e) => (e.id)) ?? [],
                tags_obj: isPersonal ? value.ShopPersonalCustomer?.tags ?? [] : value.ShopBusinessCustomer?.tags ?? [],

                tax_id: isPersonal ? value?.ShopPersonalCustomer?.id_card_number ?? null : value?.ShopBusinessCustomer?.tax_id ?? null,
                credit_limit: isPersonal ? (+value?.ShopPersonalCustomer?.other_details?.credit_limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? null : (+value?.ShopBusinessCustomer?.other_details?.credit_limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? null,
                credit_term: isPersonal ? (+value?.ShopPersonalCustomer?.other_details?.credit_term).toLocaleString() ?? null : (+value?.ShopBusinessCustomer?.other_details?.credit_term).toLocaleString() ?? null,

                payment_paid_status: value.ShopServiceOrderDoc.payment_paid_status,
                ShopPaymentTransactions: value.ShopServiceOrderDoc.ShopPaymentTransactions ?? [],
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

                                    default:
                                        return "-"
                                }
                            })
                        // return arr.map(e => e[key] === 1 ? "เงินสด" : e.payment_method === 2 ? "เครดิต/เดบิต" : "โอนเงินสด")

                        case "payment_price_paid":
                            if (filterPayment.length === 1) {
                                return arr.map(e => RoundingNumber(e?.["details"]?.["actual_paid"] ?? e?.[key]) ?? null).filter(where => where !== null) ?? null
                            } else {
                                return arr.map(e => e["payment_method"] === 1 ? `${RoundingNumber(e[key])} (เงินสด)` : e.payment_method === 2 ? `${RoundingNumber(e[key])} (เครดิต/เดบิต)` : `${RoundingNumber(e[key])} (โอนเงินสด)`)
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
                    change
                }
            }
            console.log('model :>> ', model);

            /*เช็คว่าเป็นใบกำกับภาษีอย่างย่อหรือเต็มรูป*/
            const find = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === shop_service_order_doc_id && where.status === 1) ?? null

            if (!!find && isPlainObject(find)) {
                setTaxInvoiceTypeAbbActive(find["is_abb"])
                setTaxInvoiceTypeInvActive(find["is_inv"])
            } else {
                setTaxInvoiceTypeAbbActive(null)
                setTaxInvoiceTypeInvActive(null)
            }


            for (let i = 0; i < list_service_product.length; i++) {
                const {
                    shop_stock_id,
                    price_unit,
                    price_discount,
                    price_discount_percent,
                    price_grand_total,
                    purchase_unit_id,
                    shop_warehouse_id,
                    shop_warehouse_shelf_item_id,
                    amount,
                    details,
                    dot_mfd,
                    cost_unit,
                    id,
                    status
                } = list_service_product[i];

                const modelListServiceProduct = {
                    id,
                    status,
                    shop_stock_id,
                    shop_stock_list: [details["meta_data"]].map(e => ({ id: e.ShopStock.id, ShopProduct: e.ShopProduct, product_id: e.ShopProduct.id })),
                    product_cost: cost_unit,
                    price_unit,
                    price_discount,
                    price_discount_percent,
                    price_grand_total,
                    purchase_unit_id,
                    purchase_unit_list: [details["meta_data"]["ProductPurchaseUnitType"]],
                    warehouse: shop_warehouse_id,
                    warehouse_list: [details["meta_data"]["ShopStock"]["ShopWarehouse"]].map(e => ({ ...e, id: e.id, name: { th: e.name } })),
                    shelf: shop_warehouse_shelf_item_id,
                    shelf_list: [details["meta_data"]["ShopStock"]["ShopWarehouse"]["ShopWarehouseSelfItem"]].map(e => ({ code: e.id, name: { th: e.name } })),
                    amount: amount,
                    dot_mfd: isArray(details["dot_mfd_list"]) ? details["dot_mfd_list"].length === 0 ? "-" : dot_mfd : dot_mfd,
                    dot_mfd_list: isArray(details["dot_mfd_list"]) ? details["dot_mfd_list"].length === 0 ? ["-"] : details["dot_mfd_list"] : [dot_mfd],
                    change_name_status: details["change_name_status"],
                    changed_name: details["changed_name"],
                    remark: details["remark"] ?? null,

                    is_discount: details["is_discount"],
                    price_unit_vat: details["price_unit_vat"],
                    price_unit_before_vat: details["price_unit_before_vat"],
                    price_unit_add_vat: details["price_unit_add_vat"],
                    price_grand_total_vat: details["price_grand_total_vat"],
                    price_grand_total_before_vat: details["price_grand_total_before_vat"],

                    is_discount_by_percent: details["is_discount_by_percent"],
                    is_discount_by_bath: details["is_discount_by_bath"],
                    price_discount_for_cal: details["price_discount_for_cal"],

                    price_discount_2: details["price_discount_2"],
                    price_discount_percent_2: details["price_discount_percent_2"],
                    price_discount_3: details["price_discount_3"],
                    price_discount_percent_3: details["price_discount_percent_3"],

                    price_discount_all: price_discount * amount,
                    price_discount_all_2: details["price_discount_2"] * amount,
                    price_discount_all_3: details["price_discount_3"] * amount,

                    price_discount_all_percent: MatchRound(((price_discount * amount) / (price_unit * amount)) * 100),
                    price_discount_all_percent_2: MatchRound(((details["price_discount_2"] * amount) / (price_unit * amount)) * 100),
                    price_discount_all_percent_3: MatchRound(((details["price_discount_3"] * amount) / (price_unit * amount)) * 100),
                }

                list_service_product[i] = { ...modelListServiceProduct }

                list_service_product = list_service_product.filter(where => where.status === 1)
                form.setFieldsValue({
                    [i]: { ...modelListServiceProduct },
                    list_service_product
                })
            }
            form.setFieldsValue({ ...model })
            // calculateResult()
        } catch (error) {
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
                                        doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
                                        doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
                                        payment_paid_status: modelSearch.payment_paid_status,
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

    const confirmOrder = (fromTable = false, doc_list_service_product, doc_id) => {
        try {
            let list_service_product = fromTable === true ? doc_list_service_product : form.getFieldValue("list_service_product")
            const invalidList = []
            if (fromTable === true) {
                if (isArray(list_service_product) && list_service_product.length > 0) {
                    list_service_product.map((e, index) => {
                        const { shop_stock_id, shop_warehouse_id, shop_warehouse_shelf_item_id, amount } = e
                        if (!shop_stock_id || !shop_warehouse_id || !shop_warehouse_shelf_item_id || !amount) {
                            invalidList.push(index)
                        }
                    })
                }
            } else {
                if (isArray(list_service_product) && list_service_product.length > 0) {
                    list_service_product.map((e, index) => {
                        const { shop_stock_id, warehouse, shelf, amount } = e
                        if (!shop_stock_id || !warehouse || !shelf || !amount) {
                            invalidList.push(index)
                        }
                    })
                }
            }

            if (invalidList.length === 0) {
                Swal.fire({
                    title: GetIntlMessages("ยืนยันใบส่งสินค้าชั่วคราวนี้หรือไม่ ?"),
                    text: GetIntlMessages("ใบส่งสินค้าชั่วคราวจะกลายเป็นฉบับจริง และเลขใบส่งสินค้าชั่วคราวจะมีการเปลี่ยนแปลง !!"),
                    icon: "question",
                    showCancelButton: true,
                    cancelButtonText: GetIntlMessages("cancel"),
                    confirmButtonColor: mainColor,
                    confirmButtonText: GetIntlMessages("submit")
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await resultConfirmDoc(fromTable, doc_id)
                    }
                })
            } else {
                Swal.fire({
                    title: `ท่านกรอกข้อมูลรายการสินค้าไม่ครบถ้วน ยืนยันการทำรายการหรือไม่ !?`,
                    text: `รายการที่ ${invalidList.map(e => e + 1)} มีข้อมูลไม่ครบถ้วน รายการเหล่านี้จะไม่ถูกบันทีกหากท่านยืนยัน !!`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages("submit"),
                    confirmButtonColor: mainColor,
                    cancelButtonText: GetIntlMessages("cancel")
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await resultConfirmDoc(fromTable, doc_id)
                    }
                })
            }

        } catch (error) {
            setCarPreLoading(() => false)
            setLoading(() => false)
        }
    }

    const resultConfirmDoc = async (fromTable = false, doc_id) => {
        try {
            console.log("asdsd", configTable)
            setLoading(() => true)
            setCarPreLoading(true)
            const { id, list_service_product } = form.getFieldValue()
            if (fromTable === true) {
                const { data } = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${doc_id}`, { is_draft: false })
                if (data.status === "success") {
                    Swal.fire({ title: 'ยืนยันรายการสำเร็จ !!', icon: 'success', timer: 2000, timerProgressBar: true })
                    await getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        _status: modelSearch.status,
                        doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
                        doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
                        payment_paid_status: modelSearch.payment_paid_status,
                        limit: configTable.limit
                    })
                } else {
                    Swal.fire({ title: 'มีบางอย่างผิดพลาดกรุณาติอต่อเจ้าหน้าที่ !!', icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                    await getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        _status: modelSearch.status,
                        doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
                        doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
                        payment_paid_status: modelSearch.payment_paid_status,
                        limit: configTable.limit
                    })
                }
            } else {
                await onFinish(form.getFieldValue(), true).then(async (result) => {
                    if (result.data.status === "success") {
                        const { data } = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${id}`, { is_draft: false })
                        // console.log('{data} :>> ', data);
                        if (data.status === "success") {
                            Swal.fire({ title: 'ยืนยันรายการสำเร็จ !!', icon: 'success', timer: 2000, timerProgressBar: true })

                            const { ShopServiceOrderDoc } = data.data, doc_date = moment(ShopServiceOrderDoc.current.doc_date)
                            list_service_product = list_service_product.filter(where => !!where.shop_stock_id && !!where.warehouse && !!where.shelf && !!where.amount)
                            const model = { ...ShopServiceOrderDoc.current, doc_date, doc_type_id: docTypeId, list_service_product }
                            form.setFieldsValue({ ...model })
                        } else {
                            Swal.fire({ title: 'มีบางอย่างผิดพลาดกรุณาติอต่อเจ้าหน้าที่ !!', icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                        }
                    } else {
                        Swal.fire({ title: 'ยืนยันรายการไม่สำเร็จ !!', text: 'มีบางอย่างผิดพลาดกรุณาติอต่อเจ้าหน้าที่', icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                    }
                })
            }

            setCarPreLoading(false)
            setLoading(() => false)
        } catch (error) {

        }
    }

    const createDeliveryOrderDoc = () => {
        try {
            Swal.fire({
                title: GetIntlMessages("ยืนยันการสร้างใบส่งของชั่วคราวหรือไม่ ?"),
                // text : GetIntlMessages("ใบสั่งซ่อมจะกลายเป็นฉบับจริง และเลขใบสั่งซ่อมจะมีการเปลี่ยนแปลง !!"),
                icon: "question",
                showCancelButton: true,
                cancelButtonText: GetIntlMessages("cancel"),
                confirmButtonColor: mainColor,
                confirmButtonText: GetIntlMessages("submit")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoading(() => true)
                    const { id } = form.getFieldValue()
                    const { data } = await API.post(`/shopTemporaryDeliveryOrderDoc/add`, { shop_service_order_doc_id: id })
                    // console.log('{data} :>> ', data);
                    if (data.status === "success") {
                        Swal.fire({ title: 'ยืนยันรายการสำเร็จ !!', icon: 'success', timer: 2000, timerProgressBar: true })
                        // addEditViewModal("edit" , data.data.id)
                        handleCancel()
                    } else {
                        Swal.fire({ title: 'มีบางอย่างผิดพลาดกรุณาติอต่อเจ้าหน้าที่ !!', icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                    }
                    setLoading(() => false)
                }
            })

        } catch (error) {
            setLoading(() => false)
        }
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

    const onFinish = async (values, isConfirmedDoc = false) => {
        try {
            // console.log('values :>> ', values);
            // console.log('authUser :>> ', authUser);
            setLoading(true)
            setCarPreLoading(true)
            const { price_discount_bill, price_discount_before_pay, price_sub_total, price_discount_total, price_amount_total, price_before_vat, price_vat, price_grand_total } = values

            let shopId = authUser?.UsersProfile?.shop_id
            let directory = "shopWholesaleDocument"
            let upload_product_list = [], upload_payment_list = []

            if (values.upload_product_list) {
                if (values?.upload_product_list?.fileList?.length > 0) {
                    await Promise.all(values.upload_product_list.fileList.map(async (e, index) => {
                        await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "product" }).then(({ data }) => {
                            if (data.status === "success") {
                                try {
                                    upload_product_list.push(
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
                shop_id: authUser?.UsersProfile?.shop_id,
                // [values.customer_type === 'person' ? "per_customer_id" : "bus_customer_id"]: values.customer_id,
                per_customer_id: values.customer_type === 'person' ? values.customer_id : null,
                bus_customer_id: values.customer_type === 'business' ? values.customer_id : null,
                doc_type_id: values.doc_type_id,
                doc_date: moment(values.doc_date).format("YYYY-MM-DD"),
                vehicle_customer_id: values.vehicle_customer_id ?? null,
                tax_type_id: values.tax_type_id,
                doc_sales_type: 2,
                price_discount_bill: !!price_discount_bill ? MatchRound(price_discount_bill) : "0.00",
                price_discount_before_pay: !!price_discount_before_pay ? MatchRound(price_discount_before_pay) : "0.00",
                price_sub_total: !!price_sub_total ? MatchRound(price_sub_total) : "0.00",
                price_discount_total: !!price_discount_total ? MatchRound(price_discount_total) : "0.00",
                price_amount_total: !!price_amount_total ? MatchRound(price_amount_total) : "0.00",
                price_before_vat: !!price_before_vat ? MatchRound(price_before_vat) : "0.00",
                price_vat: !!price_vat ? MatchRound(price_vat) : "0.00",
                price_grand_total: !!price_grand_total ? MatchRound(price_grand_total) : "0.00",
                details: {
                    user_id: values.user_id,
                    repair_man: values?.repair_man ?? [],
                    sales_man: values.sales_man ?? [],
                    remark: values?.remark ?? null,
                    remark_inside: values?.remark_inside ?? null,
                    previous_mileage: values?.previous_mileage ?? null,
                    current_mileage: values?.current_mileage ?? null,
                    customer_phone: values?.customer_phone ?? null,
                    upload_product_list: await values.upload_product_list.fileList === undefined ? await values.upload_product_list : values.upload_product_list.fileList,
                    upload_payment_list: await values.upload_payment_list.fileList === undefined ? await values.upload_payment_list : values.upload_payment_list.fileList,
                    price_discount_bill_percent: !!values.price_discount_bill_percent ? MatchRound(values.price_discount_bill_percent) : "0.00"
                },
                shopTemporaryDeliveryOrderLists: !!values.list_service_product && values.list_service_product.length > 0 ?
                    values.list_service_product.map((e, index) => {
                        const modelServiceLists = {
                            seq_number: index + 1,
                            shop_id: authUser?.UsersProfile?.shop_id,
                            shop_stock_id: e.shop_stock_id,
                            shop_product_id: e?.shop_stock_list.find(where => where.id === e.shop_stock_id)?.["product_id"] ?? null,
                            shop_warehouse_id: e.warehouse,
                            shop_warehouse_shelf_item_id: e.shelf,
                            purchase_unit_id: e.purchase_unit_id,
                            dot_mfd: !!e?.dot_mfd && e?.dot_mfd !== "-" ? e?.dot_mfd : null,
                            amount: e.amount,
                            cost_unit: !!e?.product_cost && e?.product_cost !== "null" && e?.product_cost !== "-" ? takeOutComma(e?.product_cost) : "0.00",
                            price_unit: e?.price_unit ?? "0.00",
                            price_discount: e?.price_discount ?? "0.00",
                            price_discount_percent: e?.price_discount_percent ?? "0.00",
                            price_grand_total: e?.price_grand_total ?? "0.00",

                            details: {
                                dot_mfd_list: e.dot_mfd_list.filter(where => where !== undefined && where !== "-"),
                                change_name_status: e.change_name_status,
                                changed_name: e.changed_name,
                                remark: e.remark,

                                is_discount: e?.is_discount ?? false,
                                price_unit_vat: e?.price_unit_vat ?? "0.00",
                                price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                                price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",
                                price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                                price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                                price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                                is_discount_by_percent: e?.is_discount_by_percent ?? false,
                                is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                                price_discount_for_cal: e?.price_discount_for_cal ?? "0.00",

                                price_discount_2: e?.price_discount_2 ?? "0.00",
                                price_discount_percent_2: e?.price_discount_percent_2 ?? "0.00",
                                price_discount_3: e?.price_discount_3 ?? "0.00",
                                price_discount_percent_3: e?.price_discount_percent_3 ?? "0.00",
                            }

                        }
                        if (configModal.mode !== "add") modelServiceLists.id = e.id
                        return {
                            ...modelServiceLists
                        }
                    })
                    : []
            }

            if (isConfirmedDoc) {
                model.shopTemporaryDeliveryOrderLists = model.shopTemporaryDeliveryOrderLists.filter(where => !!where.shop_stock_id && !!where.shop_warehouse_id && !!where.shop_warehouse_shelf_item_id && !!where.amount)
            }
            const invalidList = []
            // console.log('model :>> ', model);
            if (isArray(model.shopTemporaryDeliveryOrderLists) && model.shopTemporaryDeliveryOrderLists.length > 0) {
                model.shopTemporaryDeliveryOrderLists.map((e, index) => {
                    const { shop_stock_id, shop_warehouse_id, shop_warehouse_shelf_item_id, amount } = e
                    if (!shop_stock_id || !shop_warehouse_id || !shop_warehouse_shelf_item_id || !amount) {
                        invalidList.push(index)
                    }
                })
            }
            console.log('invalidList :>> ', invalidList);
            let res
            if (invalidList.length === 0) {
                if (configModal.mode === "add") {
                    // model.shop_id = authUser?.UsersProfile?.shop_id
                    res = await API.post(`/shopTemporaryDeliveryOrderDoc/add`, model)
                    // console.log('model :>> ', model);
                } else if (configModal.mode === "edit") {
                    const { id } = form.getFieldValue()
                    model.status = 1
                    res = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${id}`, model)
                }
                if (isConfirmedDoc === false) {
                    resultSubmit(res)
                } else {
                    return res
                }
            } else {
                Swal.fire({
                    title: `ท่านกรอกข้อมูลรายการสินค้าไม่ครบถ้วน ยืนยันการทำรายการหรือไม่ !?`,
                    text: `รายการที่ ${invalidList.map(e => e + 1)} มีข้อมูลไม่ครบถ้วน รายการเหล่านี้จะไม่ถูกบันทีกหากท่านยืนยัน !!`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages("submit"),
                    confirmButtonColor: mainColor,
                    cancelButtonText: GetIntlMessages("cancel")
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        setCarPreLoading(true)
                        model.shopTemporaryDeliveryOrderLists = model.shopTemporaryDeliveryOrderLists.filter(where => !!where.shop_stock_id && !!where.shop_warehouse_id && !!where.shop_warehouse_shelf_item_id && !!where.amount)

                        if (configModal.mode === "add") {
                            // model.shop_id = authUser?.UsersProfile?.shop_id
                            res = await API.post(`/shopTemporaryDeliveryOrderDoc/add`, model)
                            // console.log('model :>> ', model);
                        } else if (configModal.mode === "edit") {
                            const { id } = form.getFieldValue()
                            model.status = 1
                            res = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${id}`, model)
                        }
                        if (isConfirmedDoc === false) {
                            resultSubmit(res)
                        } else {
                            return res
                        }
                        setCarPreLoading(false)
                    } else {
                        setCarPreLoading(false)
                    }

                })
            }
            setCarPreLoading(false)
            setLoading(false)

        } catch (error) {
            setLoading(false)
            // console.log('error :>> ', error);
        }
    }

    const resultSubmit = (res) => {
        try {
            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบส่งสินค้าชั่วคราวสำเร็จ !!"),
                    icon: "success",
                    timer: 2000
                })
                handleCancel()
                // getDataSearch({
                //     page: configTable.page,
                //     search: modelSearch.search,
                //     _status: modelSearch.status,
                // })
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

    const calculateResult = (discount_last_bill_type = "") => {
        try {
            const { list_service_product, price_discount_bill, tax_type_id, price_discount_bill_percent } = form.getFieldValue()
            price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
            price_discount_bill_percent = !!price_discount_bill_percent ? Number(price_discount_bill_percent) : null

            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0;

            switch (discount_last_bill_type) {
                case "percent":
                    price_discount_bill = (summaryFromTable(list_service_product, "price_grand_total", false) * price_discount_bill_percent) / 100
                    break;
                case "bath":
                    price_discount_bill_percent = MatchRound((price_discount_bill / (summaryFromTable(list_service_product, "price_grand_total", false))) * 100)
                    break;
                default:
                    break;
            }

            function summaryFromTable(arr, key, mutiplyWithAmount = false) {
                if (key === "price_unit") {
                    let discount_arr = arr.filter(x => x.is_discount === true)
                    if (discount_arr.length > 0) {
                        if (mutiplyWithAmount) {
                            return discount_arr.reduce((prevValue, currentValue) => prevValue + (Math.abs(Number((currentValue?.[key] ?? 0)) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                        } else {
                            return discount_arr.reduce((prevValue, currentValue) => prevValue + Math.abs(Number((currentValue?.[key] ?? 0)), 0))
                        }
                    } else {
                        return 0
                    }
                } else {
                    if (mutiplyWithAmount) {
                        return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                    } else {
                        return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
                    }
                }
            }

            if (!!list_service_product && isArray(list_service_product) && list_service_product.length > 0) {
                price_discount_total = Number(summaryFromTable(list_service_product, "price_discount", true)) + Number(summaryFromTable(list_service_product, "price_discount_2", true)) + Number(summaryFromTable(list_service_product, "price_discount_3", true)) + (Number(price_discount_bill) ?? 0) + Number(summaryFromTable(list_service_product, "price_unit", true))
                price_sub_total = summaryFromTable(list_service_product, "price_grand_total", false) + (MatchRound(price_discount_total) - price_discount_bill)
                price_amount_total = MatchRound(price_sub_total) - MatchRound(price_discount_total)


                const { detail } = taxTypes.find(where => where.id === tax_type_id)

                let taxRate = 0
                if (Number(detail.tax_rate_percent) > 9) {
                    taxRate = Number(`1${detail.tax_rate_percent}`)
                } else {
                    taxRate = Number(`10${detail.tax_rate_percent}`)
                }

                switch (tax_type_id) {
                    case "8c73e506-31b5-44c7-a21b-3819bb712321":
                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / taxRate)))
                            price_before_vat = price_amount_total - price_vat
                            price_grand_total = price_amount_total
                        }
                        break;
                    default:
                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
                            price_grand_total = price_amount_total + price_vat
                            price_before_vat = price_amount_total
                        }
                        break;
                }
            }

            let model_price = {
                price_discount_bill: !!price_discount_bill ? MatchRound(price_discount_bill) : null,
                price_discount_bill_percent: !!price_discount_bill_percent ? price_discount_bill_percent === "NaN" ? 0 : price_discount_bill_percent : null,
                price_sub_total,
                price_discount_total,
                price_amount_total,
                price_vat,
                price_before_vat,
                price_grand_total,
                price_discount_before_pay
            }

            form.setFieldsValue(model_price)
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
            const { shop_service_order_doc_id, ShopServiceOrderDoc } = form.getFieldValue(), findTaxInovicesActiveDoc = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === shop_service_order_doc_id && where.status === 1);
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
                    // disabled: disabledWhenTaxInvoiceDocActive,
                    onClick: handleMenuClick,
                    // style : taxInvoiceType === "is_abb" ? {backgroundColor : "#7FFF00" ,color : "white"} : {}
                },
                {
                    key: '2',
                    label: 'เต็มรูป',
                    onClick: handleMenuClick,
                    disabled: taxInvoiceTypeInvActive,
                    // disabled: disabledWhenTaxInvoiceDocActive,
                    // style : taxInvoiceType === "is_inv" ? {backgroundColor : "#7FFF00" ,color : "white"} : {}
                },
            ]}
        />
    );
    /*end invoices button*/
    // console.log('form.getFieldValue("status") !== 1 :>> ', form.getFieldValue("status"));

    const handleOpenCreateINVModal = () => {
        setIsCreateINVModalVisible(true)
    }
    const handleCancelCreateINVModal = () => {
        setIsCreateINVModalVisible(false)
    }

    const onCheckIsABB = (value) => {
        setIsCheckABB(value.target.checked)
    }
    const onCheckIsINV = (value) => {
        setIsCheckINV(value.target.checked)
    }

    const handleOpenCustomerDataModal = () => {
        try {
            console.log("test")
            setIsCustomerDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelCustomerDataModal = () => {
        try {
            setIsCustomerDataModalVisible(false)
        } catch (error) {

        }
    }

    const callBackPickCustomer = async (data) => {
        try {
            setCustomerPickToCreateINV(data)
            const customer_full_name = customerType === "person" ?
                `${data.customer_name.first_name[locale.locale] ?? "-"} ${data.customer_name.last_name[locale.locale] ?? ""}` :
                `${data.customer_name[locale.locale] ?? "-"}`;
            setCustomerPickToCreateINVName(customer_full_name)
            handleCancelCustomerDataModal()
        } catch (error) {
            console.log("callBackPickCustomer", error)
        }
    }

    const handleChangeCustomerType = (value) => {
        try {
            setCustomerPickToCreateINV(null)
            setCustomerPickToCreateINVName("")
            setCustomerType(value)
            console.log('value handleChangeCustomerType:>> ', value);
        } catch (error) {

        }
    }

    const createINV = async () => {

        const { shop_service_order_doc_id, ShopServiceOrderDoc } = form.getFieldValue(), findTaxInovicesActiveDoc = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === shop_service_order_doc_id && where.status === 1) ?? null;
        const model = {}
        setCarPreLoading(true)
        const modelEdit = {}

        let res

        if ((isArray(ShopServiceOrderDoc?.ShopTaxInvoiceDocs) && ShopServiceOrderDoc?.ShopTaxInvoiceDocs.length === 0) || !findTaxInovicesActiveDoc) {
            model = {
                shop_service_order_doc_id,
                is_abb: isCheckABB,
                is_inv: isCheckINV,
            }
            res = await API.post(`/shopTaxInvoiceDoc/add`, model)
        } else {
            model = {
                shop_service_order_doc_id,
                [isCheckABB ? "is_abb" : "is_inv"]: true
            }
            delete model.shop_service_order_doc_id
            res = await API.put(`/shopTaxInvoiceDoc/put/${findTaxInovicesActiveDoc.id}`, model)
        }
        if (res.data.status === "success") {
            let ShopTaxInvoiceDoc = res.data.data.ShopTaxInvoiceDoc

            if (customerType === "person") {
                modelEdit = {
                    bus_customer_id: null,
                    per_customer_id: customerPickToCreateINV.id,
                    edit_price: true
                }
            } else {
                modelEdit = {
                    bus_customer_id: customerPickToCreateINV.id,
                    per_customer_id: null,
                    edit_price: true
                }
            }
            let editRes
            editRes = await API.put(`/shopTaxInvoiceDoc/put/${ShopTaxInvoiceDoc.id}`, modelEdit)

            if (editRes.data.status === "success") {
                Swal.fire({ title: 'ยืนยันรายการสำเร็จ !! ท่านต้องการไปยังหน้าใบกำกับภาษีหรือไม่ ?', icon: 'question', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor, showCancelButton: true, cancelButtonText: GetIntlMessages("cancel") }).then((resultVal) => {
                    if (resultVal.isConfirmed) {
                        router.push({
                            pathname: "ShopTaxInvoiceDocWholeSale",
                        })
                    }
                })
                handleCancel()
                handleCancelCreateINVModal()
            }
        } else {
            Swal.fire({ title: 'มีบางอย่างผิดพลาดกรุณาติอต่อเจ้าหน้าที่ !!', icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
        }
        setCarPreLoading(false)
    }

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
                upload_car_list: value.details?.upload_car_list ?? [],
                upload_product_list: value.details?.upload_product_list ?? [],
                upload_payment_list: value.details?.upload_payment_list ?? [],
                upload_remove_list: [],
                ShopTemporaryDeliveryOrderLists: value.ShopTemporaryDeliveryOrderLists,
                details: value.details
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
            let directory = "shopRetailDocument"
            let upload_car_list = [], upload_product_list = [], upload_payment_list = []
            if (values.upload_car_list) {
                if (values?.upload_car_list?.fileList?.length > 0) {
                    await Promise.all(values.upload_car_list.fileList.map(async (e, index) => {
                        await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "car" }).then(({ data }) => {
                            if (data.status === "success") {
                                try {
                                    upload_car_list.push(
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

            if (values.upload_product_list) {
                if (values?.upload_product_list?.fileList?.length > 0) {
                    await Promise.all(values.upload_product_list.fileList.map(async (e, index) => {
                        await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "product" }).then(({ data }) => {
                            if (data.status === "success") {
                                try {
                                    upload_product_list.push(
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
                shopTemporaryDeliveryOrderLists: values.ShopTemporaryDeliveryOrderLists,
                details: values.details,
            }
            delete model.details.meta_data
            model.details.upload_car_list = await values.upload_car_list.fileList === undefined ? await values.upload_car_list : values.upload_car_list.fileList
            model.details.upload_product_list = await values.upload_product_list.fileList === undefined ? await values.upload_product_list : values.upload_product_list.fileList
            model.details.upload_payment_list = await values.upload_payment_list.fileList === undefined ? await values.upload_payment_list : values.upload_payment_list.fileList
            console.log(model)
            let res
            res = await API.put(`/shopTemporaryDeliveryOrderDoc/put/${values.id}`, model)
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

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} title={title !== null ? false : true} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} />
            {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} specificFunction={specificFunction} /> */}

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                // onOk={handleOk}
                // onCancel={handleCancel}
                // onCancel={()=>setIsModalVisible(()=>false)}
                // hideSubmitButton={configModal.mode === "view"}
                mode={configModal.mode}
                // okButtonProps={{ disabled: configModal.mode === "view" && isModeInvovices != true }}
                title={<ModalFullScreenTitle title={documentTypesName} isShowTittle={true} />}
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
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("status") != 1} >
                                            <PrintOut textButton={"พิมพ์ใบส่งสินค้า"} printOutHeadTitle={(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : "ใบส่งสินค้า/ใบแจ้งหนี้"} loading={loading} documentId={form.getFieldValue("id")} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} customPriceUse={true} docTypeId={docTypeId} />
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode !== "edit" || form.getFieldValue("is_draft") === false || form.getFieldValue("status") != 1} >
                                            <Button loading={loading} onClick={() => confirmOrder()} type="text" style={{ width: "100%", borderColor: "black", overflow: "hidden", padding: 0 }}>{GetIntlMessages("ยืนยันใบส่งสินค้าชั่วคราว")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("is_draft") === true || form.getFieldValue("status") != 1} >
                                            {/* <Col xxl={4} lg={6} md={12} xs={24}  > */}
                                            <PaymentDocs loading={loading || carPreLoading} docId={form.getFieldValue("id")} title={`ชำระเงิน ใบส่งของชั่วคราว ${form.getFieldValue("code_id") ?? ""}`} handleCancelTemDoc={handleCancel} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                            {/* <Button type='primary' icon={<DollarCircleOutlined style={{fontSize : 16}}/>} loading={loading} style={{ width: "100%", display : "flex" , justifyContent : "center" ,alignItems : "center" , backgroundColor : "#85BB65" , border : 0}}>{GetIntlMessages("รับชำระ")}</Button> */}
                                        </Col>
                                        {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view" || form.getFieldValue("is_draft") !== false || disabledWhenDeliveryDocActive || form.getFieldValue("status") != 1}>
                                            <Button loading={loading} onClick={() => createDeliveryOrderDoc()} type="text" style={{ overflow: "hidden", width: "100%", borderColor: "black", padding: 2 }}>{GetIntlMessages("สร้างใบส่งของชั่วคราว")}</Button>
                                        </Col> */}
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("is_draft") === true || form.getFieldValue("status") != 1 || (!taxInvoiceTypeAbbActive && !taxInvoiceTypeInvActive)}>
                                            {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode !== "edit" || form.getFieldValue("is_draft") === true}> */}
                                            {/* <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode !== "view"}> */}
                                            <Dropdown overlay={menu} style={{ width: "100%" }} loading={loading}>
                                                <Button onClick={(e) => e.preventDefault()} style={{ width: "100%", padding: 4 }}>
                                                    <Space>
                                                        สร้างใบกำกับภาษี
                                                        <DownOutlined />
                                                    </Space>
                                                </Button>
                                            </Dropdown>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add" || form.getFieldValue("is_draft") === true || form.getFieldValue("status") != 1 || (taxInvoiceTypeAbbActive || taxInvoiceTypeInvActive)}>
                                            <Button style={{ width: "100%" }} onClick={handleOpenCreateINVModal}>สร้างใบกำกับภาษี</Button>
                                        </Col>

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
                >
                    {
                        carPreLoading ? <CarPreloader />
                            :
                            <div className="container-fluid">
                                <div className='pr-5 pl-5 detail-before-table'>
                                    {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                                    <FormTemporaryDeliveryOrderDoc
                                        mode={configModal.mode}
                                        calculateResult={calculateResult}
                                        disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive}
                                        setCustomerType={setCustomerType}
                                        setCustomerPickToCreateINV={setCustomerPickToCreateINV}
                                        setCustomerPickToCreateINVName={setCustomerPickToCreateINVName}
                                    />
                                </div>
                                <div className='tab-detail'>
                                    <Tabs
                                        defaultActiveKey="1"
                                        activeKey={activeKeyTab}
                                        onChange={handleChangeTabs}
                                        items={[
                                            {
                                                label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> สินค้า/บริการ</span>),
                                                key: '1',
                                                children: <Tab1ServiceAndProductV2 calculateResult={calculateResult} mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />,
                                            },
                                            {
                                                label: (<span><UserOutlined style={{ fontSize: 18 }} /> ลูกค้า</span>),
                                                key: '2',
                                                children: <Tab2CustomerInfo />,
                                            },
                                            // {
                                            //     label: (<span><CarOutlined style={{ fontSize: 18 }} /> รถยนต์</span>),
                                            //     key: '3',
                                            //     children: <Tab3VehicleInfo />,
                                            // },
                                            {
                                                label: (<span><FileImageOutlined style={{ fontSize: 18 }} /> รูปภาพ</span>),
                                                key: '4',
                                                children: <Tab4DocImage mode={configModal.mode} />,
                                            },
                                        ]}
                                    />

                                    {/* </Tabs> */}
                                </div>
                            </div>
                    }
                    <Form.Item name="upload_product_list">

                    </Form.Item>
                    <Form.Item name="upload_payment_list">

                    </Form.Item>
                    <Form.Item name="upload_remove_list">

                    </Form.Item>
                </Form>
            </ModalFullScreen>
            <Modal
                maskClosable={false}
                open={isCreateINVModalVisible}
                onCancel={handleCancelCreateINVModal}
                // width="30vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelCreateINVModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <Result
                    // status="success"
                    title={GetIntlMessages(`ยืนยันการ "สร้างใบส่งสินค้าชั่วคราว และใบกำกับภาษี" นี้หรือไม่ ?`)}
                    subTitle={GetIntlMessages("ใบสั่งซ่อมจะกลายเป็นฉบับจริง และเลขใบสั่งซ่อมจะมีการเปลี่ยนแปลง !!")}
                >
                    <Row style={{ textAlign: "center" }}>
                        <Col span={12}>
                            <Checkbox onChange={onCheckIsABB} disabled={taxInvoiceTypeAbbActive}>อย่างย่อ</Checkbox>
                        </Col>
                        <Col span={12}>
                            <Checkbox onChange={onCheckIsINV} disabled={taxInvoiceTypeInvActive}>เต็มรูป</Checkbox>
                        </Col>
                    </Row>
                </Result>
                <Form
                    layout='vertical'
                >
                    <Row gutter={8}>
                        <Col span={12}>

                            <Form.Item
                                label="ประเภทลูกค้า"
                            >
                                <Select
                                    onChange={(value) => handleChangeCustomerType(value)}
                                    style={{ width: "100%" }}
                                    value={customerType}
                                    showArrow={false}>
                                    <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                    <Select.Option value="business">ธุรกิจ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={
                                    <>
                                        {"ชื่อลูกค้า"}
                                        <Tooltip
                                            title="กรณีต้องการเปลี่ยนชื่อลูกค้าที่ใบกำกับภาษี สามารถเลือกลูกค้าใหม่ได้ที่ช่องนี้">
                                            <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                        </Tooltip>
                                    </>
                                }
                            >
                                <Input disabled value={customerPickToCreateINVName} addonAfter={
                                    <Button
                                        type='text'
                                        size='small'
                                        style={{ border: 0 }}
                                        onClick={() => handleOpenCustomerDataModal()}
                                    >
                                        เลือก
                                    </Button>
                                } />
                            </Form.Item>
                        </Col>
                        <Col span={24} style={{ textAlign: "center" }}>
                            <Button onClick={createINV} type='primary' style={{ borderRadius: "30px" }} size='large' disabled={!isCheckABB && !isCheckINV || customerPickToCreateINVName === ""}>
                                สร้างใบกำกับภาษี
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <Modal
                maskClosable={false}
                open={isCustomerDataModalVisible}
                onCancel={handleCancelCustomerDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelCustomerDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {customerType === "person" ? <PersonalCustomersData title="จัดการข้อมูลลูกค้าบุคคลธรรมดา" callBack={callBackPickCustomer} /> : <BusinessCustomersData title="จัดการข้อมูลลูกค้าธุรกิจ" callBack={callBackPickCustomer} />}
            </Modal>

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
                    <Form.Item name="upload_car_list" hidden></Form.Item>
                    <Form.Item name="upload_product_list" hidden></Form.Item>
                    <Form.Item name="upload_payment_list" hidden></Form.Item>
                    <Form.Item name="upload_remove_list" hidden></Form.Item>
                    <Form.Item name="ShopTemporaryDeliveryOrderLists" hidden></Form.Item>
                    <Tab4DocImage mode={"edit"} />
                </Form>
            </Modal>
        </>
    )
}

export default ShopTemporaryDeliveryOrderDocWholeSale