import React, { useEffect, useState, } from 'react'
import { Button, Switch, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Table, Row, Col, Image, Pagination } from 'antd';
import { CheckCircleOutlined, StopOutlined, CloseCircleOutlined, MinusCircleOutlined, PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import moment from 'moment';
import { sha256 } from 'js-sha256'
import randomstring from 'randomstring'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import GetIntlMessages from '../../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../../../components/shares/FormLanguage';
import { isArray, isFunction, isPlainObject } from "lodash";
import ModalFullScreen from '../../../components/shares/ModalFullScreen';
import ImageSingleShares from '../../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../../components/shares/FormUpload/API';
import { v4 as uuidv4 } from 'uuid';

const VehicleBrandAndModel = () => {
    const [loading, setLoading] = useState(false);

    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [imageVehicleBrand, setImageVehicleBrand] = useState([]);
    const [urlImage, setUrlImage] = useState('');



    useEffect(() => {
        getMasterData()
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
                title: GetIntlMessages("code"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('text', text),
                render: (text, record) => text ? text : "-",
            },
            {
                title: GetIntlMessages("vehicle-brand-name"),
                dataIndex: '',
                key: '',
                width: 250,
                // render: (text, record) => console.log('text', text.brand_name[locale.locale]),
                render: (text, record) => _.get(text, `brand_name[${locale.locale}]`, "-"),
            },
            // {
            //     title: 'Logo',
            //     dataIndex: '',
            //     key: '',
            //     width: 250,
            //     render: (text, record, obj) => <Image src={`${getBrandLogoImg(text)}`} />,

            // },
        ];

        setColumns(_column)
    }

    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            // const res = await API.get(`/ouath/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`)
            const res = await API.get(`/master/vehicleBrand/all?search=${search}&sort=${sort}&order=${order}&status=${_status}`)
            if (res.data.status === "success") {
                // console.log('res', res.data.data)
                // const { currentCount, currentPage, pages, totalCount, data } = res.data;
                const { data, isuse } = res.data;
                // console.log(`data`, res)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, limit: limit, isuse: isuse })
                // setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit, })
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

    /* เปลี่ยนสถานะ model*/
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const formValue = form.getFieldsValue()
            console.log('fomeValue changeStatus', formValue)
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/master/vehicleBrand/put/${id}`, { status })
            // console.log('data', data)
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                console.log(`search`, modelSearch)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status
                })
                setModelSearch(modelSearch)
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }
    /* เปลี่ยนสถานะ */
    // const [indexCheckModel, setIndexCheckModel] = useState(null)
    // const [brandIdCheckModel, setBrandIdCheckModel] = useState(null)

    // const sendId = (index) => {
    //     console.log('index', index)
    //     setIndexCheckModel(index)
    // }

    // const changeStatusModel = async (isuse) => {
    //     try {
    //         // delete,active,block
    //         const formValue = form.getFieldsValue()
    //         console.log('fomeValue changeStatus', formValue)
    //         console.log('fomeValue changeStatus model_list[indexCheckModel]', formValue.model_list[indexCheckModel])
    //         const modelList = formValue.model_list[indexCheckModel]
    //         const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
    //         console.log('modelList', modelList)
    //         const vehicleModel = {
    //             model_list: [modelList]
    //         }
    //         vehicleModel.model_list[0].status = status
    //         console.log('vehicleModel', vehicleModel)
    //         const { data } = await API.put(`/master/vehicleModelType/putbybrandid/${brandIdCheckModel}`, vehicleModel)
    //         // // console.log('data', data)
    //         if (data.status != "success") {
    //             message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");

    //         } else {
    //             message.success("บันทึกข้อมูลสำเร็จ");
    //         }

    //     } catch (error) {
    //         message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
    //     }
    // }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                // setBrandIdCheckModel(id)
                setIsIdEdit(id)
                // console.log('id', id)

                setImageVehicleBrand([])
                setUrlImage('')
                const urlImg = await CheckImage({
                    directory: "images",
                    name: id,
                    fileDirectoryId: id,
                })
                console.log('urlImg addEditViewModal', urlImg)
                if (urlImg !== "/assets/images/profiles/avatar.jpg") {
                    setImageVehicleBrand([
                        {
                            url: urlImg,
                            name: "รูปโลโก้",
                        }
                    ])

                }
                setUrlImage(urlImg)

                const { data } = await API.get(`/master/vehicleBrand/byid/${id}`)
                await getDataSearchVehicleModel({
                    vehicles_brand_id: id,
                    page: configModelTable.page,
                    search: modelSearchModel.search,
                    _status: modelSearchModel.status
                })
                // const dataVehicleModelType = await API.get(`/master/vehicleModelType/bybrandid/${id}`)


                if (data.status) {
                    const _model = data.data
                    // const vehicleModelTypeDataById = dataVehicleModelType.data.data
                    // console.log('_model', _model)
                    setCheckedIsuse(_model.isuse == 1 ? true : false)
                    // setClientSecret(_model.client_secret)
                    form.setFieldsValue({
                        ..._model,
                        editing_data: [],
                        new_adding_data: [],

                    })

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
    const [form] = Form.useForm();
    const [formModel] = Form.useForm();

    const handleOk = () => {
        setConfigModal({ ...configModal })
        form.submit()
        formModel.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
        setImageVehicleBrand([])
        setConfigModal({ ...configModal, mode: "add" })
    }

    const callback = () => {
        message.success('บันทึกสำเร็จ');
        setIsModalVisible(false)
        form.resetFields()
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status
        })
        handleCancel()
    }
    const onFinish = async (value) => {
        try {
            setLoading(true)
            // console.log(`value`, value)
            const { initModelListData, searchVehicleTypes, new_adding_data, editing_data } = form.getFieldValue()
            const model = {
                internal_code_id: value.internal_code_id,
                brand_name: value.brand_name,
                // "site_whitelist": value.site_whitelist
            }

            const vehicleModel = {
                model_list: []
            }

            if (configModal.mode === "add") {
                vehicleModel.model_list = value.model_list ?? []
            } else {
                if (isArray(editing_data) && isArray(new_adding_data)) {
                    editing_data.push(...new_adding_data)
                    vehicleModel.model_list = editing_data.map((e, index) => {
                        const status = e.isuse == 0 ? "block" : e.isuse == 1 ? "active" : "delete"
                        return {
                            id: e?.id,
                            code_id: e.code_id,
                            model_name: e.model_name,
                            vehicle_type_id: e.vehicle_type_id,
                            status
                        }
                    })
                    vehicleModel.model_list.map(e => {
                        if (!e.id) delete e.id
                        if (!e.vehicle_type_id) delete e.vehicle_type_id
                    })

                }
            }



            if (value.upload) {
                setLoading(true)
                setImageVehicleBrand([])
                setUrlImage('')
                await UploadImageSingle(value.upload.file, { name: idEdit, directory: "images" })

                const urlImg = await CheckImage({
                    directory: "images",
                    name: idEdit,
                    fileDirectoryId: idEdit,
                })
                if (urlImg !== "/assets/images/profiles/avatar.jpg") {
                    setImageVehicleBrand([
                        {
                            url: urlImg,
                            name: GetIntlMessages("image-logo"),
                        }
                    ])
                }
                setUrlImage(urlImg)
                setLoading(false)
            }


            // console.log('vehicleModel :>> ', vehicleModel);


            let res
            let resModel
            if (configModal.mode === "add") {
                res = await API.post(`/master/vehicleBrand/add`, model)
                if (res.data.status == "success") {
                    vehicleModel.vehicles_brand_id = res.data.data.id
                    resModel = await API.post(`/master/vehicleModelType/add`, vehicleModel)
                }
            } else if (configModal.mode === "edit" && idEdit) {

                res = await API.put(`/master/vehicleBrand/put/${idEdit}`, model)
                if (res.data.status == "success") {
                    resModel = await API.put(`/master/vehicleModelType/byTypeBrand/${idEdit}`, vehicleModel)
                }
            }
            if (res.data.status == "success" && resModel.data.status == "success") {
                callback()
            } else {
                if (configModal.mode === "edit") {
                    if (res.data.status == "success" && resModel.data.status == "success") {
                        callback()
                    } else {
                        message.error(res.data.data);
                    }
                } else {
                    message.error(res.data.data);
                    // message.error('มีบางอย่างผิดพลาด !!');
                }
            }

            if (configModal.modeKey == 1) {
                form.resetFields()
                setConfigModal({ ...configModal, mode: 'add', modeKey: null })
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                setImageVehicleBrand([])
                addEditViewModal("add")
            } else if (configModal.modeKey == 2) {
                handleCancel()
            } else if (configModal.modeKey == 0) {
                setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                // console.log('res addEditViewModal', res)
                addEditViewModal("edit", res.data.data.id)
            }
            setLoading(false)
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

    const [VehicleTypeAllList, setVehicleTypeAllList] = useState([])

    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const vehicleType = await getVehicleTypeAllList()
            setVehicleTypeAllList(vehicleType)

        } catch (error) {

        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getVehicleTypeAllList = async () => {
        const { data } = await API.get(`/master/vehicleType/all?sort=code_id&order=asc&status=active`)
        // console.log('data', data.data)
        return data.data
    }


    const searchVehicleType = async (id) => {

        // const newArr = formValue.model_list.filter(where => where.vehicle_type_id == formValue.searchVehicleTypes)
        // form.setFieldsValue({ model_list: newArr })
        try {
            // const { searchVehicleTypes } = form.getFieldValue()
            await getDataSearchVehicleModel({
                vehicles_brand_id: idEdit,
                vehicle_type_id: id,
                page: configModelTable.page,
                search: modelSearchModel.search,
                _status: modelSearchModel.status
            })
        } catch (error) {
            console.log('error :>> ', error);
        }

    }
    const resetSearchVehicleType = async () => {
        // console.log('id :>> ', id);
        // const formValue = form.getFieldValue()
        // form.setFieldsValue({ model_list: formValue.initModelListData, searchVehicleTypes: null })
        try {
            form.setFieldsValue({ searchVehicleTypes: null })
            await getDataSearchVehicleModel({
                vehicles_brand_id: idEdit,
                vehicle_type_id: null,
                page: configModelTable.page,
                search: modelSearchModel.search,
                _status: modelSearchModel.status
            })
            setConfigVehicleModelTable({ ...configModelTable, page: 1, limit: 10 })

        } catch (error) {
            console.log('error :>> ', error);
        }
    }


    // const getBrandLogoImg = async (data) => {
    //     try {
    //         if (data && isPlainObject(data)) {
    //             console.log('data getBrandLogoImg', data)
    //             const urlImg = await CheckImage({
    //                 directory: "images",
    //                 name: data.id,
    //                 fileDirectoryId: data.id,
    //             })
    //             console.log('urlImg render', urlImg)
    //             return urlImg
    //         }
    //     } catch (error) {
    //         console.log('error', error)
    //     }
    // }

    // const callbackImg =(value)=>{
    //     if(value){
    //         if (value.status =="done") {
    //             console.log('value', value)
    //             setUrlImage(value.originFileObj.file)
    //         }

    //     }else{
    //         setUrlImage(`/assets/images/profiles/avatar.jpg`)
    //     }

    // }


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
        if (permission_obj)
            setColumnsTable()
    }, [configTable.page, configSort.order, permission_obj, locale])


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
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

    const initConfigModelTable = {
        configVehicleModelTable: {
            page: 1,
            total: 0,
            limit: 10,
            sort: "code",
            order: "ascend",
        },
        configSortVehicleModel: {
            sort: "code_id",
            order: "ascend",
        },
        modelSearchVehicleModel: {
            search: "",
            status: "default",
        }

    }

    const [configModelTable, setConfigVehicleModelTable] = useState(initConfigModelTable.configVehicleModelTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSortModel, setConfigSortVehicleModel] = useState(initConfigModelTable.configSortVehicleModel)

    /** ตัวแปล Search */
    const [modelSearchModel, setModelSearchVehicleModel] = useState(initConfigModelTable.modelSearchVehicleModel)


    const getDataSearchVehicleModel = async ({ vehicles_brand_id = "", vehicle_type_id = "", search = modelSearchModel.search ?? "", limit = configModelTable.limit, page = configModelTable.page, sort = configSortModel.sort, order = (configModelTable.order === "descend" ? "desc" : "asc"), _status = modelSearchModel.status }) => {
        try {
            if (page === 1) setLoading(true)
            const { model_list, editing_data, new_adding_data } = form.getFieldValue()

            const res = await API.get(`/master/vehicleModelType/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}${vehicles_brand_id ? `&vehicles_brand_id=${vehicles_brand_id}` : ""}${vehicle_type_id ? `&vehicle_type_id=${vehicle_type_id}` : ""}`)
            // console.log('res', res)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;


                if (editing_data && isArray(editing_data) && editing_data.length > 0) {
                    const initDataIndex = []
                    editing_data.map((e, index) => {
                        const foundIndex = data.findIndex(where => where.id == e.id)
                        foundIndex !== -1 ? initDataIndex.push(foundIndex) : null
                    })

                    if (isArray(initDataIndex) && initDataIndex.length > 0) {
                        initDataIndex.map((e, i) => {
                            data[e] = editing_data[i]
                        })
                    }
                }

                if (new_adding_data && isArray(new_adding_data) && new_adding_data.length > 0) {
                    data.unshift(...new_adding_data)
                }

                // console.log('data', data)
                form.setFieldsValue({ model_list: data, initModelList: data, })
                // form.setFieldsValue({ model_list: data })


                setConfigVehicleModelTable({ ...configModelTable, page: page, total: totalCount, limit: limit })

                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            // console.log('error getDataSearchVehicleModel', error)
            if (page === 1) setLoading(false)
        }
    }

    const addTable = (add) => {
        function addLeadingZeros(num, totalLength) {
            return String(num).padStart(totalLength, '0');
        }
        const { internal_code_id, new_adding_data, editing_data } = form.getFieldValue()

        if (!internal_code_id) {
            message.warning("กรุณาใส่รหัสยี่ห้อ !!")
        } else {
            const defaultValue = {
                internal_code_id: null,
                model_name: {},
                vehicle_type_id: null,
                isuse: 1
            }
            if (isFunction(add) && configModal.mode === "edit") {
                let data_uuid = uuidv4()
                defaultValue.fake_id = `vehicle_model_fake_id_${data_uuid}`
                add(defaultValue, 0)

                const model_list = form.getFieldValue().model_list
                model_list[0].code_id = `${internal_code_id}-${addLeadingZeros(model_list.length, 3)}`
                form.setFieldsValue({ model_list })
            } else {
                add(defaultValue)
                const model_list = form.getFieldValue().model_list
                model_list[model_list.length - 1].code_id = `${internal_code_id}-${addLeadingZeros(model_list.length, 3)}`

                form.setFieldsValue({ model_list })
            }
        }
    }

    const handleChangeModelData = async (index, type) => {
        try {
            const { model_list, editing_data, new_adding_data, initModelList } = form.getFieldValue()
            let checkDuplicate
            // await API.post(`/master/vehicleModelType/checkduplicate`, vehicleModel)
            if (configModal.mode === "edit") {
                let dataType
                if (model_list[index]?.fake_id) dataType = "new_data"
                else dataType = "edit_data"

                // const newArr = [...editing_data,...new_adding_data]
                // validateDuplicateData(newArr,index,type)

                const _model = {
                    code_id: model_list[index]["code_id"],
                    model_name: model_list[index]["model_name"],
                    vehicles_brand_id: model_list[index]["vehicles_brand_id"],
                    vehicle_type_id: model_list[index]["vehicle_type_id"]
                }
                if (!_model.vehicle_type_id) delete _model.vehicle_type_id

                switch (dataType) {
                    case "edit_data":
                        const find = initModelList.find(where => where.id === model_list[index]["id"])
                        if (isPlainObject(find)) {
                            const isName = type.match("name")
                            const formLocaleType = formLocale === "us" ? "en" : formLocale
                            // console.log('isName :>> ', isName);
                            if (isName !== null) {
                                if (noWhiteSpace(find[type][formLocaleType]) != noWhiteSpace(model_list[index][type][formLocaleType])) {
                                    checkDuplicate = await API.post(`/master/vehicleModelType/checkduplicate`, { [type]: model_list[index][type], code_id: "" })
                                    if (checkDuplicate.data.status === "success") {
                                        if (isArray(editing_data) && editing_data.length > 0) {
                                            const findIndexDuplicateData = editing_data.findIndex(where => where.id === model_list[index]["id"])
                                            if (findIndexDuplicateData !== -1) {
                                                editing_data[findIndexDuplicateData] = model_list[index]

                                            } else {
                                                if (model_list[index]?.id) {
                                                    editing_data.push(model_list[index])
                                                }

                                            }
                                        } else {
                                            if (model_list[index]?.id) {
                                                editing_data.push(model_list[index])
                                            }
                                        }
                                    } else {
                                        message.warning(checkDuplicate.data.data)
                                    }

                                }
                            } else {
                                if (type === "vehicle_type_id") {
                                    if (isArray(editing_data) && editing_data.length > 0) {
                                        const findIndexDuplicateData = editing_data.findIndex(where => where.id === model_list[index]["id"])
                                        if (findIndexDuplicateData !== -1) {
                                            editing_data[findIndexDuplicateData] = model_list[index]

                                        } else {
                                            if (model_list[index]?.id) {
                                                editing_data.push(model_list[index])
                                            }
                                        }
                                    } else {
                                        if (model_list[index]?.id) {
                                            editing_data.push(model_list[index])
                                        }
                                    }
                                } else {
                                    if (noWhiteSpace(find[type]) != noWhiteSpace(model_list[index][type])) {
                                        checkDuplicate = await API.post(`/master/vehicleModelType/checkduplicate`, { [type]: model_list[index][type], model_name: {} })
                                        if (checkDuplicate.data.status === "success") {
                                            if (isArray(editing_data) && editing_data.length > 0) {
                                                const findIndexDuplicateData = editing_data.findIndex(where => where.id === model_list[index]["id"])
                                                if (findIndexDuplicateData !== -1) {
                                                    editing_data[findIndexDuplicateData] = model_list[index]

                                                } else {
                                                    if (model_list[index]?.id) {
                                                        editing_data.push(model_list[index])
                                                    }

                                                }
                                            } else {
                                                if (model_list[index]?.id) {
                                                    editing_data.push(model_list[index])
                                                }
                                            }
                                        } else {
                                            message.warning(checkDuplicate.data.data)
                                        }

                                    }
                                }
                            }

                        }


                        break;
                    case "new_data":
                        checkDuplicate = await API.post(`/master/vehicleModelType/checkduplicate`, _model)
                        if (checkDuplicate.data.status === "success") {
                            if (isArray(new_adding_data) && new_adding_data.length > 0) {
                                const findIndexDuplicateData = new_adding_data.findIndex(where => where.fake_id === model_list[index]["fake_id"])

                                if (findIndexDuplicateData > -1) {
                                    new_adding_data[findIndexDuplicateData] = model_list[index]

                                } else {
                                    if (configModal.mode === "edit") {
                                        new_adding_data.unshift(model_list[index])
                                    }
                                }
                            } else {
                                if (configModal.mode === "edit") {
                                    if (!model_list[index].id) {
                                        new_adding_data.unshift(model_list[index])
                                    }
                                }
                            }
                            validateDuplicateData(new_adding_data, index, type)
                        } else {
                            message.warning(checkDuplicate.data.data)
                            model_list[index][type] = type.match("name") !== null ? { [formLocale === "us" ? "en" : formLocale]: null } : null
                        }

                        break;

                    default:
                        break;
                }
            } else {
                validateDuplicateData(model_list, index, type)
            }


            //   console.log('editing_data', editing_data)
            //   console.log('new_adding_data', new_adding_data)

            form.setFieldsValue({ model_list, editing_data, new_adding_data })
        } catch (error) {
            console.log('error :>> ', error);
        }


    }

    const handleChangePagination = async (page, pageSize) => {
        try {
            const { model_list, editing_data } = form.getFieldValue()
            // const { model_list, searchProductTypes, editing_data } = form.getFieldValue()
            const searchData = {
                vehicles_brand_id: idEdit,
                page: page,
                limit: pageSize,
                search: modelSearchModel.search,
                _status: modelSearchModel.status
            }
            // if (searchProductTypes) {
            //     searchData.product_type_id = searchProductTypes
            // }

            setLoading(true)
            await getDataSearchVehicleModel(searchData)
            setLoading(false)
        } catch (error) {
            console.log('error :>> ', error);
        }

    }

    const removeVehicleModel = (index, remove, fieldName) => {
        const { model_list, editing_data, new_adding_data } = form.getFieldValue()
        if (model_list && !isArray(model_list)) model_list = {}
        // const initModelList = model_list

        if (isFunction(remove) && configModal.mode === "add") {
            remove(fieldName)
        } else {
            if (model_list[index]?.id) {
                // if( model_list[index]["code_id"] !== null && model_list[index]["code_id"]["model_name"] !== null && model_list[index]["product_type_id"] !== null){
                const dataIndex = editing_data.findIndex(where => where.id == model_list[index]["id"])
                if (dataIndex !== -1) {
                    editing_data[dataIndex]["isuse"] = 2
                } else {
                    model_list[index]["isuse"] = 2
                    editing_data.push(model_list[index])
                }

                model_list[index]["isuse"] = 2
                form.setFieldsValue({ model_list, editing_data })
            } else {
                const newDataIndex = new_adding_data.findIndex(where => where["fake_id"] == model_list[index]["fake_id"])
                new_adding_data.splice(newDataIndex, 1)
                form.setFieldsValue({ new_adding_data })
                remove(fieldName)
            }

        }
    }

    const changeStatusVehicleModel = (index, type, status) => {
        const { model_list, editing_data, new_adding_data } = form.getFieldValue()
        if (model_list[index]?.id) {
            const dataIndex = editing_data.findIndex(where => where.id == model_list[index]["id"])
            if (dataIndex !== -1) {
                editing_data[dataIndex][type] = status
            } else {
                model_list[index][type] = status
                editing_data.push(model_list[index])
            }

        } else {
            const dataIndex = new_adding_data.findIndex(where => where.fake_id == model_list[index]["fake_id"])
            if (dataIndex !== -1) {
                new_adding_data[dataIndex][type] = status
            } else {
                model_list[index][type] = status
                new_adding_data.push(model_list[index])
            }
        }
        if (model_list && !isArray(model_list)) model_list = {}
        isArray(model_list) ? model_list[index][type] = status : []
        form.setFieldsValue({ model_list, editing_data })
    }

    const getValueIsuseModel = (index, type) => {
        const { model_list } = form.getFieldValue()
        if (model_list && !isArray(model_list)) model_list = {}
        return isArray(model_list) ? model_list[index][type] : []
    }

    const noWhiteSpace = (value) => {
        return value.replaceAll(/\s/g, '')
    }

    /**
   * @param arry - the array you want to check the ducplicate data
   * @param index - the index of incoming data
   */
    const validateDuplicateData = (arry, index, type) => {
        // console.log('arry', arry)

        const newArr = arry.filter(where => where[type] != null)
        // console.log('newArr :>> ', newArr);

        let resultToReturn = false;
        if (newArr[index][type] && isPlainObject(newArr[index][type])) {
            for (let i = 0; i < newArr.length; i++) { // nested for loop
                for (let j = 0; j < newArr.length; j++) {
                    // prevents the element from comparing with itself
                    if (i !== j) {
                        if (noWhiteSpace(newArr[i][type][formLocale === "us" ? "en" : formLocale]) === noWhiteSpace(newArr[j][type][formLocale === "us" ? "en" : formLocale])) {
                            // duplicate element present                                
                            resultToReturn = true;
                            break;
                        }
                    }
                }

                // terminate outer loop                                                                      
                if (resultToReturn) {
                    break;
                }

            }
        } else if (newArr[index][type] && !isPlainObject(newArr[index][type])) {
            for (let i = 0; i < newArr.length; i++) { // nested for loop
                for (let j = 0; j < newArr.length; j++) {
                    // prevents the element from comparing with itself
                    if (i !== j) {
                        if (noWhiteSpace(newArr[i][type]) === noWhiteSpace(newArr[j][type])) {
                            // duplicate element present                                
                            resultToReturn = true;
                            break;
                        }
                    }
                }

                // terminate outer loop                                                                      
                if (resultToReturn) {
                    break;
                }
            }
        }

        // console.log('resultToReturn :>> ', resultToReturn);
        if (resultToReturn) {
            message.warn(type === "code_id" ? "รหัสรุ่นรถนี้ถูกใช้ไปแล้ว" : "ชื่อรุ่นรถนี้ถูกใช้ไปแล้ว")
            arry[index][type] = type.match("name") !== null ? { [formLocale === "us" ? "en" : formLocale]: null } : null
        }
        form.setFieldsValue({ model_list: arry })
        return resultToReturn
    }
    const importedComponentsLayouts = {
        labelCol: {
            xs: { span: 5 },
            sm: { span: 8 },
            md: { span: 24 },
            lg: { span: 8 },
            xl: { span: 8 },
            xxl: { span: 5 },
        },
        wrapperCol: {
            xs: { span: 20 },
            md: { span: 24 },
            lg: { span: 16 },
            xl: { span: 14 },
            xxl: { span: 12 },
        },
    };


    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} objId="client_id" changeStatus={changeStatus} /> */}

                <ModalFullScreen
                    width={600}
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("vehicle-brand")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    loading={loading}
                // okButtonDropdown
                >
                    <Form
                        form={form}
                        labelCol={{ span: 5 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <div className='pr-5 pl-5 pt-5 detail-before-table'>
                            <Row>
                                <Col span={12} offset={6}>
                                    <FormSelectLanguage config={{
                                        form,
                                        field: ["brand_name", "model_name"],
                                        // disabled: configModal.mode == "view"
                                    }} onChange={(value) => setFormLocale(value)} />

                                    <Form.Item {...importedComponentsLayouts}
                                        name="internal_code_id"
                                        label={GetIntlMessages("รหัสภายใน")}
                                        rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                                    >
                                        <Input disabled={configModal.mode == "view"} />
                                    </Form.Item>

                                    <FormInputLanguage importedComponentsLayouts={importedComponentsLayouts} icon={formLocale} label={GetIntlMessages("vehicle-brand-name")} disabled={configModal.mode == "view"} name="brand_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                                    {configModal.mode !== "add" ?
                                        <Form.Item {...importedComponentsLayouts}
                                            label={GetIntlMessages("image-logo")}
                                        >
                                            <div style={{ width: "300px" }}>
                                                <img
                                                    src={urlImage}
                                                />
                                            </div>
                                        </Form.Item>
                                        : null}

                                    {configModal.mode !== "view" ?
                                        <Form.Item {...importedComponentsLayouts}
                                        >
                                            <ImageSingleShares name="upload" label={GetIntlMessages("upload") + " " + GetIntlMessages("image-logo")} accept={"image/*"} value={imageVehicleBrand} />
                                        </Form.Item>
                                        : null}


                                    {configModal.mode !== "add" ?
                                        <Form.Item name="isuse" label={GetIntlMessages("status")} >
                                            <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                                        </Form.Item> : null
                                    }
                                </Col>

                            </Row>
                        </div>


                        <div className='pr-3 pl-3 head-line-text'>
                            {configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} {GetIntlMessages("vehicle-model")}
                        </div>
                        {/* <div className='pr-5 pl-5 detail-before-table'> */}
                        {configModal.mode !== "add" ?

                            <Row>


                                <Col span={8}>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="searchVehicleTypes"
                                    // label='วงเงินอนุมัติ'
                                    >
                                        <Select
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            // disabled={configModal.mode == "view"}
                                            filterOption={(inputValue, option) =>
                                                option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                            }
                                            // onChange={onChangeNamePartner}
                                            onChange={(value) => searchVehicleType(value)}
                                        >
                                            {VehicleTypeAllList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {e.type_name[locale.locale]}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col md={12} span={24} id="add-search-reset">
                                    <Row justify="start" className={`pb-2`} >

                                        <div className="pr-2">
                                            <Button type="button" className="btn-search-vehicle-type" icon={<SearchOutlined />} onClick={() => searchVehicleType(form.getFieldValue().searchVehicleTypes)} loading={loading}>{GetIntlMessages("search-data")}</Button>
                                        </div>

                                        <div>
                                            <Button type="button" className="btn-search-vehicle-type" icon={<ReloadOutlined />} onClick={() => resetSearchVehicleType()}>{GetIntlMessages("reset-data")}</Button>
                                        </div>
                                    </Row>
                                </Col>
                            </Row>


                            : null}

                        <Form.List name="model_list">
                            {(fields, { add, remove }) => (

                                <>
                                    <Row>
                                        <Col span={12}>
                                            {configModal.mode !== 'add' ?
                                                <Row justify='start'>
                                                    {/* <Pagination current={configModelTable.page} defaultCurrent={initConfigModelTable.configVehicleModelTable.page} total={configModelTable.total} pageSize={configModelTable.limit} /> */}
                                                    <Pagination current={configModelTable.page} defaultCurrent={initConfigModelTable.configVehicleModelTable.page} total={configModelTable.total} pageSize={configModelTable.limit} onChange={(page, pageSize) => handleChangePagination(page, pageSize)} />
                                                </Row>
                                                : null}
                                        </Col>
                                        <Col span={12}>
                                            {configModal.mode !== 'view' ?
                                                <Row justify='end'>
                                                    <div className="pb-3">
                                                        <div style={{ textAlign: "end" }}>
                                                            <Button href='#add-plus-outlined' onClick={() => addTable(add)} icon={<PlusOutlined />}>
                                                                {GetIntlMessages("add-data") + " " + GetIntlMessages("items")}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Row>
                                                : null}
                                        </Col>
                                    </Row>
                                    {/* {configModal.mode !== "view" ?
                                        <div className="pb-3">
                                            <div style={{ textAlign: "end" }}>
                                                <Button href='#add-plus-outlined' onClick={() => addTable(add)} icon={<PlusOutlined />}>
                                                    {GetIntlMessages("add-data") + " " + GetIntlMessages("items")}
                                                </Button>
                                            </div>
                                        </div>
                                        : null
                                    } */}

                                    <div id='data-table'>
                                        <div className='table-responsive'>
                                            <table className="table table-bordered">
                                                <thead >
                                                    <tr >
                                                        <th>{GetIntlMessages("order")}</th>
                                                        <th>{GetIntlMessages("code")}</th>
                                                        <th>{GetIntlMessages("vehicle-model-name")}</th>
                                                        <th>{GetIntlMessages("vehicle-type")}</th>
                                                        {/* <th scope="col">id</th> */}
                                                        {/* {configModal.mode !== "add" ? <th scope="col">status</th> : null} */}
                                                        {configModal.mode !== "add" ? <th>{GetIntlMessages("status")}</th> : null}
                                                        {configModal.mode !== "view" ? <th>{GetIntlMessages("manage")}</th> : null}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        fields.length > 0 ?
                                                            fields.map((field, index) => (
                                                                <tr key={`key-${index}`}>
                                                                    <td>{index + 1}</td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "code_id"]}
                                                                            fieldKey={[field.fieldKey, "code_id"]}
                                                                            noStyle
                                                                        >
                                                                            <Input placehold er={GetIntlMessages("please-fill-out")} onBlur={() => handleChangeModelData(index, "code_id")} disabled={configModal.mode == "view"} />
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <FormInputLanguage handleChangeModelData={handleChangeModelData} paramIndexModelData={index} isNoStyle isInTable={true} icon={formLocale} label={GetIntlMessages("")} disabled={configModal.mode == "view"} name={[field.name, "model_name"]} rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "vehicle_type_id"]}
                                                                            fieldKey={[field.fieldKey, "vehicle_type_id"]}
                                                                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}

                                                                            noStyle
                                                                        >
                                                                            <Select
                                                                                placeholder={GetIntlMessages("please-fill-out")}
                                                                                disabled={configModal.mode == "view"}
                                                                                filterOption={(inputValue, option) =>
                                                                                    option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                                }
                                                                                style={{ width: "100%" }}
                                                                                onChange={() => handleChangeModelData(index, "vehicle_type_id")}
                                                                            >
                                                                                {VehicleTypeAllList.map((e, index) => (
                                                                                    <Select.Option value={e.id} key={index}>
                                                                                        {e.type_name[locale.locale]}
                                                                                    </Select.Option>
                                                                                ))}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    {
                                                                        configModal.mode !== "add" ?
                                                                            <td>
                                                                                <div style={{ width: "100%", textAlign: "center" }}>
                                                                                    <Form.Item name="isuse" >
                                                                                        {getValueIsuseModel(index, "isuse") == 0 ?
                                                                                            <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                                                                                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusVehicleModel(index, "isuse", 1)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                    <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                                                                                </Popconfirm>
                                                                                            </Tooltip>
                                                                                            :
                                                                                            getValueIsuseModel(index, "isuse") == 1 ?
                                                                                                <Tooltip placement="bottom" title={`สถานะปกติ`}>
                                                                                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusVehicleModel(index, "isuse", 0)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                        <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                                                                                    </Popconfirm>
                                                                                                </Tooltip>
                                                                                                :
                                                                                                getValueIsuseModel(index, "isuse") == 2 ?
                                                                                                    <Tooltip placement="bottom" title={`ถังขยะ`}>
                                                                                                        <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusVehicleModel(index, "isuse", 1)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                            <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                                                                                        </Popconfirm>
                                                                                                    </Tooltip>
                                                                                                    : <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} />
                                                                                        }

                                                                                        {/* <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} /> */}
                                                                                    </Form.Item>
                                                                                </div>
                                                                            </td>
                                                                            : null
                                                                    }
                                                                    {
                                                                        configModal.mode !== "view" ?
                                                                            <td align='center'>
                                                                                <Popconfirm placement="top" title={"ยืนยันการลบรายการนี้หรือไม่ !?"} onConfirm={() => removeVehicleModel(index, remove, field.name)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                    {/* <Popconfirm placement="top" title={"ยืนยันการลบรายการนี้หรือไม่ !?"} onConfirm={() => remove(field.name)} okText="ตกลง" cancelText="ยกเลิก"> */}
                                                                                    <Button icon={<MinusCircleOutlined />}>
                                                                                        {GetIntlMessages("delete-data") + " " + GetIntlMessages("items")} {index + 1}
                                                                                    </Button>
                                                                                </Popconfirm>
                                                                            </td>
                                                                            : null
                                                                    }

                                                                </tr>
                                                            ))
                                                            :
                                                            <tr>
                                                                <td colSpan="13">{GetIntlMessages("no-data")}</td>
                                                            </tr>

                                                    }
                                                </tbody>

                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form.List>
                        {/* </div> */}


                    </Form>
                </ModalFullScreen>

            </>

            <style global>{`
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

export default VehicleBrandAndModel
