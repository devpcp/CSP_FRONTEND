import { useState, useEffect } from 'react'
import { Button, Form, Input, message, Select, Switch, Row, Col, AutoComplete, Divider, Space, Modal, InputNumber, Tooltip, Tabs, Typography, Table } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import SortingData from '../../shares/SortingData'
import CompleteSize from './Components.Modal.CompleteSize'
import ModalFullScreen from '../../shares/ModalFullScreen';
import API from '../../../util/Api'
import { isArray, isFunction, isPlainObject, debounce } from 'lodash';
import { PlusOutlined, SwitcherOutlined, InfoCircleTwoTone, TagsOutlined, SearchOutlined, MinusCircleOutlined, FileTextOutlined, TableOutlined } from '@ant-design/icons';
import Fieldset from '../../shares/Fieldset';
import moment from 'moment';
import TextArea from 'antd/lib/input/TextArea';
import TagsData from "../../../routes/Setting/TagsData"
import ProductWarehouse from "./Components.Modal.ProductWarehouse"

const ComponentsModalProduct = ({ form, mode, checkedOkAndCancle, status, checkedIsuse, getCheckOkAndCancle, switchTireStatus, checkedTireStatus }) => {

    const [loading, setLoading] = useState(false)
    const [loadingProduct, setLoadingProduct] = useState(false)

    const { authUser } = useSelector(({ auth }) => auth);
    const { locale } = useSelector(({ settings }) => settings);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const { productModelType, vehicleType, productPurchaseUnitTypes } = useSelector(({ master }) => master);

    const { oe_tire_status_checked, runflat_tire_checked, others_tire_detail_checked } = checkedTireStatus
    const disabledSomChaiShop = authUser.UsersProfile?.shop_id === "1a523ad4-682e-4db2-af49-d54f176a84ad" && mode === "edit" && permission_obj.update === 1 ? true : false
    const [showModalTagsData, setShowModalTagsData] = useState(false);
    const [checkShopCanEditData, setcheckShopCanEditData] = useState(false);
    const [isSelectPriceNameModalVisible, setIsSelectPriceNameModalVisible] = useState(false);
    const [indexSelectPriceName, setIndexSelectPriceName] = useState(0);
    const [showModalProductWarehouse, setShowModalProductWarehouse] = useState(false);
    const [listIndex, setListIndex] = useState(0);
    const [listData, setListData] = useState([]);

    useEffect(() => {
        initProductTypeGroup(form)
        getMasterData()
        checkedOKCancle(checkedOkAndCancle)
        checkedMode()
        setResultSearchData([])
        setProductAllList([])
        setProductTypeList([])
        setProductModelTypeList([])
        checkShopCanEdit()
    }, [form, checkedOkAndCancle, mode, productCompleteSize])

    const checkedFunctionTireStatus = (value, type) => {
        if (switchTireStatus && isFunction(switchTireStatus)) {
            switchTireStatus(value, type)
        }
    }

    const checkedOKCancle = (statusValue) => {
        if (statusValue == 0) {
            setProductAllList([])
            setProductTypeList([])
            setProductModelTypeList([])
            setOnDisabledProductIdChange(false)
            setCheckSkuDisable(false)
            setUserTyping(false)
            if (getCheckOkAndCancle && isFunction(getCheckOkAndCancle)) {
                getCheckOkAndCancle(null)
            }
        } else {
            setProductTypeList([])
            setProductModelTypeList([])
            setCheckSkuDisable(false)
        }

    }
    const checkedMode = async () => {
        if (mode == "edit" || mode == "view") {
            const { product_type_group_id, product_type_id } = form.getFieldValue()
            setProductTypeList(await getProductTypeListAll(product_type_group_id ?? ""))
            if (product_type_id) {
                setProductModelTypeList(await getProductModelTypeListAll(product_type_id ?? ""))
            }
        }

    }

    const [shopProductAllList, setShopProductAllList] = useState([])
    const [productAllList, setProductAllList] = useState([])
    const [productTypeList, setProductTypeList] = useState([])
    const [productBrandList, setProductBrandList] = useState([])
    const [productModelTypeList, setProductModelTypeList] = useState([])
    const [productCompleteSize, setProductCompleteSizeList] = useState([])
    const [productTypeGroupAllList, setProductTypeGroupAll] = useState([])
    const [resultSearchData, setResultSearchData] = useState([])
    const [onDisabledProductIdChange, setOnDisabledProductIdChange] = useState(false);
    const [checkSkuDisable, setCheckSkuDisable] = useState(false);
    const [shopWareHouseList, setShopWareHouseList] = useState([])
    const [shopShelfList, setShopShelfList] = useState([])
    const [tagsList, setTagsList] = useState([])

    const getMasterData = async () => {
        try {
            const promise1 = getProductBrandListAll(); // ยี่ห้อสินค้า
            const promise2 = getProductCompleteSizeListAll(); // ขนาดไซส์สำเร็จรูป
            const promise3 = getShopWareHouseListAll(); // คลังสินค้า
            const promise4 = getTagsListAll(); // แท็ก

            Promise.all([promise1, promise2, promise3, promise4,]).then((values) => {
                // console.log(values);
                setProductBrandList(values[0])
                setProductCompleteSizeList(values[1])
                setShopWareHouseList(values[2])
                setTagsList(values[3])
            });
        } catch (error) {

        }
    }


    /* เรียกข้อมูล ยี่ห้อสินค้า ทั้งหมด */
    const getProductBrandListAll = async () => {
        // const { data } = await API.get(`/productBrand/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
        const { data } = await API.get(`/productBrand/all?limit=999999&page=1&sort=code_id&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล Model รุ่น ทั้งหมด */
    const getProductModelTypeListAll = async (product_type_id = "", product_brand_id = "") => {
        // const { data } = await API.get(`/productModelType/all?limit=999999&page=1&sort=code_id&order=asc&which=${(status === "management") ? "michelin data" : "my data"}`)
        const { data } = await API.get(`productModelType?sort=code_id&order=asc${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}`)
        // const { data } = await API.get(`/productModelType/all?sort=code_id&order=asc`)
        // const { data } = await API.get(`/productModelType/all?sort=code_id&order=asc${product_type_id ? `&product_type_id=${product_type_id}` : ""}`)
        return data.data
    }

    /* เรียกข้อมูล ขนาดไซส์สำเร็จรูป ทั้งหมด */
    const getProductCompleteSizeListAll = async () => {
        // const { data } = await API.get(`/productCompleteSize/all?limit=999999&page=1&sort=code_id&order=asc&which=${(status === "management") ? "michelin data" : "my data"}`)
        const { data } = await API.get(`/productCompleteSize/all?limit=999999&page=1&sort=complete_size_name.th&order=asc`)
        return data.data
    }
    /* เรียกข้อมูล สินค้าจากร้าน ทั้งหมด */
    const getShopProductListAll = async () => {
        const { data } = await API.get(`/shopProducts/all?limit=9999&page=1&sort=start_date&order=asc&status=active`)
        // console.log('data.data', data.data.data);
        return data.data.data
    }
    /* เรียกข้อมูล สินค้า ทั้งหมด */
    // const getProductListAll = async () => {
    //     const { data } = await API.get(`/product/all?limit=9999&page=1&sort=master_path_code_id&order=asc&status=active`)
    //     console.log('data.data', data.data.data);
    //     return data.data.data
    // }
    /* เรียกข้อมูล กลุ่มสินค้า ทั้งหมด */
    const getProductTypeGroupAll = async () => {
        const { data } = await API.get(`/productTypeGroup/all?sort=code_id&order=asc`)
        return data.status === "success" ? data.data.data ?? [] : []
    }
    /* เรียกข้อมูล ประเภทสินค้า ทั้งหมด */
    const getProductTypeListAll = async (product_type_group_id = "") => {
        const { data } = await API.get(`/productType/all?sort=code_id&order=asc&status=active${product_type_group_id ? `&type_group_id=${product_type_group_id}` : ""}`)
        return data.status === "success" ? data.data.data ?? [] : []
    }
    /* เรียกข้อมูล คลัง ชั้น ทั้งหมด */
    const getShopWareHouseListAll = async () => {
        const { data } = await API.get(`/shopWarehouses/all?limit=99999&page=1&sort=code_id&order=asc`)
        return data.status === "success" ? data.data.data ?? [] : []
    }
    /* เรียกข้อมูล คลัง ชั้น ทั้งหมด */
    const getTagsListAll = async () => {
        const { data } = await API.get(`/shopTags/all?limit=99999&page=1&sort=run_no&order=asc&status=default`)
        return data.status === "success" ? data.data.data ?? [] : []
    }


    const callBackOptionsData = (modeStatus, arrData) => {
        if (modeStatus === 'reset' && mode === "add") {
            form.resetFields()
            form.setFieldsValue({ productId: null, ShopProductId: null })
            setProductAllList([])
            setProductTypeList([])
            setProductModelTypeList([])
            setCheckSkuDisable(false)
            setResultSearchData([])
            setShopProductAllList([])
            disabledWhenProductIdChange()
        } else if (modeStatus === 'search') {
            setProductAllList(arrData)
        }
    }
    const callBackSelectData = async (arrSelectData, arrShopData) => {
        // onChangeTypeGroup(arrSelectData.ProductType.type_group_id)

        if (arrSelectData.other_details && arrSelectData.other_details.sku) {
            setCheckSkuDisable(status == "productMaster" ? false : true)
        } else {
            setCheckSkuDisable(status == "productMaster" ? false : false)
        }
        const model = {
            productId: arrSelectData.id,
            product_code: arrSelectData.product_code === undefined || arrSelectData.product_code === null ? arrSelectData.master_path_code_id : arrSelectData.product_code,
            product_type_group_id: arrSelectData.ProductType ? arrSelectData.ProductType.type_group_id ?? null : null,
            product_type_id: arrSelectData.product_type_id,
            sku: arrSelectData.other_details.sku,
            cci_code: arrSelectData.other_details.cci_code,
            ccid_code: arrSelectData.other_details.ccid_code,
            cad_code: arrSelectData.other_details.cad_code,
            discount: arrSelectData.other_details.discount,
            position_front_and_rear: arrSelectData.other_details.position_front_and_rear,
            sourcing_manufacturing: arrSelectData.other_details.sourcing_manufacturing,
            tl_and_tt_index: arrSelectData.other_details.tl_and_tt_index,
        }
        setProductAllList([arrSelectData])
        form.setFieldsValue({ ...arrSelectData, ...model, initOtherDetails: arrSelectData.other_details, product_bar_code: arrShopData.product_bar_code })
        // form.setFieldsValue({ ...arrSelectData,productId : arrSelectData.id,})
        if (status == "productMaster" && arrSelectData.other_details.central_price && isPlainObject(arrSelectData.other_details.central_price)) {
            form.setFieldsValue({
                suggasted_re_sell_price_retail: arrSelectData.other_details.central_price.suggasted_re_sell_price.retail,
                suggasted_re_sell_price_wholesale: arrSelectData.other_details.central_price.suggasted_re_sell_price.wholesale,
                suggested_online_price_retail: arrSelectData.other_details.central_price.suggested_online_price.retail,
                suggested_online_price_wholesale: arrSelectData.other_details.central_price.suggested_online_price.wholesale,
                b2b_price_retail: arrSelectData.other_details.central_price.b2b_price.retail,
                b2b_price_wholesale: arrSelectData.other_details.central_price.b2b_price.wholesale,
                credit_30_price_retail: arrSelectData.other_details.central_price.credit_30_price.retail,
                credit_30_price_wholesale: arrSelectData.other_details.central_price.credit_30_price.wholesale,
                credit_45_price_retail: arrSelectData.other_details.central_price.credit_45_price.retail,
                credit_45_price_wholesale: arrSelectData.other_details.central_price.credit_45_price.wholesale,
            })
        }


        if (arrSelectData.ProductType.type_group_id != undefined || arrSelectData.ProductType.type_group_id != null) {
            setProductTypeList(await getProductTypeListAll(arrSelectData.ProductType.type_group_id ?? ""))
            if (arrSelectData.product_type_id) {
                setProductModelTypeList(await getProductModelTypeListAll(arrSelectData.product_type_id ?? ""))
            }
        } else if (arrSelectData.product_type_id == undefined || arrSelectData.product_type_id == null) {
            setProductTypeList([])
            setProductModelTypeList([])
        }

        if (isPlainObject(arrShopData)) {
            form.setFieldsValue({
                ShopProductId: arrShopData.id,
                suggasted_re_sell_price_retail: arrShopData.price.suggasted_re_sell_price.retail,
                suggasted_re_sell_price_wholesale: arrShopData.price.suggasted_re_sell_price.wholesale,
                suggested_online_price_retail: arrShopData.price.suggested_online_price.retail,
                suggested_online_price_wholesale: arrShopData.price.suggested_online_price.wholesale,
                b2b_price_retail: arrShopData.price.b2b_price.retail,
                b2b_price_wholesale: arrShopData.price.b2b_price.wholesale,
                credit_30_price_retail: arrShopData.price.credit_30_price.retail,
                credit_30_price_wholesale: arrShopData.price.credit_30_price.wholesale,
                credit_45_price_retail: arrShopData.price.credit_45_price.retail,
                credit_45_price_wholesale: arrShopData.price.credit_45_price.wholesale,
                start_date: arrShopData.start_date ? moment(arrShopData.start_date) : null,
                end_date: arrShopData.end_date ? moment(arrShopData.end_date) : null,
            })
        }

        disabledWhenProductIdChange()

    }

    const debounceOnSearch = debounce((type, value) => handleSearchSelectReset(type, value), 1000)
    const handleSearchSelectReset = async (statusMode, value) => {
        try {
            setLoadingProduct(() => true)
            const productDataAll = []
            const shopDataAll = []

            if (statusMode === 'search') {
                const { data } = await API.get(`/product/all?search=${value}&limit=10&page=1&sort=master_path_code_id&order=asc&status=active`);
                // const shopData = await API.get(`/shopProducts/all?search=${value}&limit=10&page=1&sort=start_date&order=asc&status=active`);
                const [values1] = await Promise.all([data])

                if (values1.status === "success") {
                    productDataAll = data.data.data ? SortingData(data.data.data, `product_name.${locale.locale}`) ?? [] : []
                    // console.log('shopData', shopData)
                    setProductAllList(() => productDataAll)

                    // shopDataAll = shopData.data.data.data ? SortingData(shopData.data.data.data, `Product.product_name.${locale.locale}`) ?? [] : []
                    // setShopProductAllList(() => shopDataAll)

                    setResultSearchData(() => [productDataAll])

                }
            } else if (statusMode === 'select') {

                const formValue = form.getFieldsValue()
                if (isArray(productAllList) && productAllList.length > 0) {

                    const find = productAllList.find(where => where.master_path_code_id == value)
                    setProductAllList([find])
                    setResultSearchData([find])
                    // const findShopProduct = shopProductAllList.find(where => where.Product.master_path_code_id == value)

                    formValue.productId = find ? find.id : null
                    formValue.product_code = formValue.product_code === undefined || formValue.product_code === null ? find.master_path_code_id : formValue.product_code
                    // formValue.ShopProductId = findShopProduct ? findShopProduct.Product.id : null

                    formValue.wyz_code = find?.wyz_code ? find?.wyz_code ?? null : null

                    formValue.initOtherDetails = find.other_details ? find.other_details : null

                    if (find.other_details && find.other_details.sku) {
                        formValue.sku = find.other_details.sku
                        form.setFieldsValue(formValue)
                        setCheckSkuDisable(status == "productMaster" ? false : true)
                    } else {
                        setCheckSkuDisable(status == "productMaster" ? false : false)
                    }
                    if (formValue.productId !== null && formValue.ShopProductId == null) {

                        formValue.complete_size_id = find ? find.ProductCompleteSize ? find.ProductCompleteSize.id : null : null
                        formValue.rim_size = find ? find.rim_size : null
                        formValue.width = find ? find.width : null
                        formValue.hight = find ? find.hight : null
                        formValue.series = find ? find.series : null
                        formValue.load_index = find ? find.load_index : null
                        formValue.speed_index = find ? find.speed_index : null
                        // formValue.product_bar_code = findShopProduct ? findShopProduct.product_bar_code : null
                        formValue.product_type_group_id = find ? find.ProductType ? find.ProductType.type_group_id : null : null
                        formValue.product_type_id = find ? find.product_type_id : null
                        formValue.product_brand_id = find ? find.product_brand_id : null
                        formValue.product_model_id = find ? find.product_model_id : null
                        formValue.product_name = find ? find.product_name : null
                        formValue.custom_path_code_id = find ? find.custom_path_code_id : null

                        // formValue.sku = find ? find.other_details ? find.other_details.sku : null : null
                        formValue.cci_code = find ? find.other_details.cci_code : null
                        formValue.ccid_code = find ? find.other_details.ccid_code : null
                        formValue.cad_code = find ? find.other_details.cad_code : null
                        formValue.sourcing_manufacturing = find ? find.other_details.sourcing_manufacturing : null
                        formValue.position_front_and_rear = find ? find.other_details.position_front_and_rear : null
                        formValue.tl_and_tt_index = find ? find.other_details.tl_and_tt_index : null

                        formValue.discount = find ? find.other_details.discount : null

                        formValue.suggasted_re_sell_price_retail = find.other_details.central_price ? find.other_details.central_price.suggasted_re_sell_price.retail ?? null : null
                        formValue.suggasted_re_sell_price_wholesale = find.other_details.central_price ? find.other_details.central_price.suggasted_re_sell_price.wholesale : null

                        formValue.b2b_price_retail = find.other_details.central_price ? find.other_details.central_price.b2b_price.retail ?? null : null
                        formValue.b2b_price_wholesale = find.other_details.central_price ? find.other_details.central_price.b2b_price.wholesale ?? null : null

                        formValue.suggested_online_price_retail = find.other_details.central_price ? find.other_details.central_price.suggested_online_price.retail ?? null : null
                        formValue.suggested_online_price_wholesale = find.other_details.central_price ? find.other_details.central_price.suggested_online_price.wholesale ?? null : null

                        formValue.credit_30_price_retail = find.other_details.central_price ? find.other_details.central_price.credit_30_price.retail ?? null : null
                        formValue.credit_30_price_wholesale = find.other_details.central_price ? find.other_details.central_price.credit_30_price.wholesale ?? null : null

                        formValue.credit_45_price_retail = find.other_details.central_price ? find.other_details.central_price.credit_45_price.retail ?? null : null
                        formValue.credit_45_price_wholesale = find.other_details.central_price ? find.other_details.central_price.credit_45_price.wholesale ?? null : null

                        formValue.warehouse_id = find ? find.other_details.warehouse_id : null
                        formValue.shelf_code = find ? find.other_details.shelf_code : null
                        formValue.purchase_unit = find ? find.other_details.purchase_unit : null
                        formValue.sales_unit = find ? find.other_details.sales_unit : null
                        formValue.reorder_point = find ? find.other_details.reorder_point : null
                        formValue.over_qty_point = find ? find.other_details.over_qty_point : null

                        formValue.made_in = find ? find.other_details.made_in : null
                        formValue.tags = find ? find.other_details.tags : null
                        formValue.note = find ? find.other_details.note : null

                        formValue.latest_ini_cost = find ? find.latest_ini_cost : null
                        formValue.latest_ini_cost_vat = find ? find.latest_ini_cost_vat : null
                        formValue.latest_ini_code_id = find ? find.latest_ini_code_id : null
                        formValue.latest_ini_doc_date = find ? find.latest_ini_doc_date : null
                        formValue.product_total_value_no_vat = find ? find.other_details.product_total_value_no_vat : null
                        formValue.product_total_value_vat = find ? find.other_details.product_total_value_vat : null

                        formValue.standard_margin_retail_percent = find ? find.other_details.standard_margin_retail_percent : null
                        formValue.standard_margin_retail_bath = find ? find.other_details.standard_margin_retail_bath : null
                        formValue.standard_margin_wholesale_percent = find ? find.other_details.standard_margin_wholesale_percent : null
                        formValue.standard_margin_wholesale_bath = find ? find.other_details.standard_margin_wholesale_bath : null
                        // form.setFieldsValue(formValue)

                    }
                    else if (formValue.productId !== null && formValue.ShopProductId !== null) {

                        formValue.complete_size_id = find ? find.ProductCompleteSize ? find.ProductCompleteSize.id : null : null
                        formValue.rim_size = find ? find.rim_size : null
                        formValue.width = find ? find.width : null
                        formValue.hight = find ? find.hight : null
                        formValue.series = find ? find.series : null
                        formValue.load_index = find ? find.load_index : null
                        formValue.speed_index = find ? find.speed_index : null
                        // formValue.product_bar_code = findShopProduct ? findShopProduct.product_bar_code : null
                        formValue.product_type_group_id = find ? find.ProductType ? find.ProductType.type_group_id : null : null
                        formValue.product_type_id = find ? find.product_type_id : null
                        formValue.product_brand_id = find ? find.product_brand_id : null
                        formValue.product_model_id = find ? find.product_model_id : null
                        formValue.product_name = find ? find.product_name : null
                        formValue.custom_path_code_id = find ? find.custom_path_code_id : null

                        formValue.cci_code = find ? find.other_details.cci_code : null
                        formValue.ccid_code = find ? find.other_details.ccid_code : null
                        formValue.cad_code = find ? find.other_details.cad_code : null
                        formValue.sourcing_manufacturing = find ? find.other_details.sourcing_manufacturing : null
                        formValue.position_front_and_rear = find ? find.other_details.position_front_and_rear : null
                        formValue.tl_and_tt_index = find ? find.other_details.tl_and_tt_index : null
                        formValue.discount = find ? find.other_details.discount : null

                        // formValue.start_date = findShopProduct ? findShopProduct.start_date != null ? moment(findShopProduct.start_date) : null : null
                        // formValue.end_date = findShopProduct ? findShopProduct.end_date != null ? moment(findShopProduct.end_date) : null : null

                        // formValue.suggasted_re_sell_price_retail = findShopProduct ? findShopProduct.price.suggasted_re_sell_price.retail : null
                        // formValue.suggasted_re_sell_price_wholesale = findShopProduct ? findShopProduct.price.suggasted_re_sell_price.wholesale : null

                        // formValue.b2b_price_retail = findShopProduct ? findShopProduct.price.b2b_price.retail : null
                        // formValue.b2b_price_wholesale = findShopProduct ? findShopProduct.price.b2b_price.wholesale : null

                        // formValue.suggested_online_price_retail = findShopProduct ? findShopProduct.price.suggested_online_price.retail : null
                        // formValue.suggested_online_price_wholesale = findShopProduct ? findShopProduct.price.suggested_online_price.wholesale : null

                        // formValue.credit_30_price_retail = findShopProduct ? findShopProduct.price.credit_30_price.retail : null
                        // formValue.credit_30_price_wholesale = findShopProduct ? findShopProduct.price.credit_30_price.wholesale : null

                        // formValue.credit_45_price_retail = findShopProduct ? findShopProduct.price.credit_45_price.retail : null
                        // formValue.credit_45_price_wholesale = findShopProduct ? findShopProduct.price.credit_45_price.wholesale : null

                        // form.setFieldsValue(formValue)


                        formValue.warehouse_id = find ? find.other_details.warehouse_id : null
                        formValue.shelf_code = find ? find.other_details.shelf_code : null
                        formValue.purchase_unit = find ? find.other_details.purchase_unit : null
                        formValue.sales_unit = find ? find.other_details.sales_unit : null
                        formValue.reorder_point = find ? find.other_details.reorder_point : null
                        formValue.over_qty_point = find ? find.other_details.over_qty_point : null

                        formValue.made_in = find ? find.other_details.made_in : null
                        formValue.tags = find ? find.other_details.tags : null
                        formValue.note = find ? find.other_details.note : null

                        formValue.latest_ini_cost = find ? find.latest_ini_cost : null
                        formValue.latest_ini_cost_vat = find ? find.latest_ini_cost_vat : null
                        formValue.latest_ini_code_id = find ? find.latest_ini_code_id : null
                        formValue.latest_ini_doc_date = find ? find.latest_ini_doc_date : null
                        formValue.product_total_value_no_vat = find ? find.other_details.product_total_value_no_vat : null
                        formValue.product_total_value_vat = find ? find.other_details.product_total_value_vat : null

                        formValue.standard_margin_retail_percent = find ? find.other_details.standard_margin_retail_percent : null
                        formValue.standard_margin_retail_bath = find ? find.other_details.standard_margin_retail_bath : null
                        formValue.standard_margin_wholesale_percent = find ? find.other_details.standard_margin_wholesale_percent : null
                        formValue.standard_margin_wholesale_bath = find ? find.other_details.standard_margin_wholesale_bath : null

                    }
                    form.setFieldsValue(formValue)
                }

                disabledWhenProductIdChange()


                if (formValue.product_type_group_id) {
                    setProductTypeList(await getProductTypeListAll(formValue.product_type_group_id ?? ""))
                    if (formValue.product_type_id) {
                        setProductModelTypeList(await getProductModelTypeListAll(formValue.product_type_id ?? ""))
                    }
                } else {
                    setProductTypeList([])
                    setProductModelTypeList([])
                }
            } else if (statusMode === 'reset' && value.length <= 0 && mode === "add") {
                const formValue = form.getFieldsValue()
                formValue.productId = null
                formValue.shopProductId = null
                formValue.sku = null
                formValue.wyz_code = null
                formValue.custom_path_code_id = null
                formValue.product_code = null
                formValue.complete_size_id = null
                formValue.product_type_group_id = null
                formValue.rim_size = null
                formValue.width = null
                formValue.hight = null
                formValue.series = null
                formValue.load_index = null
                formValue.speed_index = null
                formValue.product_bar_code = null
                formValue.product_type_id = null
                formValue.product_brand_id = null
                formValue.product_model_id = null
                formValue.product_name = null
                formValue.cci_code = null
                formValue.ccid_code = null
                formValue.cad_code = null
                formValue.sourcing_manufacturing = null
                formValue.position_front_and_rear = null
                formValue.tl_and_tt_index = null
                formValue.discount = null

                formValue.suggasted_re_sell_price_retail = null
                formValue.suggasted_re_sell_price_wholesale = null

                formValue.b2b_price_retail = null
                formValue.b2b_price_wholesale = null

                formValue.suggested_online_price_retail = null
                formValue.suggested_online_price_wholesale = null

                formValue.credit_30_price_retail = null
                formValue.credit_30_price_wholesale = null

                formValue.credit_45_price_retail = null
                formValue.credit_45_price_wholesale = null

                form.setFieldsValue(formValue)
                setCheckSkuDisable(false)
                setResultSearchData([])
                setProductAllList([])
                setProductTypeList([])
                setProductModelTypeList([])
                disabledWhenProductIdChange()

            }
            setLoadingProduct(() => false)
        } catch (error) {
            // console.log('error :>> ', error);
            setLoadingProduct(() => false)
        }

    }


    const disabledWhenProductIdChange = () => {
        const formValue = form.getFieldValue()
        // const disabled = formValue.productId !== null || formValue.productId ? true : false
        const disabled = formValue.productId !== null ? true : false
        setOnDisabledProductIdChange(status == "productMaster" ? false : disabled)
    }

    const initProductTypeGroup = async (form) => {
        try {
            if (form) {
                const ProductTypeGroup = await getProductTypeGroupAll()
                setProductTypeGroupAll(ProductTypeGroup)

                const formValue = form.getFieldsValue()
                if (formValue[product_type_group_id]) {
                    const ProductTypeList = await getProductTypeListAll(formValue[product_type_group_id])
                    setProductTypeList(ProductTypeList)
                }
            }
        } catch (error) {

        }
    }

    const onChangeTypeGroup = async (value) => {
        try {
            console.log("fffff", form.getFieldValue("product_type_group_id"))
            if (value) {
                setProductModelTypeList([])
                const ProductTypeList = await getProductTypeListAll(value)
                setProductTypeList(ProductTypeList)
                form.setFieldsValue({ product_type_id: null, product_brand_id: null, product_model_id: null })
            } else {
                setProductTypeList([])
            }
        } catch (error) {

        }

    };

    const handeleChangeProductType = async (value) => {
        try {
            if (value) {
                // const ProductModelType = await getProductModelTypeListAll(value)
                // setProductModelTypeList(ProductModelType)
                setProductModelTypeList([])
                form.setFieldsValue({ product_brand_id: null, product_model_id: null })
            }
        } catch (error) {
            setProductModelTypeList([])
        }
    }
    const handleChangeProductBrand = async (value) => {
        try {
            const { product_type_id } = form.getFieldValue()
            if (value) {
                const ProductModelType = await getProductModelTypeListAll(product_type_id, value)
                setProductModelTypeList(ProductModelType)
                form.setFieldsValue({ product_model_id: null })
            }
        } catch (error) {
            setProductModelTypeList([])
        }
    }

    const getNameSelect = (item, label) => {
        return item[`${label}`][`${locale.locale}`] ?? item[`${label}`][`en`];
    }

    /*Generate Product name*/
    const [userTyping, setUserTyping] = useState(false);

    const checkUserTyping = (statusValue, callBackData) => {
        if (statusValue == true && callBackData.target.value.length > 0) {
            setUserTyping(true)
        } else {
            setUserTyping(false)
        }
    }

    const handleSelectCompleteSize = (value) => {
        try {

            var size = productCompleteSize.find(x => x.id == value).complete_size_name.th
            var split = size.split("/")
            var split2 = split[1].split(" ")[0]
            var split3 = split[1].split("R")[1]
            form.setFieldsValue({ width: split[0], series: split2, rim_size: split3 })
            const { product_name, product_model_id } = form.getFieldValue()
            if (!userTyping) {
                const find = productCompleteSize.find(where => where.id == value)
                let genName
                if (product_model_id && value) {
                    const findModel = productModelTypeList.find(where => where.id == product_model_id)
                    genName = `${find.complete_size_name[locale.locale]} ${findModel.model_name[locale.locale]}`
                } else if (value && !product_model_id) {
                    genName = `${find.complete_size_name[locale.locale]}`
                }
                // form.setFieldsValue({ product_name: { [formLocale == "th" ? "th" : "en"]: genName } })

            }
        } catch (error) {
            // console.log('error', error)
        }

    }
    const handleSelectModel = (value) => {
        try {
            const { product_name, complete_size_id } = form.getFieldValue()
            if (!userTyping) {
                const genName = ""
                const findModel = productModelTypeList.find(where => where.id == value)
                if (complete_size_id != undefined || complete_size_id != null) {
                    const find = productCompleteSize.find(where => where.id == complete_size_id)
                    genName = `${find.complete_size_name[locale.locale]} ${findModel.model_name[locale.locale]}`
                }
                // form.setFieldsValue({ product_name: { [formLocale]: genName.length > 0 ? genName : findModel.model_name[locale.locale] ?? null } })
            }
        } catch (error) {
            // console.log('error', error)
        }

    }
    /*End Generate Product name*/

    const [isModalVisibleCompleteSize, setIsModalVisibleCompleteSize] = useState(false);
    // const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuseCompleteSize, setCheckedIsuseCompleteSize] = useState(false);
    // const [clientSecret, setClientSecret] = useState(null);
    const [formCompleteSize] = Form.useForm();

    const handleOkCompleteSize = () => {
        formCompleteSize.submit()
    }

    const handleCancelCompleteSize = () => {
        formCompleteSize.resetFields()
        setIsModalVisibleCompleteSize(false)
    }

    const handleSelectWarehouse = (value) => {
        const data = shopWareHouseList.find(x => x.id === value)
        console.log("floor", data.shelf)
        setShopShelfList(data.shelf)
        console.log("aa", shopWareHouseList)
        console.log(value)
    }

    // const generatedClientSecret = () => {
    //     const random = randomstring.generate({
    //         length: 256,
    //         charset: 'alphabetic'
    //     })
    //     // console.log(`random`, random)
    //     setClientSecret(sha256(random))
    // }

    const callback = () => {
        message.success('บันทึกสำเร็จ');
        formCompleteSize.resetFields()
        setIsModalVisibleCompleteSize(false)
    }
    const onFinishCompleteSize = async (value) => {
        try {
            setLoading(true)
            // console.log(`value`, value)
            const model = {
                code_id: value.code_id,
                complete_size_name: value.complete_size_name,
            }
            // console.log(`model`, model)
            let res
            res = await API.post(`/productCompleteSize/add`, model)
            if (res.data.status == "successful") {
                callback()
                await getMasterData()
                form.setFieldsValue({ complete_size_id: res.data.data.id })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }
            setLoading(false)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailedCompleteSize = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const checkSku = (value) => {
        if (status == "productShop" && value) return true
    }

    const formTextAreaLayout = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 },
            xxl: { span: 4 }
        },
        wrapperCol: {
            xs: { span: 24 },
            xxl: { span: 18 }
        }
    }
    const formSwitchTire = {
        // labelAlign: "left",
        labelCol: {
            xs: { span: 8 },
            md: { span: 8 },
            // xxl: { span: 8 }
        },
        wrapperCol: {
            xs: { span: 24 },
            md: { span: 16 },
            // xxl: { span: 16 }
        }
    }

    const SpeedIndexLetters = [
        "J",
        "K",
        "L",
        "M",
        "N",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "H",
        "V",
        "W",
        "Y",
        "VR",
        "ZR",
        "ZR (Y)",
    ];

    const addComma = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    const handleCancelTagsModal = async () => {
        try {
            let data = await getTagsListAll();
            await setTagsList(data);
            await setShowModalTagsData(false)
        } catch (error) {
            console.log(error)
        }
    }

    const checkShopCanEdit = async () => {
        setcheckShopCanEditData(true)
        // let shop_id = authUser?.UsersProfile?.shop_id
        // switch (shop_id) {
        //     //SCH
        //     case "1a523ad4-682e-4db2-af49-d54f176a84ad":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //MCONT
        //     case "218660de-50d9-4175-a976-10ff2c00152e":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //MCONCX1
        //     case "d6bc0647-efa3-4006-8983-337f6797c20f":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //MCONCX2
        //     case "2698ee1c-82ca-4683-8d95-1dfecb3e4f15":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //MONTREE
        //     case "6471a29a-76c6-43eb-b805-169b605daf42":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //MONTREE
        //     case "d53c5ead-bc70-4952-b0fe-c171ccbc9cd0":
        //         setcheckShopCanEditData(true)
        //         break;
        //     //STV
        //     case "db945efe-17c8-4c43-a437-31204fe3b8af":
        //         setcheckShopCanEditData(true)
        //         break;
        //     default:
        //         setcheckShopCanEditData(false)
        //         break;
        // }
        // if (authUser?.id === "90f5a0a9-a111-49ee-94df-c5623811b6cc") {
        //     setcheckShopCanEditData(true)
        // }
    }

    const handleChangeTabs = (key) => {

    }

    const ProductDataTab = () => {
        return (
            <>
                <Row style={{ paddingBottom: "20px" }}>
                    <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลสินค้า`}>
                            <Row>

                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="master_path_code_id"
                                        type="text"
                                        label="รหัสสินค้า"
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out")
                                        }]}
                                    >
                                        <AutoComplete
                                            options={[{
                                                label: loadingProduct ? "กำลังโหลดข้อมูล...กรุณารอสักครู่" : productAllList.length == 0 ? "ค้นหาจากส่วนกลางหรือเพิ่มข้อมูลใหม่" : "รหัสสินค้าจากส่วนกลาง",
                                                options: productAllList.map(e => { return { 'key': e.id, 'value': e.master_path_code_id } })
                                            }] ?? []}
                                            placeholder="ค้นหาจากส่วนกลางหรือเพิ่มข้อมูลใหม่"
                                            disabled={status == "productMaster" ? mode == "view" : mode !== "add"}
                                            onSearch={(value) => debounceOnSearch("search", value)}
                                            onSelect={(value) => handleSearchSelectReset("select", value)}
                                            onClear={(value) => handleSearchSelectReset("reset", "")}
                                            allowClear={true}
                                        >
                                        </AutoComplete>

                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    <FormInputLanguage
                                        isInTable={false}
                                        icon={formLocale}
                                        label="ชื่อสินค้า"
                                        name="product_name"
                                        allowClear={checkShopCanEditData && mode === "edit" && permission_obj.update === 1 ? false : true}
                                        rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                                        disabled={status === "productMaster" ? mode === "view" : checkShopCanEditData && permission_obj.update === 1 ? mode === "view" : mode !== "add"}
                                        autoComplete
                                        callBackData={callBackOptionsData}
                                        callBackSelectData={callBackSelectData}
                                        searchData={resultSearchData}
                                        checkedOkAndCancle={checkedOkAndCancle}
                                        checkUserTyping={checkUserTyping} />
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="product_code"
                                        label="รหัสสินค้าจากโรงงาน"
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out")
                                        }]}
                                    >
                                        <Input disabled={status === "productShop" ? (mode != "add" || form.getFieldValue().productId) : mode === "view"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    {status == "productMaster" ?
                                        <Form.Item
                                            name="custom_path_code_id"
                                            label="Custom path code id"
                                        >
                                            <Input disabled={mode == "view" || checkSkuDisable} />
                                        </Form.Item>
                                        :
                                        <Form.Item
                                            name="product_bar_code"
                                            label="รหัสบาร์โค้ด"
                                            rules={[
                                                {
                                                    message: GetIntlMessages("only-number")
                                                },
                                            ]}
                                        >
                                            <Input disabled={mode == "view"} />
                                        </Form.Item>
                                    }
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item name="product_type_group_id" label="กลุ่มสินค้า"
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out")
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={status === "productMaster" ? mode === "view" : checkShopCanEditData && permission_obj.update === 1 ? mode === "view" : mode !== "add"}
                                            onChange={onChangeTypeGroup}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(productTypeGroupAllList) && productTypeGroupAllList.length > 0 ?
                                                productTypeGroupAllList.map((e, index) => (
                                                    <Select.Option value={e.id} key={index}>
                                                        {getNameSelect(e, "group_type_name")}
                                                    </Select.Option>
                                                ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item name="product_type_id" label="ประเภทสินค้า"
                                        rules={[{
                                            required: true,
                                            message: GetIntlMessages("please-fill-out")
                                        }]}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={status === "productMaster" ? mode === "view" : checkShopCanEditData && permission_obj.update === 1 ? mode === "view" : mode !== "add"}
                                            onChange={handeleChangeProductType}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(productTypeList) && productTypeList.length > 0 ? productTypeList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "type_name")}
                                                </Select.Option>
                                            )) : null}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="product_brand_id"
                                        label="ยี่ห้อสินค้า"
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            onChange={handleChangeProductBrand}
                                            disabled={status === "productMaster" ? mode === "view" : checkShopCanEditData && permission_obj.update === 1 ? mode === "view" : mode !== "add"}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(productBrandList) && productBrandList.length > 0 ? productBrandList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "brand_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="product_model_id"
                                        label="รุ่นสินค้า"
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={status === "productMaster" ? mode === "view" : checkShopCanEditData && permission_obj.update === 1 ? mode === "view" : mode !== "add"}
                                            onSelect={handleSelectModel}
                                            filterOption={(inputValue, option) => {
                                                console.log(option)
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}
                                        >
                                            {isArray(productModelTypeList) && productModelTypeList.length > 0 ? productModelTypeList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "model_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Fieldset>
                    </Col>
                </Row>
                <Row style={{ paddingBottom: "20px" }} hidden={form.getFieldValue("product_type_group_id") !== "da791822-401c-471b-9b62-038c671404ab"}>
                    <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลเฉพาะสินค้ายาง`}>
                            <Row>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="vehicle_types"
                                        label={GetIntlMessages("เหมาะกับประเภทรถ")}
                                    >
                                        <Select
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            mode='multiple'
                                            // onChange={handleChangeProductBrand}
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}
                                        >
                                            {isArray(vehicleType) && vehicleType.length > 0 ? SortingData(vehicleType, `type_name.${locale.locale}`).map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "type_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item name="complete_size_id" label="ขนาดไซส์สำเร็จรูป" rules={[{ required: form.getFieldValue("product_type_group_id") === "da791822-401c-471b-9b62-038c671404ab", message: GetIntlMessages("please-fill-out") }]}>
                                        <Select
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            onSelect={handleSelectCompleteSize}
                                            dropdownRender={menu =>
                                            (
                                                <>
                                                    {menu}
                                                    {status == "productMaster" ? <Divider style={{ margin: '8px 0' }} /> : null}
                                                    {mode != "view" ?
                                                        status == "productMaster" ?
                                                            <Space align="center" style={{ padding: '0 8px 4px' }}>
                                                                <Button type="dashed" onClick={() => setIsModalVisibleCompleteSize(true)} icon={<PlusOutlined />}>เพิ่มขนาดยาง</Button>
                                                            </Space>
                                                            : null

                                                        : null}
                                                </>
                                            )}
                                        >
                                            {productCompleteSize.length > 0 ? productCompleteSize.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {/* {e.complete_size_name["th"]} */}
                                                    {getNameSelect(e, "complete_size_name")}
                                                </Select.Option>
                                            ))
                                                : null}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        name="width"
                                        label="หน้ายาง"
                                    >
                                        <Input
                                            type="number"
                                            placeholder='ตัวอย่าง 255'
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                        // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        name="series"
                                        label="แก้มยาง"
                                    >
                                        <Input
                                            type="number"
                                            placeholder='ตัวอย่าง 65'
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                        // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        name="rim_size"
                                        label="ขอบยาง"
                                    >
                                        <Input
                                            type="number"
                                            placeholder='ตัวอย่าง 18'
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                        // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item name="load_index" label="ดัชนีน้ำหนักสินค้า">
                                        <AutoComplete
                                            allowClear={true}
                                            options={Array.from({ length: 127 }, (_, i) => 0 + i).map(
                                                (optionValue) => ({
                                                    value: optionValue,
                                                    label: optionValue.toString(),
                                                })
                                            )}
                                            filterOption={(inputValue, option) =>
                                                option.label
                                                    .toLowerCase()
                                                    .indexOf(inputValue.toLowerCase()) !== -1
                                            }
                                            placeholder="เลือกหรือพิมพ์ข้อมูล"
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                        // disabled={
                                        //     status == "productMaster"
                                        //         ? mode == "view"
                                        //         : mode !== "add" || onDisabledProductIdChange
                                        // }
                                        />
                                    </Form.Item>

                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item name="speed_index" label="ดัชนีความเร็ว">
                                        <AutoComplete
                                            allowClear={true}
                                            options={SpeedIndexLetters.map((optionValue) => ({
                                                value: optionValue,
                                            }))}
                                            filterOption={(inputValue, option) =>
                                                option.value
                                                    .toUpperCase()
                                                    .indexOf(inputValue.toUpperCase()) !== -1
                                            }
                                            placeholder="เลือกข้อมูล"
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={
                                            //     status == "productMaster"
                                            //         ? mode == "view"
                                            //         : mode !== "add" || onDisabledProductIdChange
                                            // }
                                            onChange={(value) => {
                                                if (value && value.toLowerCase() === value) {
                                                    form.setFieldsValue({ speed_index: value.toUpperCase() });
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        label="ตำแหน่งยาง"
                                        name="position_front_and_rear"
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            options={[
                                                { value: "Front", label: "ยางหน้า" },
                                                { value: "Rear", label: "ยางหลัง" },
                                                { value: "Front/Rear", label: "ทั้งหน้าและหลัง" },
                                            ]} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        label="สถานะยางใน"
                                        name="tl_and_tt_index"
                                    >
                                        <Select
                                            allowClear
                                            showSearch
                                            placeholder="เลือกข้อมูล"
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            options={[
                                                { value: "TT", label: "มียางใน (TT)" },
                                                { value: "TL", label: "ไม่มีมียางใน (TL)" },
                                            ]} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        {...formSwitchTire}
                                        label={GetIntlMessages("ยาง OE")}
                                    // name="oe_tier"
                                    >
                                        {/* <Switch disabled={status == "productMaster" ? mode == "view" : mode !== "add"} checked={oe_tire_status_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "oe_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" /> */}
                                        <Switch
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} 
                                            checked={oe_tire_status_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "oe_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        // labelAlign='left'
                                        // labelCol={{ xs: { span: 24 }, xxl: { span: 14 } }}
                                        // wrapperCol={{ xs: { span: 24 }, xxl: { span: 10 } }}
                                        label={GetIntlMessages("ยาง Runflat")}
                                    // name="runflat_tier"
                                    >
                                        <Switch
                                            disabled={!checkShopCanEditData ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} 
                                            checked={runflat_tire_checked}
                                            onChange={(bool) => checkedFunctionTireStatus(bool, "runflat_tire")}
                                            checkedChildren="ใช้งาน"
                                            unCheckedChildren="ยกเลิก" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Fieldset>
                    </Col>
                </Row>

            </>
        )
    }

    const CostTableTab = () => {
        return (
            <Row style={{ paddingBottom: "20px" }}>
                <Col xs={24} xl={24}>
                    <Fieldset legend={`โครงสร้างต้นทุน`}>
                        <Row>
                            <Col xs={24} xl={12}>
                                <Form.Item label="ราคาทุนไม่รวม VAT ล่าสุด" name="latest_ini_cost" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Form.Item label="ราคาทุนรวม VAT ล่าสุด" name="latest_ini_cost" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Form.Item label="เลขที่ใบรับเข้าล่าสุด" name="latest_ini_code_id" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <Input
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Form.Item label="วันที่จากใบรับเข้าล่าสุด" name="latest_ini_doc_date" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <Input
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>

                            <Col xs={24} xl={12}>
                                <Form.Item label="มูลค่ารวมทุนไม่รวม VAT" name="product_total_value_no_vat" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>
                            <Col xs={24} xl={12}>
                                <Form.Item label="มูลค่ารวมทุนรวม VAT" name="product_total_value_vat" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Fieldset>
                </Col>
            </Row>
        )
    }

    const handeleOpenSelectPriceNameModal = (index) => {
        console.log("index", index)
        setIndexSelectPriceName(index)
        setIsSelectPriceNameModalVisible(true)
    }

    const PriceTableTab = () => {
        return (
            <Row style={{ paddingBottom: "20px" }}>
                <Col xs={24} xl={24}>
                    <Fieldset legend={`ราคาพื้นฐาน`} style={{ paddingBottom: "20px" }}>
                        <Row>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label="ราคาขายปลีก"
                                    name="suggasted_re_sell_price_retail"
                                    rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled={mode == "view"} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label={
                                        <>
                                            {"อัตรากำไรปลีก (%)"}
                                            < Tooltip
                                                title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็น %">
                                                <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                            </Tooltip>
                                        </>
                                    } name="standard_margin_retail_percent" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        maxLength={4}
                                        max={100}
                                        formatter={(value) => `${value}%`}
                                        parser={(value) => value.replace('%', '')}
                                        style={{ width: "100%" }}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label={
                                        <>
                                            {"อัตรากำไรขายปลีก (บาท)"}
                                            < Tooltip
                                                title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็นบาท">
                                                <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                            </Tooltip>
                                        </>
                                    } name="standard_margin_wholesale_percent" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label="ราคาขายส่ง"
                                    name="suggasted_re_sell_price_wholesale"
                                    rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled={mode == "view"} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label={
                                        <>
                                            {"อัตรากำไรขายส่ง (%)"}
                                            < Tooltip
                                                title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็น %">
                                                <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                            </Tooltip>
                                        </>
                                    } name="standard_margin_retail_bath" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        maxLength={4}
                                        max={100}
                                        formatter={(value) => `${value}%`}
                                        parser={(value) => value.replace('%', '')}
                                        style={{ width: "100%" }}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} xl={8} style={{ paddingRight: "4px" }}>
                                <Form.Item
                                    labelCol={{ span: 24 }}
                                    wrapperCol={{ span: 24 }}
                                    layout="vertical"
                                    label={
                                        <>
                                            {"อัตรากำไรขายส่ง (บาท)"}
                                            < Tooltip
                                                title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็นบาท">
                                                <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                            </Tooltip>
                                        </>
                                    } name="standard_margin_wholesale_bath" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                    <InputNumber
                                        formatter={(value) => addComma(value)}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        style={{ width: "100%" }}
                                        disabled={true}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Fieldset>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Fieldset legend={`ร่องราคา`}>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={4}
                                            wrapperCol={20}
                                            layout="vertical"
                                        // label={GetIntlMessages("ร่องราคา")}
                                        >
                                            <Form.List name="price_arr" layout="vertical" >
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, ...restField }) => (
                                                            <Row key={key} style={{ display: 'flex', marginBottom: 8, alignContent: "center" }} align="baseline">
                                                                <Col xs={24} md={12} xl={6} style={{ paddingRight: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label="ชื่อร่องราคา"
                                                                        name={[name, 'price_name']}
                                                                        layout="vertical"
                                                                    >
                                                                        <Input disabled={mode == "view"} addonAfter={
                                                                            <Button
                                                                                type='text'
                                                                                size='small'
                                                                                style={{ border: 0 }}
                                                                                onClick={() => handeleOpenSelectPriceNameModal(key)}
                                                                            >
                                                                                เลือก
                                                                            </Button>
                                                                        } />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} md={12} xl={6} style={{ paddingLeft: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label="ราคา"
                                                                        name={[name, 'price_value']}
                                                                    >
                                                                        <InputNumber
                                                                            formatter={(value) => addComma(value)}
                                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                            style={{ width: "100%" }}
                                                                            disabled={mode == "view"} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} md={12} xl={6} style={{ paddingLeft: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label={
                                                                            <>
                                                                                {"อัตรากำไร (%)"}
                                                                                < Tooltip
                                                                                    title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็น %">
                                                                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                                                                </Tooltip>
                                                                            </>
                                                                        }
                                                                        name={[name, 'price_standard_margin_percent']}
                                                                    >
                                                                        <InputNumber
                                                                            maxLength={4}
                                                                            max={100}
                                                                            formatter={(value) => `${value}%`}
                                                                            parser={(value) => value.replace('%', '')}
                                                                            style={{ width: "100%" }}
                                                                            disabled={true}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} md={10} xl={4} style={{ paddingLeft: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label={
                                                                            <>
                                                                                {"อัตรากำไร (บาท)"}
                                                                                < Tooltip
                                                                                    title="กำหนดอัตรากำไรในส่วนที่ควรจะได้เป็นบาท">
                                                                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                                                                </Tooltip>
                                                                            </>
                                                                        }
                                                                        name={[name, 'price_standard_margin_bath']}
                                                                    >
                                                                        <InputNumber
                                                                            formatter={(value) => addComma(value)}
                                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                            style={{ width: "100%" }}
                                                                            disabled={true}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} md={2} xl={2} style={{ textAlign: "end" }}>
                                                                    <div style={{ paddingTop: "40px" }}>
                                                                        <Button
                                                                            type='danger'
                                                                            onClick={() => remove(name)}
                                                                            disabled={mode == "view"}
                                                                        >
                                                                            ลบ
                                                                        </Button>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={mode == "view"}>
                                                                เพิ่มข้อมูล
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Fieldset>
                        </Col>
                        <Col span={12}>
                            <Fieldset legend={`ราคาราย DOT`}>
                                <Row>
                                    <Col span={24}>
                                        <Form.Item
                                            labelCol={4}
                                            wrapperCol={20}
                                            layout="vertical"
                                        // label={GetIntlMessages("ร่องราคา")}
                                        >
                                            <Form.List name="price_dot_arr" layout="vertical" >
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, ...restField }) => (
                                                            <Row key={key} style={{ display: 'flex', marginBottom: 8, alignContent: "center" }} align="baseline">
                                                                <Col xs={24} md={12} xl={12} style={{ paddingRight: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label="DOT"
                                                                        name={[name, 'price_name']}
                                                                        layout="vertical"
                                                                    >
                                                                        <Input disabled={mode == "view"} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col xs={24} md={12} xl={10} style={{ paddingLeft: "4px" }}>
                                                                    <Form.Item
                                                                        labelCol={{ span: 24 }}
                                                                        {...restField}
                                                                        label="ราคา"
                                                                        name={[name, 'price_value']}
                                                                    >
                                                                        <InputNumber
                                                                            formatter={(value) => addComma(value)}
                                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                            style={{ width: "100%" }}
                                                                            disabled={mode == "view"} />
                                                                    </Form.Item>
                                                                </Col>

                                                                <Col xs={24} md={2} xl={2} style={{ textAlign: "end" }}>
                                                                    <div style={{ paddingTop: "40px" }}>
                                                                        <Button
                                                                            type='danger'
                                                                            onClick={() => remove(name)}
                                                                            disabled={mode == "view"}
                                                                        >
                                                                            ลบ
                                                                        </Button>
                                                                    </div>
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />} disabled={mode == "view"}>
                                                                เพิ่มข้อมูล
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Fieldset>
                        </Col>
                    </Row>


                </Col>
            </Row>
        )
    }

    const OtherDataTab = () => {
        return (
            <>
                <Row style={{ paddingBottom: "20px" }}>
                    <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลค่าเริ่มต้น`}>
                            <Row>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="คลัง" name="warehouse_id" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            onSelect={handleSelectWarehouse}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(shopWareHouseList) && shopWareHouseList.length > 0 ? shopWareHouseList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>


                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="ชั้น" name="shelf_code" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(shopShelfList) && shopShelfList.length > 0 ? shopShelfList.map((e, index) => (
                                                <Select.Option value={e.code} key={index}>
                                                    {getNameSelect(e, "name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="หน่วยซื้อ" name="purchase_unit" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={status === "productShop" ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(productPurchaseUnitTypes) && productPurchaseUnitTypes.length > 0 ? productPurchaseUnitTypes.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "type_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="หน่วยขาย" name="sales_unit" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Select
                                            showSearch
                                            allowClear
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            disabled={status === "productShop" ? (mode != "add" || form.getFieldValue().productId) : mode === "view"}
                                            // disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}

                                        >
                                            {isArray(productPurchaseUnitTypes) && productPurchaseUnitTypes.length > 0 ? productPurchaseUnitTypes.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "type_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        label={
                                            <>
                                                {"จำนวนที่ต้องสั่งซื้อ"}
                                                < Tooltip
                                                    title="กำหนดจุดต่ำสุดเพื่อแจ้งเตือนกรณี สินค้าใกล้หมด จะแสดง Highlight ที่จำนวน ในหน้ารายงานสินค้าคงเหลือ">
                                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="reorder_point" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            formatter={(value) => addComma(value)}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            disabled={mode == "view"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item
                                        label={
                                            <>
                                                {"จำนวนเพดานสินค้า"}
                                                < Tooltip
                                                    title="กำหนดจำนวนเพื่อแจ้งเตือนกรณี สต๊อคสินค้าเกินกว่าจำนวนเพดาน จะแสดง Highlight ที่จำนวน ในหน้ารายงานสินค้าคงเหลือ">
                                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                                </Tooltip>
                                            </>
                                        }
                                        name="over_qty_point" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <InputNumber
                                            style={{ width: "100%" }}
                                            formatter={(value) => addComma(value)}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            disabled={mode == "view"} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Fieldset>
                    </Col>
                </Row>
                <Row style={{ paddingBottom: "20px" }}>
                    <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลอื่น ๆ`}>
                            <Row>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="wyz_code"
                                        label="รหัส Wyz Auto"
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                {/* <Col xs={24} xl={12}>
                                    <Form.Item label="บริการครั้งถัดไป" name="next_service" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Input disabled={mode == "view"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="บริการครั้งถัดไปย่อย" name="sub_next_service" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Input disabled={mode == "view"} />
                                    </Form.Item>
                                </Col> */}
                                <Col xs={24} xl={12}>
                                    <Form.Item label="สถานที่ผลิต" name="made_in" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Input disabled={mode == "view"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12} >
                                    <Form.Item
                                        name="tags"
                                        label="แท็ก"
                                    >
                                        <Select
                                            disabled={mode == "view"}
                                            mode="multiple"
                                            allowClear
                                            style={{ width: '100%' }}
                                            placeholder="เลือกข้อมูล"
                                            filterOption={(inputValue, option) => {
                                                if (_.isPlainObject(option)) {
                                                    if (option.children) {
                                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                    }
                                                }
                                            }}
                                            dropdownRender={(menu) => (
                                                <>
                                                    {menu}
                                                    <>
                                                        <Divider style={{ margin: "8px 0" }} />

                                                        <Button onClick={() => setShowModalTagsData(true)}><TagsOutlined />จัดการข้อมูลแท๊ก</Button>
                                                    </>
                                                </>
                                            )}

                                        >
                                            {isArray(tagsList) && tagsList.length > 0 ? tagsList.map((e, index) => (
                                                <Select.Option value={e.id} key={index}>
                                                    {getNameSelect(e, "tag_name")}
                                                </Select.Option>
                                            ))
                                                : null
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item label="ลิ้งค์อ้างอิง" name="ref_url" rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}>
                                        <Input disabled={mode == "view"} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} xl={12}>
                                    <Form.Item name="note" readOnly={true} label={"หมายเหตุ"} >
                                        <TextArea
                                            placeholder="กรอกหมายเหตุ"
                                            rows={4}
                                            disabled={mode == "view"}
                                            showCount
                                            maxLength={200}
                                        >
                                        </TextArea>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Fieldset>
                    </Col>
                </Row>
            </>
        )
    }



    const handleCancelSelectPriceNameModal = () => {
        try {
            setIsSelectPriceNameModalVisible(false)
        } catch (error) {

        }
    }
    const callBackSelectPriceName = (data, index) => {
        setIsSelectPriceNameModalVisible(false)
        // console.log("callback", data)
        // console.log("callbackindex", index)
        const { price_arr } = form.getFieldsValue();
        // console.log("price_arr", price_arr)
        price_arr[index] = {
            price_name: data.tag_name[locale.locale],
            price_value: price_arr[index]?.price_value ?? 0
        }
        // console.log("price_arr", price_arr)
        form.setFieldsValue({
            price_arr: price_arr,
        });
    }

    // const searchStock = async () => {
    //     const { shopProductId } = form.getFieldsValue()
    //     const { data } = await API.get(`/shopStock/all?limit=1&page=1&product_id=${shopProductId}`)
    //     setListIndex(1)
    //     setListData(data.data.data[0].warehouse_detail)

    // }

    // const handleCancelProductWarehouseModal = async () => {
    //     try {
    //         await setShowModalProductWarehouse(false)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    // const handleOpenProductWarehouseModal = async () => {
    //     try {
    //         searchStock()
    //         await setShowModalProductWarehouse(true)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    // const callbackProductWarehouse = async (data) => {
    //     console.log("data", data)
    // }
    return (
        <>
            <div className='pr-5 pl-5 pt-5 pb-5 detail-before-table'>
                {/* <Form.Item name={"shopProductId"} hidden>

                </Form.Item>
                <Button onClick={handleOpenProductWarehouseModal}>CLIKC</Button> */}
                <Tabs
                    defaultActiveKey="1"
                    onChange={handleChangeTabs}
                    items={[
                        {
                            label: (<span><FileTextOutlined style={{ fontSize: 18 }} /> ข้อมูลสินค้า</span>),
                            key: '1',
                            children: <ProductDataTab />,
                        },
                        {
                            label: (<span><TableOutlined style={{ fontSize: 18 }} /> ตารางต้นทุน</span>),
                            key: '2',
                            children: <CostTableTab />,
                        },
                        {
                            label: (<span><TableOutlined style={{ fontSize: 18 }} /> ตารางราคา</span>),
                            key: '3',
                            children: <PriceTableTab />,
                        },
                        {
                            label: (<span><FileTextOutlined style={{ fontSize: 18 }} /> ข้อมูลทั่วไป</span>),
                            key: '4',
                            children: <OtherDataTab />,
                        },
                    ]}
                />
            </div >

            <ModalFullScreen
                maskClosable={false}
                title={` ${GetIntlMessages("add-data")} ${GetIntlMessages("complete-size")}`}
                visible={isModalVisibleCompleteSize} onOk={handleOkCompleteSize} onCancel={handleCancelCompleteSize}
                okButtonProps={{ disabled: mode == "view" }}
                loading={loading}
                // okButtonDropdown
                className={`masterManagementModal`}
            >
                <Form
                    form={formCompleteSize}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    layout="horizontal"
                    onFinish={onFinishCompleteSize}
                    onFinishFailed={onFinishFailedCompleteSize}
                >
                    <CompleteSize checkPage={status} mode={mode} form={formCompleteSize} />
                </Form>
            </ModalFullScreen>
            <Modal
                maskClosable={false}
                // title={`ข้อมูลรถยนต์`}
                open={showModalTagsData}
                onCancel={() => handleCancelTagsModal()}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelTagsModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <TagsData title="จัดการข้อมูลแท็ก" />
            </Modal>
            <Modal
                maskClosable={false}
                open={isSelectPriceNameModalVisible}
                onCancel={handleCancelSelectPriceNameModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelSelectPriceNameModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <Tabs
                    defaultActiveKey="1"
                    onChange={handleChangeTabs}
                    items={[
                        // {
                        //     label: (<span><FileTextOutlined style={{ fontSize: 18 }} /> เลือกจากคลัง</span>),
                        //     key: '1',
                        //     children: <ProductDataTab />,
                        // },
                        {
                            label: (<span><TableOutlined style={{ fontSize: 18 }} /> เลือกจากแท็ก</span>),
                            key: '1',
                            children: <TagsData title="จัดการข้อมูลแท็ก" callBack={callBackSelectPriceName} listIndex={indexSelectPriceName} />,
                        },
                    ]}
                />
            </Modal>

            {/* <Modal
                maskClosable={false}
                // title={`ข้อมูลรถยนต์`}
                open={showModalProductWarehouse}
                onCancel={() => handleCancelProductWarehouseModal()}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelProductWarehouseModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <ProductWarehouse title={"เลือกสินค้ารายการที่ " + (listIndex + 1)} หcallBack={callbackProductWarehouse} listIndex={listIndex} listData={listData} />
            </Modal> */}
        </>
    )
}
export default ComponentsModalProduct