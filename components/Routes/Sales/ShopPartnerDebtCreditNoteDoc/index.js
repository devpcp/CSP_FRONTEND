import { FileAddOutlined } from '@ant-design/icons'
import { Button, Col, Form, message, Row, Tabs, Dropdown, Space, Menu } from 'antd'
import { get, isArray, isEmpty, isPlainObject, isFunction } from 'lodash'
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
import FormTemporaryDeliveryOrderDoc from './components/Components.Routes.Modal.FormDebtorDoc'
import Tab1ServiceAndProductV2 from './components/Components.Routes.Modal.Tab1.DocumentDebtLists'
import PrintOut from '../../../shares/PrintOut'

const DebtorDoc = ({ docTypeId, title = null, callBack, }) => {

    const [loading, setLoading] = useState(false);
    const [carPreLoading, setCarPreLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { locale, mainColor, } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes } = useSelector(({ master }) => master);
    const [disabledWhenDeliveryDocActive, setDisabledWhenDeliveryDocActive] = useState(false)
    const [disabledWhenTaxInvoiceDocActive, setDisabledWhenTaxInvoiceDocActive] = useState(false)

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
            disabled: {
                active_btn: disabledWhenDeliveryDocActive ? true : false,
                block_btn: true,
                delete_btn: true,
            }
        },
        configSort: {
            sort: `created_date`,
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

    const getMasterData = async () => {
        try {
            const [value1] = await Promise.all([getTextDocumentTypes()])
            const find = value1.find(where => where.id === docTypeId)
            setDocumentTypesName(find.type_name[locale.locale])

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

    const { enable_ShopSalesTransaction_legacyStyle } = authUser?.UsersProfile?.ShopsProfile?.shop_config
    /**
     * ตั้งค่าหน้า
     */
    const configPage = (type) => {
        try {
            // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
            const { status } = form.getFieldValue()
            if (!!status) status = status.toString()
            switch (type) {
                case "title":
                    if (enable_ShopSalesTransaction_legacyStyle) {
                        if (status === "2") {
                            return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                        } else if (status === "3") {
                            return GetIntlMessages("ใบกำกับภาษี")
                            // return GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี")
                        }
                    }
                    break;
                case "table-status-2":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ยกเลิกเอกสาร")
                    // if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                    break;
                case "table-status-3":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ลบเอกสาร")
                    // if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบกำกับภาษี")
                    break;
                case "btn-status":
                    if (enable_ShopSalesTransaction_legacyStyle && status === "1") return GetIntlMessages("สร้างใบส่งสินค้าชั่วคราว")
                    break;
                case "btn-payment":
                    if (enable_ShopSalesTransaction_legacyStyle && status === "2") return GetIntlMessages("สร้างใบกำกับภาษี")
                    break;
                case "style":
                    if (enable_ShopSalesTransaction_legacyStyle) return { width: "auto" }
                    break;

                default: return null
            }
        } catch (error) {
            console.log('error :>> ', error);
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
                label: GetIntlMessages("สถานะใบรับชำระลูกหนี้"),
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
                    // {
                    //     key: configPage("table-status-3") ?? GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี"),
                    //     value: "delete",
                    // },
                ],
            },
        ],
        col: 8,
        button: {
            create: true,
            name: {
                add: GetIntlMessages(`สร้าง${`ใบลดหนี้เจ้าหนี้` ?? documentTypesName}`),
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
                width: 180,
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
                title: () => GetIntlMessages("รหัสผู้จำหน่าย"),
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => get(record?.ShopBusinessPartner, "code_id", "-"),
            },
            {
                title: () => GetIntlMessages("ชื่อผู้จำหน่าย"),
                dataIndex: '',
                key: '',
                width: 250,
                // align: "center",
                render: (text, record) => get(record?.ShopBusinessPartner?.partner_name, [locale.locale], "-"),
            },
            {
                title: GetIntlMessages("สำนักงาน"),
                dataIndex: 'ShopBusinessPartner',
                key: 'ShopBusinessPartner',
                width: 200,
                use: true,
                render: (text, record) => {
                    try {
                        switch (record.ShopBusinessPartner.other_details.branch) {
                            case "office":
                                return "สำนักงานใหญ่"
                            case "branch":
                                return `สาขา${record.ShopBusinessPartner.other_details.branch_code === record.ShopBusinessPartner.other_details.branch_name ? " " : ` ${record.ShopBusinessPartner.other_details.branch_code} `}${record.ShopBusinessPartner.other_details.branch_name}`
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
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                render: (text, record) => !!text ? <div style={{ textAlign: "end" }}>{RoundingNumber((text)) ?? "-"}</div> : "-",
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
            const res = await API.get(`/shopPartnerDebtCreditNoteDoc/all?search=${search}&status=${_status}&page=${page}&limit=${limit}&sort=${sort}&order=${order}`)
            // const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
            // console.log('res :>> ', res);
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data = data.map(e => {
                    // if (e.payment_paid_status !== 1) {
                    //     e.___update = false
                    // }
                    e.___delete = false
                    e.isuse = e.status === 2 ? 0 : e.status == 0 ? 2 : e.status
                    return {
                        ...e
                    }
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
            console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            setLoading(true)
            // delete,active,block
            //เนื่องจาก
            const status = isuse === 0 ? 2 : isuse == 2 ? 0 : 1 // api 0 คือ ลบเอกสาร แต่ front 0 คือ ยกเลิก , api 2 คือ ยกเลิก แต่ front 2 คือ ลบ 
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
                    setLoading(true)
                    const { data } = await API.put(`/shopPartnerDebtCreditNoteDoc/put/${id}`, { status })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status
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
                const { data } = await API.get(`/shopPartnerDebtCreditNoteDoc/byId/${id}`)
                // console.log('data addEditViewModal :>> ', data);
                if (data.status == "success") {
                    // setDataSendToComponeteToPrint(data.data)
                    setFormValueData(data.data)
                }
            } else {
                form.setFieldsValue({
                    doc_type_id: docTypeId,
                    tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                    user_list: [],
                    user_id: authUser.id,
                    status: "1",
                    doc_date: moment(new Date()),
                    isModalVisible: true,
                    list_service_product: [],
                    vehicles_partners_list: [],
                    partner_list: [],
                    partner_phone_list: [],
                    easy_search_list: [],
                    debtor_billing_list: [],
                    tax_period: moment(new Date()),
                })
            }
            // setActiveKeyTab("1")
            setIsModalVisible(true)
            setLoading(false)
        } catch (error) {
            console.log('error addEditViewModal:>> ', error);
        }
        // setMode(_mode)

    }

    const setFormValueData = async (value) => {
        try {
            setCarPreLoading(true)
            console.log('value setFormValueData:>> ', value);
            const { ShopPartnerDebtCreditNoteLists, details, bus_partner_id, ShopBusinessPartner, shop_inventory_import_doc_id } = value;
            function customPartnerName(arr) {
                return arr.map(e => { return { ...e, partner_name: `${e.partner_name[locale.locale]}` } })
            }


            let options_list = []
            if (!!shop_inventory_import_doc_id) {
                const { data } = await API.get(`/shopInventory/bydocinventoryid/${shop_inventory_import_doc_id}`)
                options_list = data?.data?.product_list
            }

            const model = {
                ...value,
                shop_inventory_import_doc_id: shop_inventory_import_doc_id ?? null,
                ref_doc_list: !!details.meta_data.ShopInventoryImportDoc ? [details.meta_data?.ShopInventoryImportDoc] ?? [] : [],
                options_list,
                arr_debt_list: ShopPartnerDebtCreditNoteLists,
                doc_date: moment(value.doc_date),
                debt_due_date: moment(value.debt_due_date),
                partner_list: customPartnerName([ShopBusinessPartner]),
                partner_id: bus_partner_id,
                remark: details.remark ?? null,
                remark_inside: details.remark_inside ?? null,
                ref_doc: details.ref_doc ?? null,
                tax_period: moment(details.tax_period) ?? null
            }

            form.setFieldsValue({ ...model })
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
        const { code_id, TRN_code_id, INV_code_id } = form.getFieldValue()
        const { status } = form.getFieldValue()
        // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
        const isShowButtonstatus1 = () => {

            return (configModal.mode == "edit") && status == 1 && isShowTittle == false
        }

        const onClickButtonstatus1 = () => {
            const { id, list_service_product } = form.getFieldValue()

            let checkObjIsEmpty = false
            let countEmpty = 0
            const emptyListLog = []
            list_service_product.map((e, index) => {
                if (isEmpty(e) || !e?.id) countEmpty++, emptyListLog.push(index)
            })
            if (countEmpty == list_service_product.length) checkObjIsEmpty = true
            if (isArray(list_service_product) && checkObjIsEmpty === true) {
                Swal.fire({
                    title: 'ไม่มีสินค้าในรายการ !!',
                    icon: 'warning',
                    confirmButtonColor: mainColor,
                    confirmButtonText: 'ตกลง',
                    cancelButtonText: 'ยกเลิก'
                })
            } else {
                if (emptyListLog.length > 0) {
                    Swal.fire({
                        title: `รายการที่ ${emptyListLog.map(e => e).join(" , ")} มีข้อมูลไม่ครบถ้วน!!`,
                        // text: "สถานะจะถูกเปลี่ยนเป็นดำเนินการเรียบร้อย",
                        icon: 'error',
                        showCancelButton: false,
                        confirmButtonColor: mainColor,
                        confirmButtonText: 'ตกลง',
                        // cancelButtonText: 'ยกเลิก'
                    })
                } else {
                    Swal.fire({
                        title: 'ยืนยันการทำรายการ?',
                        text: `สถานะจะถูกเปลี่ยนเป็น ${configPage("table-status-2") ?? `ดำเนินการเรียบร้อย`}`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'ตกลง',
                        cancelButtonText: 'ยกเลิก'
                    }).then(async (result) => {
                        if (result.isConfirmed) {
                            await onFinish(form.getFieldValue(), true)
                            await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: 2 }).then(async ({ data }) => {
                                if (data.status != "success") {
                                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                                } else {
                                    const { ShopDocumentCode } = data.data.details
                                    Swal.fire(
                                        'บันทึกสำเร็จ',
                                        `เปลี่ยนสถานะเป็น${configPage("table-status-2") ?? `ดำเนินการเรียบร้อย`}`,
                                        'success'
                                    )
                                    form.setFieldsValue({ status: data.data.status, TRN_code_id: ShopDocumentCode?.TRN?.code_id ?? null })
                                    setConfigModal(() => ({ ...configModal, mode: 'edit', modeKey: null }))

                                    await getDataSearch({
                                        page: configTable.page,
                                        search: modelSearch.search,
                                        _status: modelSearch.status,
                                    })
                                    // handleCancel()
                                }

                            })

                        }
                    })
                }

            }


        }
        return (
            <>
                {isShowTittle ?
                    <>
                        <span className='pr-2'> {GetIntlMessages(configModal.mode == "view" ? "view-data" : configModal.mode == "edit" ? "edit-data" : "สร้าง")} {`${configPage("title") ?? title} ${form.getFieldValue("is_draft") ? `(ฉบับร่าง)` : ""}`}</span>
                        <span >{(enable_ShopSalesTransaction_legacyStyle === false) ? code_id : status == 1 ? code_id : status == 2 ? TRN_code_id : status == 3 ? INV_code_id : null}</span>
                    </>
                    : null}

                {
                    isShowButtonstatus1() ?
                        <span style={{ paddingLeft: 15 }}>
                            <Button style={{ borderColor: "#000000" }} onClick={onClickButtonstatus1}>{configPage("btn-status") ?? GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? "ยืนยันใบสั่งขาย" : "ดำเนินการเรียบร้อย")}</Button>
                        </span> : null
                }
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

    const onFinish = async (values) => {
        try {
            // console.log('values :>> ', values);
            setLoading(true)
            setCarPreLoading(true)
            const {
                debt_price_paid_total,
                bus_partner_id,
                arr_debt_list,
                doc_date,
                debt_due_date,
                remark,
                remark_inside,
                partner_credit_debt_unpaid_balance,
                partner_credit_debt_current_balance,
                partner_credit_debt_approval_balance,
                partner_credit_debt_payment_period,
                tax_type_id,
                price_sub_total,
                price_before_vat,
                price_vat,
                price_grand_total,
                ref_doc
            } = values;

            const { detail } = taxTypes.find(where => where.id === tax_type_id)

            let taxRate = 0
            if (Number(detail.tax_rate_percent) > 9) {
                taxRate = Number(`1${detail.tax_rate_percent}`)
            } else {
                taxRate = Number(`10${detail.tax_rate_percent}`)
            }

            const model = {
                shop_id: authUser.UsersProfile.shop_id,
                doc_type_id: docTypeId,
                doc_date: moment(doc_date).format("YYYY-MM-DD"),
                debt_due_date: moment(debt_due_date).format("YYYY-MM-DD"),
                bus_partner_id: bus_partner_id,
                partner_credit_debt_unpaid_balance: !!partner_credit_debt_unpaid_balance ? Number(partner_credit_debt_unpaid_balance).toFixed(2) : '0.00',
                partner_credit_debt_current_balance: !!partner_credit_debt_current_balance ? Number(partner_credit_debt_current_balance).toFixed(2) : '0.00',
                partner_credit_debt_approval_balance: !!partner_credit_debt_approval_balance ? Number(partner_credit_debt_approval_balance).toFixed(2) : '0.00',
                partner_credit_debt_payment_period,
                debt_price_paid_total: !!debt_price_paid_total ? Number(debt_price_paid_total).toFixed(2) : "0.00",
                tax_type_id,
                vat_rate: taxRate,
                price_sub_total: !!price_sub_total ? Number(price_sub_total).toFixed(2) : '0.00',
                price_before_vat: !!price_before_vat ? Number(price_before_vat).toFixed(2) : '0.00',
                price_vat: !!price_vat ? Number(price_vat).toFixed(2) : '0.00',
                price_grand_total: !!price_grand_total ? Number(price_grand_total).toFixed(2) : '0.00',
                shop_inventory_import_doc_id: values.shop_inventory_import_doc_id ?? null,
                debt_credit_note_type: values.debt_credit_note_type ?? null,
                details: {
                    ref_doc,
                    remark,
                    remark_inside,
                    tax_period: moment(values.tax_period).format("YYYY-MM")
                },
                shopPartnerDebtCreditNoteLists: !!arr_debt_list && arr_debt_list.length > 0 ?
                    arr_debt_list.map((e, index) => {
                        // console.log('e :>> ', e);
                        const _model = {
                            id: e?.id ?? null,
                            seq_number: index + 1,
                            shop_inventory_import_doc_id: values.shop_inventory_import_doc_id ?? null,
                            product_id: e?.product_id ?? null,
                            shop_product_id: e?.shop_product_id ?? null,
                            list_id: e?.list_id ?? null,
                            list_name: e?.list_name ?? null,
                            price_unit: e?.price_unit ?? '0.00',
                            amount: e?.amount ?? '0',
                            price_grand_total: e?.price_grand_total ?? '0',
                            details: {}
                        }

                        return _model
                    })
                    : []
            }
            // console.log('model :>> ', model);
            let res

            if (configModal.mode === "add") {
                res = await API.post(`/shopPartnerDebtCreditNoteDoc/add`, model)
            } else if (configModal.mode === "edit") {
                const { id } = form.getFieldValue()
                res = await API.put(`/shopPartnerDebtCreditNoteDoc/put/${id}`, model)
            }

            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบลดหนี้เจ้าหนี้สำเร็จ !!"),
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

            // Swal.fire({
            //     title: `ยืนยันการทำรายการหรือไม่ !?`,
            //     // text: `รายการที่ ${invalidList.map(e => e + 1)} มีข้อมูลไม่ครบถ้วน รายการเหล่านี้จะไม่ถูกบันทีกหากท่านยืนยัน !!`,
            //     icon: "question",
            //     showCancelButton: true,
            //     confirmButtonText: GetIntlMessages("submit"),
            //     confirmButtonColor: mainColor,
            //     cancelButtonText: GetIntlMessages("cancel")
            // }).then(async (result) => {
            //     if (result.isConfirmed) {
            //         setCarPreLoading(true)

            //         if (configModal.mode === "add") {
            //             res = await API.post(`/shopCustomerDebtDoc/add`, model)
            //         } else if (configModal.mode === "edit") {
            //             const { id } = form.getFieldValue()
            //             res = await API.put(`/shopCustomerDebtDoc/put/${id}`, model)
            //         }

            //         resultSubmit(res)
            //         setCarPreLoading(false)
            //     } else {
            //         setCarPreLoading(false)
            //     }

            // })
            setLoading(false)
            setCarPreLoading(false)

        } catch (error) {
            setLoading(false)
            setCarPreLoading(false)
            console.log('error :>> ', error);
        }
    }

    const resultSubmit = (res) => {
        try {
            if (res.data.status === "success") {
                Swal.fire({
                    title: GetIntlMessages("บันทึกใบลดหนี้เจ้าหนี้สำเร็จ !!"),
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
        } catch (error) {

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
            const { arr_debt_list, price_discount_bill, tax_type_id, price_from_doc } = form.getFieldValue()
            price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
            let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0, debt_price_paid_total = 0, price_different = 0, price_should_be = 0;

            function summaryFromTable(arr, key, mutiplyWithAmount = false) {
                if (mutiplyWithAmount) {
                    return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
                } else {
                    return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
                }

            }

            // if (!!arr_debt_list && isArray(arr_debt_list) && arr_debt_list.length > 0) {
            //     price_grand_total = summaryFromTable(arr_debt_list, "price_grand_total")
            // }

            if (!!arr_debt_list && isArray(arr_debt_list) && arr_debt_list.length > 0) {
                price_discount_total = Number(summaryFromTable(arr_debt_list, "price_discount", true)) + (Number(price_discount_bill) ?? 0)
                price_sub_total = summaryFromTable(arr_debt_list, "price_unit", true)
                // price_sub_total = summaryFromTable(arr_debt_list, "price_grand_total", true) + (price_discount_total - price_discount_bill)
                price_grand_total = price_sub_total
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
                        // setCheckTaxId(tax_type_id)

                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / taxRate)))
                            price_before_vat = price_amount_total - price_vat
                            // net_total = (total_before_vat - tailgate_discount) + vat
                            price_grand_total = price_amount_total
                        }
                        break;

                    default:
                        // setCheckTaxId("")
                        if (isPlainObject(detail)) {
                            price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
                            price_grand_total = price_amount_total + price_vat
                            price_before_vat = price_grand_total - price_vat
                        }
                        break;
                }
                price_should_be = price_from_doc - price_grand_total
                price_different = price_grand_total
            }

            form.setFieldsValue({
                // price_discount_bill: !!price_discount_bill ? price_discount_bill.toFixed(2) : null,
                price_sub_total,
                // price_discount_total,
                // price_amount_total,
                price_vat,
                price_before_vat,
                price_grand_total,
                // price_discount_before_pay,
                // debt_price_paid_total
                price_should_be,
                price_different,
            })
        } catch (error) {
            // console.log('error calculateResult :>> ', error);
        }
    }

    /*invoices button*/
    const [taxInvoiceTypeAbbActive, setTaxInvoiceTypeAbbActive] = useState(null)
    const [taxInvoiceTypeInvActive, setTaxInvoiceTypeInvActive] = useState(null)
    const handleMenuClick = async (e) => {
        try {
            setLoading(true)
            const { shop_service_order_doc_id, ShopServiceOrderDoc } = form.getFieldValue(), findTaxInovicesActiveDoc = ShopServiceOrderDoc?.ShopTaxInvoiceDocs.find(where => where.shop_service_order_doc_id === id && where.status === 1);
            const model = {
                shop_service_order_doc_id,
                [e.key === "1" ? "is_abb" : "is_inv"]: true
            }
            let res

            Swal.fire({
                title: `ยืนยันการสร้างใบกำกับภาษี${e.key === "1" ? `อย่างย่อ` : `เต็มรูป`} หรือไม่ ?`,
                // text: res.data.data, 
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: GetIntlMessages("submit"),
                confirmButtonColor: mainColor
            }).then(async (result) => {
                if (result.isConfirmed) {
                    setCarPreLoading(true)
                    // res = await API.post(`/shopTaxInvoiceDoc/add`, model)
                    if ((isArray(ShopServiceOrderDoc?.ShopTaxInvoiceDocs) && ShopServiceOrderDoc?.ShopTaxInvoiceDocs.length === 0) || !findTaxInovicesActiveDoc) {
                        res = await API.post(`/shopTaxInvoiceDoc/add`, model)
                    } else {
                        delete model.shop_service_order_doc_id
                        res = await API.put(`/shopTaxInvoiceDoc/put/${findTaxInovicesActiveDoc.id}`, model)
                    }

                    if (res.data.status === "success") {
                        Swal.fire({ title: `สร้างใบกำกับภาษี${e.key === "1" ? `อย่างย่อ` : `เต็มรูป`}สำเร็จ !!`, icon: 'success', timer: 2000, timerProgressBar: true })
                        // addEditViewModal("edit", id)
                        handleCancel()
                    } else {
                        Swal.fire({ title: 'มีบางอย่างผิดพลาด !!', text: res.data.data, icon: 'error', confirmButtonText: GetIntlMessages("submit"), confirmButtonColor: mainColor })
                    }
                    setCarPreLoading(false)
                }
            })
            setLoading(false)
        } catch (error) {
            setCarPreLoading(false)
            setLoading(false)
        }
    }

    const menu = (
        <Menu
            items={[
                {
                    key: '1',
                    label: 'อย่างย่อ',
                    disabled: taxInvoiceTypeAbbActive,
                    onClick: handleMenuClick,
                },
                {
                    key: '2',
                    label: 'เต็มรูป',
                    onClick: handleMenuClick,
                    disabled: taxInvoiceTypeInvActive,
                },
            ]}
        />
    );
    /*end invoices button*/

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} title={title !== null ? false : true} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} />
            {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} specificFunction={specificFunction} /> */}

            <ModalFullScreen
                maskClosable={false}
                visible={isModalVisible}
                mode={configModal.mode}
                title={<ModalFullScreenTitle title={`ใบลดหนี้เจ้าหนี้` ?? documentTypesName} isShowTittle={true} />}
                loading={loading}
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
                        arr_debt_list: [],
                        options_list: [],
                        doc_sales_type: 1,
                        debt_credit_note_type: 1,
                    }}
                >
                    {
                        carPreLoading ? <CarPreloader />
                            :
                            <div className="container-fluid">
                                <div className='pr-5 pl-5 detail-before-table'>
                                    <FormTemporaryDeliveryOrderDoc mode={configModal.mode} calculateResult={calculateResult} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} form={form} getStatusCarLoading={getStatusCarLoading} />
                                </div>
                                <div className='tab-detail'>
                                    <Tabs
                                        defaultActiveKey="1"
                                        activeKey={activeKeyTab}
                                        onChange={handleChangeTabs}
                                        items={[
                                            {
                                                label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> เอกสาร</span>),
                                                key: '1',
                                                children: <Tab1ServiceAndProductV2 calculateResult={calculateResult} mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />,
                                            },
                                            // {
                                            //     label: (<span><DollarOutlined style={{ fontSize: 18 }} /> ข้อมูลการชำระเงิน</span>),
                                            //     key: '2',
                                            //     children: <TabPaymentInfo data={paymentTransactions} />,
                                            // },
                                        ]}
                                    />

                                    {/* </Tabs> */}
                                </div>
                            </div>
                    }

                </Form>
            </ModalFullScreen>
        </>
    )
}

export default DebtorDoc