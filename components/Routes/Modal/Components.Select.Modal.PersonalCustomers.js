import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isArray, isFunction } from 'lodash';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import FormProvinceDistrictSubdistrict from '../../shares/FormProvinceDistrictSubdistrict';

const ComponentsSelectModalPersonalCustomers = ({ textButton, icon, callback ,controlOpen}) => {

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        if(isFunction(controlOpen)) controlOpen(!isModalVisible) 
    }, [isModalVisible])

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)

            value.customer_name = {
                first_name: value.first_name,
                last_name: value.last_name,
            }

            const _model = {
                id_card_number: value.id_card_number,
                name_title_id: value.name_title_id ?? null,
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

            const { data } = await API.post(`/shopPersonalCustomers/add`, _model)

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
    const [nameTitleList, setNameTitleList] = useState([])

    const getMasterData = async () => {
        try {
            /* ประเภทธุรกิจ */
            const nameTitle = await getNameTitleListAll()
            setNameTitleList(nameTitle)
        } catch (error) {

        }
    }

    /* คำนำหน้า */
    const getNameTitleListAll = async () => {
        const { data } = await API.get(`/master/nameTitle?sort=code_id&order=asc`);
        // console.log('data.data :>> ', data.data);
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
                title={`เพิ่มลูกค้าบุคลธรรมดา`}
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
                        field: ["first_name", "last_name", "address"],
                    }} onChange={(value) => setFormLocale(value)} />

                    <Form.Item
                        name="id_card_number"
                        label={GetIntlMessages("id-card")}
                        rules={
                            [
                                {
                                    min: 13,
                                    message: GetIntlMessages("enter-your-id-card-13-digits"),
                                },
                                {
                                    pattern: new RegExp("^[0-9]*$"),
                                    message: GetIntlMessages("enter-your-id-card"),
                                }
                            ]
                        }
                    >
                        <Input minLength={10} maxLength={13} />
                    </Form.Item>

                    <Form.Item name="name_title_id" label={GetIntlMessages("prefix")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                        >
                            {isArray(nameTitleList) ? nameTitleList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.name_title[locale.locale]}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item>


                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("name")} name="first_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("surname")} name="last_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

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
                                                rules={
                                                    [{
                                                        min: 9,
                                                        message: "อย่างน้อย 9 ตัว"
                                                    },
                                                    {
                                                        pattern: /^[0-9]+$/,
                                                        message: GetIntlMessages("ตัวเลขเท่านั้น")
                                                    }]}

                                            >
                                                <Input style={{ width: fields.length > 1 ? '85%' : '100%' }} maxLength={10} />
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
                                                rules={
                                                    [{
                                                        min: 9,
                                                        message: "อย่างน้อย 9 ตัว"
                                                    },
                                                    {
                                                        pattern: /^[0-9]+$/,
                                                        message: GetIntlMessages("ตัวเลขเท่านั้น")
                                                    }]}

                                            >
                                                <Input style={{ width: fields.length > 1 ? '85%' : '100%' }} maxLength={10} />

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
                                message: "กรุณาใช้ Email ให้ถูกต้อง",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <FormInputLanguage isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" />

                    <FormProvinceDistrictSubdistrict form={form} />

                </Form>
            </Modal>
        </>
    )
}

export default ComponentsSelectModalPersonalCustomers