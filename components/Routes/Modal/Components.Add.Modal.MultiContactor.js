import { Button, Col, Form, Input, message, Modal, Row, Select, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import API from '../../../util/Api';
import SearchInput from '../../shares/SearchInput'
import TableList from '../../shares/TableList'
import ModalFullScreen from "../../shares/ModalFullScreen";
import NewFormProvinceDistrictSubdistrict from '../../shares/NewFormProvinceDistrictSubdistrict';
import GetIntlMessages from '../../../util/GetIntlMessages';
import RegexMultiPattern from '../../shares/RegexMultiPattern';
import { FormSelectLanguage, FormInputLanguage } from '../../shares/FormLanguage';
import { PlusOutlined, MinusCircleOutlined, TeamOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { get, isFunction } from 'lodash';


const MultiContactor = ({ customerInfo, title = null, callBack }) => {
    const [loading, setLoading] = useState(false);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])

    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const { departments } = useSelector(({ master }) => master);

    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
        setColumnsTable()
    }, [customerInfo])


    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setColumnsTable(value.status)
        setModelSearch(value)
        getDataSearch({
            search: value.search,
            _status: value.status,
            page: init.configTable.page,
            // doc_date_startDate: isArray(value.select_date) ? value.select_date[0] ?? null : null,
            // doc_date_endDate: isArray(value.select_date) ? value.select_date[1] ?? null : null,
            // payment_paid_status: value.payment_paid_status,
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
                        key: "สถานะใช้งาน",
                        value: "active",
                    },
                    {
                        key: "สถานะยกเลิก",
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
        // sliderCol: { input: 2, slider: 4 },
        button: {
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        // downloadTemplate,
        // importExcel,
        // exportExcel,
        // onClearFilterSearch
    }

    const setColumnsTable = () => {
        const _column = [];
        _column.push(
            {
                title: () => GetIntlMessages("ลำดับ"),
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
                title: () => GetIntlMessages("ชื่อผู้ติดต่อ"),
                dataIndex: 'contact_name',
                key: 'contact_name',
                align: "center",
                width: 100,
                use: true,
                render: (text, record, index) => get(text, `${locale.locale}`, "-")
            },
            {
                title: () => GetIntlMessages("ตำแหน่ง"),
                dataIndex: 'position',
                key: 'position',
                align: "center",
                width: 100,
                use: true,
                render: (text, record, index) => get(record, `position`, "-")
            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record)}>เลือก</Button>
                ),
            },
        )

        setColumns(_column.filter(x => x.use === true));
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
                status: true
            },
            title: {
                use_system: "สถานะใช้งาน",
                not_use_system: "สถานะยกเลิก"
            }
        },
        configSort: {
            sort: "created_date",
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

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (page === 1) setLoading(true)
            setListSearchDataTable([])
            const res = await API.get(`/shopContactCustomer/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&${[customerInfo.customer_type === "personal" ? "per_customer_id" : customerInfo.customer_type === "business" ? "bus_customer_id" : "bus_partner_id"]}=${customerInfo.customer_id}`)
            // const res = await API.get(`/customer/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&which=${_which}`)
            // console.log('res :>> ', res);
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data, isuse } = res.data.data;
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, isuse })
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
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete";
            const { data } = await API.put(`/shopContactCustomer/put/${id}`, { status });
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");

                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                });
                onFinishSearch(modelSearch)
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!");
        }
    };

    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleShipToModal, setIsModalVisibleShipToModal] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const addEditViewModal = async (mode, id) => {
        try {
            // setMode(_mode)
            // setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                setConfigModal({ ...configModal, mode: "edit" })
                const { data } = await API.get(`/shopContactCustomer/byid/${id}`)

                if (data.status === 'success') {
                    const { contact_name, position, department, tel_no } = data.data
                    tel_no = Object.entries(tel_no).map(e => ({ tel_no: e[1] }));
                    const model = {
                        contact_name,
                        position,
                        department,
                        tel_no
                    }
                    form.setFieldsValue(model)
                }
            }
            // setIsModalVisibleShipToModal(true)
            setIsModalVisibleShipToModal(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }

    const handleOk = () => {
        form.submit()
    }

    const handleCancelMutliContactor = () => {
        try {
            form.resetFields()
            setConfigModal({ ...configModal, mode: 'add', modeKey: null })
            setIsModalVisibleShipToModal(false)
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                _status: modelSearch.status,
            })
        } catch (error) {

        }
    }

    const onFinish = async (values) => {
        try {
            // console.log('values :>> ', values);
            setLoading(true)
            const { customer_id, customer_type } = customerInfo
            const model = {
                contact_name: values.contact_name ?? { th: "" },
                [customer_type === "personal" ? "per_customer_id" : customer_type === "business" ? "bus_customer_id" : "bus_partner_id"]: customer_id,
                department: values.department,
                position: values.position,
                // tel_no: !!values.tel_no && !!values.tel_no[0] ? Object.assign({} , ...values.tel_no) : {},
                tel_no: !!values.tel_no ? Object.assign({}, ...values.tel_no.filter(where => !!where.tel_no).map((e, i) => ({ [`tel_no_${i + 1}`]: e.tel_no }))) : {},
                details: {}
            }

            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopContactCustomer/add`, model)
            } else if (configModal.mode === "edit") {
                res = await API.put(`/shopContactCustomer/put/${idEdit}`, model)
            }

            if (res.data.status === "success") {
                Swal.fire('บันทึกสำเร็จ !!', '', 'success')
                handleCancelMutliContactor()
            } else {
                Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            console.log('error onFinish :>> ', error);
        }
    }


    const onFinishFailed = (errorInfo) => {
        console.log('error onFinishFailed:', errorInfo);
    };

    return (
        <>

            {/* <Button onClick={() => setIsModalVisible(true)} type="link" icon={<TeamOutlined style={{ fontSize: "1.2rem" }} />}>ข้อมูลผู้ติดต่อ</Button> */}

            {/* <Modal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                hideSubmitButton
                width="90vw"
                style={{ top: 16 }}
                footer={(
                    <>
                        <Button onClick={() => setIsModalVisible(false)}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            > */}
            <div className="head-line-text">ข้อมูลผู้ติดต่อ</div>
            <SearchInput title={false} configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
            {/* </Modal> */}

            <Modal
                title={GetIntlMessages("เพิ่มผู้ติดต่อ")}
                // visible={isModalVisibleShipToModal}
                open={isModalVisibleShipToModal}
                onOk={handleOk}
                onCancel={handleCancelMutliContactor}
                // className={`modal-padding-20px-screen`}
                // title={GetIntlMessages("เพิ่มที่อยู่จัดส่ง")}
                bodyStyle={{
                    height: "80vh",
                    overflowX: "hidden"
                }}
                style={{
                    top: "1%",
                }}
                centered
            >
                <div style={{ height: "auto", overflowX: "hidden" }}>
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        initialValues={{
                            "tel_no": [""]
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Row gutter={[10]} >
                            <Col hidden>
                                <FormSelectLanguage config={{
                                    form,
                                    field: ["contact_name"],
                                }} onChange={(value) => setFormLocale(value)} />
                            </Col>

                            <Col span={24}>
                                <FormInputLanguage disabled={configModal.mode === "view"} icon={formLocale} label={GetIntlMessages("ชื่อผู้ติดต่อ")} name="contact_name" rules={[RegexMultiPattern()]} placeholder={"กรอกข้อมูล"} />
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("แผนก")}
                                    name="department"
                                // rules={[RegexMultiPattern()]}
                                >
                                    <Select placeholder="เลือกข้อมูล" showSearch optionFilterProp='children'>
                                        {
                                            departments.map((e, i) => (<Select.Option value={e.id} key={i}>{e.department_name[locale.locale]}</Select.Option>))
                                        }
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("ตำแหน่ง")}
                                    name="position"

                                // rules={[RegexMultiPattern()]}
                                >
                                    <Input placeholder="กรอกข้อมูล" />
                                </Form.Item>
                            </Col>

                            {/* <Col span={24}>
                                <Form.Item label={GetIntlMessages("เบอร์มือถือ")}
                                    name="test"
                                    rules={[RegexMultiPattern("1", GetIntlMessages("ตัวเลขเท่านั้น"), true)]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col> */}
                            <Col span={24}>
                                <Form.List name="tel_no">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(({ key, name, ...restField }, index) => (
                                                <Row gutter={[10]} style={{ display: "flex", alignItems: index === 0 ? "center" : "" }}>
                                                    <Col span={21}>
                                                        <Form.Item
                                                            {...restField}
                                                            name={[name, `tel_no`]}
                                                            validateTrigger={['onChange', 'onBlur']}
                                                            // rules={[
                                                            //     {
                                                            //         required: true,
                                                            //         message: 'กรุณากรอกเบอร์โทร',
                                                            //     },
                                                            // ]}
                                                            label={index === 0 ? GetIntlMessages("เบอโทรศัพท์") : ''}
                                                            rules={[RegexMultiPattern("1", GetIntlMessages("ตัวเลขเท่านั้น"), false)]}
                                                        >
                                                            <Input maxLength={10} style={{ width: "100%" }} placeholder="เบอโทรศัพท์" />
                                                        </Form.Item>

                                                    </Col>

                                                    <Col span={1} style={{ paddingTop: index === 0 ? 5 : 0 }}>
                                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                                    </Col>
                                                </Row>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                    เพิ่มเบอร์โทรศัพท์
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Col>
                        </Row>


                    </Form>

                </div>

            </Modal>

        </>
    )
}

export default MultiContactor