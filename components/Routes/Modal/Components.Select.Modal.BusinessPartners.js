import { Button, Form, Modal, Input, Select, message } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react'
import FormProvinceDistrictSubdistrict from '../../shares/FormProvinceDistrictSubdistrict';
import { FormInputLanguage, FormSelectLanguage } from '../../shares/FormLanguage';
import GetIntlMessages from '../../../util/GetIntlMessages';
import API from '../../../util/Api'
import { useSelector } from 'react-redux';
import { isFunction } from 'lodash';

const ComponentsSelectModalBusinessPartners = ({ mode, form, callBackDataBusinessPartner }) => {

    useEffect(() => {
        getMasterData()
    }, [])

    const [formBussinessPartners] = Form.useForm()

    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const [isVisibleModal, setIsVisibleModal] = useState(false)

    const onCancel = () => {
        setIsVisibleModal(false)
        formBussinessPartners.resetFields()
    }
    const onOk = () => {
        setIsVisibleModal(false)
        formBussinessPartners.submit()
    }
    const onOpen = () => {
        formBussinessPartners.resetFields()
        setIsVisibleModal(true)
    }

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

    const getShopBusinessPartnersDataListAll = async () => {
        const { data } = await API.get(`/shopBusinessPartners/all?limit=9999&page=1&sort=partner_name.th&order=asc&status=default`)
        // console.log('data.data shopBusinessCustomers', data.data.data)
        return data.data.data
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)

            const _model = {
                tax_id: value.tax_id,
                bus_type_id: value.bus_type_id ?? null,
                partner_name: value.partner_name,
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                address: value.address,
                subdistrict_id: value.subdistrict_id ?? null,
                district_id: value.district_id ?? null,
                province_id: value.province_id ?? null,
                other_details: {
                    contact_name: value.contact_name ?? null,
                    period_credit: value.period_credit ?? null,
                    approval_limit: value.approval_limit ?? null
                },
            }

            if (value.mobile_no) value.mobile_no.forEach((e, i) => _model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no);
            else value.mobile_no = []

            if (value.tel_no) value.tel_no.forEach((e, i) => _model.tel_no[`tel_no_${i + 1}`] = e.tel_no);
            else value.tel_no = []

            // console.log('_model', _model)

            let res
            if (mode === "add" || mode === "edit") {
                _model.master_customer_code_id = ""
                res = await API.post(`/shopBusinessPartners/add`, _model)
                // console.log('res', res)
            }

            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsVisibleModal(false)
                if (callBackDataBusinessPartner && isFunction(callBackDataBusinessPartner)) callBackDataBusinessPartner(await getShopBusinessPartnersDataListAll())
                form.setFieldsValue({ bus_partner_id: res.data.data.id })
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
            console.log('error :>> ', error);
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    return (
        <>

            <span> <Button block icon={<PlusOutlined />} onClick={onOpen}>{GetIntlMessages("เพิ่มผู้จำหน่าย")}</Button></span>

            <Modal
                width={750}
                maskClosable={false}
                title={GetIntlMessages("เพิ่มผู้จำหน่าย")}
                // title={`${mode == "view" ? "ดูข้อมูล" : mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}ลูกค้าธุรกิจ`}
                visible={isVisibleModal} onOk={onOk} onCancel={onCancel}
                // okButtonProps={{ disabled: mode == "view" }}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
            >
                <Form
                    form={formBussinessPartners}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 19 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >

                    <FormSelectLanguage config={{
                        form: formBussinessPartners,
                        field: ["partner_name", "address"],
                        disabled: mode == "view"
                    }} onChange={(value) => setFormLocale(value)} />

                    <div hidden>
                        {mode != "add" ?
                            <Form.Item
                                name="master_customer_code_id"
                                type="text"
                                label={GetIntlMessages("code")}
                            >
                                <Input disabled={true} />
                            </Form.Item> : null}
                    </div>

                    <Form.Item
                        name="tax_id"
                        label={GetIntlMessages("tax-id")}
                    >
                        <Input disabled={mode == "view"} />
                    </Form.Item>

                    <Form.Item name="bus_type_id" label={GetIntlMessages("business-type")} >
                        <Select
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            disabled={mode == "view"}
                        >
                            {businessTypeList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.business_type_name[locale.locale]}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("business-name")} name="partner_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} disabled={mode == "view"} />

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
                                            >
                                                <Input disabled={mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                            </Form.Item>
                                            {fields.length > 1 && mode != "view" ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        {mode != "view" ?
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                {GetIntlMessages("tel-no")}
                                            </Button> : null
                                        }

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
                                            >
                                                <Input disabled={mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                                            </Form.Item>
                                            {fields.length > 1 && mode != "view" ? (
                                                <MinusCircleOutlined
                                                    className="dynamic-delete-button"
                                                    onClick={() => remove(field.name)}
                                                />
                                            ) : null}
                                        </Form.Item>
                                    ))}
                                    <Form.Item>
                                        {mode != "view" ?
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                block
                                                icon={<PlusOutlined />}
                                            >
                                                {GetIntlMessages("mobile-no")}
                                            </Button> : null
                                        }
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        name="e_mail"
                        label={GetIntlMessages("email")}
                        rules={[{
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'Please only English',
                        }]}
                    >
                        <Input disabled={mode == "view"} />
                    </Form.Item>

                    <FormInputLanguage isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" disabled={mode == "view"} />

                    <FormProvinceDistrictSubdistrict form={formBussinessPartners} disabled={mode == "view"} />

                    <Form.Item
                        name="contact_name"
                        label={GetIntlMessages("contact-name")}
                    >
                        <Input disabled={mode == "view"} />
                    </Form.Item>
                    <div hidden>
                        <Form.Item
                            name="period_credit"
                            label={GetIntlMessages("ระยะเวลาเครดิต")}
                        >
                            <Input disabled={mode == "view"} />
                        </Form.Item>
                        <Form.Item
                            name="approval_limit"
                            label={GetIntlMessages("วงเงินอนุมัติ")}
                        >
                            <Input disabled={mode == "view"} />
                        </Form.Item>

                    </div>


                    {mode === "view" ?
                        <Form.Item name="isuse" label={GetIntlMessages("status")} >
                            <Switch disabled={mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                        </Form.Item> : null
                    }
                </Form>
            </Modal>
        </>
    )
}

export default ComponentsSelectModalBusinessPartners