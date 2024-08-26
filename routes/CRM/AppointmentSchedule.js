import { useEffect, useState } from 'react'
import { Button, message, Input, Modal, Select, Form, Switch, Row, Col, DatePicker, Badge, Calendar, Divider, Space } from 'antd';
import { KeyOutlined, PlusOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import FormProvinceDistrictSubdistrict from '../../components/shares/FormProvinceDistrictSubdistrict';
import { FormInputLanguage, FormSelectLanguage } from '../../components/shares/FormLanguage';
import { get, isPlainObject, isArray, debounce } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import TextArea from 'antd/lib/input/TextArea';
import moment, { isMoment } from 'moment';
import ModalBusinessCustomers from "../../components/Routes/Modal/Components.Select.Modal.BusinessCustomers";
import ModalPersonalCustomers from "../../components/Routes/Modal/Components.Select.Modal.PersonalCustomers";
import SortingData from "../../components/shares/SortingData";

const { RangePicker } = DatePicker;

const AppointmentSchedule = () => {
    const masktel_no = createDefaultMaskGenerator('999 999 9999');
    const maskmobile_no = createDefaultMaskGenerator('999 999 9999');

    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { UsersProfile } = useSelector(({ auth }) => auth.authUser);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [resetPasswordFlag, setResetPassw0rdFlag] = useState(false)
    const [loadingGetCustomer, setLoadingGetCustomer] = useState(false);
    const [open, setOpen] = useState(false);
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [shopId, setSetShopId] = useState("")

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
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: false
            }
        },
        configSort: {
            sort: `updated_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "default",
            appointmentDate: [],
            customer_type: null
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)



    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("order"),
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
                title: "ประเภทลูกค้า",
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => {
                    if (record.bus_customer_id != null) {
                        return "ธุรกิจ"
                    }
                    if (record.per_customer_id != null) {
                        return "บุคคลธรรมดา"
                    }

                },
            },
            {
                title: "ชื่อลูกค้า",
                dataIndex: '',
                key: '',
                width: 300,
                render: (text, record) => {
                    if (record.bus_customer_id != null) {
                        return record.ShopBusinessCustomers.customer_name.th
                    }
                    if (record.per_customer_id != null) {
                        return `${record.ShopPersonalCustomers.customer_name.first_name.th} ${record.ShopPersonalCustomers.customer_name.last_name.th}`
                    }

                },
            },
            {
                title: () => GetIntlMessages("หัวข้อ"),
                dataIndex: 'details',
                key: 'details',
                width: 300,
                render: (text, record) => `${get(text, `subject`, "-")}`,
            },
            {
                title: () => GetIntlMessages("วันที่และเวลาเริ่มต้น"),
                dataIndex: 'start_date',
                key: 'start_date',
                width: 200,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },
            {
                title: () => GetIntlMessages("วันที่และเวลาสิ้นสุด"),
                dataIndex: 'end_date',
                key: 'end_date',
                width: 200,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },

        ];

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

        if (permission_obj)
            setColumnsTable()
        if (UsersProfile)
            setSetShopId(UsersProfile.shop_id)
    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), appointmentDate = modelSearch.appointmentDate, customer_type = modelSearch.customer_type, _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            function noWhiteSpace(value) {
                return value.replaceAll(/\s/g, '')
            }
            const dateFomat = "YYYY-MM-DD"
            let start_date = ""
            let end_date = ""
            if (isArray(appointmentDate) && appointmentDate.length > 0) {
                start_date = moment(appointmentDate[0]?._d).format(dateFomat)
                end_date = moment(appointmentDate[1]?._d).format(dateFomat)
            } else {
                start_date = ""
                end_date = ""
            }
            setStartDate(start_date)
            setEndDate(end_date)
            const noWhiteSpaceValue = noWhiteSpace(search)
            const checkIsOnlyNumber = noWhiteSpaceValue.match(/^\d+$/)
            let url = `/shopAppointment/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&start_date=${start_date}&end_date=${end_date}&customer_type=${customer_type}`
            // if (checkIsOnlyNumber != null) {
            //     const mobileNo = []
            //     const telNo = []
            //     for (let i = 0; i < 10; i++) {
            //         mobileNo.push({ mobile_no: `mobile_no_${i + 1}` })
            //         telNo.push({ tel_no: `tel_no_${i + 1}` })

            //     }
            //     url += `&jsonField.mobile_no=${mobileNo.map(e => e.mobile_no).join(",")}&jsonField.tel_no=${telNo.map(e => e.tel_no).join(",")}`
            // }
            const res = await API.get(url)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
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
            console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            // console.log('changeStatus :>> ', status, id);

            const { data } = await API.put(`/shopAppointment/put/${id}`, { status })
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
    const addEditViewModal = async (mode, id) => {
        try {
            // setMode(_mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                setResetPassw0rdFlag(false)
                setIsIdEdit(id)
                const { data } = await API.get(`/shopAppointment/byid/${id}`)
                if (data.status == "success") {
                    // console.log('data :>> ', data);
                    const _model = data.data
                    console.log("sss", _model)
                    var getData = []
                    if (_model.bus_customer_id !== null) {
                        _model.customer_type = "business"
                        getData = await getCustomerBusiness("")
                        console.log("getData", getData.data)
                        await setCustomerList(getData.data);
                        _model.customer_id = await _model.bus_customer_id
                    }
                    if (_model.per_customer_id !== null) {
                        _model.customer_type = "person"
                        getData = await getCustomerPerson("")
                        console.log("getData", getData.data)
                        getData.data.map((e) => {
                            e.customer_name[locale.locale] = `${e.customer_name.first_name[locale.locale]} ${e.customer_name.last_name[locale.locale]}`
                        })
                        await setCustomerList(getData.data);
                        _model.customer_id = await _model.per_customer_id
                    }

                    switch (_model.customer_type) {
                        case "business":
                            data = await getShopVehicleCustomer(_model.bus_customer_id, null)
                            break;
                        case "person":
                            data = await getShopVehicleCustomer(null, _model.per_customer_id)
                            break;
                    }
                    setVehicleCustomerList(data.data)
                    const dateFomat = "YYYY-MM-DD HH:mm:ss"
                    _model.appointmentDateTime = [
                        moment(_model.start_date),
                        moment(_model.end_date)
                    ]
                    // _model.appointmentDateTime = [moment("2020-03-09 13:00"), moment("2020-03-27 13:17")]
                    // _model.name_title_id = _model.UsersProfile.name_title
                    if (isPlainObject(_model.details)) {
                        _model.subject = _model.details.subject ?? null
                        _model.content = _model.details.content ?? null
                    }
                    console.log(_model)
                    form.setFieldsValue(_model)
                }

            }
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }


    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add' })
        setResetPassw0rdFlag(true)
        setIsModalVisible(false)
        setCustomerList(() => []);
        setVehicleCustomerList(() => []);
    }

    const onFinish = async (value) => {
        try {
            console.log(`value`, value)
            switch (value.customer_type) {
                case "business":
                    value.bus_customer_id = value.customer_id
                    break;
                case "person":
                    value.per_customer_id = value.customer_id
                    break;
            }
            const dateFomat = "YYYY-MM-DD HH:mm:ss"
            let start_date = ""
            let end_date = ""
            if (isArray(value.appointmentDateTime) && value.appointmentDateTime.length > 0) {
                start_date = moment(value.appointmentDateTime[0]?._d).format(dateFomat)
                end_date = moment(value.appointmentDateTime[1]?._d).format(dateFomat)
            } else {
                start_date = ""
                end_date = ""
            }

            const _model = {
                bus_customer_id: value.bus_customer_id ?? null,
                per_customer_id: value.per_customer_id ?? null,
                vehicles_customers_id: value.vehicles_customers_id ?? null,
                start_date: start_date ?? null,
                end_date: end_date ?? null,
                details: {
                    subject: value.subject ?? null,
                    content: value.content ?? null
                },
                shop_id: shopId,
                appointment_status: value.appointment_status ?? null
            }


            console.log(`_model`, _model)
            // if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            // else value.mobile_no = []

            // if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            // else value.tel_no = []

            let res
            if (configModal.mode === "add") {
                // _model.master_customer_code_id = ""
                res = await API.post(`/shopAppointment/add`, _model)
            } else if (configModal.mode === "edit") {
                // _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/shopAppointment/put/${idEdit}`, _model)
            }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(false)
                setConfigModal({ ...configModal, mode: "add" })
                form.resetFields()
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
                setCustomerList(() => []);
                setVehicleCustomerList(() => []);
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    /* master */
    const [nameTitleList, setNameTitleList] = useState([])
    const [departmentList, setDepartmentList] = useState([])
    const [empStatusList, setEmpstatusList] = useState([])
    const [relationList, setRelationList] = useState([])
    const [customerList, setCustomerList] = useState([]) //รายชื่อลูกค้า
    const [vehicleCustomerList, setVehicleCustomerList] = useState([]) //รายการรถลูกค้า
    const getMasterData = async () => {
        try {
            // const vehicleCustomer = await getShopVehicleCustomer() 
            // setVehicleCustomerList(vehicleCustomer)
            /* คำนำหน้า */
            // const nameTitle = await getNameTitleListAll()
            // const departmentList = await getDepartmentsListAll()
            // const empStatusList = await getEmpStatusListAll()
            // const relationList = await getRelationListAll()
            // setNameTitleList(nameTitle)
            // setDepartmentList(departmentList)
            // setEmpstatusList(empStatusList)
            // setRelationList(relationList)
        } catch (error) {

        }
    }

    const debounceOnSearchCustomer = debounce(
        (value, type) => onChangeCustomerId(value, type),
        1000
    );


    /* คำนำหน้า */
    const getNameTitleListAll = async () => {
        const { data } = await API.get(`/master/nameTitle?sort=code_id&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    /* คำนำหน้า */
    const getDepartmentsListAll = async () => {
        const { data } = await API.get(`/master/departments?sort=department_name.th&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    /* get Master shopPersonalCustomers */
    const getCustomerPerson = async (value) => {
        const { data } = await API.get(`/shopPersonalCustomers/all?search=${value}&limit=50&page=1`);
        return data.status == "success" ? data.data : []
    }
    /* get Master shopPersonalCustomers by id */
    const getCustomerPersonById = async (id) => {
        try {
            const { data } = await API.get(`/shopPersonalCustomers/byid/${id}`);
            return data.status === "success" ? data.data : []
        } catch (error) {

        }
    }

    /* get Master shopBusinessCustomers */
    const getCustomerBusiness = async (value) => {
        const { data } = await API.get(`/shopBusinessCustomers/all?search=${value}&limit=50&page=1`);
        return data.status == "success" ? data.data : []
    }
    /* get Master shopBusinessCustomers by id */
    const getCustomerBusinessById = async (id) => {
        try {
            const { data } = await API.get(`/shopBusinessCustomers/byid/${id}`);
            return data.status === "success" ? data.data : []
        } catch (error) {

        }

    }

    /* get Master shopVehicleCustomer */
    const getShopVehicleCustomer = async (bus_customer_id, per_customer_id) => {
        const { data } = await API.get(`/shopVehicleCustomer/all?limit=50&page=1${bus_customer_id ? `&bus_customer_id=${bus_customer_id}` : ""}${per_customer_id ? `&per_customer_id=${per_customer_id}` : ""}`);
        return data.status == "success" ? data.data : []
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({ search: value.search, appointmentDate: value.appointmentDate, customer_type: value.customer_type, _status: value.status, page: init.configTable.page })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            search: init.modelSearch.search ?? "",
            appointmentDate: init.modelSearch.appointmentDate,
            customer_type: init.customer_type,
            _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /** กดปุ่มเครียร์ Dropdown */
    const onClearFilterSearch = (type) => {
        try {
            const searchModel = {
                ...modelSearch
            }

            switch (type) {
                case "appointmentDate":
                    searchModel.appointmentDate = null
                    break;
                case "customer_type":
                    searchModel.customer_type = null
                    break;
                default:
                    break;
            }
            setModelSearch((previousValue) => searchModel);
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
                type: "RangePicker",
                name: "appointmentDate",
                label: GetIntlMessages("document-date"),
                allowClear: true
            },
            {
                index: 1,
                type: "select",
                name: "customer_type",
                label: GetIntlMessages("ประเภทลูกค้า"),
                allowClear: true,
                placeholder: GetIntlMessages("เลือกประเภทลูกค้า"),
                list: [
                    {
                        key: GetIntlMessages("บุคคลธรรมดา"),
                        value: "personal",
                    },
                    {
                        key: GetIntlMessages("ธุรกิจ"),
                        value: "business",
                    },
                ],
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
                        key: GetIntlMessages("normal-status"),
                        value: "active",
                    },
                    {
                        key: GetIntlMessages("blocked-status"),
                        value: "block",
                    },
                    {
                        key: GetIntlMessages("delete-status"),
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
        onClearFilterSearch
    }

    const onCreate = () => {
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
        setResetPassw0rdFlag(true)
        setCustomerList(() => []);
        setVehicleCustomerList(() => []);
    }


    const onChangeCustomerType = async (value) => {
        form.setFieldsValue({
            customer_id: null,
            vehicles_customers_id: null
        });
        setCustomerList(() => []);
        setVehicleCustomerList(() => []);
    };

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    };

    const callbackModalCustomers = async (item) => {
        try {
            // getMasterData();
            console.log("itemm", item)
            const { customer_type } = form.getFieldValue();
            // console.log("customer_type",customer_type)
            if (customer_type) await onChangeCustomerType(customer_type);
            setLoadingGetCustomer(() => true);
            console.log("customer_type", customer_type)
            var getData = []
            switch (customer_type) {
                case "business":
                    console.log("sss")
                    getData = await getCustomerBusiness("")
                    console.log("gg", getData)
                    await setCustomerList(getData.data);
                    await form.setFieldsValue({
                        customer_id: await item.id,
                    });
                    break;

                case "person":
                    console.log("aaa")
                    getData = await getCustomerPerson("")
                    console.log("gg", getData)
                    getData.data.map((e) => {
                        e.customer_name[locale.locale] = `${e.customer_name.first_name[locale.locale]} ${e.customer_name.last_name[locale.locale]}`
                    })
                    await setCustomerList(getData.data);
                    await form.setFieldsValue({
                        customer_id: await item.id,
                    });
                    break;
            }
            console.log("customerList", customerList)
            setLoadingGetCustomer(() => false);
        } catch (error) { }
    };

    const onChangeCustomerId = async (value, type) => {
        try {
            // console.log('value :>> ', value);
            setLoadingGetCustomer(() => true);
            const { customer_type } = form.getFieldValue();
            let res;
            if (type === "onSearch") {
                if (!!customer_type && customer_type === "business" && !!value) {
                    res = await API.get(
                        `/shopBusinessCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active`
                    );

                    if (res.data.status === "success") {
                        setCustomerList(() =>
                            SortingData(res.data.data.data, `customer_name.${locale.locale}`)
                        );
                    }
                    else {
                        setCustomerList(() => []);
                        setVehicleCustomerList(() => []);
                    }
                } else if (!!customer_type && customer_type === "person" && !!value) {
                    res = await API.get(
                        `/shopPersonalCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active`
                    );
                    if (res.data.status === "success") {
                        const new_data = res.data.data.data.map((e) => {
                            // console.log("eiei", e)
                            const newData = { ...e, customer_name: {} };
                            locale.list_json.forEach((x) => {
                                newData.customer_name[x] = e.customer_name
                                    ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"
                                    }`
                                    : "";
                                return newData;
                            });
                            return newData;
                        });
                        setCustomerList(() =>
                            SortingData(new_data, `customer_name.${locale.locale}`)
                        );
                    } else {
                        setCustomerList(() => []);
                        setVehicleCustomerList(() => []);
                    }
                } else {
                    setCustomerList(() => []);
                    setVehicleCustomerList(() => []);
                }
            }
            setLoadingGetCustomer(() => false);
        } catch (error) { }
        // const find = customerList.find(where => where.id === value);
        // if (isPlainObject(find)) {
        //     form.setFieldsValue({
        //         customer_type: find.customer_type
        //     })
        // }
    };

    const onSelect = async (value) => {
        form.setFieldsValue({
            vehicles_customers_id: null
        })
        var data
        const { customer_type } = form.getFieldValue();
        switch (customer_type) {
            case "business":
                data = await getShopVehicleCustomer(value, null)
                break;
            case "person":
                data = await getShopVehicleCustomer(null, value)
                break;
        }
        setVehicleCustomerList(data.data)
    }
    return (
        <>

            <div id="page-manage">
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => onCreate()} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <Modal
                    width={850}
                    maskClosable={false}
                    // style={{ top: 0 }}
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}การนัดหมาย`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: "80vh",
                        overflowX: "auto",
                    }}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Row>
                            <Col md={24} lg={24} xs={24}>
                                <Form.Item
                                    name="customer_type"
                                    label={GetIntlMessages(`customer-type`)}
                                    rules={[
                                        {
                                            required: true,
                                            message: GetIntlMessages(
                                                `fill-out-the-information-completely`
                                            ),
                                        },
                                    ]}
                                >
                                    <Select
                                        style={{ width: "100%" }}
                                        onChange={onChangeCustomerType}
                                        disabled={configModal.mode == "view"}
                                    >
                                        <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                        <Select.Option value="business">ธุรกิจ</Select.Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="customer_id"
                                    label={GetIntlMessages(`customer`)}
                                    rules={[
                                        {
                                            required: true,
                                            message: GetIntlMessages(
                                                `fill-out-the-information-completely`
                                            ),
                                        },
                                    ]}
                                    extra={GetIntlMessages(
                                        "เลือกประเภทลูกค้าที่ต้องการ และ พิมพ์อย่างน้อย 1 ตัวเพื่อหาชื่อลูกค้า"
                                    )}
                                >
                                    <Select
                                        style={{ width: "100%" }}
                                        loading={loadingGetCustomer}
                                        disabled={configModal.mode == "view"}
                                        showSearch
                                        open={open}
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                            0
                                        }
                                        onDropdownVisibleChange={(visible) => setOpen(visible)}
                                        onChange={(value) => onChangeCustomerId(value, "onChange")}
                                        onSearch={(value) =>
                                            debounceOnSearchCustomer(value, "onSearch")
                                        }
                                        onSelect={(value) => onSelect(value)}
                                        dropdownRender={(menu) => (
                                            <>
                                                {menu}
                                                {checkValueCustomerType() ? (
                                                    <>
                                                        <Divider style={{ margin: "8px 0" }} />
                                                        <Space
                                                            align="center"
                                                            style={{ padding: "0 8px 4px" }}
                                                            onClick={() => setOpen(false)}
                                                        >
                                                            {checkValueCustomerType() === "business" ? (
                                                                <ModalBusinessCustomers
                                                                    textButton={GetIntlMessages(`เพิ่มข้อมูล`)}
                                                                    icon={<PlusOutlined />}
                                                                    callback={(value) => callbackModalCustomers(value)}
                                                                />
                                                            ) : (
                                                                <ModalPersonalCustomers
                                                                    textButton={GetIntlMessages(`เพิ่มข้อมูล`)}
                                                                    icon={<PlusOutlined />}
                                                                    callback={(value) => callbackModalCustomers(value)}
                                                                />
                                                            )}
                                                        </Space>
                                                    </>
                                                ) : null}
                                            </>
                                        )}
                                    >
                                        {customerList.map((e) => (
                                            <Select.Option key={e.id} value={e.id}>
                                                {e.customer_name[locale.locale]}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="vehicles_customers_id" label={"ข้อมูลรถยนต์"} >
                                    <Select
                                        placeholder="เลือกข้อมูล"
                                        optionFilterProp="children"
                                        showSearch
                                        disabled={configModal.mode == "view"}
                                    >
                                        {isArray(vehicleCustomerList) ? vehicleCustomerList.map((e, index) => (
                                            <Select.Option value={e.id} key={index}>
                                                {e.details.registration + " " + e.details.province_name}
                                            </Select.Option>
                                        )) : null}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    name="appointmentDateTime"
                                    label={GetIntlMessages(`เลือกเวลา`)}
                                    rules={[
                                        {
                                            required: true,
                                            message: GetIntlMessages(`เลือกเวลา`),
                                        },
                                    ]}
                                >
                                    <RangePicker style={{ width: "100%" }} showTime disabled={configModal.mode == "view"} />
                                </Form.Item>

                                <Form.Item
                                    name="subject"
                                    label={"หัวข้อ"}
                                    rules={[{
                                        required: true,
                                        message: GetIntlMessages("please-fill-out"),
                                    }]}
                                >
                                    <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} />
                                </Form.Item>

                                <Form.Item name="content" label={GetIntlMessages("เนื้อหา")} >
                                    <TextArea
                                        placeholder="กรอกเนื้อหา"
                                        rows={4}
                                        disabled={configModal.mode == "view"}
                                        maxLength={200}
                                        showCount
                                    >
                                    </TextArea>
                                </Form.Item>

                                <Form.Item
                                    name="appointment_status"
                                    label={"สถานะการนัดหมาย"}
                                    rules={[{
                                        required: true,
                                        message: GetIntlMessages("please-fill-out"),
                                    }]}>
                                    <Select
                                        placeholder="เลือกข้อมูล"
                                        optionFilterProp="children"
                                        showSearch
                                        disabled={configModal.mode == "view"}
                                        defaultValue={0}
                                    >
                                        <Select.Option value={0}>
                                            {"รอยืนยันการนัดหมาย"}
                                        </Select.Option>
                                        <Select.Option value={1}>
                                            {"ยืนยันการนัดหมาย"}
                                        </Select.Option>
                                        <Select.Option value={2}>
                                            {"ยกเลิกการนัดหมาย"}
                                        </Select.Option>
                                    </Select>
                                </Form.Item>


                            </Col>
                        </Row>
                    </Form>
                </Modal>

            </div>
        </>
    )
}

export default AppointmentSchedule
