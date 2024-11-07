import { useEffect, useState } from 'react'
import { Input, Select, Form, Row, Col, Button, message, Popconfirm, InputNumber ,Switch } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import API from '../../../../../util/Api'
import Fieldset from '../../../../shares/Fieldset';
import SortingData from '../../../../shares/SortingData';
import { RoundingNumber,takeOutComma  } from '../../../../shares/ConvertToCurrency';
import RegexMultiPattern from '../../../../shares/RegexMultiPattern';
import SelectDots from '../../../Dot/Components.Select.Dot';
import { find, get, isArray, isFunction, isPlainObject,debounce  } from 'lodash';
import { useSelector } from 'react-redux';
import Swal from "sweetalert2";




const ComponentsRoutesModalProductList = ({ onFinish, onFinishFailed, mode,isTableNoStyle,docTypeId , calculateResult ,checkTaxId}) => {
    const { taxTypes } = useSelector(({ master }) => master);
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const form = Form.useFormInstance()
    

    /**
    * Get the value of the array field at the specified index
    * @param {number} index - The index of the array.
    * @param {string} type - The type of the field.
    * @returns The `getArrListValue` function returns an array of values.
    */
    const getArrListValue = (index, type) => {
        try {
            const { shopPurchaseOrderLists } = form.getFieldValue();
            if (shopPurchaseOrderLists && !isPlainObject(shopPurchaseOrderLists[index])) shopPurchaseOrderLists = {};
            return isArray(shopPurchaseOrderLists[index][type]) ? shopPurchaseOrderLists[index][type] ?? [] : []
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const getValue = (index, type) => {
        try {
            const { shopPurchaseOrderLists } = form.getFieldValue();
            if (shopPurchaseOrderLists && !isPlainObject(shopPurchaseOrderLists[index])) shopPurchaseOrderLists = {};
            return isArray(shopPurchaseOrderLists) ? shopPurchaseOrderLists[index][type] ?? "" : ""
        } catch (error) {
            // console.log('error getValue:>> ', error);
        }
    }

    
    const addTable = (add) => {
        try {
            if (isFunction(add)) add({})
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

       /**
     * It removes the service product from the list of service products.
     * @param remove - A function that removes the field from the form.
     * @param fieldName - The name of the field that you want to remove.
     * @param index - The index of the array element to be removed.
     */
        const removePurchaseOrderLists = async (remove, fieldName, index) => {
            try {
                const { shopPurchaseOrderLists } = form.getFieldsValue();
                if (isPlainObject(shopPurchaseOrderLists[index])) {
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

          /*Search Product*/
    const debounceOnSearch = debounce((value, index) => handleSearchShopProduct(value, index), 800)
    const handleSearchShopProduct = async (value, index) => {
        try {
            const { shopPurchaseOrderLists } = form.getFieldValue();
            if (isPlainObject(shopPurchaseOrderLists[index])) {
                if (!!value) {
                    const { data } = await API.get(`/shopProducts/all?limit=50&page=1&search=${value}&status=active&sort=start_date&order=asc&dropdown=false`);
                    shopPurchaseOrderLists[index].list_shop_stock = data.status === "success" ? SortingData(data.data.data, `Product.product_name.${locale.locale}`) : []
                }
            } else {
                shopPurchaseOrderLists[index] = {}
            }

            form.setFieldsValue({
                shopPurchaseOrderLists
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
            const { shopPurchaseOrderLists } = form.getFieldsValue();
            const shopProduct = shopPurchaseOrderLists[index].list_shop_stock.find(where => where.id === value);
            const shopProductPrice = get(shopProduct, `price`, null);
            
            shopPurchaseOrderLists[index].list_shop_stock = [shopProduct];
            shopPurchaseOrderLists[index].price_unit = RoundingNumber(get(shopProductPrice, `suggasted_re_sell_price.retail`, 0))
            shopPurchaseOrderLists[index].type_group_id = shopProduct.Product.ProductType.type_group_id
            shopPurchaseOrderLists[index].purchase_unit_list = shopProduct.Product.ProductType.ProductPurchaseUnitTypes
            if (shopProduct.Product.ProductType.ProductPurchaseUnitTypes.length === 1){
                shopPurchaseOrderLists[index].purchase_unit_id = shopProduct.Product.ProductType.ProductPurchaseUnitTypes[0].id
            } else{
                const find = shopProduct.Product.ProductType.ProductPurchaseUnitTypes.find(where => {return where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeTire || (shopProduct.Product?.ProductType.id === productTypeBattery && where.id === purchaseUnitTypeBattery)})
                shopPurchaseOrderLists[index].purchase_unit_id = isPlainObject(find) ? find.id ?? null : null
            }

            shopPurchaseOrderLists[index].is_service = shopProduct?.Product?.ProductType?.type_group_id === "a613cd37-8725-4c0e-ba5f-2ea021846dc7" ? true : false
            shopPurchaseOrderLists[index].changed_product_name = null

            const checkDuplicateData = shopPurchaseOrderLists.filter(where => { return where.product_id === value && where.type_group_id === "a613cd37-8725-4c0e-ba5f-2ea021846dc7" && shopPurchaseOrderLists[index].purchase_unit_id === "b83ba876-4b03-4877-b4d0-ad4a804e587e" })
            if (checkDuplicateData.length > 1) {
                Swal.fire(`${GetIntlMessages("รายการสินค้าซ้ำ !!")}`, `${GetIntlMessages(`ท่านได้มีการเพิ่ม "สินค้า/บริการ","DOT/MFD","หน่วยซื้อ" เดียวกันแล้ว`)}`, 'warning')
                // shopPurchaseOrderLists[index] = {}
                shopPurchaseOrderLists[index].product_id = null
                shopPurchaseOrderLists[index].purchase_unit_id = null
                shopPurchaseOrderLists[index].price_unit = null
                shopPurchaseOrderLists[index].dot_mfd = null
                shopPurchaseOrderLists[index].amount = null
                shopPurchaseOrderLists[index].price_discount = null
                shopPurchaseOrderLists[index].price_discount_percent = null
                shopPurchaseOrderLists[index].price_grand_total = null
            }
            form.setFieldsValue({
                shopPurchaseOrderLists
            })
        } catch (error) {
            // console.log('error handleSearchShopStock :>> ', error);
        }
    }
    /*End Select Product*/

     /*OnChangeProductName*/
     const isOnChangeProductName = (bool, index) => {
        try {
            const { shopPurchaseOrderLists } = form.getFieldsValue();
            const _find = isArray(shopPurchaseOrderLists[index]?.list_shop_stock) ? shopPurchaseOrderLists[index]?.list_shop_stock.find(where => where.id === shopPurchaseOrderLists[index].product_id) : null
            shopPurchaseOrderLists[index].changed_product_name = bool === true ? shopPurchaseOrderLists[index].changed_product_name ?? get(_find, `Product.product_name.${locale.locale}`, null) : null
            shopPurchaseOrderLists[index].changed_name_status = bool
            form.setFieldsValue({ shopPurchaseOrderLists })
        } catch (error) {
            // console.log('error isOnChangeProductName :>> ', error);
        }
    }
    /*End OnChangeProductName*/

     /*debounce*/
     const debouncePurchaseOrder = debounce((value, index, type) => onChangePurchaseOrderList(value, index, type), 1200)
     const onChangePurchaseOrderList = (value, index, type) => {
         try {
             const { shopPurchaseOrderLists, price_discount_bill } = form.getFieldValue()
             const quotationListIndex = shopPurchaseOrderLists[index]
             const priceGrandTotalWithOutDiscount = (Number(takeOutComma(quotationListIndex?.price_unit)) ?? 0) * (Number(takeOutComma(quotationListIndex?.amount)) ?? 0)
 
             let multiplyPriceDiscount = 0
             if (!!quotationListIndex?.price_discount && !!quotationListIndex?.amount) {
 
             }
             // if(!!value){
             switch (type) {
                 case "price_unit":
                     if (!!value) {
                         multiplyPriceDiscount = Number(takeOutComma(quotationListIndex?.price_discount)) * Number(takeOutComma(quotationListIndex?.amount ?? 0))
                         shopPurchaseOrderLists[index][type] = RoundingNumber(value)
                         shopPurchaseOrderLists[index].price_grand_total = (RoundingNumber(priceGrandTotalWithOutDiscount - multiplyPriceDiscount))
                     } else {
                         // console.log('value :>> ', value);
                         shopPurchaseOrderLists[index][type] = null
                         shopPurchaseOrderLists[index].price_grand_total = null
                         shopPurchaseOrderLists[index].amount = null
                         shopPurchaseOrderLists[index].price_discount = null
                         shopPurchaseOrderLists[index].price_discount_percent = null
                     }
 
                     break;
                 case "amount":
                     if (!!value) {
                         multiplyPriceDiscount = Number(takeOutComma(quotationListIndex?.price_discount)) * Number(takeOutComma(quotationListIndex?.amount ?? 0))
                         shopPurchaseOrderLists[index][type] = Number(value).toLocaleString()
                         shopPurchaseOrderLists[index].price_grand_total = RoundingNumber((priceGrandTotalWithOutDiscount - multiplyPriceDiscount))
                     } else {
                         shopPurchaseOrderLists[index][type] = null
                         shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(priceGrandTotalWithOutDiscount)
                     }
 
                     // shopPurchaseOrderLists[index].price_grand_total = RoundingNumber((Number(takeOutComma(quotationListIndex?.price_unit)) * Number(value) - Number(takeOutComma(quotationListIndex?.price_discount)) ?? 0))
                     break;
                 case "price_discount":
                     if (!!value) {
                         const resultCovertData = (((Number(takeOutComma(value)) / Number(takeOutComma(quotationListIndex?.price_unit) ?? 0)) * 100))
                         // console.log('resultCovertData :>> ', resultCovertData);
                         if (Number(resultCovertData) < 0.01) {
                             Swal.fire({
                                 icon: 'warning',
                                 title: GetIntlMessages("warning"),
                                 text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01"),
                             });
                             //    setDiscountBathValue("")
                             //    setDiscountPercentValue("")
                             //    return null
                             shopPurchaseOrderLists[index][type] = null
                             shopPurchaseOrderLists[index].price_discount_percent = null
                         } else {
                             shopPurchaseOrderLists[index].price_discount_percent = RoundingNumber(resultCovertData) ?? 0
                             shopPurchaseOrderLists[index].price_discount = RoundingNumber(value)
                             multiplyPriceDiscount = (Number(takeOutComma(quotationListIndex?.amount ?? 0)) * Number(takeOutComma(value)))
                             shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(Number(takeOutComma(priceGrandTotalWithOutDiscount) ?? 0) - multiplyPriceDiscount)
                             //    return resultCovertData ?? null
                         }
                     } else {
                         shopPurchaseOrderLists[index][type] = null
                         shopPurchaseOrderLists[index].price_discount_percent = null
                         shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(priceGrandTotalWithOutDiscount)
                     }
                     break;
                 case "price_discount_percent":
                     if (!!value) {
                         const resultCovertData = ((Number(takeOutComma(shopPurchaseOrderLists[index]?.price_unit) ?? 0) * (Number(takeOutComma(value)) / 100)).toFixed(2))
                         shopPurchaseOrderLists[index][type] = RoundingNumber(value) ?? 0
                         shopPurchaseOrderLists[index].price_discount = RoundingNumber(resultCovertData) ?? 0
                         multiplyPriceDiscount = Number(takeOutComma(resultCovertData)) * Number(takeOutComma(quotationListIndex?.amount ?? 0))
                         shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(priceGrandTotalWithOutDiscount - multiplyPriceDiscount)
                         // shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(priceGrandTotalWithOutDiscount - (Number(resultCovertData) * (Number(takeOutComma(quotationListIndex?.amount ?? 0))))) ?? 0
                     } else {
                         shopPurchaseOrderLists[index][type] = null
                         shopPurchaseOrderLists[index].price_discount = null
                         shopPurchaseOrderLists[index].price_grand_total = RoundingNumber(priceGrandTotalWithOutDiscount)
                     }
                     break;
                 case "price_discount_bill":
 
                     if (!!value) {
                         // console.log('value :>> ', RoundingNumber(value));
                         price_discount_bill = RoundingNumber(value)
                     } else {
                         price_discount_bill = null
                     }
                     break;
 
                 default:
                     break;
             }
             // }
 
             form.setFieldsValue({ shopPurchaseOrderLists, price_discount_bill })
             calculateResult()
         } catch (error) {
            //  console.log('error :>> ', error);
         }
     }
     /*End debounce*/
    return (
        <>
            <Form.List name="shopPurchaseOrderLists">
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
                                            <th>{GetIntlMessages(`ลำดับ`)}</th>
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
                                                                <Col span={!!form.getFieldValue().shopPurchaseOrderLists[index]?.product_id ? 17 : 24}>
                                                                    {!!form.getFieldValue().shopPurchaseOrderLists[index]?.product_id && form.getFieldValue().shopPurchaseOrderLists[index]?.changed_name_status === true ?
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
                                                                {!!form.getFieldValue().shopPurchaseOrderLists[index]?.product_id ?
                                                                    <Col span={7}>
                                                                        <Form.Item
                                                                            {...field}
                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                            name={[field.name, "changed_name_status"]}
                                                                            fieldKey={[field.fieldKey, "changed_name_status"]}
                                                                            noStyle={isTableNoStyle}
                                                                        >
                                                                            {/* <Switch style={{ marginTop: "6px" }} disabled={mode === "view"} unCheckedChildren={GetIntlMessages("ไม่เปลี่ยนชื่อ")} checkedChildren={GetIntlMessages("เปลี่ยนชื่อ")} checked={form.getFieldValue()?.shopPurchaseOrderLists[index]?.changed_name_status} /> */}
                                                                            <Switch disabled={mode === "view"} unCheckedChildren={GetIntlMessages("ไม่เปลี่ยนชื่อ")} checkedChildren={GetIntlMessages("เปลี่ยนชื่อ")} checked={form.getFieldValue()?.shopPurchaseOrderLists[index]?.changed_name_status} onChange={(bool) => isOnChangeProductName(bool, index)} />
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
                                                                rules={[RegexMultiPattern("4", GetIntlMessages("only-number"))]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                                // rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                {/* <Input type={"number"} min={0} onChange={(value)=>debounceCalculateResult(value.target.value,index,"price_unit")} bordered={false} style={{ width: "100%",textAlign :"end" }} disabled={mode === "view"} /> */}
                                                                <InputNumber precision={2} min={0} stringMode onChange={(value) => debouncePurchaseOrder(value, index, "price_unit")} bordered={false} style={{ width: "100%" }} disabled={mode === "view"} />
                                                            </Form.Item>
                                                        </td>
                                                        <td>
                                                            <SelectDots name={[field.name, "dot_mfd"]} isNoStyle form={form} docTypeId={docTypeId} index={index} fieldKey={[field.fieldKey, "dot_mfd"]} disabled={mode === "view"} field={field} />
                                                        </td>
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "purchase_unit_id"]}
                                                                fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                                                noStyle={isTableNoStyle}
                                                            >
                                                                <Select style={{ width: "100%" }} disabled={mode === "view"} >
                                                                {/* <Select style={{ width: "100%" }} disabled={mode === "view"} onChange={(value) => selectPurchaseUit(value, index)}> */}
                                                                    {isArray(getArrListValue(index, "purchase_unit_list")) && getArrListValue(index, "purchase_unit_list").length > 0 ? getArrListValue(index, "purchase_unit_list").map(e => <Select.Option value={e.id} key={`purchase-unit-${index}-${e.id}`}>{e.type_name[locale.locale]}</Select.Option>) : null}
                                                                </Select>
                                                            </Form.Item>
                                                        </td>
                                                        {/* <td style={{ textAlign: "end" }}>
                                                                {Number(getValue(index, "balance")).toLocaleString()}
                                                            </td> */}
                                                        <td>
                                                            <Form.Item
                                                                {...field}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "amount"]}
                                                                fieldKey={[field.fieldKey, "amount"]}
                                                                noStyle={isTableNoStyle}
                                                            // rules={[RegexMultiPattern("1", GetIntlMessages("only-number"))]}
                                                            >
                                                                {/* <InputNumber disabled={mode === "view"} stringMode bordered={false} precision={0} min={0} style={{ width: "100%" }} /> */}
                                                                <InputNumber disabled={mode === "view"} stringMode bordered={false} precision={0} min={0} onChange={(value) => onChangePurchaseOrderList(value, index, "amount")} style={{ width: "100%" }} />
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
                                                                {/* <InputNumber disabled={mode === "view"} stringMode precision={2} min={0}  bordered={false} style={{ width: "100%" }} /> */}
                                                                <InputNumber disabled={mode === "view"} stringMode precision={2} min={0} onChange={(value) => onChangePurchaseOrderList(value, index, "price_discount")} bordered={false} style={{ width: "100%" }} />
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
                                                                {/* <InputNumber disabled={mode === "view"} stringMode precision={2} min={0}  bordered={false} style={{ width: "100%" }} /> */}
                                                                <InputNumber disabled={mode === "view"} stringMode precision={2} min={0} onChange={(value) => onChangePurchaseOrderList(value, index, "price_discount_percent")} bordered={false} style={{ width: "100%" }} />
                                                            </Form.Item>
                                                        </td>
                                                        <td style={{ textAlign: "end" }}>
                                                            {/* <Form.Item
                                                                    {...field}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price_grand_total"]}
                                                                    fieldKey={[field.fieldKey, "price_grand_total"]}
                                                                    noStyle={isTableNoStyle}
                                                                >
                                                                    <InputNumber bordered={false} style={{ width: "100%" }}/>
                                                                </Form.Item> */}
                                                            {Number(getValue(index, "price_grand_total")) != 0 ? RoundingNumber(getValue(index, "price_grand_total")) : null}
                                                        </td>

                                                        {mode !== "view" ?
                                                            <td style={{ textAlign: "center" }}>
                                                                {/* <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`}  okText={'ตกลง'} cancelText={'ยกเลิก'}> */}
                                                                <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removePurchaseOrderLists(remove, field.name, index)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
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

            <Fieldset legend={GetIntlMessages("สรุปรายการ")} className="pb-3">
                {/* <Form
                    form={form}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    labelCol={{ span: 12 }}
                    wrapperCol={{ span: 18 }}
                > */}

                <Row>
                    <Col lg={14} md={10} sm={10} xs={24}>
                        <Row>
                            <Col lg={10} xs={24}>
                                <Form.Item
                                    labelCol={4}
                                    name="remark"
                                    label="หมายเหตุ"
                                >
                                    <Input.TextArea rows={14} disabled={mode == "view"} />
                                </Form.Item>
                            </Col>
                            <Col lg={4} xs={0}></Col>
                            <Col lg={10} xs={24}>
                                <Form.Item
                                    labelCol={4}
                                    name="remark_inside"
                                    label="หมายเหตุ (ภายใน)"
                                >
                                    <Input.TextArea rows={14} disabled={mode == "view"} />
                                </Form.Item>
                            </Col>
                        </Row>

                    </Col>

                    {/* <Col lg={4} md={4} sm={4} xs={24} /> */}

                    <Col lg={{ offset: 4, span: 6 }} md={{ offset: 2, span: 12 }} sm={{ offset: 1, span: 11 }} xs={24}>
                        {/* <div> */}
                        <Form.Item name="price_discount_bill" label="ส่วนลดท้ายบิล" >
                            {/* <Input style={{ textAlign: "end" }} onChange={(value)=>onChangePurchaseOrderList(value.target.value,null, "price_discount_bill")} disabled={mode === "view"} /> */}
                            <InputNumber className='ant-input-number-with-addon-after' addonAfter={`บาท`} stringMode precision={2} min={0} style={{ textAlign: "end", width: "100%" }} onChange={(value) => debouncePurchaseOrder(value, null, "price_discount_bill")} disabled={mode === "view"} />
                        </Form.Item>
                        {/* </div> */}
                        <Form.Item name="price_sub_total" label="รวมเป็นเงิน">
                            <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                        </Form.Item>
                        <Form.Item name="price_discount_total" label="ส่วนลดรวม">
                            <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                        </Form.Item>
                        <Form.Item name="price_amount_total" label="ราคาหลังหักส่วนลด">
                            <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                        </Form.Item>

                        {checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ?
                            <Form.Item name="price_before_vat" label="ราคาก่อนรวมภาษี">
                                <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                            </Form.Item>
                            : null}

                        <Form.Item name="price_vat" label={`ภาษีมูลค่าเพิ่ม ${taxTypes.find(where => where.id === checkTaxId)?.detail?.tax_rate_percent ?? "7"}%`}>
                            <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                        </Form.Item>

                        <Form.Item name="price_grand_total" label="จำนวนเงินรวมทั้งสิ้น">
                            <Input addonAfter={`บาท`} style={{ textAlign: "end" }} readOnly />
                        </Form.Item>

                    </Col>
                </Row>
                {/* </Form> */}

            </Fieldset>


            {/* <Form
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                <Form.List name="shopPurchaseOrderLists">
                    {(fields, { add, remove }) => (

                        <>

                            {mode != "view" ?
                                <div className="pb-3" id="add-plus-outlined">
                                    <div style={{ textAlign: "end" }}>
                                        <Button onClick={() => add} icon={<PlusOutlined />}>
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
                                                <th>{GetIntlMessages(`ลำดับ`)}</th>
                                                <th>{GetIntlMessages(`รหัสสินค้า`)}</th>
                                                <th>{GetIntlMessages(`ชื่อสินค้า`)}</th>
                                                <th>{GetIntlMessages(`ราคาทุน/หน่วย`)}</th>
                                                <th>{GetIntlMessages(`ราคาขาย/หน่วย`)}</th>
                                                <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                                <th>{GetIntlMessages(`คลังที่อยู่`)}</th>
                                                <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th>
                                                <th>{GetIntlMessages(`หน่วยซื้อ`)}</th>
                                                <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th>
                                                <th>{GetIntlMessages(`จำนวน`)}</th>
                                                <th>{GetIntlMessages(`ส่วนลด(บาท)`)}</th>
                                                <th>{GetIntlMessages(`ส่วนลด(%)`)}</th>
                                                <th>{GetIntlMessages(`ยอดรวม`)}</th>
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

                                                            </td>
                                                            <td>

                                                            </td>

                                                            <td style={{ textAlign: "end" }}>

                                                            </td>
                                                            <td style={{ textAlign: "end" }}>

                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td>

                                                            </td>

                                                            <td style={{ textAlign: "end" }}>

                                                            </td>
                                                            <td>

                                                            </td>
                                                            <td style={{ textAlign: "end" }}>

                                                            </td>
                                                            <td style={{ textAlign: "end" }}>

                                                            </td>

                                                            <td style={{ textAlign: "end" }}>
                                                                {Number(getValue(index, "each_total_price")) != 0 ? Number(getValue(index, "each_total_price")).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null}
                                                            </td>

                                                            {mode != "view" && type != 2 && type != 3 ?
                                                                <td style={{ textAlign: "center" }}>
                                                                    <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removeListServiceProduct(remove, field.name, index)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
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
            </Form> */}



            {/* <style jsx global>
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
    </style> */}
        </>
    )
}

export default ComponentsRoutesModalProductList