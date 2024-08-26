import { Col, Form, Input, Select } from 'antd'
import { isFunction } from 'lodash';
import React, { useEffect, useState } from 'react'
import GetIntlMessages from '../../../util/GetIntlMessages';

const DiscountEachProduct = ({ form, tailformItemLayout, field, mode, expireEditTimeDisable, summary, index, onBlurData, isStepsDiscount = false }) => {
    // const { summary } = calculateFuction
    const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

    const checkfieldDiscountOne = (i, type) => {
        try {
            const { product_list } = form.getFieldValue()

            const eachProductTotalPrice = product_list[i].total_price
            const productListDiscount1 = product_list[i].discount_percentage_1
            const productListDiscount2 = product_list[i].discount_percentage_2
            // const eachProductTotalPrice = `${product_list[i].total_price}`
            // const productListDiscount1 = `${product_list[i].discount_percentage_1}`
            // const productListDiscount2 = `${product_list[i].discount_percentage_2}`

            if (isStepsDiscount === true) {
                switch (type) {
                    case "discount_percentage_1":
                        if (!eachProductTotalPrice || eachProductTotalPrice == null || eachProductTotalPrice == undefined || eachProductTotalPrice.length <= 0) {
                            return true
                        } else {
                            return false
                        }

                    case "discount_percentage_2":
                        if (!productListDiscount1 || productListDiscount1 == null || productListDiscount1 == undefined || productListDiscount1.length <= 0) {
                            return true
                        } else {
                            return false
                        }

                    case "discount_3":
                        if (!productListDiscount2 || productListDiscount2 == null || productListDiscount2 == undefined || productListDiscount2.length <= 0) {
                            return true
                        } else {
                            return false
                        }

                    default: return false

                }
            } else {
                return false
            }



        } catch (error) {

        }
    }

    const calculateDiscount = (i, type, value) => {
        const newValue = value?.replaceAll(",", "")
        const formValue = form.getFieldValue()
        const productList = formValue.product_list[i]
        const eachProductTotalPrice = productList?.total_price ? productList?.total_price : 0

        const validate = newValue.match(new RegExp(/^[\.0-9]*$/)) //match แค่ตัวเลขกับจุด(.) เท่านั้น

        if (isStepsDiscount === true) {
            if (validate != null && validate["input"].length != 0) {
                switch (type) {
                    case "discount_percentage_1":
                        productList[type] = newValue
                        // productList[`${type}_text`] = newValue.toLocaleString(undefined,twoDigits)
                        break;
                    case "discount_percentage_2":
                        productList[type] = newValue
                        // productList[`${type}_text`] = newValue.toLocaleString(undefined,twoDigits)
                        break;
                    case "discount_3":
                        productList[type] = newValue
                        // productList[`${type}_text`] = newValue.toLocaleString(undefined,twoDigits)
                        break;

                    default:
                        break;
                }
            } else {
                productList[type] = null
            }

        } else {
            if (validate != null && validate["input"].length != 0) {
                productList[type] = newValue
            } else {
                productList[`${type}_text`] = null
                productList[type] = null
                productList[`discount_thb`] = null
                productList[`discount_thb_text`] = null
            }

        }

        if (summary && isFunction(summary)) summary(i, isStepsDiscount)

    }

    const discountType = (i, fieldName) => {
        try {
            const formValue = form.getFieldValue()
            const { product_list } = formValue
            return (
                <Select style={{ width: 80 }} disabled={mode === "view" || expireEditTimeDisable} onChange={(value) => handleChangeDiscountType(i, value, fieldName)} bordered={false} key={`${i}-${fieldName}-type`} value={product_list[i][`${fieldName}_type`]}>
                    <Select.Option value={`percent`}>%</Select.Option>
                    <Select.Option value={`bath`}>บาท</Select.Option>
                </Select>
            )
        } catch (error) {

        }

    }

    const handleChangeDiscountType = (i, value, fieldName) => {
        try {

            const formValue = form.getFieldValue()
            const { product_list } = formValue
            // const discountType = formValue.product_list[i][`${fieldName}_type`]
            if (product_list[i][`${fieldName}_type`]) {
                product_list[i][`${fieldName}_type`] = value
                if (product_list[i][`${fieldName}_type`] == value) {
                    calculateDiscount(i, product_list[i][`${fieldName}`], fieldName)
                }
            }
        } catch (error) {

        }
    }

    return (
        <>
            {isStepsDiscount === true ?
                (
                    <>
                        <Col span={8} style={{ width: "100%" }}>

                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_percentage_1_text"]}
                                fieldKey={[field.fieldKey, "discount_percentage_1_text"]}
                                label={GetIntlMessages("ลด 1")}
                            >
                                {/* <Input className='price-align' type={`number`} placeholder="" addonAfter={`%`} onChange={(value) => calculateDiscount(index,  "discount_percentage_1",value.target.value)} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index, "discount_percentage_1")} /> */}
                                <Input className='price-align' placeholder="" addonAfter={`%`} onChange={(value) => calculateDiscount(index, "discount_percentage_1", value.target.value)} onBlur={(value) => isFunction(onBlurData) ? onBlurData(index, "discount_percentage_1", value.target.value) : null} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index, "discount_percentage_1")} />
                            </Form.Item>

                        </Col>


                        <Col span={8} style={{ width: "100%" }}>

                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_percentage_2_text"]}
                                fieldKey={[field.fieldKey, "discount_percentage_2_text"]}
                                label={GetIntlMessages("ลด 2")}
                            >
                                <Input className='price-align' placeholder="" addonAfter="%" onChange={(value) => calculateDiscount(index, "discount_percentage_2", value.target.value)} onBlur={(value) => isFunction(onBlurData) ? onBlurData(index, "discount_percentage_2", value.target.value) : null} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index, "discount_percentage_2")} />
                            </Form.Item>
                        </Col>
                        <Col span={8} style={{ width: "100%" }}>

                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_3_text"]}
                                fieldKey={[field.fieldKey, "discount_3_text"]}
                                label={GetIntlMessages("ลด 3")}
                            >
                                <Input className='price-align' placeholder="" addonAfter={discountType(index, "discount_3")} onChange={(value) => calculateDiscount(index, "discount_3", value.target.value)} onBlur={(value) => isFunction(onBlurData) ? onBlurData(index, "discount_3", value.target.value) : null} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index, "discount_3")} />
                                {/* <Input type="number" placeholder="" addonAfter={discountType(index,"discount_3", "bath")} onChange={(value) => discountFunction_2(index, value)} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index,"discount_3")} /> */}
                            </Form.Item>
                        </Col>
                        <Col span={8} style={{ width: "100%" }}>

                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_thb_text"]}
                                fieldKey={[field.fieldKey, "discount_thb_text"]}
                                label={GetIntlMessages(`ลดเงินรวมทั้งสิ้น`)}
                            >
                                <Input className='price-align' placeholder="" disabled={mode == "view" || expireEditTimeDisable == true} addonAfter="บาท" readOnly />
                            </Form.Item>


                        </Col>

                    </>
                )
                :
                (
                    <>
                        <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>

                            <Form.Item
                                {...field}
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_3_text"]}
                                fieldKey={[field.fieldKey, "discount_3_text"]}
                                label={GetIntlMessages("ส่วนลด")}
                                rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("only-number") }]}
                            >
                                <Input style={{ width: "100%" }} className='price-align' min={0} placeholder="" status addonAfter={discountType(index, "discount_3")} onChange={(value) => calculateDiscount(index, "discount_3", value.target.value)} onBlur={(value) => isFunction(onBlurData) ? onBlurData(index, "discount_3", value.target.value) : null} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index, "discount_3")} />
                                {/* <Input type="number" placeholder="" addonAfter={discountType(index,"discount_3", "bath")} onChange={(value) => discountFunction_2(index, value)} disabled={mode == "view" || expireEditTimeDisable == true || checkfieldDiscountOne(index,"discount_3")} /> */}
                            </Form.Item>
                        </Col>
                        <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                            <Form.Item
                                {...field}
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name={[field.name, "discount_thb_text"]}
                                fieldKey={[field.fieldKey, "discount_thb_text"]}
                                label={GetIntlMessages(`ลดเงินรวมทั้งสิ้น`)}
                            >
                                <Input className='price-align' placeholder="" disabled={mode == "view" || expireEditTimeDisable == true} addonAfter="บาท" readOnly />
                            </Form.Item>


                        </Col>

                    </>
                )
            }

        </>
    )
}

export default DiscountEachProduct