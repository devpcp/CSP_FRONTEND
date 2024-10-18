import { cloneElement, useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, Modal, Form, Upload, DatePicker, TimePicker, Select, Divider, AutoComplete, Switch, Space } from 'antd';
import { ReloadOutlined, UploadOutlined, EditOutlined, PlusOutlined, MinusCircleOutlined, ExportOutlined, TableOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import _, { isArray, isFunction, get, isPlainObject, isEmpty } from 'lodash'
import TitlePage from '../shares/TitlePage';
import SearchInput from '../shares/SearchInput'
import TableList from '../shares/TableList'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../util/GetIntlMessages';
import { FormInputLanguage, FormSelectLanguage } from '../shares/FormLanguage';
import FormSelectDot from './Dot/Components.Select.Dot';
import FormProvinceDistrictSubdistrict from '../shares/FormProvinceDistrictSubdistrict';
import Fieldset from '../shares/Fieldset';
import ModalFullScreen from '../shares/ModalFullScreen';
import ImportDocAddEditViewModal from './ImportDocumentModal/ImportDocAddEditViewModal';
import ProductMovement from './Movement/ProductMovementV3.js';
import Swal from "sweetalert2";
import { useRouter } from "next/router";

const { Search } = Input;
const cookies = new Cookies();

const CustomersIndex = ({ status, pageId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    /* table */
    // const [search, setSearch] = useState("")
    // const [page, setPage] = useState(1)
    // const [total, setTotal] = useState(0)
    // const [limit, setLimit] = useState(10)
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { productBrand, productTypeGroup, productType, productModelType, shopInCorporate } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [maximunBalance, setMaximunBalance] = useState(0)
    const { search } = router.query
    // const [sortOrder, setSortOrder] = useState("ascend")

    useEffect(() => {
        initUseEffect()

        if (pageId == "e9962e86-207a-4dc2-a33d-f35d1e9ba759" && (permission_obj.id === "e9962e86-207a-4dc2-a33d-f35d1e9ba759" || permission_obj.id === "f057234a-22af-4cbe-9885-2cf267a908b6")) permission_obj.update = 0
        // console.log('permission_obj', permission_obj)
    }, [])

    useEffect(() => {
        const newModelSearch = {
            ...modelSearch,
            filter_balance: [modelSearch?.filter_balance[0], maximunBalance]
        }
        setModelSearch(prevValue => newModelSearch)
    }, [maximunBalance])


    const initUseEffect = async () => {

        try {
            setLoading(true)

            const promise1 = getAllShopStock();

            const values = await Promise.all([promise1])
            setMaximunBalance(prevValue => (!!values) && values.toString() !== "-Infinity" ? values ?? 0 : 0)
            const { data } = await API.get(`/shopProducts/filter/categories`)
            if (isPlainObject(data) && !isEmpty(data)) {
                const { productTypeLists, productBrandLists, productModelLists } = data
                setFilterProductTypes(() => productTypeLists)
                setFilterProductBrands(() => productBrandLists)
                setFilterProductModelTypes(() => productModelLists)
            }
            getMasterData()
            setLoading(false)
        } catch (error) {

        }

    }

    const formItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            //   sm: { span: 8 },
            md: {
                span: 2,
            },


        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            md: {
                span: 22,
            },


        },
    };

    const tailformItemLayout = {
        labelCol: {
            xs: {
                span: 24,
            },
            //   sm: { span: 8 },
            md: {
                span: 24,
            },
            lg: {
                span: 10
            },
            xl: {
                span: 10
            },
            xxl: {
                span: 8
            }

        },
        wrapperCol: {
            xs: {
                span: 24,
            },
            md: {
                span: 22,
            },
            lg: {
                span: 14
            },
            xl: {
                span: 14
            },
            xxl: {
                span: 16
            }


        },
    };

    const setColumnsTable = (data) => {


        let _column = [
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
                title: 'รหัส',
                dataIndex: 'Product',
                key: 'master_path_code_id',
                width: 150,
                align: "center",
                sorter: true,
                render: (text, record) => _.get(text, 'master_path_code_id', "-")
                // render: (text, record) => text ? text.master_path_code_id : "-",
            },
            {
                title: 'ชื่อสินค้า',
                dataIndex: 'Product',
                key: 'Product',
                width: 350,
                render: (text, record) => _.get(text, `product_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? text.product_name ? text.product_name[locale.locale] : "-" : "-",
            },
            {
                title: 'ยี่ห้อสินค้า',
                dataIndex: 'Product',
                key: 'Product',
                width: 140,
                render: (text, record) => _.get(text, `ProductBrand.brand_name[${locale.locale}]`, "-"),
            },
            {
                title: 'รุ่น',
                dataIndex: 'Product',
                key: 'Product',
                width: 140,
                render: (text, record) => _.get(text, `ProductModel.model_name[${locale.locale}]`, "-"),
            }
        ];
        let _columnInventory = {
            title: 'จำนวนสินค้าคงเหลือ ',
            align: "center",
            children: []
        }
        let product_cost_latest = 0, product_cost_average = 0

        data.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)

        for (let index = 0; index < data.length; index++) {
            const el = data[index];
            let title = el?.shop_name?.shop_local_name ?? el?.shop_name?.[locale.locale] ?? "-"
            _columnInventory.children.push({
                title: title,
                dataIndex: 'ShopProfiles',
                key: 'ShopProfiles',
                align: "center",
                width: title.length * 8 + 50,
                render: (text, record) => {
                    let balance = 0
                    let check = text.filter(el1 => { return el1.id == el.id })
                    if (check.length > 0 && check[0].ShopProduct?.ShopStocks.length > 0) {
                        // console.log("check[0]", check[0])
                        balance = check[0].ShopProduct?.ShopStocks[0].balance
                        product_cost_latest = check[0].ShopProduct?.ShopStocks[0].product_cost
                    }

                    return (
                        <>
                            <span>{balance ? Number(balance).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            })

        }
        _column.push(_columnInventory)

        _column.push({
            title: 'จำนวนรวมทุกสาขา',
            dataIndex: 'balance',
            key: 'balance',
            width: 140,
            align: "right",
            render: (text, record) => text,
            // render: (text, record) => _.isPlainObject(text) ? _.isPlainObject(text.ProductBrand) ? _.isPlainObject(text.ProductBrand.brand_name) ? text.ProductBrand.brand_name[locale.locale] : "-" : "-" : "-",

        },)

        let _columnCostAVG = {
            title: 'ราคาทุนเฉลี่ย/หน่วย ',
            align: "center",
            use: authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_warehouse_cost_show,
            children: []
        }

        for (let index = 0; index < data.length; index++) {
            const el = data[index];
            let title = el?.shop_name?.shop_local_name ?? el?.shop_name?.[locale.locale] ?? "-"
            _columnCostAVG.children.push({
                title: title,
                dataIndex: 'ShopProfiles',
                key: 'ShopProfiles',
                align: "center",
                width: title.length * 8 + 50,
                render: (text, record) => {
                    let balance = 0
                    let check = text.filter(el1 => { return el1.id == el.id })
                    if (check?.length > 0 && check?.[0]?.ShopProduct) {
                        // debugger
                        // console.log(check[0])
                        // balance = check[0].ShopProduct?.ShopStocks[0]?.product_cost_product_stocks[0]?.product_cost_average
                        balance = check[0].ShopProduct?.product_cost_average || '0.00';
                    }

                    return (
                        <>
                            <span>{balance ? Number(balance).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            })

        }
        _column.push(_columnCostAVG)

        let _columnCostLastest = {
            title: 'ราคาทุนล่าสุด/หน่วย ',
            align: "center",
            use: authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_warehouse_cost_show,
            children: []
        }

        for (let index = 0; index < data.length; index++) {
            const el = data[index];
            let title = el?.shop_name?.shop_local_name ?? el?.shop_name?.[locale.locale] ?? "-"
            _columnCostLastest.children.push({
                title: title,
                dataIndex: 'ShopProfiles',
                key: 'ShopProfiles',
                align: "center",
                width: title.length * 8 + 50,
                render: (text, record) => {
                    let balance = 0
                    let check = text.filter(el1 => { return el1.id == el.id })
                    if (check?.length > 0 && check?.[0]?.ShopProduct) {
                        // balance = check[0].ShopProduct?.ShopStocks[0]?.product_cost_product_stocks[0]?.product_cost_latest
                        balance = check[0]?.ShopProduct?.product_cost || '0';
                    }

                    return (
                        <>
                            <span>{balance ? Number(balance).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            })

        }
        _column.push(_columnCostLastest)

        let _columnSellingRetailPrice = {
            title: 'ราคาขายปลีก/หน่วย ',
            align: "center",
            children: []
        }

        for (let index = 0; index < data.length; index++) {
            const el = data[index];
            let title = el?.shop_name?.shop_local_name ?? el?.shop_name?.[locale.locale] ?? "-"
            _columnSellingRetailPrice.children.push({
                title: title,
                dataIndex: 'ShopProfiles',
                key: 'ShopProfiles',
                align: "center",
                width: title.length * 8 + 50,
                render: (text, record) => {
                    let balance = 0
                    let check = text.filter(el1 => { return el1.id == el.id })
                    if (check?.length > 0 && check?.[0]?.ShopProduct) {
                        // balance = check[0].ShopProduct?.price?.suggasted_re_sell_price?.retail
                        balance = check[0]?.ShopProduct?.product_price || '0.00';
                    }

                    return (
                        <>
                            <span>{balance ? Number(balance).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            })

        }
        _column.push(_columnSellingRetailPrice)

        let _columnSellingWholeSalePrice = {
            title: 'ราคาขายส่ง/หน่วย ',
            align: "center",
            children: []
        }

        for (let index = 0; index < data.length; index++) {
            const el = data[index];
            let title = el?.shop_name?.shop_local_name ?? el?.shop_name?.[locale.locale] ?? "-"
            _columnSellingWholeSalePrice.children.push({
                title: title,
                dataIndex: 'ShopProfiles',
                key: 'ShopProfiles',
                align: "center",
                width: title.length * 8 + 50,
                render: (text, record) => {
                    let balance = 0
                    let check = text.filter(el1 => { return el1.id == el.id })
                    if (check.length > 0 && check[0].ShopProduct?.ShopStocks.length > 0) {
                        balance = check[0].ShopProduct?.price?.suggasted_re_sell_price?.wholesale
                    }

                    return (
                        <>
                            <span>{balance ? Number(balance).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            })

        }
        _column.push(_columnSellingWholeSalePrice)

        _column.map((x) => { x.use === undefined ? x.use = true : null })
        setColumns(_column.filter(x => x.use === true));
    }



    /* ค่าเริ่มต้น */
    const reset = async () => {
        const _page = 1, _search = "";
        setPage(_page)
        setSearch(_search)
        await getDataSearch({ _page, _search })
    }


    /* แก้ไข จำนวนสินค้าคงเหลือ */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })
    const [isModalBalanceVisible, setIsModalBalanceVisible] = useState(false)
    const [formBalance] = Form.useForm();
    const [loadingBalance, setLoadingBalance] = useState(false)
    const [idBalance, setIdBalance] = useState(null)

    const editBalance = (item) => {
        // console.log(`item`, item.id)
        setIdBalance(item.id)
        formBalance.setFieldsValue({ balance: Number(item.balance) })
        setIsModalBalanceVisible(true)
    }



    const handleBalanceOk = () => {
        formBalance.submit()
    }

    const onFinishBalance = async (value) => {
        try {
            setLoadingUpload(true)
            const { data } = await API.put(`/webMax/EditStockUnit`, {
                id: idBalance,
                balance: Number(value.balance)
            })
            if (data.status == "failed") {
                message.error(data.data)
            } else {
                message.success("บันทึกสำเร็จ")
                setLoadingUpload(false)
                handleBalanceCancel()
                getDataSearch({ page: configTable.page, search: modelSearch.search, filter_balance: modelSearch.filter_balance })
            }
        } catch (error) {
            setLoadingUpload(false)
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const onFinishFailedBalance = (error) => {
        setLoadingUpload(false)
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const handleBalanceCancel = () => {
        if (!loadingUpload) {
            formBalance.resetFields()
            setIsModalBalanceVisible(false)
            setIdBalance(null)
        }
    }

    /* ค้นหา */
    // const getDataSearch = async ({ _search = "", _limit = limit, _page = 1, _sort = "balance_date", _order = sortOrder !== "descend" ? "desc" : "asc", _which = (status === "management") ? "michelin data" : "my data" }) => {
    const getDataSearch = async ({ search = modelSearch.search ?? "", filter_balance = modelSearch.filter_balance ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _which = (status === "management") ? "michelin data" : "my data", type_group_id = modelSearch.type_group_id ?? "", product_type_id = modelSearch.product_type_id ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "", shop_ids = modelSearch.shop_ids ?? "" }) => {

        if (shop_ids.length > 0 && !shop_ids.includes('all')) {
            let column = filterShops.filter(el => { return shop_ids.includes(el.id) })
            setColumnsTable(column)
        } else {
            setColumnsTable(filterShops)
        }
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopReports/shopStock?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&status=active&min_balance=${filter_balance[0]}&max_balance=${filter_balance[1]}${!!type_group_id ? `&type_group_id=${type_group_id}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id}` : ""}${!!shop_ids ? `&select_shop_ids=${shop_ids}` : ""}`)
            // const res = await API.get(`/shopStock/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&status=default&filter_available_balance=${filter_available_balance}`)

            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)

                // const newData = data.filter(where => where.balance != 0)
                const newData = data
                setListSearchDataTable(newData)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                // setIsIncludeZero(filter_available_balance)
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/template-ข้อมูลสินค้าคงเหลือ.xlsx', '_blank');
    }

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);
    const [form] = Form.useForm();
    const [loadingUpload, setLoadingUpload] = useState(false)

    const importExcel = () => {
        setIsModalImportVisible(true)
    }

    const handleImportOk = () => {
        if (fileImport) {
            form.submit()
        } else {
            message.warning("กรุณาเลือกไฟล์")
        }
    }

    const onFinish = async (value) => {
        try {
            if (fileImport) {
                setLoadingUpload(true)
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                const userAuth = cookies.get("userAuth");
                const token = userAuth.access_token

                /* import */
                let { RDBusinessRegNo, RDFileCode, TransDate, TransTime } = value
                TransDate = `${moment(TransDate._d).format(TransDate._f)}_${moment(TransTime._d).format("HHmmss")}`
                // console.log(`TransDate`, TransDate)                // console.log(`TransTime`, TransTime)
                // console.log(`url`, `${process.env.NEXT_PUBLIC_APIURL}/webMax/SubmitStockDetail/byfile?RDBusinessRegNo=${RDBusinessRegNo}&RDFileCode=${RDFileCode }&TransDate=${TransDate}`)
                const { data } = await axios({
                    method: "put",
                    url: `${process.env.NEXT_PUBLIC_APIURL}/webMax/SubmitStockDetail/byfile?RDBusinessRegNo=${RDBusinessRegNo}&RDFileCode=${RDFileCode}&TransDate=${TransDate}`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "success") {
                    message.success("บันทึกสำเร็จ")
                    setLoadingUpload(false)
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        // filter_available_balance: modelSearch.filter_available_balance,
                        filter_balance: modelSearch.filter_balance
                    })
                } else {
                    setLoadingUpload(false)
                    message.error(data.data ?? 'มีบางอย่างผิดพลาด !!');
                }

            } else {
                setLoadingUpload(false)
                message.warning("กรุณาเลือกไฟล์")
            }
        } catch (error) {
            setLoadingUpload(false)
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const onFinishFailed = (error) => {
        setLoadingUpload(false)
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const handleImportCancel = () => {
        if (!loadingUpload) {
            form.resetFields()
            setIsModalImportVisible(false)
            setFileImportList([])
            setFileImport(null)
        }
    }

    const handleImportChange = (info) => {
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
                        FileReaderExcel(file.originFileObj)
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

    const FileReaderExcel = (file) => {

        if (file) {
            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                let data = event.target.result;
                let workbook = XLSX.read(data, {
                    type: "binary"
                });

                // console.log(`workbook`, workbook)
                const SheetName = workbook.SheetNames[0]

                if (!workbook.Sheets[SheetName] || !workbook.Sheets[SheetName].B1) {
                    message.error("ไฟล์ไม่ถูกต้อง")
                    setFileImport(null);
                    setFileImportList([]);
                    return
                }

                if (!workbook.Sheets[SheetName].B1.v) message.warning("ข้อมูลไม่ถูกต้อง")
                else {
                    const RDBusinessRegNo = workbook.Sheets[SheetName].B1.v;
                    // console.log(`RDBusinessRegNo`, RDBusinessRegNo)
                    // console.log(`  form.getFieldValue()`, form.getFieldValue())
                    form.setFieldsValue({
                        ...form.getFieldValue(),
                        RDBusinessRegNo,
                        RDFileCode: "A"
                    })
                }

            };
            fileReader.readAsBinaryString(file)
        }

    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /* export excel */

    const [isModalExportVisible, setIsModalExportVisible] = useState(false)
    const [isIncludeDot, setIsIncludeDot] = useState(false)
    const [formExport] = Form.useForm();
    const [loadingExport, setLoadingExport] = useState(false)
    const [isIncludeZero, setIsIncludeZero] = useState(false)


    const exportExcel = () => {
        onFinishExport()
        // setIsModalExportVisible(true)
    }

    const handleExportCancel = () => {
        setIsIncludeDot((prevValue) => false)
        setIsIncludeZero((prevValue) => false)
        setIsModalExportVisible(false)
    }
    const handleExportOk = () => {
        formExport.submit()
        setIsModalExportVisible(false)
    }

    const onFinishExport = async () => {
        try {
            // setLoadingExport(true)
            setLoading(true)
            const { type_group_id, product_type_id, product_brand_id, product_model_id, filter_balance, shop_ids } = modelSearch
            const res = await API.get(`/shopReports/shopStock?min_balance=${filter_balance[0]}&max_balance=${filter_balance[1]}&export_format=xlsx&search=${modelSearch.search ?? ""}${!!type_group_id ? `&type_group_id=${type_group_id ?? ""}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id ?? ""}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id ?? ""}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id ?? ""}` : ""}${!!shop_ids ? `&select_shop_ids=${shop_ids}` : ""}`)
            // const res = await API.get(`/shopStock/report/allStock?dot=${isIncludeDot === true ? 1 : 0}&filter_available_balance=${isIncludeZero === true ? 1 : 0}&export_format=xlsx&search=${modelSearch.search ?? ""}`)

            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`), setIsIncludeDot((prevValue) => false), setIsIncludeZero((prevValue) => false)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            // setLoadingExport(false)
            setLoading(false)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }
    const onFinishExportFailed = async () => {
        // setLoadingExport(false)
        setLoading(false)
        message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
    }

    /* end export excel */

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
            order: "ascend"

        },
        configSort: {
            sort: "balance_date",
            order: "ascend",
        },
        modelSearch: {
            search: "",
            status: "active",
            // filter_available_balance: true
            filter_balance: [0, maximunBalance],
            type_group_id: null,
            product_type_id: null,
            product_brand_id: null,
            product_model_id: null,
            shop_ids: ["all"]
        }
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    useEffect(() => {

        if (search) {
            setModelSearch({
                search: search,
                filter_balance: [0, 999999]
            })
            getDataSearch({
                page: configTable.page,
                search: search,

                filter_balance: [0, 999999],
            });
        } else {
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                filter_balance: [0, 9999999999999]
                // filter_balance: modelSearch.filter_balance,
            });
        }
        // getDataSearch({
        //     page: configTable.page,
        //     search: modelSearch.search,
        //     filter_balance: modelSearch.filter_balance,
        //     // filter_available_balance: modelSearch.filter_available_balance,
        // })
    }, [])

    useEffect(async () => {
        if (permission_obj) {
            await API.get(`/shopsProfiles/all?byHq=true&limit=10000`).then(data1 => {

                if (data1.data?.data?.data) {
                    const data = data1.data.data.data
                    setFilterShops(() => data)
                    setColumnsTable(data)
                } else {
                    setColumnsTable()

                }

            })

        }


    }, [configTable.page, configSort.order, permission_obj])


    const [filterProductTypes, setFilterProductTypes] = useState([])
    const [filterProductBrands, setFilterProductBrands] = useState([])
    const [filterShops, setFilterShops] = useState([])
    const [filterProductModelTypes, setFilterProductModelTypes] = useState([])
    const [oldTypeGroupId, setOldTypeGroupId] = useState(null)
    const [oldProductTypeId, setOldProductTypeId] = useState(null)
    const [oldBrandId, setOldBrandId] = useState(null)
    const [oldProductModel, setOldProductModelId] = useState(null)
    const [shopArr, setShopArr] = useState([])



    /** กดปุ่มค้นหา */
    const onFinishSearch = async (value) => {
        try {
            // console.log('value :>> ', value);

            const { type_group_id, product_type_id, product_brand_id, product_model_id } = value
            setOldTypeGroupId(() => type_group_id)
            setOldProductTypeId(() => product_type_id)
            setOldBrandId(() => product_brand_id)
            setOldProductModelId(() => product_model_id)
            if (type_group_id !== oldTypeGroupId) product_type_id = null, product_brand_id = null, product_model_id = null
            // const { data } = await API.get(`/shopProducts/filter/categories?${type_group_id ? `product_group_id=${type_group_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
            // console.log('data :>> ', data);
            if (type_group_id !== oldTypeGroupId || product_type_id !== oldProductTypeId || product_brand_id !== oldBrandId || product_model_id !== oldProductModel) {
                const { data } = await API.get(`/shopProducts/filter/categories?${type_group_id ? `product_group_id=${type_group_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
                if (isPlainObject(data) && !isEmpty(data)) {
                    const { productGroupLists, productTypeLists, productBrandLists, productModelLists } = data
                    if (productGroupLists?.length === 1) type_group_id = productGroupLists?.[0]?.id ?? null
                    if (productTypeLists?.length === 1) product_type_id = productTypeLists?.[0]?.id ?? null
                    if (productBrandLists?.length === 1) product_brand_id = productBrandLists?.[0]?.id ?? null
                    if (productModelLists?.length === 1) product_model_id = productModelLists?.[0]?.id ?? null

                    setFilterProductTypes(() => productTypeLists)
                    setFilterProductBrands(() => productBrandLists)
                    setFilterProductModelTypes(() => productModelLists)


                } else {
                    onReset()
                    Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
                }

            }

            if (isArray(value.shop_ids) && value.shop_ids.length > 0) {
                const _filter = value.shop_ids.filter(where => where !== "all")
                if (_filter.length === 0) value.shop_ids = ["all"]
                else value.shop_ids = _filter
            } else if (isArray(value.shop_ids) && value.shop_ids.length === 0) {
                value.shop_ids = ["all"]
            }

            const searchModel = {
                ...modelSearch,
                search: value.search,
                status: value.status == "undefined" ? modelSearch.status : "active",
                filter_balance: value.filter_balance,
                type_group_id: type_group_id ?? null,
                product_type_id: product_type_id ?? null,
                product_brand_id: product_brand_id ?? null,
                product_model_id: product_model_id ?? null,
                shop_ids: value.shop_ids

            }
            setModelSearch((previousValue) => searchModel);

            getDataSearch({
                search: value.search,
                page: init.configTable.page,
                filter_balance: value.filter_balance,
                type_group_id: type_group_id ?? null,
                product_type_id: product_type_id ?? null,
                product_brand_id: product_brand_id ?? null,
                product_model_id: product_model_id ?? null,
                shop_ids: value.shop_ids

            });
        } catch (error) {

        }

    }

    const onClearFilterSearch = (type) => {
        try {
            const searchModel = {
                ...modelSearch
            }
            switch (type) {
                case "type_group_id":
                    searchModel[type] = null
                    searchModel.product_type_id = null
                    searchModel.product_brand_id = null
                    searchModel.product_model_id = null
                    break;
                case "product_type_id":
                    searchModel[type] = null
                    searchModel.product_brand_id = null
                    searchModel.product_model_id = null
                    break;
                case "product_brand_id":
                    searchModel[type] = null
                    searchModel.product_model_id = null
                    break;
                case "product_model_id":
                    searchModel[type] = null
                    break;
                case "shop_ids":
                    searchModel[type] = ["all"]
                    break;

                default:
                    break;
            }
            setModelSearch((previousValue) => searchModel);
        } catch (error) {

        }
    }


    /** กดปุ่มค่าเริ่มต้น */
    const onReset = async () => {
        try {
            setConfigTable(() => init.configTable)
            setConfigSort(() => init.configSort)
            setModelSearch(() => init.modelSearch)
            setOldTypeGroupId(() => null)
            const { data } = await API.get(`/shopProducts/filter/categories`)
            if (isPlainObject(data) && !isEmpty(data)) {
                const { productTypeLists, productBrandLists, productModelLists } = data
                setFilterProductTypes(() => productTypeLists)
                setFilterProductBrands(() => productBrandLists)
                setFilterProductModelTypes(() => productModelLists)
            }
            getDataSearch({
                search: init.modelSearch.search ?? "",
                _status: init.modelSearch.status,
                limit: init.configTable.limit,
                page: init.configTable.page,
                sort: init.configSort.sort,
                filter_balance: init.modelSearch.filter_balance,
                type_group_id: init.modelSearch.type_group_id,
                product_type_id: init.modelSearch.product_type_id,
                product_brand_id: init.modelSearch.product_brand_id,
                product_model_id: init.modelSearch.product_model_id,
                shop_ids: init.modelSearch.shop_ids,
                order: (init.configSort.order === "descend" ? "desc" : "asc"),
            })
        } catch (error) {

        }

    }
    const getAllShopStock = async () => {
        try {

            const { shop_ids } = modelSearch
            const { data } = await API.get(`/shopReports/shopStockGetMax${!!shop_ids ? `?select_shop_ids=${shop_ids}` : ""}`)
            // console.log('data getAllShopStock :>> ', data);
            return data.status === "success" ? data.data ?? 2000000 : 2000000
        } catch (error) {

        }

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
                label: "ค้นหา",
                placeholder: "ค้นหา",
                list: null,
            },
            // {
            //     index: 1,
            //     type: "select",
            //     name: "filter_available_balance",
            //     label: "เลือกการแสดงผลของสต๊อค",
            //     placeholder: "เลือกการแสดงผลของสต๊อค",
            //     list: [
            //         {
            //             key: "แสดงทั้งหมด",
            //             value: false,
            //         },
            //         {
            //             key: "ไม่แสดงสินค้าที่มีจำนวน 0",
            //             value: true,
            //         }
            //     ],
            // },
            {
                index: 1,
                type: "select",
                name: "type_group_id",
                label: "เลือกกลุ่มสินค้า",
                placeholder: "เลือกกลุ่มสินค้า",
                allowClear: true,
                showSearch: true,
                list: isArray(productTypeGroup) && productTypeGroup?.length > 0 ? productTypeGroup.map(e => ({
                    key: e?.group_type_name[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
            },
            {
                index: 1,
                type: "select",
                name: "product_type_id",
                label: "เลือกประเภทสินค้า",
                placeholder: "เลือกประเภทสินค้า",
                allowClear: true,
                showSearch: true,
                list: isArray(filterProductTypes) && filterProductTypes?.length > 0 ? filterProductTypes.map(e => ({
                    key: e?.type_name[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
            },
            {
                index: 1,
                type: "select",
                name: "product_brand_id",
                label: "เลือกยี่ห้อสินค้า",
                placeholder: "เลือกยี่ห้อสินค้า",
                allowClear: true,
                showSearch: true,
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
                list: isArray(filterProductModelTypes) && filterProductModelTypes?.length > 0 ? filterProductModelTypes.map(e => ({
                    key: e?.model_name?.[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
            },

            {
                index: 1,
                type: "select",
                name: "shop_ids",
                label: "เลือกสาขา",
                placeholder: "เลือกสาขา",
                allowClear: true,
                showSearch: true,
                mode: "multiple",
                list: [
                    {
                        key: `ทุกสาขา`,
                        value: "all"
                    },
                    ...isArray(filterShops) && filterShops?.length > 0 ? filterShops.map(e => ({
                        key: e?.shop_name?.[`${locale.locale}`],
                        value: e?.id
                    })) : []],
            },
            {
                index: 1,
                type: "silder",
                name: "filter_balance",
                label: `เลือกการแสดงผลของสต๊อค`,
                // label: `เลือกการแสดงผลของสต๊อค (เริ่มต้น : ${modelSearch?.filter_balance[0]} - สิ้นสุด : ${modelSearch?.filter_balance[1]})`,
                placeholder: "เลือกการแสดงผลของสต๊อค",
                minMaxValue: { min: 0, max: maximunBalance ?? 0 },
                defaultValue: [1, maximunBalance ?? 0],
            },

        ],
        col: 8,
        sliderCol: { input: 2, slider: 4 },
        button: {
            download: false,
            import: false,
            export: true,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        downloadTemplate,
        importExcel,
        exportExcel,
        onClearFilterSearch
    }

    const [shopProductDataListAll, setShopProductDataListAll] = useState([]);
    const [getShelfDataAll, setgetShelfDataAll] = useState([]);
    // const [ProductTypeGroup, setGetProductTypeGroup] = useState('');
    const [tireProductTypeGroupId, setTireProductTypeGroupId] = useState('da791822-401c-471b-9b62-038c671404ab')
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [checkTypeGroupId, setCheckTypeGroupId] = useState('')
    const [formModal] = Form.useForm();

    const onCreate = async () => {
        const initData = {
            total_discount: 0,
            total_price_all: 0,
            vat: 0,
            net_price: 0,
            tax_type: "8c73e506-31b5-44c7-a21b-3819bb712321",
            product_list: [],
            doc_date: moment(new Date())
        }
        const warehouseDetail = []

        for (let index = 1; index <= 1; index++) {
            {
                initData.product_list.push({
                    product_id: null,
                    product_name: null,
                    amount_all: null,
                    price: null,
                    total_price: null,
                    discount_percentage_1: null,
                    discount_percentage_2: null,
                    discount_3: null,
                    discount_3_type: "bath",
                    discount_thb: null,
                    warehouse_detail: warehouseDetail
                })
            }
        }
        for (let index = 1; index <= 1; index++) {
            {
                warehouseDetail.push({ warehouse: null, shelf: null, dot_mfd: null, purchase_unit_id: null, amount: null })
            }
        }
        if (configModal.mode === "add") {
            const { id } = authUser
            initData.user_id = id
        }

        formModal.setFieldsValue(initData)
        setIsModalVisible(true)

    }


    const addEditViewModal = async (mode, id_array) => {
        try {
            setConfigModal({ ...configModal, mode })
            let shop_arr = []
            let form_arr = []
            const initData = {
                product_list: []
            }

            for (let index = 0; index < id_array.length; index++) {
                const element = id_array[index];
                if (element.ShopProduct?.ShopStocks.length > 0) {

                    let id = element.ShopProduct?.ShopStocks[0].id

                    setIsIdEdit(id)
                    const { data } = await API.get(`/shopStock/byid/${id}?shop_id=${element.id}`)

                    shop_arr.push({ id: element.id, shop_name: element.shop_name.th, shop_local_name: element.shop_name.shop_local_name, shop_product_id: element.ShopProduct.product_id })
                    shop_arr.map((e) => {
                        e.shop_config = shopInCorporate.find(x => x.id === e.id).shop_config
                    })
                    shop_arr.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)
                    // console.log("shop_arr",shop_arr)
                    setShopArr(shop_arr)

                    // console.log('data', data.data)
                    // if (data.status == "success" && isArray(data.data) && data.data.length > 0) {
                    if (data.status == "success" && data.data.length > 0 && isArray(data.data)) {
                        const productId_list = []
                        productId_list.push(data.data[0].ShopProduct)
                        const newWarehouse_detail = data.data[0].warehouse_detail.filter(where => where.shelf.balance != 0)

                        initData.product_list.push({
                            // product_id_for_movement: data.data[0].ShopProduct.product_id,
                            shop_id: element.id,
                            shop_name: element.shop_name.th,
                            shop_config: shopInCorporate?.find(x => x.id === element.id)?.shop_config,
                            shop_product_id: data.data[0].ShopProduct.id,
                            product_id: data.data[0].ShopProduct.id,
                            product_name: null, amount_all: data.data[0].balance, total_price: null,
                            warehouse_detail: newWarehouse_detail.map((e, index) => {
                                return { warehouse: e.warehouse, shelf: e.shelf.item, dot_mfd: e.shelf.dot_mfd, amount: e.shelf.balance, purchase_unit_id: e.shelf.purchase_unit_id }
                            }),
                            ProductTypeGroupId: data.data[0].ShopProduct.Product.ProductType.type_group_id,
                            productId_list: productId_list,
                            unit_list: await getproductPurchaseUnitTypesDataListAll()
                        })

                    }
                }

            }
            initData.product_list[0].warehouse_detail.sort((a, b) => a?.dot_mfd === undefined || b?.dot_mfd === undefined ? -1 : Number(a?.dot_mfd.slice(-2)) - Number(b?.dot_mfd.slice(-2)));
            initData.product_list.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)
            formModal.setFieldsValue(initData)


            setIsModalVisible(true)


        } catch (error) {
            console.log(`error`, error)
        }
    }

    const handleOkModal = () => {
        formModal.submit()
        // formIncomeProduct.submit()
    }

    const handleCancelModal = () => {
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: "add" })
        formModal.resetFields()
        // formIncomeProduct.resetFields()
    }

    const onFinishAddEditViewModal = async (value) => {
        try {
            // console.log(`value`, value)

            const find = shopBusinessPartnersList.find(where => where.id == value.bus_partner_id)
            const { total_discount, total_price_all, total_price_all_after_discount, vat, net_price } = formModal.getFieldValue()
            const _model = {
                shop_id: find.shop_id,
                bus_partner_id: value.bus_partner_id,
                details: {
                    purchase_order_number: value.purchase_order_number,
                    credit_balance: value.credit_balance,
                    tax_type: value.tax_type,
                    // tax_rate: value.tax_rate,
                    References_doc: value.References_doc,

                    total_discount: total_discount ? `${total_discount}` : null,
                    total_discount_text: replaceData(`${value.total_discount_text}`),

                    total_price_all: `${MatchRound(total_price_all)}`,
                    total_price_all_text: replaceData(`${value.total_price_all_text}`),

                    total_price_all_after_discount: `${MatchRound(total_price_all_after_discount)}`,
                    total_price_all_after_discount_text: replaceData(`${value.total_price_all_after_discount_text}`),

                    vat: `${MatchRound(vat)}`,
                    vat_text: replaceData(`${value.vat_text}`),

                    net_price: `${MatchRound(net_price)}`,
                    net_price_text: replaceData(`${value.net_price_text}`),
                    note: value.note,
                    user_id: value.user_id
                },
                doc_type_id: "ad06eaab-6c5a-4649-aef8-767b745fab47",
                doc_date: moment(value.doc_date).format("YYYY-MM-DD"),

            }

            const warehouseModel = {
                product_list: value.product_list.map((items, index) => {
                    return {
                        // item: index + 1,
                        product_id: items.product_id,
                        warehouse_detail: items.warehouse_detail ? items.warehouse_detail.map(e => {
                            // console.log('warehouse_detail', e)

                            return {
                                warehouse: e.warehouse,
                                shelf: {
                                    item: e.shelf,
                                    amount: isNaN(parseInt(e.amount)) ? null : parseInt(e.amount),
                                    dot_mfd: e.dot_mfd ?? null,
                                    purchase_unit_id: e.purchase_unit_id ?? null,
                                }
                            }
                        }) : null,
                        amount_all: isNaN(parseInt(items.amount_all)) ? null : `${parseInt(items.amount_all)}`,
                        details: {
                            price: `${items.price}`,
                            price_text: `${items.price_text.replaceAll(",", "")}`,

                            discount_percentage_1: items.discount_percentage_1 ? `${items.discount_percentage_1}` : null,
                            discount_percentage_1_text: items.discount_percentage_1 ? `${items.discount_percentage_1.replaceAll(",", "")}` : null,

                            discount_percentage_2: items.discount_percentage_2 ? `${items.discount_percentage_2}` : null,
                            discount_percentage_2_text: items.discount_percentage_2 ? `${items.discount_percentage_2.replaceAll(",", "")}` : null,

                            discount_3: items.discount_3 ? `${items.discount_3}` : null,
                            discount_3_text: items.discount_3 ? `${items.discount_3.replaceAll(",", "")}` : null,
                            discount_3_type: items.discount_3_type,

                            discount_thb: items.discount_thb ? `${items.discount_thb}` : null,
                            discount_thb_text: items.discount_thb ? `${items.discount_thb}` : null,

                            total_price: items.total_price,
                            total_price_text: items.total_price_text.replaceAll(",", ""),

                            unit: items.unit,
                        },
                    }
                }),
                import_date: moment(value.doc_date).format("YYYY-MM-DD"),
            }


            /* funtion เช็คว่ามี product_id ตัวไหนเป็น null ไหม ถ้าเป็น จะไม่ส่งไป  */
            warehouseModel.product_list.map((e, index) => {
                filterByProductID(e)
                e.warehouse_detail.map((item, index) => {
                    filterWarehouseDetail(item)
                })
            })

            function filterByProductID(item) {
                // console.log('item filterByID', item)
                item.product_id = item.product_id ?? null
                if (item.product_id !== null) {
                    return true
                }
            }
            let filterResult = warehouseModel.product_list.filter(filterByProductID)

            warehouseModel.product_list = filterResult

            /* จบ funtion เช็ค product_id  */

            /* function กรองเอา warehouse detail ที่เป็นค่าว่างออก */
            function filterWarehouseDetail(item) {
                item.warehouse = item.warehouse ?? null
                item.shelf.item = item.shelf.item ?? null
                item.shelf.amount = isNaN(item.shelf.amount) ? null : item.shelf.amount
                if (item.warehouse !== null && item.shelf.item !== null && item.shelf.amount !== null) {
                    return true
                }

            }
            warehouseModel.product_list.forEach((e, index) => {
                e.warehouse_detail = e.warehouse_detail.filter(filterWarehouseDetail)
            })
            /* จบ function กรองเอา warehouse detail ที่เป็นค่าว่างออก */

            const log = []
            warehouseModel.product_list.forEach((e, index) => {
                const sum_warehouse_amount = e.warehouse_detail.reduce(
                    (previousValue, currentValue) => previousValue + Number(currentValue.shelf.amount), 0
                );

                if (e.amount_all != sum_warehouse_amount) {
                    log.push(index)
                }

            });
            // console.log('log', log)
            // _model.doc_type_id = documentTypesList[0].id,
            // _model.ShopInventory_Add = warehouseModel
            // // _model.status = resWarehouse.data.status == "failed" ? 0 : 1,
            // _model.status = 1,

            function replaceData(data) {
                if (data) {
                    const newData = data.replaceAll(",", "")
                    return newData ?? null
                }
            }
            // console.log('_model', _model)
            let res
            let resWarehouse
            if (log.length == 0) {
                if (configModal.mode == "add") {

                    // warehouseModel.doc_inventory_id = res.data.data.id
                    warehouseModel.status = 1
                    warehouseModel.import_date = moment(value.doc_date).format("YYYY-MM-DD")

                    _model.ShopInventory_Add = warehouseModel
                    _model.status = 1,
                        res = await API.post(`/shopInventoryTransaction/add`, _model)

                    // if (res.data.status == "success") {
                    //     warehouseModel.status = 1
                    //     warehouseModel.doc_inventory_id = res.data.data.id
                    //     warehouseModel.import_date = moment(value.doc_date).format("YYYY-MM-DD")
                    //     resWarehouse = await API.post(`/shopInventory/add/byjson`, warehouseModel)
                    // }
                } else if (configModal.mode == "edit") {
                    // _model.status = checkedIsuse ? "active" : "block"
                    // res = await API.put(`/shopInventoryTransaction/put/${idEdit}`, _model)
                    // resWarehouse = await API.put(`/shopInventory/putbydocinventoryid/${idEdit}`, warehouseModel)
                }

                if (res.data.status == "success") {
                    message.success('บันทึกสำเร็จ');
                    handleCancelModal()
                    getDataSearch({})
                }
                else {
                    message.error('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่');
                    // message.error(resWarehouse.data.data);
                }
            }
            else {
                message.error('จำนวนในชั้นว่างไม่ตรงกับจำนวนทั้งหมด')
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error', error)
        }
    }

    const onFinishFailedAddEditViewModal = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    /* เรียกข้อมูล สินค้าของร้านนั้นๆ ทั้งหมด */
    // const getDataShopProductList = async () => {
    const getDataShopProductList = async () => {
        const { data } = await API.get(`/shopProducts/all?limit=9999&page=1&sort=start_date&order=asc&status=active`)
        // console.log('data.data.data getDataProductList', data.data.data);
        return data.data.data
    }

    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        alert('s')
        const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        // console.log('data.data getShelfData', data.data.data);
        return data.data.data
    }


    const [modalAddPartnerVisible, setModalAddPartnerVisible] = useState(false)
    const [businessTypeList, setBusinessTypeList] = useState([])
    const [shopBusinessPartnersList, setShopBusinessPartners] = useState([])
    const [documentTypesList, setDocumentTypes] = useState([])
    const [taxTypeAllList, setTaxTypeAllList] = useState([])
    const [productPurchaseUnitTypes, setProductPurchaseUnitTypes] = useState([])
    const [formModalAddPartner] = Form.useForm();

    const onCancelAddPartnerModal = () => {
        setModalAddPartnerVisible(false)
        formModalAddPartner.resetFields()
    }
    const onOkAddPartnerModal = () => {
        setModalAddPartnerVisible(false)
        formModalAddPartner.submit()
    }
    const onOpenAddPartnerModal = () => {
        formModalAddPartner.resetFields()
        setModalAddPartnerVisible(true)
    }

    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const businessTypeDataList = await getBusinessTypeDataListAll()
            setBusinessTypeList(businessTypeDataList)

            const shopBusinessPartnersDataList = await getShopBusinessPartnersDataListAll()
            setShopBusinessPartners(shopBusinessPartnersDataList)

            const documentTypesDataList = await getDocumentTypesDataListAll()
            setDocumentTypes(documentTypesDataList)

            const PurchaseUnitTypes = await getproductPurchaseUnitTypesDataListAll()
            setProductPurchaseUnitTypes(PurchaseUnitTypes)

            const taxTypeDataList = await getTaxType()
            setTaxTypeAllList(taxTypeDataList)

            // const productMasterData = await getProductMasterDataAll()
            // setProductMasterDataAllList(productMasterData)
        } catch (error) {

        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }
    const getShopBusinessPartnersDataListAll = async () => {
        const { data } = await API.get(`/shopBusinessPartners/all?limit=9999&page=1&sort=partner_name.th&order=asc&status=default`)
        // console.log('data.data shopBusinessCustomers', data.data.data)
        return data.data.data
    }
    const getDocumentTypesDataListAll = async () => {
        const { data } = await API.get(`/master/documentTypes?sort=code_id&order=asc`)
        // console.log('data.data getDocumentTypesDataListAll', data.data)
        return data.data
    }
    const getproductPurchaseUnitTypesDataListAll = async () => {
        const { data } = await API.get(`/master/productPurchaseUnitTypes/all?sort=code_id&order=asc&status=active`)
        // console.log('data.data getproductPurchaseUnitTypesDataListAll', data.data)
        return data.status === "success" ? data.data ?? [] : []
    }
    const getProductMasterDataAll = async () => {
        const { data } = await API.get(`/product/all?limit=9999&page=1&sort=master_path_code_id&order=asc&status=active`)
        // console.log('data.data getProductMasterDataAll', data.data.data)
        return data.data.data
    }

    const getShopProduct = async (id) => {
        const { data } = await API.get(`/shopProducts/byid/${id}`)
        // console.log('data getShopProduct', data.data[0])
        return data.status == "success" ? isArray(data.data) ? data.data[0] : null : null
    }

    const getTaxType = async () => {
        const { data } = await API.get(`/master/taxTypes/all?sort=code_id&order=asc`)
        // console.log('data getTaxType', data.data)
        return data.data
    }

    const onFinishAddBusinessPartner = async (value) => {
        try {
            // console.log(`value`, value)

            const _model = {
                tax_id: value.tax_id,
                bus_type_id: value.bus_type_id ?? null,
                partner_name: value.partner_name,
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                address: value.address,
                subdistrict_id: value.subdistrict_id ?? null,
                district_id: value.district_id ?? null,
                province_id: value.province_id ?? null,
                other_details: {
                    contact_name: value.contact_name ?? null,
                    period_credit: value.period_credit ?? null,
                    approval_limit: value.approval_limit ?? null
                },
            }

            if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            else value.mobile_no = []

            if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            else value.tel_no = []

            // console.log('_model', _model)

            let res
            if (configModal.mode === "add") {
                _model.master_customer_code_id = ""
                res = await API.post(`/shopBusinessPartners/add`, _model)
                // console.log('res', res)
            }
            // else if (configModal.mode === "edit") {
            //     _model.status = checkedIsuse ? "active" : "block"
            //     res = await API.put(`/shopBusinessCustomers/put/${idEdit}`, _model)
            // }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setModalAddPartnerVisible(false)
                setConfigModal({ ...configModal, mode: "add" })
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    filter_balance: modelSearch.filter_balance
                })
                await initUseEffect()
                formModal.setFieldsValue({ bus_partner_id: res.data.data.id })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailedAddBusinessPartner = (error) => {
        // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    /**
     * ควบคุมการเปิด ปิด modal การเคลื่อนไหวสินค้า
     */
    const [visibleMovementModal, setVisibleMovementModal] = useState(false)
    const [fliterEachMovement, setFliterEachMovement] = useState({})

    const visibleEachWarehouseMovementModal = (index1, index2) => {
        try {
            // console.log("index1", index1)
            // console.log("index2", index2)
            if (index2 != null) {
                const { product_list } = formModal.getFieldValue()
                setVisibleMovementModal(prevValue => true)
                setFliterEachMovement(prevValue => { return { ...product_list[index1], ...product_list[index1]?.warehouse_detail[index2] } })
            } else {
                const { product_list } = formModal.getFieldValue()
                // console.log("product_list", product_list)
                // console.log("shopArr", shopArr)
                setVisibleMovementModal(prevValue => true)
                setFliterEachMovement(prevValue => product_list[index1])
            }


        } catch (error) {

        }
    }


    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <>
                {/* <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={onCreate} value={modelSearch} /> */}
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} value={modelSearch} />
                <TableList objId={"ShopProfiles"} columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} />

            </>


            {/* add */}
            <ModalFullScreen
                maskClosable={false}
                title={`${configModal.mode == "view" ? "ดูข้อมูลคลังสินค้า" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูลใบนำเข้า"}`}
                visible={isModalVisible}
                // onOk={handleOkModal}
                // onCancel={handleCancelModal}
                okButtonProps={{ disabled: configModal.mode == "view" }}
                CustomsButton={() => {
                    return (
                        <div>
                            <span className='pr-3'>
                                <Button loading={loading} onClick={handleCancelModal} style={{ width: 100 }}>{GetIntlMessages("ปิด")}</Button>
                            </span>
                            {/* {configModal.mode !== "add" ?
                                <span className='pr-3'>
                                    <Button icon={<TableOutlined style={{ fontSize: 20 }} />} loading={loading} onClick={() => setVisibleMovementModal(true)} style={{ width: "100" }}>{GetIntlMessages("การเคลื่อนไหวของสินค้า")}</Button>
                                </span>
                                :
                                <span className='pr-3'>
                                    <Button type="primary" loading={loading} onClick={handleOkModal} style={{ width: 100 }}>{GetIntlMessages("บันกทึก")}</Button>
                                </span>
                            } */}

                        </div>
                    )
                }}
            >

                <Form
                    form={formModal}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinishAddEditViewModal}
                    onFinishFailed={onFinishFailedAddEditViewModal}

                >
                    <ImportDocAddEditViewModal isAllBranch shopArr={shopArr} pageId={'a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0'} form={formModal} mode={configModal.mode} getShopBusinessPartners={setShopBusinessPartners} visibleEachWarehouseMovementModal={visibleEachWarehouseMovementModal} />
                </Form>
            </ModalFullScreen>



            {/* --------------------------------------------------------------------------------------------------------------------------------------------------------- */}


            <ProductMovement shopArr={shopArr} mode={configModal.mode} visibleMovementModal={visibleMovementModal} setVisibleMovementModal={setVisibleMovementModal} loading={loading} setLoading={setLoading} productData={formModal.getFieldValue()?.product_list} fliterEachMovement={fliterEachMovement} setFliterEachMovement={setFliterEachMovement} />
            <style global>{`
               th {
                    text-align: center !important;
                }

                .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }
                .dynamic-delete-button {
                    position: relative;
                    top: 4px;
                    margin: 0 8px;
                    color: #999;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                  }
                  .dynamic-delete-button:hover {
                    color: #777;
                  }
                  .dynamic-delete-button[disabled] {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }
                  .ant-form legend{
                      font-size : 25px;
                      font-weight : bold;
                      padding: 10px;
                      border-bottom :transparent;
                  }
                  .detail-before-table{
                     margin-bottom: 10px;
                  }
                  .ant-btn-dashed:hover{
                      color: #fff;
                      background-color: ${mainColor};
                      border-color : ${mainColor};
                  }
            `}</style>
        </>
    )
}

export default CustomersIndex
