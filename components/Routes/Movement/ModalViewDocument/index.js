import React from 'react'
import { Button, Form, Tabs, Row, Col, Input, Select, DatePicker, Radio, AutoComplete } from 'antd';
import GetIntlMessages from '../../../../util/GetIntlMessages';
import SearchInput from '../../../shares/SearchInput';
import TableList from '../../../shares/TableList';
import ImportDocAddEditViewModal from '../../../Routes/ImportDocumentModal/ImportDocAddEditViewModal';
import { get, isArray, isPlainObject, isFunction, isEmpty } from 'lodash';
import ModalFullScreen from '../../../shares/ModalFullScreen';
import API from '../../../../util/Api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import FormServicePlans from '../../Sales/ServicePlans/Components.Routes.Modal.FormServicePlans'
import Tab1ServiceProduct from '../../Sales/ServicePlans/Components.Routes.Modal.Tab1.ServiceProduct'
import Tab2Custome from '../../Sales/ServicePlans/Components.Routes.Modal.Tab2.Custome'
import Tab4Vehicle from '../../Sales/ServicePlans/Components.Routes.Modal.Tab4.Vehicle';
import { RoundingNumber, NoRoundingNumber } from '../../../shares/ConvertToCurrency';
import Swal from "sweetalert2";
import Fieldset from '../../../shares/Fieldset';
import FormSelectDot from '../../Dot/Components.Select.Dot';

const ModalViewDocument = ({ mode, visibleViewDocument, handleCancelViewDocument, viewDocumentData, loading, setLoading, pageName }) => {
    const [loadingSetForm, setLoadingSetForm] = useState(false)
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { taxTypes, productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [form] = Form.useForm();
    const { TabPane } = Tabs;

    const [docTypeData, setDocTypeData] = useState("")
    const [checkTaxId, setCheckTaxId] = useState("")
    const [userList, setUserList] = useState([])
    const [getShelfDataAll, setgetShelfDataAll] = useState([]);
    useEffect(() => {
        if (visibleViewDocument === true) {
            setActiveKeyTab("1")
            init()
        }

    }, [visibleViewDocument])

    const init = async () => {
        try {
            let docType
            const documentTypeId = get(viewDocumentData, `ShopInventoryTransactionDoc.DocumentType`, viewDocumentData?.ShopSalesTransactionDoc?.DocumentType)
            if (pageName !== "ProductMovement") {

                setDocTypeData(prev => documentTypeId)
                switch (documentTypeId?.id) {
                    case "ad06eaab-6c5a-4649-aef8-767b745fab47":
                        docType = "importDoc"
                        break;
                    case "40501ce1-c7f0-4f6a-96a0-7cd804a2f531":
                        docType = "adjustDoc"
                        const promise1 = getUser()
                        const promise2 = getShelfData()

                        await Promise.all([promise1, promise2]).then((values) => {

                            // setUserList(() => values[0])
                            setgetShelfDataAll(() => values[1])

                            if (isArray(values[0])) {
                                const new_data = [];

                                values[0].forEach(e => {
                                    const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                                    if (isPlainObject(authUser.UsersProfile)) {
                                        const { shop_id } = authUser.UsersProfile;
                                        if (fname && lname && e.UsersProfile.shop_id === shop_id) {
                                            new_data.push({
                                                id: e.id,
                                                name: `${fname} ${lname}`,
                                                groups: e.Groups
                                            })
                                        }
                                    }

                                })

                                setUserList(() => new_data);
                            }

                        });
                        break;
                    default: docType = "docSale"
                        break;
                }
                // if (documentTypeId?.id === "ad06eaab-6c5a-4649-aef8-767b745fab47" ) {
                //     docType = "importDoc"
                // } else {
                //     docType = "docSale"
                // }
                await getDocuemntData(viewDocumentData?.doc_sale_id ?? viewDocumentData?.doc_inventory_id, docType)
            } else {

                // setDocTypeData(prev => get(viewDocumentData, `ShopInventoryTransactionDoc.DocumentType`, viewDocumentData?.ShopSalesTransactionDoc?.DocumentType))
                setDocTypeData(prev => documentTypeId)
                if (!!viewDocumentData?.ShopInventoryTransactionDoc) {
                    docType = "importDoc"
                } else {
                    docType = "docSale"
                }
                await getDocuemntData(viewDocumentData?.doc_sale_id ?? viewDocumentData?.doc_inventory_id, docType)
            }

        } catch (error) {

        }
    }

    const getArrValue = (index, type) => {
        try {
            const { product_list } = form.getFieldValue()
            return isArray(product_list) ? product_list[index][type] ?? [] : []
        } catch (error) {

        }

    }

    const getArrWarehouse = (index1, index2) => {
        try {
            const { product_list } = form.getFieldValue();
            const warehouse_detail = product_list[index1].warehouse_detail[index2];
            const arr = warehouse_detail ? warehouse_detail.getShelfDataAll : [];
            let newArr
            if (warehouse_detail) {
                newArr = getShelfDataAll.find(where => where.id === warehouse_detail.warehouse)
                arr = newArr ? newArr.shelf : []
            }
            return arr ?? []
        } catch (error) {

        }
    }

    const closeViewDocModal = () => {
        form.resetFields()
        setActiveKeyTab("1")
        setCheckTaxId("")
        if (isFunction(handleCancelViewDocument)) handleCancelViewDocument()
        setDocTypeData("")
    }

    const getDocuemntData = async (id, docType) => {
        setLoading(() => true)
        let res
        let resInventory
        if (docType === "importDoc" || docType === "adjustDoc") {
            res = await API.get(`/shopInventoryTransaction/byid/${id}`)
            resInventory = await API.get(`/shopInventory/bydocinventoryid/${id}`)
            if (res?.data.status === "success" && resInventory?.data.status === "success") {
                setFormData({ inventoryTransaction: res.data.data, inventoryProductList: resInventory.data.data }, docType)
            } else {
                Swal.fire("มีบางอย่างผิดพลาด !!", "กรุณาติดต่อเจ้าหน้าที่", "error")
            }
        } else {
            const { data } = await API.get(`/shopSalesTransactionDoc/byid/${id}`)
            if (data.status === "success") {
                setFormData(data.data, docType)
            } else {
                Swal.fire("มีบางอย่างผิดพลาด !!", "กรุณาติดต่อเจ้าหน้าที่", "error")
            }
        }
        setLoading(() => false)
    }

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }

    /* Tab */
    const [activeKeyTab, setActiveKeyTab] = useState("1")

    const setFormData = async(value, docType) => {
        try {
            // console.log('value :>> ', value);
            // console.log('docType :>> ', docType);
            switch (docType) {
                case "importDoc":
                    const { bus_partner_id, doc_date } = value?.inventoryTransaction
                    const { References_doc, user_id, vat, tax_type, purchase_order_number, net_price_text, total_discount_text, total_price_all_after_discount_text, total_price_all_text, vat_text } = value?.inventoryTransaction?.details
                    const { product_list } = value?.inventoryProductList

                    const productId_list = []
                    product_list.forEach((e, index) => {
                        const {
                            discount_3,
                            discount_3_text,
                            discount_percentage_1,
                            discount_percentage_1_text,
                            discount_percentage_2,
                            discount_percentage_2_text,
                            discount_thb,
                            discount_thb_text,
                            price,
                            price_text,
                            total_price,
                            total_price_text,
                            unit,
                        } = e.details
                        productId_list = [e.ShopProduct].filter(where => where.id == e.product_id)
                        e.unit_list = productId_list[0]?.Product?.ProductType?.ProductPurchaseUnitTypes ?? []
                        e.productId_list = productId_list
                        e.discount_3 = discount_3
                        e.discount_3_text = discount_3_text
                        e.discount_3_type = e?.details?.discount_3_type
                        e.discount_percentage_1 = discount_percentage_1
                        e.discount_percentage_1_text = discount_percentage_1_text
                        e.discount_percentage_2 = discount_percentage_2
                        e.discount_percentage_2_text = discount_percentage_2_text
                        e.discount_thb = discount_thb
                        e.discount_thb_text = discount_thb_text
                        e.price = price
                        e.price_text = price_text
                        e.total_price = total_price
                        e.total_price_text = total_price_text
                        e.unit = unit

                        e.warehouse_detail = e.warehouse_detail.map((items, index) => {
                            return { warehouse: items.warehouse, shelf: items.shelf.item, amount: items.shelf.amount, dot_mfd: items.shelf.dot_mfd, purchase_unit_id: items.shelf.purchase_unit_id }
                        })
                        e.ProductTypeGroupId = e?.ShopProduct?.Product?.ProductType?.type_group_id
                    })

                    form.setFieldsValue({ product_list, bus_partner_id, doc_date: moment(doc_date), user_id, vat, tax_type, References_doc, purchase_order_number, net_price_text, total_discount_text, total_price_all_after_discount_text, total_price_all_text, vat_text })
                    break;

                case "docSale":
                    // console.log('value docSale :>> ', value);
                    const checkCreateDate = new Date(value?.created_date).getTime() ?? null
                    const validateDate = new Date("2023-01-12").getTime()
                    const list_service_product = [];
                    get(value, `details.list_service_product`, []).forEach(e => {
                        // console.log('e :>> ', e);
                        const find = isArray(value.ShopSalesOrderPlanLogs) && value.ShopSalesOrderPlanLogs.length > 0 ? value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount) : get(value, `details.list_service_product`, []).find(where => where.id == e.id && where.amount == e.amount);
                        // const find = value.ShopSalesOrderPlanLogs.find(where => where.id == e.id && where.amount == e.amount);
                        const _find = e.list_shop_stock.find(where => where.product_id === e.product_id)
                        const purchase_unit_list = (isPlainObject(_find)) ? _find?.ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes.filter(where => where.id === "103790b2-e9ab-411b-91cf-a22dbf624cbc") ?? [] : []
                        const model = {
                            ...e,
                            price_text: NoRoundingNumber(e.price),
                            discount_text: e.discount_text,
                        }

                        if (validateDate > checkCreateDate) {
                            model.purchase_unit_list = purchase_unit_list
                            model.purchase_unit_id = purchase_unit_list[0].id
                        }

                        if (isPlainObject(find)) list_service_product.push(model)
                    })

                    const model = {
                        id: value.id,
                        code_id: value.code_id,
                        customer_type: null, //ประเภทลูกค้า
                        customer_id: null, //ชื่อลูกค้า
                        // customer_phone: null, //หมายเลขโทรศัพท์
                        customer_phone: get(value, `details.customer_phone`, null), //หมายเลขโทรศัพท์
                        vehicles_customers_id: value.vehicles_customers_id, //หมายเลขโทรศัพท์
                        mileage: get(value, `details.mileage`, null),
                        mileage_old: get(value, `details.mileage_old`, null),
                        tax_id: get(value, `details.tax_id`, null), //ประเภทภาษี
                        doc_type_id: value.doc_type_id,
                        status: value.status.toString(),
                        user_id: authUser.id,
                        shop_id: value.shop_id,
                        list_service_product,
                        avg_registration_day: get(value, `details.avg_registration_day`, 0),
                        avg_registration_month: get(value, `details.avg_registration_day`, 0) * 30,
                        remark: get(value, `details.remark`, null), //หมายเหตุ
                        remark_inside: get(value, `details.remark_inside`, null), //หมายเหตุ (ภายใน)
                        tailgate_discount: get(value, `details.tailgate_discount`, 0), //ส่วนลดท้ายบิล
                        remark_payment: get(value, `details.remark_payment`, ""),

                        purchase_status: get(value, `purchase_status`, ""),  //สถานะการจ่ายเงิน
                        doc_date: moment(get(value, `doc_date`, "")) ?? null //วันที่เอกสาร
                    }
                    if (value.bus_customer_id) {
                        model.customer_type = "business"
                        model.customer_id = value.bus_customer_id
                    } else if (value.per_customer_id) {
                        model.customer_type = "person"
                        model.customer_id = value.per_customer_id
                    }

                    form.setFieldsValue(model)
                    calculateResult()
                    break;

                case "adjustDoc":
                    const { inventoryTransaction, inventoryProductList } = value
                    const { data } = await API.get(`/shopInventoryTransaction/byid/${inventoryTransaction.details.References_import_doc}`)
                    const modelAdjustDoc = {
                        ...inventoryTransaction,
                        doc_date: moment(inventoryTransaction.doc_date),
                        References_import_doc: data.status === "success" ?get(data.data, `code_id`, null) : null,
                        References_doc: inventoryTransaction.details.References_doc,
                        user_id: inventoryTransaction.details?.user_id,
                        note: inventoryTransaction.details?.note,
                        product_list: inventoryProductList?.product_list.map(e => {
                            return {
                                ...e,
                                productId_list: isPlainObject(e?.ShopProduct) && !isEmpty(e?.ShopProduct) ? [e?.ShopProduct] : [],
                                warehouse_detail: e.warehouse_detail.map(v => {
                                    const { item, dot_mfd, purchase_unit_id, old_current_amount, current_amount, amount } = v?.shelf
                                    return {
                                        warehouse: v?.warehouse,
                                        shelf: item,
                                        dot_mfd,
                                        purchase_unit_id,
                                        old_current_amount,
                                        current_amount,
                                        amount,
                                        remark_adjust: v?.details?.remark_adjust ?? null,
                                        status: v?.status,
                                        adjust_amount: v.status === 2 ? (Number(old_current_amount ?? 0) + Number(amount)) ?? null : (Number(old_current_amount) - Number(amount)) ?? null,
                                    }
                                }),

                            }
                        })
                    }
                    form.setFieldsValue(modelAdjustDoc)
                    break;
                default:
                    break;
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    /*Get API Data */

    /* get Master TaxTypes */
    const getTaxTypes = async () => {
        const { data } = await API.get(`/master/taxTypes/all`);
        return data.status == "success" ? data.data : []
    }

    const getUser = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
            // console.log('data getUser', data)
            return data.status === "success" ? data.data.data : []
        } catch (error) {

        }

    }

    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        try {
            const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
            return data.status === "success" ? data.data.data : []
        } catch (error) {

        }

    }

    const calculateResult = async (index) => {
        try {
            const { list_service_product, tax_id, tailgate_discount } = form.getFieldValue();
            if (!!tailgate_discount) tailgate_discount = Number(tailgate_discount.replaceAll(",", "") ?? 0)


            let total = 0, discount = 0, discount_percent = 0, vat = 0, net_total = 0, total_amount = 0, total_after_discount = 0, total_before_vat = 0;

            list_service_product.forEach(e => {
                total += ((Number(e.amount ?? 0) * Number(e.price ?? 0)));
                discount += (Number(e.discount ?? 0) * (Number(e.amount ?? 0)));
                // discount_percent += ((Number(e.amount ?? 0) * Number(e.price ?? 0))) * (Number(e.discount_percent ?? 0)/100);
                total_amount += Number(e.amount ?? 0);
            });
            // console.log('list_service_product', list_service_product)
            discount += Number(tailgate_discount ?? 0)
            total_after_discount = (total - discount)

            // total = total - discount

            const { detail } = whereIdArray(taxTypes.length > 0 ? taxTypes : await getTaxTypes(), tax_id ?? "52b5a676-c331-4d03-b650-69fc5e591d2c");
            let each_discount = 0
            let each_discount_percent = 0


            if (index >= 0 && list_service_product[index]?.discount) each_discount = list_service_product[index]?.discount ?? 0
            if (index >= 0 && list_service_product[index]?.discount_percent) each_discount_percent = list_service_product[index]?.discount_percent ?? 0

            if (index >= 0 && list_service_product[index]["amount"]) {
                list_service_product[index]["each_total_price"] = (Number(list_service_product[index]["price"]) - each_discount) * Number(list_service_product[index]["amount"])
            }

            //8c73e506-31b5-44c7-a21b-3819bb712321 -> รวม vat
            //fafa3667-55d8-49d1-b06c-759c6e9ab064 -> ไม่รวม vat
            //52b5a676-c331-4d03-b650-69fc5e591d2c -> ไม่คิด vat
            switch (tax_id) {
                case "8c73e506-31b5-44c7-a21b-3819bb712321":
                    setCheckTaxId(tax_id)
                    if (isPlainObject(detail)) {
                        vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 107)))
                        total_before_vat = total_after_discount - vat
                        // net_total = (total_before_vat - tailgate_discount) + vat
                        net_total = total_after_discount
                    }
                    break;
                case "fafa3667-55d8-49d1-b06c-759c6e9ab064":
                    setCheckTaxId(tax_id)
                    if (isPlainObject(detail)) {
                        vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                        // net_total = (total_after_discount - tailgate_discount) + vat
                        net_total = total_after_discount + vat
                    }
                    break;
                case "52b5a676-c331-4d03-b650-69fc5e591d2c":
                    setCheckTaxId(tax_id)
                    if (isPlainObject(detail)) {
                        vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                        // net_total = (total_after_discount - tailgate_discount) + vat
                        net_total = total_after_discount + vat
                    }
                    break;

                default:
                    setCheckTaxId("")
                    if (isPlainObject(detail)) {
                        vat = ((total_after_discount * ((Number(detail.tax_rate_percent)) / 100)))
                        net_total = total_after_discount + vat
                    }
                    break;
            }

            const localStringTwoDecimals = { minimumFractionDigits: 2, maximumFractionDigits: 2 }

            function checkLenght(value) {
                try {
                    if (list_service_product.length > 0 && value) {
                        return value.toLocaleString(undefined, localStringTwoDecimals)
                    } else {
                        return null
                    }
                } catch (error) {

                }
            }

            form.setFieldsValue({
                total,
                total_text: checkLenght(total),
                // total_text: total.toLocaleString(undefined, localStringTwoDecimals),

                total_after_discount,
                total_after_discount_text: checkLenght(total_after_discount),
                // total_after_discount_text: total_after_discount.toLocaleString(undefined, localStringTwoDecimals),

                total_before_vat,
                total_before_vat_text: checkLenght(total_before_vat),
                // total_before_vat_text: total_before_vat.toLocaleString(undefined, localStringTwoDecimals),

                discount,
                discount_text: checkLenght(discount),
                // discount_text: discount ? discount.toLocaleString(undefined, localStringTwoDecimals) : 0,

                net_total,
                net_total_text: checkLenght(net_total),
                // net_total_text: net_total ? net_total.toLocaleString(undefined, localStringTwoDecimals) : 0,

                vat,
                vat_text: checkLenght(vat),
                // vat_text: vat ? vat.toLocaleString(undefined, localStringTwoDecimals) : 0,

                total_amount,
                tailgate_discount: NoRoundingNumber(tailgate_discount)
                // NoRoundingNumber

            })
        } catch (error) {
            // console.log('error calculateResult :>> ', error);
        }

    }

    const displayModalData = () => {
        try {
            if (docTypeData?.id === "ad06eaab-6c5a-4649-aef8-767b745fab47") {
                return (
                    <>
                        <Form
                            form={form}
                            labelCol={{ span: 7 }}
                            wrapperCol={{ span: 18 }}
                            layout="horizontal"
                        >
                            <ImportDocAddEditViewModal pageId={"ad06eaab-6c5a-4649-aef8-767b745fab47"} form={form} mode={"view"} calculateResult={calculateResult} />
                        </Form>

                    </>
                )
            } else if (docTypeData?.id === "40501ce1-c7f0-4f6a-96a0-7cd804a2f531") {
                return (
                    <Form
                        form={form}
                        labelCol={{ span: 7 }}
                        // wrapperCol={{ lg: { span: 18 }, md: { span: 14 } }}
                        layout="horizontal"
                    >
                        <div className="detail-before-table">

                            <Row gutter={[10]} style={{ marginTop: "10px" }}>

                                <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }} hidden>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="purchase_order_number"
                                        label={GetIntlMessages("เลขใบสั่งซื้อสินค้า")}
                                    >
                                        <Input placeholder="" disabled />
                                    </Form.Item>
                                </Col>

                                <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                                    <Form.Item
                                        // validateTrigger={['onChange', 'onBlur']}
                                        name="References_import_doc"
                                        label={GetIntlMessages("เลขที่ใบรับสินค้าอ้างอิง")}
                                    >
                                        {/* <Select
                                            placeholder="เลือกข้อมูล"
                                            optionFilterProp="children"
                                            //   disabled
                                            disabled
                                            // onChange={(value) => onChangeRefDoc(value)}
                                            // allowClear
                                            // onClear={() => onClearRefDoc()}
                                        >
                                            {isArray(importDocList) && importDocList?.length > 0 ?
                                                importDocList.map((e, index) => (
                                                    <Select.Option value={e.id} key={index}>
                                                        {e?.code_id}
                                                    </Select.Option>
                                                ))
                                                : []}
                                        </Select> */}

                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="References_doc"
                                        label={GetIntlMessages("เอกสารอ้างอิง")}
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8}>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="doc_date"
                                        label={GetIntlMessages("วันที่เอกสาร")}

                                    >
                                        <DatePicker disabled format={'YYYY-MM-DD'} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} >
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="user_id"
                                        label={GetIntlMessages("ผู้จัดทำเอกสาร")}

                                    >
                                        <Select
                                            placeholder="เลือกข้อมูล"
                                            // disabled={mode == "view" || expireEditTimeDisable == true}
                                            filterOption={(inputValue, option) =>
                                                option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                            }
                                            disabled
                                        >
                                            {userList.map((e) => <Select.Option key={`user-${e.id}`} value={e.id}>{e.name}</Select.Option>)}
                                        </Select>
                                        {/* <DatePicker disabled={configModal.mode == "view" || expireEditTimeDisable == true} format={'YYYY-MM-DD'} style={{ width: "100%" }} /> */}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} hidden>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="approver"
                                        label={GetIntlMessages("ผู้อนุมัติ")}

                                    >
                                        <Input disabled />
                                        {/* <DatePicker disabled={configModal.mode == "view" || expireEditTimeDisable == true} format={'YYYY-MM-DD'} style={{ width: "100%" }} /> */}
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} hidden>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="approved_date"
                                        label={GetIntlMessages("วันเวลาที่อนุมัติ")}

                                    >
                                        <DatePicker showTime={{ format: 'HH:mm' }} disabled format={'YYYY-MM-DD HH:mm'} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} hidden>
                                    <Form.Item
                                        validateTrigger={['onChange', 'onBlur']}
                                        name="doc_create_date"
                                        label={GetIntlMessages("วันที่จัดทำเอกสาร")}

                                    >
                                        <DatePicker disabled format={'YYYY-MM-DD'} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} lg={8} xxl={8} hidden>
                                    <Form.Item
                                        // validateTrigger={['onChange', 'onBlur']}
                                        // name="doc_status"
                                        label={GetIntlMessages("สถานะเอกสาร")}
                                    >
                                        {/* <Switch checkedChildren={GetIntlMessages("ปรับเพิ่ม")} unCheckedChildren={GetIntlMessages("ปรับลด")} checked={checkedDocStatus} onChange={(bool) => onChangeDocStatus(bool)} disabled={configModal.mode === "view"} /> */}
                                    </Form.Item>
                                </Col>

                            </Row>
                        </div>
                        <div className="head-line-text pt-3">{GetIntlMessages("คลังสินค้า")}</div>
                        <div className="detail-before-table">
                            <Form.Item
                                // label=""
                                name="product_list"
                            // style={{ display: 'flex', justifyContent: 'center' }}
                            >
                                <Form.List name="product_list" >
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map((field, index) => (

                                                <Form.Item
                                                    required={false}
                                                    key={field.key}
                                                >
                                                    <Fieldset legend={`รายการที่ ${index + 1}`}>
                                                        <Row gutter={[20]}>
                                                            <Col lg={{ span: 8, offset: 4 }} md={12} xs={24} style={{ width: "100%" }}>
                                                                <Form.Item
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "product_id"]}
                                                                    fieldKey={[field.fieldKey, "product_id"]}
                                                                    label={GetIntlMessages("รหัสสินค้า")}
                                                                >
                                                                    <Select
                                                                        showSearch
                                                                        placeholder="เลือกข้อมูล"
                                                                        optionFilterProp="children"
                                                                        disabled
                                                                        // disabled={configModal.mode == "view" || expireEditTimeDisable == true || !!formModal.getFieldValue()?.References_import_doc}
                                                                        // onChange={(value) => onChangeProductId(index, value)}
                                                                        // on3lue) => debounceOnSearch(index, value)}
                                                                        filterOption={false}
                                                                        notFoundContent={null}
                                                                    >
                                                                        {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e?.id} key={i}>{get(e, `Product.master_path_code_id`, "-")}</Select.Option>)}
                                                                    </Select>

                                                                </Form.Item>
                                                            </Col>

                                                            <Col lg={8} md={12} xs={24} style={{ width: "100%" }}>
                                                                <Form.Item
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "product_id"]}
                                                                    fieldKey={[field.fieldKey, "product_id"]}
                                                                    label={GetIntlMessages("product-name")}

                                                                >
                                                                    <Select
                                                                        showSearch
                                                                        placeholder="เลือกข้อมูล"
                                                                        optionFilterProp="children"
                                                                        disabled
                                                                        // disabled={configModal.mode == "view" || expireEditTimeDisable == true || !!formModal.getFieldValue()?.References_import_doc}
                                                                        // onChange={(value) => onChangeProductId(index, value)}
                                                                        // onSearch={(value) => debounceOnSearch(index, value)}
                                                                        // onSearch={(value) => handleSearchProduct(index, value)}
                                                                        filterOption={false}
                                                                        notFoundContent={null}
                                                                    >

                                                                        {getArrValue(index, "productId_list").map((e, i) => <Select.Option value={e?.id} key={i}>{get(e, `Product.product_name.${[locale.locale]}`, "-")}</Select.Option>)}
                                                                    </Select>
                                                                </Form.Item>
                                                            </Col>

                                                            <Col span={8} style={{ width: "100%" }} hidden>

                                                                <Form.Item
                                                                    validateTrigger={['onChange', 'onBlur']}
                                                                    name={[field.name, "price"]}
                                                                    fieldKey={[field.fieldKey, "price"]}
                                                                    label={GetIntlMessages("ราคา/หน่วย")}
                                                                // rules={[RegexMultiPattern("4", GetIntlMessages("only-number"))]}
                                                                >
                                                                    {/* <InputNumber disabled stringMode min={0} precision={2} onBlur={(value) => addDecimal(index, value.target.value)} placeholder="1000" addonAfter="บาท" /> */}

                                                                </Form.Item>
                                                            </Col>
                                                        </Row>

                                                        {/* <FormWarehouse name={[field.name, "warehouse_detail"]} index={index} onChangeWarehouse={onChangeWarehouse} /> */}

                                                        <Form.List name={[field.name, "warehouse_detail"]}>
                                                            {(fields, { add, remove }) => (
                                                                <>
                                                                    {/* {configModal.mode !== "view" && !!formModal.getFieldValue().product_list[index]?.product_id ?
                                                                        <div className="pb-3" id="add-plus-outlined">
                                                                            <div style={{ textAlign: "end" }}>
                                                                                <Button onClick={() => addTableWarehouse(add, index)} icon={<PlusOutlined />}>
                                                                                    เพิ่มรายการ
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                        : null} */}

                                                                    <div id='data-table-adjust-doc'>
                                                                        <div className='table-responsive'>
                                                                            <table className="table table-bordered">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>{GetIntlMessages(`ลำดับ`)}</th>
                                                                                        <th>{GetIntlMessages(`warehouses`)}</th>
                                                                                        <th>{GetIntlMessages(`ชั้นวางสินค้า`)}</th>
                                                                                        <th>{GetIntlMessages(`DOT/MFD`)}</th>
                                                                                        <th>{GetIntlMessages(`หน่วยซื้อ`)}</th>
                                                                                        <th>{GetIntlMessages(`ปรับเพิ่ม / ปรับลด`)}</th>
                                                                                        <th>{GetIntlMessages(`เหตุผลการปรับ`)}</th>
                                                                                        {form.getFieldValue()?.References_import_doc ? <th>{GetIntlMessages(`จำนวนในใบนำเข้า`)}</th> : null}
                                                                                        {mode !== "add" ? <th>{GetIntlMessages(`จำนวนคงคลังเก่า`)}</th> : null}
                                                                                        <th>{GetIntlMessages(`จำนวนคงคลัง`)}</th>
                                                                                        <th>{GetIntlMessages(`จำนวน`)}</th>
                                                                                        <th>{GetIntlMessages(`จำนวนหลังการปรับ`)}</th>
                                                                                        {/* {type != 4 ? <th>{GetIntlMessages(`ช่างซ่อม`)}</th> : null} */}
                                                                                        {mode !== "view" ? <th>{GetIntlMessages(`manage`)}</th> : null}
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {
                                                                                        fields.length > 0 ?
                                                                                            fields.map((field, i) => (
                                                                                                <tr key={`key-${i}`}>
                                                                                                    <td>{i + 1}</td>
                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "warehouse"]}
                                                                                                            fieldKey={[field.fieldKey, "warehouse"]}
                                                                                                            // label={GetIntlMessages("warehouses")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            {/* <Input placeholder="คลังที่อยู่" disabled={configModal.mode == "view"} /> */}
                                                                                                            <Select
                                                                                                                placeholder="เลือกข้อมูล"
                                                                                                                optionFilterProp="children"
                                                                                                                disabled
                                                                                                            // disabled={configModal.mode === "view" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false}
                                                                                                            // onChange={(value) => onChangeWarehouse(index, i, value)}
                                                                                                            >

                                                                                                                {getShelfDataAll.map((e, index) => (
                                                                                                                    <Select.Option value={e.id} key={index}>
                                                                                                                        {e.name[locale.locale]}
                                                                                                                    </Select.Option>

                                                                                                                ))}
                                                                                                            </Select>
                                                                                                        </Form.Item>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "shelf"]}
                                                                                                            fieldKey={[field.fieldKey, "shelf"]}
                                                                                                            // label={GetIntlMessages("shelf")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Select
                                                                                                                placeholder="เลือกข้อมูล"
                                                                                                                optionFilterProp="children"
                                                                                                                disabled
                                                                                                            // disabled={configModal.mode === "view" || formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === false}
                                                                                                            //  onChange={(value)=>onChangeWareHouse(index,index2,value)}
                                                                                                            >
                                                                                                                {getArrWarehouse(index, i).map(e => <Select.Option value={e.code}>{e.name[locale.locale]}</Select.Option>)}
                                                                                                            </Select>

                                                                                                        </Form.Item>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <FormSelectDot name={[field.name, "dot_mfd"]} fieldKey={[field.fieldKey, "dot_mfd"]} isNoStyle docTypeId={"40501ce1-c7f0-4f6a-96a0-7cd804a2f531"} disabled form={form} index={index} field={field} />
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "purchase_unit_id"]}
                                                                                                            fieldKey={[field.fieldKey, "purchase_unit_id"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Select disabled showArrow={false} placeholder={GetIntlMessages("เลือกข้อมูล")}>
                                                                                                                {productPurchaseUnitTypes.map((e, index) => (
                                                                                                                    <Select.Option value={e.id} key={index}>
                                                                                                                        {e?.type_name[locale.locale]}
                                                                                                                    </Select.Option>

                                                                                                                ))}
                                                                                                            </Select>
                                                                                                        </Form.Item>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        {/* <Col xxl={8} lg={8} md={12} xs={24} style={{ width: "100%" }}> */}
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "status"]}
                                                                                                            fieldKey={[field.fieldKey, "status"]}
                                                                                                            // label={GetIntlMessages("สถานะปรับเพิ่ม / ลด")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Radio.Group options={[
                                                                                                                {
                                                                                                                    label: 'ปรับเพิ่ม',
                                                                                                                    value: 2,
                                                                                                                },
                                                                                                                {
                                                                                                                    label: 'ปรับลด',
                                                                                                                    value: 3,
                                                                                                                    disabled: form.getFieldValue().product_list[index].warehouse_detail[i].new_data_status === true
                                                                                                                },
                                                                                                            ]}
                                                                                                                buttonStyle="solid"
                                                                                                                disabled
                                                                                                                // disabled={configModal.mode === "view"}
                                                                                                                // onChange={(val) => onChangeEachProductStatus(val, index, i)}
                                                                                                                // checked={form.getFieldValue()?.product_list[index]?.warehouse_detail[i]?.status}
                                                                                                                value={form.getFieldValue()?.product_list[index]?.warehouse_detail[i]?.status}
                                                                                                            />
                                                                                                            {/* <Switch style={{width : "100%"}} checkedChildren={GetIntlMessages("ปรับเพิ่ม")} unCheckedChildren={GetIntlMessages("ปรับลด")} checked={formModal.getFieldValue()?.product_list[index]?.warehouse_detail[i]?.status ?? true} onChange={(bool) => onChangeEachProductStatus(bool, index, i)} disabled={configModal.mode === "view"} /> */}
                                                                                                        </Form.Item>
                                                                                                        {/* </Col> */}
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        {/* <Col xxl={8} lg={8} md={12} xs={24} style={{ width: "100%" }}> */}
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "remark_adjust"]}
                                                                                                            fieldKey={[field.fieldKey, "remark_adjust"]}
                                                                                                            // label={GetIntlMessages("remark")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <AutoComplete
                                                                                                                options={[
                                                                                                                    {
                                                                                                                        value: 'ปรับปรุงผลต่างจากการนับสินค้า',
                                                                                                                    },
                                                                                                                    {
                                                                                                                        value: ' ปรับปรุงสินค้าเสียหาย',
                                                                                                                    },
                                                                                                                    {
                                                                                                                        value: 'ยอดยกมา',
                                                                                                                    },
                                                                                                                    {
                                                                                                                        value: 'ค้างส่ง',
                                                                                                                    },
                                                                                                                    {
                                                                                                                        value: 'อื่นๆ',
                                                                                                                    },
                                                                                                                ]}
                                                                                                                showArrow
                                                                                                                filterOption={(input, option) => option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                                                                                                disabled
                                                                                                                // disabled={configModal.mode === "view"}
                                                                                                                placeholder={GetIntlMessages("เลือกข้อมูลหรือเพิ่มข้อมูลใหม่")}
                                                                                                            />
                                                                                                        </Form.Item>
                                                                                                        {/* </Col> */}
                                                                                                    </td>
                                                                                                    {form.getFieldValue()?.References_import_doc ? <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "balance"]}
                                                                                                            fieldKey={[field.fieldKey, "balance"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Input disabled type="number" placeholder="จำนวน" />
                                                                                                        </Form.Item>
                                                                                                    </td> : null}
                                                                                                    {mode !== "add" ? <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "old_current_amount"]}
                                                                                                            fieldKey={[field.fieldKey, "old_current_amount"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Input disabled type="number" placeholder="จำนวน" />
                                                                                                        </Form.Item>
                                                                                                    </td> : null}

                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "current_amount"]}
                                                                                                            fieldKey={[field.fieldKey, "current_amount"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Input disabled />
                                                                                                        </Form.Item>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "amount"]}
                                                                                                            fieldKey={[field.fieldKey, "amount"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Input type={`number`} disabled min={0} placeholder="จำนวน" onChange={(value) => debounceEachProductAmount(index, i, value.target.value)} />
                                                                                                        </Form.Item>
                                                                                                    </td>
                                                                                                    <td>
                                                                                                        <Form.Item
                                                                                                            validateTrigger={['onChange', 'onBlur']}
                                                                                                            name={[field.name, "adjust_amount"]}
                                                                                                            fieldKey={[field.fieldKey, "adjust_amount"]}
                                                                                                            // label={GetIntlMessages("จำนวนคงเหลือ")}
                                                                                                            noStyle
                                                                                                        >
                                                                                                            <Input disabled />
                                                                                                        </Form.Item>
                                                                                                    </td>


                                                                                                    {/* {configModal.mode !== "view" ?
                                                                                                        <td style={{ textAlign: "center" }}>
                                                                                                            <Popconfirm title={`ต้องการที่จะลบข้อมูลนี้หรือไม่ !?`} onConfirm={() => removeWarehouseList(remove, field.name, index, i)} okText={'ตกลง'} cancelText={'ยกเลิก'}>
                                                                                                                {formModal.getFieldValue().product_list[index]?.warehouse_detail[i]?.new_data_status === true ?
                                                                                                                    <Button icon={<MinusCircleOutlined />}>
                                                                                                                        ลบรายการ
                                                                                                                    </Button>
                                                                                                                    : null}
                                                                                                            </Popconfirm>
                                                                                                        </td>
                                                                                                        : null} */}
                                                                                                </tr>
                                                                                            )) :
                                                                                            <tr>
                                                                                                <td colspan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                                                                                            </tr>
                                                                                    }
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </Form.List>
                                                    </Fieldset>

                                                </Form.Item>
                                            ))}

                                        </>
                                    )}
                                </Form.List>
                            </Form.Item>
                        </div>

                        <Fieldset legend={GetIntlMessages("สรุปรายการ")}>
                            <Row>
                                <Col span={8}>
                                    <Form.Item
                                        name="note"
                                        label="หมายเหตุ"
                                    >
                                        <Input.TextArea disabled rows={9} />
                                    </Form.Item>
                                </Col>
                                <Col span={10} />
                                <Col span={6}>

                                </Col>
                            </Row>

                        </Fieldset>
                    </Form>
                )

            } else {
                return (
                    <>
                        <div className="container-fluid">
                            <div className='pr-5 pl-5 detail-before-table'>
                                <FormServicePlans mode={mode} form={form} taxTypesList={taxTypes ?? []} calculateResult={calculateResult} type={1} docTypeId={docTypeData?.id} visibleViewDocument={visibleViewDocument} loading={loading} />
                            </div>

                            <div className='tab-detail'>
                                <Tabs activeKey={activeKeyTab} onChange={(value) => setActiveKeyTab(value)}>
                                    <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                                        <Tab1ServiceProduct mode={mode} form={form} calculateResult={calculateResult} checkTaxId={checkTaxId} isTableNoStyle={true} isShowShopStockBtn={false}/>
                                    </TabPane>
                                    {
                                        mode != "add" ?
                                            <>
                                                <TabPane tab={GetIntlMessages("ลูกค้า")} key="2">
                                                    <Tab2Custome mode={mode} form={form} />
                                                </TabPane>
                                                <TabPane tab={GetIntlMessages("รถยนต์")} key="4">
                                                    <Tab4Vehicle mode={mode} form={form} />
                                                </TabPane>
                                            </>
                                            : null
                                    }
                                </Tabs>
                            </div>
                        </div>
                    </>
                )
            }
        } catch (error) {
            // console.log('error displayModalData :>> ', error);
        }
    }

    return (
        <>
            <ModalFullScreen
                title={`${docTypeData?.type_name} ${get(viewDocumentData, `ShopInventoryTransactionDoc.code_id`, viewDocumentData?.ShopSalesTransactionDoc?.code_id)}`}
                visible={visibleViewDocument}
                // onCancel={handleCancelViewDocument}
                className={`modal-padding-20px-screen`}
                CustomsButton={() => {
                    return (
                        <div>
                            <span className='pr-3'>
                                <Button loading={loading} onClick={closeViewDocModal} style={{ width: 100 }}>{GetIntlMessages("ปิด")}</Button>
                            </span>
                        </div>
                    )
                }}
            >
                {displayModalData()}
            </ModalFullScreen>
        </>

    )
}

export default ModalViewDocument