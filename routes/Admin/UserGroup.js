import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../../util/Api';
import { Table, Button, Row, Col, Popconfirm, message, Tooltip, Input, Modal, Select, Form, TreeSelect } from 'antd';
import { Cookies } from 'react-cookie';
import Head from 'next/head';
import { CheckCircleOutlined, ReloadOutlined, CloseCircleOutlined, StopOutlined } from '@ant-design/icons';
import ButtonMoreOutlined from '../../components/shares/ButtonMoreOutlined';
import TitlePage from '../../components/shares/TitlePage'
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { isArray } from 'lodash';

const { Option } = Select;
const { Search } = Input;
const UserGroup = () => {

    const [loading, setLoading] = useState(false)
    const isComponentMounted = useRef(true)
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [columns, setColumns] = useState([])

    const cookies = new Cookies();

    const [userGroupData, setUserGroupData] = useState([])
    const [groupList, setGroupList] = useState([])

    const { TreeNode } = TreeSelect

    useEffect(() => {
        if (isComponentMounted.current) {
            (async () => {
                try {
                    await userGroupDataList({
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

    useEffect(() => {
        getMasterData()
    }, [])

    // useEffect(() => {
    //     if (permission_obj)
    //         setColumnsTable()
    // }, [configTable.page, permission_obj])

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
                title: 'ชื่อ',
                dataIndex: 'group_name',
                key: 'group_name',
                sorter: (a, b) => a.group_name.localeCompare(b.group_name),
            },
            {
                title: 'จำนวนผู้ใช้',
                dataIndex: 'Users',
                key: 'Users',
                render: (item, obj, index) => isArray(item) ? item.length : 0,
            },
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


        setColumns(_column)
    }

    // const userGroupDataList = async ({ sort = "sort_order", order = "asc", _limit = limit, _page = 1, _search = "", _type = "default" }) => {
    const userGroupDataList = async ({ sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), limit = configTable.limit, page = configTable.page, search = modelSearch.search ?? "", status = modelSearch.status }) => {
        try {
            await setLoading(true)
            await setUserGroupData([])
            const { data } = await API.get(`/group/all?sort=${sort}&order=${order}&limit=${limit}&page=${page}&search=${search}&status=${status}`);
            // console.log('data :>> ', data.data.data);

            if (data.status == "success") {
                data.data.data.forEach(element => {
                    if (element.children && isArray(element.children) && element.children.length < 1) {
                        delete element["children"]
                    } else {
                        element.children.forEach(element => {
                            if (element.children && isArray(element.children) && element.children.length < 1) {
                                delete element["children"]
                            } else {
                                element.children.forEach(element => {
                                    if (element.children && isArray(element.children) && element.children.length < 1) {
                                        delete element["children"]
                                    } else {
                                        element.children.forEach(element => {
                                            if (element.children && isArray(element.children) && element.children.length < 1) {
                                                delete element["children"]
                                            } else {
                                                element.children.forEach(element => {
                                                    if (element.children && isArray(element.children) && element.children.length < 1) {
                                                        delete element["children"]
                                                    } else {
                                                        if (element.children && isArray(element.children) && element.children.length < 1) {
                                                            element.children.forEach(element => {
                                                                if (element.children && isArray(element.children) && element.children.length < 1) {
                                                                    delete element["children"]
                                                                } else {
                                                                    element.children.forEach(element => {
                                                                        if (element.children && isArray(element.children) && element.children.length < 1) {
                                                                            delete element["children"]
                                                                        } else {

                                                                        }
                                                                    });
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
                    }
                });
            }
            await setUserGroupData(data.data.data)
            // await setTotal(data.data.totalCount);
            await setConfigTable({ ...configTable, page: page, total: data.data.totalCount, limit: limit })
            await setLoading(false)

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error', error)
        }
    }



    /* table */


    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/group/put/${id}`, { status })
            if (data.status == "failed") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                await userGroupDataList({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status
                });
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    const addEditViewModal = async (mode, id) => {
        try {
            let err = false
            const dataList = await getGroupDataListAll()

            // await setMode(mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(`/group/byid/${id}`)
                if (data.data.length > 0) {
                    const _model = data.data[data.data.length - 1]
                    // console.log('_model :>> ', _model);
                    form.setFieldsValue(_model)
                    setIsIdEdit(_model.id)


                    // console.log(`data groups`, data)
                    const oldjson = JSON.stringify(dataList);
                    const replaceValue = oldjson.replace(/"id"/g, '"value"');
                    const replaceTitle = replaceValue.replace(/"group_name"/g, '"title"');
                    const newJson = JSON.parse(replaceTitle);
                    newJson.unshift({value : "null" ,title : "- ไม่มี -"})

                    const _data = newJson.filter(e => e.id != _model.id);
                    // const _data = dataList.filter(e => e.id != _model.id);
                    setGroupList(_data)
                } else {
                    err = true
                    message.error('ไม่พบข้อมูล !!');
                }
            } else {
                setGroupList(dataList)
            }
            if (!err) await setIsModalVisible(true);
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    };

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })

    const initialStateModelSave = {
        id: null,
        parent_id: null,
        group_name: null,
    }

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsIdEdit(null)
        getMasterData()
        setConfigModal({ ...configModal, mode: "add" })
        form.setFieldsValue(initialStateModelSave);
    };

    const onFinish = async (value) => {
        try {
            // console.log('value :>> ', value, idEdit);
            const _model = {
                group_name : value.group_name,
                parent_id : value.parent_id === "null" || value.parent_id == undefined ? false : value.parent_id  ,
            }
            // console.log('_model', _model)
            if (configModal.mode == "add") {
                const { data } = await API.post(`/group/add`, _model)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            } else if (configModal.mode == "edit") {
                // value = Object.assign({}, 
                //     value, {'status': 'update'});
                const { data } = await API.put(`/group/put/${idEdit}`, _model)
                if (data.status == "failed") {
                    message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            }
            function callback() {
                handleCancel()
                userGroupDataList({ page: configTable.page, search: modelSearch.search, status: modelSearch.status });

            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
    }

    const getMasterData = async () => {

        try {
            const groupData = await getGroupDataListAll()

            // console.log(`data groups`, data)
            const oldjson = JSON.stringify(groupData);
            const replaceValue = oldjson.replace(/"id"/g, '"value"');
            const replaceTitle = replaceValue.replace(/"group_name"/g, '"title"');
            const newJson = JSON.parse(replaceTitle);

            newJson.unshift({value : "null" , title : "- ไม่มี -"})
            console.log('newJson', newJson)
            setGroupList(newJson)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }


    /* เรียกข้อมูล userGroup ทั้งหมด */
    const getGroupDataListAll = async () => {
        const { data } = await API.get(`/group/all?status=active`)
        return data.data.data
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
        userGroupDataList({ search: value.search, status: value.status })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)

        userGroupDataList({
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


    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => setIsModalVisible(true)} />
                <TableList columns={columns} data={userGroupData} loading={loading} configTable={configTable} callbackSearch={userGroupDataList} addEditViewModal={addEditViewModal} />


                <Modal maskClosable={false} title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}กลุ่มผู้ใช้งานระบบ`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ disabled: configModal.mode == "view" }}>
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 14 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="group_name"
                            type="text"
                            label="ชื่อกลุ่มผู้ใช้"
                            rules={[{
                                required: true, message: "กรุณาใส่ชื่อกลุ่มผู้ใช้!"
                            }]}
                        >
                            <Input disabled={configModal.mode == "view" ? true : false} />
                        </Form.Item>

                        <Form.Item name="parent_id" label="กลุ่มแม่" >
                            <TreeSelect
                                showSearch
                                style={{ width: '100%' }}
                                value={undefined}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                placeholder="เลือกข้อมูล"
                                allowClear
                                // multiple
                                treeData={groupList}
                                treeDefaultExpandAll
                                disabled={configModal.mode === "view"}
                            />                        
                        </Form.Item>

                    </Form>
                </Modal>

            </>

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

export default UserGroup