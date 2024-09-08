import React, { useEffect, useState } from 'react'
import Fieldset from '../../shares/Fieldset';
import FormSelectDot from "../Dot/Components.Select.Dot";
import GetIntlMessages from '../../../util/GetIntlMessages';
import { Form, Input, Select, Row, Col, Divider, Button, Space, DatePicker, InputNumber, Modal, Tooltip, Tag, Table } from 'antd';
import { PlusOutlined, MinusCircleOutlined, TableOutlined, ShoppingCartOutlined, CalculatorOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { debounce, get, isArray, isEmpty, isFunction, isPlainObject, isString } from 'lodash';
import API from '../../../util/Api'
// import ComponentsSelectModalBusinessPartners from '../../../components/Routes/Modal/Components.Select.Modal.BusinessPartners'
import SortingData from '../../shares/SortingData'
import { RoundingNumber, takeOutComma, } from '../../shares/ConvertToCurrency'
import Swal from "sweetalert2";
import ProductData from "../../../routes/MyData/ProductsData"
import BusinessPartnersData from "../../../routes/MyData/BusinessPartnersData"

const tailformItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 }
};

const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" // -> เส้น
const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" // -> รายการ
const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" // -> ลูก // product_type battery ->5d82fef5-8267-4aea-a968-92a994071621 

const FormWarehouse = ({ name, index, form, expireEditTimeDisable, mode, getArrValue, dataList, pageId, visibleEachWarehouseMovementModal, configShowMovementBtn, dropDownBtnWarehouse, callbackSelectProduct }) => {
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { getShelfDataAll } = dataList
    const configColSpace = (pageId === "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode === "view" && configShowMovementBtn === true) ? true : false



    useEffect(() => {
        try {
            if (callbackSelectProduct !== undefined) {
                if (!callbackSelectProduct) {
                    const { product_list } = form.getFieldValue()
                    product_list[0].warehouse_detail[0].warehouse = getShelfDataAll[0].id
                    product_list[0].warehouse_detail[0].shelf = getShelfDataAll[0].shelf[0].code
                    form.setFieldsValue({ product_list })
                }
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }, [getShelfDataAll])



    const getArrWarehouse = (index1, index2) => {
        const fomeValue = form.getFieldValue();
        const warehouse_detail = fomeValue.product_list[index1].warehouse_detail[index2];
        const arr = warehouse_detail ? warehouse_detail.getShelfDataAll : [];
        let newArr
        if (warehouse_detail) {
            // console.log('view',warehouse_detail.warehouse)
            newArr = getShelfDataAll?.find(where => where.id == warehouse_detail.warehouse)
            // console.log('arr warehouse_detail.warehouse', newArr)
            arr = newArr ? newArr.shelf : []
        }
        return arr ?? []

    }

    const onChangeWarehouse = (index1, index2, value) => {
        const arr = getShelfDataAll.find(where => where.id == value)
        // console.log('arr', arr)
        const formValue = form.getFieldValue()
        formValue.product_list[index1].warehouse_detail[index2].getShelfDataAll = arr ? arr.shelf : [];
        formValue.product_list[index1].warehouse_detail[index2].shelf = null;
        form.setFieldsValue(formValue)
    }


    const addWarehouse = (index, add) => {
        const formValue = form.getFieldValue();
        const warehouse_detail = formValue.product_list[index]

        if (warehouse_detail.warehouse_detail) {
            if (warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1]) {
                const warehouse = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].warehouse;
                const shelf = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].shelf ?? null;
                const getShelfDataAll = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].getShelfDataAll;
                const defaultValue = { warehouse, getShelfDataAll, shelf, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            } else {
                const defaultValue = { warehouse: getShelfDataAll[0].id ?? null, shelf: getShelfDataAll[0].shelf[0].code ?? null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            }
        } else {
            const defaultValue = { warehouse: getShelfDataAll[0].id ?? null, shelf: getShelfDataAll[0].shelf[0].code ?? null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
            add(defaultValue)
        }
    }
    const responsiveTable = {
        name: {
            xs: 12,
            sm: 6,
            md: 6,
            lg: 8
        },
        other: {
            xs: 6,
            sm: 3,
            md: 3,
            lg: 2
        },
        button: {
            xs: 4,
            sm: 2,
            md: 2,
            lg: 1
        }
    }
    return (
        <Form.Item
            // label=" "
            name={name}
        >
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>

                        {fields.map((field, i) => (
                            <Form.Item
                                required={false}
                                key={field.key}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col xs={responsiveTable.name.xs} sm={responsiveTable.name.sm} md={responsiveTable.name.md} lg={responsiveTable.name.lg} style={{ width: "100%" }}>
                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "warehouse"]}
                                            fieldKey={[field.fieldKey, "warehouse"]}
                                            label={i >= 1 ? "" : GetIntlMessages("warehouses")}
                                            className='form-warehouse'
                                        >
                                            <Select
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                                onChange={(value) => onChangeWarehouse(index, i, value)}
                                            >

                                                {getShelfDataAll?.map((e, index) => (
                                                    <Select.Option value={e.id} key={index}>
                                                        {e.name[locale.locale]}
                                                    </Select.Option>

                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={responsiveTable.name.xs} sm={responsiveTable.name.sm} md={responsiveTable.name.md} lg={responsiveTable.name.lg} style={{ width: "100%" }}>

                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "shelf"]}
                                            fieldKey={[field.fieldKey, "shelf"]}
                                            label={i >= 1 ? "" : GetIntlMessages("shelf")}
                                            className='form-warehouse'
                                        >
                                            <Select
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                            >
                                                {getArrWarehouse(index, i).map(e => <Select.Option value={e.code}>{e.name[locale.locale]}</Select.Option>)}
                                            </Select>

                                        </Form.Item>
                                    </Col>

                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>
                                        <FormSelectDot name={[field.name, "dot_mfd"]} importedComponentsLayouts={tailformItemLayout} disabled={mode == "view" || expireEditTimeDisable == true} form={form} index={i} />
                                    </Col>

                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>
                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "purchase_unit_id"]}
                                            fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                            label={i >= 1 ? "" : GetIntlMessages("purchase-unit")}
                                            className='form-warehouse'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "กรุณากรอก",
                                                },
                                            ]}
                                        >
                                            <Select
                                                showArrow={false}
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                                open={false}
                                            >
                                                {getArrValue(index, "unit_list").map((e, i) => <Select.Option value={e.id} key={i}>{e.uom_data ? <span>{get(e, `type_name.${locale.locale}`, "-")} <Tag>UOM</Tag></span> : get(e, `type_name.${locale.locale}`, "-")}</Select.Option>)}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>
                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "amount"]}
                                            fieldKey={[field.fieldKey, "amount"]}
                                            label={i >= 1 ? "" : GetIntlMessages("amount")}
                                            className='form-warehouse'
                                        >
                                            <Input type="number" placeholder="จำนวน" disabled={mode == "view" || expireEditTimeDisable == true} />
                                        </Form.Item>
                                    </Col>

                                    <>
                                        {pageId === "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode === "view" && configShowMovementBtn === true ?
                                            <>
                                                <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} style={{ width: "100%", paddingTop: i >= 1 ? "" : "40px" }}>
                                                    <Button type='link' icon={<TableOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} onClick={() => visibleEachWarehouseMovementModal(index, i)} />
                                                </Col>
                                                <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} style={{ width: "100%", paddingTop: i >= 1 ? "" : "40px" }} hidden={isFunction(callbackSelectProduct) ? false : true}>
                                                    <Button type='link' onClick={() => callbackSelectProduct(form.getFieldValue(), index, i)} icon={<ShoppingCartOutlined style={{ fontSize: 26, color: "green" }} />} style={{ width: "100%" }} />
                                                </Col>
                                            </>

                                            :
                                            <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} >
                                                <Form.Item labelCol={i > 1 ? 0 : 24} label={i >= 1 ? "" : " "}>
                                                    {fields.length > 1 && mode != "view" && expireEditTimeDisable !== true ? (
                                                        // <MinusCircleOutlined
                                                        //     className="dynamic-delete-button"
                                                        //     style={{ fontSize: 18, paddingLeft: 10 }}
                                                        //     onClick={() => remove(field.name)}
                                                        // />
                                                        <Button
                                                            type='danger'
                                                            onClick={() => remove(field.name)}
                                                        >
                                                            ลบคลังสินค้า
                                                        </Button>
                                                    ) : null}
                                                </Form.Item>
                                            </Col>
                                        }
                                    </>

                                </Row>
                            </Form.Item>

                        ))}


                        {mode !== "view" && expireEditTimeDisable !== true ?
                            <Form.Item>
                                <Col style={{ display: "flex", justifyContent: "center" }}>
                                    <Button style={{ width: "30%" }} type="dashed" onClick={() => addWarehouse(index, add)} block icon={<PlusOutlined />}>
                                        {GetIntlMessages("add-data")}{GetIntlMessages("warehouses")}
                                    </Button>
                                </Col>
                            </Form.Item>
                            : null
                        }


                    </>
                )}

            </Form.List>
        </Form.Item>

    )
}

export default FormWarehouse