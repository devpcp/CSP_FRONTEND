import { useEffect, useState } from 'react'
import { Form, Input, Select, Button, Modal, Image, Switch, Col, Row, Tabs, TimePicker, Radio, DatePicker } from 'antd';
import API from '../../util/Api'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from "sweetalert2";
import { isArray, isPlainObject, get } from 'lodash'
import IntlMessages from '../../util/IntlMessages';
import GetIntlMessages from '../../util/GetIntlMessages';
import GetTextValueSelect from '../../util/GetTextValueSelect';
import { useSelector } from 'react-redux';
import { FormInputLanguage, FormSelectLanguage } from '../shares/FormLanguage';
import FormProvinceDistrictSubdistrict from '../shares/FormProvinceDistrictSubdistrict';
import ImageSingleShares from '../shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../shares/FormUpload/API';
import { Label } from 'reactstrap';
import moment from 'moment'

const SettingShop = () => {
    const [form] = Form.useForm();
    const [idEdit, setIsIdEdit] = useState(null);
    const [BusinessTypeList, setBusinessTypeList] = useState([])
    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const [isShow, setIsShow] = useState(false)
    const [myDealers, setMyDealers] = useState(null)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { authUser } = useSelector(({ auth }) => auth);
    const [imageShop, setImageShop] = useState([]);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const [settingModel, setSettingModel] = useState([{
        enable_ShopSalesTransaction_INV_doc_code: false,
        enable_ShopSalesTransaction_TRN_doc_code: false,
        separate_ShopInventoryTransaction_DocType_doc_code: false,
        separate_ShopSalesTransaction_DocType_doc_code: false
    }])
    const [businessHours, setBusinessHours] = useState([]);
    const [warehouseList, setWarehouseList] = useState([])
    const [shelfList, setShelfList] = useState([])

    const { RangePicker } = DatePicker;

    useEffect(() => {
        getSettingShop()
    }, [])

    const getSettingShop = async () => {
        try {
            let dataWarehouse = await getShelfData()
            dataWarehouse.map((e) => {
                e.value
            })
            setWarehouseList(dataWarehouse)

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
                            let business_hours = [
                                {
                                    order: 1,
                                    day: "อาทิตย์",
                                    is_open: true,
                                },
                                {
                                    order: 2,
                                    day: "จันทร์",
                                    is_open: true,
                                },
                                {
                                    order: 3,
                                    day: "อังคาร",
                                    is_open: true,
                                },
                                {
                                    order: 4,
                                    day: "พุธ",
                                    is_open: true,
                                },
                                {
                                    order: 5,
                                    day: "พฤหัสบดี",
                                    is_open: true,
                                },
                                {
                                    order: 6,
                                    day: "ศุกร์",
                                    is_open: true,
                                },
                                {
                                    order: 7,
                                    day: "เสาร์",
                                    is_open: true,
                                },
                            ]
                            _model.address = _model.address
                            if (isPlainObject(_model.shop_config)) {
                                _model.enable_ShopSalesTransaction_INV_doc_code = _model.shop_config.enable_ShopSalesTransaction_INV_doc_code
                                _model.enable_ShopSalesTransaction_TRN_doc_code = _model.shop_config.enable_ShopSalesTransaction_TRN_doc_code
                                _model.separate_ShopInventoryTransaction_DocType_doc_code = _model.shop_config.separate_ShopInventoryTransaction_DocType_doc_code
                                _model.separate_ShopSalesTransaction_DocType_doc_code = _model.shop_config.separate_ShopSalesTransaction_DocType_doc_code
                                _model.enable_ShopSalesTransaction_legacyStyle = _model.shop_config.enable_ShopSalesTransaction_legacyStyle
                                _model.enable_sale_cost_show = _model.shop_config.enable_sale_cost_show
                                _model.enable_sale_warehouse_show = _model.shop_config.enable_sale_warehouse_show
                                _model.enable_warehouse_cost_show = _model.shop_config.enable_warehouse_cost_show
                                _model.enable_sale_tax_type = _model.shop_config.enable_sale_tax_type
                                _model.enable_sale_price_overwrite = _model.shop_config.enable_sale_price_overwrite
                                _model.business_hours = _model.shop_config.business_hours ?? business_hours
                                _model.holidays = _model.shop_config.holidays
                                _model.default_warehouse_id = _model.shop_config.default_warehouse_id
                                _model.default_shelf_id = _model.shop_config.default_shelf_id
                                _model.enable_title_name_print_out = _model.shop_config.enable_title_name_print_out ?? false
                            }
                            try {
                                _model.business_hours.map((e) => {
                                    e.open_time = e.open_time ? moment(e.open_time) : null
                                    e.close_time = e.close_time ? moment(e.close_time) : null
                                })
                            } catch (error) {
                                console.log("error", error)
                            }

                            try {
                                _model.holidays.map((e) => {
                                    e.range_date = e.range_date ? [moment(e.range_date[0]), moment(e.range_date[1])] : null
                                })
                                console.log("holidays", _model.holidays)
                            } catch (error) {
                                console.log("error", error)
                            }

                            setBusinessHours(_model.business_hours)
                            console.log("_model", _model)
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
                address: value.address,
                shop_config: {
                    enable_ShopSalesTransaction_INV_doc_code: value.enable_ShopSalesTransaction_INV_doc_code,
                    enable_ShopSalesTransaction_TRN_doc_code: value.enable_ShopSalesTransaction_TRN_doc_code,
                    separate_ShopInventoryTransaction_DocType_doc_code: value.separate_ShopInventoryTransaction_DocType_doc_code,
                    separate_ShopSalesTransaction_DocType_doc_code: value.separate_ShopSalesTransaction_DocType_doc_code,
                    enable_ShopSalesTransaction_legacyStyle: value.enable_ShopSalesTransaction_legacyStyle,
                    enable_sale_cost_show: value.enable_sale_cost_show,
                    enable_sale_warehouse_show: value.enable_sale_warehouse_show,
                    enable_warehouse_cost_show: value.enable_warehouse_cost_show,
                    enable_sale_tax_type: value.enable_sale_tax_type,
                    enable_sale_price_overwrite: value.enable_sale_price_overwrite,
                    business_hours: value.business_hours,
                    holidays: value.holidays,
                    default_warehouse_id: value.default_warehouse_id,
                    default_shelf_id: value.default_shelf_id,
                    enable_title_name_print_out: value.enable_title_name_print_out
                }
            }

            Swal.fire({
                title: GetIntlMessages("ระบบจะมีการรีเฟรชหน้าหลังจากบันทึกสำเร็จ ยืนยันการบันทึกหรือไม่ !?"),
                icon: "info",
                confirmButtonText: GetIntlMessages("submit"),
                confirmButtonColor: mainColor,
                cancelButtonText: GetIntlMessages("cancel"),
                showCancelButton: true,
            }).then(async (result) => {
                if (result.isConfirmed) {
                    const { data } = await API.put(`/shopsProfiles/put/${idEdit}`, item)
                    // console.log(`data`, data)
                    if (data.status == "success") {
                        // message.success("บันทึกสำเร็จ")
                        Swal.fire({
                            title: "บันทึกสำเร็จ",
                            timer: 1000,
                            timerProgressBar: true,
                            icon: "success"
                        });
                        setIsModalVisible(false);
                        await getSettingShop()
                        setTimeout(() => {
                            window.location.reload()
                        }, 400);

                    } else {
                        // message.error(data.data)
                        Swal.fire({
                            icon: 'error',
                            title: 'ผิดพลาด',
                            text: data.data,
                        });
                    }
                }
            })
            // console.log(`item`, item)
            // const { data } = await API.put(`/shopsProfiles/put/${idEdit}`, item)
            // // console.log(`data`, data)
            // if (data.status == "success") {
            //     // message.success("บันทึกสำเร็จ")
            //     Swal.fire("", "บันทึกสำเร็จ", "success");
            //     setIsModalVisible(false);
            //     await getSettingShop()
            //     setTimeout(() => {
            //         window.location.reload()
            //     }, 400);

            // } else {
            //     // message.error(data.data)
            //     Swal.fire({
            //         icon: 'error',
            //         title: 'ผิดพลาด',
            //         text: data.data,
            //     });
            // }


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
        setIsModalVisible(false);
    };


    const onChangeIsOpen = async (index_business_hours) => {
        const { business_hours } = form.getFieldValue()
        if (!business_hours[index_business_hours].is_open) {
            business_hours[index_business_hours].open_time = null
            business_hours[index_business_hours].close_time = null/*  */
        }
        setBusinessHours(business_hours)
    }

    /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
    const getShelfData = async () => {
        const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`)
        // console.log('data.data getShelfData', data.data.data);
        return data.data.data
    }

    const onChangeWarehouse = (id) => {
        if (id) {
            let selectWarehouse = warehouseList.find(x => x.id === id)
            setShelfList(selectWarehouse.shelf)
        } else {
            setShelfList([])
        }
        let model = {
            default_shelf_id: null
        }
        form.setFieldsValue(model)
    }

    return (
        <>


            <div className="card profile-box flex-fill">
                <div className="card-body">
                    <h3 className="card-title">ตั้งค่าข้อมูล
                        {(isShow && isPlainObject(myDealers) && permission_obj.update) ? <a className="edit-icon" onClick={() => { getSettingShop(); setIsModalVisible(true) }}><i className="bi bi-pencil-fill" /></a> : null}
                    </h3>


                    {isShow && isPlainObject(myDealers) ?
                        <Row>
                            <Col span={20}>
                                <div className="title">{GetIntlMessages("เปิดใช้งานเลขที่เอกสารใบเสร็จรับเงิน/ใบกำกับภาษี")}</div>
                            </Col>
                            <Col span={4}>
                                <div className="text" style={{ color: myDealers.shop_config.enable_ShopSalesTransaction_INV_doc_code ? "#03ba00" : "#d10000" }}>{myDealers.shop_config.enable_ShopSalesTransaction_INV_doc_code == true ? "ใช้งาน" : "ไม่ใช้งาน"}</div>
                            </Col>

                            <Col span={20}>
                                <div className="title">{GetIntlMessages("เปิดใช้งานเลขที่เอกสารใบส่งสินค้า/ใบแจ้งหนี้")}</div>
                            </Col>
                            <Col span={4}>
                                <div className="text" style={{ color: myDealers.shop_config.enable_ShopSalesTransaction_TRN_doc_code ? "#03ba00" : "#d10000" }}>{myDealers.shop_config.enable_ShopSalesTransaction_TRN_doc_code == true ? "ใช้งาน" : "ไม่ใช้งาน"}</div>
                            </Col>

                            <Col span={20}>
                                <div className="title">{GetIntlMessages("แยกเลขที่เอกสารระหว่างใบรับสินค้า กับใบปรับลดปรับเพิ่มสินค้า")}</div>
                            </Col>
                            <Col span={4}>
                                <div className="text" style={{ color: myDealers.shop_config.separate_ShopInventoryTransaction_DocType_doc_code ? "#03ba00" : "#d10000" }}>{myDealers.shop_config.separate_ShopInventoryTransaction_DocType_doc_code == true ? "ใช้งาน" : "ไม่ใช้งาน"}</div>
                            </Col>

                            <Col span={20}>
                                <div className="title">{GetIntlMessages("แยกเลขที่เอกสารระหว่างใบสั่งซ่อม กับใบสั่งขาย/ใบจองสินค้า")}</div>
                            </Col>
                            <Col span={4}>
                                <div className="text" style={{ color: myDealers.shop_config.separate_ShopSalesTransaction_DocType_doc_code ? "#03ba00" : "#d10000" }}>{myDealers.shop_config.separate_ShopSalesTransaction_DocType_doc_code == true ? "ใช้งาน" : "ไม่ใช้งาน"}</div>
                            </Col>

                            <Col span={20}>
                                <div className="title">{GetIntlMessages("ซ่อนต้นทุนสินค้าใบสั่งซ่อม กับใบสั่งขาย")}</div>
                            </Col>
                            {/* <Col span={20}>
                                <div className="title">{GetIntlMessages("ใช้งานกระบวนการสร้างใบสั่งซ่อม กับใบสั่งขาย/ใบจองสินค้า แบบดั้งเดิม")}</div>
                            </Col> */}
                            <Col span={4}>
                                <div className="text" style={{ color: myDealers.shop_config.enable_ShopSalesTransaction_legacyStyle ? "#03ba00" : "#d10000" }}>{myDealers.shop_config.enable_ShopSalesTransaction_legacyStyle == true ? "ใช้งาน" : "ไม่ใช้งาน"}</div>
                            </Col>
                        </Row>

                        : <div style={{ textAlign: "center", color: "red" }}><IntlMessages id="no-consistent" /></div>}
                </div>
            </div>

            <Modal
                width={'1200'}
                maskClosable={false}
                title={"ตั้งค่าระบบ"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                bodyStyle={{
                    overflowX: "auto"
                }}
                style={{ top: 40 }}
            >
                <Form
                    form={form}
                    layout="horizontal"
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    style={{ padding: 20 }}
                // labelCol={{ span: 20 }}
                // wrapperCol={{ span: 4 }}
                >
                    <Tabs
                        defaultActiveKey="1"
                        items={[
                            {
                                label: `ตั้งค่าทั่วไป`,
                                key: '1',
                                children:
                                    <Row>
                                        <Col span={24}>
                                            <Row>
                                                <Col span={20}>
                                                    เปิดใช้งานเลขที่เอกสารใบเสร็จรับเงิน/ใบกำกับภาษี
                                                    <br></br>
                                                    <Label className='second'>เปิดใช้งานระบบ Generate เลขที่เอกสาร ใบเสร็จรับเงิน/ใบกำกับภาษี</Label>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="enable_ShopSalesTransaction_INV_doc_code"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={20}>
                                                    เปิดใช้งานเลขที่เอกสารใบส่งสินค้า/ใบแจ้งหนี้
                                                    <br></br>
                                                    <Label className='second'>เปิดใช้งานระบบ Generate เลขที่เอกสาร ใบส่งสินค้า/ใบแจ้งหนี้</Label>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="enable_ShopSalesTransaction_TRN_doc_code"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={20}>
                                                    แยกเลขที่เอกสารระหว่างใบรับสินค้า กับใบปรับลดปรับเพิ่มสินค้า
                                                    <br></br>
                                                    <Label className='second'>ระบบจะ Generate เลขที่เอกสารใบรับสินค้า และใบปรับลดปรับเพิ่มสินค้าเป็นคนละเลขกัน</Label>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="separate_ShopInventoryTransaction_DocType_doc_code"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>

                                                <Col span={20}>
                                                    แยกเลขที่เอกสารระหว่างใบสั่งซ่อม กับใบสั่งขาย/ใบจองสินค้า
                                                    <br></br>
                                                    <Label className='second'>ระบบจะ Generate เลขที่เอกสารใบสั่งซ่อม และใบสั่งขาย/ใบจองสินค้าเป็นคนละเลขกัน</Label>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="separate_ShopSalesTransaction_DocType_doc_code"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                {/* <Col span={20}>
                                                    ใช้งานกระบวนการสร้างใบสั่งซ่อม กับใบสั่งขาย/ใบจองสินค้า แบบดั้งเดิม
                                                    <br></br>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="enable_ShopSalesTransaction_legacyStyle"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col> */}
                                                <Col span={20}>
                                                    ใช้งาน คำนำหน้านาม/ประเภทกิจการ ก่อนชื่อ ใน Printout
                                                    <br></br>
                                                    <Label className='second'>จะแสดงคำนำหน้านาม/ประเภทกิจการก่อนชื่อ ลูกค้าที่ Printout</Label>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        name="enable_title_name_print_out"
                                                    >
                                                        <Select
                                                            style={{ width: 120 }}
                                                            options={[
                                                                { value: true, label: 'ใช้งาน' },
                                                                { value: false, label: 'ไม่ใช้งาน' },
                                                            ]}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>
                                        {/* <Col md={12} xs={24}></Col> */}
                                    </Row>
                                ,
                            },
                            {
                                label: `ตั้งค่าระบบขาย`,
                                key: '2',
                                children:
                                    <Row>
                                        <Col span={20}>
                                            เปิดใช้งานการแสดงข้อมูลต้นทุน ใบสั่งซ่อม/ใบสั่งขาย ใบส่งสินค้าชั่วคราว ใบกำกับภาษี
                                            <br></br>
                                            <Label className='second'>เลือกเพื่อ แสดง/ซ่อน คอลัมน์ ต้นทุน ในตารางขณะอยู่หน้าการขาย</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="enable_sale_cost_show"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { value: true, label: 'ใช้งาน' },
                                                        { value: false, label: 'ไม่ใช้งาน' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={20}>
                                            เปิดใช้งานการ ที่อยู่ คลัง/ชั้น  ใบสั่งซ่อม/ใบสั่งขาย ใบส่งสินค้าชั่วคราว ใบกำกับภาษี
                                            <br></br>
                                            <Label className='second'>เลือกเพื่อ แสดง/ซ่อน คอลัมน์ คลัง/ชั้น ในตารางขณะอยู่หน้าการขาย</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="enable_sale_warehouse_show"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { value: true, label: 'ใช้งาน' },
                                                        { value: false, label: 'ไม่ใช้งาน' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={20}>
                                            เลือกประเภทภาษีเริ่มต้น
                                            <br></br>
                                            <Label className='second'>เลือกเพื่อตั้งค่าเริ่มต้นประเภทภาษีของหน้าการขาย</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="enable_sale_tax_type"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { value: "include_vat", label: 'รวมภาษี' },
                                                        { value: "exclude_vat", label: 'แยกภาษี' },
                                                        { value: "no_vat", label: 'ไม่คิดภาษี' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={20}>
                                            เปิดใช้งานการ การแก้ไขราคา ใบสั่งซ่อม/ใบสั่งขาย ใบส่งสินค้าชั่วคราว
                                            <br></br>
                                            <Label className='second'>จะไม่สามารถแก้ไขราคาขายได้ จะต้องเลือกจากราคาที่ กำหนดไว้เท่านั้น</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="enable_sale_price_overwrite"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { value: true, label: 'ใช้งาน' },
                                                        { value: false, label: 'ไม่ใช้งาน' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>,
                            },
                            {
                                label: `ตั้งค่าระบบคลัง`,
                                key: '3',
                                children:
                                    <Row>
                                        <Col span={20}>
                                            เปิดใช้งานการแสดงข้อมูลต้นทุน รายงานสินค้าคงคลัง รายงานสินค้าคงคลังทุกสาขา
                                            <br></br>
                                            <Label className='second'>ระบบจะแสดงข้อมูลต้นทุนจากใบรับเข้า</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="enable_warehouse_cost_show"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    options={[
                                                        { value: true, label: 'ใช้งาน' },
                                                        { value: false, label: 'ไม่ใช้งาน' },
                                                    ]}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={20}>
                                            ตั้งค่าคลังเริ่มต้น
                                            <br></br>
                                            <Label className='second'>เลือกคลังเริ่มต้นสำหรับ ใช้ในหน้าใบรับเข้า ใบปรับลดปรับเพิ่ม</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="default_warehouse_id"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    optionFilterProp="children"
                                                    placeholder="เลือกข้อมูล"
                                                    onChange={(e) => onChangeWarehouse(e)}
                                                    allowClear
                                                >
                                                    {warehouseList.map((e, i) => <Select.Option value={e.id} key={i}>{e.name[locale.locale]}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                        <Col span={20}>
                                            ตั้งค่าชั้นเริ่มต้น
                                            <br></br>
                                            <Label className='second'>เลือกชั้นเริ่มต้นสำหรับ ใช้ในหน้าใบรับเข้า ใบปรับลดปรับเพิ่ม</Label>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item
                                                name="default_shelf_id"
                                            >
                                                <Select
                                                    style={{ width: 120 }}
                                                    optionFilterProp="children"
                                                    placeholder="เลือกข้อมูล"
                                                    allowClear
                                                >
                                                    {shelfList.map((e, i) => <Select.Option value={e.code} key={i}>{e.name[locale.locale]}</Select.Option>)}
                                                </Select>
                                            </Form.Item>
                                        </Col>
                                    </Row>,
                            },
                            {
                                label: `เวลาทำการ`,
                                key: '4',
                                children:
                                    <Row>
                                        <Col span={24}>
                                            <Form.List name="business_hours" >
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, }) => (
                                                            <Row
                                                                key={key}
                                                                gutter={8}
                                                            >
                                                                <Form.Item name={"order"} hidden />
                                                                <Col span={6}>
                                                                    <Form.Item

                                                                        name={[name, 'day']}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: 'วัน',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input placeholder="วัน" style={{ width: "100%" }} disabled />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        name={[name, 'is_open']}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: 'กรุณากรอกข้อมูล',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Select
                                                                            onChange={() => { onChangeIsOpen(key) }}
                                                                            style={{ width: "100%" }}
                                                                            options={[
                                                                                { label: 'เปิด', value: true },
                                                                                { label: 'ปิด', value: false },
                                                                            ]}
                                                                        />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        name={[name, 'open_time']}
                                                                        rules={[
                                                                            {
                                                                                required: businessHours[key]?.is_open,
                                                                                message: 'กรุณากรอกข้อมูล',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <TimePicker placeholder="เวลาเปิด" style={{ width: "100%" }} disabled={!businessHours[key]?.is_open} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={6}>
                                                                    <Form.Item
                                                                        name={[name, 'close_time']}
                                                                        rules={[
                                                                            {
                                                                                required: businessHours[key]?.is_open,
                                                                                message: 'กรุณากรอกข้อมูล',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <TimePicker placeh older="เวลาปิด" style={{ width: "100%" }} disabled={!businessHours[key]?.is_open} />
                                                                    </Form.Item>
                                                                </Col>
                                                                {/* <MinusCircleOutlined onClick={() => remove(name)} /> */}
                                                            </Row>
                                                        ))}
                                                        {/* <Form.Item>
                                                            <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                                Add field
                                                            </Button>
                                                        </Form.Item> */}
                                                    </>
                                                )}
                                            </Form.List>
                                        </Col>
                                    </Row>,
                            },
                            {
                                label: `วันหยุดพิเศษ`,
                                key: '5',
                                children:
                                    <Row>
                                        <Col span={24}>
                                            <Form.List name="holidays" labelCol={0} wrapperCol={0}>
                                                {(fields, { add, remove }) => (
                                                    <>
                                                        {fields.map(({ key, name, }) => (
                                                            <Row
                                                                key={key}
                                                                gutter={8}
                                                            >
                                                                <Col span={2}>
                                                                    <Form.Item name={[name, 'order']} >
                                                                        <Input placeholder='ลำดับ' />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={12}>
                                                                    <Form.Item
                                                                        name={[name, 'day']}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: 'วัน',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <Input placeholder="วัน" style={{ width: "100%" }} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        name={[name, 'range_date']}
                                                                        rules={[
                                                                            {
                                                                                required: true,
                                                                                message: 'กรุณากรอกข้อมูล',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        <RangePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
                                                                    </Form.Item>
                                                                </Col>
                                                                <Col span={2}>
                                                                    <Button onClick={() => remove(name)} type='danger' style={{ width: "100%" }}>ลบ</Button>
                                                                </Col>
                                                            </Row>
                                                        ))}
                                                        <Form.Item>
                                                            <Button type="dashed" onClick={() => add({ order: fields.length + 1, })} block icon={<PlusOutlined />}>
                                                                เพิ่มรายการ
                                                            </Button>
                                                        </Form.Item>
                                                    </>
                                                )}
                                            </Form.List>
                                        </Col>
                                    </Row>,
                            },
                        ]}
                    />
                    <Form.Item name="enable_ShopSalesTransaction_INV_doc_code" hidden />
                    <Form.Item name="enable_ShopSalesTransaction_TRN_doc_code" hidden />
                    <Form.Item name="separate_ShopInventoryTransaction_DocType_doc_code" hidden />
                    <Form.Item name="separate_ShopSalesTransaction_DocType_doc_code" hidden />
                    <Form.Item name="enable_ShopSalesTransaction_legacyStyle" hidden />
                    <Form.Item name="enable_sale_cost_show" hidden />
                    <Form.Item name="enable_sale_tax_type" hidden />
                    <Form.Item name="enable_sale_price_overwrite" hidden />
                    <Form.Item name="enable_warehouse_cost_show" hidden />
                    <Form.Item name="business_hours" hidden />
                    <Form.Item name="holidays" hidden />
                    <Form.Item name="address" hidden />
                    <Form.Item name="default_warehouse_id" hidden />
                    <Form.Item name="default_shelf_id" hidden />
                </Form>
            </Modal>
            <style jsx global>
                {`
                    .ant-switch{
                        background: #d10000 !important;
                    }
                    .ant-switch.ant-switch-checked {
                        background: #03ba00 !important;
                    }
                    .second{
                        color: #ada9a9;
                        font-weight: 100;
                    }
                `}
            </style>

        </>
    )
}

export default SettingShop
