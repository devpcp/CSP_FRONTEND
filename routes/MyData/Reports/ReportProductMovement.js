import { cloneElement, useEffect, useState, useSyncExternalStore } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, Modal, Form, Upload, DatePicker, TimePicker, Select, Divider, AutoComplete, Switch, Space } from 'antd';
import { ReloadOutlined, UploadOutlined, EditOutlined, PlusOutlined, MinusCircleOutlined, ExportOutlined, TableOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import _, { isArray, isFunction, get, isPlainObject, isEmpty } from 'lodash'
// import TitlePage from '../shares/TitlePage';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import CarPreloader from '../../../components/_App/CarPreloader'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import { FormInputLanguage, FormSelectLanguage } from '../../../components/shares/FormLanguage';
import FormSelectDot from '../../../components/Routes/Dot/Components.Select.Dot';
import FormProvinceDistrictSubdistrict from '../../../components/shares/FormProvinceDistrictSubdistrict';
import Fieldset from '../../../components/shares/Fieldset';
import ModalFullScreen from '../../../components/shares/ModalFullScreen';
import ImportDocAddEditViewModal from '../../../components/Routes/ImportDocumentModal/ImportDocAddEditViewModal';
import ProductMovement from '../../../components/Routes/Movement/ProductMovement';
import Swal from "sweetalert2";
import ModalViewDocument from '../../../components/Routes/Movement/ModalViewDocument';

const { Search } = Input;
const cookies = new Cookies();

const ReportProductMovement = () => {

    const [loading, setLoading] = useState(false);
    const [loadingPage, setLoadingPage] = useState(true);

    /* table */

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { productBrand, productTypeGroup, productType, productModelType, productPurchaseUnitTypes, productCompleteSize } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [maximunBalance, setMaximunBalance] = useState(0)
    const [shopWarehouse, setShopWarehouse] = useState([])

    // const [sortOrder, setSortOrder] = useState("ascend")
    useEffect(() => {
        try {
            initUseEffect()
            permission_obj.update = 0
            permission_obj.create = 0
        } catch (error) {
            console.log('error :>> ', error);
        }

    }, [])


    // useEffect(() => {
    //     const newModelSearch = {
    //         ...modelSearch,
    //         filter_balance: [modelSearch?.filter_balance[0], maximunBalance]
    //     }
    //     setModelSearch(prevValue => newModelSearch)
    // }, [maximunBalance])


    const initUseEffect = async () => {

        try {
            setLoading(prev => true)
            await getMasterData()
            // const promise1 = getAllShopStock();


            // const values = await Promise.all([promise1])
            // console.log('values[0] :>> ', values[0]);

            // const maxValue = Math.max(...values[0].map(e => (e?.balance) ? e?.balance : 0)) ?? 0
            // setMaximunBalance(prevValue => (!!maxValue) && maxValue.toString() !== "-Infinity" ? maxValue ?? 0 : 0)

            const { data } = await API.get(`/shopProducts/filter/categories`)
            if (isPlainObject(data) && !isEmpty(data)) {
                const { productTypeLists, productBrandLists, productModelLists } = data
                setFilterProductTypes(() => productTypeLists)
                setFilterProductBrands(() => productBrandLists)
                setFilterProductModelTypes(() => productModelLists)
            }
            setLoadingPage(prev => false)
            setLoading(prev => false)
        } catch (error) {
            console.log('error initUseEffect :>> ', error);
        }

    }


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
                title: 'รหัส',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 150,
                align: "center",
                render: (text, record) => _.get(text, 'Product.master_path_code_id', "-")
            },
            {
                title: 'ชื่อสินค้า',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 350,
                render: (text, record) => _.get(text, `Product.product_name`, "-"),
            },
            {
                title: 'กลุ่มสินค้า',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 100,
                render: (text, record) => _.get(text, `Product.ProductType.ProductTypeGroup.group_type_name`, "-"),
            },
            {
                title: 'ประเภทสินค้า',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 140,
                render: (text, record) => _.get(text, `Product.ProductType.type_name`, "-"),
            },
            {
                title: 'ยี่ห้อสินค้า',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 140,
                render: (text, record) => _.get(text, `Product.ProductBrand.brand_name`, "-"),
            },
            {
                title: 'รุ่น',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 140,
                render: (text, record) => _.get(text, `Product.ProductModelType.model_name`, "-"),
            },
            {
                title: 'ขนาดสินค้า',
                dataIndex: 'ShopProduct',
                key: 'ShopProduct',
                width: 140,
                render: (text, record) => _.get(text, `Product.complete_size_id.complete_size_name`, "-"),
            },
            {
                title: 'เลขที่เอกสาร',
                dataIndex: '',
                key: '',
                width: 140,
                render: (text, record) => displayData(record, "code_id") !== "-" ? <Button onClick={() => controlOpenViewDocument(true, record)} type='link'>{displayData(record, "code_id")}</Button> : "-",
            },
            {
                title: 'วันที่',
                dataIndex: '',
                key: '',
                width: 140,
                render: (text, record) => moment(_.get(record, `created_date`, "-")).format("DD/MM/YYYY") ?? "-",
            },
            {
                title: 'ชื่อผู้จำหน่วย/ลูกค้า',
                dataIndex: '',
                key: '',
                width: 200,
                render: (text, record) => displayData(record, "customer_name"),
            },
            {
                title: 'คลังที่อยู่',
                dataIndex: '',
                key: '',
                width: 200,
                render: (text, record) => displayData(record, "warehouse_id"),
            },
            {
                title: 'ชั้นวาง',
                dataIndex: '',
                key: '',
                width: 200,
                render: (text, record) => displayData(record, "shelf"),

            },
            {
                title: 'DOT/MFD',
                dataIndex: 'dot_mfd',
                key: 'dot_mfd',
                width: 100,
                render: (text, record) => text ?? "-",

            },
            {
                title: 'หน่วนซื้อ',
                dataIndex: 'purchase_unit_id',
                key: 'purchase_unit_id',
                width: 100,
                render: (text, record) => displayData(record, "purchase_unit_id"),

            },
            {
                title: 'ยอดยกมา',
                dataIndex: 'count_previous_stock',
                key: 'count_previous_stock',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            {/* <span>{text ? Number(text).toLocaleString() : "0"} {true ? <Button type="link" ><EditOutlined onClick={() => editBalance(record)} style={{ fontSize: 23, color: 'blue' }} /></Button> : null} </span> */}
                            <span>{text ? Number(text).toLocaleString() : "0"} </span>
                            {/* {console.log('record', record)} */}
                        </>
                    )
                },
            },
            {
                title: '+ รับ / - จ่าย',
                dataIndex: 'count_adjust_stock',
                key: 'count_adjust_stock',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            {/* <span>{text ? Number(text).toLocaleString() : "0"} {true ? <Button type="link" ><EditOutlined onClick={() => editBalance(record)} style={{ fontSize: 23, color: 'blue' }} /></Button> : null} </span> */}
                            <span>{text ? Number(text).toLocaleString() : "0"} </span>
                            {/* {console.log('record', record)} */}
                        </>
                    )
                },
            },
            {
                title: 'จำนวนสินค้าคงเหลือ (QTY)',
                dataIndex: 'count_current_stock',
                key: 'count_current_stock',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            {/* <span>{text ? Number(text).toLocaleString() : "0"} {true ? <Button type="link" ><EditOutlined onClick={() => editBalance(record)} style={{ fontSize: 23, color: 'blue' }} /></Button> : null} </span> */}
                            <span>{text ? Number(text).toLocaleString() : "0"} </span>
                            {/* {console.log('record', record)} */}
                        </>
                    )
                },
            },
            {
                title: 'หมายเหตุ',
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                render: (text, record) => text?.reasons ?? "-",
            }
        ];



        setColumns(_column)
    }

    const displayData = (record, type) => {
        try {
            const getData = get(record, `ShopInventoryTransactionDoc`, null) ?? get(record, `ShopSalesTransactionDoc`, null) ?? get(record, `ShopProductsHoldWYZAuto`, null)
            let docType
            if (!!getData) {
                if (record?.ShopSalesTransactionDoc) docType = "shop-sale"
                else if (record?.ShopInventoryTransactionDoc) docType = "shop-inventory"
                else docType = "wyz-auto"
            }

            switch (type) {
                case "customer_name":
                    if (!!getData && !!docType) {
                        if (docType === "shop-sale") return (getData?.ShopBusinessCustomer) ? getData?.ShopBusinessCustomer?.[type] ?? "-" : getData?.ShopPersonalCustomer?.[type] ?? "-"
                        else if (docType === "shop-inventory") return (getData?.ShopBusinessPartner) ? getData?.ShopBusinessPartner?.partner_name ?? "-" : "-"
                        else return "-"
                    }

                case "code_id":
                    return (!!getData) ? getData?.code_id : "-"
                case "purchase_unit_id":
                    if (!!productPurchaseUnitTypes) {
                        const find = productPurchaseUnitTypes.find(where => where?.id === record?.[type])
                        return (!!find && !isEmpty(find)) ? find?.type_name[locale.locale] ?? "-" : "-"
                    }
                case "warehouse_id":
                    if (!!shopWarehouse && isArray(shopWarehouse) && shopWarehouse.length > 0) {
                        const find = shopWarehouse.find(where => where?.id === record?.[type])
                        return (!!find && !isEmpty(find)) ? find?.name[locale.locale] ?? "-" : "-"
                    } else {
                        return "-"
                    }
                case "shelf":
                    if (!!shopWarehouse && isArray(shopWarehouse) && shopWarehouse.length > 0) {
                        const find = shopWarehouse.find(where => where?.id === record?.warehouse_id)
                        if (!!find && !isEmpty(find)) {
                            return find?.[type].map(e => { if (e?.code === record?.warehouse_item_id) return e }).filter(where => where !== undefined)[0]?.name[locale.locale] ?? "-"
                        }
                        // return () ? find?.name[locale.locale] ?? "-" : "-"
                    } else {
                        return "-"
                    }


                default: return "-"
            }
        } catch (error) {

        }

    }

    /* แก้ไข จำนวนสินค้าคงเหลือ */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })

    /* ค้นหา */
    // const getDataSearch = async ({ _search = "", _limit = limit, _page = 1, _sort = "balance_date", _order = sortOrder !== "descend" ? "desc" : "asc", _which = (status === "management") ? "michelin data" : "my data" }) => {
    const getDataSearch = async ({ search = modelSearch.search ?? "", filter_balance = modelSearch.filter_balance ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), product_group_id = modelSearch.product_group_id ?? "", product_type_id = modelSearch.product_type_id ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "", start_date = modelSearch.select_date[0] ?? "", end_date = modelSearch.select_date[1] ?? "", complete_size_id = modelSearch.complete_size_id ?? "",warehouse_id = modelSearch.warehouse_id ?? "" ,warehouse_item_id = modelSearch.warehouse_item_id ?? "" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(
              `/shopReports/inventoryMovements/v2?limit=${limit}&page=${page}${
                !!product_group_id
                  ? `&product_group_id=${product_group_id}`
                  : ""
              }${
                !!product_type_id ? `&product_type_id=${product_type_id}` : ""
              }${
                !!product_brand_id
                  ? `&product_brand_id=${product_brand_id}`
                  : ""
              }${
                !!product_model_id
                  ? `&product_model_id=${product_model_id}`
                  : ""
              }${
                !!complete_size_id
                  ? `&complete_size_id=${complete_size_id}`
                  : ""
              }${
                !!warehouse_id
                  ? `&warehouse_id=${warehouse_id}`
                  : ""
              }${
                !!warehouse_item_id
                  ? `&warehouse_item_id=${warehouse_item_id}`
                  : ""
              }${
                start_date
                  ? `&start_date=${moment(start_date).format("YYYY-MM-DD")}`
                  : ""
              }${
                end_date
                  ? `&end_date=${moment(end_date).format("YYYY-MM-DD")}`
                  : ""
              }`
            );
            // const resShopStock = await API.get(`/shopStock/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&status=active&min_balance=0&max_balance=0${!!type_group_id ? `&type_group_id=${type_group_id}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)

                // const newData = data.filter(where => where.balance != 0)
                // const newData = data
                setListSearchDataTable(() => data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })

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
        setIsModalExportVisible(true)
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
            setLoadingExport(true)
            const { product_group_id, product_type_id, product_brand_id, product_model_id, filter_balance } = modelSearch
            const res = await API.get(`/shopStock/report/allStock?dot=${isIncludeDot === true ? 1 : 0}&filter_available_balance=${isIncludeZero === true ? 1 : 0}&min_balance=${filter_balance[0]}&max_balance=${filter_balance[1]}&export_format=xlsx&search=${modelSearch.search ?? ""}${!!product_group_id ? `&product_group_id=${product_group_id ?? ""}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id ?? ""}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id ?? ""}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id ?? ""}` : ""}`)
            // const res = await API.get(`/shopStock/report/allStock?dot=${isIncludeDot === true ? 1 : 0}&filter_available_balance=${isIncludeZero === true ? 1 : 0}&export_format=xlsx&search=${modelSearch.search ?? ""}`)

            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`), setIsIncludeDot((prevValue) => false), setIsIncludeZero((prevValue) => false)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }
    const onFinishExportFailed = async () => {
        setLoadingExport(false)
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
            order: "ascend",
            hide_manage: true,
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
            product_group_id: null,
            product_type_id: null,
            product_brand_id: null,
            product_model_id: null,
            complete_size_id: null,
            warehouse_id : null,
            warehouse_item_id : null,
            select_date: [],
        }
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            filter_balance: modelSearch.filter_balance,
            start_date: null,
            end_date: null,
            // filter_available_balance: modelSearch.filter_available_balance,
        })
    }, [])

    useEffect(() => {
        if (permission_obj) setColumnsTable()
    }, [configTable.page, configSort.order, permission_obj, shopWarehouse, productPurchaseUnitTypes])


    const [filterProductTypes, setFilterProductTypes] = useState([])
    const [filterProductBrands, setFilterProductBrands] = useState([])
    const [filterProductModelTypes, setFilterProductModelTypes] = useState([])
    const [oldTypeGroupId, setOldTypeGroupId] = useState(null)
    const [oldBrandId, setOldBrandId] = useState(null)
    const [oldProductTypeId, setOldProductTypeId] = useState(null)
    const [oldWarehouseId, setOldWarehouseId] = useState(null)

    /** กดปุ่มค้นหา */
    const onFinishSearch = async (value) => {
        try {
            // console.log('value :>> ', value);

            const { product_group_id, product_type_id, product_brand_id, product_model_id, select_date, complete_size_id, warehouse_id, warehouse_item_id} = value

            if (product_group_id !== oldTypeGroupId) product_type_id = null, product_brand_id = null, product_model_id = null, complete_size_id = null
            if (warehouse_id !== oldWarehouseId) warehouse_item_id = null
            const { data } = await API.get(`/shopProducts/filter/categories?${product_group_id ? `product_group_id=${product_group_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
            // console.log('data :>> ', data);

            if (isPlainObject(data) && !isEmpty(data)) {
                const { productGroupLists, productTypeLists, productBrandLists, productModelLists } = data
                if (productGroupLists?.length === 1) product_group_id = productGroupLists?.[0]?.id ?? null
                if (productTypeLists?.length === 1) product_type_id = productTypeLists?.[0]?.id ?? null
                if (productBrandLists?.length === 1) product_brand_id = productBrandLists?.[0]?.id ?? null
                if (productModelLists?.length === 1) product_model_id = productModelLists?.[0]?.id ?? null

                setFilterProductTypes(() => productTypeLists)
                setFilterProductBrands(() => productBrandLists)
                setFilterProductModelTypes(() => productModelLists)


                const searchModel = {
                    ...modelSearch,
                    search: value.search,
                    status: value.status == "undefined" ? modelSearch.status : "active",
                    // filter_balance: value.filter_balance,
                    product_group_id: product_group_id ?? null,
                    product_type_id: product_type_id ?? null,
                    product_brand_id: product_brand_id ?? null,
                    product_model_id: product_model_id ?? null,
                    complete_size_id,
                    warehouse_id,
                    warehouse_item_id,
                    select_date,
                }
                setModelSearch((previousValue) => searchModel);

                getDataSearch({
                    search: value.search,
                    page: init.configTable.page,
                    // filter_balance: value.filter_balance,
                    product_group_id: product_group_id ?? null,
                    product_type_id: product_type_id ?? null,
                    product_brand_id: product_brand_id ?? null,
                    product_model_id: product_model_id ?? null,
                    complete_size_id,
                    warehouse_id,
                    warehouse_item_id,
                    start_date: select_date[0] ?? null,
                    end_date: select_date[1] ?? null,
                });
                setOldWarehouseId(() => warehouse_id)
                setOldTypeGroupId(() => product_group_id)
            } else {
                onReset()
                Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
            }
        } catch (error) {

        }

    }

    const onClearFilterSearch = (type) => {
        try {
            const searchModel = {
                ...modelSearch
            }

            switch (type) {
                case "product_group_id":
                    searchModel[type] = null
                    searchModel.product_type_id = null
                    searchModel.product_brand_id = null
                    searchModel.product_model_id = null
                    searchModel.complete_size_id = null
                    break;
                case "product_type_id":
                    searchModel[type] = null
                    searchModel.product_brand_id = null
                    searchModel.product_model_id = null
                    searchModel.complete_size_id = null
                    break;
                case "product_brand_id":
                    searchModel[type] = null
                    searchModel.product_model_id = null
                    searchModel.complete_size_id = null
                    break;
                case "product_model_id":
                    searchModel[type] = null
                    searchModel.complete_size_id = null
                    break;
                case "complete_size_id":
                    searchModel[type] = null
                    break;
                case "warehouse_id":
                    searchModel[type] = null
                    searchModel.warehouse_item_id = null
                    break;
                case "warehouse_item_id":
                    searchModel[type] = null
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
                // filter_balance: init.modelSearch.filter_balance,
                product_group_id: init.modelSearch.product_group_id,
                product_type_id: init.modelSearch.product_type_id,
                product_brand_id: init.modelSearch.product_brand_id,
                product_model_id: init.modelSearch.product_model_id,
                complete_size_id: init.modelSearch.complete_size_id,
                warehouse_id: init.modelSearch.warehouse_id,
                warehouse_item_id: init.modelSearch.warehouse_item_id,
                select_date: init.modelSearch.select_date,
                order: (init.configSort.order === "descend" ? "desc" : "asc"),
            })
        } catch (error) {

        }

    }
    const getAllShopStock = async () => {
        try {
            const { data } = await API.get(`/shopStock/all?limit=999999&page=1&sort=balance_date&order=desc&status=active`)
            // console.log('data getAllShopStock :>> ', data);
            return data.status === "success" ? data.data.data ?? [] : []
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
            // {
            //     index: 1,
            //     type: "input",
            //     name: "search",
            //     label: "ค้นหา",
            //     placeholder: "ค้นหา",
            //     list: null,
            // },
            {
                index: 1,
                type: "select",
                name: "warehouse_id",
                label: "เลือกคลัง",
                placeholder: "เลือกคลัง",
                allowClear: true,
                showSearch: true,
                list: isArray(shopWarehouse) && shopWarehouse?.length > 0 ? shopWarehouse.map(e => ({
                    key: e?.name[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
            },
            {
                index: 1,
                type: "select",
                name: "warehouse_item_id",
                label: "เลือกชั้นวาง",
                placeholder: "เลือกชั้นวาง",
                allowClear: true,
                showSearch: true,
                list: isArray(shopWarehouse) && shopWarehouse?.length > 0 && !!oldWarehouseId ? shopWarehouse.filter(where => where?.id === oldWarehouseId)?.[0]?.shelf.map(v => ({
                    key: v?.name[locale.locale],
                    value: v?.code
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
            },
            {
                index: 1,
                type: "select",
                name: "product_group_id",
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
            // {
            //     index: 1,
            //     type: "silder",
            //     name: "filter_balance",
            //     label: `เลือกการแสดงผลของสต๊อค (เริ่มต้น : ${modelSearch?.filter_balance[0]} - สิ้นสุด : ${modelSearch?.filter_balance[1]})`,
            //     placeholder: "เลือกการแสดงผลของสต๊อค",
            //     minMaxValue: { min: 0, max: maximunBalance ?? 0 },
            //     defaultValue: [0, maximunBalance ?? 0],
            // },
            {
                index: 1,
                type: "select",
                name: "complete_size_id",
                label: `เลือกขนาดสินค้า`,
                placeholder: "เลือกขนาดสินค้า",
                allowClear: true,
                showSearch: true,
                // minMaxValue: { min: 0, max: maximunBalance ?? 0 },
                // defaultValue: [0, maximunBalance ?? 0],
                list: isArray(productCompleteSize) && productCompleteSize?.length > 0 && oldTypeGroupId === "da791822-401c-471b-9b62-038c671404ab" ? productCompleteSize.map(e => ({
                    key: e?.complete_size_name?.[`${locale.locale}`],
                    value: e?.id
                })) : [{
                    key: "ไม่พบข้อมูล",
                    value: ""
                }],
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

        ],
        col: 8,
        // sliderCol: { input: 2, slider: 4 },
        button: {
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        downloadTemplate,
        importExcel,
        exportExcel,
        onClearFilterSearch
    }

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [formModal] = Form.useForm();



    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })

            if (id) {

                setIsIdEdit(id)
                const { data } = await API.get(`/shopStock/byid/${id}`)

                // console.log('data', data.data)
                // if (data.status == "success" && isArray(data.data) && data.data.length > 0) {
                if (data.status == "success" && data.data.length > 0 && isArray(data.data)) {
                    const initData = {
                        product_list: []
                    }
                    const productId_list = []
                    productId_list.push(data.data[0].ShopProduct)
                    const newWarehouse_detail = data.data[0].warehouse_detail.filter(where => where.shelf.balance != 0)

                    initData.product_list.push({
                        product_id: data.data[0].ShopProduct.id, product_name: null, amount_all: data.data[0].balance, total_price: null,
                        warehouse_detail: newWarehouse_detail.map((e, index) => {
                            return { warehouse: e.warehouse, shelf: e.shelf.item, dot_mfd: e.shelf.dot_mfd, amount: e.shelf.balance, purchase_unit_id: e.shelf.purchase_unit_id }
                        }),
                        ProductTypeGroupId: data.data[0].ShopProduct.Product.ProductType.type_group_id,
                        productId_list: productId_list,
                        unit_list: await getproductPurchaseUnitTypesDataListAll()
                    })
                    formModal.setFieldsValue(initData)
                }
            }
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



    const getMasterData = async () => {
        try {

            const shopWarehouseList = await getShopWarehouse()
            setShopWarehouse(prev => shopWarehouseList)

        } catch (error) {

        }
    }


    const getproductPurchaseUnitTypesDataListAll = async () => {
        const { data } = await API.get(`/master/productPurchaseUnitTypes/all?sort=code_id&order=asc&status=active`)
        // console.log('data.data getproductPurchaseUnitTypesDataListAll', data.data)
        return data.status === "success" ? data.data ?? [] : []
    }


    const getShopWarehouse = async () => {
        const { data } = await API.get(`/shopWarehouses/all?limit=9999999&page=1&sort=code_id&order=desc`)
        // console.log('data getShopWarehouse', data.data.data)
        return data.status === "success" ? isArray(data?.data?.data) ? data?.data?.data : [] : []
    }


    /**
     * ควบคุมการเปิด ปิด modal การเคลื่อนไหวสินค้า
     */
    const [visibleMovementModal, setVisibleMovementModal] = useState(false)
    const [fliterEachMovement, setFliterEachMovement] = useState({})

    const visibleEachWarehouseMovementModal = (index1, index2) => {
        try {
            const { product_list } = formModal.getFieldValue()
            setVisibleMovementModal(prevValue => true)
            setFliterEachMovement(prevValue => product_list[index1]?.warehouse_detail[index2])

        } catch (error) {

        }
    }

    /**
 * ควบคุมการ เปิด ปิด modal แสดงข้อมูลเอกสาร
 */
    const [visibleViewDocument, setVisibleViewDocument] = useState(false)
    const [viewDocumentData, setViewDocumentData] = useState({})

    const controlOpenViewDocument = (visibleStatus, record) => {
        try {
            setVisibleViewDocument(() => visibleStatus)
            setViewDocumentData(record)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const handleCancelViewDocument = () => {
        setVisibleViewDocument(prevValue => prevValue = false)
    }
    if (loadingPage) {
        return (
            <CarPreloader />
        );
    } else {
        return (

            <>
                <>
                    <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} value={modelSearch} />
                    <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} />
                </>


                <>
                    {/* Export Modal */}
                    <Modal
                        form={formExport}
                        maskClosable={false}
                        title={`Export`}
                        visible={isModalExportVisible}
                        onOk={handleExportOk}
                        onCancel={handleExportCancel}
                        footer={[
                            <Button key="back" onClick={handleExportCancel} loading={loadingExport}>
                                ยกเลิก
                            </Button>,
                            <Button key="submit" type="primary" onClick={handleExportOk} icon={<ExportOutlined />} loading={loadingExport}>
                                Export
                            </Button>,
                        ]}
                    >
                        <Form
                            form={formExport}
                            labelCol={{ span: 7 }}
                            wrapperCol={{ span: 18 }}
                            onFinish={onFinishExport}
                            onFinishFailed={onFinishExportFailed}
                        >
                            <Form.Item labelCol={{ md: { span: 12 }, sm: { span: 24 } }} wrapperCol={{ md: { span: 12 }, sm: { span: 24 } }} label={`เลือการระบุ DOT`}  >
                                <Switch checkedChildren={`ระบุ DOT`} checked={isIncludeDot} unCheckedChildren={`ไม่ระบุ DOT`} onChange={(value) => setIsIncludeDot((prevValue) => value)} />
                            </Form.Item>
                            <Form.Item labelCol={{ md: { span: 12 }, sm: { span: 24 } }} wrapperCol={{ md: { span: 12 }, sm: { span: 24 } }} label={`เลือกการโชว์ข้อมูลที่เป็น 0`}  >
                                <Switch checkedChildren={`ไม่โชว์ข้อมูลที่เป็น 0`} checked={isIncludeZero} unCheckedChildren={`โชว์ข้อมูลที่เป็น 0`} onChange={(value) => setIsIncludeZero((prevValue) => value)} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </>

                {/* --------------------------------------------------------------------------------------------------------------------------------------------------------- */}

                <ModalViewDocument mode={"view"} visibleViewDocument={visibleViewDocument} handleCancelViewDocument={handleCancelViewDocument} viewDocumentData={viewDocumentData} loading={loading} setLoading={setLoading} pageName={"ProductMovement"} />
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


}

export default ReportProductMovement
