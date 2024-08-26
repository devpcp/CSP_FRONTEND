import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, Modal, Form, Upload, DatePicker, Select } from 'antd';
import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import { useSelector } from 'react-redux';
import TitlePage from '../../components/shares/TitlePage'


const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;
const cookies = new Cookies();

const ComponentsRoutesDealersSales = ({ status }) => {
    const [loading, setLoading] = useState(false);

    /* table */
    const [search, setSearch] = useState("")
    const [searchDealer, setSearchDealer] = useState("")
    const [searchProduct, setSearchProduct] = useState("")
    const [searchCustomer, setSearchCustomer] = useState("")
    const [typeDate, setTypeDate] = useState("date")
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const [limit, setLimit] = useState(10)
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const [sortOrder, setSortOrder] = useState("ascend")

    useEffect(() => {
        getDataSearch({
            _page: page,
            _search: search,
        })
    }, [])

    useEffect(() => {
        setColumnsTable()
    }, [page, sortOrder])

    const setColumnsTable = () => {
        const _column = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 100,
                render: (text, record, index) => {
                    index += ((page - 1) * limit)
                    return index + 1
                },
            },
            {
                title: 'รหัสตัวแทน',
                dataIndex: 'Dealer',
                key: 'Dealer',
                width: 150,
                align: "center",
                render: (text, record) => text ? text.master_dealer_code_id : "-",
            },
            {
                title: 'ชื่อตัวแทน',
                dataIndex: 'Dealer',
                key: 'Dealer',
                width: 250,
                align: "center",
                render: (text, record) => text ? text.dealer_name ? text.dealer_name["th"] : "-" : "-",
            },
            {
                title: 'รหัสลูกค้า',
                dataIndex: 'Customer',
                key: 'Customer',
                width: 150,
                render: (text, record) => text ? text.master_customer_code_id : "-",
            },
            {
                title: 'ชื่อลูกค้า',
                dataIndex: 'Customer',
                key: 'Customer',
                width: 250,
                render: (text, record) => text ? text.customer_name ? text.customer_name["th"] : "-" : "-",
            },

            {
                title: 'รหัส Invoice',
                dataIndex: 'invoice_no',
                key: 'invoice_no',
                width: 150,
                render: (text, record) => text ?? "-",
            },

            {
                title: 'วันที่ออก Invoice',
                dataIndex: 'invoice_date',
                key: 'invoice_date',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ลำดับใน Invoice',
                dataIndex: 'item_no',
                key: 'item_no',
                width: 100,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ชื่อสินค้า',
                dataIndex: 'Product',
                key: 'Product',
                width: 200,
                render: (text, record) => text ? text.product_name ? text.product_name["th"] : "-" : "-",
            },
            {
                title: 'โมเดลรุ่น',
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 200,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'จำนวนสินค้า',
                dataIndex: 'qty',
                key: 'qty',
                width: 200,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ประเภทเอกสาร',
                dataIndex: 'doc_type',
                key: 'doc_type',
                width: 200,
                render: (text, record) => text ?? "-",
            },
        ];

        /* management */
        if (status === "management") {
            _column.push(
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
            )

        }

        setColumns(_column)
    }

    /* ค่าเริ่มต้น */
    const reset = async () => {
        const _page = 1, _search = "";
        setPage(_page)
        setSearch(_search)
        setSearchDealer("")
        setSearchProduct("")
        setSearchCustomer("")
        setTypeDate("date")
        setStartDate(null)
        setEndDate(null)

        await getDataSearch({ _page, _search })
    }

    /* ค้นหา */
    const getDataSearch = async ({ _search = search, _searchDealer = searchDealer, _searchProduct = searchProduct, _searchCustomer = searchCustomer, _startDate = startDate, _endDate = endDate, _limit = limit, _page = 1, _sort = "created_date", _order = sortOrder === "descend" ? "asc" : "desc", _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (_page === 1) setLoading(true)
            const res = await API.get(`/webMax/GetSubmitSales?limit=${_limit}&page=${_page}&sort=${_sort}&order=${_order}&search=${_search}&which=${_which}&search_dealer=${_searchDealer}&search_product=${_searchProduct}&search_customer=${_searchCustomer}&start_date=${_startDate}&end_date=${_endDate}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)
                setListSearchDataTable(data)
                setTotal(totalCount);
                if (_page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (_page === 1) setLoading(false)
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (_page === 1) setLoading(false)
        }
    }

    /* detail */
    const [isModalDetailVisible, setIsModalDetailVisible] = useState(false)
    const [tableDetailList, setTableDetailList] = useState([])
    const [transMonth, setTransMonth] = useState(null)
    const [LoadingDetail, setLoadingDetail] = useState(false)
    const [pageDetail, setPageDetail] = useState(1)
    const [totalDetail, setTotalDetail] = useState(0)
    const [limitDetail, setLimitDetail] = useState(10)

    const columnDetail = [
        {
            title: 'ลำดับ',
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: 100,
            render: (text, record, index) => {
                index += ((pageDetail - 1) * limitDetail)
                return index + 1
            },
        },
        {
            title: 'ADRegNo',
            dataIndex: 'ADRegNo',
            key: 'ADRegNo',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'CAI',
            dataIndex: 'CAI',
            key: 'CAI',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'ADCustomerName',
            dataIndex: 'ADCustomerName',
            key: 'ADCustomerName',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'DocType',
            dataIndex: 'DocType',
            key: 'DocType',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'InvoiceNo',
            dataIndex: 'InvoiceNo',
            key: 'InvoiceNo',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'ItemNo',
            dataIndex: 'ItemNo',
            key: 'ItemNo',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PartDesc',
            dataIndex: 'PartDesc',
            key: 'PartDesc',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'PartNumber',
            dataIndex: 'PartNumber',
            key: 'PartNumber',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },
        {
            title: 'Qty',
            dataIndex: 'Qty',
            key: 'Qty',
            width: 150,
            align: "center",
            render: (text, record) => text ?? "-",
        },

    ];


    const getDetail = async ({ TransMonth, RDSubCode = "A" }) => {
        try {
            setLoadingDetail(true)
            const res = await API.get(`/dealers/all?which=my data`);
            if (res.data.status = "success") {
                if (res.data.data.data.length > 0) {
                    const item = res.data.data.data[0]
                    const { data } = await API.get(`/webMax/GetSalesDetail?RDBusinessRegNo=${item.dealer_code_id}&RDSubCode=${RDSubCode}&TransMonth=${TransMonth}`)
                    console.log(`data`, data.data)
                    setTableDetailList(data.data)
                    setLoadingDetail(false)
                    setIsModalDetailVisible(true)
                } else {
                    setLoadingDetail(false)
                    message.warning("ไม่พบข้อมูล!!")
                }
            } else {
                setLoadingDetail(false)
                message.warning(res.data.data)
            }
        } catch (error) {
            setLoadingDetail(false)
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const handleDetailCancel = () => {
        setIsModalDetailVisible(false)
        setTableDetailList([])
    }


    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/template-ข้อมูลรายการขาย.xlsx', '_blank');
    }

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);
    const [form] = Form.useForm();
    const [loadingUpload, setLoadingUpload] = useState(false)

    const importExcel = () => {
        setIsModalImportVisible(true)
    }

    const handleImportOk = () => {
        if (fileImport) {
            form.submit()
        } else {
            message.warning("กรุณาเลือกไฟล์")
        }
    }

    const onFinish = async (value) => {
        try {
            if (fileImport) {
                setLoadingUpload(true)
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                const userAuth = cookies.get("userAuth");
                const token = userAuth.access_token

                /* import */
                let { RDBusinessRegNo, RDSubCode, TransDate } = value
                TransDate = moment(TransDate._d).format(TransDate._f)

                // console.log(`url`, `${process.env.NEXT_PUBLIC_APIURL}/webMax/SubmitSalesDetail/byfile?RDBusinessRegNo=${RDBusinessRegNo}&RDSubCode=${RDSubCode}&TransDate=${TransDate}`)
                const { data } = await axios({
                    method: "put",
                    url: `${process.env.NEXT_PUBLIC_APIURL}/webMax/SubmitSalesDetail/byfile?RDBusinessRegNo=${RDBusinessRegNo}&RDSubCode=${RDSubCode}&TransDate=${TransDate}`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "success") {
                    message.success("บันทึกสำเร็จ")
                    setLoadingUpload(false)
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        _page: page,
                        _search: search,
                    })
                } else {
                    setLoadingUpload(false)
                    message.error(data.data ?? 'มีบางอย่างผิดพลาด !!');
                }

            } else {
                setLoadingUpload(false)
                message.warning("กรุณาเลือกไฟล์")
            }
        } catch (error) {
            setLoadingUpload(false)
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const onFinishFailed = (error) => {
        setLoadingUpload(false)
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const handleImportCancel = () => {
        if (!loadingUpload) {
            form.resetFields()
            setIsModalImportVisible(false)
            setFileImportList([])
            setFileImport(null)
        }
    }

    const handleImportChange = (info) => {

        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        FileReaderExcel(file.originFileObj)
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

    const FileReaderExcel = (file) => {

        if (file) {
            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                let data = event.target.result;
                let workbook = XLSX.read(data, {
                    type: "binary"
                });

                // console.log(`workbook`, workbook)
                const SheetName = workbook.SheetNames[0]

                if (!workbook.Sheets[SheetName] || !workbook.Sheets[SheetName].B1) {
                    message.error("ไฟล์ไม่ถูกต้อง")
                    setFileImport(null);
                    setFileImportList([]);
                    return
                }

                if (!workbook.Sheets[SheetName].B1.v) message.warning("ข้อมูลไม่ถูกต้อง")
                else {
                    const RDBusinessRegNo = workbook.Sheets[SheetName].B1.v;
                    console.log(`RDBusinessRegNo`, RDBusinessRegNo)
                    // console.log(`  form.getFieldValue()`, form.getFieldValue())
                    form.setFieldsValue({
                        ...form.getFieldValue(),
                        RDBusinessRegNo,
                        RDSubCode: "A"
                    })
                }

            };
            fileReader.readAsBinaryString(file)
        }

    }

    return (
        <>
            <>
                <Row>
                    <Col span={24} style={{ display: 'inline', padding: 10 }}>
                        <Row>
                            <Col span={24} style={{ padding: 5 }} >
                                <h1 style={{ fontSize: 27 }}><TitlePage /></h1>
                            </Col>


                            <Col span={10} />
                            <Col span={6} style={{ padding: 5 }}>
                                <Search
                                    placeholder="ค้นหา"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onSearch={async (e) => {
                                        setPage(1)
                                        await getDataSearch({
                                            _page: 1,
                                            _search: e,
                                        });
                                    }}
                                    style={{ width: "100%" }}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </Col>

                            <Col span={2} style={{ padding: 5, textAlign: "center" }}>
                                <Button type="default" onClick={() => setIsModalDetailVisible(true)} >Sales Detail For WebMax</Button> {" "}
                            </Col>
                            <Col span={3} style={{ padding: 5, textAlign: "center" }}>
                                <Button type="default" onClick={downloadTemplate} >โหลด Template</Button> {" "}
                            </Col>
                            <Col span={2} style={{ padding: 5, textAlign: "center" }}>
                                <Button type="default" onClick={() => importExcel()} >Import Excel</Button> {" "}
                            </Col>
                            <Col span={1} style={{ padding: 5, textAlign: "center" }}>
                                <Tooltip placement="bottom" title={`ค่าเริ่มต้น`}>
                                    <Button type="default" onClick={reset}>
                                        <ReloadOutlined />
                                    </Button>
                                </Tooltip>
                            </Col>

                        </Row>


                        <Row>
                            <Col span={status === "management" ? 6 : 10} />
                            <Col span={2} style={{ padding: 5 }}>
                                <Select value={typeDate} style={{ width: "100%" }} onChange={(item) => setTypeDate(item)} >
                                    <Option value="date">วัน</Option>
                                    <Option value="month">เดือน</Option>
                                </Select>
                            </Col>

                            <Col span={4} style={{ padding: 5 }}>

                                {typeDate == "month" ?
                                    <DatePicker picker="month" style={{ width: "100%" }} onChange={async (value) => {
                                        // console.log(`value`, value)

                                        const monthDate = value.format('YYYY-MM')
                                        const _startDate = (`${monthDate}-01`);

                                        const daymoment = value.daysInMonth();
                                        const _endDate = `${monthDate}-${daymoment}`;

                                        setPage(1)
                                        await getDataSearch({
                                            _page: 1,
                                            _startDate,
                                            _endDate,
                                        });
                                    }} />
                                    :
                                    <RangePicker value={startDate && endDate ? [moment(startDate), moment(endDate)] : null} style={{ width: "100%" }} onChange={async (value) => {
                                        const _startDate = value ? moment(value[0]._d).format("YYYY-MM-DD") : null,
                                            _endDate = value ? moment(value[1]._d).format("YYYY-MM-DD") : null;
                                        setStartDate(_startDate)
                                        setEndDate(_endDate)
                                        setPage(1)
                                        await getDataSearch({
                                            _page: 1,
                                            _startDate,
                                            _endDate,
                                        });
                                    }} />
                                }
                            </Col>

                            {(status === "management") ?
                                <Col span={4} style={{ padding: 5 }}>

                                    <Search
                                        placeholder="ค้นหาด้วยชื่อตัวแทน"
                                        value={searchDealer}
                                        onChange={(e) => setSearchDealer(e.target.value)}
                                        onSearch={async (e) => {
                                            setPage(1)
                                            await getDataSearch({
                                                _page: 1,
                                                _searchDealer: e,
                                            });
                                        }}
                                        style={{ width: "100%" }}
                                        loading={loading}
                                        disabled={loading}
                                    />

                                </Col> : null}

                            <Col span={4} style={{ padding: 5 }}>
                                <Search
                                    placeholder="ค้นหาจากชื่อลูกค้า"
                                    value={searchCustomer}
                                    onChange={(e) => setSearchCustomer(e.target.value)}
                                    onSearch={async (e) => {
                                        setPage(1)
                                        await getDataSearch({
                                            _page: 1,
                                            _searchCustomer: e,
                                        });
                                    }}
                                    style={{ width: "100%" }}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </Col>

                            <Col span={4} style={{ padding: 5 }}>
                                <Search
                                    placeholder="ค้นหาจากชื่อสินค้า"
                                    value={searchProduct}
                                    onChange={(e) => setSearchProduct(e.target.value)}
                                    onSearch={async (e) => {
                                        setPage(1)
                                        await getDataSearch({
                                            _page: 1,
                                            _searchProduct: e,
                                        });
                                    }}
                                    style={{ width: "100%" }}
                                    loading={loading}
                                    disabled={loading}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Table dataSource={listSearchDataTable} columns={columns} rowKey={(row) => row.id} loading={loading} scroll={{ x: "100%", y: "100%" }} pagination={{
                            current: page,
                            total,
                            pageSize: limit,
                            showTotal: (total, range) => `ข้อมูล ${range[0]} - ${range[1]} ทั้งหมด ${total} รายการ`,
                            onChange: async (e, _limit) => {
                                setPage(e)
                                if (limit !== _limit) setLimit(_limit)
                                await getDataSearch({
                                    _page: e,
                                    _search: search,
                                    _limit,
                                });
                            }
                        }} />
                    </Col>
                </Row>

                {/* Import Modal */}
                <Modal
                    form={form}
                    maskClosable={false}
                    title={`Import`}
                    visible={isModalImportVisible}
                    onOk={handleImportOk}
                    onCancel={handleImportCancel}
                    footer={[
                        <Button key="back" onClick={handleImportCancel} loading={loadingUpload}>
                            ยกเลิก
                        </Button>,
                        <Button key="submit" type="primary" loading={loading} onClick={handleImportOk} loading={loadingUpload}>
                            ตกลง
                        </Button>,
                    ]}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 18 }}
                        layout="horizontal"
                        initialValues={{
                            TransDate: moment(new Date(), 'YYYYMMDD'),
                            RDSubCode: "A"
                        }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <Form.Item
                            name="RDBusinessRegNo"
                            label="RDBusinessRegNo"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="RDSubCode"
                            label="RDSubCode"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name="TransDate"
                            label="TransDate"
                            rules={[{ required: true, message: 'กรุณากรอกข้อมูล!' }]}
                        >
                            <DatePicker format={'YYYYMMDD'} width={"100%"} />
                        </Form.Item>

                        <Form.Item label="Import Excel"  >
                            <Upload
                                onChange={handleImportChange}
                                action={`${process.env.NEXT_PUBLIC_APIURL}/post`}
                                fileList={fileImportList}
                                multiple={false}
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            >
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                        </Form.Item>
                    </Form>
                </Modal>

                {/* Detail */}
                <Modal
                    form={form}
                    maskClosable={false}
                    title={`Sales Detail For WebMax`}
                    visible={isModalDetailVisible}
                    onCancel={handleDetailCancel}
                    width={"70%"}
                    footer={[]}
                    bodyStyle={{
                        maxHeight: 700,
                        overflowX: "auto"
                    }}
                >
                    <Row>
                        <Col span={12}>
                            <DatePicker picker="month" style={{ width: "100%", textAlign: "center" }} onChange={async (value) => {
                                const TransMonth = `FY${value.format('YYYY')}M${value.format('MM')}`
                                getDetail({ TransMonth })
                                setTransMonth(TransMonth)
                            }} disabled={LoadingDetail} />
                        </Col>
                        <Col span={1} />
                        <Col span={10} >
                            <Button type="default" onClick={() => {
                                getDetail({ TransMonth: transMonth })
                            }} loading={LoadingDetail}>ค้าหา</Button>
                        </Col>
                    </Row>
                    <br />
                    <Table dataSource={tableDetailList} columns={columnDetail} rowKey={(row) => row.id} loading={LoadingDetail} scroll={{ x: "100%", y: 450 }} pagination={{
                        current: pageDetail,
                        total: totalDetail,
                        pageSize: limitDetail,
                        showTotal: (total, range) => `ข้อมูล ${range[0]} - ${range[1]} ทั้งหมด ${total} รายการ`,
                        onChange: async (e, _limit) => {
                            setPageDetail(e)
                            if (limit !== _limit) setLimitDetail(_limit)
                        }
                    }} />

                </Modal>
            </>

            <style global>{`
               th {
                    text-align: center !important;
                }

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

export default ComponentsRoutesDealersSales
