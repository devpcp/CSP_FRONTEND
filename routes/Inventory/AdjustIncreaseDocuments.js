import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, InputNumber, Modal, Form, Upload, DatePicker, TimePicker, Select, Radio, Switch, Space, AutoComplete, Popconfirm } from 'antd';
import { ReloadOutlined, UploadOutlined, EditOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import _, { debounce, isArray, isPlainObject, isFunction, get, isEmpty } from 'lodash'
import TitlePage from '../../components/shares/TitlePage';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../util/GetIntlMessages';
import { FormInputLanguage, FormSelectLanguage } from '../../components/shares/FormLanguage';
import { NoRoundingNumber, RoundingNumber } from '../../components/shares/ConvertToCurrency';
import RegexMultiPattern from '../../components/shares/RegexMultiPattern';
import FormProvinceDistrictSubdistrict from '../../components/shares/FormProvinceDistrictSubdistrict';
import FormSelectDot from '../../components/Routes/Dot/Components.Select.Dot';
import Fieldset from '../../components/shares/Fieldset';
import Swal from "sweetalert2";
import ModalFullScreen from '../../components/shares/ModalFullScreen';
import CarPreloader from '../../components/_App/CarPreloader'


const { Search } = Input;
const cookies = new Cookies();

const ImportDocuments = ({ view_doc_id, select_shop_ids, title = null, }) => {
    const [loading, setLoading] = useState(false);
    const docTypeId = "40501ce1-c7f0-4f6a-96a0-7cd804a2f531" //ใบปรับลดปรับเพิ่ม
    const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" //-> หน่วยซื้อ -> รายการ
    const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" //-> หน่วยซื้อ -> เส้น
    const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" //-> หน่วยซื้อ -> ลูก
    const productTypeBattery = "5d82fef5-8267-4aea-a968-92a994071621" //-> Battery

    /* table */

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { authUser } = useSelector(({ auth }) => auth);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { documentTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [importDocList, setImportDocList] = useState([])
    const [loadingPage, setLoadingPage] = useState(false);

    useEffect(() => {
        initUseEffect()
    }, [])

    const initUseEffect = async () => {

        try {
            setLoading(() => true)
            const promise1 = getShelfData();
            const values = await Promise.all([promise1])

            setgetShelfDataAll(() => values[0])
            await getMasterData()
            setLoading(() => false)

        } catch (error) {

        }

    }


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

    const setColumnsTable = () => {
        const _column = [
            {
                title: GetIntlMessages("order"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 100,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: GetIntlMessages("เลขที่ใบปรับลด / ปรับเพิ่ม"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => _.get(text, 'code_id', "-")
            },
            {
                title: GetIntlMessages("วันที่"),
                dataIndex: '',
                key: '',
                width: 200,
                align: "center",
                render: (text, record) => moment(_.get(text, 'doc_date', "-")).format("DD/MM/YYYY")
            },
            {
                title: GetIntlMessages("เลขที่ใบรับสินค้าอ้างอิง"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                align: "center",
                render: (text, record) => {
                    const find = importDocList.find(where => where?.id === text?.References_import_doc)
                    if (isPlainObject(find) && !isEmpty(find)) return find?.code_id
                    else return "-"
                }
            },
            {
                title: GetIntlMessages("เอกสารอ้างอิง"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                align: "center",
                render: (text, record) => get(text, `References_doc`, "-") ?? "-"
            },
        ];

        setColumns(_column)
    }

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (page === 1) setLoading(true)

            const res = await API.get(`/shopInventoryTransaction/all?search=${search}&limit=${limit}&page=${page}&sort=created_date&order=${order}&status=default&doc_type_id=${docTypeId}${select_shop_ids ? `&select_shop_ids=${select_shop_ids}` : ""}`)

            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
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
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        FileReaderExcel(file.originFileObj)
                    }
                    return file;
                });
            }
        }

        setFileImportList(fileList);
        if (fileList.length > 0) setFileImport(fileList[0]);
        else {
            setFileImport(null);
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


    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })
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
        },
        configSort: {
            sort: "created_date",
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "default",
        }
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    useEffect(() => {
        if (view_doc_id) {
            setModelSearch({
                search: view_doc_id,
            })
            getDataSearch({
                search: view_doc_id,
            })
        } else {
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,

            })
        }

    }, [view_doc_id])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()
        // console.log(`permission_obj`, permission_obj)
    }, [configTable.page, configSort.order, permission_obj, importDocList])




    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default" })
        getDataSearch({ search: value.search, page: init.configTable.page })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch("init.modelSearch")

        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
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
                label: "ค้นหา",
                placeholder: "ค้นหา",
                list: null,
            },
        ],
        col: 8,
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
    }

    const [shopProductDataListAll, setShopProductDataListAll] = useState([]);
    const [getShelfDataAll, setgetShelfDataAll] = useState([]);
    const [ProductTypeGroup, setGetProductTypeGroup] = useState('');
    const [tireProductTypeGroupId, setTireProductTypeGroupId] = useState('da791822-401c-471b-9b62-038c671404ab')
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [formModal] = Form.useForm();

    const onCreate = async () => {
        setExpireEditTimeDisable(false)
        setCheckedDocStatus(() => true)
        const initData = {
            total_discount: null,
            total_price_all: null,
            vat: null,
            net_price: null,
            user_id: authUser?.id,
            product_list: [],
            doc_date: moment(new Date()),
            doc_create_date: moment(new Date()),
            approved_date: moment(new Date()),
        }

        const warehouseDetail = []

        for (let index = 1; index <= 1; index++) {
            {
                initData.product_list.push({ product_id: null, product_name: null, amount_all: null, price: null, unit: null, total_price: null, warehouse_detail: warehouseDetail, status: true })
            }
        }
        for (let index = 1; index <= 1; index++) {
            {
                warehouseDetail.push({ warehouse: null, shelf: null, dot_mfd: null, purchase_unit_id: null, amount: null, status: 2, new_data_status: false })
            }
        }

        formModal.setFieldsValue(initData)
        setIsModalVisible(true)
    }


    const [expireEditTimeDisable, setExpireEditTimeDisable] = useState(false)
    const [checkedDocStatus, setCheckedDocStatus] = useState(true)

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        // console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })

            const initData = {
                product_list: []
            }

            formModal.setFieldsValue(initData)
            // const formValue = formModal.getFieldsValue()

            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/shopInventoryTransaction/byid/${id}?${select_shop_ids ? `select_shop_ids=${select_shop_ids}` : ""}`)
                const dataDocInventoryId = await API.get(`/shopInventory/bydocinventoryid/${id}?${select_shop_ids ? `select_shop_ids=${select_shop_ids}` : ""}`)
                const { code_id, details, doc_date } = data.data
                const { product_list } = dataDocInventoryId.data.data
                setCheckedDocStatus(() => status === 2 ? true : false)
                product_list = product_list.map(e => {

                    return {
                        ...e,
                        price: RoundingNumber(e?.details?.price) ?? null,
                        // status: e?.status === 2 ? true : false,
                        remark_adjust: e?.details?.remark_adjust ?? null,
                        productId_list: [e.ShopProduct],
                        purchase_unit_list: e.ShopProduct.Product.ProductType.ProductPurchaseUnitTypes,
                        warehouse_detail: e?.warehouse_detail.map(v => {
                            // console.log('v :>> ', v);
                            return {
                                warehouse: v?.warehouse,
                                shelf: v?.shelf?.item,
                                dot_mfd: v?.shelf?.dot_mfd,
                                purchase_unit_id: v?.shelf?.purchase_unit_id,
                                current_amount: v?.shelf?.current_amount,
                                amount: v?.shelf?.amount ?? null,
                                balance: v?.shelf?.balance ?? null,
                                old_current_amount: v?.shelf?.old_current_amount ?? null,
                                status: v.status,
                                adjust_amount: v.status === 2 ? (Number(v?.shelf?.old_current_amount ?? 0) + Number(v?.shelf?.amount)) ?? null : (Number(v?.shelf?.old_current_amount) - Number(v?.shelf?.amount)) ?? null,
                                remark_adjust: v.details?.remark_adjust ?? null,
                            }
                        })
                    }
                })
                const model = {
                    ...data.data,
                    // purchase_order_number: code_id,
                    note: details?.note ?? null,
                    References_import_doc: details?.References_import_doc ?? null,
                    approver: details?.approver ?? null,
                    user_id: details?.user_id ?? null,
                    doc_date: moment(doc_date) ?? null,
                    doc_create_date: moment(details?.doc_create_date) ?? null,
                    approved_date: moment(details?.approved_date) ?? null,
                    product_list,
                }
                // console.log('model :>> ', model);
                formModal.setFieldsValue(model)
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
        setIsModalVisible(() => false)
        setCheckedDocStatus(() => true)
        setConfigModal({ ...configModal, mode: "add" })
        formModal.resetFields()
        // formIncomeProduct.resetFields()
    }

    const callBackFinish = async (res) => {
        try {
            if (res.data.status === "success") {
                message.success('บันทึกสำเร็จ');
                handleCancelModal()
                await getDataSearch({
                    page: configTable.page,
                    limit: configTable.limit,
                    search: modelSearch.search,
                })
            } else {
                message.error('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่');
            }
        } catch (error) {

        }
    }

    const onFinishAddEditViewModal = async (value) => {
        try {
            setLoadingPage(() => true)

            const _model = {
                details: {
                    References_import_doc: value.References_import_doc ?? null,
                    References_doc: value.References_doc ?? null,
                    doc_create_date: moment(value.doc_create_date).format("YYYY-MM-DD"),
                    approved_date: moment(value.approved_date).format("YYYY-MM-DD HH:mm"),
                    approver: value.approver ?? null,
                    user_id: value.user_id ?? null,
                    note: value.note ?? null
                },
                doc_type_id: docTypeId,
                doc_date: moment(value.doc_date).format("YYYY-MM-DD"),
            }

            const log = []
            function amountSummary(arr, type) {
                try {
                    const sum = arr.reduce((prevVal, currentVal, currentIndex) => Number(prevVal) + (!!currentVal?.[type] ? Number(currentVal?.[type]) ?? 0 : 0), 0)
                    return sum ?? 0
                } catch (error) {

                }
            }


            const { product_list } = value

            if (isArray(product_list) && product_list.length > 0) {
                product_list = product_list.map((e, index) => {
                    const eachCurrentAmountTotal = amountSummary(e?.warehouse_detail, "current_amount")
                    const eachAmountTotal = amountSummary(e?.warehouse_detail, "amount")
                    return {
                        ...e, details: { price: e?.price }, eachCurrentAmountTotal, eachAmountTotal, amount_all: eachAmountTotal, warehouse_detail: e?.warehouse_detail.map(v => {
                            const modelShelf = {
                                item: v.shelf ?? null,
                                dot_mfd: v.dot_mfd ?? null,
                                purchase_unit_id: v.purchase_unit_id ?? null,
                                amount: v?.amount ?? null,
                            }
                            if (!!value.References_import_doc) modelShelf.balance = v.balance

                            if (configModal.mode === "add") modelShelf.old_current_amount = v?.current_amount
                            else if (configModal.mode === "edit") modelShelf.old_current_amount = v?.old_current_amount
                            return {
                                warehouse: v.warehouse ?? null,
                                details: { remark_adjust: v.remark_adjust ?? null },
                                status: v.status,
                                shelf: modelShelf
                            }
                        }),
                        productId_list: e?.productId_list.filter(where => where?.product_id === e?.product_id)
                    }
                }).filter(where => where.warehouse_detail = where.warehouse_detail.filter((whereWarehouse, index) => {
                    if (whereWarehouse.warehouse !== null && whereWarehouse.shelf.item !== null && whereWarehouse.shelf.amount !== null) {
                        return whereWarehouse ?? {}
                    } else {
                        log.push(index)
                    }
                }))


            }
            console.log("model", _model)
            const totalCurrentAmount = amountSummary(product_list, "eachCurrentAmountTotal")
            const totalAmount = amountSummary(product_list, "eachAmountTotal")
            let res
            if (log.length === 0) {
                if (configModal.mode === "add") {
                    const { shop_id } = authUser?.UsersProfile;
                    _model.shop_id = shop_id;
                    _model.status = 2
                    _model.ShopInventory_Add = {
                        product_list,
                        import_date: moment(value?.doc_date).format("YYYY-MM-DD")
                    }

                    res = await API.post(`/shopInventoryTransaction/add`, _model)
                } else if (configModal.mode === "edit") {
                    _model.status = 2
                    // _model.ShopInventory_Put = {
                    //     product_list,
                    //     import_date: moment(value?.doc_date).format("YYYY-MM-DD")
                    // }
                    res = await API.put(`/shopInventoryTransaction/put/${idEdit}`, _model)
                }

                await callBackFinish(res)

            } else {
                Swal.fire({
                    title: GetIntlMessages("มีคลังสินค้าที่ยังกรอกข้อมูลไม่ครบถ้วน ยืนยันการบันทึกหรือไม่ !?"),
                    text: GetIntlMessages(`ท่านยังไม่ได้เลือกคลัง , ชั้นวาง หรือใส่จำนวน ในรายการคลังที่ ${log.map(e => e + 1).join(" , ")} หากท่านกด "ตกลง" รายการลำดับที่ ${log.map(e => e + 1).join(" , ")} จะไม่ถูกบันทีก !! `),
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages("submit"),
                    confirmButtonColor: mainColor,
                    cancelButtonText: GetIntlMessages("cancel"),
                }).then(async (result) => {
                    try {
                        if (result.isConfirmed) {
                            if (configModal.mode === "add") {
                                const { shop_id } = authUser?.UsersProfile;
                                _model.shop_id = shop_id;
                                _model.status = 2
                                _model.ShopInventory_Add = {
                                    product_list,
                                    import_date: moment(value?.doc_date).format("YYYY-MM-DD")
                                }

                                res = await API.post(`/shopInventoryTransaction/add`, _model)
                            } else if (configModal.mode === "edit") {
                                _model.status = 2
                                _model.ShopInventory_Put = {
                                    product_list,
                                    import_date: moment(value?.doc_date).format("YYYY-MM-DD")
                                }
                                res = await API.put(`/shopInventoryTransaction/put/${idEdit}`, _model)
                            }
                            await callBackFinish(res)
                        }
                    } catch (error) {
                        console.log('error', error)
                    }
                })
            }
        } catch (error) {
            console.log('error', error)
        }
        setLoadingPage(() => false)
    }

    const onFinishFailedAddEditViewModal = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        return data.data.data
    }


    const onChangeWarehouse = (index1, index2, value) => {
        const arr = getShelfDataAll.find(where => where.id == value)
        // console.log('arr', arr)
        const formValue = formModal.getFieldValue()
        formValue.product_list[index1].warehouse_detail[index2].getShelfDataAll = arr ? arr.shelf : [];
        formValue.product_list[index1].warehouse_detail[index2].shelf = null;
        formModal.setFieldsValue(formValue)
    }

    const getArrWarehouse = (index1, index2) => {
        const fomeValue = formModal.getFieldValue();
        const warehouse_detail = fomeValue.product_list[index1].warehouse_detail[index2];
        const arr = warehouse_detail ? warehouse_detail.getShelfDataAll : [];
        let newArr
        if (warehouse_detail) {
            // console.log('view',warehouse_detail.warehouse)
            newArr = getShelfDataAll.find(where => where.id == warehouse_detail.warehouse)
            // console.log('arr warehouse_detail.warehouse', newArr)
            arr = newArr ? newArr.shelf : []
        }
        return arr ?? []

    }

    const addWarehouse = (index, add) => {
        const formValue = formModal.getFieldValue();
        const warehouse_detail = formValue.product_list[index]

        if (warehouse_detail.warehouse_detail) {
            if (warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1]) {
                const warehouse = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].warehouse;
                const getShelfDataAll = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].getShelfDataAll;
                const defaultValue = { warehouse, getShelfDataAll, shelf: null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            } else {
                const defaultValue = { warehouse: null, shelf: null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            }
        } else {
            const defaultValue = { warehouse: null, shelf: null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
            add(defaultValue)
        }
    }

    const addNewProductList = (add) => {
        if (add && isFunction(add)) {
            const defaultValue = { product_id: null, amount_all: null, price: null, total_price: null, warehouse_detail: [], productId_list: [], status: true, }
            add(defaultValue)
        }
    }

    const getShopStockById = async (id) => {
        const { data } = await API.get(`shopStock/all?filter_wyz_code=false&product_id=${id}`)
        return data.data.data.length > 0 ? data.data.data[0] : []
    }

    // const [productTypeGroupId, setProductTypeGroupId] = useState([])

    const onChangeProductId = async (index, value) => {
        try {
            console.log("test", value)
            const { data } = await API.get(`/shopProducts/byid/${value}`);
            const { product_list } = formModal.getFieldValue()
            product_list[index].purchase_unit_list = data.data[0].Product.ProductType.ProductPurchaseUnitTypes
            product_list[index].unit = null
            product_list[index].warehouse_detail.map((e, index) => e.purchase_unit_id = null)
            console.log("product_list[index].warehouse_detail", product_list[index].warehouse_detail)
            if (product_list[index].product_id) {
                let product_stock = await getShopStockById(value)
                const _find = product_stock
                product_list[index]?.ProductTypeGroupId = get(_find, `ShopProduct.Product.ProductType.type_group_id`, null)
                product_list[index]?.warehouse_detail = isArray(_find?.warehouse_detail) ? _find?.warehouse_detail.map(e => {
                    return {
                        warehouse: e?.warehouse,
                        purchase_unit_id: e?.shelf?.purchase_unit_id,
                        shelf: e?.shelf?.item,
                        dot_mfd: e?.shelf?.dot_mfd,
                        current_amount: e?.shelf?.balance,
                        status: 2,
                        new_data_status: false
                    }
                }) ?? [] : []
                // let sort = product_list[index]?.warehouse_detail.sort((a, b) => b.current_amount - a.current_amount)
                // product_list[index]?.warehouse_detail = sort.slice(0, 15)
                formModal.setFieldsValue({ product_list });
            } else {
                null
            }
        } catch (error) {
            console.log('error', error)
        }

    }

    const handleSearchProduct = async (index, value) => {
        const { product_list } = formModal.getFieldValue()
        if (product_list && isArray(product_list)) {
            const { data } = await API.get(`/shopProducts/all?search=${value}&limit=20&page=1&sort=start_date&order=desc&status=active&filter_wyz_code=false&filter_available_balance=false&dropdown=true`);
            product_list[index].productId_list = data.status == "success" ? data.data.data : []
        }
        formModal.setFieldsValue({ product_list })
    }


    const getArrValue = (index, type) => {
        const { product_list } = formModal.getFieldValue()
        return isArray(product_list) ? product_list[index][type] ?? [] : []
    }

    const [userList, setUserList] = useState([])

    const getMasterData = async () => {
        try {
            const promise4 = await getShopImportDocList()
            const promise5 = await getUser()

            Promise.all([promise4, promise5]).then((values) => {
                setImportDocList(() => values[0])
                setUserList(() => values[1])

                if (isArray(values[1])) {
                    const new_data = [];

                    values[1].forEach(e => {
                        const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                        if (isPlainObject(authUser.UsersProfile)) {
                            const { shop_id } = authUser.UsersProfile;
                            if (fname && lname) {
                                new_data.push({
                                    id: e.id,
                                    name: `${fname} ${lname}`,
                                    groups: e.Groups
                                })
                            }
                        }

                    })

                    setUserList(() => new_data);
                }

            });


        } catch (error) {

        }
    }

    const getShopProduct = async (id) => {
        const { data } = await API.get(`/shopProducts/byid/${id}`)
        return data.status == "success" ? isArray(data.data) ? data.data[0] : null : null
    }

    const getShopImportDocList = async () => {
        // ad06eaab-6c5a-4649-aef8-767b745fab47 -> ใบนำเข้า
        const { data } = await API.get(`/shopInventoryTransaction/all?limit=999999&page=1&sort=doc_date&order=desc&status=1&doc_type_id=ad06eaab-6c5a-4649-aef8-767b745fab47`)
        return data.status === "success" ? data?.data?.data ?? [] : []
    }

    const getUser = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
            // console.log('data getUser', data)
            return data.status == "success" ? data.data.data : []
        } catch (error) {

        }

    }
    const onDeleteProductList = async (remove, field, index) => {
        const { product_list } = formModal.getFieldsValue()

        if (remove && isFunction(remove)) {
            remove(field.name)
            product_list.splice(index, 1)

            formModal.setFieldsValue({ product_list })
        }
    }

    const onChangeRefDoc = async (value) => {
        try {
            const { data } = await API.get(`/shopInventory/bydocinventoryid/${value}`)
            if (data.status === "success") {
                // console.log('data :>> ', data);

                const { product_list } = data?.data
                if (isArray(product_list) && product_list?.length > 0) {
                    product_list = product_list.map((e, index) => {
                        return {
                            productId_list: [
                                {
                                    ...e
                                }
                            ],
                            product_id: e?.product_id,
                            ProductTypeGroupId: get(e, `ShopProduct.Product.ProductType.type_group_id`, null),
                            price: !!e?.details?.price && e?.details?.price !== "null" ? RoundingNumber(e?.details?.price) : null,
                            warehouse_detail: e?.warehouse_detail.map(v => {
                                return {
                                    warehouse: v?.warehouse ?? null,
                                    shelf: v?.shelf?.item ?? null,
                                    purchase_unit_id: v?.shelf?.purchase_unit_id ?? null,
                                    dot_mfd: v?.shelf?.dot_mfd ?? null,
                                    balance: v?.shelf?.amount ?? null,
                                    current_amount: v?.shelf?.current_amount ?? null,
                                    status: 2,
                                    new_data_status: false,
                                }
                            })
                        }
                    })
                }
                formModal.setFieldsValue({ product_list })
            }

        } catch (error) {

        }
    }

    const onClearRefDoc = () => {
        try {
            formModal.setFieldsValue({ product_list: [] })
        } catch (error) {

        }
    }

    const addDecimal = (index, value) => {
        try {
            // console.log('value :>> ', value);
            const { product_list } = formModal.getFieldValue()
            product_list[index]?.price = RoundingNumber(value)
            formModal.setFieldsValue({ product_list })
        } catch (error) {

        }
    }
    const checkEachProductAmount = (index, i, value) => {
        try {
            // console.log('value :>> ', value);

            const { product_list, References_import_doc } = formModal.getFieldValue()

            const eachWarehouseDetail = product_list[index]?.warehouse_detail[i]
            // const status = product_list[index]?.status

            let sum
            if (eachWarehouseDetail.status === 2) {
                sum = (!!eachWarehouseDetail["current_amount"] ? Number(eachWarehouseDetail["current_amount"]) : 0) + (!!value ? Number(value) : 0)
            } else {
                sum = (!!eachWarehouseDetail["current_amount"] ? Number(eachWarehouseDetail["current_amount"]) : 0) - (!!value ? Number(value) : 0)
            }
            if (!!References_import_doc) {
                if (eachWarehouseDetail.status === 3 && Number(product_list[index]?.warehouse_detail[i]?.balance) < Number(value)) {
                    Swal.fire('จำนวนไม่ถูกต้อง !!', 'ท่านใส่จำนวนที่ต้องการลดมากว่า "จำนวนในใบนำเข้า"', 'warning')
                    product_list[index]?.warehouse_detail[i]?.amount = null
                    sum = null
                }
            } else {
                if (configModal.mode === "add") {
                    if (eachWarehouseDetail.status === 3 && Number(product_list[index]?.warehouse_detail[i]?.current_amount) < Number(value)) {
                        Swal.fire('จำนวนไม่ถูกต้อง !!', 'ท่านใส่จำนวนที่ต้องการลดมากว่า "จำนวนคงคลัง"', 'warning')
                        product_list[index]?.warehouse_detail[i]?.amount = null
                        sum = null
                    }
                } else {
                    if (eachWarehouseDetail.status === 3 && Number(product_list[index]?.warehouse_detail[i]?.old_current_amount) < Number(value)) {
                        Swal.fire('จำนวนไม่ถูกต้อง !!', 'ท่านใส่จำนวนที่ต้องการลดมากว่า "จำนวนคงคลังเก่า"', 'warning')
                        product_list[index]?.warehouse_detail[i]?.amount = null
                        sum = null
                    }
                }
            }

            product_list[index]?.warehouse_detail[i].adjust_amount = sum ?? null

            formModal.setFieldsValue({ product_list })
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const onChangeDocStatus = (bool) => {
        try {
            setCheckedDocStatus(() => bool)
            const { product_list } = formModal.getFieldValue()
            if (isArray(product_list) && product_list.length > 0) {
                product_list = product_list.map(e => {
                    return {
                        ...e,
                        warehouse_detail: e?.warehouse_detail.map(v => {
                            return {
                                ...v,
                                amount: null,
                                adjust_amount: null
                            }
                        }) ?? []
                    }
                })
            }
            formModal.setFieldsValue({ product_list })
        } catch (error) {

        }
    }
    const onChangeEachProductStatus = (val, index1, index2) => {
        try {
            const { product_list } = formModal.getFieldValue()

            if (isArray(product_list) && product_list.length > 0) {
                product_list[index1].warehouse_detail[i].status = val

                // product_list[index1] = product_list.filter((where, index) => index === index1).map(e => {
                //     return {
                //         ...e,
                //         warehouse_detail: e?.warehouse_detail.map(v => {
                //             return {
                //                 ...v,const add
                //                 status: bool,
                //                 amount: null,
                //                 adjust_amount: null
                //             }
                //         }) ?? []
                //     }
                // })[0]
            }
            formModal.setFieldsValue({ product_list })
        } catch (error) {

        }
    }

    const addTableWarehouse = (add, index) => {
        try {
            const { product_list } = formModal.getFieldValue()
            const purchase_unit_list = product_list[index].purchase_unit_list
            console.log("purchase_unit_list", purchase_unit_list)

            let purchase_unit_id = purchase_unit_list.find(x => x.type_name['th'] === "รายการ") !== undefined ? purchase_unit_list.find(x => x.type_name['th'] === "รายการ").id : purchase_unit_list[0].id
            if (isFunction(add) && configModal.mode !== "view") {
                add({ new_data_status: true, status: 2, purchase_unit_id: purchase_unit_id, })
            } else {
                add({})
            }
        } catch (error) {

        }
    }

    const removeWarehouseList = (remove, fieldName, index, i) => {
        try {
            if (isFunction(remove)) remove(fieldName)
        } catch (error) {

        }
    }

    const debounceOnSearch = debounce((index, value) => handleSearchProduct(index, value), 1000)
    const debounceEachProductPrice = debounce((index, value) => addDecimal(index, value), 1000)
    const debounceEachProductAmount = debounce((index, i, value) => checkEachProductAmount(index, i, value), 0)

    const IncomeProduct = ({ form }) => {

        return (
            <>

                {/* <div className="head-line-text" >{GetIntlMessages("ใบนำเข้า")} </div> */}
                <div className="detail-before-table">

                    <Row gutter={[10]} style={{ marginTop: "10px" }}>

                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }} hidden>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="purchase_order_number"
                                label={GetIntlMessages("เลขใบสั่งซื้อสินค้า")}
                            >
                                <Input placeholder="" disabled />
                            </Form.Item>
                        </Col>

                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="References_import_doc"
                                label={GetIntlMessages("เลขที่ใบรับสินค้าอ้างอิง")}
                            >
                                <Select
                                    placeholder="เลือกข้อมูล"
                                    optionFilterProp="children"
                                    //   disabled
                                    disabled={configModal.mode !== "add"}
                                    onChange={(value) => onChangeRefDoc(value)}
                                    allowClear
                                    onClear={() => onClearRefDoc()}
                                >
                                    {isArray(importDocList) && importDocList?.length > 0 ?
                                        importDocList.map((e, index) => (
                                            <Select.Option value={e.id} key={index}>
                                                {e?.code_id}
                                            </Select.Option>
                                        ))
                                        : []}
                                </Select>

                                {/* <Input placeholder="" disabled={configModal.mode == "view" || expireEditTimeDisable == true} /> */}
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="References_doc"
                                label={GetIntlMessages("เอกสารอ้างอิง")}
                            >
                                <Input disabled={configModal.mode !== "add"} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="doc_date"
                                label={GetIntlMessages("วันที่เอกสาร")}

                            >
                                <DatePicker disabled={configModal.mode !== "add"} format={'DD/MM/YYYY'} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} >
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="user_id"
                                label={GetIntlMessages("ผู้จัดทำเอกสาร")}

                            >
                                <Select
                                    placeholder="เลือกข้อมูล"
                                    // disabled={mode == "view" || expireEditTimeDisable == true}
                                    filterOption={(inputValue, option) =>
                                        option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                    }
                                    disabled
                                >
                                    {userList.map((e) => <Select.Option key={`user-${e.id}`} value={e.id}>{e.name}</Select.Option>)}
                                </Select>
                                {/* <DatePicker disabled={configModal.mode == "view" || expireEditTimeDisable == true} format={'YYYY-MM-DD'} style={{ width: "100%" }} /> */}
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} hidden>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="approver"
                                label={GetIntlMessages("ผู้อนุมัติ")}

                            >
                                <Input disabled={configModal.mode !== "add"} />
                                {/* <DatePicker disabled={configModal.mode == "view" || expireEditTimeDisable == true} format={'YYYY-MM-DD'} style={{ width: "100%" }} /> */}
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} hidden>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="approved_date"
                                label={GetIntlMessages("วันเวลาที่อนุมัติ")}

                            >
                                <DatePicker showTime={{ format: 'HH:mm' }} disabled={configModal.mode !== "add" || expireEditTimeDisable == true} format={'DD/MM/YYYY HH:mm'} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} hidden>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="doc_create_date"
                                label={GetIntlMessages("วันที่จัดทำเอกสาร")}

                            >
                                <DatePicker disabled={configModal.mode !== "add" || expireEditTimeDisable == true} format={'DD/MM/YYYY'} style={{ width: "100%" }} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} hidden>
                            <Form.Item
                                {...tailformItemLayout}
                                // validateTrigger={['onChange', 'onBlur']}
                                // name="doc_status"
                                label={GetIntlMessages("สถานะเอกสาร")}
                            >
                                <Switch checkedChildren={GetIntlMessages("ปรับเพิ่ม")} unCheckedChildren={GetIntlMessages("ปรับลด")} checked={checkedDocStatus} onChange={(bool) => onChangeDocStatus(bool)} disabled={configModal.mode !== "add"} />
                            </Form.Item>
                        </Col>

                    </Row>
                </div>
            </>
        )
    }


    const FormWarehouse = ({ name, index, onChangeWarehouse }) => {
        return (
            <Form.List name={name}>
                {(fields, { add, remove }) => (

                    <>
                        {configModal.mode !== "view" && isArray(formModal.getFieldValue().product_list) && formModal.getFieldValue().product_list.length > 0 && !!formModal.getFieldValue().product_list[index]?.product_id ?
                            <div className="pb-3" id="add-plus-outlined">
                                <div style={{ textAlign: "end" }}>
                                    <Button onClick={() => addTableWarehouse(add, index)} icon={<PlusOutlined />} disabled={configModal.mode !== "add"}>
                                        เพิ่มรายการ
                                    </Button>
                                </div>
                            </div>
                            : null}

                        <div id='data-table-adjust-doc'>
                            <div className='table-responsive'>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>{GetIntlMessages(`ลำดับ`)}</th>
                                            <th>{GetIntlMessages(`warehouses`)}</th>
                                            <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th>
                                            <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                            <th>{GetIntlMessages(`หน่วยซื้อ`)}</th>
                                            <th>{GetIntlMessages(`ปรับเพิ่ม / ปรับลด`)}</th>
                                            <th><span style={{ color: "red" }}>* </span>{GetIntlMessages(`เหตุผลการปรับ`)}</th>
                                            {formModal.getFieldValue()?.References_import_doc ? <th>{GetIntlMessages(`จำนวนในใบนำเข้า`)}</th> : null}
                                            {configModal.mode !== "add" ? <th>{GetIntlMessages(`จำนวนคงคลังเก่า`)}</th> : null}
                                            <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th>
                                            <th>{GetIntlMessages(`จำนวน`)}</th>
                                            <th>{GetIntlMessages(`จำนวนหลังการปรับ`)}</th>
                                            {/* {type != 4 ? <th>{GetIntlMessages(`ช่างซ่อม`)}</th> : null} */}
                                            {configModal.mode !== "view" ? <th>{GetIntlMessages(`manage`)}</th> : null}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            fields.length > 0 ?
                                                fields.map((field, i) => (
                                                    <tr key={`key-${i}`}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "warehouse"]}
                                                                fieldKey={[field.fieldKey, "warehouse"]}
                                                                noStyle
                                                            >
                                                                <Select
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={configModal.mode !== "add" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false}
                                                                    onChange={(value) => onChangeWarehouse(index, i, value)}
                                                                >

                                                                    {getShelfDataAll.map((e, index) => (
                                                                        <Select.Option value={e.id} key={index}>
                                                                            {e.name[locale.locale]}
                                                                        </Select.Option>

                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "shelf"]}
                                                                fieldKey={[field.fieldKey, "shelf"]}
                                                                noStyle
                                                            >
                                                                <Select
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={configModal.mode !== "add" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false}
                                                                >
                                                                    {getArrWarehouse(index, i).map(e => <Select.Option value={e.code}>{e.name[locale.locale]}</Select.Option>)}
                                                                </Select>

                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <FormSelectDot name={[field.name, "dot_mfd"]} fieldKey={[field.fieldKey, "dot_mfd"]} isNoStyle docTypeId={"40501ce1-c7f0-4f6a-96a0-7cd804a2f531"} importedComponentsLayouts={tailformItemLayout} disabled={configModal.mode !== "add" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false} form={formModal} index={index} field={field} />
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "purchase_unit_id"]}
                                                                fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                                                noStyle
                                                            >
                                                                <Select
                                                                    optionFilterProp="children"
                                                                    showSearch disabled={configModal.mode !== "add" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false} showArrow={false} placeholder={GetIntlMessages("เลือกข้อมูล")}>
                                                                    {formModal.getFieldValue().product_list[index].purchase_unit_list?.map((e, index) => (
                                                                        <Select.Option value={e.id} key={index}>
                                                                            {e?.type_name[locale.locale]}
                                                                        </Select.Option>

                                                                    ))}
                                                                </Select>
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "status"]}
                                                                fieldKey={[field.fieldKey, "status"]}
                                                                noStyle
                                                            >
                                                                <Radio.Group options={[
                                                                    {
                                                                        label: 'ปรับเพิ่ม',
                                                                        value: 2,
                                                                    },
                                                                    {
                                                                        label: 'ปรับลด',
                                                                        value: 3,
                                                                        disabled: formModal.getFieldValue().product_list[index].warehouse_detail[i].new_data_status === true
                                                                    },
                                                                ]}
                                                                    buttonStyle="solid"
                                                                    disabled={configModal.mode !== "add"}
                                                                    onChange={(val) => onChangeEachProductStatus(val, index, i)}
                                                                    value={formModal.getFieldValue()?.product_list[index]?.warehouse_detail[i]?.status}
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "remark_adjust"]}
                                                                fieldKey={[field.fieldKey, "remark_adjust"]}
                                                                noStyle
                                                                rules={[{ required: form.getFieldValue().amount !== null && form.getFieldValue().amount > 0, message: "กรุณากรอกข้อมูล" }]}
                                                            >
                                                                <AutoComplete
                                                                    options={[
                                                                        {
                                                                            value: 'ปรับปรุงผลต่างจากการนับสินค้า',
                                                                        },
                                                                        {
                                                                            value: ' ปรับปรุงสินค้าเสียหาย',
                                                                        },
                                                                        {
                                                                            value: 'ยอดยกมา',
                                                                        },
                                                                        {
                                                                            value: 'ค้างส่ง',
                                                                        },
                                                                        {
                                                                            value: 'อื่นๆ',
                                                                        },
                                                                    ]}
                                                                    showArrow
                                                                    filterOption={(input, option) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                    disabled={configModal.mode !== "add"}
                                                                    placeholder={GetIntlMessages("เลือกข้อมูลหรือเพิ่มข้อมูลใหม่")}
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        {formModal.getFieldValue()?.References_import_doc ? <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "balance"]}
                                                                fieldKey={[field.fieldKey, "balance"]}
                                                                noStyle
                                                            >
                                                                <Input disabled type="number" placeholder="จำนวน" />
                                                            </Form.Item>
                                                        </td> : null}
                                                        {configModal.mode !== "add" ? <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "old_current_amount"]}
                                                                fieldKey={[field.fieldKey, "old_current_amount"]}
                                                                noStyle
                                                            >
                                                                <Input disabled type="number" placeholder="จำนวน" />
                                                            </Form.Item>
                                                        </td> : null}

                                                        <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "current_amount"]}
                                                                fieldKey={[field.fieldKey, "current_amount"]}
                                                                noStyle
                                                            >
                                                                <Input disabled />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "amount"]}
                                                                fieldKey={[field.fieldKey, "amount"]}
                                                                noStyle
                                                            >
                                                                <Input type={`number`} disabled={configModal.mode !== "add"} min={0} placeholder="จำนวน" onChange={(value) => debounceEachProductAmount(index, i, value.target.value)} />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "adjust_amount"]}
                                                                fieldKey={[field.fieldKey, "adjust_amount"]}
                                                                noStyle
                                                            >
                                                                <Input disabled />
                                                            </Form.Item>
                                                        </td>


                                                        {configModal.mode !== "view" ?
                                                            <td style={{ textAlign: "center" }}>
                                                                <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removeWarehouseList(remove, field.name, index, i)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
                                                                    {formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === true ?
                                                                        <Button icon={<MinusCircleOutlined />}>
                                                                            ลบรายการ
                                                                        </Button>
                                                                        : null}
                                                                </Popconfirm>
                                                            </td>
                                                            : null}
                                                    </tr>
                                                )) :
                                                <tr>
                                                    <td colSpan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                                                </tr>
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </Form.List>
        )
    }


    return (
        <>
            <>
                <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={onCreate} value={modelSearch} title={title !== null ? false : true} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} />
                {/* Import Modal */}
                <Modal
                    form={form}
                    maskClosable={false}
                    title={`Import`}
                    visible={isModalImportVisible}
                    onOk={handleImportOk}
                    onCancel={handleImportCancel}
                    footer={[
                        <Button key="back" onClick={handleImportCancel} loading={loadingUpload}>
                            ยกเลิก
                        </Button>,
                        <Button key="submit" type="primary" loading={loading && loadingUpload} onClick={handleImportOk}>
                            ตกลง
                        </Button>,
                    ]}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 18 }}
                        layout="horizontal"
                        initialValues={{
                            TransDate: moment(new Date(), 'YYYYMMDD'),
                            TransTime: moment(new Date()),
                            RDFileCode: "A"
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="RDBusinessRegNo"
                            label="RDBusinessRegNo"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="RDFileCode"
                            label="RDFileCode"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="TransDate"
                            label="TransDate"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <DatePicker format={'YYYYMMDD'} width={"100%"} />
                        </Form.Item>

                        <Form.Item
                            name="TransTime"
                            label="TransTime"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <TimePicker format={'HHmmss'} width={"100%"} />
                        </Form.Item>

                        <Form.Item label="Import Excel"  >
                            <Upload
                                onChange={handleImportChange}
                                action={`${process.env.NEXT_PUBLIC_APIURL}/post`}
                                fileList={fileImportList}
                                multiple={false}
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            >
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Modal>
            </>


            {/* add */}
            <ModalFullScreen
                maskClosable={false}
                title={`${configModal.mode === "view" ? "ดูข้อมูล" : configModal.mode === "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ใบปรับลดปรับเพิ่มสินค้า`}
                visible={isModalVisible}
                onOk={handleOkModal}
                onCancel={handleCancelModal}
                // okButtonProps={{ disabled: configModal.mode == "view" || expireEditTimeDisable == true }}
                hideSubmitButton={configModal.mode !== "add"}
                mode={configModal.mode}
                CustomsButton={() => {
                    return (
                        <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
                            <Row gutter={[10, 10]} justify="end" style={{ width: "100%" }}>
                                <Col xxl={{ span: 4, offset: 8 }} lg={6} md={12} xs={24} >
                                    <Button loading={loading} style={{ width: "100%" }} onClick={() => handleCancelModal()}>{configModal.mode !== "add" ? GetIntlMessages("ปิด") : GetIntlMessages("ปิด")}</Button>
                                </Col>
                                <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view"} >
                                    <Button loading={loading || loadingPage} onClick={() => handleOkModal()} style={{ width: "100%" }} type='primary'>{GetIntlMessages("บันทึก")}</Button>
                                </Col>
                            </Row>
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
                    <IncomeProduct form={formModal} />

                    <div className="head-line-text pt-3">{GetIntlMessages("คลังสินค้า")}</div>
                    <div className="detail-before-table">
                        <Form.Item
                            labelCol={24}
                            wrapperCol={24}
                            // label=""
                            name="product_list"
                            style={{ display: 'flex', justifyContent: 'center' }}
                        >
                            <Form.List name="product_list" >
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <div
                                                required={false}
                                                key={field.key}
                                            >
                                                <Fieldset legend={`รายการที่ ${index + 1}`}>

                                                    <Row >
                                                        <Col lg={{ span: 8, offset: 4 }} md={12} xs={24} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "product_id"]}
                                                                fieldKey={[field.fieldKey, "product_id"]}
                                                                label={GetIntlMessages("รหัสสินค้า")}
                                                            >
                                                                <Select
                                                                    showSearch
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={configModal.mode !== "add" || expireEditTimeDisable == true || !!formModal.getFieldValue()?.References_import_doc}
                                                                    onChange={(value) => onChangeProductId(index, value)}
                                                                    onSearch={(value) => debounceOnSearch(index, value)}
                                                                    filterOption={false}
                                                                    notFoundContent={null}
                                                                >
                                                                    {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e?.id} key={i}>{get(e, `Product.master_path_code_id`, "-")}</Select.Option>)}
                                                                    {/* {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e.id} key={i}>{get(e, `Product.master_path_code_id`, "-")}</Select.Option>)} */}
                                                                </Select>

                                                            </Form.Item>
                                                        </Col>

                                                        <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "product_id"]}
                                                                fieldKey={[field.fieldKey, "product_id"]}
                                                                label={GetIntlMessages("product-name")}

                                                            >
                                                                <Select
                                                                    showSearch
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={configModal.mode !== "add" || expireEditTimeDisable == true || !!formModal.getFieldValue()?.References_import_doc}
                                                                    onChange={(value) => onChangeProductId(index, value)}
                                                                    onSearch={(value) => debounceOnSearch(index, value)}
                                                                    // onSearch={(value) => handleSearchProduct(index, value)}
                                                                    filterOption={false}
                                                                    notFoundContent={null}
                                                                // filterOption={(input, option) =>
                                                                //     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                // }
                                                                >

                                                                    {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e?.id} key={i}>{get(e, `Product.product_name.${[locale.locale]}`, "-")}</Select.Option>)}
                                                                </Select>
                                                            </Form.Item>
                                                        </Col>

                                                        {/* <Col span={8} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "amount_all"]}
                                                                fieldKey={[field.fieldKey, "amount_all"]}
                                                                label={GetIntlMessages("จำนวนทั้งหมด")}
                                                            >
                                                                <Input type="number" placeholder="1000" onChange={(value) => calculateNetPrice(index, value)} disabled={configModal.mode == "view" || expireEditTimeDisable == true} />
                                                            </Form.Item>
                                                        </Col> */}
                                                        <Col span={8} style={{ width: "100%" }} hidden>

                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "price"]}
                                                                fieldKey={[field.fieldKey, "price"]}
                                                                label={GetIntlMessages("ราคา/หน่วย")}
                                                                rules={[RegexMultiPattern("4", GetIntlMessages("only-number"))]}
                                                                disabled={configModal.mode !== "add"}
                                                            >
                                                                <InputNumber stringMode min={0} precision={2} onBlur={(value) => addDecimal(index, value.target.value)} placeholder="1000" disabled={configModal.mode !== "add" || expireEditTimeDisable == true} addonAfter="บาท" />

                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={24} style={{ width: "100%" }}>
                                                            <FormWarehouse name={[field.name, "warehouse_detail"]} index={index} onChangeWarehouse={onChangeWarehouse} />
                                                        </Col>
                                                        {fields.length > 1 && configModal.mode !== "view" && expireEditTimeDisable !== true && !formModal.getFieldValue()?.References_import_doc ?
                                                            <Col span={24} style={{ display: "flex", justifyContent: "end", paddingTop: "10px" }}>
                                                                <Form.Item >
                                                                    <Button
                                                                        style={{ display: "flex", alignItems: "center", }}
                                                                        type="dashed"
                                                                        onClick={() => onDeleteProductList(remove, field, index)}
                                                                        block
                                                                        icon={<MinusCircleOutlined />}
                                                                    >
                                                                        {GetIntlMessages(`ลบรายการที่ ${index + 1}`)}
                                                                    </Button>
                                                                </Form.Item>
                                                            </Col>
                                                            : null
                                                        }
                                                    </Row>
                                                </Fieldset>
                                            </div>
                                        ))}
                                        <Form.Item>
                                            {configModal.mode !== "view" && expireEditTimeDisable !== true && !formModal.getFieldValue()?.References_import_doc ?
                                                <Col span={24} style={{ display: "flex", justifyContent: "end", }}>
                                                    <Form.Item >
                                                        <Button
                                                            style={{ display: "flex", alignItems: "center", }}
                                                            type="dashed"
                                                            onClick={() => addNewProductList(add)}
                                                            // onClick={() => add(addWarehouse)}
                                                            disabled={configModal.mode !== "add"}
                                                            block
                                                            icon={<PlusOutlined />}
                                                        >
                                                            {GetIntlMessages("เพิ่มรายการสินค้า")}
                                                            {/* {GetIntlMessages("add-data")} */}
                                                        </Button>
                                                    </Form.Item>
                                                </Col> : null
                                            }
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>
                    </div>

                    <Fieldset legend={GetIntlMessages("สรุปรายการ")}>
                        <Row>
                            <Col span={12}>
                                <Form.Item
                                    name="note"
                                    label="หมายเหตุ"
                                    rules={[{ required: true }]}
                                >
                                    <Input.TextArea disabled={configModal.mode === "view"} rows={9} />
                                </Form.Item>
                            </Col>
                            <Col span={10} />
                            <Col span={6}>
                            </Col>
                        </Row>

                    </Fieldset>
                </Form>
            </ModalFullScreen >


            <style global>{`
                    .ant-select-show-search.ant-select:not(.ant-select-customize-input)
                    .ant-select-selector {
                        height: auto;
                    }
                    .ant-select-single.ant-select-show-arrow .ant-select-selection-item {
                        white-space: normal;
                        word-break: break-all;
                    }
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

export default ImportDocuments
