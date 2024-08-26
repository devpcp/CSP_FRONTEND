import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Switch, Transfer, Upload } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined, PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import axios from 'axios';
import { Cookies } from "react-cookie";
import { useSelector } from 'react-redux';
import _, { constant, get, isArray, isPlainObject, debounce } from 'lodash'
import TitlePage from '../shares/TitlePage';
import SearchInput from '../shares/SearchInput'
import TableList from '../shares/TableList'
import ModalFullScreen from '../shares/ModalFullScreen';
import ShopHqModal from '../Routes/MasterLookUp/Components.Modal.ShopHq.js';
import GetIntlMessages from '../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../shares/FormLanguage';
import SortingData from '../shares/SortingData';
import Swal from 'sweetalert2';

const cookies = new Cookies();
const { Search } = Input;

const ComponentsRoutesShopHq = ({ status }) => {
    const [loading, setLoading] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)



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
                title: 'Code Id',
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                render: (text, record) => <div style={{ textAlign: "start" }}>{text ?? "-"}</div>,
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "code_id" ? configSort.order : true,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                page: configTable.page,
                                search: modelSearch.search,
                                sort: "code_id",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            setConfigSort({ sort: "code_id", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
            },
            {
                title: 'ชื่อ HQ',
                dataIndex: 'hq_name',
                key: 'hq_name',
                width: 300,
                render: (text, record) => text ? text[locale.locale] : "-",
            },
            {
                title: 'user',
                dataIndex: 'UsersProfiles',
                key: 'UsersProfiles',
                width: 300,
                render: (text, record) => text ? text.map(el => { return el.User.user_name}).join(" , ") : "-",

            },
        ];

        setColumns(_column)
    }


    /* ค้นหา */
    // const getDataSearch = async ({ _search = "", _limit = limit, _page = 1, _sort = "product_name.th", _order = sortOrder === "descend" ? "desc" : "asc", _status = "default", _which = (status === "management") ? "michelin data" : "my data" }) => {
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status}) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopHq/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`)
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

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/shopHq/put/${id}`, { status })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                setModelSearch({ ...modelSearch})
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status,
                })
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
            console.log('error :>> ', error);
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            // setMode(_mode)
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(()=>id)
                const { data } = await API.get(`/shopHq/byid/${id}`)
                if (data.status === "success") {
                    const _model = data.data
                    setCheckedIsuse(()=>_model.isuse)
                    const newUserList = _model?.UsersProfiles.map(e => { return { id :e.user_id , user_name : e.User.user_name}}) ?? []
                    _model.user_id = newUserList.map(e => e.id) ?? []
                    _model.shop_id = _model?.ShopsProfiles.map(e => e.id) ?? []
                    setUserList(()=>newUserList)
                    setShopList(()=>_model?.ShopsProfiles)
                    form.setFieldsValue(_model)
                }else{
                    Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่','','error')
                }
                // console.log('form.getFieldValue()', form.getFieldValue())
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
        modeKey: null,
        overflowX: "auto",
    })
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = (modeKey) => {
        form.submit()
        setConfigModal({ ...configModal, modeKey })
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
        setUserList(()=>[])
        setShopList(()=>[])
        setConfigModal({ ...configModal, mode: "add" })
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)

            const _model = {
                internal_code_id: value.internal_code_id,
                hq_name: value.hq_name,
                user_id : !!value.user_id ? value.user_id ?? [] : [],
                shop_id : !!value.shop_id ? value.shop_id ?? [] : []
            }


            // console.log(`_model`, _model)
            let res
            if (configModal.mode === "add" ) {
                res = await API.post(`/shopHq/add`, _model)
            }  else if (configModal.mode === "edit") {
                _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/shopHq/put/${idEdit}`, _model)
            }

            if (res.data.status === "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(!isModalVisible)
                // setMode("add")
                form.resetFields()

                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                });
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

            // if (configModal.modeKey == 1) {
            //     form.resetFields()
            //     setConfigModal({ ...configModal, mode: 'add', modeKey: null })
            //     getDataSearch({
            //         page: configTable.page,
            //         search: modelSearch.search,
            //         _status: modelSearch.status,
            //     })
            //     addEditViewModal("add")
            // } else if (configModal.modeKey == 2) {
            //     handleCancel()
            // } else if (configModal.modeKey == 0) {
            //     setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
            //     getDataSearch({
            //         page: configTable.page,
            //         search: modelSearch.search,
            //         _status: modelSearch.status,
            //     })
            //     addEditViewModal("edit", res.data.data.id)
            // }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    /* master */
    const [productTypeList, setProductTypeList] = useState([])


    const getMasterData = async () => {
        try {
            setProductTypeList(await getProductTypeListAll()) // สินค้าประเภท

        } catch (error) {

        }
    }

    /* เรียกข้อมูล สินค้าประเภท ทั้งหมด */
    const getProductTypeListAll = async () => {
        const { data } = await API.get(`/productType/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
        return data.data
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
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: true
            }
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
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            status: modelSearch.status,
        })
        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()
    }, [configTable.page, configSort.order, permission_obj])




    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status })
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
                        key: "สถานะปกติ",
                        value: "active",
                    },
                    {
                        key: "สถานะปิดกั้น",
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
        button: {
            download: false,
            import: false,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
    }

    const [userList, setUserList] = useState([])
    const [shopList, setShopList] = useState([])
    const debounceOnSearch = debounce((value,type) => handleSearchProduct(value,type), 800)

    const handleSearchProduct = async (value,type) => {
        try {
            setLoadingSearch(()=>true)
            let res
            switch (type) {
                case "user_list":
                    res = await API.get(`/user/all?search=${value}&limit=50&page=1&sort=user_name&order=desc&status=active&selectInAuth=false`);
                    // console.log('data :>> ', data.data.data);
                    if(res.data.status === "success"){
                        const newData = SortingData(res.data.data.data, `user_name`)
                        setUserList(()=>[...newData])
                    }
                    break;
                case "shop_list":
                    res = await API.get(`/shopsProfiles/all?search=${value}&limit=50&page=1&sort=shop_name.th&order=desc&status=active&byHq=false`);
                    // console.log('data :>> ', data.data.data);
                    if(res.data.status === "success"){
                        const newData = SortingData(res.data.data.data, `shop_name.${locale.locale}`)
                        setShopList(()=>[...newData])
                    }
                    break;
            
                default:
                    break;
            }
           
            setLoadingSearch(()=>false)
        } catch (error) {
            console.log('error :>> ', error);
        }

    
    }


    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch}/>
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />


                {/* Modal Form */}
                <Modal
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("Shop HQ")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    // okButtonDropdown
                >

                    <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <FormSelectLanguage config={{
                            form,
                            field: ["hq_name"],
                        }} onChange={(value) => setFormLocale(value)} />

                         <Form.Item label={GetIntlMessages("รหัสภายใน")} name="internal_code_id">
                            <Input disabled={configModal.mode === "view"}/>
                        </Form.Item>


                        <FormInputLanguage icon={formLocale} label={GetIntlMessages("name")} name="hq_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} disabled={configModal.mode === "view"}/>

                        <Form.Item label={GetIntlMessages("ร้าน")} name="shop_id" extra={GetIntlMessages("พิมพ์ 1 ตัวเพื่อค้นหาร้าน (ร้านแรกที่เลือกจะเป็น HQ)")}>
                            <Select 
                            mode="multiple" 
                            onSearch={(value)=>debounceOnSearch(value,"shop_list")}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            notFoundContent={loadingSearch ? `กำลังโหลดข้อมูล..กรุณารอสักครู่` : null}
                            disabled={configModal.mode === "view"}
                            allowClear
                            >
                                {
                                    shopList.map((e,index)=>(<Select.Option key={`shop-id-${index}`} value={e.id}>{e.shop_name[locale.locale]}</Select.Option>))
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item label={GetIntlMessages("ผู้ใช้งาน")} name="user_id" extra={GetIntlMessages("พิมพ์ 1 ตัวเพื่อค้นหาผู้ใช้งาน")}>
                            <Select 
                            mode="multiple" 
                            onSearch={(value)=>debounceOnSearch(value,"user_list")}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            notFoundContent={loadingSearch ? `กำลังโหลดข้อมูล..กรุณารอสักครู่` : null}
                            disabled={configModal.mode === "view"}
                            allowClear
                            >
                                {
                                    userList.map((e,index)=>(<Select.Option key={`user-id-${index}`} value={e.id}>{e.user_name}</Select.Option>))
                                }
                            </Select>
                        </Form.Item>
                        

                        {configModal.mode !== "add" ?
                            <Form.Item name="isuse" label="สถานะ" >
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item> : null
                        }
                    </Form>
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

export default ComponentsRoutesShopHq
