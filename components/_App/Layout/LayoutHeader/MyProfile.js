import React, { useState } from 'react'
import { Form, Input, Modal, message, Checkbox } from 'antd';
import IntlMessages from '../../../../util/IntlMessages';
import { useDispatch, useSelector } from 'react-redux';
import API from '../../../../util/Api';
import ImageSingleShares from '../../../shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../../shares/FormUpload/API';
import { setImageProfile } from '../../../../redux/actions/authActions';
import { FormInputLanguage, FormSelectLanguage } from '../../../shares/FormLanguage';
import GetIntlMessages from '../../../../util/GetIntlMessages';
import FormNameTitle from '../../../shares/FormNameTitle';
import FormProvinceDistrictSubdistrict from '../../../shares/FormProvinceDistrictSubdistrict';

const MyProfile = ({ setLoading }) => {

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [checkChangePassword, setCheckChangePassword] = useState(false);
    const { authUser, imageProfile } = useSelector(({ auth }) => auth);
    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    function checkError(data, model) {
        let erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด"
        if (data.data == "same name") {
            erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ ชื่อผู้ใช้ซ้ำ"
            model.user_name = null
        } else if (data.data == "same e-mail") {
            erroe_message = "ไม่สามารถบันทึกข้อมูลมูลได้ อีเมล์ซ้ำ"
            model.e_mail = null
        }

        message.warning(erroe_message);
        form.setFieldsValue({ ...model, password: null, c_password: null });
    }

    const onFinish = async (value) => {
        try {
            if (setLoading) setLoading(true)
            if (value.upload) {
                await UploadImageSingle(value.upload.file, { name: authUser.id, directory: "profiles" })
                const urlImg = await CheckImage({
                    directory: "profiles",
                    name: authUser.id,
                    fileDirectoryId: authUser.id,
                })
                dispatch(setImageProfile(urlImg));
            }

            let err = false

            const modelEdit = {
                e_mail: value.e_mail,
                note: value.note, // edit
                user_profile_data: {
                    name_title: value.name_title,
                    fname: value.fname,
                    lname: value.lname,
                    id_code: value.id_code,
                    tel: value.tel,
                    mobile: value.mobile,
                    address: value.address,
                    subdistrict_id: value.subdistrict_id,
                    district_id: value.district_id,
                    province_id: value.province_id,
                }
            }

            if (value.password || value.c_password) {
                if (value.password != value.c_password) {
                    message.warning('รหัสผ่านไม่ตรงกัน !!');
                    form.setFieldsValue({ ...modelEdit, password: null, c_password: null });
                    err = true
                } else {
                    modelEdit.password = value.password
                    modelEdit.c_password = value.c_password
                }
            }

            if (!err) {
                console.log(`modelEdit`, modelEdit)
                const { data } = await API.put(`/user/put/${authUser.id}`, modelEdit)
                // console.log('data :>> ', data);
                if (data.status == "failed") {
                    checkError(data, modelEdit)
                } else {
                    message.success("บันทึกข้อมูลสำเร็จ");
                    setIsModalVisible(false);
                }
                setIsModalVisible(false);
            }
            if (setLoading) setLoading(false)
        } catch (error) {
            if (setLoading) setLoading(false)
            message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
        }
    }
    const onFinishFailed = (error) => {
        message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
    }

    const getUser = async () => {
        try {
            const { data } = await API.get(`/user/byid/${authUser.id}`)
            if (data.status === "successful") {
                const item = data.data[0]
                console.log(`item ->>>>>>>>>>>>>`, item)
                const _model = {
                    user_name: item.user_name,
                    e_mail: item.e_mail,
                    note: item.note,
                    ...item.UsersProfile
                }
                form.setFieldsValue(_model)
            } else {
                message.warning('ไม่พบข้อมูล !!');
            }

            setIsModalVisible(true)
        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    return (
        <>
            <a onClick={getUser} className="dropdown-item cursor-pointer">
                <IntlMessages id="my-profile" />
            </a>
            <Modal
                maskClosable={false}
                title={authUser.user_name}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                width={800}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
            >
                <Form

                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 14 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >

                    <FormSelectLanguage config={{
                        form,
                        field: ["fname", "lname", "address"],
                    }} onChange={(value) => setFormLocale(value)} />

                    <FormNameTitle name="name_title" placeholder={GetIntlMessages("select")} />

                    <Form.Item
                        name="user_name"
                        label={GetIntlMessages("username")}
                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="id_code"
                        label={GetIntlMessages("id-card")}
                    >
                        <Input maxLength={13} minLength={10} />
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("name")} name="fname" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("surname")} name="lname" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <Form.Item
                        name="tel"
                        label={GetIntlMessages("tel-no")}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="mobile"
                        label={GetIntlMessages("mobile-no")}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="e_mail"
                        label={GetIntlMessages("email")}
                        rules={[{ type: "email", required: true, message: "กรุณาใส่อีเมล์ของคุณ" },
                        {
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'Please only English',
                        }]}
                    >
                        <Input disabled />
                    </Form.Item>

                    <FormInputLanguage isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" />

                    <FormProvinceDistrictSubdistrict form={form} />

                    <Form.Item name="note" label={GetIntlMessages("remark")} >
                        <Input.TextArea rows={3} />
                    </Form.Item>

                    <Form.Item name="checkChangePassword" label={GetIntlMessages("change-password")}  >
                        <Checkbox checked={checkChangePassword} onChange={(value) => setCheckChangePassword(value.target.checked)} />
                    </Form.Item>

                    {checkChangePassword ?
                        <>
                            <Form.Item
                                name="password"
                                type="password"
                                label="รหัสผ่าน"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณาใส่รหัสผ่านของคุณ"
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="c_password"
                                type="c_password"
                                label="ยืนยันรหัสผ่าน"
                                rules={[
                                    {
                                        required: true,
                                        message: "กรุณายืนยันรหัสผ่าน"
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                        </>
                        : null}

                    <ImageSingleShares name="upload" label={GetIntlMessages("image")}accept={"image/*"} value={[{ url: imageProfile, name: authUser.user_name }]} />

                </Form>
            </Modal>
        </>
    )
}


export default MyProfile
