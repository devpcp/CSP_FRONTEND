import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import API from '../../util/Api';
import { Table, Row, Col, Button, Modal, Input, Select, message, Tooltip, Popconfirm, Form, Switch } from 'antd';
import { Cookies } from 'react-cookie';
import { ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, MinusCircleOutlined, PlusOutlined, CheckCircleOutlined, StopOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from "moment";
import TitlePage from '../../components/shares/TitlePage'

const { Search } = Input;

const DealersRoutes = () => {

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [search, setSearch] = useState("")
    const [type, setType] = useState("default")
    const [mode, setMode] = useState("add") // add = เพิ่ม edit = แก้ไข view = ดูข้อมูล
    const isComponentMounted = useRef(true)
    const [columns, setColumns] = useState([])

    const [BusinessTypeList, setBusinessTypeList] = useState([])
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);

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

    const cookies = new Cookies();
    const { Option } = Select;
    const { userAuth } = useSelector(({ auth }) => auth);
    const oID = cookies.get('userAuth');

    useEffect(() => {
        if (isComponentMounted.current) {
            (async () => {
                try {
                    await userGroupDataList();
                    await userDataList({
                        _page: page,
                        _search: search,
                        _type: type
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
        if (permission_obj)
            setColumnsTable()
    }, [page, permission_obj])

    const setColumnsTable = () => {
        /* table */
        const _column = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 150,
                render: (text, record, index) => index + 1,
            },
            {
                title: 'รหัส AD',
                dataIndex: 'master_dealer_code_id',
                key: 'master_dealer_code_id',
                width: 150,
            },
            {
                title: 'รหัสทะเบียนภาษี',
                dataIndex: 'dealer_code_id',
                key: 'dealer_code_id',
                width: 150,
            },
            {
                title: 'ประเภทธุรกิจ',
                dataIndex: '',
                key: '',
                width: 150,
                render: (item, obj, index) => (
                    <>
                        {obj.BusinessType.business_type_name.th}
                    </>
                )
            },
            {
                title: 'ชื่อร้าน',
                dataIndex: 'dealer_name.th',
                key: 'dealer_name.th',
                width: 150,
                render: (item, obj, index) => (
                    <>
                        {obj.dealer_name.th}
                    </>
                )
            },
            {
                title: 'ที่อยู่ติดต่อ',
                dataIndex: 'address',
                key: 'address',
                width: 150,
            },
            {
                title: 'เบอร์ติดต่อ',
                dataIndex: 'tel_no',
                key: 'tel_no',
                width: 150,
                render: (item, obj, index) => (
                    <>
                        {item != null ?
                            Object.keys(item).map(function (keyName, keyIndex) {
                                return <label>{Object.keys(item).length - 1 === keyIndex ? item[keyName] : Object.keys(item).length > 1 ? item[keyName] + ", " : item[keyName]}</label>
                            })
                            : ""
                        }
                    </>
                )
            },
            {
                title: 'E-mail',
                dataIndex: 'e_mail',
                key: 'e_mail',
                width: 150,
                sorter: (a, b) => a.e_mail.localeCompare(b.e_mail),
            },
            {
                title: 'ผู้สร้างข้อมูล',
                dataIndex: 'created_by',
                key: 'created_by',
                width: 200,
            },
            {
                title: 'วันที่สร้าง',
                dataIndex: 'created_date',
                key: 'created_date',
                width: 150,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },
            {
                title: 'ผู้ปรับปรุงข้อมูล',
                dataIndex: 'updated_by',
                key: 'updated_by',
                width: 150,
                render: (text, record) => text ? text : "-",
            },
            {
                title: 'วันที่ปรับปรุง',
                dataIndex: 'updated_date',
                key: 'updated_date',
                width: 150,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },
            {
                title: 'สถานะ',
                dataIndex: 'isuse',
                key: 'isuse',
                width: 150,
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

        if (permission_obj.read || permission_obj.update || permission_obj.delete) {
            _column.push(
                {
                    title: 'จัดการ',
                    dataIndex: 'count_user',
                    key: 'count_user',
                    fixed: 'right',
                    width: 200,
                    render: (item, obj, index) => (
                        <>
                            {permission_obj.read ? <Button type="link" onClick={() => addEditViewModal("view", obj.id)}><EyeOutlined style={{ fontSize: 23, color: 'gray' }} /></Button> : ""}
                            {obj.status != 2 ?
                                <>
                                    {permission_obj.update ? <Button type="link" onClick={() => addEditViewModal("edit", obj.id)}><EditOutlined style={{ fontSize: 23, color: 'blue' }} /></Button> : null}
                                    {((permission_obj.delete)) ?
                                        <Popconfirm Popconfirm placement="top" title={"ยืนยันการลบข้อมูล !?"} onConfirm={() => changeStatus(2, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                            <Button type="link"><DeleteOutlined style={{ fontSize: 23, color: 'red' }} /></Button>
                                        </Popconfirm> : null}
                                </> : null
                            }
                        </>
                    )
                }
            )
        }


        setColumns(_column)
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/dealers/put/${id}`, { status })
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                await userDataList({
                    _page: page,
                    _search: search,
                    _type: type
                });
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* เรียกข้อมูล userGroup */
    const userGroupDataList = () => {
        API.get(`/group/all?status=active`, {
            headers: {
                'Authorization': `Bearer ${oID.token}`
            },
        }).then((data) => {
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


    /* ค้นหา ดีลเลอร์ระบบ */
    const userDataList = async ({ sort = "dealer_name.th", order = "desc", limit = 10, _page = 1, _search = "", _type = "default" }) => {
        try {
            await setUserData([]);
            await setLoading(true)
            const { data } = await API.get(`/dealers/all?sort=${sort}&order=${order}&limit=${limit}&page=${_page}&search=${_search}&status=${_type}`, {
                headers: { 'Authorization': `Bearer ${oID.token}` },
            })
            // console.log('data :>> ', data.data.data);
            await setUserData(data.data.data);
            await setTotal(data.data.totalCount);
            await setLoading(false)
        } catch (error) {
            console.log('error :>> ', error);
            message.error('มีบางอย่างผิดพลาด !!');
            setLoading(false)
        }
    }

    /* ค่าเริ่มต้น */
    const reset = async () => {
        const _page = 1, _search = "", _type = "default"
        setPage(_page)
        setSearch(_search)
        setType(_type)
        await userDataList({ _page, _search, _type })
    }
    /* master */
    const [userList, setUserList] = useState([])
    const addEditViewModal = async (_mode, id) => {
        try {
            let err = false
            await setMode(_mode)
            const provinceDataList = await getProvinceDataListAll()
            const BusinessTypeDataList = await getBusinessTypeDataListAll()
            const userListData = await getUserListAll()  /* master */

            if (id) {
                const { data } = await API.get(`/dealers/byid/${id}`)
                console.log("Check dealers data by id : " + data.data.length);
                if (data.data.length > 0) {
                    const _model = data.data[data.data.length - 1]

                    console.log(`_model`, _model)
                    _model.tel_no = _model.tel_no ?? {}
                    _model.mobile_no = _model.mobile_no ?? {}
                    _model.dealer_name = _model.dealer_name ? _model.dealer_name.th : null
                    _model.address = _model.address ? _model.address.th : null
                    if (_model.sync_api_config != null) {
                        _model.sync_api_config_rd_reg_no = _model.sync_api_config.rd_reg_no
                        _model.sync_api_config_rd_code = _model.sync_api_config.rd_code
                        _model.sync_api_config_username = _model.sync_api_config.username
                        _model.sync_api_config_password = _model.sync_api_config.password
                    }
                    setCheckedIsuse(_model.isuse ? true : false)
                    // console.log('_model :>> ', _model);

                    if (_model.tel_no) {
                        _model.tel_no = Object.entries(_model.tel_no).map((e) => ({ tel_no: e[1] }));
                        // await setTelNo([..._model.tel_no])
                    }
                    //จัด object mobile_no ใหม่
                    if (_model.mobile_no) {
                        _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({ mobile_no: e[1] }));
                        // await setMobileNo([..._model.mobile_no])
                    }

                    if (_model.province_id != null) {
                        const DistrictDataList = await getDistrictDataListAll(_model.province_id)
                        setDistrictList(DistrictDataList)
                    }
                    if (_model.district_id != null) {
                        const SubDistrictDataList = await getSubDistrictDataListAll(_model.district_id)
                        setSubdistrictList(SubDistrictDataList)
                    }


                    form.setFieldsValue(_model)
                    setIsIdEdit(_model.id)
                    // setProvinceList(provinceDataList)
                    setBusinessTypeList(BusinessTypeDataList)
                    setUserList(userListData)


                } else {
                    err = true
                    message.error('ไม่พบข้อมูล !!');
                }
            }

            setProvinceList(provinceDataList)
            if (!err) await setIsModalVisible(true);
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    };

    /* Modal */
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(true)
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsIdEdit(null)
        setCheckedIsuse(true)
        form.resetFields()
    };

    const onFinish = async (value) => {
        try {
            const model = {
                master_dealer_code_id: value.master_dealer_code_id,
                dealer_code_id: value.dealer_code_id,
                bus_type_id: value.bus_type_id,
                dealer_name: {
                    th: value.dealer_name,
                    en: null
                },
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                address: {
                    th: value.address,
                    en: null
                },
                subdistrict_id: value.subdistrict_id,
                district_id: value.district_id,
                province_id: value.province_id,
                sync_api_config: {
                    rd_reg_no: value.sync_api_config_rd_reg_no,
                    rd_code: value.sync_api_config_rd_code,
                    username: value.sync_api_config_username,
                    password: value.sync_api_config_password,
                },
                user_id: value.user_id
            }

            if (Array.isArray(value.tel_no)) {
                value.tel_no.forEach((element, index) => {
                    const num = index + 1
                    model.tel_no[`tel_no_${num}`] = element.tel_no
                });
            }

            if (Array.isArray(value.mobile_no)) {
                value.mobile_no.forEach((element, index) => {
                    const num = index + 1
                    model.mobile_no[`mobile_no_${num}`] = element.mobile_no
                });
            }

            console.log(`model`, model)

            if (mode == "add") {
                const { data } = await API.post(`/user/add`, model)
                if (data.status == "failed") {
                    checkError(data, model)
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            } else if (mode == "edit") {
                const { data } = await API.put(`/dealers/put/${idEdit}`, model)
                // console.log('data :>> ', data);
                if (data.status == "failed") {
                    checkError(data, model)
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    callback()
                }
            }

            function callback() {
                handleCancel()
                userDataList({ _page: page, _search: search, _type: type });
            }

            function checkError(data, _model) {
                let erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด"
                if (data.data == "same name") {
                    erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ ชื่อผู้ใช้ซ้ำ"
                    _model.user_name = null
                } else if (data.data == "same e-mail") {
                    erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ อีเมล์ซ้ำ"
                    _model.e_mail = null
                }

                message.warning(erroe_message);
                form.setFieldsValue({ ..._model, password: null, c_password: null });
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
        }
    }
    const onFinishFailed = (error) => {
        message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
    }

    const handleProvinceChange = async (value) => {
        const DistrictDataList = await getDistrictDataListAll(value)
        setDistrictList(DistrictDataList)
        form.setFieldsValue({ district_id: null });
        form.setFieldsValue({ subdistrict_id: null });
    };
    const handleDistrictChange = async (value) => {
        const SubDistrictDataList = await getSubDistrictDataListAll(value)
        setSubdistrictList(SubDistrictDataList)
        form.setFieldsValue({ subdistrict_id: null });

    };
    const handleSubdistrictChange = value => {
        // console.log(value);
    };

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล Province ทั้งหมด */
    const getProvinceDataListAll = async () => {
        const { data } = await API.get(`/master/province?sort=prov_name_th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล District ทั้งหมด */
    const getDistrictDataListAll = async (province_id) => {
        const { data } = await API.get(`/master/district?sort=name_th&order=asc&province_id=${province_id}`)
        return data.data
    }

    /* เรียกข้อมูล SubDistrict ทั้งหมด */
    const getSubDistrictDataListAll = async (district_id) => {
        const { data } = await API.get(`/master/subDistrict?sort=name_th&order=asc&district_id=${district_id}`)
        return data.data
    }

    /* เรียก User */
    const getUserListAll = async () => {
        const { data } = await API.get(`/user/all?limit=999999&page=1&sort=user_name&order=desc&status=active`)
        return data.data.data
    }

    return (
        <>

            <Row>
                <Col span={24} style={{ display: 'inline', padding: 10 }}>
                    <Row>
                        <Col span={14} style={{ padding: 5 }} >
                            <h1 style={{ fontSize: 27 }}><TitlePage /></h1>
                        </Col>
                        <Col span={5} style={{ padding: 5 }}>
                            <Search placeholder="ค้นหา"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onSearch={async (e) => {
                                    await userDataList({
                                        _page: page,
                                        _search: e,
                                        _type: type
                                    });
                                }}
                                style={{ width: "100%" }}
                                loading={loading}
                                disabled={loading}
                            />
                        </Col>
                        <Col span={3} style={{ padding: 5 }}>
                            <Select
                                value={type}
                                style={{ width: "100%" }}
                                placeholder="ตัวเลือกสถานะ"
                                disabled={loading}
                                onChange={async (e) => {
                                    setType(e)
                                    await userDataList({
                                        _page: page,
                                        _search: search,
                                        _type: e
                                    });
                                }}
                            >
                                <Option value="default">ค่าเริ่มต้น</Option>
                                <Option value="active">สถานะปกติ</Option>
                                <Option value="block">สถานะปิดกั้น</Option>
                                <Option value="delete">ถังขยะ</Option>
                            </Select>
                        </Col>
                        <Col span={2} style={{ padding: 5, textAlign: "center" }}>
                            {(permission_obj && permission_obj.create) ? <Button type="default" onClick={() => addEditViewModal("add", null)} >เพิ่ม</Button> : ""}{" "}
                            <Tooltip placement="bottom" title={`ค่าเริ่มต้น`}>
                                <Button type="default" onClick={reset}>
                                    <ReloadOutlined />
                                </Button>
                            </Tooltip>

                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row>
                <Col span={24}>
                    <Table dataSource={userData} columns={columns} rowKey={(row) => row.id} loading={loading} scroll={{ x: "100%", y: "100%" }} pagination={{
                        current: page,
                        total,
                        pageSize: 10,
                        showTotal: (total, range) => `ข้อมูล ${range[0]} - ${range[1]} ทั้งหมด ${total} รายการ`,
                        onChange: async (e) => {
                            setPage(e)
                            await userDataList({
                                _page: e,
                                _search: search,
                                _type: type
                            });
                        }
                    }} />
                </Col>
            </Row>


            <Modal maskClosable={false} title={`${mode == "view" ? "ดูข้อมูล" : mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ผู้ใช้งาน`} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ disabled: mode == "view" }}>
                <Form
                    autoComplete="off"
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="master_dealer_code_id"
                        type="text"
                        label="รหัส AD"
                        rules={[
                            {
                                required: true, message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="dealer_code_id"
                        label="รหัสทะเบียนภาษี"
                        rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="user_id"
                        label="User"
                        rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                    >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            disabled={mode == "view" ? true : false}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {userList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.user_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="bus_type_id" label="ประเภทธุรกิจ" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            disabled={mode == "view" ? true : false}
                        >
                            <Select.Option value={null}>- ไม่มี -</Select.Option>
                            {BusinessTypeList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.business_type_name.th}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dealer_name"
                        label="ชื่อร้าน"
                        rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        label="เบอร์โทรศัพท์พื้นฐาน"
                        name="tel_no"
                    >
                        <Form.List name="tel_no">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "tel_no"]}
                                                fieldKey={[field.fieldKey, "tel_no"]}
                                                // rules={[
                                                //     {
                                                //         required: true,
                                                //         whitespace: true,
                                                //         message: "กรุณากรอกเบอร์โทรศัพท์พื้นฐาน",
                                                //     },
                                                // ]}
                                                noStyle
                                            >
                                                <Input placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" disabled={mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                            </Form.Item>
                                            {fields.length > 1 && mode != "view" ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        {mode != "view" ?
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                เบอร์โทรศัพท์พื้นฐาน
                                            </Button> : null
                                        }

                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        label="เบอร์โทรศัพท์มือถือ"
                        name="mobile_no"
                    >
                        <Form.List name="mobile_no" >
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "mobile_no"]}
                                                fieldKey={[field.fieldKey, "mobile_no"]}
                                                // rules={[
                                                //     {
                                                //         required: true,
                                                //         whitespace: true,
                                                //         message: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
                                                //     },
                                                // ]}
                                                noStyle
                                            >
                                                <Input placeholder="กรอกเบอร์โทรศัพท์มือถือ" disabled={mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                            </Form.Item>
                                            {fields.length > 1 && mode != "view" ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        {mode != "view" ?
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                เบอร์โทรศัพท์มือถือ
                                            </Button> : null
                                        }
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>


                    <Form.Item
                        name="e_mail"
                        label="E-mail"
                        rules={[{
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'กรอกอีเมลให้ถูกต้อง',
                        }]}
                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="ที่อยู่"
                    >
                        <Input.TextArea disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item name="province_id" label="จังหวัด" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            disabled={mode == "view" ? true : false}
                            onChange={handleProvinceChange}
                        >
                            {provinceList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.prov_name_th}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="district_id" label="เขต/อำเภอ" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            disabled={mode == "view" ? true : false}
                            onChange={handleDistrictChange}
                        >
                            {districtList != null ? districtList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.name_th}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item name="subdistrict_id" label="แขวง/ตำบล" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            disabled={mode == "view" ? true : false}
                            onChange={handleSubdistrictChange}
                        >
                            {subdistrictList != null ? subdistrictList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.name_th}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item name="isuse" label="สถานะ" >
                        <Switch disabled={mode == "view" ? true : false} checked={checkedIsuse} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_rd_reg_no"
                        label="rd_reg_no"
                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_rd_code"
                        label="rd_code"

                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_username"
                        label="username"

                    >
                        <Input disabled={mode == "view" ? true : false} />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_password"
                        label="password"

                    >
                        <Input disabled={mode == "view" ? true : false} />
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

export default DealersRoutes