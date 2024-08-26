import { Button, Col, Form, Input, message, Modal, Row } from 'antd'
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
import { EnvironmentOutlined, } from '@ant-design/icons';
import Swal from 'sweetalert2';
import { get } from 'lodash';

const MultiShipTo = ({ customerInfo }) => {
    const [loading, setLoading] = useState(false);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])

    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);

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
    }, [])



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
                width: "5%",
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: () => GetIntlMessages("ชื่อผู้รับ"),
                dataIndex: 'details',
                key: 'details',
                align: "center",
                width: "15%",
                render: (text, record, index) => get(text, `recipient_name`, `-`),
            },
            {
                title: () => GetIntlMessages("เบอร์โทรศัพท์"),
                dataIndex: 'details',
                key: 'details',
                align: "center",
                width: "15%",
                render: (text, record, index) => get(text, `phone_number`, `-`),
            },
            {
                title: () => GetIntlMessages("ที่อยู่"),
                dataIndex: 'address',
                key: 'address',
                align: "center",
                width: "30%",
                render: (text, record, index) => <div style={{ textAlign: "start" }}>{get(text, `${locale.locale}`, `-`)}</div>,
            },
            {
                title: () => GetIntlMessages("จังหวัด"),
                dataIndex: 'Province',
                key: 'Province',
                align: "center",
                width: "15%",
                render: (text, record, index) => get(text, `prov_name_${locale.locale}`, `-`),
            },
        )

        setColumns(_column)
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
            const res = await API.get(`/shopShipAddressCustomer/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&${[customerInfo.customer_type === "personal" ? "per_customer_id" : "bus_customer_id"]}=${customerInfo.customer_id}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data, isuse } = res.data.data;
                setListSearchDataTable(data)
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, isuse: isuse })
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
            const { data } = await API.put(`/shopShipAddressCustomer/put/${id}`, { status });
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
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form, formShipToModal] = Form.useForm();

    const [isModalVisibleShipToModal, setIsModalVisibleShipToModal] = useState(false);

    const addEditViewModal = async (mode, id) => {
        // const addEditViewMultiShipToModal = async(mode, id) => {
        try {
            if (id) {
                setIsIdEdit(id)
                setConfigModal({ ...configModal, mode })
                const { data } = await API.get(`/shopShipAddressCustomer/byid/${id}`)

                if (data.status === 'success') {
                    const { address, address_name, details, province_id, district_id, subdistrict_id, SubDistrict } = data.data

                    const model = {
                        address,
                        address_name,
                        recipient_name: details.recipient_name ?? null,
                        phone_number: details.phone_number ?? null,
                        latitude: details.latitude ?? null,
                        longitude: details.longitude ?? null,
                        province_id,
                        subdistrict_id,
                        district_id,
                        zip_code: SubDistrict.zip_code
                    }
                    form.setFieldsValue(model)
                }
            }
            setIsModalVisibleShipToModal(true)
        } catch (error) {

        }
    }

    const handleOk = () => {
        form.submit()
    }

    const handleCancelMutliShipTo = () => {
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
                [customer_type === "personal" ? "per_customer_id" : "bus_customer_id"]: customer_id,
                province_id: values.province_id,
                district_id: values.district_id,
                subdistrict_id: values.subdistrict_id,
                address: values.address ?? null,
                address_name: values?.address_name ?? { th: "" },
                details: {
                    recipient_name: values.recipient_name ?? null,
                    phone_number: values.phone_number ?? null,
                    latitude: values.latitude ?? null,
                    longitude: values.longitude ?? null,
                }
            }

            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopShipAddressCustomer/add`, model)
            } else if (configModal.mode === "edit") {
                res = await API.put(`/shopShipAddressCustomer/put/${idEdit}`, model)
            }

            if (res.data.status === "success") {
                Swal.fire('บันทึกสำเร็จ !!', '', 'success')
                handleCancelMutliShipTo()
            } else {
                Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!', '', 'error')
            }
            setLoading(false)

        } catch (error) {
            setLoading(false)
            // console.log('error :>> ', error);
        }
    }


    const onFinishFailed = () => {
        try {

        } catch (error) {

        }
    }


    return (
        <>
            <Button onClick={() => setIsModalVisible(true)} type="link" icon={<EnvironmentOutlined style={{ fontSize: "1.2rem" }} />}>ข้อมูลจัดส่ง</Button>
            <Modal
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
            >
                <div className="head-line-text">ข้อมูลที่อยู่จัดส่ง</div>
                <SearchInput title={false} configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
            </Modal>

            <Modal
                title={`เพิ่มที่อยู่จัดส่ง`}
                open={isModalVisibleShipToModal}
                onOk={handleOk}
                onCancel={handleCancelMutliShipTo}
                okButtonProps={{ hidden: configModal.mode === "view", loading: loading }}
                cancelButtonProps={{ loading: loading }}
                // cancelButtonProps={{text : }}
                cancelText={configModal.mode === "view" ? GetIntlMessages("กลับ") : GetIntlMessages("cancel")}
                bodyStyle={{
                    height: "70vh",
                    overflowX: "hidden"
                }}
                style={{
                    top: "1%",
                }}
                centered
                width="60vw"
            >
                <div style={{ height: "auto", overflowX: "hidden" }}>
                    <Form
                        form={form}
                        layout="horizontal"
                        labelCol={{ span: 24 }}
                        wrapperCol={{ span: 24 }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Row gutter={[10]} >
                            <Col xs={24} xl={12}>
                                <Col hidden>
                                    <FormSelectLanguage config={{
                                        form,
                                        field: ["first_name", "last_name", "address"],
                                    }} onChange={(value) => setFormLocale(value)} />
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("ชื่อผู้รับ")}
                                        name="recipient_name"
                                        rules={[RegexMultiPattern()]}
                                    >
                                        <Input disabled={configModal.mode === "view"} />
                                    </Form.Item>
                                </Col>

                                <Col span={24} hidden>
                                    <FormInputLanguage disabled={configModal.mode === "view"} icon={formLocale} label={GetIntlMessages("อาคาร/ชั้น")} name="address_name" />
                                </Col>

                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("เบอร์มือถือ")}
                                        name="phone_number"
                                        rules={[RegexMultiPattern("1", GetIntlMessages("ตัวเลขเท่านั้น"), true)]}
                                    >
                                        <Input maxLength={10} disabled={configModal.mode === "view"} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <FormInputLanguage disabled={configModal.mode === "view"} isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" rules={[RegexMultiPattern()]} />
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("ละติจูด (Latitude)")}
                                        name="latitude"
                                    >
                                        <Input disabled={configModal.mode === "view"} />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label={GetIntlMessages("ลองติจูด (Longitude)")}
                                        name="longitude"
                                    >
                                        <Input disabled={configModal.mode === "view"} />
                                    </Form.Item>
                                </Col>


                            </Col>
                            <Col xs={24} xl={12}>
                                <Col span={24}>
                                    <NewFormProvinceDistrictSubdistrict disabled={configModal.mode === "view"} form={form} mode={configModal.mode} />
                                </Col>
                            </Col>


                        </Row>
                    </Form>
                </div>
            </Modal>
        </>
    )
}

export default MultiShipTo