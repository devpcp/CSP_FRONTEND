import { Form, Input, Row, Col, Select, DatePicker, Button, Modal } from 'antd'
import { filter, get, isFunction } from 'lodash'
import React, { Children, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import EmployeeData from '../../../../../routes/MyData/EmployeeData';
import GetIntlMessages from '../../../../../util/GetIntlMessages'

const FormTranferInventoryDoc = ({ mode, calculateResult, callBack }) => {

    const form = Form.useFormInstance();

    const { locale, } = useSelector(({ settings }) => settings);
    const { taxTypes, shopInCorporate } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);

    const [isEmployeeModalVisible, setIsEmployeeModalVisible] = useState(false);

    const callBackEmployee = (data) => {
        setIsEmployeeModalVisible(false)
        form.setFieldsValue({
            approver_id: data.id,
            approver_name: data.UsersProfile.fname[locale.locale] + " " + data.UsersProfile.lname[locale.locale],
        });
    }
    const handleCancelEmployeeModal = () => {
        try {
            setIsEmployeeModalVisible(false)
        } catch (error) {
            console.log("handleCancelEmployeeModal : ", error)
        }
    }

    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='approver_id'
                        label={GetIntlMessages("รหัสผู้อนุมัติ")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="approver_name"
                        label="ผู้อนุมัติ"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled addonAfter={
                            <Button
                                type='text'
                                size='small'
                                style={{ border: 0 }}
                                disabled={mode === "view"}
                                onClick={() => setIsEmployeeModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='shop_sender_id'
                        label={GetIntlMessages("รหัสผู้อนุมัติ")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name="shop_sender_name"
                        label="สาขาต้นทาง"
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                            },
                        ]}
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="shop_recipient_id"
                        label="สาขาปลายทาง"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกข้อมูล"
                            },
                        ]}
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            optionFilterProp="children"
                            notFoundContent={"ไม่พบข้อมูล"}
                            placeholder="กรุณาพิมพ์อย่าง 1 ตัวเพื่อค้นหา"
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                        >
                            {isFunction(callBack) ?
                                shopInCorporate?.map(e => <Select.Option value={e.id} key={`partner-id-${e.id}`}>{`${e.shop_name[locale.locale]} ${!!e.shop_name.shop_local_name ? `(${e.shop_name.shop_local_name})` : ""}`}</Select.Option>)
                                :
                                shopInCorporate?.filter(x => x.id !== authUser?.UsersProfile?.ShopsProfile?.id).map(e => <Select.Option value={e.id} key={`partner-id-${e.id}`}>{`${e.shop_name[locale.locale]} ${!!e.shop_name.shop_local_name ? `(${e.shop_name.shop_local_name})` : ""}`}</Select.Option>)
                            }

                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} >
                    <Form.Item
                        name="tax_type_id"
                        label={`ประเภทภาษี`}
                    >
                        <Select
                            showSearch
                            optionFilterProp="children"
                            showArrow={false}
                            style={{ width: "100%" }}
                            disabled={mode === "view"}
                            onSelect={() => calculateResult()}
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{e?.type_name[locale.locale]}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24} >
                    <Form.Item
                        name="tax_type_id"
                        label="อัตราภาษี (%)"
                    >
                        <Select
                            showSearch
                            showArrow={false}
                            filterOption={false}
                            style={{ width: "100%" }}
                            disabled
                        >
                            {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label="วันที่เอกสาร"
                        rules={[
                            {
                                required: true,
                                message: "กรุณาเลือกข้อมูล"
                            },
                        ]}
                    >
                        <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view"} />
                    </Form.Item>
                </Col>
            </Row>
            <Modal
                maskClosable={false}
                open={isEmployeeModalVisible}
                onCancel={handleCancelEmployeeModal}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelEmployeeModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <EmployeeData title="จัดการข้อมูลพนักงาน" callBack={callBackEmployee} filter_department_id="c39487ed-942d-4b63-bd08-28f774ec4211" />
            </Modal>
        </>

    )
}

export default FormTranferInventoryDoc