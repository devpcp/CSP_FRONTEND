import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { Input, Select, Form, Row, Col, Button, Divider, Space, AutoComplete, DatePicker, InputNumber } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { get, isArray, isFunction, isPlainObject, debounce } from 'lodash';
import API from '../../../../../util/Api'
import ModalBusinessCustomers from '../../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../../Modal/Components.Select.Modal.PersonalCustomers'
import ModalBothCustomerAndCar from '../../../Modal/Components.Add.Modal.BothCustomersAndCar'
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import RegexMultiPattern from '../../../../shares/RegexMultiPattern';

const FormQuotation = ({ docTypeId, menuId, onFinish, onFinishFailed, mode, handleCancel, calculateResult, configModal }) => {
    const form = Form.useFormInstance();

    const { locale } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const { documentTypes, taxTypes } = useSelector(({ master }) => master);

    const [customerList, setCustomerLists] = useState([]) //รายชื่อลูกค้า
    const [shopVehicleList, setShopVehicleList] = useState([]) // รถ
    const [customerPhoneList, setCustomerPhoneList] = useState([]) //หมายเลขโทรศัพท์
    const [userList, setUserList] = useState([]) // ผู้ทำเอกสาร
    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร

    useEffect(() => {
        init()
    }, [])

    useEffect(() => {
        try {
            if (mode !== "add") setCustomerPhoneList(() => form.getFieldsValue().customer_phone_list)
            else setCustomerPhoneList(() => [])
        } catch (error) {

        }

    }, [mode, configModal])

    const init = async () => {
        try {
            const [value1] = await Promise.all([getUser()])
            if (isArray(documentTypes)) setDocumentTypesList(() => documentTypes);
            if (isArray(value1.data)) {
                const new_data = [];
                value1.data.forEach(e => {
                    const fname = get(e, `UsersProfile.fname.${locale.locale}`, null), lname = get(e, `UsersProfile.lname.${locale.locale}`, null)
                    if (isPlainObject(authUser.UsersProfile)) {
                        // console.log('authUser.UsersProfile', authUser.UsersProfile)
                        const { shop_id } = authUser.UsersProfile;
                        // console.log('shop_id', shop_id , e.shop_id)
                        if (fname && lname && e.UsersProfile.shop_id === shop_id) {
                            new_data.push({
                                id: e.id,
                                name: `${fname} ${lname}`,
                                groups: e.Groups
                            })
                        }
                    }

                })
                setUserList(() => [...new_data]);
                // getMasterData()
            }

        } catch (error) {
            // console.log('error', error)
        }
    }

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    }
    const callbackModalCustomers = async (item) => {
        try {
            // console.log('item', item)
            const { customer_type, customer_list } = form.getFieldValue()
            if (customer_type === "person") {
                const data = await getCustomerPersonById(item.id)
                customer_list = [data].map(e => {
                    const newData = { ...e, customer_name: {} }
                    locale.list_json.forEach(x => {
                        newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                        return newData
                    })
                    return newData
                })
            } else {
                const data = await getCustomerBusinessById(item.id)
                customer_list = [data]
            }
            // if (customer_type) await onChangeCustomerType(customer_type)
            let mobileNoList
            const arr = []
            if (isPlainObject(item)) {
                mobileNoList = Object.entries(item.mobile_no).map((e) => ({ mobile_no: e[1] }));
                if (isArray(mobileNoList)) {
                    mobileNoList.map(e => {
                        arr.push({ value: e.mobile_no })
                    })

                    setCustomerPhoneList(() => arr)
                } else {
                    setCustomerPhoneList([])
                }
                // if (isArray(mobileNoList)) {
                //     const arr = mobileNoList.map(e => {
                //         return {
                //             value: e.mobile_no
                //         }
                //     })
                //     setCustomerPhoneList(arr)
                // } else {
                //     setCustomerPhoneList([])
                // }
            }
            // if (item.id) await onChangeCustomer(item.id)
            form.setFieldsValue({
                customer_id: item.id,
                customer_list,
            })

            if (isArray(arr) && arr.length == 1) form.setFieldsValue({ customer_phone: arr[0].value })
        } catch (error) {

        }
    }

    /* EasySearch */
    const debounceEasySearch = debounce((value) => handleEasySearch(value), 1000)
    const [easySearchList, setEasySearchList] = useState([])
    const handleEasySearch = async (search) => {
        try {
            // console.log('search', search);
            const { data } = await API.get(`/shopSalesTransactionDoc/easy-search?limit=10&page=1&sort=updated_date&order=desc&search=${search}`);
            if (data.status = "success") {
                data.data.data.forEach(e => {
                    const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                    const name = isPersonal ?
                        `${e.ShopPersonalCustomer.customer_name.first_name[locale.locale] ?? "-"} ${e.ShopPersonalCustomer.customer_name.last_name[locale.locale] ?? ""}` :
                        `${e.ShopBusinessCustomer.customer_name[locale.locale] ?? "-"}`;

                    const mobile_no = Object.entries(e[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`].mobile_no).map((x) => x[1]);
                    const vehicles_registration = `${isPlainObject(e.details) ? e.details.registration : "-"}`;
                    e.value_name = `${name}  -> ${vehicles_registration} -> ${mobile_no.toString()}`
                    e.customer_type = isPersonal ? "person" : "business";
                    e.mobile_no = mobile_no.length > 0 ? mobile_no[0] : null;
                    e.customer_id = e[`Shop${isPersonal ? "Personal" : "Business"}Customer`].id;
                })
                setEasySearchList(() => data.data.data)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const selectEasySearch = async (value) => {
        try {
            // console.log('value :>> ', value);
            const model = {
                customer_type: null
            };
            if (value) {

                const data = whereIdArray(easySearchList, value);
                form.setFieldsValue({ customer_type: data.customer_type })
                const res = await Promise.all([onChangeCustomerType(data.customer_type), onChangeCustomer(data.customer_id)]);
                //   const res = await Promise.all([onChangeCustomerType(data.customer_type), onChangeCustomer(data.customer_id), onChangeVehicles(data.id)]);


                // model.customer_type = data.customer_type;  /* ประเภทลูกค้า */
                // model.customer_id = data.customer_id; /* ชื่อลูกค้า */
                // model.customer_phone = data.mobile_no; /* หมายเลขโทรศัพท์ */
                // model.vehicles_customers_id = data.id; /* ทะเบียนรถ */
                // console.log('res :>> ', res);
                if (res[1]) {
                    model.customer_type = data.customer_type;  /* ประเภทลูกค้า */
                    model.customer_id = data.customer_id; /* ชื่อลูกค้า */
                    model.customer_phone = data.mobile_no; /* หมายเลขโทรศัพท์ */
                    model.vehicles_customers_id = data.id; /* ทะเบียนรถ */
                } else {
                    model.search_status_1 = null;
                }

            }
            form.setFieldsValue(model)



        } catch (error) {
            console.log('error', error)
        }
    }
    /*end EasySearch*/

    /*onSearch && onChange*/
    const onChangeCustomerType = async (value, isFirst) => {
        try {
            const { customer_list, customer_id, shop_vehicle_list, customer_phone, vehicles_customers_id } = form.getFieldsValue()
            customer_list = []
            shop_vehicle_list = []
            customer_id = null
            customer_phone = null
            vehicles_customers_id = null
            setCustomerPhoneList(() => [])

            form.setFieldsValue({ customer_list, customer_id, customer_phone, vehicles_customers_id, shop_vehicle_list })
        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const debounceOnSearch = debounce((value, type) => onSearchCustomer(value, type), 600)

    const onSearchCustomer = async (value, type) => {
        try {
            const { customer_type, customer_list } = form.getFieldValue();
            if (type === "onSearch") {
                if (!!customer_type && customer_type === "person") {
                    const { data } = await getCustomerPerson(value)
                    // console.log('data :>> ', data);
                    const new_data = data.map(e => {
                        const newData = { ...e, customer_name: {} }
                        locale.list_json.forEach(x => {
                            newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                            return newData
                        })
                        return newData
                    })
                    setCustomerLists(() => new_data)
                    customer_list = [...new_data] ?? []
                } else {
                    const { data } = await getCustomerBusiness(value)
                    setCustomerLists(() => data)
                    customer_list = [...data] ?? []
                }
            }

            form.setFieldsValue({ customer_list })
        } catch (error) {

        }
    }

    const onChangeCustomer = async (value, isFirst) => {
        try {
            // console.log('value', value)
            /*reset some fields when change customer*/
            form.setFieldsValue({ shop_vehicle_list: [], vehicles_customers_id: null, customer_phone: null })
            setCustomerPhoneList(() => [])
            /*end reset some fields*/

            /* รถ */
            const { customer_type, shop_vehicle_list, } = form.getFieldValue();

            const shopVehicleListData = await getShopVehicleCustomerByidCustomer(value, customer_type);

            if (isArray(shopVehicleListData.data)) {
                shop_vehicle_list = shopVehicleListData?.data ?? []
                setShopVehicleList(() => shopVehicleListData.data);
                // dispatch(setVehiclelist(shopVehicleListData.data));
                form.setFieldsValue({ shop_vehicle_list })
            }

            async function checkCustomerType(type, customerId) {
                try {
                    let data
                    if (type === "person") {
                        data = await getCustomerPersonById(customerId)
                        // console.log('data checkCustomerType :>> ', data);
                        const new_data = [data].map(e => {
                            const newData = { ...e, customer_name: {} }
                            locale.list_json.forEach(x => {
                                newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                                return newData
                            })
                            return newData
                        })
                        // console.log('new_data  checkCustomerType:>> ', new_data);
                        return new_data ?? []
                        // return (mode === "add") ? [data.data] ?? [] : new_data

                    } else {
                        data = await getCustomerBusinessById(customerId)
                        return [data] ?? []
                    }
                } catch (error) {

                }
            }

            const customData = await checkCustomerType(customer_type, value)
            if (mode !== "add") setCustomerLists(() => customData)

            const find = customData.length > 0 ? customData.find(where => where.id === value) : {};
            // const find = customerList.length > 0 ? customerList.find(where => where.id === value) : customData.find(where => where.id === value);

            const arr = []
            let mobileNoList
            if (isPlainObject(find)) {
                // find.mobile_no = Object.entries(find.mobile_no).map((e) => ({ mobile_no: e[1] }));
                mobileNoList = Object.entries(find.mobile_no).map((e) => ({ mobile_no: e[1] }));

                if (isArray(mobileNoList)) {

                    mobileNoList.map(e => {
                        arr.push({ value: e.mobile_no })
                    })

                    setCustomerPhoneList(() => arr)
                } else {
                    setCustomerPhoneList([])
                }

                if (arr.length === 1 && !form.getFieldValue().customer_phone) form.setFieldsValue({ customer_phone: arr[0].value })
                return true
            }
            form.setFieldsValue({ shop_vehicle_list })
        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const onChangeAndClearVehicles = async (value, type) => {
        try {
            const { shop_vehicle_list, vehicles_customers_id, customer_type, customer_id } = form.getFieldValue()
            switch (type) {
                case "onSelect":
                    const { data } = await API.get(`/shopVehicleCustomer/byid/${value}`)
                    if (data.status === "success") {
                        shop_vehicle_list = data.data
                    }
                    break;
                case "onClear":
                    vehicles_customers_id = null
                    const shopVehicleListData = await getShopVehicleCustomerByidCustomer(customer_id, customer_type);
                    shop_vehicle_list = shopVehicleListData.data
                    break;

                default:
                    break;
            }
            form.setFieldsValue({ shop_vehicle_list, vehicles_customers_id })
        } catch (error) {
            // console.log('error :>> ', error);
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
            return watchData ?? []
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }
    /*end onSearch && onChange*/

    /*GET Data*/
    /* get Master shopPersonalCustomers */
    const getCustomerPerson = async (value) => {
        const { data } = await API.get(`/shopPersonalCustomers/all?search=${value}&limit=50&page=1`);
        return data.status == "success" ? data.data : []
    }
    /* get Master shopPersonalCustomers by id */
    const getCustomerPersonById = async (id) => {
        try {
            const { data } = await API.get(`/shopPersonalCustomers/byid/${id}`);
            return data.status === "success" ? data.data : []
        } catch (error) {

        }
    }

    /* get Master shopBusinessCustomers */
    const getCustomerBusiness = async (value) => {
        const { data } = await API.get(`/shopBusinessCustomers/all?search=${value}&limit=50&page=1`);
        return data.status == "success" ? data.data : []
    }
    /* get Master shopBusinessCustomers by id */
    const getCustomerBusinessById = async (id) => {
        try {
            const { data } = await API.get(`/shopBusinessCustomers/byid/${id}`);
            return data.status === "success" ? data.data : []
        } catch (error) {

        }
    }

    /* get Master shopBusinessCustomers */
    const getShopVehicleCustomerByidCustomer = async (id, type) => {
        try {
            let url = `/shopVehicleCustomer/all?limit=999999&page=1&status=active`;
            if (type === "person") url += `&per_customer_id=${id}`;
            else if (type === "business") url += `&bus_customer_id=${id}`;
            const { data } = await API.get(url);
            return data.status === "success" ? data.data : []
        } catch (error) {

        }

    }

    /* get Master shopBusinessCustomers */
    const getUser = async () => {
        const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
        return data.status == "success" ? data.data : []
    }
    /*End GET Data*/

    return (
        <>
            {/* <Form
                form={form}
                className="pt-3"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 20 }}
                layout={"vertical"}
            > */}
            <Row gutter={[30, 6]}>
                <Col lg={8} md={12} sm={24} xs={24} hidden>
                    <Form.Item name="customer_list" />
                </Col>
                <Col lg={8} md={12} sm={24} xs={24} hidden>
                    <Form.Item name="shop_vehicle_list" />
                </Col>
                {/* {(mode === "add") ? //ใบสั่งซ่อม
                        <>
                            <Col style={{ display: "flex", alignItems: "center" }} lg={16} md={24} sm={24} xs={24}>
                                <span style={{ paddingRight: "10px" }}>ค้นหา</span>
                                <Form.Item
                                    noStyle
                                    name="search_status_1"
                                    label="ค้นหา"
                                >
                                    <Select
                                        showSearch
                                        showArrow={false}
                                        onSearch={(value) => debounceEasySearch(value)}
                                        onChange={(value) => selectEasySearch(value)}
                                        filterOption={false}
                                        notFoundContent={null}
                                        style={{ width: "100%" }}
                                        disabled={mode != "add"}
                                    >
                                        {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)}

                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col style={{ display: "flex", alignItems: "center" }} lg={8} md={24} sm={24} xs={24} >
                                <ModalBothCustomerAndCar textButton={"เพิ่มลูกค้า"} docTypeId={docTypeId} />
                            </Col>
                        </>

                        : null //type == 1
                    } */}
                <Col lg={8} md={12} sm={24} xs={24}>
                    {/* <span style={{ paddingRight: "10px" }}>ค้นหา</span> */}
                    <Form.Item
                        // noStyle
                        name="customer_type"
                        label="ประเภทลูกค้า"
                    >
                        <Select style={{ width: "100%" }}
                            // disabled
                            disabled={mode === "view"}
                            onChange={onChangeCustomerType}
                        >
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={24} xs={24}>
                    {/* <span style={{ paddingRight: "10px" }}>ค้นหา</span> */}
                    <Form.Item
                        // noStyle
                        name="customer_id"
                        label="ชื่อลูกค้า"
                        rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                        // extra={GetIntlMessages("พิมพ์อย่างน้อย 1 ตัวอักษร เพื่อค้นหาลูกค้า")}
                    >
                        <Select style={{ width: "100%" }}
                            showSearch
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            disabled={mode === "view"}
                            // onChange={onChangeCustomer}
                            onSearch={(value) => debounceOnSearch(value, "onSearch")}
                            onSelect={(value) => onChangeCustomer(value, "selectCustomer")}
                            dropdownRender={menu =>
                                checkValueCustomerType() ? (
                                    <>
                                        {menu}
                                        <Divider style={{ margin: '8px 0' }} />
                                        <Space align="center" style={{ padding: '0 8px 4px' }}>
                                            {
                                                checkValueCustomerType() === "business" ?
                                                    <ModalBusinessCustomers textButton={GetIntlMessages(`เพิ่มข้อมูล`)} icon={<PlusOutlined />} callback={callbackModalCustomers} /> :
                                                    <ModalPersonalCustomers textButton={GetIntlMessages(`เพิ่มข้อมูล`)} icon={<PlusOutlined />} callback={callbackModalCustomers} />
                                            }
                                        </Space>
                                    </>
                                ) : null}
                        >
                            {/* {Form.useWatch("customer_list", form).map((e) => <Select.Option value={e?.id}>{e?.customer_name[locale.locale] ?? "-"}</Select.Option>)} */}
                            {getArrListValue("customer_list").map((e) => <Select.Option value={e?.id}>{e?.customer_name[locale.locale] ?? "-"}</Select.Option>)}
                            {/* {customerList.map((e) => <Select.Option value={e.id}>{e.customer_name[locale.locale]}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>



                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="customer_phone"
                        label="หมายเลขโทรศัพท์"
                        rules={[{ pattern: /^[0-9,-]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]}
                    >
                        <AutoComplete
                            // disabled={mode == "view" || mode == "edit" || type == 2 || type == 3}
                            maxLength={10}
                            disabled={mode === "view" || !form.getFieldsValue().customer_id}
                            options={customerPhoneList}
                            style={{ width: "100%" }}
                            value="mobile_no"
                            placeholder={`เลือกข้อมูลหรือเพิ่มข้อมูลใหม่`}
                        // filterOption={(inputValue, option) => {
                        //     if (isPlainObject(option)) {
                        //         if (isFunction(option.value)) {
                        //             return inputValue ? option.value.search(inputValue) != -1 : null
                        //         }
                        //         // if (isPlainObject(option.value)) {
                        //         //     if (isFunction(option.value.search)) return option.value.search(inputValue) != -1
                        //         // }
                        //     }
                        // }}
                        />

                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="vehicles_customers_id"
                        label="ทะเบียนรถ"
                    // rules={[{ required: !(mode != "add"), message: "กรุณาเลือกข้อมูล !!" }]}
                    >
                        <Select
                            // disabled
                            disabled={mode === "view" || !form.getFieldsValue().customer_id}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: "100%" }}
                            onSelect={(value) => onChangeAndClearVehicles(value, "onSelect")}
                            onClear={(value) => onChangeAndClearVehicles(value, "onClear")}
                            allowClear
                        >
                            {getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{get(e, `details.registration`, "-")}</Select.Option>)}
                            {/* {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `details.registration`, "-")}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="vehicles_customers_id"
                        label="จังหวัด"
                    >
                        <Select style={{ width: "100%" }} showArrow={false} disabled>
                            {getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{get(e, `details.province_name`, "-")}</Select.Option>)}
                            {/* {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `details.province_name`, "-")}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="vehicles_customers_id"
                        label="ยี่ห้อ"
                    >
                        <Select style={{ width: "100%" }} showArrow={false} disabled>
                            {getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{get(e, `VehicleBrand.brand_name.${locale.locale}`, "-")}</Select.Option>)}
                            {/* {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `VehicleBrand.brand_name.${locale.locale}`, "-")}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="vehicles_customers_id"
                        label="รุ่น"
                    >
                        <Select style={{ width: "100%" }} showArrow={false} disabled>
                            {getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{get(e, `VehicleModelType.model_name.${locale.locale}`, "-")}</Select.Option>)}
                            {/* {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `VehicleModelType.model_name.${locale.locale}`, "-")}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="user_id"
                        label="ผู้ทำเอกสาร"
                        rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                    >
                        <Select
                            disabled={mode !== "add"}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            showArrow={false}
                            style={{ width: "100%" }} >
                            {userList.map((e) => <Select.Option key={`user-${e.id}`} value={e.id}>{e.name}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="tax_type_id"
                        label="ประเภทภาษี"
                    >
                        <Select style={{ width: "100%" }} disabled={mode === "view"} onChange={() => (isFunction(calculateResult)) ? calculateResult() : null}>
                            {taxTypes.map((e) => <Select.Option key={`tax-type-${e.id}`} value={e.id}>{e.type_name[locale.locale] ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="tax_type_id"
                        label="อัตราภาษี (%)"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false} >
                            {taxTypes.map((e) => <Select.Option key={`tax-type-${e.id}`} value={e.id}>{e?.detail?.tax_rate_percent ?? "-"}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_type_id"
                        label="ประเภทเอกสาร"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {documentTypesList.map((e) => <Select.Option key={`doc-type-${e.id}`} value={e.id}>{e.type_name[locale.locale] ?? "-"}</Select.Option>)}
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
                        name="effective_days"
                        label="จำนวนวันที่มีผล"
                        rules={[RegexMultiPattern("1", GetIntlMessages("only-number"))]}
                    >
                        <Input type={"number"} min={0} style={{ width: "100%" }} addonAfter={GetIntlMessages("วัน")} disabled={mode === "view"} />
                    </Form.Item>
                </Col>
            </Row>
            {/* </Form> */}
        </>
    )
}

export default FormQuotation