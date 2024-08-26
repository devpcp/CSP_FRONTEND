import { Col, DatePicker, Form, Input, Row } from 'antd'
import { isPlainObject } from 'lodash'
import moment from 'moment'
import React from 'react'
import { useSelector } from 'react-redux'

const ComponentsRoutesModalTab3VehicleInfo = () => {
    const form = Form.useFormInstance()

    const vehicle_customer_id = Form.useWatch(`vehicle_customer_id`, form)
    const vehicles_customers_list = Form.useWatch(`vehicles_customers_list`, { form, preserve: true })

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { vehicleColors } = useSelector(({ master }) => master);

    const getValue = (key, objName, isDate = false , isVehicleColor = false) => {
        try {
            const find = vehicles_customers_list.find(where => where.id === vehicle_customer_id)

            if (isPlainObject(find) && !!find) {
                if (isDate) {
                    return moment(find?.[key]?.[objName])
                } else if(isVehicleColor && !!find?.[key]?.[objName]){
                    return vehicleColors.find(where => where.id === find?.[key]?.[objName])[`vehicle_color_name`][locale.locale] ?? null
                }else {
                    return find?.[key]?.[objName]?.[locale.locale] ?? find?.[key]?.[objName] ?? find?.[key]
                }

            } else {
                return null
            }

        } catch (error) {
            // console.log('error getValue:>> ', error);
        }
    }
    return (
        <>
            <Row gutter={[20]}>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`เลขเครื่อง`}>
                        <Input disabled value={getValue("details", "serial_number")} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`เลขตัวถัง`}>
                        <Input disabled value={getValue("details", "chassis_number")} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`ประเภทยานพาหนะ`}>
                        <Input disabled value={getValue("VehicleType", "type_name")} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`ขนาดเครื่องยนต์ CC`}>
                        <Input disabled value={getValue("details", "cc_engine_size")} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`สีรถ`}>
                        <Input disabled value={getValue("details", "color",false,true)}/>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`วันที่ติดต่อล่าสุด`}>
                        {/* <DatePicker placeholder='' style={{ width: "100%" }} disabled value={getValue("details", "service_date_last", true)} /> */}
                        <DatePicker placeholder='' style={{ width: "100%" }} disabled value={getValue("last_service", "", true)} format={"DD/MM/YYYY"}/>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Form.Item label={`วันที่ติดต่อครั้งแรก`}>
                        <DatePicker placeholder='' style={{ width: "100%" }} disabled value={getValue("details", "service_date_first", true)} format={"DD/MM/YYYY"}/>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                <Form.Item label={`เลขไมค์ครั้งแรก`}>
                        <Input disabled value={getValue("details", "mileage_first")}/>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} xs={24}>
                <Form.Item label={`เฉลี่ย/เดือน`}>
                        <Input disabled value={getValue("details", "avg_registration_day")}/>
                    </Form.Item>
                </Col>
            </Row>
        </>
    )
}

export default ComponentsRoutesModalTab3VehicleInfo