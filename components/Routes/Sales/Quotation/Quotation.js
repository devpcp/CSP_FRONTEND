import { useEffect, useState, useRef, useCallback } from 'react'
import { message, Form, Tabs, Button, Popover, Dropdown, Menu, Row } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined, ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import API from '../../../../util/Api';
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { useSelector } from 'react-redux';
import SearchInput from '../../../shares/SearchInput'
import TableList from '../../../shares/TableList'
import GetIntlMessages from '../../../../util/GetIntlMessages';
import Swal from "sweetalert2";

import FormServicePlans from '../ServicePlans/Components.Routes.Modal.FormServicePlans'

import Tab1ServiceProduct from '../ServicePlans/Components.Routes.Modal.Tab1.ServiceProduct'
import Tab2Custome from '../ServicePlans/Components.Routes.Modal.Tab2.Custome'
import ModalFullScreen from '../../../shares/ModalFullScreen';
import moment from 'moment'
import { get, isArray, isFunction, isPlainObject } from 'lodash';
import Tab4Vehicle from '../ServicePlans/Components.Routes.Modal.Tab4.Vehicle';
import PaymentDocs from '../ServicePlans/Components.Routes.Modal.PaymentDocs';
import ComponentToPrint from "../CreatePdf/index";

const { TabPane } = Tabs;
const Quotationcomponent = ({ docTypeId }) => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี

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
        };
        if (isPlainObject(ShopPersonalCustomers)) { //ลูกค้าบุคคลธรรมดา
            const { first_name, last_name } = ShopPersonalCustomers.customer_name
            model.code = ShopPersonalCustomers.master_customer_code_id;
            model.name = first_name[locale.locale] + " " + last_name[locale.locale];
            model.type = "ลูกค้าบุคคลธรรมดา"
        } else if (isPlainObject(ShopBusinessCustomers)) { // ลูกค้าธุรกิจ
            model.code = ShopBusinessCustomers.master_customer_code_id;
            model.name = ShopBusinessCustomers.customer_name[locale.locale];
            model.type = "ลูกค้าธุรกิจ"
        } else {
            return "-";
        }

        return model[type] ?? "-"
    }

    const setColumnsTable = (status) => {
        const _column = [
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
                title: () => GetIntlMessages("เลขที่ใบเสนอราคา"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
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
                title: () => GetIntlMessages("ประเภทลูกค้า"),
                dataIndex: 'master_customer_code_id',
                key: 'master_customer_code_id',
                width: 150,
                // align: "center",
                render: (text, record) => getCustomerDataTable(record, "type"),
            },
            // {
            //     title: () => GetIntlMessages("เลขทะเบียน"),
            //     dataIndex: 'ShopVehicleCustomers',
            //     key: 'ShopVehicleCustomers',
            //     width: 150,
            //     align: "center",
            //     render: (text, record) => isPlainObject(text) ? text.details.registration : "-",
            // },
            {
                title: () => GetIntlMessages("จำนวน"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.total_amount ?? "-" : "-",
            },
            // {
            //     title: () => GetIntlMessages("ราคารวม"),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 150,
            //     align: "center",
            //     render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.net_total_text ?? "-" : "-",
            // },
            {
                title: () => GetIntlMessages("วันที่ออกใบเสนอราคา"),
                dataIndex: 'created_date',
                key: 'created_date',
                width: 200,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
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
        ];

        if (status != 1) {
            // if (isArray(data) && data.length > 0 && status != 1) {

            _column.push(
                {
                    title: () => GetIntlMessages("การชำระ"),
                    dataIndex: '',
                    key: '',
                    width: 150,
                    align: "center",
                    render: (text, record) => text.status == 2 || text.status == 3 || text.status == 4 ? text.purchase_status ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span> : text.status == 1 ? <Popover content={GetIntlMessages("อยู่ระหว่างดำเนินการ")}> <ClockCircleOutlined style={{ color: 'orange', fontSize: 27 }} /></Popover> : <Popover content={GetIntlMessages("cancel")}> <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Popover>,
                    // render: (text, record) => text ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span>,
                },
                {
                    title: () => GetIntlMessages("ใบแจ้งหนี้"),
                    dataIndex: 'status',
                    key: 'status',
                    width: 150,
                    align: "center",
                    render: (text, record) => text == 3 || text == 4 ? <CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /> : text == 2 ? <Button type='primary' onClick={() => addEditViewModal("view", record.id, null, "invoices")}>สร้างใบแจ้งหนี้</Button> : text == 1 ? <Popover content={GetIntlMessages("อยู่ระหว่างดำเนินการ")}> <ClockCircleOutlined style={{ color: 'orange', fontSize: 27 }} /></Popover> : <Popover content={GetIntlMessages("cancel")}> <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Popover>,
                    // render: (text, record) => <span className='color-sky-blue font-16 cursor-pointer' onClick={() => console.log('record', record)}>สร้างใบแจ้งหนี้</span>,
                },
            )
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
    }, [])

    useEffect(() => {
        const status = modelSearch.status
        if (permission_obj) setColumnsTable(status)

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = 1 }) => {
        try {
            if (page === 1) setLoading(true)
            // const res = await API.get(`/shopSalesQuotationsLogs/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=${_status == 3 ? "b39bcb5d-6c72-4979-8725-c384c80a66c3" : docTypeId }`)
            const res = await API.get(`/shopSalesTransactionDoc/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=${docTypeId}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                data.forEach(e => {
                    if (e.status == 2) {
                        e.___update = false;
                        e.___delete = false;
                    }
                });
                setColumnsTable(_status)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
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
            const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    const [isEditPaymentId, setIsEditPaymentId] = useState("")

    /* addEditView */
    const addEditViewModal = async (mode, id, isPayment, isInovices) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/shopSalesTransactionDoc/byid/${id}`)
                if (data.status == "success") {
                    setFormValueData(data.data)
                }
            } else {
                /* init data list service product */
                const list_service_product = [];
                form.setFieldsValue({
                    doc_type_id: `${docTypeId}`,
                    status: "1",
                    list_service_product,
                    user_id: authUser.id,
                    create: {
                        customer_type: "person"
                    }
                })
            }
            setActiveKeyTab("1")

            setIsModalVisible(true)

            form.setFieldsValue({
                customer_type: "business",
            })

            if (isPayment && id) {
                setIsModePayment(true)
                const { data } = await API.get(`/shopSalesTransactionOut/all?&limit=10&page=1&sort=created_date&order=asc&status=1&ref_doc_sale_id=${id}`)
                if (data.status == "success") {
                    const find = data.data.data.find(where => where.ref_doc_sale_id == id)
                    setIsEditPaymentId(find.doc_sale_id)
                }
            }
            // if (isPayment && id) setIsModePayment(true)
            if (isInovices === "invoices" && id) setIsModeInvoices(true)
        } catch (error) {
            console.log(`error`, error)
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
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        setConfigModal({ ...configModal, modeKey })
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        setIsModeInvoices(false)
        setActiveKeyTab("1")
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
    }

    const onFinish = async (value, isNotMessage) => {
        try {
            setLoading(true);
            let chkErr = true;
            if (configModal.mode === "add" && !value.search && isPlainObject(value.create)) {
                const _model = value.create;

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
            const per_customer_id = value.customer_type === "person" ? value.customer_id : null,
                bus_customer_id = value.customer_type === "business" ? value.customer_id : null;
            const valueForm = form.getFieldValue()
            const model = {
                bus_customer_id, //ลูกค้า
                per_customer_id, //ลูกค้า
                doc_date: moment(new Date()).format("YYYY-MM-DD"),
                details: {
                    customer_phone: value.customer_phone, //หมายเลขโทรศัพท์
                    user_id: value.user_id, //ผู้ทำเอกสาร
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

            let callback;
            if (configModal.mode === "add") {
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
                            shop_id,
                            list_service_product
                        })
                    }
                    chkErr = false
                }
            } else if (configModal.mode === "edit" && !isModeInvovices) {
                const { id } = form.getFieldValue();
                callback = await API.put(`/shopSalesTransactionDoc/put/${id}`, model);
                if (callback.data.status == "success") {
                    if (!isNotMessage) message.success("บันทึกสำเร็จ")
                    chkErr = false
                } else {
                    message.warning(callback.data.data)
                }
            } else if ((configModal.mode === "view" || configModal.mode === "edit") && isModeInvovices) { // ออกใบแจ้งโดยที่ยังไม่ได้จ่ายตัง
                const { id } = form.getFieldValue();
                const { shop_id } = authUser.UsersProfile;

                model.doc_type_id = "b39bcb5d-6c72-4979-8725-c384c80a66c3" // ใบเสร็จอย่างย่อ หรือ ใบแจ้งหนี้
                model.shop_id = shop_id;
                model.status = 3

                callback = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback.data.status == "success") {
                    const data_transaction_out = {
                        doc_sale_id: callback.data.data.id,
                        ref_doc_sale_id: id,
                        status: 1
                    }
                    if (!isNotMessage) {
                        const { data } = await API.post(`/shopSalesTransactionDoc/add`, data_transaction_out);
                        if (data.status == "success") {
                            // setConfigModal({ ...configModal, mode: 'edit' });
                            // form.setFieldsValue({
                            //     id: callback.data.data.id,
                            //     shop_id,
                            //     list_service_product: valueForm.list_service_product,
                            //     status: 3,
                            // })
                            message.success("บันทึกสำเร็จ")
                            handleCancel()
                        } else {
                            message.warning(data.data)
                        }
                    }
                } else {
                    message.warning(callback.data.data)
                }
            }

            if (configModal.mode === "add" && !value.search && isPlainObject(value.create)) chkErr = true;

            if (!chkErr) {
                /* อัพเดท หมายเลขโทรศัพท์ */
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

                        await API.put(`/shopPersonalCustomers/put/${value.customer_id}`, data_modal)
                    }

                } else if (value.customer_type === "business") {
                    const { data } = await API.get(`/shopBusinessCustomers/byid/${value.customer_id}`)
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

                        await API.put(`/shopBusinessCustomers/put/${value.customer_id}`, data_modal)
                    }

                }


            }
            setLoading(false)

            if (configModal.modeKey == 1) {
                form.resetFields()
                setConfigModal({ ...configModal, mode: 'add', modeKey: null })
                setActiveKeyTab("1")
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                addEditViewModal("add")
            } else if (configModal.modeKey == 2) {
                handleCancel()
            }
        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด !!');
            // console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const setFormValueData = (value) => {

        const list_service_product = [];
        get(value, `details.list_service_product`, []).forEach(e => {
            const find = isArray(value.ShopSalesOrderPlanLogs) && value.ShopSalesOrderPlanLogs.length > 0 ? value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount) : get(value, `details.list_service_product`, []).find(where => where.id == e.id && where.amount == e.amount);
            // const find = value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount);
            if (isPlainObject(find)) list_service_product.push(e)
        })
        const model = {
            id: value.id,
            customer_type: null, //ประเภทลูกค้า
            customer_id: null, //ชื่อลูกค้า
            customer_phone: get(value, `details.customer_phone`, null), //หมายเลขโทรศัพท์
            vehicles_customers_id: value.vehicles_customers_id, //หมายเลขโทรศัพท์
            mileage: get(value, `details.mileage`, null),
            mileage_old: get(value, `details.mileage_old`, null),
            tax_id: get(value, `details.tax_id`, null), //ประเภทภาษี
            doc_type_id: value.doc_type_id,
            status: value.status.toString(),
            user_id: authUser.id,
            shop_id: value.shop_id,
            list_service_product,
            avg_registration_day: get(value, `details.avg_registration_day`, 0),
            avg_registration_month: get(value, `details.avg_registration_day`, 0) * 30,
            remark: get(value, `details.remark`, null), //หมายเหตุ
            remark_inside: get(value, `details.remark_inside`, null), //หมายเหตุ (ภายใน)
            tailgate_discount: get(value, `details.tailgate_discount`, 0), //ส่วนลดท้ายบิล
            remark_payment: get(value, `details.remark_payment`, ""),

            purchase_status: get(value, `purchase_status`, "")  //สถานะการจ่ายเงิน
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
                label: GetIntlMessages("select-status"),
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
                        key: GetIntlMessages("ดำเนินการเรียบร้อย"),
                        value: "2",
                    },
                    {
                        key: GetIntlMessages("ออกบิลอย่างย่อ"),
                        value: "3",
                    },
                ],
            },
        ],
        col: 8,
        button: {
            name: {
                add: GetIntlMessages(`สร้าง`),
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

    const calculateResult = async () => {
        const { list_service_product, tax_id, tailgate_discount } = form.getFieldValue();

        let total = 0, discount = 0, vat = 0, net_total = 0, total_amount = 0;

        list_service_product.forEach(e => {
            total += ((Number(e.amount ?? 0) * Number(e.price ?? 0)));
            discount += Number(e.discount ?? 0)
            total_amount += Number(e.amount ?? 0)
        });
        total = total - discount

        if (tax_id && tax_id !== "fafa3667-55d8-49d1-b06c-759c6e9ab064") {
            const { detail } = whereIdArray(taxTypesList.length > 0 ? taxTypesList : await getTaxTypes(), tax_id);
            if (isPlainObject(detail)) {
                vat = ((total * Number(detail.tax_rate_percent)) / 100)
                total = total - vat
            }
        }

        net_total = total - Number(tailgate_discount ?? 0)

        form.setFieldsValue({
            total,
            total_text: total.toLocaleString(),

            discount,
            discount_text: discount ? discount.toLocaleString() : 0,

            net_total,
            net_total_text: net_total ? net_total.toLocaleString() : 0,

            vat,

            total_amount,
        })
    }

    const ModalFullScreenTitle = ({ title, }) => {
        const isShowButtonstatus1 = () => {
            const { status } = form.getFieldValue()
            return (configModal.mode == "edit" || configModal.mode == "view") && status == 1
        }

        const onClickButtonstatus1 = () => {
            const { id } = form.getFieldValue()
            Swal.fire({
                title: 'ยืนยันการทำรายการ?',
                text: "สถานะจะถูกเปลี่ยนเป็นดำเนินการเรียบร้อย",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'ตกลง',
                cancelButtonText: 'ยกเลิก'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await onFinish(form.getFieldValue(), true)
                    API.put(`/shopSalesTransactionDoc/put/${id}`, { status: 2 }).then(({ data }) => {
                        if (data.status != "success") {
                            message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                        } else {
                            Swal.fire(
                                'บันทึกสำเร็จ',
                                'เปลี่ยนสถานะจะถูกเปลี่ยนเป็นดำเนินการเรียบร้อย',
                                'success'
                            )
                            handleCancel()
                        }

                    })

                }
            })

        }
        return (
            <>
                <span> {title}</span>
                {
                    isShowButtonstatus1() ?
                        <span style={{ paddingLeft: 15 }}>
                            <Button style={{ borderColor: "#000000" }} onClick={onClickButtonstatus1}>ดำเนินการเรียบร้อย</Button>
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

    const onFinishPayment = async (value) => {
        try {
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

            model.doc_date = moment(new Date()).format("YYYY-MM-DD")
            /* ------------------------ add shopSalesTransactionDoc ------------------------ */
            if (value.status == 2) {
                const callback1 = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback1.data.status == "success") {
                    const data_transaction_out = {
                        doc_sale_id: callback1.data.data.id,
                        ref_doc_sale_id: valueForm.id,
                        status: 1
                    }
                    const { data } = await API.post(`/shopSalesTransactionOut/add`, data_transaction_out);
                    if (data.status == "success") {
                        setConfigModal({ ...configModal, mode: 'edit' });
                        // message.success("บันทึกสำเร็จ")
                        // handleCancel()
                        // handleCancelPayment()

                        model.details.payment = valueForm.payment;
                        model.purchase_status = true;
                        const promise2 = API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                            details: model.details,
                            purchase_status: true
                        });
                        const promise3 = API.put(`/shopSalesTransactionDoc/put/${callback1.data.data.id}`, model);

                        const [callback2, callback3] = await Promise.all([promise2, promise3]);
                        if (callback3.data.status == "success") {
                            message.success("บันทึกสำเร็จ")
                            handleCancel()
                            handleCancelPayment()
                        } else {
                            message.warning(data.data)
                        }

                    } else {
                        message.warning(data.data)
                    }
                } else {
                    message.warning('มีบางอย่างผิดพลาด !!')
                }
            } else if (value.status == 3) {

                setConfigModal({ ...configModal, mode: 'edit' });
                model.details.payment = valueForm.payment;
                model.purchase_status = true;

                const promise1 = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, {
                    details: model.details,
                    purchase_status: true
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

            } else {
                message.warning('มีบางอย่างผิดพลาด !!')
            }

        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
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
        return (status == "3" || status == "2") && purchase_status != true && isModeInvovices != true
    }

    // const componentRef = useRef(null);
    // const [dataSendToComponeteToPrint, setDataSendToComponeteToPrint] = useState([])
    // const reactToPrintContent = useCallback(() => {
    //     return componentRef.current;
    // }, [componentRef.current]);
    // const handlePrint = useReactToPrint({
    //     content: reactToPrintContent,
    //     pageStyle: `
    //     @page {
    //         margin: 18mm 5mm 18mm 5mm;
    //         size: auto;
    //        }
    //        `,
    // });

    return (
        <>

            <div id="page-manage">
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={callbackSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} /> */}

                {/* <div style={{ overflow: "hidden", height: "0px" }}>
                    <ComponentToPrint ref={componentRef} size={`A4`} tableData={dataSendToComponeteToPrint} docTypeId={docTypeId}/>
                </div> */}

                <ModalFullScreen
                    maskClosable={false}
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" && isModeInvovices != true }}
                    title={<ModalFullScreenTitle title={documentTypesName} />}
                    okButtonDropdown={isModeInvovices != true}
                    CustomsButton={() => {
                        return (
                            <div >
                                <span className='pr-3'>
                                    <Button onClick={handleCancel} style={{ width: 100 }}>ยกเลิก</Button>
                                </span>
                                {/* <span className='pr-3'>
                                    <Button type="primary" onClick={handlePrint} style={{ width: 100 }}> Print</Button>
                                </span> */}
                                {form.getFieldValue().status == "1" || form.getFieldValue().status == "3" ?
                                    // <Button disabled={configModal.mode == "view"} type='primary' onClick={() => handleOk(0)} style={{ width: 100 }}>บันทึก</Button>
                                    <span className='pr-3'>
                                        <Dropdown.Button
                                            htmlType="submit"
                                            type='primary'
                                            icon={<DownOutlined />}
                                            onClick={() => handleOk(0)}
                                            onEnter
                                            loading={loading}
                                            disabled={configModal.mode == "view"}
                                            overlay={
                                                (
                                                    <Menu >
                                                        <Menu.Item onClick={() => handleOk(1)} key="1">บันทึกแล้วสร้างใหม่</Menu.Item>
                                                        <Menu.Item onClick={() => handleOk(2)} key="2">บันทึกแล้วปิด</Menu.Item>
                                                    </Menu>
                                                )
                                            }
                                        >
                                            บันทึก
                                        </Dropdown.Button>
                                    </span>

                                    : ""}

                                {isModeInvovices ?
                                    <Button type='primary' onClick={() => handleOk(0)} style={{ width: 100 }}>สร้างใบแจ้งหนี้</Button>
                                    : ""}

                                {checkButtonPayment() ?
                                    <Button type='primary' onClick={() => onClickPayment(form.getFieldValue())} style={{ width: 100 }}>รับชำระ</Button>
                                    // <Button type='primary' onClick={() => setIsModePayment(true)} style={{ width: 100 }}>รับชำระ</Button>
                                    : ""}

                            </div>
                        )
                    }}
                >
                    <div className="container-fluid">
                        {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                        <div className='pr-5 pl-5 detail-before-table'>
                            <FormServicePlans mode={configModal.mode} configModal={configModal} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} taxTypesList={taxTypesList} calculateResult={calculateResult} type={1} />
                        </div>

                        <div className='tab-detail'>
                            <Tabs activeKey={activeKeyTab} onChange={(value) => setActiveKeyTab(value)}>
                                <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                                    <Tab1ServiceProduct mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} handleOk={handleOk} calculateResult={calculateResult} type={4} />
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
                                            {/* <TabPane tab={GetIntlMessages("รถยนต์")} key="4">
                                                <Tab4Vehicle mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} />
                                            </TabPane> */}
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
                                <PaymentDocs mode={configModal.mode} onFinish={onFinishPayment} form={form} type={2} />
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




export default Quotationcomponent
