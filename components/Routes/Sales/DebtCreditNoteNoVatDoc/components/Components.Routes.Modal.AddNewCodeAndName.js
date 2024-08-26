import { Button, Form, Modal, Input } from 'antd'
import { isFunction } from 'lodash';
import React, { useState } from 'react'
import Swal from 'sweetalert2';
import RegexMultiPattern from '../../../../shares/RegexMultiPattern';

const ComponentsRoutesModalAddNewCodeAndName = ({ callBack ,index }) => {
    const [isVisible, setIsVisible] = useState(false)
    const [form] = Form.useForm();

    const onOk = () => {
        form.submit()
    }

    const handleCancle = () => {
        form.resetFields()
        setIsVisible(false)
    }

    const onFinish = (values) => {
        try {
            if (isFunction(callBack)) callBack({...values , index})
            handleCancle()
        } catch (error) {

        }
    }
    const onFinishfailed = () => {
        try {
            Swal.fire('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่', '', 'error')
        } catch (error) {

        }
    }
    return (
        <>
            <Button onClick={() => setIsVisible(true)}>เพิ่มรหัสและชื่อ</Button>
            <Modal
                visible={isVisible}
                onCancel={handleCancle}
                onOk={onOk}
            >
                <Form
                    form={form}
                    labelCol={24}
                    wrapperCol={24}
                    onFinish={onFinish}
                    onFinishFailed={onFinishfailed}
                >
                    <Form.Item label={`เพิ่มรหัส`} name={'new_code'}
                        rules={[
                            RegexMultiPattern()
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label={`เพิ่มชื่อ`} name={'new_name'}
                        rules={[
                            RegexMultiPattern()
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>

            </Modal>
        </>
    )
}

export default ComponentsRoutesModalAddNewCodeAndName