import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";


const LineOARegister = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  let { redirect_page } = router.query;
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const [dataForRegister, setDataForRegister] = useState(null);


  const onFinish = async (values) => {
    console.log(values)
    let line_data = cookies.get("line_data")
    dataForRegister.other_details.line_arr.map((e) => {
      if (e.line_mobile_number === values.line_mobile_number) {
        e.line_mobile_number = values.line_mobile_number
        e.line_user_id = line_data.uid
        e.line_register_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
        e.line_data = line_data
      }
    })


    const _model = { other_details: dataForRegister.other_details }
    console.log("_model", _model)
    let apiUrl = dataForRegister.bus_type_id ? "shopBusinessCustomers" : "shopPersonalCustomers"
    let res
    res = await API.put(`/${apiUrl}/put/${dataForRegister.id}`, _model)

    if (res.data.status == "success") {
      Modal.success({
        title: 'ลงทะเบียนสำเร็จ',
        centered: true,
        footer: null,
        closable: false,
        okText: "ตกลง",
        onOk: () => {
          if (redirect_page === "InventoryBalance") {
            router.push(`/LineOA/InventoryBalance`, undefined, { shallow: true })
          }
          if (redirect_page === "ShopWholeSaleDoc") {
            router.push(`/LineOA/ShopWholeSaleDoc`, undefined, { shallow: true })
          }
        }
      });

    } else {
      Modal.error({
        title: 'เกิดข้อผิดพลาด',
        centered: true,
        footer: null,
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    Modal.error({
      title: 'เกิดข้อผิดพลาด',
      content: errorInfo,
      centered: true,
      footer: null,
    });
  };

  const checkUserIsRegister = async () => {
    form.validateFields().then(async (values) => {
      let { line_mobile_number } = form.getFieldValue()
      let resBusiness = await getCustomerBusinessByLineMobileNumber(line_mobile_number)
      let resPersonal = await getCustomerPersonalByLineMobileNumber(line_mobile_number)

      if (resBusiness.status === "success" && resPersonal.status === "success") {
        let dataArr = resBusiness.data.data.concat(resPersonal.data.data)
        if (dataArr.length === 1) {
          setDataForRegister(dataArr[0])
          Modal.success({
            title: 'สำเร็จ',
            content: `พบข้อมูล เบอร์ "${line_mobile_number}" ใน "${dataArr[0].bus_type_id ? dataArr[0].customer_name[locale.locale] : `${dataArr[0].customer_name.first_name[locale.locale]} ${dataArr[0].customer_name.last_name[locale.locale]}`}" ท่านสามารถกดที่ปุ่ม  "ลงทะเบียน" เพื่อลงทะเบียนระบบไลน์กับทางร้านได้`,
            centered: true,
            footer: null,
          });
        } else if (dataArr.length === 0) {
          setDataForRegister(null)
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: ' ไม่พบเบอร์ที่ลงทะเบียน กรุณาติดต่อกับแอดมินของร้าน',
            centered: true,
            footer: null,
          });
        } else if (dataArr.length > 1) {
          setDataForRegister(null)
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: ' พบเบอร์ที่ลงทะเบียนมากกว่า 1 ลูกค้า กรุณาติดต่อกับแอดมินของร้าน ',
            centered: true,
            footer: null,
          });
        }

      } else {
        setDataForRegister(null)
        Modal.error({
          title: 'เกิดข้อผิดพลาด',
          centered: true,
          footer: null,
        });
      }
    }).catch((errorInfo) => {

    })

  }

  const getCustomerBusinessByLineMobileNumber = async (line_mobile_number) => {
    const { data } = await API.get(`/shopBusinessCustomers/all?search=${line_mobile_number}&jsonField.other_details=line_arr`);
    return data.status == "success" ? data : []
  }
  const getCustomerPersonalByLineMobileNumber = async (line_mobile_number) => {
    const { data } = await API.get(`/shopPersonalCustomers/all?search=${line_mobile_number}&jsonField.other_details=line_arr`);
    return data.status == "success" ? data : []
  }
  return (
    <>
      <Head>
        <title>{"ลงทะเบียนระบบ LINE OA"}</title>
      </Head>

      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: "80%", }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>ลงทะเบียนกับระบบไลน์</h3>
          </div>
          <Form
            form={form}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >

            <Form.Item
              className='pt-2'
              name="line_mobile_number"
              rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
            >
              <Input
                placeholder="เบอร์โทรศัพท์ที่ลงทะเบียน"
                maxLength={10}
                addonAfter={
                  <Button
                    type='text'
                    size='small'
                    style={{ border: 0 }}
                    onClick={() => checkUserIsRegister()}
                  >
                    ค้นหา
                  </Button>
                } />

            </Form.Item>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Button htmlType="submit" type="primary" disabled={dataForRegister === null}>{"ลงทะเบียน"}</Button>
            </div>

          </Form>
        </Card>
      </div>
      <style jsx global>
        {`
              body {
                background: ${mainColor};
                color: #fff;
                overflow-y: auto;
              }
            `}
      </style>
    </>
  );
};

export default LineOARegister;
