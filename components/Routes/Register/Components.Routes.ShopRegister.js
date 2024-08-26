import React, { useEffect, useState } from "react";
import { Form, Select, Input, Button, Tooltip, Row, Col, Divider, message, AutoComplete } from "antd";
import GetIntlMessages from "../../../util/GetIntlMessages";
import FormProvinceDistrictSubdistrictOauth from "../../shares/FormProvinceDistrictSubdistrictOauth";
import { useSelector } from "react-redux";
import { FormInputLanguage, FormSelectLanguage } from '../../shares/FormLanguage';
import { InfoCircleOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import API from '../../../util/Api/Oauth/Guest'
import { isArray, isFunction } from "lodash";

const ShopRegister = ({ form, businessTypeList, checkValidateSubDomain, sendValueSubDomain,functionSubDomain,suggestionSubDomainData ,subDomainIsNotVaild,checkSubDomainOnFinish}) => {

  const { locale, mainColor } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon)
  const [BusinessTypeRule, setBusinessTypRule] = useState(false)
  const [checkSubDomainExist, setCheckSubDomainExist] = useState(null)
  const [checkErrorFailed, setCheckErrorFailed] = useState("")
  const [suggestionData, setSuggestionData] = useState([])

  useEffect(() => {
    checkSubDomain(sendValueSubDomain)
    if(functionSubDomain && isFunction(functionSubDomain)){
      functionSubDomain(checkSubDomain)
    }
    if(isArray(suggestionSubDomainData) && suggestionSubDomainData.length > 0){
      setSuggestionData(suggestionSubDomainData)
    }else{
      setSuggestionData([])
    }
    if(subDomainIsNotVaild == "errorFailed"){
      setCheckErrorFailed(subDomainIsNotVaild)
    }else{
      setCheckErrorFailed("")
    }
  }, [sendValueSubDomain,suggestionSubDomainData,subDomainIsNotVaild])


  const onBusinessTypeChange = (value) => {
    // console.log('valueBus', value)

    const find = businessTypeList.find(where => where.id == value)

    if (find.id == businessTypeList[1].id) {
      setBusinessTypRule(true)
    } else if (find.id == businessTypeList[2].id) {
      setBusinessTypRule(true)
    }
    else {
      setBusinessTypRule(false)
    }
  }

  const [isOnChange, setIsOnChange] = useState(false)
  const useSameAddress = () => {
    const formValue = form.getFieldValue()
    setIsOnChange(false)
    form.setFieldsValue({ ...formValue, shop_province_id: formValue.province_id, shop_district_id: formValue.district_id, shop_subdistrict_id: formValue.subdistrict_id, shop_zip_code: formValue.zip_code, shop_address: formValue.address })
    setIsOnChange(true)
  }

  const checkSubDomain = async (subDomainName = {target : {value : ""}}) => {

    if (subDomainName && subDomainName.target.value.length > 0) {
      const { data } = await API.get(`/validators/sub-domain?sub_domain_name=${subDomainName.target.value}`)
      console.log('data', data)

      if (data.status == "success" && data.data.exists == false) {
        setCheckSubDomainExist("success")
        message.success("สามารถใช้ชื่อ Sub-Domain นี้ได้")
        if (checkValidateSubDomain && isFunction(checkValidateSubDomain)) {
          checkValidateSubDomain("success", subDomainName.target.value)
          setSuggestionData([])
          setCheckErrorFailed(null)
        }

      } else if (data.status == "success" && data.data.exists == true) {

        const arr = data.data.suggestions.map((e, index) => { return { label: `Suggestion${index + 1}`, options: [{ value: e }] } })
        console.log('arr', arr)
        setSuggestionData(arr.length > 0 ? arr ?? [] : [])
        // setSuggestionData(data.data.suggestions)
        setCheckSubDomainExist("error", subDomainName.target.value)
        if (checkValidateSubDomain && isFunction(checkValidateSubDomain)) {
          checkValidateSubDomain("error", subDomainName.target.value)
        }
        form.setFieldsValue({ sub_domain_name: null })
      } else if (data.status == "failed") {
        // message.error(data.data)
        setCheckErrorFailed("errorFailed")
        setCheckSubDomainExist("error")
        form.setFieldsValue({ sub_domain_name: null })
      }
    }
    else if (subDomainName && subDomainName.target.value.length <= 0) {
      setCheckSubDomainExist(null)
    }
  }

  const suggestionSubDomain = async(value) => {
    // console.log('value.target.textContent', value.target.textContent.length)
    // const newObj = {}
    // newObj = { target: { value: value.target.textContent } }
    // // console.log('newObj', newObj)
    // checkSubDomain(newObj)
    await checkSubDomainOnFinish(value,"selecetSuggest")
    // form.setFieldsValue({ sub_domain_name: value.target.textContent })
  }

  const longNameItemLayout = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      lg: { span: 5 },
      xl: { span: 24 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
    },
  };
  const tailformItemLayout = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      lg: { span: 5 },
      xl: { span: 24 },
      xxl: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
    },
  };
  const telNoItemLayout = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 6 },
      lg: { span: 6 },
      xl: { span: 24 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
    },
  };

  const importedComponentsLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      lg: { span: 5 },
      xl: { span: 24 },
      xxl: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
    },
  };
  const importedAddressComponentsLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 5 },
      sm: { span: 24 },
      // md: { span: 4 },
      lg: { span: 5 },
      xl: { span: 24 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 20 },
      sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
    },
  };
  const shopNameLayouts = {
    labelAlign: "left",
    labelCol: {
      xs: { span: 24 },
      // sm: { span: 24 },
      // md: { span: 4 },
      lg: { span: 5 },
      xl: { span: 24 },
      xxl: { span: 7 },
    },
    wrapperCol: {
      xs: { span: 24 },
      // sm: { span: 24 },
      // md: { span: 18 },
      lg: { span: 20 },
      xl: { span: 24 },
      xxl: { span: 16 },
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
        {/* {GetIntlMessages("shop-register")} */}
      </div>

      <Form.Item wrapperCol={{ span: 10 }}>
        <FormSelectLanguage config={{
          form,
          field: ["shop_name", "shop_address"],
          // disabled: configModal.mode == "view"
        }} onChange={(value) => setFormLocale(value)} />
      </Form.Item>

      <Row gutter={[20, 10]}>
        <Col xl={12} md={24} xs={24}>
          <Form.Item {...longNameItemLayout} name="tax_code_id" label={GetIntlMessages("tax-id")} rules={[{ required: BusinessTypeRule, message: "กรุณากรอกข้อมูล" }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col xl={12} md={24} xs={24}>
          <Form.Item {...tailformItemLayout} name="bus_type_id" label={GetIntlMessages("business-type")}>
            <Select
              showSearch
              placeholder="เลือกข้อมูล"
              onChange={onBusinessTypeChange}
              // disabled={disabled}
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
        </Col>
        <Col xl={12} md={24} xs={24} >
          {/* <Form.Item {...importedComponentsLayout}> */}
          <FormInputLanguage importedComponentsLayouts={shopNameLayouts} icon={formLocale} label={GetIntlMessages("shop-name")} name="shop_name" rules={[{ required: true, message: "กรุณากรอกข้อมูล" }]} />
          {/* </Form.Item> */}
        </Col>
        <Col xl={12} md={24} xs={24}>
          <Form.Item {...tailformItemLayout}
            name="shop_e_mail"
            label={GetIntlMessages("email")}
            rules={[
              {
                type: "email",
                required: false,
                message: GetIntlMessages("enter-your-email"),
              },
              // {
              //   pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
              //   message: GetIntlMessages("only-english"),
              // },
            ]}
          >
            <Input />
          </Form.Item>

        </Col>

      </Row>

      <Divider />

      <Row gutter={[20, 10]}>
        <Col xl={12} md={24} xs={24}>
          <Form.Item {...telNoItemLayout}
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
                        <Input placeholder="กรอกเบอร์โทรศัพท์พื้นฐาน" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                      </Form.Item>
                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {GetIntlMessages("telephone")}
                    </Button>
                  </Form.Item>

                </>
              )}
            </Form.List>
          </Form.Item>
        </Col>

        <Col xl={12} md={24} xs={24}>
          <Form.Item {...telNoItemLayout}
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
                        <Input placeholder="กรอกเบอร์โทรศัพท์มือถือ" style={{ width: fields.length > 1 ? '85%' : '100%' }} />
                      </Form.Item>

                      {fields.length > 1 ? (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      ) : null}
                    </Form.Item>
                  ))}

                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      {GetIntlMessages("mobile-phone")}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Col>

      </Row>

      <Divider />

      <Row gutter={[20, 10]}>
        <Col span={24}>
          <Button type="link" onClick={() => useSameAddress()}>{GetIntlMessages("use-same-address")}
            <Tooltip title={GetIntlMessages("tooltip-use-same-address")}>
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          </Button>
        </Col>
        <Col xl={12} md={24} xs={24}>
          <FormInputLanguage importedComponentsLayouts={importedAddressComponentsLayouts} isTextArea icon={formLocale} label={GetIntlMessages("address")} name="shop_address" rules={[{ required: true, message: GetIntlMessages("enter-your-address") }]} />
        </Col>

        <Col xl={12} md={24} xs={24}>
          <FormProvinceDistrictSubdistrictOauth importedComponentsLayouts={importedComponentsLayouts} form={form} name={{ province: "shop_province_id", district: "shop_district_id", subdistrict: "shop_subdistrict_id", zip_code: "shop_zip_code" }} onChange={isOnChange} />
        </Col>

        <Divider />

        <Col xs={24} xl={{ span: 16, offset: 4 }} >
          <Form.Item
            {...tailformItemLayout}
            // hasFeedback
            validateStatus={checkSubDomainExist}
            validateTrigger={['onChange', 'onBlur']}
            help={suggestionData.length > 0 ?<div style={{color : "red"}}>{ GetIntlMessages("sub-domain-already-exist") }</div>: checkErrorFailed == "errorFailed" ? <div style={{color : "red"}}>{GetIntlMessages("Sub Domain is not valid")}</div> : ""}
            // help={checkSubDomainExist == true ? null : GetIntlMessages("ซ้ำโว้ยยย")}
            name='sub_domain_name'
            label={GetIntlMessages("sub-domain-name")}
            rules={[
              {
                required: true,
                message: GetIntlMessages("please-fill-out"),
              },
              {
                // required: true,
                pattern: /^[a-z0-9-]+$/,
                message: GetIntlMessages("ภาษาอังกฤษตัวพิมเล็กเท่านั้น(สามารถมี - ได้)"),
              },
            ]}
          >

            <AutoComplete
            // options={suggestionData}
            >
              <Input onBlur={(value)=>checkSubDomainOnFinish(value.target.value, "onBlurSubDomain")} addonBefore="https://" addonAfter="carserviceerp.com" placeholder="myURL" />
              {/* <Input onBlur={checkSubDomain} addonBefore="https://" addonAfter="carserviceerp.com" placeholder="myURL" /> */}
            </AutoComplete>

          </Form.Item>

          {suggestionData.length > 0 ?
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: "10px" }}>
              <div>ใช้ได้ :</div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                {suggestionData.map(e => {
                  return <Button onClick={(value)=>checkSubDomainOnFinish(value.target.textContent,"selectSuggest")} type="link">{e.options[0].value}</Button>
                })}
              </div>

            </div>
            : null}



        </Col>

      </Row>

      <style jsx global>
        {
          `
          .ant-input-group-addon{
            border-radius : 10px;
            border-color : ${mainColor}
          }
          `
        }
      </style>


    </>
  );
};

export default ShopRegister;
