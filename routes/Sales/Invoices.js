import { createRef, useCallback, useEffect, useRef, useState } from 'react'
import { message, Form, Tabs, Button, Dropdown, Menu, Popover } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, StopOutlined, ClockCircleOutlined, DownOutlined } from "@ant-design/icons";
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import GetIntlMessages from '../../util/GetIntlMessages';

import FormServicePlans from '../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.FormServicePlans'
import Tab1ServiceProduct from '../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab1.ServiceProduct'
import Tab2Custome from '../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab2.Custome'
import ModalFullScreen from '../../components/shares/ModalFullScreen';
import moment from 'moment'
import { get, isArray, isFunction, isPlainObject } from 'lodash';
import PaymentDocs from '../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.PaymentDocs';
import Tab4Vehicle from '../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab4.Vehicle';

import ReactToPrint, { useReactToPrint } from "react-to-print";
import ComponentToPrint from "../../components/Routes/Sales/CreatePdf/index";
import PrintOut from "../../components/shares/PrintOut";


const { TabPane } = Tabs;
const Invoices = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const [lengthShelfData, setLengthShelfData] = useState(0)
    const [taxTypesList, setTaxTypesList] = useState([]) //ประเภทภาษี

    const [dataSendToComponeteToPrint, setDataSendToComponeteToPrint] = useState([])

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
            status: "3",
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
            // console.log('ShopPersonalCustomers', ShopPersonalCustomers)
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

    const setColumnsTable = (data) => {
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
                title: () => GetIntlMessages("เลขที่ใบ เสร็จรับเงิน/กำกับภาษี"),
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
            {
                title: () => GetIntlMessages("เลขทะเบียน"),
                dataIndex: 'ShopVehicleCustomers',
                key: 'ShopVehicleCustomers',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text) ? text.details.registration : "-",
            },
            {
                title: () => GetIntlMessages("ราคารวม"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.net_total_text ?? "-" : "-",
            },
            {
                title: () => GetIntlMessages("สถานะการชำระ"),
                dataIndex: 'purchase_status',
                key: 'purchase_status',
                width: 150,
                align: "center",
                render: (text, record) => text ? <span className='color-green font-16'>ชำระแล้ว</span> : <span className='color-red font-16 cursor-pointer' onClick={() => onClickPayment(record)}>ยังไม่ชำระ</span>,
            },
            {
                title: () => GetIntlMessages("ใบเสร็จเต็มรูป"),
                dataIndex: '',
                key: '',
                width: 200,
                align: "center",
                render: (text, record) => text.details.full_invoice && text.details.full_invoice == true ? <Popover content={GetIntlMessages("สร้างใบเสร็จเต็มรูปแล้ว")}><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Popover> : text.purchase_status && text.purchase_status == true ? <Button type='primary' onClick={() => onClickAddFullInvoices(record)}>สร้างใบเสร็จเต็มรูป</Button> : <Popover content={GetIntlMessages("ยังไม่ชำระ")}><ClockCircleOutlined style={{ color: 'orange', fontSize: 27 }} /></Popover>,
            },
        ];



        setColumns(_column)
    }

    const onClickPayment = (item) => {
        if (isPlainObject(item)) {
            addEditViewModal("view", item.id, true)
        }
    }
    const onClickAddFullInvoices = (item) => {
        if (isPlainObject(item)) {
            addEditViewModal("view", item.id, null, true)
        }
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
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = 3 }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopSalesTransactionDoc/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=b39bcb5d-6c72-4979-8725-c384c80a66c3`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;

                data.forEach(e => {
                    e.___update = false;
                    if (e.purchase_status == true) {
                        e.___delete = false;
                    }
                });
                setColumnsTable(data)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                console.log(`res.data`, res.data)
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
            // delete,active,block
            // const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            // // console.log('changeStatus :>> ', status, id);
            // console.log('isuse', isuse)
            const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                console.log(`search`, modelSearch.search)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */

    const addEditViewModal = async (mode, id, isPayment, isFullInvoices) => {
        try {
            // console.log('mode', mode, id)
            setConfigModal({ ...configModal, mode })
            console.log('id', id)
            if (id) {
                const { data } = await API.get(`/shopSalesTransactionDoc/byid/${id}`)
                if (data.status == "success") {
                    console.log('data :>> ', data.data);
                    data.data.doc_type_id = "b39bcb5d-6c72-4979-8725-c384c80a66c3"
                    // debugger
                    setDataSendToComponeteToPrint(data.data)
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
                    doc_type_id: "b39bcb5d-6c72-4979-8725-c384c80a66c3",
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
            if (isPayment) setIsModePayment(true)
            if (isFullInvoices) setIsModeFullInvoices(true)
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
        // console.log('modeKey', modeKey)
        setConfigModal({ ...configModal, modeKey })
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add', modeKey: null })
        setIsModalVisible(false)
        setIsModeFullInvoices(false)
        setActiveKeyTab("1")
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
    }

    const onFinish = async (value) => {
        try {

            // console.log('value', value)
            // console.log('configModal', configModal)

            const valueForm = form.getFieldValue(),
                per_customer_id = value.customer_type === "person" ? value.customer_id : null,
                bus_customer_id = value.customer_type === "business" ? value.customer_id : null;
            const { shop_id } = authUser.UsersProfile;

            const getByid = await API.get(`/shopSalesTransactionDoc/byid/${valueForm.id}`);

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
                    remark_payment: value.remark_payment,
                },
                vehicles_customers_id: value.vehicles_customers_id, //รถ
                doc_type_id: value.doc_type_id, //ประเภทเอกสาร
                sale_type: false,
                status: 3,
                shop_id
            }

            if (configModal.mode === "add") {
                model.doc_date = moment(new Date()).format("YYYY-MM-DD")

                /* ------------------------ add shopSalesTransactionDoc ------------------------ */
                const callback = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback.data.status == "success") {
                    const data_transaction_out = {
                        doc_sale_id: callback.data.data.id,
                        ref_doc_sale_id: valueForm.id,
                        status: 1
                    }
                    const { data } = await API.post(`/shopSalesTransactionOut/add`, data_transaction_out);
                    if (data.status == "success") {
                        setConfigModal({ ...configModal, mode: 'edit' });
                        form.setFieldsValue({
                            id: callback.data.data.id,
                            shop_id,
                            list_service_product: valueForm.list_service_product,
                            status: 3,
                        })
                        message.success("บันทึกสำเร็จ")
                    } else {
                        message.warning(data.data)
                    }
                } else {
                    message.warning('มีบางอย่างผิดพลาด !!')
                }
            } else if (configModal.mode === "view" && isModeFullInvoices == true) {
                model.doc_date = moment(new Date()).format("YYYY-MM-DD")
                model.doc_type_id = "e67f4a64-52dd-4008-9ef0-0121e7a65d48"
                model.status = 4
                const callback = await API.post(`/shopSalesTransactionDoc/add`, model);
                if (callback.data.status == "success") {
                    const data_transaction_out = {
                        doc_sale_id: callback.data.data.id,
                        full_invoice_doc_sale_id: valueForm.id,
                        status: 2
                    }
                    const { data } = await API.post(`/shopSalesTransactionOut/add`, data_transaction_out);
                    if (data.status == "success") {
                        const __model = {
                            details: {
                                ...getByid.data.data.details,
                                full_invoice: true
                            }
                        }
                        await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, __model);
                        setConfigModal({ ...configModal, mode: 'edit' });
                        form.setFieldsValue({
                            id: callback.data.data.id,
                            shop_id,
                            list_service_product: valueForm.list_service_product,
                            status: "3",
                        })
                        message.success("บันทึกสำเร็จ")
                        handleCancel()
                    } else {
                        message.warning(data.data)
                    }
                } else {
                    message.warning('มีบางอย่างผิดพลาด !!')
                }
            } else {
                // console.log('valueForm edit', valueForm)
                model.details.payment = valueForm.payment;
                model.purchase_status = true;
                const callback = await API.put(`/shopSalesTransactionDoc/put/${valueForm.id}`, model);
                if (callback.data.status == "success") {
                    message.success("บันทึกสำเร็จ")
                    handleCancel()
                    handleCancelPayment()
                } else {
                    message.warning(data.data)
                }
            }


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
        // console.log('code_id', value.code_id)
        // console.log('value', value)

        const list_service_product = [];
        get(value, `details.list_service_product`, []).forEach(e => {
            // ShopSalesTransactionOuts
            const find = get(value, `details.list_service_product`, []).find(where => where.id == e.id && where.amount == e.amount);
            if (isPlainObject(find)) list_service_product.push(e)
        })


        const model = {
            id: value.id,
            code_id: value.code_id,
            search_status_2: value.code_id,
            purchase_status: value.purchase_status,
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
            payment: get(value, `details.payment`, ""),
        }
        if (value.bus_customer_id) {
            model.customer_type = "business"
            model.customer_id = value.bus_customer_id
        } else if (value.per_customer_id) {
            model.customer_type = "person"
            model.customer_id = value.per_customer_id
        }
        // console.log('value', value)
        // console.log('model', model)
        form.setFieldsValue(model)
        calculateResult()
    }

    /* master */
    const getMasterData = async () => {
        try {
            const [value1, value2] = await Promise.all([getShelfData(), getTaxTypes()])
            setLengthShelfData(value1.length)
            if (isArray(value2)) setTaxTypesList(value2);
        } catch (error) {

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
                        key: GetIntlMessages("ออกบิลอย่างย่อ"),
                        value: "3",
                    },
                    // {
                    //     key: GetIntlMessages("ออกบิลเต็มรูป"),
                    //     value: "4",
                    // },
                ],
            },
        ],
        col: 8,
        button: {
            name: {
                add: GetIntlMessages("สร้างใบเสร็จรับเงิน")
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
        // console.log('list_service_product', list_service_product)
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

    /* ขำระเงิน */
    const [isModePayment, setIsModePayment] = useState(false);

    const [isModeFullInvoices, setIsModeFullInvoices] = useState(false);

    const handleOkPayment = () => {

    }
    const handleCancelPayment = () => {
        setIsModePayment(false)
    }

    const checkButtonPayment = () => {
        const { status, purchase_status } = form.getFieldValue();
        return status == "3" && purchase_status != true
    }
    const checkButtonPrint = () => {
        const { status, purchase_status } = form.getFieldValue();
        return status == "3" && purchase_status == true
    }

    /*print*/
    const componentRef = useRef(null);

    const reactToPrintContent = useCallback(() => {
        return componentRef.current;
    }, []);
    const handlePrint = useReactToPrint({
        content: reactToPrintContent,
        pageStyle: `
        @page {
            margin: 18mm 5mm 18mm 5mm;
            size: auto;
           }
           `,
    });

    return (
        <>
            {/* b39bcb5d-6c72-4979-8725-c384c80a66c3 -> ใบเสร็จอย่างย่อ */}

            {/* <div style={{ overflow: "hidden", height: "0px" }}>
                <ComponentToPrint ref={componentRef} size={`A4`} tableData={dataSendToComponeteToPrint} docTypeId={"b39bcb5d-6c72-4979-8725-c384c80a66c3"} />
            </div> */}
            <div id="page-manage">
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add", null)} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <ModalFullScreen
                    maskClosable={false}
                    visible={isModalVisible}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    title={`ใบเสร็จรับเงิน/ใบกำกับภาษี`}
                    CustomsButton={() => {
                        return (
                            <div >
                                <span className='pr-3'>
                                    <Button onClick={handleCancel} style={{ width: 100 }}>ยกเลิก</Button>
                                </span>
                                <span className='pr-3'>
                                    <PrintOut documentId={form.getFieldValue().id} />
                                    {/* <Button type="primary" onClick={handlePrint} style={{ width: 100 }}> Print</Button> */}
                                </span>
                                {form.getFieldValue().status == "2" || (isModeFullInvoices == true && form.getFieldValue().status == "3") ?
                                    <Button type='primary' onClick={() => handleOk(0)} style={{ width: 100 }}>บันทึก</Button>
                                    : ""}

                                {checkButtonPayment() ?
                                    <Button type='primary' onClick={() => setIsModePayment(true)} style={{ width: 100 }}>รับชำระ</Button>
                                    : ""}
                                {/* {
                                    checkButtonPrint() ?
                                        <Button type='primary' onClick={handlePrint} style={{ width: 100 }}>Print</Button>
                                        : ""
                                } */}
                            </div>
                        )
                    }}
                >

                    <div className="container-fluid" >
                        {/* <div className="head-line-text">สร้างใบสั่งซ่อม</div> */}
                        <div className='pr-5 pl-5 detail-before-table'>
                            <FormServicePlans mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} taxTypesList={taxTypesList} calculateResult={calculateResult} type={2} addEditViewModal={addEditViewModal} />
                        </div>

                        <div className='tab-detail'>
                            <Tabs activeKey={activeKeyTab} onChange={(value) => setActiveKeyTab(value)}>

                                <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                                    <Tab1ServiceProduct mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} handleOk={handleOk} calculateResult={calculateResult} type={2} />
                                </TabPane>

                                <TabPane tab={GetIntlMessages("ลูกค้า / การชำระเงิน")} key="2">
                                    <Tab2Custome mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} type={2} />
                                </TabPane>

                                <TabPane tab={GetIntlMessages("รถยนต์")} key="4">
                                    <Tab4Vehicle mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} type={2} />
                                </TabPane>

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
                                <PaymentDocs mode={configModal.mode} onFinish={onFinish} onFinishFailed={onFinishFailed} form={form} type={2} />
                            </div>
                        </div>
                    </div>
                </ModalFullScreen>

            </div>

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

export default Invoices
