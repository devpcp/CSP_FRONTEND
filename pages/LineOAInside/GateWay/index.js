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
        case "SUPPACHAI":
          bodyTokenLine = {
            client_id: process.env.NEXT_PUBLIC_OAUTH_SUPPACHAI_INSIDE_LINE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_SUPPACHAI_INSIDE_LINE_CLIENT_SECRET,
          }
          break;
        case "HENGHENG":
          bodyTokenLine = {
            client_id: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_INSIDE_LINE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_INSIDE_LINE_CLIENT_SECRET,
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
      console.log("shop_name", shop_name)
      console.log("bodyTokenLine", bodyTokenLine)
      var querystring = require('querystring');
      await apiLine
        .post(
          "https://api.line.me/oauth2/v2.1/token", querystring.stringify({
            ...bodyTokenLine,
            redirect_uri: process.env.NEXT_PUBLIC_OAUTH_LINE_INSIDE_REDIRECT_URL,
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
                  case "HENGHENG":
                    bodyTokenCSP = {
                      client_id: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_CSP_CLIENT_ID,
                      client_secret: process.env.NEXT_PUBLIC_OAUTH_HENGHENG_CSP_CLIENT_SECRET,
                    }
                    break;
                  case "SUPPACHAI":
                    bodyTokenCSP = {
                      client_id: process.env.NEXT_PUBLIC_OAUTH_SUPPACHAI_CSP_CLIENT_ID,
                      client_secret: process.env.NEXT_PUBLIC_OAUTH_SUPPACHAI_CSP_CLIENT_SECRET,
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


                  // if (redirect_uri === "InventoryAll") {
                  //   router.push(`/LineOAInside/InventoryAll`, undefined, { shallow: true })
                  // }
                  await router.push(`/LineOAInside/Register?redirect_page=${redirect_uri}`, undefined, { shallow: true })

                  // let findUser = await getEmployeeByLineUserId(uid)

                  // if (findUser.data.length === 0) {
                  //   router.push(`/LineOAInside/Register?redirect_page=${redirect_uri}`, undefined, { shallow: true })
                  // } else {
                  //   let userData = {
                  //     id: findUser.data[0].id,
                  //   }
                  //   cookies.set("user_data", userData, { path: "/" });


                  //   let _modelUpdateLineData = {
                  //     other_details: findUser.data[0].UsersProfile.details
                  //   }
                  //   _modelUpdateLineData.other_details.line_data = line_data
                  //   let url = userData.customer_type === "business" ? "shopBusinessCustomers" : "shopPersonalCustomers"
                  //   let update_line_data_res = await API.put(`/shopUser/put/${userData.id}`, _modelUpdateLineData)
                  // if (update_line_data_res.data.status == "success") {
                  //   if (redirect_uri === "InventoryBalance") {
                  //     router.push(`/LineOA/InventoryBalance`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "ShopWholeSaleDoc") {
                  //     router.push(`/LineOA/ShopWholeSaleDoc`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "Promotion") {
                  //     router.push(`/LineOA/Promotion`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "TranferStatus") {
                  //     router.push(`/LineOA/TranferStatus`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "InventoryBalanceSTT") {
                  //     router.push(`/LineOA/InventoryBalanceSTT`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "Holiday") {
                  //     router.push(`/LineOA/Holiday`, undefined, { shallow: true })
                  //   }
                  //   if (redirect_uri === "Target") {
                  //     router.push(`/LineOA/Target`, undefined, { shallow: true })
                  //   }
                  // }
                  // }
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


  const getEmployeeByLineUserId = async (line_user_id) => {
    const { data } = await API.get(`/shopUser/all?search=${line_user_id}`);
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
