import { useEffect, useState } from 'react'
import { Input, Select, Form, Row, Col, Button, message, Popconfirm, Switch, Dropdown, InputNumber, Modal, AutoComplete } from 'antd';
import { MinusCircleOutlined, PlusOutlined, CalculatorOutlined } from '@ant-design/icons';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import API from '../../../../../util/Api'
import Fieldset from '../../../../shares/Fieldset';
import SortingData from '../../../../shares/SortingData';
import RegexMultiPattern from '../../../../shares/RegexMultiPattern';
import SelectDots from '../../../../Routes/Dot/Components.Select.Dot';
import { RoundingNumber, NoRoundingNumber, takeOutComma } from '../../../../shares/ConvertToCurrency';
import { find, get, isArray, isFunction, isPlainObject, debounce, isEmpty } from 'lodash';
import { useSelector } from 'react-redux';
import Swal from "sweetalert2";
import { DateTime } from 'luxon';

const ComponentsRoutesModalTabs1QuotationList = ({ onFinish, onFinishFailed, mode, isTableNoStyle, calculateResult, docTypeId }) => {
    const form = Form.useFormInstance();

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { productPurchaseUnitTypes, taxTypes } = useSelector(({ master }) => master);
    const [resultDotArr, setResultDotArr] = useState([])
    const checkTaxId = Form.useWatch("tax_type_id", form)
    useEffect(() => {
        calculateTable()
    }, [checkTaxId])

    useEffect(() => {
        generateDot()
    }, [])
    /**
* Get the value of the array field at the specified index
* @param {number} index - The index of the array.
* @param {string} type - The type of the field.
* @returns The `getArrListValue` function returns an array of values.
*/
    const getArrListValue = (index, type) => {
        try {
            const { list_service_product } = form.getFieldsValue();
            if (list_service_product && !isPlainObject(list_service_product[index])) list_service_product = {};
            return isArray(list_service_product[index][type]) ? list_service_product[index][type] ?? [] : []
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const getValue = (index, type) => {
        try {
            const { list_service_product } = form.getFieldsValue();
            if (list_service_product && !isPlainObject(list_service_product[index])) list_service_product = {};
            return isArray(list_service_product) ? list_service_product[index][type] ?? "" : ""
        } catch (error) {
            // console.log('error getValue:>> ', error);
        }
    }

    /*Search Product*/
    const debounceOnSearch = debounce((value, index) => handleSearchShopStock(value, index), 600)
    const handleSearchShopStock = async (value, index) => {
        try {
            const { list_service_product } = form.getFieldValue();
            if (isPlainObject(list_service_product[index])) {
                if (!!value) {
                    const { data } = await API.get(`/shopProducts/all?limit=50&page=1&search=${value}&status=active&sort=start_date&order=asc&dropdown=true`);
                    // const { data } = await API.get(`/shopStock/all?limit=50&page=1&search=${value}&status=active&filter_available_balance=false`);
                    // console.log('data :>> ', data);
                    // const newData = data.data.data.map(e => {
                    //     const _model = {
                    //         ...e,
                    //         // warehouse_detail: e.warehouse_detail.filter(where => where.shelf.balance != 0)
                    //     }
                    //     return _model

                    // })
                    list_service_product[index].list_shop_stock = data.status === "success" ? SortingData(data.data.data, `Product.product_name.${locale.locale}`) : []

                }
            } else {
                list_service_product[index] = {}
            }

            form.setFieldsValue({
                list_service_product
            })
        } catch (error) {
            // console.log('error handleSearchShopStock :>> ', error);
        }
    }
    /*End Search Product*/

    /*Select Product*/
    const selectProduct = async (value, index) => {
        try {
            // a613cd37-8725-4c0e-ba5f-2ea021846dc7 -> บริการ
            // b83ba876-4b03-4877-b4d0-ad4a804e587e -> หน่วยซื้อ -> ครั้ง

            const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" //-> หน่วยซื้อ -> รายการ
            const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" //-> หน่วยซื้อ -> เส้น
            const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" //-> หน่วยซื้อ -> ลูก
            const productTypeBattery = "5d82fef5-8267-4aea-a968-92a994071621" //-> Battery
            const { list_service_product } = form.getFieldsValue();
            const { data } = await API.get(`/shopProducts/byid/${value}`);
            const shopProduct = data.data[0];
            const shopProductPrice = get(shopProduct, `price`, null);

            list_service_product[index].list_shop_stock = [shopProduct];
            list_service_product[index].price_unit = RoundingNumber(get(shopProductPrice, `suggasted_re_sell_price.retail`, 0))
            list_service_product[index].type_group_id = shopProduct.Product.ProductType.type_group_id
            list_service_product[index].purchase_unit_list = shopProduct.Product.ProductType.ProductPurchaseUnitTypes
            if (shopProduct.Product.ProductType.ProductPurchaseUnitTypes.length === 1) {
                list_service_product[index].purchase_unit_id = shopProduct.Product.ProductType.ProductPurchaseUnitTypes[0].id
            } else {
                const find = shopProduct.Product.ProductType.ProductPurchaseUnitTypes.find(where => { return where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeTire || (shopProduct.Product?.ProductType.id === productTypeBattery && where.id === purchaseUnitTypeBattery) })
                list_service_product[index].purchase_unit_id = isPlainObject(find) ? find.id ?? null : null
            }

            list_service_product[index].is_service = shopProduct?.Product?.ProductType?.type_group_id === "a613cd37-8725-4c0e-ba5f-2ea021846dc7" ? true : false
            list_service_product[index].changed_product_name = null

            const checkDuplicateData = list_service_product.filter(where => { return where.product_id === value && where.type_group_id === "a613cd37-8725-4c0e-ba5f-2ea021846dc7" && list_service_product[index].purchase_unit_id === "b83ba876-4b03-4877-b4d0-ad4a804e587e" })
            if (checkDuplicateData.length > 1) {
                Swal.fire(`${GetIntlMessages("รายการสินค้าซ้ำ !!")}`, `${GetIntlMessages(`ท่านได้มีการเพิ่ม "สินค้า/บริการ","DOT/MFD","หน่วยซื้อ" เดียวกันแล้ว`)}`, 'warning')
                // list_service_product[index] = {}
                list_service_product[index].product_id = null
                list_service_product[index].purchase_unit_id = null
                list_service_product[index].price_unit = null
                list_service_product[index].dot_mfd = null
                list_service_product[index].amount = null
                list_service_product[index].price_discount = null
                list_service_product[index].price_discount_percent = null
                list_service_product[index].price_grand_total = null
            }
            form.setFieldsValue({
                list_service_product
            })

        } catch (error) {
            console.log('error handleSearchShopStock :>> ', error);
        }
    }
    /*End Select Product*/

    /*OnChangeProductName*/
    const isOnChangeProductName = (bool, index) => {
        try {
            const { list_service_product } = form.getFieldsValue();
            const _find = isArray(list_service_product[index]?.list_shop_stock) ? list_service_product[index]?.list_shop_stock.find(where => where.id === list_service_product[index].product_id) : null
            list_service_product[index].changed_product_name = bool === true ? list_service_product[index].changed_product_name ?? get(_find, `Product.product_name.${locale.locale}`, null) : null
            list_service_product[index].changed_name_status = bool
            form.setFieldsValue({ list_service_product })
        } catch (error) {
            // console.log('error isOnChangeProductName :>> ', error);
        }
    }
    /*End OnChangeProductName*/

    /*Select DotMfd*/
    const selectDotMfd = (value, index) => {
        try {
            const { list_service_product } = form.getFieldValue()
            const shopStock = list_service_product[index].list_shop_stock[0]
            list_service_product[index].purchase_unit_id = null
            // console.log('shopStock :>> ', shopStock);
            const purchase_unit_list = []
            if (isArray(shopStock.warehouse_detail)) {
                shopStock.warehouse_detail.forEach(e => {
                    let purchaseUnitId
                    purchaseUnitId = get(e, `shelf.purchase_unit_id`, "-");

                    if (purchaseUnitId) {
                        const _find = purchase_unit_list.find(where => where === purchaseUnitId)
                        if (!_find) purchase_unit_list.push(purchaseUnitId)
                    }
                });
            }

            if (isArray(productPurchaseUnitTypes) && productPurchaseUnitTypes.length > 0) {
                list_service_product[index].purchase_unit_list = productPurchaseUnitTypes.filter(where => purchase_unit_list.find(e => e === where.id))

                if (purchase_unit_list.length === 1) {
                    list_service_product[index].purchase_unit_id = purchase_unit_list[0]
                    if (value === "-") {
                        list_service_product[index].balance = shopStock.warehouse_detail.find(where => { return where.shelf.purchase_unit_id === purchase_unit_list[0] })?.shelf?.balance ?? null
                    } else {
                        list_service_product[index].balance = shopStock.warehouse_detail.find(where => { return where.shelf.purchase_unit_id === purchase_unit_list[0] && where.shelf.dot_mfd === value })?.shelf?.balance ?? null
                    }
                    const checkDuplicateData = list_service_product.filter((where, i, arr) => { return where?.shop_stock_id === list_service_product[index]?.shop_stock_id && where?.dot_mfd === value && where?.purchase_unit_id === purchase_unit_list[0] })
                    if (checkDuplicateData.length > 1) {
                        Swal.fire(`${GetIntlMessages("รายการสินค้าซ้ำ !!")}`, `${GetIntlMessages(`ท่านได้มีการเพิ่ม "สินค้า/บริการ","DOT/MFD","หน่วยซื้อ" เดียวกันแล้ว`)}`, 'warning')
                        list_service_product[index].dot_mfd = null
                        list_service_product[index].purchase_unit_id = null
                        list_service_product[index].purchase_unit_list = []
                        list_service_product[index].balance = null
                    }
                }
            }

            form.setFieldsValue({ list_service_product })
        } catch (error) {

        }
    }
    /*End Select DotMfd*/

    /*Select selectPurchaseUit*/
    const selectPurchaseUit = (value, index) => {
        try {
            const { list_service_product } = form.getFieldValue()
            const shopProduct = list_service_product[index].list_shop_stock[0]
            if (isPlainObject(shopProduct) && !isEmpty(shopProduct)) {
                const checkDuplicateData = list_service_product.filter((where, i, arr) => { return where?.product_id === list_service_product[index]?.product_id && where?.dot_mfd === list_service_product[index]?.dot_mfd && where?.purchase_unit_id === value })
                if (checkDuplicateData.length > 1) {
                    Swal.fire(`${GetIntlMessages("รายการสินค้าซ้ำ !!")}`, `${GetIntlMessages(`ท่านได้มีการเพิ่ม "สินค้า/บริการ","DOT/MFD","หน่วยซื้อ" เดียวกันแล้ว`)}`, 'warning')
                    list_service_product[index].purchase_unit_id = null
                    list_service_product[index].purchase_unit_id = null
                }
            }

            /*old function เผื่อใช้*/
            // if (isArray(shopStock.warehouse_detail)) {
            //     const checkDuplicateData = list_service_product.filter((where, i, arr) => { return where?.shop_stock_id === list_service_product[index]?.shop_stock_id && where?.dot_mfd === list_service_product[index]?.dot_mfd && where?.purchase_unit_id === value })
            //     if (checkDuplicateData.length > 1) {
            //         Swal.fire(`${GetIntlMessages("รายการสินค้าซ้ำ !!")}`, `${GetIntlMessages(`ท่านได้มีการเพิ่ม "สินค้า/บริการ","DOT/MFD","หน่วยซื้อ" เดียวกันแล้ว`)}`, 'warning')
            //         list_service_product[index].purchase_unit_id = null
            //         list_service_product[index].balance = null
            //     } else {
            //         list_service_product[index].balance = shopStock.warehouse_detail.find(where => { return where.shelf.purchase_unit_id === value && where.shelf.dot_mfd === list_service_product[index].dot_mfd })?.shelf?.balance ?? null
            //     }

            // }

            form.setFieldsValue({ list_service_product })
        } catch (error) {

        }
    }
    /*End Select selectPurchaseUit*/
    const calculateVatPerItem = (val) => {
        console.log("checkTaxId", checkTaxId)
        const { detail } = taxTypes.find(where => where.id === checkTaxId)
        console.log("detail", detail)
        let taxRate = 0, price_vat = 0
        if (Number(detail.tax_rate_percent) > 9) {
            taxRate = Number(`1${detail.tax_rate_percent}`)
        } else {
            taxRate = Number(`10${detail.tax_rate_percent}`)
        }

        switch (checkTaxId) {
            case "8c73e506-31b5-44c7-a21b-3819bb712321":
                if (isPlainObject(detail)) {
                    price_vat = ((val * ((Number(detail.tax_rate_percent)) / taxRate)))
                }
                break;

            default:
                if (isPlainObject(detail)) {
                    price_vat = ((val * ((Number(detail.tax_rate_percent)) / 100)))
                }
                break;
        }
        return price_vat
    }
    /*debounce*/
    const debounceQuotation = debounce((value, index, type) => calculateTable(value, index, type), 800)
    const calculateTable = (value, index, type) => {
        try {
            console.log(value)
            const { list_service_product } = form.getFieldValue()
            const quotationListIndex = list_service_product[index]
            const priceGrandTotalWithOutDiscount = (Number(takeOutComma(quotationListIndex?.price_unit)) ?? 0) * (Number(takeOutComma(quotationListIndex?.amount)) ?? 0)

            let multiplyPriceDiscount = 0
            if (!!quotationListIndex?.price_discount && !!quotationListIndex?.amount) {

            }
            let price_grand_total = 0,
                amount = 0,
                price_discount = 0,
                price_discount_percent = 0,
                price_unit = 0,
                price_discount_bill = 0,
                price_unit_vat = 0,
                price_unit_before_vat = 0,
                price_unit_add_vat = 0,
                price_discount_for_cal = 0

            switch (type) {
                case "price_unit":
                    price_unit = Number(value)
                    amount = Number(list_service_product[index]["amount"] ?? 0)

                    price_discount_for_cal = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_for_cal"] ?? 0)
                    price_discount = value <= 0 ? 0 : Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_percent = value <= 0 ? 0 : ((price_discount / price_unit) * 100)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    list_service_product[index]["price_unit"] = MatchRound(price_unit)
                    list_service_product[index]["price_discount"] = price_discount
                    list_service_product[index]["price_discount_percent"] = price_discount_percent

                    list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = list_service_product[index]["is_discount_by_percent"] ?? false
                    list_service_product[index]["is_discount_by_bath"] = list_service_product[index]["is_discount_by_bath"] ?? false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "amount":
                    price_unit = Number(takeOutComma(list_service_product[index]["price_unit"]) ?? 0)
                    amount = Number(value)

                    price_discount_for_cal = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_for_cal"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(list_service_product[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    list_service_product[index]["amount"] = amount.toString()

                    list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = list_service_product[index]["is_discount_by_percent"] ?? false
                    list_service_product[index]["is_discount_by_bath"] = list_service_product[index]["is_discount_by_bath"] ?? false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "price_discount":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(takeOutComma(list_service_product[index]["price_unit"]) ?? 0)

                    price_discount_for_cal = Number(value)
                    price_discount = Number(value)
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0) {
                        list_service_product[index]["price_discount"] = null
                        list_service_product[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                        // form.setFieldsValue({ [index]: { price_discount: null, price_discount_percent: null } })
                    } else {
                        list_service_product[index]["price_discount"] = MatchRound(price_discount)
                        list_service_product[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = value > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "price_discount_percent":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(takeOutComma(list_service_product[index]["price_unit"]) ?? 0)

                    price_discount_percent = Number(value)
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0 || (!!price_discount && Number(price_discount) < 0.01)) {
                        list_service_product[index]["price_discount"] = null
                        list_service_product[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount"] = MatchRound(price_discount)
                        list_service_product[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = value > 0 ? true : false
                    list_service_product[index]["is_discount_by_bath"] = false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "price_discount_bill":
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    if (!!value) {
                        // console.log('value :>> ', RoundingNumber(value));
                        price_discount_bill = RoundingNumber(value)
                    } else {
                        price_discount_bill = null
                    }
                    list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    break;

                default:
                    break;
            }
            // }
            if (isArray(list_service_product) && list_service_product.length === 0) price_discount_bill = null
            console.log("list_service_product", list_service_product)
            form.setFieldsValue({ list_service_product, price_discount_bill })
            calculateResult()
        } catch (error) {
            console.log('error :>> ', error);
        }
    }
    /*End debounce*/

    const addTable = (add) => {
        try {
            if (isFunction(add)) add({})
        } catch (error) {

        }
    }


    /**
     * It removes the service product from the list of service products.
     * @param remove - A function that removes the field from the form.
     * @param fieldName - The name of the field that you want to remove.
     * @param index - The index of the array element to be removed.
     */
    const removeListQuotationProduct = async (remove, fieldName, index) => {
        try {
            const { list_service_product } = form.getFieldsValue();
            if (isPlainObject(list_service_product[index])) {
                remove(fieldName)
                calculateResult()
            } else {
                remove(fieldName)
                calculateResult()
            }
            // remove(fieldName)
        } catch (error) {
            // console.log('error', error)
        }
    }

    const [isModalCalVatOpen, setIsModalCalVatOpen] = useState(false);
    const [inVatPrice, setInVatPrice] = useState(0);
    const [indexCalVatPrice, setIndexCalVatPrice] = useState(0);
    const [exVatPrice, setExVatPrice] = useState(0);

    const showModalCalVat = (index) => {
        setIndexCalVatPrice(index)
        setIsModalCalVatOpen(true);
    };
    const handleModalCalVatOk = () => {
        setIsModalCalVatOpen(false);
    };
    const handleModalCalVatCancel = async (type) => {
        switch (type) {
            case "include":
                calculateTable(await inVatPrice, indexCalVatPrice, "price_unit")
                break;
            case "exclude":
                calculateTable(await exVatPrice, indexCalVatPrice, "price_unit")
                break;
        }
        setIsModalCalVatOpen(false);
    };

    const calculateInExVat = (value, type) => {
        let newvalue, vat
        switch (type) {
            case "include":
                newvalue = value / 1.07
                vat = value * 7 / 100
                setInVatPrice(value)
                setExVatPrice(MatchRound(newvalue))
                break;
            case "exclude":
                newvalue = +value + (value * 7 / 100)
                vat = value * 7 / 100
                setInVatPrice(MatchRound(+newvalue))
                setExVatPrice(value)
                break;
        }
    }

    const clearInExVat = () => {
        setInVatPrice(0);
        setExVatPrice(0);
    }

    const formatNumber = (val, isUseDecimals = true) => {
        try {
            if (isUseDecimals) {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            } else {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }

        } catch (error) {
            console.log("formatNumber", formatNumber)
        }
    }

    const generateDot = async () => {
        const currentDate = DateTime.local()
        const lastYear = currentDate.minus({ year: 1 })
        const startOfYear = currentDate.startOf('year')


        const presentYear = []
        const currentYear = currentDate.toFormat('yy')
        // const currentYear = currentDate.weekYear.toString().slice(-2)
        for (let i = 1; i <= currentDate.weekNumber; i++) {
            presentYear.push({ value: `${i.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}${currentYear}` })
        }

        const newPresentYear = presentYear.map(e => { return parseInt(e.value) })
        const newArr = newPresentYear.sort((a, b) => { return b - a })
        const resultPresentYear = newArr.map(e => e.toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false }))

        const lastYearWeeks = []
        const AdLastYear = lastYear.toFormat('yy')
        // const currentYear = lastYear.weekYear.toString().slice(-2)
        for (let i = lastYear.weekNumber; i <= lastYear.weeksInWeekYear; i++) {
            lastYearWeeks.push({ value: `${i.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}${AdLastYear}` })
        }

        const newLastYear = lastYearWeeks.map(e => { return parseInt(e.value) })
        const newArrLastYear = newLastYear.sort((a, b) => { return b - a })
        const resultLastYear = newArrLastYear.map(e => e.toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false }))

        setResultDotArr([...resultPresentYear, ...resultLastYear])
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            {/* <Form
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            > */}
            <Form.List name="list_service_product">
                {(fields, { add, remove }) => (

                    <>

                        {mode !== "view" ?
                            <div className="pb-3" id="add-plus-outlined">
                                <div style={{ textAlign: "end" }}>
                                    <Button onClick={() => addTable(add)} icon={<PlusOutlined />}>
                                        เพิ่มรายการ
                                    </Button>
                                </div>
                            </div>
                            : null}

                        <div id='data-table'>
                            <div className='table-responsive'>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th >{GetIntlMessages(`ลำดับ`)}</th>
                                            <th>{GetIntlMessages(`รหัสสินค้า`)}</th>
                                            <th>{GetIntlMessages(`ชื่อสินค้า`)}</th>
                                            {/* <th>{GetIntlMessages(`หน่วยสินค้า`)}</th> */}
                                            {/* <th>{GetIntlMessages(`ราคาทุน/หน่วย`)}</th> */}
                                            <th>{GetIntlMessages(`ราคาขาย/หน่วย`)}</th>
                                            <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                            {/* <th>{GetIntlMessages(`คลังที่อยู่`)}</th> */}
                                            {/* <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th> */}
                                            <th>{GetIntlMessages(`หน่วยซื้อ`)}</th>
                                            {/* <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th> */}
                                            <th>{GetIntlMessages(`จำนวน`)}</th>
                                            <th>{GetIntlMessages(`ส่วนลด(บาท)`)}</th>
                                            <th>{GetIntlMessages(`ส่วนลด(%)`)}</th>
                                            <th>{GetIntlMessages(`ยอดรวม`)}</th>
                                            {/* {type != 4 ? <th>{GetIntlMessages(`ช่างซ่อม`)}</th> : null} */}
                                            {mode !== "view" ? <th>{GetIntlMessages(`manage`)}</th> : null}
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
                                                                name={[field.name, "product_id"]}
                                                                fieldKey={[field.fieldKey, "product_id"]}
                                                                // name={[field.name, "shop_stock_id"]}
                                                                // fieldKey={[field.fieldKey, "shop_stock_id"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <Select
                                                                    showSearch
                                                                    showArrow={false}
                                                                    // onSearch={(value) => handleSearchShopStock(value, index)}
                                                                    onSearch={(value) => debounceOnSearch(value, index)}
                                                                    onChange={(value) => selectProduct(value, index)}
                                                                    // filterOption={(inputValue, option) => option?.children.toLowerCase().search(inputValue?.toLowerCase()) !== -1}
                                                                    notFoundContent={null}
                                                                    filterOption={false}
                                                                    style={{ width: "100%" }}
                                                                    disabled={mode === "view"}
                                                                >
                                                                    {isArray(getArrListValue(index, "list_shop_stock")) && getArrListValue(index, "list_shop_stock").length > 0 ? getArrListValue(index, "list_shop_stock").map((e, i) => <Select.Option value={e.id} key={`product-code-${i}-${e.id}`}>{get(e, `Product.master_path_code_id`, "-")}</Select.Option>) : null}
                                                                </Select>
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Row gutter={[20, 10]}>
                                                                {/* <Col span={form.getFieldValue().list_service_product[index]?.is_service ? 17 : 24}>
                                                                        {!!form.getFieldValue().list_service_product[index]?.product_id && form.getFieldValue().list_service_product[index]?.changed_name_status === true ? */}
                                                                <Col span={!!form.getFieldValue().list_service_product[index]?.product_id ? 17 : 24}>
                                                                    {!!form.getFieldValue().list_service_product[index]?.product_id && form.getFieldValue().list_service_product[index]?.changed_name_status === true ?
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "changed_product_name"]}
                                                                            fieldKey={[field.fieldKey, "changed_product_name"]}
                                                                            noStyle={isTableNoStyle}
                                                                        >
                                                                            <Input placeholder={GetIntlMessages('ชื่อที่เปลี่ยน')} disabled={mode === "view"} style={{ width: "100%", height: "auto", wordWrap: "break-word" }} />
                                                                        </Form.Item>

                                                                        :
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "product_id"]}
                                                                            fieldKey={[field.fieldKey, "product_name"]}
                                                                            noStyle={isTableNoStyle}
                                                                        >
                                                                            <Select
                                                                                showSearch
                                                                                showArrow={false}
                                                                                onSearch={(value) => debounceOnSearch(value, index)}
                                                                                // onSearch={(value) => handleSearchShopStock(value, index)}
                                                                                onChange={(value) => selectProduct(value, index)}
                                                                                filterOption={false}
                                                                                notFoundContent={null}
                                                                                style={{ width: "100%", height: "auto", wordWrap: "break-word" }}
                                                                                disabled={mode === "view"}
                                                                                dropdownMatchSelectWidth={false}
                                                                            >
                                                                                {isArray(getArrListValue(index, "list_shop_stock")) && getArrListValue(index, "list_shop_stock").length > 0 ? getArrListValue(index, "list_shop_stock").map(e => <Select.Option value={e.id} key={`product-name-${e.id}`}>{get(e, `Product.product_name.${[locale.locale]}`, "-")}</Select.Option>) : null}
                                                                            </Select>
                                                                        </Form.Item>
                                                                    }

                                                                </Col>
                                                                {!!form.getFieldValue().list_service_product[index]?.product_id ?
                                                                    <Col span={7}>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "changed_name_status"]}
                                                                            fieldKey={[field.fieldKey, "changed_name_status"]}
                                                                            noStyle={isTableNoStyle}
                                                                        >
                                                                            {/* <Switch style={{ marginTop: "6px" }} disabled={mode === "view"} unCheckedChildren={GetIntlMessages("ไม่เปลี่ยนชื่อ")} checkedChildren={GetIntlMessages("เปลี่ยนชื่อ")} checked={form.getFieldValue()?.list_service_product[index]?.changed_name_status} /> */}
                                                                            <Switch disabled={mode === "view"} unCheckedChildren={GetIntlMessages("ไม่เปลี่ยนชื่อ")} checkedChildren={GetIntlMessages("เปลี่ยนชื่อ")} checked={form.getFieldValue()?.list_service_product[index]?.changed_name_status} onChange={(bool) => isOnChangeProductName(bool, index)} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                    : null}
                                                            </Row>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "price_unit"]}
                                                                fieldKey={[field.fieldKey, "price_unit"]}
                                                                // rules={[RegexMultiPattern("4", GetIntlMessages("only-number"))]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                                // rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                {/* <Input type={"number"} min={0} onChange={(value)=>debounceCalculateResult(value.target.value,index,"price_unit")}  style={{ width: "100%",textAlign :"end" }} disabled={mode === "view"} /> */}
                                                                <InputNumber
                                                                    precision={2}
                                                                    stringMode
                                                                    onChange={(value) => debounceQuotation(takeOutComma(value), index, "price_unit")}
                                                                    // onBlur={(value) => debounceQuotation(takeOutComma(value.target.value), index, "price_unit")}
                                                                    style={{ width: "100%" }}
                                                                    disabled={mode === "view"}
                                                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                    addonAfter={
                                                                        <Button
                                                                            disabled={mode === "view"}
                                                                            type='text'
                                                                            size='small'
                                                                            style={{ border: 0 }}
                                                                            onClick={() => showModalCalVat(index)} >
                                                                            <CalculatorOutlined />
                                                                        </Button>
                                                                    }
                                                                    className='ant-input-number-after-addon-20-percent'
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        {/* <td>
                                                            <SelectDots name={[field.name, "dot_mfd"]} isNoStyle form={form} docTypeId={docTypeId} index={index} fieldKey={[field.fieldKey, "dot_mfd"]} disabled={mode === "view"} field={field} />

                                                        </td> */}
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "dot_mfd"]}
                                                                fieldKey={[field.fieldKey, "dot_mfd"]}
                                                                noStyle={isTableNoStyle}
                                                                rules={[
                                                                    RegexMultiPattern("1", GetIntlMessages("ตัวเลขเท่านั้น")),
                                                                    {
                                                                        min: 4,
                                                                        message: GetIntlMessages("กรุณากรอกอย่างน้อย 4 ตัว")
                                                                    }
                                                                ]}
                                                            >
                                                                <AutoComplete
                                                                    options={resultDotArr.map(e => { return { 'value': e } })}
                                                                    style={{
                                                                        width: "100%",
                                                                    }}
                                                                    maxLength={4}
                                                                    disabled={mode === "view"}
                                                                    filterOption={(inputValue, option) =>
                                                                        option.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                    }
                                                                    placeholder="ค้นหาหรือเพิ่มข้อมูลใหม่"
                                                                />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "purchase_unit_id"]}
                                                                fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <Select style={{ width: "100%" }} disabled={mode === "view"} onChange={(value) => selectPurchaseUit(value, index)}>
                                                                    {isArray(getArrListValue(index, "purchase_unit_list")) && getArrListValue(index, "purchase_unit_list").length > 0 ? getArrListValue(index, "purchase_unit_list").map(e => <Select.Option value={e.id} key={`purchase-unit-${index}-${e.id}`}>{e.type_name[locale.locale]}</Select.Option>) : null}
                                                                </Select>
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "amount"]}
                                                                fieldKey={[field.fieldKey, "amount"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <InputNumber disabled={mode === "view"} stringMode precision={0} min={0} onChange={(value) => debounceQuotation(takeOutComma(value), index, "amount")} style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "price_discount"]}
                                                                fieldKey={[field.fieldKey, "price_discount"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <InputNumber disabled={mode === "view"} stringMode precision={2} min={0} onChange={(value) => debounceQuotation(takeOutComma(value), index, "price_discount")} style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "price_discount_percent"]}
                                                                fieldKey={[field.fieldKey, "price_discount_percent"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <InputNumber disabled={mode === "view"} stringMode precision={2} min={0} max={100} onChange={(value) => debounceQuotation(takeOutComma(value), index, "price_discount_percent")} style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </td>
                                                        <td style={{ textAlign: "end" }}>
                                                            {Number(getValue(index, "price_grand_total")) != 0 ? RoundingNumber(getValue(index, "price_grand_total")) : null}
                                                        </td>

                                                        {mode !== "view" ?
                                                            <td style={{ textAlign: "center" }}>
                                                                <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removeListQuotationProduct(remove, field.name, index)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
                                                                    <Button icon={<MinusCircleOutlined />}>
                                                                        ลบรายการ
                                                                    </Button>
                                                                </Popconfirm>
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

            {/* </Form> */}


            <Fieldset style={{ marginTop: "20px" }} legend={`สรุปรายการ`}>
                <Row gutter={[10, 10]}>
                    <Col lg={12} md={12} xs={24}>
                        <Row gutter={[20, 10]}>
                            <Col span={12}>
                                <Form.Item label={GetIntlMessages("หมายเหตุ")} name="remark">
                                    <Input.TextArea rows={16} disabled={mode === "view"} />
                                </Form.Item>

                            </Col>
                            <Col span={12}>
                                <Form.Item label={GetIntlMessages("หมายเหตุภายใน")} name="remark_inside">
                                    <Input.TextArea rows={16} disabled={mode === "view"} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col lg={{ span: 6, offset: 6 }} md={{ span: 6, offset: 6 }} xs={24}>
                        <Form.Item label={GetIntlMessages("ส่วนลดท้ายบิล")} stringMode min={0} precision={2} name="price_discount_bill">
                            <InputNumber style={{ width: "100%", textAlign: "end" }}
                                // formatter={(value) => !!value ? formatNumber(value) : ""}
                                formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                onBlur={() => calculateResult()}
                                disabled={mode === "view"}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ส่วนลดก่อนชำระเงิน")} stringMode min={0} precision={2} name="price_discount_before_pay">
                            <InputNumber style={{ width: "100%", textAlign: "end" }} disabled
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("รวมเป็นเงิน")} stringMode min={0} precision={2} name="price_sub_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ส่วนลดรวม")} stringMode min={0} precision={2} name="price_discount_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ราคาหลังหักส่วนลด")} stringMode min={0} precision={2} name="price_amount_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ราคาก่อนรวมภาษี")} stringMode min={0} precision={2} name="price_before_vat">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages(`ภาษีมูลค่าเพิ่ม ${taxTypes.find(where => where.id === checkTaxId)?.[`detail`]["tax_rate_percent"] ?? null} %`)} stringMode min={0} precision={2} name="price_vat">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="price_grand_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Fieldset>

            <Modal title="คำนวณราคารวม/แยกภาษี" open={isModalCalVatOpen} footer={null} onOk={handleModalCalVatOk} onCancel={handleModalCalVatCancel}>
                <Form.Item
                    name="tax_type_id"
                    label={`ประเภทภาษี`}
                >
                    <Select
                        showSearch
                        showArrow={false}
                        filterOption={false}
                        style={{ width: "100%" }}
                        disabled={mode === "view"}
                        onSelect={() => calculateResult()}
                    >
                        {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                    </Select>
                </Form.Item>
                <Form.Item label="ราคารวมภาษี">
                    <InputNumber onChange={(val) => calculateInExVat(val, "include")} style={{ width: '100%' }}
                        value={inVatPrice}
                        addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                onClick={() => handleModalCalVatCancel("include")} >
                                เลือก
                            </Button>
                        }
                        // addonAfter={`฿`}
                        step="1"
                        stringMode
                        precision={2}
                        placeholder={"บาท"}
                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        className='ant-input-number-after-addon-20-percent'
                    ></InputNumber>
                </Form.Item>
                <Form.Item label="ราคาแยกภาษี">
                    <InputNumber onChange={(val) => calculateInExVat(val, "exclude")} style={{ width: '100%' }}
                        value={exVatPrice}
                        addonAfter={
                            <Button
                                onClick={() => handleModalCalVatCancel("exclude")}
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                            >
                                เลือก
                            </Button>
                        }
                        step="1"
                        stringMode
                        precision={2}
                        placeholder={"บาท"}
                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        // addonAfter={`฿`}
                        className='ant-input-number-after-addon-20-percent'
                    ></InputNumber>
                </Form.Item>
                <div style={{ width: '100%', textAlign: 'center' }} >
                    <Button onClick={clearInExVat} type="primary">
                        ค่าเริ่มต้น
                    </Button>
                </div>
            </Modal>

            <style jsx global>
                {`
                   .ant-select-show-search.ant-select:not(.ant-select-customize-input)
                   .ant-select-selector {
                   height: auto;
                 }
                 .ant-select-single.ant-select-show-arrow .ant-select-selection-item {
                   white-space: normal;
                   word-break: break-all;
                 }

                `}
            </style>
        </>
    )
}

export default ComponentsRoutesModalTabs1QuotationList