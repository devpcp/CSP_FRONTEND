import { Form, Input, Row, Col, Select, DatePicker, Button, Modal, Tooltip } from 'antd'
import { get, } from 'lodash'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { InfoCircleTwoTone } from '@ant-design/icons'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import PartnerData from "../../../../../routes/MyData/BusinessPartnersData"

const ComponentsRoutesModalFormProductReturnReceiptDoc = ({ mode, calculateResult, setIsModalVisible }) => {

    const form = Form.useFormInstance();

    const { locale, } = useSelector(({ settings }) => settings);
    const { taxTypes } = useSelector(({ master }) => master);
    const [isPartnerDataModalVisible, setIsPartnerDataModalVisible] = useState(false);


    const callBackPartnerData = (data) => {
        console.log("callback Data", data)
        setIsPartnerDataModalVisible(false)
        let partner_branch = data?.other_details.branch ? data?.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + data?.other_details.branch_code + " " + data?.other_details.branch_name + ")" : ""
        console.log("partner_branch", partner_branch)
        form.setFieldsValue({
            partner_id: data.id,
            partner_code: data.code_id,
            partner_name: data.partner_name[locale.locale] + " " + partner_branch,
        });
    }

    const handleCancelPartnerDataModal = () => {
        try {
            setIsPartnerDataModalVisible(false)
        } catch (error) {
            console.log("handleCancelPartnerDataModal : ", error)
        }
    }


    return (
        <>
            <Row gutter={[20, 0]}>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name='partner_id'
                        label={GetIntlMessages("รหัสผู้จำหน่าย")}
                        hidden
                    >
                        <Input hidden />
                    </Form.Item>
                    <Form.Item
                        name='partner_code'
                        label={GetIntlMessages("รหัสผู้จำหน่าย")}
                    >
                        <Input disabled />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="partner_name"
                        label="ชื่อผู้จำหน่าย"
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
                                disabled={mode !== "add"}
                                onClick={() => setIsPartnerDataModalVisible(true)}
                            >
                                เลือก
                            </Button>
                        } />
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
                            onSelect={() => calculateResult()}
                            disabled={mode === "view"}
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

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="ref_doc"
                        label="เอกสารอ้างอิง"
                    >
                        <Input disabled={mode === "view"} />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="is_inv"
                        label={
                            <>
                                {"สถานะใบกำกับภาษี"}
                                < Tooltip
                                    title="สถานะบ่งบอกว่าเอกสารใบรับเข้าใบนี้ มีเลขที่เอกสารอ้างอิง เป็นเลขที่ใบกำกับภาษีที่ออกจากทางผู้จำหน่าย">
                                    <InfoCircleTwoTone twoToneColor={"#04afe3"} style={{ padding: "0px 1px 0px 4px " }} />
                                </Tooltip>
                            </>
                        }
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล",
                            },
                        ]}
                    >
                        <Select
                            disabled={mode == "view"}
                            options={[
                                {
                                    value: true,
                                    label: 'ใช่',
                                },
                                {
                                    value: false,
                                    label: 'ไม่ใช่',
                                },
                            ]}
                        />
                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        validateTrigger={['onChange', 'onBlur']}
                        name="tax_period"
                        label={GetIntlMessages("ยื่นภาษีรวมในงวดที่")}
                        rules={[
                            {
                                required: true,
                                message: "กรุณากรอกข้อมูล",
                            },
                        ]}
                    >
                        <DatePicker picker="month" disabled={mode == "view"} format={"MM/YYYY"} style={{ width: "100%" }} />
                    </Form.Item>
                </Col>
            </Row >

            <Modal
                maskClosable={false}
                open={isPartnerDataModalVisible}
                onCancel={handleCancelPartnerDataModal}
                width="90vw"
                style={{ top: 5 }}
                closable
                footer={(
                    <>
                        <Button onClick={() => handleCancelPartnerDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                <PartnerData title="จัดการข้อมูล ผู้จำหน่าย" callBack={callBackPartnerData} />
            </Modal>
        </>

    )
}

export default ComponentsRoutesModalFormProductReturnReceiptDoc