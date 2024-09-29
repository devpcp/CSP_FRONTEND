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
import _, { get, isArray, isFunction, isPlainObject, isEmpty } from 'lodash';
import axios from 'axios';
import { Label } from 'recharts';
const { TabPane } = Tabs;
const ReportTarget = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser, token } = useSelector(({ auth }) => auth);
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [filterProductBrands, setFilterProductBrands] = useState([])
    const [filterProductModelTypes, setFilterProductModelTypes] = useState([])
    const [oldBrandId, setOldBrandId] = useState(null)
    const [oldProductModel, setOldProductModelId] = useState(null)
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
            status: "",
            documentdate: [],
            bus_customer_id: "",
            filter_year: moment(Date.now()).format("YYYY"),
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
                title: 'ชื่อลูกค้า',
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 150,
                align: "center",
            },
            {
                title: 'ชื่อเป้า',
                dataIndex: 'name',
                key: 'name',
                width: 150,
                align: "center",
            },
            {
                title: 'ยี่ห้อ',
                dataIndex: 'brand_name',
                key: 'brand_name',
                width: 150,
                align: "center",
                render: (text, record, index) => {
                    return text ? text.toString() : ""
                },
            },
            {
                title: 'รุ่น',
                dataIndex: 'model_name',
                key: 'model_name',
                width: 150,
                align: "center",
                render: (text, record, index) => {
                    return text ? text.toString() : ""
                },
            },
            {
                title: 'ปี',
                dataIndex: 'year',
                key: 'year',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้าทั้งหมด',
                dataIndex: 'target_total',
                key: 'target_total',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขายทั้งหมด',
                dataIndex: 'sale_total',
                key: 'sale_total',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า มกราคม',
                dataIndex: 'target_1',
                key: 'target_1',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย มกราคม',
                dataIndex: 'sale_1',
                key: 'sale_1',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กุมภาพันธ์',
                dataIndex: 'target_2',
                key: 'target_2',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กุมภาพันธ์',
                dataIndex: 'sale_2',
                key: 'sale_2',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า มีนาคม',
                dataIndex: 'target_3',
                key: 'target_3',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย มีนาคม',
                dataIndex: 'sale_3',
                key: 'sale_3',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า เมษายน',
                dataIndex: 'target_4',
                key: 'target_4',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย เมษายน',
                dataIndex: 'sale_4',
                key: 'sale_4',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า พฤษภาคม',
                dataIndex: 'target_5',
                key: 'target_5',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย พฤษภาคม',
                dataIndex: 'sale_5',
                key: 'sale_5',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า มิถุนายน',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย มิถุนายน',
                dataIndex: 'sale_6',
                key: 'sale_6',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กรกฎาคม',
                dataIndex: 'target_7',
                key: 'target_7',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กรกฎาคม',
                dataIndex: 'sale_7',
                key: 'sale_7',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า สิงหาคม',
                dataIndex: 'target_8',
                key: 'target_8',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย สิงหาคม',
                dataIndex: 'sale_8',
                key: 'sale_8',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กันยายน',
                dataIndex: 'target_9',
                key: 'target_9',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กันยายน',
                dataIndex: 'sale_9',
                key: 'sale_9',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า ตุลาคม',
                dataIndex: 'target_10',
                key: 'target_10',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย ตุลาคม',
                dataIndex: 'sale_10',
                key: 'sale_10',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า พฤศจิกายน',
                dataIndex: 'target_11',
                key: 'target_11',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย พฤศจิกายน',
                dataIndex: 'sale_11',
                key: 'sale_11',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า ธันวาคม',
                dataIndex: 'target_12',
                key: 'target_12',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย ธันวาคม',
                dataIndex: 'sale_12',
                key: 'sale_12',
                width: 150,
                align: "center",
            },

        ]
        setColumns(_column)
    }


    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })



    useEffect(async () => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        const { data } = await API.get(`/shopProducts/filter/categories`)
        if (isPlainObject(data) && !isEmpty(data)) {
            const { productBrandLists, productModelLists } = data
            setFilterProductBrands(() => productBrandLists)
            setFilterProductModelTypes(() => productModelLists)
        } else {
            onReset()
            Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
        }
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, documentdate = modelSearch.documentdate, bus_customer_id = modelSearch.bus_customer_id ?? "", filter_month = modelSearch.filter_month ?? "", filter_year = modelSearch.filter_year ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "", }) => {
        try {
            if (page === 1) setLoading(true)
            const dateFomat = "YYYY-MM-DD"
            let start_date = ""
            let end_date = ""
            if (isArray(documentdate) && documentdate.length > 0) {
                start_date = moment(documentdate[0]?._d).format(dateFomat)
                end_date = moment(documentdate[1]?._d).format(dateFomat)
            } else {
                start_date = ""
                end_date = ""
            }
            setStartDate(() => start_date)
            setEndDate(() => end_date)
            // filter_shop_business_partner_ids
            let url = `shopReports/customerTarget?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}${filter_year !== "" ? `&year=${filter_year}` : ""}${filter_month !== "" && filter_month !== null ? `&month_arr=${filter_month}` : ""}${bus_customer_id !== "" ? `&bus_customer_id_arr=${bus_customer_id}` : ""}${product_brand_id !== null && product_brand_id !== "" ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id !== null && product_model_id !== "" ? `&product_model_id=${product_model_id}` : ""}`
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

    /** กดปุ่มค้นหา */
    const onFinishSearch = async (value) => {
        try {
            const { product_brand_id, product_model_id } = value
            setOldBrandId(() => product_brand_id)
            setOldProductModelId(() => product_model_id)

            if (product_brand_id !== oldBrandId || product_model_id !== oldProductModel) {
                const { data } = await API.get(`/shopProducts/filter/categories?${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
                if (isPlainObject(data) && !isEmpty(data)) {
                    const { productBrandLists, productModelLists } = data
                    // if (productBrandLists?.length === 1) product_brand_id = productBrandLists?.[0]?.id ?? null
                    // if (productModelLists?.length === 1) product_model_id = productModelLists?.[0]?.id ?? null

                    setFilterProductBrands(() => productBrandLists)
                    setFilterProductModelTypes(() => productModelLists)
                } else {
                    onReset()
                    Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
                }
            }
            let _model = {
                search: value.search,
                _status: value.status,
                page: init.configTable.page,
                documentdate: value.documentdate,
                bus_customer_id: value.bus_customer_id,
                filter_month: value.filter_month,
                filter_year: value.filter_year,
                product_brand_id: product_brand_id ?? null,
                product_model_id: product_model_id ?? null,
            }
            setModelSearch(_model)
            getDataSearch(_model)
        } catch (error) {
            console.log("error", error)
        }

    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = async () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        const { data } = await API.get(`/shopProducts/filter/categories`)
        if (isPlainObject(data) && !isEmpty(data)) {
            const { productBrandLists, productModelLists } = data
            setFilterProductBrands(() => productBrandLists)
            setFilterProductModelTypes(() => productModelLists)
        }
        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            documentdate: init.modelSearch.documentdate,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
            product_brand_id: null,
            product_model_id: null,
            filter_year: init.modelSearch.filter_year,
            filter_month: null,
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")


    const [loadingExport, setLoadingExport] = useState(false)

    const exportExcel = async () => {

        try {
            setLoadingExport(true)
            const { search, bus_customer_id, _status, filter_month, filter_year, product_model_id, product_brand_id } = modelSearch
            console.log("searc", modelSearch)
            let url = `/shopReports/customerTarget?export_format=xlsx${_status ? `&status=${_status}` : ""}${search ? `&search=${search}` : ""}${bus_customer_id ? `&bus_customer_id=${bus_customer_id}` : ""}${filter_month ? `&filter_month=${filter_month}` : ""}${filter_year ? `&filter_year=${filter_year}` : ""}${product_brand_id ?? "" !== "" ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ?? "" !== "" ? `&product_model_id=${product_model_id}` : ""}`;
            const res = await API.get(url)
            // &sort=${configSort.sort}
            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            setLoadingExport(false)
        }
    }

    /* end export excel */

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);
    const [importAdmin, setImportAdmin] = useState(false);
    const [urlImportErrorFile, setUrlImportErrorFile] = useState("");

    const importExcel = () => {
        setIsModalImportVisible(true)
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
                type: "select",
                name: "filter_year",
                label: GetIntlMessages("ปี"),
                allowClear: true,
                placeholder: "เลือกปี",
                list: [
                    { value: "2023", key: "2023" },
                    { value: "2024", key: "2024" },
                    { value: "2025", key: "2025" },
                ],
            },
            // {
            //     index: 1,
            //     type: "select",
            //     name: "filter_month",
            //     mode: "multiple",
            //     label: GetIntlMessages("เดือน"),
            //     allowClear: true,
            //     placeholder: "เลือกเดือน",
            //     list: [
            //         { value: "1", key: "มกราคม" },
            //         { value: "2", key: "กุมภาพันธ์" },
            //         { value: "3", key: "มีนาคม" },
            //         { value: "4", key: "เมษายน" },
            //         { value: "5", key: "พฤษภาคม" },
            //         { value: "6", key: "มิถุนายน" },
            //         { value: "7", key: "กรกฎาคม" },
            //         { value: "8", key: "สิงหาคม" },
            //         { value: "9", key: "กันยายน" },
            //         { value: "10", key: "ตุลาคม" },
            //         { value: "11", key: "พฤศจิกายน" },
            //         { value: "12", key: "ธันวาคม" },
            //     ],
            // },
            {
                index: 1,
                type: "select",
                name: "product_brand_id",
                label: "เลือกยี่ห้อสินค้า",
                placeholder: "เลือกยี่ห้อสินค้า",
                allowClear: true,
                showSearch: true,
                col_md: 4,
                list: isArray(filterProductBrands) && filterProductBrands?.length > 0 ? filterProductBrands.map(e => ({
                    key: e?.brand_name?.[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: null
                }],
            },
            {
                index: 1,
                type: "select",
                name: "product_model_id",
                label: "เลือกรุ่นสินค้า",
                placeholder: "เลือกรุ่นสินค้า",
                allowClear: true,
                showSearch: true,
                col_md: 4,
                list: isArray(filterProductModelTypes) && filterProductModelTypes?.length > 0 ? filterProductModelTypes.map(e => ({
                    key: e?.model_name?.[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: null
                }],
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
        importExcel,
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

export default ReportTarget
