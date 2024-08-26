import { useEffect, useState } from 'react'
import { message, Tabs } from 'antd';
import { ConsoleSqlOutlined, ExportOutlined } from "@ant-design/icons";
import API from '../../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import { RoundingNumber, NoRoundingNumber } from '../../../components/shares/ConvertToCurrency'
import GetIntlMessages from '../../../util/GetIntlMessages';

import moment from 'moment'
import _, { get, isArray, isFunction, isPlainObject, isUndefined } from 'lodash';

const { TabPane } = Tabs;
const ReportInventory = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { shopInCorporate } = useSelector(({ master }) => master);

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
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "",
            documentdate: [moment(Date.now()), moment(Date.now())],
            businessPartner: [],
            select_shop_ids: authUser.UsersProfile.ShopsProfile.id,
        },
    }
  
    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const setColumnsTable = (data) => {
        const _column = [
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: "num",
                key: "num",
                align: "center",
                width: 100,
                render: (text, record, index) => {
                    index += (configTable.page - 1) * configTable.limit;
                    return index + 1;
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
                title: () => GetIntlMessages("เลขที่เอกสาร"),
                dataIndex: "code_id",
                key: "code_id",
                width: 150,
                align: "center",
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: "doc_date",
                key: "doc_date",
                width: 200,
                align: "center",
                render: (text, record) =>
                    text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("เลขที่เอกสารอ้างอิง"),
                dataIndex: "ref_doc",
                key: "ref_doc",
                width: 150,
                align: "center",
            },
            {
                title: () => GetIntlMessages("ชื่อผู้จำหน่าย"),
                dataIndex: "partner_name",
                key: "partner_name",
                width: 150,
                align: "center",
            },
            {
                title: () => GetIntlMessages("รหัสสินค้า"),
                dataIndex: "master_path_code_id",
                key: "master_path_code_id",
                width: 150,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "start" }}>
                        {get(
                            record,
                            `master_path_code_id`,
                            <div style={{ textAlign: "center" }}>{"-"}</div>
                        )}
                    </div>
                ),
            },
            {
                title: () => GetIntlMessages("ชื่อสินค้า"),
                dataIndex: "product_name",
                key: "product_name",
                width: 250,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "start" }}>
                        {get(
                            record,
                            `product_name`,
                            <div style={{ textAlign: "center" }}>{"-"}</div>
                        )}
                    </div>
                ),
            },
            {
                title: () => GetIntlMessages("จำนวน"),
                dataIndex: "amount",
                key: "amount",
                width: 100,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "end" }}>
                        {(+get(
                            record,
                            `amount`,
                            <div style={{ textAlign: "center" }}>{"-"}</div>
                        )).toLocaleString()}
                    </div>
                ),
            },
            {
                title: () => GetIntlMessages("ประเภทภาษี"),
                dataIndex: "tax_type_name",
                key: "tax_type_name",
                width: 150,
                align: "center",
            },
            {
                title: () => GetIntlMessages("ส่วนลดบาท"),
                dataIndex: "price_discount_total",
                key: "price_discount_total",
                width: 100,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "end" }}>
                        {(+get(
                            record,
                            `price_discount_total`,
                            <div style={{ textAlign: "center" }}>{"-"}</div>
                        )).toLocaleString()}
                    </div>
                ),
            },
            {
                title: () => GetIntlMessages("ราคาต่อหน่วย"),
                dataIndex: "price_unit",
                key: "price_unit",
                width: 100,
                align: "center",
                render: (text, record) => (
                    <div style={{ textAlign: "end" }}>
                        {(+get(
                            record,
                            `price_unit`,
                            <div style={{ textAlign: "center" }}>{"-"}</div>
                        )).toLocaleString()}
                    </div>
                ),
            },
            {
                title: () => GetIntlMessages("รวมเป็นเงิน"),
                dataIndex: "price_grand_total",
                key: "price_grand_total",
                width: 150,
                render: (text, record) => (
                    <div style={{ textAlign: "end" }}>
                        {(+get(record, `price_grand_total`, "-")).toLocaleString()}
                    </div>
                ),
            },
        ]
        _column.map((x) => { x.use === undefined ? x.use = true : null })
        setColumns(_column.filter(x => x.use === true));
    }

    const [businessPartnerList, setBusinessPartnerList] = useState([])

    useEffect(async () => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            select_shop_ids: modelSearch.select_shop_ids,
        })
        const partnerList = await getBusinessPartner()
        const newData = partnerList.map(e => {
            return {
                key: e.partner_name[locale.locale],
                value: e.id,
            }
        })
        setBusinessPartnerList(() => newData)
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, documentdate = modelSearch.documentdate, businessPartner = modelSearch.businessPartner ?? [], select_shop_ids = modelSearch.select_shop_ids ?? [authUser.UsersProfile.ShopsProfile.id], }) => {
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
            setStartDate(start_date)
            setEndDate(end_date)
        
            // filter_shop_business_partner_ids
            let url = `/shopReports/inventory/v2?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&doc_date_startDate=${start_date}&doc_date_endDate=${end_date}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}`
            if (businessPartner.length > 0) url += `&arrStrFilter__shop_business_partner_id=${businessPartner.map(e => e).join(",")}`

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
            const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */

    const addEditViewModal = async (mode, id) => {
        try {
            // setConfigModal({ ...configModal, mode })
            // if (id) {
            //     const { data } = await API.get(``)
            //     if (data.status == "success") {
            //     }
            // } else {
            // setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        try {
            value.select_shop_ids = isUndefined(value.select_shop_ids) ? modelSearch.select_shop_ids : value.select_shop_ids
            setModelSearch(() => value)
            getDataSearch({
                search: value.search,
                _status: value.status,
                page: init.configTable.page,
                documentdate: value.documentdate,
                businessPartner: value.businessPartner,
                select_shop_ids: value.select_shop_ids,
            })
        } catch (error) {
            console.log("error", error)
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
            documentdate: init.modelSearch.documentdate,
            businessPartner: init.modelSearch.businessPartner,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
            select_shop_ids: init.modelSearch.select_shop_ids,
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const exportExcel = async () => {
        let select_shop_ids = modelSearch.select_shop_ids ?? authUser.UsersProfile.ShopsProfile.id
        setLoading(true)
        const res = await API.get(`/shopReports/inventory/v2?export_format=xlsx&doc_date_startDate=${startDate}&doc_date_endDate=${endDate}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}`)
        if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
        else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
        setLoading(false)
    }

    /* end export excel */

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
                name: "businessPartner",
                label: GetIntlMessages("ค้นหาผู้จำหน่าย"),
                placeholder: GetIntlMessages("ค้นหาผู้จำหน่าย"),
                mode: "multiple",
                list: businessPartnerList,
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
                type: "RangePicker",
                name: "documentdate",
                label: GetIntlMessages("document-date"),
                allowClear: true
            }
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
    }

    const getBusinessPartner = async () => {
        try {
            const { data } = await API.get(`/shopBusinessPartners/all?limit=999999&page=1&sort=partner_name.th&order=desc&status=active`)
            return data.status === "success" ? data.data.data : []
        } catch (error) {

        }
    }


    return (
        <>
            <SearchInput configSearch={configSearch} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
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

export default ReportInventory
