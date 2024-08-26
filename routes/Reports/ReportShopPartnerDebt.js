import { useEffect, useState } from 'react'
import { message, Tabs, Modal, Button, Form, Upload, DatePicker, Input, Col, Row, Radio } from 'antd';
import { ExportOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { RoundingNumber, NoRoundingNumber } from '../../components/shares/ConvertToCurrency'
import GetIntlMessages from '../../util/GetIntlMessages';
import moment from 'moment'
import _, { get, isArray, isEmpty, isFunction, isObject, isPlainObject } from 'lodash';
import axios from 'axios';
import { Label } from 'recharts';
const { TabPane } = Tabs;
const ReportShopPartnerDebt = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser, token } = useSelector(({ auth }) => auth);
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [dataSearchModel, setDataSearchModel] = useState({})
    const { shopInCorporate, paymentStatus } = useSelector(({ master }) => master);

    const [form] = Form.useForm();

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
            hide_manage: true,
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: false
            }
        },
        configSort: {
            sort: `created_date`,
            // sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "1",
            doc_date: [],
            debt_due_date: [],
            select_shop_ids: authUser.UsersProfile.ShopsProfile.id,
            payment_paid_status: "0,1,2,3,4,5"
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)


    const setColumnsTable = () => {
        const _column = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 80,
                use: true,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: 'สาขา',
                dataIndex: 'ShopsProfile',
                key: 'ShopsProfile',
                width: 150,
                align: "center",
                use: shopInCorporate.length > 1,
                render: (text, render) => {
                    return shopInCorporate.length > 0 ?
                        shopInCorporate.find(x => x.id === text.id).shop_name?.shop_local_name === undefined ||
                            shopInCorporate.find(x => x.id === text.id).shop_name?.hop_local_name === null ||
                            shopInCorporate.find(x => x.id === text.id).shop_name?.shop_local_name === "" ? shopInCorporate.find(x => x.id === text.id).shop_name[locale.locale] : shopInCorporate.find(x => x.id === text.id).shop_name?.shop_local_name : ""
                }
            },
            {
                title: 'เลขที่เอกสาร',
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                use: true,
            },
            {
                title: 'เลขที่เอกสารภายในใบชำระหนี้',
                dataIndex: 'ShopsPartnerDebtList',
                key: 'ShopsPartnerDebtList',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? text.code_id : "-",
            },
            {
                title: () => GetIntlMessages("วันที่เอกสารภายในใบชำระหนี้"),
                dataIndex: 'ShopsPartnerDebtList',
                key: 'ShopsPartnerDebtList',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? moment(text.doc_date).format("DD/MM/YYYY") : "-",
            },
            {
                title: 'จำนวนเงินภายในใบชำระหนี้',
                dataIndex: 'ShopsPartnerDebtList',
                key: 'ShopsPartnerDebtList',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? (+text.price_grand_total).toLocaleString() : "-",
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("วันครบกำหนดชำระ"),
                dataIndex: 'debt_due_date',
                key: 'debt_due_date',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: 'ชื่อผู้จำหน่าย',
                dataIndex: 'BusinessPartner',
                key: 'BusinessPartner',
                width: 150,
                align: "center",
                use: true,
                render: (text, record, index) => {
                    try {
                        if (record.BusinessPartner !== null) {
                            return record.BusinessPartner.partner_name[locale.locale]
                        }
                    } catch (error) {
                        return ""
                    }
                },
            },
            {
                title: 'จำนวนเงินทั้งสิ้น',
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? (+text).toLocaleString() : "-"
            },
            {
                title: () => GetIntlMessages("สถานะการชำระเงิน"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                use: true,
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

                        default:
                            return (
                                <span> - </span>
                            )
                    }
                },
            },
            {
                title: () => GetIntlMessages("วันที่ชำระ"),
                dataIndex: 'payment_paid_date',
                key: 'payment_paid_date',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
        ]
        setColumns(_column.filter(x => x.use === true))
    }


    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })



    useEffect(async () => {
        // console.log("authUser", authUser)
        if (shopInCorporate.length === 0) {
            shopInCorporate.push(authUser.UsersProfile.ShopsProfile)
        }
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            doc_date: modelSearch.doc_date,
            debt_due_date: modelSearch.debt_due_date,
            select_shop_ids: modelSearch.select_shop_ids,
            payment_paid_status: modelSearch.payment_paid_status
        })
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, doc_date = modelSearch.doc_date, debt_due_date = modelSearch.debt_due_date, select_shop_ids = modelSearch.select_shop_ids ?? [], payment_paid_status = modelSearch.payment_paid_status ?? [] }) => {
        try {
            if (page === 1) setLoading(true)

            const dateFomat = "YYYY-MM-DD"
            let doc_date_startDate = ""
            let doc_date_endDate = ""
            if (isArray(doc_date) && doc_date.length > 0) {
                doc_date_startDate = moment(doc_date[0]?._d).format(dateFomat)
                doc_date_endDate = moment(doc_date[1]?._d).format(dateFomat)
            } else {
                doc_date_startDate = ""
                doc_date_endDate = ""
            }

            let debt_due_date_startDate = ""
            let debt_due_date_endDate = ""
            if (isArray(debt_due_date) && debt_due_date.length > 0) {
                debt_due_date_startDate = moment(debt_due_date[0]?._d).format(dateFomat)
                debt_due_date_endDate = moment(debt_due_date[1]?._d).format(dateFomat)
            } else {
                debt_due_date_startDate = ""
                debt_due_date_endDate = ""
            }

            if (payment_paid_status.length === 0) {
                setModelSearch({ payment_paid_status: "1" })
                payment_paid_status = "1"
            }

            if (select_shop_ids.length === 0) {
                setModelSearch({ select_shop_ids: authUser.UsersProfile.ShopsProfile.id, })
                select_shop_ids = authUser.UsersProfile.ShopsProfile.id
            }

            if (select_shop_ids.toString().includes("all")) {
                select_shop_ids = "all"
            }
            if (shopInCorporate.length === 1) {
                select_shop_ids = ""
            }

            setModelSearch({
                search: search,
                status: _status,
                page: page,
                doc_date: doc_date,
                debt_due_date: debt_due_date,
                select_shop_ids: select_shop_ids,
                payment_paid_status: payment_paid_status
            })


            let url = `/shopReports/partnerDebtDoc?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}${doc_date_startDate !== "" ? `&start_date=${doc_date_startDate}` : ""}${doc_date_endDate !== "" ? `&end_date=${doc_date_endDate}` : ""}${debt_due_date_startDate !== "" ? `&payment_paid_date__startDate=${debt_due_date_startDate}` : ""}${debt_due_date_endDate !== "" ? `&payment_paid_date__endDate=${debt_due_date_endDate}` : ""}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${payment_paid_status !== "" ? `&payment_paid_status=${payment_paid_status}` : ""}${_status !== "" ? `&status=${_status}` : ""}`
            const res = await API.get(url)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;


                setColumnsTable(data, page, limit)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่!!!")
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
            // const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
            // if (data.status != "success") {
            //     message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            // } else {
            //     message.success("บันทึกข้อมูลสำเร็จ");
            //     getDataSearch({
            //         page: configTable.page,
            //         search: modelSearch.search,
            //     })
            // }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */

    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(``)
                if (data.status == "success") {
                }
            } else {
                setIsModalVisible(true)
            }
        } catch (error) {
            console.log(`error`, error)
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }


    const [filterShops, setFilterShops] = useState([])

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        try {

            getDataSearch({
                search: value.search,
                _status: value.status,
                page: init.configTable.page,
                doc_date: value.doc_date,
                debt_due_date: value.debt_due_date,
                select_shop_ids: value.select_shop_ids,
                payment_paid_status: value.payment_paid_status
            })
        } catch (error) {

        }

    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            doc_date: init.modelSearch.doc_date,
            debt_due_date: init.modelSearch.debt_due_date,
            select_shop_ids: init.modelSearch.select_shop_ids,
            payment_paid_status: init.modelSearch.payment_paid_status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // const exportExcel = async () => {
    //     setLoading(true)
    //     const res = await API.get(`/partnerDebtDoc/all?export_format=xlsx&start_date=${startDate}&end_date=${endDate}`)
    //     if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
    //     else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
    //     setLoading(false)
    // }

    const [loadingExport, setLoadingExport] = useState(false)

    const exportExcel = async () => {
        onFinishSearch()
        // console.log("aaa", modelSearch)
        try {

            setLoadingExport(true)
            const { search, doc_date, debt_due_date, select_shop_ids, payment_paid_status, _status } = modelSearch


            const dateFomat = "YYYY-MM-DD"
            let doc_date_startDate = ""
            let doc_date_endDate = ""
            if (isArray(doc_date) && doc_date.length > 0) {
                doc_date_startDate = moment(doc_date[0]?._d).format(dateFomat)
                doc_date_endDate = moment(doc_date[1]?._d).format(dateFomat)
            } else {
                doc_date_startDate = ""
                doc_date_endDate = ""
            }

            let debt_due_date_startDate = ""
            let debt_due_date_endDate = ""
            if (isArray(debt_due_date) && debt_due_date.length > 0) {
                debt_due_date_startDate = moment(debt_due_date[0]?._d).format(dateFomat)
                debt_due_date_endDate = moment(debt_due_date[1]?._d).format(dateFomat)
            } else {
                debt_due_date_startDate = ""
                debt_due_date_endDate = ""
            }

            const res = await API.get(`/shopReports/partnerDebtDoc?limit=999999&page=1&search=${search}${doc_date_startDate !== "" ? `&start_date=${doc_date_startDate}` : ""}${doc_date_endDate !== "" ? `&end_date=${doc_date_endDate}` : ""}${debt_due_date_startDate !== "" ? `&payment_paid_date__startDate=${debt_due_date_startDate}` : ""}${debt_due_date_endDate !== "" ? `&payment_paid_date__endDate=${debt_due_date_endDate}` : ""}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${payment_paid_status !== "" ? `&payment_paid_status=${payment_paid_status}` : ""}${_status !== "" ? `&status=${_status}` : ""}&export_format=xlsx`)
            // &sort=${configSort.sort}
            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            setLoadingExport(false)
        }
    }

    /* end export excel */


    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/CSP_Template_ข้อมูลการขายเก่า.xlsx', '_blank');
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
                type: "RangePicker",
                name: "doc_date",
                label: GetIntlMessages("document-date"),
                allowClear: true
            },
            {
                index: 1,
                type: "RangePicker",
                name: "debt_due_date",
                label: GetIntlMessages("วันที่ชำระ"),
                allowClear: true
            },
            {
                index: 1,
                type: "select",
                name: "payment_paid_status",
                label: GetIntlMessages("select-paid-status"),
                placeholder: GetIntlMessages("select-paid-status"),
                showSearch: true,
                allowClear: true,
                mode: "multiple",
                list: paymentStatus.length > 0 ? [
                    {
                        key: `ทั้งหมด`,
                        value: "0,1,2,3,4,5"
                    },
                    ...paymentStatus

                ] : [],
            },
            {
                index: 1,
                type: "select",
                name: "select_shop_ids",
                label: "เลือกสาขา",
                placeholder: "เลือกสาขา",
                allowClear: true,
                showSearch: true,
                mode: "multiple",
                use: shopInCorporate.length > 1,
                list: [
                    {
                        key: `ทุกสาขา`,
                        value: "all"
                    },
                    ...isArray(shopInCorporate) && shopInCorporate?.length > 0 ? shopInCorporate.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)?.map(e => ({
                        key: e?.shop_name?.shop_local_name === undefined || e?.shop_name?.shop_local_name === null || e?.shop_name?.shop_local_name === "" ? e?.shop_name?.[`${locale.locale}`] : e?.shop_name?.shop_local_name,
                        value: e?.id
                    })) : []],
            },
            {
                index: 1,
                type: "select",
                name: "status",
                label: GetIntlMessages("สถานะเอกสาร"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    // {
                    //     key: GetIntlMessages("all-status"),
                    //     value: "1",
                    // },
                    {
                        key: GetIntlMessages("ใช้งานเอกสาร"),
                        value: "1",
                    },
                    {
                        key: GetIntlMessages("ยกเลิกเอกสาร"),
                        value: "2",
                    },
                ],
            },

        ],
        col: 8,
        button: {
            create: false,
            download: false,
            import: false,
            export: true,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        exportExcel,
        downloadTemplate,
    }


    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal('add')} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

            <style jsx global>
                {`
                    .detail-before-table {
                        margin-bottom: 10px;
                    }
                    .ant-tabs-tab {
                        margin: 0 64px 0 0;
                    }
                    .ant-tabs-tab + .ant-tabs-tab {
                        margin: 0 64px 0 0;
                    }
                    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: ${mainColor};
                        font-weight: 500;
                    }
                    .ant-tabs-tab:hover {
                        color: ${mainColor};
                    }
                    .ant-tabs-ink-bar {
                        background: ${mainColor};
                    }
                    .modal-full-screen .ant-form-item {
                        margin-bottom: 5px;
                    }
                    .ant-form legend {
                        padding: inherit;
                        font-size: x-large;
                        border-bottom: 0px solid #d9d9d9;
                    }
                `}
            </style>
        </>
    )
}

export default ReportShopPartnerDebt
