import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../../util/Api';
import { Table, Row, Col, Button, Modal, Input, Select, message, Tooltip, Popconfirm, Form, TreeSelect } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import ButtonMoreOutlined from '../../components/shares/ButtonMoreOutlined';
import TitlePage from '../../components/shares/TitlePage';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'

const { Search } = Input;
const { Option } = Select;

const PermissionList = () => {

    const [loading, setLoading] = useState(false)
   
    const isComponentMounted = useRef(true)
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [columns, setColumns] = useState([])


    const [userGroupData, setUserGroupData] = useState([]); // userGroup
    const [permissionData, setPermissionData] = useState([]);
    const [getModelData, setModelData] = useState({});


    const initialStateModelSave = {
        id: null,
        access_name: null,
        rules: [],
    }


    useEffect(async () => {
        if (isComponentMounted.current) {
            (async () => {
                try {
                    await userGroupDataList();
                    await getPermissionData({
                        page: configTable.page,
                        search: modelSearch.search ,
                        status: modelSearch.status,
                    });
                } catch (error) {
                    message.error('มีบางอย่างผิดพลาด !!');
                }
            })();
        }

        return () => {
            isComponentMounted.current = false
        }
    }, []);

    /* เรียกข้อมูล userGroup */
    const userGroupDataList = async () => {
        try {
            const { data } = await API.get(`/group/all?status=active`)
            console.log(`data groups`, data)
            var oldjson = JSON.stringify(data.data.data);
            var replaceValue = oldjson.replace(/"id"/g, '"value"');
            var replaceTitle = replaceValue.replace(/"group_name"/g, '"title"');
            var newJson = JSON.parse(replaceTitle);

            setUserGroupData(newJson);
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

 

    /* ค้นหาข้อมูล */
    // const getPermissionData = async ({ sort = "sort_order", order = "asc", _limit = limit, _page = 1, _search = "", _type = "default" }) => {
    const getPermissionData = async ({ sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), limit = configTable.limit, page = configTable.page, search = modelSearch.search ?? "",  status = modelSearch.status }) => {
        try {
            await setLoading(true)
            await setPermissionData([])
            const { data } = await API.get(`/access/all?sort=${sort}&order=${order}&limit=${limit}&page=${page}&search=${search}&status=${status}`);
            // data.data.data.forEach(e => {
            //     const arr = [];
            //     e.group.forEach(x => arr.push(x.group_name));
            //     e.group_name = arr.length > 0 ? arr.toString() : "-";
            // });
            await setPermissionData(data.data.data)
            // await setTotal(data.data.totalCount);
            await setConfigTable({ ...configTable, page: page, total: data.data.totalCount, limit: limit })
            await setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }


    /* table */

    // useEffect(() => {                   => ย้ายไป บรรทัดที่ 344         
    //         setColumnsTable()     
    // }, [configTable.page, permission_obj])

    
    const setColumnsTable = () => {
        const _columns = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                render: (item, obj, index) => index + 1,
            },
            {
                title: 'ชื่อ',
                dataIndex: 'access_name',
                key: 'access_name',
                // sorter: (a, b) => a.access_name.localeCompare(b.access_name),
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
                // render: (a, b) => `${a ?? "-"}`,
                //sorter: (a, b) => a.user_name.localeCompare(b.group_name),
            },
            // {
            //     title: 'กลุ่มผู้ใช้งาน',
            //     dataIndex: 'group_name',
            //     key: 'group_name',
            // },
            {
                title: 'สถานะ',
                dataIndex: 'isuse',
                key: 'isuse',
                render: (item, obj, index) => (
                    <>
                        {item == 0 ? (

                            <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                    <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                </Popconfirm>
                            </Tooltip>

                        ) : item == 1 ? (

                            <Tooltip placement="bottom" title={`สถานะปกติ`}>
                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} onConfirm={() => changeStatus(0, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                    <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                </Popconfirm>
                            </Tooltip>

                        ) : item == 2 ? (

                            <Tooltip placement="bottom" title={`ถังขยะ`}>
                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                    <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                </Popconfirm>
                            </Tooltip>

                        ) : null}
                    </>
                )
            },
      
        ];
     
        setColumns(_columns)
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/access/put/${id}`, { status })
            if (data.status == "failed") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                await getPermissionData({
                    page: configTable.page,
                        search: modelSearch.search ,
                        status: modelSearch.status,
                });
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
    const [form] = Form.useForm();

    const addEditViewModal = async (mode, id) => {
        console.log(`id`, id)
        try {
            let err = false
            // await setMode(_mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/access/byid/${id}`)
                if (data.data.length > 0) {
                    const _model = data.data[data.data.length - 1]
                    // console.log('_model :>> ', _model);
                    setModelData(_model)
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

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsIdEdit(null)
        form.setFieldsValue(initialStateModelSave);
    };

    const onFinish = async (value) => {
        try {
            // console.log('value =====:>> ', value, mode);

            const { access_name, rules } = value

            if (configModal.mode == "add") {
                const _modelAdd = { access_name, group_id: rules }
                const { data } = await API.post(`/access/add`, _modelAdd)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            } else if (configModal.mode == "edit") {
                const _modelEdit = { access_name, group_id: rules }
                
                // const _modelEdit = { access_name, group_id: rules }
                // console.log(getModelData)
                // const newModel = Object.assign(_modelEdit, {"access_name": access_name})
                const { data } = await API.put(`/access/put/${idEdit}`, _modelEdit)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            }
            function callback() {
                handleCancel()
                getPermissionData({ page: configTable.page, search: modelSearch.search, status: modelSearch.status });
                
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
            sort: "sort_order",
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
        getPermissionData({ search: value.search, status: value.status })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)

        getPermissionData({
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
            <>
               
                
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => onCreate()} />
            <TableList columns={columns} data={permissionData} loading={loading} configTable={configTable} callbackSearch={getPermissionData}  addEditViewModal={addEditViewModal} />

            </>

            <Modal
                maskClosable={false}
                title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ระดับการเข้าถึงระบบ`}
                visible={isModalVisible} onOk={handleOk}
                onCancel={handleCancel}
                okButtonProps={{ disabled: configModal.mode == "view" }}
            >

                <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="access_name"
                        type="text"
                        label="ชื่อ"
                        rules={[{
                            required: true, message: "กรุณาใส่ชื่อระดับการเข้าถึงระบบ!"
                        }]}
                    >
                        <Input disabled={configModal.mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item name="rules" label="กลุ่มผู้ใช้งาน" rules={[{
                        required: true, message: "กรุณาเลือกข้อมูล!"
                    }]}>

                        {/* <Select
                            mode="multiple"
                            placeholder="เลือกข้อมูล"
                            disabled={mode == "view" ? true : false}
                        >

                            {userGroupData.map((e, index) => (
                                <Option key={index} value={e.id}>
                                    {e.group_name}
                                </Option>
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

export default PermissionList