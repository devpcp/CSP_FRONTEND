import { useEffect, useState } from 'react'
import { Button, message, Input, Modal, Select, Form, Switch, Row, Col, DatePicker, Image } from 'antd';
import { KeyOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components//shares/TableList'
import FormProvinceDistrictSubdistrict from '../../components/shares/FormProvinceDistrictSubdistrict';
import { FormInputLanguage, FormSelectLanguage } from '../../components/shares/FormLanguage';
import { get, isPlainObject, isArray, isFunction } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import TextArea from 'antd/lib/input/TextArea';
import moment, { isMoment } from 'moment';
import Fieldset from '../../components/shares/Fieldset';
import ModalFullScreen from "../../components/shares/ModalFullScreen";
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';

const EmployeeData = ({ title = null, callBack, filter_department_id = null }) => {
    const masktel_no = createDefaultMaskGenerator('999 999 9999');
    const maskmobile_no = createDefaultMaskGenerator('999 999 9999');

    const [loading, setLoading] = useState(false);
    const { authUser, imageProfile } = useSelector(({ auth }) => auth);
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [resetPasswordFlag, setResetPassw0rdFlag] = useState(false)
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
            department_id: filter_department_id !== null ? filter_department_id : null
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
                title: "รหัสพนักงาน",
                dataIndex: 'UsersProfile',
                key: 'UsersProfile',
                width: 150,
                align: "center",
                use: true,
                render: (text, record) => text.details.emp_code ? text.details.emp_code : "-",
                // sorter: (a, b, c) => { },
                // sortOrder: configSort.sort == "id_code" ? configSort.order : false,
                // onHeaderCell: (obj) => {
                //     return {
                //         onClick: () => {
                //             getDataSearch({
                //                 page: configTable.page,
                //                 search: modelSearch.search,
                //                 sort: "emp_code",
                //                 order: configSort.order !== "descend" ? "desc" : "asc",
                //             })
                //             setConfigSort({ sort: "emp_code", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                //         }
                //     };
                // }
            },

            {
                title: () => GetIntlMessages("name-surname"),
                dataIndex: 'UsersProfile',
                key: 'UsersProfile',
                width: 200,
                use: true,
                render: (text, record) => `${get(text, `fname.${locale.locale}`, "-")} ${get(text, `lname.${locale.locale}`, "-")}`,
            },
            {
                title: () => GetIntlMessages("tel-no"),
                dataIndex: 'UsersProfile',
                key: 'UsersProfile',
                width: 200,
                use: true,
                render: (text, record) => {
                    return get(text, `tel`, "-")
                    // if (text.tel) {
                    //     const arr = []
                    //     for (const [key, value] of Object.entries(text.tel)) {
                    //         if (value) arr.push(value)
                    //     }
                    //     return arr.length <= 0 ? "-" : arr.toString()
                    // } else return "-"

                },
            },
            {
                title: () => GetIntlMessages("mobile-no"),
                dataIndex: 'UsersProfile',
                key: 'UsersProfile',
                width: 200,
                use: true,
                render: (text, record) => {
                    return get(text, `mobile`, "-")
                },
            },
            {
                title: () => GetIntlMessages("departments-name"),
                dataIndex: 'Groups',
                key: 'Groups',
                width: 200,
                use: true,
                render: (text) => {
                    const arr = []
                    const departArr = text.filter(x => x.Department !== null)
                    departArr.map((e, i) => {
                        // console.log("tt",i)
                        // console.log("gg",departArr.length-1)
                        if (i === departArr.length - 1) {
                            if (isPlainObject(e.Department)) {
                                arr.push(e.Department.department_name[locale.locale])
                            }
                        } else {
                            if (isPlainObject(e.Department)) {
                                arr.push(e.Department.department_name[locale.locale] + ",")
                            }
                        }
                    })
                    return arr
                },
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

            function noWhiteSpace(value) {
                return value.replaceAll(/\s/g, '')
            }
            const noWhiteSpaceValue = noWhiteSpace(search)
            const checkIsOnlyNumber = noWhiteSpaceValue.match(/^\d+$/)
            let url = `/shopUser/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${department_id ? `&department_id=${department_id}` : ""}`
            if (checkIsOnlyNumber != null) {
                const mobileNo = []
                const telNo = []
                for (let i = 0; i < 10; i++) {
                    mobileNo.push({ mobile_no: `mobile_no_${i + 1}` })
                    telNo.push({ tel_no: `tel_no_${i + 1}` })

                }
                url += `&jsonField.mobile_no=${mobileNo.map(e => e.mobile_no).join(",")}&jsonField.tel_no=${telNo.map(e => e.tel_no).join(",")}`
            }
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

            const { data } = await API.put(`/shopUser/put/${id}`, { status })
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
            setImgEmpUrl("/assets/images/profiles/avatar.jpg")
            setConfigModal({ ...configModal, mode })
            if (id) {
                setResetPassw0rdFlag(false)
                setIsIdEdit(id)
                const { data } = await API.get(`/shopUser/byid/${id}`)
                if (data.status == "success") {
                    // console.log('data :>> ', data);
                    const _model = data.data
                    console.log("sss", _model)
                    _model.name_title_id = _model.UsersProfile.name_title
                    _model.fname = get(_model.UsersProfile, `fname.${locale.locale}`)
                    _model.lname = get(_model.UsersProfile, `lname.${locale.locale}`)
                    _model.tel = _model.UsersProfile.tel ?? null
                    _model.mobile = _model.UsersProfile.mobile ?? null
                    _model.isuse = _model.isuse == 1 ? true : false
                    _model.id_card_number = _model.UsersProfile.id_code
                    // _model.department_id = _model.UsersProfile.department_id
                    // _model.department_id = _model.UsersProfile.department_id
                    _model.address = get(_model.UsersProfile, `address.${locale.locale}`)
                    _model.province_id = _model.UsersProfile.province_id
                    _model.district_id = _model.UsersProfile.district_id
                    _model.subdistrict_id = _model.UsersProfile.subdistrict_id
                    _model.user_name = _model.user_name ?? null
                    _model.note = _model.note ?? null

                    _model.department_id = []
                    _model.Groups.map((e) => {
                        if (isPlainObject(e.Department)) {
                            _model.department_id.push(e.Department.id)
                        }
                    })

                    if (isPlainObject(_model.UsersProfile.details)) {
                        _model.emp_code = _model.UsersProfile.details.emp_code ?? null
                        _model.emp_status = _model.UsersProfile.details.emp_status ?? null
                        _model.date_start_work = _model.UsersProfile.details.date_start_work != null ? moment(new Date(_model.UsersProfile.details.date_start_work), "YYYY-MM-DD") : null
                        _model.date_end_work = _model.UsersProfile.details.date_end_work != null ? moment(new Date(_model.UsersProfile.details.date_end_work), "YYYY-MM-DD") : null
                        _model.date_of_issue = _model.UsersProfile.details.date_of_issue != null ? moment(new Date(_model.UsersProfile.details.date_of_issue), "YYYY-MM-DD") : null
                        _model.date_of_expiry = _model.UsersProfile.details.date_of_expiry != null ? moment(new Date(_model.UsersProfile.details.date_of_expiry), "YYYY-MM-DD") : null
                        _model.contact_name = _model.UsersProfile.details.contact_name ?? null
                        _model.contact_number = _model.UsersProfile.details.contact_number ?? null
                        _model.contact_relation = _model.UsersProfile.details.contact_relation ?? null
                        _model.nickname = _model.UsersProfile.details.nickname ?? null
                    }

                    const urlImg = await CheckImage({
                        directory: "profiles",
                        name: id,
                        fileDirectoryId: id,
                    })
                    console.log(urlImg)
                    setImgEmpUrl(urlImg)

                    setCheckedIsuse(_model.isuse)

                    // if (_model.tel_no) {
                    //     _model.tel_no = Object.entries(_model.tel_no).map((e) => ({ tel_no: e[1] }));
                    //     // await setTelNo([..._model.tel_no])
                    // }
                    // //จัด object mobile_no ใหม่
                    // if (_model.mobile_no) {
                    //     _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({ mobile_no: e[1] }));
                    //     // await setMobileNo([..._model.mobile_no])
                    // }

                    form.setFieldsValue(_model)
                }

            } else {
                form.setFieldsValue({ name_title_id: "ac41990b-cdfb-48b4-bd79-fd4c275cec8c" })
                setResetPassw0rdFlag(true)
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
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [form] = Form.useForm();

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setConfigModal({ ...configModal, mode: 'add' })
        setResetPassw0rdFlag(true)
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            if (value.upload) {
                await UploadImageSingle(value.upload.file, { name: idEdit, directory: "profiles" })

                const urlImg = await CheckImage({
                    directory: "profiles",
                    name: idEdit,
                    fileDirectoryId: idEdit,
                })
                setImgEmpUrl(urlImg)
                // dispatch(setImageProfile(urlImg));
            }

            const _model = {
                // tel_no: {},
                // mobile_no: {},
                user_name: value.user_name,
                note: value.note,
                e_mail: value.e_mail ? value.e_mail : null,
                department_id: value.department_id ?? null,
                user_profile_data: {
                    // department_id: value.department_id ?? null,
                    department_id: value.department_id ?? null,
                    subdistrict_id: value.subdistrict_id ?? null,
                    district_id: value.district_id ?? null,
                    province_id: value.province_id ?? null,
                    fname: {
                        th: value.fname ?? null
                    },
                    lname: {
                        th: value.lname ?? null
                    },
                    name_title: value.name_title_id ?? null,
                    address: {
                        th: value.address
                    },
                    tel: value.tel,
                    mobile: value.mobile,
                    id_code: value.id_card_number,
                    details: {
                        emp_code: value.emp_code ?? null,
                        emp_status: value.emp_status ?? null,
                        date_start_work: value.date_start_work ?? null,
                        date_end_work: value.date_end_work ?? null,
                        date_of_issue: value.date_of_issue ?? null,
                        date_of_expiry: value.date_of_expiry ?? null,
                        contact_name: value.contact_name ?? null,
                        contact_number: value.contact_number ?? null,
                        contact_relation: value.contact_relation ?? null,
                        nickname: value.nickname ?? null,
                    }
                },
            }
            if (resetPasswordFlag) {
                _model.password = value.password
            }
            switch (_model.user_profile_data.details.emp_status) {
                case "207d4676-1761-44c8-be47-8a995c5b4fa9":
                    _model.status = "active"
                    break;
                default:
                    _model.status = "block"
                    break
            }


            console.log(`_model`, _model)
            // if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            // else value.mobile_no = []

            // if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            // else value.tel_no = []

            let res
            if (configModal.mode === "add") {
                // _model.master_customer_code_id = ""
                res = await API.post(`/shopUser/add`, _model)
            } else if (configModal.mode === "edit") {
                // _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/shopUser/put/${idEdit}`, _model)
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
    const [nameTitleList, setNameTitleList] = useState([])
    const [departmentList, setDepartmentList] = useState([])
    const [empStatusList, setEmpstatusList] = useState([])
    const [relationList, setRelationList] = useState([])

    const getMasterData = async () => {
        try {
            /* คำนำหน้า */
            const nameTitle = await getNameTitleListAll()
            const departmentList = await getDepartmentsListAll()
            const empStatusList = await getEmpStatusListAll()
            const relationList = await getRelationListAll()
            setNameTitleList(nameTitle)
            setDepartmentList(departmentList)
            setEmpstatusList(empStatusList)
            setRelationList(relationList)
        } catch (error) {

        }
    }

    /* คำนำหน้า */
    const getNameTitleListAll = async () => {
        const { data } = await API.get(`/master/nameTitle?sort=code_id&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    /* คำนำหน้า */
    const getDepartmentsListAll = async () => {
        const { data } = await API.get(`/master/departments?sort=department_name.th&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    /* ความสัมพันธ์กับพนักงาน */
    const getRelationListAll = async () => {
        const { data } = {
            "data": {
                "status": "success",
                "data": [
                    {
                        "id": "a966b623-bd59-439b-97b7-d72ee210a054",
                        "relation_name": {
                            "th": "พ่อ",
                            "en": "Father"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "0b51b340-156a-4552-b0b3-35dc211d9ce8",
                        "relation_name": {
                            "th": "แม่",
                            "en": "Mother"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "450c72ba-d663-4bf5-b033-7c3ed803c480",
                        "relation_name": {
                            "th": "พี่สาว/น้องสาว",
                            "en": "Sister"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "bcb23482-bd57-4143-a86c-0e86175d1ab0",
                        "relation_name": {
                            "th": "พี่ชาย/น้องชาย",
                            "en": "Brother"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "7db6f04a-29ff-4c49-86b8-04486cad3804",
                        "relation_name": {
                            "th": "ญาติ",
                            "en": "Relative"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "306c967c-a28d-42f3-8cb8-e3451774c285",
                        "relation_name": {
                            "th": "เพื่อน",
                            "en": "Friend"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "476fc021-a31f-4250-bf34-a3582aaade84",
                        "relation_name": {
                            "th": "ลูกชาย/ลูกสาว",
                            "en": "Son/Daughter"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                ]
            }
        }
        // const { data } = await API.get(`/master/departments?sort=department_name.th&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    /* สถานะความเป็นพนักงาน */
    const getEmpStatusListAll = async () => {
        const { data } = {
            "data": {
                "status": "success",
                "data": [
                    {
                        "id": "207d4676-1761-44c8-be47-8a995c5b4fa9",
                        "emp_status_name": {
                            "th": "ทำงาน",
                            "en": "Working"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "6f19d53c-3bcb-4d45-b12b-771adc854d53",
                        "emp_status_name": {
                            "th": "พักงาน",
                            "en": "Suspended"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "bd5e108a-4514-4929-a4e1-a0d9edddf8bb",
                        "emp_status_name": {
                            "th": "ลาออก",
                            "en": "Resign"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                    {
                        "id": "eb7ab9af-24ac-487e-9170-aabb0ee24380",
                        "emp_status_name": {
                            "th": "เลิกจ้าง",
                            "en": "Lay off"
                        },
                        "isuse": 1,
                        "created_by": "superadmin",
                        "created_date": "2022-05-17T09:03:23.707Z",
                        "updated_by": "superadmin",
                        "updated_date": "2022-09-09T07:27:18.319Z"
                    },
                ]
            }
        }
        // const { data } = await API.get(`/master/departments?sort=department_name.th&order=asc`);
        // console.log('data.data :>> ', data.data);

        return data.data
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch(value)
        getDataSearch({ search: value.search, department_id: value.department_id, _status: value.status, page: init.configTable.page })
    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            search: init.modelSearch.search ?? "",
            department_id: init.modelSearch.department_id ?? null,
            _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
            sort: init.configSort.sort,
            order: (init.configSort.order === "descend" ? "desc" : "asc"),
        })
    }

    /** กดปุ่มเครียร์ Dropdown */
    const onClearFilterSearch = (type) => {
        try {
            const searchModel = {
                ...modelSearch
            }

            switch (type) {
                case "department_id":
                    searchModel[type] = null
                    searchModel.department_id = null
                    break;
                default:
                    break;
            }
            setModelSearch((previousValue) => searchModel);
        } catch (error) {

        }
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
                name: "department_id",
                label: "เลือกแผนก",
                placeholder: "เลือกกแผนก",
                allowClear: true,
                showSearch: true,
                list: departmentList.length > 0 ? departmentList.map((e) => ({
                    key: e.department_name[`${locale.locale}`],
                    value: e.id
                })) : [
                    {
                        key: "ไม่พบข้อมูล",
                        value: "-"
                    }
                ],
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
        onClearFilterSearch
    }

    const onCreate = () => {
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
        setResetPassw0rdFlag(true)
    }

    const resetPassword = (val) => {
        console.log("aaaaaaaaaaaaa", val)
        form.setFieldsValue({
            "password": ""
        });
        setResetPassw0rdFlag(true)
    }

    return (
        <>

            <div id="page-manage">
                <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} title={title !== null ? false : true} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <ModalFullScreen
                    // width={900}
                    maskClosable={false}
                    style={{ top: 10 }}
                    title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}พนักงาน`}
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
                            <Col xs={24} xl={24}>
                                <Fieldset legend={`ข้อมูลพนักงาน`} className={"fieldset-business-customer"}>
                                    <Row>
                                        <Col xs={24} xl={2} style={{ textAlign: "center" }}>
                                            <Image
                                                width={200}
                                                src={imgEmpUrl}
                                            />
                                            <ImageSingleShares name="upload" style={{ justifyContent: "center", }} accept={"image/*"} value={[{ url: imgEmpUrl, name: "รูปภาพ" }]} />
                                        </Col>

                                        <Col xs={24} xl={11}>
                                            <Form.Item
                                                name="emp_code"
                                                type="text"
                                                label={"รหัสพนักงาน"}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out"),
                                                }]}
                                            >
                                                <Input disabled={configModal.mode == "view"} />
                                            </Form.Item>



                                            <Form.Item name="name_title_id" label={GetIntlMessages("prefix")} >
                                                <Select
                                                    showSearch
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    disabled={configModal.mode == "view"}
                                                >
                                                    {isArray(nameTitleList) ? nameTitleList.map((e, index) => (
                                                        <Select.Option value={e.id} key={index}>
                                                            {e.name_title[locale.locale]}
                                                        </Select.Option>
                                                    )) : null}
                                                </Select>
                                            </Form.Item>


                                            <Form.Item
                                                name="fname"
                                                label={GetIntlMessages("name")}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out"),
                                                }]}
                                            >
                                                <Input type={'text'} maxLength={200} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item
                                                name="lname"
                                                label={GetIntlMessages("surname")}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out")
                                                }]}
                                            >
                                                <Input type={'text'} maxLength={200} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item
                                                name="nickname"
                                                label={GetIntlMessages("ชื่อเล่น")}
                                                rules={[{
                                                    required: false,
                                                    message: GetIntlMessages("please-fill-out")
                                                }]}
                                            >
                                                <Input type={'text'} maxLength={200} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item label="แผนก" name="department_id" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}>
                                                <Select
                                                    mode="multiple"
                                                    showSearch
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    style={{ width: "100%" }}
                                                >
                                                    {departmentList.map((e, index) => (
                                                        <Select.Option value={e.id} key={index}>
                                                            {e.department_name[locale.locale]}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} xl={11}>
                                            <Form.Item name="emp_status" label={"สถานะความเป็นพนักงาน"}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out"),
                                                }]}>
                                                <Select
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    disabled={configModal.mode == "view"}
                                                >
                                                    {isArray(empStatusList) ? empStatusList.map((e, index) => (
                                                        <Select.Option value={e.id} key={index}>
                                                            {e.emp_status_name[locale.locale]}
                                                        </Select.Option>
                                                    )) : null}
                                                </Select>
                                            </Form.Item>

                                            <Form.Item
                                                name="date_start_work"
                                                label={"วันที่เริ่มงาน"}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out")
                                                }]}
                                            >
                                                <DatePicker format={'YYYY-MM-DD'} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item
                                                name="date_end_work"
                                                label={"วันที่สิ้นสุดงาน"}
                                            >
                                                <DatePicker format={'YYYY-MM-DD'} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item
                                                name="date_of_issue"
                                                label={"วันที่ออกบัตร"}
                                            >
                                                <DatePicker format={'YYYY-MM-DD'} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item
                                                name="date_of_expiry"
                                                label={"วันที่บัตรหมดอายุ"}
                                            >
                                                <DatePicker format={'YYYY-MM-DD'} style={{ width: "100%" }} disabled={configModal.mode == "view"} />
                                            </Form.Item>
                                        </Col>
                                    </Row>


                                </Fieldset>
                            </Col>
                            <Col xs={24} xl={24}>
                                <Fieldset legend={`ข้อมูลทั่วไป`} className={"fieldset-business-customer"}>
                                    <Row>
                                        <Col xs={24} xl={12}>
                                            <Form.Item
                                                name="id_card_number"
                                                label={GetIntlMessages("id-card")}
                                                rules={
                                                    [
                                                        { required: true },
                                                        {
                                                            min: 13,
                                                            message: GetIntlMessages("enter-your-id-card-13-digits"),
                                                        },
                                                        {
                                                            pattern: new RegExp("^[0-9]*$"),
                                                            message: GetIntlMessages("enter-your-id-card"),
                                                        }
                                                    ]
                                                }
                                            >
                                                <Input type={`text`} min={0} showCount disabled={configModal.mode == "view"} minLength={10} maxLength={13} />
                                            </Form.Item>

                                            <Form.Item
                                                name="tel"
                                                type="text"
                                                label={"เบอร์โทรศัพท์"}
                                                rules={
                                                    [
                                                        {
                                                            min: 9,
                                                            message: GetIntlMessages("กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 9 ตัว"),
                                                        },
                                                        {
                                                            pattern: new RegExp("^[0-9]*$"),
                                                            message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                                        }
                                                    ]
                                                }
                                            >
                                                <Input disabled={configModal.mode == "view"} maxLength={10} />
                                            </Form.Item>

                                            <Form.Item
                                                name="mobile"
                                                type="text"
                                                label={"เบอร์โทรศัพท์มือถือ"}
                                                rules={
                                                    [
                                                        {
                                                            min: 10,
                                                            message: GetIntlMessages("กรุณากรอกเบอร์โทรศัพท์อย่างน้อย 10 ตัว"),
                                                        },
                                                        {
                                                            pattern: new RegExp("^[0-9]*$"),
                                                            message: GetIntlMessages("กรุณากรอกช้อมูลให้ถูกต้อง"),
                                                        }
                                                    ]
                                                }

                                            >
                                                <Input disabled={configModal.mode == "view"} maxLength={10} />
                                            </Form.Item>

                                            <Form.Item
                                                name="e_mail"
                                                label={GetIntlMessages("email")}
                                                rules={[{
                                                    required: true,
                                                    type: 'email',
                                                    message: GetIntlMessages("enter-your-email"),
                                                }]}
                                            >
                                                <Input type={'email'} maxLength={200} disabled={configModal.mode == "view"} />
                                            </Form.Item>

                                            <Form.Item name="address" label={GetIntlMessages("address")}
                                                rules={[{
                                                    required: true,
                                                    message: GetIntlMessages("please-fill-out"),
                                                }]}>
                                                <TextArea
                                                    placeholder="กรอกที่อยู่"
                                                    rows={4}
                                                    disabled={configModal.mode == "view"}
                                                    maxLength={200}
                                                    showCount
                                                >
                                                </TextArea>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} xl={12}>
                                            {/* <FormInputLanguage isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" disabled={configModal.mode == "view"} /> */}

                                            <FormProvinceDistrictSubdistrict form={form} disabled={configModal.mode == "view"} validatename={{ Province: true, District: true, Subdistrict: true }} />

                                        </Col>
                                    </Row>
                                </Fieldset>
                            </Col>

                            <Col xs={24} xl={12}>
                                <Fieldset legend={`ข้อมูลระบบ`} className={"fieldset-business-customer"}>
                                    <Form.Item
                                        name="contact_name"
                                        label={"ชื่อผู้ที่ติดต่อได้"}
                                        rules={[{
                                            type: 'text',
                                            message: GetIntlMessages("please-fill-out"),
                                        }]}
                                    >
                                        <Input type={'text'} maxLength={200} disabled={configModal.mode == "view"} />
                                    </Form.Item>

                                    <Form.Item
                                        name="contact_number"
                                        label={GetIntlMessages("เบอร์โทรศัพท์ผู้ติดต่อ")}
                                        rules={[
                                            {
                                                min: 9,
                                                message: "กรุณากรอกข้อมูลให้ถูกต้อง"
                                            }
                                            ,
                                            {
                                                pattern: /^[\.0-9]*$/,
                                                message: "ตัวเลขเท่านั้น"
                                            }
                                        ]}
                                    >
                                        <Input disabled={configModal.mode == "view"} maxLength={10} />
                                    </Form.Item>

                                    <Form.Item name="contact_relation" label={"ความสัมพันธ์"} >
                                        <Select
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={configModal.mode == "view"}
                                        >
                                            {isArray(relationList) ? relationList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {e.relation_name[locale.locale]}
                                                </Select.Option>
                                            )) : null}
                                        </Select>
                                    </Form.Item>

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
                                </Fieldset>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Fieldset legend={`ข้อมูลระบบ`} className={"fieldset-business-customer"}>
                                    <Form.Item
                                        name="user_name"
                                        type="text"
                                        label={"ชื่อผู้ใช้"}
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out"),
                                        }]}
                                    >
                                        <Input disabled={configModal.mode == "view"} />
                                    </Form.Item>

                                    <Form.Item
                                        type="text"
                                        label={"รหัสผ่าน"}
                                        hidden={configModal.mode == "add" || resetPasswordFlag}
                                    >
                                        <Button type="primary" shape="round" disabled={configModal.mode == "view"} onClick={() => resetPassword(form.getFieldValue("id"))} style={{ width: "100%" }}>รีเซตรหัสผ่าน</Button>
                                    </Form.Item>

                                    <Form.Item
                                        type="text"
                                        name="password"
                                        label={"รหัสผ่าน"}
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out")
                                        }]}
                                        hidden={(configModal.mode == "edit" || configModal.mode == "view") && !resetPasswordFlag}
                                    >
                                        <Input type={`text`} disabled={configModal.mode == "view"} />
                                    </Form.Item>
                                </Fieldset>
                            </Col>
                        </Row>





                        {/* {configModal.mode !== "add" ?
                            <Form.Item name="isuse" label={GetIntlMessages("status")} >
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                            </Form.Item> : null
                        } */}
                    </Form>
                </ModalFullScreen>

            </div>
            <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
            `}</style>
        </>
    )
}

export default EmployeeData
