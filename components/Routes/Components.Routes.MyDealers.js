import { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Modal } from 'antd';
import API from '../../util/Api'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";
import { isArray, isPlainObject } from 'lodash'
import IntlMessages from '../../util/IntlMessages';
import GetIntlMessages from '../../util/GetIntlMessages';
import GetTextValueSelect from '../../util/GetTextValueSelect';
import { useSelector } from 'react-redux';

const MyDealers = () => {
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

    useEffect(() => {
        getMyData()
    }, [])

    const getMyData = async () => {
        try {
            const res = await API.get(`/dealers/all?which=my data`);
            if (res.data.status = "success") {

                if (isArray(res.data.data.data) && res.data.data.data.length > 0) {

                    const { data } = await API.get(`/dealers/byid/${res.data.data.data[0].id}`)
                    setIsShow(true)
                    const _model = data.data[0]

                    _model.tel_no = _model.tel_no ?? {}
                    _model.mobile_no = _model.mobile_no ?? {}

                    _model.dealer_name = _model.dealer_name ? _model.dealer_name.th : null
                    if (_model.sync_api_config != null) {
                        _model.sync_api_config_rd_reg_no = _model.sync_api_config.rd_reg_no
                        _model.sync_api_config_rd_code = _model.sync_api_config.rd_code
                        _model.sync_api_config_username = _model.sync_api_config.username
                        _model.sync_api_config_password = _model.sync_api_config.password
                    }

                    _model.address = _model.address ? _model.address["th"] : null


                    const tel_no_arr = []
                    if (_model.tel_no) {
                        _model.tel_no = Object.entries(_model.tel_no).map((e) => {
                            tel_no_arr.push(e[1])
                            return { tel_no: e[1] }
                        });
                        // await setTelNo([..._model.tel_no])
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


                    console.log('_model :>> ', _model);
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
                    setIsShow(false)
                    Swal.fire({
                        icon: 'warning',
                        title: GetIntlMessages("warning"),
                        text: GetIntlMessages("no-consistent"),
                    });
                }

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
            const item = {
                bus_type_id: value.bus_type_id,
                subdistrict_id: value.subdistrict_id,
                district_id: value.district_id,
                province_id: value.province_id,
                e_mail: value.e_mail ? value.e_mail : null,
                dealer_name: {
                    th: value.dealer_name,
                    en: value.dealer_name
                },
                tel_no: {},
                mobile_no: {},
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
            const { data } = await API.put(`/dealers/put/${idEdit}`, item)
            // console.log(`data`, data)
            if (data.status == "successful") {
                // message.success("บันทึกสำเร็จ")
                Swal.fire("", "บันทึกสำเร็จ", "success");
                setIsModalVisible(false);
                getMyData()
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

    const handleProvinceChange = async (value) => {
        const DistrictDataList = await getDistrictDataListAll(value)
        setDistrictList(DistrictDataList)
        form.setFieldsValue({ district_id: null });
        form.setFieldsValue({ subdistrict_id: null });
    };
    const handleDistrictChange = async (value) => {
        const SubDistrictDataList = await getSubDistrictDataListAll(value)
        setSubdistrictList(SubDistrictDataList)
        form.setFieldsValue({ subdistrict_id: null });

    };
    const handleSubdistrictChange = value => {
        // console.log(value);
    };



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
        setIsModalVisible(false);
    };

    return (
        <>


            <div className="card profile-box flex-fill">
                <div className="card-body">
                    <h3 className="card-title">My Dealers
                        {isShow && isPlainObject(myDealers) && permission_obj.update ? <a className="edit-icon" onClick={() => setIsModalVisible(true)}><i className="bi bi-pencil-fill" /></a> : null}
                    </h3>
                    {isShow && isPlainObject(myDealers) ?
                        <ul className="personal-info">
                            <li>
                                <div className="title">รหัส AD</div>
                                <div className="text">{myDealers.master_dealer_code_id ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">รหัสทะเบียนภาษี</div>
                                <div className="text">{myDealers.dealer_code_id ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">ประเภทธุรกิจ</div>
                                <div className="text">{(GetTextValueSelect(myDealers.bus_type_id, BusinessTypeList, { key: "id", value: "business_type_name" }))[locale.locale] ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">ชื่อร้าน</div>
                                <div className="text">{myDealers.dealer_name ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">เบอร์โทรศัพท์พื้นฐาน</div>
                                <div className="text">{myDealers.tel_no_text ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">เบอร์โทรศัพท์มือถือ</div>
                                <div className="text">{myDealers.mobile_no_text ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">E-mail</div>
                                <div className="text">{myDealers.e_mail ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">ที่อยู่</div>
                                <div className="text">{myDealers.address ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">จังหวัด</div>
                                <div className="text">{(GetTextValueSelect(myDealers.province_id, provinceList, { key: "id", value: "prov_name_th" })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">เขต/อำเภอ</div>
                                <div className="text">{(GetTextValueSelect(myDealers.district_id, districtList, { key: "id", value: "name_th" })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">แขวง/ตำบล</div>
                                <div className="text">{(GetTextValueSelect(myDealers.subdistrict_id, subdistrictList, { key: "id", value: "name_th" })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">rd_reg_no</div>
                                <div className="text">{myDealers.rd_reg_no ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">rd_code</div>
                                <div className="text">{myDealers.rd_code ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">username</div>
                                <div className="text">{myDealers.sync_api_config_username ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">password</div>
                                <div className="text">{myDealers.sync_api_config_password ?? "-"}</div>
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

                    <Form.Item
                        name="master_dealer_code_id"
                        type="text"
                        label="รหัส AD"
                        rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="dealer_code_id"
                        label="รหัสทะเบียนภาษี"
                        rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item name="bus_type_id" label="ประเภทธุรกิจ" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                        >
                            <Select.Option value={null}>- ไม่มี -</Select.Option>
                            {BusinessTypeList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.business_type_name.th}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dealer_name"
                        label="ชื่อร้าน"
                        rules={[{ required: true, message: "กรุณาใส่ชื่อร้านของคุณ" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="เบอร์โทรศัพท์พื้นฐาน"
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
                                                <Input placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
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
                                            เบอร์โทรศัพท์พื้นฐาน
                                        </Button>
                                    </Form.Item>

                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        label="เบอร์โทรศัพท์มือถือ"
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
                                                rules={[
                                                    {
                                                        required: true,
                                                        whitespace: true,
                                                        message: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
                                                    },
                                                ]}
                                                noStyle
                                            >
                                                <Input placeholder="กรอกเบอร์โทรศัพท์มือถือ" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
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
                                            เบอร์โทรศัพท์พื้นฐาน
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>
                    </Form.Item>

                    <Form.Item
                        name="e_mail"
                        label="E-mail"
                        rules={[{
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                            message: 'Please only Email',
                        }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="ที่อยู่"

                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item name="province_id" label="จังหวัด" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            onChange={handleProvinceChange}

                        >
                            {provinceList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.prov_name_th}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="district_id" label="เขต/อำเภอ" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            onChange={handleDistrictChange}

                        >
                            {districtList != null ? districtList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.name_th}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item name="subdistrict_id" label="แขวง/ตำบล" >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            onChange={handleSubdistrictChange}

                        >
                            {subdistrictList != null ? subdistrictList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.name_th}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item>


                    <Form.Item
                        name="sync_api_config_rd_reg_no"
                        label="rd_reg_no"

                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_rd_code"
                        label="rd_code"

                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_username"
                        label="username"

                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="sync_api_config_password"
                        label="password"

                    >
                        <Input />
                    </Form.Item>


                </Form>
            </Modal>


        </>
    )
}

export default MyDealers
