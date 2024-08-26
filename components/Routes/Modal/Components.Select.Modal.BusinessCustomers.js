import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isFunction } from 'lodash';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import FormProvinceDistrictSubdistrict from '../../shares/FormProvinceDistrictSubdistrict';
import NewFormProvinceDistrictSubdistrict from '../../shares/NewFormProvinceDistrictSubdistrict';
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';


const ComponentsSelectModalBusinessCustomers = ({ textButton, icon, callback,controlOpen }) => {
    const masktel_no = createDefaultMaskGenerator('99 999 9999 9999');
    const maskmobile_no = createDefaultMaskGenerator('999 999 9999');

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [trickerCancel, setTrickerCancel] = useState(Date.now())
    

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
        setTrickerCancel(Date.now())
    }

    useEffect(() => {
        if(isFunction(controlOpen)) controlOpen(!isModalVisible) 
    }, [isModalVisible])
    

    const onFinish = async (value) => {
        try {
            const _model = {
                tax_id: value.tax_id,
                bus_type_id: value.bus_type_id ?? null,
                customer_name: value.customer_name,
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                address: value.address,
                subdistrict_id: value.subdistrict_id ?? null,
                district_id: value.district_id ?? null,
                province_id: value.province_id ?? null,
                other_details: {
                    contact_name: value.contact_name ?? null
                },
            }

            if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            else value.mobile_no = []

            if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            else value.tel_no = []
            // console.log('_model', _model)
            const { data } = await API.post(`/shopBusinessCustomers/add`, _model)

            if (data.status === "success") {
                if (isFunction(callback)) callback(data.data)
                handleCancel()
            } else {
                console.log('error', data.data)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const onFinishFailed = (error) => {
        console.log('error', error)
    }

    useEffect(() => {
        getMasterData()
    }, [])

    /* master */
    const [businessTypeList, setBusinessTypeList] = useState([])
    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const businessTypeDataList = await getBusinessTypeDataListAll()
            setBusinessTypeList(businessTypeDataList)
        } catch (error) {

        }
    }

    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    return (
        <>
            <Button style={{ whiteSpace: 'nowrap' }} onClick={() => setIsModalVisible(true)}>
                {icon}  {textButton}
            </Button>

            <Modal
                form={form}
                maskClosable={false}
                title={`เพิ่มลูกค้าธุรกิจ`}
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
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 18 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >

                    <FormSelectLanguage config={{
                        form,
                        field: ["customer_name", "address"],
                    }} onChange={(value) => setFormLocale(value)} />

                    <Form.Item
                        name="tax_id"
                        label={GetIntlMessages("tax-id")}
                        rules={[{ pattern: /^[0-9]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") ,required : true, message : GetIntlMessages("please-fill-out")}]}
                    >
                        <Input maxLength={13} showCount />
                        {/* <InputNumber maxLength={13} showCount style={{width : "100%" ,borderRadius : "10px",borderColor: mainColor}}/> */}
                    </Form.Item>

                    <Form.Item name="bus_type_id" label={GetIntlMessages("business-type")} rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]}>
                        <Select
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                        >
                            {businessTypeList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.business_type_name["th"]}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("business-name")} name="customer_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <Form.Item
                        label={GetIntlMessages("tel-no")}
                        name="tel_no"
                    >
                        <Form.List name="tel_no">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            required={false}
                                            key={field.key}
                                        >

                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "tel_no"]}
                                                fieldKey={[field.fieldKey, "tel_no"]}
                                                noStyle
                                                rules={[{ min: 9, message: "อย่างน้อย 9 ตัว" } ,{ pattern: /^[0-9]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") } ]}
                                            >
                                                <MaskedInput
                                                        className='ant-input'
                                                        style={{ width: fields.length > 1 ? '85%' : '100%' }}
                                                        maskGenerator={masktel_no}
                                                    />

                                                {/* <Input minLength={9} maxLength={10} style={{ width: fields.length > 1 ? '85%' : '100%' }} /> */}
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>

                                        <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                        >
                                            {GetIntlMessages("tel-no")}
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        label={GetIntlMessages("mobile-no")}
                        name="mobile_no"
                    >
                        <Form.List name="mobile_no" >
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map((field, index) => (
                                        <Form.Item
                                            required={false}
                                            key={field.key}
                                        >
                                            <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "mobile_no"]}
                                                fieldKey={[field.fieldKey, "mobile_no"]}
                                                noStyle
                                                rules={[{ pattern: /^[0-9]+$/, message: GetIntlMessages("ตัวเลขเท่านั้น") }]}
                                            >
                                                 <MaskedInput
                                                        className='ant-input'
                                                        style={{ width: fields.length > 1 ? '85%' : '100%' }}
                                                        maskGenerator={maskmobile_no}
                                                    />
                                                {/* <Input minLength={10} maxLength={10} style={{ width: fields.length > 1 ? '85%' : '100%' }} /> */}
                                                {/* <Input minLength={10} maxLength={10} showCount  style={{ width: fields.length > 1 ? '85%' : '100%' }} /> */}
                                            </Form.Item>
                                            {fields.length > 1 ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        {
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                {GetIntlMessages("mobile-no")}
                                            </Button>
                                        }
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        name="e_mail"
                        label={GetIntlMessages("email")}
                        rules={[
                            {
                                type: "email",
                                message: "กรุณาระบุ Email ให้ถูกต้อง",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <FormInputLanguage isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" />

                    <NewFormProvinceDistrictSubdistrict form={form} onChange={trickerCancel}/>
                    {/* <FormProvinceDistrictSubdistrict form={form} /> */}

                    <Form.Item
                        name="contact_name"
                        label={GetIntlMessages("contact-name")}
                    >
                        <Input />
                    </Form.Item>


                </Form>
            </Modal>
        </>
    )
}

export default ComponentsSelectModalBusinessCustomers