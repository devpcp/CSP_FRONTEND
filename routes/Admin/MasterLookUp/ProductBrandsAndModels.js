import { useEffect, useState } from 'react'
import { Button, Switch, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Pagination, Row, Col } from 'antd';
import { CheckCircleOutlined, StopOutlined, CloseCircleOutlined, PlusOutlined, MinusCircleOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import moment from 'moment';
import { sha256 } from 'js-sha256'
import randomstring from 'randomstring'
import { useSelector } from 'react-redux';
import SearchInput from '../../../components/shares/SearchInput'
import TableList from '../../../components/shares/TableList'
import GetIntlMessages from '../../../util/GetIntlMessages'
import { FormInputLanguage, FormSelectLanguage } from '../../../components/shares/FormLanguage';
import ModalFullScreen from '../../../components/shares/ModalFullScreen';
import { isArray, isFunction, uniqueId } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

const ProductBrandsAndModels = () => {
    const [loading, setLoading] = useState(false);

    /* table */
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const { productType, productTypeGroup } = useSelector(({ master }) => master);
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
                title: GetIntlMessages("code"),
                dataIndex: 'code_id',
                key: 'code_id',
                width: 150,
                align: "center",
                render: (text, record) => text ? text : "-",
            },
            {
                title: GetIntlMessages("product-brand-name"),
                dataIndex: '',
                key: '',
                width: 250,
                render: (text, record) => _.get(text, `brand_name[${locale.locale}]`, "-"),
            },

        ];

        setColumns(_column)
    }

    //เผื่อได้ใช้
    // const [productTypeAllList, setProductTypeAllList] = useState([])

    // const getMasterData = async () => {
    //     const productTypeList = await getProductTypesAllList()
    //     setProductTypeAllList(productTypeList)
    // }

    const getProductTypesAllList = async () => {
        const { data } = await API.get(`/productType?sort=code_id&order=asc&status=active`)
        return data.status === "success" ? data.data.data ?? [] : []
    }


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)

            // const res = await API.get(`/master/vehicleType/all?search=${search}&sort=${sort}&order=${order}&status=${_status}`)
            const res = await API.get(`/productBrand/all?search=${search}&sort=${sort}&order=${order}`)
            if (res.data.status === "successful") {
                // console.log('res', res.data.data)
                // const { currentCount, currentPage, pages, totalCount, data } = res.data;
                const { data, isuse } = res.data;
                // console.log(`data`, data)
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

    const getDataSearchProductModel = async ({ product_brand_id = "", product_type_id = "", search = modelSearchModel.search ?? "", limit = configModelTable.limit, page = configModelTable.page, sort = configSortModel.sort, order = (configModelTable.order === "descend" ? "desc" : "asc"), _status = modelSearchModel.status }) => {
        try {
            if (page === 1) setLoading(true)
            const { model_list, editing_data, new_adding_data } = form.getFieldValue()

            const res = await API.get(`/productModelType/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}`)
            // console.log('res', res)
            if (res.data.status === "success") {
                // console.log('res', res.data.data)
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // const { data, isuse } = res.data;
                // console.log(`data`, data)
                // setListSearchDataTable(data)

                const productList = await getProductTypesAllList()
                const newData = data.map(e => {
                    const newModel = {
                        ...e,
                        product_group_type_id: e.ProductType.type_group_id,
                        product_type_list: productList ?? []
                        // product_type_list: productType.filter(where => where.type_group_id === e.ProductType.type_group_id) ?? []
                    }

                    return newModel
                })

                if (editing_data && isArray(editing_data) && editing_data.length > 0) {
                    const initDataIndex = []
                    editing_data.map((e, index) => {
                        const foundIndex = newData.findIndex(where => where.id == e.id)
                        foundIndex !== -1 ? initDataIndex.push(foundIndex) : null
                    })

                    if (isArray(initDataIndex) && initDataIndex.length > 0) {

                        initDataIndex.map((e, i) => {
                            newData[e] = editing_data[i]
                        })
                    }
                }

                if (new_adding_data && isArray(new_adding_data) && new_adding_data.length > 0) {
                    newData.unshift(...new_adding_data)
                }
                // if (editing_data && isArray(editing_data) && editing_data.length > 0) {
                //     const initDataIndex = []
                //     const changedDataIndex = []
                //     editing_data.map((e, index) => {
                //         const i = data.findIndex(where => where.id == e.id)
                //         i !== -1 ? initDataIndex.push(i) : null
                //         // console.log('initDataIndex', initDataIndex)
                //     })

                //     if (isArray(initDataIndex) && initDataIndex.length > 0) {

                //         console.log('data 556+', data)
                //         console.log('editing_data 555+', editing_data)
                //         initDataIndex.map((e, i) => {
                //             data[e] = editing_data[i]
                //         })
                //     }
                // }

                form.setFieldsValue({ model_list: newData })

                setConfigProductModelTable({ ...configModelTable, page: page, total: totalCount, limit: limit })

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
            const { data } = await API.put(`/productBrand/put/${id}`, { status })
            // console.log('data', data)
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status
                })
            }
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
        }
    }

    /* addEditView */
    const addEditViewModal = async (mode, id) => {
        // console.log('id', id)
        try {
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/productBrand/byid/${id}`)
                await getDataSearchProductModel({
                    product_brand_id: id,
                    page: configModelTable.page,
                    search: modelSearchModel.search,
                    _status: modelSearchModel.status
                })

                if (data.status) {
                    const _model = data.data[0]
                    setCheckedIsuse(_model.isuse == 1 ? true : false)
                    form.setFieldsValue({ ..._model, editing_data: [], new_adding_data: [] })
                    // form.setFieldsValue({ ..._model, model_list: modelData })

                    // form.setFieldsValue(_model)
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
            const { editing_data, new_adding_data } = form.getFieldValue()
            // console.log(`value`, value)
            const modelProductBrand = {
                code_id: value.code_id,
                brand_name: value.brand_name,
            }

            let res
            let resProductModel
            if (configModal.mode === "add") {
                res = await API.post(`/productBrand/add`, modelProductBrand)
            } else if (configModal.mode === "edit" && idEdit) {
                // model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/productBrand/put/${idEdit}`, modelProductBrand)
            }
            if (res.data.status == "successful") {
                if (configModal.mode === "add") {
                    const modeAddModelList = {
                        model_list: isArray(value.model_list) && value.model_list.length > 0 ? value.model_list.map((e, index) => {
                            const newModel = {
                                code_id: e.code_id,
                                model_name: e.model_name,
                                product_type_id: e.product_type_id,
                                // status: e.isuse == 1 ? "active" : e.isuse == 0 ? "block" : "delete"
                            }
                            // delete newModel.isuse
                            return newModel
                        }) : []
                    }
                    modeAddModelList.product_brand_id = res.data.data.id
                    resProductModel = await API.post(`/productModelType/add`, modeAddModelList)

                    if (resProductModel.data.status == "success") {
                        callback()
                    } else {
                        message.error('มีบางอย่างผิดพลาด !!');
                    }
                } else if (configModal.mode === "edit") {
                    const modelListData = {
                        product_brand_id: idEdit ?? res.data.data.id,
                        model_list: isArray(editing_data) && editing_data.length > 0 ?
                            editing_data.map((e, index) => {
                                const newModel = {
                                    // ...e,
                                    id: e.id,
                                    code_id: e.code_id,
                                    model_name: e.model_name,
                                    product_type_id: e.product_type_id,
                                    status: e.isuse == 1 ? "active" : e.isuse == 0 ? "block" : "delete"
                                }
                                return newModel ?? []
                            }) : []

                    }

                    if (isArray(new_adding_data) && new_adding_data.length > 0) {
                        const newModelAddingData = new_adding_data.map((e, index) => {
                            const newModel = {
                                code_id: e.code_id,
                                model_name: e.model_name,
                                product_type_id: e.product_type_id,
                                status: e.isuse == 1 ? "active" : e.isuse == 0 ? "block" : "delete"
                            }
                            return newModel ?? []
                        })
                        modelListData.model_list.push(...newModelAddingData)
                    }
                    resProductModel = await API.put(`/productModelType/byTypeBrand/${idEdit}`, modelListData)
                    if (resProductModel.data.status == "success") {
                        callback()
                    } else {
                        message.error('มีบางอย่างผิดพลาด !!');
                    }
                }



            } else {
                if (configModal.mode === "edit") {
                    if (res.data.status == "successful") {
                        callback()
                    } else {
                        message.error('มีบางอย่างผิดพลาด !!');
                    }
                } else {
                    message.error('มีบางอย่างผิดพลาด !!');
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
                addEditViewModal("edit", res.data.data.id)
            }
        } catch (error) {
            // console.log('error', error)
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        // console.log('error', error)
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
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
        // console.log('value', value)
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
            // {
            //     index: 1,
            //     type: "select",
            //     name: "status",
            //     label: GetIntlMessages("select-status"),
            //     placeholder: GetIntlMessages("select-status"),
            //     list: [
            //         {
            //             key: GetIntlMessages("all-status"),
            //             value: "default",
            //         },
            //         {
            //             key: GetIntlMessages("normal-status"),
            //             value: "active",
            //         },
            //         {
            //             key: GetIntlMessages("blocked-status"),
            //             value: "block",
            //         },
            //         {
            //             key: GetIntlMessages("delete-status"),
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


    const initConfigModelTable = {
        configProductModelTable: {
            page: 1,
            total: 0,
            limit: 10,
            sort: "code",
            order: "ascend",
        },
        configSortProductModel: {
            sort: "code_id",
            order: "ascend",
        },
        modelSearchProductModel: {
            search: "",
            status: "",
        }

    }

    const [configModelTable, setConfigProductModelTable] = useState(initConfigModelTable.configProductModelTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSortModel, setConfigSortProductModel] = useState(initConfigModelTable.configSortProductModel)

    /** ตัวแปล Search */
    const [modelSearchModel, setModelSearchProductModel] = useState(initConfigModelTable.modelSearchProductModel)


    const getValueProductType = (index, type) => {
        const { model_list } = form.getFieldValue()
        if (model_list && !isArray(model_list)) model_list = {}

        return isArray(model_list[index][type]) ? model_list[index][type].filter(where => where.type_group_id === model_list[index]["product_group_type_id"]) ?? [] : []
        // return isArray(model_list[index][type]) ? model_list[index][type] ?? [] : []


    }
    const getValueIsuseModel = (index, type) => {
        const { model_list } = form.getFieldValue()
        if (model_list && !isArray(model_list)) model_list = {}
        // console.log('model_list[index][type]', model_list[index][type])
        return isArray(model_list) ? model_list[index][type] : []
    }

    const changeStatusProductModel = (index, type, status) => {
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
            const dataIndex = new_adding_data.findIndex(where => where.new_data_uuid == model_list[index]["new_data_uuid"])
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

    const addModelData = (add) => {
        try {
            const defaultValue = {
                code_id: null,
                model_name: {},
                product_group_type_id: null,
                product_type_id: null,
                isuse: 1
            }
            if (configModal.mode === "edit" && isFunction(add)) {
                let data_uuid = uuidv4()
                defaultValue.new_data_uuid = data_uuid
                add(defaultValue, 0)

            } else {
                delete defaultValue.isuse
                add(defaultValue)
            }
        } catch (error) {

        }
    }

    const removeProductModel = (index, remove, fieldName) => {
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
                const newDataIndex = new_adding_data.findIndex(where => where["new_data_uuid"] == model_list[index]["new_data_uuid"])
                new_adding_data.splice(newDataIndex, 1)
                form.setFieldsValue({ new_adding_data })
                remove(fieldName)
            }

        }
    }

    const handleChangeModelData = (index, type) => {
        const { model_list, editing_data, new_adding_data } = form.getFieldValue()

        if (isArray(editing_data) && editing_data.length > 0) {
            const findIndexDuplicateData = editing_data.findIndex(where => where.id === model_list[index]["id"])
            if (findIndexDuplicateData !== -1) {
                editing_data[findIndexDuplicateData] = model_list[index]
                // form.setFieldsValue({ editing_data })

            } else {
                if (model_list[index]?.id) {
                    editing_data.push(model_list[index])
                    // form.setFieldsValue({ editing_data })
                }

            }
        } else {
            if (model_list[index]?.id) {
                editing_data.push(model_list[index])
                // form.setFieldsValue({ editing_data })
            }
        }

        if (isArray(new_adding_data) && new_adding_data.length > 0) {
            const findIndexDuplicateData = new_adding_data.findIndex(where => where.new_data_uuid === model_list[index]["new_data_uuid"])

            if (findIndexDuplicateData > -1) {
                new_adding_data[findIndexDuplicateData] = model_list[index]
                // form.setFieldsValue({ new_adding_data })

            } else {
                if (configModal.mode === "edit") {
                    new_adding_data.unshift(model_list[index])
                    // form.setFieldsValue({ new_adding_data })
                }

            }
        } else {
            if (configModal.mode === "edit") {
                if (!model_list[index].id) {
                    new_adding_data.unshift(model_list[index])
                    // form.setFieldsValue({ new_adding_data })
                }
            }
        }

        if (type === "product_group_type_id") {
            const filterProductType = productType.filter(where => where.type_group_id == model_list[index][type])
            model_list[index]["product_type_list"] = filterProductType

            // model_list[index]["product_type_list"] = productType.filter(where => where.type_group_id == model_list[index][type]) ?? []
            model_list[index]["product_type_id"] = null
            // form.setFieldsValue(model_list)
        }

        form.setFieldsValue({ model_list, editing_data, new_adding_data })

    }
    // debugger
    const handleChangePagination = async (page, pageSize) => {
        try {
            const { model_list, searchProductTypes, editing_data } = form.getFieldValue()
            const searchData = {
                product_brand_id: idEdit,
                page: page,
                limit: pageSize,
                search: modelSearchModel.search,
                _status: modelSearchModel.status
            }
            if (searchProductTypes) {

                searchData.product_type_id = searchProductTypes
            }

            setLoading(true)
            await getDataSearchProductModel(searchData)
            setLoading(false)
        } catch (error) {

        }

    }

    const searchProductTypes = async () => {
        const { model_list, searchProductTypes } = form.getFieldValue()
        await getDataSearchProductModel({
            product_brand_id: idEdit ?? "",
            product_type_id: searchProductTypes ?? "",
            page: initConfigModelTable.configProductModelTable.page,
            limit: initConfigModelTable.configProductModelTable.limit,
            search: modelSearchModel.search,
            _status: modelSearchModel.status
        })

        // const newArr = model_list.filter(where => where.product_type_id == searchProductTypes)
        // form.setFieldsValue({ model_list: newArr })
    }
    const resetSearchProductTypes = () => {
        getDataSearchProductModel({
            product_brand_id: idEdit,
            page: initConfigModelTable.configProductModelTable.page,
            limit: initConfigModelTable.configProductModelTable.limit,
            search: modelSearchModel.search,
            _status: modelSearchModel.status
        })
        setConfigProductModelTable({ ...initConfigModelTable.configProductModelTable })
        // const {searchProductTypes} = form.getFieldValue()
        form.setFieldsValue({ searchProductTypes: null })
    }



    const formItemLayout = {
        labelCol: {
            xs: { span: 5 }
        },
        wrapperCol: {
            xs: { span: 10 }
        }
    }

    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />
                {/* <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} objId="client_id" changeStatus={changeStatus} /> */}

                <ModalFullScreen
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("product-brand")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    okButtonDropdown
                    loading={loading}
                // className={`masterManagementModal`}
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
                            <FormSelectLanguage config={{
                                form,
                                field: ["brand_name", "model_list", "model_name"],
                                // disabled: configModal.mode == "view"
                            }} onChange={(value) => setFormLocale(value)} />

                            <Form.Item
                                {...formItemLayout}
                                name="code_id"
                                label={GetIntlMessages("code")}
                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                            >
                                <Input disabled={configModal.mode == "view"} />
                            </Form.Item>

                            <FormInputLanguage isNoStyle importedComponentsLayouts={formItemLayout} icon={formLocale} label={GetIntlMessages("product-brand-name")} disabled={configModal.mode == "view"} name="brand_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                            {configModal.mode !== "add" ?
                                <Form.Item name="isuse" label={GetIntlMessages("status")} >
                                    <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                                </Form.Item> : null
                            }

                        </div>

                        <div className='pr-3 pl-3 head-line-text'>
                            {configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} {GetIntlMessages("product-model-type")}
                        </div>

                        {configModal.mode !== "add" ?

                            <Row>
                                <Col span={12}>
                                    <Row>
                                        <Col md={8}>
                                            <Form.Item
                                                validateTrigger={['onChange', 'onBlur']}
                                                name="searchProductTypes"
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
                                                >
                                                    {productType.map((e, index) => (
                                                        <Select.Option value={e.id} key={index}>
                                                            {e.type_name[locale.locale]}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col md={12} id="add-search-reset">
                                            <Row justify="start" className={`pb-2`} >

                                                <div className="pr-2">
                                                    <Button type="button" className="btn-search-vehicle-type" icon={<SearchOutlined />} onClick={searchProductTypes} loading={loading}>{GetIntlMessages("search-data")}</Button>
                                                </div>

                                                <div>
                                                    <Button type="button" className="btn-search-vehicle-type" icon={<ReloadOutlined />} onClick={resetSearchProductTypes}>{GetIntlMessages("reset-data")}</Button>
                                                </div>
                                            </Row>
                                        </Col>
                                    </Row>

                                </Col>
                                <Col span={12}>
                                    {configModal.mode !== 'add' ?
                                        <Row justify='end'>
                                            <Pagination current={configModelTable.page} defaultCurrent={initConfigModelTable.configProductModelTable.page} total={configModelTable.total} pageSize={configModelTable.limit} onChange={(page, pageSize) => handleChangePagination(page, pageSize)} />
                                        </Row>
                                        : null}
                                </Col>

                            </Row>


                            : null}


                        <Form.List name="model_list">
                            {(fields, { add, remove }) => (

                                <>
                                    {configModal.mode !== "view" ?
                                        <div className="pb-3">
                                            <div style={{ textAlign: "end" }}>
                                                <Button href='#add-plus-outlined' onClick={() => addModelData(add)} icon={<PlusOutlined />}>
                                                    {GetIntlMessages("add-data") + " " + GetIntlMessages("items")}
                                                </Button>
                                            </div>
                                        </div>
                                        : null
                                    }

                                    <div id='data-table-modal-product-model'>
                                        <div className='table-responsive'>
                                            <table className="table table-bordered">
                                                <thead >
                                                    <tr >
                                                        <th>{GetIntlMessages("order")}</th>
                                                        <th>{GetIntlMessages("code")}</th>
                                                        <th>{GetIntlMessages("product-model-type")}</th>
                                                        <th>{GetIntlMessages("product-type-group")}</th>
                                                        <th>{GetIntlMessages("product-type")}</th>
                                                        {configModal.mode !== "add" ? <th>{GetIntlMessages("status")}</th> : null}
                                                        {/* <th scope="col">id</th> */}
                                                        {/* {configModal.mode !== "add" ? <th scope="col">status</th> : null} */}
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
                                                                            <Input placeholder={GetIntlMessages("please-fill-out")} disabled={configModal.mode == "view"} onBlur={() => handleChangeModelData(index, "code_id")} />
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <FormInputLanguage isNoStyle isInTable={true} icon={formLocale} label={GetIntlMessages("")} disabled={configModal.mode == "view"} name={[field.name, "model_name"]} rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} handleChangeModelData={handleChangeModelData} paramIndexModelData={index} />
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "product_group_type_id"]}
                                                                            fieldKey={[field.fieldKey, "product_group_type_id"]}
                                                                        // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                                                                        noStyle
                                                                        >
                                                                            <Select
                                                                                placeholder={GetIntlMessages("please-fill-out")}
                                                                                disabled={configModal.mode == "view"}
                                                                                filterOption={(inputValue, option) =>
                                                                                    option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                                }
                                                                                onChange={() => handleChangeModelData(index, "product_group_type_id")}
                                                                                style={{width : "100%"}}
                                                                            >
                                                                                {productTypeGroup.map((e, index) => (
                                                                                    <Select.Option value={e.id} key={index}>
                                                                                        {e.group_type_name[locale.locale]}
                                                                                    </Select.Option>
                                                                                ))}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <div style={{display : "flex", flexDirection : "row"}}>
                                                                            <span style={{ color: "red" }}>*</span>
                                                                            <Form.Item
                                                                                {...field}
                                                                                validateTrigger={['onChange', 'onBlur']}
                                                                                name={[field.name, "product_type_id"]}
                                                                                fieldKey={[field.fieldKey, "product_type_id"]}
                                                                                // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                                                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                                                                style={{width : "100%"}}
                                                                                noStyle
                                                                            >
                                                                                <Select
                                                                                    placeholder={GetIntlMessages("please-fill-out")}
                                                                                    disabled={configModal.mode == "view"}
                                                                                    filterOption={(inputValue, option) =>
                                                                                        option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                                    }
                                                                                    onChange={() => handleChangeModelData(index, "product_type_id")}
                                                                                    style={{width : "100%"}}
                                                                                >
                                                                                    {getValueProductType(index, "product_type_list").map((e, index) => (<Select.Option value={e.id} key={index}>{e.type_name[locale.locale]}</Select.Option>))}
                                                                                </Select>
                                                                            </Form.Item>
                                                                        </div>

                                                                    </td>
                                                                    {
                                                                        configModal.mode !== "add" ?
                                                                            <td>

                                                                                <Form.Item name="isuse" noStyle >
                                                                                    {getValueIsuseModel(index, "isuse") == 0 ?
                                                                                        <Tooltip placement="bottom" title={`สถานะปิดกั้น`}>
                                                                                            <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusProductModel(index, "isuse", 1)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                <Button type="link"><StopOutlined style={{ color: 'orange', fontSize: 27 }} /></Button>
                                                                                            </Popconfirm>
                                                                                        </Tooltip>
                                                                                        :
                                                                                        getValueIsuseModel(index, "isuse") == 1 ?
                                                                                            <Tooltip placement="bottom" title={`สถานะปกติ`}>
                                                                                                <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปิดกั้น' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusProductModel(index, "isuse", 0)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                    <Button type="link"><CheckCircleOutlined style={{ color: 'green', fontSize: 27 }} /></Button>
                                                                                                </Popconfirm>
                                                                                            </Tooltip>
                                                                                            :
                                                                                            getValueIsuseModel(index, "isuse") == 2 ?
                                                                                                <Tooltip placement="bottom" title={`ถังขยะ`}>
                                                                                                    <Popconfirm placement="top" title={"ยืนยันการเปลี่ยนสถานะเป็น 'สถานะปกติ' !?"} disabled={configModal.mode === "view"} onConfirm={() => changeStatusProductModel(index, "isuse", 1)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                                        <Button type="link"><CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} /></Button>
                                                                                                    </Popconfirm>
                                                                                                </Tooltip>
                                                                                                : <CloseCircleOutlined style={{ color: 'red', fontSize: 27 }} />
                                                                                    }

                                                                                    {/* <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} /> */}
                                                                                </Form.Item>

                                                                            </td>
                                                                            : null
                                                                    }
                                                                    {configModal.mode !== "view" ?
                                                                        <td align='center'>

                                                                            <Popconfirm placement="top" title={"ยืนยันการลบรายการนี้หรือไม่ !?"} onConfirm={() => removeProductModel(index, remove, field.name)} okText="ตกลง" cancelText="ยกเลิก">
                                                                                {/* <Popconfirm placement="top" title={"ยืนยันการลบรายการนี้หรือไม่ !?"} onConfirm={() => remove(field.name)} okText="ตกลง" cancelText="ยกเลิก"> */}
                                                                                <Button icon={<MinusCircleOutlined />} >
                                                                                    {GetIntlMessages("delete-data") + " " + GetIntlMessages("items")} {index + 1}
                                                                                </Button>
                                                                            </Popconfirm>

                                                                        </td>
                                                                        : null}
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

                        {
                            configModal.mode !== "add" ?
                                <Row justify='end'>
                                    <Pagination current={configModelTable.page} defaultCurrent={initConfigModelTable.configProductModelTable.page} total={configModelTable.total} pageSize={configModelTable.limit} onChange={(page, pageSize) => handleChangePagination(page, pageSize)} />
                                </Row>

                                : null
                        }


                    </Form>
                </ModalFullScreen>
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

export default ProductBrandsAndModels
