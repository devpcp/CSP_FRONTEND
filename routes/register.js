import React, { useEffect, useState } from "react";
import { Row, Col, Form, Button, Layout, Steps, message } from "antd";
import Head from "next/head";
import Swal from "sweetalert2";
import API from "../util/Api/Oauth/Guest";
import Router from "next/router";
import ShopRegister from "../components/Routes/Register/Components.Routes.ShopRegister";
import UserDataRegister from "../components/Routes/Register/Components.Routes.UserDataRegister";
import UserProfileDataRegister from "../components/Routes/Register/Components.Routes.UserProfileDataRegister";
import Review from "../components/Routes/Register/Components.Routes.Review";
import { useDispatch, useSelector } from "react-redux";
import LanguageData from "../components/_App/Layout/LayoutHeader/LanguageData";
import { switchLanguage } from "../redux/actions/settingsActions";
import GetIntlMessages from "../util/GetIntlMessages";
import { isFunction, isPlainObject, isString } from "lodash";

const register = () => {
  const { Step } = Steps;
  const [form] = Form.useForm();

  const [currentSteps, setCurrentSteps] = useState(0);
  const [userData, setUserData] = useState([]);
  const [userProfileData, setUserProfileData] = useState([]);
  const [shopData, setShopData] = useState([]);

  const [businessTypeList, setBusinessTypeList] = useState([]);
  const [nameTitle, setNameTitle] = useState([]);

  const [visibleSteps, setVisibleSteps] = useState(true);
  const [validateSubDomain, setValidateSubDomain] = useState(null);
  const [subDomainValue, setSubDomainValue] = useState("");
  const [sendValueSubDomain, setSendValueSubDomain] = useState(false);
  const [suggestionData, setSuggestionData] = useState([])
  const [checkErrorFailed, setCheckErrorFailed] = useState("")
  const [subDomainIsVaild, setSubDomainIsVaild] = useState(null)

  useEffect(() => {
    getBusinessTypeListAll();
    getNameTitleListAll();
    // checkScreenAngle()
    window.onresize = function () {
      if (window.screen.orientation.angle == 90) {
        setVisibleSteps(true)
      } else if (window.screen.orientation.angle == 0 && window.innerWidth >= 450) {
        setVisibleSteps(true)
      } else {
        setVisibleSteps(false)
      }
    };

  }, [visibleSteps, window.screen.availWidth]);

  const steps = [
    {
      title: "UserRegister",
      content: <UserDataRegister form={form} currentSteps={currentSteps} />

    },
    {
      title: "UserProfileRegister",
      content: (
        <UserProfileDataRegister
          form={form}
          nameTitle={nameTitle}
        />
      ),
    },
    {
      title: "ShopRegister",
      content: (
        <ShopRegister
          form={form}
          // checkValidateSubDomain={checkValidateSubDomain}
          checkValidateSubDomain={(status, value) => checkValidateSubDomain(status, value)}
          // functionSubDomain={(func) => functionSubDomain(func)}
          sendValueSubDomain={sendValueSubDomain}
          businessTypeList={businessTypeList}
          suggestionSubDomainData={suggestionData}
          subDomainIsNotVaild={checkErrorFailed}
          checkSubDomainOnFinish={(value, statusMode) => checkSubDomainOnFinish(value, statusMode)}
        />
      ),
    },
    {
      title: "Finish",
      content: (
        <Review
          form={form}
          userData={userData}
          userProfileData={userProfileData}
          shopData={shopData}
          businessTypeList={businessTypeList}
          nameTitle={nameTitle}
          getCheckedPolicy={(value) => getCheckedPolicy(value)}
          getCheckedPolicyInModal={(value) => getCheckedPolicyInModal(value)}
        />
      ),
    },
  ];

  /* เรียกข้อมูล businessType ทั้งหมด */
  const getBusinessTypeListAll = async () => {
    const { data } = await API.get(
      `/master/businessType?sort=code_id&order=asc`
    );
    setBusinessTypeList(data.data);
  };

  const getNameTitleListAll = async () => {
    const { data } = await API.get(
      `/master/nameTitle?sort=code_id&order=asc`
    );
    // console.log('data.data', data.data)
    setNameTitle(data.data);
  };


  /*  function ไปหน้าต่อไป */
  const next = () => {
    setCurrentSteps(currentSteps + 1);
  };
  /* function กลับไปหน้าก่อนหน้านี้ */
  const prev = () => {
    setCurrentSteps(currentSteps - 1);
    setCheckErrorFailed("")
    setSubDomainIsVaild(null)
  };

  const checkValidateSubDomain = (status, value) => {

    if (status == "success") {
      setValidateSubDomain(true)
      setSubDomainValue(value)

    } else {
      setValidateSubDomain(false)
      setSubDomainValue("")

    }
  }

  const functionSubDomain = (checkSubDomain) => {
    try {
      const { sub_domain_name } = form.getFieldValue()
      setSendValueSubDomain(sub_domain_name)
      console.log('sub_domain_name', sub_domain_name)
      const subDomainObj = {}
      subDomainObj = { target: { value: sub_domain_name ?? "" } }
      console.log('subDomainObj', subDomainObj)
      checkSubDomain(subDomainObj)
    } catch (error) {

    }

  }

  const checkSubDomainOnFinish = async (value, statusMode = "") => {
    try {
      const { data } = await API.get(`/validators/sub-domain?sub_domain_name=${value ? value : ""}`)
      const validateUserName = await API.get(`/validators/user?user_name=${value ? value : ""}`)

      if (data.status == "success" && data.data.exists == false && validateUserName.data.data != null) {
        message.success("สามารถใช้ชื่อ Sub-Domain นี้ได้")
        setSuggestionData([])
        setCheckErrorFailed("")
        setSubDomainIsVaild(true)
        if (statusMode == "selectSuggest") {
          form.setFieldsValue({ sub_domain_name: value })
        }
        return true
      } else if (data.status == "success" && data.data.exists == true) {
        const arr = data.data.suggestions.map((e, index) => { return { label: `Suggestion${index + 1}`, options: [{ value: e }] } })
        form.setFieldsValue({ sub_domain_name: null })
        setSuggestionData(arr.length > 0 ? arr ?? [] : [])
        setSubDomainIsVaild(false)
        return false
      } else {
        setCheckErrorFailed("errorFailed")
        setSubDomainIsVaild(false)
        form.setFieldsValue({ sub_domain_name: null })
        return false
      }
    } catch (error) {

    }
  }

  const onFinish = async (value) => {
    try {

      const modelUserData = {
        user_data: {
          user_name: value.user_name,
          password: value.password,
          c_password: value.c_password,
          e_mail: value.e_mail,
          open_id: null,
        },
      };
      const modelUserProfileData = {
        user_profile_data: {
          name_title: value.name_title ?? null,
          fname: value.fname,
          lname: value.lname,
          id_code: value.id_code ?? null,
          tel: value.tel ?? null,
          mobile: value.mobile ?? null,
          address: value.address,
          subdistrict_id: value.subdistrict_id ?? null,
          district_id: value.district_id ?? null,
          province_id: value.province_id ?? null,
          // zip_code: value.zip_code ?? null,

        },
      };
      const modelShopProfileData = {
        shop_profile_data: {
          tax_code_id: value.tax_code_id ?? null,
          bus_type_id: value.bus_type_id ?? null,
          shop_name: value.shop_name,
          tel_no: {},
          mobile_no: {},
          e_mail: value.shop_e_mail ?? null,
          address: value.shop_address,
          subdistrict_id: value.shop_subdistrict_id ?? null,
          district_id: value.shop_district_id ?? null,
          province_id: value.shop_province_id ?? null,
          // zip_code: value.shop_zip_code ?? null,

          domain_name: {
            domain_name: 'carserviceerp.com' ?? null,
            sub_domain_name: value.sub_domain_name ?? null,
            changed: 0,
          }

        },
      };

      /* เบอร์โทรศัพท์มือถือ */
      if (value.mobile_no) {
        value.mobile_no.forEach((e, i) => {
          const index = i + 1
          modelShopProfileData.shop_profile_data.mobile_no[`mobile_no_${index}`] = e.mobile_no
        });
      }

      /* เบอร์โทรศัพท์พื้นฐาน */
      if (value.tel_no) {
        value.tel_no.forEach((e, i) => {
          const index = i + 1
          modelShopProfileData.shop_profile_data.tel_no[`tel_no_${index}`] = e.tel_no
        });
      }

      if (currentSteps == 0) {
        // setUserData({...modelUserRegister.user_data,...modelUserRegister.user_profile_data})
        if (value.c_password != value.password) {
          Swal.fire({
            icon: "warning",
            title: "แจ้งเตือน",
            text: "รหัสผ่านไม่ตรงกัน !!",
          });
          form.setFieldsValue({
            ...modelUserData,
            password: null,
            c_password: null,
          });
        } else {
          setUserData({ ...modelUserData });
          form.setFieldsValue({
            ...modelUserData,
          });
          // console.log(`user_data`, userData);
          next();
        }
      } else if (currentSteps == 1) {
        if (value.id_code.length != 13) {
          Swal.fire({
            icon: "warning",
            title: "แจ้งเตือน",
            text: "รหัสบัตรประชาชนของท่านไม่ถูกต้อง !!",
          });
        } else {
          setUserProfileData({ ...modelUserProfileData });
          form.setFieldsValue({
            ...modelUserProfileData,
          });
          next();


        }
      } else if (currentSteps == 2) {
        setShopData({ ...modelShopProfileData });
        form.setFieldsValue({
          ...modelShopProfileData,
        });
        await checkSubDomainOnFinish(value.sub_domain_name) == true ? next() : message.error("มีบางอย่างผิดพลาด !!")
      }

      else if (currentSteps == 3) {
        const newUser = { ...userData, ...userProfileData, ...shopData };
        // console.log(`newUserDone`, newUser);
        // await Swal.fire("", "บันทึกสำเร็จ", "success");
        // await Swal.fire({icon: "success",title:"ขอแสดงความยินดีด้วย",text:"ทางระบบได้ทำการบันทึกข้อมูลของท่านไว้เรียบร้อยแล้วท่านสามารถกดปุ่มเสร็จสิ้นเพื่อย้อนกลับไปที่หน้า “ล๊อกอิน” ได้ทันที"});
        // await Router.push("/login");

        const { data } = await API.post(`/user/register`, newUser);
        // console.log('data', data)
        if (data.status == "failed") {
          checkError(data, modelUserData);
        } else {
          message.success("บันทึกข้อมูลสำเร็จ");
          await Swal.fire({ icon: "success", title: "ขอแสดงความยินดีด้วย", confirmButtonText: "เสร็จสิ้น", text: "ทางระบบได้ทำการบันทึกข้อมูลของท่านไว้เรียบร้อยแล้วท่านสามารถกดปุ่มเสร็จสิ้นเพื่อย้อนกลับไปที่หน้า “ล๊อกอิน” ได้ทันที" });
          await Router.push("/login");
        }
      }

      const checkError = async (data, model) => {
        console.log('dataCheckError', data)
        let error_message = "ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด";
        if (data.data === "user_name already") {
          error_message = "ไม่สามารถบันทึกข้อมูลมูลได้ ชื่อผู้ใช้ซ้ำ";
          model.user_name = null;
        } else if (data.data == "e_mail already") {
          error_message = "ไม่สามารถบันทึกข้อมูลมูลได้ อีเมล์ซ้ำ";
          model.e_mail = null;
        }
        message.warning(error_message);
        form.setFieldsValue({
          ...modelUserData,
          password: null,
          c_password: null,
        });
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด ไม่สามารถบันทึกได้ !!");
    }
  };

  const onFinishFailed = (error) => {
    message.warning("กรอกข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ !!");
  };
  const onCancle = () => {
    form.resetFields();
    Router.push("/login");
  };

  const { locale, width, navCollapsed, mainColor } = useSelector(({ settings }) => settings);
  const dispatch = useDispatch();


  const onClickSwitchLanguage = (event) => {
    const language = LanguageData.find(where => where.languageId === event.key)
    if (language) {
      dispatch(switchLanguage(language))
    }
  }

  const [statusCheckedPolicy, setStatusCheckedPolicy] = useState(false);
  const [statusCheckedPolicyInModal, setStatusCheckedPolicyInModal] = useState(false);

  const getCheckedPolicy = (value) => {
    setStatusCheckedPolicy(value)
  }
  const getCheckedPolicyInModal = (value) => {
    setStatusCheckedPolicyInModal(value)
  }

  const checkScreenAngle = () => {
    if (window.screen.orientation.angle == 90) {
      return true
    } else if (window.screen.orientation.angle == 0 && window.innerWidth >= 400) {
      return true
    } else {
      return false
    }
  }

  return (
    <>
      <Head>
        <title>ลงทะเบียน</title>
      </Head>

      {/* <Content> */}

      <div className="page-register">
        <div className={currentSteps == 0 ? "card-container-register" : "card-container-register-2"}>
          <div>
            <Row gutter={[10, 10]}>
              <Col className="head-line-text" span={12} offset={6}>
                {currentSteps == 0
                  ? GetIntlMessages("user-register")
                  : currentSteps == 1
                    ? GetIntlMessages("user-register")
                    : currentSteps == 2
                      ? GetIntlMessages("shop-register")
                      : currentSteps == 3
                        ? GetIntlMessages("verify-register-information")
                        : ""}
              </Col>
              <Col span={12} offset={6}>
                <Steps
                  className="steps-style"
                  current={currentSteps}
                  responsive={false}
                >
                  {checkScreenAngle() == true && visibleSteps ?
                    steps.map((item, index) => (
                      <Step key={`step-${index + 1}-${item.title}`} />
                    ))
                    : null
                  }
                </Steps>
              </Col>
            </Row>
          </div>
          <div className="card-content-register">
            <Form
              form={form}
              initialValues={{ remember: true }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
            >
              <div>
                {steps[currentSteps].content}
              </div>
            </Form>
          </div>
          <div className="card-footer-register">
            {currentSteps > 0 && (

              <Button
                className="step-actions-back-btn"
                htmlType="button"
                block
                onClick={() => prev()}
              >
                {GetIntlMessages("go-to-previous-step")}
              </Button>


            )}
            {currentSteps < steps.length - 1 && (

              <Button
                className="step-actions-btn"
                // htmlType="submit"
                onClick={() => form.submit()}
                block
              >
                {GetIntlMessages("go-to-next-step")}
              </Button>


            )}
            {currentSteps === steps.length - 1 && (

              <Button
                className="step-actions-finish-btn"
                // htmlType="submit"
                onClick={() => form.submit()}
                block
                style={statusCheckedPolicy == false ? { backgroundColor: "rgb(220,220,220,0.5)", color: "rgb(211,211,211)" } : null}
                disabled={
                  statusCheckedPolicy !== true &&
                    statusCheckedPolicyInModal !== true
                    ? true
                    : false
                }
              >
                {GetIntlMessages("finish")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="footer-login">
        <div className='footer-container'>
          <div className='footer-text'>{GetIntlMessages("system")} Car Service Platform <span>{GetIntlMessages("version")} {process.env.NEXT_PUBLIC_APP_VERSION}</span></div>
          <div className='footer-text' style={{ textAlign: "end" }}>{GetIntlMessages("date-update")} {process.env.NEXT_PUBLIC_APP_LAST_UPDATE}</div>
        </div>
      </div>

      <style jsx global>
        {`
                    body {
                        background: ${mainColor};
                        color: #fff;
                        overflow-y: auto;
                    }
                    
                    .ant-steps-item-process
                      > .ant-steps-item-container
                      > .ant-steps-item-icon {
                      background: #fff;
                    }
                    .ant-steps-item-process
                      > .ant-steps-item-container
                      > .ant-steps-item-icon
                      .ant-steps-icon {
                      color: ${mainColor};
                    }
                    .ant-steps-item-finish .ant-steps-item-icon {
                      background: ${mainColor};
                      border: none;
                    }
                    .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
                      color: #ffcc00;
                    }
                  
                `}
      </style>

    </>
  );
};

export default register;
