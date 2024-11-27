import { useEffect, useState } from 'react'
import { message, Tabs, Modal, Button, Form, Upload, DatePicker, Input, Col, Row, Radio } from 'antd';
import { ExportOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import API from '../../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import { RoundingNumber, NoRoundingNumber } from '../../../components/shares/ConvertToCurrency'
import GetIntlMessages from '../../../util/GetIntlMessages';
import moment from 'moment'
import _, { get, isArray, isEmpty, isFunction, isObject, isPlainObject } from 'lodash';
import axios from 'axios';
import { Label } from 'recharts';
const { TabPane } = Tabs;
const ReportPurchaseTax = () => {
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
            sort: `doc_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "default",
            doc_date: [],
            select_shop_ids: authUser.UsersProfile.ShopsProfile.id,
            filter_zero: true,
            tax_period: null
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
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: 'สาขา',
                dataIndex: 'shop_id',
                key: 'shop_id',
                width: 150,
                align: "center",
                use: shopInCorporate.length > 1,
                render: (text, render) => {
                    return shopInCorporate.length > 0 ?
                        shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === undefined ||
                            shopInCorporate.find(x => x.id === text).shop_name?.hop_local_name === null ||
                            shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === "" ? shopInCorporate.find(x => x.id === text).shop_name[locale.locale] : shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name : ""
                }
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
            {
                title: 'เลขที่เอกสาร',
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                sorter: true,
            },
            {
                title: 'ชื่อผู้จำหน่าย',
                dataIndex: 'partner_name',
                key: 'partner_name',
                width: 150,
                align: "center",
                render: (text, record, index) => {
                    try {
                        if (record.ShopBusinessPartner !== null) {
                            return record.ShopBusinessPartner.partner_name
                        }
                    } catch (error) {
                        return ""
                    }
                },
            },
            {
                title: 'เลขประจำตัวผู้เสียภาษี',
                dataIndex: 'tax_id',
                key: 'tax_id',
                width: 150,
                align: "center",
                render: (text, record, index) => {
                    try {
                        if (record.ShopBusinessPartner !== null) {
                            return record.ShopBusinessPartner.tax_id
                        }
                    } catch (error) {
                        return ""
                    }
                },
            },
            {
                title: () => GetIntlMessages("มูลค่า"),
                dataIndex: 'price_before_vat',
                key: 'price_before_vat',
                width: 150,
                align: "center",
                render: (text, record) => {
                    if (text) {
                        if (record.status === 0 || record.code_id.search("PCN") !== -1) {
                            return <div style={{ textAlign: "end" }}>-{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        } else {
                            return <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        }
                    } else {
                        return "-"
                    }
                }
            },
            {
                title: () => GetIntlMessages("ภาษีมูลค่าเพิ่ม"),
                dataIndex: 'price_vat',
                key: 'price_vat',
                width: 150,
                align: "center",
                render: (text, record) => {
                    if (text) {
                        if (record.status === 0 || record.code_id.search("PCN") !== -1) {
                            return <div style={{ textAlign: "end" }}>-{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        } else {
                            return <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        }
                    } else {
                        return "-"
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
                    if (text) {
                        if (record.status === 0 || record.code_id.search("PCN") !== -1) {
                            return <div style={{ textAlign: "end" }}>-{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        } else {
                            return <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        }
                    } else {
                        return "-"
                    }
                }
            },
            {
                title: () => GetIntlMessages("สถาณะเอกสาร"),
                dataIndex: 'status',
                key: 'status',
                width: 150,
                align: "center",
                render: (text, record) => {
                    switch (text) {
                        case 1:
                            return <div style={{ color: 'green' }}>ใช้งานเอกสาร</div>
                        case 0:
                            return <div style={{ color: 'red' }} >ยกเลิกเอกสาร</div>
                        default:
                            return "-"
                    }
                },
                use: true
            },
        ]
        _column.map((x) => { x.use === undefined ? x.use = true : null })
        setColumns(_column.filter(x => x.use === true));
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
            doc_date: modelSearch.doc_date,
            select_shop_ids: modelSearch.select_shop_ids,
        })
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), doc_date = modelSearch.doc_date, select_shop_ids = modelSearch.select_shop_ids ?? [], filter_zero = modelSearch.filter_zero ?? false, tax_period = modelSearch.tax_period }) => {
        try {
            if (page === 1) setLoading(true)
            console.log("modelSearch", modelSearch)
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


            if (select_shop_ids.length === 0) {
                setModelSearch({ ...modelSearch, select_shop_ids: authUser.UsersProfile.ShopsProfile.id, })
                select_shop_ids = authUser.UsersProfile.ShopsProfile.id
            }

            if (select_shop_ids.toString().includes("all")) {
                select_shop_ids = "all"
            }
            if (shopInCorporate.length === 1) {
                select_shop_ids = ""
            }
            let paymentStatusValue = paymentStatus.map((e) => {
                return e.value;
            });
            console.log("tax_perioddd", tax_period)
            let new_tax_period = ""
            if (tax_period !== null) {
                new_tax_period = moment(tax_period).format("YYYY-MM")
            }

            let url = `/shopReports/salesTax?bolFilter_show_zero_vat=${filter_zero}&report_tax_type=purchase_tax&arrStrFilter__status=0,1,2,3,4&arrStrFilter__payment_paid_status=${paymentStatusValue}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}${doc_date_startDate !== "" ? `&doc_date_startDate=${doc_date_startDate}` : ""}${doc_date_endDate !== "" ? `&doc_date_endDate=${doc_date_endDate}` : ""}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${new_tax_period !== "" ? `&tax_period=${new_tax_period}` : ""}`
            const res = await API.get(url)
            if (res.data.status === "success") {
                const { totalCount, data } = res.data.data;

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

            const searchModel = {
                ...modelSearch,
                search: value.search,
                page: init.configTable.page,
                doc_date: value.doc_date,
                select_shop_ids: value.select_shop_ids,
                filter_zero: value.filter_zero,
                tax_period: value.tax_period
            };

            setModelSearch(searchModel);

            getDataSearch({
                search: value.search,
                page: init.configTable.page,
                doc_date: value.doc_date,
                select_shop_ids: value.select_shop_ids,
                filter_zero: value.filter_zero,
                tax_period: value.tax_period
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
            doc_date: init.modelSearch.doc_date,
            select_shop_ids: init.modelSearch.select_shop_ids,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
            filter_zero: init.modelSearch.filter_zero ?? true,
            tax_period: null
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const [loadingExport, setLoadingExport] = useState(false)

    const exportExcel = async () => {
        try {

            setLoadingExport(true)

            let search = modelSearch.search
            let select_shop_ids = modelSearch.select_shop_ids
            let filter_zero = modelSearch.filter_zero
            let tax_period = moment(modelSearch.tax_period).format("YYYY-MM")
            const dateFomat = "YYYY-MM-DD"
            let doc_date_startDate = ""
            let doc_date_endDate = ""
            if (isArray(modelSearch.doc_date) && modelSearch.doc_date.length > 0) {
                doc_date_startDate = moment(modelSearch.doc_date[0]?._d).format(dateFomat)
                doc_date_endDate = moment(modelSearch.doc_date[1]?._d).format(dateFomat)
            } else {
                doc_date_startDate = ""
                doc_date_endDate = ""
            }

            let paymentStatusValue = paymentStatus.map((e) => {
                return e.value;
            });

            const res = await API.get(`/shopReports/salesTax?bolFilter_show_zero_vat=${filter_zero}&report_tax_type=purchase_tax&sort=doc_date&arrStrFilter__payment_paid_status=${paymentStatusValue}&limit=999999&page=1&search=${search}${doc_date_startDate !== "" ? `&doc_date_startDate=${doc_date_startDate}` : ""}${doc_date_endDate !== "" ? `&doc_date_endDate=${doc_date_endDate}` : ""}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${tax_period !== "" || tax_period !== undefined || tax_period !== null ? `&tax_period=${tax_period}` : ""}&export_format=xlsx`)

            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            console.log("error", error)
            setLoadingExport(false)
        }
    }

    /* end export excel */


    /* Download Template */
    const downloadTemplate = () => {
        console.log("downloadTemplate",downloadTemplate)
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
            },
            {
                index: 1,
                type: "RangePicker",
                name: "doc_date",
                label: GetIntlMessages("document-date"),
                allowClear: true,
            },
            {
                index: 1,
                type: "select",
                name: "filter_zero",
                label: "แสดงรายการภาษี",
                placeholder: "เลือกสาขา",
                showSearch: true,
                list: [
                    {
                        key: `ไม่แสดงรายการที่ภาษีเท่ากับ 0`,
                        value: false
                    },
                    {
                        key: `แสดงรายการที่ภาษีเท่ากับ 0`,
                        value: true
                    },
                ]
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
                type: "monthyearpicker",
                name: "tax_period",
                label: GetIntlMessages("งวดภาษี"),
                allowClear: true,
                placeholder: "เลือกข้อมูล"
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

export default ReportPurchaseTax
