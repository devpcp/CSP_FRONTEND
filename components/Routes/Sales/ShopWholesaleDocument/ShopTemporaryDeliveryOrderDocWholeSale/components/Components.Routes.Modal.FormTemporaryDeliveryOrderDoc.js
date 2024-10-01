import { PlusOutlined } from '@ant-design/icons'
import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Divider, Space } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../../util/Api'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalBothCustomersAndCar from '../../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import ModalBusinessCustomers from '../../../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../../../Modal/Components.Select.Modal.PersonalCustomers'

const FormTemporaryDeliveryOrderDoc = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false }) => {

    const form = Form.useFormInstance()

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [salesManList, setSalesManList] = useState([])
    const customerPhoneList = Form.useWatch("customer_phone_list", { form, preserve: true })

    useEffect(() => {
        getMasterData()
    }, [])

    const getArrValue = (type) => {
        try {
            // const fieldValue = Form.useWatch(type, { form, preserve: true })
            // return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []

            const fieldValue = form.getFieldValue(`${type}`)
            // console.log(`fieldValue ${type}:>> `,  !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []);
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
            console.log('error getArrValue:>> ', error);
        }
    }

    const getMasterData = async () => {
        try {
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
                    if (fname && lname && e.UsersProfile.shop_id === shop_id) {
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
            form.setFieldsValue({ repair_man_list: new_data })
        } catch (error) {
            // console.log('error :>> ', error);
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
        try {
            setLoadingEasySearch(() => true)
            switch (type) {
                case "search":
                    if (!!value) {
                        const { customer_type } = form.getFieldValue()
                        // const { data } = await API.get(customer_type === "person" ? `/${customer_type === "person" ? `shopPersonalCustomers` : `shopBusinessCustomers`}/all?search=${value}&limit=9999999&page=1&sort=customer_name.th&order=asc&status=active` : `/shopBusinessCustomers/all?search=${value}&limit=10&page=1&sort=customer_name.th&order=asc&status=active`);
                        const { data } = await API.get(`/${customer_type === "person" ? `shopPersonalCustomers` : `shopBusinessCustomers`}/all?search=${value}&limit=9999999&page=1&sort=customer_name.th&order=asc&status=active`);
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
                            // console.log('newData :>> ', newData);
                            form.setFieldValue("customer_list", newData)
                            // setEasySearchList(() => newData)
                        }
                    }

                    break;

                case "select":
                    const { customer_list } = form.getFieldValue(), find = customer_list.find(where => where.id === value), customer_phone_list = Object.entries(find.mobile_no).map((x) => x[1]).filter(where => where !== null);
                    let address = `${find?.address?.[locale.locale] ?? ""} ${find?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${find?.District?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${find?.SubDistrict?.zip_code ?? ""}`
                    let tags = find?.tags ?? [].map((e) => (e.id)) ?? []
                    let tags_obj = find?.tags ?? []

                    form.setFieldsValue({
                        customer_type: find?.customer_type ?? "person",
                        customer_id: find.id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0],
                        address,
                        tags,
                        tags_obj,
                    })
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
            // console.log('val :>> ', val);
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
                        <Select onChange={(value) => handleChangeCustomerType(value)} style={{ width: "100%" }} disabled showArrow={false}>
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
                            style={{ width: "100%" }}
                            open={open}
                            onDropdownVisibleChange={(visible) => controlOpen(visible)}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                            onSearch={(value) => debounceEasySearch(value, "search")}
                            onSelect={(value) => handleEasySearch(value, "select")}
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
                        shouldUpdate={(prevValue, currentValue) => prevValue.customer_phone !== currentValue.customer_phone}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
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
                            loading={loadingEasySearch}
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
                            <Select.Option value={"1"}>ใช้งานเอกสาร</Select.Option>
                            <Select.Option value={"2"}>ยกเลิกเอกสาร</Select.Option>
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

        </>

    )
}

export default FormTemporaryDeliveryOrderDoc