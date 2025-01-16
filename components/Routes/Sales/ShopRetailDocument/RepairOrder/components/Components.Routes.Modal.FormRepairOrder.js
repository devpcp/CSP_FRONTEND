import { Form, Input, Row, Col, Select, DatePicker, InputNumber, Button, Modal, Divider } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../../util/Api'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalBothCustomersAndCar from '../../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import VehicleRegistrationData from '../../../../../../routes/MyData/VehicleRegistrationData'
import BusinessCustomersData from '../../../../../../routes/MyData/BusinessCustomersData'
import PersonalCustomersData from '../../../../../../routes/MyData/PersonalCustomersData'

const ComponentsRoutesModalFormRepairOrder = ({ mode, calculateResult, disabledWhenDeliveryDocActive = false, setCustomerType, setCustomerPickToCreateINV, setCustomerPickToCreateINVName }) => {
    const form = Form.useFormInstance()

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    const [salesManList, setSalesManList] = useState([])
    const [tagsList, setTagsList] = useState([])
    const [isCustomerDataModalVisible, setIsCustomerDataModalVisible] = useState(false);
    const [isVehicleRegistrationDataModalVisible, setIsVehicleRegistrationDataModalVisible] = useState(false);
    const [requiredRepairMan, setRequiredRepairMan] = useState(false)

    useEffect(() => {
        getMasterData()
    }, [])

    useEffect(() => {
        try {
            let shop_work_type = isPlainObject(authUser?.UsersProfile?.ShopsProfile?.shop_config) ? authUser?.UsersProfile?.ShopsProfile?.shop_config["shop_work_type"] ?? [] : []

            if (shop_work_type.length > 0) {
                let findIndex = shop_work_type.findIndex(x => x === 3)
                setRequiredRepairMan(findIndex !== -1)
            } else {
                setRequiredRepairMan(false)
            }
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
            const fieldValue = form.getFieldValue(`${type}`)
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
        } catch (error) {
        }
    }

    const getMasterData = async () => {
        try {
            const [value1, value2, value3] = await Promise.all([getRepairMan(), getUser(), getSalesMan()])
            const new_data = value1.map(e => {
                const newData = { ...e, name: {} }
                locale.list_json.forEach(x => {
                    newData.name[x] = `${e?.UsersProfile.fname[x] ?? "-"} ${e?.UsersProfile.lname[x] ?? "-"}` ?? ""
                    return newData
                })
                return newData
            })

            const newDataValue2 = []
            value2.map(e => {
                const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                if (isPlainObject(authUser.UsersProfile)) {
                    const { shop_id } = authUser.UsersProfile;
                    if (fname && lname) {
                        newDataValue2.push({
                            id: e?.id,
                            name: `${fname} ${lname}`,
                            groups: e?.Groups
                        })
                    }
                }

            })

            const new_data3 = value3.map(e => {
                const newData = { ...e, name: {} }
                locale.list_json.forEach(x => {
                    newData.name[x] = `${e?.UsersProfile.fname[x] ?? "-"} ${e?.UsersProfile.lname[x] ?? "-"}` ?? ""
                    return newData
                })
                return newData
            })

            setRepairManList(() => [...new_data])
            setSalesManList(() => [...new_data3])
            setUserList(() => [...newDataValue2])
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    /* ดึงข้อมูลช่างซ่อม */
    const getRepairMan = async () => {
        try {
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=true&department_id=71b4f85b-42c4-457a-af6a-0a9e6e3b2c1e`);
            return data.status === "success" ? data.data.data : []
        } catch (error) {

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
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1&selectInAuth=true`);
            return data.status === "success" ? data.data.data : []
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
                        const { data } = await API.get(`/shopSalesTransactionDoc/easy-search?limit=10&page=1&sort=updated_date&order=desc&search=${value}`);
                        // console.log('data :>> ', data);
                        if (data.status === "success") {
                            const newData = data.data.data.map(e => {
                                console.log("eee", e)
                                const isPersonal = isPlainObject(e?.ShopPersonalCustomer) ? true : false;
                                const name = isPersonal ?
                                    `${e?.ShopPersonalCustomer.customer_name.first_name[locale.locale] ?? "-"} ${e?.ShopPersonalCustomer.customer_name.last_name[locale.locale] ?? ""}` :
                                    `${e?.ShopBusinessCustomer.customer_name[locale.locale] ?? "-"}`;
                                const branch = !isPersonal ? `${e?.ShopBusinessCustomer.other_details.branch === "office" ? "(สำนักงานใหญ่)" : `(${e?.ShopBusinessCustomer.other_details.branch_code}  ${e?.ShopBusinessCustomer.other_details.branch_name}`})` : ''
                                const mobile_no = Object.entries(e[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`].mobile_no).map((x) => x[1]);
                                const vehicles_registration = `${isPlainObject(e?.details) ? e?.details.registration : "-"}`;
                                const province_name = `${isPlainObject(e?.details) ? e?.details.province_name : "-"}`;
                                const customer_code = e[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`].master_customer_code_id
                                return {
                                    ...e,
                                    value_name: `${vehicles_registration} -> ${province_name} -> ${customer_code} -> ${name} ${branch} ${!!mobile_no.toString() ? `-> ${mobile_no.toString()}` : ""}`,
                                    customer_type: isPersonal ? "person" : "business",
                                    mobile_no: mobile_no.length > 0 ? mobile_no[0] : null,
                                    customer_id: e[`Shop${isPersonal ? "Personal" : "Business"}Customer`].id
                                }
                            })
                            form.setFieldValue("easy_search_list", newData)
                            // setEasySearchList(() => newData)
                        }
                    }

                    break;

                case "select":
                    const { easy_search_list } = form.getFieldValue()
                    const find = easy_search_list.find(where => where.id === value)
                    let customer_list = [], customer_phone_list = [], vehicles_customers_list = [], vehicle_customer_id = null, address = null, tags = [], tags_obj = []
                    const isPersonal = find.customer_type === 'person' ? true : false;
                    const { data } = await API.get(`/shopVehicleCustomer/all?${isPersonal ? `per_customer_id=${find.per_customer_id}` : `bus_customer_id=${find.bus_customer_id}`}&limit=99999999&page=1&sort=created_date&order=asc&status=active`);
                    let findCar
                    if (data.status === "success") {
                        const carDataList = data.data.data
                        if (isArray(carDataList) && carDataList.length > 0) {
                            findCar = carDataList.find(where => where.details.registration === find.details.registration)
                            if (!!findCar && isPlainObject(findCar)) {
                                vehicles_customers_list = [findCar]
                                vehicle_customer_id = findCar.id
                            } else {
                                vehicles_customers_list = []
                                vehicle_customer_id = null
                            }
                        }
                    }
                    customer_list = [find[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`]].map((e, index) => {

                        if (!isEmpty(e?.mobile_no)) customer_phone_list.push(e?.mobile_no[`mobile_no_${index + 1}`])
                        return {
                            ...e,
                            customer_name: isPersonal ? `${e?.customer_name?.first_name[locale.locale] ?? null} ${e?.customer_name?.last_name[locale.locale] ?? null}` : e?.customer_name[locale.locale]
                        }
                    })

                    address = find[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`]?.address?.[locale.locale] ?? "-"
                    tags = isPersonal ? findCar?.ShopPersonalCustomer?.tags ?? [].map((e) => (e?.id)) ?? [] : findCar?.ShopBusinessCustomer?.tags ?? [].map((e) => (e?.id)) ?? []
                    tags_obj = isPersonal ? findCar?.ShopPersonalCustomer?.tags ?? [] : findCar?.ShopBusinessCustomer?.tags ?? []


                    let _model = {
                        customer_type: find?.customer_type ?? "person",
                        customer_list,
                        customer_id: customer_list[0].id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0],
                        vehicle_customer_id: vehicles_customers_list[0].id,
                        vehicles_customers_list,
                        previous_mileage: findCar?.details?.mileage === "" || findCar?.details?.mileage === null ? 0 : findCar?.details?.mileage,
                        current_mileage: findCar?.details?.mileage === "" || findCar?.details?.mileage === null ? findCar?.details?.mileage_first : "",
                        address,
                        tags,
                        tags_obj,
                        sales_man: customer_list[0]?.other_details?.employee_sales_man_id ? [customer_list[0]?.other_details?.employee_sales_man_id] : []
                    }
                    console.log("_model", _model)

                    setCustomerType(_model.customer_type)
                    setCustomerPickToCreateINV(_model.customer_type === "person" ? findCar?.ShopPersonalCustomer : findCar?.ShopBusinessCustomer)
                    setCustomerPickToCreateINVName(_model.customer_type === "person" ? `${findCar?.ShopPersonalCustomer.customer_name?.first_name[locale.locale] ?? null} ${findCar?.ShopPersonalCustomer.customer_name?.last_name[locale.locale] ?? null}` : findCar?.ShopBusinessCustomer.customer_name[locale.locale])

                    form.setFieldsValue(_model)
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

    const callBackPickVehicleRegistration = async (data) => {
        try {
            console.log('val :>> ', data);
            handleCancelVehicleRegistrationDataModal()
            let customer_type = data.bus_customer_id === null ? "person" : "business"
            let customer_list = []
            let customer_phone_list = []
            customer_list = (customer_type === "person" ? [data.ShopPersonalCustomer] : [data.ShopBusinessCustomer]).map((e, index) => {
                if (!isEmpty(e?.mobile_no)) customer_phone_list.push(e?.mobile_no[`mobile_no_${index + 1}`])
                return {
                    ...e,
                    customer_name: customer_type === "person" ? `${e?.customer_name?.first_name[locale.locale] ?? null} ${e?.customer_name?.last_name[locale.locale] ?? null}` : e?.customer_name[locale.locale]
                }
            })
            setCustomerType(customer_type)
            setCustomerPickToCreateINV(customer_type === "person" ? data.ShopPersonalCustomer : data.ShopBusinessCustomer)
            setCustomerPickToCreateINVName(customer_type === "person" ? `${data?.ShopPersonalCustomer.customer_name?.first_name[locale.locale] ?? null} ${data?.ShopPersonalCustomer.customer_name?.last_name[locale.locale] ?? null}` : data?.ShopBusinessCustomer.customer_name[locale.locale])

            let credit_term = customer_type === "person" ? data?.ShopPersonalCustomer?.other_details?.credit_term ?? 0 : data?.ShopBusinessCustomer?.other_details?.credit_term ?? 0
            let credit_limit = customer_type === "person" ? (+data?.ShopPersonalCustomer?.other_details?.credit_limit ?? "0.00").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (+data?.ShopBusinessCustomer?.other_details?.credit_limit ?? "0.00").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            let debt_amount = customer_type === "person" ? (+data?.ShopPersonalCustomer?.other_details?.debt_amount ?? "0.00").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (+data?.ShopBusinessCustomer?.other_details?.debt_amount ?? "0.00").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            let credit_remaining = ((+credit_limit ?? 0) - (+debt_amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

            let _model = {
                customer_type: customer_type,
                customer_id: customer_type === "person" ? data?.ShopPersonalCustomer?.id : data?.ShopBusinessCustomer?.id,
                customer_list: customer_list,
                customer_phone: customer_phone_list[0],
                customer_phone_list: customer_phone_list,
                vehicle_customer_id: data.id,
                vehicles_registration: data?.details?.registration,
                vehicles_customers_list: [data],
                previous_mileage: data?.details?.mileage === "" || data?.details?.mileage === null ? 0 : data?.details?.mileage,
                current_mileage: data?.details?.mileage === "" || data?.details?.mileage === null ? data?.details?.mileage_first : "",
                address: customer_type === "person" ? data?.ShopPersonalCustomer?.address ? data?.ShopPersonalCustomer?.address[locale.locale] : null : data?.ShopBusinessCustomer?.address ? data?.ShopBusinessCustomer?.address[locale.locale] : null,
                tags: customer_type === "person" ? data?.ShopPersonalCustomer?.tags ?? [].map((e) => (e?.id)) ?? [] : data?.ShopBusinessCustomer?.tags ?? [].map((e) => (e?.id)) ?? [],
                tags_obj: customer_type === "person" ? data?.ShopPersonalCustomer?.tags ?? [] : data?.ShopBusinessCustomer?.tags ?? [],
                sales_man: customer_list[0]?.other_details?.employee_sales_man_id ? [customer_list[0]?.other_details?.employee_sales_man_id] : [],
                credit_limit,
                credit_term,
                debt_amount,
                credit_remaining
            }
            console.log("_model callBackPickVehicleRegistration", _model)
            form.setFieldsValue(_model)
        } catch (error) {
            console.log("error callBackPickVehicleRegistration ", error)
        }
    }

    const handleOpenVehicleRegistrationDataModal = () => {
        try {
            console.log("test")
            setIsVehicleRegistrationDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelVehicleRegistrationDataModal = () => {
        try {
            setIsVehicleRegistrationDataModalVisible(false)
        } catch (error) {

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
                    `${e?.customer_name.first_name[locale.locale] ?? "-"} ${e?.customer_name.last_name[locale.locale] ?? ""}` :
                    `${e?.customer_name[locale.locale] ?? "-"}`;

                return {
                    ...e,
                    customer_type,
                    customer_name: customer_full_name,
                    customer_id: e?.id,
                    customer_code: e?.master_customer_code_id,
                    customer_branch: e?.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e?.other_details.branch_code + " " + e?.other_details.branch_name + ")",
                }
            })

            const customer_phone_list = Object.entries(data.mobile_no).map((x) => x[1]).filter(where => where !== null);
            let address = `${data?.address?.[locale.locale] ?? ""} ${data?.Province?.[`prov_name_${locale.locale}`] ?? ""} ${data?.District?.[`name_${locale.locale}`] ?? ""} ${data?.SubDistrict?.[`name_${locale.locale}`] ?? ""} ${data?.SubDistrict?.zip_code ?? ""}`
            let tags = data?.tags.map((e) => (e?.id)) ?? []
            let tags_obj = data?.tags ?? []
            let credit_term = data?.other_details?.credit_term ? data?.other_details?.credit_term : null
            let credit_limit = data?.other_details?.credit_limit ? (+data?.other_details?.credit_limit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"
            let debt_amount = data?.other_details?.debt_amount ? (data?.other_details?.debt_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"
            let credit_remaining = ((+data?.other_details?.credit_limit ?? 0) - (+data?.other_details?.debt_amount ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            let _model = {
                customer_list: newData,
                customer_id: newData[0].id,
                customer_phone_list,
                customer_phone: customer_phone_list[0],
                address,
                tags,
                tags_obj,
                sales_man: newData[0]?.other_details?.employee_sales_man_id ? [newData[0]?.other_details?.employee_sales_man_id] : [],
                vehicle_customer_id: null,
                vehicles_registration: null,
                vehicles_customers_list: [],
                previous_mileage: null,
                current_mileage: null,
                credit_limit,
                credit_term,
                debt_amount,
                credit_remaining
            }
            setCustomerType(customer_type)
            setCustomerPickToCreateINV(customer_type === "person" ? data : data)
            setCustomerPickToCreateINVName(customer_type === "person" ? `${data.customer_name?.first_name[locale.locale] ?? null} ${data.customer_name?.last_name[locale.locale] ?? null}` : data.customer_name[locale.locale])

            console.log("_model", _model)
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
                {mode === "add" ?
                    <>
                        <Form.Item name="easy_search_list" shouldUpdate={(prevValue, curValue) => prevValue !== curValue} hidden />

                        <Col lg={12} md={12} sm={24} xs={24}>
                            <Form.Item
                                name="easy_search"
                                label={GetIntlMessages("search")}
                                labelAlign='left'
                                colon={false}
                            // extra={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    onSearch={(value) => debounceEasySearch(value, "search")}
                                    onChange={(value) => handleEasySearch(value, "select")}
                                    filterOption={false}
                                    notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    // notFoundContent={checkSearching ? "ค้นหาข้อมูลชื่อลูกค้า ทะเบียนรถ หรือเบอร์โทรศัพท์" : "ไม่พบข้อมูล เพิ่มข้อมูลได้ที่ปุ่มด้านขวา"}
                                    style={{ width: "100%" }}
                                    disabled={mode !== "add"}
                                    loading={loadingEasySearch}
                                    placeholder={GetIntlMessages("ค้นหาข้อมูลจากชื่อลูกค้า ทะเบียน รหัสลูกค้า เบอร์โทรศัพท์")}
                                >
                                    {getArrValue("easy_search_list").map(e => <Select.Option value={e?.id} key={`easy-search-${e?.id}`}>{e?.value_name}</Select.Option>)}

                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={12} md={12} sm={24} xs={24}>
                            <Form.Item label={" "}>
                                <ModalBothCustomersAndCar textButton={GetIntlMessages("เพิ่มข้อมูลทะเบียนรถ/ลูกค้า")} callback={callbackCustomers} />
                            </Form.Item>
                        </Col>
                    </>

                    : null}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_type"
                        label="ประเภทลูกค้า"
                    >
                        <Select style={{ width: "100%" }} showArrow={false}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>

                {/* <Form.Item name="customer_list" hidden /> */}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Row gutter={8}>
                        <Col span={mode === "view" ? 24 : 20}>
                            <Form.Item
                                name="customer_id"
                                label="ชื่อลูกค้า"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    style={{ width: "100%" }}
                                    disabled
                                    loading={loadingEasySearch}
                                >
                                    {getArrValue("customer_list").map(e => <Select.Option value={e?.id} key={`customer-id-${e?.id}`}>{e?.customer_name}</Select.Option>)}
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

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_phone"
                        label="เบอร์โทรศัพท์"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("customer_phone_list").map((e, index) => <Select.Option value={e?.id} key={`customer-phone-${index}`}>{e}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Row gutter={8}>
                        <Col span={mode === "view" ? 24 : 20}>
                            <Form.Item
                                name="vehicle_customer_id"
                                label="ทะเบียนรถ"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    style={{ width: "100%" }}
                                    disabled
                                    loading={loadingEasySearch}
                                >
                                    {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`vehicles-customers-${index}`}>{e?.details?.registration ?? "-"}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={mode === "view" ? 0 : 4} style={{ justifyContent: "end" }}>
                            <Form.Item label={" "}>
                                <Button
                                    type='primary'
                                    style={{ width: "100%", borderRadius: "10px" }}
                                    onClick={() => handleOpenVehicleRegistrationDataModal()}
                                >
                                    เลือก
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="vehicle_customer_id"
                        label="ประเภทยานพาหนะ"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`vehicles-customers-${index}`}>{e?.VehicleType?.type_name[locale.locale] ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="vehicle_customer_id"
                        label="จังหวัด"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`vehicles-customers-${index}`}>{e?.details?.province_name ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="vehicle_customer_id"
                        label="ยี่ห้อ"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`vehicles-customers-${index}`}>{e?.VehicleBrand?.brand_name[locale.locale] ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="vehicle_customer_id"
                        label="รุ่น"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`vehicles-customers-${index}`}>{e?.VehicleModelType?.model_name[locale.locale] ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="repair_man"
                        label="ช่างซ่อม"
                        rules={[
                            {
                                required: requiredRepairMan,
                                message: "กรุณาเลือกช่างซ่อม"
                            }
                        ]}
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
                            {repairManList.map((e, index) => <Select.Option value={e?.id} key={`repair-man-${e?.id}`}>{e?.name[locale.locale] ?? "-"}</Select.Option>)}
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
                            {salesManList.map((e, index) => <Select.Option value={e?.id} key={`sales-man-${e?.id}`}>{e?.name[locale.locale] + (e?.UsersProfile?.details?.nickname ? ` (${e?.UsersProfile?.details?.nickname})` : "") ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="previous_mileage"
                        label="เลขไมล์ครั้งก่อน"
                    >
                        <InputNumber disabled style={{ width: "100%" }}
                            formatter={(value) => !!value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="current_mileage"
                        label="เลขไมล์ครั้งนี้"
                        rules={[
                            {
                                required: form.getFieldValue().vehicle_customer_id ? true : false,
                                message: "กรุณาใส่เลขไมล์"
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!!getFieldValue('previous_mileage') && Number(getFieldValue('previous_mileage')) > Number(value)) {
                                        return Promise.reject(new Error('เลขไมล์ครั้งนี้ไม่จำนวนน้อยกว่าเลขไมล์ครั้งก่อน !!'));
                                    } else {
                                        return Promise.resolve();
                                    }
                                },
                            }),
                            // ]}
                        ]}
                    >
                        <InputNumber disabled={mode === "view" || disabledWhenDeliveryDocActive || form.getFieldValue().vehicle_customer_id ? false : true} stringMode min={0} style={{ width: "100%" }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
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

                            {userList.map((e, index) => <Select.Option value={e?.id} key={`user-list-${index}`}>{e?.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12} hidden>
                    <Form.Item
                        name="credit_term"
                        label="จำนวนวันเครดิต"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12} hidden>
                    <Form.Item
                        name="credit_limit"
                        label="วงเงินเครดิต"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12} hidden>
                    <Form.Item
                        name="debt_amount"
                        label="วงเงินที่ใช้ไป"
                    >
                        <InputNumber disabled={true} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12} hidden>
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
                            {documentTypes.map((e, index) => <Select.Option value={e?.id} key={`doc-type-${e?.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                            {/* {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e?.id} key={`customer-phone-${index}`}>{e}</Select.Option>)} */}
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
                            onChange={(e) => console.log("tax_type", e)}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e?.id} key={`tax-type-${e?.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
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
                            {taxTypes.map((e, index) => <Select.Option value={e?.id} key={`tax-type-${e?.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={4} md={6} sm={6} xs={12}>
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

                <Col lg={4} md={6} sm={6} xs={12}>
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
                open={isVehicleRegistrationDataModalVisible}
                onCancel={handleCancelVehicleRegistrationDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelVehicleRegistrationDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <VehicleRegistrationData title="จัดการข้อมูลรถ" callBack={callBackPickVehicleRegistration} />
            </Modal>
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

export default ComponentsRoutesModalFormRepairOrder