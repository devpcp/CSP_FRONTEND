import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, message, Tooltip, Input, Modal, Form, Upload, DatePicker, Select } from 'antd';
import { ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import TitlePage from '../shares/TitlePage';
import { useSelector } from 'react-redux';
import SearchInput from '../shares/SearchInput'
import TableList from '../shares/TableList'


const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;
const cookies = new Cookies();

const ComponentsRoutesPointMovement = ({ status }) => {
    const [loading, setLoading] = useState(false);
    const { permission_obj } = useSelector(({ permission }) => permission);

    /* table */
    // const [search, setSearch] = useState("")
    const [searchDealer, setSearchDealer] = useState("")
    const [searchProduct, setSearchProduct] = useState("")
    const [searchCustomer, setSearchCustomer] = useState("")
    const [typeDate, setTypeDate] = useState("date")
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)

    // const [page, setPage] = useState(1)
    // const [total, setTotal] = useState(0)
    // const [limit, setLimit] = useState(10)
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    // const [sortOrder, setSortOrder] = useState("ascend")

    // useEffect(() => {
    //     getDataSearch({
    //         _page: page,
    //         _search: search,
    //     })
    // }, [])

    // useEffect(() => {
    //     setColumnsTable()
    // }, [page, sortOrder])

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
                title: 'ตัวแทน',
                dataIndex: 'Dealer',
                key: 'Dealer',
                width: 250,
                align: "center",
                render: (text, record) => text ? text.dealer_name ? text.dealer_name["th"] : "-" : "-",
            },
            {
                title: 'ชื่อร้านที่ได้รับ Points',
                dataIndex: 'Customer',
                key: 'Customer',
                width: 150,
                render: (text, record) => text ? text.customer_name ? text.customer_name["th"] : "-" : "-",
            },
            {
                title: 'กิจกรรมที่เกิดขึ้น',
                dataIndex: 'DealerPoint',
                key: 'DealerPoint',
                width: 250,
                render: (text, record) => text ? text.ActivityPoint ? text.ActivityPoint.name["th"] : "-" : "-",
            },
            {
                title: 'แต้มที่ได้รับ',
                dataIndex: 'DealerPoint',
                key: 'DealerPoint',
                width: 100,
                render: (text, record) => text ? text.point : "-",
            },
            {
                title: 'แต้มที่ถูกหัก',
                dataIndex: 'reward_use_point',
                key: 'reward_use_point',
                width: 100,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'Balance',
                dataIndex: 'balance_point',
                key: 'balance_point',
                width: 200,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'วันที่ได้รับแต้ม',
                dataIndex: 'balance_date',
                key: 'balance_date',
                width: 150,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },
        ];

        /* management */
        if (status === "management") {
            _column.push(
                {
                    title: 'ผู้สร้างข้อมูล',
                    dataIndex: 'created_by',
                    key: 'created_by',
                    width: 150,
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

    

    /* ค้นหา */
    // const getDataSearch = async ({ _search = search, _limit = limit, _page = 1, _sort = "master_customer_code_id", _order = sortOrder === "descend" ? "asc" : "desc", _which = (status === "management") ? "michelin data" : "my data" }) => {
        const getDataSearch = async ({ search =  modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/dealerPoint/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&which=${_which}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)
                setListSearchDataTable(data)
                // setTotal(totalCount);
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
            sort: "master_customer_code_id",
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
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            status: modelSearch.status,
        })
    }, [])

    useEffect(() => {
        if(permission_obj){
            permission_obj.create = 0,
            permission_obj.read = 0,
            permission_obj.update = 0,
            permission_obj.delete = 0,
            setColumnsTable()
        }
    }, [configTable.page, configSort.order,permission_obj])


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default" })
        getDataSearch({ search: value.search,page : init.configTable.page})
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
            // {
            //     index: 1,
            //     type: "select",
            //     name: "status",
            //     label: "เลือกสถานะ",
            //     placeholder: "เลือกสถานะ",
            //     list: [
            //         {
            //             key: "ค่าเริ่มต้น",
            //             value: "default",
            //         },
            //         {
            //             key: "สถานะปกติ",
            //             value: "active",
            //         },
            //         {
            //             key: "สถานะปิดกั้น",
            //             value: "block",
            //         },
            //         {
            //             key: "ถังขยะ",
            //             value: "delete",
            //         },
            //     ],
            // },
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
                {/* <Row>
                    <Col span={24} style={{ display: 'inline', padding: 10 }}>
                        <Row>
                            <Col span={24} style={{ padding: 5 }} >
                                <h1 style={{ fontSize: 27 }}><TitlePage /></h1>
                            </Col>

                            <Col span={17} />
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

                            <Col span={1} style={{ padding: 5, textAlign: "center" }}>
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
                </Row> */}

                <SearchInput configSearch={configSearch}  loading={loading}  />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch}  />


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

export default ComponentsRoutesPointMovement
