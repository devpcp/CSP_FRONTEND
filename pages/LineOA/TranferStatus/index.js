import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";


const LineOATranferStatus = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  let { redirect_page } = router.query;
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const [dataForRegister, setDataForRegister] = useState(null);

  return (
    <>
      <Head>
        <title>{"อยู่ระหว่างปรับปรุง"}</title>
      </Head>

      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: "80%", }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>สถานะขนส่งสินค้า</h3>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>อยู่ระหว่างปรับปรุง</h3>
          </div>
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

export default LineOATranferStatus;
