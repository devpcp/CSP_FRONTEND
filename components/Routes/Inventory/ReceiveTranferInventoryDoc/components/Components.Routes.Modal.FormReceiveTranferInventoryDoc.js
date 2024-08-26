import { Form, Input, Row, Col, Select, DatePicker, Button, Modal, message } from 'antd'
import { filter, get, } from 'lodash'
import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import TranferInventoryDoc from '../../TranferInventoryDoc';
import EmployeeData from '../../../../../routes/MyData/EmployeeData';
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import API from "../../../../../util/Api";
import moment from 'moment'

const FormTranferInventoryDoc = ({ mode, calculateResult, setIsModalVisible }) => {

    const form = Form.useFormInstance();

    const { locale, } = useSelector(({ settings }) => settings);
    const { taxTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);
    const [isTranferInventoryDocModalVisible, setIsTranferInventoryDocModalVisible] = useState(false);

    const callBackEmployee = (data) => {
        setIsEmployeeModalVisible(false)
        form.setFieldsValue({
            recipient_id: data.id,
            recipient_name: data.UsersProfile.fname[locale.locale] + " " + data.UsersProfile.lname[locale.locale],
        });
    }
    const handleCancelEmployeeModal = () => {
        try {
            setIsEmployeeModalVisible(false)
        } catch (error) {
            console.log("handleCancelEmployeeModal : ", error)
        }
    }

    const callBackTranferInventoryDoc = async (data) => {
        try {
            console.log("daadad", data)
            setIsTranferInventoryDocModalVisible(false)
            let select_shop_ids = data?.ShopsProfiles?.id
            const initData = {
                product_list: []
            }
            let user = await getUserById(data?.details?.approved_by)
            const dataDocInventoryId = await API.get(`/shopInventory/bydocinventoryid/${data.id}?${select_shop_ids ? `shop_id=${select_shop_ids}` : ""}${select_shop_ids ? `&select_shop_ids=${select_shop_ids}` : ""}`)

            if (dataDocInventoryId.data.status == "success") {
                const _model = dataDocInventoryId.data.data
                let { check_status, check_list } = await checkIsProductHaveInShop(_model.product_list)
                if (check_status === true) {
                    _model.product_list.map((e, index) => {
                        e.warehouse_detail.map((el) => {
                            try {
                                initData.product_list.push({
                                    seq_number: el.other_details.seq_number,
                                    shop_product_id: check_list?.find(x => x.Product.id === e.ShopProduct.Product.id).id,
                                    list_id: e.ShopProduct.Product.master_path_code_id,
                                    list_name: e.ShopProduct.Product.product_name[locale.locale],
                                    dot: el.shelf.dot_mfd,
                                    purchase_unit_id: el.shelf.purchase_unit_id,
                                    purchase_unit_name: productPurchaseUnitTypes.find(x => x.id === el.shelf.purchase_unit_id).type_name[locale.locale],
                                    price_unit: el.other_details.price_unit,
                                    amount: el.shelf.amount,
                                    price_grand_total: el.other_details.price_grand_total,
                                })
                            } catch (error) {
                                console.log("error", error)
                            }
                        })
                    })
                }
            }
            initData.product_list.sort((a, b) => a.seq_number - b.seq_number)
            form.setFieldsValue({
                tax_type_id: data.details.tax_type,
                tranfer_inventory_doc_id: data.id,
                tranfer_inventory_doc_code: data.code_id,
                tranfer_inventory_obj: data,
                doc_tranfer_date: moment(data.doc_date),
                shop_sender_id: data.shop_id,
                shop_sender_name: data.ShopsProfiles.shop_name[locale.locale],
                product_list: initData.product_list,
                approver_name: !!user ? user.UsersProfile.fname[locale.locale] + " " + user.UsersProfile.lname[locale.locale] : "",
            });
            calculateResult()
        } catch (error) {
            console.log("callBackTranferInventoryDoc", error)
        }
    }


    const handleCancelTranferInventoryDocModal = () => {
        try {
            setIsTranferInventoryDocModalVisible(false)
        } catch (error) {
            console.log("handleCancelTranferInventoryDocModal : ", error)
        }
    }

    const getUserById = async (id) => {
        try {
            const { data } = await API.get(`/user/byid/${id}`)
            if (data.status === "successful") {
                const item = data.data[0]
                return item
            } else {
                console.log("data", data)
                return null
            }
        } catch (error) {
            console.log("getUserById : ", error)
        }
    }

    const getShopOriginalProductById = async (product_id, shop_id) => {
        try {
            const { data } = await API.get(`/shopProducts/all?center_product_id=${product_id}&shop_id=${shop_id}`)
            if (data.status === "success") {
                return data.data.data[0]
            } else {
                console.log("data", data)
                return null
            }
        } catch (error) {
            console.log("getProductById : ", error)
        }
    }

    const getShopProductById = async (product_id) => {
        try {
            const { data } = await API.get(`/shopProducts/all?center_product_id=${product_id}`)
            if (data.status === "success") {
                return data.data.data[0]
            } else {
                console.log("data", data)
                return null
            }
        } catch (error) {
            console.log("getProductById : ", error)
        }
    }

    const checkIsProductHaveInShop = async (product_list) => {
        try {
            let check_list = []
            let error = []
            await Promise.all(product_list.map(async (e, i) => {
                await getShopProductById(e.ShopProduct.Product.id).then(async (el) => {
                    if (!!el) {
                        check_list.push(el)
                    } else {
                        let productData = await getShopOriginalProductById(e?.ShopProduct?.Product?.id, e?.ShopsProfile?.id)
                        let res = await addProduct(productData)
                        if (res) {
                            check_list.push(productData)
                        } else {
                            error.push(productData)
                        }
                    }
                })
            }))

            return { check_status: await check_list.length === product_list.length, check_list: check_list }
        } catch (error) {
            console.log("checkIsProductHaveInShop : ", error)
            return false
        }
    }

    const addProduct = async (product_data) => {
        let res
        const _model = {
            // ...product_data.Product,
            product_id: product_data?.product_id ?? null,
            product_bar_code: product_data?.product_bar_code ?? null,
            price: {
                suggasted_re_sell_price: {
                    retail: product_data.price.suggasted_re_sell_price.retail ?? 0,
                    wholesale: product_data.price.suggasted_re_sell_price.wholesale ?? 0,
                },
                suggested_online_price: {
                    retail: 0,
                    wholesale: 0,
                },
                b2b_price: {
                    retail: 0,
                    wholesale: 0,
                },
                credit_30_price: {
                    retail: 0,
                    wholesale: 0,
                },
                credit_45_price: {
                    retail: 0,
                    wholesale: 0,
                }
            },
            details: product_data.details ?? {},
        }
        res = await API.post(`/shopProducts/add`, _model)
        if (res.data.status == "success") {
            return true
        } else {
            showErrorModal("เกิดข้อผิดพลาด", `${res.data.data} ไม่สามารถโคลนสินค้าจากต้นทางได้ กรุณาติดต่อเจ้าหน้าที่ !! ${res.data.data}`)
        }
    }

    const showErrorModal = (header, text, errArr) => {
        Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: text ? text : `${errArr.map((e, i) => (`รายการที่  ${i + 1} รหัส ${e.Product.master_path_code_id}\n`))} ไม่สามารถโคลนสินค้าจากต้นทางได้ \nผู้ใช้สามารถเพิ่มสินค้ารายการดังกล่าวด้วยตนเอง\n ที่หน้า ข้อมูลสินค้า\n หรือติดต่อเจ้าหนี้ที่ !!`,
            centered: true,
            footer: null,
            closable: false,
            onOk: () => { setIsModalVisible(false); form.resetFields() }
        });
    }

    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='tranfer_inventory_obj'
                        label={GetIntlMessages("รหัสใบโอนสินค้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name='tranfer_inventory_doc_id'
                        label={GetIntlMessages("รหัสใบโอนสินค้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="tranfer_inventory_doc_code"
                        label="เลชที่ใบโอนสินค้า"
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
                                onClick={() => setIsTranferInventoryDocModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_tranfer_date"
                        label="วันที่ใบโอนสินค้า"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='approver_id'
                        label={GetIntlMessages("รหัสผู้อนุมัติ")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="approver_name"
                        label="ผู้อนุมัติ"
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
                        name='recipient_id'
                        label={GetIntlMessages("รหัสผู้รับสินค้า")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="recipient_name"
                        label="ผู้รับสินค้า"
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
                                disabled={mode === "view"}
                                onClick={() => setIsEmployeeModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='shop_sender_id'
                        label={GetIntlMessages("รหัสผู้อนุมัติ")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="shop_sender_name"
                        label="สาขาที่โอน"
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='shop_recipient_id'
                        label={GetIntlMessages("รหัสผู้อนุมัติ")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="shop_recipient_name"
                        label="สาขาที่รับ"
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
                            disabled
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
            </Row>
            <Modal
                maskClosable={false}
                open={isEmployeeModalVisible}
                onCancel={handleCancelEmployeeModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelEmployeeModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <EmployeeData title="จัดการข้อมูลพนักงาน" callBack={callBackEmployee} filter_department_id="c39487ed-942d-4b63-bd08-28f774ec4211" />
            </Modal>

            <Modal
                maskClosable={false}
                open={isTranferInventoryDocModalVisible}
                onCancel={handleCancelTranferInventoryDocModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelTranferInventoryDocModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <TranferInventoryDoc title="ใบโอนสินค้าจากสาขาอื่น" callBack={callBackTranferInventoryDoc} filter_shop_id={authUser?.UsersProfile?.ShopsProfile?.id} docTypeId={"53e7cbcc-3443-40e5-962f-d9512aba2b5a"} />
            </Modal>
        </>

    )
}

export default FormTranferInventoryDoc