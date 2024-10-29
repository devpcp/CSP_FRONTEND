import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, Modal, Form, Typography } from 'antd';
import { ReloadOutlined, UploadOutlined, EditOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import API from '../../../../util/Api'
import GetIntlMessages from '../../../../util/GetIntlMessages';
import moment from 'moment';
import Swal from "sweetalert2";
import _, { isArray, isPlainObject, isFunction, get, isNull } from 'lodash'
import { Cookies } from "react-cookie";
import { useSelector } from 'react-redux';

import SearchInput from '../../../shares/SearchInput'
import TableList from '../../../shares/TableList'
import PrintOut from "../../../shares/PrintOut"
import { FormInputLanguage, FormSelectLanguage } from '../../../shares/FormLanguage';
import FormProvinceDistrictSubdistrict from '../../../shares/FormProvinceDistrictSubdistrict';
import Fieldset from '../../../shares/Fieldset';
import ModalFullScreen from '../../../shares/ModalFullScreen';

import FormSelectDot from '../../../Routes/Dot/Components.Select.Dot';
import DiscountEachProduct from "../../../Routes/ImportDocumentModal/DiscountEachProduct";
import ImportDocAddEditViewModal from '../../../Routes/ImportDocumentModal/ImportDocAddEditViewModal';
import FormPurchaseDoc from './PoAndPrDocComponents/Components.Routes.Modal.FormPurchaseDoc';
import ProductListTable from './PoAndPrDocComponents/Components.Routes.Modal.ProductListTable';
import { RoundingNumber, takeOutComma } from '../../../shares/ConvertToCurrency';
import SortingData from '../../../shares/SortingData';

const { Text, Link } = Typography;
const { Search } = Input;
const cookies = new Cookies();

const PurchaseOrder = ({ docTypeId }) => {
    // debugger
    const [loading, setLoading] = useState(false);

    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes } = useSelector(({ master }) => master);
    const { locale, mainColor } = useSelector(({ settings }) => settings);

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
                title: GetIntlMessages("code"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 200,
                align: "center",
            },
            {
                title: GetIntlMessages("รหัสผู้จำหน่าย"),
                dataIndex: 'ShopBusinessPartner',
                key: 'ShopBusinessPartner',
                width: 150,
                align: "center",
                render: (text, record) => get(text, `code_id`, "-")
            },
            {
                title: GetIntlMessages("ชื่อผู้จำหน่าย"),
                // title: GetIntlMessages("product-name"),
                dataIndex: 'ShopBusinessPartner',
                key: 'ShopBusinessPartner',
                width: 300,
                align: "center",
                render: (text, record) => get(text, `partner_name.${locale.locale}`, "-")
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
                title: GetIntlMessages("จำนวนสินค้า"),
                // title: GetIntlMessages("amount"),
                dataIndex: 'ShopPurchaseOrderLists',
                key: 'ShopPurchaseOrderLists',
                width: 150,
                align: "center",
                render: (text, record) => get(text, `length`, "-")
            },
            // {
            //     title: GetIntlMessages("ราคา/หน่วย"),
            //     dataIndex: '',
            //     key: '',
            //     width: 150,
            //     align: "center",
            // },
            {
                title: GetIntlMessages("จำนวนเงิน"),
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                render: (text, record) => RoundingNumber(text) ?? "-"
            },
            {
                title: GetIntlMessages("สถานะการใช้งาน"),
                dataIndex: 'is_used',
                key: 'is_used',
                width: 150,
                align: "center",
                render: (text, record) => {
                    if (text) {
                        return (
                            <Text style={{ color: "green" }}>ใช้งานแล้ว</Text>
                        )
                    } else {
                        return (
                            <Text style={{ color: "red" }}>ยังไม่ได้ใช้งาน</Text>
                        )
                    }
                }
            },

        ];

        setColumns(_column)
    }

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status ?? "active" }) => {
        try {
            if (page === 1) setLoading(() => true)
            const res = await API.get(`/shopPurchaseOrderDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}`)
            // const res = await API.get(`/shopInventoryTransaction/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=1&doc_type_id=${"ad06eaab-6c5a-4649-aef8-767b745fab47"}`)
            // console.log('res :>> ', res);
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)
                data.forEach(e => {
                    // e.isuse = e.status
                    e.isuse = e?.status === 2 ? 0 : e?.status === 0 ? 2 : 1
                })
                // e.isuse = e?.status === 2 ? 0 : e?.status === 0 ? 2 : 1
                setListSearchDataTable(prevValue => data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
            // setListSearchDataTable(prevValue => [])
            // setConfigTable({ ...configTable, page: page, total, limit })
            // setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(() => false)
            // console.log('error :>> ', error);
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            // const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            // console.log('isuse :>> ', isuse);
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
                    let res
                    if (isuse === 2) { //isuse 2 front -> คือลบ ,back -> คือยกเลิก
                        res = await API.delete(`/shopPurchaseOrderDoc/delete/${id}`)
                    } else { //isuse 1 front -> คือปกติ , isuse 0 front -> คือยกเลิก ,back -> คือ ลบ
                        res = await API.put(`/shopPurchaseOrderDoc/put/${id}`, { status: isuse === 0 ? 2 : 1 })
                    }

                    if (res.data.status === "success") {
                        setModelSearch(() => init.modelSearch)
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
        // console.log(`error`, error)
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
            // order: "ascend",
            title: {
                not_use_system: GetIntlMessages("ยกเลิกเอกสาร"),
                use_system: GetIntlMessages("สถานะใช้งานเอกสาร"),
            },
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
            status: "active",
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
        })
    }, [])

    useEffect(() => {
        if (permission_obj) setColumnsTable()
        // console.log(`permission_obj`, permission_obj)
    }, [configTable.page, configSort.order, permission_obj])




    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status })
        getDataSearch({ search: value.search, page: init.configTable.page, _status: value.status })
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
                        key: "ทั้งหมด",
                        value: "default",
                    },
                    {
                        key: "ใช้งานเอกสาร",
                        value: "active",
                    },
                    {
                        key: "ยกเลิกเอกสาร",
                        value: "block",
                    },
                    {
                        key: "ลบเอกสาร",
                        value: "delete",
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
    }

    /* End table data */
    //------------------------------------------------------------------------------------------------------------------------------------------------------------


    /* addEditView Modal*/
    const addEditViewModal = async (mode, id) => {
        // console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(() => id)
                const { data } = await API.get(`/shopPurchaseOrderDoc/byId/${id}`)
                // console.log('data :>> ', data);
                if (data.status === "success") {
                    setIsIdEdit(() => id)
                    setFormValueData(data.data)
                }
            } else {
                if (mode === "add") {
                    form.setFieldsValue({ doc_date: moment(new Date()), tax_type_id: "fafa3667-55d8-49d1-b06c-759c6e9ab064", doc_type_id: "941c0fc7-794b-4838-afca-2bd8884dc36d", business_partners_list: [] })
                }
            }


            setIsModalVisible(() => true)

        } catch (error) {
            // console.log(`error`, error)
        }
    }

    const setFormValueData = (data) => {
        try {
            // console.log('data :>> ', data);
            if (isPlainObject(data)) {
                const { details, tax_type_id, ShopPurchaseOrderLists, doc_type_id, doc_date, code_id, business_partner_id, ShopBusinessPartner } = data
                // const { details, ShopVehicleCustomer, tax_type_id, ShopPurchaseOrderLists, doc_type_id, doc_date, code_id } = data

                const _model = {
                    code_id,
                    // customer_type: details?.customer_type,
                    // customer_phone: details?.customer_phone,
                    // customer_phone_list: [],
                    // customer_id: null,
                    // customer_list: [],
                    business_partner_id,
                    // purchase_requisition_id,
                    ref_doc: details?.ref_doc ?? null,
                    business_partners_list: [ShopBusinessPartner],
                    tax_type_id,
                    doc_type_id,
                    doc_date: moment(doc_date),
                    // user_id: details?.user_id,
                    price_discount_bill: Number(data?.price_discount_bill) === 0.00 ? null : RoundingNumber(data?.price_discount_bill),
                    price_sub_total: RoundingNumber(data?.price_sub_total),
                    price_amount_total: RoundingNumber(data?.price_amount_total),
                    price_discount_total: RoundingNumber(data?.price_discount_total),
                    price_before_vat: RoundingNumber(data?.price_before_vat),
                    price_vat: RoundingNumber(data?.price_vat),
                    price_grand_total: RoundingNumber(data?.price_grand_total),
                    remark: details?.remark ?? null,
                    remark_inside: details?.remark_inside ?? null,
                    shopPurchaseOrderLists: isArray(ShopPurchaseOrderLists) && ShopPurchaseOrderLists.length > 0 ?
                        ShopPurchaseOrderLists.map(e => {
                            return {
                                id: e?.id,
                                product_id: e?.product_id,
                                list_shop_stock: e?.details?.list_shop_stock,
                                purchase_unit_id: e?.purchase_unit_id,
                                purchase_unit_list: e?.details?.purchase_unit_list,
                                seq_number: `${e?.seq_number}`,
                                is_service: e?.details?.is_service,
                                changed_name_status: e?.details?.changed_name_status,
                                changed_product_name: e?.details?.changed_product_name,
                                dot_mfd: e?.dot_mfd ?? null,
                                dot_mfd_list: e?.details?.dot_mfd_list,
                                price_unit: RoundingNumber(e?.price_unit),
                                amount: Number(e?.amount).toLocaleString(),
                                price_discount: Number(e?.price_discount) === 0.00 ? null : RoundingNumber(e?.price_discount),
                                price_discount_percent: Number(e?.price_discount_percent) === 0.00 ? null : RoundingNumber(e?.price_discount_percent),
                                price_grand_total: Number(e?.price_grand_total) === 0.00 ? null : RoundingNumber(e?.price_grand_total),
                            }
                        })
                        : [],
                }
                // if (details?.customer_type === "person") {
                //     _model.customer_id = data?.per_customer_id ?? null
                //     _model.customer_list = [data?.ShopPersonalCustomer].map(e => {
                //         const newData = { ...e, customer_name: {} }
                //         locale.list_json.forEach(x => {
                //             newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                //             return newData
                //         })
                //         return newData
                //     })
                //     _model.customer_phone_list = Object.entries(data?.ShopPersonalCustomer?.mobile_no).map(e => { return { value: e[1] } })
                // } else {
                //     _model.customer_id = data?.bus_customer_id ?? null
                //     _model.customer_list = [data?.ShopBusinessCustomer]
                //     _model.customer_phone_list = Object.entries(data?.ShopBusinessCustomer?.mobile_no).map(e => { return { value: e[1] } })
                // }

                _model.shopPurchaseOrderLists = SortingData(_model.shopPurchaseOrderLists, `seq_number`)
                // console.log('_model :>> ', _model);
                form.setFieldsValue(_model)
            }

            calculateResult()
        } catch (error) {
            // console.log('error setFormValueData :>> ', error);
        }
    }

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    // const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();


    const ModalFullScreenTitle = ({ title }) => {
        const { code_id } = form.getFieldValue()
        const isShowButtonstatus1 = () => {
            return (configModal.mode === "edit" || configModal.mode === "view")
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

    const handleOkModal = () => {
        form.submit()
    }
    const handleCancelModal = () => {
        form.resetFields()
        setIsModalVisible(() => false)
    }

    const callBackResFinish = async (res) => {
        try {
            if (res.data.status === "success") {
                await getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                handleCancelModal()
                Swal.fire({
                    title: GetIntlMessages(`${configModal.mode === "add" ? `สร้าง` : `แก้ไข`}ใบซื้อสินค้าสำเร็จ !!`),
                    icon: 'success',
                    timer: 2000,
                    timerProgressBar: true,
                })
            } else {
                Swal.fire(`${GetIntlMessages(`${configModal.mode === "add" ? `สร้าง` : `แก้ไข`}ใบซื้อสินค้าไม่สำเร็จ !!`)}`, `กรุณาติดต่อเจ้าหน้าที่`, 'error')
            }

        } catch (error) {

        }
    }

    const onFinish = async (value) => {
        try {
            setLoading(() => true)
            // console.log('value :>> ', value);
            const {
                business_partner_id,
                doc_type_id,
                doc_date,
                // purchase_requisition_id,
                tax_type_id,
                price_discount_bill,
                price_sub_total,
                price_discount_total,
                price_amount_total,
                price_before_vat,
                price_vat,
                price_grand_total,
                shopPurchaseOrderLists,
                remark,
                remark_inside,
                ref_doc
            } = value;

            const _model = {
                business_partner_id,
                doc_type_id,
                doc_date: moment(doc_date).format("YYYY-MM-DD"),
                // purchase_requisition_id: purchase_requisition_id ?? null,
                tax_type_id,
                price_discount_bill: takeOutComma(price_discount_bill) ?? "0",
                price_sub_total: takeOutComma(price_sub_total) ?? "0",
                price_discount_total: takeOutComma(price_discount_total) ?? "0",
                price_amount_total: takeOutComma(price_amount_total) ?? "0",
                price_before_vat: takeOutComma(price_before_vat) ?? "0",
                price_vat: takeOutComma(price_vat) ?? "0",
                price_grand_total: takeOutComma(price_grand_total) ?? "0",
                details: {
                    remark,
                    remark_inside,
                    ref_doc
                },
                shopPurchaseOrderLists: (isArray(shopPurchaseOrderLists) && shopPurchaseOrderLists.length > 0) ?
                    shopPurchaseOrderLists.map((e, index) => {
                        const returnModel = {
                            seq_number: index + 1,
                            product_id: e?.product_id ?? null,
                            purchase_unit_id: e?.purchase_unit_id,
                            dot_mfd: e?.dot_mfd === "-" ? null : !!e?.dot_mfd ? e?.dot_mfd : null,
                            amount: e?.amount ?? null,
                            price_unit: takeOutComma(e?.price_unit) ?? "0",
                            price_discount: takeOutComma(e?.price_discount) ?? "0",
                            price_discount_percent: takeOutComma(e?.price_discount_percent) ?? "0",
                            price_grand_total: takeOutComma(e?.price_grand_total) ?? "0",
                            details: {
                                list_shop_stock: e?.list_shop_stock ?? [],
                                dot_mfd_list: e?.dot_mfd_list ?? [],
                                purchase_unit_list: e?.purchase_unit_list ?? [],
                                is_service: e?.is_service ?? false,
                                changed_name_status: e?.changed_name_status ?? false,
                                changed_product_name: e?.changed_product_name ?? null,
                            }
                        }
                        if (e.id && !!e.id) returnModel.id = e?.id

                        return returnModel
                    }) ?? [] : []

            }
            //8c73e506-31b5-44c7-a21b-3819bb712321 -> รวม vat
            //fafa3667-55d8-49d1-b06c-759c6e9ab064 -> ไม่รวม vat
            //52b5a676-c331-4d03-b650-69fc5e591d2c -> ไม่คิด vat
            switch (tax_type_id) {
                case "8c73e506-31b5-44c7-a21b-3819bb712321":
                    _model.vat_type = 1
                    break;
                case "fafa3667-55d8-49d1-b06c-759c6e9ab064":
                    _model.vat_type = 2
                    break;
                case "52b5a676-c331-4d03-b650-69fc5e591d2c":
                    _model.vat_type = 3
                    break;

                default:
                    setCheckTaxId(() => tax_type_id)
                    if (isPlainObject(detail)) {
                        price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
                        price_grand_total = price_amount_total + price_vat
                    }
                    break;
            }
            // _model.vat_type = 
            const log = []
            if (isArray(_model.shopPurchaseOrderLists) && _model.shopPurchaseOrderLists.length > 0) {
                _model.shopPurchaseOrderLists.find((where, index) => { if (where.product_id === null || where.price_unit === null || where.amount === null) log.push(index) })
            }
            // console.log('log :>> ', log);
            // console.log('_model :>> ', _model);
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
                        _model.shopPurchaseOrderLists = _model.shopPurchaseOrderLists.filter(where => { return where.product_id !== null && where.price_unit !== null && where.amount !== null })
                        if (configModal.mode === "add") {
                            // const { shop_id } = authUser.UsersProfile
                            // _model.shop_id = shop_id
                            res = await API.post(`/shopPurchaseOrderDoc/add`, _model)
                        } else if (configModal.mode === "edit") {
                            res = await API.put(`/shopPurchaseOrderDoc/put/${idEdit}`, _model)
                        }

                        await callBackResFinish(res)
                    }
                })
            } else {
                if (configModal.mode === "add") {
                    const { shop_id } = authUser.UsersProfile
                    // _model.shop_id = shop_id
                    res = await API.post(`/shopPurchaseOrderDoc/add`, _model)
                } else if (configModal.mode === "edit") {
                    // console.log('idEdit :>> ', idEdit);
                    res = await API.put(`/shopPurchaseOrderDoc/put/${idEdit}`, _model)
                }
                // console.log('res :>> ', res);
                await callBackResFinish(res)

            }
            // console.log('_model :>> ', _model);
            setLoading(() => false)
        } catch (error) {
            setLoading(() => false)
            // console.log('error :>> ', error);
        }
    }
    const onFinishFailed = () => {
        try {

        } catch (error) {

        }
    }

    /* End addEditView Modal */

    const [checkTaxId, setCheckTaxId] = useState(null)
    const calculateResult = () => {
        try {
            const { shopPurchaseOrderLists, tax_type_id, price_discount_bill } = form.getFieldsValue()
            const { detail } = taxTypes.find(where => where.id === tax_type_id)
            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_vat = 0, price_grand_total = 0

            if (isArray(shopPurchaseOrderLists) && shopPurchaseOrderLists.length > 0) {
                shopPurchaseOrderLists.forEach(e => {
                    price_sub_total += Number(takeOutComma(e?.price_unit) ?? 0) * Number(takeOutComma(e?.amount) ?? 0)
                    price_discount_total += (Number(takeOutComma(e?.price_discount) ?? 0) * Number(takeOutComma(e?.amount) ?? 0))
                })
            }

            if (!!price_discount_bill) price_discount_total = price_discount_total + Number(takeOutComma(price_discount_bill))

            price_amount_total = (price_sub_total - price_discount_total) ?? 0
            //8c73e506-31b5-44c7-a21b-3819bb712321 -> รวม vat
            //fafa3667-55d8-49d1-b06c-759c6e9ab064 -> ไม่รวม vat
            //52b5a676-c331-4d03-b650-69fc5e591d2c -> ไม่คิด vat
            switch (tax_type_id) {
                case "8c73e506-31b5-44c7-a21b-3819bb712321":
                    setCheckTaxId(() => tax_type_id)
                    if (isPlainObject(detail)) {
                        price_vat = ((price_amount_total * (Number(detail.tax_rate_percent) / ((Number(detail.tax_rate_percent) >= 10) ? Number(`1${Number(detail.tax_rate_percent)}`) : Number(`10${Number(detail.tax_rate_percent)}`)))))
                        price_before_vat = price_amount_total - price_vat
                        price_grand_total = price_amount_total
                    }
                    break;
                default:
                    setCheckTaxId(() => tax_type_id)
                    if (isPlainObject(detail)) {
                        price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
                        price_grand_total = price_amount_total + price_vat
                    }
                    break;
            }

            form.setFieldsValue({
                shopPurchaseOrderLists,
                price_discount_bill: RoundingNumber(price_discount_bill),
                price_discount_total: RoundingNumber(price_discount_total),
                price_sub_total: RoundingNumber(price_sub_total),
                price_amount_total: RoundingNumber(price_amount_total),
                price_before_vat: RoundingNumber(price_before_vat),
                price_vat: RoundingNumber(price_vat),
                price_grand_total: RoundingNumber(price_grand_total),
            });
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
            </>


            {/* add */}
            <ModalFullScreen
                maskClosable={false}
                title={<ModalFullScreenTitle title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")}${isPlainObject(permission_obj) ? permission_obj?.application_name[locale.locale] : ""}`} />}
                visible={isModalVisible}
                onOk={handleOkModal}
                onCancel={handleCancelModal}
                // okButtonProps={{ disabled: configModal.mode == "view" }}
                loading={loading}
                hideSubmitButton={configModal.mode === "view"}
                mode={configModal.mode}
            // CustomsButton={() => {
            //     return (
            //         <div>
            //             <span className='pr-3'>
            //                 <Button onClick={handleCancelModal} style={{ width: 100 }}>ยกเลิก</Button>
            //             </span>
            //             {configModal.mode != "add" ?
            //                 <span className='pr-3'>
            //                     <PrintOut documentId={form.getFieldValue().id} />
            //                 </span>
            //                 : ""}
            //             <span>
            //                 <Button disabled={configModal.mode == "view" || expireEditTimeDisable == true} type='primary' onClick={() => handleOkModal(0)} style={{ width: 100 }}>บันทึก</Button>
            //             </span>

            //         </div>

            //     )
            // }

            // }
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
                            <FormPurchaseDoc mode={configModal.mode} configModal={configModal} form={form} docTypeId={docTypeId} calculateResult={calculateResult} />
                        </div>
                        <div className='pr-5 pl-5 '>
                            <ProductListTable mode={configModal.mode} configModal={configModal} form={form} docTypeId={docTypeId} isTableNoStyle={true} calculateResult={calculateResult} checkTaxId={checkTaxId} />
                        </div>
                    </div>

                </Form>


                {/* <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinishAddEditViewModal}
                    onFinishFailed={onFinishFailedAddEditViewModal}
                >

                    <ImportDocAddEditViewModal pageId={'ad06eaab-6c5a-4649-aef8-767b745fab47'} form={form} mode={configModal.mode} expireDate={expireEditTimeDisable} getShopBusinessPartners={setShopBusinessPartners} calculateResult={calculateResult} />

                </Form> */}
            </ModalFullScreen>



            {/* --------------------------------------------------------------------------------------------------------------------------------------------------------- */}
        </>
    )
}

export default PurchaseOrder
