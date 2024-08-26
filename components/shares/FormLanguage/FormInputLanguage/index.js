import { Form, Input, Col, Row, AutoComplete } from 'antd';
import languageData from '../../../_App/Layout/LayoutHeader/LanguageData';
import { useEffect, useState } from 'react';
import API from '../../../../util/Api'
import { isArray, isFunction, isPlainObject, debounce } from 'lodash';
import SortingData from '../../SortingData';
import { useSelector } from 'react-redux';


const FormInputLanguage = ({ label, name, icon, rules, placeholder, allowClear = false, disabled, isTextArea, rows = 3, importedComponentsLayouts, autoComplete, callBackData, callBackSelectData, searchData, checkedOkAndCancle, checkUserTyping, handleChangeModelData, paramIndexModelData, isNoStyle, isInTable = false, onBlurData }) => {
    const [responsiveInputFieldLayouts, setResponsiveInputFieldLayouts] = useState(null)
    const [productAllList, setProductAllList] = useState([])
    const [shopProductAllList, setShopProductAllList] = useState([])
    const [loadingProduct, setLoadingProduct] = useState(false)
    const { locale } = useSelector(({ settings }) => settings);

    useEffect(() => {
        if (_.isPlainObject(importedComponentsLayouts)) {
            setResponsiveInputFieldLayouts(importedComponentsLayouts)
        } else {
            setResponsiveInputFieldLayouts(null)
        }
    }, [])
    useEffect(() => {
        if (checkedOkAndCancle && checkedOkAndCancle == 0) {
            setProductAllList([])
        } else {
            setProductAllList([])
        }
    }, [checkedOkAndCancle])

    useEffect(() => {
        if (searchData && _.isArray(searchData)) {

            if (searchData[0] && _.isArray(searchData[0])) {
                setProductAllList(searchData[0])
            } else if (searchData[0] && _.isPlainObject(searchData[0])) {
                setProductAllList(searchData)
            } else if (searchData.length <= 0 && _.isArray(searchData)) {
                setProductAllList([])
            }

            if (searchData[1] && _.isArray(searchData[1])) {
                setShopProductAllList(searchData[1])
            }
        } else {
            setProductAllList([])
        }
    }, [searchData])


    const GetLabel = ({ label }) => {
        return rules ? (
            <>
                <span style={{ color: "red", paddingRight: 5 }}>* </span>
                {`${label}`}
            </>) : label
    }

    const checkAutoComplete = () => {
        if (autoComplete) {
            return true
        } else {
            return false
        }
    }

    const debounceOnSearch = debounce((type, value, language) => handleSearchSelect(type, value, language), 1000)
    const handleSearchSelect = async (statusMode, value, language) => {
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
                        callBackData(statusMode, productDataAll)
                        setProductAllList(() => productDataAll ?? [])

                        shopDataAll = shopData.data.data.data ? SortingData(shopData.data.data.data, `Product.product_name.${locale.locale}`) ?? [] : []
                        setShopProductAllList(() => shopDataAll ?? [])
                    }



                    // const { data } = await API.get(`/product/all?search=${value}&limit=9999&page=1&sort=master_path_code_id&order=asc&status=default`);
                    // const shopData = await API.get(`/shopProducts/all?search=${value}&limit=9999&page=1&sort=start_date&order=asc&status=default`);

                    // if (data.status == "success") {
                    //     productDataAll = SortingData(data.data.data, `product_name.${locale.locale}`)
                    //     callBackData(statusMode, productDataAll)
                    //     setProductAllList(productDataAll)
                    //     shopDataAll = SortingData(shopData.data.data.data, `product_name.${locale.locale}`)
                    //     setShopProductAllList(shopDataAll ?? [])
                    // }
                }     
            } else if (statusMode === 'select') {
                const find = productAllList.length > 0 ? productAllList.find(where => where.product_name[language.locale] == value) : []
                const findShop = shopProductAllList.length > 0 ? shopProductAllList.find(where => where.Product.product_name[language.locale] == value) : []
                callBackSelectData(find, findShop ? findShop ?? [] : [])
                callBackData(statusMode, [find])
                setProductAllList(find ? [find] : productAllList)
            } else if (statusMode === 'reset') {
                const data = []
                callBackData(statusMode, data)
                setProductAllList([])
            }
            setLoadingProduct(() => false)
        } catch (error) {
            setLoadingProduct(()=>false)
        }

    }




    return (
        <Form.Item noStyle={isNoStyle && isInTable ? true : false} style={{marginBottom : "10px"}} {...responsiveInputFieldLayouts} label={<GetLabel label={label} />} name={name} >
            <Form.List name={name} >
                {(fields, { add, remove }) => (
                    <>

                        {languageData.map((language, index) =>
                            language.icon == icon ?
                                <Form.Item noStyle={isNoStyle ? true : false} style={{marginBottom : "10px"}} key={`languageData-${language.icon}`}>
                                    {!isTextArea ?
                                        <Form.Item
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={language.locale}
                                            fieldKey={language.locale + Math.random()}
                                            rules={rules}
                                            noStyle={isNoStyle ? true : false}
                                            help={loadingProduct ? "กำลังโหลดข้อมูล...กรุณารอสักครู่" : null}
                                            style={{marginBottom : "10px"}}
                                        >
                                            {
                                                checkAutoComplete() == true ?
                                                    <AutoComplete
                                                    options={[{
                                                        label: loadingProduct ? "กำลังโหลดข้อมูล...กรุณารอสักครู่": productAllList.length == 0 ? "ค้นหาจากส่วนกลางหรือเพิ่มข้อมูลใหม่":"รหัสสินค้าจากส่วนกลาง",
                                                        options: productAllList.map(e => { return { 'value': e.product_name[language.locale] } })
                                                    }] ?? []}
                                                        // options={productAllList.map(e => { return { 'value': e.product_name[language.locale] } }) ?? []}
                                                        placeholder="ค้นหาจากส่วนกลางหรือเพิ่มข้อมูลใหม่"
                                                        disabled={disabled}
                                                        // filterOption={(inputValue, option) => {
                                                        //     if (_.isPlainObject(option)) {
                                                        //         if (_.isPlainObject(option.value))
                                                        //             if (_.isFunction(option.value.search)) return option.value.search(inputValue) != -1
                                                        //     }
                                                        // }}
                                                        // onChange={(value) => value.length == 0 ? handleSearchSelect('reset', value) : null}
                                                        onSelect={(value) => handleSearchSelect('select', value, language)}
                                                        onSearch={(value) => debounceOnSearch('search', value, language)}
                                                        onClear={(value) => handleSearchSelect("reset", "")}
                                                        allowClear={allowClear} 
                                                        suffix={true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null} 
                                                        onBlur={(value) => checkUserTyping(true, value)}
                                                    >
                                                        {/* <Input allowClear={allowClear} placeholder={placeholder} suffix={true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null} disabled={disabled} onBlur={(value) => checkUserTyping(true, value)} /> */}
                                                    </AutoComplete>
                                                    : isFunction(handleChangeModelData) ? <Input allowClear={allowClear} placeholder={placeholder} suffix={true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null} disabled={disabled} onBlur={() => handleChangeModelData(paramIndexModelData, isArray(name) ? name[1] : name)} />
                                                        : isFunction(onBlurData) ? <Input onBlur={() => onBlurData(name)} allowClear={allowClear} placeholder={placeholder} suffix={true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null} disabled={disabled} />
                                                            : <Input allowClear={allowClear} placeholder={placeholder} suffix={true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null} disabled={disabled} />
                                            }

                                        </Form.Item>
                                        :
                                        <Row key={`languageData-${language.icon}`}>
                                            <Col span={22} style={{ width: "100%" }}>
                                                <Form.Item
                                                    validateTrigger={['onChange', 'onBlur']}
                                                    name={language.locale}
                                                    fieldKey={language.locale + Math.random()}
                                                    rules={rules}
                                                    noStyle
                                                >
                                                    <Input.TextArea allowClear={allowClear} placeholder={placeholder} disabled={disabled} rows={rows} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} style={{ paddingLeft: 10 }}>
                                                {true ? <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> : null}
                                            </Col>
                                        </Row>
                                    }
                                </Form.Item> : null
                        )}
                    </>
                )}
            </Form.List>
        </Form.Item>
    )
}

export default FormInputLanguage
