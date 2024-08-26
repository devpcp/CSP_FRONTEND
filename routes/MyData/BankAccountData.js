import { useEffect, useState } from 'react'
import { message, Modal, Form, Row, Col, Image, Input, Select, Button } from 'antd';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { FormInputLanguage, } from '../../components/shares/FormLanguage';
import { get, isFunction } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';
import TextArea from 'antd/lib/input/TextArea';

const BankAccountData = ({ title = null, callBack }) => {
    const [loading, setLoading] = useState(false);
    // const { authUser, imageProfile } = useSelector(({ auth }) => auth);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [imgEmpUrl, setImgEmpUrl] = useState(false)
    const { bankNameList } = useSelector(({ master }) => master);
    /**
    * ค่าเริ่มต้นของ
    *  - configTable = Config ตาราง
    *  - configSort = เรียงลำดับ ของ ตาราง
    *  - modelSearch = ตัวแปล Search
    */

    const accountTypeList = [
        {
            id: "55dd3761-4b81-4f9d-95f4-3fe3ba8a6c92",
            account_type_name: {
                th: "บัญชีเงินฝาก ออมทรัพย์",
                en: "Savings Account"
            },
            is_use: true
        },
        {
            id: "d75f115a-a140-4667-b57d-4a2e7b9e9461",
            account_type_name: {
                th: "บัญชีเงินฝาก พื้นฐาน",
                en: "Basic Banking Account"
            },
            is_use: false
        },
        {
            id: "108657d4-93bf-466c-85f2-8140d5f81e27",
            account_type_name: {
                th: "บัญชีเงินฝาก ประจำ/ฝากระยะยาว",
                en: "Fixed Deposit Account"
            },
            is_use: false
        },
        {
            id: "eac7cbd4-79bb-4cbc-9cbc-4a6e26b8d414",
            account_type_name: {
                th: "บัญชีกระแสรายวัน/เดินสะพัด",
                en: "Current Account"
            },
            is_use: true
        },
        {
            id: "8f661701-3e34-460b-afc4-674e23760561",
            account_type_name: {
                th: "บัญชีเงินตราต่างประเทศ",
                en: "Foreign Currency Deposit Account : FCD"
            },
            is_use: false
        },
        {
            id: "b020aa9b-ac59-4538-911b-323a59718a15",
            account_type_name: {
                th: "บัญชีเงินฝากออนไลน์",
                en: "Digital Savings/e-Savings"
            },
            is_use: false
        },
    ]

    const init = {
        configTable: {
            page: 1,
            total: 0,
            limit: 10,
            sort: "code",
            order: "ascend",
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: false
            }
        },
        configSort: {
            sort: `updated_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "default",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)



    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("order"),
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
                title: () => GetIntlMessages("เลขที่บัญชี"),
                dataIndex: 'account_no',
                key: 'account_no',
                width: 200,
                align: "center",
                use: true,
                render: (text, record) => text ?? "-",
            },
            {
                title: () => GetIntlMessages("ชื่อบัญชี"),
                dataIndex: 'account_name',
                key: 'account_name',
                width: 400,
                use: true,
                render: (text, record) => get(text, `${locale.locale}`, "-"),
            },
            {
                title: () => GetIntlMessages("ธนาคาร"),
                dataIndex: 'BankNameList',
                key: 'BankNameList',
                width: 200,
                align: "center",
                use: true,
                render: (text, record) => {
                    return get(text, `bank_name.${locale.locale}`, "-")
                }
            },
            {
                title: () => GetIntlMessages("ประเภทบัญชี"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                align: "center",
                use: true,
                render: (text, record) => {
                    return accountTypeList?.find(x => x.id === record.details.account_type_id)?.account_type_name[locale.locale] ?? "-"
                }
            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: 'cheque_number',
                key: 'cheque_number',
                width: 100,
                align: "center",
                use: isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record)}>เลือก</Button>
                ),
            },
        ];

        setColumns(_column.filter(x => x.use === true));
    }


    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })

        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", department_id = modelSearch.department_id ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            let url = `/shopBank/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${department_id ? `&department_id=${department_id}` : ""}`

            const res = await API.get(url)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
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
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            // console.log('changeStatus :>> ', status, id);

            const { data } = await API.put(`/shopBank/put/${id}`, { status })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                console.log(`search`, modelSearch.search)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            // setMode(_mode)
            // setImgEmpUrl("/assets/images/profiles/avatar.jpg")
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/shopBank/byid/${id}`)
                if (data.status == "success") {
                    const _model = data.data

                    if (_.isPlainObject(_model.details)) {
                        _model.note = _model.details["note"];
                        _model.account_type_id = _model.details["account_type_id"];
                    }
                    // const urlImg = await CheckImage({
                    //     directory: "shopBank",
                    //     name: id,
                    //     fileDirectoryId: id,
                    // })
                    // setImgEmpUrl(urlImg)
                    form.setFieldsValue(_model)
                }

            }

            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
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

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add' })
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log(value)

            // if (value.upload) {
            //     await UploadImageSingle(value.upload.file, { name: idEdit, directory: "shopBank" })

            //     const urlImg = await CheckImage({
            //         directory: "shopBank",
            //         name: idEdit,
            //         fileDirectoryId: idEdit,
            //     })
            //     setImgEmpUrl(urlImg)
            //     // dispatch(setImageProfile(urlImg));
            // }

            const _model = {
                account_no: value.account_no,
                account_name: value.account_name,
                bank_id: value.bank_id,
                details: {
                    note: value.note,
                    account_type_id: value.account_type_id,
                }
            }

            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopBank/add`, _model)
            } else if (configModal.mode === "edit") {
                res = await API.put(`/shopBank/put/${idEdit}`, _model)
            }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(false)
                setConfigModal({ ...configModal, mode: "add" })
                form.resetFields()
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    /* master */

    const getMasterData = async () => {
        try {
            // const nameTitle = await getNameTitleListAll()
            // setRelationList(relationList)
        } catch (error) {

        }
    }


    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page })
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

    /** กดปุ่มเครียร์ Dropdown */
    // const onClearFilterSearch = (type) => {
    //     try {
    //         const searchModel = {
    //             ...modelSearch
    //         }

    //         switch (type) {
    //             case "department_id":
    //                 searchModel[type] = null
    //                 searchModel.department_id = null
    //                 break;
    //             default:
    //                 break;
    //         }
    //         setModelSearch((previousValue) => searchModel);
    //     } catch (error) {

    //     }
    // }

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


    return (
        <>

            <div id="page-manage">
                <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} title={title !== null ? false : true} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <Modal
                    maskClosable={false}
                    centered
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}บัญชีธนาคาร`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: "80vh",
                        overflowX: "auto"
                    }}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 6 }}
                        wrapperCol={{ span: 18 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Row style={{ paddingBottom: "20px" }}>
                            <Col span={24}>


                                <Form.Item
                                    name='account_no'
                                    label={GetIntlMessages("เลขที่บัญชี")}
                                    rules={[
                                        {
                                            required: true,
                                            message: "กรุณากรอกข้อมูล"
                                        },
                                        {
                                            pattern: /^[\.0-9]*$/,
                                            message: "กรอกได้เฉพาะตัวเลขเท่านั้น"
                                        },
                                        {
                                            min: 10,
                                            message: "กรุณากรอกข้อมูลให้ถูกต้อง"
                                        },
                                        {
                                            max: 10,
                                            message: "กรุณากรอกข้อมูลให้ถูกต้อง"
                                        }
                                    ]}
                                >
                                    <Input placeholder="กรอกข้อมูล" min />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <FormInputLanguage
                                    placeholder="กรอกข้อมูล"
                                    icon={formLocale}
                                    name='account_name'
                                    label={GetIntlMessages("ชื่อบัญชี")}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                    disabled={configModal.mode == "view"}
                                />
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='bank_id'
                                    label={GetIntlMessages("ชื่อธนาคาร")}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <Select
                                        placeholder="เลือกข้อมูล"
                                        showSearch
                                        optionFilterProp="children">
                                        {bankNameList.map((e, index) => (<Select.Option key={`bank-${index}-${e.id}`} value={e.id}>{e.bank_name[locale.locale]}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item
                                    name='account_type_id'
                                    label={GetIntlMessages("ประเภทบัญชี")}
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                >
                                    <Select
                                        placeholder="เลือกข้อมูล"
                                        showSearch
                                        optionFilterProp="children">
                                        {accountTypeList.filter(x => x.is_use === true).map((e, index) => (<Select.Option key={`bank-${index}-${e.id}`} value={e.id}>{e.account_type_name[locale.locale]}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="note" readOnly={true} label={"หมายเหตุ"} >
                                    <TextArea
                                        placeholder="กรอกหมายเหตุ"
                                        rows={4}
                                        disabled={configModal.mode == "view"}
                                        showCount
                                        maxLength={200}
                                    >
                                    </TextArea>
                                </Form.Item>
                            </Col>

                        </Row>
                    </Form>
                </Modal>

            </div>
            <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
            `}</style>
        </>
    )
}

export default BankAccountData
