import { Row, Col, Form, Input, Select, AutoComplete } from "antd"
import { isArray, isPlainObject, get } from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../../../util/GetIntlMessages"
import Fieldset from "../../../../shares/Fieldset"

const ComponentsRoutesModalTabs4QuotationVehicle = ({ onFinish, onFinishFailed, mode }) => {
    const form = Form.useFormInstance();
    const { locale } = useSelector(({ settings }) => settings);
    const { vehicleColors } = useSelector(({ master }) => master);

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

    const checkDocDate = () => {
        try {
            const { doc_date } = form.getFieldValue()
            const setDate = moment("2023-04-01")
            if (doc_date) return moment(doc_date).isBefore(setDate)
            else return false
        } catch (error) {

        }
    }
    return (
        // <Form
        //     form={form}
        //     className="pt-3"
        //     onFinish={onFinish}
        //     onFinishFailed={onFinishFailed}
        //     labelCol={{ span: 6 }}
        //     wrapperCol={{ span: 12 }}
        // >
        <Row>
            <Col lg={{ offset: 4, span: 6 }} md={24} sm={24} xs={24}>

                <div style={{ paddingTop: "1rem" }}>

                    <Form.Item
                        name="vehicles_customers_id"
                        label="เลขเครื่อง"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option key={`serial_number-${e.id}`} value={e?.id}>{!!e?.details.serial_number ? e?.details.serial_number : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicles_customers_id"
                        label="เลขตัวถัง"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option key={`chassis_number-${e.id}`} value={e?.id}>{!!e?.details.chassis_number ? e?.details.chassis_number : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicle_type_id"
                        label={GetIntlMessages(`vehicle-type`)}
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option key={e?.VehicleType.id} value={e?.VehicleType.id}>{e?.VehicleType.type_name[locale.locale]}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicles_customers_id"
                        label="ขนาดเครื่องยนต์ CC"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option key={`cc_engine_size-${e.id}`} value={e?.id}>{!!e?.details.cc_engine_size ? e?.details.cc_engine_size : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    {checkDocDate() ?
                        <Form.Item
                            name="vehicles_customers_id"
                            label="สีรถ"
                        >
                            <Select style={{ width: "100%" }} disabled showArrow={false}>
                                {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option key={`color-${e.id}`} value={e?.id}>{!!e?.details.color ? e?.details.color : "-"}</Select.Option>) : null}
                            </Select>
                        </Form.Item>
                        :
                        <Form.Item
                            name="vehicles_color_id"
                            label="สีรถ"
                        >
                            <Select style={{ width: "100%" }} disabled showArrow={false}>
                                {vehicleColors.length > 0 ? vehicleColors.map((e) => <Select.Option key={`color-${e.id}`} value={e?.id}>{e?.vehicle_color_name[locale.locale]}</Select.Option>) : []}
                            </Select>
                        </Form.Item>
                    }



                </div>

            </Col>
            {/* <Col lg={4} md={0} sm={0} xs={0}/> */}
            <Col lg={{ offset: 4, span: 6 }} md={24} sm={24} xs={24}>

                <div style={{ paddingTop: "5rem" }}>
                    <Form.Item
                        name="vehicles_customers_id"
                        label="วันที่ติดต่อล่าสุด"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{!!e?.details.service_date_last ? moment(new Date(e?.details.service_date_last)).format("DD/MM/YYYY") : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicles_customers_id"
                        label="วันที่ติดต่อครั้งแรก"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{!!e?.details.service_date_first ? moment(new Date(e?.details.service_date_first)).format("DD/MM/YYYY") : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="vehicles_customers_id"
                        label="เลขไมค์ครั้งแรก"
                    >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                            {getArrListValue("shop_vehicle_list").length > 0 ? getArrListValue("shop_vehicle_list").map((e) => <Select.Option value={e?.id}>{!!e?.details.mileage_first ? e?.details.mileage_first : "-"}</Select.Option>) : null}
                        </Select>
                    </Form.Item>




                    {/* <Form.Item
                            name="avg_registration_month"
                            label="เฉลี่ย/เดือน"
                        >
                            <Input disabled />
                        </Form.Item> */}

                </div>

            </Col>
        </Row>
        // </Form>
    )
}

export default ComponentsRoutesModalTabs4QuotationVehicle