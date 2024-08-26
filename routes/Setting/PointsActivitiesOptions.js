import { message, Transfer, Form, Input, Modal, Switch } from "antd"
import moment from "moment"
import { useEffect, useState } from "react"
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import API from "../../util/Api"
import ChangeStatusComponents from "../../components/shares/ChangeStatus";
import GetIntlMessages from "../../util/GetIntlMessages"
import IntlMessages from "../../util/IntlMessages"
const PointsActivitiesOptions = ({ status }) => {

    /**  กำหนดการ โหลด ข้อมูล */
    const [loading, setLoading] = useState(false);

    /** list ข้อมูลที่อยู่ ในตารางการค้นหา */
    const [listSearchDataTable, setListSearchDataTable] = useState([])

    /** column ของตารางการค้นหา */
    const [columns, setColumns] = useState([])

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
            sort: "code",
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
        getDataSearch({})
        getMasterData()
    }, [])

    useEffect(() => {
        setColumnsTable()
    }, [configTable.page, configSort.order, configSort.sort])


    /** Set ค่า Column ใน ตาราง */
    const setColumnsTable = () => {
        const _column = [
            {
                title: 'ลำดับ',
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
                title: 'Code',
                dataIndex: 'code',
                key: 'code',
                width: 150,
                align: "center",
                render: (text, record) => text ?? "-",
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "code" ? configSort.order : false,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                sort: "code",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            setConfigSort({ sort: "code", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
            },

            {
                title: 'ชื่อ',
                dataIndex: 'name',
                key: 'name',
                width: 250,
                align: "center",
                render: (text, record) => text ? text["th"] : "-",
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "name.th" ? configSort.order : false,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                sort: "name.th",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            setConfigSort({ sort: "name.th", order: configSort.order === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
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
                width: 100,
                render: (item, obj, index) => (<ChangeStatusComponents isuse={item} changeStatus={changeStatus} id={obj.id} />)
            },
        ];
        setColumns(_column)
    }

    /**
     * ค้นหาข้อมูล และใส่ข้อมูล ลง ตาราง (listSearchDataTable)
     * @param {*} param0 
     */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/activityPointOption/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${status}&search=${search}`)
            if (res.data.status === "success") {
                const { totalCount, data } = res.data.data;
                setListSearchDataTable(data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error(GetIntlMessages("wrong-contact-staff"))
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            message.error(GetIntlMessages("wrong-contact-staff"))
            if (page === 1) setLoading(false)
        }
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status })
        getDataSearch({ search: value.search, status: value.status })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)

        getDataSearch({
            search: init.modelSearch.search ?? "",
            status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /** เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/activityPointOption/put/${id}?which=${status === "management" ? "michelin data" : "my data"}`, { status })
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                console.log(`search`, search)
                getDataSearch({})
            }
        } catch (error) {
            message.error(GetIntlMessages("wrong-contact-staff"))
        }
    }

    /** แจ้ง Error ของการค้นหา */
    const onFinishError = (error) => {
        console.log(`error`, error)
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

    /* master */
    const [productModelType, setProductModelTypeList] = useState([])

    /** เรียกข้อมูล Master */
    const getMasterData = async () => {
        try {
            /* สินค้าประเภท */
            const productModelType = await getProductModelTypeListAll()
            setProductModelTypeList(productModelType.map(e => {
                return {
                    key: e.id,
                    title: e.model_name["th"],
                }
            }))
        } catch (error) {

        }
    }

    /**  เรียกข้อมูล สินค้าประเภท ทั้งหมด */
    const getProductModelTypeListAll = async () => {
        const { data } = await API.get(`/productModelType/all?limit=999999&page=1&sort=code_id&order=desc&which=michelin data`)
        return data.data
    }

    /** 
     * ฟังชั่นเลือกโหมด 
     *  - mode มี add , edit , view
     *  - id 
     */
    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/activityPointOption/byid/${id}`)
                if (data.status) {
                    const _model = data.data[0]
                    // console.log(`_model`, _model)

                    _model.name = _model.name ? _model.name["th"] : null
                    /* isuse */
                    _model.isuse = _model.isuse == 1 ? true : false

                    /* โมเดล */
                    setTargetKeys(_model.config.product_model_id ?? []);
                    setCheckedIsuse(_model.isuse)

                    formModal.setFieldsValue(_model)
                }

            } else {
                setTargetKeys([]);
            }
            setSelectedKeys([])
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }

    /** ตั้งค่า Madal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [formModal] = Form.useForm();

    const [selectedKeys, setSelectedKeys] = useState([]); //ซ้าย
    const [targetKeys, setTargetKeys] = useState([]); //ขวา

    const handleOkModal = () => {
        formModal.submit()
    }

    const handleCancelModal = () => {
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: "add" })
        formModal.resetFields()
    }

    const onFinish = async (value) => {
        try {
            const _model = {
                code: value.code,
                name: {
                    th: value.name,
                    en: null
                },
                upline_levels_add_point: 0,
                multiplier_conditions: false,
                config: {
                    product_model_id: targetKeys
                }
            }
            console.log(`configModal.mode`, configModal.mode)
            let res
            if (configModal.mode === "add") {
                res = await API.post(`/activityPointOption/add?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            } else if (configModal.mode === "edit") {
                _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/activityPointOption/put/${idEdit}?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            }
            if (res.data.status == "successful") {
                message.success('บันทึกสำเร็จ');
                handleCancelModal()
                getDataSearch({})
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            console.log(`error`, error)
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn(GetIntlMessages("fill-out-the-information-completely"));
    }

    const onChange = (nextTargetKeys, direction, moveKeys) => {
        setTargetKeys(nextTargetKeys);
    };

    const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };


    const FormModal = () => {
        return (
            <Form

                form={formModal}
                labelCol={{ span: 7 }}
                wrapperCol={{ span: 17 }}
                layout="horizontal"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >

                <Form.Item
                    name="code"
                    type="text"
                    label="Code"
                >
                    <Input disabled={configModal.mode == "view"} />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="ชื่อ"
                    rules={[{ required: true, message: <IntlMessages id={"please-fill-out"} /> },]}
                >
                    <Input disabled={configModal.mode == "view"} />
                </Form.Item>

                <div >
                    <label>โมเดล</label>
                    <Transfer
                        disabled={configModal.mode == "view"}
                        dataSource={productModelType}
                        titles={['ข้อมูล', 'เลือก']}
                        targetKeys={targetKeys}
                        selectedKeys={selectedKeys}
                        render={item => item.title}
                        onChange={onChange}
                        onSelectChange={onSelectChange}
                        pagination={{ pageSize: 10 }}
                        listStyle={{ width: "100%" }}
                    />
                </div>

                {configModal.mode !== "add" ?
                    <Form.Item name="isuse" label="สถานะ" >
                        <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                    </Form.Item> : null
                }
                <br />

            </Form>
        )
    }

    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => setIsModalVisible(true)} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} />

            <Modal
                width={650}
                maskClosable={false}
                title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}`}
                visible={isModalVisible}
                onOk={handleOkModal}
                onCancel={handleCancelModal}
                okButtonProps={{ disabled: configModal.mode == "view" }}
                bodyStyle={{
                    maxHeight: configModal.maxHeight ?? 600,
                    overflowX: configModal.overflowX ?? "auto"
                }}
            >
                <FormModal />
            </Modal>
        </>
    )
}

export default PointsActivitiesOptions
