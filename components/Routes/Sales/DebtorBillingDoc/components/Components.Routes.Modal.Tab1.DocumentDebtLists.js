import { Input, Table, Button, Row, Col, Form, Select, Popconfirm, InputNumber, Popover, Checkbox, Badge } from "antd";
import { useState, useEffect, useRef } from "react";
import React from 'react'
import { PlusOutlined, DeleteOutlined, FormOutlined } from "@ant-design/icons";
import GetIntlMessages from "../../../../../util/GetIntlMessages";
import { useSelector } from "react-redux";
import API from "../../../../../util/Api";
import { debounce, get, isArray, isPlainObject } from "lodash";
import SortingData from "../../../../shares/SortingData";
import ModalViewShopStock from "../../../ModalViewShopStock";
import { NoRoundingNumber, RoundingNumber, takeOutComma } from "../../../../shares/ConvertToCurrency";
import Fieldset from "../../../../shares/Fieldset";
import Swal from "sweetalert2";
import AddDebtList from "./Components.Routes.Modal.AddDocumentDebtLists";
import RegexMultiPattern from "../../../../shares/RegexMultiPattern";
import moment from 'moment'

const ComponentsRoutesDocumentDebtLists = ({ onFinish, calculateResult, mode }) => {
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { taxTypes } = useSelector(({ master }) => master);

    const form = Form.useFormInstance()

    const [loadingSearch, setLoadingSearch] = useState(false)

    const checkTaxId = Form.useWatch("tax_type_id", form)
    const isModalVisible = Form.useWatch("isModalVisible", { form, preserve: true })

    // useEffect(() => {
    //     setIsFieldEditing(false);
    // }, [isModalVisible])

    useEffect(() => {
        getMasterData()
    }, [])

    const [shopWarehouseAllList, setshopWarehouseAllList] = useState([])
    const getMasterData = async () => {
        try {
            const [value1] = await Promise.all([getShopWarehousesAllList()])
            setshopWarehouseAllList(() => [...value1])
        } catch (error) {

        }
    }

    const getShopWarehousesAllList = async () => {
        try {
            const { data } = await API.get(`shopWarehouses/all?limit=9999999&page=1&sort=code_id&order=asc`)
            return data.status === "success" ? data.data.data ?? [] : []
        } catch (error) {

        }
    }

    const [isFieldEditing, setIsFieldEditing] = useState({ status: false, index: null, type: null })
    const refShopStockIdCode = useRef(null)
    const refShopStockIdName = useRef(null)

    useEffect(() => {

        if (isFieldEditing.status) {
            switch (isFieldEditing.type) {
                case "code":
                    refShopStockIdCode.current.focus();
                    break;
                case "name":
                    refShopStockIdName.current.focus();
                    break;

                default:
                    break;
            }
        }

    }, [isFieldEditing.status])

    const takeOutDuplicateValue = (arr, key) => {
        try {
            // console.log('arr :>> ', arr);
            const newArr = arr.map(e => {
                return e[key] ?? e[`shelf`][key]
            }).filter((item, index, array) => array.indexOf(item) === index);
            return newArr ?? []
        } catch (error) {

        }
    }

    const getArrValue = (index, type) => {
        try {
            const { list_service_product } = form.getFieldValue()
            // console.log(`list_service_product getArrValue ${type}:>> `, list_service_product[index].warehouse_list);
            return !!list_service_product && isArray(list_service_product) ? list_service_product[index][type] ?? [] : []
        } catch (error) {
            console.log('error getArrValue:>> ', error);
        }
    }

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

    const toggleEdit = (index = null, type = null) => {
        try {
            console.log("เข้าปะ");
            setIsFieldEditing((prevValue) => ({ status: !prevValue.status, index, type }))
        } catch (error) {

        }
    }

    const [DebtlistTable, setDebtListTable] = useState([])
    const columns = [
        {
            title: () => GetIntlMessages("ลำดับ"),
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: 50,
            render: (text, record, index) => {
                // index += ((configTable.page - 1) * configTable.limit)
                return index + 1
            },
        },
        {
            // title: () => GetIntlMessages(docTypeId == "67c45df3-4f84-45a8-8efc-de22fef31978" ? `เลขที่ใบสั่งขาย/ใบจองสินค้า` : "เลขที่ใบสั่งซ่อม"),
            title: () => GetIntlMessages("เลขที่เอกสาร"),
            dataIndex: '',
            key: '',
            width: 130,
            align: "center",
            render: (text, record) => {
                if (!!record.code_id) {
                    return get(record, `code_id`, "-")
                } else {
                    if (!!record?.ShopServiceOrderDoc) {
                        return get(record, `ShopServiceOrderDoc.code_id`, record?.code_id)
                    }
                    if (!!record?.ShopCustomerDebtCreditNoteDoc) {
                        return get(record, `ShopCustomerDebtCreditNoteDoc.code_id`, record?.code_id)
                    }
                    if (!!record?.ShopCustomerDebtDebitNoteDoc) {
                        return get(record, `ShopCustomerDebtDebitNoteDoc.code_id`, record?.code_id)
                    }
                    if (!!record?.ShopCustomerDebtDebitNoteDoc) {
                        return get(record, `ShopCustomerDebtDebitNoteDoc.code_id`, record?.code_id)
                    }
                    if (!!record?.details.meta_data.ShopCustomerDebtCreditNoteDocT2) {
                        return get(record.details.meta_data, `ShopCustomerDebtCreditNoteDocT2.code_id`, record?.code_id)
                    }
                }
            }
        },
        {
            title: () => GetIntlMessages("เลขที่เอกสารใบส่งของขั่วคราว"),
            dataIndex: 'ShopTemporaryDeliveryOrderDocs',
            key: 'ShopTemporaryDeliveryOrderDocs',
            width: 130,
            align: "center",
            render: (text, record) => {
                return text?.find(where => where.status === 1)?.code_id ?? record?.ShopTemporaryDeliveryOrderDoc?.code_id ?? "-"
            }
        },
        {
            title: () => GetIntlMessages("เลขที่ใบกำกับภาษี"),
            children: [
                {
                    title: () => GetIntlMessages("อย่างย่อ"),
                    dataIndex: '',
                    key: '',
                    width: 130,
                    align: "center",
                    render: (text, record) => {
                        if (!!record.code_id) {
                            return isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.abb_code_id ?? "-" : "-"
                        } else {
                            return get(record, `details.meta_data.ShopTaxInvoiceDoc.abb_code_id`, "-")
                        }
                    }
                },
                {
                    title: () => GetIntlMessages("เต็มรูป"),
                    dataIndex: '',
                    key: '',
                    width: 130,
                    align: "center",
                    render: (text, record) => {

                        if (!!record.code_id) {
                            return isArray(record.ShopTaxInvoiceDocs) && record.ShopTaxInvoiceDocs.length > 0 ? record.ShopTaxInvoiceDocs.find(where => where.status === 1)?.inv_code_id ?? "-" : "-"
                        } else {
                            return get(record, `details.meta_data.ShopTaxInvoiceDoc.inv_code_id`, "-")
                        }
                    }
                },
            ]
        },
        // {
        //     title: () => GetIntlMessages("ชื่อเอกสาร"),
        //     dataIndex: '',
        //     key: '',
        //     width: "5%",
        //     align: "center",
        //     render: (text, record) => (record.doc_sales_type === 1) ? "ใบสั่งซ่อม" : (record.ShopServiceOrderDoc.doc_sales_type === 1) ? "ใบสั่งซ่อม" : "ใบสั่งขาย"
        // },
        {
            title: () => GetIntlMessages("วันที่"),
            dataIndex: 'doc_date',
            key: 'doc_date',
            width: 100,
            align: "center",
            render: (text, record) => text ? moment(text).format("DD/MM/YYYY") : "-",
        },
        {
            title: () => GetIntlMessages("ครบกำหนด"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record) => moment(moment(record?.doc_date).add(Number(form.getFieldValue("customer_credit_debt_payment_period")), 'd')).format("DD/MM/YYYY")
            // render: (text, record) => record?.debt_due_date ?? record?.ShopServiceOrderDoc?.debt_due_date ?? "-",
        },
        {
            title: () => GetIntlMessages("จำนวนเงิน"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record) => <div style={{ textAlign: "end" }}>{extractDataDocSaleType(record, 'debt_price_amount')}</div>
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("ยอดคงเหลือ"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) =>
                <div style={{ textAlign: "end" }}>
                    {extractDataDocSaleType(record, 'debt_price_amount_left')}
                </div>,
        },
        // {
        //     title: () => GetIntlMessages("ยอดชำระ"),
        //     dataIndex: '',
        //     key: '',
        //     width: "10%",
        //     align: "center",
        //     render: (text, record, index) => (
        //         <>
        //             <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`debt-price-paid-total-${index}`} style={{ margin: 0 }} name={["shopCustomerDebtLists", index, "debt_price_paid_total"]}>
        //                 <InputNumber disabled={mode === "view"} stringMode style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
        //                     parser={(value) => value.replace(/\$\s?|(,*)/g, '')} onBlur={() => calculateResult()} />
        //             </Form.Item>
        //         </>
        //     )
        //     // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        // },
        {
            title: () => {
                return (
                    form.getFieldValue("shopCustomerDebtLists")?.length > 0 && mode !== "view" ?
                        <Popconfirm title={`ยืนยันการลบทั้งหมด หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => handleDeleteDebtDocAll()}>
                            <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                        </Popconfirm>
                        : null
                )

            },
            dataIndex: '',
            key: '',
            width: 50,
            align: "center",

            render: (text, record, index) => form.getFieldValue("shopCustomerDebtLists")?.length > 0 && mode !== "view" ?
                <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => handleDeleteDebtDoc(record, index)}>
                    <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                </Popconfirm>
                : null
            //  <Button onClick={()=>handleDeleteDebtDoc(record,index)} type='primary' danger icon={<DeleteOutlined/>}></Button>
        },
    ];

    const extractDataDocSaleType = (record, type) => {
        try {
            // console.log('record22 :>> ' + type, record);
            if (!!record.doc_type_code_id) {
                switch (record.doc_type_code_id) {
                    case 'CDN':
                        return RoundingNumber(Number(record.price_grand_total))
                    case 'CCN':
                        return RoundingNumber(Number(-record.price_grand_total))
                    default:
                        return RoundingNumber(Number(get(record, `ShopServiceOrderDoc.${type}`, 0))) ?? RoundingNumber(Number(record[type])) ?? "-"
                }
            } else {
                if (!!record?.ShopServiceOrderDoc) {
                    return RoundingNumber(Number(record.price_grand_total))
                }
                if (!!record?.ShopCustomerDebtCreditNoteDoc) {
                    return RoundingNumber(Number(-record.price_grand_total))
                }
                if (!!record?.ShopCustomerDebtDebitNoteDoc) {
                    return RoundingNumber(Number(record.price_grand_total))
                }
                if (!!record?.details.meta_data.ShopCustomerDebtCreditNoteDocT2) {
                    return RoundingNumber(Number(-record.price_grand_total))
                }
            }
        } catch (error) {
            console.log("extractDataDocSaleType : ", error)
        }
    }

    const handleDeleteDebtDocAll = () => {
        form.setFieldsValue({ shopCustomerDebtLists: [], debt_price_paid_total: 0 })
    }

    const handleDeleteDebtDoc = (value, index) => {
        try {
            // console.log('value :>> ', value);
            // setDebtListTable((prevValue,currentValue) => console.log('prevValue :>> ', prevValue))
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
                    const { shopCustomerDebtLists } = form.getFieldValue()
                    const arr = shopCustomerDebtLists?.filter(where => where.id !== value.id), debt_price_paid_total = isArray(arr) && arr.length > 0 ? arr.reduce((prevValue, currentValue) => prevValue + Number(currentValue?.debt_price_amount_left ?? 0), 0) : 0;
                    // console.log('arr :>> ', arr);
                    form.setFieldsValue({ shopCustomerDebtLists: arr, debt_price_paid_total })
                }
            })

        } catch (error) {
            // console.log('error handleAddDebtDoc:>> ', error);
        }
    }

    const displayData = (record, type) => {
        try {
            const { shop_stock_id, shop_stock_list } = record
            if (!!shop_stock_list && isArray(shop_stock_list) && shop_stock_list.length > 0) {
                const find = shop_stock_list.find(where => where.id === shop_stock_id)
                if (isPlainObject(find)) {
                    switch (type) {
                        case "master_path_code_id":
                            return find.ShopProduct.Product[type]
                        case "product_name":
                            return find.ShopProduct.Product[type][locale.locale]

                        default:
                            break;
                    }
                }
            }
        } catch (error) {

        }
    }


    const calculateTable = (value, index, type) => {
        try {
            // console.log('value calculateTable:>> ', value);
            const { list_service_product } = form.getFieldValue();

            // const price_unit = list_service_product[index]["price_unit"] , price_discount = list_service_product[index]["price_discount"]

            let price_grand_total = 0, amount = 0, price_discount = 0, price_discount_percent = 0, price_unit = 0, price_discount_bill = 0
            switch (type) {
                case "price_unit":
                    price_unit = Number(value)
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_discount = null
                    price_discount_percent = null
                    // price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    // price_discount_percent = Number(list_service_product[index]["price_discount_percent"] ?? 0)
                    // price_discount = price_unit * (price_discount_percent/100)
                    price_grand_total = (price_unit - price_discount) * amount

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    list_service_product[index]["price_unit"] = MatchRound(price_unit)
                    list_service_product[index]["price_discount"] = null
                    list_service_product[index]["price_discount_percent"] = null
                    // console.log('price_grand_total :>> ', price_grand_total);
                    break;
                case "amount":
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    amount = Number(value)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(list_service_product[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    list_service_product[index]["amount"] = amount.toString()
                    // console.log('price_grand_total :>> ', price_grand_total);
                    break;
                case "price_discount":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(value)
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

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

                    break;
                case "price_discount_percent":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount_percent = Number(value)
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_grand_total = (price_unit - price_discount) * amount

                    list_service_product[index]["price_discount"] = MatchRound(price_discount)
                    list_service_product[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total)
                    break;

                default:
                    for (let i = 0; i < list_service_product.length; i++) {
                        amount = Number(list_service_product[i]["amount"] ?? 0)
                        price_unit = Number(list_service_product[i]["price_unit"] ?? 0)
                        price_discount = Number(list_service_product[i]["price_discount"] ?? 0)
                        price_grand_total = (price_unit * amount) - price_discount
                        list_service_product[i]["price_grand_total"] = MatchRound(price_grand_total)
                    }
                    break;
            }
            if (isArray(list_service_product) && list_service_product.length === 0) price_discount_bill = null
            form.setFieldsValue({
                list_service_product, [index]: {
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
            console.log('error :>> ', error);
        }
    }

    const deleleteList = (index) => {
        try {
            setLoadingSearch(true)
            const { list_service_product } = form.getFieldValue()

            list_service_product.splice(index, 1)

            for (let i = 0; i < list_service_product.length; i++) {
                form.setFieldsValue({ [i]: { ...list_service_product[i] } })

            }
            // console.log('list_service_product 2 :>> ', list_service_product );

            delete form.getFieldValue()[list_service_product.length]
            form.setFieldsValue({ list_service_product })

            // const { list_service_product } = form.getFieldValue()
            // const newData = [...list_service_product]
            // newData.splice(index, 1)
            // form.setFieldsValue({ list_service_product: newData })
            calculateTable()
            setLoadingSearch(false)
        } catch (error) {

        }
    }

    const handleAdd = () => {
        const { list_service_product } = form.getFieldValue()
        const newData = {
            shop_stock_id: null,
            shop_stock_list: [],
            price_unit: null,
            price_discount: null,
            price_discount_percent: null,
            price_grand_total: null,
            dot_mfd: null,
            dot_mfd_list: [],
            purchase_unit_id: null,
            purchase_unit_list: [],
            warehouse_list: [],
            shelf_list: [],
            warehouse: null,
            shelf: null,
            amount: null,
            change_name_status: false,
            changed_name: null,
            remark: null
        }
        // setDataSource((prevValue) => !!prevValue ? [...prevValue, newData] : [newData])
        list_service_product = !!list_service_product ? [...list_service_product, newData] : [newData]
        form.setFieldsValue({ list_service_product })
    }

    const callBackDebtorDocList = (value) => {
        try {
            form.setFieldsValue({ shopCustomerDebtLists: [...value] })
        } catch (error) {

        }
    }


    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <Row justify={"end"} hidden={mode === "view"}>
                <AddDebtList style={{
                    marginBottom: 16,
                    display: "flex",
                    alignItems: "center",
                }}
                    callBackDebtorDocList={callBackDebtorDocList}
                    calculateResult={calculateResult}
                    initForm={form}
                    mode={mode}
                />
                {/* <Button
                    onClick={handleAdd}
                    type="primary"
                    style={{
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                    icon={<PlusOutlined style={{ fontSize: 16, marginBottom: 4 }} />}
                >
                    {GetIntlMessages("เพิ่มรายการ")}
                </Button> */}
            </Row>

            <Form.Item name={`shopCustomerDebtLists`} hidden />

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={columns}
                    // dataSource={DebtlistTable}
                    dataSource={Form.useWatch("shopCustomerDebtLists", form)?.filter(where => where.id)}
                    // dataSource={Form.useWatch("list_service_product", { form, preserve: true })}
                    // dataSource={dataSource}
                    // dataSource={tableData}
                    pagination={false}
                    rowClassName={() => 'editable-row'}
                    bordered
                    scroll={{ x: 1600 }}
                    loading={loadingSearch}
                />
                {/* <div className="action-btn">
                        <Button type="primary" onClick={onConfirm}>
                            Confirm Changes
                        </Button>
                    </div> */}
            </div>

            <Row justify={"end"} hidden={mode === "view"}>
                <AddDebtList style={{
                    marginTop: 16,
                    display: "flex",
                    alignItems: "center",
                }}
                    callBackDebtorDocList={callBackDebtorDocList}
                    calculateResult={calculateResult}
                    initForm={form}
                    mode={mode}
                />
            </Row>

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
                        {/* <Form.Item label={GetIntlMessages("ส่วนลดท้ายบิล")} stringMode min={0} precision={2} name="price_discount_bill">
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
                        </Form.Item> */}
                        {/* <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="price_grand_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            /> */}
                        <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="debt_price_paid_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Fieldset>

            <style>
                {
                    `
                    .ant-badge{
                        width : 100%;
                    }
                    `
                }
            </style>

            {/* <style jsx global>
                {`
                 .editable-cell {
                    position: relative;
                  }
                  
                  .editable-cell-value-wrap {
                    padding: 5px 12px;
                    cursor: pointer;
                  }
                  
                  .editable-row:hover .editable-cell-value-wrap {
                    padding: 4px 11px;
                    border: 1px solid #d9d9d9;
                    border-radius: 6px;
                    border-color : ${mainColor}
                  }

                `}
            </style> */}
            {/* .ant-select-show-search.ant-select:not(.ant-select-customize-input)
                   .ant-select-selector {
                   height: auto;
                 }
                 .ant-select-single.ant-select-show-arrow .ant-select-selection-item {
                   white-space: normal;
                   word-break: break-all;
                 } */}
        </>

    );
}
export default ComponentsRoutesDocumentDebtLists