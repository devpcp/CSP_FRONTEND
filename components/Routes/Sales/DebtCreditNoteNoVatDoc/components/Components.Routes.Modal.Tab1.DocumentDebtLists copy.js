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
import ProductDataInImportDoc from "../components/Components.Routes.Modal.ProductDataInImportDoc"

const { TextArea } = Input;

const ComponentsRoutesDocumentDebtLists = ({ onFinish, calculateResult, mode }) => {
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
                    <Form.Item style={{ margin: 0 }} name={['arr_debt_list', index, "list_id"]}>
                        <Input disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("ชื่อสินค้า"),
            dataIndex: '',
            key: '',
            width: "30%",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['arr_debt_list', index, "list_name"]}>
                        <TextArea autoSize disabled={mode === "view"} />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("เลือก"),
            dataIndex: '',
            key: '',
            width: "5%",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Button onClick={() => handleOpenInventoryBalanceModal(index)} style={{ width: "100%" }} disabled={mode === "view"}>เลือก</Button>
                )
            }
        },
        {
            title: () => GetIntlMessages("ราคาต่อหน่วย"),
            dataIndex: '',
            key: '',
            width: "10%",
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`price-unit-${index}`} style={{ margin: 0 }} name={["arr_debt_list", index, "price_unit"]}>
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
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("จำนวน"),
            dataIndex: '',
            key: '',
            width: "10%",
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`amount-${index}`} style={{ margin: 0 }} name={["arr_debt_list", index, "amount"]}>
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
                        <Badge dot={!!form.getFieldValue("arr_debt_list")?.[index]?.remark ? `show` : null}>
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
            render: (text, record, index) => form.getFieldValue("arr_debt_list")?.length > 0 && mode !== "view" ?
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
                    const { arr_debt_list } = form.getFieldsValue();

                    delete arr_debt_list[index]
                    const arr = arr_debt_list.filter(where => !!where)
                    form.setFieldsValue({ arr_debt_list: arr })
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
            const { arr_debt_list } = form.getFieldValue()
            const remark = !!value ? value : null
            arr_debt_list[index].remark = remark
            form.setFieldsValue({ arr_debt_list })
        } catch (error) {
            console.log('error handleChangeName:>> ', error);
        }
    }

    const calculateTable = (value, index, type) => {
        try {
            const { arr_debt_list } = form.getFieldValue();
            let price_grand_total = 0, amount = 0, price_discount = 0, price_discount_percent = 0, price_unit = 0, price_discount_bill = 0
            switch (type) {
                case "price_unit":
                    price_unit = !isNaN(Number(value)) ? Number(value) : 0
                    amount = Number(arr_debt_list[index]["amount"] ?? 0)
                    price_discount = null
                    price_discount_percent = null
                    price_grand_total = (price_unit - price_discount) * amount

                    arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    arr_debt_list[index]["price_unit"] = price_unit.toFixed(2)
                    arr_debt_list[index]["price_discount"] = null
                    arr_debt_list[index]["price_discount_percent"] = null
                    break;
                case "amount":
                    price_unit = Number(arr_debt_list[index]["price_unit"] ?? 0)
                    amount = !isNaN(Number(value)) ? Number(value) : 0
                    price_discount = Number(arr_debt_list[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(arr_debt_list[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount
                    arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    arr_debt_list[index]["amount"] = amount.toString()
                    break;
                case "price_discount":
                    amount = Number(arr_debt_list[index]["amount"] ?? 0)
                    price_unit = Number(arr_debt_list[index]["price_unit"] ?? 0)
                    price_discount = Number(value)
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0) {
                        arr_debt_list[index]["price_discount"] = null
                        arr_debt_list[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        arr_debt_list[index]["price_discount"] = price_discount.toFixed(2)
                        arr_debt_list[index]["price_discount_percent"] = price_discount_percent.toFixed(2)
                        arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    }

                    break;
                case "price_discount_percent":
                    amount = Number(arr_debt_list[index]["amount"] ?? 0)
                    price_unit = Number(arr_debt_list[index]["price_unit"] ?? 0)
                    price_discount_percent = Number(value)
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_grand_total = (price_unit - price_discount) * amount

                    arr_debt_list[index]["price_discount"] = price_discount.toFixed(2)
                    arr_debt_list[index]["price_discount_percent"] = price_discount_percent.toFixed(2)
                    arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    break;

                default:
                    for (let i = 0; i < arr_debt_list.length; i++) {
                        amount = Number(arr_debt_list[i]["amount"] ?? 0)
                        price_unit = Number(arr_debt_list[i]["price_unit"] ?? 0)
                        price_discount = Number(arr_debt_list[i]["price_discount"] ?? 0)
                        price_grand_total = (price_unit * amount) - price_discount
                        arr_debt_list[i]["price_grand_total"] = price_grand_total.toFixed(2)
                    }
                    break;
            }
            if (isArray(arr_debt_list) && arr_debt_list.length === 0) price_discount_bill = null
            form.setFieldsValue({
                arr_debt_list, [index]: {
                    price_unit: !!price_unit
                        ? price_unit.toFixed(2)
                        : 0,
                    price_discount: !!price_discount
                        ? price_discount.toFixed(2)
                        : 0,
                    price_discount_percent: !!price_discount_percent
                        ? price_discount_percent.toFixed(2)
                        : 0,
                }, price_discount_bill
            })
            calculateResult()
        } catch (error) {
            console.log('calculateTable error :>> ', error);
        }
    }

    const handleAddArrDebtList = () => {
        try {
            const { arr_debt_list } = form.getFieldValue();
            let newArr = []
            newArr = (!!arr_debt_list) ? [...arr_debt_list, {}] : [{}]

            form.setFieldsValue({ arr_debt_list: newArr })
        } catch (error) {
            console.log('handleAddArrDebtList error :>> ', error);
        }
    }

    const handleCancelInventoryBalanceModal = () => {
        try {
            setIsInventoryBalanceModalVisible(false)
        } catch (error) {
            console.log("handleCancelInventoryBalanceModal error: ", error)
        }
    }

    const handleOpenInventoryBalanceModal = async (index) => {
        try {
            const { options_list, ref_doc } = form.getFieldValue();
            setListIndex(index)
            setListData(options_list)
            setIsInventoryBalanceModalVisible(true)
            if (ref_doc === undefined || ref_doc === null) {
                setActiveKeyTab(() => "2")
            }
        } catch (error) {
            console.log("handleOpenInventoryBalanceModal error: ", error)
        }
    }

    const callback = (data, indexCallBack, from = "") => {
        setIsInventoryBalanceModalVisible(false)
        const { arr_debt_list } = form.getFieldValue();
        switch (from) {
            case "ProductDataImportDoc":
                arr_debt_list[indexCallBack] = {
                    ...arr_debt_list[indexCallBack],
                    list_id: data.ShopProduct.Product.master_path_code_id,
                    list_name: data.ShopProduct.Product.product_name[locale.locale],
                    product_id: data.ShopProduct.Product.id,
                    shop_product_id: data.ShopProduct.id,
                    amount: data.amount,
                    price_unit: data.details.price,
                }
                break;
            default:
                arr_debt_list[indexCallBack] = {
                    ...arr_debt_list[indexCallBack],
                    list_id: data.Product.master_path_code_id,
                    list_name: data.Product.product_name[locale.locale],
                    product_id: data.Product.id,
                    shop_product_id: data.id,
                }
                break;
        }
        form.setFieldsValue({ arr_debt_list })
        calculateTable()
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
                setExVatPrice(newvalue.toFixed(2))
                break;
            case "exclude":
                newvalue = +value + (value * 7 / 100)
                vat = value * 7 / 100
                setInVatPrice((+newvalue).toFixed(2))
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
            <Row justify={"end"} hidden={mode === "view"}>
                <>

                    <Button type="primary" icon={<PlusOutlined />} style={{ marginBottom: 16, display: "flex", alignItems: "center", }}
                        onClick={handleAddArrDebtList}
                    >
                        {GetIntlMessages("เพิ่มรายการ")}
                    </Button>
                </>

            </Row>

            <Form.Item name={`arr_debt_list`} hidden />

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={Form.useWatch("arr_debt_list", { form, preserve: true })}
                    pagination={false}
                    rowClassName={() => 'editable-row'}
                    bordered
                    scroll={{ x: 1600 }}
                    loading={loadingSearch}
                />
            </div>

            <Row justify={"end"} hidden={mode === "view"}>
                <Button type="primary" icon={<PlusOutlined />} style={{ marginTop: 16, display: "flex", alignItems: "center", }}
                    onClick={handleAddArrDebtList}
                >
                    {GetIntlMessages("เพิ่มรายการ")}
                </Button>

            </Row>

            <Fieldset style={{ marginTop: "20px" }} legend={`สรุปรายการ`}>
                <Row gutter={[10, 10]}>
                    <Col lg={12} md={12} xs={24}>
                        <Row gutter={[20, 10]}>
                            <Col span={12}>
                                <Form.Item rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกผู้จำหน่าย"
                                    },
                                ]}
                                    label={GetIntlMessages("หมายเหตุ")}
                                    name="remark">
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
                        <Form.Item label={GetIntlMessages("มูลค่าตามเอกสารเดิม")} stringMode min={0} precision={2} name="price_from_doc">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("มูลค่าที่ถูกต้อง")} stringMode min={0} precision={2} name="price_should_be">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("ผลต่าง")} stringMode min={0} precision={2} name="price_different">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            />
                        </Form.Item>
                        <Form.Item label={GetIntlMessages("รวมเป็นเงิน")} stringMode min={0} precision={2} name="price_sub_total" hidden>
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
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeKeyTab}
                    onChange={handleChangeTabs}
                    items={[
                        {
                            label: (<span>จากใบรับเข้า</span>),
                            key: '1',
                            children: <ProductDataInImportDoc title={"เลือกสินค้ารายการที่ " + listIndex} callBack={callback} listData={listData} listIndex={listIndex} />,
                        },
                        {
                            label: (<span>ข้อมูลสินค้า</span>),
                            key: '2',
                            children: <ProductData title={"เลือกสินค้ารายการที่ " + listIndex} callBack={callback} listIndex={listIndex} />,
                        },
                    ]}
                />
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
export default ComponentsRoutesDocumentDebtLists