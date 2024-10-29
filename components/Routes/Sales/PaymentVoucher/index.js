import { FileAddOutlined } from '@ant-design/icons'
import { Button, Col, Form, message, Row, Tabs, Dropdown, Space, Menu, Modal } from 'antd'
import { get, isArray, isEmpty, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../util/Api'
import GetIntlMessages from '../../../../util/GetIntlMessages'
import { RoundingNumber } from '../../../shares/ConvertToCurrency'
import ModalFullScreen from '../../../shares/ModalFullScreen'
// import PrintOut from '../../../shares/PrintOut'
import SearchInput from '../../../shares/SearchInput'
import TableList from '../../../shares/TableList'
import CarPreloader from '../../../_App/CarPreloader'
import FormProductReturnReceiptDoc from './components/Components.Routes.Modal.FormPaymentVoucherDoc'
import ProductReturnReceiptDocLists from './components/Components.Routes.Modal.PaymentVoucherDocLists'
import PaymentDocs from './components/Components.Routes.Modal.PaymentDocsV2'
import PrintOut from '../../../shares/PrintOut'

const PaymentVoucherDoc = ({ docTypeId }) => {

    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { locale, mainColor, } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes, shopInCorporate, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const [disabledWhenDeliveryDocActive, setDisabledWhenDeliveryDocActive] = useState(false)
    const [disabledWhenTaxInvoiceDocActive, setDisabledWhenTaxInvoiceDocActive] = useState(false)
    const [expenseType, setExpenseType] = useState([])
    const [expenseTypeGroup, setExpenseTypeGroup] = useState([])

    const getStatusCarLoading = useCallback(
        (valStatus) => {
            setCarPreLoading(valStatus)
        },
        [carPreLoading],
    )


    const [form] = Form.useForm();

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        // getTextDocumentTypes()
        getMasterData()
        // configPrintOut()
    }, [])

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
            column: {
                created_by: false,
                created_date: false,
                updated_by: true,
                updated_date: true,
                status: true
            },
            title: {
                not_use_system: "ยกเลิกเอกสาร"
            },
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "default",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const getMasterData = async () => {
        try {
            const [value1, value2, value3] = await Promise.all([getTextDocumentTypes(), getExpensesTypeListAll(), getExpensesTypeGroupListAll()])
            const find = value1.find(where => where.id === docTypeId)
            setDocumentTypesName(find.type_name[locale.locale])
            setExpenseType(value2)
            setExpenseTypeGroup(value3)
        } catch (error) {

        }
    }

    const [documentTypesName, setDocumentTypesName] = useState("")
    const getTextDocumentTypes = async () => {
        try {
            const { data } = await API.get(`/master/documentTypes`);
            return data.status === "success" ? data.data ?? [] : []
        } catch (error) {

        }

    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setColumnsTable(value.status)
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
                label: GetIntlMessages("สถานะใบชำระค่าใช้จ่าย"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    {
                        key: GetIntlMessages("ใช้งานเอกสาร"),
                        value: "default",
                    },
                    {
                        key: GetIntlMessages("ยกเลิกเอกสาร"),
                        value: "0",
                    },
                ],
            },
        ],
        col: 8,
        button: {
            create: true,
            name: {
                add: GetIntlMessages(`สร้าง${`ใบชำระค่าใช้จ่าย` ?? documentTypesName}`),
            },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    const setColumnsTable = (searchStatus) => {
        const _column = [];
        _column.push(
            {
                title: () => GetIntlMessages("ลำดับ"),
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
                title: () => GetIntlMessages("เลขที่เอกสาร"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "start" }}>{text ?? ""}</div>
            },
            {
                title: () => GetIntlMessages("วันที่เอกสาร"),
                dataIndex: 'doc_date',
                key: 'doc_date',
                width: 150,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("ชื่อผู้จำหน่าย"),
                dataIndex: 'ShopBusinessPartners',
                key: 'ShopBusinessPartners',
                width: 200,
                render: (text, record) => !!text ? <div style={{ textAlign: "center" }}>{text?.partner_name[locale.locale] ?? "-"}</div> : "-",
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
                title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => !!text ? <div style={{ textAlign: "end" }}>{RoundingNumber((text.price_grand_total)) ?? "-"}</div> : "-",
            },
            {
                title: () => GetIntlMessages("สถานะการชำระเงิน"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('record :>> ', record),
                render: (text, record) => {

                    const payment_paid_status = get(record, `payment_paid_status`, null)
                    // console.log("payment_paid_status", payment_paid_status)
                    switch (payment_paid_status) {
                        case 1:
                            return (
                                <PaymentDocs fromTable={true} debtDocObj={record} docId={record?.id} title={`ชำระเงิน ใบชำระค่าใช้จ่าย ${record?.code_id ?? ""}`} handleCancelModal={handleCancelModal} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                // <span className='color-red font-16'>ยังไม่ชำระ</span>
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
                        <PrintOut textButton={"พิมพ์"} documentId={record?.id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }} customPriceUse={true} docTypeId={docTypeId} />
                    )
                },
            },
        )
        _column.map((x) => { x.use === undefined ? x.use = true : null })
        setColumns(_column.filter(x => x.use === true));
    }



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch?.status ?? "active" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopInventoryTransaction/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}${docTypeId ? `&doc_type_id=${docTypeId}` : ""}`)

            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data = data.map(e => {
                    e.___update = e.status === 0 ? false : e.payment_paid_status !== 1 ? false : true
                    e.___delete = false
                    e.disabled_change_status = e.status === 0 ? true : e.payment_paid_status === 1 ? false : true
                    e.isuse = e.status === 2 ? 1 : e.status
                    return {
                        ...e
                    }
                });
                setColumnsTable(_status)
                setListSearchDataTable(() => data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                // console.log(`res.data`, res.data)
                // message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            console.log('error :>> ', error);
            // message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            setLoading(true)
            const status = isuse

            Swal.fire({
                title: GetIntlMessages(`ยืนยันการยกเลิกเอกสาร หรือไม่ !?`),
                text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการยกเลิกเอกสารครั้งนี้ได้ !!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setLoading(true)
                    const { data } = await API.put(`/shopInventoryTransaction/put/${id}`, { status })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status,
                            shop_id: modelSearch.shop_id
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
                    setLoading(false)
                }
            })
            setLoading(false)
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        modeKey: null,
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [checkedIsuse, setCheckedIsuse] = useState(false);

    const handleCancel = () => {
        setLoading(() => true)
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        setDisabledWhenDeliveryDocActive(false)
        setDisabledWhenTaxInvoiceDocActive(false)
        setActiveKeyTab("1")
        form.setFieldsValue({
            isModalVisible: false
        })

        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        //  window.location.reload()
        setLoading(() => false)
    }

    // const [, set] = useState(second)
    /* addEditView */
    const addEditViewModal = async (mode, id, isPayment, isInovices) => {
        try {
            setLoading(true)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/shopInventoryTransaction/byid/${id}`)
                if (data.status == "success") {
                    setFormValueData(data.data)
                }
            } else {
                form.setFieldsValue({
                    doc_type_id: docTypeId,
                    tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                    doc_date: moment(new Date()),
                    isModalVisible: true,
                    is_inv: true,
                    tax_period: moment(new Date()),
                })
            }
            setActiveKeyTab("1")
            setIsModalVisible(true)
            setLoading(false)
        } catch (error) {
            console.log('error addEditViewModal:>> ', error);
        }
        // setMode(_mode)

    }

    const setFormValueData = async (value) => {
        try {
            // console.log("value ", value)
            setCarPreLoading(true)
            const initData = {
                product_list: []
            }
            const { details, code_id, ShopBusinessPartners, shop_id, id, ShopPaymentTransactions, payment_paid_status, status } = value;
            const dataDocInventoryId = await API.get(`/shopInventory/bydocinventoryid/${id}?${shop_id ? `shop_id=${shop_id}` : ""}${shop_id ? `&select_shop_ids=${shop_id}` : ""}`)

            if (dataDocInventoryId.data.status == "success") {
                const _model = dataDocInventoryId.data.data
                _model.product_list.map((e, index) => {
                    // console.log("e", e)
                    e.warehouse_detail.map((el) => {
                        try {
                            initData.product_list.push({
                                seq_number: el.other_details.seq_number,
                                list_id: e.ShopProduct.Product.master_path_code_id,
                                list_name: e.ShopProduct.Product.product_name[locale.locale],
                                dot: el.shelf.dot_mfd,
                                shelf_code: el.shelf.item,
                                warehouse_id: el.warehouse,
                                purchase_unit_id: el?.shelf?.purchase_unit_id,
                                purchase_unit_name: productPurchaseUnitTypes?.find(x => x?.id === el?.shelf?.purchase_unit_id)?.type_name[locale.locale],
                                price_unit: el.other_details.price_unit,
                                amount: el.shelf.amount,
                                price_grand_total: el.other_details.price_grand_total,
                                warehouse_detail: e.warehouse_detail,
                                ShopProduct: e.ShopProduct,
                                shop_product_id: e.ShopProduct.id,
                                expense_type_id: el.other_details.expense_type_id,
                                change_name_status: el.other_details.change_name_status ?? null,
                                expense_type_list: expenseType,
                                expense_group_list: expenseTypeGroup,
                                purchase_unit_list: e.ShopProduct.Product.ProductType.ProductPurchaseUnitTypes ?? null,
                            })
                        } catch (error) {
                            console.log("error", error)
                        }
                    })

                })
            }
            let partner_branch = ShopBusinessPartners?.other_details.branch ? ShopBusinessPartners?.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + ShopBusinessPartners?.other_details.branch_code + " " + ShopBusinessPartners?.other_details.branch_name + ")" : ""
            const model = {
                id: id,
                code_id: code_id,
                doc_date: moment(value.doc_date),
                remark: details.remark ?? null,
                remark_inside: details.remark_inside ?? null,
                tax_type_id: details.tax_type ?? null,
                product_list: initData.product_list,
                partner_id: ShopBusinessPartners.id,
                partner_code: ShopBusinessPartners.code_id,
                partner_name: ShopBusinessPartners.partner_name[locale.locale] + " " + partner_branch,
                is_inv: details.is_inv,
                tax_period: moment(details.tax_period),
                ref_doc: details.ref_doc,
                ShopPaymentTransactions,
                payment_paid_status,
                status,
            }
            // console.log("model", model)
            form.setFieldsValue({ ...model })
            calculateResult()
            setCarPreLoading(false)

        } catch (error) {
            console.log('error setFormValueData:>> ', error);
        }
    }


    /* Tabs*/
    const handleChangeTabs = (key) => {
        try {
            setActiveKeyTab(() => key)
        } catch (error) {

        }
    }
    /* end Tabs*/

    const ModalFullScreenTitle = ({ title, isShowTittle }) => {
        const { code_id } = form.getFieldValue()

        return (
            <>
                {isShowTittle ?
                    <>
                        <div style={{ paddingBottom: "16px" }}> {GetIntlMessages(configModal.mode == "view" ? "view-data" : configModal.mode == "edit" ? "edit-data" : "สร้าง")} {`${title}`}</div>
                        <div style={{ color: "#999999", fontSize: "1.4rem" }}>{code_id}</div>
                    </>
                    : null}
            </>
        )
    }


    /* end Modal */

    /*finish*/
    const handleOk = (modeKey) => {
        try {
            setLoading(() => true)
            setConfigModal({ ...configModal, modeKey })
            form.submit()
            setLoading(() => false)
        } catch (error) {
            console.log('error handleOk:>> ', error);
        }

    }

    const getExpensesTypeListAll = async () => {
        const { data } = await API.get(`/master/expensesType/all?limit=99999&page=1&sort=code_id&order=desc&status=default`);
        console.log('Type :>> ', data.data.data);
        return data.data.data
    }

    const getExpensesTypeGroupListAll = async () => {
        const { data } = await API.get(`/master/expensesTypeGroup/all?limit=99999&page=1&sort=code_id&order=desc&status=default`);
        console.log('TypeGroup :>> ', data.data.data);
        return data.data.data
    }

    const onFinish = async (values) => {
        try {
            // console.log('values :>> ', values);
            setLoading(true)
            setCarPreLoading(true)
            const {
                product_list,
                doc_date,
                remark,
                remark_inside,
                partner_id,
                partner_name,
                tax_type_id,
                price_before_vat,
                price_vat,
                price_grand_total,
                is_inv,
                tax_period,
                ref_doc,
            } = values;

            let product_arr = []
            product_list.map((e, index) => {
                let find = product_arr.find(x => x.product_id === e.shop_product_id)
                if (find === undefined) {
                    product_arr.push({
                        product_id: e?.shop_product_id,
                        warehouse_detail: [{
                            warehouse: e?.warehouse_id ?? null,
                            shelf: {
                                item: e?.shelf_code ?? null,
                                amount: +e?.amount ?? 0,
                                dot_mfd: e?.dot ?? null,
                                purchase_unit_id: e?.purchase_unit_id ?? null,
                            },
                            other_details: {
                                remark: e?.remark ?? null,
                                seq_number: index + 1,

                                list_id: e?.list_id ?? null,
                                list_name: e?.list_name ?? null,
                                change_name_status: e?.change_name_status ?? false,
                                price_discount: e?.price_discount ?? "0.00",
                                price_discount_percent: e?.price_discount_percent ?? "0.00",
                                price_discount_total: "0.00",

                                is_discount: e?.is_discount ?? false,
                                price_unit: !!e.price_unit ? Number(e.price_unit).toFixed(2) : '0.00',
                                price_unit_vat: e?.price_unit_vat ?? "0.00",
                                price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                                price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",

                                price_grand_total: !!e.price_grand_total ? Number(e.price_grand_total).toFixed(2) : '0.00',
                                price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                                price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                                price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                                is_discount_by_percent: e?.is_discount_by_percent ?? false,
                                is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                                expense_type_id: e?.expense_type_id ?? null,
                            }
                        }],
                        amount_all: (+e?.amount).toString() ?? "0",
                        amount: (+e?.amount).toString() ?? "0",
                        details: {
                            price_discount: e?.price_discount ?? "0.00",
                            price_discount_percent: e?.price_discount_percent ?? "0.00",
                            price_discount_total: "0.00",

                            is_discount: e?.is_discount ?? false,
                            price_unit: !!e.price_unit ? Number(e.price_unit).toFixed(2) : '0.00',
                            price_unit_vat: e?.price_unit_vat ?? "0.00",
                            price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                            price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",

                            price_grand_total: !!e.price_grand_total ? Number(e.price_grand_total).toFixed(2) : '0.00',
                            price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                            price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                            price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                            is_discount_by_percent: e?.is_discount_by_percent ?? false,
                            is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                        }

                    })
                } else {
                    let findindexx = product_arr.findIndex(x => x.product_id === find.product_id)
                    product_arr[findindexx].amount_all = ((+product_arr[findindexx].amount_all) + (+e?.amount) ?? 0).toString()
                    product_arr[findindexx].amount = ((+product_arr[findindexx].amount) + (+e?.amount) ?? 0).toString()

                    product_arr[findindexx].warehouse_detail.push({
                        warehouse: e?.warehouse_id ?? null,
                        shelf: {
                            item: e?.shelf_code ?? null,
                            amount: +e?.amount ?? 0,
                            dot_mfd: e?.dot ?? null,
                            purchase_unit_id: e?.purchase_unit_id ?? null,
                        },
                        other_details: {
                            remark: e?.remark ?? null,
                            seq_number: index + 1,

                            list_id: e?.list_id ?? null,
                            list_name: e?.list_name ?? null,
                            change_name_status: e?.change_name_status ?? false,
                            price_discount: e?.price_discount ?? "0.00",
                            price_discount_percent: e?.price_discount_percent ?? "0.00",
                            price_discount_total: "0.00",

                            is_discount: e?.is_discount ?? false,
                            price_unit: !!e.price_unit ? Number(e.price_unit).toFixed(2) : '0.00',
                            price_unit_vat: e?.price_unit_vat ?? "0.00",
                            price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                            price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",

                            price_grand_total: !!e.price_grand_total ? Number(e.price_grand_total).toFixed(2) : '0.00',
                            price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                            price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                            price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                            is_discount_by_percent: e?.is_discount_by_percent ?? false,
                            is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                            expense_type_id: e?.expense_type_id ?? null,
                        },
                        details: {
                            price_discount: e?.price_discount ?? "0.00",
                            price_discount_percent: e?.price_discount_percent ?? "0.00",
                            price_discount_total: "0.00",

                            is_discount: e?.is_discount ?? false,
                            price_unit: !!e.price_unit ? Number(e.price_unit).toFixed(2) : '0.00',
                            price_unit_vat: e?.price_unit_vat ?? "0.00",
                            price_unit_before_vat: e?.price_unit_before_vat ?? "0.00",
                            price_unit_add_vat: e?.price_unit_add_vat ?? "0.00",

                            price_grand_total: !!e.price_grand_total ? Number(e.price_grand_total).toFixed(2) : '0.00',
                            price_grand_total_vat: e?.price_grand_total_vat ?? "0.00",
                            price_grand_total_before_vat: e?.price_grand_total_before_vat ?? "0.00",
                            price_grand_total_add_vat: e?.price_grand_total_add_vat ?? "0.00",

                            is_discount_by_percent: e?.is_discount_by_percent ?? false,
                            is_discount_by_bath: e?.is_discount_by_bath ?? "0.00",
                        }
                    })
                }
            });

            const { detail } = taxTypes.find(where => where.id === tax_type_id)

            let taxRate = 0
            if (Number(detail.tax_rate_percent) > 9) {
                taxRate = Number(`1${detail.tax_rate_percent}`)
            } else {
                taxRate = Number(`10${detail.tax_rate_percent}`)
            }

            const model = {
                shop_id: authUser.UsersProfile.shop_id,
                bus_partner_id: partner_id,
                doc_date: moment(doc_date).format("YYYY-MM-DD"),
                details: {
                    remark,
                    remark_inside,
                    tailgate_discount: "0.00",
                    tax_type: tax_type_id,
                    total_discount: "0.00",
                    total_price_all: !!price_before_vat ? Number(price_before_vat).toFixed(2) : '0.00',
                    total_price_all_after_discount: !!price_before_vat ? Number(price_before_vat).toFixed(2) : '0.00',
                    vat: !!price_vat ? Number(price_vat).toFixed(2) : '0.00',
                    price_grand_total: !!price_grand_total ? Number(price_grand_total).toFixed(2) : '0.00',
                    price_before_vat: !!price_before_vat ? Number(price_before_vat).toFixed(2) : '0.00',
                    partner_id: partner_id,
                    partner_name: partner_name,
                    is_inv,
                    tax_period: moment(tax_period).format("YYYY-MM"),
                    ref_doc,
                },
                doc_type_id: docTypeId,
                status: 1,
                price_grand_total: !!price_grand_total ? Number(price_grand_total).toFixed(2) : '0.00',
                use_stock: false,
                [configModal.mode === "add" ? "ShopInventory_Add" : "ShopInventory_Put"]: {
                    import_date: moment(doc_date).format("YYYY-MM-DD"),
                    status: 1,
                    product_list: product_arr
                },
            }

            // console.log('model :>> ', model);
            let res

            if (configModal.mode === "add") {
                res = await API.post(`/shopInventoryTransaction/add`, model)
            } else if (configModal.mode === "edit") {
                const { id } = form.getFieldValue()
                res = await API.put(`/shopInventoryTransaction/put/${id}`, model)
            }

            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบชำระค่าใช้จ่ายสำเร็จ !!"),
                    icon: "success",
                    timer: 2000
                })
                handleCancel()

            } else {
                Swal.fire({
                    title: GetIntlMessages("บันทึกไม่สำเร็จ..กรุณาติดต่อเจ้าหน้าที่ !!"),
                    text: res.data.data,
                    icon: "error",
                })
            }
            setLoading(false)
            setCarPreLoading(false)

        } catch (error) {
            setLoading(false)
            setCarPreLoading(false)
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = () => {
        try {

        } catch (error) {

        }
    }
    /*end finish*/

    const calculateResult = () => {
        try {
            const { product_list, price_discount_bill, tax_type_id } = form.getFieldValue()
            price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0;

            function summaryFromTable(arr, key, mutiplyWithAmount = false) {
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
                    if (mutiplyWithAmount) {
                        return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                    } else {
                        return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
                    }
                }
            }

            if (!!product_list && isArray(product_list) && product_list.length > 0) {
                price_discount_total = Number(summaryFromTable(product_list, "price_discount", true)) + (Number(price_discount_bill) ?? 0) + Number(summaryFromTable(product_list, "price_unit", true))
                price_sub_total = summaryFromTable(product_list, "price_grand_total", false) + (price_discount_total - price_discount_bill)
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
            // console.log('error calculateResult :>> ', error);
        }
    }

    const handleCancelModal = () => {
        console.log("cencle")
        try {
            setIsModalVisible(false)
            setConfigModal({ ...configModal, mode: "add" })
            form.resetFields()
            onReset()
        } catch (error) {
            console.log(error)
        }

    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} />

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                mode={configModal.mode}
                title={<ModalFullScreenTitle title={`ใบชำระค่าใช้จ่าย` ?? documentTypesName} isShowTittle={true} />}
                loading={loading}
                onCancel={handleCancelModal}
                CustomsButton={() => {
                    return (
                        <div style={{ width: "100%", display: "flex", justifyContent: "end" }}>
                            <>
                                <Row gutter={[10, 10]} justify="end" style={{ width: "100%" }}>
                                    <>
                                        <Col xxl={{ span: 4, offset: 8 }} lg={6} md={12} xs={24} >
                                            <Button loading={loading} style={{ width: "100%" }} onClick={() => handleCancel()}>{configModal.mode === "view" ? GetIntlMessages("ปิด") : GetIntlMessages("cancel")}</Button>
                                        </Col>
                                        <Col xxl={4} lg={6} md={12} xs={24} hidden={configModal.mode === "view" || disabledWhenDeliveryDocActive || disabledWhenTaxInvoiceDocActive} >
                                            <Button loading={loading} onClick={() => handleOk()} style={{ width: "100%" }} type='primary'>{GetIntlMessages("บันทึก")}</Button>
                                        </Col>
                                        <Col hidden={configModal.mode === "add"}>
                                            <PrintOut textButton={"พิมพ์"} documentId={form.getFieldValue().id} style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "hidden" }} customPriceUse={true} docTypeId={docTypeId} />
                                        </Col>
                                        <Col hidden={configModal.mode === "add"}>
                                            <PaymentDocs loading={loading || carPreLoading} docId={form.getFieldValue().id} title={`ชำระเงิน ใบรับสินค้า ${form.getFieldValue("code_id") ?? ""}`} handleCancelModal={handleCancelModal} initForm={form} carPreLoading={carPreLoading} setCarPreLoading={setCarPreLoading} />
                                        </Col>
                                    </>
                                </Row>
                            </>
                        </div>
                    )
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 24 }}
                    layout={"vertical"}
                    labelWrap
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    scrollToFirstError={true}
                    initialValues={{
                        partner_credit_debt_unpaid_balance: null,
                        partner_credit_debt_current_balance: null,
                        partner_credit_debt_approval_balance: null,
                        partner_credit_debt_payment_period: null,
                        remark: null,
                        remark_inside: null,
                        debt_price_paid_total: null,
                        ref_doc_list: [],
                        product_list: [],
                        options_list: [],
                        doc_sales_type: 1,
                        expenseType: expenseType,
                        expenseTypeGroup: expenseTypeGroup
                    }}
                >
                    {
                        carPreLoading ? <CarPreloader />
                            :
                            <div className="container-fluid">
                                <div className='pr-5 pl-5 detail-before-table'>
                                    <FormProductReturnReceiptDoc mode={configModal.mode} calculateResult={calculateResult} form={form} getStatusCarLoading={getStatusCarLoading} setIsModalVisible={setIsModalVisible} />
                                </div>
                                <div className='tab-detail'>
                                    <Tabs
                                        defaultActiveKey="1"
                                        activeKey={activeKeyTab}
                                        onChange={handleChangeTabs}
                                        items={[
                                            {
                                                label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> สินค้า</span>),
                                                key: '1',
                                                children: <ProductReturnReceiptDocLists calculateResult={calculateResult} mode={configModal.mode} expenseType={expenseType} expenseTypeGroup={expenseTypeGroup} />,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                    }

                </Form>
            </ModalFullScreen>
        </>
    )
}

export default PaymentVoucherDoc