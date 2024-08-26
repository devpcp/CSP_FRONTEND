import { Form, Input, Row, Col, Select, DatePicker, Button, Modal, Tabs } from 'antd'
import { filter, get, isPlainObject } from 'lodash'
import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ImportDocuments from '../../../../../routes/Inventory/ImportDocuments';
import TranferInventoryDoc from '../../TranferInventoryDoc'
import BusinessCustomersData from '../../../../../routes/MyData/BusinessCustomersData';
import PersonalCustomersData from '../../../../../routes/MyData/PersonalCustomersData';
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import API from "../../../../../util/Api";
import moment from 'moment'
import ProductDataInImportDoc from "./Components.Routes.Modal.ProductDataInImportDoc"
import ShopPartnerDebtCreditNoteDoc from "../../../Sales/ShopPartnerDebtCreditNoteDoc"

const ComponentsRoutesModalFormProductReturnDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false, getStatusCarLoading }) => {
    const form = Form.useFormInstance();

    const { locale, } = useSelector(({ settings }) => settings);
    const { taxTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [activeKeyTab, setActiveKeyTab] = useState("1");
    const [isImportDocModalVisible, setIsImportDocModalVisible] = useState(false);
    const [isShopPartnerDebtCreditNoteDocModalVisible, setIsShopPartnerDebtCreditNoteDocModalVisible] = useState(false);
    const [docType, setDocType] = useState("person");

    const [listIndex, setListIndex] = useState(0);
    const [listData, setListData] = useState([]);

    useEffect(() => {
        if (mode === "add") {
            setActiveKeyTab("1")
        }
    }, [mode])


    const callBackImportDoc = async (data) => {
        // console.log("callback Data", data)
        const initData = {
            product_list: []
        }

        if (data.id !== form.getFieldValue().import_doc_id) {
            form.setFieldsValue({
                product_list: [],
            });
        }

        let shop_id = data.shop_id
        const shopWareHouse = await getShelfData()
        const dataDocInventoryId = await API.get(`/shopInventory/bydocinventoryid/${data.id}?${shop_id ? `shop_id=${shop_id}` : ""}${shop_id ? `&select_shop_ids=${shop_id}` : ""}`)
        // console.log("dataDocInventoryId", dataDocInventoryId.data.data)
        if (dataDocInventoryId.data.status == "success") {
            const _model = dataDocInventoryId.data.data
            _model.product_list.map((e, index) => {
                e.warehouse_detail.map((el, indexel) => {
                    try {
                        initData.product_list.push({
                            seq_number: indexel + 1,
                            list_id: e.ShopProduct.Product.master_path_code_id,
                            list_name: e.ShopProduct.Product.product_name[locale.locale],
                            dot: el.shelf.dot_mfd,
                            shelf_code: el.shelf.item,
                            shelf_name: shopWareHouse?.find(x => x.id === el.warehouse)?.shelf.find(x => x.code === el.shelf.item)?.name[locale.locale],
                            warehouse_id: el.warehouse,
                            warehouse_name: shopWareHouse?.find(x => x.id === el.warehouse)?.name[locale.locale],
                            purchase_unit_id: el?.shelf?.purchase_unit_id,
                            purchase_unit_name: productPurchaseUnitTypes?.find(x => x?.id === el?.shelf?.purchase_unit_id)?.type_name[locale.locale],
                            price_unit: e.details.price,
                            price_discount: e.details.price_discount,
                            amount: el.shelf.amount,
                            price_grand_total: (e.details.price - e.details.price_discount) * el.shelf.amount,
                            warehouse_detail: e.warehouse_detail,
                            ShopProduct: e.ShopProduct,
                            shop_product_id: e.ShopProduct.id,
                        })
                    } catch (error) {
                        console.log("error", error)
                    }
                })
            })
        }

        setListData(initData.product_list)
        setActiveKeyTab("2")
        form.setFieldsValue({
            partner_id: data.bus_partner_id,
            partner_name: data.ShopBusinessPartners.partner_name[locale.locale],
            import_doc_id: data.id,
            import_doc_code: data.code_id,
            import_doc_date: moment(data.doc_date),
            tax_type_id: data.details.tax_type,
        });
        calculateResult()
    }

    const getShelfData = async () => {
        const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        return data.data.data
    }

    const handleCancelImportDocModal = () => {
        try {
            setIsImportDocModalVisible(false)
        } catch (error) {
            console.log("handleCancelImportDocModal : ", error)
        }
    }

    const onChangeDocType = async (value) => {
        try {
            setDocType(value)
        } catch (error) {

        }
    }

    const handleChangeTabs = (key) => {
        try {
            setActiveKeyTab(() => key)
        } catch (error) {

        }
    }

    const callBackListInImportDoc = (data) => {
        // console.log("callbacklist Data", data)

        const { product_list } = form.getFieldValue();
        // console.log("product_list", product_list)
        const isObj = isPlainObject(product_list?.find(where => where.shop_product_id === data.shop_product_id && where.shelf_code === data.shelf_code && where.purchase_unit_id === data.purchase_unit_id && where.warehouse_id === data.warehouse_id));
        let arr, newValue = {
            id: data.id,
            list_id: data.ShopProduct.Product.master_path_code_id,
            list_name: data.ShopProduct.Product.product_name[locale.locale],
            warehouse_id: data.warehouse_id,
            warehouse_name: data.warehouse_name,
            shelf_code: data.shelf_code,
            shelf_name: data.shelf_name,
            dot: data.dot ?? null,
            purchase_unit_id: data.purchase_unit_id,
            purchase_unit_name: data.purchase_unit_name,
            price_unit: data.price_grand_total / data.amount,
            amount: data.amount,
            price_grand_total: data.price_grand_total,
            shop_product_id: data.shop_product_id,
            product_id: data.ShopProduct.Product.id
        }

        if (isObj) {
            Modal.warning({
                content: 'ท่านเลือกสินค้านี้ไปแล้ว !!',
            });
            arr = [...product_list]
        } else {
            if (!!product_list && product_list.length > 0) {
                arr = [...product_list, newValue]
            } else {
                arr = [newValue]
            }
        }

        form.setFieldsValue({
            product_list: arr,
        });
        calculateResult()
    }

    const callBackShopPartnerDebtCreditNoteDoc = (data) => {
        console.log("callback CreditNoteDoc", data)
        const { shop_partner_debt_credit_note_doc_arr } = form.getFieldValue()


        const isObj = isPlainObject(shop_partner_debt_credit_note_doc_arr?.find(where => where.id === data.id));
        let arr, newValue = data

        if (isObj) {
            Modal.warning({
                content: 'ท่านเลือกเอกสารนี้ไปแล้ว !!',
            });
            arr = [...shop_partner_debt_credit_note_doc_arr]
        } else {
            if (!!shop_partner_debt_credit_note_doc_arr && shop_partner_debt_credit_note_doc_arr.length > 0) {
                arr = [...shop_partner_debt_credit_note_doc_arr, newValue]
            } else {
                arr = [newValue]
            }
        }
        // console.log("arr", arr)
        let code_id = arr.map((e) => {
            return e?.code_id ?? "";
        })
        let id = arr.map((e) => {
            return e?.id ?? "";
        })
        form.setFieldsValue({
            shop_partner_debt_credit_note_doc_arr: arr,
            shop_partner_debt_credit_note_doc_id: id.toString(),
            shop_partner_debt_credit_note_doc_code: code_id.toString(),
        });
    }

    const handleCancelShopPartnerDebtCreditNoteDocModal = () => {
        try {
            setIsShopPartnerDebtCreditNoteDocModalVisible(false)
        } catch (error) {
            console.log("handleCancelShopPartnerDebtCreditNoteDocModal : ", error)
        }
    }

    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='import_doc_id'
                        label={GetIntlMessages("รหัสใบรับเข้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="import_doc_code"
                        label="เลขที่ใบรับเข้า"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                disabled={mode !== "add"}
                                onClick={() => setIsImportDocModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>


                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='partner_id'
                        label={GetIntlMessages("รหัสผู้จำหน่าย")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="partner_name"
                        label="ชื่อผู้จำหน่าย"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="import_doc_date"
                        label="วันที่ใบรับเข้า"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24} >
                    <Form.Item
                        name="tax_type_id"
                        label={`ประเภทภาษี`}
                    >
                        <Select
                            showSearch
                            optionFilterProp="children"
                            showArrow={false}
                            style={{ width: "100%" }}
                            onSelect={() => calculateResult()}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} >
                    <Form.Item
                        name="tax_type_id"
                        label="อัตราภาษี (%)"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label="วันที่เอกสาร"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกข้อมูล"
                            },
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='shop_partner_debt_credit_note_doc_arr'
                        label={GetIntlMessages("รหัสใบลดหนี้เจ้าหนี้")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name='shop_partner_debt_credit_note_doc_id'
                        label={GetIntlMessages("รหัสใบลดหนี้เจ้าหนี้")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name='shop_partner_debt_credit_note_doc_code'
                        label="เลขที่ใบลดหนี้เจ้าหนี้"
                    >
                        <Input disabled addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                disabled={mode === "view"}
                                onClick={() => setIsShopPartnerDebtCreditNoteDocModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

            </Row >
            <Modal
                maskClosable={false}
                open={isImportDocModalVisible}
                onCancel={handleCancelImportDocModal}
                width="90vw"
                style={{ top: 10 }}
                closeIcon={true}
                footer={(
                    <>
                        <Button onClick={() => handleCancelImportDocModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <Tabs
                    defaultActiveKey="1"
                    activeKey={activeKeyTab}
                    onChange={handleChangeTabs}
                    items={[
                        {
                            label: (<span>เอกสาร</span>),
                            key: '1',
                            children: <ImportDocuments title="จัดการข้อมูลใบส่งสินค้า จากใบรับเข้า" callBack={callBackImportDoc} />
                        },
                        {
                            label: (<span>รายการสินค้า</span>),
                            key: '2',
                            children: <ProductDataInImportDoc title={"เลือกสินค้าที่ต้องการส่งคืน "} callBack={callBackListInImportDoc} listData={listData} />,
                        },
                    ]}
                />
            </Modal>

            <Modal
                maskClosable={false}
                open={isShopPartnerDebtCreditNoteDocModalVisible}
                onCancel={handleCancelShopPartnerDebtCreditNoteDocModal}
                width="90vw"
                style={{ top: 5 }}
                closable
                footer={(
                    <>
                        <Button onClick={() => handleCancelShopPartnerDebtCreditNoteDocModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <ShopPartnerDebtCreditNoteDoc title="จัดการข้อมูลใบลดหนี้เจ้าหนี้" callBack={callBackShopPartnerDebtCreditNoteDoc} />
            </Modal>
        </>

    )
}

export default ComponentsRoutesModalFormProductReturnDoc