import { useEffect, useState } from 'react'
import { Button, Switch, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Row, Col,DatePicker,TimePicker} from 'antd';
import { CheckCircleOutlined, StopOutlined, CloseCircleOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import moment from 'moment';
import { sha256 } from 'js-sha256'
import randomstring from 'randomstring'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import GetIntlMessages from '../../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../../../components/shares/FormLanguage';
import ModalFullScreen from '../../../components/shares/ModalFullScreen';
import { get, isArray, isPlainObject } from 'lodash';
import { Decrypt } from '../../../util/SecretCode';


const ConfigThirdPartyApiConnectData = () => {
    const [loading, setLoading] = useState(false);

    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
        getMasterData()
    }, [])


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
                title: `${GetIntlMessages("shop-name")}`,
                dataIndex: 'ShopsProfiles',
                key: 'ShopsProfiles',
                width: 250,
                render: (text, record) => get(text, `shop_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
            {
                title: GetIntlMessages("api-list-name"),
                dataIndex: 'ThirdPartyApi',
                key: 'ThirdPartyApi',
                width: 150,
                align: "center",
                render: (text, record) => get(text, `third_party_api_name`, "-"),
            },
        ];

        setColumns(_column)
    }



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            // const res = await API.get(`/master/bankNameList/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}`)
            const res = await API.get(`/thirdPartyApiConnectData/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}`)
            if (res.data.status === "successful") {
                const { currentCount, currentPage, pages, totalCount, data, isuse } = res.data.data;
                setListSearchDataTable(data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, isuse: isuse })
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

    const [shopProfiles, setShopProfiles] = useState([])
    const [thirdPartyApi, setThirdPartyApi] = useState([])

    /* master */
    const getMasterData = async () => {
        try {
            const [shopProfileData, thirdPartyApiData] = await Promise.all([getShopProfile(), getThirdPartyApi()])
            if (isArray(shopProfileData)) setShopProfiles(shopProfileData);
            if (isArray(thirdPartyApiData)) setThirdPartyApi(thirdPartyApiData);
        } catch (error) {
            // console.log('error', error)
        }
    }

    const getShopProfile = async () => {
        const { data } = await API.get(`/shopsProfiles/all?limit=99999&page=1&sort=shop_name.th&order=asc&status=active`)
        return data.data.data
    }
    const getThirdPartyApi = async () => {
        const { data } = await API.get(`/thirdPartyApi?sort=sort_order&order=asc&status=active`)
        return data.data
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/thirdPartyApiConnectData/put/${id}`, { status })
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status
                })
                setModelSearch({ status: modelSearch.status })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/thirdPartyApiConnectData/byid/${id}`)
                if (data.status == "successful") {
                    const _model = data.data
                    const time_to_send_sale = isPlainObject(_model.auth_oauth) ? moment(_model.auth_oauth.time_to_send_sale,'HH:mm') ?? null : null
                    setCheckedIsuse(_model.isuse == 1 ? true : false)
                    // form.setFieldsValue(_model)
                    form.setFieldsValue({ 
                        ..._model, 
                        auth_password: null, 
                        client_id: isPlainObject(_model.auth_oauth) ? _model.auth_oauth.client_id ?? null : null, 
                        secret_key : isPlainObject(_model.auth_oauth) ? _model.auth_oauth.secret_key ?? null : null ,
                        time_to_send_sale
                    })
                }
            }
            setIsModalVisible(true)
        } catch (error) {
            // console.log(`error`, error)
        }
    }


    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        modeKey: null,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        setConfigModal({ ...configModal, modeKey })
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: "add" })
    }

    const callback = () => {
        message.success('บันทึกสำเร็จ');
        setIsModalVisible(false)
        form.resetFields()
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
    }
    const callbackDropdownSubmit = (responseId) => {
        if (configModal.modeKey == 1) {
            form.resetFields()
            setConfigModal({ ...configModal, mode: 'add', modeKey: null })
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                _status: modelSearch.status,
            })
            addEditViewModal("add")
        } else if (configModal.modeKey == 2) {
            handleCancel()
        } else if (configModal.modeKey == 0) {
            setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                _status: modelSearch.status,
            })
            addEditViewModal("edit", responseId)
        }
    }
    const onFinish = async (value) => {
        try {
            setLoading(true)
            // console.log(`value`, value)
            const model = {
                shop_id: value.shop_id ? value.shop_id ?? null : null,
                api_key: value.api_key ? value.api_key ?? null : null,
                auth_username: value.auth_username ? value.auth_username ?? null : null,
                auth_password: value.auth_password ? value.auth_password ?? null : null,
                third_party_sys_id: value.third_party_sys_id ? value.third_party_sys_id ?? null : null,
                auth_oauth: {
                    client_id: value.client_id ? value.client_id ?? null : null,
                    secret_key: value.secret_key ? value.secret_key ?? null : null,
                    time_to_send_sale : value.time_to_send_sale ? moment(value.time_to_send_sale).format('HH:mm') ?? null : null
                },
            }
            // console.log('model', model)
            let res
            if (configModal.mode === "add") {
                res = await API.post(`/thirdPartyApiConnectData/add`, model)
            } else if (configModal.mode === "edit" && idEdit) {
                model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/thirdPartyApiConnectData/put/${idEdit}`, model)
            }
            if (res.data.status == "successful") {
                callback()
                callbackDropdownSubmit(res.data.data.id)
            } else {
                if (configModal.mode === "edit") {
                    if (res.data.status == "successful") {
                        callback()
                        callbackDropdownSubmit(res.data.data.id)
                    } else {
                        message.error('มีบางอย่างผิดพลาด !!');
                    }
                } else {
                    message.error('มีบางอย่างผิดพลาด !!');
                }
            }
            setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    //เพิ่มมาใหม่
    const onFinishError = (error) => {
        console.log(`error`, error)
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
            order: "ascend",
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: true
            }
        },
        configSort: {
            sort: `shop_name.${locale.locale}`,
            order: "ascend",
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
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, permission_obj, locale])


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({
            search: value.search,
            _status: value.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
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

    const formItemLayout = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 },
            lg: { span: 4 },
            xxl: { span: 4 }
        },
        wrapperCol: {
            xs: { span: 24 },
            lg: { span: 20 },
            xxl: { span: 19 }
        }
    }

    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal('add')} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} objId="client_id" changeStatus={changeStatus} /> */}

                <ModalFullScreen
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("api-list")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    okButtonDropdown
                    className={`third-party-modal `}
                    loading={loading}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >

                        <Row>
                            <Col xs={{ span: 24 }} xxl={{ span: 24 }}>
                                <Form.Item
                                    {...formItemLayout}
                                    name="shop_id"
                                    label={GetIntlMessages("shop-name")}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <Select
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        disabled={configModal.mode == "view"}
                                    >
                                        {shopProfiles.length > 0 ?
                                            shopProfiles.map((e, index) => (
                                                <Select.Option key={`shopProfiles-${index}`} value={e.id}>{e.shop_name[locale.locale]}</Select.Option>
                                            ))
                                            : null}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="api_key"
                                    label={GetIntlMessages("Api Key")}
                                >

                                    <Input disabled={configModal.mode == "view"} />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="auth_username"
                                    label={GetIntlMessages("Auth username")}
                                >
                                    <Input disabled={configModal.mode == "view"} />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="auth_password"
                                    label={GetIntlMessages("Auth password")}
                                >
                                    <Input.Password disabled={configModal.mode == "view"} />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="client_id"
                                    label={GetIntlMessages("Cilent ID")}
                                >
                                    <Input disabled={configModal.mode == "view"} />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="secret_key"
                                    label={GetIntlMessages("Secret Key")}
                                >
                                    <Input disabled={configModal.mode == "view"} />
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="third_party_sys_id"
                                    label={GetIntlMessages("System Api name")}
                                >
                                    <Select
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        disabled={configModal.mode == "view"}
                                    >
                                        {thirdPartyApi.length > 0 ?
                                            thirdPartyApi.map((e, index) => (
                                                <Select.Option key={`thirdPartyApi-${index}`} value={e.id}>{e.third_party_api_name}</Select.Option>
                                            ))
                                            : null}

                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="time_to_send_sale"
                                    label={GetIntlMessages("เวลาของการส่งยอดขาย")}
                                >
                                    <TimePicker format={'HH:mm'} style={{width : "100%"}} disabled={configModal.mode == "view"}/>
                                </Form.Item>

                                {/* <FormInputLanguage icon={formLocale} label={GetIntlMessages("bank")} disabled={configModal.mode == "view"} name="third_party_api_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} /> */}

                                {configModal.mode !== "add" ?
                                    <Form.Item name="isuse" label={GetIntlMessages("status")} >
                                        <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                                    </Form.Item> : null
                                }
                            </Col>
                        </Row>



                    </Form>
                </ModalFullScreen>

            </>
        </>
    )
}

export default ConfigThirdPartyApiConnectData
