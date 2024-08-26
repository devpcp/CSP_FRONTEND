import { Form, Input, Row, Col, Select, DatePicker, Button, Modal, Tabs, Tooltip, InputNumber, Table, Popconfirm, Transfer, Space, Switch, Popover, Badge, Tag } from 'antd'
import _, { isArray, isFunction, get, isPlainObject, isEmpty } from 'lodash'
import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import { InfoCircleTwoTone, PlusOutlined, DeleteOutlined, CalculatorOutlined, FormOutlined, FileAddOutlined } from '@ant-design/icons';
import moment from 'moment'
import Fieldset from '../../../../shares/Fieldset';
import InventoryData from "../../../Components.Routes.Inventory"
import RegexMultiPattern from "../../../../shares/RegexMultiPattern";
import { RoundingNumber, takeOutComma } from "../../../../shares/ConvertToCurrency";
import API from '../../../../../util/Api'

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const ComponentsRoutesModalFormPromotion = ({ mode, calculateResult, setIsModalVisible }) => {
    const [value, setValue] = useState('');
    const form = Form.useFormInstance();

    const { locale, } = useSelector(({ settings }) => settings);
    const { taxTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [isTemporaryDeliveryOrderDocModalVisible, setIsTemporaryDeliveryOrderDocModalVisible] = useState(false);
    const [isDebtCreditNoteDocModalVisible, setIsDebtCreditNoteDocModalVisible] = useState(false);
    const [createDebtCreditNoteDocStatus, setCreateDebtCreditNoteDocStatus] = useState("create");

    const [docType, setDocType] = useState("repair");
    const [listIndex, setListIndex] = useState(0);
    const [listData, setListData] = useState([]);
    const [isInventoryDataModalVisible, setIsInventoryDataModalVisible] = useState(false);
    const [loadingSearch, setLoadingSearch] = useState(false)
    const [productModalType, setProductModalType] = useState("")

    const [productBrandList, setProductBrandList] = useState([])
    const [productTypeGroupAllList, setProductTypeGroupAll] = useState([])
    const [productModelTypeList, setProductModelTypeList] = useState([])
    const [productTypeList, setProductTypeList] = useState([])

    useEffect(() => {
        if (mode === "add") {
            setActiveKeyTab("1")
        }
    }, [mode])

    useEffect(() => {
        getMasterData()
    }, [])

    const getMasterData = async () => {
        try {
            const promise1 = getProductTypeGroupAll();
            const promise2 = getProductBrandListAll();
            Promise.all([promise1, promise2]).then((values) => {
                setProductTypeGroupAll(values[0])
                setProductBrandList(values[1])
            });
        } catch (error) {
            console.log("getmaster error", error)
        }
    }

    const columnsCondition = [
        {
            title: () => GetIntlMessages("ลำดับ"),
            dataIndex: 'num',
            key: 'num',
            align: "center",
            width: "50px",
            render: (text, record, index) => {
                return index + 1
            },
        },

        {
            title: () => GetIntlMessages("รหัสสินค้า"),
            dataIndex: '',
            key: '',
            width: "120px",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_condition_list', index, "list_id"]}>
                        <Input disabled />
                    </Form.Item>
                )
            }
        },
        {
            title: () => GetIntlMessages("ชื่อสินค้า"),
            dataIndex: '',
            key: '',
            width: "300px",
            align: "center",
            render: (text, record, index) => {
                return (
                    <Form.Item style={{ margin: 0 }} name={['product_condition_list', index, "list_name"]}>
                        <TextArea autoSize disabled />
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
                    <Button onClick={() => handleOpenInventoryDataModal(index, "condition")} style={{ width: "100%" }} disabled={mode === "view"}>เลือก</Button>
                )
            }
        },
        {
            title: () => GetIntlMessages("จัดการ"),
            dataIndex: '',
            key: '',
            width: "50px",
            align: "center",
            render: (text, record, index) => form.getFieldValue("product_condition_list")?.length > 0 && mode !== "view" ?
                <Popconfirm title={`ยืนยันการลบรายที่ ${index + 1} หรือไม่ ?`} okText={GetIntlMessages("submit")} cancelText={GetIntlMessages("cancel")} onConfirm={() => handleDeleteConditionProduct(record, index)}>
                    <Button icon={<DeleteOutlined style={{ fontSize: 20 }} />} type='danger' style={{ width: "100%" }} />
                </Popconfirm>
                : null
        },
    ];


    const handleOpenInventoryDataModal = async (index, modalType) => {
        try {
            const { options_list, ref_doc } = form.getFieldValue();
            setListIndex(index)
            setListData(options_list)
            setIsInventoryDataModalVisible(true)
            setProductModalType(modalType)
            if (ref_doc === undefined || ref_doc === null) {
                setActiveKeyTab(() => "2")
            }
        } catch (error) {
            console.log("handleOpenInventoryDataModal error: ", error)
        }
    }

    const callBackSelectProduct = (data, indexCallBack, from = "") => {
        try {
            const { product_condition_list } = form.getFieldValue();
            const { product_list } = form.getFieldValue();
            switch (productModalType) {
                case "condition":
                    if (from !== "delete") {
                        setIsInventoryDataModalVisible(false)
                        product_condition_list[indexCallBack] = {
                            ...product_condition_list[indexCallBack],
                            list_id: data.ShopProduct.Product.master_path_code_id,
                            list_name: data.ShopProduct.Product.product_name[locale.locale],
                            product_id: data.ShopProduct.Product.id,
                            shop_product_id: data.ShopProduct.id,
                        }
                        form.setFieldsValue({ product_condition_list })
                    } else {
                        removeItemOnce(product_condition_list, data)
                    }

                    break;
                case "addCondition":
                    if (from !== "delete") {
                        const newData = {
                            list_id: data.ShopProduct.Product.master_path_code_id,
                            list_name: data.ShopProduct.Product.product_name[locale.locale],
                            product_id: data.ShopProduct.Product.id,
                            shop_product_id: data.ShopProduct.id,
                        }
                        product_condition_list = !!product_condition_list ? [...product_condition_list, newData] : [newData]
                        form.setFieldsValue({ product_condition_list })
                    } else {
                        removeItemOnce(product_condition_list, data)
                    }
                    break;
            }
        } catch (error) {
            console.log("error callBackSelectProduct", error)
        }
        function removeItemOnce(arr, value) {
            var index = arr.findIndex(x => x.shop_product_id === value.ShopProduct.id);
            console.log("index", index)
            handleDeleteConditionProduct(null, index)
        }
    }

    const handleCancelInventoryDataModal = () => {
        try {
            setIsInventoryDataModalVisible(false)
        } catch (error) {
            console.log("handleCancelInventoryDataModal error: ", error)
        }
    }

    const handleDeleteConditionProduct = (value, index) => {
        try {

            const { product_condition_list } = form.getFieldsValue();

            delete product_condition_list[index]
            const arr = product_condition_list.filter(where => !!where)
            form.setFieldsValue({ product_condition_list: arr })

        } catch (error) {
            console.log('error handleDeleteConditionProduct:>> ', error);
        }
    }


    /* เรียกข้อมูล กลุ่มสินค้า ทั้งหมด */
    const getProductTypeGroupAll = async () => {
        const { data } = await API.get(`/productTypeGroup/all?sort=code_id&order=asc&status=active`)
        return data.status === "success" ? data.data.data ?? [] : []
    }
    /* เรียกข้อมูล ประเภทสินค้า ทั้งหมด */
    const getProductTypeListAll = async (product_type_group_id = "") => {
        const { data } = await API.get(`/productType/all?sort=code_id&order=asc&status=active${product_type_group_id ? `&type_group_id=${product_type_group_id}` : ""}`)
        return data.status === "success" ? data.data.data ?? [] : []
    }

    /* เรียกข้อมูล ยี่ห้อสินค้า ทั้งหมด */
    const getProductBrandListAll = async () => {
        const { data } = await API.get(`/productBrand/all?limit=999999&page=1&sort=code_id&order=asc&status=active`)
        return data.data
    }

    /* เรียกข้อมูล Model รุ่น ทั้งหมด */
    const getProductModelTypeListAll = async (product_type_id = "", product_brand_id = "") => {
        const { data } = await API.get(`productModelType?sort=code_id&status=active&order=asc${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}`)
        return data.data
    }

    const onChangeTypeGroup = async (value) => {
        try {
            if (value) {
                setProductModelTypeList([])
                const ProductTypeList = await getProductTypeListAll(value)
                setProductTypeList(ProductTypeList)
                form.setFieldsValue({ product_type_id: null, product_brand_id: null, product_model_id: null })
            } else {
                setProductTypeList([])
            }
        } catch (error) {

        }

    };

    const handeleChangeProductType = async (value) => {
        try {
            if (value) {
                setProductModelTypeList([])
                form.setFieldsValue({ product_brand_id: null, product_model_id: null })
            }
        } catch (error) {
            setProductModelTypeList([])
        }
    }

    const handleChangeProductBrand = async (value) => {
        try {
            const { product_type_id } = form.getFieldValue()
            if (value) {
                const ProductModelType = await getProductModelTypeListAll(product_type_id, value)
                setProductModelTypeList(ProductModelType)
                form.setFieldsValue({ product_model_id: null })
            }
        } catch (error) {
            setProductModelTypeList([])
        }
    }

    const getNameSelect = (item, label) => {
        return item[`${label}`][`${locale.locale}`] ?? item[`${label}`][`en`];
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
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="promotion_code"
                        label={
                            <>
                                {"รหัสโปรโมชั่น"}
                                < Tooltip
                                    title="รหัสที่ใช้สำหรับกรอกที่ เว็บ หรือ ระบบไลน์">
                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                </Tooltip>
                            </>
                        }
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input placeholder='กรอกชื่อโปรโมชั่น' />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="name"
                        label="ชื่อโปรโมชั่น"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input placeholder='กรอกชื่อโปรโมชั่น' />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="promotion_active_date"
                        label="ระยะเวลาโปรโมชั่น"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <RangePicker style={{ width: "100%" }} format={"DD/MM/YYYY HH:mm:ss"} showTime />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="promotion_type"
                        label="ประเภทโปรโมชั่น"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Select
                            defaultValue="1"
                            style={{
                                width: "100%",
                            }}
                            // disabled
                            options={[
                                {
                                    value: '1',
                                    label: 'โค้ด',
                                },
                                {
                                    value: '2',
                                    label: 'ซื้อ X แถม X',
                                },
                                {
                                    value: '3',
                                    label: 'จับจากรายการ',
                                },
                            ]}
                        />
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={24}>
                    <Form.Item
                        name="tax_type_id"
                        label={`ประเภทภาษี`}
                    >
                        <Select
                            showSearch
                            optionFilterProp="children"
                            showArrow={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            onSelect={() => calculateResult()}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={24}>
                    <Form.Item
                        name="use_times"
                        label="จำนวนการใช้โปรโมชั่น"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <InputNumber placeholder='ระบุจำนวน' min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={24}>
                    <Form.Item
                        name="price_minimum"
                        label="ราคาขั้นต่ำ"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <InputNumber placeholder='ระบุจำนวน' min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={24}>
                    <Form.Item
                        name="qty_minimum"
                        label="จำนวนขั้นต่ำ"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <InputNumber placeholder='ระบุจำนวน' min={0} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Fieldset legend={`เลือกสินค้าที่ต้องการจัดโปรโมชั่น`} className={"fieldset-business-customer"}>
                        <Tabs
                            defaultActiveKey="1"
                            activeKey={activeKeyTab}
                            onChange={handleChangeTabs}
                            items={[
                                {
                                    label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> เลือกจากกลุ่มสินค้า</span>),
                                    key: '1',
                                    children:
                                        <Row gutter={8}>
                                            <Col lg={12} md={12} sm={12} xs={24}>
                                                <Form.Item name="product_type_group_id" label="กลุ่มสินค้า"
                                                    rules={[{
                                                        required: false,
                                                        message: GetIntlMessages("please-fill-out")
                                                    }]}
                                                >
                                                    <Select
                                                        mode='multiple'
                                                        showSearch
                                                        allowClear
                                                        placeholder="เลือกข้อมูล"
                                                        optionFilterProp="children"
                                                        disabled={mode === "view"}
                                                        onChange={onChangeTypeGroup}
                                                        filterOption={(inputValue, option) => {
                                                            if (_.isPlainObject(option)) {
                                                                if (option.children) {
                                                                    return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                }
                                                            }
                                                        }}

                                                    >
                                                        {isArray(productTypeGroupAllList) && productTypeGroupAllList.length > 0 ?
                                                            productTypeGroupAllList.map((e, index) => (
                                                                <Select.Option value={e.id} key={index}>
                                                                    {getNameSelect(e, "group_type_name")}
                                                                </Select.Option>
                                                            ))
                                                            : null
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col lg={12} md={12} sm={12} xs={24}>
                                                <Form.Item name="product_type_id" label="ประเภทสินค้า"
                                                    rules={[{
                                                        required: false,
                                                        message: GetIntlMessages("please-fill-out")
                                                    }]}
                                                >
                                                    <Select
                                                        mode='multiple'
                                                        showSearch
                                                        allowClear
                                                        placeholder="เลือกข้อมูล"
                                                        optionFilterProp="children"
                                                        disabled={mode === "view"}
                                                        onChange={handeleChangeProductType}
                                                        filterOption={(inputValue, option) => {
                                                            if (_.isPlainObject(option)) {
                                                                if (option.children) {
                                                                    return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                }
                                                            }
                                                        }}

                                                    >
                                                        {isArray(productTypeList) && productTypeList.length > 0 ? productTypeList.map((e, index) => (
                                                            <Select.Option value={e.id} key={index}>
                                                                {getNameSelect(e, "type_name")}
                                                            </Select.Option>
                                                        )) : null}
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col lg={12} md={12} sm={12} xs={24}>
                                                <Form.Item
                                                    name="product_brand_id"
                                                    label="ยี่ห้อสินค้า"
                                                >
                                                    <Select
                                                        mode='multiple'
                                                        showSearch
                                                        allowClear
                                                        placeholder="เลือกข้อมูล"
                                                        optionFilterProp="children"
                                                        onChange={handleChangeProductBrand}
                                                        disabled={mode === "view"}
                                                        filterOption={(inputValue, option) => {
                                                            if (_.isPlainObject(option)) {
                                                                if (option.children) {
                                                                    return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                }
                                                            }
                                                        }}

                                                    >
                                                        {isArray(productBrandList) && productBrandList.length > 0 ? productBrandList.map((e, index) => (
                                                            <Select.Option value={e.id} key={index}>
                                                                {getNameSelect(e, "brand_name")}
                                                            </Select.Option>
                                                        ))
                                                            : null
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                            <Col lg={12} md={12} sm={12} xs={24}>
                                                <Form.Item
                                                    name="product_model_id"
                                                    label="รุ่นสินค้า"
                                                >
                                                    <Select
                                                        mode='multiple'
                                                        allowClear
                                                        showSearch
                                                        placeholder="เลือกข้อมูล"
                                                        optionFilterProp="children"
                                                        disabled={mode === "view"}
                                                        filterOption={(inputValue, option) => {
                                                            console.log(option)
                                                            if (_.isPlainObject(option)) {
                                                                if (option.children) {
                                                                    return option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                                                }
                                                            }
                                                        }}
                                                    >
                                                        {isArray(productModelTypeList) && productModelTypeList.length > 0 ? productModelTypeList.map((e, index) => (
                                                            <Select.Option value={e.id} key={index}>
                                                                {getNameSelect(e, "model_name")}
                                                            </Select.Option>
                                                        ))
                                                            : null
                                                        }
                                                    </Select>
                                                </Form.Item>
                                            </Col>
                                        </Row>,
                                },
                                {
                                    label: (<span><FileAddOutlined style={{ fontSize: 18 }} /> เลือกจากรายสินค้า</span>),
                                    key: '2',
                                    children:
                                        <>
                                            <Row justify={"end"} hidden={mode === "view"}>
                                                <Button
                                                    onClick={() => handleOpenInventoryDataModal(0, "addCondition")}
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
                                            <Form.Item name={`product_condition_list`} hidden />
                                            <div id="table-list">
                                                <Table
                                                    rowKey="id"
                                                    columns={columnsCondition}
                                                    dataSource={Form.useWatch("product_condition_list", { form, preserve: true })}
                                                    pagination={false}
                                                    rowClassName={() => 'editable-row'}
                                                    bordered
                                                    scroll={{ x: 600 }}
                                                    loading={loadingSearch}
                                                />
                                            </div>
                                        </>

                                }
                            ]}
                        />
                    </Fieldset>
                </Col>
            </Row >


            <Modal
                maskClosable={false}
                open={isInventoryDataModalVisible}
                onCancel={handleCancelInventoryDataModal}
                width="90vw"
                style={{ top: 16 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelInventoryDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <InventoryData title={"เลือกสินค้า"} callBack={callBackSelectProduct} listIndex={listIndex} selectProductList={form.getFieldValue().product_condition_list} />,
            </Modal>
            <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
            `}</style>
        </>

    )
}

export default ComponentsRoutesModalFormPromotion