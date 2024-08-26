import { useEffect, useState } from 'react'
import { Input, Select, Form, Row, Col, Button, Divider, Space, AutoComplete, message, DatePicker } from 'antd';
import API from '../../../../util/Api'
import GetIntlMessages from '../../../../util/GetIntlMessages';
import SearchServicePlans from "../Invoices/Components.Routes.Modal.Search.ServicePlans";
import ServicePlansAndInvoice from "../Invoices/Components.Routes.Modal.Search.ServicePlansAndInvoice";
import ModalBusinessCustomers from '../../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../../Modal/Components.Select.Modal.PersonalCustomers'
import ModalBothCustomerAndCar from '../../Modal/Components.Add.Modal.BothCustomersAndCar'
import { useDispatch, useSelector } from 'react-redux';
import { get, isArray, isFunction, isPlainObject, debounce } from 'lodash';
import { PlusOutlined } from '@ant-design/icons';
import { setCustomerlist, setVehiclelist } from '../../../../redux/actions/servicePlansActions';
import Swal from "sweetalert2";
import FormProvinceDistrictSubdistrict from '../../../shares/FormProvinceDistrictSubdistrict';
import moment from 'moment'
/**
 * type คือ ประเภท ใบงาน
 *  - 1 = ใบสั่งซ่อม
 *  - 2 = ใบเสร็จรับเงิน/ใบกำกับภาษี
 *  - 3 = ใบกํากับภาษีเต็มรูปแบบ
 * @param {object} obj 
 * @param {import('antd').FormInstance} obj.form 
 * @param {number} obj.type 
 * @returns 
 */
const FormServicePlans = ({ mode, configModal, form, onFinish, onFinishFailed, taxTypesList, calculateResult, type = 1, addEditViewModal, handleCancel, docTypeId, setLoading }) => {
    const dispatch = useDispatch();

    const { locale } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    const masterData = useSelector(({ master }) => master);

    const [documentTypesList, setDocumentTypesList] = useState([]) //ประเภทเอกสาร
    const [customerList, setCustomerLists] = useState([]) //รายชื่อลูกค้า
    const [customerPhoneList, setCustomerPhoneList] = useState([]) //หมายเลขโทรศัพท์
    const [shopVehicleList, setShopVehicleList] = useState([]) // รถ
    const [userList, setUserList] = useState([]) // รถ
    const [repairManList, setRepairManList] = useState([]) // ช่างซ่อม
    const [disabledCustomer, setDisabledCustomer] = useState(true)
    const docTypeIdQuotation = "e5871484-d096-41be-b515-b33aa715957a";// ใบเสนอราคา
    const [checkSearching, setCheckSearching] = useState(false)


    useEffect(() => {
        init()
        changeMode(mode)

        /* form */
        const { doc_type_id } = form.getFieldValue()
        if (doc_type_id === "67c45df3-4f84-45a8-8efc-de22fef31978" || doc_type_id === docTypeIdQuotation) {
            form.setFieldsValue({
                // customer_type: "business",
            })
            // onChangeCustomerType("business")
            setDisabledCustomer(false)
        }
    }, [])

    useEffect(() => {
        changeMode(mode)
    }, [configModal, mode])

    useEffect(() => {
        changeMode(mode)
    }, [form.getFieldValue()?.customer_id, form.getFieldValue()?.customer_type])

    useEffect(() => {
        if (isFunction(handleCancel)) {
            getMasterData()
            setVehicleModelType([])
        }
    }, [])

    const init = async () => {
        try {

            const [value1, value2] = await Promise.all([getDocumentTypes(), getUser()])
            if (isArray(value1)) setDocumentTypesList(value1);
            if (isArray(value2.data)) {
                const new_data = [];
                value2.data.forEach(e => {
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
                setUserList(new_data);
                getMasterData()
            }

        } catch (error) {
            console.log('error', error)
        }
    }

    const changeMode = (_mode) => {
        if (_mode) mode = _mode;
        if (mode === "edit" || mode === "view") {
            const { customer_type, customer_id } = form.getFieldValue()
            if (customer_type) onChangeCustomerType(customer_type, true);
            if (customer_id) onChangeCustomer(customer_id, true);
        } else {
            dispatch(setCustomerlist([]));
            dispatch(setVehiclelist([]));
        }
    }

    const onChangeCustomerType = async (value, isFirst) => {
        try {
            const { search_status_1, customer_id } = form.getFieldValue()

            if (isFirst !== true) {
                form.setFieldsValue({
                    // customer_id: null,
                    vehicles_customers_id: null,
                    customer_phone: null
                })
            }

            if (value === "person") {
                if (!!search_status_1) {
                    const _find = easySearchList.find(where => where?.id === search_status_1)
                    if (isPlainObject(_find)) {
                        const data = await getCustomerPersonById(_find?.per_customer_id)
                        const new_data = [data].map(e => {
                            const newData = { ...e, customer_name: {} }
                            locale.list_json.forEach(x => {
                                newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                                return newData
                            })
                            return newData
                        })
                        setCustomerLists(() => new_data)
                        dispatch(setCustomerlist(new_data));
                    } else {
                        setCustomerLists(() => [])
                        dispatch(setCustomerlist([]));
                    }

                } else if (mode !== "add") {
                    if (!!customer_id) {
                        const data = await getCustomerPersonById(customer_id)
                        const new_data = [data].map(e => {
                            const newData = { ...e, customer_name: {} }
                            locale.list_json.forEach(x => {
                                newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                                return newData
                            })
                            return newData
                        })
                        setCustomerLists(() => new_data)
                        dispatch(setCustomerlist(new_data));
                    } else {
                        setCustomerLists(() => [])
                        dispatch(setCustomerlist([]));
                    }

                } else {
                    setCustomerLists(() => [])
                }


                /* old function */
                // const { data } = await getCustomerPerson();
                // // console.log('list person', data)
                // // console.log('locale', locale.list_json)
                // const new_data = data.map(e => {
                //     const newData = { ...e, customer_name: {} }
                //     locale.list_json.forEach(x => {
                //         newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                //         return newData
                //     })
                //     return newData
                // })
                // // console.log('new_data', new_data)
                // setCustomerLists(new_data)
                // dispatch(setCustomerlist(new_data));

            } else if (value === "business") {
                // const { data } = await getCustomerBusiness();

                if (!!search_status_1 && mode === "add") {
                    const _find = easySearchList.find(where => where?.id === search_status_1)
                    if (isPlainObject(_find)) {
                        const data = await getCustomerBusinessById(_find?.bus_customer_id);
                        setCustomerLists(() => [{ ...data }])
                        dispatch(setCustomerlist([{ ...data }]));
                    } else {
                        setCustomerLists(() => [])
                        dispatch(setCustomerlist([]));
                    }

                } else if (mode !== "add") {
                    if (!!customer_id) {
                        const data = await getCustomerBusinessById(customer_id);
                        setCustomerLists(() => [{ ...data }])
                        dispatch(setCustomerlist([{ ...data }]));
                    } else {
                        dispatch(setCustomerlist([]));
                        setCustomerLists(() => [])
                    }
                } else {
                    dispatch(setCustomerlist([]));
                    setCustomerLists(() => [])
                }

            }

            if (form.getFieldValue().doc_type_id == "67c45df3-4f84-45a8-8efc-de22fef31978" && mode === "add") {
                form.setFieldsValue({
                    customer_id: null,
                })
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }

    }

    const onChangeCustomer = async (value, isFirst) => {
        try {
            // console.log('value', value)

            /* รถ */
            const { customer_type } = form.getFieldValue();
            const shopVehicleListData = await getShopVehicleCustomerByidCustomer(value, customer_type);

            if (isArray(shopVehicleListData.data)) {
                setShopVehicleList(() => shopVehicleListData.data);
                dispatch(setVehiclelist(shopVehicleListData.data));
            }

            if (isFirst !== true) {
                form.setFieldsValue({
                    customer_phone: null,
                    vehicles_customers_id: null
                })
            }

            async function checkCustomerType(type, customerId) {
                try {
                    let data

                    if (type === "person") {
                        data = await getCustomerPersonById(customerId)
                        const new_data = [data].map(e => {
                            const newData = { ...e, customer_name: {} }
                            locale.list_json.forEach(x => {
                                newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                                return newData
                            })
                            return newData
                        })
                        if (!!data) return (mode === "add") ? [data.data] ?? [] : new_data
                        else return []

                        /* old */
                        // data = await getCustomerPerson()
                        // return data.data ?? []
                    } else {
                        data = await getCustomerBusinessById(customerId)
                        if (!!data) return (mode === "add") ? [data.data] ?? [] : [data]
                        else return []

                        /* old */
                        // data = await getCustomerBusiness()
                        // return data.data ?? []
                    }
                } catch (error) {

                }
            }

            const customData = isFirst === true ? await checkCustomerType(customer_type, value) : []

            if (mode !== "add") setCustomerLists(() => customData)

            const find = customerList.length > 0 ? customerList.find(where => where.id === value) : customData.find(where => where.id === value);

            const arr = []
            let mobileNoList
            if (isPlainObject(find)) {
                // find.mobile_no = Object.entries(find.mobile_no).map((e) => ({ mobile_no: e[1] }));
                mobileNoList = Object.entries(find.mobile_no).map((e) => ({ mobile_no: e[1] }));

                if (isArray(mobileNoList)) {

                    mobileNoList.map(e => {
                        arr.push({ value: e.mobile_no })
                    })
                    // if (isArray(find.mobile_no)) {
                    // const arr = find.mobile_no.map(e => {
                    //     return {
                    //         value: e.mobile_no
                    //     }
                    // })
                    // console.log('arr', arr)
                    setCustomerPhoneList(arr)
                } else {
                    setCustomerPhoneList([])
                }

                if (arr.length == 1 && !form.getFieldValue().customer_phone) form.setFieldsValue({ customer_phone: arr[0].value })
            }

        } catch (error) {
            // console.log('error :>> ', error);
        }

    }
    const debounceOnSearch = debounce((value, type) => onSearchCustomer(value, type), 1000)
    const onSearchCustomer = async (value, type) => {
        try {
            const { customer_type } = form.getFieldValue();
            if (type === "onSearch") {
                if (!!customer_type && customer_type === "person") {
                    const { data } = await getCustomerPerson(value)
                    const new_data = data.map(e => {
                        const newData = { ...e, customer_name: {} }
                        locale.list_json.forEach(x => {
                            newData.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"}` : ""
                            return newData
                        })
                        return newData
                    })
                    setCustomerLists(() => new_data)
                } else {
                    const { data } = await getCustomerBusiness(value)
                    setCustomerLists(() => data)
                }
            }
        } catch (error) {

        }
    }

    /* get Master documentTypes */
    // 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
    // 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบส่งของชั่วคราว
    // e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
    // b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
    // 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
    const getDocumentTypes = async () => {
        const { data } = await API.get(`/master/documentTypes`);
        return data.status == "success" ? data.data : []
    }

    /* get Master documentTypes */
    const getTaxTypes = async () => {
        const { data } = await API.get(`/master/taxTypes/all`);
        return data.status == "success" ? data.data : []
    }

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
        let url = `/shopVehicleCustomer/all?limit=999999&page=1`;
        if (type === "person") url += `&per_customer_id=${id}`;
        else if (type === "business") url += `&bus_customer_id=${id}`;
        const { data } = await API.get(url);
        return data.status == "success" ? data.data : []
    }

    /* get Master shopBusinessCustomers */
    const getUser = async () => {
        const { data } = await API.get(`/shopUser/all?limit=999999&page=1`);
        return data.status == "success" ? data.data : []
    }

    const callbackModalTaxType = async (item) => {
        try {
            const [value1] = await Promise.all([getTaxTypes()])
            if (isArray(value1)) setTaxTypesList(value1);

            form.setFieldsValue({
                tax_id: item.id
            })
        } catch (error) {

        }
    }

    const callbackModalCustomers = async (item) => {
        try {
            // console.log('item', item)
            const { customer_type } = form.getFieldValue()
            if (customer_type) await onChangeCustomerType(customer_type)
            let mobileNoList
            const arr = []
            if (isPlainObject(item)) {
                mobileNoList = Object.entries(item.mobile_no).map((e) => ({ mobile_no: e[1] }));
                if (isArray(mobileNoList)) {
                    mobileNoList.map(e => {
                        arr.push({ value: e.mobile_no })
                    })

                    setCustomerPhoneList(arr)
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
            })

            if (isArray(arr) && arr.length == 1) form.setFieldsValue({ customer_phone: arr[0].value })
        } catch (error) {

        }
    }

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    }

    const onChangeVehicles = async (value) => {
        try {
            if (mode == "add" && isArray(shopVehicleList)) {
                // console.log('value', value)
                const { doc_type_id, customer_id, customer_type } = form.getFieldValue();
                // console.log('doc_type_id', doc_type_id)
                // const promise1 = API.get(`/shopVehicleCustomer/byid/${value}`)
                // const promise2 = API.get(`/shopSalesTransactionDoc/all?limit=10&page=1&sort=created_date&order=desc&vehicles_customers_id=${value}`)
                // const [value1 , value2] = await Promise.all([promise1,promise2])
                // console.log('value1 :>> ', value1);
                // const { data } = await API.get(`/shopVehicleCustomer/byid/${value}`);
                const { data } = await API.get(`/shopSalesTransactionDoc/all?limit=10&page=1&sort=created_date&order=desc&vehicles_customers_id=${value}`); // เช็คว่ายังทมีงานค้างอยู่ไหม
                if (data.status === "success") {
                    const arr = data.data.data;
                    // console.log('arr', arr);
                    if (isArray(arr) && arr.length > 0) {
                        if (doc_type_id != "67c45df3-4f84-45a8-8efc-de22fef31978" || doc_type_id != docTypeIdQuotation) {
                            /* ยังไม่ปิดงาน มีงานค้างอยู่ */
                            const filter1 = arr.filter(where => where.status == 1);
                            if (filter1.length > 0) {
                                // message.warning("กรุณาปิดงานเก่าก่อน")
                                Swal.fire({
                                    icon: 'warning',
                                    title: GetIntlMessages("warning"),
                                    text: GetIntlMessages("กรุณาปิดงานเก่าก่อน"),
                                });
                                form.setFieldsValue({
                                    search_status_1: null,
                                    mileage_old: null,
                                    customer_type: "person",
                                    customer_id: null,
                                })
                                return false
                            }
                        }

                        /* ไม่มีงานค้าง และหาประวิติงานเก่า */
                        const filter2 = arr.filter(where => where.status != 0 || where.status != 1);
                        if (filter2.length > 0) {
                            if (isPlainObject(filter2[0])) {
                                // console.log('filter2[0]', filter2[0])
                                form.setFieldsValue({
                                    // mileage_old: !!value1.data.data[0]?.last_mileage ? value1.data.data[0]?.last_mileage : value1.data.data[0]?.details?.mileage_first,
                                    // vehicle_service_date_last: value1.data.data[0].last_service
                                    mileage_old: !!filter2[0].details?.mileage ? filter2[0].details?.mileage : null,
                                    vehicle_service_date_last: filter2[0].created_date
                                })
                            }
                        }

                    } else {
                        const shopVehicleListData = await getShopVehicleCustomerByidCustomer(customer_id, customer_type);
                        const { data } = shopVehicleListData
                        let _find
                        if (data.length > 0) {
                            _find = data.find(where => (where?.per_customer_id ?? where?.bus_customer_id) === customer_id)
                        }
                        form.setFieldsValue({
                            mileage_old: !!_find?.last_mileage ? _find?.last_mileage : _find?.details?.mileage_first ?? null,
                            vehicle_service_date_last: moment(_find?.last_service) ?? null
                        })
                    }
                }


                return true
                /* old */
                // const find = shopVehicleList.find(where => where.id === value);
                // // console.log('find', find)
                // if (isPlainObject(find)) {
                //     // console.log('mileage', find.details.mileage)
                //     form.setFieldsValue({
                //         mileage_old: find.details.mileage ?? null,
                //         vehicle_service_date_last: find.details.service_date_last ?? null
                //     })
                // }
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    /* EasySearch */
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
                setCheckSearching(false)
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
                // console.log('data', data)
                form.setFieldsValue({ customer_type: data.customer_type, customer_id: data.customer_id })
                const res = await Promise.all([onChangeCustomerType(data.customer_type), onChangeCustomer(data.customer_id), onChangeVehicles(data.id)]);

                if (res[2]) {
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

    const whereIdArray = (arr, id, type) => {
        return type === "index" ? arr.findIndex(where => where.id === id) : arr.find(where => where.id === id)
    }

    /* -------------------------------- */

    const [businessTypeList, setBusinessTypeList] = useState([])
    const [vehicleType, setVehicleType] = useState([]) //ประเภท ยานพาหนะ
    const [vehicleBrand, setVehicleBrand] = useState([]) //ยี่ห้อ ยานพาหนะ
    const [vehicleModelType, setVehicleModelType] = useState([]) //รุ่น ยานพาหนะ

    const checkCreateForm = () => {
        const { search_status_1, doc_type_id } = form.getFieldValue()
        return ((mode == "add" && !search_status_1) && type != 2 && type != 3) && doc_type_id != "67c45df3-4f84-45a8-8efc-de22fef31978" && doc_type_id != docTypeIdQuotation
    }

    const checkCreateFormCustomerType = () => {
        const { create } = form.getFieldValue()
        return isPlainObject(create) ? create.customer_type : false
    }

    const onChangeVehicleBrand = async (value) => {
        try {
            const { vehicle_type_id } = form.getFieldValue().create
            form.setFieldsValue({
                create: { vehicle_model_id: null, vehicle_type_id: null }
            })
            let _filter = []
            const _filterVehicleType = []
            if (value) {
                _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === value)
                const find = vehicleBrand.find(where => where.id === value)
                find.VehicleModelTypes.map(e => {
                    const _findVehicleType = masterData.vehicleType.find(where => where.id === e.vehicle_type_id)
                    if (isPlainObject(_findVehicleType)) {
                        const checkDuplicateData = _filterVehicleType.find(where => where.id === _findVehicleType.id)
                        if (!isPlainObject(checkDuplicateData)) _filterVehicleType.push(_findVehicleType)

                    }
                })
                setVehicleType(_filterVehicleType ?? [])
            }

            /**
             * โค้ดด้านล่างนี้เป็น โค้ด filter ตามประเภทรถ ห้ามลบ เพื่อเอากลับมาใช้
             */
            // if(vehicle_type_id && value){
            //     console.log("เข้า 1");
            //     _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === value && where.vehicle_type_id === vehicle_type_id)
            // }else if(!vehicle_type_id && value){
            //     console.log("เข้า 2");
            //     _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === value)
            //     const find = vehicleBrand.find(where => where.id === value)
            //     find.VehicleModelTypes.map(e => {
            //         const _findVehicleType = masterData.vehicleType.find(where =>where.id === e.vehicle_type_id)
            //         if(isPlainObject(_findVehicleType)){
            //                 const checkDuplicateData = _filterVehicleType.find(where => where.id === _findVehicleType.id)
            //                 if(!isPlainObject(checkDuplicateData)) _filterVehicleType.push(_findVehicleType)

            //         } 
            //     })
            //     setVehicleType(_filterVehicleType ?? [])
            // }

            setVehicleModelType(_filter ?? [])
            // setVehicleModelType(await getVehicleModelTypeBybrandid(value,form.getFieldValue().create.vehicle_type_id))
        } catch (error) {
            console.log('error', error)
        }
    }
    const onChangeVehicleType = async (value) => {
        try {
            const { vehicle_brand_id } = form.getFieldValue().create
            form.setFieldsValue({
                create: { vehicle_model_id: null, vehicle_brand_id: null }
            })
            let _filter = []
            if (vehicle_brand_id && value) {
                _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === vehicle_brand_id && where.vehicle_type_id === value)

            } else if (!vehicle_brand_id && value) {
                _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === vehicle_brand_id || where.vehicle_type_id === value)
                const _filterVehicleBrand = []
                masterData.vehicleBrand.map(e => {
                    // console.log('e.VehicleModelTypes :>> ', e.VehicleModelTypes);
                    const find = e.VehicleModelTypes.find(where => where.vehicle_type_id === value)
                    if (isPlainObject(find)) _filterVehicleBrand.push(e)
                    setVehicleBrand(_filterVehicleBrand)
                })
            } else {
                _filter = masterData.vehicleModelType.filter(where => where.vehicles_brand_id === vehicle_brand_id)
                setVehicleBrand(masterData.vehicleBrand)
            }

            setVehicleModelType(_filter ?? [])
            // setVehicleModelType(await getVehicleModelTypeBybrandid(form.getFieldValue().create.vehicle_brand_id,value))
        } catch (error) {
            console.log('error', error)
        }
    }
    const onChangeVehicleModelType = async (value) => {
        try {
            const find = vehicleModelType.find(where => where.id === value)
            if (isPlainObject(find)) form.setFieldsValue({
                create: { vehicle_type_id: find.VehicleType?.id ?? null, vehicle_brand_id: find.VehicleBrand.id }
            })

        } catch (error) {
            console.log('error', error)
        }
    }

    const checkDisable = (type) => {
        try {
            const { vehicle_brand_id, vehicle_type_id } = form.getFieldValue().create
            "vehicle_brand_id"
            switch (type) {
                case "vehicle_brand_id":
                    if (!vehicle_type_id) return true
                    break;
                case "vehicle_model_id":
                    if (!vehicle_brand_id) return true
                    break;

                default: return false
            }
        } catch (error) {

        }
    }

    const getMasterData = async () => {
        try {
            if (isArray(masterData.vehicleBrand)) setVehicleBrand(() => masterData.vehicleBrand)
            if (isArray(masterData.busnessType)) setBusinessTypeList(() => masterData.busnessType)
            if (isArray(masterData.vehicleType)) setVehicleType(() => masterData.vehicleType)
            const [value1] = await Promise.all([getRepairMan()])
            const new_data = value1.map(e => {
                const newData = { ...e, name: {} }
                locale.list_json.forEach(x => {
                    newData.name[x] = `${e.UsersProfile.fname[x] ?? "-"} ${e.UsersProfile.lname[x] ?? "-"}` ?? ""
                    return newData
                })
                return newData
            })
            setRepairManList(() => new_data)

            // const [value1, value2, value3] = await Promise.all([getVehicleBrand(), getBusinessTypeDataListAll(), getVehicleType()])
            // if (isArray(value1)) setVehicleBrand(value1)
            // if (isArray(value2)) setBusinessTypeList(value2)
            // if (isArray(value3)) setVehicleType(value3)
        } catch (error) {

        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    /* get Master getVehicleBrand (ยี่ห้อ ยานพาหนะ) */
    const getVehicleBrand = async () => {
        const { data } = await API.get(`/master/vehicleBrand/all`);
        return data.status == "success" ? data.data : []
    }

    /* get Master getVehicleModelTypeBybrandid (รุ่น ยานพาหนะ) */
    const getVehicleModelTypeBybrandid = async (vehicles_brand_id = "", vehicle_type_id = "") => {
        try {
            if (vehicles_brand_id || vehicle_type_id) {
                const { data } = await API.get(`/master/vehicleModelType/all?limit=99999&page=1&sort=code_id&order=asc&status=active${vehicles_brand_id ? `&vehicles_brand_id=${vehicles_brand_id}` : ""}${vehicle_type_id ? `&vehicle_type_id=${vehicle_type_id}` : ""}`);
                // const { data } = await API.get(`/master/vehicleModelType/bybrandid/${id}`);
                return data.status == "success" ? data.data.data : []
            }
        } catch (error) {
            console.log('error :>> ', error);
        }

    }

    /* get Master getVehicleType (ประเภท ยานพาหนะ) */
    const getVehicleType = async () => {
        const { data } = await API.get(`/master/vehicleType/all?limit=0&page=0&sort=created_date&order=desc&status=active`);
        // const { data } = await API.get(`/master/vehicleType/all`);
        return data.status == "success" ? data.data : []
    }
    /* get Master getVehicleType (ประเภท ยานพาหนะ) */
    const getRepairMan = async () => {
        const { data } = await API.get(`/shopUser/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=false&department_id=71b4f85b-42c4-457a-af6a-0a9e6e3b2c1e`);
        // console.log('data :>> ', data);
        return data.status === "success" ? data.data.data : []
    }

    /* callback SearchService Plans */
    const callbackSearchServicePlans = (value) => {
        if (isPlainObject(value) && isFunction(addEditViewModal)) {
            addEditViewModal("add", value.id)
            setTimeout(() => {
                changeMode("view")
            }, 500);
        }
    }
    const getdoc_type_idform = () => {
        let IsPAss = false;
        if (form.getFieldValue().doc_type_id == "67c45df3-4f84-45a8-8efc-de22fef31978" || form.getFieldValue().doc_type_id == docTypeIdQuotation) {
            IsPAss = false;
        } else if (form.getFieldValue().doc_type_id == "7ef3840f-3d7f-43de-89ea-dce215703c16") {
            IsPAss = true;
        }
        // if (form.getFieldValue().doc_type_id != "67c45df3-4f84-45a8-8efc-de22fef31978" || form.getFieldValue().doc_type_id != docTypeIdQuotation) {
        //     {!IsPAss}; <- ถ้าใช้ให้เอา {} ออก
        // }
        return IsPAss;

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

    const checkCustomer = () => {
        if (form.getFieldValue().search_status_1 && mode === "add") return false
        else if (mode === "edit") return false
        else if (docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978") return false
        else return true
    }

    const disabledFieldUponPage = () => {
        /* get Master documentTypes */
        // 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
        // 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบส่งของชั่วคราว
        // e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
        // b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
        // 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
        switch (docTypeId) {
            case "67c45df3-4f84-45a8-8efc-de22fef31978":
                return false
            case "7ef3840f-3d7f-43de-89ea-dce215703c16":
                return true

            default:
                break;
        }
        // disabled={docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" ? false : true || mode == "view" || mode == "edit"|| type == 2 || type == 3}
    }
    const [mileageNowCheck, setMileageNowCheck] = useState(false);
    const mileageCheck = () => +form.getFieldValue().mileage <= +form.getFieldValue().mileage_old ? setMileageNowCheck(true) : setMileageNowCheck(false)
    return (
        <>
            <Form
                form={form}
                className="pt-3"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 18 }}
                layout={"vertical"}
            >
                <Row gutter={[10, 8]}>
                    {(mode == "add" && type != 2 && type != 3) && disabledCustomer ? //ใบสั่งซ่อม
                        <>
                            <Col style={{ display: "flex", alignItems: "center" }} lg={16} md={24} sm={24} xs={24}>
                                <span style={{ paddingRight: "10px" }}>ค้นหา</span>
                                <Form.Item
                                    noStyle
                                    // style={{width : "100%"}}
                                    // wrapperCol={{lg : {span : 16}, md :{span : 24}, sm:{span : 24}, xs:{span : 24}}}
                                    name="search_status_1"
                                    label="ค้นหา"
                                >
                                    <Select
                                        showSearch
                                        showArrow={false}
                                        onSearch={(value) => handleEasySearch(value)}
                                        onChange={(value) => selectEasySearch(value)}
                                        onFocus={(v) => v.target.value === "" && easySearchList.length === 0 ? setCheckSearching(true) : setCheckSearching(false)}
                                        // onFocus={(v) => console.log(easySearchList.length === 0)}
                                        filterOption={false}
                                        notFoundContent={checkSearching ? "ค้นหาข้อมูลชื่อลูกค้า ทะเบียนรถ หรือเบอร์โทรศัพท์" : "ไม่พบข้อมูล เพิ่มข้อมูลได้ที่ปุ่มด้านขวา"}
                                        style={{ width: "100%" }}
                                        disabled={mode != "add"}
                                        loading={true}
                                    >
                                        {easySearchList.map(e => <Select.Option value={e.id} key={`easy-search-${e.id}`}>{e.value_name}</Select.Option>)}

                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col style={{ display: "flex", alignItems: "center" }} lg={8} md={24} sm={24} xs={24} >
                                <ModalBothCustomerAndCar textButton={"เพิ่มข้อมูลทะเบียนรถ/ลูกค้า"} docTypeId={docTypeId} setLoading={setLoading} />
                            </Col>
                        </>

                        : null //type == 1
                    }

                    {
                        type == 2 ? //ใบเสร็จรับเงิน/ใบกำกับภาษี
                            <>
                                <Col lg={16} md={24} sm={24} xs={24}>
                                    <SearchServicePlans mode={mode} form={form} callback={callbackSearchServicePlans} />
                                </Col>
                                <Col lg={8} md={24} sm={24} xs={24} />
                            </>
                            : null //type == 2
                    }

                    {
                        type == 3 ? //ใบกํากับภาษีเต็มรูปแบบ
                            <>
                                <Col lg={16} md={24} sm={24} xs={24}>
                                    <ServicePlansAndInvoice mode={mode} form={form} callback={callbackSearchServicePlans} />
                                </Col>
                                <Col lg={8} md={24} sm={24} xs={24} />
                            </>
                            : null //type == 3
                    }

                    {
                        checkCreateForm() ?
                            <>
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "customer_type"]}
                                        label="ประเภทลูกค้า"
                                        rules={[{ required: false, message: "กรุณาเลือกข้อมูล !!" }]}
                                    >
                                        <Select style={{ width: "100%" }} onChange={onChangeCustomerType} disabled={docTypeId === "67c45df3-4f84-45a8-8efc-de22fef31978" ? false : true}>
                                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                            <Select.Option value="business">ธุรกิจ</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>



                                {checkCreateFormCustomerType() === "person" ?
                                    <>

                                        {/* <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "id_card_number"]}
                                                label={GetIntlMessages("id-card")}
                                            >
                                                <Input minLength={10} maxLength={13} />
                                            </Form.Item>
                                        </Col> */}

                                        {/* <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "first_name"]}
                                                label={GetIntlMessages("name")}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "last_name"]}
                                                label={GetIntlMessages("surname")}
                                                rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col> */}

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                // name={["create", "last_name"]}
                                                label={GetIntlMessages("ชื่อลูกค้า")}
                                                rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>


                                    </>
                                    :
                                    <>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "tax_id"]}
                                                label={GetIntlMessages("tax-id")}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "bus_type_id"]}
                                                label={GetIntlMessages("business-type")} >
                                                <Select
                                                    placeholder="เลือกข้อมูล"
                                                    optionFilterProp="children"
                                                    disabled
                                                >
                                                    {businessTypeList.map((e, index) => (
                                                        <Select.Option value={e.id} key={index}>
                                                            {e.business_type_name["th"]}
                                                        </Select.Option>
                                                    ))}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name={["create", "customer_name"]}
                                                label={GetIntlMessages("business-name")}
                                                rules={[{ required: false, message: GetIntlMessages("please-fill-out") }]}
                                            >
                                                <Input disabled />
                                            </Form.Item>
                                        </Col>

                                    </>
                                }

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "mobile_no"]}
                                        label="หมายเลขโทรศัพท์"
                                        rules={[{ required: false, message: "กรุณาเลือกข้อมูล !!" }]}
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "registration"]}
                                        rules={[{ required: false, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                                        label={GetIntlMessages(`registration`)}
                                    >
                                        <Input disabled />
                                    </Form.Item>
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <FormProvinceDistrictSubdistrict name={{ province: "province_name" }} form={form} disabled hideDistrict={true} hideSubdistrict={true} hideZipCode={true} validatename={{ Province: false, District: false, Subdistrict: false }} provinceValue="name" />
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "vehicle_brand_id"]}
                                        label={GetIntlMessages(`brand`)}
                                        rules={[{ required: false, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                                    >
                                        <Select
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            // disabled={checkDisable("vehicle_brand_id")}
                                            disabled
                                            style={{ width: "100%" }} onChange={onChangeVehicleBrand}>
                                            {vehicleBrand.map((e) => <Select.Option key={e.id} value={e.id}>{e.brand_name[locale.locale]}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "vehicle_model_id"]}
                                        label={GetIntlMessages(`model`)}
                                        rules={[{ required: false, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                                    >
                                        <Select
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            disabled={checkDisable("vehicle_model_id")}
                                            style={{ width: "100%" }} onChange={onChangeVehicleModelType}>
                                            {vehicleModelType.map((e) => <Select.Option key={e.id} value={e.id}>{e.model_name[locale.locale]}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "vehicle_type_id"]}
                                        label={GetIntlMessages(`vehicle-type`)}
                                    // rules={[{ required: true, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                                    >
                                        <Select
                                            showSearch
                                            allowClear
                                            filterOption={(input, option) =>
                                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                            }
                                            disabled
                                            style={{ width: "100%" }} onChange={onChangeVehicleType}>
                                            {vehicleType.map((e) => <Select.Option key={e.id} value={e.id}>{e.type_name[locale.locale]}</Select.Option>)}
                                        </Select>
                                    </Form.Item>
                                </Col>

                                

                                

                                {/* <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "serial_number"]}
                                        label={GetIntlMessages(`เลขเครื่อง`)}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col> */}

                                {/* <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "chassis_number"]}
                                        label={GetIntlMessages(`เลขตัวถัง`)}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col> */}

                                {/* <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "cc_engine_size"]}
                                        label={GetIntlMessages(`ขนาดเครื่องยนต์ CC`)}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col> */}

                                {/* <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name={["create", "color"]}
                                        label={GetIntlMessages(`color-car`)}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col> */}
                            </>
                            :
                            <>
                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name="customer_type"
                                        label="ประเภทลูกค้า"
                                        rules={[{ required: false, message: "กรุณาเลือกข้อมูล !!" }]}
                                    >
                                        <Select style={{ width: "100%" }} onChange={onChangeCustomerType}
                                        placeholder="เลือกข้อมูล"
                                            // disabled={mode == "view" || mode == "edit"}
                                            disabled={disabledFieldUponPage() || mode == "view" || mode == "edit"}
                                        >
                                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                            <Select.Option value="business">ธุรกิจ</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>

                                <Col lg={8} md={12} sm={12} xs={24}>
                                    <Form.Item
                                        name="customer_id"
                                        label="ชื่อลูกค้า"
                                        rules={[{ required: false, message: "กรุณาเลือกข้อมูล !!" }]}
                                    >
                                        <Select style={{ width: "100%" }}
                                            showSearch
                                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                            open={open}
                                            onDropdownVisibleChange={(visible) => controlOpen(visible)}
                                            // disabled={disabledCustomer || mode == "view"}
                                            disabled={disabledFieldUponPage() || mode == "view" || mode == "edit" || type == 2 || type == 3}
                                            onChange={onChangeCustomer}
                                            onSearch={(value) => debounceOnSearch(value, "onSearch")}
                                            dropdownRender={menu =>
                                                checkValueCustomerType() ? (
                                                    <>
                                                        {menu}
                                                        <Divider style={{ margin: '8px 0' }} />
                                                        <Space align="center" style={{ padding: '0 8px 4px' }}>
                                                            {
                                                                checkValueCustomerType() === "business" ?
                                                                    <ModalBusinessCustomers controlOpen={controlOpen} textButton={GetIntlMessages(`เพิ่มข้อมูล`)} icon={<PlusOutlined />} callback={callbackModalCustomers} /> :
                                                                    <ModalPersonalCustomers textButton={GetIntlMessages(`เพิ่มข้อมูล`)} icon={<PlusOutlined />} callback={callbackModalCustomers} />
                                                            }
                                                        </Space>
                                                    </>
                                                ) : null}
                                        >
                                            {isArray(customerList) && customerList.length > 0 ? customerList.map((e) => <Select.Option value={e?.id}>{e.customer_name[locale.locale]}</Select.Option>) : []}
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
                                            disabled={disabledFieldUponPage() || mode == "view" || mode == "edit" || type == 2 || type == 3}
                                            options={customerPhoneList}
                                            style={{ width: "100%" }}
                                            value="mobile_no"
                                            filterOption={(inputValue, option) => {
                                                if (isPlainObject(option)) {
                                                    if (isFunction(option.value)) {
                                                        return inputValue ? option.value.search(inputValue) != -1 : null
                                                    }
                                                    // if (isPlainObject(option.value)) {
                                                    //     if (isFunction(option.value.search)) return option.value.search(inputValue) != -1
                                                    // }
                                                }
                                            }}
                                        />

                                    </Form.Item>
                                </Col>
                                {getdoc_type_idform() ?
                                    <>
                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="vehicles_customers_id"
                                                label="ทะเบียนรถ"
                                                rules={[{ required: false, message: "กรุณาเลือกข้อมูล !!" }]}
                                            >
                                                <Select
                                                    // disabled={mode != "add" || type == 2 || type == 3}
                                                    disabled={disabledFieldUponPage() || mode == "view" || mode == "edit" || type == 2 || type == 3}
                                                    showSearch
                                                    filterOption={(input, option) =>
                                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                                    }
                                                    style={{ width: "100%" }}
                                                    onChange={onChangeVehicles}>
                                                    {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `details.registration`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="vehicles_customers_id"
                                                label="จังหวัด"
                                            >
                                                <Select style={{ width: "100%" }} showArrow={false} disabled>
                                                    {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `details.province_name`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="vehicles_customers_id"
                                                label="ยี่ห้อ"
                                            >
                                                <Select style={{ width: "100%" }} showArrow={false} disabled>
                                                    {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `VehicleBrand.brand_name.${locale.locale}`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="vehicles_customers_id"
                                                label="รุ่น"
                                            >
                                                <Select style={{ width: "100%" }} showArrow={false} disabled>
                                                    {shopVehicleList.map(e => <Select.Option value={e.id}>{get(e, `VehicleModelType.model_name.${locale.locale}`, "-")}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>

                                        <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="mileage_old"
                                                label="เลขไมค์ครั้งก่อน"
                                            >

                                                <Input disabled />
                                            </Form.Item>
                                        </Col>

                                        {/* <Col lg={8} md={12} sm={12} xs={24}>
                                            <Form.Item
                                                name="avg_registration_day"
                                                label="ไมค์เฉลี่ย/วัน"
                                            >
                                                <Input disabled type={"number"} />
                                            </Form.Item>
                                        </Col> */}
                                    </> : null}
                            </>
                    }

                    {getdoc_type_idform() ?
                        <Col lg={8} md={12} sm={12} xs={24}>
                            <Form.Item
                                name="mileage"
                                label="เลขไมล์ครั้งนี้"
                                onChange={(e) => mileageCheck(e)}
                                rules={[
                                    { required: !(mode != "add" || type == 2 || type == 3), message: "กรุณากรอกข้อมูล !!" },
                                    // { validator: mileageNowCheck, message: "กรุณากรอกข้อมูลให้ถูกต้อง !!" }
                                ]}
                            >
                                <Input disabled={mode == "view" || type == 2 || type == 3 || checkCustomer()} type={"number"} />
                            </Form.Item>
                        </Col>
                        : null}

                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="user_id"
                            label="ผู้ทำเอกสาร"
                            rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                        >
                            <Select
                                disabled={mode != "add" || type == 2 || type == 3}
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

                    {docTypeId === "7ef3840f-3d7f-43de-89ea-dce215703c16" ?
                        <Col lg={8} md={12} sm={12} xs={24}>
                            <Form.Item
                                name="repair_man"
                                label="ช่างซ่อม"
                            >
                                <Select
                                    disabled={mode === "view" || type == 2 || type == 3}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    showArrow={false}
                                    style={{ width: "100%" }}
                                    allowClear
                                    mode={"multiple"}
                                    placeholder="เลือกข้อมูล"
                                >
                                    {repairManList.map((e) => <Select.Option key={`repair-Man-${e.id}`} value={e.id}>{e.name[locale.locale]}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        : null}
                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="doc_type_id"
                            label="ประเภทเอกสาร"
                        >
                            <Select style={{ width: "100%" }} disabled>
                                {documentTypesList.map((e) => <Select.Option key={`doc-type-${e.id}`} value={e.id}>{e.type_name[locale.locale] ?? "-"}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="tax_id"
                            label="ประเภทภาษี"
                        >
                            <Select style={{ width: "100%" }}
                                disabled={mode == "view" || type == 2 || type == 3}
                                showSearch
                                filterOption={(input, option) =>
                                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                                // dropdownRender={menu => (
                                //     <>
                                //         {menu}
                                //         <Divider style={{ margin: '8px 0' }} />
                                //         <Space align="center" style={{ padding: '0 8px 4px' }}>
                                //             <ModalTaxType textButton={GetIntlMessages(`เพิ่มข้อมูล`)} icon={<PlusOutlined />} callback={callbackModalTaxType} />
                                //         </Space>
                                //     </>
                                // )}
                                onChange={calculateResult}
                            >
                                {taxTypesList.map((e) => <Select.Option key={`tax-${e.id}`} value={e.id}>{e.type_name[locale.locale] ?? "-"}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="tax_id"
                            label="อัตราภาษี (%)"
                        >
                            <Select style={{ width: "100%" }} onChange={calculateResult} disabled>
                                {taxTypesList.map((e) => <Select.Option key={`tax-${e.id}`} value={e.id}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="status"
                            label="สถานะ"
                        >
                            <Select style={{ width: "100%" }} disabled>
                                <Select.Option value={"0"}>ยกเลิก</Select.Option>
                                <Select.Option value={"1"}>เปิดบิล</Select.Option> {/* อยู่ระหว่างดำเนินการ */}
                                <Select.Option value={"2"}>รอชำระ</Select.Option> {/* ดำเนินการเรียบร้อย */}
                                <Select.Option value={"3"}>ออกบิลอย่างย่อ</Select.Option>
                                <Select.Option value={"4"}>ออกบิลเต็มรูป</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col lg={8} md={12} sm={12} xs={24}>
                        <Form.Item
                            name="doc_date"
                            label="วันที่เอกสาร"
                        >
                            <DatePicker style={{ width: "100%" }} format={"YYYY-MM-DD"} disabled={mode == "view" || type == 2 || type == 3 || checkCustomer()} />
                        </Form.Item>
                    </Col>

                </Row>
            </Form >
        </>
    )
}

export default FormServicePlans