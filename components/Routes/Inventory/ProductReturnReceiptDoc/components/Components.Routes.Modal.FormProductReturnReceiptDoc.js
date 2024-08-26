import { Form, Input, Row, Col, Select, DatePicker, Button, Modal, Tabs } from 'antd'
import { filter, get, isPlainObject } from 'lodash'
import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ShopTemporaryDeliveryOrderDoc from '../../../Sales/ShopRetailDocument/ShopTemporaryDeliveryOrderDoc';
import ShopTemporaryDeliveryOrderDocWholeSale from '../../../Sales/ShopWholesaleDocument/ShopTemporaryDeliveryOrderDocWholeSale';
import TranferInventoryDoc from '../../TranferInventoryDoc'
import BusinessCustomersData from '../../../../../routes/MyData/BusinessCustomersData';
import PersonalCustomersData from '../../../../../routes/MyData/PersonalCustomersData';
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import API from "../../../../../util/Api";
import moment from 'moment'
import ProductDataInImportDoc from "./Components.Routes.Modal.ProductDataInImportDoc"
import DebtCreditNoteDoc from "../../../Sales/DebtCreditNoteDoc"

const ComponentsRoutesModalFormProductReturnReceiptDoc = ({ mode, calculateResult, setIsModalVisible }) => {

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

    useEffect(() => {
        if (mode === "add") {
            setActiveKeyTab("1")
        }
    }, [mode])

    const callBackTemporaryDeliveryOrderDoc = (data) => {
        console.log("callback Data", data)
        // setIsTemporaryDeliveryOrderDocModalVisible(false)
        setListData(data.ShopTemporaryDeliveryOrderLists)

        if (data.id !== form.getFieldValue().temporary_delivery_order_doc_id) {
            form.setFieldsValue({
                product_list: [],
            });
        }
        setActiveKeyTab("2")
        form.setFieldsValue({
            customer_id: data?.bus_customer_id === null ? data?.per_customer_id : data?.bus_customer_id,
            customer_type: data?.bus_customer_id === null ? "personal" : "business",
            customer_name: data?.bus_customer_id === null ? data?.ShopPersonalCustomer?.customer_name.first_name[locale.locale] + " " + data?.ShopPersonalCustomer?.customer_name?.last_name[locale.locale] : data?.ShopBusinessCustomer?.customer_name[locale.locale],
            temporary_delivery_order_doc_id: data?.id,
            temporary_delivery_order_doc_code: data?.code_id,
            temporary_delivery_order_doc_date: moment(data?.doc_date),
            tax_invoice_doc_id: data?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.id,
            tax_invoice_doc_code: data?.ShopServiceOrderDoc.ShopTaxInvoiceDocs[0]?.inv_code_id,
            tax_invoice_doc_date: moment(data?.ShopServiceOrderDoc?.ShopTaxInvoiceDocs[0]?.inv_doc_date),
            tax_type_id: data?.tax_type_id,
        });
    }

    const handleCancelTemporaryDeliveryOrderDocModal = () => {
        try {
            setIsTemporaryDeliveryOrderDocModalVisible(false)
        } catch (error) {
            console.log("handleCancelTemporaryDeliveryOrderDocModal : ", error)
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

    const callBackListInTemporaryDeliveryOrderDoc = (data) => {
        console.log("callbacklist Data", data)
        const { product_list } = form.getFieldValue();
        const isObj = isPlainObject(product_list?.find(where => where.id === data.id));
        let arr, newValue = {
            id: data.id,
            list_id: data.details.meta_data.ShopProduct.Product.master_path_code_id,
            list_name: data.details.meta_data.ShopProduct.Product.product_name[locale.locale],
            change_name_status: data.details.change_name_status,
            // warehouse_id: data.shop_warehouse_id,
            // warehouse_name: data.details.meta_data.ShopStock.ShopWarehouse.name,
            // shelf_code: data.shop_warehouse_shelf_item_id,
            // shelf_name: data.details.meta_data.ShopStock.ShopWarehouse.ShopWarehouseSelfItem.name,
            dot: data.dot_mfd,
            purchase_unit_id: data.purchase_unit_id,
            purchase_unit_name: data.details.meta_data.ProductPurchaseUnitType.type_name[locale.locale],
            price_unit: data.price_grand_total / data.amount,
            amount: data.amount,
            price_grand_total: data.price_grand_total,
            shop_product_id: data.shop_product_id,
            product_id: data.details.meta_data.ShopProduct.product_id
        }

        if (isObj) {
            Modal.warning({
                content: 'ท่านเลือกเอกสารนี้ไปแล้ว !!',
            });
            arr = [...product_list]
        } else {
            if (!!product_list && product_list.length > 0) {
                arr = [...product_list, newValue]
            } else {
                arr = [newValue]
            }
        }

        // setIsTemporaryDeliveryOrderDocModalVisible(false)
        form.setFieldsValue({
            product_list: arr,
        });

        calculateResult()
    }


    const callBackDebtCreditNoteDoc = (data) => {
        console.log("callback Data", data)
        setIsDebtCreditNoteDocModalVisible(false)
        form.setFieldsValue({
            debt_credit_note_doc_id: data.id,
            debt_credit_note_doc_code: data.code_id,
            debt_credit_note_doc_date: moment(data.doc_date),
        });
    }

    const onChangeCreateDebtCreditNoteDoc = (value) => {
        setCreateDebtCreditNoteDocStatus(value)
    }

    const handleCancelDebtCreditNoteDocModal = () => {
        try {
            setIsDebtCreditNoteDocModalVisible(false)
        } catch (error) {
            console.log("handleCancelDebtCreditNoteDocModal : ", error)
        }
    }


    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='doc_type'
                        label={GetIntlMessages("ประเภทเอกสาร")}
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Select
                            onChange={onChangeDocType}
                            disabled={mode !== "add"}
                            placeholder="เลือกประเภทเอกสาร"
                            showSearch
                            optionFilterProp="children"
                        >
                            <Select.Option value={"repair"} key={1}>
                                ใบสั่งซ่อม
                            </Select.Option>
                            <Select.Option value={"wholesale"} key={2}>
                                ใบสั่งขาย
                            </Select.Option>
                        </Select>
                    </Form.Item>
                </Col>


                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='temporary_delivery_order_doc_id'
                        label={GetIntlMessages("รหัสใบส่งสินค้าชั่วคราว")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="temporary_delivery_order_doc_code"
                        label="เลขที่ใบส่งสินค้าชั่วคราว"
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
                                onClick={() => setIsTemporaryDeliveryOrderDocModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="temporary_delivery_order_doc_date"
                        label="วันที่ใบส่งสินค้าสินค้า"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='tax_invoice_doc_id'
                        label={GetIntlMessages("รหัสใบกำกับภาษี")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="tax_invoice_doc_code"
                        label="เลขที่ใบกำกับภาษี"
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="tax_invoice_doc_date"
                        label="วันที่ใบกำกับภาษี"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='customer_id'
                        label={GetIntlMessages("รหัสลูกค้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name='customer_type'
                        label={GetIntlMessages("รหัสลูกค้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="customer_name"
                        label="ชื่อลูกค้า"
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
                        name="is_create_debt_credit_note_doc"
                        label="สร้างใบลดหนี้ลูกหนี้ หรือไม่"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกข้อมูล"
                            },
                        ]}
                    >
                        <Select
                            onChange={onChangeCreateDebtCreditNoteDoc}
                            disabled={mode === "view" || form.getFieldValue().debt_credit_note_doc_id}
                            placeholder="เลือกประเภทเอกสาร"
                            showSearch
                            optionFilterProp="children"
                            defaultValue={true}
                        >
                            <Select.Option value={"yes"} key={1}>
                                สร้างใบลดหนี้
                            </Select.Option>
                            <Select.Option value={"yes_no_vat"} key={1}>
                                สร้างใบลดหนี้ (ไม่คิดภาษี)
                            </Select.Option>
                            <Select.Option value={"not"} key={2}>
                                ไม่สร้าง
                            </Select.Option>
                            <Select.Option value={"pick"} key={3}>
                                เลือกจากใบลดหนี้
                            </Select.Option>

                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='debt_credit_note_doc_id'
                        label={GetIntlMessages("รหัสใบลดหนี้ลูกหนี้")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="debt_credit_note_doc_code"
                        label="เลขที่ใบลดหนี้ลูกหนี้"
                        rules={[
                            {
                                required: form.getFieldValue().is_create_debt_credit_note_doc === "pick",
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                disabled={mode === "view" || createDebtCreditNoteDocStatus !== "pick" || form.getFieldValue().is_create_debt_credit_note_doc !== "pick"}
                                onClick={() => setIsDebtCreditNoteDocModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                {/* <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="debt_credit_note_doc_date"
                        label="วันที่เอกสารใบลดหนี้ลูกหนี้"
                        rules={[
                            {
                                required: form.getFieldValue().is_create_debt_credit_note_doc === "pick",
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                    </Form.Item>
                </Col> */}
            </Row >
            <Modal
                maskClosable={false}
                open={isTemporaryDeliveryOrderDocModalVisible}
                onCancel={handleCancelTemporaryDeliveryOrderDocModal}
                width="90vw"
                style={{ top: 5 }}
                closable
                footer={(
                    <>
                        <Button onClick={() => handleCancelTemporaryDeliveryOrderDocModal()}>{GetIntlMessages("กลับ")}</Button>
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
                            children: (
                                docType === "repair" ?
                                    <ShopTemporaryDeliveryOrderDoc title="จัดการข้อมูลใบส่งสินค้า จากใบสั่งซ่อม" callBack={callBackTemporaryDeliveryOrderDoc} />
                                    :
                                    <ShopTemporaryDeliveryOrderDocWholeSale title="จัดการข้อมูลใบส่งสินค้า จากใบสั่งขาย" callBack={callBackTemporaryDeliveryOrderDoc} />
                            ),
                        },
                        {
                            label: (<span>รายการสินค้า</span>),
                            key: '2',
                            children: <ProductDataInImportDoc title={"เลือกสินค้าที่ต้องการรับคืน "} callBack={callBackListInTemporaryDeliveryOrderDoc} listData={listData} />,
                        },
                    ]}
                />
            </Modal>

            <Modal
                maskClosable={false}
                open={isDebtCreditNoteDocModalVisible}
                onCancel={handleCancelDebtCreditNoteDocModal}
                width="90vw"
                style={{ top: 5 }}
                closable
                footer={(
                    <>
                        <Button onClick={() => handleCancelDebtCreditNoteDocModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <DebtCreditNoteDoc title="จัดการข้อมูล ใบลดหนี้ลูกหนี้" callBack={callBackDebtCreditNoteDoc} />
            </Modal>
        </>

    )
}

export default ComponentsRoutesModalFormProductReturnReceiptDoc