import { useState, useEffect } from 'react'
import { Input, Form, Tooltip, Button, Modal, message } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import moment from 'moment'
import { isFunction, isPlainObject } from 'lodash';
import API from '../../../../util/Api'
import TableList from '../../../shares/TableList'
import SearchInput from '../../../shares/SearchInput'
import GetIntlMessages from '../../../../util/GetIntlMessages';

/**
 * 
 * @param {object} obj 
 * @param {import('antd').FormInstance} obj.form 
 * @returns 
 */

/* get Master documentTypes */
// 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
// 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบส่งของชั่วคราว
// e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
// b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
// 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
const ComponentsRoutesModalSearchServicePlansAndInvoice = ({ mode, form, callback }) => {
    const [visible, setVisible] = useState(false);

    const openModal = async () => {
        try {
            setVisible(true)
            getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                _status: modelSearch.status,
            })
        } catch (error) {
            console.log('error', error)
        }
    }


    /* Table */
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
                status: false,
            }
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            doc_type_id: "67c45df3-4f84-45a8-8efc-de22fef31978",
        },
    }

    const [loading, setLoading] = useState(false);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [configTable, setConfigTable] = useState(init.configTable)
    const [configSort, setConfigSort] = useState(init.configSort)
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("ลำดับ"),
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
                title: () => GetIntlMessages("เลขที่ใบสั่งซ่อม"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
            },
            {
                title: () => GetIntlMessages("รหัสลูกค้า"),
                dataIndex: 'master_customer_code_id',
                key: 'master_customer_code_id',
                width: 150,
                align: "center",
                render: (text, record) => getCustomerDataTable(record, "code"),
            },
            {
                title: () => GetIntlMessages("ชื่อลูกค้า"),
                dataIndex: 'master_customer_code_id',
                key: 'master_customer_code_id',
                width: 250,
                // align: "center",
                render: (text, record) => getCustomerDataTable(record, "name"),
            },
            {
                title: () => GetIntlMessages("ประเภทลูกค้า"),
                dataIndex: 'master_customer_code_id',
                key: 'master_customer_code_id',
                width: 150,
                // align: "center",
                render: (text, record) => getCustomerDataTable(record, "type"),
            },
            {
                title: () => GetIntlMessages("เลขทะเบียน"),
                dataIndex: 'ShopVehicleCustomers',
                key: 'ShopVehicleCustomers',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text) ? text.details.registration : "-",
            },
            {
                title: () => GetIntlMessages("จำนวน"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.total_amount ?? "-" : "-",
            },
            {
                title: () => GetIntlMessages("ราคารวม"),
                dataIndex: 'details',
                key: 'details',
                width: 150,
                align: "center",
                render: (text, record) => isPlainObject(text.calculate_result) ? text.calculate_result.total_text ?? "-" : "-",
            },
            {
                title: () => GetIntlMessages("ออกใบเสร็จ"),
                dataIndex: 'created_date',
                key: 'created_date',
                width: 200,
                align: "center",
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
            },
            {
                title: () => GetIntlMessages("เลือก"),
                dataIndex: 'status',
                key: 'status',
                width: 150,
                fixed: 'right',
                align: 'center',
                render: (text, record) => <Button onClick={() => {
                    if (isFunction(callback) && text == 3) {
                        callback(record)
                        setVisible(false)
                    }
                }}>
                    เลือก
                </Button>,
            },
        ];

        setColumns(_column)
    }

    const getCustomerDataTable = (record, type) => {
        // ShopPersonalCustomers ลูกค้าบุคคลธรรมดา
        // ShopBusinessCustomers ลูกค้าธุรกิจ
        const { ShopPersonalCustomers, ShopBusinessCustomers } = record;
        const model = {
            code: null,
            type: null,
            name: null,
        };
        if (isPlainObject(ShopPersonalCustomers)) { //ลูกค้าบุคคลธรรมดา
            // console.log('ShopPersonalCustomers', ShopPersonalCustomers)
            const { first_name, last_name } = ShopPersonalCustomers.customer_name
            model.code = ShopPersonalCustomers.master_customer_code_id;
            model.name = first_name[locale.locale] + " " + last_name[locale.locale];
            model.type = "ลูกค้าบุคคลธรรมดา"
        } else if (isPlainObject(ShopBusinessCustomers)) { // ลูกค้าธุรกิจ
            model.code = ShopBusinessCustomers.master_customer_code_id;
            model.name = ShopBusinessCustomers.customer_name[locale.locale];
            model.type = "ลูกค้าธุรกิจ"
        } else {
            return "-";
        }

        return model[type] ?? "-"
    }


    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = 3 , doc_type_id = "b39bcb5d-6c72-4979-8725-c384c80a66c3" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopSalesTransactionDoc/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&doc_type_id=${doc_type_id}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log('data', data)
                setListSearchDataTable(data.filter(where => !where.details.full_invoice))
                // setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
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
                type: "select",
                name: "doc_type_id",
                label: GetIntlMessages("select-status"),
                placeholder: GetIntlMessages("select-status"),
                list: [
                    {
                        key: GetIntlMessages("สั่งของชั่วคราว"),
                        value: "67c45df3-4f84-45a8-8efc-de22fef31978",
                    },
                    {
                        key: GetIntlMessages("ใบเสร็จรับเงิน/ใบกำกับภาษี"),
                        value: "b39bcb5d-6c72-4979-8725-c384c80a66c3",
                    },
                ],
            },
            {
                index: 2,
                type: "input",
                name: "search",
                label: GetIntlMessages("search"),
                placeholder: GetIntlMessages("search"),
                list: null,
            },
        ],
        col: 8,
        button: {
            create: false,
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    const IsView = () => {
        const { status } = form.getFieldValue()
        return mode != "view" && (status != 3)
    }

    return (
        <>
            <Form
                form={form}
                className="pt-3"
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 18 }}
                layout={"vertical"}

            >
                <Form.Item
                    name="search_status_2"
                    label="เลือกใบสั่งของชั่วคราว หรือ ใบเสร็จรับเงิน/ใบกำกับภาษี"
                >
                    <Input disabled suffix={
                        IsView() ?
                            <>
                                <Tooltip title="เลือกใบสั่งของชั่วคราว หรือ ใบเสร็จรับเงิน/ใบกำกับภาษี">
                                    <Button icon={<FolderOpenOutlined />} onClick={openModal} />
                                </Tooltip>
                            </>
                            : ""
                    } />
                </Form.Item>
            </Form>

            <Modal
                className={"search-status-2"}
                maskClosable={false}
                visible={visible}
                onCancel={() => setVisible(false)}
                onOk={() => setVisible(false)}
                title="เลือกใบสั่งของชั่วคราว หรือ ใบเสร็จรับเงิน/ใบกำกับภาษี"
                footer={false}
                width={"75%"}
            >
                <SearchInput configSearch={configSearch} loading={loading} value={modelSearch} title={false} />
                <TableList
                    columns={columns}
                    data={listSearchDataTable}
                    loading={loading}
                    configTable={configTable}
                    callbackSearch={getDataSearch}
                />
            </Modal>
            <style jsx global>
                {`
                   .search-status-2 .ant-modal-close{
                        display: ${!visible ? "none" : "block"};
                    }
                    .search-status-2 .ant-modal-header {
                        padding: ${!visible ? "20px 30px 0px 30px" : "16px 24px"};
                        border-bottom: ${!visible ? "0px" : "1px"} solid #f0f0f0;
                    }
                `}
            </style>
        </>

    )
}

export default ComponentsRoutesModalSearchServicePlansAndInvoice