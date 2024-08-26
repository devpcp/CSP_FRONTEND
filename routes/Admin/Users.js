import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../../util/Api';
import { Table, Row, Col, Button, Modal, Input, Select, message, Tooltip, Popconfirm, Form, TreeSelect } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import moment from "moment";
import ButtonMoreOutlined from '../../components/shares/ButtonMoreOutlined';
import TitlePage from '../../components/shares/TitlePage'
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'


const { Search } = Input;

const UserList = () => {
    
    const [loading, setLoading] = useState(false)
    const isComponentMounted = useRef(true)

    const [password, setPassword] = useState(null)
    const [c_password, setCpassword] = useState(null)


    const initialStateModelSave = {
        id: null,
        user_name: null, // add
        e_mail: null, // add
        password: null, // add
        c_password: null, // add
        group_id: null, // add
        status: 1, // add
        first_name: null, // edit
        last_name: null, // edit
        mobile_phone_no: null, // edit
        id_card_no: null, // edit
        note: null, // edit
    }

    const [userGroupData, setUserGroupData] = useState([]); // userGroup
    const [userData, setUserData] = useState([]); // ข้อมูลตาราง

    const { Option } = Select;

    useEffect(() => {
        if (isComponentMounted.current) {
            (async () => {
                try {
                    await userGroupDataList();
                    await userDataList({
                        page: configTable.page,
                        search: modelSearch.search,
                        status: modelSearch.status
                    });

                } catch (error) {
                    message.error('มีบางอย่างผิดพลาด !!');
                }
            })();
        }

        return () => {
            isComponentMounted.current = false
        }

    }, [])


    /* table */
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);

 

    const setColumnsTable = () => {
        const _column = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                render: (text, record, index) => index + 1,
            },
            {
                title: 'ชื่อเข้าใช้ระบบ',
                dataIndex: 'user_name',
                key: 'user_name',
                sorter: (a, b) => a.user_name.localeCompare(b.user_name),
            },
            {
                title: 'อีเมล',
                dataIndex: 'e_mail',
                key: 'e_mail',
                sorter: (a, b) => a.e_mail ? a.e_mail.localeCompare(b.e_mail) : "",
            },
            {
                title: 'กลุ่มผู้ใช้งาน',
                dataIndex: 'Groups',
                key: 'Groups',
                render: (item, obj, index) => (
                    <>
                        {item.map(function (data, row) {
                            return (<label key={row}>{item.length - 1 === row ? data.group_name : item.length > 1 ? data.group_name + ", " : data.group_name}</label>)
                        })}
                    </>
                )
            },
            {
                title: 'เข้าระบบล่าสุด',
                dataIndex: 'last_login',
                key: 'last_login',
                render: (a, b) => a ? `${moment(a).format("DD/MM")}/${moment(a).get("year") + 543} ${moment(a).format("HH:mm:ss")} น.` : "-",
                sorter: (a, b) => moment(a.last_login).unix() - moment(b.last_login).unix(),
            },
            {
                title: 'สถานะผู้ใช้',
                dataIndex: 'status',
                key: 'status',
                render: (item, obj, index) => (
                    <>
                        {item == 0 ? (
                            <>
                                <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                                <Tooltip placement="bottom" title={obj.login_status === 1 ? `อยู่ในระบบ` : `ไม่ได้อยู่ในระบบ`}>
                                    <Button type="link">{obj.login_status === 1 ? <LockOutlined style={{ color: 'green', fontSize: 27 }} /> : <UnlockOutlined style={{ color: 'red', fontSize: 27 }} />}</Button>
                                </Tooltip>
                            </>
                        ) : item == 1 ? (
                            <>
                                <Tooltip placement="bottom" title={`สถานะปกติ`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} onConfirm={() => changeStatus(0, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                                <Tooltip placement="bottom" title={obj.login_status === 1 ? `อยู่ในระบบ` : `ไม่ได้อยู่ในระบบ`}>
                                    <Button type="link">{obj.login_status === 1 ? <LockOutlined style={{ color: 'green', fontSize: 27 }} /> : <UnlockOutlined style={{ color: 'red', fontSize: 27 }} />}</Button>
                                </Tooltip>
                            </>
                        ) : item == 2 ? (
                            <>
                                <Tooltip placement="bottom" title={`ถังขยะ`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                                <Tooltip placement="bottom" title={obj.login_status === 1 ? `อยู่ในระบบ` : `ไม่ได้อยู่ในระบบ`}>
                                    <Button type="link">{obj.login_status === 1 ? <LockOutlined style={{ color: 'green', fontSize: 27 }} /> : <UnlockOutlined style={{ color: 'red', fontSize: 27 }} />}</Button>
                                </Tooltip>
                            </>
                        ) : null}
                    </>
                )
            },
        ];
      
        setColumns(_column)
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/user/put/${id}`, { status })
            if (data.status == "failed") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                await userDataList({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status
                });
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* เรียกข้อมูล userGroup */
    const userGroupDataList = () => {
        API.get(`/group/all?status=active`).then((data) => {
            var oldjson = JSON.stringify(data.data.data.data);
            var replaceValue = oldjson.replace(/"id"/g, '"value"');
            var replaceTitle = replaceValue.replace(/"group_name"/g, '"title"');
            var newJson = JSON.parse(replaceTitle);

            setUserGroupData(newJson);
            // console.log('data.data.data.data ------------------:>> ', data.data.data.data);
        }).catch((error) => {
            console.log('error :>> ', error);
            message.error('มีบางอย่างผิดพลาด !!');
        })
    }
   


    /* ค้นหา ผู้ใช้งานระบบ */
    // const userDataList = async ({ sort = "last_login", order = "desc", limit = 10, _page = 1, _search = "", _type = "default" }) => {
    const userDataList = async ({  search = modelSearch.search ?? "",sort = configSort.sort, order =(configSort.order === "descend" ? "desc" : "asc"), limit =  configTable.limit, page = configTable.page, status = modelSearch.status }) => {
        try {
            await setUserData([]);
            await setLoading(true)
            const { data } = await API.get(`/user/all?sort=${sort}&order=${order}&limit=${limit}&page=${page}&search=${search}&status=${status}`)
            // console.log('data :>> ', data);
            await setUserData(data.data.data);
            // await setTotal(data.data.totalCount);
            await setConfigTable({ ...configTable, page: page, total: data.data.totalCount, limit: limit })
            await setLoading(false)
        } catch (error) {
            console.log('error :>> ', error);
            message.error('มีบางอย่างผิดพลาด !!');
            setLoading(false)
        }
    }

   

    const addEditViewModal = async (mode, id) => {
        try {
            let err = false
            // await setMode(mode)
            console.log(`object`, mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/user/byid/${id}`)
                console.log("Check user data by id : " + data.data.length);
                if (data.data.length > 0) {
                    const _model = data.data[data.data.length - 1]

                    var group_id = []
                    _model.Groups.forEach(element => {
                        group_id.push(element.id)
                    });
                    _model.groups_id = group_id
                    _model.password = null
                    console.log('_model :>> ', _model);
                    form.setFieldsValue(_model)
                    setIsIdEdit(_model.id)
                } else {
                    err = true
                    message.error('ไม่พบข้อมูล !!');
                }
            }
            if (!err) await setIsModalVisible(true);
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    };


    /* Modal */

    //เพิ่มมาใหม่
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })
    //


    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsIdEdit(null)
        setPassword(null)
        setCpassword(null)
        setConfigModal({ ...configModal, mode: false })
        form.setFieldsValue(initialStateModelSave);
    };

    const onFinish = async (value) => {
        try {
            // console.log('value :>> ', value);

            if (configModal.mode == "add") {

                const modelAdd = {
                    user_name: value.user_name,
                    e_mail: value.e_mail ? value.e_mail : null,
                    password: value.password,
                    c_password: value.c_password,
                    group_id: value.groups_id,
                    status: 1
                }

                if (modelAdd.password != modelAdd.c_password) {
                    message.warning('รหัสผ่านไม่ตรงกัน !!');
                    form.setFieldsValue({ ...modelAdd, password: null, c_password: null });
                } else {
                    const { data } = await API.post(`/user/add`, modelAdd)
                    if (data.status == "failed") {
                        checkError(data, modelAdd)
                    } else {
                        message.success("บันทึกข้อมูลสำเร็จ");
                        callback()
                    }

                }
            } else if (configModal.mode == "edit") {
                let err = false

                const modelEdit = {
                    e_mail: value.e_mail ? value.e_mail : null,
                    password: value.password,
                    c_password: value.c_password,
                    group_id: value.groups_id,
                    //first_name: value.first_name, // edit
                    //last_name: value.last_name, // edit
                    // mobile_phone_no: value.mobile_phone_no, // edit
                    //id_card_no: value.id_card_no, // edit
                    note: value.note, // edit
                }

                if (value.password || value.c_password) {
                    if (value.password != value.c_password) {
                        message.warning('รหัสผ่านไม่ตรงกัน !!');
                        form.setFieldsValue({ ...modelEdit, password: null, c_password: null });
                        err = true
                    }
                }

                if (!err) {
                    const { data } = await API.put(`/user/put/${idEdit}`, modelEdit)
                    // console.log('data :>> ', data);
                    if (data.status == "failed") {
                        checkError(data, modelEdit)
                    } else {
                        message.success("บันทึกข้อมูลสำเร็จ");
                        callback()
                    }
                    callback()
                }

            }
            function callback() {
                handleCancel()
                
                userDataList({ page:  configTable.page, search: modelSearch.search, status: modelSearch.status });
            }

            function checkError(data, model) {
                let erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด"
                if (data.data == "same name") {
                    erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ ชื่อผู้ใช้ซ้ำ"
                    model.user_name = null
                } else if (data.data == "same e-mail") {
                    erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ อีเมล์ซ้ำ"
                    model.e_mail = null
                }

                message.warning(erroe_message);
                form.setFieldsValue({ ...model, password: null, c_password: null });
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
        }
    }
    const onFinishFailed = (error) => {
        message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
    }

    const onChange = value => {
        // console.log(value);
        // this.setState({ value });
    };



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
        },
        configSort: {
            sort: "last_login",
            order: "ascend",
        },
        modelSearch: {
            search: "",
            status: "default",
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
        userDataList({ search: value.search, status: value.status })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)

        userDataList({
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
                label: "ค้นหา",
                placeholder: "ค้นหา",
                list: null,
            },
            {
                index: 1,
                type: "select",
                name: "status",
                label: "เลือกสถานะ",
                placeholder: "เลือกสถานะ",
                list: [
                    {
                        key: "ค่าเริ่มต้น",
                        value: "default",
                    },
                    {
                        key: "สถานะปกติ",
                        value: "active",
                    },
                    {
                        key: "สถานะปิดกั้น",
                        value: "block",
                    },
                    {
                        key: "ถังขยะ",
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
    const onCreate =()=>{
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
    }

    return (
        <>
         
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => onCreate()} />
            <TableList columns={columns} data={userData} loading={loading} configTable={configTable} callbackSearch={userDataList}  addEditViewModal={addEditViewModal} changeStatus={changeStatus}/>


            <Modal maskClosable={false} title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ผู้ใช้งาน`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ disabled: configModal.mode == "view" }}>
                <Form

                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="user_name"
                        type="text"
                        label=" ชื่อผู้ใช้"
                        rules={[
                            {
                                required: true, message: "กรุณาใส่ชื่อผู้ใช้ของคุณ!"
                            },
                            {
                                pattern: /^[a-zA-Z0-9]|(_(?!(\.|_))|\.(?!(_|\.))[a-zA-Z0-9]){6,18}$/,
                                message: 'Please only English',
                            }
                        ]}
                    >
                        <Input disabled={configModal.mode != "add" } />
                    </Form.Item>

                    <Form.Item
                        name="e_mail"
                        label="อีเมล์"
                        rules={[{ type: "email", required: true, message: "กรุณาใส่อีเมล์ของคุณ" },
                        {
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'Please only English',
                        }]}
                    >
                        <Input disabled={configModal.mode != "add"} />
                    </Form.Item>

                    {configModal.mode != "view" ? (
                        <>
                            <Form.Item
                                name="password"
                                type="password"
                                label="รหัสผ่าน"
                                onChange={(e) => setPassword(e.target.value)}
                                rules={[
                                    {
                                        required: ((configModal.mode == "add") || (password || c_password)),
                                        message: "กรุณาใส่รหัสผ่านของคุณ"
                                        // pattern: ('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{7,}'),
                                        // message: "Please enter a password of more than 8 characters. It must contain at least 1 capital letter and letters!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="c_password"
                                type="c_password"
                                label="ยืนยันรหัสผ่าน"
                                onChange={(e) => setCpassword(e.target.value)}
                                rules={[
                                    {
                                        required: ((configModal.mode == "add") || (password || c_password)),
                                        message: "กรุณายืนยันรหัสผ่าน"
                                        // pattern: ('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{7,}'),
                                        // message: "Please enter a password of more than 8 characters. It must contain at least 1 capital letter and letters!",
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                    ) : null}

                    <Form.Item name="groups_id" label="กลุ่มผู้ใช้งาน" >
                        {/* <Select
                            mode="multiple"
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={mode == "view"}
                        >
                            {userGroupData.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.group_name}
                                </Select.Option>
                            ))}
                        </Select> */}
                        <TreeSelect
                            showSearch
                            style={{ width: '100%' }}
                            value={undefined}
                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                            placeholder="เลือกข้อมูล"
                            allowClear
                            multiple
                            treeData={userGroupData}
                            treeDefaultExpandAll
                            onChange={onChange}
                        />
                    </Form.Item>

                    {configModal.mode != "add"  ? (
                        <>
                            {/*<Form.Item name="first_name" label="ชื่อจริง">
                                <Input disabled={mode == "view"} />
                    </Form.Item>}*/}

                            {/*<Form.Item name="last_name" label="นามสกุล">
                                <Input disabled={mode == "view"} />
                    </Form.Item>*/}

                            {/* <Form.Item name="mobile_phone_no" label="เบอร์ติดต่อ">
                                <Input disabled={mode == "view"} />
                </Form.Item>*/}

                            {/*<Form.Item name="id_card_no" label="เลขบัตรประชาชน" rules={[
                                {
                                    pattern: ('[0-9]{13}'),
                                    message: "Please fill in your ID card number to complete 13 digits!",
                                },
                            ]}>
                                <Input disabled={mode == "view"} />
                            </Form.Item>*/}

                            <Form.Item name="note" label="Note" >
                                <Input.TextArea rows={5} disabled={configModal.mode == "view"} />
                            </Form.Item>
                        </>
                    ) : null}

                </Form>
            </Modal>

            <style global>{`
               .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }
            `}</style>
        </>
    )
}

export default UserList