import { useState } from 'react'
import { Button, Form, Input, Modal } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isFunction } from 'lodash';

const ComponentsSelectModalTaxType = ({ textButton, icon, callback }) => {

    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false)
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            const model = {
                code_id: value.code_id,
                type_name: value.type_name,
                detail: {
                    tax_rate_percent: value.tax_rate_percent
                }
            }
            // console.log('model', model)

            const { data } = await API.post(`/master/taxTypes/add`, model);
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

    return (
        <>
            <Button style={{ whiteSpace: 'nowrap' }} onClick={() => setIsModalVisible(true)}>
                {icon}  {textButton}
            </Button>

            <Modal
                form={form}
                maskClosable={false}
                title={`เพิ่มประเภทภาษี`}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"35vw"}
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
                        field: ["type_name"],
                        disabled: false
                    }} onChange={(value) => setFormLocale(value)} />

                    <Form.Item
                        name="code_id"
                        label={GetIntlMessages("code")}
                        rules={[{ required: true, message: GetIntlMessages('please-fill-out') }]}
                    >
                        <Input />
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("ประเภทภาษี")} name="type_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <Form.Item
                        name="tax_rate_percent"
                        label={GetIntlMessages("อัตราภาษี (%)")}
                        rules={[{ required: true, message: GetIntlMessages('please-fill-out') }]}
                    >
                        <Input type={"number"} />
                    </Form.Item>

                </Form>
            </Modal>
        </>
    )
}

export default ComponentsSelectModalTaxType