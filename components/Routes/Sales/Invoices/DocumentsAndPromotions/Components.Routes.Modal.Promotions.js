import { useEffect, useState } from 'react'
import { Button, Switch, Popconfirm, message, Tooltip, Input, Modal, Select, Form } from 'antd';
import { CheckCircleOutlined, StopOutlined, CloseCircleOutlined } from '@ant-design/icons';
import API from '../../../../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../../../shares/SearchInput'
import TableList from '../../../../shares/TableList'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../../../../shares/FormLanguage';
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import { isPlainObject } from 'lodash';


const Promotions = ({ icon, textButton, disabled }) => {
    const [loading, setLoading] = useState(false);

    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
    }, [])


    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("order"),
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
                title: GetIntlMessages("รายการโปรโมชั่น"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('text', text),
                render: (text, record) => text ? <Button type='link' onClick={() => selectedData(record)}>{text}</Button> : "-",
                // render: (text, record) => text ? text : "-",
            },
            {
                title: `${GetIntlMessages("สินค้าที่ได้แถม/แลกซื้อ/ส่วนลดได้รับ")}`,
                dataIndex: '',
                key: '',
                width: 250,
                render: (text, record) => _.get(text, `business_type_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
            {
                title: `${GetIntlMessages("จำนวน")}`,
                dataIndex: '',
                key: '',
                width: 250,
                render: (text, record) => _.get(text, `business_type_name[${locale.locale}]`, "-"),
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
            {
                title: `${GetIntlMessages("คำสั่ง")}`,
                dataIndex: '',
                key: '',
                width: 250,
                align: "center",
                render: (text, record) => <Button type='link' onClick={() => selectedData(record)}>เลือก</Button>,
                // render: (text, record) => text ? locale.locale == "th" ? text["th"] : text[locale.locale] : "-",
            },
        ];

        setColumns(_column)
    }

    const selectedData = (data) => {
        console.log('data', data)
    }


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            // const res = await API.get(`/master/vehicleType/all?search=${search}&sort=${sort}&order=${order}&status=${_status}`)
            const res = await API.get(`/master/businessType/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}`)
            if (res.data.status === "success") {
                // console.log('res', res)
                const { currentCount, currentPage, pages, totalCount, data, isuse } = res.data;
                // const { data,isuse } = res.data;
                // console.log(`data`, data)
                setListSearchDataTable(data.data)
                // setTotal(totalCount);
                // setConfigTable({ ...configTable, page: page,limit: limit,isuse: isuse })
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, isuse: isuse })
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

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/master/businessType/put/${id}`, { status })
            // console.log('data', data)
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status
                })
                setModelSearch({ status: modelSearch.status })
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/master/businessType/byid/${id}`)

                console.log('data addEditViewModal', data)
                if (data.status) {
                    const _model = data.data
                    console.log('_model', _model)
                    setCheckedIsuse(_model.isuse == 1 ? true : false)
                    // setClientSecret(_model.client_secret)
                    form.setFieldsValue(_model)
                }

            }
            // setUserList(await getUserListAll(mode == "add" ? true : false))
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }


    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        modeKey: null,
        overflowX: "auto",
    })

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        console.log('key', modeKey)
        setConfigModal({ ...configModal, modeKey })
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setClientSecret(null)
        setIsModalVisible(false)
        setConfigModal({ ...configModal, mode: "add" })
    }

    const callback = () => {
        message.success('บันทึกสำเร็จ');
        setIsModalVisible(false)
        form.resetFields()
        setClientSecret(null)
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
    }
    const onFinish = async (value) => {
        try {
            console.log(`value`, value)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    //เพิ่มมาใหม่
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
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: false
            },
            hide_manage: true
        },
        configSort: {
            sort: "code_id",
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

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, permission_obj, locale])


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        console.log('value', value)
        setModelSearch(value)
        getDataSearch({ search: value.search, _status: value.status })

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
            <>
                {/* <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={()=>addEditViewModal('add')} value={modelSearch} /> */}

                <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                    {isPlainObject(icon) ? icon : <img className={`cash-img-icon ${disabled ? "img-opacity-05" : ""}`} src={icon} />}
                    <span className='pt-1'>{textButton}</span>
                </Button>

                <ModalFullScreen
                    width={750}
                    maskClosable={false}
                    title={`${GetIntlMessages("โปรโมชั่นที่มีสิทธิได้รับ")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    hideSubmitButton
                // okButtonProps={{ disabled: true}}
                // className={`cash-modal`}
                >
                    <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                </ModalFullScreen>

            </>
        </>
    )
}

export default Promotions
