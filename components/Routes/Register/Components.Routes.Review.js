import React, { useEffect, useState } from "react";
import { Form, Input, Space, Row, Col, Checkbox, Button, Select, Modal, Divider } from "antd";
import API from "../../../util/Api/Oauth/Guest";
import axios from "axios";
import GetTextValueSelect from "../../../util/GetTextValueSelect";
import GetIntlMessages from "../../../util/GetIntlMessages";
import { useSelector } from "react-redux";
import { FormInputLanguage, FormSelectLanguage } from '../../shares/FormLanguage';
import FormProvinceDistrictSubdistrictOauth from "../../shares/FormProvinceDistrictSubdistrictOauth";

const Review = ({
  userData,
  userProfileData,
  shopData,
  businessTypeList,
  nameTitle,
  form,
  getCheckedPolicy,
  getCheckedPolicyInModal
}) => {

  useEffect(() => {
    getCheckedPolicy(checkedPolicy)
    getCheckedPolicyInModal(checkedPolicy)
    console.log('shopData', shopData)
  }, [])

  const { locale } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon)

  const tailformItemLayout = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5, },
      sm: { span: 24 },
      // md: { span: 4, },
      // lg: { span: 3, },
      // xl: { span: 10, },
      xxl: { span: 7, },
    },
    wrapperCol: {
      xs: { span: 20, },
      sm: { span: 24, },
      // md: { span: 18, },
      // lg: { span: 16, },
      // xl: { span: 14, },
      xxl: { span: 18, },
    },
  };
  const importedComponentsLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 24 },
      // sm: { span: 24 },
      // md: { span: 6 },
      // lg: { span: 6 },
      // xl: { span: 8 },
      xxl: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      // sm: { span: 24 },
      // md: { span: 24 },
      // lg: { span: 15 },
      // xl: { span: 14 },
      xxl: { span: 16 },
    },
  };
  const shopNameLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      // lg: { span: 3 },
      // xl: { span: 10 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      // lg: { span: 16 },
      // xl: { span: 14 },
      xxl: { span: 17 },
    },
  };
  const nameSurnameLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5, },
      sm: { span: 24 },
      // md: { span: 4, },
      // lg: { span: 3, },
      // xl: { span: 10, },
      xxl: { span: 7, },
    },
    wrapperCol: {
      xs: { span: 20, },
      sm: { span: 24 },
      // md: { span: 18, },
      // lg: { span: 16, },
      // xl: { span: 14, },
      xxl: { span: 18, },
    },
  };

  const telNoItemLayout = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      // lg: { span: 4 },
      // xl: { span: 10 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      // lg: { span: 15 },
      // xl: { span: 14 },
      xxl: { span: 17 },
    },
  };

  const { user_name, password, e_mail } = userData.user_data;
  const {
    name_title,
    fname,
    lname,
    address,
    province_id,
    district_id,
    subdistrict_id,
    tel,
    mobile,
    zip_code,
  } = userProfileData.user_profile_data;

  // const {
  //   // shop_code_id,
  //   tax_code_id,
  //   bus_type_id,
  //   shop_name,
  //   tel_no,
  //   mobile_no,
  // } = shopData.shop_profile_data;

  const [isModalPolicyVisible1, setIsModalPolicyVisible1] = useState(false);
  const [checkedPolicy, seCheckedPolicy] = useState(false);

  const onOpenPolicy1 = () => {
    setIsModalPolicyVisible1(true)
  }

  const onCancelPolicy1 = () => {
    setIsModalPolicyVisible1(false)
  }
  const onOkPolicy1 = (value) => {
    seCheckedPolicy(true)
    setIsModalPolicyVisible1(false)
    getCheckedPolicyInModal(value.nativeEvent.returnValue)
  }
  const onClickPolicy = () => {
    seCheckedPolicy(!checkedPolicy)
    getCheckedPolicyInModal(!checkedPolicy)
  }
  const onChangePolicy = (value) => {
    getCheckedPolicy(value.target.checked)
  }

  return (
    <>
      <div
        className="head-line-text"
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {GetIntlMessages("user-info-review")}
      </div>


      <Form.Item wrapperCol={{ span: 10 }}>
        <FormSelectLanguage config={{
          form,
          field: [""],
          disabled: true
          // disabled: configModal.mode == "view"
        }} onChange={(value) => setFormLocale(value)} />
      </Form.Item>

      <Row gutter={[30, 10]}>
        <Col xl={{ span: 10, offset: 2 }} md={24} >
          <Form.Item {...tailformItemLayout} label={GetIntlMessages("username")}>
            <Input disabled value={user_name} />
          </Form.Item>
          <Form.Item {...tailformItemLayout} label={GetIntlMessages("password")}>
            <Input.Password disabled value={password} />
          </Form.Item>
          <Form.Item {...tailformItemLayout} label={GetIntlMessages("email")}>
            <Input disabled value={e_mail} />
          </Form.Item>

          <Form.Item {...nameSurnameLayouts} name="" label={GetIntlMessages("name-surname")} >

            <Row gutter={[10, 10]}>
              <Col xxl={6} xl={12} md={12} xs={16}>
                <Form.Item
                  name="name_title"
                  noStyle
                >
                  <Select
                    showSearch
                    placeholder="เลือกข้อมูล"
                    disabled
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


              <Col xxl={9} xl={24} md={24}>
                <FormInputLanguage disabled icon={formLocale} label={null} name="fname" />
              </Col>
              <Col xxl={9} xl={24} md={24}>
                <FormInputLanguage disabled icon={formLocale} label={null} name="lname" />
              </Col>

            </Row>
          </Form.Item>


          <Form.Item {...telNoItemLayout} label={GetIntlMessages("telephone")}>
            <Input disabled value={tel} />
          </Form.Item>
          <Form.Item {...telNoItemLayout} label={GetIntlMessages("mobile-phone")}>
            <Input disabled value={mobile} />
          </Form.Item>
        </Col>

        <Col xl={12} md={24}>
          <FormInputLanguage importedComponentsLayouts={importedComponentsLayouts} disabled isTextArea icon={formLocale} label={GetIntlMessages("address")} name="address" />

          <FormProvinceDistrictSubdistrictOauth importedComponentsLayouts={importedComponentsLayouts} disabled form={form} />
        </Col>

      </Row>

      <Divider />

      <div
        className="head-line-text"
        style={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        {GetIntlMessages("shop-info-review")}
      </div>

      <Row gutter={[30, 10]}>
        <Col xl={{ span: 10, offset: 2 }} xs={24} >
          <Form.Item {...tailformItemLayout} name="tax_code_id" label={GetIntlMessages("tax-id")} >
            <Input disabled/>
          </Form.Item>
          {/* <Form.Item {...tailformItemLayout} label={GetIntlMessages("tax-id")}>
            <Input disabled value={tax_code_id ?? ""} />
          </Form.Item> */}
          <Form.Item {...tailformItemLayout} name="bus_type_id" label={GetIntlMessages("business-type")}>
            <Select
              showSearch
              placeholder="เลือกข้อมูล"
              // onChange={onBusinessTypeChange}
              disabled
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {businessTypeList.map((e, index) => (
                <Select.Option value={e.id} key={index}>
                  {e.business_type_name[locale.locale]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          {/* <Form.Item {...tailformItemLayout} label={GetIntlMessages("business-type")}>
            <Input
              disabled
              value={
                GetTextValueSelect(bus_type_id ?? "", businessTypeList, {
                  key: "id",
                  value: "business_type_name",
                })[locale.locale] ?? "-"
              }
            />
          </Form.Item> */}

          <FormInputLanguage importedComponentsLayouts={shopNameLayouts} disabled icon={formLocale} label={GetIntlMessages("shop-name")} name="shop_name" />

          <Form.Item {...tailformItemLayout} label={GetIntlMessages("email")}>
            <Input disabled value={shopData.shop_profile_data.e_mail} />
          </Form.Item>

          <Form.Item
            {...telNoItemLayout}
            label={GetIntlMessages("telephone")}
            name="tel_no"
          >
            <Form.List name="tel_no">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        name={[field.name, "tel_no"]}
                        fieldKey={[field.fieldKey, "tel_no"]}
                        noStyle
                      >
                        <Input disabled placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                      </Form.Item>
                    </Form.Item>
                  ))}

                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            {...telNoItemLayout}
            label={GetIntlMessages("mobile-phone")}
            name="mobile_no"
          >
            <Form.List name="mobile_no" >
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      required={false}
                      key={field.key}
                    >
                      <Form.Item
                        {...field}
                        validateTrigger={['onChange', 'onBlur']}
                        name={[field.name, "mobile_no"]}
                        fieldKey={[field.fieldKey, "mobile_no"]}
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
                          },
                        ]}
                        noStyle
                      >
                        <Input disabled placeholder="กรอกเบอร์โทรศัพท์มือถือ" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                      </Form.Item>
                    </Form.Item>
                  ))}

                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item
            {...tailformItemLayout}
            name='sub_domain_name'
            label={GetIntlMessages("ชื่อ Sub-Domain ของท่าน")}

            rules={[
              {
                required: true,
                whitespace: true,
                message: "กรุณากรอกเบอร์โทรศัพท์มือถือ",
              },
            ]}
          >
            <Input disabled addonBefore="http://" addonAfter="carserviceerp.com" placeholder="myURL" />
          </Form.Item>
        </Col>

        <Col xl={12} xs={24}>
          <FormInputLanguage importedComponentsLayouts={importedComponentsLayouts} disabled isTextArea icon={formLocale} label={GetIntlMessages("address")} name="shop_address" />

          <FormProvinceDistrictSubdistrictOauth importedComponentsLayouts={importedComponentsLayouts} disabled form={form} name={{ province: "shop_province_id", district: "shop_district_id", subdistrict: "shop_subdistrict_id", zip_code: "shop_zip_code" }} />
        </Col>

        <Divider />

        <Col span={12} offset={6} >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Checkbox checked={checkedPolicy} onClick={onClickPolicy} onChange={onChangePolicy}> ยอมรับ<Button type="link" onClick={() => onOpenPolicy1()}>policy 1</Button></Checkbox>

            <Checkbox>ยอมรับ <Button type="link">policy 2</Button></Checkbox>
          </div>
        </Col>

      </Row>

      <Modal
        id="policy_1"
        width={750}
        maskClosable={false}
        title={GetIntlMessages("Policy 1")}
        visible={isModalPolicyVisible1} onOk={(value) => onOkPolicy1(value)} onCancel={onCancelPolicy1}
        // okButtonProps={{ disabled: configModal.mode == "view" }}
        bodyStyle={{
          maxHeight: 600,
          overflowX: "auto"
        }}
      // okButtonProps={{ disabled: true }}
      >
        <Form
          form={form}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 19 }}
          layout="horizontal"
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        >
          <Form.Item {...tailformItemLayout} >
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
            <p>..........................................</p>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Review;
