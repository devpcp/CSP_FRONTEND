import React, { useEffect, useState } from 'react'
import Fieldset from '../../shares/Fieldset';
import FormSelectDot from "../Dot/Components.Select.Dot";
import GetIntlMessages from '../../../util/GetIntlMessages';
import { Form, Input, Select, Row, Col, Divider, Button, Space, DatePicker, InputNumber, Modal, Tooltip, Tag, Table } from 'antd';
import { PlusOutlined, MinusCircleOutlined, TableOutlined, ShoppingCartOutlined, CalculatorOutlined, InfoCircleTwoTone } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { debounce, get, isArray, isEmpty, isFunction, isPlainObject, isString } from 'lodash';
import API from '../../../util/Api'
// import ComponentsSelectModalBusinessPartners from '../../../components/Routes/Modal/Components.Select.Modal.BusinessPartners'
import SortingData from '../../shares/SortingData'
import { RoundingNumber, takeOutComma, } from '../../shares/ConvertToCurrency'
import Swal from "sweetalert2";
import ProductData from "../../../routes/MyData/ProductsData"
import BusinessPartnersData from "../../../routes/MyData/BusinessPartnersData"
import PurchaseOrderData from "../../../components/Routes/Inventory/PurchaseAndPrePurchaseOrderDoc"
import FormWarehouse from "./FormWarehouse"

const tailformItemLayout = {
    labelCol: { span: 24 },
    wrapperCol: { span: 24 }
};

const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
const purchaseUnitTypeTire = "103790b2-e9ab-411b-91cf-a22dbf624cbc" // -> เส้น
const purchaseUnitTypeService = "af416ec2-c8f0-4c20-90a4-29487fecb315" // -> รายการ
const purchaseUnitTypeBattery = "a7192601-316d-438e-a69e-f978d8445ae7" // -> ลูก // product_type battery ->5d82fef5-8267-4aea-a968-92a994071621 

const FormImportDocument = ({ form, mode, expireEditTimeDisable, dataList, calculateResult, getShopBusinessPartners, loadingSearch, setLoadingSearch, getArrListValue, setLoading, getShopBusinessPartnersDataListAll }) => {
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { taxTypeAllList, userList, shopBusinessPartnersList } = dataList
    const [shopBusinessPartners, setShopBusinessPartners] = useState([])
    const [isBusinessPartnersDataModalVisible, setIsBusinessPartnersDataModalVisible] = useState(false);
    const [isPurchaseOrderDataModalVisible, setIsPurchaseOrderDataModalVisible] = useState(false);



    useEffect(() => {
        shopBusinessPartnersList?.map((e) => {
            e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
        })

        setShopBusinessPartners(() => shopBusinessPartnersList)
    }, [shopBusinessPartnersList])


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
                            let listData = data.data.data ?? []
                            listData.map((e) => {
                                let { ShopBusinessPartner } = e
                                e.partner_name = ShopBusinessPartner.partner_name[locale.locale]
                                e.partner_branch = ShopBusinessPartner.other_details.branch ? ShopBusinessPartner.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + ShopBusinessPartner.other_details.branch_code + " " + ShopBusinessPartner.other_details.branch_name + ")" : ""
                            })
                            purchase_order_number_list = listData
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
                product_list = ShopPurchaseOrderLists?.map((e, index) => {
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
                        changed_name_status: details?.changed_name_status ?? false,
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


    const callBackPickBusinessPartners = async (data, type = "modal") => {
        try {

            let businessPartnerData = await getShopBusinessPartnersDataListAll((data.partner_name[locale.locale]))
            businessPartnerData?.map((e) => {
                e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
            })

            switch (type) {
                case "bar":
                    break;
                default:
                    setShopBusinessPartners(businessPartnerData)
                    break;
            }

            let _model = {
                bus_partner_id: data.id,
                tax_type: data?.other_details?.tax_type_id ?? "fafa3667-55d8-49d1-b06c-759c6e9ab064"
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

    const onSelectPartner = (e) => {
        let find = shopBusinessPartners.find(x => x.id === e)
        callBackPickBusinessPartners(find, "bar")
    }

    const debounceOnSearch = debounce((value) => onSearchBusinessPartnerData(value), 1000)

    const onSearchBusinessPartnerData = async (e) => {
        const data = await getShopBusinessPartnersDataListAll(e)
        data?.map((e) => {
            e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
        })
        setShopBusinessPartners(data)
    }

    const callBackPickPurchaseOrder = async (data, type = "modal") => {
        try {
            let { ShopBusinessPartner } = data
            data.partner_name = ShopBusinessPartner.partner_name[locale.locale]
            data.partner_branch = ShopBusinessPartner.other_details.branch ? ShopBusinessPartner.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + ShopBusinessPartner.other_details.branch_code + " " + ShopBusinessPartner.other_details.branch_name + ")" : ""

            let _model = {
                purchase_order_number_list: [data],
                purchase_order_number: data.id
            }
            await form.setFieldsValue(_model)
            await selectClearPurchaseOrder(data.id, "select")
            handleCancelPurchaseOrderDataModal()
        } catch (error) {
            console.log("callBackPickPurchaseOrder", error)
        }
    }

    const handleOpenPurchaseOrderDataModal = () => {
        try {
            setIsPurchaseOrderDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelPurchaseOrderDataModal = () => {
        try {
            setIsPurchaseOrderDataModalVisible(false)
        } catch (error) {

        }
    }

    /*End Debounce Select and Clear */
    return (
        <>

            <div className="detail-before-table">

                <Row gutter={[10]} style={{ marginTop: "10px" }}>
                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Form.Item
                            {...tailformItemLayout}
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
                                onSelect={(e) => onSelectPartner(e)}
                            >
                                {shopBusinessPartners?.map((e, index) => (
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
                                        onSearch={(e) => debounceOnSearch(e)}
                                        placeholder="เลือกข้อมูล"
                                        disabled={mode == "view" || expireEditTimeDisable == true || !!form.getFieldValue().purchase_order_number}
                                        optionFilterProp="children"
                                        onSelect={(e) => onSelectPartner(e)}
                                    >
                                        {shopBusinessPartners?.map((e, index) => (
                                            <Select.Option value={e.id} key={index}>
                                                {e.partner_name[locale.locale] + " " + e.partner_branch}
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
                                        disabled={mode === "view"}
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
                                {shopBusinessPartners?.map((e, index) => (
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
                                {shopBusinessPartners?.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                        {/* {e.mobile_no ? e.mobile_no.mobile_no_1 : "-"} */}
                                        {get(e.mobile_no, "mobile_no_1", "-")}
                                    </Select.Option>
                                ))}
                            </Select>

                        </Form.Item>
                    </Col>


                    <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                        <Row>
                            <Col lg={20} md={20} sm={18} xs={18}>
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
                                        {getArrListValue("purchase_order_number_list")?.map((e, i) => <Select.Option value={e.id} key={`purchase_order_number-${i}-${e.id}`}>{`${get(e, `code_id`, "-")} > ${get(e, `partner_name`, "-")} ${get(e, `partner_branch`, "")}`}</Select.Option>)}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col lg={4} md={4} sm={6} xs={6} style={{ paddingTop: "30.8px", justifyContent: "end" }}>
                                <Form.Item >
                                    <Button
                                        type='primary'
                                        style={{ width: "100%", borderRadius: "10px" }}
                                        disabled={mode === "view"}
                                        onClick={() => handleOpenPurchaseOrderDataModal()}
                                    >
                                        เลือก
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
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
                                    {shopBusinessPartners?.map((e, index) => (
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
                                    {shopBusinessPartners?.map((e, index) => (
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
                                {taxTypeAllList?.map((e, index) => (
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

                                {taxTypeAllList?.map((e, index) => (
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
                                {userList?.map((e) => <Select.Option key={`user-${e.id}`} value={e.id}>{e.name}</Select.Option>)}
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

            <Modal
                maskClosable={false}
                open={isPurchaseOrderDataModalVisible}
                onCancel={handleCancelPurchaseOrderDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelPurchaseOrderDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {<PurchaseOrderData title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackPickPurchaseOrder} />}
            </Modal>
        </>
    )
}

export default FormImportDocument