import React, { useEffect, useState } from "react";
import { Form, Input, Select, Row, Col, Space, Divider } from "antd";
import { useSelector } from "react-redux";
import FormProvinceDistrictSubdistrictOauth from "../../shares/FormProvinceDistrictSubdistrictOauth";
import GetIntlMessages from "../../../util/GetIntlMessages";
import { FormInputLanguage, FormSelectLanguage } from '../../shares/FormLanguage';

const UserProfileDataRegister = ({
  form,
  nameTitle,
  next
}) => {
  const { locale } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon)
  const [requiredMoile, setRequiredMoile] = useState(true)
  const [requiredTel, setRequiredTel] = useState(true)


  useEffect(() => {
    const {tel,mobile} = form.getFieldsValue()
    tel == "" || tel == undefined ? setRequiredMoile(true) : setRequiredMoile(false)
    mobile == "" || mobile == undefined ? setRequiredTel(true) : setRequiredTel(false)
  }, [])

  const handleTelRequireChange =()=>{
    const {tel,mobile} = form.getFieldsValue()
    console.log('tel', tel)
    console.log('mobile', mobile)
    if(tel){
      setRequiredMoile(false)
    }else {
      setRequiredMoile(true)
    }

  }
  const handleMobileRequireChange =()=>{
    const {tel,mobile} = form.getFieldsValue()
    console.log('tel', tel)
    console.log('mobile', mobile)
    if(mobile){
      setRequiredTel(false)
    }else {
      setRequiredTel(true)
    }

  }

  const nameTitleLayouts = {
    labelAlign:"left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      md: { span: 4 },
      lg: { span: 4 },
      xl: { span: 5 },
      xxl: { span: 3 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 21 },
      xl: { span: 19 },
      xxl: { span: 21 },
    },
  };

  const tailformItemLayout = {
    labelAlign:"left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 6 },
      lg: { span: 4 },
      xl: { span: 8 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 24 },
      lg: { span: 24 },
      xl: { span: 14 },
      xxl: { span: 13 },
    },
  };
  const importedComponentsLayouts = {
    labelAlign:"left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      md: { span: 4 },
      lg: { span: 4 },
      xl: { span: 6 },
      xxl: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      md: { span: 24 },
      lg: { span: 24 },
      xl: { span: 17 },
      xxl: { span: 16 },
    },
  };

  return (
    <>
      <Form.Item wrapperCol={{ span: 10 }}>
        <FormSelectLanguage config={{
          form,
          field: ["fname", "lname", "address"],
          // disabled: configModal.mode == "view"
        }} onChange={(value) => setFormLocale(value)} />
      </Form.Item>


      <Form.Item 
      // {...nameTitleLayouts}
        name=""
        label={GetIntlMessages("name-title")}
        rules={[
          {
            required: true,
            message: "",
          },
        ]}
      >
        <Row gutter={[10, 10]}>
          <Col xl={4} xs={16}>
            <Form.Item
              name="name_title"
              noStyle
            // rules={[{ required: true, message: "name title is required" }]}
            >
              <Select
                // style={{ width: 150 }}
                showSearch
                placeholder="เลือกข้อมูล"
                // disabled={disabled}
                // onChange={handleProvinceChange}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {nameTitle.map((e, index) => (
                  <Select.Option value={e.id} key={index}>
                    {formLocale == 'th' ? e.name_title["th"] : e.name_title["en"]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xl={10} xs={24}>
            <FormInputLanguage icon={formLocale} label={GetIntlMessages("name")} name="fname" rules={[{ required: true, message: GetIntlMessages("enter-your-first-name") }]} importedComponentsLayouts={nameTitleLayouts}/>
          </Col>

          <Col xl={10} xs={24}>
            <FormInputLanguage icon={formLocale} label={GetIntlMessages("surname")} name="lname" rules={[{ required: true, message: GetIntlMessages("enter-your-last-name") }]} importedComponentsLayouts={nameTitleLayouts}/>
          </Col>
        </Row>

        {/* </div> */}
      </Form.Item>
      <Divider />

      <Row gutter={[30, 10]}>

        <Col xl={12} xs={24}>
        {/* <Col span={10} offset={2}> */}

          <FormInputLanguage importedComponentsLayouts={importedComponentsLayouts} isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" rules={[{ required: true, message: GetIntlMessages("enter-your-address") }]} />

          <FormProvinceDistrictSubdistrictOauth importedComponentsLayouts={importedComponentsLayouts} form={form} />


        </Col>

        <Col xl={12} xs={24}>
          <Form.Item {...tailformItemLayout}
            name="id_code"
            label={GetIntlMessages("id-card")}
            rules={[
              {
                required: true,
                message: GetIntlMessages("enter-your-id-card"),
                pattern:
                  /^-?(0|INF|(0[1-7][0-7]*)|(0x[0-9a-fA-F]+)|((0|[1-9][0-9]*|(?=[\.,]))([\.,][0-9]+)?([eE]-?\d+)?))$/,
              },
            ]}
          >
            <Input maxLength={13} placeholder="1-1111-1111111-1" />
          </Form.Item>

          <Form.Item labelAlign="left" labelCol={{lg:{span:24},xl:{span:16},xxl:{span:12},}} name='' label={GetIntlMessages("telephone") + GetIntlMessages("at-least-one-phone-number")}
            rules={[
              {
                required: true,
                message: GetIntlMessages("only-number"),
              },
            ]}
          />
          <Form.Item {...tailformItemLayout}
            name="tel"
            label={GetIntlMessages("telephone")}
            onChange={handleTelRequireChange}
            rules={[
              {
                required: requiredTel,
                message: GetIntlMessages("only-number"),
                pattern: /^\d+$/,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item {...tailformItemLayout}
              name="mobile"
              label={GetIntlMessages("mobile-phone")}
              onChange={handleMobileRequireChange}
              rules={[
                {
                  required: requiredMoile,
                  message: GetIntlMessages("only-number"),
                  pattern: /^\d+$/,
                },
              ]}
            >
              <Input/>
            </Form.Item>
        </Col>
      </Row>
    </>
  );
};

export default UserProfileDataRegister;
