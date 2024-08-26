import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Select, Row, Col, DatePicker, Divider, Space, message } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import API from '../../../util/Api'
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import NewFormProvinceDistrictSubdistrict from '../../shares/NewFormProvinceDistrictSubdistrict';
import FormProvinceDistrictSubdistrict from '../../shares/FormProvinceDistrictSubdistrict';
import { isFunction, isArray } from 'lodash';
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import SortingData from '../../shares/SortingData'
import ModalBusinessCustomers from '../Modal/Components.Select.Modal.BusinessCustomers'
import ModalPersonalCustomers from '../Modal/Components.Select.Modal.PersonalCustomers'
import moment from 'moment'

export const validateNumberandEn = "^[a-zA-Z0-9_.-]*$";
export const validateNumber = "^[0-9]*$";
export const dateFormat = "DD/MM/YYYY";


const ComponentsAddModalBothCustomersAndCar = ({ icon, textButton, docTypeId, setLoading ,callback }) => {
    const [form] = Form.useForm();
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { businessType, vehicleType, vehicleBrand, vehicleModelType, vehicleColors } = useSelector(({ master }) => master);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [open, setOpen] = useState(false);
    const [optFields, setFields] = useState({
        required: false,
        disabled: false
    });

    const [customerList, setCustomerList] = useState([]) //รายชื่อลูกค้า
    const [customerListAll, setCustomerListAll] = useState([]) //รายชื่อลูกค้า
    const [vehicleModelTypeNewList, setVehicleModelTypeNewList] = useState([]) //รายการรุ่นรถ

    useEffect(() => {
        getMasterData()
        if (isModalVisible === true) form.setFieldsValue({ customer_type: "person" }), onChangeCustomerType("person")
        const setValueFields ={
            disabled: false,
            required: true,
        }
        form.setFieldsValue({service_date_first: moment(Date.Now)})
        
        setFields(()=>setValueFields);
        // if (mode == "view") {
        //     setFields({
        //       disabled: true,
        //       required: false,
        //     });
        //   } else {
        //     setFields({
        //       disabled: false,
        //       required: true,
        //     });
        //   }
    }, [isModalVisible])

    /* master */
    const getMasterData = async () => {
        try {
            const [value1, value2] = await Promise.all([getCustomerPerson(), getCustomerBusiness()])
            // if (isArray(value1)) setVehicleType(SortingData(value1, `type_name.${locale.locale}`))
            // if (isArray(value2)) setVehicleBrand(value2)
            const { customer_type } = form?.getFieldValue()
            if (isArray(value1.data) && isArray(value2.data)) {
                const new_data = SortingData(sumArrayPersonAndBusiness(value1.data, value2.data), `customer_name.${locale.locale}`)
                // console.log('new_data :>> ', new_data);
                setCustomerList((prevValue) => (isArray(new_data)) ? new_data.filter(where => where?.customer_type === customer_type ?? "person") : []);
                setCustomerListAll((prevValue) => new_data);
            }

        } catch (error) {
            console.log('error', error)
        }
    }

    const sumArrayPersonAndBusiness = (personList, businessList) => {
        const new_person_list = personList.map(e => {

            const newPersonList = { ...e, customer_name: {} }
            locale.list_json.forEach(x => {
                newPersonList.customer_name[x] = e.customer_name ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"} -> ${e.master_customer_code_id}` : "";
                newPersonList.customer_type = "person"
                return newPersonList
            })
            return newPersonList
        })
        const new_business_list = businessList.map(e => {
            const newBusinessList = { ...e, customer_name: {} }
            locale.list_json.forEach(x => {
                newBusinessList.customer_name[x] = !!e.customer_name[x] ? `${!!e.customer_name[x] ?e.customer_name[x] : "ไม่มีชื่อ"} -> ${e.master_customer_code_id}` : "";
                newBusinessList.customer_type = "business"
                return newBusinessList
            })
            return newBusinessList
        })
        const arr = [...new_person_list, ...new_business_list]
        return arr
    }

    const onChangeCustomerType = async (value) => {
        try {
            const filter = customerListAll.filter(where => where?.customer_type === value);
            if (isArray(filter)) {
                form.setFieldsValue({
                    customer_id: null
                })
                setCustomerList((prevValue) => filter)
            }
        } catch (error) {

        }
    }
    const onChangeVehicleType = async (value) => {
        try {
            form.setFieldsValue({ vehicle_model_id: null })
            const { vehicle_brand_id } = form.getFieldValue()
            const modelList = await getVehicleModelTypeBybrandid(vehicle_brand_id, value)
            if (value) setVehicleModelTypeNewList(() => modelList ?? [])

        } catch (error) {

        }
    }

    const onChangeVehicleBrand = async (value) => {
        try {
            form.setFieldsValue({ vehicle_model_id: null })
            const { vehicle_type_id } = form.getFieldValue()
            const modelList = await getVehicleModelTypeBybrandid(value, vehicle_type_id)
            if (value) setVehicleModelTypeNewList(() => modelList ?? [])
        } catch (error) {

        }
    }

    const checkValueCustomerType = () => {
        const { customer_type } = form.getFieldValue();
        return customer_type;
    }

    const callbackModalCustomers = async (item) => {
        try {
            await getMasterData()

            // const { customer_type } = form.getFieldValue()

            form.setFieldsValue({
                customer_id: item?.id
            })
        } catch (error) {

        }
    }

    /* get Master shopPersonalCustomers */
    const getCustomerPerson = async () => {
        const { data } = await API.get(`/shopPersonalCustomers/all?limit=99999&page=1&dropdown=true`);
        return data.status == "success" ? data.data : []
    }

    /* get Master shopBusinessCustomers */
    const getCustomerBusiness = async () => {
        const { data } = await API.get(`/shopBusinessCustomers/all?limit=99999&page=1&dropdown=true`);
        return data.status == "success" ? data.data : []
    }

    /* get Master getVehicleModelTypeBybrandid (รุ่น ยานพาหนะ) */
    const getVehicleModelTypeBybrandid = async (vehicles_brand_id = "", vehicles_type_id = "") => {
        if (vehicles_brand_id || vehicles_type_id) {
            const { data } = await API.get(`/master/vehicleModelType/all?limit=99999&page=1&sort=model_name.th&order=asc&status=active${vehicles_brand_id ? `&vehicles_brand_id=${vehicles_brand_id}` : ""}${vehicles_type_id ? `&vehicles_type_id=${vehicles_type_id}` : ""}`);
            return data.status == "success" ? data.data.data : []
        }
    }

    const handleOk = () => {
        form.submit()
    }
    const handleCancel = () => {
        setVehicleModelTypeNewList((prevValue) => [])
        setIsModalVisible((prevValue) => false)
        form.resetFields()
    }
    const onFinish = async (value) => {
        try {
            // console.log('value :>> ', value);
            if (isFunction(setLoading)) setLoading(() => true)
            const _model = {
                details: {
                    color: value.color ?? "",
                    province_name: value.province_name ?? "",
                    registration: value.registration ?? "",
                    remark: value.remark ?? "",
                    serial_number: value.serial_number ?? "",
                    chassis_number: value.chassis_number ?? "",
                    cc_engine_size: value.cc_engine_size ?? "",
                    mileage_first: value.mileage_first ?? "",
                    mileage: value.mileage ?? "",
                    service_date_first: value.service_date_first ?? "",
                    avg_registration_day: value.avg_registration_day ?? "",
                    service_date_last: value.service_date_last ?? ""

                },
                vehicle_type_id: value.vehicle_type_id,
                vehicle_brand_id: value.vehicle_brand_id,
                vehicle_model_id: value.vehicle_model_id,
            }

            if (value.customer_type === "person") _model.per_customer_id = value.customer_id;
            else if (value.customer_type === "business") _model.bus_customer_id = value.customer_id;

            // console.log('_model', _model)
            let res
            _model.master_customer_code_id = ""
            res = await API.post(`/shopVehicleCustomer/add`, _model)

           
            // if (configModal.mode === "add") {
            //     _model.master_customer_code_id = ""
            //     res = await API.post(`/shopVehicleCustomer/add`, _model)
            // } else if (configModal.mode === "edit") {
            //     _model.status = checkedIsuse ? "active" : "block"
            //     res = await API.put(`/shopVehicleCustomer/put/${idEdit}`, _model)
            // }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(() => false)
                if(isFunction(callback)) callback(res.data.data)
                // setConfigModal({ ...configModal, mode: "add" })
                form.resetFields()
                // getDataSearch({
                //     page: configTable.page,
                //     search: modelSearch.search,
                // })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }
            if (isFunction(setLoading)) setLoading(() => false)
        } catch (error) {
            if (isFunction(setLoading)) setLoading(() => false)
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = () => {
        message.warning(GetIntlMessages("warning"))
    }
    return (

        <>
            <Button style={{ whiteSpace: 'nowrap' }} onClick={() => setIsModalVisible((prevValue) => true)}>
                {icon ?? <PlusOutlined />}  {textButton ?? "เพิ่ม"}
            </Button>

            <Modal
                form={form}
                maskClosable={false}
                title={`เพิ่มข้อมูลทะเบียนรถ/ลูกค้า`}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"60vw"}
                bodyStyle={{
                    maxHeight: "60vh",
                    overflowX: "auto"
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        name="customer_type"
                        label={GetIntlMessages(`customer-type`)}

                        rules={[{
                            required: optFields.required,
                            message: GetIntlMessages(`fill-out-the-information-completely`)
                        }]}
                    >
                        <Select disabled={optFields.disabled} style={{ width: "100%" }} onChange={onChangeCustomerType}>
                            <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                            <Select.Option value="business">ธุรกิจ</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="customer_id"
                        label={GetIntlMessages(`customer`)}
                        rules={[{
                            required: optFields.required,
                            message: GetIntlMessages(`fill-out-the-information-completely`)
                        }]}
                    >
                        <Select disabled={optFields.disabled} style={{ width: "100%" }}
                            showSearch
                            open={open}
                            optionFilterProp="children"
                            onDropdownVisibleChange={(visible) => setOpen(visible)}
                            // onChange={onChangeCustomerId}
                            placeholder="เลือกข้อมูลหรือสร้างข้อมูลใหม่"
                            dropdownRender={(menu) =>

                                <>
                                    {menu}
                                    {checkValueCustomerType() ? (
                                        <>
                                            <Divider style={{ margin: '8px 0' }} />
                                            {/* <Space align="center" style={{ padding: '0 8px 4px' }}> */}
                                            <Space align="center" style={{ padding: '0 8px 4px' }} onClick={() => setOpen(false)}>
                                                {checkValueCustomerType() === "business" ?
                                                    <ModalBusinessCustomers textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าธุรกิจ`)} icon={<PlusOutlined />} callback={callbackModalCustomers} /> :
                                                    <ModalPersonalCustomers textButton={GetIntlMessages(`เพิ่มข้อมูลลูกค้าบุคคลธรรมดา`)} icon={<PlusOutlined />} callback={callbackModalCustomers} />}
                                            </Space>
                                        </>
                                    ) : null}

                                </>
                            }
                        >
                            {customerList.map((e,index) => <Select.Option key={e.id} value={e.id}>{e?.customer_name[locale.locale] ?? `ไม่มีชื่อ ${index + 1}`}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicle_type_id"
                        label={GetIntlMessages(`vehicle-type`)}
                        rules={[{ required: optFields.required, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                    >
                        <Select
                            disabled={optFields.disabled}
                            showSearch
                            optionFilterProp="children"
                            onChange={onChangeVehicleType}
                            style={{ width: "100%" }}
                            placeholder="เลือกข้อมูล"
                            >
                            {vehicleType.map((e) => <Select.Option key={e.id} value={e.id}>{e.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicle_brand_id"
                        label={GetIntlMessages(`brand`)}
                        rules={[{ required: optFields.required, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                    >
                        <Select
                            disabled={optFields.disabled}
                            showSearch
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                            onChange={onChangeVehicleBrand}
                            placeholder="เลือกข้อมูล"
                        >
                            {vehicleBrand.map((e) => <Select.Option key={e.id} value={e.id}>{e.brand_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicle_model_id"
                        label={GetIntlMessages(`model`)}
                        rules={[{ required: optFields.required, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                    >
                        <Select
                            disabled={optFields.disabled}
                            showSearch
                            // filterOption={(input, option) =>
                            //     option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            // }
                            optionFilterProp="children"
                            style={{ width: "100%" }}
                            placeholder="เลือกข้อมูล"
                            >

                            {vehicleModelTypeNewList.map((e) => <Select.Option key={e?.id} value={e?.id}>{e?.model_name[locale.locale]}</Select.Option>)}
                            {/* {vehicleModelType.map((e) => <Select.Option key={e.id} value={e.id}>{e.model_name[locale.locale]}</Select.Option>)} */}
                        </Select>
                    </Form.Item>
                    <FormProvinceDistrictSubdistrict
                        name={{ province: "province_name" }}
                        form={form}
                        disabled={optFields.disabled}
                        hideDistrict={true}
                        hideSubdistrict={true}
                        hideZipCode={true}
                        provinceValue="name"
                        validatename={{ Province: optFields.required }}
                    />
                    <Form.Item
                        name="registration"
                        rules={[{ required: optFields.required, message: GetIntlMessages(`fill-out-the-information-completely`) }]}
                        label={GetIntlMessages(`registration`)}
                    >
                        <Input type={'text'} maxLength={200} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="serial_number"
                        label={GetIntlMessages(`เลขเครื่องยนต์`)}
                        rules={[{
                            pattern: validateNumberandEn,
                            message: GetIntlMessages(`enter-your-engine-number`)
                        }]}
                    >
                        <Input type={'text'} maxLength={17} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="chassis_number"
                        label={GetIntlMessages(`เลขตัวถัง`)}
                        rules={[{
                            pattern: validateNumberandEn,
                            message: GetIntlMessages(`enter-your-engine-size`)
                        }]}
                    >
                        <Input type={'text'} maxLength={200} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="cc_engine_size"
                        label={GetIntlMessages(`ขนาดเครื่องยนต์ CC`)}
                        rules={[{
                            pattern: validateNumber,
                            message: GetIntlMessages(`enter-your-engine-size`)
                        }]}
                    >
                        <Input type={'text'} maxLength={200} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="color"
                        label={GetIntlMessages(`color-car`)}
                        rules={[{
                            // required: optFields.required,
                            message: GetIntlMessages(`fill-out-the-information-completely`)
                        }]}
                    >
                        <Select
                            disabled={optFields.disabled}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            style={{ width: "100%" }}
                            placeholder="เลือกข้อมูล"
                            >
                                

                            {vehicleColors.map((e) => (
                                <Select.Option key={e.id} value={e.id}>
                                    {e.vehicle_color_name[locale.locale]}
                                </Select.Option>
                            ))}
                            {/* {vehicleModelType.map((e) => <Select.Option key={e.id} value={e.id}>{e.model_name[locale.locale]}</Select.Option>)} */}
                        </Select>
                        {/* <Input type={'text'} maxLength={200} disabled={optFields.disabled} /> */}
                    </Form.Item>

                    <Form.Item
                        name="mileage_first"
                        label={GetIntlMessages(`เลขไมค์ครั้งแรก`)}
                        rules={[{
                            // required: optFields.required,
                            pattern: validateNumber,
                            message: GetIntlMessages(`only-number`)
                        }]}
                    >
                        <Input type={'text'} maxLength={8} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="mileage"
                        label={GetIntlMessages(`เลขไมค์ครั้งล่าสุด`)}
                        rules={[{
                            pattern: validateNumber,
                            message: GetIntlMessages(`enter-your-last-mic-number`)
                        }]}
                    >
                        <Input type={'text'} maxLength={8} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="service_date_first"
                        label={GetIntlMessages(`วันที่เข้ามาใช้บริการครั้งแรก`)}
                        rules={[{
                            required: optFields.required,
                            message: GetIntlMessages(`fill-out-the-information-completely`)
                        }]}
                    >
                        <DatePicker style={{ width: "100%" }} format={dateFormat} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="service_date_last"
                        label={GetIntlMessages(`วันที่เข้ามาใช้บริการล่าสุด`)}
                    >
                        <DatePicker style={{ width: "100%" }} format={dateFormat} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="avg_registration_day"
                        label={GetIntlMessages(`average-mic-day`)}
                        rules={[{
                            pattern: validateNumber,
                            message: GetIntlMessages(`enter-your-average-mic-day`)
                        }]}
                    >
                        <Input type={'text'} maxLength={200} disabled={optFields.disabled} />
                    </Form.Item>

                    <Form.Item
                        name="remark"
                        label={GetIntlMessages(`remark`)}
                    >
                        <Input.TextArea rows={5} maxLength={200} disabled={optFields.disabled} />
                    </Form.Item>


                    {/* {configModal.mode !== "add" ?
                        <Form.Item name="isuse" label={GetIntlMessages("status")} >
                            <Switch disabled={configModal.mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                        </Form.Item> : null
                    } */}
                </Form>
            </Modal>
        </>
    )
}

export default ComponentsAddModalBothCustomersAndCar