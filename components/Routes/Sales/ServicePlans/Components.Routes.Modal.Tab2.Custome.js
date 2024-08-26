import { Row, Col, Form, Input, Select, AutoComplete, DatePicker } from "antd"
import { isPlainObject } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../../util/GetIntlMessages"
import Fieldset from "../../../shares/Fieldset"
import { useForm } from "antd/lib/form/Form";

/**
 * 
 * @param {object} obj 
 * @param {import('antd').FormInstance} obj.form 
 * @returns 
 */
const Tab2Custome = ({ mode, form, onFinish, onFinishFailed }) => {

   const { locale } = useSelector(({ settings }) => settings);
   const { customerList } = useSelector(({ servicePlans }) => servicePlans);
   const [address, setAddress] = useState("")
   useEffect(() => {
      if (form) {
         const value = form.getFieldValue();
         if (isPlainObject(value)) {
            // console.log('value =>>>>>>>>', value)
            const find = customerList.find(where => where.id === value.customer_id);
            if (isPlainObject(find)) {
               // console.log('find', find)
               setAddress(find.address)
            }

         }
      }
   }, [form])

   return (
      <Form
         form={form}
         className="pt-3"
         onFinish={onFinish}
         onFinishFailed={onFinishFailed}
         labelCol={{ span: 8 }}
         wrapperCol={{ span: 12 }}
      >
         <Row>
            <Col lg={12} md={24} sm={24} xs={24}>

               <div style={{ paddingTop: "5rem" }}>
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
                        {customerList.map((e) => <Select.Option value={e.id}>{e?.customer_name[locale.locale]}</Select.Option>)}
                     </Select>
                  </Form.Item>
                  <Form.Item
                     name="customer_id"
                     label="หมายเลขประจำตัวผู้เสียภาษี"
                  >
                     <Select style={{ width: "100%" }} disabled showArrow={false}>
                        {customerList.map((e) => <Select.Option value={e.id}>{e.tax_id ? e.tax_id ?? "-" : e.id_card_number ? e.id_card_number ?? "-" : "-"}</Select.Option>)}
                     </Select>
                  </Form.Item>

                  <Form.Item label="ที่อยู่" >
                     <Input.TextArea rows={5} value={isPlainObject(address) ? address[locale.locale] : null} disabled />
                  </Form.Item>

               </div>

            </Col>
            <Col lg={12} md={24} sm={24} xs={24}>
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
                     name={["payment", "payment_date"]}
                     label="วันเวลาที่ชำระเงิน"
                  >
                     <DatePicker placeholder={null} style={{width : "100%"}} disabled format={"DD/MM/YYYY HH:mm:ss"} />
                  </Form.Item>


                  {form.getFieldValue().payment !== undefined && form.getFieldValue().payment.type !== null ? form.getFieldValue().payment.type === 2 ?
                     <>
                        <Form.Item
                           name={["payment", "bank_name"]}
                           label="ธนาคารเจ้าของบัตร"
                        >
                           <Input disabled />
                        </Form.Item>
                        <Form.Item
                           name={["payment", "card_type_text"]}
                           label="ชนิดบัตร"
                        >
                           <Input disabled />
                        </Form.Item>
                        <Form.Item
                           name={["payment", "payment_method_text"]}
                           label="รูปแบบการรูด"
                        >
                           <Input disabled />
                        </Form.Item>
                     </>
                     : null : null}
                  {form.getFieldValue().payment !== undefined && form.getFieldValue().payment.type !== null ? form.getFieldValue().payment.type === 3 ?
                     <>
                        <Form.Item
                           name={["payment", "transferor_name"]}
                           label="ชื่อผู้โอน"
                        >
                           <Input disabled />
                        </Form.Item>
                        <Form.Item
                           name={["payment", "transfer_time"]}
                           label="วันเวลาที่โอน"
                        >
                           <DatePicker disabled style={{ width: "100%" }} format={"YYYY-MM-DD HH:mm"} showTime={{ format: "HH:mm" }} />
                        </Form.Item>
                     </>
                     : null : null}




                  {/* <Form.Item
                     name={["payment" , ""]}
                     label="ระยะเวลาขำระ/วัน"
                  >
                     <Input disabled />
                  </Form.Item> */}

                  {/* <Form.Item
                     name={["payment" , ""]}
                     label="วงเงินบัตรเครดิต"
                  >
                     <Input disabled />
                  </Form.Item> */}

                  {/* <Form.Item
                     name={["payment" , ""]}
                     label="วงเงินคงเหลือ"
                  >
                     <Input disabled />
                  </Form.Item> */}

                  <Form.Item
                     name={["payment", "remark"]}
                     label="หมายเหตุ"
                  >
                     <Input.TextArea disabled rows={5} />
                  </Form.Item>

               </Fieldset>
            </Col>
         </Row>
      </Form>
   )
}

export default Tab2Custome