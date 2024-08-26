import { useState, useEffect } from 'react'
import { Button, Form, Input, message, Select, Switch, Row, Col, AutoComplete, Divider, Space, DatePicker } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import SortingData from '../../shares/SortingData'
import CompleteSize from './Components.Modal.CompleteSize'
import ModalFullScreen from '../../shares/ModalFullScreen';
import API from '../../../util/Api'
import { isArray, isFunction, isPlainObject, debounce } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import moment from 'moment';

const ComponentsModalProduct = ({ form, mode, checkedOkAndCancle, status, checkedIsuse, getCheckOkAndCancle, switchTireStatus, checkedTireStatus }) => {

    const [loading, setLoading] = useState(false)
    const [loadingProduct, setLoadingProduct] = useState(false)

    const { authUser } = useSelector(({ auth }) => auth);
    const { locale } = useSelector(({ settings }) => settings);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const { productModelType, vehicleType } = useSelector(({ master }) => master);

    const { oe_tire_status_checked, runflat_tire_checked, others_tire_detail_checked } = checkedTireStatus
    const disabledSomChaiShop = authUser.UsersProfile?.shop_id === "1a523ad4-682e-4db2-af49-d54f176a84ad" && mode === "edit" && permission_obj.update === 1 ? true : false


    useEffect(() => {
        initProductTypeGroup(form)
        getMasterData()
        checkedOKCancle(checkedOkAndCancle)
        checkedMode()
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


    const getMasterData = async () => {
        try {
            const promise1 = getProductBrandListAll(); // ยี่ห้อสินค้า
            const promise2 = getProductCompleteSizeListAll(); // ขนาดไซส์สำเร็จรูป

            Promise.all([promise1, promise2]).then((values) => {
                // console.log(values);
                setProductBrandList(values[0])
                setProductCompleteSizeList(values[1])
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

    const callBackOptionsData = (modeStatus, arrData) => {
        if (modeStatus === 'reset' && mode === "add") {
            form.resetFields()
            form.setFieldsValue({ productId: null, ShopProductId: null })
            setProductAllList([])
            setProductTypeList([])
            setProductModelTypeList([])
            setCheckSkuDisable(false)
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
                if (value.length >= 3) {
                    const { data } = await API.get(`/product/all?search=${value}&limit=50&page=1&sort=master_path_code_id&order=asc&status=active`);
                    const shopData = await API.get(`/shopProducts/all?search=${value}&limit=50&page=1&sort=start_date&order=asc&status=active`);
                    const [values1, values2] = await Promise.all([data, shopData])

                    if (values1.status === "success" && values2.data.status === "success") {
                        productDataAll = data.data.data ? SortingData(data.data.data, `product_name.${locale.locale}`) ?? [] : []
                        // console.log('shopData', shopData)
                        setProductAllList(() => productDataAll)

                        shopDataAll = shopData.data.data.data ? SortingData(shopData.data.data.data, `Product.product_name.${locale.locale}`) ?? [] : []
                        setShopProductAllList(() => shopDataAll)

                        setResultSearchData(() => [productDataAll, shopDataAll])

                    }
                }
            } else if (statusMode === 'select') {
                const formValue = form.getFieldsValue()

                if (isArray(productAllList) && productAllList.length > 0) {

                    const find = productAllList.find(where => where.master_path_code_id == value)
                    setProductAllList([find])
                    setResultSearchData([find])
                    const findShopProduct = shopProductAllList.find(where => where.Product.master_path_code_id == value)

                    formValue.productId = find ? find.id : null

                    formValue.ShopProductId = findShopProduct ? findShopProduct.Product.id : null

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
                        formValue.product_bar_code = findShopProduct ? findShopProduct.product_bar_code : null
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
                        formValue.product_bar_code = findShopProduct ? findShopProduct.product_bar_code : null
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

                        formValue.start_date = findShopProduct ? moment(findShopProduct.start_date) : null
                        formValue.end_date = findShopProduct ? moment(findShopProduct.end_date) : null

                        formValue.suggasted_re_sell_price_retail = findShopProduct ? findShopProduct.price.suggasted_re_sell_price.retail : null
                        formValue.suggasted_re_sell_price_wholesale = findShopProduct ? findShopProduct.price.suggasted_re_sell_price.wholesale : null

                        formValue.b2b_price_retail = findShopProduct ? findShopProduct.price.b2b_price.retail : null
                        formValue.b2b_price_wholesale = findShopProduct ? findShopProduct.price.b2b_price.wholesale : null

                        formValue.suggested_online_price_retail = findShopProduct ? findShopProduct.price.suggested_online_price.retail : null
                        formValue.suggested_online_price_wholesale = findShopProduct ? findShopProduct.price.suggested_online_price.wholesale : null

                        formValue.credit_30_price_retail = findShopProduct ? findShopProduct.price.credit_30_price.retail : null
                        formValue.credit_30_price_wholesale = findShopProduct ? findShopProduct.price.credit_30_price.wholesale : null

                        formValue.credit_45_price_retail = findShopProduct ? findShopProduct.price.credit_45_price.retail : null
                        formValue.credit_45_price_wholesale = findShopProduct ? findShopProduct.price.credit_45_price.wholesale : null

                        // form.setFieldsValue(formValue)
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
                // formValue.product_name = null

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
                form.setFieldsValue({ product_name: { [formLocale == "th" ? "th" : "en"]: genName } })

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
                form.setFieldsValue({ product_name: { [formLocale]: genName.length > 0 ? genName : findModel.model_name[locale.locale] ?? null } })
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

    return (
        <>
            <div className='pr-5 pl-5 pt-5 detail-before-table'>
                {/* <FormSelectLanguage config={{
                    form,
                    field: ["product_name", "remark_oe_tier", "remark_runflat_tier", "remark_others_tire_detail"],
                    disabled: mode == "view"
                }} onChange={(value) => setFormLocale(value)} /> */}

                <Row>

                    <Col xs={24} xl={12} >


                        {status == "productMaster" ?
                            <Form.Item
                                name="custom_path_code_id"
                                label="Custom path code id"
                            >
                                <Input disabled={mode == "view" || checkSkuDisable} />
                                {/* <Input disabled={onDisabled() !== null} /> */}
                            </Form.Item>
                            :
                            <Form.Item
                                name="product_bar_code"
                                label="รหัสบาร์โค้ด"
                                rules={[
                                    {
                                        // pattern: /^[0-9]+$/, 
                                        message: GetIntlMessages("only-number")
                                    },
                                    {
                                        min: 8, message: GetIntlMessages("ต้องมากกว่าหรือเท่ากับ 8 ตัว")
                                        // pattern: /^\s*-?[0-9]{8,13}\s*$/, message: GetIntlMessages("ต้องมากกว่าหรือเท่ากับ 8 ตัว")
                                    }
                                ]}
                            // extra={`${GetIntlMessages("ตัวเลขเท่านั้น และ ต้องมากกว่าหรือเท่ากับ 8 ตัว")}`}
                            >
                                <Input disabled={mode == "view"} />
                                {/* <Input disabled={onDisabled() !== null} /> */}
                            </Form.Item>
                        }

                        <Form.Item
                            name="wyz_code"
                            label="WYZ code"
                        >
                            <Input disabled />
                        </Form.Item>
                        {/* <Form.Item
                            name="sku"
                            label="SKU"
                        >
                            <Input disabled={mode == "view" || checkSku(form.getFieldValue().sku) || checkSkuDisable} />
                        </Form.Item> */}

                        <Form.Item name="product_type_group_id" label="กลุ่มสินค้า"
                            rules={[{
                                // pattern : /^[0-9]+$/,
                                required: true,
                                message: GetIntlMessages("please-fill-out")
                            }]}
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                // disabled={status == "productMaster" ? mode == "view" : mode !== "add" || onDisabledProductIdChange}
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
                        <Form.Item name="product_type_id" label="ประเภทสินค้า"
                            rules={[{
                                // pattern : /^[0-9]+$/,
                                required: true,
                                message: GetIntlMessages("please-fill-out")
                            }]}
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
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
                                        {/* {e.type_name["th"]} */}
                                        {getNameSelect(e, "type_name")}
                                    </Select.Option>
                                )) : null}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="product_brand_id"
                            label="ยี่ห้อสินค้า"
                        // rules={[{
                        //     // pattern : /^[0-9]+$/,
                        //     required: true,
                        //     message: GetIntlMessages("please-fill-out")
                        // }]}
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                onChange={handleChangeProductBrand}
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
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
                                        {/* {e.brand_name["th"]} */}
                                        {getNameSelect(e, "brand_name")}
                                    </Select.Option>
                                ))
                                    : null
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="vehicle_types"
                            label={GetIntlMessages("ประเภทรถ")}
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                mode='multiple'
                                // onChange={handleChangeProductBrand}
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
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
                                        {/* {e.brand_name["th"]} */}
                                        {getNameSelect(e, "type_name")}
                                    </Select.Option>
                                ))
                                    : null
                                }
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="product_model_id"
                            label="รุ่น"
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
                                onSelect={handleSelectModel}
                                filterOption={(inputValue, option) => {
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

                        {mode !== "add" ?
                            <Form.Item name="isuse" label="สถานะ" >
                                <Switch disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item> : null
                        }
                    </Col>
                    <Col xs={24} xl={12}>
                        <Form.Item name="complete_size_id" label="ขนาดไซส์สำเร็จรูป">
                            <Select
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange}
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
                        <div hidden={false}>

                            <Form.Item
                                name="width"
                                label="หน้ายาง"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>

                            <Form.Item
                                name="series"
                                label="แก้มยาง"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>

                            <Form.Item
                                name="rim_size"
                                label="ขอบยาง"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>


                            <Form.Item
                                name="hight"
                                label="ความสูง"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>



                            <Form.Item
                                name="load_index"
                                label="ดัชนีน้ำหนักสินค้า"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>

                            <Form.Item
                                name="speed_index"
                                label="ดัชนีความเร็ว"
                            >
                                <Input type="number" disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                            </Form.Item>

                            <Form.Item
                                {...formSwitchTire}
                                label={GetIntlMessages("ยาง OE")}
                            // name="oe_tier"
                            >
                                {/* <Switch disabled={status == "productMaster" ? mode == "view" : mode !== "add"} checked={oe_tire_status_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "oe_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" /> */}
                                <Switch disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} checked={oe_tire_status_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "oe_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item>

                            <Form.Item
                                // labelAlign='left'
                                // labelCol={{ xs: { span: 24 }, xxl: { span: 14 } }}
                                // wrapperCol={{ xs: { span: 24 }, xxl: { span: 10 } }}
                                label={GetIntlMessages("ยาง Runflat")}
                            // name="runflat_tier"
                            >
                                <Switch disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} checked={runflat_tire_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "runflat_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item>

                            <Form.Item
                                {...formSwitchTire}
                                label={GetIntlMessages("อื่นๆ")}
                            // name="others_tire_detail"
                            >
                                <Switch disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} checked={others_tire_detail_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "others_tire_detail")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                            </Form.Item>
                        </div>

                    </Col>
                </Row>
            </div>

            <div className='pr-3 pl-3 head-line-text'>
                {mode !== "add" ? "ดูข้อมูล" : mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"} รายละเอียดอื่นๆ
            </div>
            <Row>
                <Col xs={24} xl={12}>
                    {/* <Form.Item
                        wrapperCol={{ md: { span: 15 } }}
                        label="CCI Code"
                        name="cci_code"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item> */}
                    <Form.Item
                        wrapperCol={{ md: { span: 15 } }}
                        label="CCID Code"
                        name="ccid_code"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item>
                    <Form.Item
                        wrapperCol={{ md: { span: 15 } }}
                        label="CAD Code"
                        name="cad_code"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item>
                    {/* <Form.Item
                        wrapperCol={{ md: { span: 15 } }}
                        label="Discount promotion"
                        name="discount"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item> */}


                </Col>
                {/* <Col xs={24} xl={12}>
                    <Form.Item wrapperCol={{ md: { span: 15 }, xxl: { span: 15 } }}
                        label="Sourcing Manufacturing"
                        name="sourcing_manufacturing"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ md: { span: 15 }, xxl: { span: 15 } }}
                        label="Position F/R"
                        name="position_front_and_rear"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ md: { span: 15 }, xxl: { span: 15 } }}
                        label="TL/TT Index"
                        name="tl_and_tt_index"
                    >
                        <Input disabled={status == "productMaster" ? mode == "view" : disabledSomChaiShop ? !disabledSomChaiShop : mode !== "add" || onDisabledProductIdChange} />
                    </Form.Item>
                </Col> */}
            </Row>

            {/* <Row gutter={5}>
                <Col xs={6} lg={2}>
                    <Form.Item
                        {...formSwitchTire}
                        label={GetIntlMessages("ยาง OE")}
                    // name="oe_tier"
                    >
                        <Switch disabled={status == "productMaster" ? mode == "view" : mode !== "add"} checked={oe_tire_status_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "oe_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                    </Form.Item>
                </Col>

                <Col xs={18} lg={6}>
                    <FormInputLanguage importedComponentsLayouts={formTextAreaLayout} isTextArea icon={formLocale} label={GetIntlMessages("remark")} name="remark_oe_tire" allowClear={true} disabled={status == "productMaster" ? mode == "view" : mode !== "add"} />
                </Col>
                <Col xs={6} lg={2}>
                    <Form.Item
                        labelAlign='left'
                        labelCol={{ xs: { span: 24 }, xxl: { span: 14 } }}
                        wrapperCol={{ xs: { span: 24 }, xxl: { span: 10 } }}
                        label={GetIntlMessages("ยาง Runflat")}
                    // name="runflat_tier"
                    >
                        <Switch disabled={status == "productMaster" ? mode == "view" : mode !== "add"} checked={runflat_tire_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "runflat_tire")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                    </Form.Item>
                </Col>

                <Col xs={18} lg={6}>
                    <FormInputLanguage importedComponentsLayouts={formTextAreaLayout} isTextArea icon={formLocale} label={GetIntlMessages("remark")} name="remark_runflat_tire" allowClear={true} disabled={status == "productMaster" ? mode == "view" : mode !== "add"} />
                </Col>
                <Col xs={6} lg={2}>
                    <Form.Item
                        {...formSwitchTire}
                        label={GetIntlMessages("อื่นๆ")}
                    // name="others_tire_detail"
                    >
                        <Switch disabled={status == "productMaster" ? mode == "view" : mode !== "add"} checked={others_tire_detail_checked} onChange={(bool) => checkedFunctionTireStatus(bool, "others_tire_detail")} checkedChildren="ใช้งาน" unCheckedChildren="ยกเลิก" />
                    </Form.Item>
                </Col>
                <Col xs={18} lg={6}>
                    <FormInputLanguage importedComponentsLayouts={formTextAreaLayout} isTextArea icon={formLocale} label={GetIntlMessages("remark")} name="remark_others_tire_detail" allowClear={true} disabled={status == "productMaster" ? mode == "view" : mode !== "add"} />
                </Col>

            </Row> */}


            <div id='price-data-table'>
                <div className='price-table-responsive'>
                    <table className="price-table table-bordered">
                        <thead>
                            <tr>
                                {/* <th>#</th> */}
                                <th>{GetIntlMessages(`ราคาหน้าร้าน`)}</th>
                                <th>{GetIntlMessages(`สดค้าส่ง`)}</th>
                                <th>{GetIntlMessages(`ราคาออนไลน์`)}</th>
                                <th>{GetIntlMessages(`เชื่อ 30 วัน`)}</th>
                                <th>{GetIntlMessages(`เชื่อ 45 วัน`)}</th>
                                {status != "productMaster" ?
                                    <th>{GetIntlMessages(`วันที่เริ่มใช้ราคา`)}</th>
                                    : null}
                                {status != "productMaster" ?
                                    <th>{GetIntlMessages(`วันที่เริ่มยุติกการใช้ราคา`)}</th>
                                    : null}


                                {/* <th>{GetIntlMessages(`ราคาแนะนำ`)}</th>
                                                        <th>{GetIntlMessages(`After Channel Discount`)}</th>
                                                        <th>{GetIntlMessages(`ราคาหน้าร้าน`)}</th>
                                                        <th>{GetIntlMessages(`Suggasted Online Price`)}</th>
                                                        <th>{GetIntlMessages(`ราคาลงสื่อ ( Promote Price )`)}</th>
                                                        <th>{GetIntlMessages(`ราคาทั่วไป ( Normal Price )`)}</th>
                                                        <th>{GetIntlMessages(`Benchmark`)}</th>
                                                        <th>{GetIntlMessages(`Cost inc vat`)}</th>
                                                        <th>{GetIntlMessages(`Cost Exc Vat`)}</th>  */}
                            </tr>
                        </thead>
                        <tbody>


                            <tr key='1'>
                                {/* <td>{index + 1}</td> */}

                                <td>
                                    <Form.Item
                                        label="ราคา(ปลีก)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="suggasted_re_sell_price_retail"

                                    // rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                    <Form.Item
                                        label="ราคา(ส่ง)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="suggasted_re_sell_price_wholesale"

                                    // rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item
                                        label="ราคา(ปลีก)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="b2b_price_retail"

                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                    <Form.Item
                                        label="ราคา(ส่ง)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="b2b_price_wholesale"

                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item
                                        label="ราคา(ปลีก)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="suggested_online_price_retail"
                                        fieldKey="suggested_online_price_retail"
                                    // rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                    <Form.Item
                                        label="ราคา(ส่ง)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="suggested_online_price_wholesale"

                                    // rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item
                                        label="ราคา(ปลีก)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="credit_30_price_retail"

                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                    <Form.Item
                                        label="ราคา(ส่ง)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="credit_30_price_wholesale"


                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                </td>
                                <td>
                                    <Form.Item
                                        label="ราคา(ปลีก)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="credit_45_price_retail"

                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                    <Form.Item
                                        label="ราคา(ส่ง)"

                                        validateTrigger={['onChange', 'onBlur']}
                                        name="credit_45_price_wholesale"

                                    >
                                        <Input type={"number"} disabled={mode == "view"} />
                                    </Form.Item>
                                </td>
                                {status != "productMaster" ?
                                    <td>
                                        <Form.Item
                                            // label=""
                                            wrapperCol={{ xxl: { span: 24 } }}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name="start_date"
                                        >
                                            <DatePicker disabled={mode == "view"} format={'YYYY-MM-DD'} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </td>
                                    : null}
                                {status != "productMaster" ?
                                    <td>
                                        <Form.Item
                                            // label=""
                                            wrapperCol={{ xxl: { span: 24 } }}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name="end_date"
                                        >
                                            <DatePicker disabled={mode == "view"} format={'YYYY-MM-DD'} style={{ width: "100%" }} />
                                        </Form.Item>
                                    </td>
                                    : null}

                            </tr>


                        </tbody>
                    </table>
                </div>
            </div>

            {/* ------------------------------------------------------------------------------ */}
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

        </>
    )
}
export default ComponentsModalProduct