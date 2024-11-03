import { Input, Table, Button, Row, Col, Form, Select, Popconfirm, InputNumber, Popover, Checkbox, Badge, Modal, Typography, Tabs, Switch } from "antd";
import { useState, useEffect, useRef } from "react";
import React from 'react'
import { PlusOutlined, DeleteOutlined, FormOutlined, CalculatorOutlined, CheckCircleFilled, SyncOutlined, SearchOutlined } from "@ant-design/icons";
import GetIntlMessages from "../../../../../../util/GetIntlMessages";
import { useSelector } from "react-redux";
import API from "../../../../../../util/Api";
import { debounce, get, isArray, isPlainObject } from "lodash";
import SortingData from "../../../../../shares/SortingData";
import ModalViewShopStock from "../../../../ModalViewShopStock";
import { NoRoundingNumber, RoundingNumber, takeOutComma } from "../../../../../shares/ConvertToCurrency";
import Fieldset from "../../../../../shares/Fieldset";
import Swal from "sweetalert2";
import InventoryBalance from "../../../../Components.Routes.Inventory";
import ProductWarehouse from "./Components.Routes.Modal.ProductWarehouse";

const { Text, Link } = Typography;

const ComponentsRoutesModalTab1ServiceAndProductV2 = ({ onFinish, calculateResult, mode }) => {
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const form = Form.useFormInstance()

    const [loadingSearch, setLoadingSearch] = useState(false)

    const checkTaxId = Form.useWatch("tax_type_id", form)
    const isModalVisible = Form.useWatch("isModalVisible", { form, preserve: true })

    const [priceArr, setPriceArr] = useState([])
    const [priceIndexSelect, setPirceIndexSelect] = useState({})
    const [isDiscountAll, setIsDiscountAll] = useState(false)
    const [isInventoryBalanceModalVisible, setIsInventoryBalanceModalVisible] = useState(false);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [listIndex, setListIndex] = useState(0);
    const [listData, setListData] = useState([]);

    const setting_enable_sale_price_overwrite = authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_sale_price_overwrite ?? true
    const setting_enable_sale_cost_show = authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_sale_cost_show
    const setting_enable_sale_warehouse_show = authUser?.UsersProfile?.ShopsProfile?.shop_config?.enable_sale_warehouse_show

    useEffect(() => {
        setIsFieldEditing(false);
    }, [isModalVisible])

    useEffect(() => {
        getMasterData()
    }, [])

    useEffect(() => {
        calculateTable()
    }, [checkTaxId])

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
            setIsFieldEditing((prevValue) => ({ status: !prevValue.status, index, type }))
        } catch (error) {

        }
    }

    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: "2%",
                use: true,
                render: (text, record, index) => {
                    // index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                dataIndex: "shop_stock_id",
                title: "รหัสสินค้า",
                width: "6%",
                use: true,
                render: (text, record, index) => (
                    isFieldEditing.status && isFieldEditing.index === index && isFieldEditing.type === "code" ?
                        <>
                            <Form.Item style={{ margin: 0 }} name={[index, "shop_stock_id"]}>
                                <Select size="large" ref={refShopStockIdCode} showSearch onBlur={() => toggleEdit(null)}
                                    // onSearch={handleSearchShopStock}
                                    dropdownMatchSelectWidth={false}
                                    notFoundContent={loadingSearch ? GetIntlMessages("กำลังโหลดข้อมูล...กรุณารอสักครู่...") : GetIntlMessages("ไม่พบข้อมูล")}
                                    onSearch={(value) => debounceSearchShopStock(value, index, "search")}
                                    onSelect={(value) => handleSearchShopStock(value, index, "select")}
                                    filterOption={false}
                                    autoFocus
                                    disabled={mode === "view"}
                                >
                                    {/* {isPlainObject(shopStockList) ? shopStockList[index].map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.master_path_code_id ?? "-"}</Select.Option>)) : []} */}
                                    {/* {isArray(dataSource) && dataSource.length > 0 ? dataSource[index]["shop_stock_list"].map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.master_path_code_id ?? "-"}</Select.Option>)) : []} */}
                                    {getArrValue(index, "shop_stock_list").map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.master_path_code_id ?? "-"}</Select.Option>))}
                                </Select>
                            </Form.Item>
                        </>
                        :
                        <>
                            <div onClick={() => mode !== "view" ? toggleEdit(index, "code") : null}
                                className={mode !== "view" ? "editable-cell-value-wrap" : null}
                                style={{
                                    paddingRight: 24,
                                    // height : "38px",
                                    //   height : 40,
                                    textAlign: "start"
                                }}
                            >
                                {/* {text ?? "ค้นหา"} */}
                                {/* {console.log('record :>> ', record)} */}
                                {displayData(record, "master_path_code_id") ?? "ค้นหา"}
                            </div>
                        </>
                )
            },
            {
                dataIndex: "shop_stock_id",
                title: "ชื่อสินค้า",
                width: "20%",
                use: true,
                // render: (text, record, index) => console.log('record :>> ', record)
                render: (text, record, index) => (
                    <Row gutter={8}>
                        <Col span={22}>
                            {isFieldEditing.status && isFieldEditing.index === index && isFieldEditing.type === "name" ?
                                <>
                                    <Form.Item key={`shop-stock-id-${index}`} style={{ margin: 0 }} name={[index, "shop_stock_id"]}>
                                        <Select size="large" ref={refShopStockIdName} showSearch onBlur={() => toggleEdit(null)}
                                            notFoundContent={loadingSearch ? GetIntlMessages("กำลังโหลดข้อมูล...กรุณารอสักครู่...") : GetIntlMessages("ไม่พบข้อมูล")}
                                            onSearch={(value) => debounceSearchShopStock(value, index, "search")}
                                            onSelect={(value) => handleSearchShopStock(value, index, "select")}
                                            filterOption={false}
                                            autoFocus
                                            dropdownMatchSelectWidth={false}
                                            disabled={mode === "view"}
                                        >
                                            {/* {isArray(dataSource) && dataSource.length > 0 ? dataSource[index]["shop_stock_list"].map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>)) : []} */}
                                            {/* {isPlainObject(shopStockList) ? shopStockList[index].map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>)) : []} */}
                                            {getArrValue(index, "shop_stock_list").map((e, i) => (<Select.Option key={i} value={e.id}>{e?.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>))}
                                        </Select>
                                    </Form.Item>
                                </>
                                :
                                <>
                                    {record?.change_name_status === false ?
                                        <div onClick={() => mode !== "view" ? toggleEdit(index, "name") : null}
                                            className={mode !== "view" ? "editable-cell-value-wrap" : null}
                                            style={{
                                                paddingRight: 24,
                                                //   height : 40,
                                                textAlign: "start"
                                            }}
                                        >
                                            {/* {text ?? "ค้นหา"} */}
                                            {displayData(record, "product_name") ?? "ค้นหา"}
                                        </div>
                                        :
                                        <Form.Item key={`change-name-${index}`} style={{ margin: 0 }} name={[index, "changed_name"]}>
                                            <Input disabled={mode === "view"} onChange={(value) => debounceChangedName(value.target.value, index)} />
                                        </Form.Item>
                                    }
                                </>
                            }
                        </Col>
                        <Col span={2}>
                            <Button
                                icon={<SearchOutlined />}
                                type="primary"
                                style={{ borderRadius: "10px" }}
                                onClick={() => handleOpenInventoryBalanceModal(index)}
                            ></Button>
                        </Col>
                    </Row>
                )
            },
            {
                dataIndex: "",
                title: "เปลี่ยนชื่อ",
                width: "2%",
                align: "center",
                use: true,
                render: (record, text, index) => (
                    <Form.Item key={`change-name-${index}`} style={{ margin: 0 }} name={[index, "change_name_status"]}>
                        <Checkbox checked={record?.change_name_status ?? false} disabled={!record?.shop_stock_id || mode === "view"} onChange={(checkedValue) => handleCheckChangeName(checkedValue.target.checked, index, record)} />
                    </Form.Item>
                )
            },
            {
                dataIndex: "",
                title: "คลังสินค้า",
                width: "2%",
                use: true,
                render: (text, record, index) => (<ModalViewShopStock mode={mode} shopStockId={record.shop_stock_id} rowIndex={index} callbackSelectProduct={callbackSelectProduct} />)
            },
            // {
            //     title: () => "ราคา",
            //     children: [
            //         {
            //             title: () => "ราคาทุน",
            //             dataIndex: 'product_cost',
            //             // key: '',
            //             width: "10%",
            //             // width: 100,
            //             align: "center",
            //             // render: (text, record, index) => console.log('text :>> ', text)
            //             render: (text, record, index) => !!text && text !== "null" ? <div style={{ textAlign: "end" }}>{RoundingNumber(get(record, `product_cost`, 0)) ?? "-"}</div> : "-"
            //         },
            //         {
            //             title: () => "ราคา/หน่วย",
            //             dataIndex: 'price_unit',
            //             // key: '',
            //             width: "10%",
            //             // width: 100,
            //             align: "center",
            //             render: (text, record, index) => (
            //                 <>
            //                     <Form.Item style={{ margin: 0 }} name={[index, "price_unit"]}>
            //                         <InputNumber disabled={mode === "view" } size="large" style={{ width: "100%" }} step="0.01" stringMode min={0} precision={2}
            //                             // formatter={(value) => !!value && value.length > 0 ? formatNumber(value) : ""}
            //                             formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
            //                             parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            //                             // onChange={(value) => calculateTable(value, index, "price_unit")}
            //                             // onBlur={(value) => calculateTable(NoRoundingNumber(takeOutComma(value.target.value)), index, "price_unit")}
            //                             onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_unit")}
            //                         />
            //                     </Form.Item>
            //                 </>
            //             )
            //         }
            //     ],
            // },

            {
                title: () => "ราคาทุน",
                dataIndex: 'product_cost',
                // key: '',
                width: "6%",
                // width: 100,
                align: "center",
                // render: (text, record, index) => console.log('text :>> ', text)
                use: setting_enable_sale_cost_show,
                render: (text, record, index) => !!text && text !== "null" ? <div style={{ textAlign: "end" }}>{RoundingNumber(get(record, `product_cost`, 0)) ?? "-"}</div> : "-"
            },
            {
                title: () => "ราคา/หน่วย",
                dataIndex: 'price_unit',
                // key: '',
                width: "8%",
                // width: 100,
                align: "center",
                use: true,
                render: (text, record, index) => (
                    <>
                        <Form.Item style={{ margin: 0 }} name={[index, "price_unit"]}>
                            <InputNumber disabled={mode === "view" || !setting_enable_sale_price_overwrite} size="large" style={{ width: "100%" }} step="1" stringMode precision={2}
                                formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_unit")}
                                addonAfter={
                                    <Button
                                        disabled={mode === "view"}
                                        type='text'
                                        size='small'
                                        style={{ border: 0 }}
                                        onClick={() => { showModalCalVat(index); showModalPirceArr(index); }} >
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
                title: () => GetIntlMessages("ที่อยู่"),
                use: true,
                children: [
                    {
                        title: () => GetIntlMessages("DOT/MFD"),
                        dataIndex: 'dot_mfd',
                        // key: '',
                        width: "6%",
                        // width: 100,
                        align: "center",
                        use: true,
                        render: (text, record, index) => (
                            <>
                                <Form.Item style={{ margin: 0 }} name={[index, "dot_mfd"]}>
                                    <Select disabled={mode === "view"} size="large" showSearch optionFilterProp="children" filterOption={(inputValue, option) => (option?.children ?? '').includes(inputValue)}>
                                        {getArrValue(index, "dot_mfd_list").map((e, i) => (<Select.Option key={i} value={e ?? "-"}>{e ?? "-"}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </>
                        )
                    },
                    {
                        title: () => GetIntlMessages("คลัง/ชั้นวาง"),
                        dataIndex: ["warehouse", "shelf"],
                        // key: '',
                        width: "8%",
                        // width: 100,
                        align: "center",
                        use: setting_enable_sale_warehouse_show,
                        render: (text, record, index) => (
                            <>
                                <Row gutter={[0, 10]}>
                                    <Col span={24}>
                                        <Form.Item style={{ margin: 0 }} name={[index, "warehouse"]}>
                                            <Select disabled={mode === "view"} size="large" showSearch placeholder="คลัง" filterOption={false}>
                                                {getArrValue(index, "warehouse_list").map((e, i) => (<Select.Option key={i} value={e.id}>{e?.name?.[locale.locale] ?? "-"}</Select.Option>))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item style={{ margin: 0 }} name={[index, "shelf"]}>
                                            <Select disabled={mode === "view"} size="large" showSearch placeholder="ชั้นวาง" filterOption={false}>
                                                {getArrValue(index, "shelf_list").map((e, i) => (<Select.Option key={i} value={e.code}>{e?.name?.[locale.locale] ?? "-"}</Select.Option>))}
                                            </Select>
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                        )
                    },
                ]
            },
            {
                title: () => GetIntlMessages("จำนวน"),
                width: "6%",
                dataIndex: "amount",
                use: true,
                render: (text, record, index) => (
                    <>
                        <Row gutter={[0, 10]}>
                            <Col span={24}>
                                <Form.Item style={{ margin: 0 }} name={[index, "amount"]}>
                                    <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={1}
                                        onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "amount")}
                                        formatter={(value) => !!value ? formatNumber(value, false) : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item noStyle name={[index, "purchase_unit_id"]}>
                                    <Select disabled={mode === "view"} placeholder="หน่วยซื้อ" size="large" showSearch dropdownMatchSelectWidth={false} style={{ width: "100%", margin: 0, padding: 0, overflow: "hidden", textAlign: "center" }}>
                                        {getArrValue(index, "purchase_unit_list").map((e, i) => (<Select.Option key={`purchase-unit-${i}-${e?.id}`} value={e?.id}>{e?.type_name[locale.locale] ?? "-"}</Select.Option>))}
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )
            },
            {
                title: () => (<>{"ส่วนลด "}<Switch style={{ backgroundColor: isDiscountAll ? '#007fa6' : '#007fa6' }} checkedChildren="รวม" unCheckedChildren="ต่อรายการ" size="large" onChange={(bool) => setIsDiscountAll(bool)} /></>),
                dataIndex: ["price_discount", "price_discount_percent"],
                width: "8%",
                use: true,
                render: (text, record, index) => (
                    <>
                        <Row gutter={[0, 10]} hidden={isDiscountAll}>
                            <Col span={24}>
                                <Badge count={
                                    form.getFieldValue("list_service_product")[index]?.price_discount_3 !== undefined && form.getFieldValue("list_service_product")[index]?.price_discount_3 !== "0.00" ? 3 :
                                        form.getFieldValue("list_service_product")[index]?.price_discount_2 !== undefined && form.getFieldValue("list_service_product")[index]?.price_discount_2 !== "0.00" ? 2 :
                                            null} >
                                    <Form.Item style={{ margin: 0 }} name={[index, "price_discount"]}>
                                        <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                            placeholder={"บาท"}
                                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount")}
                                            addonAfter={
                                                <PopOverDiscount index={index} label={"฿"} />
                                            }
                                            className='ant-input-number-after-addon-20-percent'
                                        />
                                    </Form.Item>
                                </Badge>
                            </Col>
                            <Col span={24}>
                                <Form.Item style={{ margin: 0 }} name={[index, "price_discount_percent"]}>
                                    <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                        placeholder={"%"}
                                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_percent")}
                                        addonAfter={
                                            <PopOverDiscount index={index} label={"%"} />
                                        }
                                        className='ant-input-number-after-addon-20-percent'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[0, 10]} hidden={!isDiscountAll}>
                            <Col span={24}>
                                <Badge count={
                                    form.getFieldValue("list_service_product")[index]?.price_discount_3 !== undefined && form.getFieldValue("list_service_product")[index]?.price_discount_3 !== "0.00" ? 3 :
                                        form.getFieldValue("list_service_product")[index]?.price_discount_2 !== undefined && form.getFieldValue("list_service_product")[index]?.price_discount_2 !== "0.00" ? 2 :
                                            null} >
                                    <Form.Item style={{ margin: 0 }} name={[index, "price_discount_all"]}>
                                        <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                            placeholder={"บาท"}
                                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all")}
                                            addonAfter={
                                                <PopOverDiscountAll index={index} label={"฿"} />
                                            }
                                            // addonAfter={"฿"}
                                            className='ant-input-number-after-addon-20-percent'
                                        />
                                    </Form.Item>
                                </Badge>
                            </Col>
                            <Col span={24}>
                                <Form.Item style={{ margin: 0 }} name={[index, "price_discount_all_percent"]}>
                                    <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                        placeholder={"%"}
                                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_percent")}
                                        addonAfter={
                                            <PopOverDiscountAll index={index} label={"%"} />
                                        }
                                        // addonAfter={"%"}
                                        className='ant-input-number-after-addon-20-percent'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )
            },
            {
                title: () => GetIntlMessages("รวมเงิน"),
                width: "6%",
                dataIndex: "price_grand_total",
                use: true,
                // render: (record, text, index) =>console.log('record :>> ', record)
                render: (text, record, index) => <div style={{ textAlign: "end", fontSize: "1rem" }}>{RoundingNumber(text) ?? "-"}</div>
            },
            {
                title: () => GetIntlMessages("หมายเหตุ"),
                dataIndex: "remark",
                width: "2%",
                align: "center",
                use: true,
                // render: (record, index) => console.log(`record remark ${index}:>> `, record )
                render: (text, record, index) => (
                    <>
                        <Popover content={
                            <>
                                <Form.Item name={[index, "remark"]} style={{ margin: 0 }}>
                                    <Input.TextArea onChange={(value) => debounceListProductRemark(value.target.value, index)} rows={10} disabled={mode === "view"} />
                                </Form.Item>
                            </>
                        } trigger="click">
                            <Badge dot={!!form.getFieldValue("list_service_product")[index]?.remark ? `show` : null}>
                                {/* <Badge dot={!!form.getFieldValue("list_service_product")[index]?.remark ? `show` : null}> */}
                                <Button icon={<FormOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} />
                            </Badge>
                        </Popover>
                    </>
                )
            },
            {
                dataIndex: "manage",
                title: "จัดการ",
                width: "2%",
                use: true,
                render: (text, record, index) => (
                    form.getFieldValue("list_service_product").length > 0 && mode !== "view" ?
                        <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => deleleteList(index)}>
                            <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                        </Popconfirm>
                        : null
                )
            },
        ];
        _column.map((e) => {
            e.children = e.children !== undefined ? e.children.filter(x => x.use === true) : null
        })

        return _column.filter(x => x.use === true);
    }

    const PopOverDiscount = ({ index, label }) => {
        return (
            <Popover
                trigger="click"
                overlayStyle={{
                    width: "600px"
                }}
                content={
                    <Row gutter={[10, 10]}>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount"]} label="ส่วนลด (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount")}
                                    addonAfter={`฿`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_percent"]} label="ส่วนลด (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_percent")}
                                    addonAfter={`%`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_2"]} label="ส่วนลด 2 (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_2")}
                                    addonAfter={`฿`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_percent_2"]} label="ส่วนลด 2 (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_percent_2")}
                                    addonAfter={`%`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_3"]} label="ส่วนลด 3 (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_3")}
                                    addonAfter={
                                        <PopOverDiscount index={index} label={"฿"} />
                                    }
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_percent_3"]} label="ส่วนลด 3 (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_percent_3")}
                                    addonAfter={
                                        <PopOverDiscount index={index} label={"%"} />
                                    }
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}><Text style={{ color: "red" }}>***เมื่อมีการแก้ไขจำนวน ส่วนลด หรือราคาสินค้า ด้านนอก กรุณากลับมาตรวจสอบตรงส่วนนี้อีกครั้ง !</Text></Col>
                    </Row>
                }>
                <div>
                    <Link type="text" >{label}</Link>
                </div>
            </Popover>
        )
    }

    const PopOverDiscountAll = ({ index, label }) => {
        return (
            <Popover
                trigger="click"
                overlayStyle={{
                    width: "600px"
                }}
                content={
                    <Row gutter={[10, 10]}>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all"]} label="ส่วนลด (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all")}
                                    addonAfter={`฿`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all_percent"]} label="ส่วนลด (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_percent")}
                                    addonAfter={`%`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all_2"]} label="ส่วนลด 2 (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_2")}
                                    addonAfter={`฿`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all_percent_2"]} label="ส่วนลด 2 (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_percent_2")}
                                    addonAfter={`%`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all_3"]} label="ส่วนลด 3 (บาท)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"1"} precision={2}
                                    placeholder={"บาท"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_3")}
                                    addonAfter={`฿`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={[index, "price_discount_all_percent_3"]} label="ส่วนลด 3 (%)">
                                <InputNumber disabled={mode === "view"} size="large" style={{ width: "100%" }} stringMode min={0} step={"0.01"} precision={2}
                                    placeholder={"%"}
                                    formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_discount_all_percent_3")}
                                    addonAfter={`%`}
                                    className='ant-input-number-after-addon-20-percent'
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}><Text style={{ color: "red" }}>***เมื่อมีการแก้ไขจำนวน ส่วนลด หรือราคาสินค้า ด้านนอก กรุณากลับมาตรวจสอบตรงส่วนนี้อีกครั้ง !</Text></Col>
                    </Row>
                }>
                <div>
                    <Link type="text" >{label}</Link>
                </div>
            </Popover>
        )
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
            console.log('value :>> ', value);
            console.log('form.getFieldValue() handleListProductRemark:>> ', form.getFieldValue());
            const { list_service_product } = form.getFieldValue()
            console.log('list_service_product :>> ', list_service_product);
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
            console.log('value :>> ', value);
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
            console.log('val :>> ', val);
            console.log('record :>> ', record);
            const { list_service_product } = form.getFieldValue()
            console.log('displayData(record, "product_name") :>> ', displayData(record, "product_name"));
            const changed_name = displayData(record, "product_name")
            list_service_product[index].changed_name = val ? changed_name : null
            list_service_product[index].change_name_status = val
            form.setFieldsValue({ list_service_product, [index]: { changed_name } })
            console.log('form.getFieldValue() :>> ', form.getFieldValue());
        } catch (error) {

        }
    }

    const debounceSearchShopStock = debounce((value, index, type) => handleSearchShopStock(value, index, type), 800)
    const handleSearchShopStock = async (value, index, type) => {
        try {
            setLoadingSearch(true)
            const { list_service_product } = form.getFieldValue()
            switch (type) {
                case "search":
                    const { data } = await API.get(`/shopStock/all?dropdown=true&search=${value}&limit=10&page=1&sort=balance_date&order=asc&status=active&filter_wyz_code=false&filter_available_balance=false&min_balance=1`)
                    // console.log('data :>> ', data);
                    if (data.status === "success") {
                        list_service_product[index]["shop_stock_list"] = SortingData(data.data.data, `ShopProduct.Product.product_name.${locale.locale}`)
                    }
                    break;
                case "select":
                    list_service_product[index]["shop_stock_id"] = value
                    const find = list_service_product[index]["shop_stock_list"].find(where => where.id === value)
                    if (isPlainObject(find)) {
                        // console.log('find :>> ', find);
                        const { product_cost } = find
                        const warehouse_detail = find?.warehouse_detail.map(e => { return { ...e, shelf: e.shelf.item, ...e.shelf } }) ?? []
                        const warehouseArr = takeOutDuplicateValue(warehouse_detail, "warehouse")
                        const shefArr = takeOutDuplicateValue(warehouse_detail, "item")

                        list_service_product[index]["shop_product_id"] = find.ShopProduct.id
                        if (warehouseArr.length === 1 && shefArr.length === 1) {
                            let unit_list = find?.ShopProduct.Product.ProductType.ProductPurchaseUnitTypes ?? []
                            callbackSelectProduct({ ...find, product_list: [{ warehouse_detail, unit_list }] }, 0, 0, null, index)
                            // list_service_product[index]["product_cost"] = !!product_cost && product_cost !== "null" ? product_cost : null
                        } else {
                            list_service_product[index]["price_unit"] = null
                            list_service_product[index]["product_cost"] = null
                            // list_service_product[index]["product_cost"] = !!product_cost && product_cost !== "null" ? product_cost : null
                            list_service_product[index]["price_grand_total"] = null
                            list_service_product[index]["dot_mfd"] = null
                            list_service_product[index]["dot_mfd_list"] = []
                            list_service_product[index]["warehouse"] = null
                            list_service_product[index]["warehouse_list"] = []
                            list_service_product[index]["shelf"] = null
                            list_service_product[index]["shelf_list"] = []
                            list_service_product[index]["purchase_unit_id"] = null
                            list_service_product[index]["purchase_unit_list"] = []
                            list_service_product[index]["amount"] = null
                            form.setFieldsValue({
                                [index]: {
                                    price_unit: null,
                                    dot_mfd: null,
                                    warehouse: null,
                                    shelf: null,
                                    purchase_unit_id: null,
                                    amount: null
                                }
                            })
                        }
                    }


                    toggleEdit()
                    break;

                default:
                    break;
            }
            form.setFieldsValue({ list_service_product })
            setLoadingSearch(false)
        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const callbackSelectProduct = (value, index1, index2, amount, rowIndex) => {
        try {
            let product_cost
            const { list_service_product, tags_obj } = form.getFieldValue(),
                shop_stock_id = list_service_product[rowIndex]["shop_stock_id"],
                { product_list, product_cost_product_stocks } = value,
                selectedProduct = product_list[index1].warehouse_detail[index2];
            const suggestedPrice = list_service_product[rowIndex]["shop_stock_list"].find(where => where.id === shop_stock_id).ShopProduct?.price?.suggasted_re_sell_price?.retail ?? null
            const suggestedPriceWholeSale = list_service_product[rowIndex]["shop_stock_list"]?.find(where => where.id === shop_stock_id)?.ShopProduct?.price?.suggasted_re_sell_price?.wholesale ?? null;

            if (!!selectedProduct["dot_mfd"]) {
                product_cost = !!product_cost_product_stocks ? product_cost_product_stocks.find(where => selectedProduct["warehouse"] === where.shop_warehouse_id && selectedProduct["shelf"] === where.shop_warehouse_shelf_item_id && selectedProduct["dot_mfd"] === where.dot_mfd && selectedProduct["purchase_unit_id"] === where.purchase_unit_id)?.product_cost_latest ?? null : null
            } else {
                product_cost = !!product_cost_product_stocks ? product_cost_product_stocks.find(where => selectedProduct["warehouse"] === where.shop_warehouse_id && selectedProduct["shelf"] === where.shop_warehouse_shelf_item_id && selectedProduct["purchase_unit_id"] === where.purchase_unit_id)?.product_cost_latest ?? null : null
            }

            let price_arr = []
            price_arr = list_service_product[rowIndex]["shop_stock_list"]?.find(where => where.id === shop_stock_id)?.ShopProduct?.price_arr ?? []
            price_arr.map((e) => {
                e.selected = false
            })

            let base_price = [{
                price_name: "ขายปลีก",
                price_value: (suggestedPrice ?? 0).toString(),
                selected: true
            },
            {
                price_name: "ขายส่ง",
                price_value: (suggestedPriceWholeSale ?? 0).toString(),
                selected: false
            }]
            price_arr = price_arr.concat(base_price)
            setPriceArr(price_arr)
            price_arr.sort((a, b) => +a.price_value - +b.price_value)

            let find_price = []
            if (tags_obj) {
                tags_obj.map((e) => {
                    if (price_arr.find(x => x.price_name === e.tag_name) !== undefined) {
                        find_price.push(price_arr.find(x => x.price_name === e.tag_name))
                    }
                })
            }

            find_price.sort((a, b) => +a.price_value - +b.price_value)

            if (find_price.length !== 0) {
                let indexPrice = price_arr.findIndex(x => x.price_name === find_price[0].price_name)
                let selectPrice = price_arr.find(x => x.price_name === find_price[0].price_name)
                selectPrice.selected = true
                price_arr[indexPrice] = selectPrice

                let indexRetailPrice = price_arr.findIndex(x => x.price_name === "ขายปลีก")
                let retailPrice = price_arr.find(x => x.price_name === "ขายปลีก")
                retailPrice.selected = false
                price_arr[indexRetailPrice] = retailPrice
            }

            let dot_mfd_list = [], warehouse_list = [], shelf_list = [], purchase_unit_list = []
            dot_mfd_list = takeOutDuplicateValue(product_list[index1].warehouse_detail, "dot_mfd")
            purchase_unit_list = product_list[index1].unit_list

            warehouse_list = shopWarehouseAllList.filter(where => where.id === selectedProduct["warehouse"])
            shelf_list = warehouse_list[0]["shelf"].filter(where => where.code === selectedProduct["shelf"])

            list_service_product[rowIndex]["price_unit"] = price_arr.length > 0 ? MatchRound(+price_arr.find(x => x.selected === true).price_value) : null
            list_service_product[rowIndex]["product_cost"] = !!product_cost ? RoundingNumber(product_cost) : null
            list_service_product[rowIndex]["dot_mfd"] = selectedProduct["dot_mfd"] ?? "-"
            list_service_product[rowIndex]["dot_mfd_list"] = dot_mfd_list
            list_service_product[rowIndex]["purchase_unit_id"] = selectedProduct["purchase_unit_id"] ?? null
            list_service_product[rowIndex]["purchase_unit_list"] = purchase_unit_list
            list_service_product[rowIndex]["amount"] = amount
            list_service_product[rowIndex]["warehouse_list"] = warehouse_list
            list_service_product[rowIndex]["shelf_list"] = shelf_list
            list_service_product[rowIndex]["warehouse"] = selectedProduct["warehouse"]
            list_service_product[rowIndex]["shelf"] = selectedProduct["shelf"]
            list_service_product[rowIndex]["price_arr"] = price_arr

            form.setFieldsValue({
                list_service_product,
                [rowIndex]: {
                    amount,
                    dot_mfd: selectedProduct["dot_mfd"] ?? "-",
                    purchase_unit_id: selectedProduct["purchase_unit_id"] ?? null,
                    price_unit: price_arr.length > 0 ? MatchRound(+price_arr.find(x => x.selected === true).price_value) : null,
                    warehouse: selectedProduct["warehouse"],
                    shelf: selectedProduct["shelf"]
                }
            })
            calculateTable()
            // calculateResult()
        } catch (error) {
            console.log('error callbackSelectProduct:>> ', error);
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

    const calculateTable = async (value, index, type) => {
        try {
            const { list_service_product } = await form.getFieldValue();
            let price_grand_total = 0,
                price_grand_total_2 = 0,
                price_grand_total_3 = 0,
                amount = 0,
                price_discount = 0,
                price_discount_percent = 0,
                price_discount_2 = 0,
                price_discount_percent_2 = 0,
                price_discount_3 = 0,
                price_discount_percent_3 = 0,
                price_unit = 0,
                price_discount_bill = 0,
                price_unit_vat = 0,
                price_unit_before_vat = 0,
                price_unit_add_vat = 0,
                price_discount_for_cal = 0,
                price_unit_after_discount = 0,
                price_discount_all = 0,
                price_discount_all_percent = 0,
                price_discount_all_2 = 0,
                price_discount_all_percent_2 = 0,
                price_discount_all_3 = 0,
                price_discount_all_percent_3 = 0
            switch (type) {
                case "price_unit":
                    price_unit = Number(value)
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_discount_2 = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_3"] ?? 0)

                    price_discount_for_cal = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_for_cal"] ?? 0)
                    price_discount = value <= 0 ? 0 : Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_percent = value <= 0 ? 0 : ((price_discount / price_unit) * 100)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = value <= 0 ? 0 : ((price_discount_2 / price_grand_total) * 100) //แปลงเป็น %

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = value <= 0 ? 0 : ((price_discount_3 / price_grand_total_2) * 100) //แปลงเป็น %

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount
                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    list_service_product[index]["price_unit"] = MatchRound(price_unit)
                    list_service_product[index]["price_discount"] = MatchRound(price_discount)
                    list_service_product[index]["price_discount_percent"] = MatchRound(price_discount_percent)

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
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    amount = Number(value)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)

                    price_discount_for_cal = value <= 0 ? 0 : Number(list_service_product[index]["price_discount_for_cal"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(list_service_product[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all = price_discount * amount
                    price_discount_all_percent = ((price_discount_all / price_grand_total) * 100)

                    price_discount_all_2 = price_discount_2 * amount
                    price_discount_all_percent_2 = ((price_discount_all_2 / (price_unit * amount)) * 100)

                    price_discount_all_3 = price_discount_3 * amount
                    price_discount_all_percent_3 = ((price_discount_all_3 / (price_unit * amount)) * 100)

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    list_service_product[index]["amount"] = amount.toString()

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
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = Number(value)
                    price_discount = Number(value)
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

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
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_percent = Number(value)
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

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
                case "price_discount_2":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_discount_2 = Number(value)
                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_2 = (price_grand_total * price_discount_percent_2) / 100
                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                case "price_discount_percent_2":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_discount_percent_2 = Number(value)
                    price_discount_2 = (((price_grand_total / amount) * price_discount_percent_2) / 100)
                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount

                    price_discount_all_2 = (price_grand_total * price_discount_percent_2) / 100
                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;

                case "price_discount_3":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all = value <= 0 ? 0 : price_discount * amount
                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_discount_3 = Number(value)
                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_3 = (price_grand_total_2 * price_discount_percent_3) / 100
                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false
                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                case "price_discount_percent_3":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all_percent = ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_discount_percent_3 = Number(value)
                    price_discount_3 = ((price_grand_total_2 / amount) * price_discount_percent_3) / 100
                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount

                    price_discount_all_3 = (price_grand_total_2 * price_discount_percent_3) / 100
                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false
                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                case "price_discount_all":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = Number(value) / amount
                    price_discount = Number(value) / amount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all = Number(value)
                    price_discount_all_percent = ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

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
                case "price_discount_all_percent":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_all_percent = Number(value)
                    price_discount_all = (((price_unit * amount) * price_discount_all_percent) / 100)

                    price_discount_for_cal = price_discount_all / amount
                    price_discount = price_discount_all / amount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

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
                case "price_discount_all_2":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

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
                    price_discount_2 = Number(value) / amount
                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_2 = Number(value)
                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_3) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                case "price_discount_all_percent_2":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_3 = Number(list_service_product[index]["price_discount_all_3"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all_percent = ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_discount_all_percent_2 = Number(value)
                    price_discount_all_2 = ((price_grand_total * price_discount_all_percent_2) / 100)

                    price_discount_2 = price_discount_all_2 / amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %
                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false

                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;

                case "price_discount_all_3":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all_percent = ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_discount_3 = Number(value) / amount
                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                    price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_3 = Number(value)
                    price_discount_all_percent_3 = ((price_discount_all_3 / price_grand_total_2) * 100)

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false
                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                case "price_discount_all_percent_3":
                    amount = Number(list_service_product[index]["amount"] ?? 0)
                    price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                    price_discount = Number(list_service_product[index]["price_discount"] ?? 0)
                    price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                    price_discount_all = Number(list_service_product[index]["price_discount_all"] ?? 0)
                    price_discount_all_2 = Number(list_service_product[index]["price_discount_all_2"] ?? 0)

                    price_discount_for_cal = price_discount
                    price_grand_total = (price_unit - price_discount) * amount
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %

                    price_discount_all_percent = ((price_discount_all / (price_unit * amount)) * 100)

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

                    price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                    price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                    price_discount_all_percent_2 = ((price_discount_all_2 / price_grand_total) * 100)

                    if ((!!price_discount_percent_2 && Number(price_discount_percent_2) < 0.01) || price_unit === 0 || (!!price_discount_2 && Number(price_discount_2) < 0.01)) {
                        list_service_product[index]["price_discount_2"] = null
                        list_service_product[index]["price_discount_percent_2"] = null
                        price_discount_2 = null
                        price_discount_percent_2 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_2"] = MatchRound(price_discount_2)
                        list_service_product[index]["price_discount_percent_2"] = MatchRound(price_discount_percent_2)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_2)
                    }

                    price_discount_all_percent_3 = Number(value)
                    price_discount_all_3 = ((price_grand_total_2 * price_discount_all_percent_3) / 100)

                    price_discount_3 = price_discount_all_2 / amount
                    price_discount_percent_3 = ((price_discount_2 / (price_grand_total_2 / amount)) * 100)  //แปลงเป็น %
                    price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount

                    if ((!!price_discount_percent_3 && Number(price_discount_percent_3) < 0.01) || price_unit === 0 || (!!price_discount_3 && Number(price_discount_3) < 0.01)) {
                        list_service_product[index]["price_discount_3"] = null
                        list_service_product[index]["price_discount_percent_3"] = null
                        price_discount_3 = null
                        price_discount_percent_3 = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        list_service_product[index]["price_discount_3"] = MatchRound(price_discount_3)
                        list_service_product[index]["price_discount_percent_3"] = MatchRound(price_discount_percent_3)
                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)
                    }

                    if (price_grand_total_3 !== price_grand_total) {
                        price_unit_after_discount = price_grand_total_3 / amount

                        price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false
                    } else {
                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                        list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                    }

                    list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    list_service_product[index]["is_discount_by_percent"] = false
                    list_service_product[index]["is_discount_by_bath"] = price_discount > 0 ? true : false
                    list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal

                    break;
                default:
                    for (let index = 0; index < list_service_product.length; index++) {
                        amount = Number(list_service_product[index]["amount"] ?? 0)
                        price_unit = Number(list_service_product[index]["price_unit"] ?? 0)
                        price_discount_2 = Number(list_service_product[index]["price_discount_2"] ?? 0)
                        price_discount_3 = Number(list_service_product[index]["price_discount_3"] ?? 0)

                        price_discount_for_cal = Number(list_service_product[index]["price_discount_for_cal"] ?? 0)
                        price_discount = list_service_product[index]["is_discount_by_percent"] === true ? price_discount_for_cal : Number(list_service_product[index]["price_discount"] ?? 0)
                        price_grand_total = (price_unit - price_discount) * amount

                        price_discount_all = value <= 0 ? 0 : price_discount * amount
                        price_discount_all_percent = value <= 0 ? 0 : ((price_discount_all / (price_unit * amount)) * 100)

                        price_grand_total_2 = ((price_grand_total / amount) - price_discount_2) * amount
                        price_discount_percent_2 = ((price_discount_2 / (price_grand_total / amount)) * 100)  //แปลงเป็น %

                        price_grand_total_3 = ((price_grand_total_2 / amount) - price_discount_3) * amount
                        price_discount_percent_3 = ((price_discount_3 / (price_grand_total_2 / amount)) * 100) //แปลงเป็น %

                        if (price_grand_total_3 !== price_grand_total) {
                            price_unit_after_discount = price_grand_total_3 / amount

                            price_unit_vat = calculateVatPerItem(price_unit_after_discount)
                            price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount - price_unit_vat : 0
                            price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit_after_discount + price_unit_vat : 0
                            list_service_product[index]["is_discount"] = price_unit_after_discount < 0 ? true : false
                        } else {
                            price_unit_vat = calculateVatPerItem(price_unit)
                            price_unit_before_vat = checkTaxId === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                            price_unit_add_vat = checkTaxId !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0
                            list_service_product[index]["is_discount"] = price_unit < 0 ? true : false
                        }

                        list_service_product[index]["price_grand_total"] = MatchRound(price_grand_total_3)

                        list_service_product[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                        list_service_product[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                        list_service_product[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                        list_service_product[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                        list_service_product[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                        list_service_product[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                        list_service_product[index]["is_discount_by_percent"] = list_service_product[index]["is_discount_by_percent"] ?? false
                        list_service_product[index]["is_discount_by_bath"] = list_service_product[index]["is_discount_by_bath"] ?? false
                        list_service_product[index]["price_discount_for_cal"] = price_discount_for_cal
                    }
                    break;
            }

            if (isArray(list_service_product) && list_service_product.length === 0) price_discount_bill = null
            form.setFieldsValue({
                list_service_product,
                [index]: {
                    price_unit: !!price_unit
                        ? MatchRound(price_unit)
                        : 0,
                    price_discount: !!price_discount
                        ? MatchRound(price_discount)
                        : 0,
                    price_discount_percent: !!price_discount_percent
                        ? MatchRound(price_discount_percent)
                        : 0,
                    price_discount_2: !!price_discount_2
                        ? MatchRound(price_discount_2)
                        : 0,
                    price_discount_percent_2: !!price_discount_percent_2
                        ? MatchRound(price_discount_percent_2)
                        : 0,
                    price_discount_3: !!price_discount_3
                        ? MatchRound(price_discount_3)
                        : 0,
                    price_discount_percent_3: !!price_discount_percent_3
                        ? MatchRound(price_discount_percent_3)
                        : 0,
                    price_discount_all: !!price_discount_all
                        ? MatchRound(price_discount_all)
                        : 0,
                    price_discount_all_percent: !!price_discount_all_percent
                        ? MatchRound(price_discount_all_percent)
                        : 0,
                    price_discount_all_2: !!price_discount_all_2
                        ? MatchRound(price_discount_all_2)
                        : 0,
                    price_discount_all_percent_2: !!price_discount_all_percent_2
                        ? MatchRound(price_discount_all_percent_2)
                        : 0,
                    price_discount_all_3: !!price_discount_all_3
                        ? MatchRound(price_discount_all_3)
                        : 0,
                    price_discount_all_percent_3: !!price_discount_all_percent_3
                        ? MatchRound(price_discount_all_percent_3)
                        : 0,
                },
            });
            calculateResult()
        } catch (error) {
            console.log('error :>> calculate table', error);
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

    const [isModalCalVatOpen, setIsModalCalVatOpen] = useState(false);
    const [inVatPrice, setInVatPrice] = useState(0);
    const [indexCalVatPrice, setIndexCalVatPrice] = useState(0);
    const [exVatPrice, setExVatPrice] = useState(0);

    const showModalCalVat = (index) => {
        const { list_service_product } = form.getFieldValue()
        let price_unit = list_service_product[index].price_unit
        setInVatPrice(price_unit)
        calculateInExVat(price_unit, "include")

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

    const handleModalPriceCancel = async (record) => {
        const { list_service_product } = form.getFieldValue()
        let newPirce_arr = list_service_product[priceIndexSelect].price_arr
        newPirce_arr.map((e) => {
            e.selected = e.price_name === record.price_name ? true : false
        })
        list_service_product[priceIndexSelect].price_arr = newPirce_arr
        form.setFieldsValue({ list_service_product })

        calculateTable(await record.price_value, indexCalVatPrice, "price_unit")
        setIsModalCalVatOpen(false);
    };

    const columnsPrice = [
        {
            title: () => GetIntlMessages("ลำดับ"),
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: 100,
            render: (text, record, index) => {
                return index + 1
            },
        },
        {
            title: 'ร่องราคา',
            dataIndex: 'price_name',
            key: 'price_name',
            align: "center",
            render: (text) => <div>{text}</div>,
        },
        {
            title: 'ราคา',
            dataIndex: 'price_value',
            key: 'price_value',
            align: "center",
            render: (text) => <div style={{ textAlign: "end" }}>{(+text).toLocaleString({ minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
        },
        {
            title: '',
            dataIndex: 'price_value',
            key: 'price_value',
            align: "center",
            render: (text, record) => {
                if (record.selected) {
                    return (
                        <CheckCircleFilled style={{ fontSize: "30px", color: "green" }} />
                    )
                } else {
                    return (
                        <Button
                            onClick={() => handleModalPriceCancel(record)}
                            type='primary'
                            style={{ border: 0, borderRadius: "10px" }}
                        >
                            เลือก
                        </Button>
                    )
                }
            },
        },
    ];

    const showModalPirceArr = async (index) => {
        try {
            setPirceIndexSelect(index)
            const { list_service_product, tags_obj } = form.getFieldValue()

            console.log("list_service_product", list_service_product)

            let shop_product_id = list_service_product[index].shop_stock_list[0].ShopProduct.id
            let price_unit = list_service_product[index].price_unit
            const { data } = await API.get(`/shopProducts/byid/${shop_product_id}`);
            let shopProductData = data.data[0]
            console.log("shopProductData", shopProductData)
            let suggestedPrice = shopProductData?.price?.suggasted_re_sell_price?.retail
            let suggestedPriceWholeSale = shopProductData?.price?.suggasted_re_sell_price?.wholesale
            let price_arr = []
            price_arr = shopProductData?.price_arr ?? []


            let base_price = [{
                price_name: "ขายปลีก",
                price_value: (suggestedPrice ?? 0).toString(),
                selected: false
            },
            {
                price_name: "ขายส่ง",
                price_value: (suggestedPriceWholeSale ?? 0).toString(),
                selected: false
            }]

            price_arr = price_arr.concat(base_price)
            price_arr.map((e) => {
                e.selected = MatchRound(price_unit) === MatchRound(e.price_value)
            })
            if (list_service_product[index].price_arr) {
                setPriceArr(list_service_product[index].price_arr)
            } else {
                list_service_product[index].price_arr = price_arr
                setPriceArr(price_arr)
                form.setFieldsValue({ list_service_product })
            }

            // price_arr.sort((a, b) => +a.price_value - +b.price_value)

            // let find_price = []
            // if (tags_obj) {
            //     tags_obj.map((e) => {
            //         if (price_arr.find(x => x.price_name === e.tag_name) !== undefined) {
            //             find_price.push(price_arr.find(x => x.price_name === e.tag_name))
            //         }
            //     })
            // }
            // console.log("find_price", find_price)
            // find_price.sort((a, b) => +a.price_value - +b.price_value)

            // if (find_price.length !== 0) {
            //     let indexPrice = price_arr.findIndex(x => x.price_name === find_price[0].price_name)
            //     let selectPrice = price_arr.find(x => x.price_name === find_price[0].price_name)
            //     selectPrice.selected = true
            //     price_arr[indexPrice] = selectPrice

            //     let indexRetailPrice = price_arr.findIndex(x => x.price_name === "ขายปลีก")
            //     let retailPrice = price_arr.find(x => x.price_name === "ขายปลีก")
            //     retailPrice.selected = false
            //     price_arr[indexRetailPrice] = retailPrice
            // }

            // list_service_product[index]["price_arr"] = price_arr


            // setPriceArr(list_service_product[index].price_arr)
        } catch (error) {
            console.log("error", error)
        }
    }

    const onChangeDiscountBillPercent = () => {
        calculateResult("percent")
    }

    const onChangeDiscountBillBath = () => {
        calculateResult("bath")
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

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

    const handleCancelInventoryBalanceModal = () => {
        try {
            setIsInventoryBalanceModalVisible(false)
        } catch (error) {

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
    const callbackInventoryBalance = (data, indexCallBack, from = "") => {
        try {
            const { list_service_product } = form.getFieldValue();
            setListData(data.warehouse_detail)
            list_service_product[indexCallBack] = {
                product_id: data.ShopProduct.Product.id,
                shop_product_id: data.ShopProduct.id,
                warehouse_detail: data.warehouse_detail,
                shop_stock_id: data.id,
                shop_stock_list: [data],
                change_name_status: false,
            }
            form.setFieldsValue({
                list_service_product,
                [indexCallBack]: {
                    price_unit: null,
                    dot_mfd: null,
                    warehouse: null,
                    shelf: null,
                    purchase_unit_id: null,
                    amount: null
                }
            })

            calculateTable()
            handleCancelInventoryBalanceModal()
        } catch (error) {
            console.log("callbackInventoryBalance : ", error)
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

    return (
        <>
            <Row justify={"end"} hidden={mode === "view"}>
                <Button
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
                </Button>
            </Row>

            <Form.Item name={`list_service_product`} hidden />

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={setColumnsTable()}
                    dataSource={Form.useWatch("list_service_product", form)}
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
                <Button
                    onClick={handleAdd}
                    type="primary"
                    style={{
                        marginTop: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                    icon={<PlusOutlined style={{ fontSize: 16, marginBottom: 4 }} />}
                >
                    {GetIntlMessages("เพิ่มรายการ")}
                </Button>
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
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={GetIntlMessages("ส่วนลดท้ายบิล (บาท)")} stringMode min={0} precision={2} name="price_discount_bill">
                                    <InputNumber style={{ width: "100%", textAlign: "end" }}
                                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        onBlur={() => onChangeDiscountBillBath()}
                                        disabled={mode === "view"}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={GetIntlMessages("ส่วนลดท้ายบิล (%)")} stringMode min={0} precision={2} name="price_discount_bill_percent">
                                    <InputNumber style={{ width: "100%", textAlign: "end" }}
                                        formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                        onBlur={() => onChangeDiscountBillPercent()}
                                        disabled={mode === "view"}
                                        max={100}
                                        min={0}
                                        addonAfter={`%`}
                                        className='ant-input-number-after-addon-20-percent'
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
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

            <Modal open={isModalCalVatOpen} footer={null} onOk={handleModalCalVatOk} onCancel={handleModalCalVatCancel}>
                <Tabs
                    defaultActiveKey="1"
                    items={[
                        {
                            label: (<span>คำนวณราคารวม/แยกภาษี</span>),
                            key: '1',
                            children: (
                                <div>
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
                                </div>
                            ),
                        },
                        {
                            label: (<span>ร่องราคา</span>),
                            key: '2',
                            children: (
                                <Table dataSource={priceArr} columns={columnsPrice} />
                            ),
                        },
                    ]} />
            </Modal>

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
                            label: (<span>สินค้า</span>),
                            key: '1',
                            children: <InventoryBalance title={"เลือกสินค้ารายการที่ " + (listIndex + 1)} callBack={callbackInventoryBalance} listIndex={listIndex} status="myData" pageId={"a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0"} minStock={1} />,
                        },
                        {
                            label: (<span>คลังสินค้า</span>),
                            key: '2',
                            disabled: true,
                            children: <ProductWarehouse title={"เลือกสินค้ารายการที่ " + (listIndex + 1)} callBack={callbackProductWarehouse} listIndex={listIndex} listData={listData} />,
                        },
                    ]}
                />
            </Modal>

            <style>
                {
                    `
                    .ant-badge{
                        width : 100%;
                    }
                    .ant-table-thead .ant-table-cell {
                        background-color: #FAFAFA;
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
export default ComponentsRoutesModalTab1ServiceAndProductV2