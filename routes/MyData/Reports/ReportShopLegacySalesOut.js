import { useEffect, useState } from 'react'
import { message, Tabs, Modal, Button, Form, Upload, DatePicker, Input, Col, Row, Radio } from 'antd';
import { ExportOutlined, UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import API from '../../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import { RoundingNumber, NoRoundingNumber } from '../../../components/shares/ConvertToCurrency'
import GetIntlMessages from '../../../util/GetIntlMessages';
import moment from 'moment'
import _, { get, isArray, isFunction, isPlainObject } from 'lodash';
import axios from 'axios';
import { Label } from 'recharts';
const { TabPane } = Tabs;
const ReportShopLegacySalesOut = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser, token } = useSelector(({ auth }) => auth);
    const [isModalVisible, setIsModalVisible] = useState(false)

    const [form] = Form.useForm();

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
            order: "descend",
            hide_manage: true,
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: false
            }
        },
        configSort: {
            sort: `created_date`,
            // sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "",
            documentdate: [],
            businessPartner: [],
            filter_by: ["customer_name", "customer_vehicle_reg_plate"],
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
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 80,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: 'เลขที่เอกสาร',
                dataIndex: 'document_code_id',
                key: 'document_code_id',
                width: 150,
                align: "center",
            },
            {
                title: 'วันที่เอกสาร',
                dataIndex: 'document_date',
                key: 'document_date',
                width: 150,
                align: "center",
            },
            {
                title: 'ชื่อลูกค้า',
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 150,
                align: "center",
            },
            {
                title: 'ทะเบียนรถ',
                dataIndex: 'customer_vehicle_reg_plate',
                key: 'customer_vehicle_reg_plate',
                width: 150,
                align: "center",
            },
            {
                title: 'เลขไมล์',
                dataIndex: '',
                key: '',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            <span>{record ? (+record.details.mileage).toLocaleString() : ""} </span>
                        </>
                    )
                },
            },
            {
                title: 'เบอร์มือถือ',
                dataIndex: 'customer_tel_no',
                key: 'customer_tel_no',
                width: 150,
                align: "center",
            },
            {
                title: 'รหัสสินค้า',
                dataIndex: 'product_code',
                key: 'product_code',
                width: 150,
                align: "center",
            },
            {
                title: 'ชื่อสินค้า',
                dataIndex: 'product_name',
                key: 'product_name',
                width: 150,
                align: "center",
            },
            {
                title: 'จำนวนสินค้า',
                dataIndex: 'product_amount',
                key: 'product_amount',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            <span>{text ? Number(text).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            },
            {
                title: 'ยอดเงิน (รวม VAT)',
                dataIndex: 'price_grand_total',
                key: 'price_grand_total',
                width: 150,
                align: "center",
                render: (text, record) => {
                    return (
                        <>
                            <span>{text ? Number(text).toLocaleString() : "0"} </span>
                        </>
                    )
                },
            },
        ]
        setColumns(_column)
    }


    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })



    useEffect(async () => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, documentdate = modelSearch.documentdate, businessPartner = modelSearch.businessPartner ?? [], filter_by = modelSearch.filter_by ?? [] }) => {
        try {
            if (page === 1) setLoading(true)

            const dateFomat = "YYYY-MM-DD"
            let start_date = ""
            let end_date = ""
            if (isArray(documentdate) && documentdate.length > 0) {
                start_date = moment(documentdate[0]?._d).format(dateFomat)
                end_date = moment(documentdate[1]?._d).format(dateFomat)
            } else {
                start_date = ""
                end_date = ""
            }
            setStartDate(() => start_date)
            setEndDate(() => end_date)
            // filter_shop_business_partner_ids
            let url = `/shopLegacySalesOut/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&filter_by=${filter_by}${start_date !== "" ? `&start_date=${start_date}` : ""}${end_date !== "" ? `&end_date=${end_date}` : ""}`
            const res = await API.get(url)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;


                setColumnsTable(data, page, limit)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่!!!")
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
            // const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, { status: isuse == 2 ? 0 : isuse })
            // if (data.status != "success") {
            //     message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            // } else {
            //     message.success("บันทึกข้อมูลสำเร็จ");
            //     getDataSearch({
            //         page: configTable.page,
            //         search: modelSearch.search,
            //     })
            // }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */

    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                const { data } = await API.get(``)
                if (data.status == "success") {
                }
            } else {
                setIsModalVisible(true)
            }
        } catch (error) {
            console.log(`error`, error)
        }
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        try {
            let filter_by = []
            if (isArray(value.filter_by) && value.filter_by.length === 0) value.filter_by = init.modelSearch.filter_by
            setModelSearch((prevValue) => {
                if (isArray(prevValue.filter_by)) {
                    if (isArray(value.filter_by) && value.filter_by.length === 5) {
                        filter_by = ["all"]
                        return {
                            ...prevValue,
                            filter_by: ["all"],
                        }
                    } else {
                        const find = prevValue.filter_by.find(where => where === "all")
                        const filterByWithOutAll = value.filter_by.filter(where => where !== "all")
                        if (find) {
                            filter_by = filterByWithOutAll
                            return {
                                ...prevValue,
                                filter_by: filterByWithOutAll
                            }
                        } else {
                            const _find = value.filter_by.find(where => where === "all")
                            if (_find) {
                                filter_by = ["all"]
                                return {
                                    ...prevValue,
                                    filter_by: ["all"],
                                }
                            } else {
                                filter_by = filterByWithOutAll
                                return {
                                    ...prevValue,
                                    filter_by: filterByWithOutAll,
                                }
                            }

                        }
                    }

                }
            })
            getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page, documentdate: value.documentdate, businessPartner: value.businessPartner ,filter_by})
        } catch (error) {

        }

    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            search: init.modelSearch.search ?? "",
            _status: init.modelSearch.status,
            documentdate: init.modelSearch.documentdate,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /* export excel */
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")

    // const exportExcel = async () => {
    //     setLoading(true)
    //     const res = await API.get(`/shopLegacySalesOut/all?export_format=xlsx&start_date=${startDate}&end_date=${endDate}`)
    //     if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
    //     else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
    //     setLoading(false)
    // }

    const [loadingExport, setLoadingExport] = useState(false)

    const exportExcel = async () => {

        try {
            setLoadingExport(true)
            const { search } = modelSearch
            const res = await API.get(`/shopLegacySalesOut/all?search=${search}${!!startDate ? `&start_date=${moment(startDate).format("YYYY-MM-DD")}` : ""}${!!endDate ? `&end_date=${moment(endDate).format("YYYY-MM-DD")}` : ""}&order=${configSort.order === "descend" ? "desc" : "asc"}&export_format=xlsx`)
            // &sort=${configSort.sort}
            if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}${res.data.data.filePath}`)
            else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
            setLoadingExport(false)
        } catch (error) {
            setLoadingExport(false)
        }
    }

    const onFinishExportFailed = async () => {
        setLoadingExport(false)
        message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
    }

    /* end export excel */

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);
    const [importAdmin, setImportAdmin] = useState(false);
    const [urlImportErrorFile, setUrlImportErrorFile] = useState("");

    const importExcel = () => {
        setIsModalImportVisible(true)
    }

    const handleImportOk = async () => {
        try {
            if (fileImport) {
                setLoading(true)
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                // const userAuth = cookies.get("userAuth");
                // console.log(authUser)
                // const token = authUser.access_token
                // const token = cookies.get("access_token");
                // console.log("token",token)
                const { data } = await axios({
                    method: "post",
                    url: `${process.env.NEXT_PUBLIC_SERVICE}/shopLegacySalesOut/addByFile`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "success") {
                    message.success("บันทึกสำเร็จ")
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        _status: modelSearch.status,
                    })
                    setLoading(false)
                } else {
                    setLoading(true)
                    message.error('มีบางอย่างผิดพลาด !!');
                    setUrlImportErrorFile(process.env.NEXT_PUBLIC_DIRECTORY + data.data.filePath)
                    setLoading(false)
                }

            } else {
                message.warning("กรุณาเลือกไฟล์")
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const handleImportCancel = () => {
        setIsModalImportVisible(false)
        setFileImportList([])
        setFileImport(null)
    }

    const handleImportChange = (info) => {
        setUrlImportErrorFile("")
        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        // console.log(`file`, file)
                    }
                    return file;
                });
            }
        }

        // console.log('fileList :>> ', fileList);
        setFileImportList(fileList);
        if (fileList.length > 0) setFileImport(fileList[0]);
        else {
            setFileImport(null);
            // setFileType(null);
        }
    };

    /* end export excel */

    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/CSP_Template_ข้อมูลการขายเก่า.xlsx', '_blank');
    }

    /* Download File Error */
    const downloadFileError = () => {
        window.open(urlImportErrorFile, '_blank');
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
                label: GetIntlMessages("search"),
                placeholder: GetIntlMessages("search"),
                list: null,
            },
            {
                index: 1,
                type: "select",
                name: "filter_by",
                mode: "multiple",
                label: GetIntlMessages("สถานะการค้นหา"),
                allowClear: true,
                list: [
                    { value: "all", key: "ทั้งหมด" },
                    { value: "customer_name", key: "ชื่อลูกค้า" },
                    { value: "customer_vehicle_reg_plate", key: "ทะเบียนรถ" },
                    { value: "customer_tel_no", key: "เบอร์มือถือ" },
                    { value: "product_code", key: "รหัสสินค้า" },
                    { value: "product_name", key: "ชื่อสินค้า" },
                ],
            },
            {
                index: 1,
                type: "RangePicker",
                name: "documentdate",
                label: GetIntlMessages("document-date"),
                allowClear: true
            }
        ],
        col: 8,
        button: {
            create: false,
            download: true,
            import: true,
            export: true,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        exportExcel,
        importExcel,
        downloadTemplate,
    }

    // const getBusinessPartner = async () => {
    //     try {
    //         const { data } = await API.get(`/shopBusinessPartners/all?limit=999999&page=1&sort=partner_name.th&order=desc&status=active`)
    //         return data.status === "success" ? data.data.data : []
    //     } catch (error) {

    //     }
    // }

    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            const _model = {
                customer_name: value.customer_name ?? null,
                customer_tel_no: value.customer_tel_no ?? null,
                customer_vehicle_reg_plate: value.customer_vehicle_reg_plate ?? null,
                document_code_id: value.document_code_id ?? null,
                document_date: moment(value.document_date).format("YYYY-MM-DD") ?? null,
                price_grand_total: value.price_grand_total ?? null,
                product_amount: value.product_amount ?? null,
                product_code: value.product_code ?? null,
                product_name: value.product_name ?? null
            }
            let res
            if (configModal.mode === "add") {
                // _model.master_customer_code_id = ""
                res = await API.post(`/shopLegacySalesOut/add`, _model)
            } else if (configModal.mode === "edit") {
                // _model.status = checkedIsuse ? "active" : "block"
                // res = await API.put(`/shopLegacySalesOut/put/${idEdit}`, _model)
            }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(false)
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



    return (
        <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal('add')} value={modelSearch} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

            <Modal
                width={850}
                maskClosable={false}
                title={`นำเข้าข้อมูล`}
                visible={isModalImportVisible} onOk={handleImportOk} onCancel={handleImportCancel}
                okButtonProps={{ loading: loading }}
                bodyStyle={{
                    maxHeight: "80vh",
                    overflowX: "auto",
                }}
            >
                <Row style={{ textAlign: "center" }}>
                    {/* <Col md={12} xs={24}>
                        <div style={{ padding: "0 0 8px 0" }}>ดาวน์โหลด Template</div>

                        <Button icon={<DownloadOutlined />} onClick={downloadTemplate}>Download</Button>
                    </Col> */}
                    <Col xs={24}>
                        <div style={{ padding: "0 0 8px 0" }}>เลือกไฟล์</div>
                        <Upload
                            onChange={handleImportChange}
                            customRequest={dummyRequest}
                            fileList={fileImportList}
                            multiple={false}
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                        >
                            <Button icon={<UploadOutlined />}>Upload</Button>
                        </Upload>
                        <div
                            hidden={urlImportErrorFile === ""}
                            style={{
                                padding: "16px 0px",
                                margin: "16px 0 0 0",
                                color: "red",
                                border: "1px solid red",
                                borderRadius: "10px"
                            }}>
                            <div style={{ padding: "0 0 8px 0" }} hidden={urlImportErrorFile === ""}>
                                เกิดข้อผิดพลาด ดาวน์โหลดไฟล์เพื่อตรวจสอบ
                            </div>
                            <Button hidden={urlImportErrorFile === ""} icon={<DownloadOutlined />} onClick={downloadFileError}>Download</Button>
                        </div>
                    </Col>
                    <Col md={12} xs={24}>

                    </Col>
                </Row>
            </Modal >
            <Modal
                width={850}
                maskClosable={false}
                // style={{ top: 0 }}
                title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}การนัดหมาย`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                okButtonProps={{ disabled: configModal.mode == "view" }}
                bodyStyle={{
                    maxHeight: "80vh",
                    overflowX: "auto",
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 24 }}
                    wrapperCol={{ span: 20 }}
                    layout="vertical"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete='off'
                >
                    <Row>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="document_code_id"
                                label={GetIntlMessages(`เลขที่เอกสาร`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="document_date"
                                label={GetIntlMessages(`เลขที่เอกสาร`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <DatePicker style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_name"
                                label={GetIntlMessages(`ชื่อลูกค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_vehicle_reg_plate"
                                label={GetIntlMessages(`ทะเบียนรถ`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="ตัวอย่าง ทส-5123 กรุงเทพมหานคร" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="customer_tel_no"
                                label={GetIntlMessages(`เบอร์มือถือ`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                    {
                                        min: 10,
                                        message: GetIntlMessages("กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 10 ตัว"),
                                    },
                                    {
                                        pattern: new RegExp("^[0-9]*$"),
                                        message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                    }
                                ]}
                            >
                                <Input type={'text'} maxLength={10} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_code"
                                label={GetIntlMessages(`รหัสสินค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_name"
                                label={GetIntlMessages(`ชื่อสินค้า`)}

                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="product_amount"
                                label={GetIntlMessages(`จำนวนสินค้า`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                    {
                                        pattern: new RegExp("^[0-9]*$"),
                                        message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                    }
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                        <Col md={12} xs={24}>
                            <Form.Item
                                name="price_grand_total"
                                label={GetIntlMessages(`ยอดเงิน (รวม VAT)`)}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(`กรุณากรอกข้อมูล`),
                                    },
                                ]}
                            >
                                <Input type={'text'} maxLength={100} disabled={configModal.mode == "view"} placeholder="กรอกข้อมูล" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>

            <style jsx global>
                {`
                    .detail-before-table {
                        margin-bottom: 10px;
                    }
                    .ant-tabs-tab {
                        margin: 0 64px 0 0;
                    }
                    .ant-tabs-tab + .ant-tabs-tab {
                        margin: 0 64px 0 0;
                    }
                    .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
                        color: ${mainColor};
                        font-weight: 500;
                    }
                    .ant-tabs-tab:hover {
                        color: ${mainColor};
                    }
                    .ant-tabs-ink-bar {
                        background: ${mainColor};
                    }
                    .modal-full-screen .ant-form-item {
                        margin-bottom: 5px;
                    }
                    .ant-form legend {
                        padding: inherit;
                        font-size: x-large;
                        border-bottom: 0px solid #d9d9d9;
                    }
                `}
            </style>
        </>
    )
}

export default ReportShopLegacySalesOut
