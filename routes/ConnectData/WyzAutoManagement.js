import { useEffect, useState } from 'react'
import { Button, message, Input, Modal, Select, Form, Switch, } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import { useSelector, useDispatch } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components//shares/TableList'
import FormProvinceDistrictSubdistrict from '../../components/shares/FormProvinceDistrictSubdistrict';
import { FormInputLanguage, FormSelectLanguage } from '../../components/shares/FormLanguage';
import { forEach, get, isArray, isFunction, isPlainObject } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import ModalFullScreen from '../../components/shares/ModalFullScreen';
import moment from 'moment';



const WyzAutoManagement = () => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const dispatch = useDispatch()

    const [shelfDataAll, setShelfDataAll] = useState([]); //รายการคลังสินค้าทั้งหมด
    const [shopStockByAll, setShopStockByAll] = useState([]);

    useEffect(() => {
        initData()
    }, [])

    /**
     * It calls the getShelfData function and then sets the shelfDataAll variable to the value returned
     * by the getShelfData function.
     */
    const initData = async () => {
        try {

            const [value1, value2] = await Promise.all([getShelfData(), getShopStockByAll()])

            if (isArray(value1)) setShelfDataAll(value1)
            if (isArray(value2)) setShopStockByAll(value2)

        } catch (error) {
            console.log('error', error)
        }
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
            sort: "created_date",
            order: "ascend",
            column: {
                created_by: false,
                created_date: false,
                updated_by: false,
                updated_date: false,
                status: true
            }
        },
        configSort: {
            sort: `created_date`,
            order: "ascend",
        },
        modelSearch: {
            search: "",
            status: "default",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)



    const setColumnsTable =(data) => {
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
                title: () => GetIntlMessages("รหัสสินค้า"),
                dataIndex: 'ShopProducts',
                key: 'ShopProducts',
                width: 150,
                align: "center",
                render: (text, record) => get(text, `Product.master_path_code_id`, "-"),
            },
            {
                title: () => GetIntlMessages("WYZ Code"),
                dataIndex: 'ShopProducts',
                key: 'ShopProducts',
                width: 150,
                align: "center",
                // render: (text, record) => console.log('text', text),
                render: (text, record) => get(text, `Product.wyz_code`, "-"),
            },
            {
                title: () => GetIntlMessages("product-name"),
                dataIndex: 'ShopProducts',
                key: 'ShopProducts',
                width: 300,
                render: (text, record) => get(text, `Product.product_name.${locale.locale}`, "-")
            },
            {
                title: () => GetIntlMessages("DOT/MFD"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (text, record) => get(text, `dot`, "-"),
            },
            {
                title: () => GetIntlMessages("จำนวนที่ล็อคไว้"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (text, record) => get(text, `hold_amount_stock`, "-"),
            },
            // {
            //     title: () => GetIntlMessages("จำนวนจริง"),
            //     dataIndex: 'details',
            //     key: 'details',
            //     width: 200,
            //     render: (text, record) => get(text, `real_hold_amount_stock`, "-"),
            // },
            {
                title: () => GetIntlMessages("จำนวนขายแล้วบน WYZ"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (text, record) => Number(get(text, `real_hold_amount_stock`, 0)) - Number(get(text, `wyzauto_balance_check_stock`, 0)),
            },
            {
                title: () => GetIntlMessages("จำนวนคงเหลือบน WYZ"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (text, record) => get(text, `wyzauto_balance_check_stock`, "-"),
            },
            {
                title: () => GetIntlMessages("จำนวนคงเหลือ"),
                dataIndex: '',
                key: '',
                width: 300,
                render: (text, record) => text ? showCustomWarehouse(text) : "-",        
            },
            {
                title: () => GetIntlMessages("ราคาบน WYZ"),
                dataIndex: 'details',
                key: 'details',
                width: 200,
                render: (text, record) => get(text, `price`, "-"),
            },
            // {
            //     title: () => GetIntlMessages("สถานะที่เผยแพร่บน WYZ"),
            //     dataIndex: 'e_mail',
            //     key: 'e_mail',
            //     width: 150,
            //     render: (text, record) => text ?? "-",
            // },
            {
                title: () => GetIntlMessages("วันที่เผยแพร่เริ่มต้น"),
                dataIndex: 'start_date',
                key: 'start_date',
                width: 300,
                render: (text, record) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-",
            },
            {
                title: () => GetIntlMessages("วันที่เผยแพร่สิ้นสุด"),
                dataIndex: 'end_date',
                key: 'end_date',
                width: 150,
                render: (text, record) => text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-",
            },
      
        ];

   
        // if (isArray(data) && data.length > 0) {

        //     _column.push({
        //             title: () => GetIntlMessages("555"),
        //             dataIndex: 'ShopProducts',
        //             key: 'ShopProducts',
        //             width: 300,
        //             render: (text, record) => text ? showCustomWarehouse(text) : "-",        
        //             // render: (text, record) => showCustomWarehouse(text),        
        //     })
        // }
           

        setColumns(_column)
    }

    

    const showCustomWarehouse = (textData)=>{

        let displayData
        let arrModelData
        const displayWarehouse = []
        try {
            if(isArray(textData.details.warehouse_details) && textData.details.warehouse_details.length > 0){
                arrModelData = textData.details.warehouse_details.map((e,index)=>{
                    const model = {
                        warehouse_id : e.warehouse_id,
                        shelfItem_id : e.shelfItem_id,
                        dot : textData.details.dot
                    }
                    return model
                })
            }

            if(isArray(arrModelData) && arrModelData.length > 0){
                arrModelData.map((e,idnex)=>{
                    const findWarehouse = textData.ShopStock.warehouse_detail.find(where => where.warehouse === e.warehouse_id)
                    displayWarehouse.push(findWarehouse)
                })

            }
            if(isArray(displayWarehouse) && displayWarehouse.length > 0 ){
                displayData = displayWarehouse.map((e,index)=>{
                    const findShelf = e.shelf.find(where => where.dot_mfd === arrModelData[0].dot)
                    return findShelf
                })

            }

            return displayData.map((e,index)=>{
                const showingData  = `${GetIntlMessages("shelf")} : ${e.item} , ${GetIntlMessages("amount")} : ${e.balance}`
                return showingData
            }).join(" | ")
        } catch (error) {
            console.log('error', error)
        }
  
    }


    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
        })

        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()

    }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])


    /* ค้นหา */
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/shopProductsHoldWYZauto/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`)
            // const res = await API.get(`/shopBusinessCustomers/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`)
            // console.log('res', res)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log('data getDataSearch', data)
                setColumnsTable(data)
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
            // console.log('error :>> ', error);
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            // const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            // console.log('changeStatus :>> ', status, id);

            const { data } = await API.put(`/shopProductsHoldWYZauto/put/${id}`, { stock: 0 })
            if (data.status != "success") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
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
                const { data } = await API.get(`/shopProductsHoldWYZauto/byid/${id}`)

                if (data.status == "success") {
                    // console.log('data :>> ', data);
                    const _model = data.data

                    // console.log('_model', _model)

                    const initProducts = {
                        products: [],
                        isuse: _model.isuse == 1 ? true : false
                    }

                    // console.log(`_model`, _model)

                    _model.isuse = _model.isuse == 1 ? true : false
                    setCheckedIsuse(_model.isuse)

                    const shopStockData = await getShopStockByAll()

                    const _filterShopStock = shopStockData.filter(where => where.product_id == _model.product_id)

                    // const warehouseData = _filterShopStock[0].warehouse_detail.filter(where => where.warehouse == _model.details.warehouse_details[0].warehouse_id && where.shelf.dot_mfd == _model.details.dot)

                    // console.log('warehouseData', warehouseData)
                    const shelfData = await getShelfData()

                    if (isArray(_model.details.warehouse_details) && _model.details.warehouse_details.length > 1) {

                        const newCustomModel = _model.details.warehouse_details.map((e, index) => {
                            const warehouseData = _filterShopStock[0].warehouse_detail.filter(where => where.warehouse == e.warehouse_id && where.shelf.dot_mfd == _model.details.dot)

                            const newModelData = {
                                shop_stock_id: _filterShopStock[0].id,
                                wyz_code: _model?.wyz_code ?_model?.wyz_code ?? "-" : _model.details?.sku ?? "-",
                                // sku: _model.details.sku,
                                dot: _model.details.dot,
                                warehouse_id: e.warehouse_id,
                                shelfItem_id: e.shelfItem_id,
                                price: _model.details.price,
                                stock: e.holding_product,
                                price_per_unit: _filterShopStock[0].ShopProduct.price.suggasted_re_sell_price.retail,
                                warehouse_list: shelfData.filter(where => where.id == e.warehouse_id),
                                shelf_list: shelfData.filter(where => where.id == e.warehouse_id).shelf,
                                dot_mfd_list: warehouseData.map((e, index) => e.shelf.dot_mfd),
                                balance: warehouseData[0].shelf.balance,
                                products_list: _filterShopStock
                            }

                            return newModelData
                        })
                        initProducts.products.push(...newCustomModel)
                    } else {
                        const warehouseData = _filterShopStock[0].warehouse_detail.filter(where => where.warehouse == _model.details.warehouse_details[0].warehouse_id && where.shelf.dot_mfd == _model.details.dot)
                        const newModel = {
                            // shop_stock_id: _model.product_id,
                            // sku: _model.details.sku,
                            wyz_code: _model?.wyz_code ?_model?.wyz_code ?? "-" : _model.details?.sku ?? "-",
                            dot: _model.details.dot,
                            warehouse_id: _model.details.warehouse_details[0].warehouse_id,
                            shelfItem_id: _model.details.warehouse_details[0].shelfItem_id,
                            price: _model.details.price,
                            stock: _model.details.warehouse_details[0].holding_product,
                            warehouse_list: [],
                            shelf_list: []
                        }
                        const resultShelfData = shelfData.filter(where => where.id == _model.details.warehouse_details[0].warehouse_id)
                        newModel.products_list = _filterShopStock
                        newModel.shop_stock_id = _filterShopStock[0].id
                        newModel.price_per_unit = _filterShopStock[0].ShopProduct.price.suggasted_re_sell_price.retail
                        newModel.balance = warehouseData[0].shelf.balance
                        newModel.warehouse_list.push(...resultShelfData)
                        newModel.shelf_list.push(...resultShelfData[0].shelf)
                        newModel.dot_mfd_list = warehouseData.map((e, index) => e.shelf.dot_mfd)
                        initProducts.products.push(newModel)
                    }

                    form.setFieldsValue(initProducts)

                }

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
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            setLoading(true)
            // console.log(`value`, value)

            const newValue = value.products.map((e, index) => {
                const newModelData = {
                    shop_product_id : e.product_id,
                    // sku: e.sku,
                    wyz_code: e.wyz_code,
                    dot: e.dot,
                    stock: Number(e.stock),
                    price: Number(e.price),
                    shelfItem_id: e.shelfItem_id,
                    warehouse_id: e.warehouse_id,
                }
                return newModelData
            }).filter(where => where.product_id !== null && where.wyz_code !== null && where.dot !== null && where.stock !== null && where.price !== null && where.warehouse_id !== null && where.shelfItem_id !== null)


            const _model = { products: newValue }

            // console.log("_model",_model)

            let res
            if (configModal.mode === "add") {
                res = await API.post(`/shopProductsHoldWYZauto/add`, _model)
            } else if (configModal.mode === "edit") {
                // _model.status = checkedIsuse ? "active" : "block"
                if (checkedIsuse === false) {
                    res = await API.put(`/shopProductsHoldWYZauto/put/${idEdit}`, { stock: 0 })
                } else {
                    handleCancel()
                    form.resetFields()
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                    })
                }
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
                setLoading(false)
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
    const [businessTypeList, setBusinessTypeList] = useState([])

    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const businessTypeDataList = await getBusinessTypeDataListAll()
            setBusinessTypeList(businessTypeDataList)
        } catch (error) {

        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
    }

    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        // console.log('value onFinishSearch', value)
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
                        key: GetIntlMessages("สั่งซื้อสำเร็จครบถ้วน"),
                        // key: GetIntlMessages("normal-status"),
                        value: 1,
                        // value: "active",
                    },
                    {
                        key: GetIntlMessages("สั่งซื้อสำเร็จบางส่วน"),
                        // key: GetIntlMessages("blocked-status"),
                        value: 2,
                        // value: "block",
                    },
                    {
                        key: GetIntlMessages("ยกเลิก"),
                        // key: GetIntlMessages("delete-status"),
                        value: 0,
                        // value: "delete",
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

    /**
 * It gets the shop stock by id.
 * เรียกข้อมูล ประเภทสินค้าตาม Id ที่ส่งเข้ามา
 * @param {UUID} id - The id of the shopStock you want to get.
 * @returns The `getShopStockByid` function returns a Promise.
 */
    const getShopStockByid = async (id) => {
        const { data } = await API.get(`/shopStock/byid/${id}?filter_wyz_code=true`)
        return data.status == "success" ? isArray(data.data) ? data.data[0] : null : null
    }

    /**
 * It gets all the warehouses from the API and returns them as an array.
 * เรียกข้อมูล คลังสินค้า ทั้งหมด
 * @returns An array of objects.
 */
    const getShelfData = async () => {
        const { data } = await API.get(`/shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        return data.data.data
    }
    const getShopStockByAll = async () => {
        const { data } = await API.get(`/shopStock/all?limit=9999&page=1&sort=balance_date&order=asc`)
        return data.data.data
    }

    const addTable = (add) => {
        try {
            const defaultValue = {
                shop_stock_id: null,
                // sku: null,
                wyz_code: null,
                dot: null,
                warehouse_id: null,
                shelfItem_id: null,
                stock: null,
            }
            if (isFunction(add)) {
                add(defaultValue)
            }

        } catch (error) {

        }
    }

    /**rt
 * Given an array of objects, return the index or value of the object where the id property matches
 * the given id
 * @param arr - the array you want to search
 * @param id - The id of the object you want to find.
 * @param type - "index" or "value"
 * @returns The index of the array element that matches the id.
 */
    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }

    /**
     * @param arry - the array you want to check the ducplicate data
     * @param index - the index of incoming data
     */
    const validateDuplicateData = (arry, index, type) => {
        // let arry = [1, 2, 1, 3, 4, 3, 5];
        // console.log('arry', arry)

        const newArr = arry.filter(where => where.shop_stock_id !== null && where.wyz_code !== null && where.dot !== null && where.warehouse_id !== null && where.shelfItem_id !== null)

        let resultToReturn = false;
        let validatePrice = false;
        for (let i = 0; i < newArr.length; i++) { // nested for loop
            for (let j = 0; j < newArr.length; j++) {
                // prevents the element from comparing with itself
                if (i !== j) {
                    if (newArr[i].product_id === newArr[j].product_id && newArr[i].dot === newArr[j].dot && newArr[i].warehouse_id === newArr[j].warehouse_id && newArr[i].shelfItem_id === newArr[j].shelfItem_id) {
                        // duplicate element present                                
                        resultToReturn = true;
                        break;
                    } else if (type && newArr[i].product_id === newArr[j].product_id && newArr[i].dot === newArr[j].dot && newArr[i].wyz_code === newArr[j].wyz_code && newArr[i].price !== null && newArr[j].price !== null && newArr[i].price !== newArr[j].price) {
                        validatePrice = true
                    }
                }
            }
            // terminate outer loop                                                                      
            if (resultToReturn) {
                break;
            }
            if (validatePrice) {
                break;
            }

        }
        if (resultToReturn) {
            message.warn("ไม่สามารถเลือกได้เนื่องจาก เป็นสินค้าเดียวกัน / dot เดียวกัน / มาจากคลังที่อยู่เดียวกัน / และชั้นวางเดียวกัน")
            arry[index].shelf_list = []
            arry[index].warehouse_list = []

            arry[index].shelfItem_id = null
            arry[index].amount = null
            arry[index].warehouse_id = null
            arry[index].balance = null
            arry[index].dot = null
            arry[index].price = null
            arry[index].stock = null

            // form.setFieldsValue({ products: arry })
        }
        if (validatePrice) {
            message.warn("ราคาไม่ตรงกัน เนื่องจากมี dot / Wyz code และ สินค้าชิ้นเดียวกัน ที่มีการใส่ราคาไว้แล้ว")
            arry[index].price = null
        }
        form.setFieldsValue({ products: arry })
    }


    const getArrListValue = (index, type) => {
        const { products } = form.getFieldValue();
        if (products && !isPlainObject(products[index])) products = {};

        return isArray(products) ? products[index][type] ?? [] : []
    }

    const getValue = (index, type) => {
        const { products } = form.getFieldValue();
        if (products && !isPlainObject(products[index])) products = {};
        return isArray(products) ? products[index][type] ?? "" : ""
    }

    const handleSearchShopStock = async (value, index) => {

        const { products } = form.getFieldsValue();
        if (isPlainObject(products[index])) {
            if (value && value.length >= 3) {
                const { data } = await API.get(`/shopStock/all?limit=10&page=1&filter_wyz_code=true&search=${value}`);
                products[index].products_list = data.status == "success" ? data.data.data : []
            }
        } else {
            products[index] = {}
        }

        form.setFieldsValue({
            products
        })

    };

    /**
 * Given a value and index, select the product at that index in the products array.
 * @param {string} value - The value of the selected option.
 * @param {number} index - The index of the selected product.
 */
    const selectProduct = async (value, index) => {
        try {
            // console.log('value', value, index)
            const shopStock = await getShopStockByid(value);

            // console.log('product', shopStock.ShopProduct.Product)
            // console.log('shopStock', shopStock)

            const shopProductPrice = get(shopStock, `ShopProduct.price`, null);
            // console.log('shopProductPrice', get(shopStock, `Product.price`, null))

            const dot_mfd_list = []
            // console.log('shopStock.warehouse_detail', shopStock.warehouse_detail)
            if (isArray(shopStock.warehouse_detail)) {
                shopStock.warehouse_detail.forEach(e => {
                    const dot_mfd = get(e, `shelf.dot_mfd`, "-");
                    if (dot_mfd) {
                        const _find = dot_mfd_list.find(where => where == dot_mfd)
                        if (!_find) dot_mfd_list.push(dot_mfd)
                    }
                });
            }
            // console.log('dot_mfd_list', dot_mfd_list)
            const { products } = form.getFieldsValue();
            products[index].dot_mfd_list = dot_mfd_list;
            // products[index].sku = get(shopStock, `ShopProduct.Product.other_details.sku`, "-");
            products[index].wyz_code = get(shopStock, `ShopProduct.Product.wyz_code`,  shopStock.ShopProduct.Product.other_details?.sku ??  "-");
            products[index].price_per_unit = get(shopProductPrice, `suggasted_re_sell_price.retail`, 0);
            products[index].product_id = shopStock.product_id;
            products[index].shelf_list = []
            products[index].warehouse_list = []

            products[index].shelfItem_id = null
            products[index].amount = null
            products[index].warehouse_id = null
            products[index].balance = null
            products[index].dot = null
            products[index].price = null
            products[index].stock = null
            form.setFieldsValue({
                products
            })

        } catch (error) {
            console.log('error', error)
        }
    }

    /**
 * This function is used to set the value of the dot_mfd field in the form.
 * @param _value - the value of the dot_mfd field
 * @param index - the index of the service product in the list of service products
 */
    const selectDotMfd = (_value, index) => {
        const value = _value !== "-" ? _value : null;

        const { products } = form.getFieldsValue();
        const { products_list, shop_stock_id, dot, warehouse_id, shelfItem_id, product_id } = products[index];

        const shelf_list = [];
        if (isArray(products_list) && products_list.length > 0) {
            const findIndex = products_list.findIndex(where => where.id == shop_stock_id)
            if (findIndex != -1) {
                const { warehouse_detail } = products_list[findIndex];
                if (isArray(warehouse_detail)) {
                    const _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == value);
                    const warehouse_list = []

                    if (_filter.length > 1) {
                        // console.log('_filter', _filter)
                        _filter.forEach(e => {
                            const { warehouse, shelf } = e;
                            const _where = whereIdArray(shelfDataAll, warehouse);
                            if (_where && isPlainObject(shelf)) {
                                if (!whereIdArray(warehouse_list, _where.id)) warehouse_list.push(_where)
                            }
                        });

                        if (warehouse_list.length === 1) {
                            _filter.forEach(e => {
                                const { warehouse, shelf } = e;
                                const _where = whereIdArray(shelfDataAll, warehouse);
                                _where.shelf.forEach(e => { if (shelf.item === e.code) shelf_list.push(e); });
                            });
                        }

                        products[index].warehouse_list = warehouse_list;
                        products[index].shelfItem_id = null;
                        products[index].warehouse_id = (warehouse_list.length === 1) ? warehouse_list[0].id : null;
                        products[index].balance = null;


                    } else if (_filter.length === 1) {
                        if (isPlainObject(_filter[0])) {
                            const { warehouse, shelf } = _filter[0];
                            const _where = whereIdArray(shelfDataAll, warehouse);
                            if (_where && isPlainObject(shelf)) {
                                _where.shelf.forEach(e => { if (shelf.item === e.code) shelf_list.push(e); });
                                products[index].warehouse_list = [_where];
                                products[index].shelfItem_id = shelf.item;
                                products[index].warehouse_id = _where.id;
                                products[index].balance = shelf.balance;
                            }
                        }

                    }
                }
            }
        }

        products[index].shelf_list = shelf_list
        products[index].price = null
        products[index].stock = null
        form.setFieldsValue({
            products
        })

        if (products.length > 1) {

            if (index !== 0 && products[index].product_id && products[index].dot && products[index].warehouse_id && products[index].shelfItem_id) {
                validateDuplicateData(products, index)
            }
        }
    }
    const selectWarehouse = (value, index) => {
        const { products } = form.getFieldsValue();
        const { products_list, dot, warehouse_id, shop_stock_id } = products[index];
        const shelf_list = [];
        const warehouse = whereIdArray(shelfDataAll, warehouse_id)

        // console.log('products_list selectWarehouse', products_list)

        if (isArray(products_list) && products_list.length > 0) {
            const findIndex = products_list.findIndex(where => where.id == shop_stock_id)
            if (findIndex != -1) {
                const { warehouse_detail } = products_list[findIndex];
                // console.log('warehouse_detail', warehouse_detail)
                const _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == dot && warehouse_id === where.warehouse);
                // console.log('_filter', _filter)
                if (_filter.length > 1) {
                    _filter.forEach(e => {
                        const _find = warehouse.shelf.find(where => where.code === e.shelf.item)
                        if (_find) shelf_list.push(_find);
                    });
                    products[index].shelfItem_id = null
                    products[index].balance = null
                } else if (_filter.length === 1) {
                    //  console.log('_filter[0]', _filter[0])
                    const e = _filter[0]
                    const _find = warehouse.shelf.find(where => where.code === e.shelf.item)
                    if (_find) shelf_list.push(_find);
                    products[index].shelfItem_id = e.shelf.item
                    products[index].balance = e.shelf.balance
                }

            }
        }

        products[index].shelf_list = shelf_list
        products[index].price = null
        products[index].stock = null
        form.setFieldsValue({
            products
        })

        if (products.length > 1) {

            if (index !== 0 && products[index].product_id && products[index].dot && products[index].warehouse_id && products[index].shelfItem_id) {
                validateDuplicateData(products, index)
            }
        }
    }

    const selectShelfCode = (value, index) => {
        const { products } = form.getFieldsValue();
        const { products_list, dot, warehouse_id, shop_stock_id } = products[index];
        if (isArray(products_list) && products_list.length > 0) {
            const findIndex = products_list.findIndex(where => where.id == shop_stock_id)
            if (findIndex != -1) {
                const { warehouse_detail } = products_list[findIndex];
                const _filter = warehouse_detail.filter(where => where.shelf.dot_mfd == (dot != "-" ? dot : null) && warehouse_id === where.warehouse);
                const _find = _filter.find(where => where.shelf.item === value);
                if (_find) products[index].balance = _find.shelf.balance
            }
        }

        products[index].price = null
        products[index].stock = null
        form.setFieldsValue({
            products
        })

        if (products.length > 1) {

            if (index !== 0 && products[index].product_id && products[index].dot && products[index].warehouse_id && products[index].shelfItem_id) {
                validateDuplicateData(products, index)
            }
        }
    }

    const onBlurAmountStock = (value, index) => {
        const { products } = form.getFieldValue();
        const product_data = products[index];
        const balance = isNaN(product_data.balance) ? 0 : Number(product_data.balance)
        const amount = Number(value)
        if (balance < amount) {
            products[index].stock = null
            message.warn("จำสินค้าในคลังมีน้อยกว่าจำนวนที่ท่านต้องการ")
        }
        // const amount = Number(value)

        form.setFieldsValue({
            products
        })
    }
    const onBlurPrice = async (value, index) => {
        const { products } = form.getFieldValue();
        validateDuplicateData(products, index, "price")
    }


    return (
        <>

            <div id="page-manage">
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

                <ModalFullScreen
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data"): configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} WYZauto`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view", }}
                // loading={loading}
                >
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 19 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >

                        {configModal.mode !== "add" ?
                            <Form.Item name="isuse" label={GetIntlMessages("status")} labelCol={4}>
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                            </Form.Item> : null
                        }

                        <Form.List name="products">
                            {(fields, { add, remove }) => (

                                <>

                                    {configModal.mode == "add" ?
                                        <div className="pb-3" id="add-plus-outlined">
                                            <div style={{ textAlign: "end" }}>
                                                <Button onClick={() => addTable(add)} icon={<PlusOutlined />}>
                                                    เพิ่มรายการ
                                                </Button>
                                            </div>
                                        </div>
                                        : null}

                                    <div id='data-table-wyz-auto'>
                                        <div className='table-responsive'>
                                            <table className="table table-bordered">
                                                <thead>
                                                    <tr>
                                                        <th>#</th>
                                                        <th>{GetIntlMessages(`รหัสสินค้า`)}</th>
                                                        <th>{GetIntlMessages(`WYZ Code`)}</th>
                                                        <th>{GetIntlMessages(`product-name`)}</th>
                                                        {/* <th>{GetIntlMessages(`หน่วยสินค้า`)}</th> */}
                                                        <th>{GetIntlMessages(`ราคา/หน่วย`)}</th>
                                                        <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                                        <th>{GetIntlMessages(`คลังที่อยู่`)}</th>
                                                        <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th>
                                                        <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th>
                                                        <th>{GetIntlMessages(`amount`)}</th>
                                                        <th>{GetIntlMessages(`ราคาบน WYZ`)}</th>
                                                        {/* <th>{GetIntlMessages(`ลดเงิน`)}</th>
                                                        <th>{GetIntlMessages(`ช่างซ่อม`)}</th> */}
                                                        {configModal.mode == "add" ? <th>{GetIntlMessages(`manage`)}</th> : null}
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
                                                                            name={[field.name, "shop_stock_id"]}
                                                                            fieldKey={[field.fieldKey, "shop_stock_id"]}
                                                                            noStyle
                                                                        >
                                                                            <Select
                                                                                showSearch
                                                                                showArrow={false}
                                                                                onSearch={(value) => handleSearchShopStock(value, index)}
                                                                                onChange={(value) => selectProduct(value, index)}
                                                                                filterOption={false}
                                                                                notFoundContent={null}
                                                                                style={{ width: "100%" }}
                                                                                disabled={configModal.mode !== "add"}
                                                                            >
                                                                                {getArrListValue(index, "products_list").map((e, i) => <Select.Option value={e.id} key={`product-code-${i}-${e.id}`}>{get(e, `ShopProduct.Product.master_path_code_id`, "-")}</Select.Option>)}
                                                                            </Select>
                                                                        </Form.Item>             
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "wyz_code"]}
                                                                            fieldKey={[field.fieldKey, "wyz_code"]}
                                                                            noStyle
                                                                        >
                                                                            {getValue(index, "wyz_code")}
                                                                        </Form.Item>
                                                                    </td>
                                                                    {/* <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "sku"]}
                                                                            fieldKey={[field.fieldKey, "sku"]}
                                                                            noStyle
                                                                        >
                                                                            {getValue(index, "sku")}
                                                                        </Form.Item>
                                                                    </td> */}
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "shop_stock_id"]}
                                                                            fieldKey={[field.fieldKey, "shop_stock_id"]}
                                                                            noStyle
                                                                        >
                                                                            <Select
                                                                                showSearch
                                                                                showArrow={false}
                                                                                onSearch={(value) => handleSearchShopStock(value, index)}
                                                                                onChange={(value) => selectProduct(value, index)}
                                                                                filterOption={false}
                                                                                notFoundContent={null}
                                                                                style={{ width: "100%" }}
                                                                                disabled={configModal.mode !== "add"}
                                                                            >
                                                                                {getArrListValue(index, "products_list").map(e => <Select.Option value={e.id} key={`product-name-${e.id}`}>{get(e, `ShopProduct.Product.product_name.${[locale.locale]}`, "-")}</Select.Option>)}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    {/* <td>
                                                {getValue(index, "unit")}
                                             </td> */}
                                                                    <td style={{ textAlign: "end" }}>
                                                                        {Number(getValue(index, "price_per_unit")).toLocaleString()}
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "dot"]}
                                                                            fieldKey={[field.fieldKey, "dot"]}
                                                                            noStyle
                                                                        >
                                                                            <Select
                                                                                showArrow={false}
                                                                                showSearch
                                                                                filterOption={(input, option) =>
                                                                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                                                }
                                                                                style={{ width: "100%" }}
                                                                                onChange={(value) => selectDotMfd(value, index)}
                                                                                disabled={configModal.mode !== "add"}
                                                                            >
                                                                                {getArrListValue(index, "dot_mfd_list").map(e => <Select.Option value={e} key={`dot-mfd-${index}-${e}`}>{e}</Select.Option>)}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "warehouse_id"]}
                                                                            fieldKey={[field.fieldKey, "warehouse_id"]}
                                                                            noStyle
                                                                        >
                                                                            <Select onChange={(value) => selectWarehouse(value, index)} style={{ width: "100%" }} disabled={configModal.mode !== "add"}>
                                                                                {/* <Select onChange={(value) => selectWarehouse(value, index)} style={{ width: "100%" }} disabled={getValue(index, "id") || mode == "view"}> */}
                                                                                {getArrListValue(index, "warehouse_list").map(e => <Select.Option value={e.id} key={`warehouse-${index}-${e.id}`}>{e.name[locale.locale]}</Select.Option>)}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "shelfItem_id"]}
                                                                            fieldKey={[field.fieldKey, "shelfItem_id"]}
                                                                            noStyle
                                                                        >
                                                                            <Select onChange={(value) => selectShelfCode(value, index)} style={{ width: "100%" }} disabled={configModal.mode !== "add"}>
                                                                                {/* <Select onChange={(value) => selectShelfCode(value, index)} style={{ width: "100%" }} disabled={getValue(index, "id") || mode == "view"}> */}
                                                                                {getArrListValue(index, "shelf_list").map(e => <Select.Option value={e.code} key={`shelf-${index}-${e.code}`}>{e.name[locale.locale]}</Select.Option>)}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td style={{ textAlign: "end" }}>
                                                                        {Number(getValue(index, "balance")).toLocaleString()}
                                                                    </td>
                                                                    <td>
                                                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                                                            <span style={{ color: "red" }}>*</span>
                                                                            <Form.Item
                                                                                {...field}
                                                                                validateTrigger={['onChange', 'onBlur']}
                                                                                name={[field.name, "stock"]}
                                                                                fieldKey={[field.fieldKey, "stock"]}
                                                                                noStyle
                                                                            >
                                                                                {/* <Input type={"number"} onBlur={(event) => onBlurAmount(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} /> */}
                                                                                <Input type={"number"} min={0} onBlur={(event) => onBlurAmountStock(event.target.value, index)} disabled={configModal.mode !== "add"} />
                                                                            </Form.Item>
                                                                        </div>

                                                                    </td>
                                                                    <td>
                                                                        <div style={{ display: "flex", flexDirection: "row" }}>
                                                                            <span style={{ color: "red" }}>*</span>
                                                                            <Form.Item
                                                                                {...field}
                                                                                validateTrigger={['onChange', 'onBlur']}
                                                                                name={[field.name, "price"]}
                                                                                fieldKey={[field.fieldKey, "price"]}
                                                                                rules={[{ require: true, message: GetIntlMessages("please-fill-out") }]}
                                                                                noStyle
                                                                            >
                                                                                {/* <Input type={"number"} onBlur={(event) => onBlurAmount(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} /> */}
                                                                                <Input type={"number"} min={0} disabled={configModal.mode !== "add"} onBlur={(event) => onBlurPrice(event.target.value, index)} />
                                                                            </Form.Item>
                                                                        </div>

                                                                    </td>

                                                                    {/* <td style={{ textAlign: "end" }}>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "discount"]}
                                                                            fieldKey={[field.fieldKey, "discount"]}
                                                                        >
                                                                            <Input type={"number"} onBlur={(event) => onBlurDiscount(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} />
                                                                        </Form.Item>
                                                                    </td>
                                                                    <td>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "repairman"]}
                                                                            fieldKey={[field.fieldKey, "repairman"]}
                                                                        >
                                                                            <Input onBlur={(event) => onBlurRepairman(event.target.value, index)} disabled={mode === "view" || type == 2 || type == 3} />
                                                                        </Form.Item>
                                                                    </td> */}
                                                                    {configModal.mode == "add" ?
                                                                        <td>

                                                                            {/* <Button onClick={() => removeListServiceProduct(remove, field.name, index)} icon={<MinusCircleOutlined />}>
                                                                                ลบรายการ
                                                                            </Button> */}
                                                                            <Button onClick={() => remove(field.name)} icon={<MinusCircleOutlined />}>
                                                                                ลบรายการ
                                                                            </Button>

                                                                        </td>
                                                                        : null}
                                                                </tr>
                                                            )) :
                                                            <tr>
                                                                <td colspan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                                                            </tr>
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Form.List>



                    </Form>
                </ModalFullScreen>

            </div>
        </>
    )
}

export default WyzAutoManagement
