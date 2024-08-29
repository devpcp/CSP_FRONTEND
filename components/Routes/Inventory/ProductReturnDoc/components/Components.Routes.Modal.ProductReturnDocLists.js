import { Input, Table, Button, Row, Col, Form, Select, Popconfirm, InputNumber, Popover, Badge, Modal, Tabs } from "antd";
import { useState, useEffect, useRef, } from "react";
import React from 'react'
import { PlusOutlined, DeleteOutlined, FormOutlined, CalculatorOutlined } from "@ant-design/icons";
import GetIntlMessages from "../../../../../util/GetIntlMessages";
import { useSelector } from "react-redux";
import API from "../../../../../util/Api";
import { debounce, get, isArray, isNumber, isPlainObject } from "lodash";
import { RoundingNumber, takeOutComma } from "../../../../shares/ConvertToCurrency";
import Fieldset from "../../../../shares/Fieldset";
import Swal from "sweetalert2";
import RegexMultiPattern from "../../../../shares/RegexMultiPattern";
import ProductData from "../../../../../routes/MyData/ProductsData"
import ProductDataInImportDoc from "./Components.Routes.Modal.ProductDataInImportDoc"

const { TextArea } = Input;

const ComponentsRoutesProductReturnDocLists = ({ onFinish, calculateResult, mode }) => {
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { taxTypes } = useSelector(({ master }) => master);

    const form = Form.useFormInstance()

    const [loadingSearch, setLoadingSearch] = useState(false)

    const checkTaxId = Form.useWatch("tax_type_id", form)
    const isModalVisible = Form.useWatch("isModalVisible", { form, preserve: true })
    const [isInventoryBalanceModalVisible, setIsInventoryBalanceModalVisible] = useState(false);
    const [listIndex, setListIndex] = useState(0);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [listData, setListData] = useState([]);

    const formatNumber = (val, isUseDecimals = true) => {
        try {
            if (isUseDecimals) {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            } else {
                return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }

        } catch (error) {

        }
    }

    const columns = [
        {
            title: () => GetIntlMessages("ลำดับ"),
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: "5%",
            render: (text, record, index) => {
                return index + 1
            },
        },

        {
            title: () => GetIntlMessages("รหัสสินค้า"),
            dataIndex: '',
            key: '',
            width: "10%",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "list_id"]}>
                        <Input disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("ชื่อสินค้า"),
            dataIndex: '',
            key: '',
            width: "20%",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "list_name"]}>
                        <TextArea autoSize disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("คลัง"),
            dataIndex: '',
            key: '',
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "warehouse_name"]}>
                        <TextArea autoSize disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("ชั้น"),
            dataIndex: '',
            key: '',
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "shelf_name"]}>
                        <TextArea autoSize disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("DOT"),
            dataIndex: '',
            key: '',
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "dot"]}>
                        <TextArea autoSize disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("หน่วย"),
            dataIndex: '',
            key: '',
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_list', index, "purchase_unit_name"]}>
                        <TextArea autoSize disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => (<><span style={{ color: "red" }}>* </span>{GetIntlMessages("ราคาต่อหน่วย")}</>),
            dataIndex: '',
            key: '',
            width: "10%",
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`product-cost-${index}`} style={{ margin: 0 }} name={["product_list", index, "price_unit"]}>
                        <InputNumber
                            min={0}
                            disabled={mode === "view"}
                            stringMode
                            style={{ width: "100%" }}
                            precision={2}
                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_unit")}
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
                </>
            )
        },
        {
            title: () => (<><span style={{ color: "red" }}>* </span>{GetIntlMessages("จำนวน")}</>),
            dataIndex: '',
            key: '',
            width: "8%",
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[
                        RegexMultiPattern(),
                        RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น")),
                        {
                            type: 'number',
                            min: 1,
                            message: 'จำนวนต้องมากกว่า 0',
                            transform(value) {
                                return Number(value)
                            }
                        }
                    ]}
                        key={`amount-${index}`}
                        style={{ margin: 0 }}
                        name={["product_list", index, "amount"]}>
                        <InputNumber disabled={mode === "view"} stringMode style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "amount")} />
                    </Form.Item>
                </>
            )
        },
        {
            title: () => GetIntlMessages("รวมเงิน"),
            dataIndex: '',
            key: '',
            width: "10%",
            align: "center",

            render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("หมายเหตุ"),
            dataIndex: '',
            key: '',
            width: "5%",
            align: "center",
            render: (text, record, index) => (
                <>
                    <Popover content={
                        <>
                            <Form.Item name={[index, "remark"]} style={{ margin: 0 }}>
                                <Input.TextArea onChange={(value) => debounceListProductRemark(value.target.value, index)} rows={10} disabled={mode === "view"} />
                            </Form.Item>
                        </>
                    } trigger="click">
                        <Badge dot={!!form.getFieldValue("product_list")?.[index]?.remark ? `show` : null}>
                            <Button icon={<FormOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} />
                        </Badge>
                    </Popover>
                </>
            )

        },
        {
            title: () => GetIntlMessages("จัดการ"),
            dataIndex: '',
            key: '',
            width: "5%",
            align: "center",
            render: (text, record, index) => form.getFieldValue("product_list")?.length > 0 && mode !== "view" ?
                <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => handleDeleteDebtDoc(record, index)}>
                    <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                </Popconfirm>
                : null
        },
    ];

    const handleDeleteDebtDoc = (value, index) => {
        try {
            Swal.fire({
                title: `ยืนยันการลบรายการที่ ${index + 1} หรือไม่ ?`,
                icon: "question",
                confirmButtonText: GetIntlMessages("submit"),
                confirmButtonColor: mainColor,
                showCancelButton: true,
                cancelButtonText: GetIntlMessages("cancel")
            }).then((result) => {
                // console.log('result :>> ', result);
                if (result.isConfirmed) {
                    const { product_list } = form.getFieldsValue();

                    delete product_list[index]
                    const arr = product_list.filter(where => !!where)
                    form.setFieldsValue({ product_list: arr })
                    calculateResult()
                }
            })

        } catch (error) {
            console.log('error handleAddDebtDoc:>> ', error);
        }
    }

    const debounceListProductRemark = debounce((value, index) => handleListProductRemark(value, index), 400)
    const handleListProductRemark = (value, index) => {
        try {
            const { product_list } = form.getFieldValue()
            const remark = !!value ? value : null
            product_list[index].remark = remark
            form.setFieldsValue({ product_list })
        } catch (error) {
            console.log('error handleChangeName:>> ', error);
        }
    }

    const calculateVatPerItem = (val) => {
        const { detail } = taxTypes.find(where => where.id === checkTaxId)
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

    const calculateTable = (value, index, type) => {
        try {
            const { product_list } = form.getFieldValue();
            let price_grand_total = 0,
                amount = 0,
                price_discount = 0,
                price_discount_percent = 0,
                price_unit = 0,
                price_discount_bill = 0,
                price_unit_vat = 0,
                price_unit_before_vat = 0,
                price_unit_add_vat = 0
            switch (type) {
                case "price_unit":
                    price_unit = !isNaN(Number(value)) ? Number(value) : 0
                    amount = Number(product_list[index]["amount"] ?? 0)
                    price_discount = value <= 0 ? 0 : Number(product_list[index]["price_discount"] ?? 0)
                    price_discount_percent = value <= 0 ? 0 : ((price_discount / price_unit) * 100)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : price_unit
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : price_unit

                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["price_discount"] = MatchRound(price_discount)
                    product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                    product_list[index]["amount"] = amount.toString()

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false


                    break;
                case "amount":
                    price_unit = Number(product_list[index]["price_unit"] ?? 0)
                    amount = !isNaN(Number(value)) ? Number(value) : 0
                    price_discount = Number(product_list[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(product_list[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : price_unit
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : price_unit

                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["price_discount"] = MatchRound(price_discount)
                    product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                    product_list[index]["amount"] = amount.toString()

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    break;
                case "price_discount":
                    amount = Number(product_list[index]["amount"] ?? 0)
                    price_unit = Number(product_list[index]["price_unit"] ?? 0)
                    price_discount = Number(value)
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : price_unit
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : price_unit


                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0 || (!!price_discount && Number(price_discount) < 0.01)) {
                        product_list[index]["price_discount"] = null
                        product_list[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        product_list[index]["price_discount"] = MatchRound(price_discount)
                        product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["amount"] = amount.toString()

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    break;
                case "price_discount_percent":
                    amount = Number(product_list[index]["amount"] ?? 0)
                    price_unit = Number(product_list[index]["price_unit"] ?? 0)
                    price_discount_percent = Number(value)
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_grand_total = (price_unit - price_discount) * amount

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : price_unit
                    price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : price_unit

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0) {
                        product_list[index]["price_discount"] = null
                        product_list[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        product_list[index]["price_discount"] = MatchRound(price_discount)
                        product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["amount"] = amount.toString()

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    break;

                default:
                    for (let index = 0; index < product_list.length; index++) {
                        amount = Number(product_list[index]["amount"] ?? 0)
                        price_unit = Number(product_list[index]["price_unit"] ?? 0)
                        price_discount = Number(product_list[index]["price_discount"] ?? 0)
                        price_grand_total = (price_unit * amount) - price_discount

                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                        product_list[index]["price_grand_total"] = MatchRound(price_grand_total)

                        product_list[index]["is_discount"] = price_unit < 0 ? true : false
                        product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                        product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                        product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                        product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                        product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                        product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                        product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                        product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    }
                    break;
            }
            if (isArray(product_list) && product_list.length === 0) price_discount_bill = null
            form.setFieldsValue({
                product_list, [index]: {
                    price_unit: !!price_unit
                        ? MatchRound(price_unit)
                        : 0,
                    price_discount: !!price_discount
                        ? MatchRound(price_discount)
                        : 0,
                    price_discount_percent: !!price_discount_percent
                        ? MatchRound(price_discount_percent)
                        : 0,
                }, price_discount_bill
            })
            calculateResult()
        } catch (error) {
            console.log('calculateTable error :>> ', error);
        }
    }

    const handleAddDebtList = () => {
        try {
            const { product_list } = form.getFieldValue();
            let newArr = []
            newArr = (!!product_list) ? [...product_list, {}] : [{}]

            form.setFieldsValue({ product_list: newArr })
        } catch (error) {
            console.log('handleAddDebtList error :>> ', error);
        }
    }

    const handleCancelInventoryBalanceModal = () => {
        try {
            setIsInventoryBalanceModalVisible(false)
        } catch (error) {
            console.log("handleCancelInventoryBalanceModal error: ", error)
        }
    }

    const handleOpenInventoryBalanceModal = async (index, tab, list) => {
        try {
            switch (tab) {
                case "2":
                    setListIndex(index)
                    setListData(list)
                    setActiveKeyTab(tab)
                    setIsInventoryBalanceModalVisible(true)
                    break;
                default:
                    setActiveKeyTab("1")
                    setListIndex(index)
                    setIsInventoryBalanceModalVisible(true)
                    break;
            }

        } catch (error) {
            console.log("handleOpenInventoryBalanceModal error: ", error)
        }
    }

    const callbackInventoryBalance = (data, indexCallBack, from = "") => {
        try {
            const { product_list } = form.getFieldValue();
            setListData(data.warehouse_detail)
            product_list[indexCallBack] = {
                list_id: data.ShopProduct.Product.master_path_code_id,
                list_name: data.ShopProduct.Product.product_name[locale.locale],
                product_id: data.ShopProduct.Product.id,
                shop_product_id: data.ShopProduct.id,
                price_unit: +data.ShopProduct.product_cost,
                warehouse_detail: data.warehouse_detail
            }
            form.setFieldsValue({ product_list })
            setActiveKeyTab("2")
            calculateTable()
        } catch (error) {
            console.log("callbackInventoryBalance : ", error)
        }

    }

    const callbackProductWarehouse = (data, indexCallBack, from = "") => {
        try {
            const { product_list } = form.getFieldValue();
            product_list[indexCallBack].warehouse_id = data.warehouse
            product_list[indexCallBack].warehouse_name = data.ShopWarehouse.name[locale.locale]
            product_list[indexCallBack].shelf_code = data.shelf.Shelf.code
            product_list[indexCallBack].shelf_name = data.shelf.Shelf.name[locale.locale]
            product_list[indexCallBack].dot = data.shelf.dot_mfd
            product_list[indexCallBack].amount = data.shelf.balance
            product_list[indexCallBack].purchase_unit_id = data.shelf.purchase_unit_id
            product_list[indexCallBack].purchase_unit_name = data.shelf.PurchaseUnit.type_name[locale.locale]
            form.setFieldsValue({ product_list })
            setIsInventoryBalanceModalVisible(false)
            calculateTable()
        } catch (error) {
            console.log("callbackProductWarehouse : ", error)
        }
    }

    /* Tabs*/
    const handleChangeTabs = (key) => {
        try {
            setActiveKeyTab(() => key)
        } catch (error) {

        }
    }
    /* end Tabs*/

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

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            {/* <Row justify={"end"} hidden={mode === "view"}>
                <>
                    <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16, display: "flex", alignItems: "center", }}
                        onClick={handleAddDebtList}
                    >
                        {GetIntlMessages("เพิ่มรายการ")}
                    </Button>
                </>
            </Row> */}

            <Form.Item name={`product_list`} hidden />

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={Form.useWatch("product_list", { form, preserve: true })}
                    pagination={false}
                    rowClassName={() => 'editable-row'}
                    bordered
                    scroll={{ x: 1600 }}
                    loading={loadingSearch}
                />
            </div>

            {/* <Row justify={"end"} hidden={mode === "view"}>
                <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 16, display: "flex", alignItems: "center", }}
                    onClick={handleAddDebtList}
                >
                    {GetIntlMessages("เพิ่มรายการ")}
                </Button>

            </Row> */}

            <Fieldset style={{ marginTop: "20px" }} legend={`สรุปรายการ`}>
                <Row gutter={[10, 10]}>
                    <Col lg={12} md={12} xs={24}>
                        <Row gutter={[20, 10]}>
                            <Col span={12}>
                                <Form.Item
                                    label={GetIntlMessages("หมายเหตุ")}
                                    name="remark"
                                    rules={[
                                        {
                                            required: true,
                                            message: "กรุณากรอกข้อมูล"
                                        },
                                    ]}
                                >
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

            <Modal
                maskClosable={false}
                open={isInventoryBalanceModalVisible}
                onCancel={handleCancelInventoryBalanceModal}
                width="90vw"
                style={{ top: 16 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelInventoryBalanceModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {/* <Tabs
                    defaultActiveKey="1"
                    activeKey={activeKeyTab}
                    onChange={handleChangeTabs}
                    items={[
                        {
                            label: (<span>สินค้า</span>),
                            key: '1',
                            children: <InventoryBalance title={"เลือกสินค้ารายการที่ " + (listIndex + 1)} callBack={callbackInventoryBalance} listIndex={listIndex} status="myData" pageId={"a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0"} />,
                        },
                        {
                            label: (<span>คลังสินค้า</span>),
                            key: '2',
                            disabled: true,
                            children: <ProductWarehouse title={"เลือกสินค้ารายการที่ " + (listIndex + 1)} callBack={callbackProductWarehouse} listIndex={listIndex} listData={listData} />,
                        },
                    ]}
                /> */}
            </Modal>

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

            <style>
                {
                    `
                    .ant-badge{
                        width : 100%;
                    }
                    `
                }
            </style>
        </>

    );
}
export default ComponentsRoutesProductReturnDocLists