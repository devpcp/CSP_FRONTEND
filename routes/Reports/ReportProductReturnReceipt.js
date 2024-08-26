import { useEffect, useState } from 'react'
import { message, Tabs } from 'antd';
import { ExportOutlined } from "@ant-design/icons";
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { RoundingNumber, NoRoundingNumber } from '../../components/shares/ConvertToCurrency'
import GetIntlMessages from '../../util/GetIntlMessages';

import moment from 'moment'
import _, { get, isArray, isFunction, isPlainObject } from 'lodash';

const { TabPane } = Tabs;
const ReportProductReturnReceipt = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);

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
            sort: `วันที่สร้างเอกสาร`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "",
            documentdate: [],
            businessPartner: [],
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const setColumnsTable = (data, page, limit) => {
        try {
            const _column = [
                {
                    title: () => GetIntlMessages("ลำดับ"),
                    dataIndex: '',
                    key: '',
                    align: "center",
                    width: 100,
                    render: (text, record, index) => {
                        index += ((page - 1) * limit)
                        return index + 1
                    },
                },
            ]

            const getKeys = Object.entries(data[0])
            getKeys.map(e => {
                _column.push({
                    title: () => e[0],
                    dataIndex: e[0],
                    key: e[0],
                    width: e[0] === "สินค้า" ? 400 : 200,
                    align: "center",
                    render: (text, record) => alignData(text, e[0])
                })
            })
            setColumns(_column)
        } catch (error) {
            // console.log('error :>> ', error);
        }

        function alignData(value, type) {
            let align = "center"
            switch (type) {
                case "สินค้า":
                    align = "start"
                    break;
                case "ส่วนลด":
                    align = "end"
                    value = RoundingNumber(value)
                    break;
                case "ราคาต่อชิ้น":
                    align = "end"
                    value = RoundingNumber(value)
                    break;
                case "ราคาสุทธิ":
                    align = "end"
                    value = RoundingNumber(value)
                    break;
                case "วันที่สร้างเอกสาร":
                    value = moment(value).format("YYYY/MM/DD")
                    break;

                default:
                    break;
            }
            return (
                <div style={{ textAlign: align }} >{value ?? "-"}</div>
            )

        }

    }

    // const [configModal, setConfigModal] = useState({
    //     mode: "add",
    //     modeKey: null,
    //     maxHeight: 600,
    //     overflowX: "auto",
    // })

    const [businessPartnerList, setBusinessPartnerList] = useState([])

    useEffect(async () => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
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
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, documentdate = modelSearch.documentdate ,businessPartner = modelSearch.businessPartner ?? [] }) => {
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
            let url = `/shopReports/inventory?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&start_date=${start_date}&end_date=${end_date}&doc_type_id=c0a7ac25-24db-44fd-ac78-8b6a3edcbcad`
            if(businessPartner.length > 0) url += `&filter_shop_business_partner_ids=${businessPartner.map(e=>e).join(",")}`
            const res = await API.get(url)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // data.forEach(e => {
                //     e.___update = false;
                //     if (e.purchase_status == true) {
                //         e.___delete = false;
                //     }
                // });

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
            setModelSearch(()=>value)
            getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page, documentdate: value.documentdate ,businessPartner : value.businessPartner })
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
            documentdate: init.modelSearch.documentdate,
            businessPartner : init.modelSearch.businessPartner,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    const exportExcel = async () => {
        setLoading(true)
        const res = await API.get(`/shopReports/inventory?export_format=xlsx&start_date=${startDate}&end_date=${endDate}&doc_type_id=c0a7ac25-24db-44fd-ac78-8b6a3edcbcad`)
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
            // {
            //     index: 1,
            //     type: "select",
            //     name: "status",
            //     label: GetIntlMessages("select-status"),
            //     placeholder: GetIntlMessages("select-status"),
            //     list: [
            //         {
            //             key: GetIntlMessages("all-status"),
            //             value: "",
            //         },
            //         {
            //             key: GetIntlMessages("ชำระเงินแล้ว"),
            //             value: true,
            //         },
            //         {
            //             key: GetIntlMessages("ยังไม่ได้ชำระเงิน"),
            //             value: false,
            //         },
            //     ],
            // }, 
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

export default ReportProductReturnReceipt
