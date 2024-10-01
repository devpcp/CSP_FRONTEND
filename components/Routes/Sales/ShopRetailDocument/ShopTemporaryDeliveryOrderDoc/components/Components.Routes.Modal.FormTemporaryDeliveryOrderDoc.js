import { Form, Input, Row, Col, Select, DatePicker, InputNumber } from 'antd'
import { debounce, get, isArray, isEmpty, isPlainObject } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../../util/Api'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import ModalBothCustomersAndCar from '../../../../Modal/Components.Add.Modal.BothCustomersAndCar'

const ComponentsRoutesModalFormRepairOrder = ({ mode, calculateResult }) => {
    const form = Form.useFormInstance()

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [userList, setUserList] = useState([])
    const [repairManList, setRepairManList] = useState([])
    const [salesManList, setSalesManList] = useState([])

    useEffect(() => {
        getMasterData()
    }, [])

    const getArrValue = (type) => {
        try {
            const fieldValue = form.getFieldValue(`${type}`)
            // console.log(`fieldValue ${type}:>> `, fieldValue);
            return !!fieldValue && isArray(fieldValue) ? fieldValue ?? [] : []
            // const watchData = Form.useWatch(type, {form , preserve : true})
            // // console.log(`watchData ${type}:>> `, watchData);
            // return !!watchData ? watchData ?? [] : []
            // return []
        } catch (error) {
            console.log('error getArrValue:>> ', error);
        }
    }

    const getMasterData = async () => {
        try {
            const [value1, value2, value3] = await Promise.all([getRepairMan(), getUser(), getSalesMan()])
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

            const new_data3 = value3.map(e => {
                const newData = { ...e, name: {} }
                locale.list_json.forEach(x => {
                    newData.name[x] = `${e.UsersProfile.fname[x] ?? "-"} ${e.UsersProfile.lname[x] ?? "-"}` ?? ""
                    return newData
                })
                return newData
            })

            setRepairManList(() => [...new_data])
            setSalesManList(() => [...new_data3])
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
            // console.log('data :>> ', data);
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
            const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
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
                                const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                                const name = isPersonal ?
                                    `${e.ShopPersonalCustomer.customer_name.first_name[locale.locale] ?? "-"} ${e.ShopPersonalCustomer.customer_name.last_name[locale.locale] ?? ""}` :
                                    `${e.ShopBusinessCustomer.customer_name[locale.locale] ?? "-"}`;

                                const mobile_no = Object.entries(e[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`].mobile_no).map((x) => x[1]);
                                const vehicles_registration = `${isPlainObject(e.details) ? e.details.registration : "-"}`;
                                return {
                                    ...e,
                                    value_name: `${name}  -> ${vehicles_registration} ${!!mobile_no.toString() ? `-> ${mobile_no.toString()}` : ""}`,
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
                    let customer_list = [], customer_phone_list = [], vehicles_customers_list = [], vehicle_customer_id = null, address = null, tags_obj = []
                    const isPersonal = find.customer_type === 'person' ? true : false;
                    const { data } = await API.get(`/shopVehicleCustomer/all?${isPersonal ? `per_customer_id=${find.per_customer_id}` : `bus_customer_id=${find.bus_customer_id}`}&limit=10&page=1&sort=created_date&order=asc&status=active`);
                    let findCar
                    if (data.status === "success") {
                        const carDataList = data.data.data
                        // console.log('carDataList :>> ', carDataList);
                        if (isArray(carDataList) && carDataList.length > 0) {
                            findCar = carDataList.find(where => where.details.registration === find.details.registration)

                            vehicles_customers_list = [findCar]
                            vehicle_customer_id = findCar.id
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
                    tags = isPersonal ? findCar?.ShopPersonalCustomer?.tags ?? [].map((e) => (e.id)) ?? [] : findCar?.ShopBusinessCustomer?.tags ?? [].map((e) => (e.id)) ?? []
                    tags_obj = isPersonal ? findCar?.ShopPersonalCustomer?.tags ?? [] : findCar?.ShopBusinessCustomer?.tags ?? []

                    form.setFieldsValue({
                        customer_type: find?.customer_type ?? "person",
                        customer_list,
                        customer_id: customer_list[0].id,
                        customer_phone_list,
                        customer_phone: customer_phone_list[0],
                        vehicle_customer_id: vehicles_customers_list[0].id,
                        vehicles_customers_list,
                        previous_mileage: !!findCar?.details?.mileage ? findCar?.details?.mileage : findCar?.details?.mileage_first ?? null,
                        // previous_mileage: findCar?.last_mileage ?? null,
                        address,
                        tags,
                        tags_obj,
                        sales_man: customer_list[0]?.other_details?.employee_sales_man_id ? [customer_list[0]?.other_details?.employee_sales_man_id] : []
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
    return (
        <>
            <Row gutter={[20, 0]}>
                {mode === "add" ?
                    <>
                        <Form.Item name="easy_search_list" shouldUpdate={(prevValue, curValue) => prevValue !== curValue} hidden />

                        <Col span={24}>
                            <Form.Item
                                name="easy_search"
                                // label="test"
                                label={(
                                    <Row gutter={10} style={{ width: "100%" }}>
                                        <Col span={8}>
                                            {GetIntlMessages("search")}
                                        </Col>
                                        <Col span={12}>
                                            <ModalBothCustomersAndCar textButton={GetIntlMessages("เพิ่มข้อมูลทะเบียนรถ/ลูกค้า")} />
                                        </Col>
                                    </Row>

                                )}
                                labelAlign='left'
                                colon={false}
                                wrapperCol={{ xl: { span: 12 }, lg: { span: 16 }, md: { span: 18 }, xs: { span: 24 } }}
                                extra={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหา")}
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
                                >
                                    {getArrValue("easy_search_list").map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)}
                                    {/* {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)} */}

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
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>

                {/* <Form.Item name="customer_list" hidden /> */}

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_id"
                        label="ชื่อลูกค้า"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            // notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                            style={{ width: "100%" }}
                            disabled
                            loading={loadingEasySearch}
                        >
                            {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{e.customer_name}</Select.Option>)}
                            {/* {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)} */}

                        </Select>
                    </Form.Item>
                </Col>

                {/* <Form.Item name="customer_phone_list" hidden /> */}

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
                            {getArrValue("customer_phone_list").map((e, index) => <Select.Option value={e.id} key={`customer-phone-${index}`}>{e}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                {/* <Form.Item name="vehicles_customers_list" hidden /> */}

                <Col lg={8} md={12} sm={12} xs={24}>
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
                    >
                        <Select
                            showSearch
                            // showArrow={false}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                            mode="multiple"
                        >
                            {repairManList.map((e, index) => <Select.Option value={e.id} key={`repair-man-${e.id}`}>{e?.name[locale.locale] ?? "-"}</Select.Option>)}
                            {/* {getArrValue("repair_man_list").map((e, index) => <Select.Option value={e.id} key={`repair-man-${e.id}`}>{e}</Select.Option>)} */}
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
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                            mode="multiple"
                            placeholder="เลือกข้อมูล"
                        >
                            {salesManList.map((e, index) => <Select.Option value={e.id} key={`sales-man-${e.id}`}>{e?.name[locale.locale] + (e?.UsersProfile?.details?.nickname ? ` (${e?.UsersProfile?.details?.nickname})` : "") ?? "-"}</Select.Option>)}
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
                        ]}
                    >
                        <InputNumber disabled={mode === "view"} stringMode min={0} style={{ width: "100%" }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>
                </Col>
                {/* <Form.Item name="repair_man_list" hidden /> */}

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
                            disabled={mode === "view"}
                            loading={loadingEasySearch}
                        >

                            {userList.map((e, index) => <Select.Option value={e.id} key={`user-list-${index}`}>{e.name}</Select.Option>)}
                            {/* {getArrValue("user_list").map((e, index) => <Select.Option value={e.id} key={`user-list-${index}`}>{e.name}</Select.Option>)} */}
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
                            {/* {getArrValue("vehicles_customers_list").map((e, index) => <Select.Option value={e.id} key={`customer-phone-${index}`}>{e}</Select.Option>)} */}
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
                            disabled={mode === "view"}
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
                <Col lg={4} md={6} sm={6} xs={12}>
                    <Form.Item
                        name="status"
                        label="สถานะ"
                    >
                        <Select style={{ width: "100%" }} disabled>
                            <Select.Option value={"0"}>ลบเอกสาร</Select.Option>
                            <Select.Option value={"1"}>ใช้งานเอกสาร</Select.Option> {/* อยู่ระหว่างดำเนินการ */}
                            <Select.Option value={"2"}>ยกเลิกเอกสาร</Select.Option> {/* ดำเนินการเรียบร้อย */}
                            {/* <Select.Option value={"3"}>ออกบิลอย่างย่อ</Select.Option>
                            <Select.Option value={"4"}>ออกบิลเต็มรูป</Select.Option> */}

                            {/* <Select.Option value={"0"}>ยกเลิก</Select.Option>
                            <Select.Option value={"1"}>เปิดบิล</Select.Option> 
                            <Select.Option value={"2"}>รอชำระ</Select.Option> 
                            <Select.Option value={"3"}>ออกบิลอย่างย่อ</Select.Option>
                            <Select.Option value={"4"}>ออกบิลเต็มรูป</Select.Option> */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={4} md={6} sm={6} xs={12}>
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

export default ComponentsRoutesModalFormRepairOrder