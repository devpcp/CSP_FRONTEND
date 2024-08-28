import React, { useEffect, useState } from 'react'
import Fieldset from '../../shares/Fieldset';
import FormSelectDot from "../Dot/Components.Select.Dot";
import GetIntlMessages from '../../../util/GetIntlMessages';
import { Form, Input, Select, Row, Col, Divider, Button, Space, DatePicker, InputNumber, Modal, Tooltip } from 'antd';
import { PlusOutlined, MinusCircleOutlined, TableOutlined, ShoppingCartOutlined, CalculatorOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { debounce, get, isArray, isEmpty, isFunction, isPlainObject, isString } from 'lodash';
import API from '../../../util/Api'
// import ComponentsSelectModalBusinessPartners from '../../../components/Routes/Modal/Components.Select.Modal.BusinessPartners'
import SortingData from '../../../components/shares/SortingData'
import { RoundingNumber, takeOutComma, } from '../../../components/shares/ConvertToCurrency'
import Swal from "sweetalert2";
import ProductData from "../../../routes/MyData/ProductsData"
import BusinessPartnersData from "../../../routes/MyData/BusinessPartnersData"

const tailformItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 }
};

const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" // -> เส้น
const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" // -> รายการ
const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" // -> ลูก // product_type battery ->5d82fef5-8267-4aea-a968-92a994071621 

const IncomeProduct = ({ form, mode, expireEditTimeDisable, dataList, calculateResult, getShopBusinessPartners, loadingSearch, setLoadingSearch, getArrListValue, setLoading, getShopBusinessPartnersDataListAll }) => {
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { taxTypeAllList, userList, shopBusinessPartnersList } = dataList
    const [shopBusinessPartners, setShopBusinessPartners] = useState([])
    const [isBusinessPartnersDataModalVisible, setIsBusinessPartnersDataModalVisible] = useState(false);


    useEffect(() => {
        setShopBusinessPartners(() => shopBusinessPartnersList)
    }, [shopBusinessPartnersList])

    const callBackDataBusinessPartner = (data) => {

        if (data && isArray(data)) {
            setShopBusinessPartners(data)
            if (isFunction(getShopBusinessPartners)) getShopBusinessPartners(data)
        }
    }
    /* Debounce Search */
    const debounceSearchPurchaseOrder = debounce((value, type) => searchPurchaseOrder(value, type), 800)
    const searchPurchaseOrder = async (value, type) => {
        try {
            if (isFunction(setLoading)) setLoading(() => true)
            setLoadingSearch(() => true)
            const { purchase_order_number_list } = form.getFieldValue()
            switch (type) {
                case "search":
                    if (!!value) {
                        const { data } = await API.get(`/shopPurchaseOrderDoc/all?search=${value}&status=active&page=1&limit=10&sort=doc_date&order=desc`);
                        if (data.status === "success") {
                            // setBussinessPartnerList(() => data.data.data)
                            purchase_order_number_list = data.data.data ?? []

                        }
                    }

                    break;
                default:
                    break;
            }

            form.setFieldsValue({ purchase_order_number_list })
            setLoadingSearch(() => false)
            if (isFunction(setLoading)) setLoading(() => false)
        } catch (error) {
            if (isFunction(setLoading)) setLoading(() => false)
            // console.log('error :>> ', error);
        }
    }
    /* End Debounce Search */

    /* Debounce Select and Clear */
    const debouncePurchaseOrder = debounce((value, type) => selectClearPurchaseOrder(value, type), 0)
    const selectClearPurchaseOrder = async (value, type) => {
        try {
            if (isFunction(setLoading)) setLoading(() => true)
            setLoadingSearch(() => true)
            const { purchase_order_number, purchase_order_number_list } = form.getFieldValue()
            switch (type) {
                case "select":
                    if (!!value) {
                        if (isArray(purchase_order_number_list) && purchase_order_number_list.length > 0) {
                            const _findPurcahseOrderDoc = purchase_order_number_list.find(where => where.id === purchase_order_number)
                            if (isPlainObject(_findPurcahseOrderDoc) && !isEmpty(_findPurcahseOrderDoc)) {
                                setFormPurchaseOrderValue(_findPurcahseOrderDoc)
                            }

                        }
                    }
                    break;

                case "clear":
                    const defaultValue = {
                        product_id: null,
                        amount_all: null,
                        price: null,
                        total_price: null,
                        discount_percentage_1: null,
                        discount_percentage_2: null,
                        discount_3: null,
                        discount_3_type: "bath",
                        price_discount_total: null,
                        warehouse_detail: [],
                        productId_list: []
                    }
                    form.setFieldsValue({
                        product_list: [defaultValue],
                        bus_partner_id: null,

                        tailgate_discount: null,
                        vat: null,
                        vat_text: null,
                        net_price: null,
                        net_price_text: null,
                        total_price_all: null,
                        total_price_all_text: null,
                        total_price_all_after_discount: null,
                        total_price_all_after_discount_text: null,
                        total_after_discount: null,
                        total_discount_text: null,
                        total_discount: null,
                    });
                    break;

                default:
                    break;
            }

            form.setFieldsValue({ purchase_order_number_list })
            setLoadingSearch(() => false)
            if (isFunction(setLoading)) setLoading(() => false)
        } catch (error) {
            if (isFunction(setLoading)) setLoading(() => false)
            // console.log('error :>> ', error);
        }
    }

    const setFormPurchaseOrderValue = (value) => {
        try {
            // console.log('value :>> ', value);
            const { business_partner_id, ShopPurchaseOrderLists, price_discount_bill, details } = value
            let product_list = []
            if (isArray(ShopPurchaseOrderLists) && ShopPurchaseOrderLists.length > 0) {
                product_list = ShopPurchaseOrderLists.map((e, index) => {
                    const { details, product_id, purchase_unit_id, amount, price_unit, price_discount, price_discount_percent, price_grand_total, seq_number } = e
                    return {
                        product_id,
                        productId_list: details.list_shop_stock,
                        ProductTypeGroupId: details.list_shop_stock[0]?.Product?.ProductType?.type_group_id ?? null,
                        unit_list: details.purchase_unit_list,
                        unit: purchase_unit_id,
                        amount_all: amount,
                        price: Number(price_unit),
                        price_text: RoundingNumber(price_unit),
                        discount_3: Number(price_discount),
                        discount_3_text: RoundingNumber(price_discount),
                        discount_3_type: "bath",
                        total_price: Number(price_unit) * Number(amount),
                        total_price_text: RoundingNumber(Number(price_unit) * Number(amount)),
                        price_discount_total: Number(amount) * Number(price_discount),
                        price_discount_total: RoundingNumber(Number(amount) * Number(price_discount)),
                        seq_number: seq_number.toString(),
                        changed_product_name: details?.changed_product_name ?? null
                    }
                })
                product_list = SortingData(product_list, `seq_number`)
                form.setFieldsValue({ bus_partner_id: business_partner_id, product_list, tailgate_discount: RoundingNumber(price_discount_bill), note: details?.remark ?? null })
            }
            calculateResult()
        } catch (error) {

        }
    }


    const callBackPickBusinessPartners = async (data) => {
        try {

            console.log("data", data)
            let businessPartnerData = await getShopBusinessPartnersDataListAll()
            setShopBusinessPartners(businessPartnerData)
            let _model = {
                bus_partner_id: data.id
            }
            await form.setFieldsValue(_model)
            handleCancelBusinessPartnersDataModal()
        } catch (error) {
            console.log("callBackPickBusinessPartners", error)
        }
    }

    const handleOpenBusinessPartnersDataModal = () => {
        try {
            setIsBusinessPartnersDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelBusinessPartnersDataModal = () => {
        try {
            setIsBusinessPartnersDataModalVisible(false)
        } catch (error) {

        }
    }


    /*End Debounce Select and Clear */
    return (
        <>

            {/* <div className="head-line-text" >{GetIntlMessages("ใบนำเข้า")} </div> */}
            <div className="detail-before-table">

                <Row gutter={[10]} style={{ marginTop: "10px" }}>
                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            // validateTrigger={['onChange', 'onBlur']}
                            name="bus_partner_id"
                            label={GetIntlMessages("รหัสผู้จำหน่าย")}
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล",
                                },
                            ]}
                        >
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                disabled={mode == "view" || expireEditTimeDisable == true || !!form.getFieldValue().purchase_order_number}
                                optionFilterProp="children"
                            // onChange={onChangeIdPartner}
                            // dropdownRender={menu =>
                            // (
                            //     <>
                            //         {menu}
                            //         {mode != "view" && expireEditTimeDisable !== true ? <Divider style={{ margin: '8px 0' }} /> : null}
                            //         {mode != "view" && expireEditTimeDisable !== true ?
                            //             <Space align="center" style={{ padding: '0 8px 4px' }}>
                            //                 <ComponentsSelectModalBusinessPartners mode={mode} form={form} callBackDataBusinessPartner={callBackDataBusinessPartner} />
                            //             </Space>
                            //             : null}
                            //     </>
                            // )}
                            >
                                {shopBusinessPartners.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.code_id}
                                    </Select.Option>
                                ))}

                            </Select>

                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Row>
                            <Col lg={20} md={20} sm={18} xs={18}>
                                <Form.Item
                                    // {...tailformItemLayout}
                                    validateTrigger={['onChange', 'onBlur']}
                                    name="bus_partner_id"
                                    label={GetIntlMessages("ชื่อผู้จำหน่าย")}
                                >
                                    <Select
                                        style={{ width: "98%" }}
                                        showSearch
                                        placeholder="เลือกข้อมูล"
                                        disabled={mode == "view" || expireEditTimeDisable == true || !!form.getFieldValue().purchase_order_number}
                                        optionFilterProp="children"
                                    // dropdownRender={menu =>
                                    // (
                                    //     <>
                                    //         {menu}
                                    //         {mode != "view" && expireEditTimeDisable !== true ? <Divider style={{ margin: '8px 0' }} /> : null}
                                    //         {mode != "view" && expireEditTimeDisable !== true ?
                                    //             <Space align="center" style={{ padding: '0 8px 4px' }}>
                                    //                 <ComponentsSelectModalBusinessPartners mode={mode} form={form} callBackDataBusinessPartner={callBackDataBusinessPartner} />
                                    //             </Space>
                                    //             : null}
                                    //     </>
                                    // )}

                                    // onChange={onChangeNamePartner}
                                    >
                                        {shopBusinessPartners.map((e, index) => (
                                            <Select.Option value={e.id} key={index}>
                                                {e.partner_name[locale.locale]}
                                            </Select.Option>
                                        ))}
                                    </Select>

                                </Form.Item>
                            </Col>

                            <Col lg={4} md={4} sm={6} xs={6} style={{ paddingTop: "30.8px", justifyContent: "end" }}>
                                <Form.Item >
                                    <Button
                                        type='primary'
                                        style={{ width: "100%", borderRadius: "10px" }}
                                        onClick={() => handleOpenBusinessPartnersDataModal()}
                                    >
                                        เลือก
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={12} lg={4} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="bus_partner_id"
                            label={GetIntlMessages("เลขประจำตัวผู้เสียภาษี")}
                        >
                            <Select
                                placeholder="เลือกข้อมูล"
                                // disabled={mode == "view"}
                                optionFilterProp="children"
                                disabled
                            // onChange={onChangeNamePartner}
                            >
                                {shopBusinessPartners.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {e.tax_id ? e.tax_id : "-"}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={12} lg={4} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="bus_partner_id"
                            label={GetIntlMessages("เบอร์โทรศัพท์")}
                        >
                            <Select
                                placeholder="เลือกข้อมูล"
                                // disabled={mode == "view"}
                                optionFilterProp="children"
                                disabled
                            // onChange={onChangeNamePartner}
                            >
                                {shopBusinessPartners.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {/* {e.mobile_no ? e.mobile_no.mobile_no_1 : "-"} */}
                                        {get(e.mobile_no, "mobile_no_1", "-")}
                                    </Select.Option>
                                ))}
                            </Select>

                        </Form.Item>
                    </Col>


                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="purchase_order_number"
                            label={GetIntlMessages("เลขใบสั่งซื้อสินค้า")}
                        >
                            {/* <Input placeholder="" disabled={mode == "view" || expireEditTimeDisable == true} /> */}
                            <Select
                                showSearch
                                placeholder="เลือกข้อมูล"
                                // disabled={mode == "view"}
                                optionFilterProp="children"
                                // filterOption={false}
                                disabled={mode == "view" || expireEditTimeDisable == true}
                                // onChange={onChangeNamePartner}
                                onSearch={(value) => debounceSearchPurchaseOrder(value, "search")}
                                onSelect={(value) => debouncePurchaseOrder(value, "select")}
                                onClear={(value) => debouncePurchaseOrder(value, "clear")}
                                help={loadingSearch ? "กำลังโหลดข้อมูล..กรุณารอสักครู่" : null}
                                notFoundContent={loadingSearch ? <span>"กำลังโหลดข้อมูล..กรุณารอสักครู่"</span> : null}
                                allowClear
                            >
                                {getArrListValue("purchase_order_number_list").map((e, i) => <Select.Option value={e.id} key={`purchase_order_number-${i}-${e.id}`}>{get(e, `code_id`, "-")}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }} hidden>
                        <Form.Item
                            name="purchase_order_number_list"
                        />
                    </Col>



                    <div hidden>
                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="bus_partner_id"
                                label={GetIntlMessages("ระยะเวลาเครดิต")}
                            >
                                <Select
                                    placeholder="เลือกข้อมูล"
                                    // disabled={mode == "view"}
                                    optionFilterProp="children"
                                    disabled
                                // onChange={onChangeNamePartner}
                                >
                                    {shopBusinessPartners.map((e, index) => (
                                        <Select.Option value={e.id} key={index}>
                                            {e.other_details.period_credit ? e.other_details.period_credit : "-"}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="bus_partner_id"
                                label={GetIntlMessages("วงเงินอนุมัติ")}
                            >
                                <Select
                                    placeholder="เลือกข้อมูล"
                                    // disabled={mode == "view"}
                                    optionFilterProp="children"
                                    disabled
                                // onChange={onChangeNamePartner}
                                >
                                    {shopBusinessPartners.map((e, index) => (
                                        <Select.Option value={e.id} key={index}>
                                            {e.other_details.approval_limit ? e.other_details.approval_limit : "-"}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                            <Form.Item
                                {...tailformItemLayout}
                                validateTrigger={['onChange', 'onBlur']}
                                name="credit_balance"
                                label={GetIntlMessages("เครดิตคงเหลือ")}
                            >
                                <Input placeholder="" disabled={mode == "view" || expireEditTimeDisable == true} />
                            </Form.Item>
                        </Col>

                    </div>

                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="References_doc"
                            label={GetIntlMessages("เอกสารอ้างอิง")}
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล",
                                },
                            ]}
                        >
                            <Input placeholder="" disabled={mode == "view"} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="tax_type"
                            label={GetIntlMessages("tax-type")}
                        >
                            <Select
                                placeholder="เลือกข้อมูล"
                                disabled={mode == "view"}
                                optionFilterProp="children"
                                onChange={() => isFunction(calculateResult) ? calculateResult() : null}
                            >
                                {taxTypeAllList.map((e, index) => (
                                    <Select.Option value={e.id} key={`tax-type-${e.id}`}>
                                        {e.type_name[locale.locale]}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="tax_type"
                            label={GetIntlMessages("tax-rate-percent")}
                        >
                            <Select
                                placeholder="เลือกข้อมูล"
                                optionFilterProp="children"
                                disabled
                            >

                                {taxTypeAllList.map((e, index) => (
                                    <Select.Option value={e.id} key={`tax-type-${e.id}`}>
                                        {e.detail['tax_rate_percent']}
                                    </Select.Option>

                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={4} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            name="is_inv"
                            label={
                                <>
                                    {"สถานะใบกำกับภาษี"}
                                    < Tooltip
                                        title="สถานะบ่งบอกว่าเอกสารใบรับเข้าใบนี้ มีเลขที่เอกสารอ้างอิง เป็นเลขที่ใบกำกับภาษีที่ออกจากทางผู้จำหน่าย">
                                        <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                    </Tooltip>
                                </>
                            }
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล",
                                },
                            ]}
                        >
                            <Select
                                disabled={mode == "view"}
                                options={[
                                    {
                                        value: true,
                                        label: 'ใช่',
                                    },
                                    {
                                        value: false,
                                        label: 'ไม่ใช่',
                                    },
                                ]}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={4} xxl={4} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="tax_period"
                            label={GetIntlMessages("ยื่นภาษีรวมในงวดที่")}
                            rules={[
                                {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล",
                                },
                            ]}
                        >
                            <DatePicker picker="month" disabled={mode == "view"} format={"MM/YYYY"} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={8}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="doc_date"
                            label={GetIntlMessages("วันที่อ้างอิง")}

                        >
                            <DatePicker disabled={mode == "view" || expireEditTimeDisable == true} format={'DD/MM/YYYY'} style={{ width: "100%" }} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
                            validateTrigger={['onChange', 'onBlur']}
                            name="user_id"
                            label={GetIntlMessages("ผู้ทำเอกสาร")}
                        >
                            <Select
                                placeholder="เลือกข้อมูล"
                                // disabled={mode == "view" || expireEditTimeDisable == true}
                                optionFilterProp="children"
                                disabled
                            >
                                {userList.map((e) => <Select.Option key={`user-${e.id}`} value={e.id}>{e.name}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row >
            </div >
            <Modal
                maskClosable={false}
                open={isBusinessPartnersDataModalVisible}
                onCancel={handleCancelBusinessPartnersDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelBusinessPartnersDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {<BusinessPartnersData title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackPickBusinessPartners} />}
            </Modal>
        </>
    )
}

const FormWarehouse = ({ name, index, form, expireEditTimeDisable, mode, getArrValue, dataList, pageId, visibleEachWarehouseMovementModal, configShowMovementBtn, dropDownBtnWarehouse, callbackSelectProduct }) => {
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { getShelfDataAll } = dataList
    const configColSpace = (pageId === "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode === "view" && configShowMovementBtn === true) ? true : false



    useEffect(() => {
        try {
            if (callbackSelectProduct !== undefined) {
                if (!callbackSelectProduct) {
                    const { product_list } = form.getFieldValue()
                    product_list[0].warehouse_detail[0].warehouse = getShelfDataAll[0].id
                    product_list[0].warehouse_detail[0].shelf = getShelfDataAll[0].shelf[0].code
                    form.setFieldsValue({ product_list })
                }
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }, [getShelfDataAll])



    const getArrWarehouse = (index1, index2) => {
        const fomeValue = form.getFieldValue();
        const warehouse_detail = fomeValue.product_list[index1].warehouse_detail[index2];
        const arr = warehouse_detail ? warehouse_detail.getShelfDataAll : [];
        let newArr
        if (warehouse_detail) {
            // console.log('view',warehouse_detail.warehouse)
            newArr = getShelfDataAll?.find(where => where.id == warehouse_detail.warehouse)
            // console.log('arr warehouse_detail.warehouse', newArr)
            arr = newArr ? newArr.shelf : []
        }
        return arr ?? []

    }

    const onChangeWarehouse = (index1, index2, value) => {
        const arr = getShelfDataAll.find(where => where.id == value)
        // console.log('arr', arr)
        const formValue = form.getFieldValue()
        formValue.product_list[index1].warehouse_detail[index2].getShelfDataAll = arr ? arr.shelf : [];
        formValue.product_list[index1].warehouse_detail[index2].shelf = null;
        form.setFieldsValue(formValue)
    }


    const addWarehouse = (index, add) => {
        const formValue = form.getFieldValue();
        const warehouse_detail = formValue.product_list[index]

        if (warehouse_detail.warehouse_detail) {
            if (warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1]) {
                const warehouse = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].warehouse;
                const shelf = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].shelf ?? null;
                const getShelfDataAll = warehouse_detail.warehouse_detail[warehouse_detail.warehouse_detail.length - 1].getShelfDataAll;
                const defaultValue = { warehouse, getShelfDataAll, shelf, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            } else {
                const defaultValue = { warehouse: getShelfDataAll[0].id ?? null, shelf: getShelfDataAll[0].shelf[0].code ?? null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
                add(defaultValue)
            }
        } else {
            const defaultValue = { warehouse: getShelfDataAll[0].id ?? null, shelf: getShelfDataAll[0].shelf[0].code ?? null, amount: null, purchase_unit_id: warehouse_detail.unit ? warehouse_detail.unit : null, dot_mfd: null }
            add(defaultValue)
        }
    }
    const responsiveTable = {
        name: {
            xs: 12,
            sm: 6,
            md: 6,
            lg: 8
        },
        other: {
            xs: 6,
            sm: 3,
            md: 3,
            lg: 2
        },
        button: {
            xs: 4,
            sm: 2,
            md: 2,
            lg: 1
        }
    }
    return (
        <Form.Item
            // label=" "
            name={name}
        >
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>

                        {fields.map((field, i) => (
                            <Form.Item
                                required={false}
                                key={field.key}
                            >
                                <Row gutter={[10, 10]}>
                                    <Col xs={responsiveTable.name.xs} sm={responsiveTable.name.sm} md={responsiveTable.name.md} lg={responsiveTable.name.lg} style={{ width: "100%" }}>
                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "warehouse"]}
                                            fieldKey={[field.fieldKey, "warehouse"]}
                                            label={i >= 1 ? "" : GetIntlMessages("warehouses")}
                                            className='form-warehouse'
                                        // rules={[
                                        //     {
                                        //         required: true,
                                        //         message: "กรุณากรอก",
                                        //     },
                                        // ]}
                                        >
                                            {/* <Input placeholder="คลังที่อยู่" disabled={mode == "view"} /> */}
                                            <Select
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                                onChange={(value) => onChangeWarehouse(index, i, value)}
                                            >

                                                {getShelfDataAll?.map((e, index) => (
                                                    <Select.Option value={e.id} key={index}>
                                                        {e.name[locale.locale]}
                                                    </Select.Option>

                                                ))}
                                            </Select>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={responsiveTable.name.xs} sm={responsiveTable.name.sm} md={responsiveTable.name.md} lg={responsiveTable.name.lg} style={{ width: "100%" }}>

                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "shelf"]}
                                            fieldKey={[field.fieldKey, "shelf"]}
                                            label={i >= 1 ? "" : GetIntlMessages("shelf")}
                                            className='form-warehouse'
                                        // rules={[
                                        //     {
                                        //         required: true,
                                        //         message: "กรุณากรอก",
                                        //     },
                                        // ]}
                                        >
                                            {/* <Input placeholder="ชั้นวางสินค้า" disabled={mode == "view"} /> */}
                                            <Select
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                            //  onChange={(value)=>onChangeWareHouse(index,index2,value)}
                                            >
                                                {getArrWarehouse(index, i).map(e => <Select.Option value={e.code}>{e.name[locale.locale]}</Select.Option>)}
                                            </Select>

                                        </Form.Item>
                                    </Col>

                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>
                                        <FormSelectDot name={[field.name, "dot_mfd"]} importedComponentsLayouts={tailformItemLayout} disabled={mode == "view" || expireEditTimeDisable == true} form={form} index={i} />
                                    </Col>

                                    {/* {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                        : */}
                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>

                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "purchase_unit_id"]}
                                            fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                            label={i >= 1 ? "" : GetIntlMessages("purchase-unit")}
                                            className='form-warehouse'
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "กรุณากรอก",
                                                },
                                            ]}
                                        >
                                            <Select
                                                // showSearch

                                                showArrow={false}
                                                placeholder="เลือกข้อมูล"
                                                optionFilterProp="children"
                                                disabled={mode == "view" || expireEditTimeDisable == true}
                                                open={false}
                                            // onChange={(value) => onChangeUnit(index, value)}
                                            >
                                                {getArrValue(index, "unit_list").map((e, i) => <Select.Option value={e.id} key={i}>{get(e, `type_name.${locale.locale}`, "-")}</Select.Option>)}
                                            </Select>
                                        </Form.Item>

                                    </Col>
                                    {/* } */}


                                    {/* {showDot(index, i) == tireProductTypeGroupId ?
                                        <Col span={5} style={{ width: "100%" }}>
                                            <Form.Item
                                                {...tailformItemLayout}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "dot_mfd"]}
                                                fieldKey={[field.fieldKey, "dot_mfd"]}
                                                label='dot_mfd'
                                            // rules={[
                                            //     {
                                            //         required: true,
                                            //         message: "กรุณากรอก",
                                            //     },
                                            // ]}
                                            >
                                                <Input placeholder="dot_mfd" disabled={mode == "view" || expireEditTimeDisable == true} />
                                            </Form.Item>
                                        </Col>
                                        : null
                                    } */}

                                    <Col xs={responsiveTable.other.xs} sm={responsiveTable.other.sm} md={responsiveTable.other.md} lg={responsiveTable.other.lg} style={{ width: "100%" }}>
                                        <Form.Item
                                            {...tailformItemLayout}
                                            validateTrigger={['onChange', 'onBlur']}
                                            name={[field.name, "amount"]}
                                            fieldKey={[field.fieldKey, "amount"]}
                                            label={i >= 1 ? "" : GetIntlMessages("amount")}
                                            className='form-warehouse'
                                        >
                                            <Input type="number" placeholder="จำนวน" disabled={mode == "view" || expireEditTimeDisable == true} />
                                        </Form.Item>
                                    </Col>

                                    <>
                                        {pageId === "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode === "view" && configShowMovementBtn === true ?
                                            <>
                                                <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} style={{ width: "100%", paddingTop: i >= 1 ? "" : "40px" }}>
                                                    <Button type='link' icon={<TableOutlined style={{ fontSize: 20 }} />} style={{ width: "100%" }} onClick={() => visibleEachWarehouseMovementModal(index, i)} />
                                                </Col>
                                                <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} style={{ width: "100%", paddingTop: i >= 1 ? "" : "40px" }} hidden={isFunction(callbackSelectProduct) ? false : true}>
                                                    <Button type='link' onClick={() => callbackSelectProduct(form.getFieldValue(), index, i)} icon={<ShoppingCartOutlined style={{ fontSize: 26, color: "green" }} />} style={{ width: "100%" }} />
                                                </Col>
                                            </>

                                            :
                                            <Col xs={responsiveTable.button.xs} sm={responsiveTable.button.sm} md={responsiveTable.button.md} lg={responsiveTable.button.lg} style={{ width: "100%", paddingTop: i >= 1 ? "" : "40px" }}>
                                                {fields.length > 1 && mode != "view" && expireEditTimeDisable !== true ? (
                                                    <MinusCircleOutlined
                                                        className="dynamic-delete-button"
                                                        style={{ fontSize: 18, paddingLeft: 10 }}
                                                        onClick={() => remove(field.name)}
                                                    />
                                                ) : null}
                                            </Col>
                                        }
                                    </>

                                </Row>
                            </Form.Item>

                        ))}


                        {mode !== "view" && expireEditTimeDisable !== true ?
                            <Form.Item>
                                <Col style={{ display: "flex", justifyContent: "center" }}>
                                    <Button style={{ width: "30%" }} type="dashed" onClick={() => addWarehouse(index, add)} block icon={<PlusOutlined />}>
                                        {GetIntlMessages("add-data")}{GetIntlMessages("warehouses")}
                                    </Button>
                                </Col>
                            </Form.Item>
                            : null
                        }


                    </>
                )}

            </Form.List>
        </Form.Item>

    )
}

const ImportDocAddEditViewModal = ({ isAllBranch = false, shopArr = null, form, mode, expireDate, pageId, getShopBusinessPartners, visibleEachWarehouseMovementModal, calculateResult, setLoading, shopId, configShowMovementBtn = true, dropDownBtnWarehouse = false, callbackSelectProduct }) => {

    useEffect(() => {
        getMasterData()
    }, [])

    useEffect(() => {
        checkPage()
    }, [expireDate, mode])

    const { tax_type } = form.getFieldValue()

    useEffect(() => {
        calculateTable()
    }, [tax_type])

    // const calculateFuction = {
    //     summary: summary
    // }
    const [loadingSearch, setLoadingSearch] = useState(false)

    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { taxTypes } = useSelector(({ master }) => master);
    const [isProductDataModalVisible, setIsProductDataModalVisible] = useState(false);
    const [listIndex, setListIndex] = useState(0);

    const [expireEditTimeDisable, setExpireEditTimeDisable] = useState(false)

    const checkPage = () => {
        //a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0 -> รายการสินค้า คงเหลือ
        if (pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add") {
            setExpireEditTimeDisable(true)
        } else {
            setExpireEditTimeDisable(expireDate)
        }
    }

    /**
* Get the value of the array field at the specified index
* @param {number} index - The index of the array.
* @param {string} type - The type of the field.
* @returns The `getArrListValue` function returns an array of values.
*/
    const getArrListValue = (type) => {
        try {
            const watchData = Form.useWatch(type, form)
            return isArray(watchData) ? watchData ?? [] : []
        } catch (error) {
            // console.log('error getArrListValue:>> ', error);
        }
    }

    const [modalAddPartnerVisible, setModalAddPartnerVisible] = useState(false)
    const [businessTypeList, setBusinessTypeList] = useState([])
    const [shopBusinessPartnersList, setShopBusinessPartners] = useState([])
    const [documentTypesList, setDocumentTypes] = useState([])
    const [taxTypeAllList, setTaxTypeAllList] = useState([])
    const [userList, setUserList] = useState([])
    const [getShelfDataAll, setgetShelfDataAll] = useState([]);

    const dataList = {
        shopBusinessPartnersList,
        taxTypeAllList,
        userList,
        getShelfDataAll
    }

    const getMasterData = async () => {
        try {
            const promise1 = getBusinessTypeDataListAll()
            const promise2 = getShopBusinessPartnersDataListAll()
            const promise3 = getTaxType()
            const promise4 = getUser()
            const promise5 = getShelfData()
            const [value1, value2, value3, value4, value5] = await Promise.all([promise1, promise2, promise3, promise4, promise5])
            setBusinessTypeList(() => value1)
            setShopBusinessPartners(() => value2)
            setTaxTypeAllList(() => value3)
            setgetShelfDataAll(() => value5)
            if (isArray(value4)) {
                const new_data = [];

                value4.forEach(e => {
                    const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                    if (isPlainObject(authUser.UsersProfile)) {
                        // console.log('authUser.UsersProfile', authUser.UsersProfile)
                        const { shop_id } = authUser.UsersProfile;
                        // console.log('shop_id', shop_id , e.shop_id)
                        if (fname && lname) {
                            new_data.push({
                                id: e.id,
                                name: `${fname} ${lname}`,
                                groups: e.Groups
                            })
                        }
                    }

                })

                setUserList(new_data);
            }
        } catch (error) {
            // console.log('error getMasterData :>> ', error);
        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }
    const getShopBusinessPartnersDataListAll = async (search = "") => {
        const { data } = await API.get(`/shopBusinessPartners/all?${search != "" ? `search=${search}&` : ""}limit=9999&page=1&sort=partner_name.th&order=asc&status=default`)
        // console.log('data.data shopBusinessCustomers', data.data.data)
        return data.data.data
    }

    const getShopProduct = async (id) => {
        const { data } = await API.get(`/shopProducts/byid/${id}`)
        return data.status == "success" ? isArray(data.data) ? data.data[0] : null : null
    }
    const getTaxType = async () => {
        try {
            const { data } = await API.get(`/master/taxTypes/all?sort=code_id&order=asc`)
            return data.data ?? []
        } catch (error) {
            // console.log('error getTaxType :>> ', error);
        }

    }
    const getUser = async () => {
        const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
        // console.log('data getUser', data)
        return data.status == "success" ? data.data.data : []
    }
    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        try {
            if (shopArr !== null && isArray(shopArr)) {
                let data_ = []
                for (let index = 0; index < shopArr.length; index++) {
                    const element = shopArr[index];
                    const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc&shop_id=${element.id}&select_shop_ids=${element.id}`)
                    // data_.push(data.data.data)
                    for (let index1 = 0; index1 < data.data.data.length; index1++) {
                        const element1 = data.data.data[index1];
                        data_.push(element1)

                    }
                }
                // console.log(data_)
                return data_
            } else {
                const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc${(shopId != null) ? '&shop_id=' + shopId : ''}${(shopId != null) ? '&select_shop_ids=' + shopId : ''}`)
                return data.data.data ?? []
            }
        } catch (error) {
            // console.log('error getShelfData:>> ', error);
        }


    }

    const checkDocumentCreatedDate = () => {
        try {
            if (mode !== "add") {
                const { doc_date } = form.getFieldValue()
                const fixDate = new Date("January 12, 2023").getTime()
                const currentDocumentDate = new Date(doc_date).getTime()
                if (fixDate > currentDocumentDate) return true
                else return false
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }

    }



    const addNewProductList = (add) => {
        if (add && isFunction(add)) {
            // const defaultValue = { product_id: null, amount_all: null, price: null, total_price: null, discount_3_type: "bath", warehouse_detail: [], productId_list: [] }
            const defaultValue = {
                product_id: null,
                product_name: null,
                amount_all: null, price: 0,
                total_price: 0,
                discount_percentage_1: null,
                discount_percentage_2: null,
                discount_3: null,
                discount_3_type: "bath",
                price_discount_total: null,
                warehouse_detail: [
                    {
                        amount: null,
                        dot_mfd: null,
                        purchase_unit_id: null,
                        shelf: null,
                        warehouse: null,
                    }
                ],
                productId_list: []
            }

            add(defaultValue)
        }
    }

    const [checkTaxType, setCheckTaxType] = useState("8c73e506-31b5-44c7-a21b-3819bb712321")

    const onChangeProductId = async (index, value) => {
        try {
            console.log('value', value)
            const ShopProduct = await getShopProduct(value);
            const { product_list } = form.getFieldValue()
            product_list[index].unit = null
            product_list[index].warehouse_detail.map((e, index) => e.purchase_unit_id = null)
            // let unit_list_arr
            if (product_list[index].product_id) {
                console.log("ShopProduct", ShopProduct)
                product_list[index].ProductTypeGroupId = ShopProduct.Product.ProductType ? ShopProduct.Product.ProductType.type_group_id : null
                const unit_list_arr = ShopProduct.Product.ProductType.ProductPurchaseUnitTypes
                product_list[index].unit_list = unit_list_arr ? unit_list_arr ?? [] : []
                const find = ShopProduct.Product.ProductType.ProductPurchaseUnitTypes.find(where => { return where.id === purchaseUnitTypeTire || where.id === purchaseUnitTypeService || where.id === purchaseUnitTypeBattery })
                product_list[index].unit = isPlainObject(find) ? find.id : null

                product_list[index].warehouse_detail = isArray(product_list[index].warehouse_detail) && product_list[index].warehouse_detail.length > 0 ?
                    product_list[index].warehouse_detail.map(e => { return { ...e, purchase_unit_id: find?.id ?? null } }) : []

                form.setFieldsValue({ product_list });
            } else {
                null
            }
        } catch (error) {
            console.log('error', error)
        }

    }

    const onChangeUnit = (index, value) => {

        const { product_list } = form.getFieldValue()

        product_list[index].warehouse_detail.forEach((e, index) => {
            e.amount = e.amount,
                e.dot_mfd = e.dot_mfd,
                e.purchase_unit_id = value,
                e.shelf = e.shelf,
                e.warehouse = e.warehouse

        })
        form.setFieldsValue({ product_list })
    }

    const debounceOnSearch = debounce((index, value) => handleSearchProduct(index, value), 1000)

    const handleSearchProduct = async (index, value) => {
        const { product_list } = form.getFieldValue()
        if (product_list && isArray(product_list)) {
            const { data } = await API.get(`/shopProducts/all?search=${value}&limit=20&page=1&sort=start_date&order=desc&status=active`);
            // console.log('data :>> ', data);
            const newData = SortingData(data.data.data, `Product.product_name.${locale.locale}`)
            product_list[index].productId_list = data.status == "success" ? newData : []
        }


        form.setFieldsValue({ product_list })
    }

    const getArrValue = (index, type) => {
        try {
            const { product_list } = form.getFieldValue()
            return isArray(product_list) ? product_list[index][type] ?? [] : []
        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const calculateVatPerItem = (val) => {
        const { tax_type } = form.getFieldValue()
        const { detail } = taxTypes.find(where => where.id === tax_type)
        let taxRate = 0, price_vat = 0
        if (Number(detail.tax_rate_percent) > 9) {
            taxRate = Number(`1${detail.tax_rate_percent}`)
        } else {
            taxRate = Number(`10${detail.tax_rate_percent}`)
        }

        switch (tax_type) {
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

    const calculateTable = (index, type, value) => {
        try {
            const newValue = value !== "" && value !== undefined ? value.replaceAll(",", "") : "0"
            const formValue = form.getFieldValue()
            const { tax_type, product_list } = formValue
            const validate = newValue.match(new RegExp(/^[\.0-9]*$/)) //match แค่ตัวเลขกับจุด(.) เท่านั้น
            let total_price = 0,
                price_discount_percent = 0,
                price_unit = 0,
                price_discount = 0,
                price_discount_total = 0,
                amount = 0,
                price_grand_total = 0,
                price_unit_vat = 0,
                price_unit_before_vat = 0,
                price_unit_add_vat = 0,
                price_discount_for_cal = 0
            // if (validate != null && validate["input"].length != 0) {
            switch (type) {
                case "price":
                    price_unit = Number(newValue) ?? 0
                    amount = Number(product_list[index]["amount_all"]) ?? 0
                    total_price = price_unit * amount ?? 0
                    price_discount = Number(product_list[index]["price_discount"] ?? 0)
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %
                    price_discount_total = price_discount * amount ?? 0
                    price_grand_total = total_price - price_discount_total

                    price_discount_for_cal = newValue <= 0 ? 0 : Number(product_list[index]["price_discount_for_cal"] ?? 0)
                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = tax_type === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = tax_type !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    product_list[index]["amount_all"] = MatchRound(amount)
                    product_list[index]["price"] = MatchRound(price_unit)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["total_price"] = MatchRound(total_price)
                    product_list[index]["price_discount_total"] = MatchRound(price_discount_total)
                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    product_list[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "amount_all":
                    price_unit = Number(product_list[index]["price"]) ?? 0
                    amount = Number(newValue) ?? 0
                    total_price = price_unit * amount ?? 0
                    price_discount = Number(product_list[index]["price_discount"] ?? 0)
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %
                    price_discount_total = price_discount * amount ?? 0
                    price_grand_total = total_price - price_discount_total

                    price_discount_for_cal = newValue <= 0 ? 0 : Number(product_list[index]["price_discount_for_cal"] ?? 0)
                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = tax_type === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = tax_type !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    product_list[index]["amount_all"] = MatchRound(amount)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["total_price"] = MatchRound(total_price)
                    product_list[index]["price_discount_total"] = MatchRound(price_discount_total)
                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = product_list[index]["is_discount_by_percent"] ?? false
                    product_list[index]["is_discount_by_bath"] = product_list[index]["is_discount_by_bath"] ?? false
                    product_list[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "price_discount":
                    price_unit = Number(product_list[index]["price"]) ?? 0
                    amount = Number(product_list[index]["amount_all"]) ?? 0
                    total_price = price_unit * amount ?? 0
                    price_discount = Number(newValue) ?? 0
                    price_discount_percent = ((price_discount / price_unit) * 100) //แปลงเป็น %
                    price_discount_total = price_discount * amount ?? 0
                    price_grand_total = total_price - price_discount_total
                    price_discount_for_cal = newValue <= 0 ? 0 : Number(product_list[index]["price_discount_for_cal"] ?? 0)
                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = tax_type === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = tax_type !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0 || (!!price_discount && Number(price_discount) < 0.01)) {
                        product_list[index]["price_discount"] = null
                        product_list[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        product_list[index]["price_discount"] = MatchRound(price_discount)
                        product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    product_list[index]["amount_all"] = MatchRound(amount)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["total_price"] = MatchRound(total_price)
                    product_list[index]["price_discount_total"] = MatchRound(price_discount_total)
                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = false
                    product_list[index]["is_discount_by_bath"] = value > 0 ? true : false
                    product_list[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                case "price_discount_percent":
                    price_unit = Number(product_list[index]["price"]) ?? 0
                    amount = Number(product_list[index]["amount_all"]) ?? 0
                    total_price = price_unit * amount ?? 0
                    price_discount_percent = Number(newValue) ?? 0
                    price_discount = ((price_unit * price_discount_percent) / 100) // แปลง % เป็น บาท type -> number
                    price_discount_total = price_discount * amount ?? 0
                    price_grand_total = total_price - price_discount_total

                    price_unit_vat = calculateVatPerItem(price_unit)
                    price_unit_before_vat = tax_type === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                    price_unit_add_vat = tax_type !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                    if ((!!price_discount_percent && Number(price_discount_percent) < 0.01) || price_unit === 0 || (!!price_discount && Number(price_discount) < 0.01)) {
                        product_list[index]["price_discount"] = null
                        product_list[index]["price_discount_percent"] = null
                        price_discount = null
                        price_discount_percent = null
                        Swal.fire({
                            icon: 'warning',
                            title: GetIntlMessages("warning"),
                            text: GetIntlMessages("จำนวนเปอร์เซ็นมีค่าน้อยกว่า 0.01 หรือ ราคาต่อหน่วยเป็น 0"),
                        })
                    } else {
                        product_list[index]["price_discount"] = MatchRound(price_discount)
                        product_list[index]["price_discount_percent"] = MatchRound(price_discount_percent)
                        product_list[index]["price_grand_total"] = MatchRound(price_grand_total)
                    }

                    product_list[index]["amount_all"] = MatchRound(amount)
                    product_list[index]["price_unit"] = MatchRound(price_unit)
                    product_list[index]["total_price"] = MatchRound(total_price)
                    product_list[index]["price_discount_total"] = MatchRound(price_discount_total)
                    product_list[index]["price_grand_total"] = MatchRound(price_grand_total)

                    product_list[index]["is_discount"] = price_unit < 0 ? true : false
                    product_list[index]["price_unit_vat"] = MatchRound(price_unit_vat)
                    product_list[index]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                    product_list[index]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                    product_list[index]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                    product_list[index]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                    product_list[index]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                    product_list[index]["is_discount_by_percent"] = value > 0 ? true : false
                    product_list[index]["is_discount_by_bath"] = false
                    product_list[index]["price_discount_for_cal"] = price_discount_for_cal
                    break;
                default:
                    console.log("")
                    for (let i = 0; i < product_list.length; i++) {
                        // console.log("product_list[i]", product_list[i])
                        amount = Number(product_list[i]["amount_all"] ?? 0)
                        price_unit = Number(product_list[i]["price"] ?? 0)
                        price_discount_for_cal = Number(product_list[i]["price_discount_for_cal"] ?? 0)
                        price_discount = product_list[i]["is_discount_by_percent"] === true ? (price_discount_for_cal === 0 ? Number(product_list[i]["price_discount"]) : price_discount_for_cal) : Number(product_list[i]["price_discount"] ?? 0)

                        price_grand_total = (price_unit - price_discount) * amount

                        price_unit_vat = calculateVatPerItem(price_unit)
                        price_unit_before_vat = taxTypes === "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit - price_unit_vat : 0
                        price_unit_add_vat = taxTypes !== "8c73e506-31b5-44c7-a21b-3819bb712321" ? price_unit + price_unit_vat : 0

                        product_list[i]["price_grand_total"] = MatchRound(price_grand_total)

                        product_list[i]["is_discount"] = price_unit < 0 ? true : false
                        product_list[i]["price_unit_vat"] = MatchRound(price_unit_vat)
                        product_list[i]["price_unit_before_vat"] = MatchRound(price_unit_before_vat)
                        product_list[i]["price_unit_add_vat"] = MatchRound(price_unit_add_vat)
                        product_list[i]["price_grand_total_vat"] = MatchRound(price_unit_vat * amount)
                        product_list[i]["price_grand_total_before_vat"] = MatchRound(price_unit_before_vat * amount)
                        product_list[i]["price_grand_total_add_vat"] = MatchRound(price_unit_add_vat * amount)

                        product_list[i]["is_discount_by_percent"] = product_list[i]["is_discount_by_percent"] ?? false
                        product_list[i]["is_discount_by_bath"] = product_list[i]["is_discount_by_bath"] ?? false
                        product_list[i]["price_discount_for_cal"] = price_discount_for_cal
                    }
                    break;
            }

            console.log("product_listsss", product_list)
            form.setFieldsValue({
                product_list,
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
                },
            })

            calculateResult()
            // form.setFieldsValue({ product_list })
            // summary(index)

        } catch (error) {
            console.log("error :", error)
        }
    }

    const summary = (index, stepsDiscountStatus) => {
        const formValue = form.getFieldValue()
        const { tax_type, product_list, tailgate_discount } = formValue
        // const { total_discount, total_price_all, vat, net_price, total_price_all_after_discount, tax_type, product_list } = formValue

        function replaceAllComma(val) {
            return isString(val) ? val.replaceAll(",", "") : val ?? 0
        }


        let total_price_all = 0, total_discount = 0, vat = 0, net_price = 0, total_amount_all = 0, total_price_all_after_discount = 0, total_after_discount = 0, total_before_vat = 0, price_discount_total = 0;

        product_list.forEach(e => {
            total_price_all += Number(replaceAllComma(e.total_price)) ?? 0
            total_discount += Number(replaceAllComma(e.price_discount_total)) ?? 0
            total_amount_all += Number(replaceAllComma(e.amount_all)) ?? 0
        });
        total_discount += Number(tailgate_discount ?? 0)

        total_after_discount = Number(total_price_all) - Number(total_discount)
        total_price_all = Number(total_price_all).toLocaleString(undefined, twoDigits)
        total_discount = Number(total_discount).toLocaleString(undefined, twoDigits)
        let findTax
        //8c73e506-31b5-44c7-a21b-3819bb712321 = รวม vat
        //fafa3667-55d8-49d1-b06c-759c6e9ab064 = ไม่รวม vat
        //52b5a676-c331-4d03-b650-69fc5e591d2c = ไม่คิด vat

        switch (tax_type) {
            case "8c73e506-31b5-44c7-a21b-3819bb712321":
                setCheckTaxType(tax_type)
                findTax = taxTypes.find(where => where.id === tax_type)
                net_price = Number(total_after_discount).toLocaleString(undefined, twoDigits)
                vat = (Number(replaceAllComma(net_price)) * (Number(findTax["detail"]["tax_rate_percent"]) / 107)).toLocaleString(undefined, twoDigits)

                total_price_all_after_discount = Number(Number(replaceAllComma(net_price)) - Number(replaceAllComma(vat))).toLocaleString(undefined, twoDigits)

                break;
            case "fafa3667-55d8-49d1-b06c-759c6e9ab064":
                setCheckTaxType(tax_type)
                findTax = taxTypes.find(where => where.id === tax_type)
                total_price_all_after_discount = Number(total_after_discount).toLocaleString(undefined, twoDigits)
                vat = (Number(replaceAllComma(total_price_all_after_discount)) * (Number(findTax["detail"]["tax_rate_percent"]) / 100)).toLocaleString(undefined, twoDigits)
                net_price = Number(Number(replaceAllComma(total_price_all_after_discount)) + Number(replaceAllComma(vat))).toLocaleString(undefined, twoDigits)

                break;
            case "52b5a676-c331-4d03-b650-69fc5e591d2c":
                setCheckTaxType(tax_type)
                findTax = taxTypes.find(where => where.id === tax_type)
                total_price_all_after_discount = Number(total_after_discount).toLocaleString(undefined, twoDigits)
                vat = Number(findTax["detail"]["tax_rate_percent"]).toLocaleString(undefined, twoDigits)
                net_price = Number(Number(replaceAllComma(total_price_all_after_discount)) + Number(replaceAllComma(vat))).toLocaleString(undefined, twoDigits)
                break;
            default:
                break;
        }
        // console.log("vatvatvat", vat)
        form.setFieldsValue({
            product_list,
            vat,
            net_price,
            total_price_all,
            total_price_all_after_discount,
            total_after_discount,
            total_discount,
        })

    }

    const inputElement = document.querySelector('#tailgate_discount');
    inputElement?.addEventListener('keydown', (event) => {
        const key = event.key;

        let value = event.target.value;
        if ((value.match(/\./g) || []).length >= 1) {
            const regexp = /^[^.]*$/;
            if (!regexp.test(key)) {
                event.preventDefault();
            }
        }

        const regex = /^[0-9]*\.?[0-9]*|\b-$/;
        if (!regex.test(inputElement.value + key) && !['Backspace', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
            event.preventDefault();
        }

    });

    const onDeleteProductList = async (remove, field, index) => {
        const formValue = form.getFieldValue()
        const { product_list, total_discount, total_price_all } = formValue

        const discountThb = []
        const totalPrice = []

        let resultDiscountThb
        let resultTotalPrice
        let total_discount_text
        let total_price_all_text

        if (remove && isFunction(remove)) {
            remove(field.name)
            product_list.splice(index, 1)
            product_list.forEach(items => {
                if (items.price_discount_total) {
                    discountThb.push(items.price_discount_total)
                }
                if (items.total_price) {
                    totalPrice.push(items.total_price)
                }
            })
            if (discountThb.length > 0) {
                resultDiscountThb = discountThb.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
                total_discount = MatchRound(resultDiscountThb)
                total_discount_text = resultDiscountThb.toLocaleString(undefined, twoDigits)
            }
            if (totalPrice.length > 0) {
                resultTotalPrice = totalPrice.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
                total_price_all = MatchRound(resultTotalPrice)
                total_price_all_text = Number(resultTotalPrice).toLocaleString(undefined, twoDigits)
            }

            form.setFieldsValue({ total_price_all, total_discount, total_discount_text, total_price_all_text })

            calculateResult()

        }
    }

    const addComma = (x) => {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

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
                calculateTable(indexCalVatPrice, "price", await inVatPrice,)
                break;
            case "exclude":
                calculateTable(indexCalVatPrice, "price", await exVatPrice,)
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

    const callBackProductPick = async (value, index) => {
        try {
            // const { product_list } = form.getFieldValue()
            // product_list[index].productId_list = [value]
            // form.setFieldsValue({ product_list })
            // onChangeProductId(index, value.id)
            handleCancelProductDataModal()
        } catch (error) {
            console.log("error", error)
        }
    }

    const handleCancelProductDataModal = () => {
        try {
            setIsProductDataModalVisible(false)
        } catch (error) {

        }
    }

    const setOpenProductDataModal = (index) => {
        setListIndex(index)
        setIsProductDataModalVisible(true)
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    const onChangeDiscountAll = (index, value) => {
        let discount_all = takeOutComma(value)
        const { product_list } = form.getFieldValue()
        let amount = product_list[index].amount_all
        let discount = MatchRound(discount_all / amount)
        product_list[index].price_discount = discount
        form.setFieldsValue({ product_list })
        calculateTable(index, "price_discount", discount)
    }
    return (
        <>
            {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add"
                ? null : < IncomeProduct form={form} mode={mode} expireEditTimeDisable={expireEditTimeDisable} dataList={dataList} calculateResult={calculateResult} getShopBusinessPartners={getShopBusinessPartners} loadingSearch={loadingSearch} setLoadingSearch={setLoadingSearch} getArrListValue={getArrListValue} setLoading={setLoading} getShopBusinessPartnersDataListAll={getShopBusinessPartnersDataListAll} />
            }

            <div className="head-line-text pt-3">{GetIntlMessages("คลังสินค้า")}</div>
            <div className="detail-before-table">
                <Form.Item
                    labelCol={24}
                    wrapperCol={24}
                    name="product_list"
                >
                    <Form.List name="product_list">
                        {(fields, { add, remove }) => (
                            <>
                                {
                                    fields.length === 0 ?
                                        <div style={{ fontSize: "1rem", textAlign: "center" }}>ขออภัย ไม่พบข้อมูล</div>
                                        :
                                        fields.map((field, index) => (
                                            <Form.Item
                                                required={false}
                                                key={field.key}
                                            >
                                                <Fieldset legend={(shopArr != null && shopArr.length > 0) ? `${shopArr[index]?.shop_name} (${shopArr[index]?.shop_local_name})` : `รายการที่ ${index + 1}`} style={{ width: `97vw` }}>

                                                    <Row style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-30px' }} hidden={isAllBranch ? false : true}>
                                                        <Col lg={8} md={12} xs={24} style={{ width: "100%", paddingBottom: 30, display: 'flex', justifyContent: 'flex-end' }}>
                                                            <span >
                                                                <Button icon={<TableOutlined style={{ fontSize: 20 }} />} onClick={() => visibleEachWarehouseMovementModal(index)} style={{ width: "100" }}>{GetIntlMessages("การเคลื่อนไหวของสินค้า")}</Button>
                                                            </span>
                                                        </Col>

                                                    </Row>
                                                    <Row gutter={[10]} >

                                                        <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "product_id"]}
                                                                fieldKey={[field.fieldKey, "product_id"]}
                                                                label={GetIntlMessages("รหัสสินค้า")}
                                                            >
                                                                <Select
                                                                    showSearch
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={mode == "view" || expireEditTimeDisable == true}
                                                                    onChange={(value) => onChangeProductId(index, value)}
                                                                    onSearch={(value) => debounceOnSearch(index, value)}
                                                                    filterOption={false}
                                                                    notFoundContent={null}
                                                                >
                                                                    {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e.id} key={i}>{get(e, `Product.master_path_code_id`, "-")}</Select.Option>)}
                                                                </Select>

                                                            </Form.Item>
                                                        </Col>

                                                        <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "product_id"]}
                                                                fieldKey={[field.fieldKey, "product_name"]}
                                                                label={GetIntlMessages("product-name")}
                                                            >

                                                                <Select
                                                                    showSearch
                                                                    placeholder="เลือกข้อมูล"
                                                                    optionFilterProp="children"
                                                                    disabled={mode == "view" || expireEditTimeDisable == true}
                                                                    onChange={(value) => onChangeProductId(index, value)}
                                                                    onSearch={(value) => debounceOnSearch(index, value)}
                                                                    filterOption={false}
                                                                    notFoundContent={null}
                                                                    dropdownMatchSelectWidth={false}
                                                                    style={{
                                                                        height: "auto",
                                                                        wordWrap: "break-word",

                                                                    }}
                                                                >
                                                                    {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e.id} key={i}>{get(e, `Product.product_name.${[locale.locale]}`, "-")}</Select.Option>)}
                                                                </Select>

                                                            </Form.Item>


                                                        </Col>

                                                        {!!form.getFieldValue()?.purchase_order_number ?
                                                            <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                                                                <Form.Item
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "changed_product_name"]}
                                                                    fieldKey={[field.fieldKey, "changed_product_name"]}
                                                                    label={GetIntlMessages("ชื่อสินค้าที่เปลี่ยน")}
                                                                >
                                                                    <Input disabled />
                                                                </Form.Item>
                                                            </Col>
                                                            : null}

                                                        <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>
                                                            <Form.Item
                                                                {...tailformItemLayout}
                                                                validateTrigger={['onChange', 'onBlur']}
                                                                name={[field.name, "amount_all"]}
                                                                fieldKey={[field.fieldKey, "amount_all"]}
                                                                label={GetIntlMessages("จำนวนทั้งหมด")}
                                                                rules={[
                                                                    {
                                                                        pattern: /^[\.0-9]*$/,
                                                                        message: "ตัวเลขเท่านั้น"
                                                                    },
                                                                    {
                                                                        required: true,
                                                                        message: "กรุณากรอก",
                                                                    },
                                                                ]}
                                                            >
                                                                <InputNumber style={{ width: "100%" }} step="1" stringMode placeholder="0" disabled={mode == "view" || expireEditTimeDisable == true}
                                                                    formatter={(value) => addComma(value)}
                                                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                    onBlur={(value) => calculateTable(index, "amount_all", value.target.value)}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>

                                                                <Form.Item
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price"]}
                                                                    fieldKey={[field.fieldKey, "price"]}
                                                                    label={GetIntlMessages("ราคา/หน่วย")}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "กรุณากรอก",
                                                                        },
                                                                        { pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]} //pattern -> match แค่ตัวเลข,จุด(.)และ comma(,) เท่านั้น
                                                                >
                                                                    <InputNumber
                                                                        style={{ width: "100%" }}
                                                                        step="1"
                                                                        precision={2}
                                                                        className='ant-input-number-after-addon-20-percent'
                                                                        stringMode
                                                                        placeholder="0"
                                                                        disabled={mode == "view"}
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onBlur={(value) => calculateTable(index, "price", value.target.value)}
                                                                        addonAfter={
                                                                            <Button
                                                                                disabled={mode == "view"}
                                                                                type='text'
                                                                                size='small'
                                                                                style={{ border: 0 }}
                                                                                onClick={() => showModalCalVat(index)} >
                                                                                <CalculatorOutlined />
                                                                            </Button>
                                                                        }
                                                                    />
                                                                </Form.Item>


                                                            </Col>
                                                        }

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>

                                                                <Form.Item
                                                                    {...field}
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price_discount_percent"]}
                                                                    label={GetIntlMessages("ส่วนลดต่อรายการ (เปอร์เซ็น)")}
                                                                    rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("only-number") }]}
                                                                >
                                                                    <InputNumber
                                                                        style={{ width: "100%" }}
                                                                        min={0}
                                                                        max={100}
                                                                        status
                                                                        placeholder={"ส่วนลดต่อรายการ (เปอร์เซ็น)"}
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onBlur={(value) => isFunction(calculateTable) ? calculateTable(index, "price_discount_percent", value.target.value) : null}
                                                                        disabled={mode == "view"}
                                                                        stringMode
                                                                        step={"0.01"}
                                                                        precision={2}
                                                                        addonAfter={`%`}
                                                                        className='ant-input-number-after-addon-20-percent'
                                                                    />

                                                                </Form.Item>
                                                            </Col>
                                                        }

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>

                                                                <Form.Item
                                                                    {...field}
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price_discount"]}
                                                                    label={GetIntlMessages("ส่วนลดต่อรายการ (บาท)")}
                                                                    rules={[{ pattern: /^(?!,$)[\d,.]+$/, message: GetIntlMessages("only-number") }]}
                                                                >
                                                                    <InputNumber
                                                                        style={{ width: "100%" }}
                                                                        min={0}
                                                                        max={form.getFieldValue().product_list[index].price}
                                                                        status
                                                                        placeholder={"ส่วนลดต่อรายการ (บาท)"}
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onBlur={(value) => isFunction(calculateTable) ? calculateTable(index, "price_discount", value.target.value) : null}
                                                                        disabled={mode == "view"}
                                                                        stringMode
                                                                        step={"1"}
                                                                        precision={2}
                                                                        addonAfter={`บาท`}
                                                                        className='ant-input-number-after-addon-20-percent'
                                                                    />

                                                                </Form.Item>
                                                            </Col>
                                                        }

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>

                                                                <Form.Item
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "unit"]}
                                                                    fieldKey={[field.fieldKey, "unit"]}
                                                                    label={GetIntlMessages("purchase-unit")}
                                                                    rules={[
                                                                        {
                                                                            required: true,
                                                                            message: "กรุณากรอก",
                                                                        },
                                                                    ]}
                                                                >
                                                                    <Select
                                                                        showSearch
                                                                        placeholder="เลือกข้อมูล"
                                                                        optionFilterProp="children"
                                                                        disabled={mode == "view" || expireEditTimeDisable == true}
                                                                        onChange={(value) => onChangeUnit(index, value)}
                                                                    >

                                                                        {getArrValue(index, "unit_list").map((e, i) => <Select.Option value={e.id} key={i}>{get(e, `type_name.${locale.locale}`, "-")}</Select.Option>)}
                                                                    </Select>
                                                                </Form.Item>

                                                            </Col>
                                                        }

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>

                                                                <Form.Item
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "total_price"]}
                                                                    fieldKey={[field.fieldKey, "total_price"]}
                                                                    label={GetIntlMessages("ราคารวม")}
                                                                >
                                                                    <InputNumber style={{ width: "100%" }} disabled className='ant-input-number-after-addon-20-percent' stringMode step={"1"} placeholder="0" addonAfter="บาท"
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                        onChange={(value) => onChangeUnit(index, value)}
                                                                    />
                                                                </Form.Item>


                                                            </Col>
                                                        }
                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>
                                                                <Form.Item
                                                                    {...field}
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price_discount_total"]}
                                                                    label={GetIntlMessages(`ลดเงินรวมทั้งสิ้น`)}
                                                                >
                                                                    <InputNumber
                                                                        disabled={mode == "view" || expireEditTimeDisable == true}
                                                                        style={{ width: "100%" }} className='ant-input-number-after-addon-20-percent' stringMode step={"1"} placeholder="0" onBlur={(value) => onChangeDiscountAll(index, value.target.value)} addonAfter="บาท"
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                    />

                                                                </Form.Item>
                                                            </Col>
                                                        }

                                                        {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add" ? null
                                                            :
                                                            <Col lg={4} md={12} xs={24} style={{ width: "100%" }}>
                                                                <Form.Item
                                                                    {...tailformItemLayout}
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price_grand_total"]}
                                                                    label={GetIntlMessages("ยอดสุทธิ")}
                                                                >
                                                                    <InputNumber style={{ width: "100%" }} className='ant-input-number-after-addon-20-percent' stringMode step={"1"} placeholder="0" disabled addonAfter="บาท" readOnly
                                                                        formatter={(value) => addComma(value)}
                                                                        parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                                    />
                                                                </Form.Item>
                                                            </Col>
                                                        }

                                                    </Row>

                                                    <FormWarehouse name={[field.name, "warehouse_detail"]} index={index} form={form} expireEditTimeDisable={expireEditTimeDisable} mode={mode} getArrValue={getArrValue} dataList={dataList} pageId={pageId} visibleEachWarehouseMovementModal={visibleEachWarehouseMovementModal} configShowMovementBtn={configShowMovementBtn} dropDownBtnWarehouse={dropDownBtnWarehouse} callbackSelectProduct={callbackSelectProduct} />

                                                    {fields.length > 1 && mode !== "view" && expireEditTimeDisable !== true ?
                                                        <Col span={24} style={{ display: "flex", justifyContent: "end", }}>
                                                            <Form.Item >
                                                                <Button
                                                                    style={{ display: "flex", alignItems: "center", }}
                                                                    type="dashed"
                                                                    onClick={() => onDeleteProductList(remove, field, index)}
                                                                    block
                                                                    icon={<MinusCircleOutlined />}
                                                                >
                                                                    {GetIntlMessages("ลบรายการ")}
                                                                </Button>
                                                            </Form.Item>
                                                        </Col>
                                                        : null
                                                    }

                                                </Fieldset>

                                            </Form.Item>
                                        ))}
                                <Form.Item>
                                    {mode !== "view" && expireEditTimeDisable !== true ?
                                        <Col span={24} style={{ display: "flex", justifyContent: "end", }}>
                                            <Form.Item >
                                                <Button
                                                    style={{ display: "flex", alignItems: "center", }}
                                                    type="dashed"
                                                    onClick={() => addNewProductList(add)}
                                                    block
                                                    icon={<PlusOutlined />}
                                                >
                                                    {GetIntlMessages("เพิ่มรายการสินค้า")}
                                                </Button>
                                            </Form.Item>
                                        </Col> : null
                                    }
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>
            </div>
            {pageId == "a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0" && mode != "add"
                ? null
                :
                <Fieldset legend={GetIntlMessages("สรุปรายการ")}>

                    <Row>
                        <Col lg={8} sm={11} xs={24}>
                            <Form.Item
                                name="note"
                                label="หมายเหตุ"
                            >
                                <Input.TextArea style={{ with: "100%" }} disabled={mode == "view"} rows={9} />
                            </Form.Item>
                        </Col>
                        <Col lg={10} sm={2} xs={0} />
                        <Col lg={6} sm={11} xs={24}>
                            <Form.Item
                                {...tailformItemLayout}
                                name="tailgate_discount" label="ส่วนลดท้ายบิล" >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled={mode == "view"}
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={calculateResult}
                                    controls={false}
                                />
                            </Form.Item>
                            <Form.Item
                                hidden
                                {...tailformItemLayout}
                                name="debt_price_amount_left" label="หนี้สิน" >
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled={mode == "view"}
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    onBlur={calculateResult}
                                    controls={false}
                                />
                            </Form.Item>


                            <Form.Item
                                {...tailformItemLayout}
                                name="total_price_all" label={GetIntlMessages("รวมเงิน")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled
                                    readOnly
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                {...tailformItemLayout}
                                name="total_discount" label={GetIntlMessages("ส่วนลดรวม")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    disabled
                                    placeholder="0"
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                {...tailformItemLayout}
                                name="total_price_all_after_discount" label={GetIntlMessages("ราคาหลังหักส่วนลด")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled
                                    readOnly
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                {...tailformItemLayout}
                                name="price_before_vat" label={GetIntlMessages("ราคาก่อนรวมภาษี")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled
                                    readOnly
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                            <Form.Item
                                {...tailformItemLayout}
                                name="vat" label={GetIntlMessages("ภาษีมูลค่าเพิ่ม 7%")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled
                                    readOnly
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                            <Form.Item
                                {...tailformItemLayout}
                                name="net_price" label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")}>
                                <InputNumber
                                    style={{ width: "100%" }}
                                    className='price-align'
                                    stringMode
                                    placeholder="0"
                                    disabled
                                    readOnly
                                    formatter={(value) => addComma(value)}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>

                        </Col>
                    </Row>

                </Fieldset>
            }

            <Modal title="คำนวณราคารวม/แยกภาษี" open={isModalCalVatOpen} footer={null} onOk={handleModalCalVatOk} onCancel={handleModalCalVatCancel}>
                <Form.Item
                    name="tax_type"
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
                        className='ant-input-number-after-addon-20-percent'
                    ></InputNumber>
                </Form.Item>
                <div style={{ width: '100%', textAlign: 'center' }} >
                    <Button onClick={clearInExVat} type="primary">
                        ค่าเริ่มต้น
                    </Button>
                </div>
            </Modal>

            <Modal
                maskClosable={false}
                open={isProductDataModalVisible}
                onCancel={handleCancelProductDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelProductDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <ProductData title="จัดการข้อมูลสินค้า" callBack={callBackProductPick} listIndex={listIndex} />
            </Modal>

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
                 .form-warehouse {
                    margin-bottom: 10px !important;
                 }

                `}
            </style>

        </>
    )
}

export default ImportDocAddEditViewModal