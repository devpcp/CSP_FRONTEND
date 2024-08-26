import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../../util/Api';
import { Modal, Input, Select, message, Checkbox, Form, Tooltip, Popconfirm, Button, Row, Col, Switch } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Cookies } from 'react-cookie';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import FormSelectLanguage from '../../components/shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../components/shares/FormLanguage/FormInputLanguage'
import { isArray } from 'lodash'
import GetIntlMessages from '../../util/GetIntlMessages';
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';

const SystemFeature = () => {
    const { locale } = useSelector(({ settings }) => settings);
    const [loading, setLoading] = useState(false)
    const isComponentMounted = useRef(true)
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [columns, setColumns] = useState([])

    const [filterAccessName, setFilterAccessName] = useState([])

    const cookies = new Cookies();

    const [applicationData, setApplicationData] = useState([]);
    const [applicationDataAll, setApplicationDataAll] = useState([]);
    const [accessList, setAccessList] = useState([]);

    const [formLocale, setFormLocale] = useState(locale.icon)
    const [imageIcon, setImageIcon] = useState([]);
    const [urlImage, setUrlImage] = useState('');

    useEffect(async () => {
        if (isComponentMounted.current) {
            (async () => {
                try {
                    await getAccessAll()
                    await getApplicationDataAll()
                    await getApplicationData({
                        page: configTable.page,
                        search: modelSearch.search,
                    });
                    console.log('urlImage', urlImage)
                } catch (error) {
                    message.error('มีบางอย่างผิดพลาด !!');
                }
            })();
        }

        return () => {
            isComponentMounted.current = false
        }
    }, []);

    const getApplicationDataAll = async () => {
        try {
            const { data } = await API.get(`/application/all?type=default&limit=100`)
            // console.log(`data.data.data`, data.data.data)

            const arr = []
            data.data.data.forEach(e => {
                if (isArray(e.children) && e.children.length > 0) {
                    arr.push(e)
                    e.children.forEach(sub => {
                        if (isArray(sub.children) && sub.children.length > 0) {
                            arr.push(sub)
                            sub.children.forEach(subChildren => {
                                arr.push(subChildren)
                            })
                        } else {
                            arr.push(sub)
                        }
                    });
                } else {
                    arr.push(e)
                }
            });
            console.log(`arr`, arr)
            setApplicationDataAll(arr);
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const getAccessAll = async () => {
        try {
            const { data } = await API.get(`/access/all?status=active`);
            const _filter = data.data.data.map(e => {
                return {
                    text: e.access_name,
                    value: e.id
                }
            })
            await setFilterAccessName(_filter)
            await setAccessList(data.data.data)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    // const getApplicationData = async ({ sort = "sort_order", order = "asc", _limit = limit, _page = 1, _search = "", _type = "active" }) => {
    const getApplicationData = async ({ sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), limit = configTable.limit, page = configTable.page, search = modelSearch.search ?? "", status = modelSearch.status }) => {
        try {
            await setLoading(true)
            await setApplicationData([])
            const { data } = await API.get(`/application/all?sort=${sort}&order=${order}&limit=${limit}&page=${page}&search=${search}&status=${status}`);
            console.log('data getApplicationData', data)
            data.data.data.forEach(element => {
                if (element.children.length < 1) {
                    delete element["children"]
                } else {
                    element.children.forEach(element => {
                        if (element.children.length < 1) {
                            delete element["children"]
                        } else {
                            element.children.forEach(element => {
                                if (element.children.length < 1) {
                                    delete element["children"]
                                } else {
                                    element.children.forEach(element => {
                                        if (element.children && element.children.length < 1) {
                                            delete element["children"]
                                        } else {
                                            if (element.children) {
                                                element.children.forEach(element => {
                                                    if (element.children.length < 1) {
                                                        delete element["children"]
                                                    } else {

                                                    }
                                                });
                                            } else {

                                            }

                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            await setApplicationData(data.data.data)
            // await setTotal(data.data.totalCount);

            await setConfigTable({ ...configTable, page: page, total: data.data.totalCount, limit: limit })
            await setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }


    /* table */
    const setColumnsTable = () => {
        const _columns = [
            {
                title: () => GetIntlMessages("order"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                render: (text, record, index) => index + 1,
            },
            {
                title: () => GetIntlMessages("application_name"),
                dataIndex: 'application_name',
                key: 'application_name',
                render: (value, record, index) => value[locale.locale],
            },
            {
                title: 'URL',
                dataIndex: 'url',
                key: 'url',
            },
            {
                title: () => GetIntlMessages("access"),
                dataIndex: 'access_name',
                key: 'access_name',
                render: (value, record, index) => record ? record.Access ? record.Access.access_name : "-" : "-",
                // render: (value, record, index) => record.Access.access_name,
                // filters: filterAccessName,
                // onFilter: (value, record) => record.access_name.indexOf(value) === 0,
            },
            {
                title: () => GetIntlMessages("use-menu"),
                dataIndex: 'use_menu',
                key: 'use_menu',
                align: "center",
                render: (item, obj, index) => (
                    <>
                        {/* {console.log('obj', obj)} */}
                        {item == false ? (

                            <Tooltip placement="bottom" title={`ไม่ใช้เป็นเมนู`}>
                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'ใช้เป็นเมนู' !?"} onConfirm={() => changeStatusUseMenu(true, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                    <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                </Popconfirm>
                            </Tooltip>

                        ) : item == true ? (

                            <Tooltip placement="bottom" title={`ใช้เป็นเมนู`}>
                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'ไม่ใช้เป็นเมนู' !?"} onConfirm={() => changeStatusUseMenu(false, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                    <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                </Popconfirm>
                            </Tooltip>

                        ) :
                            // item == 2 ? (

                            //     <Tooltip placement="bottom" title={`ถังขยะ`}>
                            //         <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                            //             <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                            //         </Popconfirm>
                            //     </Tooltip>

                            // ) : 
                            null}
                    </>
                )
            },
        ];
        setColumns(_columns)
    }

    /* เปลี่ยนสถานะ */
    const changeStatusUseMenu = async (useMenu, id) => {
        try {
            const status = useMenu == true ? "active" : useMenu == false ? "inactive" : null
            const { data } = await API.put(`/application/put/${id}`, { status })
            if (data.status == "failed") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                await getApplicationData({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status
                });
                setModelSearch({ status: modelSearch.status })
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* เปลี่ยนสถานะ Isuse */
    const changeStatusIsuse = async (isuse, id) => {
        try {
            // delete,active,block
            // console.log('isuse', isuse)
            // console.log('id', id)
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/application/put/${id}`, { isuse: status })
            // console.log('data', data)
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                getApplicationData({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status
                })
                setModelSearch({ status: modelSearch.status })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
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
    const [modelTemp, setModelTemp] = useState({});
    const [tableAccessRole, setTableAccessRole] = useState([]);

    const [form] = Form.useForm();
    const initialStateModelSave = {
        id: null,
        application_name: null,
        url: null,
        access: null,
        parent_menu: null,
        application_config: null,
    }

    const addEditViewModal = async (mode, id) => {
        try {
            // await setMode(_mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/application/byid/${id}`)

                // const _model = data.data
                const _model = data.data[data.data.length - 1]
                // console.log('data addEditViewModal', _model)
                // console.log('_model getbyid :>> ', _model.application_config);
                // _model.application_config = _model.application_config ? JSON.parse(_model.application_config) : null
                _model.application_config = _model.application_config ? JSON.stringify(_model.application_config) : null
                // console.log('_model.application_config', _model.application_config)
                form.setFieldsValue(_model)
                setModelTemp(_model)
                setIsIdEdit(_model.id)
                setCheckedUseMenu(_model.use_menu)
                setCheckedUseSystem(_model.isuse == 1 ? true : false)
                // console.log("access role", _model.Access_role)

                const arr_type = ["create", "read", "update", "delete"];
                arr_type.forEach(e => checkedValueAndIndeterminateCheckbox(e, _model.Access_role));
                setTableAccessRole(_model.Access_role)
                setImageIcon([])
                setUrlImage('')
                const urlImg = await CheckImage({
                    directory: "icons",
                    name: id,
                    fileDirectoryId: id,
                })
                console.log('urlImg', urlImg)
                if (urlImg !== "/assets/images/profiles/avatar.jpg") {
                    setImageIcon([
                        {
                            url: urlImg,
                            name: "รูปโลโก้",
                        }
                    ])

                }
                setUrlImage(urlImg)
            }
            if(mode == "add"){
                const urlImg = await CheckImage({
                    directory: "icons",
                    name: id,
                    fileDirectoryId: id,
                })
                setImageIcon([])
                setUrlImage(urlImg)
            }
            

            await setIsModalVisible(true);

        } catch (error) {
            console.log('error', error)
            message.error('มีบางอย่างผิดพลาด !!');
        }
    };


    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsIdEdit(null)
        setModelTemp({})
        setTableAccessRole([])
        setCheckedCheckbox({});
        setCheckedUseMenu(false)
        setImageIcon([])
        setUrlImage('')
        setConfigModal({ ...configModal, mode: 'add' })
        const imgIcon = document.getElementById('imgIcon')
        imgIcon.src = urlImage ?? ""
        URL.revokeObjectURL(imgIcon.src)
        form.setFieldsValue(initialStateModelSave);
    }

    const onFinish = async (value) => {
        try {
            // console.log('value =====:>> ', value, configModal.mode);
            setLoading(true)
            const { access, application_name, application_config, url, parent_menu } = value
            const _model = {
                access: access,
                application_name,
                application_config: application_config ? JSON.parse(application_config) : null,
                url,
                parent_menu: parent_menu ? parent_menu : false,
                Access_role: [],
                // group_id: [],
                // create: [],
                // read: [],
                // update: [],
                // delete: [],
            }
            tableAccessRole.forEach(e => {
                e.create = e.create ? 1 : 0
                e.read = e.read ? 1 : 0
                e.update = e.update ? 1 : 0
                e.delete = e.delete ? 1 : 0
            });
            _model.Access_role = tableAccessRole
            // tableAccessRole.forEach(e => {
            //     _model.group_id.push(e.group_id)
            //     _model.create.push(e.create ? 1 : 0)
            //     _model.read.push(e.read ? 1 : 0)
            //     _model.update.push(e.update ? 1 : 0)
            //     _model.delete.push(e.delete ? 1 : 0)
            // });
            _model.use_menu = checkedUseMenu;
            _model.isuse = checkedUseSystem == true ? "active" : "block";

            // console.log('_model ----------------------:>> ', _model);
            _model.Access_role.forEach(e => {
                if (!e.id && e.group_id) {
                    e.id = e.group_id
                }
            })


            if (configModal.mode == "edit") {
                const { data } = await API.put(`/application/put/${idEdit}`, _model)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    if (value.upload) {
                        setLoading(true)
                        await UploadImageSingle(value.upload.file, { name: idEdit, directory: "icons" })
                        setLoading(false)
                    }
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            } else if (configModal.mode == "add") {

                const { data } = await API.post(`/application/add`, _model)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    if (value.upload) {
                        setLoading(true)
                        await UploadImageSingle(value.upload.file, { name: data.data, directory: "icons" })
                        setLoading(false)
                    }
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            }
            function callback() {
                handleCancel()
                getApplicationData({ page: configTable.page, search: modelSearch.search });

            }
            setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
    }

    /* Gen สิทธิ์ Table */
    const onChangeAccess = async (id) => {
        try {
            setTableAccessRole([]);
            setCheckedCheckbox({});

            if (modelTemp.access_id != id) {
                const { data } = await API.get(`/access/byid/${id}`)
                const _data = data.data.length > 0 ? data.data[data.data.length - 1] : null
                if (!_data) throw error;

                const AccessRole = _data.Groups.map(e => {
                    return {
                        group_name: e.group_name,
                        group_id: e.id,
                        create: 0,
                        read: 0,
                        update: 0,
                        delete: 0
                    }
                });

                await setTableAccessRole(AccessRole)
            } else {
                await setTableAccessRole(modelTemp.Access_role)
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด ดึงข้อมูล Access ไม่สำเร็จ !!');
        }
    }

    /* onChangeCheckbox สิทธิ์ Table */


    const [checkedCheckbox, setCheckedCheckbox] = useState({
        create: false,
        read: false,
        update: false,
        delete: false,
    })

    const [indeterminateCheckbox, setIndeterminateCheckbox] = useState({
        create: false,
        read: false,
        update: false,
        delete: false,
    })

    const onChangeCheckbox = async (type, value, index) => {
        await setTableAccessRole([])
        const tableData = tableAccessRole;
        tableData[index][type] = value
        checkedValueAndIndeterminateCheckbox(type, tableData)
        await setTableAccessRole(tableData)
    }

    const onChangeCheckboxAll = async (type, value) => {
        await setTableAccessRole([])
        const tableData = tableAccessRole;
        tableData.forEach(e => e[type] = value);
        checkedValueAndIndeterminateCheckbox(type, tableData)
        await setTableAccessRole(tableData)
    }

    const checkedValueAndIndeterminateCheckbox = (type, arr) => {
        console.log('tyoe', type)
        const tableData = isArray(arr) ? arr : tableAccessRole;
        const _checkedCheckbox = checkedCheckbox;
        const _indeterminateCheckbox = indeterminateCheckbox;
        let Length = tableData.length, True = 0, False = 0;
        tableData.forEach(e => {
            if (e[type] == false || e[type] == 0) False++
            if (e[type] == true || e[type] == 1) True++
        });
        // console.log('Length', Length)
        // console.log('True', True)
        // console.log('False', False)
        _checkedCheckbox[type] = True == Length ? true : false;
        _indeterminateCheckbox[type] = False == Length ? false : True == Length ? false : true;
        setCheckedCheckbox(_checkedCheckbox)
        setIndeterminateCheckbox(_indeterminateCheckbox)
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
            move: true,
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: true
            },
            title: {
                use_system: "ใช้งานระบบ",
                not_use_system: "ไม่ใช้งานระบบ",
            }
        },
        configSort: {
            sort: "sort_order",
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
    }, [configTable.page, permission_obj])

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default" })
        getApplicationData({ search: value.search, status: value.status })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)

        getApplicationData({
            search: init.modelSearch.search ?? "",
            status: init.modelSearch.status,
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
                        key: GetIntlMessages("ใช้เป็นเมนู"),
                        value: "active",
                    },
                    {
                        key: GetIntlMessages("ไม่ใช้เป็นเมนู"),
                        value: "inactive",
                    },
                    // {
                    //     key: GetIntlMessages("delete-status"),
                    //     value: "delete",
                    // },
                ],
                // list: [
                //     {
                //         key: GetIntlMessages("all-status"),
                //         value: "default",
                //     },
                //     {
                //         key: GetIntlMessages("normal-status"),
                //         value: "active",
                //     },
                //     {
                //         key: GetIntlMessages("blocked-status"),
                //         value: "block",
                //     },
                //     {
                //         key: GetIntlMessages("delete-status"),
                //         value: "delete",
                //     },
                // ],
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
        setCheckedCheckbox({});
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
        // form.setFieldsValue({func_status:null})
    }


    const callbackMove = async (result) => {
        const model = result.map(({ id, sort }) => {
            return {
                id,
                sort_order: sort
            }
        })
        // console.log('model', model)
        const { data } = await API.put(`/application/sort`, model);
        if (data.status == "success") {
            onFinishSearch({})
        }
    }

    const [checkedUseMenu, setCheckedUseMenu] = useState(false)
    const [checkedUseSystem, setCheckedUseSystem] = useState(true)
    const [visiblePreviewImg, setVisiblePreviewImg] = useState(false)

    const handleChangeUseMenuAndSystem = (status, checked) => {
        console.log('checked', checked)
        try {
            if (status == "useMenu") {
                setCheckedUseMenu(checked)
            } else if (status == "useSystem") {
                setCheckedUseSystem(checked)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const checkChangePreviewImg = (value) => {
        console.log('value', value)
        if (value == undefined || value == null || value.length <= 0) {
            const imgIcon = document.getElementById('imgIcon')
            setImageIcon([])
            setUrlImage('')
            imgIcon.src = "/assets/images/profiles/avatar.jpg"
            URL.revokeObjectURL(imgIcon.src)
        }
    }

    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} />
                <TableList columns={columns} data={applicationData} loading={loading} configTable={configTable} callbackSearch={getApplicationData} addEditViewModal={addEditViewModal} callbackMove={callbackMove} changeStatus={changeStatusIsuse} />
            </>

            <Modal
                maskClosable={false}
                title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} Application`}
                visible={isModalVisible} onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ disabled: configModal.mode == "view",loading : loading }}
                width={700}
            >

                <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >

                    <FormSelectLanguage config={{
                        form,
                        field: ["application_name"]
                    }} onChange={(value) => setFormLocale(value)} />

                    <FormInputLanguage isNoStyle={true} icon={formLocale} disabled={configModal.mode == "view"} label={GetIntlMessages("application_name")} name="application_name" />

                    <Form.Item name="url" label="URL">
                        <Input disabled={configModal.mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item name="access" label={GetIntlMessages("access")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={configModal.mode == "view" ? true : false}
                            onChange={(e) => onChangeAccess(e)}
                        >
                            <Select.Option value={null}>- {GetIntlMessages("none")} -</Select.Option>
                            {accessList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.access_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="parent_menu" label={GetIntlMessages("parent-menu")}>
                        <Select
                            showSearch={true}
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={configModal.mode == "view" ? true : false}
                        >
                            <Select.Option value={null} >
                                {GetIntlMessages("none")}
                            </Select.Option>
                            {applicationDataAll.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.application_name[locale.locale]}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="application_config" label={GetIntlMessages("config")}>
                        <Input.TextArea rows={3} disabled={configModal.mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item name="func_status" label={GetIntlMessages("function-type")}>
                        <Select disabled={configModal.mode == "view" ? true : false} >
                            <Select.Option value={1}>{GetIntlMessages("function-or-app")}</Select.Option>
                            <Select.Option value={2}>{GetIntlMessages("module")}</Select.Option>
                            <Select.Option value={0}>{GetIntlMessages("none-function")}</Select.Option>
                        </Select>
                    </Form.Item>

                    <Row>
                        <Col span={3} md={{ offset: 5 }}>
                            {GetIntlMessages("สถานะ :")}
                        </Col>
                        <Col span={8}>
                            <span>ใช้เป็นเมนู : </span><Switch checked={checkedUseMenu} onClick={(e) => handleChangeUseMenuAndSystem('useMenu', e)} disabled={configModal.mode === "view"} >ใช้เป็นเมนู</Switch>
                        </Col>
                        <Col span={8}>
                            <span>ใช้งานระบบ : </span><Switch checked={checkedUseSystem} onClick={(e) => handleChangeUseMenuAndSystem('useSystem', e)} disabled={configModal.mode === "view"} >ใช้งานระบบ</Switch>
                        </Col>
                    </Row>

                    {/* {configModal.mode !== "add" ?
                        <div className='mt-4'>
                            <Form.Item
                                label={GetIntlMessages("image-logo")}
                            >
                                <div style={{ width: "150px" }}>
                                    <img
                                        src={urlImage}
                                    />
                                </div>
                            </Form.Item>
                        </div>

                        : null} */}


                    <div className='mt-4'>
                        <Form.Item
                            label={GetIntlMessages("image-logo")}
                        >
                            <div style={{ width: "150px" }}>
                                <img id="imgIcon"
                                    src={urlImage ? urlImage ?? "" : ""}
                                />
                            </div>
                        </Form.Item>
                    </div>




                    <div className='mt-3'>
                        {configModal.mode !== "view" ?
                            <ImageSingleShares name="upload" label={GetIntlMessages("upload") + " " + GetIntlMessages("image-logo")} accept={"image/*"} value={imageIcon} callback={checkChangePreviewImg} previewPicture/>
                            : null}
                    </div>

                    <h6>{GetIntlMessages("permission")} :</h6>
                    <table className="table table-bordered">
                        <thead>
                            <tr>
                                <th className="text-center" width="30%">{GetIntlMessages("system-user-gruop")}</th>
                                <th className="text-center" width="18%"><Checkbox indeterminate={indeterminateCheckbox.create} checked={checkedCheckbox.create} onChange={(e) => onChangeCheckboxAll("create", e.target.checked)} disabled={configModal.mode === "view"} /> {GetIntlMessages("add-data")}</th>
                                <th className="text-center" width="18%"><Checkbox indeterminate={indeterminateCheckbox.read} checked={checkedCheckbox.read} onChange={(e) => onChangeCheckboxAll("read", e.target.checked)} disabled={configModal.mode === "view"} /> {GetIntlMessages("view-data")}</th>
                                <th className="text-center" width="18%"><Checkbox indeterminate={indeterminateCheckbox.update} checked={checkedCheckbox.update} onChange={(e) => onChangeCheckboxAll("update", e.target.checked)} disabled={configModal.mode === "view"} />{GetIntlMessages("edit-data")}</th>
                                <th className="text-center" width="18%"><Checkbox indeterminate={indeterminateCheckbox.delete} checked={checkedCheckbox.delete} onChange={(e) => onChangeCheckboxAll("delete", e.target.checked)} disabled={configModal.mode === "view"} />{GetIntlMessages("delete-data")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableAccessRole.map((e, index) => (
                                <tr key={e.id}>
                                    <td>{e.group_name}</td>
                                    <td className="text-center"><Checkbox checked={e.create} onChange={(e) => onChangeCheckbox("create", e.target.checked, index)} disabled={configModal.mode === "view"} /></td>
                                    <td className="text-center"><Checkbox checked={e.read} onChange={(e) => onChangeCheckbox("read", e.target.checked, index)} disabled={configModal.mode === "view"} /></td>
                                    <td className="text-center"><Checkbox checked={e.update} onChange={(e) => onChangeCheckbox("update", e.target.checked, index)} disabled={configModal.mode === "view"} /></td>
                                    <td className="text-center"><Checkbox checked={e.delete} onChange={(e) => onChangeCheckbox("delete", e.target.checked, index)} disabled={configModal.mode === "view"} /></td>
                                </tr>
                            ))}

                        </tbody>
                    </table>


                </Form>
            </Modal>

            <style global>{`
               .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select-multiple .ant-select-selection-item {
                    color: rgb(39 39 39);
                }
            `}</style>

        </>
    )
}

export default SystemFeature