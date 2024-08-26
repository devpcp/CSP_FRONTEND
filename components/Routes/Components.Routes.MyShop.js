import { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Modal, Image, Radio, InputNumber } from 'antd';
import API from '../../util/Api'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";
import { isArray, isPlainObject } from 'lodash'
import IntlMessages from '../../util/IntlMessages';
import GetIntlMessages from '../../util/GetIntlMessages';
import GetTextValueSelect from '../../util/GetTextValueSelect';
import { useSelector } from 'react-redux';
import { FormInputLanguage, FormSelectLanguage } from '../shares/FormLanguage';
import FormProvinceDistrictSubdistrict from '../shares/FormProvinceDistrictSubdistrict';
import ImageSingleShares from '../shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../shares/FormUpload/API';

const MyShop = () => {
    const [form] = Form.useForm();
    const [idEdit, setIsIdEdit] = useState(null);
    const [BusinessTypeList, setBusinessTypeList] = useState([])
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const [isShow, setIsShow] = useState(false)
    const [myDealers, setMyDealers] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { locale } = useSelector(({ settings }) => settings);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { authUser } = useSelector(({ auth }) => auth);
    const [imageShop, setImageShop] = useState([]);
    const [IsBranch, setIsBranch] = useState(false);
    const [shopData, setShopData] = useState({});

    const [formLocale, setFormLocale] = useState(locale.icon)
    useEffect(() => {
        getMyShop()
    }, [])

    const getMyShop = async () => {
        try {

            const error = () => {
                Swal.fire({
                    icon: 'warning',
                    title: GetIntlMessages("warning"),
                    text: GetIntlMessages("no-consistent"),
                });
            }
            // console.log('authUser', authUser)
            if (isPlainObject(authUser.UsersProfile)) {
                if (isPlainObject(authUser.UsersProfile.ShopsProfile)) {
                    const shop_id = authUser.UsersProfile.ShopsProfile.id;
                    if (shop_id) {
                        const { data } = await API.get(`/shopsProfiles/byid/${shop_id}`)
                        if (data.status === "success") {
                            setIsShow(true)
                            const _model = data.data
                            setShopData(_model)
                            const urlImg = await CheckImage({
                                directory: "shops",
                                name: _model.id,
                                fileDirectoryId: _model.id,
                            })
                            if (urlImg !== "/assets/images/profiles/avatar.jpg") {
                                setImageShop([
                                    {
                                        url: urlImg,
                                        name: _model.shop_name[locale.locale],
                                    }
                                ])
                            }

                            _model.tel_no = _model.tel_no ?? {}
                            _model.mobile_no = _model.mobile_no ?? {}
                            _model.shop_local_name = _model.shop_name.shop_local_name ?? ""

                            if (isPlainObject(_model.sync_api_config)) {
                                _model.sync_api_config_rd_reg_no = _model.sync_api_config.rd_reg_no
                                _model.sync_api_config_rd_code = _model.sync_api_config.rd_code
                                _model.sync_api_config_username = _model.sync_api_config.username
                                _model.sync_api_config_password = _model.sync_api_config.password
                            }

                            const tel_no_arr = []
                            if (_model.tel_no) {
                                _model.tel_no = Object.entries(_model.tel_no).map((e) => {
                                    tel_no_arr.push(e[1])
                                    return { tel_no: e[1] }
                                });
                            }
                            //จัด object mobile_no ใหม่
                            const mobile_no_arr = []
                            if (_model.mobile_no) {
                                _model.mobile_no = Object.entries(_model.mobile_no).map((e) => {
                                    mobile_no_arr.push(e[1])
                                    return { mobile_no: e[1] }
                                });
                                // await setMobileNo([..._model.mobile_no])
                            }

                            _model.tel_no_text = tel_no_arr.toString()
                            _model.mobile_no_text = mobile_no_arr.toString()
                            _model.branch = isPlainObject(_model.shop_config) ? _model.shop_config["branch"] ?? null : null
                            _model.branch_code = isPlainObject(_model.shop_config) ? _model.shop_config["branch_code"] ?? null : null
                            _model.branch_name = isPlainObject(_model.shop_config) ? _model.shop_config["branch_name"] ?? null : null
                            _model.shop_order_number = isPlainObject(_model.shop_config) ? _model.shop_config["shop_order_number"] ?? null : null
                            _model.line_notify_token = isPlainObject(_model.shop_config) ? _model.shop_config["line_notify_token"] ?? null : null
                            _model.shop_work_type = isPlainObject(_model.shop_config) ? _model.shop_config["shop_work_type"] ?? [] : []

                            if (isPlainObject(_model.shop_config)) {
                                switch (_model.shop_config["branch"]) {
                                    case "office":
                                        setIsBranch(false)
                                        break;

                                    case "branch":
                                        setIsBranch(true)
                                        break;
                                }
                            }

                            form.setFieldsValue(_model)
                            setMyDealers(_model)
                            setIsIdEdit(_model.id)
                            setBusinessTypeList(await getBusinessTypeDataListAll())
                            setProvinceList(await getProvinceDataListAll())

                            if (_model.province_id != null) {
                                const DistrictDataList = await getDistrictDataListAll(_model.province_id)
                                setDistrictList(DistrictDataList)
                            }
                            if (_model.district_id != null) {
                                const SubDistrictDataList = await getSubDistrictDataListAll(_model.district_id)
                                setSubdistrictList(SubDistrictDataList)
                            }
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'ผิดพลาด',
                                text: data.data,
                            });
                        }
                    } else {
                        error()
                    }
                } else {
                    error()
                }
            } else {
                error()
            }

        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: "มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!",
            });
        }
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)
            const item = {
                shop_code_id: value.shop_code_id,
                tax_code_id: value.tax_code_id,
                bus_type_id: value.bus_type_id,
                shop_name: (!!value.shop_local_name) ? { ...value.shop_name, shop_local_name: value?.shop_local_name ?? null } : value.shop_name,
                address: value.address,
                tel_no: {},
                mobile_no: {},
                e_mail: value.e_mail ? value.e_mail : null,
                province_id: value.province_id,
                district_id: value.district_id,
                subdistrict_id: value.subdistrict_id,
                isuse: 1,
                sync_api_config: {
                    rd_reg_no: value.sync_api_config_rd_reg_no,
                    rd_code: value.sync_api_config_rd_code,
                    username: value.sync_api_config_username,
                    password: value.sync_api_config_password
                },
                shop_config: {
                    ...shopData.shop_config,
                    branch: value.branch ?? null,
                    branch_code: value.branch_code ?? null,
                    branch_name: value.branch_name ?? null,
                    shop_order_number: value.shop_order_number ?? 0,
                    line_notify_token: value.line_notify_token ?? null,
                    shop_work_type: value.shop_work_type ?? []
                },

            }

            if (value.upload) {
                await setImageShop([])
                await UploadImageSingle(value.upload.file, { name: idEdit, directory: "shops" })
                const urlImg = await CheckImage({
                    directory: "shops",
                    name: idEdit,
                    fileDirectoryId: idEdit,
                })
                if (urlImg !== "/assets/images/profiles/avatar.jpg") {
                    setImageShop([
                        {
                            url: urlImg,
                            name: value.shop_name[locale.locale],
                        }
                    ])
                }
            }

            /* เบอร์โทรศัพท์มือถือ */
            if (value.mobile_no) {
                value.mobile_no.forEach((e, i) => {
                    const index = i + 1
                    item.mobile_no[`mobile_no_${index}`] = e.mobile_no
                });
            }

            /* เบอร์โทรศัพท์พื้นฐาน */
            if (value.tel_no) {
                value.tel_no.forEach((e, i) => {
                    const index = i + 1
                    item.tel_no[`tel_no_${index}`] = e.tel_no
                });
            }

            // console.log(`item`, item)
            const { data } = await API.put(`/shopsProfiles/put/${idEdit}`, item)
            // console.log(`data`, data)
            if (data.status == "success") {
                // message.success("บันทึกสำเร็จ")
                Swal.fire("", "บันทึกสำเร็จ", "success");
                // setIsModalVisible(false);
                handleCancel()
                getMyShop()

            } else {
                // message.error(data.data)
                Swal.fire({
                    icon: 'error',
                    title: 'ผิดพลาด',
                    text: data.data,
                });
            }


        } catch (error) {
            // message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            console.log('error :>> ', error);
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: "มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!",
            });
        }
    }

    const onFinishFailed = (error) => {
        // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
        Swal.fire({
            icon: 'warning',
            title: 'แจ้งเตือน',
            text: "กรอกข้อมูลให้ครบถ้วน !!!",
        });
    }



    /* เรียกข้อมูล BusinessType ทั้งหมด */
    const getBusinessTypeDataListAll = async () => {
        const { data } = await API.get(`/master/businessType?sort=business_type_name.th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล Province ทั้งหมด */
    const getProvinceDataListAll = async () => {
        const { data } = await API.get(`/master/province?sort=prov_name_th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล District ทั้งหมด */
    const getDistrictDataListAll = async (province_id) => {
        const { data } = await API.get(`/master/district?sort=name_th&order=asc&province_id=${province_id}`)
        return data.data
    }

    /* เรียกข้อมูล SubDistrict ทั้งหมด */
    const getSubDistrictDataListAll = async (district_id) => {
        const { data } = await API.get(`/master/subDistrict?sort=name_th&order=asc&district_id=${district_id}`)
        return data.data
    }

    /* Modal */

    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        form.resetFields()
        setIsModalVisible(false);
    };

    const onChangeBranch = (ev) => {
        if (ev.target.value == "branch") {
            setIsBranch(true)
        } else {
            setIsBranch(false)
        }
    }

    return (
        <>


            <div className="card profile-box flex-fill">
                <div className="card-body">
                    <h3 className="card-title">My Shop
                        {(isShow && isPlainObject(myDealers) && permission_obj.update) ? <a className="edit-icon" onClick={() => { getMyShop(); setIsModalVisible(true) }}><i className="bi bi-pencil-fill" /></a> : null}
                    </h3>


                    {isShow && isPlainObject(myDealers) ?
                        <ul className="personal-info">
                            <li className='pb-4'>
                                {imageShop.length > 0 ? <Image src={imageShop[0].url} width={100} /> : <Image src="/assets/images/profiles/avatar.jpg" width={100} />}
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("shop-code")}</div>
                                <div className="text">{myDealers.shop_code_id ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("tax-code")}</div>
                                <div className="text">{myDealers.tax_code_id ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("business-type")}</div>
                                <div className="text">{(GetTextValueSelect(myDealers.bus_type_id, BusinessTypeList, { key: "id", value: "business_type_name" }))[locale.locale] ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("shop-name")}</div>
                                <div className="text">{isPlainObject(myDealers.shop_name) ? myDealers.shop_name[locale.locale] : "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("telephone")}</div>
                                <div className="text">{myDealers.tel_no_text ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("mobile-phone")}</div>
                                <div className="text">{myDealers.mobile_no_text ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("email")}</div>
                                <div className="text">{myDealers.e_mail ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("address")}</div>
                                <div className="text">{isPlainObject(myDealers.address) ? myDealers.address[locale.locale] : "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("province")}</div>
                                <div className="text">{(GetTextValueSelect(myDealers.province_id, provinceList, { key: "id", value: `prov_name_${locale.locale}` })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("district")}</div>
                                <div className="text">{(GetTextValueSelect(myDealers.district_id, districtList, { key: "id", value: `name_${locale.locale}` })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("subdistrict")}</div>
                                <div className="text">{(GetTextValueSelect(myDealers.subdistrict_id, subdistrictList, { key: "id", value: `name_${locale.locale}` })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">{GetIntlMessages("zip-code")}</div>
                                <div className="text">{myDealers.zip_code ?? "-"}</div>
                            </li>

                        </ul> : <div style={{ textAlign: "center", color: "red" }}><IntlMessages id="no-consistent" /></div>}
                </div>
            </div>

            <Modal
                width={800}
                maskClosable={false}
                title={"My Dealers"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
            >
                <Form
                    form={form}
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 12 }}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    style={{ padding: 20 }}
                >

                    <FormSelectLanguage config={{
                        form,
                        field: ["shop_name", "address"]
                    }} onChange={(value) => setFormLocale(value)} />

                    <Form.Item
                        name="shop_code_id"
                        type="text"
                        label={GetIntlMessages("shop-code")}

                    >
                        <Input disabled />
                    </Form.Item>

                    <Form.Item
                        name="tax_code_id"
                        label={GetIntlMessages("tax-code")}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="branch"
                        label={GetIntlMessages("สำนักงาน/สาขา")}
                        rules={[
                            {
                                required: true,
                                message: GetIntlMessages("กรุณาเลือกข้อมูล")
                            },
                        ]}
                    >
                        <Radio.Group onChange={(val) => onChangeBranch(val)} >
                            <Radio value="office"> สำนักงานใหญ่ </Radio>
                            <Radio value="branch"> สาขา </Radio>
                        </Radio.Group>
                    </Form.Item>
                    {
                        IsBranch ?
                            <>
                                <Form.Item
                                    name="branch_code"
                                    label={GetIntlMessages("รหัสสาขา")}
                                    rules={
                                        [
                                            {
                                                required: IsBranch,
                                                message: "กรุณากรอกข้อมูล",
                                            },
                                            {
                                                min: 5,
                                                message: "กรุณากรอกข้อมูลให้ถูกต้อง",
                                            },
                                            {
                                                pattern: new RegExp("^[0-9]*$"),
                                                message: "กรอกได้เฉพาะตัวเลขเท่านั้น",
                                            }
                                        ]
                                    }
                                >
                                    <Input type={'text'} maxLength={5} placeholder="000001" />
                                </Form.Item>

                                <Form.Item
                                    name="branch_name"
                                    label={GetIntlMessages("ชื่อสาขา")}
                                    rules={
                                        [
                                            {
                                                required: IsBranch,
                                                message: "กรุณากรอกข้อมูล",
                                            },
                                        ]
                                    }
                                >
                                    <Input type={'text'} maxLength={200} placeholder="กรอกชื่อสาขา" />
                                </Form.Item>
                            </>
                            : <></>

                    }

                    <Form.Item name="bus_type_id" label={GetIntlMessages("business-type")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            {BusinessTypeList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.business_type_name.th}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>


                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("shop-name")} name="shop_name" rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]} />

                    <Form.Item name="shop_local_name" label={GetIntlMessages("ชื่อภายใน")} >
                        <Input />
                    </Form.Item>

                    <Form.Item name="shop_order_number" label={GetIntlMessages("ลำดับสาขา")} >
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item name="shop_work_type" label={GetIntlMessages("ประเภทการดำเนินกิจการ")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            mode='multiple'
                        >
                            <Select.Option value={0} key={0}>
                                ไม่ระบุ
                            </Select.Option>
                            <Select.Option value={1} key={1}>
                                ขายส่ง
                            </Select.Option>
                            <Select.Option value={2} key={2}>
                                ขายปลีก
                            </Select.Option>
                            <Select.Option value={3} key={3}>
                                ร้านซ่อม
                            </Select.Option>
                        </Select>
                    </Form.Item>

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
                                                rules={[{ pattern: /^(?!,$)[\d,. _-]+$/, message: GetIntlMessages("only-number") }]}
                                                noStyle
                                            >
                                                <Input maxLength={10} placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" style={{ width: fields.length > 1 ? '80%' : '100%' }} />
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
                                                rules={[{ pattern: /^(?!,$)[\d,. _-]+$/, message: GetIntlMessages("only-number") }]}
                                                noStyle
                                            >
                                                <Input maxLength={10} placeholder="กรอกเบอร์โทรศัพท์มือถือ" style={{ width: fields.length > 1 ? '80%' : '100%' }} />
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
                                            {GetIntlMessages("mobile-no")}
                                        </Button>
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
                            message: 'Please only Email',
                        }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="line_notify_token"
                        label="LINE Notify Token"
                    >
                        <Input />
                    </Form.Item>

                    <FormInputLanguage icon={formLocale} label={GetIntlMessages("address")} name="address" isTextArea />

                    <FormProvinceDistrictSubdistrict form={form} />

                    <ImageSingleShares name="upload" label={GetIntlMessages(`upload-image`)} accept={"image/*"} value={imageShop} />
                </Form>
            </Modal>


        </>
    )
}

export default MyShop
