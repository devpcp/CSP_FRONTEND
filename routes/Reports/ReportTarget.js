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
            sort: `created_date`,
            // sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "",
            documentdate: [],
            bus_customer_id: "",
            filter_year: "",
            filter_month: "",
            product_brand_id: "",
            product_model_id: "",
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
                title: 'ชื่อเป้า',
                dataIndex: 'document_code_id',
                key: 'document_code_id',
                width: 150,
                align: "center",
            },
            {
                title: 'ยี่ห้อ',
                dataIndex: 'document_date',
                key: 'document_date',
                width: 150,
                align: "center",
            },
            {
                title: 'รุ่น',
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 150,
                align: "center",
            },
            {
                title: 'ปี',
                dataIndex: 'customer_vehicle_reg_plate',
                key: 'customer_vehicle_reg_plate',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า มกราคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย มกราคม',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กุมภาพันธ์',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กุมภาพันธ์',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า มีนาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย มีนาคม',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า เมษายน',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย เมษายน',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า พฤษภาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย พฤษภาคม',
                dataIndex: 'product_code',
                key: 'product_code',
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
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กรกฎาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กรกฎาคม',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า สิงหาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย สิงหาคม',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า กันยายน',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย กันยายน',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า ตุลาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย ตุลาคม',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า พฤศจิกายน',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย พฤศจิกายน',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'เป้า ธันวาคม',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'ยอดขาย ธันวาคม',
                dataIndex: 'product_code',
                key: 'product_code',
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
            let url = `/shopLegacySalesOut/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}${filter_year !== "" ? `&filter_year=${filter_year}` : ""}${filter_month !== "" ? `&filter_month=${filter_month}` : ""}${bus_customer_id !== "" ? `&bus_customer_id=${bus_customer_id}` : ""}${product_brand_id !== "" ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id !== "" ? `&product_model_id=${product_model_id}` : ""}`
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
                    if (productBrandLists?.length === 1) product_brand_id = productBrandLists?.[0]?.id ?? null
                    if (productModelLists?.length === 1) product_model_id = productModelLists?.[0]?.id ?? null

                    setFilterProductBrands(() => productBrandLists)
                    setFilterProductModelTypes(() => productModelLists)
                } else {
                    onReset()
                    Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
                }
            }
            getDataSearch(
                {
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
            )
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
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // const exportExcel = async () => {
    //     setLoading(true)
    //     const res = await API.get(`/shopLegacySalesOut/all?export_format=xlsx&start_date=${startDate}&end_date=${endDate}`)
    //     if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
    //     else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
    //     setLoading(false)
    // }

    const [loadingExport, setLoadingExport] = useState(false)

    const exportExcel = async () => {

        try {
            setLoadingExport(true)
            const { search } = modelSearch
            const res = await API.get(`/shopLegacySalesOut/all?search=${search}${!!startDate ? `&start_date=${moment(startDate).format("YYYY-MM-DD")}` : ""}${!!endDate ? `&end_date=${moment(endDate).format("YYYY-MM-DD")}` : ""}&order=${configSort.order === "descend" ? "desc" : "asc"}&export_format=xlsx`)
            // &sort=${configSort.sort}
            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}${res.data.data.filePath}`)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            setLoadingExport(false)
        }
    }

    const onFinishExportFailed = async () => {
        setLoadingExport(false)
        message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
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

    const handleImportOk = async () => {
        try {
            if (fileImport) {
                setLoading(true)
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                // const userAuth = cookies.get("userAuth");
                // console.log(authUser)
                // const token = authUser.access_token
                // const token = cookies.get("access_token");
                // console.log("token",token)
                const { data } = await axios({
                    method: "post",
                    url: `${process.env.NEXT_PUBLIC_SERVICE}/shopLegacySalesOut/addByFile`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "success") {
                    message.success("บันทึกสำเร็จ")
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        _status: modelSearch.status,
                    })
                    setLoading(false)
                } else {
                    setLoading(true)
                    message.error('มีบางอย่างผิดพลาด !!');
                    setUrlImportErrorFile(process.env.NEXT_PUBLIC_DIRECTORY + data.data.filePath)
                    setLoading(false)
                }

            } else {
                message.warning("กรุณาเลือกไฟล์")
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const handleImportCancel = () => {
        setIsModalImportVisible(false)
        setFileImportList([])
        setFileImport(null)
    }

    const handleImportChange = (info) => {
        setUrlImportErrorFile("")
        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        // console.log(`file`, file)
                    }
                    return file;
                });
            }
        }

        // console.log('fileList :>> ', fileList);
        setFileImportList(fileList);
        if (fileList.length > 0) setFileImport(fileList[0]);
        else {
            setFileImport(null);
            // setFileType(null);
        }
    };

    /* end export excel */

    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/CSP_Template_ข้อมูลการขายเก่า.xlsx', '_blank');
    }

    /* Download File Error */
    const downloadFileError = () => {
        window.open(urlImportErrorFile, '_blank');
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
            {
                index: 1,
                type: "select",
                name: "filter_month",
                mode: "multiple",
                label: GetIntlMessages("เดือน"),
                allowClear: true,
                placeholder: "เลือกเดือน",
                list: [
                    { value: "1", key: "มกราคม" },
                    { value: "2", key: "กุมภาพันธ์" },
                    { value: "3", key: "มีนาคม" },
                    { value: "4", key: "เมษายน" },
                    { value: "5", key: "พฤษภาคม" },
                    { value: "6", key: "มิถุนายน" },
                    { value: "7", key: "กรกฎาคม" },
                    { value: "8", key: "สิงหาคม" },
                    { value: "9", key: "กันยายน" },
                    { value: "10", key: "ตุลาคม" },
                    { value: "11", key: "พฤศจิกายน" },
                    { value: "12", key: "ธันวาคม" },
                ],
            },
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
                    value: ""
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
                    value: ""
                }],
            },
        ],
        col: 8,
        button: {
            create: false,
            download: true,
            import: true,
            export: true,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        exportExcel,
        importExcel,
        downloadTemplate,
    }

    // const getBusinessPartner = async () => {
    //     try {
    //         const { data } = await API.get(`/shopBusinessPartners/all?limit=999999&page=1&sort=partner_name.th&order=desc&status=active`)
    //         return data.status === "success" ? data.data.data : []
    //     } catch (error) {

    //     }
    // }

    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            const _model = {
                customer_name: value.customer_name ?? null,
                customer_tel_no: value.customer_tel_no ?? null,
                customer_vehicle_reg_plate: value.customer_vehicle_reg_plate ?? null,
                document_code_id: value.document_code_id ?? null,
                document_date: moment(value.document_date).format("YYYY-MM-DD") ?? null,
                price_grand_total: value.price_grand_total ?? null,
                product_amount: value.product_amount ?? null,
                product_code: value.product_code ?? null,
                product_name: value.product_name ?? null
            }
            let res
            if (configModal.mode === "add") {
                // _model.master_customer_code_id = ""
                res = await API.post(`/shopLegacySalesOut/add`, _model)
            } else if (configModal.mode === "edit") {
                // _model.status = checkedIsuse ? "active" : "block"
                // res = await API.put(`/shopLegacySalesOut/put/${idEdit}`, _model)
            }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(false)
                form.resetFields()
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }



    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal('add')} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

            <Modal
                width={850}
                maskClosable={false}
                title={`นำเข้าข้อมูล`}
                visible={isModalImportVisible} onOk={handleImportOk} onCancel={handleImportCancel}
                okButtonProps={{ loading: loading }}
                bodyStyle={{
                    maxHeight: "80vh",
                    overflowX: "auto",
                }}
            >
                <Row style={{ textAlign: "center" }}>
                    {/* <Col md={12} xs={24}>
                        <div style={{ padding: "0 0 8px 0" }}>ดาวน์โหลด Template</div>

                        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download</Button>
                    </Col> */}
                    <Col xs={24}>
                        <div style={{ padding: "0 0 8px 0" }}>เลือกไฟล์</div>
                        <Upload
                            onChange={handleImportChange}
                            customRequest={dummyRequest}
                            fileList={fileImportList}
                            multiple={false}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        >
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                        <div
                            hidden={urlImportErrorFile === ""}
                            style={{
                                padding: "16px 0px",
                                margin: "16px 0 0 0",
                                color: "red",
                                border: "1px solid red",
                                borderRadius: "10px"
                            }}>
                            <div style={{ padding: "0 0 8px 0" }} hidden={urlImportErrorFile === ""}>
                                เกิดข้อผิดพลาด ดาวน์โหลดไฟล์เพื่อตรวจสอบ
                            </div>
                            <Button hidden={urlImportErrorFile === ""} icon={<DownloadOutlined />} onClick={downloadFileError}>Download</Button>
                        </div>
                    </Col>
                    <Col md={12} xs={24}>

                    </Col>
                </Row>
            </Modal >
            <Modal
                width={850}
                maskClosable={false}
                // style={{ top: 0 }}
                title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}การนัดหมาย`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                okButtonProps={{ disabled: configModal.mode == "view" }}
                bodyStyle={{
                    maxHeight: "80vh",
                    overflowX: "auto",
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 20 }}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete='off'
                >
                    <Row>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="document_code_id"
                                label={GetIntlMessages(`เลขที่เอกสาร`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="document_date"
                                label={GetIntlMessages(`เลขที่เอกสาร`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_name"
                                label={GetIntlMessages(`ชื่อลูกค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_vehicle_reg_plate"
                                label={GetIntlMessages(`ทะเบียนรถ`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="ตัวอย่าง ทส-5123 กรุงเทพมหานคร" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_tel_no"
                                label={GetIntlMessages(`เบอร์มือถือ`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                    {
                                        min: 10,
                                        message: GetIntlMessages("กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 10 ตัว"),
                                    },
                                    {
                                        pattern: new RegExp("^[0-9]*$"),
                                        message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                    }
                                ]}
                            >
                                <Input type={'text'} maxLength={10} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_code"
                                label={GetIntlMessages(`รหัสสินค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_name"
                                label={GetIntlMessages(`ชื่อสินค้า`)}

                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_amount"
                                label={GetIntlMessages(`จำนวนสินค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                    {
                                        pattern: new RegExp("^[0-9]*$"),
                                        message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                    }
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="price_grand_total"
                                label={GetIntlMessages(`ยอดเงิน (รวม VAT)`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

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
