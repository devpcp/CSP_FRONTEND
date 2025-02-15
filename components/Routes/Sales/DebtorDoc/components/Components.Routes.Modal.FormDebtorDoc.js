import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space, Tooltip, Button, Modal } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import RegexMultiPattern from '../../../../shares/RegexMultiPattern'
import ModalBothCustomersAndCar from '../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import ModalBusinessCustomers from '../../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../../Modal/Components.Select.Modal.PersonalCustomers'
import BusinessCustomersData from '../../../../../routes/MyData/BusinessCustomersData'
import PersonalCustomersData from '../../../../../routes/MyData/PersonalCustomersData'

const FormTemporaryDeliveryOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false }) => {

    const form = Form.useFormInstance();

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    const [isCustomerDataModalVisible, setIsCustomerDataModalVisible] = useState(false);
    const customerPhoneList = Form.useWatch("customer_phone_list", { form, preserve: true })
    const customerList = Form.useWatch("customer_list", { form, preserve: true })

    useEffect(() => {
        getMasterData()
        setOpen(false)
    }, [])

    const getArrValue = (type) => {
        try {
            const fieldValue = form.getFieldValue(`${type}`)
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }

    const getMasterData = async () => {
        try {
            const [value1, value2] = await Promise.all([getRepairMan(), getUser()])
            const new_data = value1.map(e => {
                const newData = { ...e, name: {} }
                locale.list_json.forEach(x => {
                    newData.name[x] = `${e.UsersProfile.fname[x] ?? "-"} ${e.UsersProfile.lname[x] ?? "-"}` ?? ""
                    return newData
                })
                return newData
            })
            // console.log('value2 :>> ', value2);
            const newDataValue2 = []
            value2.map(e => {
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

            setRepairManList(() => [...new_data])
            setUserList(() => [...newDataValue2])
            form.setFieldsValue({ repair_man_list: new_data })
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    /* ดึงข้อมูลช่างซ่อม */
    const getRepairMan = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=false&department_id=71b4f85b-42c4-457a-af6a-0a9e6e3b2c1e`);
            return data.status === "success" ? data.data.data : []
        } catch (error) {

        }
    }
    /* get user data */
    const getUser = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
            return data.status === "success" ? data.data.data : []
        } catch (error) {

        }

    }

    const handleChangeCustomerType = (value) => {
        try {
            form.setFieldsValue({
                customer_id: null,
                customer_list: [],
                customer_phone: null,
                customer_phone_list: []
            })
        } catch (error) {

        }
    }

    const debounceEasySearch = debounce((value, type) => handleEasySearch(value, type), 800)
    const [loadingEasySearch, setLoadingEasySearch] = useState(false)

    const handleEasySearch = async (value, type) => {
        try {
            setLoadingEasySearch(() => true)
            const { customer_type } = form.getFieldValue()
            switch (type) {
                case "search":
                    if (!!value) {

                        const { data } = await API.get(`/${customer_type === "person" ? `shopPersonalCustomers` : `shopBusinessCustomers`}/all?search=${value}&limit=25&page=1&sort=customer_name.th&order=asc&status=active`);
                        // console.log('data :>> ', data);
                        if (data.status === "success") {
                            const newData = data.data.data.map(e => {
                                // const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                                const customer_full_name = customer_type === "person" ?
                                    `${e.customer_name.first_name[locale.locale] ?? "-"} ${e.customer_name.last_name[locale.locale] ?? ""}` :
                                    `${e.customer_name[locale.locale] ?? "-"}`;

                                // const mobile_no = Object.entries(e.mobile_no).map((x) => x[1]);
                                // const vehicles_registration = `${isPlainObject(e.details) ? e.details.registration : "-"}`;
                                return {
                                    ...e,
                                    // value_name: `${customer_full_name}  -> ${vehicles_registration} ${!!mobile_no.toString() ? `-> ${mobile_no.toString()}` : ""}`,
                                    customer_type,
                                    customer_full_name,
                                    // mobile_no: mobile_no.length > 0 ? mobile_no[0] : null,
                                    // customer_phone_list : mobile_no ?? [],
                                    customer_id: e.id
                                }
                            })
                            form.setFieldValue("customer_list", newData)
                            // setEasySearchList(() => newData)
                        }
                    }

                    break;

                case "select":

                    const { customer_list } = form.getFieldValue(), find = customer_list.find(where => where.id === value), customer_phone_list = Object.entries(find.mobile_no).map((x) => x[1]).filter(where => where !== null), { other_details } = find;
                    let address = `${find?.address?.[locale.locale] ?? ""} ${find?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${find?.District?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.zip_code ?? ""}`
                    let customer_credit_debt_unpaid_balance = 0, customer_credit_debt_current_balance = 0, debt_due_date = null;

                    if (isPlainObject(find)) {
                        console.log("finddd", find)
                        customer_credit_debt_unpaid_balance = other_details?.debt_amount === NaN || other_details?.debt_amount === "NaN" ? 0 : other_details?.debt_amount ?? null
                        customer_credit_debt_current_balance = (Number(other_details?.credit_limit) - Number(other_details?.debt_amount)) ?? null
                        debt_due_date = moment(moment(new Date()).add(Number(find?.other_details?.credit_term), 'd'))
                    }

                    form.setFieldsValue({
                        customer_type: find?.customer_type ?? customer_type,
                        customer_id: find.id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0],
                        address,
                        debt_due_date,
                        customer_credit_debt_unpaid_balance,
                        customer_credit_debt_current_balance,
                        customer_credit_debt_approval_balance: other_details?.credit_limit ?? null,
                        customer_credit_debt_payment_period: other_details?.credit_term ?? null,
                    })
                    break;

                default:
                    break;
            }
            setLoadingEasySearch(() => false)
        } catch (error) {
            console.log('error handleEasySearch:>> ', error);
        }
    }

    const callbackCustomers = async (val) => {
        try {
            const { details } = val
            await handleEasySearch(details.registration, "search")
            const { easy_search_list } = form.getFieldValue()
            const find = easy_search_list.find(where => where.details.registration === details.registration)
            if (isPlainObject(find)) {
                await handleEasySearch(find.id, "select")
            }

        } catch (error) {

        }
    }

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    }

    const [open, setOpen] = useState(true);
    const controlOpen = (value) => {
        try {
            setOpen(value)
        } catch (error) {

        }
    }

    const [detorBillingList, setDetorBillingList] = useState([])
    const debounceSearchDebtorBilling = debounce((value, type) => handleSearchDebtorBilling(value, type), 800)
    const [loadingDebtorBilling, setLoadingDebtorBilling] = useState(false)
    const handleSearchDebtorBilling = async (value, type) => {
        try {
            // console.log('value :>> ', value);
            setLoadingDebtorBilling(true)
            switch (type) {
                case "search":
                    const { data } = await API.get(`/shopCustomerDebtBillingNoteDoc/all?${value ? `search=${value}&` : ""}filter__debt_price_amount_left=false&status=active&page=1&limit=50&sort=code_id&order=desc`)

                    if (data.status === "success") {
                        // setDetorBillingList(data.data.data)
                        const newValue = data.data.data.map((e, index) => ({
                            ...e,
                            display_value: `${e?.code_id} -> ${!!e?.bus_customer_id ? e?.ShopBusinessCustomer?.customer_name[locale.locale] ?? "-" : `${e?.ShopPersonalCustomer?.customer_name?.first_name[locale.locale] ?? ""} ${e.ShopPersonalCustomer.customer_name?.last_name[locale.locale] ?? ""}`}`
                        }))

                        form.setFieldsValue({ debtor_billing_list: newValue })
                    }
                case "select":
                    const { debtor_billing_list, customer_id } = form.getFieldValue(), find = debtor_billing_list.find(where => where.id === value);

                    if (!!find && isPlainObject(find)) {
                        console.log("find", find)
                        debtor_billing_list = debtor_billing_list.map(e => (delete e.display_value, { ...e }))
                        const { ShopCustomerDebtBillingNoteLists, doc_date, debt_due_date, status, bus_customer_id, per_customer_id, ShopBusinessCustomer, ShopPersonalCustomer, details } = find,
                            customer_type = !!bus_customer_id ? "business" : "person",
                            customer_list = customer_type === "business" ? [ShopBusinessCustomer].map(e => ({ ...e, customer_full_name: `${e.customer_name[locale.locale] ?? "-"}` })) :
                                [ShopPersonalCustomer].map(e => ({ ...e, customer_full_name: `${e.customer_name.first_name[locale.locale] ?? "-"} ${e.customer_name.last_name[locale.locale] ?? ""}` }));
                        ShopCustomerDebtBillingNoteLists.map((e, i) => {
                            // console.log("easy",e)
                            if (e.ShopCustomerDebtCreditNoteDoc !== null) {
                                e.debt_price_amount_left = e.debt_price_amount < 0 ? e.debt_price_amount : -e.debt_price_amount
                                e.debt_price_paid_total = -e.debt_price_amount
                                e.doc_type_code_id = "CCN"
                            }
                            if (e.ShopCustomerDebtDebitNoteDoc !== null) {
                                e.doc_type_code_id = "CDN"
                            }
                            if (e.ShopCustomerDebtCreditNoteDocT2 !== null) {
                                e.debt_price_amount_left = e.debt_price_amount < 0 ? e.debt_price_amount : -e.debt_price_amount
                                e.debt_price_paid_total = -e.debt_price_amount
                                e.doc_type_code_id = "NCN"
                            }
                            e.debt_price_paid_adjust = 0
                            e.debt_price_paid_total = e.debt_price_amount_left

                        })
                        let customer_credit_debt_unpaid_balance = 0, customer_credit_debt_current_balance = 0, other_details
                        switch (customer_type) {
                            case "business":
                                other_details = ShopBusinessCustomer.other_details
                                break;
                            case "person":
                                other_details = ShopPersonalCustomer.other_details
                                break;
                        }
                        customer_credit_debt_unpaid_balance = other_details?.debt_amount === NaN || other_details?.debt_amount === "NaN" ? 0 : other_details?.debt_amount ?? null
                        customer_credit_debt_current_balance = (Number(other_details?.credit_limit) - Number(other_details?.debt_amount)) ?? null

                        ShopCustomerDebtBillingNoteLists.sort((a, b) => a.seq_number - b.seq_number)
                        let model = {
                            // ...find,
                            customer_type,
                            customer_list,
                            customer_id: bus_customer_id ?? per_customer_id,
                            doc_date: moment(doc_date),
                            debt_due_date: moment(debt_due_date),
                            status: mode === "add" ? `${status}` : status,
                            shopCustomerDebtLists: ShopCustomerDebtBillingNoteLists,
                            remark: details?.remark,
                            remark_inside: details?.remark_inside,
                            debt_price_paid_total: null,
                            debtor_billing_list,
                            customer_credit_debt_unpaid_balance,
                            customer_credit_debt_current_balance,
                            customer_credit_debt_approval_balance: other_details?.credit_limit === "NaN" || other_details?.credit_limit === null || other_details?.credit_limit === undefined ? 0 : other_details?.credit_limit,
                            customer_credit_debt_payment_period: other_details?.credit_term === "NaN" || other_details?.credit_term === null || other_details?.credit_limit === undefined ? 0 : other_details?.credit_term,
                        }
                        form.setFieldsValue(model)
                    }
                    calculateResult()
                    break;

                default:
                    break;

            }
            setLoadingDebtorBilling(false)
        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    const callBackPickCustomer = async (data) => {
        try {
            await handleEasySearch(data.master_customer_code_id, "search")
            await handleEasySearch(data.id, "select")
            handleCancelCustomerDataModal()
        } catch (error) {
            console.log("callBackPickCustomer", error)
        }
    }

    const handleOpenCustomerDataModal = () => {
        try {
            setIsCustomerDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelCustomerDataModal = () => {
        try {
            setIsCustomerDataModalVisible(false)
        } catch (error) {

        }
    }

    return (
        <>
            <Row gutter={[20, 0]}>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="ref_doc"
                        // label="เลขที่อ้างอิง"
                        label={
                            <>
                                {`เลขที่อ้างอิง`}
                                < Tooltip
                                    title="ชื่อลูกค้าจะอ้างอิงจากใบวางบิล..ท่านสามารถเปลี่ยนชื่อลูกค้าได้หลังจากเลือกใบวางบิล">
                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                </Tooltip>
                            </>
                        }
                    // rules={[RegexMultiPattern()]}
                    >
                        <Select
                            showSearch
                            onSearch={(value) => debounceSearchDebtorBilling(value, "search")}
                            onSelect={(value) => handleSearchDebtorBilling(value, "select")}
                            filterOption={false}
                            notFoundContent={loadingDebtorBilling ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล..กรุณาพิมพ์เพื่อค้นหา"}
                            loading={loadingDebtorBilling}
                            disabled={mode !== "add"}
                            placeholder={"เลือกเอกสาร"}
                        >
                            {
                                getArrValue("debtor_billing_list").map((e, index) => (<Select.Option key={`detor-billing-${index}`} value={e.id}>{e?.display_value ?? e?.code_id}</Select.Option>))
                            }
                        </Select>
                        {/* <Input disabled={mode === "view"}/> */}
                    </Form.Item>
                </Col>

                {/* <Form.Item name="customer_list" hidden /> */}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Row gutter={8}>
                        <Col span={mode === "view" ? 24 : 20}>
                            <Form.Item
                                name="customer_id"
                                label="ชื่อลูกค้า"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาเลือกลูกค้า"
                                    },
                                ]}
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    // autoFocus
                                    notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    placeholder="กรุณาพิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา"
                                    style={{ width: "100%" }}
                                    // disabled
                                    // open={open}
                                    // onDropdownVisibleChange={(visible) => controlOpen(visible)}
                                    disabled={mode === "view"}
                                    loading={loadingEasySearch}
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onSelect={(value) => handleEasySearch(value, "select")}
                                // dropdownRender={menu => (
                                //     <>
                                //         {menu}
                                //         <Divider style={{ margin: '8px 0' }} />
                                //         <Space align="center" style={{ padding: '0 8px 4px' }}>
                                //             {
                                //                 checkValueCustomerType() === "business" ?
                                //                     <ModalBusinessCustomers controlOpen={controlOpen} textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าธุรกิจ`)} icon={<PlusOutlined />} callback={callbackCustomers} /> :
                                //                     <ModalPersonalCustomers controlOpen={controlOpen} textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าบุคคลธรรมดา`)} icon={<PlusOutlined />} callback={callbackCustomers} />
                                //             }
                                //         </Space>
                                //     </>
                                // )}
                                >
                                    {!!customerList ? customerList.map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{e.customer_full_name}</Select.Option>) ?? [] : []}
                                    {/* {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)} */}

                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={mode === "view" ? 0 : 4} style={{ justifyContent: "end" }}>
                            <Form.Item label={" "}>
                                <Button
                                    type='primary'
                                    style={{ width: "100%", borderRadius: "10px" }}
                                    onClick={() => handleOpenCustomerDataModal()}
                                >
                                    เลือก
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="customer_phone"
                        label="เบอร์โทรศัพท์"
                        shouldUpdate={(prevValue, currentValue) => prevValue.customer_phone !== currentValue.customer_phone}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            // filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                        >
                            {/* {getArrValue("customer_phone_list").map((e, index) => <Select.Option value={e} key={`customer-phone-${index}`}>{e}</Select.Option>)} */}
                            {!!customerPhoneList ? customerPhoneList.map((e, index) => (<Select.Option value={e} key={`customer-phone-${index}`}>{e}</Select.Option>)) ?? [] : []}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_credit_debt_unpaid_balance"
                        label="จำนวนเงินค้างชำระ"
                    // rules={[RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]}
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />

                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_type"
                        label="ประเภทลูกค้า"
                    >
                        <Select disabled={mode === "view"} onChange={(value) => handleChangeCustomerType(value)} style={{ width: "100%" }} showArrow={false}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
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
                        name="customer_credit_debt_current_balance"
                        label="วงเงินเครดิตคงเหลือ"
                    // rules={[RegexMultiPattern("4", GetIntlMessages("ตัวเลขเท่านั้น"))]}
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_credit_debt_payment_period"
                        label="ระยะเวลาชำระ"
                    >
                        <InputNumber disabled className='ant-input-number-with-addon-after' stringMode min={0} precision={0} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} addonAfter={`วัน`} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_credit_debt_approval_balance"
                        label="วงเงินอนุมัติ"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="debt_due_date"
                        label="วันที่กำหนดรับชำระ"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>

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
                            {/* {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e.id} key={`customer-phone-${index}`}>{e}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
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
                <Col lg={8} md={12} sm={12} xs={24} hidden>
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
            </Row>
            <Modal
                maskClosable={false}
                open={isCustomerDataModalVisible}
                onCancel={handleCancelCustomerDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelCustomerDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {form.getFieldValue().customer_type === "person" ? <PersonalCustomersData title="จัดการข้อมูลลูกค้าบุคคลธรรมดา" callBack={callBackPickCustomer} /> : <BusinessCustomersData title="จัดการข้อมูลลูกค้าธุรกิจ" callBack={callBackPickCustomer} />}
            </Modal>
        </>

    )
}

export default FormTemporaryDeliveryOrderDoc