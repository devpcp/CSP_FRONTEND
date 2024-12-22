import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Form, message, Row, Table, Tooltip } from 'antd'
import { get, isArray, isPlainObject, } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import { RoundingNumber } from '../../../../shares/ConvertToCurrency'
import ModalFullScreen from '../../../../shares/ModalFullScreen'
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
            doc_sales_type: 2,
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
                        key: GetIntlMessages("ใบสั่งซ่อม"),
                        value: 1,
                    },
                    {
                        key: GetIntlMessages("ใบสั่งขาย"),
                        value: 2,
                    },
                    {
                        key: GetIntlMessages("เพิ่มหนี้"),
                        value: 3,
                    },
                    {
                        key: GetIntlMessages("ลดหนี้"),
                        value: 4,
                    },
                    {
                        key: GetIntlMessages("ลดหนี้ (ไม่คิดภาษี)"),
                        value: 5,
                    },
                ],
            },
            // {
            //     index: 1,
            //     type: "select",
            //     name: "status",
            //     label: GetIntlMessages("สถานะใบสั่งซ่อม"),
            //     placeholder: GetIntlMessages("select-status"),
            //     list: [
            //         {
            //             key: GetIntlMessages("all-status"),
            //             value: "default",
            //         },
            //         {
            //             key: GetIntlMessages("ใช้งานเอกสาร"),
            //             value: "active",
            //         },
            //         {
            //             key: configPage("table-status-2") ?? GetIntlMessages("ดำเนินการเรียบร้อย"),
            //             value: "block",
            //         },
            //         // {
            //         //     key: configPage("table-status-3") ?? GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี"),
            //         //     value: "delete",
            //         // },
            //     ],
            // },
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
                status: false
            },
            title: {
                not_use_system: "ยกเลิกเอกสาร"
            },
            disabled: {
                active_btn: true,
                block_btn: true,
                delete_btn: true,
            },
            doc_sales_type: 2
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            doc_sales_type: 2,
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
                width: 50,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                // title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `เลขที่ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
                title: () => GetIntlMessages(docSaleType === 2 ? `เลขที่ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
                dataIndex: 'code_id',
                key: 'job_code_id',
                width: 130,
                align: "center",
                sorter: true,
                render: (text, record) => text ?? "-",

            },
            {
                title: () => GetIntlMessages("เลขที่ใบส่งสินค้าชั่วคราว"),
                dataIndex: 'ShopTemporaryDeliveryOrderDocs',
                key: 'trn_code_id',
                width: 130,
                align: "center",
                sorter: true,
                render: (text, record) => text?.find(where => where.status === 1)?.code_id ?? record.ShopTemporaryDeliveryOrderDoc?.code_id ?? "-",
            },
            {
                title: () => GetIntlMessages("เลขที่ใบกำกับภาษี"),
                children: [
                    {
                        title: () => GetIntlMessages("อย่างย่อ"),
                        dataIndex: '',
                        key: '',
                        width: 130,
                        align: "center",
                        render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.abb_code_id ?? "-" : "-"
                    },
                    {
                        title: () => GetIntlMessages("เต็มรูป"),
                        dataIndex: '',
                        key: 'inv_code_id',
                        width: 130,
                        align: "center",
                        sorter: true,
                        render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.inv_code_id ?? "-" : "-"
                    },
                ]
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                sorter: true,
                render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? moment(record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.inv_doc_date).format("DD/MM/YYYY") ?? "-" : isArray(record.ShopTemporaryDeliveryOrderDocs) ? moment(record.ShopTemporaryDeliveryOrderDocs.find(where => where.status === 1)?.doc_date).format("DD/MM/YYYY") ?? "-" : "-",
            },
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
                width: 80,
                align: "center",
                fixed: 'right',
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
                width: 50,
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
                width: 130,
                align: "center",
                render: (text, record) => {
                    if (!!record.code_id) {
                        return get(record, `code_id`, "-")
                    } else {
                        if (!!record?.ShopServiceOrderDoc) {
                            return get(record, `ShopServiceOrderDoc.code_id`, record?.code_id)
                        }
                        if (!!record?.ShopCustomerDebtCreditNoteDoc) {
                            return get(record, `ShopCustomerDebtCreditNoteDoc.code_id`, record?.code_id)
                        }
                        if (!!record?.ShopCustomerDebtDebitNoteDoc) {
                            return get(record, `ShopCustomerDebtDebitNoteDoc.code_id`, record?.code_id)
                        }
                    }
                }
            },
            {
                title: () => GetIntlMessages("เลขที่ใบส่งสินค้าชั่วคราว"),
                dataIndex: 'ShopTemporaryDeliveryOrderDocs',
                key: 'ShopTemporaryDeliveryOrderDocs',
                width: 130,
                align: "center",
                render: (text, record) => text?.find(where => where.status === 1)?.code_id ?? record.ShopTemporaryDeliveryOrderDoc?.code_id ?? "-",
            },
            {
                title: () => GetIntlMessages("เลขที่ใบกำกับภาษี"),
                children: [
                    {
                        title: () => GetIntlMessages("อย่างย่อ"),
                        dataIndex: '',
                        key: '',
                        width: 130,
                        align: "center",
                        render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.abb_code_id ?? "-" : "-"
                    },
                    {
                        title: () => GetIntlMessages("เต็มรูป"),
                        dataIndex: '',
                        key: '',
                        width: 130,
                        align: "center",
                        render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.inv_code_id ?? "-" : "-"
                    },
                ]
            },
            {
                title: () => GetIntlMessages("วันที่"),
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                render: (text, record) => isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? moment(record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.inv_doc_date).format("DD/MM/YYYY") ?? "-" : isArray(record.ShopTemporaryDeliveryOrderDocs) ? moment(record.ShopTemporaryDeliveryOrderDocs.find(where => where.status === 1)?.doc_date).format("DD/MM/YYYY") ?? "-" : "-",
            },
            {
                title: () => GetIntlMessages("ครบกำหนด"),
                dataIndex: 'debt_due_date',
                key: 'debt_due_date',
                width: 100,
                align: "center",
                render: (text, record) => moment(moment(record?.doc_date).add(Number(form.getFieldValue("customer_credit_debt_payment_period")), 'd')).format("DD/MM/YYYY"),
            },
            {
                title: () => GetIntlMessages("จำนวนเงิน"),
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "end" }}>{extractDataDocSaleType(record, 'debt_price_amount')}</div>
                // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>,
            },
            {
                title: () => GetIntlMessages("ยอดคงเหลือ"),
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "end" }}>{extractDataDocSaleType(record, 'debt_price_amount_left')}</div>
                // render : (text, record) =><div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>
            },
            {
                title: () => GetIntlMessages("จัดการ"),
                dataIndex: '',
                key: '',
                width: 50,
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
                case 'CDN':
                    return RoundingNumber(record.price_grand_total)
                case 'CCN':
                    return mode === 'add' ? RoundingNumber(Number(-record.price_grand_total)) : RoundingNumber(Number(-record.price_grand_total))
                case 'NCN':
                    return mode === 'add' ? RoundingNumber(Number(-record.price_grand_total)) : RoundingNumber(Number(record.price_grand_total))
                default:
                    return RoundingNumber(Number(get(record, `ShopServiceOrderDoc.${type}`, 0))) ?? RoundingNumber(Number(record[type])) ?? "-"

            }
        } catch (error) {

        }
    }


    const getCustomerDataTable = (record, type) => {
        try {
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
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = configSort.order === "descend" ? "desc" : "asc", _status = "active", doc_sales_type = modelSearch.doc_sales_type, doc_date_startDate = isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? "" : null, doc_date_endDate = isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? "" : null, }) => {
        try {
            console.log("order", order)
            if (page === 1) setLoading(true)
            let url
            switch (doc_sales_type) {
                case 3:
                    url = `/shopCustomerDebtDebitNoteDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&filter__unUsed__shop_customer_debt_dn_doc_id=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
                case 4:
                    url = `/shopCustomerDebtCreditNoteDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&filter__unUsed__shop_customer_debt_cn_doc_id=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
                case 5:
                    url = `/shopCustomerDebtCreditNoteDocT2/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&filter__unUsed__shop_customer_debt_cn_doc_id=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
                    break;
                default:
                    url = `/shopServiceOrderDoc/all?is_draft=not_draft&search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}&doc_sales_type=${doc_sales_type}&payment_paid_status=5&filter__debt_price_amount_left=true${doc_date_startDate ? `&doc_date_startDate=${moment(doc_date_startDate).format("YYYY-MM-DD")}` : ""}${doc_date_endDate ? `&doc_date_endDate=${moment(doc_date_endDate).format("YYYY-MM-DD")}` : ""}`
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
            const { customer_id, customer_list } = form.getFieldValue(), findCustomerFullName = customer_list.find(where => where.id === customer_id)?.customer_full_name ?? "";
            if (!customer_id) {
                Swal.fire('กรุณาเลือกลูกค้าก่อนเพิ่มรายการ !!', '', 'warning')
            } else {
                setIsModalVisible(true)
                setModelSearch({
                    search: findCustomerFullName,
                    doc_sales_type: 2,
                    select_date: [],
                })
                getDataSearch({
                    page: configTable.page,
                    search: findCustomerFullName ?? modelSearch.search,
                })
            }
        } catch (error) {
            console.log('error handleAdd:>> ', error);
        }
    }

    const handleCancel = () => {
        // form.resetFields()
        // setDebtListTable([])
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            limit: 10,
            doc_sales_type: 2,
            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
        })
        setIsModalVisible(false)
    }


    // const [form] = Form.useForm();

    const handleAddDebtDoc = (value) => {
        try {
            console.log('value :>> ', value);

            const { shopCustomerDebtLists, customer_type } = form.getFieldValue();
            const isObj = isPlainObject(shopCustomerDebtLists?.find(where => where.id === value.id));
            if (value.code_id_prefix === 'NCN') {
                value.doc_type_code_id = 'NCN'
            }
            let arr, debt_price_paid_total = 0,
                newValue = {
                    ...value,
                    doc_date: value.doc_type_code_id === "CCN" || value.doc_type_code_id === "CDN" || value.doc_type_code_id === "NCN" ? value.doc_date : value.ShopTaxInvoiceDocs !== null && value.ShopTaxInvoiceDocs.length !== 0 ? moment(value.ShopTaxInvoiceDocs[0].inv_doc_date) : value.ShopTemporaryDeliveryOrderDocs[0].doc_date,
                    debt_due_date: moment(value.doc_date).add(Number(value[customer_type === "person" ? "ShopPersonalCustomer" : "ShopBusinessCustomer"]?.["other_details"]?.credit_term) ?? 0, 'd') ?? null
                };
            if (value.doc_type_code_id === 'CCN' || value.doc_type_code_id === 'NCN') {
                newValue = { ...newValue, debt_price_paid_total: -Number(value.price_grand_total), debt_price_amount_left: -Number(value.price_grand_total), debt_price_amount: -Number(value.price_grand_total) }
            } else if (value.doc_type_code_id === 'CDN') {
                newValue = { ...newValue, debt_price_paid_total: Number(value.price_grand_total), debt_price_amount_left: Number(value.price_grand_total), debt_price_amount: Number(value.price_grand_total) }
            }
            // console.log("aa")

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
            // console.log("arr", arr)
            debt_price_paid_total = arr.reduce((prevValue, currentValue) => prevValue + Number(currentValue?.debt_price_amount_left ?? 0), 0)
            form.setFieldsValue({ shopCustomerDebtLists: arr, debt_price_paid_total })
        } catch (error) {
            console.log('error handleAddDebtDoc:>> ', error);
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

    const handleAddDebtDocAll = () => {
        for (let index = 0; index < listSearchDataTable.length; index++) {
            const element = listSearchDataTable[index];
            handleAddDebtDoc(element)

        }
    }

    return (
        <>
            <Button onClick={() => handleAdd()} type="primary" style={style} icon={<PlusCircleOutlined style={{ fontSize: 16 }} />}>{textButton ?? `เพิ่มรายการ`}</Button>

            <ModalFullScreen
                title={`เลือกเอกสาร`}
                maskClosable={false}
                visible={isModalVisible}
                onCancel={handleCancel}
                // onOk={handleOk}
                className="modal-padding-20px-screen"
                hideSubmitButton
            >
                {/* <Form
                    // form={form}
                    // onFinish={onFinish}
                    // onFinishFailed={onFinishFailed}
                > */}
                {/* <Form.Item name={`shopCustomerDebtLists`} hidden /> */}

                <Row>
                    {/* <Col span={24} className='mt-4 pr-0 pl-0 detail-before-table'> */}

                    <Col span={24}>
                        {/* <SearchInput title={false} configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} /> */}
                        <SearchInput title={false} configSearch={configSearch} configModal={configModal} loading={loading} value={modelSearch} />
                        <Col span={24} style={{ textAlign: "end", paddingBottom: "8px" }}>
                            <Tooltip placement="topLeft" title={`เลือกข้อมูลทั้งหมดสูงสุด ${configTable.limit} รายการ ตามตารางด้านล่าง สามารถเปลี่ยนแปลงได้ที่จำนวนที่แสดงต่อหน้าด้านล่างของตาราง`}>
                                <Button onClick={handleAddDebtDocAll}>เลือกทั้งหมด </Button>
                            </Tooltip>
                        </Col>
                        <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} hideManagement />
                        {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} /> */}
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
                                        scroll={{ x: 1600 }}
                                        // id={"shopCustomerDebtLists"}
                                        columns={DebtlistColumns}
                                        // dataSource={realTimeDebtList}
                                        dataSource={Form.useWatch("shopCustomerDebtLists", form)?.filter(where => where.id)}
                                        // dataSource={DebtlistTable}
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