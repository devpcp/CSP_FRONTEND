import { Row, Col, Form, Input, Select, AutoComplete } from "antd"
import { isArray, isPlainObject,get } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../../../util/GetIntlMessages"
import Fieldset from "../../../../shares/Fieldset"

const ComponentsRoutesModalTabs2Customer = ({  onFinish, onFinishFailed ,mode}) => {
    const form = Form.useFormInstance();
    const { locale } = useSelector(({ settings }) => settings);
    /**
    * Get the value of the array field at the specified index
    * @param {string} type - The type of the field.
    * @returns The `getArrListValue` function returns an array of values.
    */
    const getArrListValue = (type) => {
        try {
            return isArray(form.getFieldValue()[type]) && form.getFieldValue()[type].length > 0 ? form.getFieldValue()[type] ?? [] : []
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }
    return (
        // <Form
        //     form={form}
        //     className="pt-3"
        //     onFinish={onFinish}
        //     onFinishFailed={onFinishFailed}
        //     labelCol={{ span: 8 }}
        //     wrapperCol={{ span: 12 }}
        // >
            <Row>
                <Col lg={{offset : 8 , span : 8}} md={{offset : 6 , span : 12}} sm={24} xs={24}>

                    <div style={{ paddingTop: "1rem" }}>
                        <Form.Item
                            name="customer_type"
                            label="ประเภทลูกค้า"
                        >
                            <Select style={{ width: "100%" }} disabled showArrow={false}>
                                <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                                <Select.Option value="business">ธุรกิจ</Select.Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="customer_id"
                            label="ชื่อลูกค้า"
                        >
                            <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("customer_list").length > 0 ? getArrListValue("customer_list").map((e) => <Select.Option value={e?.id}>{e?.customer_name[locale.locale] ?? "-"}</Select.Option>) : null}
                                {/* {customerList.map((e) => <Select.Option value={e.id}>{e?.customer_name[locale.locale]}</Select.Option>)} */}
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="customer_id"
                            label="หมายเลขประจำตัวผู้เสียภาษี"
                        >
                            <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("customer_list").length > 0 ? getArrListValue("customer_list").map((e) => <Select.Option value={e?.id}>{get(e,`tax_id`, e?.id_card_number ?? "-")}</Select.Option>): null}
                                {/* {customerList.map((e) => <Select.Option value={e.id}>{e.tax_id ? e.tax_id ?? "-" : e.id_card_number ? e.id_card_number ?? "-" : "-"}</Select.Option>)} */}
                            </Select>
                        </Form.Item>

                        <Form.Item label="ที่อยู่" >
                            <Input.TextArea rows={5} value={getArrListValue("customer_list").length > 0 ? get(getArrListValue("customer_list")[0],`address.${locale.locale}`, null): null} disabled />
                        </Form.Item>

                    </div>

                </Col>
                {/* <Col lg={12} md={24} sm={24} xs={24}>
                    <Fieldset legend={GetIntlMessages("ข้อมูลการชำระเงิน")} className="pb-3">
                        <Form.Item
                            name={["payment", "type_text"]}
                            label="ประเภทการชำระ"
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name={["payment", "cash"]}
                            label="จำนวน"
                        >
                            <Input disabled />
                        </Form.Item>

                        <Form.Item
                            name={["payment", "change"]}
                            label="เงินทอน"
                        >
                            <Input disabled />
                        </Form.Item>



                        <Form.Item
                name={["payment" , ""]}
                label="ระยะเวลาขำระ/วัน"
             >
                <Input disabled />
             </Form.Item>

                        <Form.Item
                name={["payment" , ""]}
                label="วงเงินบัตรเครดิต"
             >
                <Input disabled />
             </Form.Item>

                        <Form.Item
                name={["payment" , ""]}
                label="วงเงินคงเหลือ"
             >
                <Input disabled />
             </Form.Item>

                        <Form.Item
                            name={["payment", "remark"]}
                            label="หมายเหตุ"
                        >
                            <Input.TextArea disabled rows={5} />
                        </Form.Item>

                    </Fieldset>
                </Col> */}
            </Row>
        // </Form>
    )
}

export default ComponentsRoutesModalTabs2Customer