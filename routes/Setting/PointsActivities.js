import { message, DatePicker, Form, Input, Modal, Switch, Select } from "antd"
import moment from "moment"
import { useEffect, useState } from "react"
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'

import API from "../../util/Api"
import ChangeStatusComponents from "../../components/shares/ChangeStatus";

const { RangePicker } = DatePicker;
const { Option } = Select;

const PointsActivitiesOptions = ({ status }) => {
    const [loading, setLoading] = useState(false);


    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])

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
            search: null,
            status: "default",
        }
    }

    const [configTable, setConfigTable] = useState(init.configTable)

    const [configSort, setConfigSort] = useState(init.configSort)

    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    useEffect(() => {
        getDataSearch({})
        getMasterData()
    }, [])

    useEffect(() => {
        setColumnsTable()
    }, [configTable.page, configSort.order, configSort.sort])


    /* configSearch */
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
                            setConfigSort({ sort: "code", order: configSort.order === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }

            },
            {
                title: 'ชื่อกิจกรรม',
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
                title: 'คะแนน',
                dataIndex: 'point',
                key: 'point',
                width: 150,
                align: "center",
                render: (text, record) => text ? text.toLocaleString() : "-",
            },

            {
                title: 'วันที่เริ่ม',
                dataIndex: 'start_activity_date',
                key: 'start_activity_date',
                width: 150,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },

            {
                title: 'วันที่สิ่นสุด',
                dataIndex: 'end_activity_date',
                key: 'end_activity_date',
                width: 150,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: 'โมเดล',
                dataIndex: 'ActivityPointsOptions',
                key: 'ActivityPointsOptions',
                width: 150,
                align: "center",
                render: (text, record) => text ? text.length > 0 ? text[0].name["th"] : "-" : "-",
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

    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/activityPoint/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${status}&search=${search}`)
            if (res.data.status === "success") {
                const { totalCount, data } = res.data.data;
                setListSearchDataTable(data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
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

    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search })
        getDataSearch({ search: value.search })
    }

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

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/activityPoint/put/${id}?which=${status === "management" ? "michelin data" : "my data"}`, { status })
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                console.log(`search`, search)
                getDataSearch({})
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }


    const configSearch = {
        search: [
            {
                index: 1,
                type: "input",
                name: "search",
                label: "ค้นหา",
                placeholder: "ค้นหา",
                list: null
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
    const [pointOptionList, setPointOptionList] = useState([])

    const getMasterData = async () => {
        try {
            setPointOptionList(await getPointOptionListAll())
        } catch (error) {

        }
    }

    /* เรียกข้อมูล สินค้าประเภท ทั้งหมด */
    const getPointOptionListAll = async () => {
        const { data } = await API.get(`/activityPointOption/all?limit=999999&page=1&sort=code&order=asc`)
        return data.data.data
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/activityPoint/byid/${id}`)
                if (data.status) {
                    const _model = data.data[0]
                    // console.log(`_model`, _model)

                    _model.name = _model.name ? _model.name["th"] : null;

                    /* isuse */
                    _model.isuse = _model.isuse == 1 ? true : false;

                    /* date */
                    _model.date = _model.start_activity_date && _model.end_activity_date ? [moment(_model.start_activity_date), moment(_model.end_activity_date)] : null;

                    /* ActivityPointsOptions */
                    _model.activity_points_options_id = _model.ActivityPointsOptions && _model.ActivityPointsOptions.length > 0 ? _model.ActivityPointsOptions[0].id : null;

                    setCheckedIsuse(_model.isuse)

                    formModal.setFieldsValue(_model)
                }
            }
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }

    /* configModal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [formModal] = Form.useForm();


    const handleOkModal = () => {
        formModal.submit()
    }

    const handleCancelModal = () => {
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: false })
        formModal.resetFields()
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)

            const _model = {
                code: value.code,
                name: {
                    th: value.name,
                    en: null
                },
                point: value.point,
                multiplier: 0,
                activity_points_options_id: [value.activity_points_options_id],
                start_activity_date: value.date ? Number(moment(value.date[0]._d).format("YYYYMMDD")) : Number(moment(new Date()).format("YYYYMMDD")),
                end_activity_date: value.date ? Number(moment(value.date[1]._d).format("YYYYMMDD")) : null,
            }

            // console.log(`_model`, _model)
            let res
            if (configModal.mode === "add") {
                res = await API.post(`/activityPoint/add`, _model)
            } else if (configModal.mode === "edit") {
                _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/activityPoint/put/${idEdit}`, _model)
            }
            if (res.data.status == "successful") {
                message.success('บันทึกสำเร็จ');
                handleCancelModal()
                getDataSearch({})
            } else {
                message.error(res.data.data.name);
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }



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
                    label="ชื่อกิจกรรม"
                    rules={[{ required: true, message: "กรุณากรอกข้อมูล!!" },]}
                >
                    <Input disabled={configModal.mode == "view"} />
                </Form.Item>

                <Form.Item
                    name="point"
                    label="แต้ม"
                >
                    <Input type="number" disabled={configModal.mode == "view"} />
                </Form.Item>

                <Form.Item
                    name="date"
                    label="วันที่เริ่มต้นและสิ้นสุด"
                >
                    <RangePicker />
                </Form.Item>

                <Form.Item
                    name="activity_points_options_id"
                    label="Options"
                    rules={[{ required: true, message: "กรุณาเลือกข้อมูล!!" }]}
                >
                    <Select style={{ width: "100%" }} >
                        {pointOptionList.map((e, i) => <Option key={i} value={e.id}>{e.name["th"]}</Option>)}
                    </Select>
                </Form.Item>

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
