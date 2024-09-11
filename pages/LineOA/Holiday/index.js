import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, List, Avatar } from "antd";
import React from "react";
import Icon, { CalendarOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { useDispatch, useSelector, } from "react-redux";
import API from "../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";


const LineOAHoliday = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  let { redirect_page } = router.query;
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const [dataForRegister, setDataForRegister] = useState(null);

  const data = [
    {
      title: '1 มกราคม 2567 (วันจันทร์)',
    },
    {
      title: ' 9 - 12 กุมภาพันธ์ 2567 (วันศุกร์ - วันจันทร์)',
    },
    {
      title: '13 - 16 เมษายน 2567 (วันเสาร์ - วันอังคาร)',
    },
    {
      title: '1 พฤษภาคม 2567 (วันพุธ)',
    },
    {
      title: '29 กรกฎาคม 2567 (วันจันทร์)',
    },
    {
      title: '12 สิงหาคม 2567 (วันจันทร์)',
    },
    {
      title: '2 ตุลาคม 2567 (วันพุธ)',
    },
    {
      title: '5 ธันวาคม 2567 (วันพฤหัสบดี)',
    },
    {
      title: '31 ธันวาคม 2567 (วันอังคาร)',
    },
  ];





  return (
    <>
      <Head>
        <title>{"อยู่ระหว่างปรับปรุง"}</title>
      </Head>

      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: "90%", }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>วันหยุดบริษัท ประจำปี 2567</h3>
          </div>
          <List
            itemLayout="horizontal"
            dataSource={data}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<CalendarOutlined style={{ fontSize: "16px" }} />}
                  title={item.title}
                />
              </List.Item>
            )}
          />
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

export default LineOAHoliday;
