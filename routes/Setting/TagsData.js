import { useEffect, useState } from 'react'
import { message, Modal, Form, Row, Col, Image, Typography } from 'antd';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components//shares/TableList'
import { FormInputLanguage, } from '../../components/shares/FormLanguage';
import { get, isFunction } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';
const { Text, Link } = Typography;
const TagsData = ({ title = null, callBack, listIndex }) => {

    const [loading, setLoading] = useState(false);
    // const { authUser, imageProfile } = useSelector(({ auth }) => auth);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [imgEmpUrl, setImgEmpUrl] = useState(false)

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

    useEffect(() => {
        setColumnsTable()
    }, [listIndex]);

    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("order"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: "10%",
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },

            {
                title: () => GetIntlMessages("ชื่อแท็ก"),
                dataIndex: 'tag_name',
                key: 'tag_name',
                width: "80%",
                render: (text, record) => {
                    if (isFunction(callBack)) {
                        return (
                            <Link href="#" onClick={() => callBack(record, listIndex)}>
                                {get(text, `${locale.locale}`, "-")}
                            </Link>
                        )
                    } else {
                        return (
                            <Text>{get(text, `${locale.locale}`, "-")}</Text>
                        )
                    }
                },
            },

        ];

        setColumns(_column)
    }


    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
            department_id: modelSearch.department_id
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

            let url = `/shopTags/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${department_id ? `&department_id=${department_id}` : ""}`

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

            const { data } = await API.put(`/shopTags/put/${id}`, { status })
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
            setImgEmpUrl("/assets/images/csp/no-image.png")
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/shopTags/byid/${id}`)
                if (data.status == "success") {
                    const _model = data.data
                    const urlImg = await CheckImage({
                        directory: "shopTags",
                        name: id,
                        fileDirectoryId: id,
                    })
                    setImgEmpUrl(urlImg)
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
            console.log(value)

            if (value.upload) {
                await UploadImageSingle(value.upload.file, { name: idEdit, directory: "shopTags" })

                const urlImg = await CheckImage({
                    directory: "shopTags",
                    name: idEdit,
                    fileDirectoryId: idEdit,
                })
                setImgEmpUrl(urlImg)
                // dispatch(setImageProfile(urlImg));
            }

            const _model = {
                tag_name: value.tag_name,
                tag_type: 0,
            }

            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopTags/add`, _model)
            } else if (configModal.mode === "edit") {
                res = await API.put(`/shopTags/put/${idEdit}`, _model)
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
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}แท็ก`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: "80vh",
                        overflowX: "auto"
                    }}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 4 }}
                        wrapperCol={{ span: 20 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Row style={{ paddingBottom: "20px" }}>
                            <Col span={24} style={{ textAlign: "center", paddingBottom: "30px" }}>
                                <Image
                                    width={200}
                                    src={imgEmpUrl}
                                />
                            </Col>
                            <Col span={24}>
                                <FormInputLanguage
                                    icon={formLocale}
                                    label={"ชื่อแท็ก"}
                                    name="tag_name"
                                    rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                    disabled={configModal.mode == "view"}
                                />
                            </Col>
                            <Col span={24}>
                                <ImageSingleShares
                                    name="upload"
                                    accept={"image/*"}
                                    label={"รูปภาพ"}
                                    value={[{ url: imgEmpUrl, name: "รูปภาพ" }]}
                                />
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

export default TagsData
