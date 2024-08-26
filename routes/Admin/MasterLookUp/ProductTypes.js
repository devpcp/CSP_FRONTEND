import { useEffect, useState } from 'react'
import { Button, Switch, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Divider, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import moment from 'moment';
import { sha256 } from 'js-sha256'
import randomstring from 'randomstring'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import ModalProductTypeGroup from '../../../components/Routes/MasterLookUp/Components.Modal.Product'
import GetIntlMessages from '../../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../../../components/shares/FormLanguage';
import ModalFullScreen from '../../../components/shares/ModalFullScreen';

const ProductTypes = () => {
    const [loading, setLoading] = useState(false);
    const [addEditViewModalData, setAddEditViewModalData] = useState({});


    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        getMasterData()
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
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
                title: GetIntlMessages("code"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('text', text),
                render: (text, record) => text ? text : "-",
            },
            {
                title: GetIntlMessages("product-type"),
                dataIndex: '',
                key: '',
                width: 250,
                render: (text, record) => _.get(text, `type_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
            {
                title: GetIntlMessages("product-type-group"),
                dataIndex: '',
                key: '',
                width: 250,
                render: (text, record) => _.get(text, `ProductTypeGroup.group_type_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
        ];

        setColumns(_column)
    }



    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            // const res = await API.get(`/productTypeGroup/all?search=${search}&sort=${sort}&order=${order}`)
            const res = await API.get(`/productType/all?search=${search}&sort=${sort}&order=${order}&status=${_status}`)
            if (res.data.status === "success") {
                // console.log('res', res.data.data)
                // const { currentCount, currentPage, pages, totalCount, data } = res.data;
                const { data, isuse } = res.data.data;
                // console.log(`data`, data)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, limit: limit, isuse: isuse })
                // setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, })
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

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/productType/put/${id}`, { status })
            // console.log('data', data)
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                setModelSearch(modelSearch)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status
                })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        // console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/productType/byid/${id}`)
                // const productModelTypeData = await API.get(`/productModelType/all?sort=code_id&order=asc&product_type_id=${id}`)

                if (data.status) {
                    const _model = data.data[0]
                    setAddEditViewModalData(_model)
                    // console.log('_model', _model)
                    setCheckedIsuse(_model.isuse == 1 ? true : false)
                    // setClientSecret(_model.client_secret)
                    form.setFieldsValue({
                        ..._model,
                        // model_list: productModelTypeData.data.data.map((e, index) => {
                        //     return {
                        //         code_id: e.code_id,
                        //         model_name: e.model_name
                        //     }
                        // })
                    })
                }

            }
            // setUserList(await getUserListAll(mode == "add" ? true : false))
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
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
    const [clientSecret, setClientSecret] = useState(null);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        setConfigModal({ ...configModal, modeKey })
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setClientSecret(null)
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: "add" })
    }

    // const generatedClientSecret = () => {
    //     const random = randomstring.generate({
    //         length: 256,
    //         charset: 'alphabetic'
    //     })
    //     // console.log(`random`, random)
    //     setClientSecret(sha256(random))
    // }

    const callback = () => {
        message.success('บันทึกสำเร็จ');
        setIsModalVisible(false)
        form.resetFields()
        setClientSecret(null)
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
    }
    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)
            const model = {
                code_id: value.code_id,
                type_group_id: value.type_group_id,
                type_name: value.type_name,
            }

            // const modelList = {
            //     model_list: value.model_list ? value.model_list.map((e, index) => {
            //         // console.log('e', e)
            //         return {
            //             code_id: e.code_id,
            //             model_name: e.model_name,
            //         }
            //     }) : []
            // }
            // console.log(`model`, model)
            // console.log(`modelList`, modelList)
            let res
            let resModel
            if (configModal.mode === "add") {
                res = await API.post(`/productType/add`, model)
                // if (res.data.status == "successful") {
                //     modelList.product_type_id = res.data.data.id
                //     resModel = await API.post(`/productModelType/add`, modelList)
                // }

            } else if (configModal.mode === "edit" && idEdit) {
                model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/productType/put/${idEdit}`, model)
                // resModel = await API.put(`/productModelType/putbyproducttype/${idEdit}`, modelList)
            }

            if (res.data.status == "successful") {
                callback()
            } else {
                if (configModal.mode === "edit") {
                    if (res.data.status == "successful") {
                        callback()
                    } else {
                        message.error('มีบางอย่างผิดพลาด !!');
                    }
                } else {
                    message.error('มีบางอย่างผิดพลาด !!');
                }
            }


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
                addEditViewModal("edit", res.data.data.id ? res.data.data.id : idEdit)
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    /* master */
    const [userList, setUserList] = useState([])

    // const getUserListAll = async (selectInAuth) => {
    //     const { data } = await API.get(`/user/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=${selectInAuth}`)
    //     return data.data.data
    // }

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
            sort: "code_id",
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
        console.log('value', value)
        setModelSearch(value)
        getDataSearch({ search: value.search, _status: value.status })
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
                    // {
                    //     key: GetIntlMessages("all-status"),
                    //     value: "default",
                    // },
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
    const onCreate = () => {
        setIsModalVisible(true)
    }

    const callbackIsuse = (value) => {
        setCheckedIsuse(value)
    }

    const [dataProductTypeGroupList, setDataProductTypeGroupList] = useState([])

    const getMasterData = async () => {
        const dataProductTypeGroup = await getProductTypeGroupDataListAll()
        setDataProductTypeGroupList(dataProductTypeGroup)
    }

    const getProductTypeGroupDataListAll = async () => {
        const { data } = await API.get(`/productTypeGroup?sort=code_id&order=desc&status=active`)
        // console.log('data :>> ', data);
        return data.status === "success" ? data.data ??[]: []
    }

    const [isModalVisibleModalAddProductTypeGroup, setIsModalVisibleModalAddProductTypeGroup] = useState(false);
    const [formModalAddProductTypeGroup] = Form.useForm();

    const onFinishModalAddProductTypeGroup = async (value) => {
        try {
            // console.log(`value`, value)
            const model = {
                code_id: value.code_id,
                group_type_name: value.group_type_name,
            }
            // console.log(`model`, model)

            let res
            res = await API.post(`/productTypeGroup/add`, model)

            if (res.data.status == "successful") {
                // callback()
                message.success('บันทึกสำเร็จ');
                await getMasterData()
                // form.setFieldsValue({ type_group_id: res.data.data.id })
                formModalAddProductTypeGroup.resetFields()
                setIsModalVisibleModalAddProductTypeGroup(false)
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailedModalAddProductTypeGroup = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const handleOkModalAddProductTypeGroup = () => {
        formModalAddProductTypeGroup.submit()
    }

    const handleCancelModalAddProductTypeGroup = () => {
        formModalAddProductTypeGroup.resetFields()
        setIsModalVisibleModalAddProductTypeGroup(false)
        // setConfigModal({ ...configModal, mode: "add" })
    }

    const formItemLayouts = {
        wrapperCol: {
            sm: { span: 24 },
            md: { span: 12 },
            xxl: { span: 10 }
        },
        labelCol: {
            sm: { span: 24 },
            md: { span: 5 },
            xxl: { span: 5 }
        }
    }


    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => onCreate()} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} objId="client_id" changeStatus={changeStatus} /> */}

                <ModalFullScreen
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("product-type")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    okButtonDropdown
                // className={`masterManagementModal`}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <div className='pr-5 pl-5 pt-5 detail-before-table'>

                            {/* <ModalProductTypeGroup mode={configModal.mode} checkedIsuse={checkedIsuse} callbackIsuse={callbackIsuse} form={form}/> */}
                            <FormSelectLanguage config={{
                                form,
                                field: ["type_name", "model_name"],
                                // disabled: configModal.mode == "view"
                            }} onChange={(value) => setFormLocale(value)} />

                            <Form.Item
                                {...formItemLayouts}
                                name="code_id"
                                label={GetIntlMessages("code")}
                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                            >
                                <Input disabled={configModal.mode == "view"} />
                            </Form.Item>
                            <Form.Item
                                {...formItemLayouts}
                                validateTrigger={['onChange', 'onBlur']}
                                name="type_group_id"
                                label={GetIntlMessages("product-type-group")}
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณากรอกข้อมูล",
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    placeholder="เลือกข้อมูล"
                                    disabled={configModal.mode == "view"}
                                    filterOption={(inputValue, option) =>
                                        option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                    }
                                    dropdownRender={menu =>
                                    (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            {configModal.mode !== "view" ?
                                                <Space align="center" style={{ padding: '0 8px 4px' }}>
                                                    <Button type="dashed" onClick={() => setIsModalVisibleModalAddProductTypeGroup(true)} icon={<PlusOutlined />}>เพิ่มกลุ่มสินค้า</Button>
                                                </Space>
                                                : null}
                                        </>
                                    )}
                                >
                                    {dataProductTypeGroupList.length > 0 ? dataProductTypeGroupList.map((e, index) => (
                                        <Select.Option value={e.id} key={index}>
                                            {e.group_type_name[locale.locale]}
                                        </Select.Option>
                                    )) : []}
                                </Select>
                            </Form.Item>

                            <FormInputLanguage icon={formLocale} label={GetIntlMessages("product-type-name")} disabled={configModal.mode == "view"} name="type_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} importedComponentsLayouts={formItemLayouts} />

                            {configModal.mode !== "add" ?
                                <Form.Item name="isuse" label={GetIntlMessages("status")} >
                                    <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => callbackIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                                </Form.Item> : null
                            }

                        </div>
                    </Form>
                </ModalFullScreen>
                {/* ---------------------------------------------------------------------------------------- */}
                {/* Modal Add ProductTypeGroup */}
                <Modal
                    width={600}
                    maskClosable={false}
                    title={`${GetIntlMessages("add-data")} ${GetIntlMessages("product-type-group")}`}
                    visible={isModalVisibleModalAddProductTypeGroup} onOk={handleOkModalAddProductTypeGroup} onCancel={handleCancelModalAddProductTypeGroup}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: 600,
                        overflowX: "auto"
                    }}
                >
                    <Form
                        form={formModalAddProductTypeGroup}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinishModalAddProductTypeGroup}
                        onFinishFailed={onFinishFailedModalAddProductTypeGroup}
                    >
                        <ModalProductTypeGroup mode={configModal.mode} checkedIsuse={checkedIsuse} callbackIsuse={callbackIsuse} form={formModalAddProductTypeGroup} checkPage={'ProductTypeAndModel'}/>
                    </Form>
                </Modal>
            </>

            <style global>{`
               th {
                    text-align: center !important;
                }
                td{
                    height : 20px !important;
                    : center !important;
                }

                .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }
                .dynamic-delete-button {
                    position: relative;
                    top: 4px;
                    margin: 0 8px;
                    color: #999;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                  }
                  .dynamic-delete-button:hover {
                    color: #777;
                  }
                  .dynamic-delete-button[disabled] {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }

            `}</style>
        </>
    )
}

export default ProductTypes
