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
    try {
      console.log(dataForRegister)
      let line_data = cookies.get("line_data")
      let line_arr = [
        {
          line_user_id: line_data.uid,
          line_register_date: moment(new Date()).format("YYYY-MM-DD HH:mm:ss"),
          line_data: line_data
        }
      ]
      let user_profile_data = dataForRegister.UsersProfile
      let details = dataForRegister.UsersProfile.details
      console.log("dd", details)
      // dataForRegister.UsersProfile.details.line_arr.map((e) => {
      //   if (e.line_mobile_number === values.line_mobile_number) {
      //     e.line_mobile_number = values.line_mobile_number
      //     e.line_user_id = line_data.uid
      //     e.line_register_date = moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
      //     e.line_data = line_data
      //   }
      // })

      details.line_arr = line_arr
      user_profile_data.details = details
      const _model = { user_profile_data }
      console.log("_model", _model)

      let res
      res = await API.put(`/shopUser/put/${dataForRegister.id}`, _model)

      if (res.data.status == "success") {
        Modal.success({
          title: 'ลงทะเบียนสำเร็จ',
          centered: true,
          footer: null,
          closable: false,
          okText: "ตกลง",
          onOk: () => {
            if (redirect_page === "InventoryAll") {
              router.push(`/LineOAInside/InventoryAll`, undefined, { shallow: true })
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
    } catch (error) {
      console.log("error", error)
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
      let { user_name } = form.getFieldValue()
      let res = await getEmployeeByLineUserId(user_name)
      console.log("res", res)
      if (res.status === "success") {
        let dataArr = res.data.data
        if (dataArr.length === 1) {
          setDataForRegister(dataArr[0])
          Modal.success({
            title: 'สำเร็จ',
            content: `พบข้อมูล ผู้ใช้ "${user_name}" ใน ท่านสามารถกดที่ปุ่ม  "ลงทะเบียน" เพื่อลงทะเบียนระบบไลน์กับทางร้านได้`,
            centered: true,
            footer: null,
          });
        } else if (dataArr.length === 0) {
          setDataForRegister(null)
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: ' ไม่พบผู้ใช้ที่ลงทะเบียน กรุณาติดต่อกับแอดมินของร้าน',
            centered: true,
            footer: null,
          });
        } else if (dataArr.length > 1) {
          setDataForRegister(null)
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: ' พบผู้ใช้ที่ลงทะเบียนมากกว่า 1 ลูกค้า กรุณาติดต่อกับแอดมินของร้าน ',
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
      console.log("error", errorInfo)
    })

  }

  const getEmployeeByLineUserId = async (line_user_id) => {
    const { data } = await API.get(`/shopUser/all?search=${line_user_id}`);
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
              name="user_name"
              rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
            >
              <Input
                placeholder="ชื่อผู้ใช้ระบบ CSP"
                maxLength={30}
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
