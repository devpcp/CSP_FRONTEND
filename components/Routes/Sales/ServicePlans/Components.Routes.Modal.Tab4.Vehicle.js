import { Row, Col, Form, Input, Select, DatePicker } from "antd"
import { isArray, isPlainObject } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../../util/GetIntlMessages"
import moment from 'moment'
import API from '../../../../util/Api'

/**
 * 
 * @param {object} obj 
 * @param {import('antd').FormInstance} obj.form 
 * @returns 
 */
const Tab4Vehicle = ({ mode, form, onFinish, onFinishFailed }) => {

   const { locale } = useSelector(({ settings }) => settings);
   const { vehicleList } = useSelector(({ servicePlans }) => servicePlans);
   const { vehicleColors } = useSelector(({ master }) => master);
   const [vehicleType, setVehicleType] = useState([]) //ประเภท ยานพาหนะ
   const [isBeforeSetDate, setIsBeforeSetDate] = useState(false) //เช็ควันเอกสารว่าสร้างก่อนก่อนวันที่ 2023/04/01 หรือไม้

   useEffect(() => {
      // console.log('vehicleList', vehicleList)

      if (isArray(vehicleList)) {
         const { vehicles_customers_id, doc_date } = form.getFieldValue();
         const setDate = moment("2023-04-01")
         const isBefore = moment(doc_date).isBefore(setDate)
         setIsBeforeSetDate(() => isBefore)

         const find = vehicleList.find(where => where.id === vehicles_customers_id);
         if (isPlainObject(find)) {
            // console.log('find', find)
            form.setFieldsValue({
               vehicle_type_id: find.vehicle_type_id,
               vehicles_color_id: find.details?.color ?? null,
               avg_registration_month: find.avg_registration_day,
            })
         }
      }
      getMasterData()
   }, [vehicleList])

   const getMasterData = async () => {
      try {
         const [value1] = await Promise.all([getVehicleType()])
         if (isArray(value1)) setVehicleType(value1)


         // 
      } catch (error) {
         console.log('error', error)
      }
   }

   /* get Master getVehicleType (ประเภท ยานพาหนะ) */
   const getVehicleType = async () => {
      const { data } = await API.get(`/master/vehicleType/all`);
      return data.status = "success" ? data.data : []
   }

   return (
      <Form
         form={form}
         className="pt-3"
         onFinish={onFinish}
         onFinishFailed={onFinishFailed}
         labelCol={{ span: 6 }}
         wrapperCol={{ span: 12 }}
      >
         <Row>
            <Col lg={12} md={24} sm={24} xs={24}>

               <div style={{ paddingTop: "5rem" }}>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="เลขเครื่อง"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option key={`serial_number-${e.id}`} value={e.id}>{e.details.serial_number ?? ""}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="เลขตัวถัง"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option key={`chassis_number-${e.id}`} value={e.id}>{e.details.chassis_number ?? ""}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="vehicle_type_id"
                     label={GetIntlMessages(`vehicle-type`)}
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleType.map((e) => <Select.Option key={e.id} value={e.id}>{e.type_name[locale.locale]}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="ขนาดเครื่องยนต์ CC"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option key={`cc_engine_size-${e.id}`} value={e.id}>{e.details.cc_engine_size ?? ""}</Select.Option>)}
                     </Select>
                  </Form.Item>
                  {isBeforeSetDate === true ?
                     <Form.Item
                        name="vehicles_customers_id"
                        label="สีรถ"
                     >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                           {vehicleList.map((e) => <Select.Option key={`color-${e.id}`} value={e.id}>{e.details.color ?? ""}</Select.Option>)}
                        </Select>
                     </Form.Item>
                     :
                     <Form.Item
                        name="vehicles_color_id"
                        label="สีรถ"
                     >
                        <Select style={{ width: "100%" }} disabled showArrow={false}>
                           {vehicleColors.map((e) => <Select.Option key={`color-${e.id}`} value={e.id}>{e.vehicle_color_name[locale.locale] ?? null}</Select.Option>)}
                        </Select>
                     </Form.Item>
                  }



               </div>

            </Col>

            <Col lg={12} md={24} sm={24} xs={24}>

               <div style={{ paddingTop: "5rem" }}>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="วันที่ติดต่อล่าสุด"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option value={e.id}>{e.details.service_date_last ? moment(new Date(e.details.service_date_last)).format("DD/MM/YYYY") : ""}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="วันที่ติดต่อครั้งแรก"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option value={e.id}>{e.details.service_date_first ? moment(new Date(e.details.service_date_first)).format("DD/MM/YYYY") : ""}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="vehicles_customers_id"
                     label="เลขไมค์ครั้งแรก"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {vehicleList.map((e) => <Select.Option key={`color-${e.id}`} value={e.id}>{e.details.mileage_first ?? ""}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item
                     name="avg_registration_month"
                     label="เฉลี่ย/เดือน"
                  >
                     <Input disabled />
                  </Form.Item>

               </div>

            </Col>
         </Row>
      </Form>
   )
}

export default Tab4Vehicle