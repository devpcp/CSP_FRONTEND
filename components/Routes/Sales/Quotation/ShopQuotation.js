import { useEffect, useState, useRef, useCallback } from 'react'
import { message, Form, Tabs, Button, Popover, Dropdown, Menu, Row, Col } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined, ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import moment from 'moment'
import { get, isArray, isEmpty, isFunction, isPlainObject, isString, result } from 'lodash';
import API from '../../../../util/Api'
import GetIntlMessages from '../../../../util/GetIntlMessages';
import { useSelector } from 'react-redux';
import SearchInput from '../../../shares/SearchInput'
import TableList from '../../../shares/TableList'
import ModalFullScreen from '../../../shares/ModalFullScreen';
import PrintOut from "../../../shares/PrintOut";
import { RoundingNumber, NoRoundingNumber, takeOutComma } from "../../../shares/ConvertToCurrency";

import FormQuotation from './QuotationComponents/Components.Routes.Modal.FormQuotation';
import QuotationProductList from './QuotationComponents/Components.Routes.Modal.Tabs1.QuotationList';
import Tab2Customer from './QuotationComponents/Components.Routes.Modal.Tabs2.Customer';
import Tab4Vehicle from './QuotationComponents/Components.Routes.Modal.Tabs4.QuotationVehicle';
import SortingData from '../../../shares/SortingData';

const ShopQuotation = ({ docTypeId, menuId }) => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี

    const { TabPane } = Tabs

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
            title: {
                not_use_system: GetIntlMessages("ยกเลิกเอกสาร"),
                use_system: GetIntlMessages("ใช้งานเอกสาร"),
            },
            column: {
                created_by: false,
                created_date: false,
                updated_by: true,
                updated_date: true,
                status: true
            }
        },
        configSort: {
            sort: `doc_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "active",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const getCustomerDataTable = (record, type) => {
        // ShopPersonalCustomers ลูกค้าบุคคลธรรมดา
        // ShopBusinessCustomers ลูกค้าธุรกิจ
        const { ShopPersonalCustomer, ShopBusinessCustomer } = record;
        const model = {
            code: null,
            type: null,
            name: null,
            mobile_no: null,
            tel_no: null,
        };
        if (isPlainObject(ShopPersonalCustomer)) { //ลูกค้าบุคคลธรรมดา
            const { first_name, last_name } = ShopPersonalCustomer.customer_name
            const { mobile_no, tel_no, master_customer_code_id } = ShopPersonalCustomer
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = first_name[locale.locale] + " " + last_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าบุคคลธรรมดา"
        } else if (isPlainObject(ShopBusinessCustomer)) { // ลูกค้าธุรกิจ
            const { mobile_no, tel_no, master_customer_code_id } = ShopBusinessCustomer
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = ShopBusinessCustomer.customer_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าธุรกิจ"
        } else {
            return "-";
        }
        return model[type] ?? "-"
    }

    const setColumnsTable = () => {
        const _column = [];
        _column.push(
            {
                title: () => GetIntlMessages("ลำดับ"),
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
                title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `เลขที่ใบสั่งขาย` : "เลขที่ใบสั่งซ่อม"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 130,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "start" }}>{text ?? ""}</div>
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 130,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("รหัสลูกค้า"),
                dataIndex: '',
                key: '',
                width: 200,
                align: "center",
                render: (text, record) => getCustomerDataTable(record, "code"),
            },
            {
                title: () => GetIntlMessages("ชื่อลูกค้า"),
                dataIndex: '',
                key: '',
                width: 250,
                // align: "center",
                render: (text, record) => getCustomerDataTable(record, "name"),
            },
            {
                title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 120,
                align: "center",
                render: (text, record) => (+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            },
            {
                title: () => GetIntlMessages("หมายเหตุ(ภายใน)"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                align: "center",
                render: (text, record) => get(text, `remark_inside`, "-") ?? "-",
            },
            {
                title: () => GetIntlMessages("พิมพ์"),
                dataIndex: 'details',
                key: 'details',
                width: 120,
                align: "center",
                render: (text, record) => {
                    return (
                        <PrintOut textButton={"พิมพ์"} printOutHeadTitle={"ใบเสนอราคา"} documentId={record?.id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} customPriceUse={true} docTypeId={docTypeId} />
                    )
                },
            },
        )


        setColumns(_column)
    }

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })

        // getMasterData()
        // configPrintOut()
    }, [])

    useEffect(() => {
        const status = modelSearch.status
        if (permission_obj) setColumnsTable(status)

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status ?? "active" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`shopQuotationDoc/all?status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}`)
            // const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data.forEach(e => {
                    // status = 2 -> api คือ ยกเลิกเอกสาร
                    // status = 0 -> api คือ ลบเอกสาร
                    // e.isuse = e?.status
                    e.isuse = e?.status === 2 ? 0 : e?.status === 0 ? 2 : 1
                    e.use_fake_uuid = true
                    // if (e.status === 3) {
                    //     e.___update = false;
                    //     // e.___delete = false;
                    // }
                });
                // console.log('data :>> ', data);
                setColumnsTable(_status)
                setListSearchDataTable(() => data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                // console.log(`res.data`, res.data)
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            // console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            // const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"

            Swal.fire({
                title: GetIntlMessages(`ยืนยันการเปลี่ยนสถานะเป็น ${isuse === 0 ? `"สถานะยกเลิกเอกสาร"` : isuse === 1 ? `"สถานะใช้งานเอกสาร` : `"สถานะลบเอกสาร`}!?`),
                // text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการลบครั้งนี้ได้ !!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { data } = await API.put(`/shopQuotationDoc/put/${id}`, { status: isuse === 2 ? 0 : isuse === 0 ? 2 : 1 })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status
                        })
                        Swal.fire(
                            'บันทึกข้อมูลสำเร็จ!',
                            '',
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

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page })
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

    const callbackSearch = (value) => {
        getDataSearch({
            page: value.page,
            limit: value.limit,
            _status: modelSearch.status,
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
                label: GetIntlMessages("search"),
                placeholder: GetIntlMessages("search"),
                list: null,
            },
            {
                index: 1,
                type: "select",
                name: "status",
                label: docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? GetIntlMessages("สถานะใบสั่งขาย") : GetIntlMessages("สถานะใบสั่งซ่อม"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    {
                        key: GetIntlMessages("all-status"),
                        value: "default",
                    },
                    {
                        key: GetIntlMessages("ใช้งานเอกสาร"),
                        value: "active",
                    },
                    {
                        key: GetIntlMessages("ยกเลิกเอกสาร"),
                        value: "block",
                    },
                    {
                        key: GetIntlMessages("ลบเอกสาร"),
                        value: "delete",
                    },
                ],
            },
        ],
        col: 8,
        button: {
            create: true,
            name: {
                add: GetIntlMessages(`สร้างใบเสนอราคา`),
            },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        modeKey: null,
        maxHeight: 600,
        overflowX: "auto",
    })

    const handleOk = (modeKey) => {
        try {
            setLoading(() => true)
            setConfigModal({ ...configModal, modeKey })
            // form.validateFields().then(async (values) => {

            //     await onFinish(values)
            //     // setIsModalVisible(false)
            //     if (modeKey == 2) handleCancel()

            // }).catch((errorInfo) => { });
            form.submit()
            setLoading(() => false)
        } catch (error) {

        }
        // console.log('modeKey', modeKey)

    }

    const handleCancel = () => {
        setLoading(() => true)
        const settingsConfigModal = { ...configModal, mode: 'add', modeKey: null }
        setConfigModal(() => settingsConfigModal)
        setIsModalVisible(() => false)
        setIsIdEdit(() => null)
        form.setFieldsValue({
            customer_type: "person",
        })
        setActiveKeyTab("1")
        // getDataSearch({
        //     page: configTable.page,
        //     search: modelSearch.search,
        //     _status: modelSearch.status,
        // })
        form.resetFields()
        setLoading(() => false)
    }

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [form] = Form.useForm();

    /* Tab */
    const [activeKeyTab, setActiveKeyTab] = useState("1")

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            setLoading(() => true)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/shopQuotationDoc/byId/${id}`)
                // console.log('data :>> ', data);
                if (data.status === "success") {
                    setIsIdEdit(() => id)
                    setFormValueData(data.data)
                }
            } else {
                if (mode === "add") {
                    setCheckTaxId(() => "8c73e506-31b5-44c7-a21b-3819bb712321")
                    form.setFieldsValue({
                        customer_type: "person",
                        user_id: authUser.id,
                        doc_type_id: docTypeId,
                        doc_date: moment(new Date()),
                        tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                        customer_list: [],
                        shop_vehicle_list: [],
                    });
                }

            }
            // form.setFieldsValue({customer_list : [] , shop_vehicle_list : []})
            setIsModalVisible(() => true)
            setLoading(() => false)
        } catch (error) {
            setLoading(false)
            // console.log(`error`, error)
        }
    }

    const setFormValueData = (data) => {
        try {
            if (isPlainObject(data)) {
                const { details, ShopVehicleCustomer, tax_type_id, ShopQuotationLists, doc_type_id, doc_date, code_id, id } = data

                const _model = {
                    id,
                    code_id,
                    customer_type: details?.customer_type,
                    customer_phone: details?.customer_phone,
                    customer_phone_list: [],
                    customer_id: null,
                    customer_list: [],
                    tax_type_id,
                    doc_type_id,
                    doc_date: moment(doc_date),
                    user_id: details?.user_id,
                    effective_days: details?.effective_days,
                    shop_vehicle_list: isPlainObject(ShopVehicleCustomer) ? [ShopVehicleCustomer] : [],
                    vehicles_customers_id: isPlainObject(ShopVehicleCustomer) ? ShopVehicleCustomer?.id : null,
                    vehicles_color_id: isPlainObject(ShopVehicleCustomer) ? ShopVehicleCustomer?.details?.color : null,
                    vehicle_type_id: isPlainObject(ShopVehicleCustomer) ? ShopVehicleCustomer?.VehicleType.id : [],
                    price_discount_bill: Number(data?.price_discount_bill) === 0.00 ? null : RoundingNumber(data?.price_discount_bill),
                    price_sub_total: RoundingNumber(data?.price_sub_total),
                    price_amount_total: RoundingNumber(data?.price_amount_total),
                    price_discount_total: RoundingNumber(data?.price_discount_total),
                    price_before_vat: RoundingNumber(data?.price_before_vat),
                    price_vat: RoundingNumber(data?.price_vat),
                    price_grand_total: RoundingNumber(data?.price_grand_total),
                    remark: details?.remark ?? null,
                    remark_inside: details?.remark_inside ?? null,
                    list_service_product: isArray(data?.ShopQuotationLists) && data.ShopQuotationLists.length > 0 ?
                        ShopQuotationLists.map(e => {
                            return {
                                seq_number: e?.seq_number,
                                id: e?.id,
                                product_id: e?.product_id,
                                list_shop_stock: e?.details?.list_shop_stock,
                                purchase_unit_id: e?.purchase_unit_id,
                                purchase_unit_list: e?.details?.purchase_unit_list,
                                is_service: e?.details?.is_service,
                                changed_name_status: e?.details?.changed_name_status,
                                changed_product_name: e?.details?.changed_product_name,
                                dot_mfd: e?.dot_mfd ?? null,
                                dot_mfd_list: e?.details?.dot_mfd_list,
                                price_unit: e?.price_unit,
                                amount: e?.amount,
                                price_discount: Number(e?.price_discount) === 0.00 ? null : e?.price_discount,
                                price_discount_percent: Number(e?.price_discount_percent) === 0.00 ? null : e?.price_discount_percent,
                                price_grand_total: Number(e?.price_grand_total) === 0.00 ? null : e?.price_grand_total,
                            }
                        })
                        : [],
                }
                if (details?.customer_type === "person") {
                    _model.customer_id = data?.per_customer_id ?? null
                    _model.customer_list = [data?.ShopPersonalCustomer].map(e => {
                        const newData = { ...e, customer_name: {} }
                        locale.list_json.forEach(x => {
                            newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                            return newData
                        })
                        return newData
                    })
                    _model.customer_phone_list = Object.entries(data?.ShopPersonalCustomer?.mobile_no).map(e => { return { value: e[1] } })
                } else {
                    _model.customer_id = data?.bus_customer_id ?? null
                    _model.customer_list = [data?.ShopBusinessCustomer]
                    _model.customer_phone_list = Object.entries(data?.ShopBusinessCustomer?.mobile_no).map(e => { return { value: e[1] } })
                }

                // _model.list_service_product = SortingData(_model.list_service_product, "seq_number")
                // console.log('_model :>> ', _model);
                form.setFieldsValue(_model)
            }

            calculateResult()
        } catch (error) {
            // console.log('error setFormValueData :>> ', error);
        }
    }

    const callBackResFinish = async (res) => {
        try {
            if (res.data.status === "success") {
                await getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                handleCancel()
                Swal.fire({
                    title: GetIntlMessages(`${configModal.mode === "add" ? `สร้าง` : `แก้ไข`}ใบเสนอราคาสำเร็จ !!`),
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                })
            } else {
                Swal.fire(`${GetIntlMessages(`${configModal.mode === "add" ? `สร้าง` : `แก้ไข`}ใบเสนอราคาไม่สำเร็จ !!`)}`, `กรุณาติดต่อเจ้าหน้าที่`, 'error')
            }

        } catch (error) {

        }
    }

    const onFinish = async (value) => {
        try {
            setLoading(() => true)
            console.log('value :>> ', value);
            const _model = {
                doc_type_id: value.doc_type_id,// -> ใบเสนอราคา
                doc_date: moment(value.doc_date).format("YYYY-MM-DD"),
                vehicles_customers_id: value?.vehicles_customers_id ?? null,
                tax_type_id: value?.tax_type_id,
                price_discount_bill: (+takeOutComma(value?.price_discount_bill)).toFixed(2) ?? "0.00",
                price_sub_total: (+takeOutComma(value?.price_sub_total)).toFixed(2) ?? "0.00",
                price_discount_total: (+takeOutComma(value?.price_discount_total)).toFixed(2) ?? "0.00",
                price_amount_total: (+takeOutComma(value?.price_amount_total)).toFixed(2) ?? "0.00",
                price_before_vat: (+takeOutComma(value?.price_before_vat)).toFixed(2) ?? "0.00",
                price_vat: (+takeOutComma(value?.price_vat)).toFixed(2) ?? "0.00",
                price_grand_total: (+takeOutComma(value?.price_grand_total)).toFixed(2) ?? "0.00",
                details: {
                    remark: value?.remark ?? null,
                    remark_inside: value?.remark_inside ?? null,
                    effective_days: value?.effective_days ?? null,
                    user_id: value?.user_id ?? null,
                    customer_phone: value?.customer_phone ?? null,
                    customer_type: value?.customer_type ?? null,
                    customer_phone_list: value?.customer_phone_list ?? [],
                },
                shopQuotationLists: (isArray(value?.list_service_product) && value?.list_service_product.length > 0) ?
                    value?.list_service_product.map((e, index) => {
                        const returnModel = {
                            seq_number: index + 1,
                            product_id: e?.product_id ?? null,
                            purchase_unit_id: e?.purchase_unit_id,
                            dot_mfd: e?.dot_mfd === "-" ? null : e?.dot_mfd ?? null,
                            amount: e?.amount ?? null,
                            price_unit: takeOutComma(e?.price_unit) ?? "0.00",
                            price_discount: takeOutComma(e?.price_discount) ?? "0.00",
                            price_discount_percent: takeOutComma(e?.price_discount_percent) ?? "0.00",
                            price_grand_total: takeOutComma(e?.price_grand_total) ?? "0.00",
                            details: {
                                list_shop_stock: e?.list_shop_stock ?? [],
                                dot_mfd_list: e?.dot_mfd_list ?? [],
                                purchase_unit_list: e?.purchase_unit_list ?? [],
                                is_service: e?.is_service ?? false,
                                changed_name_status: e?.changed_name_status ?? false,
                                changed_product_name: e?.changed_product_name ?? null,

                                is_discount: e?.is_discount ?? false,
                                price_unit_vat: e?.price_unit_vat ?? "0.00",
                                price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                                price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",
                                price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                                price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                                price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                                is_discount_by_percent: e?.is_discount_by_percent ?? false,
                                is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                                price_discount_for_cal: e?.price_discount_for_cal ?? "0.00",
                            }
                        }
                        if (e.id && !!e.id) returnModel.id = e?.id

                        return returnModel
                    }) ?? [] : []
            }

            if (value?.customer_type === "person") {
                _model.per_customer_id = value?.customer_id
            } else {
                _model.bus_customer_id = value?.customer_id
            }



            const log = []
            if (isArray(_model.shopQuotationLists) && _model.shopQuotationLists.length > 0) {
                _model.shopQuotationLists.find((where, index) => { if (where.product_id === null || where.price_unit === null || where.amount === null) log.push(index) })
            }
            // console.log('log :>> ', log);
            let res
            if (log.length !== 0) {
                // Swal.fire(`${GetIntlMessages(`"สินค้า/บริการ" บางรายการข้อมูลไม่ครบถ้วน !!`)}`,`${GetIntlMessages(``)}`,'warning')
                Swal.fire({
                    title: GetIntlMessages(`"สินค้า/บริการ" บางรายการข้อมูลไม่ครบถ้วน ยืนยันการบันทึก หรือ ไม่ !!`),
                    text: GetIntlMessages(`รายการที่ ${log.map(e => e + 1).join(" , ")} ไม่มีข้อมูลสินค้า , ราคา/หน่วย หรือ จำนวน หากท่านกด "ตกลง" รายการที่ ${log.map(e => e + 1).join(" , ")} จะไม่ถูกบันทึก !!`),
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages('submit'),
                    cancelButtonText: GetIntlMessages('cancel'),
                    confirmButtonColor: mainColor,
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        _model.shopQuotationLists = _model.shopQuotationLists.filter(where => { return where.product_id !== null && where.price_unit !== null && where.amount !== null })
                        if (configModal.mode === "add") {
                            const { shop_id } = authUser.UsersProfile
                            _model.shop_id = shop_id
                            res = await API.post(`/shopQuotationDoc/add`, _model)
                        } else if (configModal.mode === "edit") {
                            // console.log('idEdit :>> ', idEdit);
                            res = await API.put(`/shopQuotationDoc/put/${idEdit}`, _model)
                        }

                        await callBackResFinish(res)
                    }
                })
            } else {
                if (configModal.mode === "add") {
                    const { shop_id } = authUser.UsersProfile
                    _model.shop_id = shop_id
                    res = await API.post(`/shopQuotationDoc/add`, _model)
                } else if (configModal.mode === "edit") {
                    // console.log('idEdit :>> ', idEdit);
                    res = await API.put(`/shopQuotationDoc/put/${idEdit}`, _model)
                }
                // console.log('res :>> ', res);
                await callBackResFinish(res)

            }
            console.log('_model :>> ', _model);

            setLoading(() => false)
        } catch (error) {
            setLoading(() => false)
            console.log('error onFinish :>> ', error);
        }
    }
    const onFinishFailed = async () => {
        try {

        } catch (error) {

        }
    }

    const [checkTaxId, setCheckTaxId] = useState(null)

    const calculateResult = () => {
        try {
            const { list_service_product, price_discount_bill, tax_type_id } = form.getFieldValue()
            price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0;

            function summaryFromTable(arr, key, mutiplyWithAmount = false) {
                try {
                    if (key === "price_unit") {
                        let discount_arr = arr.filter(x => x.is_discount === true)
                        if (discount_arr.length > 0) {
                            if (mutiplyWithAmount) {
                                return discount_arr.reduce((prevValue, currentValue) => prevValue + (Math.abs(Number((currentValue?.[key] ?? 0)) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                            } else {
                                return discount_arr.reduce((prevValue, currentValue) => prevValue + Math.abs(Number((currentValue?.[key] ?? 0)), 0))
                            }
                        } else {
                            return 0
                        }
                    } else {
                        console.log(arr)
                        console.log(Number(arr[0].price_unit))
                        if (mutiplyWithAmount) {

                            return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                        } else {
                            console.log("no")
                            return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
                        }
                    }
                } catch (error) {
                    console.log("error", error)
                }

            }
            // console.log("list_service_product", list_service_product)
            if (!!list_service_product && isArray(list_service_product) && list_service_product.length > 0) {
                price_discount_total = Number(summaryFromTable(list_service_product, "price_discount", true)) + (Number(price_discount_bill) ?? 0) + Number(summaryFromTable(list_service_product, "price_unit", true))
                price_sub_total = summaryFromTable(list_service_product, "price_grand_total", false) + (price_discount_total - price_discount_bill)
                price_amount_total = price_sub_total - price_discount_total


                const { detail } = taxTypes.find(where => where.id === tax_type_id)

                let taxRate = 0
                if (Number(detail.tax_rate_percent) > 9) {
                    taxRate = Number(`1${detail.tax_rate_percent}`)
                } else {
                    taxRate = Number(`10${detail.tax_rate_percent}`)
                }

                switch (tax_type_id) {
                    case "8c73e506-31b5-44c7-a21b-3819bb712321":
                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / taxRate)))
                            price_before_vat = price_amount_total - price_vat
                            price_grand_total = price_amount_total
                        }
                        break;
                    default:
                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
                            price_grand_total = price_amount_total + price_vat
                            price_before_vat = price_amount_total
                        }
                        break;
                }
            }

            form.setFieldsValue({
                price_discount_bill: !!price_discount_bill ? price_discount_bill.toFixed(2) : null,
                price_sub_total,
                price_discount_total,
                price_amount_total,
                price_vat,
                price_before_vat,
                price_grand_total,
                price_discount_before_pay
            })
        } catch (error) {
            console.log('error calculateResult :>> ', error);
        }
    }


    const ModalFullScreenTitle = ({ title, isShowTittle }) => {
        const { code_id } = form.getFieldValue()

        return (
            <>
                {isShowTittle ?
                    <>
                        <span className='pr-2'> {GetIntlMessages(configModal.mode == "view" ? "view-data" : configModal.mode == "edit" ? "edit-data" : "สร้าง")} {title}</span>
                        <span >{code_id}</span>
                    </>
                    : null}


            </>
        )
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)
    
    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={callbackSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} />

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                // okButtonProps={{ disabled: configModal.mode == "view" && isModeInvovices != true }}
                title={<ModalFullScreenTitle title={`ใบเสนอราคา`} isShowTittle={true} />}
                loading={loading}
                hideSubmitButton={configModal.mode === "view"}
                mode={configModal.mode}
                CustomsButton={() => {
                    return (
                        <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
                            <>
                                <Row gutter={[10, 10]} justify="end" style={{ width: "100%" }}>
                                    <>
                                        <Col xxl={{ span: 4, offset: 8 }} lg={6} md={12} xs={24} >
                                            <Button loading={loading} style={{ width: "100%" }} onClick={() => handleCancel()}>{configModal.mode === "view" ? GetIntlMessages("ปิด") : GetIntlMessages("cancel")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view"} >
                                            <Button loading={loading} onClick={() => handleOk()} style={{ width: "100%" }} type='primary'>{GetIntlMessages("บันทึก")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "add"} >
                                            <PrintOut textButton={"พิมพ์ใบเสนอราคา"} printOutHeadTitle={"ใบเสนอราคา"} loading={loading} documentId={form.getFieldValue("id")} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }} customPriceUse={true} docTypeId={docTypeId} />
                                        </Col>

                                    </>
                                </Row>
                            </>
                        </div>
                    )
                }}
            // showPrintOutButton={{ status: true, id: idEdit }}
            // okButtonDropdown={isModeInvovices != true}
            >
                <Form
                    form={form}
                    className="pt-3"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout={"vertical"}
                >
                    <div className="container-fluid">
                        {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                        <div className='pr-5 pl-5 detail-before-table'>
                            <FormQuotation docTypeId={docTypeId} menuId={menuId} mode={configModal.mode} configModal={configModal} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} handleCancel={handleCancel} calculateResult={calculateResult} />
                        </div>

                        <div className='tab-detail'>
                            <Tabs activeKey={activeKeyTab} onChange={(value) => setActiveKeyTab(() => value)}>
                                <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                                    <QuotationProductList docTypeId={docTypeId} mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} handleOk={handleOk} isTableNoStyle calculateResult={calculateResult} checkTaxId={checkTaxId} />
                                </TabPane>
                                {
                                    configModal.mode !== "add" ?
                                        <>
                                            <TabPane tab={GetIntlMessages("ลูกค้า")} key="2">
                                                <Tab2Customer mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} />
                                            </TabPane>
                                            {/* <TabPane tab={GetIntlMessages("เอกสาร")} key="3">
                                                <Tab3Document mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} />
                                            </TabPane> */}
                                            <TabPane tab={GetIntlMessages("รถยนต์")} key="4">
                                                <Tab4Vehicle mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} />
                                            </TabPane>
                                        </>
                                        : null
                                }
                            </Tabs>
                        </div>
                    </div>
                </Form>
            </ModalFullScreen>
        </>
    )
}

export default ShopQuotation