import { Col, DatePicker, Form, Input, Row, Select, Divider, Button } from 'antd'
import { isArray } from 'lodash'
import React, { useEffect, useState } from 'react'
import Fieldset from '../../../../../shares/Fieldset'
import GetIntlMessages from '../../../../../../util/GetIntlMessages'
import {
    TagsOutlined
} from "@ant-design/icons";
import API from '../../../../../../util/Api'
import { useSelector } from 'react-redux'

const ComponentsRoutesModalTab2customerInfo = () => {
    const { locale } = useSelector(({ settings }) => settings);
    const form = Form.useFormInstance()

    const customerType = Form.useWatch("customer_type", form)
    const [tagsList, setTagsList] = useState([])
    const getArrValue = (type) => {
        try {
            // const watchData = Form.useWatch(type, form)
            const watchData = Form.useWatch(type, { form, preserve: true })
            // console.log('watchData :>> ', watchData);
            return !!watchData && isArray(watchData) ? watchData ?? [] : []
        } catch (error) {
            // console.log('error getArrValue:>> ', error);
        }
    }
    useEffect(() => {
        getMasterData()
    }, [])

    const getMasterData = async () => {
        try {
            const [value1] = await Promise.all([getTagsListAll()])

            setTagsList(() => [...value1])
        } catch (error) {
            console.log('getMasterData error :>> ', error);
        }
    }

    const getTagsListAll = async () => {
        const { data } = await API.get(`/shopTags/all?limit=99999&page=1&sort=run_no&order=asc&status=default`)
        return data.status === "success" ? data.data.data ?? [] : []
    }

    return (
        <>
            <Row gutter={[20]}>
                <Col lg={12} xs={24}>
                    <Row>
                        <Col span={24}>
                            <Form.Item label="ประเภทลูกค้า" name={`customer_type`}>
                                <Select style={{ width: "100%" }} disabled showArrow={false}>
                                    <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                    <Select.Option value="business">ธุรกิจ</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="customer_id"
                                label="ชื่อลูกค้า"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    // notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled
                                >
                                    {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{e.customer_full_name}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="customer_id"
                                label="หมายเลขประจำตัวผู้เสียภาษี"
                            >
                                <Select
                                    showSearch
                                    showArrow={false}
                                    filterOption={false}
                                    // notFoundContent={loadingEasySearch ? "กำลังค้นหาข้อมูล...กรุณารอสักครู่..." : "ไม่พบข้อมูล"}
                                    style={{ width: "100%" }}
                                    disabled
                                >
                                    {getArrValue("customer_list").map(e => <Select.Option value={e.id} key={`customer-id-${e.id}`}>{customerType === "person" ? e?.id_card_number ?? "-" : e?.tax_id ?? "-"}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="tags"
                                label="แท็ก"
                            >
                                <Select
                                    disabled
                                    mode="multiple"
                                    allowClear
                                    style={{ width: '100%' }}
                                    placeholder="เลือกข้อมูล"
                                    filterOption={(inputValue, option) => {
                                        if (_.isPlainObject(option)) {
                                            if (option.children) {
                                                return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                            }
                                        }
                                    }}
                                    dropdownRender={(menu) => (
                                        <>
                                            {menu}
                                            <>
                                                <Divider style={{ margin: "8px 0" }} />

                                                <Button onClick={() => setShowModalTagsData(true)}><TagsOutlined />จัดการข้อมูลแท๊ก</Button>
                                            </>
                                        </>
                                    )}

                                >
                                    {isArray(tagsList) && tagsList.length > 0 ? tagsList.map((e, index) => (
                                        <Select.Option value={e.id} key={index}>
                                            {e.tag_name[locale.locale]}
                                        </Select.Option>
                                    ))
                                        : null
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="ที่อยู่"
                            >
                                <Input.TextArea disabled rows={9} />
                            </Form.Item>
                        </Col>
                    </Row>

                </Col>
                <Col lg={12} xs={24}>
                    <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>ข้อมูลการชำระเงิน</span>)}>
                        <Row gutter={[0, 0]}>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("ประเภทการชำระ")} name={["payment", "payment_type"]}>
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("จำนวน")} name={["payment", "price"]}>
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("เงินทอน")} name={["payment", "change"]}>
                                    <Input disabled />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("วันเวลาที่ชำระเงิน")} name={["payment", "payment_date"]}>
                                    <DatePicker placeholder='' style={{ width: "100%" }} disabled format={"DD/MM/YYYY"} />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={GetIntlMessages("หมายเหตุ")} name={["payment", "remark"]}>
                                    <Input.TextArea disabled />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Fieldset>
                </Col>
            </Row>
        </>
    )
}

export default ComponentsRoutesModalTab2customerInfo