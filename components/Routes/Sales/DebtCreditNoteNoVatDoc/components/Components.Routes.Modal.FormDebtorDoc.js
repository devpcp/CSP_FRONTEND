import { InfoCircleTwoTone, PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space, Tooltip } from 'antd'
import { debounce, get, isArray, isEmpty, isFunction, isPlainObject } from 'lodash'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import RegexMultiPattern from '../../../../shares/RegexMultiPattern'
import ModalBothCustomersAndCar from '../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import ModalBusinessCustomers from '../../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../../Modal/Components.Select.Modal.PersonalCustomers'

const FormTemporaryDeliveryOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false, getStatusCarLoading }) => {

    const form = Form.useFormInstance();

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    // const customerPhoneList = Form.useWatch("customer_phone_list", { form, preserve: true })

    useEffect(() => {
        // getMasterData()
        let isMounted = true;
        const fetchData = async () => {
            try {
                const [value1] = await Promise.all([getUser()])

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
            // const watchData = Form.useWatch(`${type}` ,{form, preserve : true}) ?? []
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
            // console.log('watchData :>> ', watchData);
            // return  !!watchData && isArray(watchData) ? watchData ?? [] : []
            // return []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }

    const getMasterData = async () => {
        try {
            const [value1, value2] = await Promise.all([getRepairMan(), getUser()])
            // const new_data = value1.map(e => {
            //     const newData = { ...e, name: {} }
            //     locale.list_json.forEach(x => {
            //         newData.name[x] = `${e.UsersProfile.fname[x] ?? "-"} ${e.UsersProfile.lname[x] ?? "-"}` ?? ""
            //         return newData
            //     })
            //     return newData
            // })
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

            // setRepairManList(() => [...new_data])
            setUserList(() => [...newDataValue2])
            // form.setFieldsValue({ repair_man_list: new_data })
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
                customer_phone_list: [],
                customer_credit_debt_current_balance: null,
                customer_credit_debt_approval_balance: null,
                customer_credit_debt_unpaid_balance: null,
            })
        } catch (error) {

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

                        const { data } = await API.get(`/shopTemporaryDeliveryOrderDoc/all?search=${value}&is_draft=not_draft&status=active&ShopServiceOrderDoc__is_draft=not_draft&page=1&limit=10&sort=doc_date&order=desc&ShopServiceOrderDoc__doc_sales_type=${doc_sales_type}`)

                        if (data.status === "success") {

                            const newData = data.data.data.map(e => {
                                // const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                                const customer_full_name = !!e?.ShopPersonalCustomer ?
                                    `${e.ShopPersonalCustomer?.customer_name?.first_name?.[locale.locale] ?? "-"} ${e.ShopPersonalCustomer?.customer_name?.last_name?.[locale.locale] ?? ""}` :
                                    `${e.ShopBusinessCustomer.customer_name[locale.locale] ?? "-"}`;

                                return {
                                    ...e,
                                    customer_type: !!e?.ShopPersonalCustomer ? 'person' : 'business',
                                    customer_full_name,
                                    customer_id: !!e?.ShopPersonalCustomer ? e?.ShopPersonalCustomer.id : e?.ShopBusinessCustomer.id
                                }
                            })
                            form.setFieldsValue({ easy_search_list: newData })
                        }
                    }

                    break;

                case "select":
                    if (isFunction(getStatusCarLoading)) getStatusCarLoading(true);
                    const { easy_search_list } = form.getFieldValue(), findSelected = easy_search_list.find(where => where.id === value);
                    console.log("findSelected", findSelected)
                    const { data } = await API.get(`/shopTemporaryDeliveryOrderDoc/byId/${findSelected?.id}`)
                    if (!!findSelected) {

                        form.setFieldsValue({
                            customer_type: findSelected.customer_type,
                            options_list: findSelected.ShopTemporaryDeliveryOrderLists.map((e, i) => {
                                let model = {
                                    ...e,
                                    ShopProduct: e?.details?.meta_data?.ShopProduct
                                }
                                return model
                            }) ?? [],
                            // customer_list,
                            // customer_id,
                            ref_doc_list: easy_search_list,
                            ref_doc: findSelected.id,
                            arr_debt_list: [],
                        })
                        await handleSearchCustomer(findSelected.customer_id, 'search', 'easy_search')
                        await handleSearchCustomer(findSelected.customer_id, 'select', 'easy_search')
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


    const debounceSearchCustomer = debounce((value, type) => handleSearchCustomer(value, type), 800)
    const [loadingCustomer, setLoadingCustomer] = useState(false)
    const handleSearchCustomer = async (value, type, selectedFrom = 'customer_id') => {
        try {
            setLoadingCustomer(true)
            switch (type) {
                case "search":
                    if (!!value) {
                        const { customer_type } = form.getFieldValue()
                        let url =
                            selectedFrom === "customer_id"
                                ? `/${customer_type === "person"
                                    ? `shopPersonalCustomers`
                                    : `shopBusinessCustomers`
                                }/all?search=${value}&limit=25&page=1&sort=customer_name.th&order=asc&status=active`
                                : `/${customer_type === "person"
                                    ? `shopPersonalCustomers`
                                    : `shopBusinessCustomers`
                                }/byid/${value}`;

                        const { data } = await API.get(url);

                        if (data.status === "success") {
                            const extractData = selectedFrom === 'customer_id' ? data.data.data : [data.data]

                            const newData = extractData.map(e => {
                                // const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                                const customer_full_name = customer_type === "person" ?
                                    `${e.customer_name.first_name?.[locale.locale] ?? "-"} ${e.customer_name.last_name?.[locale.locale] ?? ""}` :
                                    `${e.customer_name?.[locale.locale] ?? "-"}`;

                                return {
                                    ...e,
                                    customer_type,
                                    customer_full_name,
                                    customer_id: e.id
                                }
                            })
                            form.setFieldValue("customer_list", newData)
                            // setEasySearchList(() => newData)
                        }
                    }

                    break;
                case "select":
                    const { customer_list } = form.getFieldValue(), find = customer_list.find(where => where.id === value), customer_phone_list = !!find?.mobile_no ? Object.entries(find?.mobile_no).map((x) => x[1]).filter(where => where !== null) : [];

                    let address = `${find?.address?.[locale.locale] ?? ""} ${find?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${find?.District?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.zip_code ?? ""}`
                    let customer_credit_debt_unpaid_balance = 0, customer_credit_debt_current_balance = 0, debt_due_date = null;

                    if (isPlainObject(find)) {
                        customer_credit_debt_unpaid_balance = find?.other_details?.debt_amount ?? null
                        customer_credit_debt_current_balance = ((Number(find?.other_details?.credit_limit) - Number(find?.other_details?.debt_amount))).toFixed(2) ?? null
                        debt_due_date = moment(moment(new Date()).add(Number(find?.other_details?.credit_term), 'd'))
                    }
                    form.setFieldsValue({
                        customer_type: find?.customer_type ?? "person",
                        customer_id: find?.id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0] ?? [],
                        address,
                        debt_due_date,
                        customer_credit_debt_unpaid_balance,
                        customer_credit_debt_current_balance,
                        customer_credit_debt_approval_balance: find?.other_details?.credit_limit ?? null,
                        customer_credit_debt_payment_period: find?.other_details?.credit_term ?? null,
                    })

                    break;

                default:
                    break;

            }
            setLoadingCustomer(false)
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const onReset = () => {
        try {
            form.setFieldsValue({
                customer_type: "business",
                user_list: [],
                user_id: authUser.id,
                status: "1",
                doc_date: moment(new Date()),
                isModalVisible: true,
                list_service_product: [],
                vehicles_customers_list: [],
                customer_list: [],
                customer_phone_list: [],
                easy_search_list: [],
                debtor_billing_list: [],
                easy_search: null,
                customer_id: null,
                customer_credit_debt_unpaid_balance: null,
                customer_credit_debt_current_balance: null,
                customer_credit_debt_approval_balance: null,
                customer_credit_debt_payment_period: null,
                ref_doc: null
            })
        } catch (error) {
            console.log("onReset error : ", error)
        }
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <Row gutter={[20, 0]}>
                {mode !== "view" ?
                    <>
                        <Form.Item name="easy_search_list" shouldUpdate={(prevValue, curValue) => prevValue !== curValue} hidden />

                        <Col lg={8} md={12} sm={12} xs={24}>
                            <Form.Item
                                name="easy_search"
                                label={GetIntlMessages("ค้นหาเอกสาร")}
                                labelAlign='left'
                                colon={false}
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    allowClear
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onChange={(value) => handleEasySearch(value, "select")}
                                    filterOption={false}
                                    notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled={mode === "view"}
                                    loading={loadingEasySearch}
                                    placeholder={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
                                >
                                    {getArrValue("easy_search_list").map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{`${e.code_id} -> ${e.customer_full_name}`}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={8} md={12} sm={12} xs={24}>
                            <Form.Item name="doc_sales_type" label={"ประเภทการค้นหา"} style={{ width: "100%" }}>
                                <Select style={{ width: "100%" }} disabled={mode === "view"} onChange={() => onReset()}>
                                    <Select.Option key={`doc-sale-type-1`} value={1}>{`ใบสั่งซ่อม`}</Select.Option>
                                    <Select.Option key={`doc-sale-type-2`} value={2}>{`ใบสั่งขาย`}</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </>

                    : null}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_type"
                        label="ประเภทลูกค้า"
                    >
                        <Select onChange={(value) => handleChangeCustomerType(value)} style={{ width: "100%" }} disabled={mode === "view"} showArrow={false}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
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
                            autoFocus
                            notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                            placeholder="กรุณาพิมพ์อย่าง 1 ตัวเพื่อค้นหา"
                            style={{ width: "100%" }}
                            // disabled
                            open={open}
                            onDropdownVisibleChange={(visible) => controlOpen(visible)}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                            onSearch={(value) => debounceSearchCustomer(value, "search")}
                            onSelect={(value) => handleSearchCustomer(value, "select")}
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
                            {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{e.customer_full_name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>



                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_credit_debt_unpaid_balance"
                        label="จำนวนเงินค้างชำระ"

                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />

                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="ref_doc"
                        label={
                            <>
                                {`เลขที่อ้างอิง`}
                            </>
                        }
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
                    </Form.Item>
                </Col>



                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_credit_debt_current_balance"
                        label="วงเงินเครดิตคงเหลือ"
                    >
                        <InputNumber disabled stringMode step={"0.01"} min={0} precision={2} style={{ width: "100%" }} formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
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
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item
                        name="debt_due_date"
                        label="วันที่กำหนดรับชำระ"
                    >
                        <DatePicker style={{ width: "100%" }} format={"YYYY-MM-DD"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>


                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="debt_credit_note_type"
                        label="ประเภทใบลดหนี้"
                    >
                        <Select
                            showSearch
                            // filterOption={false}
                            style={{ width: "100%" }}
                            disabled={mode === 'view'}
                            loading={loadingEasySearch}
                        >
                            <Select.Option key={1} value={1}>{`ใบลดหนี้ (CN)`}</Select.Option>
                            <Select.Option key={2} value={2}>{`ส่วนลด (Rebate)`}</Select.Option>
                        </Select>
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
                            disabled={mode === "view"}
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
            </Row>

        </>

    )
}

export default FormTemporaryDeliveryOrderDoc