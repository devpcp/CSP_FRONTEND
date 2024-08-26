import { useEffect, useState, useRef, useCallback } from 'react'
import { message, Form, Tabs, Button, Popover, Dropdown, Menu, Row } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined, ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import API from '../../../util/Api'
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { useSelector } from 'react-redux';
import SearchInput from '../../shares/SearchInput'
import TableList from '../../shares/TableList'
import GetIntlMessages from '../../../util/GetIntlMessages';
import Swal from "sweetalert2";

import FormServicePlans from './ServicePlans/Components.Routes.Modal.FormServicePlans'
import Tab1ServiceProduct from './ServicePlans/Components.Routes.Modal.Tab1.ServiceProduct'
import Tab2Custome from './ServicePlans/Components.Routes.Modal.Tab2.Custome'
import ModalFullScreen from '../../shares/ModalFullScreen';
import moment from 'moment'
import { get, isArray, isEmpty, isFunction, isPlainObject, isString } from 'lodash';
import Tab4Vehicle from './ServicePlans/Components.Routes.Modal.Tab4.Vehicle';
import PaymentDocs from './ServicePlans/Components.Routes.Modal.PaymentDocs';
import ComponentToPrint from "./CreatePdf/index";
import PrintOut from "../../shares/PrintOut";
import { RoundingNumber, NoRoundingNumber } from "../../shares/ConvertToCurrency";

const { TabPane } = Tabs;
const ShopSalesTransactionDoc = ({ docTypeId }) => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี

    const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile?.shop_config

    /**
     * ตั้งค่าหน้า
     */
    const configPage = (type) => {
        try {
            // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
            const { status } = form.getFieldValue()
            if(!!status) status = status.toString()
            switch (type) {
                case "title":
                    if (enable_ShopSalesTransaction_legacyStyle){
                        if(status === "2"){
                            return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                        }else if(status === "3"){
                            return GetIntlMessages("ใบกำกับภาษี")
                            // return GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี")
                        }
                    } 
                    break;
                case "table-status-2":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบส่งสินค้าชั่วคราว")
                    break;
                case "table-status-3":
                    if (enable_ShopSalesTransaction_legacyStyle) return GetIntlMessages("ใบกำกับภาษี")
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

        }
    }

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
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: false
            }
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "1",
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
        const { ShopPersonalCustomers, ShopBusinessCustomers } = record;
        const model = {
            code: null,
            type: null,
            name: null,
            mobile_no: null,
            tel_no: null,
        };
        if (isPlainObject(ShopPersonalCustomers)) { //ลูกค้าบุคคลธรรมดา
            const { first_name, last_name } = ShopPersonalCustomers.customer_name
            const { mobile_no, tel_no, master_customer_code_id } = ShopPersonalCustomers
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = first_name[locale.locale] + " " + last_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าบุคคลธรรมดา"
        } else if (isPlainObject(ShopBusinessCustomers)) { // ลูกค้าธุรกิจ
            const { mobile_no, tel_no, master_customer_code_id } = ShopBusinessCustomers
            const displayNumberMobile = Object.keys(mobile_no).length > 0 ? Object.values(mobile_no).filter(where => where != null).map(e => e).join(",") : "-";
            const displayNumberTel = Object.keys(tel_no).length > 0 ? Object.values(tel_no).filter(where => where != null).map(e => e).join(",") : "-";

            model.code = master_customer_code_id;
            model.name = ShopBusinessCustomers.customer_name[locale.locale];
            model.mobile_no = displayNumberMobile ? displayNumberMobile : "-";
            model.tel_no = displayNumberTel ? displayNumberTel : "-";
            model.type = "ลูกค้าธุรกิจ"
        } else {
            return "-";
        }
        return model[type] ?? "-"
    }

    const setColumnsTable = (searchStatus) => {
        const _column = [];
        // const { enable_ShopSalesTransaction_legacyStyle } = authUser.UsersProfile.ShopsProfile.shop_config
        if (docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978") {
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
                    title: () => GetIntlMessages(`เลขที่${configPage("table-status-2")}`),
                    dataIndex: 'details',
                    key: 'details',
                    width: 180,
                    align: "center",
                    render: (text, record) => get(text, `ShopDocumentCode.TRN.code_id` ?? "-", "-")
                },
                {
                    title: () => GetIntlMessages(`เลขที่${configPage("table-status-3")}`),
                    dataIndex: 'details',
                    key: 'details',
                    width: 180,
                    align: "center",
                    render: (text, record) => get(text, `ShopDocumentCode.INV.code_id` ?? "-", "-")
                },
                {
                    title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
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
                // {
                //     title: () => GetIntlMessages("เบอร์มือถือ"),
                //     dataIndex: '',
                //     key: '',
                //     width: 150,
                //     // align: "center",
                //     render: (text, record) => getCustomerDataTable(record, "mobile_no"),
                // },
                // {
                //     title: () => GetIntlMessages("เบอร์โทรศัพท์"),
                //     dataIndex: '',
                //     key: '',
                //     width: 150,
                //     // align: "center",
                //     render: (text, record) => getCustomerDataTable(record, "tel_no"),
                // },
                {
                    title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                    dataIndex: 'details',
                    key: 'details',
                    width: 120,
                    align: "center",
                    render: (text, record) => isPlainObject(text.calculate_result) ? <div style={{ textAlign: "end" }}>{RoundingNumber((text.calculate_result.net_total)) ?? "-"}</div> : "-",
                    // render: (text, record) => isPlainObject(text.calculate_result) ? <div style={{ textAlign: "end" }}>{text.calculate_result.net_total_text ?? "-"}</div> : "-",
                },
                {
                    title: () => GetIntlMessages("หมายเหตุ(ภายใน)"),
                    dataIndex: 'details',
                    key: 'details',
                    width: 250,
                    align: "center",
                    render: (text, record) => get(text, `remark_inside`, "-") ?? "-",
                },

                // {
                //     title: () => GetIntlMessages("การชำระ"),
                //     dataIndex: 'purchase_status',
                //     key: 'purchase_status',
                //     width: 150,
                //     align: "center",
                //     // render: (text, record) => text == 2 ? <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span> : "-",
                //     render: (text, record) => text ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span>,
                // },
            )
        } else {
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
                    title: () => GetIntlMessages(`เลขที่${configPage("table-status-2")}`),
                    dataIndex: 'details',
                    key: 'details',
                    width: 180,
                    align: "center",
                    render: (text, record) => get(text, `ShopDocumentCode.TRN.code_id` ?? "-", "-")
                },
                {
                    title: () => GetIntlMessages(`เลขที่${configPage("table-status-3")}`),
                    dataIndex: 'details',
                    key: 'details',
                    width: 180,
                    align: "center",
                    render: (text, record) => get(text, `ShopDocumentCode.INV.code_id` ?? "-", "-")
                },
                {
                    title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
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
                    title: () => GetIntlMessages("เลขทะเบียน"),
                    dataIndex: 'ShopVehicleCustomers',
                    key: 'ShopVehicleCustomers',
                    width: 150,
                    align: "center",
                    render: (text, record) => isPlainObject(text) ? text.details.registration : "-",
                },
                {
                    title: () => GetIntlMessages("รหัสลูกค้า"),
                    dataIndex: 'master_customer_code_id',
                    key: 'master_customer_code_id',
                    width: 150,
                    align: "center",
                    render: (text, record) => getCustomerDataTable(record, "code"),
                },
                {
                    title: () => GetIntlMessages("ชื่อลูกค้า"),
                    dataIndex: 'master_customer_code_id',
                    key: 'master_customer_code_id',
                    width: 250,
                    // align: "center",
                    render: (text, record) => getCustomerDataTable(record, "name"),
                },
                {
                    title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
                    dataIndex: 'details',
                    key: 'details',
                    width: 120,
                    align: "center",
                    render: (text, record) => isPlainObject(text.calculate_result) ? <div style={{ textAlign: "end" }}>{RoundingNumber((text.calculate_result.net_total)) ?? "-"}</div> : "-",
                },
                {
                    title: () => GetIntlMessages("หมายเหตุ(ภายใน)"),
                    dataIndex: 'details',
                    key: 'details',
                    width: 250,
                    align: "center",
                    render: (text, record) => get(text, `remark_inside`, "-") ?? "-",
                },
                // {
                //     title: () => GetIntlMessages("ประเภทลูกค้า"),
                //     dataIndex: 'master_customer_code_id',
                //     key: 'master_customer_code_id',
                //     width: 150,
                //     // align: "center",
                //     render: (text, record) => getCustomerDataTable(record, "type"),
                // },
                // {
                //     title: () => GetIntlMessages("เบอร์มือถือ"),
                //     dataIndex: 'master_customer_code_id',
                //     key: 'master_customer_code_id',
                //     width: 150,
                //     // align: "center",
                //     render: (text, record) => getCustomerDataTable(record, "mobile_no"),
                // },
                // {
                //     title: () => GetIntlMessages("เบอร์โทรศัพท์"),
                //     dataIndex: 'master_customer_code_id',
                //     key: 'master_customer_code_id',
                //     width: 150,
                //     // align: "center",
                //     render: (text, record) => getCustomerDataTable(record, "tel_no"),
                // },
                // {
                //     title: () => GetIntlMessages("จำนวน"),
                //     dataIndex: 'details',
                //     key: 'details',
                //     width: 150,
                //     align: "center",
                //     render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.total_amount ?? "-" : "-",
                // },
                // {
                //     title: () => GetIntlMessages("ราคารวม"),
                //     dataIndex: 'details',
                //     key: 'details',
                //     width: 150,
                //     align: "center",
                //     render: (text, record) => isPlainObject(text.calculate_result) ? <div style={{ textAlign: "end" }}>{text.calculate_result.net_total_text ?? "-"}</div> : "-",
                // },
                // {
                //     title: () => GetIntlMessages("ออกใบเสร็จ"),
                //     dataIndex: 'created_date',
                //     key: 'created_date',
                //     width: 200,
                //     align: "center",
                //     render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
                // },
                // {
                //     title: () => GetIntlMessages("การชำระ"),
                //     dataIndex: 'purchase_status',
                //     key: 'purchase_status',
                //     width: 150,
                //     align: "center",
                //     // render: (text, record) => text == 2 ? <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span> : "-",
                //     render: (text, record) => text ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span>,
                // },
            )

        }
        switch (enable_ShopSalesTransaction_legacyStyle) {
            case true:
                if (searchStatus === "1") {
                    delete _column[1]
                    delete _column[2]
                } else if (searchStatus === "2") {
                    delete _column[2]
                }else if(searchStatus === "3"){
                    delete _column[1]
                }
                break;

            default:
                delete _column[1]
                delete _column[2]
                break;
        }

        setColumns(_column)
    }

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })

        getMasterData()
        // configPrintOut()
    }, [])

    useEffect(() => {
        const status = modelSearch.status
        if (permission_obj) setColumnsTable(status)

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = 1 }) => {
        try {
            if (page === 1) setLoading(true)
            // const res = await API.get(`/shopSalesTransactionDoc/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=${_status == 3 ? "b39bcb5d-6c72-4979-8725-c384c80a66c3" : docTypeId }`)
            const res = await API.get(`/shopSalesTransactionDoc/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=${docTypeId}`)
            // const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data.forEach(e => {
                    if (e.status === 3) {
                        e.___update = false;
                        // e.___delete = false;
                    }
                });
                setColumnsTable(_status)
                setListSearchDataTable(data)
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
            // // console.log('changeStatus :>> ', status, id);
            // console.log('isuse', isuse)

            Swal.fire({
                title: GetIntlMessages('ยืนยันการลบข้อมูล !?'),
                text: GetIntlMessages("ท่านจะไม่สามารถย้อนกลับการลบครั้งนี้ได้ !!"),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: mainColor,
                cancelButtonColor: '#d33',
                confirmButtonText: GetIntlMessages("submit"),
                cancelButtonText: GetIntlMessages("cancel")
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
                    if (data.status == "success") {
                        getDataSearch({
                            page: configTable.page,
                            search: modelSearch.search,
                            _status: modelSearch.status
                        })
                        Swal.fire(
                            'บันทึกข้อมูลสำเร็จ!',
                            'เอกสารถูกลบแล้ว',
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

    const callBackInvoices = (documentId, recordStatus, value) => {
        recordStatus = `${recordStatus}`
        Swal.fire({
            title: `ยืนยันการพิมพ์ ${value.purchase_status === false ? configPage("table-status-2") ?? `ใบส่งสินค้า/ใบแจ้งหนี้` : `${(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : configPage("table-status-3") ?? `ใบเสร็จรับเงิน/ใบกำกับภาษี`}`} หรือไม่?`,
            // text: recordStatus == 2 ? "สถานะจะถูกเปลี่ยนเป็นออกบิลอย่างย่อ" : null,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: mainColor,
            confirmButtonText: GetIntlMessages("submit"),
            cancelButtonText: GetIntlMessages("cancel"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                switch (recordStatus) {
                    case "2":
                        setLoading(true)
                        if (value.purchase_status === false) {
                            let url = `/printOut/pdf/${documentId}?price_use=true&doc_type_name=${authUser?.UsersProfile?.ShopsProfile?.id === "264777cf-5229-4048-b92f-abeb0361ff07" || authUser?.UsersProfile?.ShopsProfile?.id === "d06b37c8-5115-452a-8f78-dc9fbf53b202" ? `ใบเสนอราคา` : configPage("table-status-2") ?? `ใบส่งสินค้า/ใบแจ้งหนี้`}&foot_sign_left=ผู้รับสินค้า&foot_sign_right=ผู้ส่งสินค้า`
                            const { data } = await API.get(url)
                            if (data.status === "success") {
                                window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                                Swal.fire({
                                    title: GetIntlMessages(`พิมพ์${configPage("table-status-2") ?? "ใบส่งสินค้า/ใบแจ้งหนี้"}สำเร็จ !!`),
                                    icon: 'success',
                                    confirmButtonText: GetIntlMessages("submit"),
                                    confirmButtonColor: mainColor
                                })
                            } else {
                                Swal.fire({
                                    title: GetIntlMessages(`พิมพ์${configPage("table-status-2") ?? "ใบส่งสินค้า/ใบแจ้งหนี้"}ไม่สำเร็จ !!`),
                                    // title: GetIntlMessages("พิมพ์ใบส่งสินค้า/ใบแจ้งหนี้ไม่สำเร็จ !!"),
                                    icon: 'error',
                                    confirmButtonText: GetIntlMessages("submit"),
                                    confirmButtonColor: mainColor
                                })
                            }

                        }
                        // await onFinish(configModal.mode != "add" ? form.getFieldValue() : value, false, true)
                        setLoading(false)
                        break;
                    case "3":
                        setLoading(true)
                        let url = `/printOut/pdf/${documentId}?price_use=true&doc_type_name=${(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : configPage("table-status-3") ?? `ใบเสร็จรับเงิน/ใบกำกับภาษี`}`
                        const { data } = await API.get(url)
                        if (data.status === "success") {
                            window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                            Swal.fire({
                                title: GetIntlMessages("พิมพ์ใบเสร็จสำเร็จ !!"),
                                icon: 'success',
                                confirmButtonText: GetIntlMessages("submit"),
                                confirmButtonColor: mainColor
                            })
                        } else {
                            Swal.fire({
                                title: GetIntlMessages("พิมพ์ใบส่งสินค้า/ใบแจ้งหนี้ไม่สำเร็จ !!"),
                                icon: 'error',
                                confirmButtonText: GetIntlMessages("submit"),
                                confirmButtonColor: mainColor
                            })
                        }

                        handleCancel()
                        setLoading(false)
                        break;

                    default:
                        break;
                }


            } else if (result.isDismissed) {
                setLoading(true)
                if (configModal.mode === "add") {
                    await getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        _status: modelSearch.status,
                    })
                }
                setLoading(false)
            }
        })
    }


    const [isEditPaymentId, setIsEditPaymentId] = useState("")

    /* addEditView */
    const addEditViewModal = async (mode, id, isPayment, isInovices) => {
        // setMode(_mode)
        setLoading(true)
        setConfigModal({ ...configModal, mode })
        if (id) {
            const { data } = await API.get(`/shopSalesTransactionDoc/byid/${id}`)
            // console.log('data addEditViewModal :>> ', data.data);
            if (data.status == "success") {
                // setDataSendToComponeteToPrint(data.data)
                setFormValueData(data.data)
            }
        } else {
            /* init data list service product */
            const list_service_product = [];
            // for (let index = 0; index < lengthShelfData; index++) {
            //     const model = {};
            //     list_service_product.push(model)
            // }

            form.setFieldsValue({
                doc_type_id: `${docTypeId}`,
                status: "1",
                list_service_product,
                user_id: authUser.id,
                tax_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                doc_date: moment(new Date()),
                create: {
                    customer_type: "person"
                }
            })
        }
        setActiveKeyTab("1")
        setIsModalVisible(true)
        if (isPayment && id) {
            setIsModePayment(true)
            const { data } = await API.get(`/shopSalesTransactionOut/all?&limit=10&page=1&sort=created_date&order=asc&status=1&ref_doc_sale_id=${id}`)
            // console.log('data', data)
            if (data.status == "success") {
                const find = data.data.data.find(where => where.ref_doc_sale_id == id)
                setIsEditPaymentId(() => find?.doc_sale_id ?? null)
            }
        }
        // if (isPayment && id) setIsModePayment(true)
        // if ((isInovices === "invoices" && id) || (mode === "view" && form.getFieldValue().status == 2 && id)) setIsModeInvoices(true)
        setLoading(false)

    }

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        modeKey: null,
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        try {
            setLoading(() => true)
            // console.log('modeKey :>> ', modeKey);
            setConfigModal({ ...configModal, modeKey })
            form.validateFields().then(async (values) => {

                await onFinish(values, null, null, modeKey)
                // setIsModalVisible(false)
                // if (modeKey == 2) handleCancel()

            }).catch((errorInfo) => { });
            // form.submit()
            setLoading(() => false)
        } catch (error) {

        }
        // console.log('modeKey', modeKey)

    }

    const handleCancel = () => {
        setLoading(() => true)
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" ? form.setFieldsValue({
            customer_type: "business",
        }) : ""
        setIsModeInvoices(false)
        setActiveKeyTab("1")
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
        //  window.location.reload()
        setLoading(() => false)
    }

    const callBackOnFinish = async (value, model, isNotMessage, isInvovices, chkErr, modeKey) => {
        try {
            let callback;
            if (configModal.mode === "add" && !isInvovices) {
                const { shop_id } = authUser.UsersProfile;
                model.shop_id = shop_id;

                callback = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback.data.status == "success") {
                    setConfigModal({ ...configModal, mode: 'edit' })
                    const { list_service_product } = form.getFieldValue();
                    if (list_service_product.length === 0) {
                        list_service_product.push({});
                        form.setFieldsValue({
                            id: callback.data.data.id,
                            code_id: callback.data.data.code_id,
                            shop_id,
                            list_service_product
                        })
                    }
                    chkErr = false
                    Swal.fire(`สร้าง ${permission_obj.id === "8a5e3ee8-fe25-4d40-a8c2-6cb9a2314343" ? `"ใบสั่งขาย"` : `"ใบสั่งซ่อม"`} เรียบร้อย !!`, '', 'success')
                }
            } else if (configModal.mode === "edit" && !isInvovices) {
                const { id } = form.getFieldValue();
                // console.log('id', id)
                model.status = value.status ?? 1
                if (isArray(model.details.list_service_product)) {
                    model.details.list_service_product.forEach(e => {
                        if (isArray(e.list_shop_stock)) {
                            const _filter = e.list_shop_stock.filter(where => where.id === e.shop_stock_id)
                            e.list_shop_stock = _filter
                        }
                    })
                }
                callback = await API.put(`/shopSalesTransactionDoc/put/${id}`, model);
                // console.log('model :>> ', model);
                if (callback.data.status == "success") {
                    if (!isNotMessage) message.success("บันทึกสำเร็จ")
                    chkErr = false
                } else {
                    message.warning(callback.data.data)
                }
            } else if ((configModal.mode === "add" || configModal.mode === "edit" || configModal.mode === "view") && isInvovices) { // ออกใบแจ้งโดยที่ยังไม่ได้จ่ายตัง

                const { id } = form.getFieldValue();
                const { shop_id } = authUser.UsersProfile;
                model.doc_type_id = "b39bcb5d-6c72-4979-8725-c384c80a66c3" // ใบเสร็จอย่างย่อ หรือ ใบแจ้งหนี้
                model.shop_id = shop_id;
                model.status = 3

                // console.log('model :>> ', model);

                callback = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback.data.status == "success") {
                    const data_transaction_out = {
                        doc_sale_id: callback.data.data.id,
                        ref_doc_sale_id: id ?? value.id,
                        status: 1
                    }
                    // if (!isNotMessage) {
                    const { data } = await API.post(`/shopSalesTransactionOut/add`, data_transaction_out);
                    if (data.status == "success") {
                        // setConfigModal({ ...configModal, mode: 'edit' });
                        // form.setFieldsValue({
                        //     id: callback.data.data.id,
                        //     shop_id,
                        //     list_service_product: valueForm.list_service_product,
                        //     status: 3,
                        // })
                        // message.success("บันทึกสำเร็จ")

                        Swal.fire({
                            title: GetIntlMessages("พิมพ์ใบเสร็จสำเร็จ !!"),
                            icon: 'success',
                            confirmButtonText: GetIntlMessages("submit"),
                        })
                        let url = `/printOut/pdf/${valueForm.id ?? value.id}?price_use=true&doc_type_name=ใบเสร็จรับเงิน/ใบกำกับภาษี`
                        const { data } = await API.get(url)
                        if (data.status === "success") {
                            window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                        }
                        if (configModal.mode === "add") {
                            getDataSearch({
                                page: configTable.page,
                                search: modelSearch.search,
                                _status: modelSearch.status,
                            })
                        }

                        handleCancel()
                    } else {
                        message.warning(data.data)
                    }
                    // }
                } else {
                    message.warning(callback.data.data)
                }
            }

            if (configModal.mode === "add" && !value.search && isPlainObject(value.create)) chkErr = true;

            if (!chkErr) {
                /* อัพเดท หมายเลขโทรศัพท์ */
                if (value.customer_phone && value.customer_phone.length > 0) {
                    if (value.customer_type === "person") {
                        const { data } = await API.get(`/shopPersonalCustomers/byid/${value.customer_id}`)
                        if (data.status == "success") {
                            const _model = {}
                            _model.mobile_no = data.data.mobile_no ?? {}
                            if (_model.mobile_no) {
                                _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({ mobile_no: e[1] }));
                            }
                            const _find = _model.mobile_no.find(where => where.mobile_no == value.customer_phone)
                            if (!_find) {
                                _model.mobile_no.push({
                                    mobile_no: value.customer_phone
                                })
                            }

                            const data_modal = {
                                mobile_no: {},
                                status: "active"
                            }
                            if (_model.mobile_no) _model.mobile_no.forEach((e, i) => data_modal.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
                            else _model.mobile_no = []

                            // console.log('data_modal person', data_modal)
                            await API.put(`/shopPersonalCustomers/put/${value.customer_id}`, data_modal)
                        }

                    } else if (value.customer_type === "business") {
                        const { data } = await API.get(`/shopBusinessCustomers/byid/${value.customer_id}`)
                        if (data.status == "success") {
                            const _model = {}
                            _model.mobile_no = data.data.mobile_no ?? {}
                            if (isPlainObject(_model.mobile_no)) {
                                _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({ mobile_no: e[1] }));
                            }
                            const _find = _model.mobile_no.find(where => where.mobile_no == value.customer_phone)
                            if (!_find) {
                                _model.mobile_no.push({
                                    mobile_no: value.customer_phone
                                })
                            }

                            const data_modal = {
                                mobile_no: {},
                                status: "active"
                            }
                            if (isArray(_model.mobile_no)) _model.mobile_no.forEach((e, i) => data_modal.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
                            else _model.mobile_no = []

                            await API.put(`/shopBusinessCustomers/put/${value.customer_id}`, data_modal)
                        }

                    }
                }



            }
            // console.log('modeKey :>> ', modeKey);
            if (configModal.mode === "add" && !isNotMessage) {
                setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
                setActiveKeyTab("1")
            } else if (configModal.mode === "edit" && (isNotMessage || !isNotMessage) && modeKey !== 2) {
                setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
                setActiveKeyTab("1")
            } else {
                form.resetFields()
                setConfigModal({ ...configModal, mode: 'add', modeKey: null })
                setActiveKeyTab("1")
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                handleCancel()
            }


            /*เผื่อใช้*/
            // console.log('configModal', configModal.modeKey)
            // if (configModal.modeKey == 1) {
            //     form.resetFields()
            //     setConfigModal({ ...configModal, mode: 'add', modeKey: null })
            //     setActiveKeyTab("1")
            //     getDataSearch({
            //         page: configTable.page,
            //         search: modelSearch.search,
            //         _status: modelSearch.status,
            //     })
            //     addEditViewModal("add")
            // } else if (configModal.modeKey == 2) {
            //     handleCancel()
            // }
        } catch (error) {
            console.log('error :>> ', error);
        }
    }


    const onFinish = async (value, isNotMessage, isInvovices, modeKey) => {
        try {
            setLoading(() => true);
            let chkErr = true;
            // console.log(`value`, value)

            if (configModal.mode === "add" && !value.search && isPlainObject(value.create)) {
                const _model = value.create;
                // console.log('_model', _model)


                /* เพิ่มลูกค้า */
                let customer_id = null;
                if (_model.customer_type === "person") { // บุคคลธรรมดา

                    const model_customer_person = {
                        id_card_number: _model.id_card_number ?? null,
                        name_title_id: null,
                        customer_name: {
                            first_name: {},
                            last_name: {},
                        },
                        tel_no: {},
                        mobile_no: {
                            mobile_no_1: _model.mobile_no
                        },
                        e_mail: null,
                        address: null,
                        subdistrict_id: null,
                        district_id: null,
                        province_id: null,
                        other_details: {
                            contact_name: null
                        },
                    }
                    model_customer_person.customer_name.first_name[locale.locale] = _model.first_name;
                    model_customer_person.customer_name.last_name[locale.locale] = _model.last_name;
                    const { data } = await API.post(`/shopPersonalCustomers/add`, model_customer_person);
                    customer_id = data.data.id;
                } else if (_model.customer_type === "business") { // ธุรกิจ
                    const model_customer_business = {
                        tax_id: _model.tax_id ?? null,
                        bus_type_id: _model.bus_type_id ?? null,
                        customer_name: {},
                        tel_no: {},
                        mobile_no: {
                            mobile_no_1: _model.mobile_no
                        },
                        e_mail: null,
                        address: null,
                        subdistrict_id: null,
                        district_id: null,
                        province_id: null,
                        other_details: {
                            contact_name: null
                        },
                    }
                    model_customer_business.customer_name[locale.locale] = _model.customer_name
                    const { data } = await API.post(`/shopBusinessCustomers/add`, model_customer_business)
                    customer_id = data.data.id;
                }

                const model_vehicle = {
                    details: {
                        color: _model.color ?? "",
                        province_name: value.province_name ?? "",
                        registration: _model.registration ?? "",
                        remark: "",
                        serial_number: _model.serial_number ?? "",
                        chassis_number: _model.chassis_number ?? "",
                        cc_engine_size: _model.cc_engine_size ?? "",
                    },
                    vehicle_type_id: _model.vehicle_type_id,
                    vehicle_brand_id: _model.vehicle_brand_id,
                    vehicle_model_id: _model.vehicle_model_id,
                }

                if (_model.customer_type === "person") model_vehicle.per_customer_id = customer_id;
                else if (_model.customer_type === "business") model_vehicle.bus_customer_id = customer_id;
                const { data } = await API.post(`/shopVehicleCustomer/add`, model_vehicle);

                // console.log('data', data)
                const vehicles_customers_id = data.data.id;

                form.setFieldsValue({
                    customer_type: _model.customer_type,
                    customer_id: customer_id,
                    mileage_old: 0,
                    avg_registration_day: 0,
                    customer_phone: _model.mobile_no,
                    vehicles_customers_id,
                })

                value.customer_type = _model.customer_type;
                value.customer_id = customer_id;
                value.mileage_old = 0;
                value.avg_registration_day = 0;
                value.customer_phone = _model.mobile_no;
                value.vehicles_customers_id = vehicles_customers_id

            }


            /* ลูกค้า */
            const per_customer_id = value.customer_type === "person" ? value.customer_id : value.per_customer_id ? value.per_customer_id : null,
                bus_customer_id = value.customer_type === "business" ? value.customer_id : value.bus_customer_id ? value.bus_customer_id : null;
            const valueForm = form.getFieldValue()
            const model = {
                bus_customer_id, //ลูกค้า
                per_customer_id, //ลูกค้า
                doc_date: moment(value.doc_date).format("YYYY-MM-DD") ?? moment(new Date()).format("YYYY-MM-DD"),
                // doc_date: moment(new Date()).format("YYYY-MM-DD"),
                details: {
                    customer_phone: value.customer_phone, //หมายเลขโทรศัพท์
                    user_id: value.user_id, //ผู้ทำเอกสาร
                    repair_man: value.repair_man ?? [], //ช่างซ่อม
                    mileage: value.mileage, //เลขไมค์
                    mileage_old: value.mileage_old, //เลขไมค์ครั้งก่อน
                    tax_id: value.tax_id, //ประเภทภาษี
                    remark: value.remark, //หมายเหตุ
                    remark_inside: value.remark_inside, //หมายเหตุ (ภายใน)
                    tailgate_discount: value.tailgate_discount, //ส่วนลดท้ายบิล
                    list_service_product: value.list_service_product,
                    avg_registration_day: value.avg_registration_day,
                    calculate_result: {
                        total: valueForm.total ?? 0,
                        total_text: valueForm.total_text ?? 0,

                        discount: valueForm.discount ?? 0,
                        discount_text: valueForm.discount_text ?? 0,

                        net_total: valueForm.net_total ?? 0,
                        net_total_text: valueForm.net_total_text ?? 0,

                        vat: valueForm.vat ?? 0,

                        total_amount: valueForm.total_amount ?? 0,
                    },
                    remark_payment: value.remark_payment,
                },
                vehicles_customers_id: value.vehicles_customers_id, //รถ
                doc_type_id: value.doc_type_id, //ประเภทเอกสาร
                sale_type: false,
                status: 1
            }

            const emptyProductLog = []

            if (isArray(model.details.list_service_product) && model.details.list_service_product.length > 0) {
                model.details.list_service_product = model.details.list_service_product.map((e, index) => {
                    if (isEmpty(e) || !e?.shop_stock_id || !e?.amount) {
                        emptyProductLog.push(index)
                    }
                    return e
                }).filter(where => !!where.shop_stock_id && !!where?.amount && !!where?.warehouse_id && !!where?.shelf_code)
            }
            // console.log('emptyProductLog :>> ', emptyProductLog);
            // console.log('model :>> ', model);
            let lastUpdate = false
            if (emptyProductLog.length > 0 && modeKey === 2) {

                Swal.fire({
                    title: `กรอกข้อมูลไม่ครบถ้วน!! ยืนยันการบันทักหรือไม่ ?`,
                    text: `รายการสินค้าที่ ${emptyProductLog.map((e) => e + 1).join(",")} ยังไม่มีข้อมูลสินค้า , คลัง ,ชั้นวาง หรือ จำนวน หากกด "ตกลง" รายการสินค้าที่ ${emptyProductLog.map((e) => e + 1).join(",")} จะไม่ถูกบันทึก!!`,
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: GetIntlMessages("submit"),
                    confirmButtonColor: mainColor,
                    cancelButtonText: GetIntlMessages("cancel"),
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        if (isArray(value.change_list_service_product) && value.change_list_service_product.length > 0) {
                            for (let i = 0; i < value.change_list_service_product.length; i++) {
                                const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${value.change_list_service_product[i]}`, {
                                    status: 0,
                                    amount: 0
                                });

                                if ((i + 1) === value.change_list_service_product.length && data.status === "success") {
                                    lastUpdate = true
                                    form.setFieldsValue({ change_list_service_product: [] })
                                } else {
                                    lastUpdate = false
                                }
                            }

                            if (lastUpdate === true) await callBackOnFinish(value, model, isNotMessage, isInvovices, chkErr, modeKey)
                        } else {
                            await callBackOnFinish(value, model, isNotMessage, isInvovices, chkErr, modeKey)
                        }

                        //    await callBackOnFinish(value ,model , isNotMessage, isInvovices , chkE,modeKeyrr)
                    }
                })
            } else {
                if (isArray(value.change_list_service_product) && value.change_list_service_product.length > 0) {
                    for (let i = 0; i < value.change_list_service_product.length; i++) {
                        const { data } = await API.put(`/shopSalesOrderPlanLogs/put/${value.change_list_service_product[i]}`, {
                            status: 0,
                            amount: 0
                        });

                        if ((i + 1) === value.change_list_service_product.length && data.status === "success") {
                            lastUpdate = true
                            form.setFieldsValue({ change_list_service_product: [] })
                        } else {
                            lastUpdate = false
                        }

                    }

                    if (lastUpdate === true) await callBackOnFinish(value, model, isNotMessage, isInvovices, chkErr, modeKey)
                } else {
                    await callBackOnFinish(value, model, isNotMessage, isInvovices, chkErr, modeKey)
                }
            }


            setLoading(() => false)
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const setFormValueData = (value) => {
        try {
            // console.log('value setFormValueData', value)
            const checkCreateDate = new Date(value.created_date).getTime()
            const validateDate = new Date("2023-01-12").getTime()
            const list_service_product = [];
            get(value, `details.list_service_product`, []).forEach(e => {
                if (!isEmpty(e)) {
                    const find = isArray(value.ShopSalesOrderPlanLogs) && value.ShopSalesOrderPlanLogs.length > 0 ? value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount) : get(value, `details.list_service_product`, []).find(where => where.id == e.id && where.amount == e.amount);
                    // const find = value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount);
                    const _find = e.list_shop_stock.find(where => where.product_id === e.product_id)
                    const purchase_unit_list = (isPlainObject(_find)) ? _find?.ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.filter(where => where.id === "103790b2-e9ab-411b-91cf-a22dbf624cbc") ?? [] : []
                    const model = {
                        ...e,
                        price_text: NoRoundingNumber(e.price),
                        // price_text: Number(e.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                        discount_text: e.discount_text,
                        // discount_text : Number(e.discount_text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                    }

                    if (validateDate > checkCreateDate) {
                        model.purchase_unit_list = purchase_unit_list
                        model.purchase_unit_id = purchase_unit_list[0].id
                    }

                    // console.log('model :>> ', model);

                    if (isPlainObject(find)) list_service_product.push(model)
                }

            })
            const model = {
                id: value.id,
                code_id: value.code_id,
                TRN_code_id: value.details?.ShopDocumentCode?.TRN?.code_id ?? null,
                INV_code_id: value.details?.ShopDocumentCode?.INV?.code_id ?? null,
                customer_type: null, //ประเภทลูกค้า
                customer_id: null, //ชื่อลูกค้า
                // customer_phone: null, //หมายเลขโทรศัพท์
                customer_phone: get(value, `details.customer_phone`, null), //หมายเลขโทรศัพท์
                vehicles_customers_id: value.vehicles_customers_id, //หมายเลขโทรศัพท์
                mileage: get(value, `details.mileage`, null),
                mileage_old: get(value, `details.mileage_old`, null),
                tax_id: get(value, `details.tax_id`, null), //ประเภทภาษี
                doc_type_id: value.doc_type_id,
                status: value.status.toString(),
                user_id: authUser.id,
                repair_man: value.details?.repair_man ?? [],
                shop_id: value.shop_id,
                list_service_product,
                avg_registration_day: get(value, `details.avg_registration_day`, 0),
                avg_registration_month: get(value, `details.avg_registration_day`, 0) * 30,
                remark: get(value, `details.remark`, null), //หมายเหตุ
                remark_inside: get(value, `details.remark_inside`, null), //หมายเหตุ (ภายใน)
                tailgate_discount: get(value, `details.tailgate_discount`, 0), //ส่วนลดท้ายบิล
                remark_payment: get(value, `details.remark_payment`, ""),

                payment: {
                    type: get(value, `details.payment.type`, null),
                    type_text: get(value, `details.payment.type_text`, null),
                    cash: get(value, `details.payment.cash`, null),
                    change: get(value, `details.payment.change`, null),
                    transferor_name: get(value, `details.payment.transferor_name`, null),
                    transfer_time: moment(get(value, `details.payment.transfer_time`, null)),
                    bank_name: get(value, `details.payment.bank_name.th`, null),
                    card_type_text: get(value, `details.payment.card_type_text.${locale.locale}`, null),
                    payment_method_text: get(value, `details.payment.payment_method_text.${locale.locale}`, null),
                    remark: get(value, `details.payment.remark`, null),
                    payment_date: !!get(value, `details.payment.payment_date`, null) ? moment(get(value, `details.payment.payment_date`, null)).utc() ?? null : null,
                },

                purchase_status: get(value, `purchase_status`, ""),  //สถานะการจ่ายเงิน
                doc_date: moment(get(value, `doc_date`, "")) ?? null //วันที่เอกสาร
            }
            if (value.bus_customer_id) {
                model.customer_type = "business"
                model.customer_id = value.bus_customer_id
            } else if (value.per_customer_id) {
                model.customer_type = "person"
                model.customer_id = value.per_customer_id
            }
            form.setFieldsValue(model)
            calculateResult()
        } catch (error) {
            console.log('error setFormValueData:>> ', error);
        }

    }

    /* master */
    const getMasterData = async () => {
        try {
            const [value1, value2, value3] = await Promise.all([getShelfData(), getTaxTypes(), getDocumentTypes()])
            setLengthShelfData(value1.length)
            if (isArray(value2)) setTaxTypesList(value2);
            if (isArray(value3)) setDocumentTypesList(value3);
        } catch (error) {

        }
    }
    const [documentTypesName, setDocumentTypesName] = useState("")
    const getTextDocumentTypes = (id, arr) => {
        const find = whereIdArray(arr, id)
        setDocumentTypesName(find.type_name[locale.locale])
    }

    const getDocumentTypes = async () => {
        const { data } = await API.get(`/master/documentTypes`);
        if (data.status == "success") {
            getTextDocumentTypes(docTypeId, data.data)
            return data.data
        } else {
            return []
        }
    }

    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        return data.data.data
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
                label: docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? GetIntlMessages("ใบสั่งขาย/ใบจองสินค้า") : GetIntlMessages("สถานะใบสั่งซ่อม"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    {
                        key: GetIntlMessages("all-status"),
                        value: "default",
                    },
                    {
                        key: GetIntlMessages("อยู่ระหว่างดำเนินการ"),
                        value: "1",
                    },
                    {
                        key: configPage("table-status-2") ?? GetIntlMessages("ดำเนินการเรียบร้อย"),
                        value: "2",
                    },
                    {
                        key: configPage("table-status-3") ?? GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี"),
                        value: "3",
                    },
                ],
            },
        ],
        col: 8,
        button: {
            create: true,
            name: {
                add: GetIntlMessages(`สร้าง${documentTypesName}`),
            },
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    /* Tab */
    const [activeKeyTab, setActiveKeyTab] = useState("1")

    /* get Master documentTypes */
    const getTaxTypes = async () => {
        const { data } = await API.get(`/master/taxTypes/all`);
        return data.status = "success" ? data.data : []
    }

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }

    const [checkTaxId, setCheckTaxId] = useState("")

    const calculateResult = async (index) => {
        const { list_service_product, tax_id, tailgate_discount } = form.getFieldValue();
        if (!!tailgate_discount) tailgate_discount = Number(tailgate_discount.replaceAll(",", "") ?? 0)


        let total = 0, discount = 0, discount_percent = 0, vat = 0, net_total = 0, total_amount = 0, total_after_discount = 0, total_before_vat = 0;

        list_service_product.forEach(e => {
            total += ((Number(e.amount ?? 0) * Number(e.price ?? 0)));
            discount += (Number(e.discount ?? 0) * (Number(e.amount ?? 0)));
            // discount_percent += ((Number(e.amount ?? 0) * Number(e.price ?? 0))) * (Number(e.discount_percent ?? 0)/100);
            total_amount += Number(e.amount ?? 0);
        });
        // console.log('list_service_product', list_service_product)
        discount += Number(tailgate_discount ?? 0)
        total_after_discount = (total - discount)

        // total = total - discount

        const { detail } = whereIdArray(taxTypesList.length > 0 ? taxTypesList : await getTaxTypes(), tax_id ?? "52b5a676-c331-4d03-b650-69fc5e591d2c");
        let each_discount = 0
        let each_discount_percent = 0


        if (index >= 0 && list_service_product[index]?.discount) each_discount = list_service_product[index]?.discount ?? 0
        if (index >= 0 && list_service_product[index]?.discount_percent) each_discount_percent = list_service_product[index]?.discount_percent ?? 0

        if (index >= 0 && list_service_product[index]["amount"]) {
            list_service_product[index]["each_total_price"] = (Number(list_service_product[index]["price"]) - each_discount) * Number(list_service_product[index]["amount"])

            // const eachPrice = Number(list_service_product[index]["price"]) * Number(list_service_product[index]["amount"])

            // list_service_product[index]["discount_percent_text"] = Number(list_service_product[index]["price"]) * (Number(each_discount_percent)/100)
            // list_service_product[index]["discount_text"] = Number(list_service_product[index]["price"]) * (Number(each_discount_percent)/100)
            // list_service_product[index]["each_total_price"] = eachPrice - each_discount


            // list_service_product[index]["each_total_price"] = (eachPrice - (eachPrice * (Number(each_discount_percent)/100))) - Number(each_discount)
            // list_service_product[index]["each_total_price"] = ((Number(list_service_product[index]["price"]) * Number(list_service_product[index]["amount"])) * (each_discount_percent /100))- Number(each_discount)
        }

        //8c73e506-31b5-44c7-a21b-3819bb712321 -> รวม vat
        //fafa3667-55d8-49d1-b06c-759c6e9ab064 -> ไม่รวม vat
        //52b5a676-c331-4d03-b650-69fc5e591d2c -> ไม่คิด vat
        switch (tax_id) {
            case "8c73e506-31b5-44c7-a21b-3819bb712321":
                setCheckTaxId(tax_id)
                if (isPlainObject(detail)) {
                    vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 107)))
                    total_before_vat = total_after_discount - vat
                    // net_total = (total_before_vat - tailgate_discount) + vat
                    net_total = total_after_discount
                }
                break;
            case "fafa3667-55d8-49d1-b06c-759c6e9ab064":
                setCheckTaxId(tax_id)
                if (isPlainObject(detail)) {
                    vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                    // net_total = (total_after_discount - tailgate_discount) + vat
                    net_total = total_after_discount + vat
                }
                break;
            case "52b5a676-c331-4d03-b650-69fc5e591d2c":
                setCheckTaxId(tax_id)
                if (isPlainObject(detail)) {
                    vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                    // net_total = (total_after_discount - tailgate_discount) + vat
                    net_total = total_after_discount + vat
                }
                break;

            default:
                setCheckTaxId("")
                if (isPlainObject(detail)) {
                    vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                    net_total = total_after_discount + vat
                }
                break;
        }

        // if (tax_id && tax_id !== "fafa3667-55d8-49d1-b06c-759c6e9ab064") {
        //     const { detail } = whereIdArray(taxTypesList.length > 0 ? taxTypesList : await getTaxTypes(), tax_id);
        //     if (isPlainObject(detail)) {
        //         vat = ((total * Number(detail.tax_rate_percent)) / 100)
        //         total = total - vat
        //     }
        // }

        // net_total = total - Number(tailgate_discount ?? 0)

        const localStringTwoDecimals = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

        function checkLenght(value) {
            try {
                if (list_service_product.length > 0 && value) {
                    return value.toLocaleString(undefined, localStringTwoDecimals)
                } else {
                    return null
                }
            } catch (error) {

            }
        }

        form.setFieldsValue({
            total,
            total_text: checkLenght(total),
            // total_text: total.toLocaleString(undefined, localStringTwoDecimals),

            total_after_discount,
            total_after_discount_text: checkLenght(total_after_discount),
            // total_after_discount_text: total_after_discount.toLocaleString(undefined, localStringTwoDecimals),

            total_before_vat,
            total_before_vat_text: checkLenght(total_before_vat),
            // total_before_vat_text: total_before_vat.toLocaleString(undefined, localStringTwoDecimals),

            discount,
            discount_text: checkLenght(discount),
            // discount_text: discount ? discount.toLocaleString(undefined, localStringTwoDecimals) : 0,

            net_total,
            net_total_text: checkLenght(net_total),
            // net_total_text: net_total ? net_total.toLocaleString(undefined, localStringTwoDecimals) : 0,

            vat,
            vat_text: checkLenght(vat),
            // vat_text: vat ? vat.toLocaleString(undefined, localStringTwoDecimals) : 0,

            total_amount,
            tailgate_discount: NoRoundingNumber(tailgate_discount)
            // NoRoundingNumber

        })
    }

    const ModalFullScreenTitle = ({ title, isShowTittle }) => {
        const { code_id ,TRN_code_id,INV_code_id} = form.getFieldValue()
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
                            await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: 2 }).then(async({ data }) => {
                                if (data.status != "success") {
                                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                                } else {
                                    const {ShopDocumentCode} = data.data.details
                                    Swal.fire(
                                        'บันทึกสำเร็จ',
                                        `เปลี่ยนสถานะเป็น${configPage("table-status-2") ?? `ดำเนินการเรียบร้อย`}`,
                                        'success'
                                    )
                                    form.setFieldsValue({status : data.data.status ,TRN_code_id : ShopDocumentCode?.TRN?.code_id ?? null})
                                    setConfigModal(()=>({ ...configModal, mode: 'edit', modeKey: null }))
                                    
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
                        <span className='pr-2'> {GetIntlMessages(configModal.mode == "view" ? "view-data" : configModal.mode == "edit" ? "edit-data" : "สร้าง")} {configPage("title") ?? title}</span>
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



    /* ขำระเงิน */
    const onClickPayment = (value) => {
        if (value.id) addEditViewModal("view", value.id, true)
    }

    const [isModePayment, setIsModePayment] = useState(false);
    const [isModeInvovices, setIsModeInvoices] = useState(false);

    const handleOkPayment = () => {

    }

    const handleCancelPayment = () => {
        setIsModePayment(false)
    }

    const onFinishPayment = async (value, isPrintInvoices) => {
        try {
            // console.log('value onFinishPayment', value)
            setLoading(true)
            const valueForm = form.getFieldValue(),
                per_customer_id = value.customer_type === "person" ? value.customer_id : null,
                bus_customer_id = value.customer_type === "business" ? value.customer_id : null;
            const { shop_id } = authUser.UsersProfile;

            const model = {
                bus_customer_id, //ลูกค้า
                per_customer_id, //ลูกค้า
                details: {
                    ref_doc_sale_id: valueForm.id, //รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม
                    customer_phone: value.customer_phone, //หมายเลขโทรศัพท์
                    user_id: value.user_id, //ผู้ทำเอกสาร
                    repair_man: value.repair_man ?? [], //ช่างซ่อม
                    mileage: value.mileage, //เลขไมค์
                    mileage_old: value.mileage_old, //เลขไมค์ครั้งก่อน
                    tax_id: value.tax_id, //ประเภทภาษี
                    remark: value.remark, //หมายเหตุ
                    remark_inside: value.remark_inside, //หมายเหตุ (ภายใน)
                    tailgate_discount: value.tailgate_discount, //ส่วนลดท้ายบิล
                    list_service_product: value.list_service_product,
                    avg_registration_day: value.avg_registration_day,

                    calculate_result: {
                        total: valueForm.total ?? 0,
                        total_text: valueForm.total_text ?? 0,

                        discount: valueForm.discount ?? 0,
                        discount_text: valueForm.discount_text ?? 0,

                        net_total: valueForm.net_total ?? 0,
                        net_total_text: valueForm.net_total_text ?? 0,

                        vat: valueForm.vat ?? 0,

                        total_amount: valueForm.total_amount ?? 0,
                    },
                },
                vehicles_customers_id: value.vehicles_customers_id, //รถ
                doc_type_id: "b39bcb5d-6c72-4979-8725-c384c80a66c3", //ประเภทเอกสาร ใบเสร็จอย่างย่อ
                sale_type: false,
                status: 3,
                shop_id
            }

            model.doc_date = moment(value.doc_date).format("YYYY-MM-DD") ?? moment(new Date()).format("YYYY-MM-DD")
            /* ------------------------ add shopSalesTransactionDoc ------------------------ */
            // console.log('model :>> ', model);

            switch (value.status) {
                case "2":
                    if (isPrintInvoices === true) {

                        setConfigModal({ ...configModal, mode: 'edit' });

                        model.details.payment = valueForm.payment;
                        model.purchase_status = true;

                        const promise2 = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                            details: model.details,
                            purchase_status: true,
                            status: 3,
                        });

                        if (promise2.data.status == "success") {
                            message.success("บันทึกสำเร็จ")
                            handleCancel()
                            handleCancelPayment()
                            Swal.fire({
                                title: GetIntlMessages("พิมพ์ใบเสร็จสำเร็จ !!"),
                                icon: 'success',
                                confirmButtonText: GetIntlMessages("submit"),
                            })
                            let url = `/printOut/pdf/${valueForm.id}?price_use=true&doc_type_name=${(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : `ใบเสร็จรับเงิน/ใบกำกับภาษี`}`
                            const { data } = await API.get(url)
                            if (data.status === "success") {
                                window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                            }

                            // const promise3 = await API.put(`/shopSalesTransactionDoc/put/${callback1.data.data.id}`, model);
                            // if (promise3.data.status == "success") {
                            //     message.success("บันทึกสำเร็จ")
                            //     handleCancel()
                            //     handleCancelPayment()
                            //     Swal.fire({
                            //         title: GetIntlMessages("พิมพ์ใบเสร็จสำเร็จ !!"),
                            //         icon: 'success',
                            //         confirmButtonText: GetIntlMessages("submit"),
                            //     })
                            //     let url = `/printOut/pdf/${valueForm.id}?price_use=true&doc_type_name=${(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า`:`ใบเสร็จรับเงิน/ใบกำกับภาษี`}`
                            //     const { data } = await API.get(url)
                            //     if (data.status === "success") {
                            //         window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                            //     }
                            // } else {
                            //     Swal.fire({
                            //         title: GetIntlMessages("ปริ้นใบเสร็จไม่สำเร็จ !!"),
                            //         text: GetIntlMessages("ไม่มีรายการสินค้าหรือบริการ"),
                            //         icon: 'warning',
                            //         confirmButtonText: GetIntlMessages("submit"),
                            //     })
                            //     // message.warning(data.data)
                            // }
                        } else {
                            Swal.fire({
                                title: GetIntlMessages("ปริ้นใบเสร็จไม่สำเร็จ !!"),
                                text: GetIntlMessages("ไม่มีรายการสินค้าหรือบริการ"),
                                icon: 'warning',
                                confirmButtonText: GetIntlMessages("submit"),
                            })
                            // message.warning(data.data)
                        }

                        // const callback1 = await API.post(`/shopSalesTransactionDoc/add`, model);
                        // if (callback1.data.status == "success") {
                        //     const data_transaction_out = {
                        //         doc_sale_id: callback1.data.data.id,
                        //         ref_doc_sale_id: valueForm.id,
                        //         status: 1
                        //     }
                        //     const { data } = await API.post(`/shopSalesTransactionOut/add`, data_transaction_out);
                        //     if (data.status == "success") {
                        //         setConfigModal({ ...configModal, mode: 'edit' });

                        //         model.details.payment = valueForm.payment;
                        //         model.purchase_status = true;

                        //         const promise2 = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                        //             details: model.details,
                        //             purchase_status: true,
                        //         });

                        //         if (promise2.data.status == "success") {
                        //             const promise3 = await API.put(`/shopSalesTransactionDoc/put/${callback1.data.data.id}`, model);
                        //             if (promise3.data.status == "success") {
                        //                 message.success("บันทึกสำเร็จ")
                        //                 handleCancel()
                        //                 handleCancelPayment()
                        //                 Swal.fire({
                        //                     title: GetIntlMessages("พิมพ์ใบเสร็จสำเร็จ !!"),
                        //                     icon: 'success',
                        //                     confirmButtonText: GetIntlMessages("submit"),
                        //                 })
                        //                 let url = `/printOut/pdf/${valueForm.id}?price_use=true&doc_type_name=${(authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า`:`ใบเสร็จรับเงิน/ใบกำกับภาษี`}`
                        //                 const { data } = await API.get(url)
                        //                 if (data.status === "success") {
                        //                     window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${data.data}`)
                        //                 }
                        //             } else {
                        //                 Swal.fire({
                        //                     title: GetIntlMessages("ปริ้นใบเสร็จไม่สำเร็จ !!"),
                        //                     text: GetIntlMessages("ไม่มีรายการสินค้าหรือบริการ"),
                        //                     icon: 'warning',
                        //                     confirmButtonText: GetIntlMessages("submit"),
                        //                 })
                        //                 // message.warning(data.data)
                        //             }
                        //         }

                        //     } else {
                        //         Swal.fire({
                        //             title: GetIntlMessages("ปริ้นใบเสร็จไม่สำเร็จ !!"),
                        //             text: GetIntlMessages("ไม่มีรายการสินค้าหรือบริการ"),
                        //             icon: 'warning',
                        //             confirmButtonText: GetIntlMessages("submit"),
                        //         })
                        //         // message.warning(data.data)
                        //     }
                        // } else {
                        //     message.warning('มีบางอย่างผิดพลาด !!')
                        // }
                    } else {
                        setConfigModal({ ...configModal, mode: 'edit' });

                        model.details.payment = valueForm.payment;
                        model.purchase_status = true;

                        const promise1 = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                            details: model.details,
                            purchase_status: true,
                            status: 3,
                        });
                        const promise2 = await API.put(`/shopSalesTransactionDoc/put/${isEditPaymentId ? isEditPaymentId : valueForm.id}`, model);
                        const [callback2, callback3] = await Promise.all([promise1, promise2]);
                        if (callback3.data.status == "success") {
                            // message.success("บันทึกสำเร็จ")
                            Swal.fire({
                                title: GetIntlMessages("ชำระโดยไม่ปริ้นใบเสร็จ !!"),
                                icon: 'success',
                                confirmButtonText: GetIntlMessages("submit"),
                            })
                            handleCancel()
                            handleCancelPayment()
                        } else {
                            message.warning(callback3.data.data)
                        }

                    }

                    break;
                case "3":
                    setConfigModal({ ...configModal, mode: 'edit' });

                    model.details.payment = valueForm.payment;
                    model.purchase_status = true;

                    const promise1 = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                        details: model.details,
                        purchase_status: true,
                        status: 3,
                    });
                    const promise2 = await API.put(`/shopSalesTransactionDoc/put/${isEditPaymentId}`, model);
                    const [callback2, callback3] = await Promise.all([promise1, promise2]);
                    if (callback3.data.status == "success") {
                        message.success("บันทึกสำเร็จ")
                        handleCancel()
                        handleCancelPayment()
                    } else {
                        message.warning(callback3.data.data)
                    }
                    break;

                default:
                    break;
            }

            setLoading(false)
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด !!');
            // console.log('error :>> ', error);
        }
    }

    const callbackSearch = (value) => {
        getDataSearch({
            page: value.page,
            limit: value.limit,
            _status: modelSearch.status,
        })

    }

    const checkButtonPayment = () => {
        const { status, purchase_status } = form.getFieldValue();
        return (status == "3" || status == "2") && purchase_status != true
    }

    const checkListOfProduct = (value) => {
        try {
            const { list_service_product } = value.details ?? value
            if (isArray(list_service_product) && list_service_product.length <= 0) {
                Swal.fire({
                    title: 'ไม่มีสินค้าในรายการ !!',
                    // text: "กรุณาเพิ่มรายการสินค้าอย่างน้อย 1 รายการ",
                    icon: 'warning',
                    // showCancelButton: true,
                    confirmButtonColor: mainColor,
                    confirmButtonText: 'ตกลง',
                    cancelButtonText: 'ยกเลิก'
                })
            } else {
                onClickPayment(value)
            }
        } catch (error) {

        }
    }



    //ใช้เป็น function ในกรณีที่หน้านั้นมีการใช้หน้า component ร่วมกับหน้าอื่น แต่ถ้าเป็นหน้าที่่เป็นการใช้ component หน้าเดียว ส่งเป็น object ไปได้เลย
    // const [configButtonPrintOut, setConfigButtonPrintOut] = useState({})
    // const configPrintOut = () => {
    //     console.log("test")
    //     if (docTypeId === "7ef3840f-3d7f-43de-89ea-dce215703c16") {
    //         const printOutButton = {
    //             withdraw_product: { status: true, name: "ใบเบิกสินค้า", price_use: 2 }, //price_use -> 1 = true / 2 = false
    //         }
    //         setConfigButtonPrintOut(printOutButton)
    //     }
    // }

    const setPrintName = () => {
        try {
            const { purchase_status } = form.getFieldValue()
            if (purchase_status === false && (authUser?.UsersProfile?.ShopsProfile?.id === "264777cf-5229-4048-b92f-abeb0361ff07" || authUser?.UsersProfile?.ShopsProfile?.id === "d06b37c8-5115-452a-8f78-dc9fbf53b202")) {
                return `ใบเสนอราคา`
            } else {
                return `ใบส่งสินค้า/ใบแจ้งหนี้`
            }
        } catch (error) {

        }
    }

    const configButtonPrintOut = {
        //price_use -> 1 = true / 2 = false
        withdraw_product: { status: true, name: "ใบเบิกสินค้า", price_use: 2 },
        print_out_invoices: {
            status:
                form.getFieldValue().status == "3" ||
                    form.getFieldValue().status == "4"
                    ? true
                    : false,
            name:
                form.getFieldValue().purchase_status === false
                    ? setPrintName()
                    // : `ใบเสร็จรับเงิน/ใบกำกับภาษี`,
                    : (authUser?.UsersProfile?.ShopsProfile?.id === "1a523ad4-682e-4db2-af49-d54f176a84ad") ? `ใบส่งสินค้า` : enable_ShopSalesTransaction_legacyStyle ? `ใบกำกับภาษี` :`ใบเสร็จรับเงิน/ใบกำกับภาษี`,
            price_use: 1,
            footSign:
                form.getFieldValue().purchase_status === false
                    ? { left: `ผู้รับสินค้า`, right: `ผู้ส่งสินค้า` }
                    : { left: `ผู้จ่ายเงิน`, right: `ผู้รับเงิน` },
        },
        print_out_delivery_note: {
            status:
                (form.getFieldValue().status == "3" ||
                    form.getFieldValue().status == "4") &&
                    form.getFieldValue().purchase_status === true
                    ? true
                    : false,
            name: authUser?.UsersProfile?.ShopsProfile?.id === "264777cf-5229-4048-b92f-abeb0361ff07" || authUser?.UsersProfile?.ShopsProfile?.id === "d06b37c8-5115-452a-8f78-dc9fbf53b202" ? `ใบเสนอราคา` : enable_ShopSalesTransaction_legacyStyle ? `ใบส่งสินค้าชั่วคราว` : `ใบส่งสินค้า/ใบแจ้งหนี้`,
            price_use: 1,
            footSign: { left: `ผู้รับสินค้า`, right: `ผู้ส่งสินค้า` },
        },
    };

    const specificFunction = {
        onClickPayment: checkListOfProduct,
        callBackInvoices
    }



    return (
        <>

            <div id="page-manage">
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={callbackSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} isUseSwalFireOnDel={true} docTypeId={docTypeId} docStatus={modelSearch} specificFunction={specificFunction} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} /> */}

                {/* <div style={{ overflow: "hidden", height: "0px" }}>
                    <ComponentToPrint ref={componentRef} size={`A4`} tableData={dataSendToComponeteToPrint} docTypeId={docTypeId} />
                </div> */}

                <ModalFullScreen
                    maskClosable={false}
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" && isModeInvovices != true }}
                    title={<ModalFullScreenTitle title={documentTypesName} isShowTittle={true} />}
                    // okButtonDropdown={isModeInvovices != true}
                    CustomsButton={() => {
                        return (
                            <div >
                                <span className='pr-3'>
                                    <Button loading={loading} onClick={handleCancel} style={{ width: 100 }}>{configModal.mode == "view" ? GetIntlMessages("ปิด") : GetIntlMessages("ยกเลิก")}</Button>
                                </span>

                                {(form.getFieldValue().status == "1" || form.getFieldValue().status == "2" || form.getFieldValue().status == "3") && configModal.mode != "view" ?
                                    <span className='pr-3'><Button loading={loading} disabled={configModal.mode == "view"} type='primary' onClick={() => handleOk(2)} style={{ width: 100 }}>บันทึก</Button></span>
                                    // <span className='pr-3'>
                                    //     <Dropdown.Button
                                    //         htmlType="submit"
                                    //         type='primary'
                                    //         icon={<DownOutlined />}
                                    //         onClick={() => handleOk(0)}
                                    //         onEnter
                                    //         loading={loading}
                                    //         disabled={configModal.mode == "view"}
                                    //         overlay={
                                    //             (
                                    //                 <Menu >
                                    //                     <Menu.Item onClick={() => handleOk(1)} key="1">บันทึกแล้วสร้างใหม่</Menu.Item>
                                    //                     <Menu.Item onClick={() => handleOk(2)} key="2">บันทึกแล้วปิด</Menu.Item>
                                    //                 </Menu>
                                    //             )
                                    //         }
                                    //     >
                                    //         บันทึก
                                    //     </Dropdown.Button>
                                    // </span>

                                    : ""}

                                {form.getFieldValue().id ?
                                    <span className='pr-3'>
                                        <PrintOut documentId={form.getFieldValue().id} morePrintOuts={configButtonPrintOut} docTypeId={docTypeId}/>
                                        {/* <Button type="primary" onClick={handlePrint} style={{ width: 100 }}> Print</Button> */}
                                    </span>
                                    : ""}
                                {form.getFieldValue().id ?
                                    <span className='pr-3'>
                                        <ModalFullScreenTitle title={documentTypesName} isShowTittle={false} />
                                    </span>
                                    : ""}



                                {isModeInvovices || (configModal.mode === "view" && form.getFieldValue().status == 2) ?
                                    <Button loading={loading} className='mr-2' type='primary' onClick={() => callBackInvoices(form.getFieldValue().id, form.getFieldValue().status, form.getFieldValue())} style={{ width: "auto" }}>{GetIntlMessages(configPage("table-status-2") ?? "ใบส่งสินค้า/ใบแจ้งหนี้")}</Button>
                                    // <Button loading={loading} className='mr-2' type='primary' onClick={() => callBackInvoices(form.getFieldValue().id, form.getFieldValue().status)} style={{ width: 250 }}>{GetIntlMessages("สร้างใบเสร็จรับเงิน/ใบกำกับภาษี")}</Button>
                                    : ""}

                                {checkButtonPayment() ?
                                    <Button loading={loading} type='primary' onClick={() => checkListOfProduct(form.getFieldValue())} style={configPage("style") ?? { width: 100 }}>{configPage("btn-payment") ?? "รับชำระ"}</Button>
                                    // <Button loading={loading} type='primary' onClick={() => onClickPayment(form.getFieldValue())} style={{ width: 100 }}>รับชำระ</Button>
                                    // <Button type='primary' onClick={() => setIsModePayment(true)} style={{ width: 100 }}>รับชำระ</Button>
                                    : ""}

                            </div>
                        )
                    }}
                >
                    <div className="container-fluid">
                        {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                        <div className='pr-5 pl-5 detail-before-table'>
                            <FormServicePlans mode={configModal.mode} configModal={configModal} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} taxTypesList={taxTypesList} calculateResult={calculateResult} type={1} handleCancel={handleCancel} docTypeId={docTypeId} setLoading={setLoading} />
                        </div>

                        <div className='tab-detail'>
                            <Tabs activeKey={activeKeyTab} onChange={(value) => setActiveKeyTab(value)}>
                                <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                                    <Tab1ServiceProduct mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} handleOk={handleOk} calculateResult={calculateResult} checkTaxId={checkTaxId} />
                                </TabPane>
                                {
                                    configModal.mode != "add" ?
                                        <>
                                            <TabPane tab={GetIntlMessages("ลูกค้า")} key="2">
                                                <Tab2Custome mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} />
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
                </ModalFullScreen>

                <ModalFullScreen
                    maskClosable={false}
                    visible={isModePayment}
                    onOk={handleOkPayment}
                    onCancel={handleCancelPayment}
                    title={`ชำระเงิน`}
                    CustomsButton={() => {
                        return (
                            <div >
                                <span className='pr-3'>
                                    <Button onClick={handleCancelPayment} style={{ width: 100 }}>ยกเลิก</Button>
                                </span>
                            </div>
                        )
                    }}
                >

                    <div className="container-fluid" >
                        <div id="invoices-container">
                            <div className='detail-before-table'>
                                <PaymentDocs mode={configModal.mode} onFinish={onFinishPayment} loading={loading} form={form} type={2} />
                            </div>
                        </div>
                    </div>
                </ModalFullScreen>


            </div >

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

export default ShopSalesTransactionDoc
