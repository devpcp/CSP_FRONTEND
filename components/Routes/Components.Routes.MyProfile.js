import { useEffect, useState } from 'react'
import { Form, Input, Image, Checkbox, Modal } from 'antd';
import API from '../../util/Api'
import { useDispatch, useSelector } from 'react-redux';
import Swal from "sweetalert2";
import { isPlainObject, get } from 'lodash'
import ImageSingleShares from '../shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../shares/FormUpload/API';
import { setImageProfile } from '../../redux/actions/authActions';
import { FormInputLanguage, FormSelectLanguage } from '../shares/FormLanguage';
import GetIntlMessages from '../../util/GetIntlMessages';
import FormProvinceDistrictSubdistrict from '../shares/FormProvinceDistrictSubdistrict';
import FormNameTitle from '../shares/FormNameTitle'

const MyProfile = () => {

    const dispatch = useDispatch();
    const [form] = Form.useForm();
    const { authUser, imageProfile } = useSelector(({ auth }) => auth);
    const { locale } = useSelector(({ settings }) => settings);
    const [profile, setProfile] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [checkChangePassword, setCheckChangePassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formLocale, setFormLocale] = useState(locale.icon)

    useEffect(() => {
        getUser()
    }, [])

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

        // message.warning(erroe_message);
        Swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือน',
            text: erroe_message,
        });
        form.setFieldsValue({ ...model, password: null, c_password: null });
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)
            setLoading(true)
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

            // console.log('modelEdit', modelEdit)
            if (value.password || value.c_password) {
                if (value.password != value.c_password) {
                    // message.warning('รหัสผ่านไม่ตรงกัน !!');
                    Swal.fire({
                        icon: 'warning',
                        title: 'แจ้งเตือน',
                        text: "รหัสผ่านไม่ตรงกัน !!",
                    });
                    form.setFieldsValue({ ...modelEdit, password: null, c_password: null });
                    err = true
                } else {
                    modelEdit.password = value.password
                    modelEdit.c_password = value.c_password
                }
            }

            if (!err) {
                // console.log(`modelEdit`, modelEdit)
                const { data } = await API.put(`/user/put/${authUser.id}`, modelEdit)
                // console.log('data :>> ', data);
                if (data.status == "failed") {
                    checkError(data, modelEdit)
                } else {
                    // message.success("บันทึกข้อมูลสำเร็จ");
                    setIsModalVisible(false)
                    Swal.fire("", "บันทึกสำเร็จ", "success");
                    getUser()
                }
            }
            setLoading(false)
        } catch (error) {
            // message.error('มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!');
            console.log('error :>> ', error);
            setLoading(false)
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: 'มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!',
            });
        }
    }
    const onFinishFailed = (error) => {
        // message.warning('กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!');
        Swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือน',
            text: "กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!",
        });
    }

    const getUser = async () => {
        try {
            setLoading(true)
            const { data } = await API.get(`/user/byid/${authUser.id}`)

            const urlImg = await CheckImage({
                directory: "profiles",
                name: authUser.id,
                fileDirectoryId: authUser.id,
            })
            dispatch(setImageProfile(urlImg));

            if (data.status === "successful") {
                const item = data.data[0]
                const _model = {
                    user_name: item.user_name,
                    e_mail: item.e_mail,
                    note: item.note,
                    ...item.UsersProfile
                }

                console.log('_model =======================================', _model)
                form.setFieldsValue(_model)
                setProfile(_model)
            } else {
                // message.warning('ไม่พบข้อมูล !!');
                Swal.fire({
                    icon: 'warning',
                    title: 'แจ้งเตือน',
                    text: "ไม่พบข้อมูล !!",
                });
            }
            setLoading(false)
        } catch (error) {
            // message.error('มีบางอย่างผิดพลาด !!');
            console.log('error', error)
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: 'มีบางอย่างผิดพลาด !!',
            });
            setLoading(false)
        }
    }

    return (
        <>
            <div className="card mb-0">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="profile-view">
                                <div className="profile-img-wrap">
                                    <div className="profile-img">
                                        {!loading && imageProfile ? <Image src={imageProfile} /> : null}
                                    </div>
                                </div>
                                <div className="profile-basic">
                                    <div className="row">
                                        <div className="col-md-5">
                                            <div className="profile-info-left">
                                                <h3 className="user-name m-t-0 mb-0">{isPlainObject(profile) ? profile.user_name : "-"}</h3>
                                                <h6 className="text-muted">&nbsp;</h6>
                                                <small className="text-muted">&nbsp;</small>
                                                <div className="staff-id">&nbsp;</div>
                                                <div className="small doj text-muted">&nbsp;</div>
                                                <div className="staff-msg">&nbsp;</div>
                                                <div className="staff-msg">&nbsp;</div>
                                            </div>
                                        </div>
                                        <div className="col-md-7">
                                            <ul className="personal-info">
                                                <li>
                                                    <div className="title">{GetIntlMessages("name-surname")}:</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? `${isPlainObject(profile.fname) ? profile.fname[locale.locale] : '-'}  ${isPlainObject(profile.lname) ? profile.lname[locale.locale] : ' '}` : ''}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("id-card")}:</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? profile.id_code ?? "-" : "-"}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("tel-no")}:</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? profile.tel ?? "-" : "-"}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("mobile-no")}</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? profile.mobile ?? "-" : "-"}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("email")}</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? profile.e_mail ?? "-" : "-"}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("address")}</div>
                                                    <div className="text"><a>{isPlainObject(profile) ? `${isPlainObject(profile.address) ? profile.address[locale.locale] : '-'}` : "-"}</a></div>
                                                </li>
                                                <li>
                                                    <div className="title">{GetIntlMessages("Note")}</div>
                                                    <div className="text">{isPlainObject(profile) ? profile.note ?? "-" : "-"}</div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="pro-edit" onClick={() => setIsModalVisible(true)}><a className="edit-icon" ><i className="bi bi-pencil-fill" /></a></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                maskClosable={false}
                title={isPlainObject(profile) ? profile.user_name : "-"}
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
                    style={{ padding: 20 }}
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
                        rules={[{pattern: /^(?!,$)[\d]+$/, message: GetIntlMessages("only-number") }]}
                    >
                        <Input maxLength={13} minLength={10} />
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("name")} name="fname" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("surname")} name="lname" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

                    <Form.Item
                        name="tel"
                        label={GetIntlMessages("tel-no")}
                        rules={[{pattern: /^(?!,$)[\d,. _-]+$/, message: GetIntlMessages("only-number") }]}
                    >
                        <Input maxLength={10}/>
                    </Form.Item>

                    <Form.Item
                        name="mobile"
                        label={GetIntlMessages("mobile-no")}
                        rules={[{pattern: /^(?!,$)[\d,. _-]+$/, message: GetIntlMessages("only-number") }]}
                    >
                        <Input maxLength={10}/>
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

                    <Form.Item name="checkChangePassword" label={GetIntlMessages("change-password")} >
                        <Checkbox checked={checkChangePassword} onChange={(value) => setCheckChangePassword(value.target.checked)} />
                    </Form.Item>


                    {checkChangePassword ?
                        <>
                            <Form.Item
                                name="password"
                                type="password"
                                label={GetIntlMessages("password")}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages(" enter-your-password")
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                            <Form.Item
                                name="c_password"
                                type="c_password"
                                label={GetIntlMessages("confirm-password")}
                                rules={[
                                    {
                                        required: true,
                                        message: GetIntlMessages("enter-your-confirm-password")
                                    },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>

                        </>
                        : null}

                    <ImageSingleShares name="upload" label={GetIntlMessages("image")} accept={"image/*"} value={[{ url: imageProfile, name: authUser.user_name }]} />
                </Form>
            </Modal>
        </>
    )
}

export default MyProfile
