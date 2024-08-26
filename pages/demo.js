import React from 'react'
import { Input, Select, Form, Row, Col, Button } from 'antd';
import GetIntlMessages from '../util/GetIntlMessages';
import Fieldset from '../components/shares/Fieldset';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const Demo = () => {

    const [form] = Form.useForm();

    const onFinish = (value) => {
        try {
            console.log('value', value)
            form.setFieldsValue({
                first: "pondkarun"
            })
        } catch (error) {

        }
    }

    const onFinishFailed = (error) => {
        console.log('error', error)
    }

    return (
        <div className='container pt-3'>


            <Form
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 18 }}
            >
                <Form.List name="table_list">
                    {(fields, { add, remove }) => (

                        <>

                            <div className="pb-3">
                                <div style={{ textAlign: "end" }}>
                                    <Button href='#add-plus-outlined' onClick={() => add()} icon={<PlusOutlined />}>
                                        เพิ่มรายการ
                                    </Button>
                                </div>
                            </div>

                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">First</th>
                                        <th scope="col">Last</th>
                                        <th scope="col">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        fields.map((field, index) => (
                                            <tr>
                                                <th scope="row">{index + 1}</th>
                                                <td>
                                                    <Form.Item
                                                        {...field}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        name={[field.name, "first"]}
                                                        fieldKey={[field.fieldKey, "First"]}
                                                    >
                                                        <Input placeholder={GetIntlMessages(`First`)} />
                                                    </Form.Item>
                                                </td>
                                                <td>
                                                    <Form.Item
                                                        {...field}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        name={[field.name, "last"]}
                                                        fieldKey={[field.fieldKey, "Last"]}
                                                    >
                                                        <Input placeholder={GetIntlMessages(`Last`)} />
                                                    </Form.Item>
                                                </td>
                                                <td>
                                                    <Button onClick={() => remove(field.name)} icon={<MinusCircleOutlined />}>
                                                        ลบรายการ {index + 1}
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>

                            </table>


                        </>
                    )}
                </Form.List>

                <Form.Item name={"first"} rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}>
                    <input />
                </Form.Item>
                <Button onClick={() => form.submit()}>
                    บันทึก
                </Button>
            </Form>

        </div>
    )
}

export default Demo