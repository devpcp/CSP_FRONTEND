import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, List, Avatar, Table, Select } from "antd";
import React from "react";
import Icon, { CalendarOutlined } from '@ant-design/icons';
import { useRouter } from "next/router";
import { useDispatch, useSelector, } from "react-redux";
import API from "../../../util/Api";
import GetIntlMessages from '../../../util/GetIntlMessages';
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";
import { isArray } from "lodash";


const LineOATarget = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  let { redirect_page } = router.query;
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const [customerTarget, setCustomerTarget] = useState([]);


  const init = {
    configTable: {
      page: 1,
      total: 0,
      limit: 10,
      sort: "code",
      order: "descend",
      hide_manage: true,
      column: {
        created_by: false,
        created_date: false,
        updated_by: false,
        updated_date: false,
        status: false
      }
    },
    configSort: {
      sort: `created_date`,
      // sort: `created_date`,
      order: "descend",
    },
    modelSearch: {
      search: "",
      status: "",
      documentdate: [],
      bus_customer_id: "",
      filter_year: "",
      filter_month: "",
      product_brand_id: "",
      product_model_id: "",
    },
  }

  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable)

  /** Config เรียงลำดับ ของ ตาราง */
  const [configSort, setConfigSort] = useState(init.configSort)

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch)


  useEffect(async () => {
    try {
      let line_data = cookies.get("line_data")
      let findUserBusiness = await getCustomerBusinessByLineUserId(line_data.uid)
      setCustomerTarget(findUserBusiness?.target)
      if (findUserBusiness?.target.length === 1) {
        form.setFieldsValue({ target_name: findUserBusiness?.target[0].name })
      }

      let modelSearch = {
        filter_year: moment(Date.now()).format("YYYY"),
        bus_customer_id: findUserBusiness?.id
      }
      setModelSearch(modelSearch)
      getDataSearch(modelSearch)
    } catch (error) {
      console.log("error", error)
    }
  }, [])

  const getCustomerBusinessByLineUserId = async (line_user_id) => {
    const { data } = await API.get(`/shopBusinessCustomers/all?search=${line_user_id}&jsonField.other_details=line_arr`);
    return data.status == "success" ? data?.data?.data[0] : []
  }



  const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, bus_customer_id = modelSearch.bus_customer_id ?? "", filter_month = modelSearch.filter_month ?? "", filter_year = modelSearch.filter_year ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "", }) => {
    try {

      let url = `/shopReports/salesOut?limit=${limit}&report_sales_out_type=list&page=${page}&sort=${sort}&order=${order}${_status ? `&status=${_status}` : ""}${search ? `&search=${search}` : ""}${bus_customer_id ? `&bus_customer_id=${bus_customer_id}` : ""}${filter_month ? `&filter_month=${filter_month}` : ""}${filter_year ? `&filter_year=${filter_year}` : ""}${product_model_id !== "" ? `&product_model_id=${product_model_id}` : ""}`;
      const res = await API.get(url)

      if (res.data.status === "success") {

      } else {
        Modal.error({
          title: 'เกิดข้อผิดพลาด',
          centered: true,
          footer: null,
        });

      }
    } catch (error) {
      Modal.error({
        title: 'เกิดข้อผิดพลาด',
        content: error,
        centered: true,
        footer: null,
      });

    }
  }
  const columns = [
    {
      title: 'เดือน',
      dataIndex: 'name',
      key: 'name',
      align: "center",
      render: (text) => <div style={{ textAlign: "center" }}>{text}</div>,
    },
    {
      title: 'เป้า',
      dataIndex: 'target',
      key: 'target',
      align: "center",
      render: (text) => <div style={{ textAlign: "end" }}>{text}</div>,
    },
    {
      title: 'จำนวน',
      dataIndex: 'value',
      key: 'value',
      align: "center",
      render: (text) => <div style={{ textAlign: "end" }}>{text}</div>,
    },
  ]

  const data = [
    {
      key: '1',
      name: 'มกราคม',
      target: 32,
      value: 12,
    },
    {
      key: '2',
      name: 'กุมภาพันธ์',
      target: 32,
      value: 8,
    },
    {
      key: '3',
      name: 'มีนาคม',
      target: 32,
      value: 36,
    },
    {
      key: '4',
      name: 'เมษายน',
      target: 32,
      value: 36,
    },
    {
      key: '5',
      name: 'พฤษภาคม',
      target: 32,
      value: 36,
    },
    {
      key: '6',
      name: 'มิถุนายน',
      target: 32,
      value: 36,
    },
    {
      key: '7',
      name: 'กรกฎาคม',
      target: 32,
      value: 36,
    },
    {
      key: '8',
      name: 'สิงหาคม',
      target: 32,
      value: 36,
    },
    {
      key: '9',
      name: 'กันยายน',
      target: 32,
      value: 36,
    },
    {
      key: '10',
      name: 'ตุลาคม',
      target: 32,
      value: 36,
    },
    {
      key: '11',
      name: 'พฤศจิกายน',
      target: 32,
      value: 36,
    },
    {
      key: '12',
      name: 'ธันวาคม',
      target: 32,
      value: 36,
    },
  ];

  const handleChangeTarget = (value) => {
    try {
      console.log("value", value)
      getDataSearch({ search: value })
    } catch (error) {
      console.log("error", error)
      Modal.error({
        title: 'เกิดข้อผิดพลาด' + error,
        centered: true,
        footer: null,
      });
    }
  };

  return (
    <>
      <Head>
        <title>{"เป้าการซื้อ"}</title>
      </Head>

      <div style={{ display: "flex", width: "100vw", height: "100vh", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: "90%", }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>เป้าการซื้อ</h3>
          </div>
          <Form
            form={form}
          >
            <Form.Item
              name="target_name"
              label={""}
              rules={[
                {
                  required: false,
                  message: GetIntlMessages("กรุณาเลือกข้อมูล")
                },
              ]}
            >
              <Select
                style={{ width: '100%' }}
                placeholder="เลือกข้อมูล"
                optionFilterProp='children'
                showSearch
                onSelect={(e) => handleChangeTarget(e)}
              >
                {isArray(customerTarget) && customerTarget.length > 0 ? customerTarget.map((e, index) => (
                  <Select.Option value={e?.name} key={index}>
                    {e?.name}
                  </Select.Option>
                ))
                  : null
                }
              </Select>
            </Form.Item>
          </Form>
          <Table columns={columns} dataSource={data} pagination={false} size={"small"} />;
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

export default LineOATarget;
