import React, { useState } from "react";
import { Form, Input } from "antd";
import GetIntlMessages from "../../../util/GetIntlMessages";
import API from '../../../util/Api/Oauth/Guest'
import Swal from "sweetalert2";

const UserDataRegister = ({ form, currentSteps }) => {



  const checkUsername = async (value) => {
    const { data } = await API.get(`/validators/user?user_name=${value.target.value}`)
    // console.log('data.data getProductMasterDataAll', Object.keys(data.data).length)
    if (data.data.user_name !== null && Object.keys(data.data).length !== 0) {
      Swal.fire({
        icon: 'warning',
        title: GetIntlMessages("warning"),
        text: GetIntlMessages("มีผู้ใช้ชื่อผู้ใช้นี้แล้ว"),
      });
      form.setFieldsValue({ user_name: null })
    }
  }

  const checkEmail = async (value) => {
    const { data } = await API.get(`/validators/user?e_mail=${value.target.value}`)
    console.log('data.data', data.data)
    console.log('data.data getProductMasterDataAll', Object.keys(data.data).length)
    if (data.data.e_mail !== null && data.data !== `querystring.e_mail should match format "email"`) {
      Swal.fire({
        icon: 'warning',
        title: GetIntlMessages("warning"),
        text: GetIntlMessages("มีผู้ใช้อีเมลนี้แล้ว"),
      });
      form.setFieldsValue({ e_mail: null })
    }
  }


  const tailformItemLayout = {
    labelAlign:"left",
    labelCol: {
      xs: { span: 24 },
      // sm: { span: 8 },
      // md: { span: 8 },
      lg: { span: 8 },
      xl: { span: 6 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      // md: { span: 24 },
      lg: { span: 11 },
      xl: { span: 14 },
      xxl: { span: 12 },
    },
  };


  return (
    <>
      <div
        className="head-line-text"
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* ลงทะเบียนผู้ใช้ */}
        {/* {GetIntlMessages("user-register")} */}
      </div>

      <Form.Item 
      {...tailformItemLayout}
        name="user_name"
        label={GetIntlMessages("username")}
        rules={[{ required: true, message: GetIntlMessages("enter-your-username") }]}
      >
        <Input onBlur={checkUsername} placeholder="Username" />
      </Form.Item>
      <Form.Item {...tailformItemLayout}
        name="e_mail"
        label={GetIntlMessages("email")}
        rules={[
          {
            type: "email",
            required: true,
            message: GetIntlMessages("enter-your-email"),
            // message: "กรุณาใส่อีเมล์ของคุณ",
          },
          {
            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            message: GetIntlMessages("only-english"),
          },
        ]}
      >
        <Input onBlur={checkEmail} placeholder="example@gmail.com" />
      </Form.Item>
      <Form.Item {...tailformItemLayout}
        name="password"
        label={GetIntlMessages("password")}
        extra={GetIntlMessages("***กรุณาใส่รหัสผ่านมากกว่า 8 ตัว, มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว,มีตัวเลขอย่างน้อย 1 ตัว และ มีตัวอักขระพิเศษอย่างน้อย 1 ตัว")}
        rules={[
          {
            required: true,
            message: GetIntlMessages("enter-your-password"),
            // message: "Please input your password!",
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
            message: GetIntlMessages("validate-password"),
            // message: "Please enter a password of more than 8 characters. It must contain at least 1 capital letter and letters!",
          },
        ]}
        hasFeedback
      >
        <Input.Password placeholder="Password" />

      </Form.Item>



      <Form.Item {...tailformItemLayout}
        name="c_password"
        label={GetIntlMessages("confirm-password")}
        // rules={[
        //   {
        //     required: true,
        //     message: GetIntlMessages("enter-your-confirm-password"),
        //     // message: "Please input your confirm password!",
        //     // pattern: ('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[$@$!#^~%*?&,.<>"\'\\;:\{\\\}\\\[\\\]\\\|\\\+\\\-\\\=\\\_\\\)\\\(\\\)\\\`\\\/\\\\\\]])[A-Za-z0-9\d$@].{7,}'),
        //     // message: "Please enter a password of more than 8 characters. It must contain at least 1 capital letter and letters!",
        //   },
        // ]}
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: GetIntlMessages("enter-your-confirm-password"),
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error(GetIntlMessages("confirm-password-does-not-match")));
            },
          }),
        ]}
      >
        <Input.Password placeholder="Confirm Password" />
      </Form.Item>
    </>
  );
};

export default UserDataRegister;
