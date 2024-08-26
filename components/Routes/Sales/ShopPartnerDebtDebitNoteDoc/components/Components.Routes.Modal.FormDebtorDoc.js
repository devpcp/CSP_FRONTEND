import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space, Tooltip } from 'antd'
import { debounce, get, isArray, isEmpty, isFunction, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
const FormTemporaryDeliveryOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false, getStatusCarLoading }) => {

    const form = Form.useFormInstance();

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    // const partnerPhoneList = Form.useWatch("partner_phone_list", { form, preserve: true })

    useEffect(() => {
        // getMasterData()
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [value1] = []

                // Check if the component is still mounted before updating the state
                if (isMounted) {
                    const newDataValue2 = []
                    value1.map(e => {
                        const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                        if (isPlainObject(authUser.UsersProfile)) {
                            // console.log('authUser.UsersProfile', authUser.UsersProfile)
                            const { shop_id } = authUser.UsersProfile;
                            // console.log('shop_id', shop_id , e.shop_id)
                            if (fname && lname && e.UsersProfile.shop_id === shop_id) {
                                newDataValue2.push({
                                    id: e.id,
                                    name: `${fname} ${lname}`,
                                    groups: e.Groups
                                })
                            }
                        }

                    })

                    if (isMounted) {
                        setUserList(newDataValue2);
                    }
                }
            } catch (error) {
                // Handle errors
            }
        };

        fetchData();
        // Check if the component is still mounted before updating the state


        setOpen(false)
        return () => {
            isMounted = false;
        };

    }, [])



    const getArrValue = (type) => {
        try {
            const fieldValue = form.getFieldValue(`${type}`);
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }

    const debounceEasySearch = debounce((value, type) => handleEasySearch(value, type), 800)
    const [loadingEasySearch, setLoadingEasySearch] = useState(false)

    const handleEasySearch = async (value, type) => {
        try {
            setLoadingEasySearch(() => true)
            switch (type) {
                case "search":
                    if (!!value) {
                        const { doc_sales_type } = form.getFieldValue();

                        const { data } = await API.get(`/shopInventoryTransaction/all?search=${value}&status=default&page=1&limit=50&sort=doc_date&order=desc&doc_type_id=ad06eaab-6c5a-4649-aef8-767b745fab47`)

                        if (data.status === "success") {

                            const newData = data.data.data.map(e => {
                                const partner_name = !!e?.ShopBusinessPartners ? e.ShopBusinessPartners.partner_name[locale.locale] : "-";

                                return {
                                    ...e,
                                    partner_name,
                                    bus_partner_id: !!e?.ShopBusinessPartners ? e?.ShopBusinessPartners.id : e?.ShopBusinessPartners.id
                                }
                            })
                            form.setFieldsValue({ easy_search_list: newData })
                        }
                    }

                    break;

                case "select":
                    if (isFunction(getStatusCarLoading)) getStatusCarLoading(true);
                    const { easy_search_list } = form.getFieldValue(), findSelected = easy_search_list.find(where => where.id === value);
                    const { data } = await API.get(`/shopInventory/bydocinventoryid/${findSelected?.id}`)
                    if (!!findSelected) {

                        form.setFieldsValue({
                            options_list: data.data.product_list ?? [],
                            ref_doc_list: easy_search_list,
                            shop_inventory_import_doc_id: findSelected.id,
                            arr_debt_list: [],
                            price_from_doc: findSelected?.details?.net_price ?? 0,
                        })
                        await handleSearchPartner(findSelected.bus_partner_id, 'search', 'easy_search')
                        await handleSearchPartner(findSelected.bus_partner_id, 'select', 'easy_search')
                    }
                    if (isFunction(getStatusCarLoading)) getStatusCarLoading(false);
                    break;

                default:
                    break;
            }
            setLoadingEasySearch(() => false)
        } catch (error) {
            // console.log('error handleEasySearch:>> ', error);
        }
    }



    const [open, setOpen] = useState(true);
    const controlOpen = (value) => {
        try {
            setOpen(value)
        } catch (error) {

        }
    }


    const debounceSearchPartner = debounce((value, type) => handleSearchPartner(value, type), 800)
    const [loadingPartner, setLoadingPartner] = useState(false)
    const handleSearchPartner = async (value, type, selectedFrom = 'bus_partner_id') => {
        try {
            setLoadingPartner(true)
            switch (type) {
                case "search":
                    if (!!value) {
                        const { partner_type } = form.getFieldValue()

                        let url =
                            selectedFrom === "bus_partner_id"
                                ? `/${`shopBusinessPartners`}/all?search=${value}&limit=9999999&page=1&sort=partner_name.th&order=asc&status=active`
                                : `/${`shopBusinessPartners`}/byid/${value}`;

                        const { data } = await API.get(url);

                        if (data.status === "success") {
                            const extractData = selectedFrom === 'bus_partner_id' ? data.data.data : [data.data]

                            const newData = extractData.map(e => {
                                const partner_name = !!e ? e.partner_name[locale.locale] : "-";

                                return {
                                    ...e,
                                    partner_name,
                                    bus_partner_id: e.id
                                }
                            })
                            form.setFieldValue("partner_list", newData)
                            // setEasySearchList(() => newData)
                        }
                    }

                    break;
                case "select":
                    const { partner_list } = form.getFieldValue(), find = partner_list.find(where => where.id === value), partner_phone_list = !!find?.mobile_no ? Object.entries(find?.mobile_no).map((x) => x[1]).filter(where => where !== null) : [];

                    let address = `${find?.address?.[locale.locale] ?? ""} ${find?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${find?.District?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.zip_code ?? ""}`
                    let partner_credit_debt_unpaid_balance = 0, partner_credit_debt_current_balance = 0, debt_due_date = null;

                    if (isPlainObject(find)) {
                        partner_credit_debt_unpaid_balance = find?.other_details?.debt_amount ?? null
                        partner_credit_debt_current_balance = (Number(find?.other_details?.credit_limit) - Number(find?.other_details?.debt_amount)) ?? null
                        debt_due_date = moment(moment(new Date()).add(Number(find?.other_details?.credit_term), 'd'))
                    }
                    form.setFieldsValue({
                        bus_partner_id: find?.id,
                        partner_credit_debt_unpaid_balance,
                        partner_credit_debt_current_balance,
                        partner_credit_debt_approval_balance: find?.other_details?.credit_limit ?? null,
                        partner_credit_debt_payment_period: find?.other_details?.credit_term ?? null,
                    })

                    break;

                default:
                    break;

            }
            setLoadingPartner(false)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    return (
        <>
            <Row gutter={[20, 0]}>
                {mode !== "view" ?
                    <>
                        <Form.Item name="easy_search_list" shouldUpdate={(prevValue, curValue) => prevValue !== curValue} hidden />

                        <Col offset={6} span={12} disabled={mode === "view"}>
                            <Form.Item
                                name="easy_search"
                                label={GetIntlMessages("search")}
                                labelAlign='left'
                                colon={false}
                                wrapperCol={{ xl: { span: 24 }, lg: { span: 16 }, md: { span: 18 }, xs: { span: 24 } }}
                            // extra={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onChange={(value) => handleEasySearch(value, "select")}
                                    filterOption={false}
                                    notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    // notFoundContent={checkSearching ? "ค้นหาข้อมูลชื่อผู้จำหน่าย ทะเบียนรถ หรือเบอร์โทรศัพท์" : "ไม่พบข้อมูล เพิ่มข้อมูลได้ที่ปุ่มด้านขวา"}
                                    style={{ width: "100%" }}
                                    loading={loadingEasySearch}
                                    placeholder={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
                                >
                                    {getArrValue("easy_search_list").map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{`${e.code_id} -> ${e.partner_name}`}</Select.Option>)}
                                    {/* {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)} */}

                                </Select>
                            </Form.Item>
                        </Col>
                    </>

                    : null}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="bus_partner_id"
                        label="ชื่อผู้จำหน่าย"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกผู้จำหน่าย"
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                            placeholder="กรุณาพิมพ์อย่าง 1 ตัวเพื่อค้นหา"
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                            onSearch={(value) => debounceSearchPartner(value, "search")}
                            onSelect={(value) => handleSearchPartner(value, "select")}

                        >
                            {getArrValue("partner_list").map(e => <Select.Option value={e.id} key={`partner-id-${e.id}`}>{e.partner_name}</Select.Option>)}

                        </Select>
                    </Form.Item>
                </Col>

                {/* <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="partner_phone"
                        label="เบอร์โทรศัพท์"
                        shouldUpdate={(prevValue, currentValue) => prevValue.partner_phone !== currentValue.partner_phone}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            // filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                        >
                            {!!partnerPhoneList ? partnerPhoneList.map((e, index) => (<Select.Option value={e} key={`partner-phone-${index}`}>{e}</Select.Option>)) ?? [] : []}
                        </Select>
                    </Form.Item>
                </Col> */}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_unpaid_balance"
                        label="จำนวนเงินค้างชำระ"
                    // rules={[RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]}
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />

                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="shop_inventory_import_doc_id"
                        // label="เลขที่อ้างอิง"
                        label={
                            <>
                                {`เลขที่อ้างอิง`}
                                {/* < Tooltip
                                    title="ชื่อผู้จำหน่ายจะอ้างอิงจากใบวางบิล..ท่านสามารถเปลี่ยนชื่อผู้จำหน่ายได้หลังจากเลือกใบวางบิล">
                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                </Tooltip> */}
                            </>
                        }
                    // rules={[RegexMultiPattern()]}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            disabled
                        >
                            {
                                getArrValue("ref_doc_list").map((e, index) => (<Select.Option key={`ref-doc-${index}`} value={e.id}>{e?.code_id}</Select.Option>))
                            }
                        </Select>
                        {/* <Input disabled={mode === "view"}/> */}
                    </Form.Item>
                </Col>


                {/* <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name=""
                        label="วันที่อ้างอิง"
                        
                    >
                        <DatePicker style={{ width: "100%" }} format={"YYYY-MM-DD"} disabled={mode === "view"} />
                    </Form.Item>
                </Col> */}
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_current_balance"
                        label="วงเงินเครดิตคงเหลือ"
                    // rules={[RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]}
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="partner_credit_debt_payment_period"
                        label="ระยะเวลาชำระ"
                    >
                        <InputNumber disabled className='ant-input-number-with-addon-after' stringMode min={0} precision={0} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} addonAfter={`วัน`} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_credit_debt_approval_balance"
                        label="วงเงินอนุมัติ"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="debt_due_date"
                        label="วันที่กำหนดรับชำระ"
                    >
                        <DatePicker style={{ width: "100%" }} format={"YYYY-MM-DD"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>
                {/* <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name=""
                        label="ประเภทชำระ"
                    >
                        <Input/>
                    </Form.Item>
                </Col> */}

                {/* <Form.Item name="partner_phone_list" hidden /> */}

                {/* <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="user_id"
                        label="ผู้ทำเอกสาร"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกผู้ทำเอกสาร"
                            }
                        ]}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view" || disabledWhenDeliveryDocActive}
                            loading={loadingEasySearch}
                        >

                            {userList.map((e, index) => <Select.Option value={e.id} key={`user-list-${index}`}>{e.name}</Select.Option>)}
                            
                        </Select>
                    </Form.Item>
                </Col> */}

                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="doc_type_id"
                        label="ประเภทเอกสาร"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {documentTypes.map((e, index) => <Select.Option value={e.id} key={`doc-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                            {/* {getArrValue("vehicles_partners_list").map((e, index) => <Select.Option value={e.id} key={`partner-phone-${index}`}>{e}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24} >
                    <Form.Item
                        name="tax_type_id"
                        label={`ประเภทภาษี`}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view" || disabledWhenDeliveryDocActive}
                            loading={loadingEasySearch}
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
                            loading={loadingEasySearch}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="status"
                        label="สถานะ"
                    >
                        <Select style={{ width: "100%" }} disabled>
                            <Select.Option value={mode === "add" ? "0" : 0}>ลบเอกสาร</Select.Option>
                            <Select.Option value={mode === "add" ? "1" : 1}>ใช้งานเอกสาร</Select.Option>
                            <Select.Option value={mode === "add" ? "2" : 2}>ยกเลิกเอกสาร</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label="วันที่เอกสาร"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="ref_doc"
                        label="เลขที่อ้างอิง"
                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

        </>

    )
}

export default FormTemporaryDeliveryOrderDoc