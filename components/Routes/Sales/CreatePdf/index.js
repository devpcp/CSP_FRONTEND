import React, { useState, useEffect } from 'react'
import { Form } from 'antd'
import { useSelector } from 'react-redux';
import { isPlainObject } from 'lodash';
import { CheckImage } from '../../../shares/FormUpload/API';
import Detail from './Detail'
import TablePrint from './TablePrint'
import Sum from './Sum'

const ComponentToPrint = React.forwardRef((props, ref) => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm()

    const [data, setData] = useState([])
    const [columns, setColumns] = useState([])
    const [ImgLogo, setImgLogo] = useState("")

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);

    const { tableData, docTypeId, size } = props

    useEffect(() => {
        console.log('props', [props.tableData])
        if (props.tableData && isPlainObject(props.tableData)) {

          
            setData(tableData.details.list_service_product)
        }

        setColumnsTable()
        checkLogo()
        // dataTable()
    }, [props.tableData])

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
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: false
            }
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "3",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    /* get Master documentTypes */
    // 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
    // 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบสั่งขาย
    // e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
    // b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
    // 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม

    const GetReportName = (docTypeId) => {
        switch (docTypeId) {
            case '67c45df3-4f84-45a8-8efc-de22fef31978':
                return "ใบสั่งขาย";
            case 'b39bcb5d-6c72-4979-8725-c384c80a66c3':
                return "ใบเสร็จอย่างย่อ";
            case '7ef3840f-3d7f-43de-89ea-dce215703c16':
                return "ใบสั่งซ่อม";
            default:
                return "";
        }

    }

    const setColumnsTable = () => {
        const _column = [
            {
                title: '#',
                dataIndex: 'num',
                align: "center",
                width: "5%",
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
        ];

        switch (docTypeId) {
            case "67c45df3-4f84-45a8-8efc-de22fef31978":
                _column.push(
                    {
                        title: 'รายละเอียด',
                        dataIndex: "",
                        key: "",
                        width: "50%",
                        // align: "center",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'จำนวน',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        // align: "center",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'ราคาต่อหน่วย',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        // align: "center",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'ส่วนลด',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        // align: "center",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'มูลค่า',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        // align: "center",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                )
                break;
            case "7ef3840f-3d7f-43de-89ea-dce215703c16":
                _column.push(
                    {
                        title: 'รหัสสินค้า',
                        dataIndex: "",
                        key: "",
                        width: "10%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'รายการ',
                        dataIndex: "",
                        key: "",
                        width: "30%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'จำนวน',
                        dataIndex: "",
                        key: "",
                        width: "5%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'หน่วย',
                        dataIndex: "",
                        key: "",
                        width: "5%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'ราคา/หน่วย',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'ส่วนลด',
                        dataIndex: "",
                        key: "",
                        width: "15%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'จำนวนเงิน',
                        dataIndex: "",
                        key: "",
                        width: "20%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },

                )
                break;
            case "b39bcb5d-6c72-4979-8725-c384c80a66c3":
                _column.push(
                    {
                        title: 'รายละเอียด',
                        dataIndex: "",
                        key: "",
                        width: "50%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                    {
                        title: 'ยอดมัดจำ',
                        dataIndex: "",
                        key: "",
                        width: "30%",
                        render: (text, record) => { console.log("รายละเอียด", text) },
                    },
                  
                    
                )
                break;
            default:
                break;
        }
        setColumns(_column)
    }

    const checkLogo = async () => {
        try {
            const urlImg = await CheckImage({
                directory: "profiles",
                name: authUser.id,
                fileDirectoryId: authUser.id,
            })
            setImgLogo(urlImg)
        } catch (error) {

        }
    }

    return (
        <div ref={ref}>
            <html>
                <body>
                    <div class="page-header" style={{ paddingBottom: '100px' }}>
                        <Detail props={props} ImgLogo={ImgLogo} mainColor={mainColor} locale={locale} authUser={authUser} ReportName={GetReportName(props.docTypeId)} />
                    </div>
                    <div class="page-footer"></div>
                    <table>
                        <thead>
                            <tr>
                                <td>
                                    <div class="page-header-space"></div>
                                </td>
                            </tr>
                        </thead>
                        <tbody class="report-content">
                            <tr>
                                <td>
                                    <div class="page" >
                                        <TablePrint columns={columns} dataSource={data} docTypeId={docTypeId} />
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <Sum props={props} mainColor={mainColor} locale={locale} authUser={authUser} docTypeId={docTypeId} />
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td>
                                    <div class="page-footer-space">
                                    </div>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </body>
            </html>
        </div>
    )
});


export default ComponentToPrint;