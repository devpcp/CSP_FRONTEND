import React, { useEffect, useState } from 'react'
import { useRouter } from "next/router";
import axios from 'axios';
import API from '../../../util/Api';
import { Cookies } from 'react-cookie'
import { useDispatch, useSelector } from "react-redux";
import CarPreloader from '../../../components/_App/CarPreloader';
import { Modal, } from "antd";
import { setAuthToken, getAuthUser, setRefreshToken } from '../../../redux/actions/authActions'

const GateWay = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const cookies = new Cookies();
  let { code, state } = router.query;
  const [loading, setLoading] = useState(false);
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  useEffect(async () => {
    if (code && state) {
      let shop_name = state?.split("_")[0]
      let redirect_uri = state?.split("_")[1]
      let apiLine = axios.create({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      let bodyTokenLine = {}
      switch (shop_name) {
        case "STV":
          bodyTokenLine = {
            client_id: process.env.NEXT_PUBLIC_OAUTH_STV_LINE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_STV_LINE_CLIENT_SECRET,
          }
          break;
        case "HENGHENG":
          bodyTokenLine = {
            client_id: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_LINE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_LINE_CLIENT_SECRET,
          }
        case "SATHITTHAM":
          bodyTokenLine = {
            client_id: process.env.NEXT_PUBLIC_OAUTH_SATHITTHAM_LINE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_SATHITTHAM_LINE_CLIENT_SECRET,
          }
          break;

        default:
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: "Not Found",
            centered: true,
            footer: null,
          });
          break;
      }
      var querystring = require('querystring');
      await apiLine
        .post(
          "https://api.line.me/oauth2/v2.1/token", querystring.stringify({
            ...bodyTokenLine,
            redirect_uri: process.env.NEXT_PUBLIC_OAUTH_LINE_REDIRECT_URL,
            code: code,
            grant_type: 'authorization_code'
          })
        )
        .then(async (res) => {
          try {
            await apiLine
              .get(
                "https://api.line.me/oauth2/v2.1/userinfo",
                {
                  headers: {
                    "Authorization": "Bearer " + res.data.access_token
                  }
                }
              )
              .then(async (res) => {
                let uid = res.data.sub
                let displayName = res.data.name
                let pictureUrl = res.data.picture
                let line_data = {
                  uid,
                  displayName,
                  pictureUrl
                }
                let bodyTokenCSP
                switch (shop_name) {
                  case "STV":
                    bodyTokenCSP = {
                      client_id: process.env.NEXT_PUBLIC_OAUTH_STV_CSP_CLIENT_ID,
                      client_secret: process.env.NEXT_PUBLIC_OAUTH_STV_CSP_CLIENT_SECRET,
                    }
                    break;
                  case "HENGHENG":
                    bodyTokenCSP = {
                      client_id: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_CSP_CLIENT_ID,
                      client_secret: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_CSP_CLIENT_SECRET,
                    }
                    break;
                  case "SATHITTHAM":
                    bodyTokenCSP = {
                      client_id: process.env.NEXT_PUBLIC_OAUTH_SATHITTHAM_CSP_CLIENT_ID,
                      client_secret: process.env.NEXT_PUBLIC_OAUTH_SATHITTHAM_CSP_CLIENT_SECRET,
                    }
                    break;

                  default:
                    Modal.error({
                      title: 'เกิดข้อผิดพลาด',
                      content: "Not Found",
                      centered: true,
                      footer: null,
                    });
                    break;
                }
                let model_oauth = {
                  grant_type: "client_credentials",
                  ...bodyTokenCSP
                }
                let oauth_csp_res = await API.post(`/oauth/token`, model_oauth)
                if (oauth_csp_res.data.status == "success") {
                  cookies.set("access_token", oauth_csp_res.data.data.access_token, { path: "/" });
                  cookies.set("refresh_token", oauth_csp_res.data.data.refresh_token, { path: "/" });
                  cookies.set("line_data", line_data, { path: "/" });
                  dispatch(setAuthToken(oauth_csp_res.data.data.access_token));
                  dispatch(setRefreshToken(oauth_csp_res.data.data.refresh_token));
                  getAuthUser(dispatch, setLoading)

                  let findUserBusiness = await getCustomerBusinessByLineUserId(uid)
                  let findUserPersonal = await getCustomerPersonalByLineUserId(uid)
                  let findUser = { data: findUserBusiness.data.concat(findUserPersonal.data) }

                  if (findUser.data.length === 0) {
                    router.push(`/LineOA/Register?redirect_page=${redirect_uri}`, undefined, { shallow: true })
                  } else {
                    let userData = {
                      id: findUser.data[0].id,
                      customer_name: findUser.data[0].bus_type_id ? findUser.data[0].customer_name[locale.locale] : `${findUser.data[0].customer_name.first_name[locale.locale]} ${findUser.data[0].customer_name.last_name[locale.locale]}`,
                      customer_type: findUser.data[0].bus_type_id ? "business" : "personal",
                      is_use_coupon_michelin_500: findUser.data[0].other_details.is_use_coupon_michelin_500 ?? false
                    }
                    cookies.set("user_data", userData, { path: "/" });


                    let _modelUpdateLineData = {
                      other_details: findUser.data[0].other_details
                    }
                    _modelUpdateLineData.other_details.line_data = line_data
                    let url = userData.customer_type === "business" ? "shopBusinessCustomers" : "shopPersonalCustomers"
                    let update_line_data_res = await API.put(`/${url}/put/${userData.id}`, _modelUpdateLineData)
                    if (update_line_data_res.data.status == "success") {
                      if (redirect_uri === "InventoryBalance") {
                        router.push(`/LineOA/InventoryBalance`, undefined, { shallow: true })
                      }
                      if (redirect_uri === "ShopWholeSaleDoc") {
                        router.push(`/LineOA/ShopWholeSaleDoc`, undefined, { shallow: true })
                      }
                      if (redirect_uri === "Promotion") {
                        router.push(`/LineOA/Promotion`, undefined, { shallow: true })
                      }
                      if (redirect_uri === "TranferStatus") {
                        router.push(`/LineOA/TranferStatus`, undefined, { shallow: true })
                      }
                    }
                  }
                }
                else {
                  Modal.error({
                    title: 'เกิดข้อผิดพลาด',
                    content: "กรุณาปิดหน้าต่างแล้วลองอีกครั้ง",
                    centered: true,
                    footer: null,
                  });
                }


              })
              .catch((error) => {
                Modal.error({
                  title: 'เกิดข้อผิดพลาด',
                  content: error,
                  centered: true,
                  footer: null,
                });
                console.log("error", error)
              });

          } catch (error) {
            Modal.error({
              title: 'เกิดข้อผิดพลาด',
              content: error,
              centered: true,
              footer: null,
            });
            console.log("error")
          }

        })
        .catch((error) => {
          Modal.error({
            title: 'เกิดข้อผิดพลาด',
            content: error,
            centered: true,
            footer: null,
          });
        });

    } else {

    }

  }, [router.query]);


  const getCustomerBusinessByLineUserId = async (line_user_id) => {
    const { data } = await API.get(`/shopBusinessCustomers/all?search=${line_user_id}&jsonField.other_details=line_arr`);
    return data.status == "success" ? data.data : []
  }

  const getCustomerPersonalByLineUserId = async (line_user_id) => {
    const { data } = await API.get(`/shopPersonalCustomers/all?search=${line_user_id}&jsonField.other_details=line_arr`);
    return data.status == "success" ? data.data : []
  }

  return (
    <>
      <CarPreloader />
      <style jsx global>
        {`
                body {
                  background: ${mainColor};
                  color: #fff;
                  overflow-y: auto;
                }
              `}
      </style>
    </ >
  );
};

export default GateWay;
