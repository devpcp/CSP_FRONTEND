import { useEffect, useState } from 'react'
import { message, Modal, Form, Row, Col, Image, Select, Input, Divider, Space, DatePicker, InputNumber, Button, List, Switch, Tooltip, Typography } from 'antd';
import { PlusOutlined, UploadOutlined, InfoCircleTwoTone } from "@ant-design/icons";
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { FormInputLanguage, } from '../../components/shares/FormLanguage';
import { get, debounce, isPlainObject, isFunction } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';
import ModalBusinessCustomers from "../../components/Routes/Modal/Components.Select.Modal.BusinessCustomers";
import ModalPersonalCustomers from "../../components/Routes/Modal/Components.Select.Modal.PersonalCustomers";
import SortingData from "../../components/shares/SortingData";
import moment from "moment";
import BankAccountData from './BankAccountData';
import ModalFullScreen from '../../components/shares/ModalFullScreen';
import Fieldset from '../../components/shares/Fieldset';
import { ImageMulti } from '../../components/shares/FormUpload/ImageMulti'
import { UploadImageCustomPathMultiple, DeleteImageCustomPathMultiple } from '../../components/shares/FormUpload/API'

const { Text, Link } = Typography;

const ChequeData = ({ title = null, callBack }) => {

    const [loading, setLoading] = useState(false);
    const { authUser } = useSelector(({ auth }) => auth);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [imgEmpUrl, setImgEmpUrl] = useState(false)
    const { bankNameList } = useSelector(({ master }) => master);
    const [loadingGetCustomer, setLoadingGetCustomer] = useState(false);
    const [customerList, setCustomerList] = useState([]); //รายชื่อลูกค้า
    const [open, setOpen] = useState(false);
    const [isBankAccountDataModalVisible, setIsBankAccountDataModalVisible] = useState(false);
    const localStringTwoDecimals = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    const [checkedChequeUseStatusIsuse, setCheckedChequeUseStatusIsuse] = useState(true);

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
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
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
                use: true,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: () => GetIntlMessages("customer"),
                dataIndex: "customer",
                key: "customer",
                width: 300,
                name: "customer_name",
                use: true,
                render: (text, record) => {
                    try {
                        let value = "-";
                        if (isPlainObject(record.ShopPersonalCustomer)) {
                            const { first_name, last_name } =
                                record.ShopPersonalCustomer.customer_name;
                            value = `${first_name[locale.locale] ?? "-"} ${last_name[locale.locale] ?? "-"
                                }`;
                        } else if (isPlainObject(record.ShopBusinessCustomer)) {
                            const { customer_name } = record.ShopBusinessCustomer;
                            value = `${customer_name[locale.locale] ?? "-"}`;
                        }
                        return value;
                    } catch (error) {
                        return "-";
                    }
                },
            },
            {
                title: () => GetIntlMessages("เลขที่เช็ค"),
                dataIndex: 'check_no',
                key: 'check_no',
                width: 100,
                use: true,
                render: (text, record) => {
                    if (isFunction(callBack)) {
                        return (
                            <Link href="#" onClick={() => callBack(record)}>
                                {text}
                            </Link>
                        )
                    } else {
                        return (
                            <Text>{text}</Text>
                        )
                    }
                },
            },
            {
                title: () => GetIntlMessages("วันที่หน้าเช็ค"),
                dataIndex: 'check_date',
                key: 'check_date',
                width: 100,
                align: "center",
                use: true,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("จำนวนเงินหน้าเช็ค"),
                dataIndex: 'check_amount',
                key: 'check_amount',
                width: 100,
                align: "center",
                use: true,
                render: (text, record) => text ? <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div> : "-"
            },
            {
                title: () => GetIntlMessages("ธนาคาร"),
                dataIndex: 'BankNameList',
                key: 'BankNameList',
                width: 250,
                use: true,
                render: (text, record) => get(text, `bank_name.${locale.locale}`, "-"),
            },
            {
                title: () => GetIntlMessages("สถานะขึ้นเงิน"),
                dataIndex: 'check_status',
                key: 'check_status',
                width: 100,
                use: true,
                render: (text, record) => {
                    switch (text) {
                        case 0:
                            return (
                                <span style={{ color: "orange", fontSize: 16 }}>รอเครียร์เช็ค</span>
                            )
                        case 1:
                            return (
                                <span className='color-green font-16'>ขึ้นเงินสำเร็จ</span>
                            )
                        case 2:
                            return (
                                <span style={{ color: "red", fontSize: 16 }}>ขึ้นเงินไม่สำเร็จ</span>
                            )
                    }
                },
            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: 'check_no',
                key: 'check_no',
                width: 100,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record)} disabled={record?.details?.cheque_use_status === false}>เลือก</Button>
                ),
            },

        ];

        setColumns(_column.filter(x => x.use === true));
    }


    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            department_id: modelSearch.department_id
        })

        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", department_id = modelSearch.department_id ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            let url = `/shopCheckCustomer/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${department_id ? `&department_id=${department_id}` : ""}`

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

            const { data } = await API.put(`/shopCheckCustomer/put/${id}`, { status })
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

    /* get Master shopPersonalCustomers */
    const getCustomerPerson = async () => {
        const { data } = await API.get(
            `/shopPersonalCustomers/all?limit=999999&page=1&dropdown=true`
        );
        return (data.status = "success" ? data.data : []);
    };

    /* get Master shopBusinessCustomers */
    const getCustomerBusiness = async () => {
        const { data } = await API.get(
            `/shopBusinessCustomers/all?limit=999999&page=1&dropdown=true`
        );
        return (data.status = "success" ? data.data : []);
    };

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            // setMode(_mode)
            setImgEmpUrl("/assets/images/csp/no-image.png")
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/shopCheckCustomer/byid/${id}`)

                if (data.status == "success") {
                    const _model = data.data[0]
                    // console.log("aaa", _model)
                    if (_model.per_customer_id) {
                        const { data } = await getCustomerPerson();
                        const new_data = data.map((e) => {
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
                        setCustomerList(new_data);
                        _model.customer_type = "person";
                        _model.customer_id = _model.per_customer_id;
                    } else if (_model.bus_customer_id) {
                        const { data } = await getCustomerBusiness();
                        setCustomerList(data);
                        _model.customer_type = "business";
                        _model.customer_id = _model.bus_customer_id;
                    }
                    _model.bank_id = _model.bank_id ?? null
                    _model.shop_bank_id = _model.shop_bank_id ?? null
                    _model.check_amount = _model?.check_amount ?? "0.00"

                    _model.check_branch = _model.check_branch ?? null
                    _model.check_no = _model.check_no ?? null
                    _model.check_date = moment(new Date(_model.check_date), "YYYY-MM-DD") ?? null
                    _model.check_receive_date = moment(new Date(_model.check_receive_date), "YYYY-MM-DD") ?? null
                    _model.check_status = _model.check_status ?? null

                    if (_.isPlainObject(_model.details)) {
                        _model.note = _model.details["note"] ?? null
                        _model.shop_bank_name = _model.details["shop_bank_name"] ?? null
                        _model.cheque_amount_remaining = _model.details["cheque_amount_remaining"] ?? 0
                        _model.doc_no_use = _model.details["doc_no_use"] ?? []
                        _model.cheque_use_status = _model.details["cheque_use_status"] ?? []
                    }
                    _model.upload_shop_cheque_list = isPlainObject(_model.details) ? _model.details?.upload_shop_cheque_list ?? [] : []
                    _model.upload_remove_list = []

                    // const urlImg = await CheckImage({
                    //     directory: "shopCheckCustomer",
                    //     name: id,
                    //     fileDirectoryId: id,
                    // })
                    // setImgEmpUrl(urlImg)
                    form.setFieldsValue(_model)
                }

            }
            if (mode === "add") {
                if (configModal.mode === "add") {
                    const _model = {
                        check_status: 0,
                        customer_type: "business",
                        upload_shop_cheque_list: [],
                        upload_remove_list: []
                    }
                    form.setFieldsValue(_model);
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
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add' })
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log(value)

            let shopId = authUser?.UsersProfile?.shop_id
            let directory = "shopCheque"
            let upload_shop_cheque_list = []
            if (idEdit) {
                if (value.upload_shop_cheque_list) {
                    if (value?.upload_shop_cheque_list?.fileList?.length > 0) {
                        await Promise.all(value.upload_shop_cheque_list.fileList.map(async (e, index) => {
                            await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: idEdit, directory: directory, subject: "shop_cheque_picture" }).then(({ data }) => {
                                if (data.status === "success") {
                                    try {
                                        upload_shop_cheque_list.push(
                                            {
                                                uid: index,
                                                name: e.name,
                                                status: 'done',
                                                url: process.env.NEXT_PUBLIC_DIRECTORY + data.data.path,
                                                path: data.data.path
                                            }
                                        )
                                        e.url = process.env.NEXT_PUBLIC_DIRECTORY + data.data.path
                                        e.path = data.data.path
                                    } catch (error) {
                                        console.log("error: ", error)
                                    }
                                } else if (data.status === "failed") {
                                    e.path = e.url.split(process.env.NEXT_PUBLIC_DIRECTORY)[1]
                                }
                            })
                        })
                        )
                    }
                }

                if (value.upload_remove_list) {
                    if (value?.upload_remove_list?.length > 0) {
                        await Promise.all(value.upload_remove_list.map(async (e, index) => {
                            await DeleteImageCustomPathMultiple(e.path).then(({ data }) => {
                                if (data.status === "success") {
                                    try {

                                    } catch (error) {
                                        console.log("error: ", error)
                                    }
                                } else if (data.status === "failed") {
                                }
                            })
                        })
                        )
                    }
                }
            }

            const _model = {
                bank_id: value.bank_id ?? null,
                shop_bank_id: value.shop_bank_id ?? null,
                check_amount: MatchRound(+value?.check_amount) ?? "0.00",

                check_branch: value.check_branch ?? null,
                check_no: value.check_no ?? null,
                check_date: moment(value.check_date).format("YYYY-MM-DD") ?? null,
                check_receive_date: moment(value.check_receive_date).format("YYYY-MM-DD") ?? null,
                check_status: value.check_status ?? null,
                details: {
                    note: value.note ?? null,
                    shop_bank_name: value.shop_bank_name ?? null,
                    cheque_amount_remaining: configModal.mode === "add" ? value.check_amount ?? "0.00" : value.cheque_amount_remaining ?? "0.00",
                    doc_no_use: value.doc_no_use ?? [],
                    cheque_use_status: configModal.mode === "add" ? true : value.cheque_use_status ?? false,
                    upload_shop_cheque_list: await value.upload_shop_cheque_list.fileList === undefined ? await value.upload_shop_cheque_list : value.upload_shop_cheque_list.fileList,
                }
            }
            if (value.customer_type === "person") {
                _model.bus_customer_id = null
                _model.per_customer_id = value.customer_id;
            }
            else if (value.customer_type === "business") {
                _model.bus_customer_id = value.customer_id;
                _model.per_customer_id = null
            }
            // console.log("_model", _model)
            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopCheckCustomer/add`, _model)

                if (res.data.status === "success") {
                    let id = res.data.data.id
                    let details = res.data.data.details
                    console.log("id", id)
                    console.log("details", details)
                    if (value.upload_shop_cheque_list) {
                        if (value?.upload_shop_cheque_list?.fileList?.length > 0) {
                            await Promise.all(value.upload_shop_cheque_list.fileList.map(async (e, index) => {
                                await UploadImageCustomPathMultiple(e, { shopId: shopId, idEdit: id, directory: directory, subject: "shop_cheque_picture" }).then(({ data }) => {
                                    if (data.status === "success") {
                                        try {
                                            upload_shop_cheque_list.push(
                                                {
                                                    uid: index,
                                                    name: e.name,
                                                    status: 'done',
                                                    url: process.env.NEXT_PUBLIC_DIRECTORY + data.data.path,
                                                    path: data.data.path
                                                }
                                            )
                                            e.url = process.env.NEXT_PUBLIC_DIRECTORY + data.data.path
                                            e.path = data.data.path
                                        } catch (error) {
                                            console.log("error: ", error)
                                        }
                                    } else if (data.status === "failed") {
                                        e.path = e.url.split(process.env.NEXT_PUBLIC_DIRECTORY)[1]
                                    }
                                })
                            })
                            )
                        }
                    }

                    let update_model = {
                        details: {
                            ...details,
                            upload_shop_cheque_list: await value.upload_shop_cheque_list.fileList === undefined ? await value.upload_shop_cheque_list : value.upload_shop_cheque_list.fileList,
                        }
                    }
                    res = await API.put(`/shopCheckCustomer/put/${id}`, update_model)
                }


            } else if (configModal.mode === "edit") {
                res = await API.put(`/shopCheckCustomer/put/${idEdit}`, _model)
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

    const getMasterData = async () => {
        try {
            // const nameTitle = await getNameTitleListAll()
            // setRelationList(relationList)
        } catch (error) {

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

    /** กดปุ่มเครียร์ Dropdown */
    // const onClearFilterSearch = (type) => {
    //     try {
    //         const searchModel = {
    //             ...modelSearch
    //         }

    //         switch (type) {
    //             case "department_id":
    //                 searchModel[type] = null
    //                 searchModel.department_id = null
    //                 break;
    //             default:
    //                 break;
    //         }
    //         setModelSearch((previousValue) => searchModel);
    //     } catch (error) {

    //     }
    // }

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
    }

    const onChangeCustomerType = async (value) => {
        form.setFieldsValue({
            customer_id: null,
        });
        setCustomerList(() => []);
    };

    const debounceOnSearchCustomer = debounce(
        (value, type) => onChangeCustomerId(value, type),
        1000
    );

    const onChangeCustomerId = async (value, type) => {
        try {
            setLoadingGetCustomer(() => true);
            const { customer_type } = form.getFieldValue();
            let res;
            if (type === "onSearch") {
                if (!!customer_type && customer_type === "business" && !!value) {
                    res = await API.get(
                        `/shopBusinessCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active&dropdown=true`
                    );

                    if (res.data.status === "success")
                        setCustomerList(() =>
                            SortingData(res.data.data.data, `customer_name.${locale.locale}`)
                        );
                    else setCustomerList(() => []);
                } else if (!!customer_type && customer_type === "person" && !!value) {
                    res = await API.get(
                        `/shopPersonalCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active&dropdown=true`
                    );
                    if (res.data.status === "success") {
                        const new_data = res.data.data.data.map((e) => {
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
                    }
                } else {
                    setCustomerList(() => []);
                }
            }
            setLoadingGetCustomer(() => false);
        } catch (error) {

        }
    };

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    };

    const callbackModalCustomers = async (item) => {
        try {
            // getMasterData();
            const { customer_type } = form.getFieldValue();
            if (customer_type) await onChangeCustomerType(customer_type);
            form.setFieldsValue({
                customer_id: item.id,
            });
        } catch (error) { }
    };


    const handleCancelBankAccountDataModal = () => {
        try {
            setIsBankAccountDataModalVisible(false)
        } catch (error) {

        }
    }
    const callback = (data) => {
        setIsBankAccountDataModalVisible(false)
        // console.log("callback", data)
        form.setFieldsValue({
            shop_bank_id: data.id,
            shop_bank_name: data.account_name.th,
        });
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>

            <div id="page-manage">
                <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} title={title !== null ? false : true} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <Modal
                    maskClosable={false}
                    centered
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}เช็ค`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: "80vh",
                        overflowX: "auto"
                    }}
                    width={"80vw"}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item name="upload_shop_cheque_list" hidden>

                        </Form.Item>
                        <Form.Item name="upload_remove_list" hidden>

                        </Form.Item>
                        <Row style={{ paddingBottom: "0px" }}>
                            <Col xs={24} xl={12}>
                                <Fieldset legend={`รูปหน้าเช็ค`} className={"fieldset-business-customer"}>
                                    <Row justify={"center"}>
                                        <ImageMulti name="upload_shop_cheque_list" listType={`picture`} isfile isMultiple={true} value={form.getFieldValue().upload_shop_cheque_list} form={form} isShowRemoveIcon={configModal.mode !== "view"} disabled={configModal.mode === "view"} lengthUpload={1} mode={configModal.mode} />
                                    </Row>
                                </Fieldset>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Fieldset legend={`ข้อมูลเช็ค`} className={"fieldset-business-customer"}>

                                    <Form.Item
                                        name="customer_type"
                                        label={GetIntlMessages(`customer-type`)}
                                        rules={[
                                            {
                                                required: false,
                                                message: GetIntlMessages(
                                                    `fill-out-the-information-completely`
                                                ),
                                            },
                                        ]}
                                    >
                                        <Select
                                            disabled={configModal.mode == "view"}
                                            style={{ width: "100%" }}
                                            onChange={onChangeCustomerType}
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                                0
                                            }
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
                                    >
                                        <Select
                                            disabled={configModal.mode == "view"}
                                            style={{ width: "100%" }}
                                            loading={loadingGetCustomer}
                                            showSearch
                                            open={open}
                                            placeholder="เลือกประเภทลูกค้าที่ต้องการ และ พิมพ์อย่างน้อย 1 ตัวเพื่อหาชื่อลูกค้า"
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                                0
                                            }
                                            onDropdownVisibleChange={(visible) => setOpen(visible)}
                                            onChange={(value) => onChangeCustomerId(value, "onChange")}
                                            onSearch={(value) =>
                                                debounceOnSearchCustomer(value, "onSearch")
                                            }
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
                                                                        callback={callbackModalCustomers}
                                                                    />
                                                                ) : (
                                                                    <ModalPersonalCustomers
                                                                        textButton={GetIntlMessages(`เพิ่มข้อมูล`)}
                                                                        icon={<PlusOutlined />}
                                                                        callback={callbackModalCustomers}
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
                                </Fieldset>
                            </Col>
                            <Col span={24}>
                                <Row>
                                    <Col xs={24} xl={12}>
                                        <Fieldset legend={`ข้อมูลเช็ค`} className={"fieldset-business-customer"}>
                                            <Form.Item
                                                name='check_no'
                                                label={GetIntlMessages("เลขที่เช็ค")}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input placeholder="กรอกข้อมูล" maxLength={10} disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                            <Form.Item
                                                name='bank_id'
                                                label={GetIntlMessages("เช็คธนาคาร")}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Select
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                                        0
                                                    }
                                                    dropdownMatchSelectWidth={false}
                                                    placeholder="เลือกข้อมูล"
                                                    disabled={configModal.mode == "view"}>
                                                    {bankNameList.map((e, index) => (<Select.Option key={`bank-${index}-${e.id}`} value={e.id}>{e.bank_name[locale.locale]}</Select.Option>))}
                                                </Select>
                                            </Form.Item>
                                            <Form.Item
                                                name='check_branch'
                                                label={GetIntlMessages("สาขา")}
                                            >
                                                <Input placeholder="กรอกข้อมูล" disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                            <Form.Item
                                                name='check_date'
                                                label={GetIntlMessages("วันที่หน้าเช็ค")}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                            <Form.Item
                                                name='check_amount'
                                                label={GetIntlMessages("จำนวนเงินหน้าเช็ค")}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <InputNumber
                                                    disabled={configModal.mode == "view"}
                                                    stringMode min={0} precision={2} style={{ width: "100%" }} step="1"
                                                    formatter={(value) => !!value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                />
                                            </Form.Item>
                                        </Fieldset>
                                    </Col>
                                    <Col xs={24} xl={12}>
                                        <Fieldset legend={`ข้อมูลการรับเช็ค`} className={"fieldset-business-customer"}>
                                            <Form.Item
                                                name='shop_bank_id'
                                                label={GetIntlMessages("บัญชีที่รับเช็ค")}
                                                hidden
                                            >
                                                <Input hidden />
                                            </Form.Item>
                                            <Form.Item
                                                name='shop_bank_name'
                                                label={GetIntlMessages("บัญชีที่รับเช็ค")}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input disabled addonAfter={
                                                    <Button
                                                        type='text'
                                                        size='small'
                                                        style={{ border: 0 }}
                                                        onClick={() => setIsBankAccountDataModalVisible(true)}
                                                    >
                                                        เลือก
                                                    </Button>
                                                } />
                                            </Form.Item>
                                            <Form.Item
                                                name='check_receive_date'
                                                label={GetIntlMessages("วันที่รับเช็ค")}
                                                validateTrigger={['onChange', 'onBlur']}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <DatePicker format={"DD/MM/YYYY"} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                            <Form.Item
                                                name='check_status'
                                                label={GetIntlMessages("สถานะการขึ้นเงิน")}
                                            >
                                                <Select
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                                                        0
                                                    }
                                                    disabled={configModal.mode == "view"}
                                                    style={{ width: "100%" }}
                                                    options={[
                                                        { value: 0, label: 'รอเครียร์เช็ค' },
                                                        { value: 1, label: 'ขึ้นเงินสำเร็จ' },
                                                        { value: 2, label: 'ขึ้นเงินไม่สำเร็จ' },
                                                    ]}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                label={GetIntlMessages("หมายเหตุ")}
                                                name="note"
                                            >
                                                <Input.TextArea rows={4} placeholder="กรอกข้อมูล" disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                        </Fieldset>
                                    </Col>
                                    <Col xs={24} xl={24}>
                                        <Fieldset legend={`ข้อมูลการใช้งาน`} className={"fieldset-business-customer"}>
                                            <Row gutter={20}>
                                                <Col md={24} sm={24} xl={12}>
                                                    <Form.Item
                                                        name='cheque_amount_remaining'
                                                        label={GetIntlMessages("จำนวนเงินคงเหลือ")}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                    >
                                                        <InputNumber
                                                            disabled
                                                            stringMode min={0} precision={2} style={{ width: "100%" }} step="1"
                                                            formatter={(value) => !!value ? value.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                        />
                                                    </Form.Item>
                                                    <Form.Item
                                                        name='cheque_use_status'
                                                        label={
                                                            <>
                                                                {"สถานะการใช้เช็ค"}
                                                                <Tooltip
                                                                    title="จะปิดอัตโนมัติ เมื่อยอดเงินคงเหลือ เท่ากับ 0">
                                                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                                                </Tooltip>
                                                            </>
                                                        }
                                                        validateTrigger={['onChange', 'onBlur']}
                                                    >
                                                        <Switch disabled={configModal.mode == "view"} checked={checkedChequeUseStatusIsuse} onChange={(bool) => setCheckedChequeUseStatusIsuse(bool)} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />

                                                    </Form.Item>
                                                </Col>
                                                {/* <Col md={12} sm={24}>
                                                    เอกสารที่ชำระด้วยเช็คนี้
                                                    <List
                                                        itemLayout="horizontal"
                                                        dataSource={data}
                                                        renderItem={(item, index) => (
                                                            <List.Item>
                                                                <List.Item.Meta
                                                                    title={<div style={{ color: "#04afe3" }}>{item.doc_no}</div>}
                                                                    description={`ชื่อลูกค้า : ${item.customer_name} จำนวนเงิน : ${(+item.paid_amount).toLocaleString(undefined, localStringTwoDecimals)} วันที่รับชำระ : ${item.paid_date}`}
                                                                />
                                                            </List.Item>
                                                        )}
                                                    />
                                                </Col> */}
                                            </Row>
                                        </Fieldset>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Modal>
                <Modal
                    maskClosable={false}
                    open={isBankAccountDataModalVisible}
                    onCancel={handleCancelBankAccountDataModal}
                    width="90vw"
                    footer={(
                        <>
                            <Button onClick={() => handleCancelBankAccountDataModal()}>{GetIntlMessages("กลับ")}</Button>
                        </>
                    )}
                >
                    <BankAccountData title="จัดการข้อมูลบัญชีธนาคาร" callBack={callback} />
                </Modal>
            </div >
            <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
                .ant-btn-icon-only.ant-btn-sm {
                    padding: 0 !important;
                }
                // .ant-upload-list-picture-card-container{
                //     height: 300px;
                //     width: 300px;
                // }
            `}</style>
        </>
    )
}

export default ChequeData
