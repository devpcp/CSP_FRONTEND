import { Input, Table, Button, Row, Col, Form, Select, Popconfirm, InputNumber, Popover, Checkbox, Badge, Tooltip } from "antd";
import { useState, useEffect, useRef } from "react";
import React from 'react'
import { PlusOutlined, DeleteOutlined, FormOutlined, InfoCircleTwoTone } from "@ant-design/icons";
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
                    if (!!record?.ShopCustomerDebtCreditNoteDocT2) {
                        return get(record, `ShopCustomerDebtCreditNoteDocT2.code_id`, record?.code_id)
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
            render: (text, record) => text?.find(where => where.status === 1)?.code_id ?? record?.ShopTemporaryDeliveryOrderDoc?.code_id ?? "-",
            // render: (text, record) => console.log('record :>> ', record),
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
                            if (get(record, `details.meta_data.ShopTaxInvoiceDoc.inv_code_id`, "-") === "-") {
                                return get(record, `ShopTaxInvoiceDoc.inv_code_id`, "-")
                            } else {
                                return get(record, `details.meta_data.ShopTaxInvoiceDoc.inv_code_id`, "-")
                            }

                        }
                    }
                },
            ]
        },
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
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(get(record, `ShopServiceOrderDoc.debt_price_amount`, 0))) ?? RoundingNumber(Number(record.debt_price_amount)) ?? "-"}</div>
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(text)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("ยอดคงเหลือ"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            // render : (text, record) =>console.log('text :>> ', text)
            render: (text, record, index) =>
                <div style={{ textAlign: "end" }}>
                    {extractDataDocSaleType(record, 'debt_price_amount_left')}
                </div>
        },
        {
            title: () => <Button onClick={copyToDebtPricePaidTotalAll} disabled={mode === "view"}>{">>"}</Button>,
            dataIndex: '',
            key: '',
            width: 50,
            align: "center",
            render: (text, record, index) =>
                <Button onClick={() => copyToDebtPricePaidTotal(record, index)} disabled={mode === "view"}>
                    {">"}
                </Button>
        },
        {
            title: () => <>
                {/* {"ส่วนต่าง"} */}
                <Tooltip
                    title="ส่วนต่างที่เกิดจากลูกค้า ชำระไม่ตรงกับยอดที่ต้องชำระในระบบ กรอกส่วนต่างนี้เพื่อยอดชำระตรงกับระบบ">
                    <span>  ส่วนต่าง <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ margin: "0px 1px -4px 4px " }} /></span>
                </Tooltip>
            </>,
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) => (
                <>

                    <Form.Item
                        rules={[
                            RegexMultiPattern(),
                            RegexMultiPattern("2", GetIntlMessages("ตัวเลขเท่านั้น")),
                        ]}
                        key={`debt-price-paid-adjust -${index}`}
                        style={{ margin: 0 }}
                        name={["shopCustomerDebtLists", index, "debt_price_paid_adjust"]}>
                        <InputNumber
                            disabled={mode === "view" || record.doc_type_code_id === 'CCN' || record.doc_type_code_id === 'CDN' || record.doc_type_code_id === 'NCN'}
                            stringMode
                            style={{ width: "100%" }}
                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            onBlur={() => calculateResult()}
                            max={+form.getFieldValue()?.shopCustomerDebtLists[index]?.debt_price_amount_left}
                        />
                    </Form.Item>
                </>
            )

        },
        {
            title: () => GetIntlMessages("ยอดชำระ"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("2", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`debt-price-paid-total-${index}`} style={{ margin: 0 }} name={["shopCustomerDebtLists", index, "debt_price_paid_total"]}>
                        <InputNumber
                            disabled={mode === "view" || record.doc_type_code_id === 'CCN' || record.doc_type_code_id === 'CDN' || record.doc_type_code_id === 'NCN'}
                            stringMode
                            style={{ width: "100%" }}
                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            onBlur={() => calculateResult()}
                        />
                    </Form.Item>
                </>
            )

        },
        // {
        //     title: () => GetIntlMessages("จัดการ"),
        //     dataIndex: '',
        //     key: '',
        //     width: "2%",
        //     align: "center",
        //     render: (text, record, index) => form.getFieldValue("shopCustomerDebtLists")?.length > 0 && mode !== "view" ?
        //         <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => handleDeleteDebtDoc(record, index)}>
        //             <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
        //         </Popconfirm>
        //         : null
        // },
    ];

    const copyToDebtPricePaidTotal = (record, index, isCal = true) => {
        let debt_price_amount_left = extractDataDocSaleType(record, 'debt_price_amount_left')
        console.log("debt_price_amount_left", debt_price_amount_left)
        const { shopCustomerDebtLists } = form.getFieldValue()
        shopCustomerDebtLists[index].debt_price_paid_total = +takeOutComma(debt_price_amount_left)
        shopCustomerDebtLists[index].debt_price_paid_adjust = 0
        form.setFieldsValue({ ...shopCustomerDebtLists })
        if (isCal) {
            calculateResult()
        }
    }

    const copyToDebtPricePaidTotalAll = async () => {
        const { shopCustomerDebtLists } = form.getFieldValue()
        for (let index = 0; index < shopCustomerDebtLists.length; index++) {
            const e = shopCustomerDebtLists[index];
            await copyToDebtPricePaidTotal(e, index, false)
        }
        await calculateResult()
    }

    const extractDataDocSaleType = (record, type) => {
        try {
            // console.log("record", record)
            if (!!record.doc_type_code_id) {
                switch (record.doc_type_code_id) {
                    case 'CDN':
                        return RoundingNumber(Number(record.price_grand_total))
                    case 'CCN':
                        switch (type) {
                            case "debt_price_amount":
                            case "debt_price_amount_left":
                                if (!!form.getFieldValue("ref_doc")) {
                                    return `${mode !== "add" ? `${RoundingNumber(-record.price_grand_total)}` : `${RoundingNumber(-record.price_grand_total)}`}`
                                } else {
                                    return `${mode !== "add" ? `${RoundingNumber(-record.price_grand_total)}` : `${RoundingNumber(-record.price_grand_total)}`}`
                                }
                            default:
                                if (!!form.getFieldValue("ref_doc")) {
                                    return RoundingNumber(Number(-record.price_grand_total))
                                } else {
                                    return RoundingNumber(Number(-record.price_grand_total))
                                }
                        }
                    case 'NCN':
                        switch (type) {
                            case "debt_price_amount":
                            case "debt_price_amount_left":
                                if (!!form.getFieldValue("ref_doc")) {
                                    return `${mode !== "add" ? `${RoundingNumber(-record.price_grand_total)}` : `${RoundingNumber(-record.price_grand_total)}`}`
                                } else {
                                    return `${mode !== "add" ? `${RoundingNumber(-record.price_grand_total)}` : `${RoundingNumber(-record.price_grand_total)}`}`
                                }
                            default:
                                if (!!form.getFieldValue("ref_doc")) {
                                    return RoundingNumber(Number(-record.price_grand_total))
                                } else {
                                    return RoundingNumber(Number(-record.price_grand_total))
                                }
                        }
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
                if (!!record?.ShopCustomerDebtCreditNoteDocT2) {
                    return RoundingNumber(Number(-record.price_grand_total))
                }
            }
        } catch (error) {

        }
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

                if (result.isConfirmed) {
                    const { shopCustomerDebtLists } = form.getFieldValue()
                    const arr = shopCustomerDebtLists?.filter(where => where.id !== value.id)
                    form.setFieldsValue({ shopCustomerDebtLists: arr })
                }
            })

        } catch (error) {
            console.log('error handleAddDebtDoc:>> ', error);
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

    const debounceListProductRemark = debounce((value, index) => handleListProductRemark(value, index), 400)
    const handleListProductRemark = (value, index) => {
        try {
            const { list_service_product } = form.getFieldValue()
            const remark = !!value ? value : null
            // console.log('remark :>> ', remark);
            list_service_product[index].remark = remark
            form.setFieldsValue({ list_service_product })
        } catch (error) {
            console.log('error handleChangeName:>> ', error);
        }
    }
    const debounceChangedName = debounce((value, index) => handleChangeName(value, index), 800)
    const handleChangeName = (value, index) => {
        try {
            const { list_service_product } = form.getFieldValue()
            list_service_product[index].changed_name = value
            form.setFieldsValue({ list_service_product })
            // form.setFieldsValue({ list_service_product , [index] : {changed_name} })
        } catch (error) {
            console.log('error handleChangeName:>> ', error);
        }
    }

    const handleCheckChangeName = (val, index, record) => {
        try {
            const { list_service_product } = form.getFieldValue()
            const changed_name = displayData(record, "product_name")
            list_service_product[index].changed_name = val ? changed_name : null
            list_service_product[index].change_name_status = val
            form.setFieldsValue({ list_service_product, [index]: { changed_name } })
        } catch (error) {

        }
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
                        <Form.Item label={GetIntlMessages("ยอดคงเหลือทั้งหมด")} stringMode name="total_balance">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>

                        <Form.Item label={GetIntlMessages("ยอดรับชำระทั้งหมด")} stringMode name="debt_price_paid_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ยอดคงเหลือที่ต้องชำระ")} stringMode name="price_sub_total">
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
        </>

    );
}
export default ComponentsRoutesDocumentDebtLists