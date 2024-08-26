import { DeleteColumnOutlined, DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Form, InputNumber, message, Row, Table, Input, Tooltip } from 'antd'
import { filter, get, isArray, isFunction, isPlainObject, remove } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import { RoundingNumber } from '../../../../shares/ConvertToCurrency'
import ModalFullScreen from '../../../../shares/ModalFullScreen'
import RegexMultiPattern from '../../../../shares/RegexMultiPattern'
import SearchInput from '../../../../shares/SearchInput'
import TableList from '../../../../shares/TableList'

const ComponentsRoutesModalAddDocumentDebtLists = ({ textButton, style, docTypeId, callBackDebtorDocList, initForm, calculateResult, mode }) => {
    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])

    const [DebtlistTable, setDebtListTable] = useState([])
    const [DebtlistColumns, setDebtListColumns] = useState([])

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);

    const form = Form.useFormInstance()

    // const realTimeDebtList = Form.useWatch("shopCustomerDebtLists", form)

    useEffect(() => {
        setColumnsTable()
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
        })
    }, [])

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
            doc_sales_type: value.doc_sales_type,
            doc_date_startDate: isArray(value.select_date) ? value.select_date[0] ?? null : null,
            doc_date_endDate: isArray(value.select_date) ? value.select_date[1] ?? null : null,

        })
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
            doc_sales_type: 1,
            doc_date_startDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(init.modelSearch.select_date) ? init.modelSearch.select_date[1] ?? null : null,
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
                name: "doc_sales_type",
                label: GetIntlMessages("เอกสาร"),
                placeholder: GetIntlMessages("search"),
                list: [
                    {
                        key: GetIntlMessages("ใบรับสินค้า"),
                        value: 1,
                    },
                    {
                        key: GetIntlMessages("เพิ่มหนี้"),
                        value: 2,
                    },
                    {
                        key: GetIntlMessages("ลดหนี้"),
                        value: 3,
                    },
                ],
            },
        ],
        col: 8,
        button: {
            create: false,
            // name: {
            //     add: GetIntlMessages(`สร้าง${documentTypesName}`),
            // },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

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
                updated_by: false,
                updated_date: false,
                status: true
            },
            title: {
                not_use_system: "ยกเลิกเอกสาร"
            },
            disabled: {
                active_btn: true,
                block_btn: true,
                delete_btn: true,
            },
            doc_sales_type: 1
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            doc_sales_type: 1,
            select_date: [],

        },
    }

    const setColumnsTable = (docSaleType) => {
        const _column = [
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 60,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: () => GetIntlMessages(`เลขที่ใบรับสินค้า`),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 180,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "center" }}>{text ?? ""}</div>
            },
            {
                title: () => GetIntlMessages(`เลขที่อ้างอิง`),
                dataIndex: 'References_doc',
                key: 'References_doc',
                width: 180,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "center" }}>{record?.details?.References_doc ?? ""}</div>
            },
            {
                title: () => GetIntlMessages(`สถานะใบกำกับภาษี`),
                dataIndex: 'is_inv',
                key: 'is_inv',
                width: 180,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "center" }}>{
                        record?.details?.is_inv ? record?.details?.is_inv === true ? <div>{"ใช่"}</div> : <div>{"ไม่ใช่"}</div> :
                            <Tooltip title="ใบรับสินค้าใบนี้ไม่ได้ระบุว่าเป็นใบกำกับภาษีหรือไม่ สามารถแก้ไขข้อมูลได้ที่หน้าใบรับสินค้า">
                                <span>ไม่ระบุ</span>
                            </Tooltip>
                    }</div>
                )
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("รหัสผู้จำหน่าย"),
                dataIndex: 'ShopBusinessPartners',
                key: 'ShopBusinessPartners',
                width: 150,
                align: "center",
                render: (text, record) => {
                    switch (record.doc_type_code_id) {
                        case "PDN":
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartner?.code_id ?? "-"}</div>
                        case "PCN":
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartner?.code_id ?? "-"}</div>
                        default:
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartners?.code_id ?? "-"}</div>
                    }
                }
            },
            {
                title: () => GetIntlMessages("ชื่อผู้จำหน่าย"),
                dataIndex: 'ShopBusinessPartners',
                key: 'ShopBusinessPartners',
                width: 250,
                render: (text, record) => {
                    switch (record.doc_type_code_id) {
                        case "PDN":
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartner?.partner_name[locale.locale] ?? "-"}</div>
                        case "PCN":
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartner?.partner_name[locale.locale] ?? "-"}</div>
                        default:
                            return <div style={{ textAlign: "center" }}>{record?.ShopBusinessPartners?.partner_name[locale.locale] ?? "-"}</div>
                    }
                }
            },
            {
                title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                render: (text, record) => {
                    switch (record.doc_type_code_id) {
                        case "PDN":
                            return <div style={{ textAlign: "end" }}>{RoundingNumber((text)) ?? "-"}</div>
                        case "PCN":
                            return <div style={{ textAlign: "end" }}>{RoundingNumber((text)) ?? "-"}</div>
                        default:
                            return <div style={{ textAlign: "end" }}>{RoundingNumber((+record?.details?.net_price)) ?? "-"}</div>
                    }
                }
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
                            return (
                                <span className='color-red font-16'>ยังไม่ชำระ</span>
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
                title: () => GetIntlMessages("ยอดคงเหลือ"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(get(record, `ShopServiceOrderDoc.debt_price_amount_left`, 0))) ?? RoundingNumber(Number(record.debt_price_amount_left)) ?? "-"}</div>
                // render : (text, record) =><div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>
            },
            {
                title: () => GetIntlMessages("จัดการ"),
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                render: (text, record, index) => <Button onClick={() => handleAddDebtDoc(record)}>เลือก</Button>
                // render: (text, record, index) => <Button  onClick={()=>handleAddDebtDoc(record)}>เลือก</Button>
            },
        ]

        const debtColumn = [
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: "2%",
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
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
                render: (text, record) => get(record, `ShopServiceOrderDoc.code_id`, record.code_id)
            },
            {
                title: () => GetIntlMessages(`เลขที่อ้างอิง`),
                dataIndex: 'References_doc',
                key: 'References_doc',
                width: 180,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "center" }}>{record?.details?.References_doc ?? ""}</div>
            },
            {
                title: () => GetIntlMessages(`สถานะใบกำกับภาษี`),
                dataIndex: 'is_inv',
                key: 'is_inv',
                width: 180,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "center" }}>{
                        record?.details?.is_inv ? record?.details?.is_inv === true ? <div>{"ใช่"}</div> : <div>{"ไม่ใช่"}</div> :
                            <Tooltip title="ใบรับสินค้าใบนี้ไม่ได้ระบุว่าเป็นใบกำกับภาษีหรือไม่ สามารถแก้ไขข้อมูลได้ที่หน้าใบรับสินค้า">
                                <span>ไม่ระบุ</span>
                            </Tooltip>
                    }</div>
                )
            },
            {
                title: () => GetIntlMessages("วันที่"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: "5%",
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("ครบกำหนด"),
                dataIndex: 'debt_due_date',
                key: 'debt_due_date',
                width: "10%",
                align: "center",
                render: (text, record) => {
                    switch (record.doc_type_code_id) {
                        case "PDN":
                            return "-"
                        case "PCN":
                            return "-"
                        default:
                            return moment(moment(record?.doc_date).add(Number(form.getFieldValue("partner_credit_debt_payment_period")), 'd')).format("DD/MM/YYYY")
                    }
                }

            },
            {
                title: () => GetIntlMessages("จำนวนเงิน"),
                dataIndex: '',
                key: '',
                width: "10%",
                align: "center",
                render: (text, record) => <div style={{ textAlign: "end" }}>{extractDataDocSaleType(record, 'debt_price_amount')}</div>
            },
            {
                title: () => GetIntlMessages("ยอดคงเหลือ"),
                dataIndex: '',
                key: '',
                width: "10%",
                align: "center",
                render: (text, record) => <div style={{ textAlign: "end" }}>{extractDataDocSaleType(record, 'debt_price_amount_left')}</div>
            },

            {
                title: () => GetIntlMessages("จัดการ"),
                dataIndex: '',
                key: '',
                width: "2%",
                align: "center",
                render: (text, record, index) => record.id ? <Button onClick={() => handleDeleteDebtDoc(record, index)} type='primary' danger icon={<DeleteOutlined />}></Button> : null
            },
        ]

        setColumns(_column)
        setDebtListColumns(debtColumn)
    }

    const extractDataDocSaleType = (record, type) => {
        try {
            switch (record.doc_type_code_id) {
                case 'PDN':
                    return RoundingNumber(record.price_grand_total)
                case 'PCN':
                    return mode === 'add' ? RoundingNumber(Number(-record.price_grand_total)) : RoundingNumber(Number(-record.price_grand_total))
                default:
                    return RoundingNumber(Number(get(record, `ShopServiceOrderDoc.${type}`, 0))) ?? RoundingNumber(Number(record[type])) ?? "-"

            }
        } catch (error) {

        }
    }


    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = "active", doc_sales_type = configTable.doc_sales_type, doc_date_startDate = isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? "" : null, doc_date_endDate = isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? "" : null, }) => {
        try {
            if (page === 1) setLoading(true)
            let url
            switch (doc_sales_type) {
                case 2:
                    url = `/shopPartnerDebtDebitNoteDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&filter__unUsed__shop_customer_debt_dn_doc_id=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
                case 3:
                    url = `/shopPartnerDebtCreditNoteDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&filter__unUsed__shop_customer_debt_cn_doc_id=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
                default:
                    url = `/shopInventoryTransaction/all?is_draft=not_draft&search=${search}&status=1&page=${page}&limit=${limit}&sort=${sort}&order=${order}&doc_sales_type=${doc_sales_type}&payment_paid_status=5&filter__debt_price_amount_left=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
            }
            const res = await API.get(url)

            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data = data.map(e => {
                    e.___update = false;
                    e.___delete = false
                    e.___read = false
                    e.isuse = e.status === 2 ? 0 : e.status == 0 ? 2 : e.status
                    return {
                        ...e
                    }
                });

                // console.log('data :>> ', data);
                setColumnsTable(doc_sales_type)
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

    const [configModal, setConfigModal] = useState({
        mode: "add",
        modeKey: null,
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false)
    const handleAdd = () => {
        try {
            const { partner_id, partner_name } = form.getFieldValue()
            if (!partner_id) {
                Swal.fire('กรุณาเลือกลูกค้าก่อนเพิ่มรายการ !!', '', 'warning')
            } else {
                setIsModalVisible(true)
                setModelSearch({
                    search: partner_name,
                    doc_sales_type: 1,
                    select_date: [],
                })
                getDataSearch({
                    page: configTable.page,
                    search: partner_name ?? modelSearch.search,
                })
            }
        } catch (error) {
            console.log('error handleAdd:>> ', error);
        }
    }

    const handleCancel = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            limit: 10,
            doc_sales_type: 1,
            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
        })
        setIsModalVisible(false)
    }


    // const [form] = Form.useForm();

    const handleAddDebtDoc = (value) => {
        try {
            const { shopCustomerDebtLists } = form.getFieldValue();
            const isObj = isPlainObject(shopCustomerDebtLists?.find(where => where.id === value.id));

            let arr, debt_price_paid_total = 0, newValue = { ...value, debt_due_date: moment(value.doc_date).add(Number(value["ShopBusinessPartners"]?.["other_details"]?.credit_term) ?? 0, 'd') ?? null };
            if (value.doc_type_code_id === 'PCN') {
                newValue = { ...newValue, debt_price_paid_total: -Number(value.price_grand_total), debt_price_amount_left: -Number(value.price_grand_total), debt_price_amount: -Number(value.price_grand_total) }
            } else if (value.doc_type_code_id === 'PDN') {
                newValue = { ...newValue, debt_price_paid_total: Number(value.price_grand_total), debt_price_amount_left: Number(value.price_grand_total), debt_price_amount: Number(value.price_grand_total) }
            }

            if (isObj) {
                Swal.fire('ท่านเลือกเอกสารนี้ไปแล้ว !!', '', 'warning')
                arr = [...shopCustomerDebtLists]
            } else {
                if (!!shopCustomerDebtLists && shopCustomerDebtLists.length > 0) {
                    arr = [...shopCustomerDebtLists, newValue]
                } else {
                    arr = [newValue]
                }
            }
            debt_price_paid_total = arr.reduce((prevValue, currentValue) => prevValue + Number(currentValue?.debt_price_amount_left ?? 0), 0)
            form.setFieldsValue({ shopCustomerDebtLists: arr, debt_price_paid_total })
        } catch (error) {
            // console.log('error handleAddDebtDoc:>> ', error);
        }
    }
    const handleDeleteDebtDoc = (value, index) => {
        try {
            // console.log('value :>> ', value);
            // setDebtListTable((prevValue,currentValue) => console.log('prevValue :>> ', prevValue))
            Swal.fire({
                title: `ยืนยันการลบรายการที่ ${index + 1} หรือไม่ ?`,
                icon: "question",
                confirmButtonText: GetIntlMessages("submit"),
                confirmButtonColor: mainColor,
                showCancelButton: true,
                cancelButtonText: GetIntlMessages("cancel")
            }).then((result) => {
                if (result.isConfirmed) {
                    const { shopCustomerDebtLists } = form.getFieldValue()
                    // const arr = shopCustomerDebtLists?.splice(shopCustomerDebtLists?.findIndex(where => where.id === value.id) ,1)
                    const arr = shopCustomerDebtLists?.filter(where => where.id !== value.id), debt_price_paid_total = isArray(arr) && arr.length > 0 ? arr.reduce((prevValue, currentValue) => prevValue + Number(currentValue?.debt_price_amount_left ?? 0), 0) : 0;
                    form.setFieldsValue({ shopCustomerDebtLists: arr, debt_price_paid_total })
                }
            })

        } catch (error) {
            // console.log('error handleAddDebtDoc:>> ', error);
        }
    }

    /*finish*/
    const handleOk = (modeKey) => {
        try {
            // form.submit()
            setLoading(() => true)
            // console.log('modeKey :>> ', modeKey);
            // setConfigModal({ ...configModal, modeKey })
            onFinish()
            // form.submit()
            setLoading(() => false)
        } catch (error) {
            console.log('error handleOk:>> ', error);
        }

    }

    const onFinish = async (value) => {
        try {
            // console.log('value :>> ', value);
            // if (isFunction(callBackDebtorDocList)) {
            //     //    callBackDebtorDocList(value.shopCustomerDebtLists);
            // }
            form.resetFields()
            setIsModalVisible(false)
            // handleCancel()
            // debugger
        } catch (error) {
            console.log('error onFinish :>> ', error);
        }
    }

    const onFinishFailed = () => {
        try {

        } catch (error) {

        }
    }
    /*End finish*/

    return (
        <>
            <Button onClick={() => handleAdd()} type="primary" style={style} icon={<PlusCircleOutlined style={{ fontSize: 16 }} />}>{textButton ?? `เพิ่มรายการ`}</Button>

            <ModalFullScreen
                title={`เลือกเอกสาร`}
                maskClosable={false}
                visible={isModalVisible}
                onCancel={handleCancel}
                className="modal-padding-20px-screen"
                hideSubmitButton
            >
                <Row>
                    <Col span={24}>
                        <SearchInput title={false} configSearch={configSearch} configModal={configModal} loading={loading} value={modelSearch} />
                        <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} hideManagement />
                    </Col>

                    <Divider />

                    <Col span={24} className="mb-4">
                        <Row>
                            <Col span={24}>
                                <div style={{ width: "100%", fontSize: "2rem", color: mainColor }}>
                                    เอกสารที่เลือก
                                </div>
                            </Col>
                            <Col span={24}>
                                <div id="table-list" >
                                    <Table style={{ width: "100%" }}
                                        columns={DebtlistColumns}
                                        dataSource={Form.useWatch("shopCustomerDebtLists", form)?.filter(where => where.id)}
                                        rowKey={(row) => row.id ?? Math.random()}
                                        pagination={false}
                                    />
                                </div>
                            </Col>
                        </Row>


                    </Col>
                </Row>

                {/* </Form> */}
            </ModalFullScreen>
        </>
    )
}

export default ComponentsRoutesModalAddDocumentDebtLists