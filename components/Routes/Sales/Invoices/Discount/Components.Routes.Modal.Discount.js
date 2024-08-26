import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Row, Col, Select, Switch } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../../util/GetIntlMessages';
import FormSelectLanguage from '../../../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../../../shares/FormLanguage/FormInputLanguage'
import ModalFullScreen from '../../../../shares/ModalFullScreen';
import API from '../../../../../util/Api'
import { isFunction, isPlainObject } from 'lodash';

const ComponentsDiscount = ({ icon, textButton, disabled }) => {

    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)


    const [form] = Form.useForm()
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOk = () => {
        form.submit()
    }

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false)
    }

    const onFinish = async (value) => {
        try {
            console.log('value', value)
            const model = {
                cash: value.test1,
                text: value.test2
            }
            console.log('model', model)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }

    const formItemLayout = {
        labelAlign: "left",
        labelCol: {
            xs: { span: 24 }
        },
        wrapperCol: {
            xs: { span: 24 }
        }
    }


    return (
        <>
            <Button className={`cash-btn`} onClick={() => setIsModalVisible(true)} disabled={disabled}>
                {isPlainObject(icon) ? icon : <img className={`cash-img-icon ${disabled ? "img-opacity-05" : ""}`} src={icon} />}
                <span className='pt-1'>{textButton}</span>
            </Button>

            <ModalFullScreen
                maskClosable={false}
                title={`ส่วนลดอื่นๆ`}
                visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                // okButtonProps={{ disabled: configModal.mode == "view" }}
                hideSubmitButton
                className={`cash-modal`}
            >
                <Form
                    form={form}
                    labelCol={{ span: 5 }}
                    wrapperCol={{ span: 19 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Row>
                        <Col xs={24} xl={12}>
                            <Form.Item
                                name=""
                                label={GetIntlMessages("ส่วนลดอื่นๆ")}
                            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                            >
                                <Input addonAfter={`บาท`} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} xl={12}>
                            <div className={`pay-box`}>
                                <Button type='primary' onClick={() => form.submit()} className={`confirm-box-btn`}>{GetIntlMessages("ยืนยัน")}</Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </ModalFullScreen>

            {/* <style global>{`
                .ant-form-item{
                    width : 100%;
                    display : flex;
                    justify-content: center;
                }
            `}</style> */}
        </>
    )
}

export default ComponentsDiscount