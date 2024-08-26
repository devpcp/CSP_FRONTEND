import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Switch, Transfer, Upload } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined, PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import { Cookies } from "react-cookie";
import axios from 'axios';
import { useSelector } from 'react-redux';
import TitlePage from '../../components/shares/TitlePage'
import SearchInput from '../shares/SearchInput'
import TableList from '../shares/TableList'

const { Search } = Input;
const cookies = new Cookies();

const CustomersIndex = ({ status }) => {
    const [loading, setLoading] = useState(false);
    // const [mode, setMode] = useState("add")

    /* table */
    // const [search, setSearch] = useState("")
    // const [page, setPage] = useState(1)
    // const [total, setTotal] = useState(0)
    // const [limit, setLimit] = useState(10)
    // const [sort, setSort] = useState("master_customer_code_id")
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    // const [sortOrder, setSortOrder] = useState("ascend")
    const { permission_obj } = useSelector(({ permission }) => permission);

    // useEffect(() => {            =>ย้ายไปบรรทัดที่ 725
    //     getDataSearch({
    //         page: configTable.page,
    //         search: search,
    //     })
    //     getMasterData()
    // }, [])

    // useEffect(() => {            =>ย้ายไปบรรทัดที่ 733
    //     if (permission_obj)
    //         setColumnsTable()
    // }, [configTable.page, sortOrder, permission_obj])


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
                title: 'รหัส AD Code',
                dataIndex: 'master_customer_code_id',
                key: 'master_customer_code_id',
                width: 150,
                align: "center",
                render: (text, record) => text ?? "-",
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "master_customer_code_id" ? configSort.order : false,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                page: configTable.page,
                                search: modelSearch.search,
                                sort: "master_customer_code_id",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            // setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
                            // setSort("master_customer_code_id")
                            setConfigSort({ sort: "master_customer_code_id", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                            
                        }
                    };
                }
            },
            {
                title: 'Tax ID',
                dataIndex: 'dealer_customer_code_id',
                key: 'dealer_customer_code_id',
                width: 150,
                align: "center",
                render: (text, record) => text ?? "-",
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "dealer_customer_code_id" ? configSort.order : false,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                page: configTable.page,
                                search: modelSearch.search,
                                sort: "dealer_customer_code_id",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            // setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
                            // setSort("dealer_customer_code_id")
                            setConfigSort({ sort: "dealer_customer_code_id", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
            },
            {
                title: 'ประเภทธุรกิจ',
                dataIndex: 'BusinessType',
                key: 'BusinessType',
                width: 100,
                render: (text, record) => text ? text.business_type_name["th"] : "-",
            },
            {
                title: 'ชื่อ',
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 200,
                render: (text, record) => text ? text["th"] : "-",
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "customer_name.th" ? configSort.order : false,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                page: configTable.page,
                                search:  modelSearch.search,
                                sort: "customer_name.th",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            // setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
                            // setSort("customer_name.th")
                            setConfigSort({ sort: "customer_name.th", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
            },
            {
                title: 'เบอร์โทรพื้นฐาน',
                dataIndex: 'tel_no',
                key: 'tel_no',
                width: 200,
                render: (text, record) => {
                    if (text) {
                        const arr = []
                        for (const [key, value] of Object.entries(text)) {
                            if (value) arr.push(value)
                        }
                        return arr.length <= 0 ? "-" : arr.toString()
                    } else return "-"

                },
            },
            {
                title: 'เบอร์มือถือ',
                dataIndex: 'mobile_no',
                key: 'mobile_no',
                width: 200,
                render: (text, record) => {
                    if (text) {
                        const arr = []
                        for (const [key, value] of Object.entries(text)) {
                            if (value) arr.push(value)
                        }
                        return arr.length <= 0 ? "-" : arr.toString()
                    } else return "-"

                },
            },
            {
                title: 'E-Mail',
                dataIndex: 'e_mail',
                key: 'e_mail',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ทีอยู่',
                dataIndex: 'address',
                key: 'address',
                width: 300,
                render: (text, record) => text ? text["th"] : "-",
            },
            {
                title: 'แขวง/ตำบล',
                dataIndex: 'SubDistrict',
                key: 'SubDistrict',
                width: 150,
                render: (text, record) => text ? text["name_th"] : "-",
            },
            {
                title: 'เขต/อำเภอ',
                dataIndex: 'District',
                key: 'District',
                width: 150,
                render: (text, record) => text ? text["name_th"] : "-",
            },
            {
                title: 'จังหวัด',
                dataIndex: 'Province',
                key: 'Province',
                width: 150,
                render: (text, record) => text ? text["prov_name_th"] : "-",
            },
            {
                title: 'ชื่อติดต่อ',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text ? text["contact_name"] : "-",
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
                {
                    title: 'ผู้ปรับปรุงข้อมูล',
                    dataIndex: 'updated_by',
                    key: 'updated_by',
                    width: 150,
                    render: (text, record) => text ? text : "-",
                },
                {
                    title: 'วันที่ปรับปรุง',
                    dataIndex: 'updated_date',
                    key: 'updated_date',
                    width: 150,
                    render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
                },
                {
                    title: 'สถานะ',
                    dataIndex: 'isuse',
                    key: 'isuse',
                    width: 100,
                    render: (item, obj, index) => (
                        <>
                            {item == 0 ? (

                                <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                            ) : item == 1 ? (

                                <Tooltip placement="bottom" title={`สถานะปกติ`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} onConfirm={() => changeStatus(0, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                            ) : item == 2 ? (

                                <Tooltip placement="bottom" title={`ถังขยะ`}>
                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} onConfirm={() => changeStatus(1, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
                                        <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                    </Popconfirm>
                                </Tooltip>

                            ) : null}
                        </>
                    )
                },
            )

        }
        // console.log(`permission_obj =>>>>>>>>>>ิ`, permission_obj)

        // if (permission_obj.read || permission_obj.update || permission_obj.delete) {
        //     /* จัดการ */
        //     _column.push(
        //         {
        //             title: 'จัดการ',
        //             dataIndex: 'count_user',
        //             key: 'count_user',
        //             fixed: 'right',
        //             width: 200,
        //             render: (item, obj, index) => (
        //                 <>
        //                     {permission_obj.read ? <Button type="link" onClick={() => addEditViewModal("view", obj.id)}><EyeOutlined style={{ fontSize: 23, color: 'gray' }} /></Button> : null}

        //                     {obj.status != 2 ?
        //                         <>
        //                             {permission_obj.update ? <Button type="link" onClick={() => addEditViewModal("edit", obj.id)}><EditOutlined style={{ fontSize: 23, color: 'blue' }} /></Button> : null}
        //                             {(status === "management" || (permission_obj.delete)) ?
        //                                 <Popconfirm Popconfirm placement="top" title={"ยืนยันการลบข้อมูล !?"} onConfirm={() => changeStatus(2, obj.id)} okText="ตกลง" cancelText="ยกเลิก">
        //                                     <Button type="link"><DeleteOutlined style={{ fontSize: 23, color: 'red' }} /></Button>
        //                                 </Popconfirm> : null}
        //                         </> : null
        //                     }
        //                 </>
        //             )
        //         }
        //     )
        // }


        setColumns(_column)
    }

    /* ค่าเริ่มต้น */
    const reset = async () => {
        const _page = 1, _search = "", _sort = "master_customer_code_id";
        setPage(_page)
        setSearch(_search)
        setSort(_sort)
        await getDataSearch({ _page, _search })
    }

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order =(configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/customer/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&which=${_which}`)
            if (res.data.status === "success") {
                console.log(`page`, page)
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                console.log(`res.data`, res.data)
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
            const { data } = await API.put(`/customer/put/${id}?which=${status === "management" ? "michelin data" : "my data"}`, { status })
            if (data.status != "successful") {
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
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/customer/byid/${id}`)
                if (data.status) {
                    const _model = data.data[0]
                    console.log(`_model`, _model)
                    _model.tel_no = _model.tel_no ?? {}
                    _model.mobile_no = _model.mobile_no ?? {}
                    _model.isuse = _model.isuse == 1 ? true : false
                    setCheckedIsuse(_model.isuse)

                    /* ตัวแทนจำหน่วยที่ลูกค้าสั่งสินค้า */
                    _model.Dealers = _model.Dealers ? _model.Dealers.map(e => e.id) : []
                    setTargetKeys(_model.Dealers)


                    _model.customer_name = _model.customer_name ? _model.customer_name["th"] : null
                    _model.address = _model.address ? _model.address["th"] : null
                    _model.other_details = _model.other_details ? _model.other_details["contact_name"] : null



                    if (_model.province_id) await handleProvinceChange(_model.province_id)
                    if (_model.district_id) await handleDistrictChange(_model.district_id)

                    if (_model.tel_no) {
                        _model.tel_no = Object.entries(_model.tel_no).map((e) => ({ tel_no: e[1] }));
                        // await setTelNo([..._model.tel_no])
                    }
                    //จัด object mobile_no ใหม่
                    if (_model.mobile_no) {
                        _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({ mobile_no: e[1] }));
                        // await setMobileNo([..._model.mobile_no])
                    }


                    form.setFieldsValue(_model)
                }

            }
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }

    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/template-ข้อมูลลูกค้าของฉัน.xlsx', '_blank');
    }

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);

    const importExcel = () => {
        setIsModalImportVisible(true)
    }

    const handleImportOk = async () => {
        try {
            if (fileImport) {
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                const userAuth = cookies.get("userAuth");
                const token = userAuth.access_token
                const { data } = await axios({
                    method: "post",
                    url: `${process.env.NEXT_PUBLIC_APIURL}/macthCustomer/addbyfile`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "successful") {
                    message.success("บันทึกสำเร็จ")
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                    })
                } else {
                    message.error(data.data ?? 'มีบางอย่างผิดพลาด !!');
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
        let fileList = [...info.fileList];
        // 1. Limit the number of uploaded files
        // Only to show two recent uploaded files, and old ones will be replaced by the new
        fileList = fileList.slice(-1);

        if (fileList.length > 0) {
            const infoFileList = fileList[0];
            if (infoFileList.status === "done") {
                fileList = fileList.map((file) => {
                    if (file.response) {
                        console.log(`file`, file)
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


    /* Modal */
    const [configModal, setConfigModal] = useState({
        mode: "add",
        maxHeight: 600,
        overflowX: "auto",
    })
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setTargetKeys([])
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            console.log(`value`, value)

            const _model = {
                dealer_customer_code_id: value.dealer_customer_code_id,
                bus_type_id: value.bus_type_id ?? null,
                customer_name: {
                    th: value.customer_name ?? null,
                    en: null
                },
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                address: {
                    th: value.address,
                    en: null
                },
                subdistrict_id: value.subdistrict_id ?? null,
                district_id: value.district_id ?? null,
                province_id: value.province_id ?? null,
                other_details: {
                    contact_name: value.other_details ?? null
                },
                isuse: 1
            }
            if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            else value.mobile_no = []

            if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            else value.tel_no = []

            _model.dealer_id = targetKeys
            let res
            if (configModal.mode === "add") {
                _model.master_customer_code_id = ""
                res = await API.post(`/customer/add?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            } else if (configModal.mode === "edit") {
                _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/customer/put/${idEdit}?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            }
            if (res.data.status == "successful") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(!isModalVisible)
                setMode("add")
                setTargetKeys([])
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
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    /* master */
    const [businessTypeList, setBusinessTypeList] = useState([])
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const [dealersList, setDealersList] = useState([])

    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const businessTypeDataList = await getBusinessTypeDataListAll()
            setBusinessTypeList(businessTypeDataList)

            /* จังหวัด */
            const provinceDataList = await getProvinceDataListAll()
            setProvinceList(provinceDataList)

            /* ตัวแทนจำหน่วยที่ลูกค้าสั่งสินค้า */
            const dealersDataList = await getDealersListAll()
            setDealersList(dealersDataList.data.map(e => {
                return {
                    key: e.id,
                    title: e.dealer_name["th"],
                }
            }))

        } catch (error) {

        }
    }


    const handleProvinceChange = async (value) => {
        const DistrictDataList = await getDistrictDataListAll(value)
        setDistrictList(DistrictDataList)
        form.setFieldsValue({ district_id: null });
        form.setFieldsValue({ subdistrict_id: null });
    };
    const handleDistrictChange = async (value) => {
        const SubDistrictDataList = await getSubDistrictDataListAll(value)
        setSubdistrictList(SubDistrictDataList)
        form.setFieldsValue({ subdistrict_id: null });

    };

    /* เรียกข้อมูล ตัวแทนจำหน่วยที่ลูกค้าสั่งสินค้า ทั้งหมด */
    const getDealersListAll = async () => {
        const { data } = await API.get(`/dealers/all?limit=999999&page=1&sort=dealer_name.th&order=desc&status=active&which=${(status === "management") ? "michelin data" : "my data"}`)
        return data.data
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล Province ทั้งหมด */
    const getProvinceDataListAll = async () => {
        const { data } = await API.get(`/master/province?sort=prov_name_th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล District ทั้งหมด */
    const getDistrictDataListAll = async (province_id) => {
        const { data } = await API.get(`/master/district?sort=name_th&order=asc&province_id=${province_id}`)
        return data.data
    }

    /* เรียกข้อมูล SubDistrict ทั้งหมด */
    const getSubDistrictDataListAll = async (district_id) => {
        const { data } = await API.get(`/master/subDistrict?sort=name_th&order=asc&district_id=${district_id}`)
        return data.data
    }

    /* Transfer  */
    const [selectedKeys, setSelectedKeys] = useState([]); //ซ้าย
    const [targetKeys, setTargetKeys] = useState([]); //ขวา

    const onChange = (nextTargetKeys, direction, moveKeys) => {
        // console.log('targetKeys:', nextTargetKeys);
        // console.log('direction:', direction);
        // console.log('moveKeys:', moveKeys);
        setTargetKeys(nextTargetKeys);
    };

    const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
        // console.log('sourceSelectedKeys:', sourceSelectedKeys);
        // console.log('targetSelectedKeys:', targetSelectedKeys);
        setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
    };

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
            _status : modelSearch.status,
        })
        
        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()
            
    }, [configTable.page,  configSort.order,configSort.sort, permission_obj])



    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        
        setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default" })
        getDataSearch({ search: value.search, _status: value.status ,page : init.configTable.page})
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
            download: status === 'management'? false :true,
            import: status === 'management'? false :true,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        downloadTemplate,
        importExcel,
    }
    const onCreate =()=>{
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
    }

    return (
        <>

            <>
            <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => onCreate()} />
            <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch}  addEditViewModal={addEditViewModal} changeStatus={changeStatus}/>


                <Modal
                    width={650}
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ลูกค้าภายใต้ร้านค้าตัวแทน`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    bodyStyle={{
                        maxHeight: 600,
                        overflowX: "auto"
                    }}
                >
                    <Form

                        form={form}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        {configModal.mode != "add" ?
                            <Form.Item
                                name="master_customer_code_id"
                                type="text"
                                label="รหัส AD"
                                rules={[
                                    {
                                        pattern: /^[a-zA-Z0-9]|(_(?!(\.|_))|\.(?!(_|\.))[a-zA-Z0-9]){6,18}$/,
                                        message: 'Please only English',
                                    }
                                ]}
                            >
                                <Input disabled={true} />
                            </Form.Item> : null}


                        <Form.Item
                            name="dealer_customer_code_id"
                            label="Tax ID"
                        >
                            <Input disabled={configModal.mode == "view"} />
                        </Form.Item>

                        <Form.Item name="bus_type_id" label="ประเภทธุรกิจ" >
                            <Select
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled={configModal.mode == "view"}
                            >
                                {businessTypeList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.business_type_name["th"]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="customer_name"
                            label="ชื่อ"
                            rules={[{ required: true, message: "กรุณาใส่อีเมล์ของคุณ" },]}
                        >
                            <Input disabled={configModal.mode == "view"} />
                        </Form.Item>


                        <Form.Item
                            label="เบอร์โทรศัพท์พื้นฐาน"
                            name="tel_no"
                        >
                            <Form.List name="tel_no">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Form.Item
                                                required={false}
                                                key={field.key}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                    name={[field.name, "tel_no"]}
                                                    fieldKey={[field.fieldKey, "tel_no"]}
                                                    // rules={[
                                                    //     {
                                                    //         required: true,
                                                    //         whitespace: true,
                                                    //         message: "กรุณากรอกเบอร์โทรศัพท์พื้นฐาน",
                                                    //     },
                                                    // ]}
                                                    noStyle
                                                >
                                                    <Input placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" disabled={configModal.mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                                </Form.Item>
                                                {fields.length > 1 && configModal.mode != "view" ? (
                                                    <MinusCircleOutlined
                                                        className="dynamic-delete-button"
                                                        onClick={() => remove(field.name)}
                                                    />
                                                ) : null}
                                            </Form.Item>
                                        ))}
                                        <Form.Item>
                                            {configModal.mode != "view" ?
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    เบอร์โทรศัพท์พื้นฐาน
                                                </Button> : null
                                            }

                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>

                        <Form.Item
                            label="เบอร์โทรศัพท์มือถือ"
                            name="mobile_no"
                        >
                            <Form.List name="mobile_no" >
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Form.Item
                                                required={false}
                                                key={field.key}
                                            >
                                                <Form.Item
                                                    {...field}
                                                    validateTrigger={['onChange', 'onBlur']}
                                                    name={[field.name, "mobile_no"]}
                                                    fieldKey={[field.fieldKey, "mobile_no"]}
                                                    // rules={[
                                                    //     {
                                                    //         required: true,
                                                    //         whitespace: true,
                                                    //         message: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
                                                    //     },
                                                    // ]}
                                                    noStyle
                                                >
                                                    <Input placeholder="กรอกเบอร์โทรศัพท์มือถือ" disabled={configModal.mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                                </Form.Item>
                                                {fields.length > 1 && configModal.mode != "view" ? (
                                                    <MinusCircleOutlined
                                                        className="dynamic-delete-button"
                                                        onClick={() => remove(field.name)}
                                                    />
                                                ) : null}
                                            </Form.Item>
                                        ))}
                                        <Form.Item>
                                            {configModal.mode != "view" ?
                                                <Button
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    เบอร์โทรศัพท์มือถือ
                                                </Button> : null
                                            }
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>
                        </Form.Item>

                        <Form.Item
                            name="e_mail"
                            label="E-mail"
                            rules={[{
                                pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                message: 'Please only English',
                            }]}
                        >
                            <Input disabled={configModal.mode == "view"} />
                        </Form.Item>

                        <Form.Item
                            name="address"
                            label="ที่อยู่"

                        >
                            <Input.TextArea disabled={configModal.mode == "view"} />
                        </Form.Item>

                        <Form.Item name="province_id" label="จังหวัด" >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                disabled={configModal.mode == "view"}
                                onChange={handleProvinceChange}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {provinceList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.prov_name_th}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="district_id" label="เขต/อำเภอ" >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                disabled={configModal.mode == "view"}
                                onChange={handleDistrictChange}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {districtList != null ? districtList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.name_th}
                                    </Select.Option>
                                )) : null}
                            </Select>
                        </Form.Item>

                        <Form.Item name="subdistrict_id" label="แขวง/ตำบล" >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                disabled={configModal.mode == "view"}
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {subdistrictList != null ? subdistrictList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.name_th}
                                    </Select.Option>
                                )) : null}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="other_details"
                            label="ชื่อสำหรับติดต่อ"
                        >
                            <Input disabled={configModal.mode == "view"} />
                        </Form.Item>


                        {configModal.mode !== "add" && status === "management" ?
                            <Form.Item name="isuse" label="สถานะ" >
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item> : null
                        }
                        <br />

                        {(status === "management") ? (
                            <>

                                <div >
                                    <label>ตัวแทนจำหน่วยที่ลูกค้าสั่งสินค้า</label>
                                    <Transfer
                                        disabled={configModal.mode == "view"}
                                        dataSource={dealersList}
                                        titles={['ข้อมูล', 'เลือก']}
                                        targetKeys={targetKeys}
                                        selectedKeys={selectedKeys}
                                        render={item => item.title}
                                        onChange={onChange}
                                        onSelectChange={onSelectChange}
                                        pagination={{ pageSize: 10 }}
                                        listStyle={{ width: "100%" }}
                                        selectAllLabels={[
                                            ({ selectedCount, totalCount }) => (
                                                <span>
                                                    {selectedCount ? `${selectedCount}/` : ""}{totalCount} รายการ
                                                </span>
                                            ), ({ selectedCount, totalCount }) => (
                                                <span>
                                                    {selectedCount ? `${selectedCount}/` : ""}{totalCount} รายการ
                                                </span>
                                            )
                                        ]}
                                    />
                                </div>
                            </>
                        ) : null}



                    </Form>
                </Modal>

                {/* Import Modal */}

                <Modal
                    maskClosable={false}
                    title={`Import`}
                    visible={isModalImportVisible} onOk={handleImportOk} onCancel={handleImportCancel}
                >
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

export default CustomersIndex
