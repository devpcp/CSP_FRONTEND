import { useEffect, useState } from 'react'
import { Button, message, Input, Modal, Form, Upload, DatePicker, TimePicker, Row, Col, Typography, Dropdown, Menu } from 'antd';
import { UploadOutlined, DownOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import _, { isArray, get, isString, isFunction, isEqual } from 'lodash'
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../util/GetIntlMessages';
import Swal from "sweetalert2";
import ModalFullScreen from '../../components/shares/ModalFullScreen';
import PrintOut from "../../components/shares/PrintOut";
import ImportDocAddEditViewModal from '../../components/Routes/ImportDocumentModal/ImportDocAddEditViewModal';
import { RoundingNumber, } from '../../components/shares/ConvertToCurrency';
import PaymentDocs from '../../components/Routes/ImportDocumentModal/Components.Routes.Modal.PaymentDocsV2'

const { Search } = Input;
const cookies = new Cookies();
const { Text, Link } = Typography;

const ImportDocuments = ({ view_doc_id, select_shop_ids, title = null, callBack, docTypeId = "054fada4-1025-4d0a-bdff-53cb6091c406" }) => {
    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);
    /* table */
    // const [search, setSearch] = useState("")
    // const [page, setPage] = useState(1)
    // const [total, setTotal] = useState(0)
    // const [limit, setLimit] = useState(10)
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { authUser } = useSelector(({ auth }) => auth);
    const { locale, mainColor } = useSelector(({ settings }) => settings);

    const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }


    const setColumnsTable = () => {
        const _column = [
            {
                title: GetIntlMessages("order"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 100,
                use: true,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: GetIntlMessages("เลขที่ใบรับเข้าสินค้า"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => {
                    if (isFunction(callBack)) {
                        return (
                            <Link href="#" onClick={() => callBack(record)}>
                                {_.get(text, 'code_id', "-")}
                            </Link>
                        )
                    } else {
                        return (
                            <Text>{_.get(text, 'code_id', "-")}</Text>
                        )
                    }
                },
            },
            {
                title: GetIntlMessages("เลขที่เอกสารอ้างอิง"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => _.get(text, 'References_doc', "-")
            },
            {
                title: GetIntlMessages("วันที่"),
                dataIndex: '',
                key: 'doc_date',
                width: 130,
                align: "center",
                use: true,
                sorter: true,
                render: (text, record) => moment(_.get(text, 'doc_date', "-")).format("DD/MM/YYYY")
            },
            {
                title: GetIntlMessages("ชื่อผู้จำหน่าย"),
                dataIndex: 'ShopBusinessPartners',
                key: 'ShopBusinessPartners',
                width: 200,
                use: true,
                render: (text, record) => _.get(text, `partner_name[${locale.locale}]`, "-")
            },
            {
                title: GetIntlMessages("สำนักงาน"),
                dataIndex: 'ShopBusinessPartners',
                key: 'ShopBusinessPartners',
                width: 200,
                use: true,
                render: (text, record) => {
                    try {
                        switch (record.ShopBusinessPartners.other_details.branch) {
                            case "office":
                                return "สำนักงานใหญ่"
                            case "branch":
                                return `สาขา${record.ShopBusinessPartners.other_details.branch_code === record.ShopBusinessPartners.other_details.branch_name ? " " : ` ${record.ShopBusinessPartners.other_details.branch_code} `}${record.ShopBusinessPartners.other_details.branch_name}`
                            default:
                                return "-"
                        }
                    } catch (error) {
                        return "-"
                    }

                },
            },
            {
                title: GetIntlMessages("เลขที่ใบสั่งซื้อสินค้า"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => _.get(text, 'purchase_order_code_id', "-")
            },
            {
                title: GetIntlMessages("ราคารวม"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => {
                    if (text?.net_price) {
                        if (text?.net_price?.toLocaleString(undefined, twoDigits).search(",") !== -1) {
                            return (
                                <div style={{ textAlign: "end" }}>
                                    {_.get(text, 'net_price', "-").toLocaleString(undefined, twoDigits)}
                                </div>
                            )
                        } else {
                            if (text?.net_price === "NaN") {
                                return "-"
                            } else {
                                return (
                                    <div style={{ textAlign: "end" }}>
                                        {Number(_.get(text, 'net_price', "-")).toLocaleString(undefined, twoDigits)}
                                    </div>
                                )
                            }
                        }

                    } else {
                        return "-"
                    }
                }
            },
            {
                title: GetIntlMessages("จำนวน"),
                dataIndex: 'product_count',
                key: 'product_count',
                width: 100,
                align: "center",
                use: true,
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
                                <PaymentDocs fromTable={true} debtDocObj={record} docId={record?.id} title={`ชำระเงิน ใบรับสินค้า ${record?.code_id ?? ""}`} handleCancelModal={handleCancelModal} initForm={formModal} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
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
                        case 6:
                            return (
                                <span style={{ color: "#993333", fontSize: 16 }}>เจ้าหนี้การค้า</span>
                            )
                        default:
                            return (
                                <span> - </span>
                            )
                    }
                },
            },
            {
                title: () => GetIntlMessages("พิมพ์"),
                dataIndex: 'details',
                key: 'details',
                width: 120,
                align: "center",
                use: true,
                render: (text, record) => {
                    return (
                        <PrintOut textButton={"พิมพ์"} documentId={record?.id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }} docTypeId={docTypeId} />
                    )
                },
            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: 'cheque_number',
                key: 'cheque_number',
                width: 100,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record)}>เลือก</Button>
                ),
            },
        ];

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

    /* ค้นหา */
    // const getDataSearch = async ({ _search = "", _limit = limit, _page = 1, _sort = "balance_date", _order = sortOrder !== "descend" ? "desc" : "asc", _which = (status === "management") ? "michelin data" : "my data" }) => {
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, }) => {
        try {
            if (page === 1) setLoading(true)
            // const res = await API.get(`/webMax/GetStockBalance?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&which=${_which}`)
            // const res = await API.get(`/shopStock/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}`)
            const res = await API.get(`/shopInventoryTransaction/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&doc_type_id=${"ad06eaab-6c5a-4649-aef8-767b745fab47"}${select_shop_ids ? `&select_shop_ids=${select_shop_ids}` : ""}`)

            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;

                data.map((e) => {
                    e.isuse = e.status
                })
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setModelSearch({ search: search, status: _status.toString() })
                setColumnsTable()
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
                setLoading(true)
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
                    })
                    setLoading(false)
                } else {
                    setLoadingUpload(false)
                    setLoading(false)
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


    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
        modeKey: null,
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
            // order: "ascend",
            column: {
                created_by: false,
                created_date: true,
                updated_by: false,
                updated_date: true,
                status: true
            }
        },
        configSort: {
            sort: "created_date",
            order: "descend",
            // order: "ascend",
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
    }, [configTable.page, configSort.order, permission_obj])




    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({
            search: value.search,
            page: init.configTable.page,
            _status: value.status
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
            {
                index: 1,
                type: "select",
                name: "status",
                label: "เลือกสถานะ",
                placeholder: "เลือกสถานะ",
                list: [
                    {
                        key: "สถานะทั้งหมด",
                        value: "default",
                    },
                    {
                        key: "ใช้งานเอกสาร",
                        value: "1",
                    },
                    {
                        key: "ยกเลิกเอกสาร",
                        value: "0",
                    },
                ],
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

    // const [shopProductDataListAll, setShopProductDataListAll] = useState([]);
    // const [getShelfDataAll, setgetShelfDataAll] = useState([]);
    // const [ProductTypeGroup, setGetProductTypeGroup] = useState('');
    // const [tireProductTypeGroupId, setTireProductTypeGroupId] = useState('da791822-401c-471b-9b62-038c671404ab')
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    // const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [formModal] = Form.useForm();

    const onCreate = async () => {
        setExpireEditTimeDisable(false)
        const initData = {
            total_discount: 0,
            total_price_all: 0,
            total_price_all_after_discount: 0,
            vat: 0,
            net_price: 0,
            user_id: null,
            // tax_type: "8c73e506-31b5-44c7-a21b-3819bb712321", //รวม Vat
            tax_type: "fafa3667-55d8-49d1-b06c-759c6e9ab064", //ไม่รวม Vat
            product_list: [],
            doc_date: moment(new Date()),
            is_inv: true,
            tax_period: moment(new Date()),
        }

        const warehouseDetail = []

        for (let index = 1; index <= 1; index++) {
            {
                initData.product_list.push({
                    product_id: null,
                    product_name: null,
                    amount_all: null,
                    price: null,
                    unit: null,
                    total_price: null,
                    discount_percentage_1: null,
                    discount_percentage_2: null,
                    discount_3: null,
                    discount_3_type: "bath",
                    warehouse_detail: warehouseDetail,
                    changed_name_status: false,
                    changed_product_name: null
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

    const [expireEditTimeDisable, setExpireEditTimeDisable] = useState(false)

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        // console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })

            const initData = {
                product_list: [],
                product_list_check: []
            }

            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/shopInventoryTransaction/byid/${id}?${select_shop_ids ? `shop_id=${select_shop_ids}` : ""}${select_shop_ids ? `&select_shop_ids=${select_shop_ids}` : ""}`)
                const dataDocInventoryId = await API.get(`/shopInventory/bydocinventoryid/${id}?${modelSearch.status === "0" ? `status=0` : ""}${select_shop_ids ? `shop_id=${select_shop_ids}` : ""}${select_shop_ids ? `&select_shop_ids=${select_shop_ids}` : ""}`)
                const transactionInfo = data.data
                const availableEditTime = moment(transactionInfo.created_date).add(7, 'days')
                const expireEditTime = availableEditTime._d.getTime()
                // const expireEditTime = moment(availableEditTime._d).format("YYYY-MM-DD:HH:mm:ss")
                const currentDate = new Date().getTime()
                // const currentDate = moment(new Date()).format("YYYY-MM-DD:HH:mm:ss")
                if (currentDate > expireEditTime) {
                    if (mode == 'edit') {
                        setExpireEditTimeDisable(true)
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("ระยะเวลาแก้ไขเกินกำหนด หากต้องการแก้ไขจำนวนสินค้ากรุณาทำใบปรับเพิ่มปรับลด!!"),
                        });
                    }
                } else if (currentDate <= expireEditTime) {
                    setExpireEditTimeDisable(false)
                }

                // formValue.product_list[0].amount_all = data.data[0].balance

                // if (data.status == "success" && isArray(data.data) && data.data.length > 0) {
                const formValue = formModal.getFieldsValue()
                let { ShopBusinessPartners } = transactionInfo
                let purchase_order_list = {
                    id: transactionInfo.details.purchase_order_number,
                    code_id: transactionInfo.details.purchase_order_code_id,
                    partner_name: ShopBusinessPartners.partner_name[locale.locale],
                    partner_branch: ShopBusinessPartners.other_details.branch ? ShopBusinessPartners.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + ShopBusinessPartners.other_details.branch_code + " " + ShopBusinessPartners.other_details.branch_name + ")" : ""
                }
                if (data.status == "success") {
                    formValue.id = transactionInfo.id
                    formValue.code_id = transactionInfo.code_id
                    formValue.user_id = transactionInfo.id
                    formValue.bus_partner_id = transactionInfo.bus_partner_id
                    formValue.purchase_order_number = transactionInfo.details.purchase_order_number
                    formValue.purchase_order_number_list = [purchase_order_list]
                    formValue.credit_balance = transactionInfo.details.credit_balance
                    formValue.credit_balance = transactionInfo.details.credit_balance
                    formValue.tax_type = transactionInfo.details.tax_type
                    formValue.References_doc = transactionInfo.details.References_doc
                    formValue.total_price = transactionInfo.details.total_price
                    formValue.doc_date = moment(transactionInfo.doc_date)
                    formValue.tailgate_discount = RoundingNumber(transactionInfo.details.tailgate_discount)
                    formValue.tax_rate = transactionInfo.details.tax_rate
                    formValue.total_discount = transactionInfo.details.total_discount
                    formValue.total_price_all = (+transactionInfo.details.total_price_all).toLocaleString(undefined, twoDigits)
                    formValue.total_price_all_after_discount = transactionInfo.details?.total_price_all_after_discount ? (+transactionInfo.details?.total_price_all_after_discount).toLocaleString(undefined, twoDigits) ?? null : null
                    formValue.vat = (+transactionInfo.details.vat).toLocaleString(undefined, twoDigits)
                    formValue.net_price = (+transactionInfo.details.net_price).toLocaleString(undefined, twoDigits)
                    formValue.note = transactionInfo.details.note
                    formValue.user_id = transactionInfo.details.user_id ?? null
                    formValue.status = transactionInfo.status
                    formValue.is_inv = transactionInfo.details.is_inv ?? true
                    formValue.tax_period = moment(transactionInfo.details.tax_period) ?? null
                    formValue.debt_price_amount_left = transactionInfo.details.debt_price_amount_left ?? 0
                    formValue.payment_paid_status = transactionInfo.payment_paid_status
                    formValue.price_before_vat = (+transactionInfo.details.price_before_vat).toLocaleString(undefined, twoDigits),
                        formValue.shopBusinessPartnersList = [transactionInfo.ShopBusinessPartners]
                }

                if (dataDocInventoryId.data.status == "success") {
                    const _model = dataDocInventoryId.data.data
                    // console.log('_model', _model)
                    const productId_list = []

                    _model.product_list.forEach((e, index) => {
                        productId_list.push(e.ShopProduct)
                        const newArrProductId_list = productId_list.filter(where => where.id == e.product_id)

                        initData.product_list_check.push({
                            amount_all: +e.amount_all,
                            product_id: e.product_id,
                            details: {
                                ...e.details,
                                price_text: e.details.price_unit,
                                total_price_text: e.details.total_price,
                                price_discount_for_cal: (+e.details.price_discount_for_cal)
                            },
                            warehouse_detail: e.warehouse_detail.map((items, index) => {
                                return {
                                    warehouse: items.warehouse,
                                    shelf: {
                                        item: items.shelf.item,
                                        amount: items.shelf.amount,
                                        dot_mfd: !!items.shelf.dot_mfd ? items.shelf.dot_mfd : null,
                                        purchase_unit_id: items.shelf.purchase_unit_id
                                    },
                                }
                            }),
                        })

                        console.log("ee", e.details.is_uom)
                        let unit_list = newArrProductId_list[0].Product.ProductType.ProductPurchaseUnitTypes ?? []
                        if (e.details.is_uom) {
                            unit_list.map((el) => {
                                if (el.id === e.details.uom_data.unit_measurement) {
                                    el.uom_data = e.details.uom_data
                                }
                            })
                        }

                        initData.product_list.push({
                            productId_list: newArrProductId_list,
                            unit_list: unit_list,

                            product_id: e.product_id,
                            amount_all: e.details.is_uom ? e.amount_all / e.details.uom_data.convert_value : e.amount_all,
                            price: e.details.price,
                            price_text: customFormData(e, "price"),
                            // price_text: customTextData(e.details.price_text),

                            total_price: MatchRound(e.details.total_price),
                            total_price_text: customFormData(e, "total_price"),
                            // total_price_text: customTextData(e.details.total_price),
                            unit: e.details.is_uom ? e.details.uom_data.unit_measurement : e.details.unit,

                            discount_percentage_1: e.details.discount_percentage_1,
                            discount_percentage_1_text: customFormData(e, "discount_percentage_1"),
                            // discount_percentage_1_text: customTextData(e.details.discount_percentage_1_text),

                            discount_percentage_2: e.details.discount_percentage_2,
                            discount_percentage_2_text: customFormData(e, "discount_percentage_2"),
                            // discount_percentage_2_text: customTextData(e.details.discount_percentage_2_text),

                            discount_3: e.details.discount_3 ? e.details.discount_3 : null,
                            discount_3_text: customFormData(e, "discount_3"),
                            // discount_3_text: customTextData(e.details.discount_3_text),
                            discount_3_type: e.details.discount_3_type,

                            price_discount_total: (e.details.discount_3_type === "bath" && e.details.is_discount === undefined) || (e.details.discount_3_type === "percent" && e.details.is_discount === undefined) ? e.details.discount_thb_text : e.details.price_discount_total,
                            // price_discount_total: customFormData(e, "price_discount_total"),
                            // price_discount_total: customTextData(e.details.price_discount_total),
                            is_discount: e.details.is_discount,
                            is_discount_by_bath: e.details.is_discount_by_bath,
                            is_discount_by_percent: e.details.is_discount_by_percent,
                            price_discount: e.details.discount_3_type === "bath" && e.details.is_discount === undefined ? e.details.discount_3_text : e.details.discount_3_type === "percent" && e.details.is_discount === undefined ? ((e.details.price * e.details.discount_3_text) / 100) : e.details.price_discount,
                            price_discount_percent: e.details.discount_3_type === "percent" && e.details.is_discount === undefined ? e.details.discount_3_text : e.details.discount_3_type === "bath" && e.details.is_discount === undefined ? ((e.details.discount_3_text / e.details.price) * 100) : e.details.price_discount_percent,
                            price_grand_total: (e.details.discount_3_type === "bath" && e.details.is_discount === undefined) || (e.details.discount_3_type === "percent" && e.details.is_discount === undefined) ? MatchRound(e.details.total_price_text - e.details.discount_thb_text) : e.details.price_grand_total,

                            is_uom: e.details.is_uom,
                            uom_data: e.details.uom_data,
                            uom_arr: e.ShopProduct.details.uom_arr,

                            changed_name_status: e.details?.changed_name_status ?? false,
                            changed_product_name: e.details?.changed_product_name ?? null,

                            warehouse_detail: e.warehouse_detail.map((items, index) => {
                                // console.log('items warehouse_detail dataDocInventoryId', items)
                                return {
                                    warehouse: items.warehouse,
                                    shelf: items.shelf.item,
                                    amount: e.details.is_uom ? items.shelf.amount / e.details.uom_data.convert_value : items.shelf.amount,
                                    dot_mfd: !!items.shelf.dot_mfd ? items.shelf.dot_mfd : null,
                                    purchase_unit_id: e.details.is_uom ? e.details.uom_data.unit_measurement : items.shelf.purchase_unit_id
                                }
                            }),
                            ProductTypeGroupId: e.ShopProduct.Product.ProductType.type_group_id,

                        })
                    })
                }

                function customFormData(data, type) {
                    let returnValue
                    if (data && type) {
                        if (type === "discount_3" || type === "total_price_all_after_discount") {
                            if (data?.details[type]) {
                                returnValue = Number(get(data, `details.${type}_text`, data.details[type])).toLocaleString(undefined, twoDigits)
                                return returnValue
                            } else {
                                return null
                            }
                        } else {
                            returnValue = Number(get(data, `details.${type}_text`, data.details[type])).toLocaleString(undefined, twoDigits)
                            return returnValue
                        }

                        // return returnValue.replaceAll(",","") != 0 ? returnValue ?? null : null
                    }

                }

                let _model = {
                    ...formValue,
                    product_list: initData.product_list,
                    product_list_check: initData.product_list_check
                }
                console.log("_model", _model)
                formModal.setFieldsValue(await _model)
            }
            calculateResult()
            setIsModalVisible(true)

        } catch (error) {
            console.log(`error`, error)
        }
    }

    const handleOkModal = (modeKey) => {
        try {
            setLoading(() => true)
            setConfigModal({ ...configModal, modeKey })
            formModal.submit()
            setLoading(() => false)
        } catch (error) {
            console.log('error handleOk:>> ', error);
        }
    }

    const handleCancelModal = () => {
        setIsModalVisible(false)
        // setCheckTaxType("8c73e506-31b5-44c7-a21b-3819bb712321")
        setConfigModal({ ...configModal, mode: "add" })
        formModal.resetFields()
        getDataSearch({
            search: modelSearch.search ?? "",
            _status: modelSearch.status,
            limit: configTable.limit,
            page: configTable.page,
            sort: configSort.sort,
            order: (configSort.order === "descend" ? "desc" : "asc"),
        })
        // onReset()
        // formIncomeProduct.resetFields()
    }

    const onFinishAddEditViewModal = async (value) => {
        try {
            let shop_id = authUser?.UsersProfile?.ShopsProfile?.id
            // console.log(`value`, value)
            setLoading(true)
            const { total_discount, total_price_all, total_price_all_after_discount, vat, net_price, purchase_order_number_list, price_before_vat, debt_price_amount_left, product_list_check } = formModal.getFieldValue()
            const _model = {
                shop_id: shop_id,
                bus_partner_id: value.bus_partner_id,
                price_grand_total: replaceData(net_price) ?? "0.00",
                details: {
                    purchase_order_number: value?.purchase_order_number ?? null,
                    purchase_order_code_id: null,
                    credit_balance: value.credit_balance,
                    tailgate_discount: replaceData(value?.tailgate_discount) ?? "0.00",
                    tax_type: value.tax_type,
                    References_doc: value.References_doc,
                    total_discount: replaceData(total_discount) ?? "0.00",
                    total_price_all: replaceData(total_price_all) ?? "0.00",
                    total_price_all_after_discount: replaceData(total_price_all_after_discount) ?? "0.00",
                    vat: replaceData(vat) ?? "0.00",
                    net_price: replaceData(net_price) ?? "0.00",
                    price_before_vat: replaceData(price_before_vat) ?? "0.00",
                    debt_price_amount_left: replaceData(debt_price_amount_left) ?? "0.00",
                    note: value.note,
                    user_id: value.user_id,
                    is_inv: value.is_inv,
                    tax_period: moment(value.tax_period).format("YYYY-MM"),
                },
                doc_type_id: "ad06eaab-6c5a-4649-aef8-767b745fab47", //ใบนำเข้า
                doc_date: moment(value.doc_date).format("YYYY-MM-DD"),

            }
            if (!!value?.purchase_order_number && isArray(purchase_order_number_list) && purchase_order_number_list.length > 0) {
                _model.details.purchase_order_code_id = purchase_order_number_list.find(where => where.id === value?.purchase_order_number).code_id
            }


            const warehouseModel = {
                product_list: value.product_list.map((items, index) => {
                    let uom_data = items?.uom_arr?.find(x => x.unit_measurement === items.unit) ?? null
                    let is_uom = uom_data !== null
                    return {
                        // item: index + 1,
                        product_id: items.product_id,
                        warehouse_detail: items.warehouse_detail ? items.warehouse_detail.map(e => {
                            // console.log('warehouse_detail', e)

                            return {
                                // getShelfDataAll: e.getShelfDataAll,

                                warehouse: e.warehouse,
                                shelf: {
                                    item: e.shelf,
                                    amount: is_uom ? parseInt(e.amount) * +uom_data.convert_value : parseInt(e.amount),
                                    dot_mfd: e.dot_mfd ?? null,
                                    purchase_unit_id: is_uom ? uom_data.unit_convert : e.purchase_unit_id ?? null,
                                }
                            }
                        }) : null,
                        amount_all: isNaN(parseInt(items.amount_all)) ? null : is_uom ? parseInt(items.amount_all) * +uom_data.convert_value : parseInt(items.amount_all),

                        details: {
                            uom_data: uom_data,
                            is_uom: is_uom,
                            price: items.price,
                            price_text: replaceData(items.price_text),

                            discount_percentage_1: items.discount_percentage_1 ? items.discount_percentage_1 : null,
                            discount_percentage_1_text: items.discount_percentage_1 ? replaceData(items.discount_percentage_1) : null,

                            discount_percentage_2: items.discount_percentage_2 ? items.discount_percentage_2 : null,
                            discount_percentage_2_text: items.discount_percentage_2 ? replaceData(items.discount_percentage_2) : null,

                            discount_3: items.discount_3 ? items.discount_3 : null,
                            discount_3_text: items.discount_3 ? replaceData(items.discount_3) : null,
                            discount_3_type: items.discount_3_type,

                            price_discount_total: items.price_discount_total ? items.price_discount_total : null,
                            price_discount_total: items.price_discount_total ? replaceData(items.price_discount_total) : null,

                            total_price: items.total_price,
                            total_price_text: replaceData(items.total_price_text),

                            unit: is_uom ? uom_data.unit_convert : items.unit,

                            price_discount: items?.price_discount ?? "0.00",
                            price_discount_percent: items?.price_discount_percent ?? "0.00",
                            price_grand_total: items?.price_grand_total ?? "0.00",

                            is_discount: items?.is_discount ?? false,
                            price_unit: items?.price ?? "0.00",
                            price_unit_vat: items?.price_unit_vat ?? "0.00",
                            price_unit_before_vat: items?.price_unit_before_vat ?? "0.00",
                            price_unit_add_vat: items?.price_unit_add_vat ?? "0.00",
                            price_grand_total_vat: items?.price_grand_total_vat ?? "0.00",
                            price_grand_total_before_vat: items?.price_grand_total_before_vat ?? "0.00",
                            price_grand_total_add_vat: items?.price_grand_total_add_vat ?? "0.00",

                            is_discount_by_percent: items?.is_discount_by_percent ?? false,
                            is_discount_by_bath: items?.is_discount_by_bath ?? "0.00",
                            price_discount_for_cal: items?.price_discount_for_cal ?? "0.00",


                            changed_name_status: items?.changed_name_status,
                            changed_product_name: items?.changed_product_name,
                        },
                    }
                }),
                import_date: moment(value.doc_date).format("YYYY-MM-DD"),

            }

            function replaceData(data) {
                if (data) {
                    const newData = `${data.toString().replaceAll(",", "")}`
                    return newData ?? null
                }
            }

            function twoDigitsString(data) {
                if (data) {
                    return `${MatchRound(data)}`
                }
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
            warehouseModel.product_list.map((e, index) => {
                const sum_warehouse_amount = e.warehouse_detail.reduce(
                    (previousValue, currentValue) => previousValue + parseInt(currentValue.shelf.amount), 0
                );

                if (e.amount_all != sum_warehouse_amount) {
                    // console.log("ไม่เท่ากัน");
                    log.push(index)
                }

            });

            // console.log('warehouseModel', warehouseModel)
            console.log('_model', _model)
            console.log('warehouseModel', warehouseModel)
            // console.log("_modell", warehouseModel.product_list)
            // console.log("product_list_check", product_list_check)
          

            if (log.length == 0) {
                let res
                let resWarehouse
                if (configModal.mode === "add") {
                    warehouseModel.status = 1
                    warehouseModel.import_date = moment(value.doc_date).format("YYYY-MM-DD")
                    _model.ShopInventory_Add = warehouseModel
                    _model.status = 1
                    res = await API.post(`/shopInventoryTransaction/add`, _model)
                }
                else if (configModal.mode === "edit") {
                    warehouseModel.import_date = moment(value.doc_date).format("YYYY-MM-DD")
                    if (!isEqual(product_list_check, warehouseModel.product_list)) {
                        _model.ShopInventory_Put = warehouseModel
                    }
                    if (configModal.modeKey === 1) {
                        delete _model.ShopInventory_Put
                    }
                    res = await API.put(`/shopInventoryTransaction/put/${idEdit}`, _model)
                }

                if (res.data.status == "success") {
                    message.success('บันทึกสำเร็จ');
                    handleCancelModal()
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                    })

                } else {
                    Modal.error({
                        title: 'เกิดข้อผิดพลาด',
                        content: `เกิดข้อผิดพลาด : ${res.data.data}`,
                        centered: true,
                        footer: null,
                    });
                    // message.error('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่');
                }
            } else {
                message.error('จำนวนในชั้นว่างไม่ตรงกับจำนวนทั้งหมด')
            }
            setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!' + error);
            console.log('error', error)
        }
    }

    const onFinishFailedAddEditViewModal = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี
    const getTaxTypes = async () => {
        const { data } = await API.get(`/master/taxTypes/all`);
        return data.status = "success" ? data.data : []
    }

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }
    const calculateResult = async () => {

        const { product_list, tax_type, tailgate_discount, total_text, price_grand_total } = formModal.getFieldValue();
        let total = 0, discount = 0, vat = 0, net_price = 0, total_amount = 0, price_discount_total = 0, beforetotal = 0, total_price_all = 0, price_before_vat = 0, total_price_all_after_discount = 0;
        // console.log("total_price_all", total_price_all)
        function replaceAllComma(val) {
            return isString(val) ? val.replaceAll(",", "") : val ?? 0
        }
        // console.log("product_list", product_list)
        product_list.forEach(e => {
            total += ((Number(replaceAllComma(e.amount_all) ?? 0) * Number(replaceAllComma(e.price) ?? 0)));
            total_price_all += ((Number(replaceAllComma(e.amount_all) ?? 0) * Number(replaceAllComma(e.price) ?? 0)));
            // discount += Number(e.discount_3 ?? 0)
            total_amount += Number(replaceAllComma(e.amount_all) ?? 0)
            price_discount_total += Number(replaceAllComma(e.price_discount_total) ?? 0)
        });
        console.log("total", total)
        total = (total - price_discount_total) - Number(replaceAllComma(tailgate_discount) ?? 0)
        price_discount_total += Number(replaceAllComma(tailgate_discount) ?? 0)
        switch (tax_type) {
            case "8c73e506-31b5-44c7-a21b-3819bb712321": // "รวม Vat"
                vat = ((total * 7) / 107);
                if (!!tailgate_discount) {
                    beforetotal = (replaceAllComma(total_price_all) - price_discount_total) - vat;
                } else beforetotal = total - vat;
                total = total - vat;
                net_price = (total + vat);
                price_before_vat = beforetotal
                total_price_all_after_discount = (replaceAllComma(total_price_all) - price_discount_total)
                break;
            case "fafa3667-55d8-49d1-b06c-759c6e9ab064": // "ไม่รวม Vat"
                vat = ((total * 7) / 100)

                if (!!tailgate_discount) {
                    beforetotal = (replaceAllComma(total_price_all) - price_discount_total);
                } else beforetotal = total;
                total = total + vat
                net_price = total;
                price_before_vat = beforetotal
                total_price_all_after_discount = beforetotal
                break;
            case "52b5a676-c331-4d03-b650-69fc5e591d2c": // "ไม่คิด Vat".
                vat = 0
                net_price = total;
                break;
            default:
                break;
        }
        let Fixed = 0
        let result = {
            total: total ? MatchRound(total) : "0.00",
            tailgate_discount: RoundingNumber(tailgate_discount),
            discount: discount ? MatchRound(discount) : "0.00",
            total_discount: price_discount_total ? MatchRound(price_discount_total) : "0.00",
            net_price: net_price ? MatchRound(net_price) : "0.00",
            total_price_all_after_discount: total_price_all_after_discount ? MatchRound(total_price_all_after_discount) : + "0.00",
            vat: vat ? MatchRound(+vat) : "0.00",
            Final_discount: tailgate_discount,
            total_amount,
            total_price_all: total_price_all ? MatchRound(total_price_all) : "0.00",
            price_before_vat: price_before_vat ? MatchRound(price_before_vat) : "0.00",
        }
        console.log("result", result)
        formModal.setFieldsValue(result)
    }

    const ModalFullScreenTitle = ({ title }) => {
        const { code_id } = formModal.getFieldValue()
        const isShowButtonstatus1 = () => {
            return (configModal.mode == "edit" || configModal.mode == "view")
        }

        return (
            <>
                <span> {title}</span>
                {
                    isShowButtonstatus1() ?
                        <span style={{ paddingLeft: 15, color: mainColor }}>
                            {code_id}
                        </span> : null
                }
            </>
        )
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            setLoading(true)
            // delete,active,block
            //เนื่องจาก
            // const status = isuse === 0 ? 2 : isuse == 2 ? 0 : 1 // api 0 คือ ลบเอกสาร แต่ front 0 คือ ยกเลิก , api 2 คือ ยกเลิก แต่ front 2 คือ ลบ 
            const status = 0
            // // console.log('changeStatus :>> ', status, id);
            // console.log('isuse', isuse)

            Swal.fire({
                title: GetIntlMessages(`ยืนยันการ${status === 0 ? `ลบเอกสาร` : status === 2 ? `ยกเลิกเอกสาร` : "เปลี่ยนเป็นสถานะปกติ"}หรือไม่ !?`),
                text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการยกเลิกเอกสารครั้งนี้ได้ !!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { data } = await API.put(`/shopInventoryTransaction/put/${id}`, { status })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status,
                            doc_date_startDate: isArray(modelSearch.select_date) ? modelSearch.select_date[0] ?? null : null,
                            doc_date_endDate: isArray(modelSearch.select_date) ? modelSearch.select_date[1] ?? null : null,
                            payment_paid_status: modelSearch.payment_paid_status,
                        })
                        Swal.fire(
                            'บันทึกข้อมูลสำเร็จ!!',
                            `เอกสารถูก${status === 0 ? `ลบเอกสาร` : status ? `ยกเลิกเอกสาร` : "เปลี่ยนเป็นสถานะปกติ"}แล้ว`,
                            'success'
                        )
                    } else {
                        Swal.fire(
                            'มีบางอย่างผิดพลาด !!!',
                            'แก้ไขไม่สำเร็จ',
                            'error'
                        )
                    }
                }
            })
            setLoading(false)
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)


    const menuOnFinish = () => {
        try {

            const items = [
                {
                    key: '1',
                    label: 'บันทึกเฉพาะหัวบิลท้ายบิล',
                    onClick: () => handleOkModal(1),
                },
            ]
            if (configModal.mode !== "edit") items = []
            return (
                <Menu
                    loading={loading || carPreLoading}
                    items={items}
                />
            )

        } catch (error) {

        }
    }

    return (
        <>
            <>
                <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={onCreate} value={modelSearch} title={title !== null ? false : true} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

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
                        <Button key="submit" type="primary" loading={loading || loadingUpload} onClick={handleImportOk} >
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
                title={<ModalFullScreenTitle title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")}${GetIntlMessages("ใบนำเข้า")}`} />}
                visible={isModalVisible}
                onOk={handleOkModal}
                onCancel={handleCancelModal}
                CustomsButton={() => {
                    return (
                        <Row gutter={[10, 10]} justify="end" style={{ width: "100%" }}>
                            <Col >
                                <Button loading={loading} onClick={handleCancelModal} style={{ width: 100 }}>{`ปิด`}</Button>
                            </Col>
                            <Col hidden={configModal.mode === "add"}>
                                <PrintOut documentId={formModal.getFieldValue().id} loading={loading} docTypeId={docTypeId} />
                            </Col>
                            {/* <Col hidden={configModal.mode === "view"}>
                                <Button loading={loading} disabled={configModal.mode == "view"} type='primary' onClick={() => handleOkModal(0)} style={{ width: 100 }}>บันทึก</Button>
                            </Col> */}
                            <Col hidden={configModal.mode === "view"} >
                                {
                                    configModal.mode === "edit" ?
                                        <Dropdown.Button type='primary' overlay={() => menuOnFinish()} icon={<DownOutlined />} onClick={() => handleOkModal(0)} style={{ width: "100%" }} loading={loading || carPreLoading}>
                                            บันทึก
                                        </Dropdown.Button>
                                        :
                                        <Button loading={loading} disabled={configModal.mode == "view"} type='primary' onClick={() => handleOkModal(0)} style={{ width: 100 }}>บันทึก</Button>
                                }
                            </Col>
                            {/* <Col hidden={configModal.mode === "add"}> */}
                            <Col hidden={configModal.mode === "add"}>
                                <PaymentDocs loading={loading || carPreLoading} docId={formModal.getFieldValue().id} title={`ชำระเงิน ใบรับสินค้า ${formModal.getFieldValue("code_id") ?? ""}`} handleCancelModal={handleCancelModal} initForm={formModal} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                            </Col>
                        </Row>
                    )
                }

                }
            >

                <Form
                    form={formModal}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout={"vertical"}
                    onFinish={onFinishAddEditViewModal}
                    onFinishFailed={onFinishFailedAddEditViewModal}
                >

                    <ImportDocAddEditViewModal pageId={'ad06eaab-6c5a-4649-aef8-767b745fab47'} form={formModal} mode={configModal.mode} expireDate={expireEditTimeDisable} calculateResult={calculateResult} setLoading={setLoading} />
                    <Form.Item name={"product_list_check"} hidden>
                        <Input></Input>
                    </Form.Item>
                </Form>
            </ModalFullScreen>



            {/* --------------------------------------------------------------------------------------------------------------------------------------------------------- */}

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

export default ImportDocuments
