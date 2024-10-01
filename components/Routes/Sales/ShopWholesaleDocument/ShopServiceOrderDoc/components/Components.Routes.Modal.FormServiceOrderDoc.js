import { PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, Modal, Divider, Space, Button, InputNumber } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../../util/Api'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalBothCustomersAndCar from '../../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import ModalBusinessCustomers from '../../../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../../../Modal/Components.Select.Modal.PersonalCustomers'
import BusinessCustomersData from '../../../../../../routes/MyData/BusinessCustomersData'
import PersonalCustomersData from '../../../../../../routes/MyData/PersonalCustomersData'
import { takeOutComma } from "../../../../../shares/ConvertToCurrency";

const FormServiceOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false, setCustomerType, setCustomerPickToCreateINV, setCustomerPickToCreateINVName }) => {

    const form = Form.useFormInstance()

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [salesManList, setSalesManList] = useState([])
    const customerPhoneList = Form.useWatch("customer_phone_list", { form, preserve: true })
    const customerList = Form.useWatch("customer_list", { form, preserve: true })
    const [isCustomerDataModalVisible, setIsCustomerDataModalVisible] = useState(false);

    useEffect(() => {
        getMasterData()
    }, [])

    useEffect(() => {
        try {
            if (mode === "add") {
                let enable_sale_tax_type = isPlainObject(authUser?.UsersProfile?.ShopsProfile?.shop_config) ? authUser?.UsersProfile?.ShopsProfile?.shop_config["enable_sale_tax_type"] ?? "" : ""
                switch (enable_sale_tax_type) {
                    case "include_vat":
                        form.setFieldsValue({
                            tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                        })
                        break;
                    case "exclude_vat":
                        form.setFieldsValue({
                            tax_type_id: "fafa3667-55d8-49d1-b06c-759c6e9ab064",
                        })
                        break;
                    case "no_vat":
                        form.setFieldsValue({
                            tax_type_id: "52b5a676-c331-4d03-b650-69fc5e591d2c",
                        })
                        break;
                    default:
                        form.setFieldsValue({
                            tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
                        })
                        break;
                }
            }
        } catch (error) {
            console.log("error req_repariman", error)
        }
    }, [mode])

    const getArrValue = (type) => {
        try {
            // const fieldValue = Form.useWatch(type, { form, preserve: true })
            // console.log('fieldValue :>> ', fieldValue);
            // return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []

            const fieldValue = form.getFieldValue(`${type}`)
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
            console.log('error getArrValue:>> ', error);
        }
    }

    const getMasterData = async () => {
        try {
            console.log(authUser.UsersProfile.ShopsProfile.id)
            const [value1, value2] = await Promise.all([getSalesMan(), getUser()])
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
                    if (fname && lname) {
                        newDataValue2.push({
                            id: e.id,
                            name: `${fname} ${lname}`,
                            groups: e.Groups
                        })
                    }
                }

            })

            setSalesManList(() => [...new_data])
            setUserList(() => [...newDataValue2])
            form.setFieldsValue({ sales_man_list: new_data })
        } catch (error) {
            console.log('getMasterData error :>> ', error);
        }
    }

    /* ดึงข้อมูลฝ่ายขาย */
    const getSalesMan = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=false&department_id=2e885a03-bcd5-449a-99d4-9422526516de`);
            // console.log('data :>> ', data);
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
            // console.log('value handleChangeCustomerType:>> ', value);
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
        // console.log("asdasd", type)
        try {
            setLoadingEasySearch(() => true)
            switch (type) {
                case "search":
                    if (!!value) {
                        const { customer_type } = form.getFieldValue()
                        const { data } = await API.get(`/${customer_type === "person" ? `shopPersonalCustomers` : `shopBusinessCustomers`}/all?search=${value}&limit=9999999&page=1&sort=customer_name.th&order=asc&status=active`);
                        if (data.status === "success") {
                            const newData = data.data.data.map(e => {
                                const customer_full_name = customer_type === "person" ?
                                    `${e.customer_name.first_name[locale.locale] ?? "-"} ${e.customer_name.last_name[locale.locale] ?? ""}` :
                                    `${e.customer_name[locale.locale] ?? "-"}`;

                                return {
                                    ...e,
                                    customer_type,
                                    customer_full_name,
                                    customer_id: e.id,
                                    customer_code: e.master_customer_code_id,
                                    customer_branch: e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")",
                                }
                            })
                            form.setFieldValue("customer_list", newData)
                        }
                    }

                    break;

                case "select":

                    let find
                    const { customer_type } = await form.getFieldValue()
                    try {
                        switch (customer_type) {
                            case "person":
                                find = await API.get(`/shopPersonalCustomers/byid/${value}`)
                                break;
                            case "business":
                                find = await API.get(`/shopBusinessCustomers/byid/${value}`)
                                break;
                        }

                    } catch (error) {
                        console.log("error : ", error)
                    }
                    find = find.data.data
                    const customer_phone_list = Object.entries(find.mobile_no).map((x) => x[1]).filter(where => where !== null);
                    let address = `${find?.address?.[locale.locale] ?? ""} ${find?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${find?.District?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.zip_code ?? ""}`
                    let tags = find?.tags ?? [].map((e) => (e.id)) ?? []
                    let tags_obj = find?.tags ?? []
                    let tax_id = find?.tax_id ?? null
                    let credit_term = find?.other_details?.credit_term ? find?.other_details?.credit_term : null
                    let credit_limit = find?.other_details?.credit_limit ? (+find?.other_details?.credit_limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null
                    let debt_amount = find?.other_details?.debt_amount ? (find?.other_details?.debt_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null
                    let credit_remaining = ((+find?.other_details?.credit_limit ?? 0) - (+find?.other_details?.debt_amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

                    if ((+takeOutComma(data?.other_details?.credit_limit) ?? 0) !== 0) {
                        if (+takeOutComma(data?.other_details?.debt_amount) > +takeOutComma(data?.other_details?.credit_limit)) {
                            Modal.warning({
                                content: 'จำนวนวงเงินที่ใช้ไป เกินกว่าจำนวนเงินเครดิต !!',
                            });
                        }
                    }

                    let _model = {
                        customer_type: customer_type,
                        customer_id: find.id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0],
                        address,
                        tags,
                        tags_obj,
                        sales_man: find?.other_details?.employee_sales_man_id ? [find?.other_details?.employee_sales_man_id] : [],
                        tax_id,
                        credit_limit,
                        credit_term,
                        debt_amount,
                        credit_remaining
                    }
                    console.log("_model", _model)

                    setCustomerType(_model.customer_type)
                    setCustomerPickToCreateINV(find)
                    setCustomerPickToCreateINVName(_model.customer_type === "person" ? `${find?.customer_name?.first_name[locale.locale] ?? null} ${find?.customer_name?.last_name[locale.locale] ?? null}` : find?.customer_name[locale.locale])
                    form.setFieldsValue(_model)
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
            // console.log('val :>> ', val);
            const { customer_type } = form.getFieldValue(),
                { customer_name, id } = val,
                searchValue =
                    customer_type === "person"
                        ? customer_name.first_name?.[locale.locale] ??
                        customer_name.first_name?.th
                        : customer_name?.[locale.locale] ?? customer_name?.th;
            await handleEasySearch(searchValue, "search")
            await handleEasySearch(id, "select")


        } catch (error) {

        }
    }

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    }

    const [open, setOpen] = useState(false);
    const controlOpen = (value) => {
        if (!form.getFieldValue().customer_id && mode !== "add") {
            setOpen(false)
        } else {
            setTimeout(() => {
                setOpen(value)
            }, 100);
        }
    }

    const callBackPickCustomer = async (data) => {
        try {
            const { customer_type } = form.getFieldValue();
            console.log("customer_type", customer_type)
            console.log("data", data)
            let array = [{ ...data }]
            const newData = array.map(e => {
                const customer_full_name = customer_type === "person" ?
                    `${e.customer_name.first_name[locale.locale] ?? "-"} ${e.customer_name.last_name[locale.locale] ?? ""}` :
                    `${e.customer_name[locale.locale] ?? "-"}`;

                return {
                    ...e,
                    customer_type,
                    customer_full_name,
                    customer_id: e.id,
                    customer_code: e.master_customer_code_id,
                    customer_branch: e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")",
                }
            })

            const customer_phone_list = Object.entries(data.mobile_no).map((x) => x[1]).filter(where => where !== null);
            let address = `${data?.address?.[locale.locale] ?? ""} ${data?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${data?.District?.[`name_${locale.locale}`] ?? ""} ${data?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${data?.SubDistrict?.zip_code ?? ""}`
            let tags = data?.tags.map((e) => (e.id)) ?? []
            let tags_obj = data?.tags ?? []
            let tax_id = data?.tax_id ?? null
            let credit_term = data?.other_details?.credit_term ? data?.other_details?.credit_term : null
            let credit_limit = data?.other_details?.credit_limit ? (+data?.other_details?.credit_limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null
            let debt_amount = data?.other_details?.debt_amount ? (data?.other_details?.debt_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null
            let credit_remaining = ((+data?.other_details?.credit_limit ?? 0) - (+data?.other_details?.debt_amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

            if ((+takeOutComma(data?.other_details?.credit_limit) ?? 0) !== 0) {
                if (+takeOutComma(data?.other_details?.debt_amount) > +takeOutComma(data?.other_details?.credit_limit)) {
                    Modal.warning({
                        content: 'จำนวนวงเงินที่ใช้ไป เกินกว่าจำนวนเงินเครดิต !!',
                    });
                }
            }

            let _model = {
                customer_list: newData,
                customer_id: newData[0].id,
                customer_phone_list,
                customer_phone: customer_phone_list[0],
                address,
                tags,
                tags_obj,
                sales_man: newData[0]?.other_details?.employee_sales_man_id ? [newData[0]?.other_details?.employee_sales_man_id] : [],
                tax_id,
                credit_limit,
                credit_term,
                debt_amount,
                credit_remaining
            }
            console.log("_model", _model)
            setCustomerType(customer_type)
            setCustomerPickToCreateINV(customer_type === "person" ? data : data)
            setCustomerPickToCreateINVName(customer_type === "person" ? `${data.customer_name?.first_name[locale.locale] ?? null} ${data.customer_name?.last_name[locale.locale] ?? null}` : data.customer_name[locale.locale])
            await form.setFieldsValue(_model)
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
                {/* {mode === "add" ?
                    <>
                        <Form.Item name="easy_search_list" shouldUpdate={(prevValue, curValue) => prevValue !== curValue} hidden />

                        <Col span={12} hidden>
                            <Form.Item
                                name="easy_search"
                                label={GetIntlMessages("search")}
                                labelAlign='left'
                                colon={false}
                                wrapperCol={{ xl: { span: 24 }, lg: { span: 16 }, md: { span: 18 }, xs: { span: 24 } }}

                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onChange={(value) => handleEasySearch(value, "select")}
                                    filterOption={false}
                                    notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled={mode !== "add"}
                                    loading={loadingEasySearch}
                                    placeholder={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
                                >
                                    {getArrValue("easy_search_list").map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)}

                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12} hidden>
                            <Form.Item label={" "}>
                               <ModalBothCustomersAndCar textButton={GetIntlMessages("เพิ่มข้อมูลทะเบียนรถ/ลูกค้า")} callback={callbackCustomers} />
                            </Form.Item>
                        </Col>
                    </>

                    : null} */}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_type"
                        label="ประเภทลูกค้า"
                    >
                        <Select
                            onChange={(value) => handleChangeCustomerType(value)}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            showArrow={false}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} lg={8} xxl={8} style={{ width: "100%" }}>
                    <Row>
                        <Col lg={20} md={20} sm={18} xs={18}>
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
                                    open={open}
                                    onDropdownVisibleChange={(visible) => controlOpen(visible)}
                                    disabled={mode === "view"}
                                    style={{ width: "98%" }}
                                    loading={loadingEasySearch}
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onSelect={(value) => handleEasySearch(value, "select")}
                                    placeholder="ค้นหาจากชื่อลูกค้า"
                                    dropdownRender={menu => (
                                        <>
                                            {menu}
                                            <Divider style={{ margin: '8px 0' }} />
                                            <Space align="center" style={{ padding: '0 8px 4px' }}>
                                                {
                                                    checkValueCustomerType() === "business" ?
                                                        <ModalBusinessCustomers controlOpen={controlOpen} textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าธุรกิจ`)} icon={<PlusOutlined />} callback={callbackCustomers} /> :
                                                        <ModalPersonalCustomers controlOpen={controlOpen} textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าบุคคลธรรมดา`)} icon={<PlusOutlined />} callback={callbackCustomers} />
                                                }
                                            </Space>
                                        </>
                                    )}
                                >
                                    {!!customerList ? customerList.map((e, index) => (<Select.Option value={e.id} key={`customer-id-${e.id}`}>{`${e.customer_code}  ->  ${e.customer_full_name} ${e.customer_type !== "person" ? "-> " + e.customer_branch : ""}`}</Select.Option>)) ?? [] : []}

                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={4} md={4} sm={6} xs={6} style={{ paddingTop: "30px", justifyContent: "end" }}>
                            <Form.Item >
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

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="tax_id"
                        label={form.getFieldValue().customer_type === "person" ? "เลขที่บัตรประชาชน" : "เลขประจำตัวผู้เสียภาษี"}
                    >
                        <Input disabled={true} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="customer_phone"
                        label="เบอร์โทรศัพท์"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled={true}
                            loading={loadingEasySearch}
                        >
                            {!!customerPhoneList ? customerPhoneList.map((e, index) => (<Select.Option value={e} key={`customer-phone-${index}`}>{e}</Select.Option>)) ?? [] : []}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
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
                </Col>


                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="credit_term"
                        label="จำนวนวันเครดิต"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="credit_limit"
                        label="วงเงินเครดิต"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="debt_amount"
                        label="วงเงินที่ใช้ไป"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="credit_remaining"
                        label="วงเงินเครดิตคงเหลือ"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
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
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={12}>
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
                <Col lg={4} md={6} sm={6} xs={12}>
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
                        name="sales_man"
                        label="พนักงานขาย"
                    >
                        <Select
                            showSearch
                            // showArrow={false}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: "100%" }}
                            disabled={mode === "view" || disabledWhenDeliveryDocActive}
                            // loading={loadingEasySearch}
                            mode="multiple"
                            placeholder="เลือกข้อมูล"
                        >
                            {salesManList.map((e, index) => <Select.Option value={e.id} key={`sales-man-${e.id}`}>{e?.name[locale.locale] + (e?.UsersProfile?.details?.nickname ? ` (${e?.UsersProfile?.details?.nickname})` : "") ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="status"
                        label="สถานะ"
                    >
                        <Select style={{ width: "100%" }} disabled>
                            <Select.Option value={"0"}>ลบเอกสาร</Select.Option>
                            <Select.Option value={"1"}>ใช้งานเอกสาร</Select.Option> {/* อยู่ระหว่างดำเนินการ */}
                            <Select.Option value={"2"}>ยกเลิกเอกสาร</Select.Option> {/* ดำเนินการเรียบร้อย */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label="วันที่เอกสาร"
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view" || disabledWhenDeliveryDocActive} />
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

export default FormServiceOrderDoc