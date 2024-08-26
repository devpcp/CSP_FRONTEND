import { EditOutlined, DeleteOutlined, FormOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Row, Col, Select, Table, InputNumber, Popover, Popconfirm } from 'antd'
import { debounce, get, isArray, isPlainObject, set } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import API from '../../../../../../util/Api'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import { RoundingNumber, takeOutComma } from '../../../../../shares/ConvertToCurrency'
import SortingData from '../../../../../shares/SortingData'
import ModalViewShopStock from '../../../../ModalViewShopStock'

const ComponentsRoutesModalTab1ServiceAndProduct = () => {
    const form = Form.useFormInstance()

    const [loadingSearchShopStock, setLoadingSearchShopStock] = useState(false)
    const [listServiceProduct, setListServiceProduct] = useState([])
    const [columns, setColumns] = useState([])
    const [tableIndex, setTableIndex] = useState(0)

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { productType } = useSelector(({ master }) => master);

    useEffect(() => {
        setColumnsTable();
        setListServiceProduct(()=>form.getFieldValue("list_sevice_product"));
    }, [])

    // const isModalVisible = form.getFieldValue(["isModalVisible"])
    const isModalVisible = Form.useWatch("isModalVisible", { form, preserve: true })
    useEffect(() => {
        if (isModalVisible) setListServiceProduct(() => []), setTableIndex(0), setEditing(false)
    }, [isModalVisible])


    const getArrValue = (type, index) => {
        try {
            const watchData = Form.useWatch(`list_service_product`, { form, preserve: true })
            return !!watchData && isArray(watchData) && watchData.length > 0 ? watchData[index][type] ?? [] : []
        } catch (error) {
            // console.log('error getArrValue :>> ', error);
        }
    }

    const checkProductType =(typeId)=>{
        try {
            const find = productType.find(where => where.id === typeId)
            if(isPlainObject(find)){

            }
        } catch (error) {
            
        }
    }

    const delList = (index) => {
        try {
            const { list_service_product } = form.getFieldValue()
            // console.log('list_service_product :>> ', list_service_product);
            list_service_product.splice(index, 1)
            for (let i = 0; i < list_service_product.length; i++) {
                // const find = list_service_product[i]["shop_stock_list"].find(where => where.id === list_service_product[i]["shop_stock_id"])
                // let isTire = false , isBattery = false
                // if(isPlainObject(find)){
                //     //da791822-401c-471b-9b62-038c671404ab -> type_group_id -> ยาง
                //     // find.ShopProduct.Product.ProductType?.type_group_id === "da791822-401c-471b-9b62-038c671404ab"
                //     switch (find.ShopProduct.Product.ProductType?.type_group_id) {
                //         case "da791822-401c-471b-9b62-038c671404ab":
                //             isTire = true
                //             break;
                    
                //         default: 
                //         isTire = false
                //         isBattery = false
                //             break;
                //     }
                // }
                form.setFieldsValue({ [i]: {...list_service_product[i] , key : i} })
            }
            delete form.getFieldValue()[list_service_product.length]
            list_service_product = list_service_product.map((e,index)=> ({...e , key : index}))
            form.setFieldsValue({ list_service_product })
            // console.log('form.getFieldValue() :>> ', form.getFieldValue());
            setColumnsTable()
        } catch (error) {
            // console.log('error delList :>> ', error);
        }
    }

    const setColumnsTable = () => {
        // console.log(`เข้าป่ะวะ setColumnsTable`);
        const _column = [];
        _column.push(
            {
                title: () => GetIntlMessages("ลำดับ"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: "3%",
                editable: false,
                inputType: "text",
                render: (text, record, index) => {
                    // index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: () => "ชื่อสินค้า",
                dataIndex: 'shop_stock_id',
                // dataIndex: [list_service_product.length - 1,'shop_stock_id'],
                // key: '',
                width: "20%",
                // width: 120,
                align: "center",
                editable: true,
                inputType: "select",
                // shouldCellUpdate: (record, prevRecord) => prevRecord.shop_stock_id !== record.shop_stock_id,
                // shouldCellUpdate : (record, prevRecord)=> form.getFieldValue(`list_service_product`)[record.key].shop_stock_list.length > 0 ? true : false ,
                // shouldCellUpdate : (record, prevRecord)=> Form.useWatch(`list_service_product`, {form , preserve : true})[record.key].shop_stock_list.length > 0 ,
            },
            {
                title: () => "คลังสินค้า",
                dataIndex: '',
                // key: '',
                width: "7%",
                // width: 50,
                align: "center",
                editable: false,
                inputType: "button",
                render: (text, record, index) => {
                    return (
                        <ModalViewShopStock shopStockId={record.shop_stock_id} rowIndex={index} dropDownBtnWarehouse callbackSelectProduct={callbackSelectProduct} />
                    )
                }
            },
            {
                title: () => "ราคาทุน",
                dataIndex: 'product_cost',
                // key: '',
                width: "6%",
                // width: 100,
                align: "center",
                editable: false,
                inputType: "text",
                render : (record, text,index) => <div>{get(record,`product_cost`, "-")}</div>
            },
            {
                title: () => "ราคา/หน่วย",
                dataIndex: 'price_unit',
                // key: '',
                width: "12%",
                // width: 100,
                align: "center",
                editable: true,
                inputType: "inputNumber",
            },
            {
                title: () => GetIntlMessages("DOT/MFD"),
                dataIndex: "dot_mfd",
                // key: "dot_mfd",
                editable: true,
                inputType: "select",
                width: "6%"
                // width: 60
            },
            {
                title: () => GetIntlMessages("คลัง/ชั้นวาง"),
                dataIndex: ["warehouse", "shelf"],
                // key: "dot_mfd",
                editable: true,
                inputType: "select",
                width: "15%"
                // width: 120
            },
            {
                title: () => GetIntlMessages("จำนวนสินค้าคงเหลือ"),
                dataIndex: "balance",
                // key: "dot_mfd",
                editable: false,
                inputType: "text",
                align: "center",
                width: "5%",
                render: (text, record) => text ?? "-"
                // width: 120
            },
            {
                title: () => GetIntlMessages("จำนวน/หน่วยซื้อ"),
                dataIndex: ["amount", "purchase_unit_id"],
                // key: "dot_mfd",
                editable: true,
                inputType: "select",
                width: "12%"
                // width: 80
            },
            {
                title: () => GetIntlMessages("ส่วนลด (บาท) / ส่วนลด (%)"),
                dataIndex: ["price_discount", "price_discount_percent"],
                // key: "dot_mfd",
                editable: true,
                inputType: "inputNumber",
                width: "10%",
                // width: 80
            },
            {
                title: () => GetIntlMessages("รวมเงิน(บาท)"),
                dataIndex: "price_grand_total",
                // key: "dot_mfd",
                // editable: false,
                inputType: "text",
                width: "10%",
                render : (record, text,index) => <div>{getValue(index , "price_grand_total") ?? "-"}</div>
                // align : "right"
                // width: 10
            },
            {
                title: () => GetIntlMessages("remark"),
                dataIndex: "each_remark",
                // key: "dot_mfd",
                editable: true,
                inputType: "inputNumber",
                width: "5%"
                // width: 10
            },
            {
                title: () => GetIntlMessages("manage"),
                // dataIndex: ["edit_btn", "del_btn"],
                dataIndex: "manage",
                // key: "dot_mfd",
                editable: false,
                inputType: "button",
                width: "5%",
                render: (_, record, index) =>
                    listServiceProduct.length >= 0 ? (
                        <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => delList(index)}>
                            <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                        </Popconfirm>
                    ) : null,

            },
        )

        _column = _column.map((col) => {
            // console.log('col :>> ', col);
            const { dataIndex } = col
            // if (!col.editable) {
            //     return col;
            // }

            return {
                ...col,
                onCell: (record, rowIndex) => {
                    const model = {
                        record,
                        editable: col.editable,
                        title: col.title,
                        inputType: col.inputType,
                        rowIndex,
                        // handleSave,
                        handleSearchShopStock
                    }
                    if (isArray(dataIndex)) {
                        model.dataIndex = [rowIndex, ...dataIndex]
                    } else if (dataIndex !== "shop_stock_id" && dataIndex !== "price_grand_total" && dataIndex !== "product_cost") {
                        model.dataIndex = [rowIndex, dataIndex]
                    } else {
                        model.dataIndex = dataIndex
                    }

                    // console.log('model :>> ', model);
                    return {
                        ...model
                    }

                },
            };
        });

        setColumns(_column)
    }

    const getValue = (index , type)=>{
        try {
            const {list_service_product} = form.getFieldValue()
            return !!list_service_product?.[index][type] ? list_service_product?.[index][type] ?? null : null
        } catch (error) {
            
        }
    }

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

    const defaultPurchaseUnit = (arr, uuid) => {
        try {
            // 103790b2-e9ab-411b-91cf-a22dbf624cbc -> ยาง (เส้น)
            const find = arr.find(where => where.id === uuid)
            if (isPlainObject(find)) {
                return find.id
            } else {
                null
            }
        } catch (error) {

        }
    }



    const callbackSelectProduct = (value, index1, index2, amount, rowIndex) => {
        try {
            // console.log('value callbackSelectProduct:>> ', value);
            // console.log('index1 callbackSelectProduct:>> ', index1);
            // console.log('index2 callbackSelectProduct:>> ', index2);
            // console.log('amount callbackSelectProduct:>> ', amount);
            // console.log('rowIndex callbackSelectProduct:>> ', rowIndex);
            const { product_list } = value
            const selectedProduct = product_list[index1].warehouse_detail[index2]
            let dot_mfd_list = [], warehouse_list = [], shelf_list = [], purchase_unit_list = []

            dot_mfd_list = takeOutDuplicateValue(product_list[index1].warehouse_detail, "dot_mfd")
            purchase_unit_list = product_list[index1].unit_list

            const { list_service_product } = form.getFieldValue()
            if (!!amount) {
                list_service_product[rowIndex][`dot_mfd`] = selectedProduct[`dot_mfd`]
                list_service_product[rowIndex][`dot_mfd_list`] = dot_mfd_list ?? []
                list_service_product[rowIndex][`purchase_unit_id`] = selectedProduct[`purchase_unit_id`]
                list_service_product[rowIndex][`purchase_unit_list`] = purchase_unit_list ?? []
                list_service_product[rowIndex][`balance`] = selectedProduct[`amount`]
                list_service_product[rowIndex][`amount`] = amount
                // list_service_product[rowIndex][`price_discount`] = null
                // list_service_product[rowIndex][`price_discount_percent`] = null

                form.setFieldsValue(
                    {
                        list_service_product,
                        [rowIndex]: {
                            dot_mfd: selectedProduct[`dot_mfd`] ?? "-",
                            balance: selectedProduct[`amount`].toLocaleString(),
                            amount,
                            // price_discount : null,
                            // price_discount_percent : null,
                            purchase_unit_id: !!selectedProduct[`purchase_unit_id`] ? selectedProduct[`purchase_unit_id`] : defaultPurchaseUnit(purchase_unit_list, "103790b2-e9ab-411b-91cf-a22dbf624cbc")
                        }
                    }
                )

                calculateInTable(rowIndex, amount, "amount")
            }
            setColumnsTable()
            // console.log('form.getFieldValue() callbackSelectProduct :>> ', form.getFieldValue());
        } catch (error) {

        }
    }

    const handleAdd = () => {
        try {
            const { list_service_product } = form.getFieldValue()

            const newData = {
                // key: listServiceProduct.length,
                key: list_service_product.length,
                shop_stock_id: "ค้นหาสินค้า",
                shop_stock_list: [],
                price_unit: null,
                price_discount: null,
                price_discount_percent: null,
                price_grand_total: null,
                dot_mfd: null,
                dot_mfd_list: [],
                purchase_unit_id: null,
                purchase_unit_list: [],
                warehouse: null,
                shelf: null,
                // [`shop_stock_id_${tableIndex}`] : null
            };

            form.setFieldsValue({ list_service_product: !!list_service_product ? [...list_service_product, newData] : [newData] })

            // setListServiceProduct([...listServiceProduct, newData]);
            // setListServiceProduct((prevValue) => !!prevValue ? [...prevValue, newData] : [...newData]);
            // setTableIndex((prevValue) => prevValue + 1);
            // if (isArray(form.getFieldValue("list_service_product")) && form.getFieldValue("list_service_product").length >= 0) {
            //     form.getFieldValue("list_service_product").forEach((e, index) => {
            //         form.setFieldValue(`shop_stock_list_${index}`, [])
            //     })
            // }
            setColumnsTable()
            // console.log('form.getFieldValue() :>> ', form.getFieldValue());
        } catch (error) {
            console.log('error handleAdd:>> ', error);
        }

    };

    const EditableRow = ({ index, ...props }) => {
        return (
            <Form form={form} component={false}>
                {/* <EditableContext.Provider value={form}> */}
                <tr {...props} />
                {/* </EditableContext.Provider> */}
            </Form>
        );
    };

    // const [editing, setEditing] = useState(false);
    const [editing, setEditing] = useState({ status: false, rowIndex: null });
    const RefShopStockId = useRef(null);

    useEffect(() => {
        if (editing.status) {
            // console.log('Ref :>> ', Ref);
            // console.log('editing :>> ', editing);
            RefShopStockId.current.focus();
        }
    }, [editing.status]);

    const EditableCell = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        handleSearchShopStock,
        inputType,
        rowIndex,
        ...restProps
    }) => {
        try {
            // console.log('title :>> ', title);
            // console.log('editable :>> ', editable);
            // console.log('col EditableCell:>> ', col);
            // console.log('dataIndex :>> ', dataIndex);
            // console.log('subChildren :>> ', subChildren);
            // console.log('rowIndex :>> ', rowIndex);
            // console.log('record EditableCell :>> ', record);
            // console.log('restProps :>> ', restProps);
            // console.log('inputType :>> ', inputType);
            // console.log('title :>> ', title);
            // const form = useContext(EditableContext);
            // console.log('children :>> ', children);
            const toggleEdit = () => {
                setEditing((prevValue) => ({ status: !prevValue.status, rowIndex }));
                let returnValue
                switch (dataIndex) {
                    case "shop_stock_id":
                        returnValue = record[dataIndex] !== "ค้นหาสินค้า" ? record[dataIndex] ?? null : null
                    default:
                        break;
                }
                // console.log('returnValue :>> ', returnValue);
                form.setFieldsValue({
                    [dataIndex]: returnValue,
                });
            };
            const save = async (value, fieldName) => {
                try {
                    const values = await form.validateFields();
                    // console.log('values :>> ', values);
                    toggleEdit();
                    handleSearchShopStock(value, rowIndex, "select", fieldName)

                } catch (errInfo) {
                    // console.log('Save failed:', errInfo);
                }
            };


            let childNode = children;
            // console.log(`children ${dataIndex}:>> `, children);
            // console.log('dataIndex :>> ', dataIndex);
            // const {list_service_product} = dataIndex
            // console.log('list_service_product :>> ', dataIndex?.list_service_product);

            if (editable) {
                // switch (dataIndex[1]) {
                // console.log(`record[dataIndex[1] ${dataIndex[1]} :>> `, record[dataIndex[1]])
                if (!isArray(dataIndex)) {
                    switch (dataIndex) {
                        case "shop_stock_id":
                            // if (editing) {
                            if (editing.status && editing.rowIndex === rowIndex) {
                                childNode = (
                                    <Form.Item name={dataIndex} style={{ margin: 0 }} validateTrigger={["onChange, onSearch", "onBlur"]}>
                                        <Select showSearch onSearch={(value) => debounceSearchShopStock(value, rowIndex, "search")}
                                            // notFoundContent={loadingSearchShopStock ? `กำลังโหลดข้อมูล...กรุญรอสักครู่...` : `ไม่พบข้อมูล`}
                                            filterOption={false}
                                            // loading={loadingSearchShopStock}
                                            autoFocus
                                            onSelect={(value) => save(value, dataIndex)}
                                            onBlur={() => setEditing((prevValue) => ({ rowIndex: null, status: !prevValue.status }))}
                                            // onSelect={(value) => handleSearchShopStock(value, rowIndex, "select")}
                                            style={{ textAlign: "start" }}
                                            // value={record[dataIndex[1]]}
                                            ref={RefShopStockId}
                                        // options={getArrValue(`shop_stock_list`, rowIndex).map((e, i) => ({ label: e.ShopProduct.Product.product_name[locale.locale] ?? "-", value: e.id }))}
                                        // options={getArrValue()[rowIndex]?.shop_stock_list.map((e, i) => ({ label: e.ShopProduct.Product.product_name[locale.locale] ?? "-", value: e.id }))}
                                        >
                                            {/* {getArrValue()[rowIndex]?.shop_stock_list.map((e, i) => (<Select.Option value={e.id} key={`shop-stock-${i}-${e.id}`}>{e.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>))} */}
                                            {getArrValue(`shop_stock_list`, rowIndex).map((e, i) => (<Select.Option value={e.id} key={`shop-stock-${i}-${e.id}`}>{e.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>))}
                                        </Select>
                                    </Form.Item>
                                )
                            } else {
                                childNode = (
                                    <div
                                        className="editable-cell-value-wrap"
                                        style={{
                                            paddingRight: 24,
                                            //   height : 40,
                                            textAlign: "start"
                                        }}
                                        onClick={() => toggleEdit(dataIndex)}
                                    >
                                        {/* {children} */}
                                        {displayName(record, "shop_stock_list", rowIndex, `ShopProduct.Product.product_name[${locale.locale}]`) ?? children}
                                    </div>
                                )
                            }
                            // childNode = <Form.Item name={dataIndex} style={{ margin: 0 }}>
                            //     <Select showSearch onSearch={(value) => debounceSearchShopStock(value, rowIndex, "search")}
                            //         // notFoundContent={loadingSearchShopStock ? `กำลังโหลดข้อมูล...กรุญรอสักครู่...` : `ไม่พบข้อมูล`}
                            //         filterOption={false}
                            //         // loading={loadingSearchShopStock}
                            //         // autoFocus
                            //         onSelect={(value) => handleSearchShopStock(value, rowIndex, "select")}
                            //         style={{ textAlign: "start" }}
                            //         // value={record[dataIndex[1]]}
                            //     >
                            //         {getArrValue(`shop_stock_list_${rowIndex}`).map((e, i) => (<Select.Option value={e.id} key={`shop-stock-${i}-${e.id}`}>{e.ShopProduct.Product.product_name[locale.locale] ?? "-"}</Select.Option>))}
                            //     </Select>
                            // </Form.Item>
                            break;

                        // case "price_unit":
                        //     // console.log('record[dataIndex] :>> ', record[dataIndex]);
                        //     // form.setFieldsValue({
                        //     //     [dataIndex]: record[dataIndex],
                        //     // });
                        //     childNode = (
                        //         <Form.Item
                        //             style={{
                        //                 margin: 0,
                        //             }}
                        //             name={dataIndex}
                        //             validateTrigger={["onChange, onSearch", "onBlur"]}
                        //         >
                        //             {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
                        //             <InputNumber stringMode
                        //                 onClick={() => toggleEdit(dataIndex)}
                        //                 // onClick={()=>setEditing((prevValue)=>({status : !prevValue.status , rowIndex ,fieldName : dataIndex}))}
                        //                 onChange={(value) => console.log('value price_unit:>> ', value)}
                        //                 onBlur={() => setEditing((prevValue) => ({ fieldName: null, rowIndex: null, status: !prevValue.status }))}
                        //                 ref={RefPrice}
                        //                 className='ant-input-number-after-addon'
                        //                 style={{ width: "100%" }}
                        //                 min={0}
                        //                 addonAfter={"บาท"}
                        //             // value={()=>Number(takeOutComma(record[dataIndex]))}
                        //             />
                        //         </Form.Item>
                        //     )
                        //     break;

                        default:
                            break;
                    }
                } else {
                    // form.setFieldsValue({
                    //     [dataIndex[1]]: record[dataIndex[1]],
                    // });
                    // setValue(record , dataIndex , rowIndex)
                    switch (dataIndex[1]) {
                        case "price_unit":
                            // form.setFieldsValue({
                            //     [rowIndex]: { [dataIndex[1]]: record[dataIndex[1]] },
                            // });

                            childNode = (
                                <Form.Item
                                    style={{
                                        margin: 0,
                                    }}
                                    name={dataIndex}
                                >
                                    {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
                                    <InputNumber className='ant-input-number-after-addon' style={{ width: "100%" }} stringMode min={0} addonAfter={"บาท"} 
                                    // onChange={(value)=>debounceCalculate(rowIndex , value ,"price_unit")}
                                    onBlur={(value)=>calculateInTable(rowIndex , value.target.value ,dataIndex[1])}
                                    />
                                </Form.Item>
                            )
                            break;
                        case "dot_mfd":
                            // form.setFieldsValue({
                            //     [rowIndex]: { [dataIndex[1]]: record[dataIndex[1]] },
                            // });
                            childNode = <Form.Item name={dataIndex} style={{ margin: 0, padding: 5 }}>
                                <Select showSearch>
                                    {/* {getArrValue()[rowIndex]?.dot_mfd_list.map((e, i) => (<Select.Option value={e ?? "-"} key={`dot-mfd-list-${i}-${e}`}>{e ?? "-"}</Select.Option>))} */}
                                    {getArrValue(`dot_mfd_list`, rowIndex).map((e, i) => (<Select.Option value={e ?? "-"} key={`dot-mfd-list-${i}-${e}`}>{e ?? "-"}</Select.Option>))}
                                </Select>
                            </Form.Item>
                            break;
                        case "warehouse":
                            childNode = <>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[1]]} style={{ margin: 0 }}>
                                            <Input placeholder='คลัง' />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[2]]} style={{ margin: 0 }}>
                                            <Input placeholder='ชั้นวาง' />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </>
                            break;
                        case "amount":
                            // form.setFieldsValue({
                            //     [rowIndex]: { [dataIndex[1]]: record[dataIndex[1]], [dataIndex[2]]: record[dataIndex[2]] },
                            // });
                            childNode = <>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[1]]} style={{ margin: 0 }}>
                                            <InputNumber className='ant-input-number-after-addon' min={0} onStep={0.01} style={{ width: "100%" }} stringMode placeholder='จำนวน' addonAfter={
                                                <>
                                                    <Form.Item noStyle name={[dataIndex[0], dataIndex[2]]}>
                                                        <Select dropdownMatchSelectWidth={false} bordered={false} size={"small"} placeholder="หน่วยซื้อ" style={{ width: 60, textAlign: "center", margin: 0, padding: 0 }}>
                                                            {/* {getArrValue()[rowIndex]?.purchase_unit_list.map((e, i) => (<Select.Option value={e.id} key={`purchase-unit-list_-${i}-${e.id}`}>{e?.type_name[locale.locale] ?? "-"}</Select.Option>))} */}
                                                            {getArrValue(`purchase_unit_list`, rowIndex).map((e, i) => (<Select.Option value={e.id} key={`purchase-unit-list_-${i}-${e.id}`}>{e?.type_name[locale.locale] ?? "-"}</Select.Option>))}
                                                        </Select>
                                                    </Form.Item>
                                                </>
                                            } 
                                            // onChange={(value)=>debounceCalculate(rowIndex , value ,"amount")}
                                            onBlur={(value)=>calculateInTable(rowIndex , value.target.value ,dataIndex[1])}
                                            />
                                            {/* <InputNumber min={0} style={{width :"100%"}} stringMode placeholder='จำนวน' /> */}
                                        </Form.Item>
                                    </Col>
                                    {/* <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[2]]} style={{ margin: 0 }}>
                                            <Select showSearch placeholder="หน่วยซื้อ" style={{ textAlign: "center" }}>
                                                {getArrValue(`purchase_unit_list_${rowIndex}`).map((e, i) => (<Select.Option value={e.id} key={`purchase-unit-list_-${i}-${e.id}`}>{e?.type_name[locale.locale] ?? "-"}</Select.Option>))}
                                            </Select>
                                        </Form.Item>
                                    </Col> */}
                                </Row>

                            </>
                            break;
                        case "price_discount":
                            // form.setFieldsValue({
                            //     [rowIndex]: { [dataIndex[1]]: record[dataIndex[1]], [dataIndex[2]]: record[dataIndex[2]] },
                            // });
                            childNode = (<>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[1]]} style={{ margin: 0 }} validateTrigger={["onChange", "onBlur"]}>
                                            <InputNumber style={{ width: "100%" }} step={"0.01"} stringMode placeholder='ส่วนลด (บาท)'
                                                onChange={(value) => discountConverter(value, rowIndex, "bath", "onChange")}
                                                onBlur={(value) => discountConverter(value.target.value, rowIndex, "bath", "onBlur")}
                                                formatter={(value) => Number(value).toLocaleString(undefined, { minimumFractionDigits : 2,maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
                                                // formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                precision={2}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item name={[dataIndex[0], dataIndex[2]]} style={{ margin: 0 }}>
                                            <InputNumber style={{ width: "100%" }} step={"0.01"} stringMode placeholder='ส่วนลด (%)'
                                                onChange={(value) => discountConverter(value, rowIndex, "percent", "onChange")}
                                                onBlur={(value) => discountConverter(value.target.value, rowIndex, "percent", "onBlur")}
                                                formatter={(value) => Number(value).toLocaleString(undefined, { minimumFractionDigits : 2,maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',') }
                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                            </>)
                            break;
                        case "each_remark":
                            // form.setFieldsValue({
                            //     [rowIndex]: { [dataIndex[1]]: record[dataIndex[1]] },
                            // });
                            childNode = (
                                <Popover content={
                                    <>
                                        <Form.Item name={dataIndex} style={{ margin: 0 }}>
                                            <Input.TextArea rows={10} />
                                        </Form.Item>
                                    </>
                                } trigger="click">
                                    <Button icon={<FormOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} />
                                </Popover>)
                            break;
                        case "edit_btn":
                            childNode = <>
                                <Row gutter={[10, 10]}>
                                    <Col span={24}>
                                        <Button icon={<EditOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} />
                                    </Col>
                                    <Col span={24}>
                                        {/* <Button onClick={() => delList(rowIndex)} icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} /> */}
                                    </Col>
                                </Row>

                            </>
                            break;



                        default:
                            break;
                    }
                }


            } else {
                let style
                // console.log('dataIndex div :>> ', dataIndex);
                // console.log('children div :>> ', children);
                // console.log('record div :>> ', record);
                switch (dataIndex) {
                    case "price_grand_total":
                        style = { width: "100%", textAlign: 'right' ,fontSize : "1rem" }
                        break;
                    case "product_cost":
                        style = { width: "100%", textAlign: 'right' ,fontSize : "1rem" }
                        break;

                    default: style = {}
                        break;
                }
                childNode = (<div
                    // className="editable-cell-value-wrap"
                    // style={{
                    //     paddingRight: 24,
                    // }}
                    // onClick={toggleEdit}
                    style={style}
                >
                    {children}
                </div>)
            }
            return <td {...restProps}>{childNode}</td>;
        } catch (error) {
            // console.log('error :>> ', error);
        }

    };

    const displayName = (value, fieldName, index, location) => {
        try {
            const returnValue = get(form.getFieldValue(`list_service_product`)[index]?.[fieldName].find(where => where.id === value.shop_stock_id), `${location}`, null)

            return returnValue ?? null
        } catch (error) {
            // console.log('error displayName :>> ', error);
        }
    }



    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    // const customColumns = columns.map((col) => {
    //     // console.log('col :>> ', col);
    //     const { dataIndex } = col
    //     // if (!col.editable) {
    //     //     return col;
    //     // }

    //     return {
    //         ...col,
    //         onCell: (record, rowIndex) => {
    //             const model = {
    //                 record,
    //                 editable: col.editable,
    //                 title: col.title,
    //                 inputType: col.inputType,
    //                 rowIndex,
    //                 // handleSave,
    //                 handleSearchShopStock
    //             }
    //             if (isArray(dataIndex)) {
    //                 model.dataIndex = [rowIndex, ...dataIndex]
    //             } else if (dataIndex !== "shop_stock_id" && dataIndex !== "price_grand_total") {
    //                 model.dataIndex = [rowIndex, dataIndex]
    //             } else {
    //                 model.dataIndex = dataIndex
    //             }

    //             // console.log('model :>> ', model);
    //             return {
    //                 ...model
    //             }

    //         },
    //     };
    // });
    // console.log('columnsTest :>> ', columnsTest);
    const debounceSearchShopStock = debounce((value, index, type) => handleSearchShopStock(value, index, type), 800)
    const handleSearchShopStock = async (value, index, type) => {
        try {
            // setLoadingSearchShopStock(true)
            const { list_service_product } = form.getFieldValue()
            switch (type) {
                case "search":
                    if (!!value) {
                        const { data } = await API.get(`/shopStock/all?search=${value}&limit=10&page=1&sort=balance_date&order=asc&status=active&filter_wyz_code=false&filter_available_balance=false&min_balance=1`)
                        // console.log('data :>> ', data);
                        if (data.status === "success") {
                            list_service_product[index].shop_stock_list = SortingData(data.data.data, `ShopProduct.Product.product_name.${locale.locale}`)
                            form.setFieldsValue({ list_service_product })
                        }
                    }

                    break;
                case "select":
                    if (!!value) {
                        setLoadingSearchShopStock(true)
                        // const { list_service_product } = form.getFieldValue(), shopStockList = form.getFieldValue(`shop_stock_list_${index}`)
                        const find = list_service_product[index].shop_stock_list.find(where => where.id === value)
                        // console.log('find :>> ', find);
                        const suggestedPrice = RoundingNumber(find.ShopProduct.price.suggasted_re_sell_price?.retail) ?? null
                        let dot_mfd_list = []
                        dot_mfd_list = takeOutDuplicateValue(find.warehouse_detail, "dot_mfd")
                        list_service_product[index].shop_stock_id = value
                        list_service_product[index].price_unit = suggestedPrice
                        list_service_product[index].dot_mfd = dot_mfd_list.length === 1 ? dot_mfd_list[0] ?? "-" : null
                        list_service_product[index].dot_mfd_list = dot_mfd_list
                        form.setFieldsValue({
                            list_service_product,
                            [index]: {
                                price_unit: suggestedPrice,
                                dot_mfd: dot_mfd_list.length === 1 ? dot_mfd_list[0] ?? "-" : null,
                                purchase_unit_id: null,
                                balance: null,
                                amount: null,
                                price_discount: null,
                                price_discount_percent: null,
                            },
                        })
                        const model = {
                            shop_stock_id : value,
                            price_unit : suggestedPrice,
                            dot_mfd : dot_mfd_list.length === 1 ? dot_mfd_list[0] ?? "-" : null,
                            dot_mfd_list : dot_mfd_list
                        }
                        // setListServiceProduct((prevValue) => [...prevValue , prevValue[index] = model])
                        // setColumnsTable()
                        setLoadingSearchShopStock(false)
                    }

                    break;

                default:
                    break;
            }

            // console.log('form.getFieldValue() handleSearchShopStock:>> ', form.getFieldValue());
        } catch (error) {
            // console.log('error  handleSearchShopStock:>> ', error);
        }
    }

    /* Calculate */
    const discountConverter = (value, index, type, method) => {
        try {
            // console.log('value :>> ', value);
            // console.log('type :>> ', type);
            const { list_service_product } = form.getFieldValue()
            const price_unit = Number(takeOutComma(list_service_product[index]?.price_unit) ?? 0), newValue = Number(takeOutComma(value) ?? 0), amount = Number(takeOutComma(list_service_product[index]?.amount) ?? 0)
            // const newValue = Number(takeOutComma(value) ?? 0) 
            // console.log('newValue :>> ', newValue);
            let result
            switch (type) {
                case "bath":
                    // result = RoundingNumber(((newValue / price_unit) * 100)) //แปลงเป็น %
                    result = ((newValue / price_unit) * 100) //แปลงเป็น %
                    // console.log('result :>> ', result);
                    switch (method) {
                        case "onChange":
                            if (form.getFieldValue()[index]?.old_discount_bath !== Number(newValue)) {
                                form.setFieldsValue({ [index]: { price_discount_percent: result, old_discount_bath: Number(newValue) } })
                            } else {
                                form.setFieldsValue({[index]: { price_discount: newValue, price_discount_percent: result, old_discount_bath: Number(newValue) } })
                            }
                            break;
                        case "onBlur":
                            list_service_product[index]["price_discount"] = newValue
                            list_service_product[index]["price_discount_percent"] = result
                            form.setFieldsValue({list_service_product,[index]: { price_discount: newValue, price_discount_percent: result, old_discount_bath: Number(newValue) } })
                            calculateInTable(index, newValue , "price_discount")
                            setColumnsTable()
                            break;

                        default:
                            break;
                    }


                    break;
                case "percent":
                    // result = RoundingNumber((price_unit * newValue / 100)) // แปลง % เป็น บาท type -> string
                    result = ((price_unit * newValue) / 100) // แปลง % เป็น บาท type -> number
                    switch (method) {
                        case "onChange":
                            form.setFieldsValue({ [index]: { price_discount: result } })
                            break;
                        case "onBlur":
                            list_service_product[index]["price_discount"] = result
                            list_service_product[index]["price_discount_percent"] = newValue
                            form.setFieldsValue({list_service_product, [index]: { price_discount: result, price_discount_percent: newValue } })
                            calculateInTable(index, Number(takeOutComma(result) ?? 0) , "price_discount")
                            setColumnsTable()
                            break;

                        default:
                            break;
                    }

                    break;

                default:
                    break;
            }
            if (!!result && Number(result) < 0.01) {
                Swal.fire({
                    icon: 'warning',
                    title: GetIntlMessages("warning"),
                    text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01"),
                })
                form.setFieldsValue({ [index]: { price_discount: null, price_discount_percent: null } })
            } else {
                // list_service_product[index]["price_grand_total"] = price_grand_total
                // form.setFieldsValue({ list_service_product })
            }
        } catch (error) {

        }
    }
    const debounceCalculate = debounce((index, value, type) => calculateInTable(index, value, type), 600)
    const calculateInTable = (index, value, type) => {
        try {
            const { list_service_product } = form.getFieldValue()
            let price_unit = 0, price_discount = 0, price_grand_total = 0, price_discount_percent = 0 ,amount = 0
            switch (type) {
                case "amount":
                    price_unit = Number(takeOutComma(list_service_product[index]["price_unit"]) ?? 0)
                    price_discount = Number(takeOutComma(list_service_product[index]["price_discount"]) ?? 0)
                    amount = Number(takeOutComma(value) ?? 0 )
                    price_grand_total = (price_unit - price_discount) * amount
                    list_service_product[index]["price_grand_total"] = RoundingNumber(price_grand_total)
                    list_service_product[index]["amount"] = RoundingNumber(amount)
                    // form.setFieldsValue({ list_service_product })
                    setColumnsTable()
                    break;
                case "price_discount":
                    price_unit = Number(takeOutComma(list_service_product[index]["price_unit"]) ?? 0)
                    price_discount = Number(takeOutComma(value) ?? 0)
                    amount = Number(list_service_product[index]?.["amount"] ?? 0)
                    price_grand_total = (price_unit - price_discount) * amount
                    list_service_product[index]["price_grand_total"] = RoundingNumber(price_grand_total)
                    // form.setFieldsValue({ list_service_product })
                    break;
                case "price_unit":
                    price_unit = Number(takeOutComma(value) ?? 0)
                    price_discount_percent = Number(list_service_product[index]?.["price_discount_percent"] ?? 0)
                    price_discount = (price_unit * (price_discount_percent / 100))
                    amount = Number(list_service_product[index]?.["amount"] ?? 0)
                    // console.log('amount :>> ', amount);
                    price_grand_total = (price_unit - price_discount) * amount
                    // console.log('price_grand_total :>> ', price_grand_total);
                    list_service_product[index]["price_grand_total"] = RoundingNumber(price_grand_total)
                    list_service_product[index]["price_unit"] = RoundingNumber(takeOutComma(value) ?? 0)
                    list_service_product[index]["price_discount_percent"] = price_discount_percent
                    list_service_product[index]["price_discount"] = price_discount
                    form.setFieldsValue({ [index] : {price_unit : RoundingNumber(takeOutComma(value) ?? 0) ,price_discount ,price_discount_percent} })
                    setColumnsTable()
                    break;

                default:
                    break;
            }
            // console.log('list_service_product calculateInTable:>> ', list_service_product);
            form.setFieldsValue({ list_service_product })
        } catch (error) {
            // console.log('error calculateInTable:>> ', error);
        }
    }
    /* End Calculate */

    // console.log('form.getFieldValue() :>> ', form.getFieldValue());
    // console.log('listServiceProduct :>> ', listServiceProduct);
    return (
        <>
            <Row justify={"end"}>
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

            {/* <Form.Item name="isModalVisible" hidden /> */}

            {/* <Form.Item name="list_service_product" hidden /> */}

            {/* {generateFormItem()} */}

            <div id="table-list">
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={form.getFieldValue("list_service_product")}
                    // dataSource={Form.useWatch("list_service_product" , {form , preserve :true})}
                    // dataSource={listServiceProduct}
                    columns={columns}
                    // columns={customColumns}
                    pagination={false}
                    scroll={{ x: 960 }}
                    loading={loadingSearchShopStock}
                />
            </div>

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
            </style>
        </>
    )
}

export default ComponentsRoutesModalTab1ServiceAndProduct