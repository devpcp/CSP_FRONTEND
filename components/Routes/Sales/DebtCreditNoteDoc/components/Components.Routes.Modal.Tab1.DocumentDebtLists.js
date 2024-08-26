import { Input, Table, Button, Row, Col, Form, Select, Popconfirm, InputNumber, Popover, Checkbox, Badge, AutoComplete, Divider, Space } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
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
import AddNewCodeAndName from "./Components.Routes.Modal.AddNewCodeAndName";

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
        // getMasterData()
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
            const { options_list } = form.getFieldValue()
            // console.log(`list_service_product getArrValue ${type}:>> `, list_service_product[index].warehouse_list);
            return !!options_list && isArray(options_list) ? options_list ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
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
    const debounceSelect = debounce((value, index, type) => selectItem(value, index, type), 800)
    const selectItem = (value, index) => {
        try {
            // console.log('value :>> ', value);
            const { options_list, arr_debt_list } = form.getFieldValue();
            const find = options_list.find(where => where.id === value);

            if (find) {
                arr_debt_list[index] = { ...find, list_id: value, list_name: value }
                form.setFieldsValue({ arr_debt_list })
            }
            calculateResult()
        } catch (error) {
            // console.log('error selectItem:>> ', error);
        }
    }

    const callBackNewCodeAndName = useCallback(
        (val) => {
            const { arr_debt_list } = form.getFieldValue();
            arr_debt_list[val.index] = { ...arr_debt_list[val.index], list_id: val.new_code, list_name: val.new_name }
            form.setFieldsValue({ arr_debt_list })
        },
        [],
    )

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
            title: () => GetIntlMessages("รหัสสินค้า"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) => (
                isFieldEditing.status && isFieldEditing.index === index && isFieldEditing.type === "code" ?
                    <>
                        <Form.Item style={{ margin: 0 }} name={['arr_debt_list', index, "list_id"]}>
                            <Select
                                ref={refShopStockIdCode}
                                showSearch
                                onSelect={(value) => selectItem(value, index)}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider
                                            style={{
                                                margin: '8px 0',
                                            }}
                                        />
                                        <Space
                                            style={{
                                                padding: '0 8px 4px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <AddNewCodeAndName callBack={callBackNewCodeAndName} index={index} />
                                            {/* <Input
                                      placeholder="Please enter item"
                                      ref={inputRefCode}
                                      value={newCode}
                                      onChange={onChangeNewCode}
                                      onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <Button type="text" icon={<PlusOutlined />} onClick={(value)=>addItemCode(value ,index)}>
                                        เพิ่มรหัสใหม่
                                    </Button> */}
                                        </Space>
                                    </>
                                )}
                            >
                                {/* {getArrValue().map((e, idnex) => (<Select.Option key={`list-id-${index}-${e?.id}`} value={e?.id}>{console.log('e :>> ', e)}</Select.Option>))} */}
                                {getArrValue().map((e, idnex) => (<Select.Option key={`list-id-${index}-${e?.id}`} value={e?.id}>{e?.ShopTemporaryDeliveryOrderDoc?.code_id ?? e?.details?.meta_data?.ShopProduct?.Product?.master_path_code_id ?? null}</Select.Option>))}
                            </Select>
                        </Form.Item>
                    </>
                    :
                    <>
                        <div onClick={() => mode !== "view" ? toggleEdit(index, "code") : null}
                            className={mode !== "view" ? "editable-cell-value-wrap" : null}
                            style={{
                                paddingRight: 24,
                                textAlign: "start"
                            }}
                        >
                            {displayData(record, "master_path_code_id") ?? "ค้นหา"}
                        </div>
                    </>
            )

        },
        {
            title: () => GetIntlMessages("ชื่อสินค้า"),
            dataIndex: '',
            key: '',
            width: 200,
            align: "center",
            render: (text, record, index) => (
                isFieldEditing.status && isFieldEditing.index === index && isFieldEditing.type === "name" ?
                    <>
                        <Form.Item style={{ margin: 0 }} name={['arr_debt_list', index, "list_name"]}>

                            {/* <Form.Item style={{ margin: 0 }} name={['arr_debt_list', index, "list_id"]}> */}
                            <Select
                                ref={refShopStockIdName}
                                showSearch
                                onSelect={(value) => selectItem(value, index)}
                                dropdownRender={(menu) => (
                                    <>
                                        {menu}
                                        <Divider
                                            style={{
                                                margin: '8px 0',
                                            }}
                                        />
                                        <Space
                                            style={{
                                                padding: '0 8px 4px',
                                                display: 'flex',
                                                flexDirection: 'column'
                                            }}
                                        >
                                            <AddNewCodeAndName callBack={callBackNewCodeAndName} index={index} />
                                            {/* <Input
                                      placeholder="Please enter item"
                                      ref={inputRefName}
                                      value={newName}
                                      onChange={onChangeNewName}
                                      onKeyDown={(e) => e.stopPropagation()}
                                    />
                                    <Button type="text" icon={<PlusOutlined />} onClick={addItemName}>
                                        เพิ่มรหัสใหม่
                                    </Button> */}
                                        </Space>
                                    </>
                                )}
                            >
                                {getArrValue().map((e, idnex) => (<Select.Option key={`list-name-${index}-${e?.id}`} value={e?.id}>{e.details?.meta_data?.Product?.product_name?.[locale.locale ?? null] ?? e?.details?.meta_data?.ShopProduct?.Product?.product_name[locale.locale ?? null] ?? null}</Select.Option>))}
                            </Select>
                        </Form.Item>
                    </>
                    :
                    <>
                        <div onClick={() => mode !== "view" ? toggleEdit(index, "name") : null}
                            className={mode !== "view" ? "editable-cell-value-wrap" : null}
                            style={{
                                paddingRight: 24,
                                textAlign: "start"
                            }}
                        >
                            {displayData(record, "product_name") ?? "ค้นหา"}
                        </div>
                    </>
            )

        },
        {
            title: () => GetIntlMessages("ราคาต่อหน่วย"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item key={`price-unit-${index}`} style={{ margin: 0 }} name={["arr_debt_list", index, "price_unit"]}>
                        <InputNumber
                            disabled={mode === "view"}
                            step="1" 
                            stringMode 
                            precision={2}
                            style={{ width: "100%" }}
                            formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "price_unit")} />
                    </Form.Item>
                </>
            )
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("จำนวน"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",
            render: (text, record, index) => (
                <>
                    <Form.Item rules={[RegexMultiPattern(), RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]} key={`amount-${index}`} style={{ margin: 0 }} name={["arr_debt_list", index, "amount"]}>
                        <InputNumber disabled={mode === "view"} stringMode style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} onBlur={(value) => calculateTable(takeOutComma(value.target.value), index, "amount")} />
                    </Form.Item>
                </>
            )
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("รวมเงิน"),
            dataIndex: '',
            key: '',
            width: 100,
            align: "center",

            render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
        },
        {
            title: () => GetIntlMessages("หมายเหตุ"),
            dataIndex: '',
            key: '',
            width: 50,
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
                            {/* <Badge dot={!!form.getFieldValue("list_service_product")[index]?.remark ? `show` : null}> */}
                            <Button icon={<FormOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} />
                        </Badge>
                    </Popover>
                </>
            )
            // render: (text, record) => <div style={{ textAlign: "end" }}>{RoundingNumber(Number(record.price_grand_total)) ?? "-"}</div>,
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
            title: () => GetIntlMessages("จัดการ"),
            dataIndex: '',
            key: '',
            width: 50,
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
            // console.log('value :>> ', value);
            // console.log('index :>> ', index);
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
                    const { arr_debt_list } = form.getFieldsValue();

                    delete arr_debt_list[index]
                    const arr = arr_debt_list.filter(where => !!where)
                    form.setFieldsValue({ arr_debt_list: arr })
                    calculateResult()
                }
            })

        } catch (error) {
            // console.log('error handleAddDebtDoc:>> ', error);
        }
    }

    const displayData = (record, type) => {
        try {
            // console.log('record :>> ', record);
            const { options_list } = form.getFieldValue();

            const { list_id, list_name } = record;
            if (!!options_list && isArray(options_list) && options_list.length > 0) {
                const find = options_list.find(where => where.id === list_id)

                if (isPlainObject(find)) {
                    switch (type) {
                        case "master_path_code_id":
                            return find?.details?.meta_data?.ShopProduct?.Product?.[type] ?? find.details.meta_data.Product[type]
                        case "product_name":
                            return find?.details?.meta_data?.ShopProduct?.Product?.[type]?.[locale.locale] ?? find?.details?.meta_data.Product[type][locale.locale]

                        default:
                            break;
                    }
                } else {
                    switch (type) {
                        case "master_path_code_id":
                            return record.list_id
                        case "product_name":
                            return record.list_name

                        default:
                            break;
                    }
                }
            } else {
                switch (type) {
                    case "master_path_code_id":
                        return record.list_id
                    case "product_name":
                        return record.list_name

                    default:
                        break;
                }
            }
            // const { shop_stock_id, shop_stock_list } = record
            // if (!!shop_stock_list && isArray(shop_stock_list) && shop_stock_list.length > 0) {
            //     const find = shop_stock_list.find(where => where.id === shop_stock_id)
            //     if (isPlainObject(find)) {
            //         switch (type) {
            //             case "master_path_code_id":
            //                 return find.ShopProduct.Product[type]
            //             case "product_name":
            //                 return find.ShopProduct.Product[type][locale.locale]

            //             default:
            //                 break;
            //         }
            //     }
            // }
        } catch (error) {
            // console.log('error displayData :>> ', error);
        }
    }

    const debounceListProductRemark = debounce((value, index) => handleListProductRemark(value, index), 400)
    const handleListProductRemark = (value, index) => {
        try {
            // console.log('value :>> ', value);

            const { arr_debt_list } = form.getFieldValue()
            const remark = !!value ? value : null
            arr_debt_list[index].remark = remark
            form.setFieldsValue({ arr_debt_list })
        } catch (error) {
            // console.log('error handleChangeName:>> ', error);
        }
    }
    const debounceChangedName = debounce((value, index) => handleChangeName(value, index), 800)
    const handleChangeName = (value, index) => {
        try {
            // console.log('value :>> ', value);
            const { list_service_product } = form.getFieldValue()
            list_service_product[index].changed_name = value
            form.setFieldsValue({ list_service_product })
            // form.setFieldsValue({ list_service_product , [index] : {changed_name} })
        } catch (error) {
            // console.log('error handleChangeName:>> ', error);
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

    const debounceSearchOptionsList = debounce((value, index, type) => handleSearchOptionsList(value, index, type), 800)
    const handleSearchOptionsList = async (value, index, type) => {
        try {
            setLoadingSearch(true)
            const { list_service_product } = form.getFieldValue()
            switch (type) {
                case "search":
                    const { data } = await API.get(`/shopStock/all?search=${value}&limit=10&page=1&sort=balance_date&order=asc&status=active&filter_wyz_code=false&filter_available_balance=false&min_balance=1`)
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
            // console.log('error :>> ', error);
        }
    }

    const callbackSelectProduct = (value, index1, index2, amount, rowIndex) => {
        try {
            let product_cost
            const { list_service_product } = form.getFieldValue(),
                { product_list, product_cost_product_stocks } = value,
                selectedProduct = product_list[index1].warehouse_detail[index2];
            const suggestedPrice = list_service_product[rowIndex]["shop_stock_list"].find(where => where.id === list_service_product[rowIndex]["shop_stock_id"]).ShopProduct?.price?.suggasted_re_sell_price?.retail ?? null
            if (!!selectedProduct["dot_mfd"]) {
                product_cost = !!product_cost_product_stocks ? product_cost_product_stocks.find(where => selectedProduct["warehouse"] === where.shop_warehouse_id && selectedProduct["shelf"] === where.shop_warehouse_shelf_item_id && selectedProduct["dot_mfd"] === where.dot_mfd && selectedProduct["purchase_unit_id"] === where.purchase_unit_id)?.product_cost_latest ?? null : null
            } else {
                product_cost = !!product_cost_product_stocks ? product_cost_product_stocks.find(where => selectedProduct["warehouse"] === where.shop_warehouse_id && selectedProduct["shelf"] === where.shop_warehouse_shelf_item_id && selectedProduct["purchase_unit_id"] === where.purchase_unit_id)?.product_cost_latest ?? null : null
            }

            let dot_mfd_list = [], warehouse_list = [], shelf_list = [], purchase_unit_list = []
            dot_mfd_list = takeOutDuplicateValue(product_list[index1].warehouse_detail, "dot_mfd")
            purchase_unit_list = product_list[index1].unit_list

            warehouse_list = shopWarehouseAllList.filter(where => where.id === selectedProduct["warehouse"])
            shelf_list = warehouse_list[0]["shelf"].filter(where => where.code === selectedProduct["shelf"])

            list_service_product[rowIndex]["price_unit"] = !!suggestedPrice ? suggestedPrice.toFixed(2) : null
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


            form.setFieldsValue({
                list_service_product,
                [rowIndex]: {
                    amount,
                    dot_mfd: selectedProduct["dot_mfd"] ?? "-",
                    purchase_unit_id: selectedProduct["purchase_unit_id"] ?? null,
                    price_unit: !!suggestedPrice ? suggestedPrice.toFixed(2) : null,
                    warehouse: selectedProduct["warehouse"],
                    shelf: selectedProduct["shelf"]
                }
            })
            calculateTable()
            calculateResult()
        } catch (error) {
            // console.log('error callbackSelectProduct:>> ', error);
        }
    }

    const calculateTable = (value, index, type) => {
        try {
            console.log('value calculateTable:>> ', value);
            const { arr_debt_list } = form.getFieldValue();

            // const price_unit = arr_debt_list[index]["price_unit"] , price_discount = arr_debt_list[index]["price_discount"]

            let price_grand_total = 0, amount = 0, price_discount = 0, price_discount_percent = 0, price_unit = 0, price_discount_bill = 0
            switch (type) {
                case "price_unit":
                    price_unit = Number(value)
                    amount = Number(arr_debt_list[index]["amount"] ?? 0)
                    price_discount = null
                    price_discount_percent = null
                    // price_discount = Number(arr_debt_list[index]["price_discount"] ?? 0)
                    // price_discount_percent = Number(arr_debt_list[index]["price_discount_percent"] ?? 0)
                    // price_discount = price_unit * (price_discount_percent/100)
                    price_grand_total = (price_unit - price_discount) * amount

                    arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    arr_debt_list[index]["price_unit"] = price_unit.toFixed(2)
                    arr_debt_list[index]["price_discount"] = null
                    arr_debt_list[index]["price_discount_percent"] = null
                    // console.log('price_grand_total :>> ', price_grand_total);
                    break;
                case "amount":
                    price_unit = Number(arr_debt_list[index]["price_unit"] ?? 0)
                    amount = Number(value)
                    price_discount = Number(arr_debt_list[index]["price_discount"] ?? 0)
                    price_discount_percent = Number(arr_debt_list[index]["price_discount_percent"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount
                    console.log('price_grand_total :>> ', price_grand_total);
                    arr_debt_list[index]["price_grand_total"] = price_grand_total.toFixed(2)
                    arr_debt_list[index]["amount"] = amount.toString()
                    // console.log('price_grand_total :>> ', price_grand_total);
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
                        // form.setFieldsValue({ [index]: { price_discount: null, price_discount_percent: null } })
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

    const handleAddArrDebtList = () => {
        try {
            const { arr_debt_list } = form.getFieldValue();
            let newArr = []
            newArr = (!!arr_debt_list) ? [...arr_debt_list, {}] : [{}]

            form.setFieldsValue({ arr_debt_list: newArr })
        } catch (error) {
            // console.log('error :>> ', error);
        }
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
                    {/* <AddDebtList style={{
                        marginBottom: 16,
                        display: "flex",
                        alignItems: "center",
                    }}
                        callBackDebtorDocList={callBackDebtorDocList}
                        calculateResult={calculateResult}
                        initForm={form}
                        mode={mode}
                        hiddenAddBtn
                    /> */}
                </>

            </Row>

            <Form.Item name={`arr_debt_list`} hidden />

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={columns}
                    // dataSource={Form.useWatch("arr_debt_list", form)}
                    // dataSource={form.getFieldValue("arr_debt_list")}
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
                        </Form.Item> */}
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
                        {/* <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="price_grand_total">
                            <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                                formatter={(value) => !!value ? formatNumber(value) : ""}
                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            /> */}
                        <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="price_grand_total">
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