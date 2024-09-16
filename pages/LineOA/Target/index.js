import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, List, Avatar, Table, Select, Row, Col } from "antd";
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

const { Text } = Typography;

const LineOATarget = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  let { redirect_page } = router.query;
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [form] = Form.useForm();
  const cookies = new Cookies();
  const [customerTarget, setCustomerTarget] = useState([]);
  const [listSearchDataTable, setListSearchDataTable] = useState([])


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
      sort: `doc_date`,
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

  const dataMonth = [
    {
      key: '1',
      name: 'มกราคม',
      target: 0,
      value: 0,
    },
    {
      key: '2',
      name: 'กุมภาพันธ์',
      target: 0,
      value: 0,
    },
    {
      key: '3',
      name: 'มีนาคม',
      target: 0,
      value: 0,
    },
    {
      key: '4',
      name: 'เมษายน',
      target: 0,
      value: 0,
    },
    {
      key: '5',
      name: 'พฤษภาคม',
      target: 0,
      value: 0,
    },
    {
      key: '6',
      name: 'มิถุนายน',
      target: 0,
      value: 0,
    },
    {
      key: '7',
      name: 'กรกฎาคม',
      target: 0,
      value: 0,
    },
    {
      key: '8',
      name: 'สิงหาคม',
      target: 0,
      value: 0,
    },
    {
      key: '9',
      name: 'กันยายน',
      target: 0,
      value: 0,
    },
    {
      key: '10',
      name: 'ตุลาคม',
      target: 0,
      value: 0,
    },
    {
      key: '11',
      name: 'พฤศจิกายน',
      target: 0,
      value: 0,
    },
    {
      key: '12',
      name: 'ธันวาคม',
      target: 0,
      value: 0,
    },
    {
      key: 'total',
      name: 'ทั้งหมด',
      target: 0,
      value: 0,
    },
  ];

  useEffect(async () => {
    try {
      let line_data = cookies.get("line_data")
      let findUserBusiness = await getCustomerBusinessByLineUserId(line_data.uid)
      setCustomerTarget(findUserBusiness?.target)
      if (findUserBusiness?.target.length > 0) {
        form.setFieldsValue(
          {
            target_name: findUserBusiness?.target[0].name,
          }
        )
      }
      let modelSearch = {
        filter_year: moment(Date.now()).format("YYYY"),
        bus_customer_id: findUserBusiness?.id,
        search: findUserBusiness?.target[0].name
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

      let url = `/shopReports/customerTarget?limit=${limit}&page=${page}&sort=${sort}&order=${order}${_status ? `&status=${_status}` : ""}${search ? `&search=${search}` : ""}${bus_customer_id ? `&bus_customer_id_arr=${bus_customer_id}` : ""}${filter_month ? `&filter_month=${filter_month}` : ""}${filter_year ? `&filter_year=${filter_year}` : ""}${product_model_id !== "" ? `&product_model_id=${product_model_id}` : ""}`;
      const res = await API.get(url)

      if (res.data.status === "success") {
        let arr = res.data.data.data[0]
        const result = [];
        for (const [key, values,] of Object.entries(arr)) {
          if (key.includes("target") || key.includes("sale")) {
            let column = key.split("_")[0]
            let index = key.split("_")[1]
            let find = dataMonth.find(x => x.key === index)
            let findresult = result.find(x => x.key === index)

            if (column === "sale") {
              find.value = values
            }
            if (column === "target") {
              find.target = values
            }
            if (!findresult) {
              result.push(find)
            }
          }
        }
        form.setFieldsValue(
          {
            brand_name: arr.brand_name ?? "-",
            model_name: arr.model_name ?? "-",
          }
        )
        setListSearchDataTable(result)
      } else {
        Modal.error({
          title: 'เกิดข้อผิดพลาด',
          centered: true,
          footer: null,
        });

      }
    } catch (error) {
      console.log("error", error)
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
      render: (text, record) => {
        if (record.key === "total") {
          return <Text style={{ fontWeight: "bolder" }}>{text}</Text>
        } else {
          return <div style={{ textAlign: "center" }}><Text>{text}</Text></div>
        }
      },
    },
    {
      title: 'เป้า',
      dataIndex: 'target',
      key: 'target',
      align: "center",
      render: (text, record) => {
        if (record.key === "total") {
          return <div style={{ textAlign: "end" }}><Text style={{ fontWeight: "bolder" }}>{text}</Text></div>
        } else {
          return <div style={{ textAlign: "end" }}><Text>{text}</Text></div>
        }
      },
    },
    {
      title: 'จำนวน',
      dataIndex: 'value',
      key: 'value',
      align: "center",
      render: (text, record) => {
        if (record.key === "total") {
          return <div style={{ textAlign: "end" }}><Text style={{ fontWeight: "bolder" }}>{text}</Text></div>
        } else {
          return <div style={{ textAlign: "end" }}><Text>{text}</Text></div>
        }
      },
    },
  ]



  const handleChangeTarget = (value) => {
    try {
      let _modelSearch = {
        ...modelSearch,
        search: value
      }
      getDataSearch(_modelSearch)
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

      <div style={{ display: "flex", width: "100vw", height: "100vh", padding: "calc(100% - -4vh) 0px", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        {/* <div style={{ padding: "2vh 0", display: "flex", alignItems: "center", alignContent: "center", justifyContent: "center" }}> */}
          <Card style={{ width: "90%", }}>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <h3>เป้าการซื้อ</h3>
            </div>
            <Form
              form={form}
            >
              <Row gutter={8}>
                <Col span={24}>
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
                      onSelect={(e) => handleChangeTarget(e)}
                      style={{ width: '100%' }}
                      placeholder="เลือกข้อมูล"
                      optionFilterProp='children'
                      showSearch
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
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="brand_name"
                    label={""}
                    rules={[
                      {
                        required: false,
                        message: GetIntlMessages("กรุณาเลือกข้อมูล")
                      },
                    ]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="model_name"
                    label={""}
                    rules={[
                      {
                        required: false,
                        message: GetIntlMessages("กรุณาเลือกข้อมูล")
                      },
                    ]}>
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
            <Table columns={columns} dataSource={listSearchDataTable} pagination={false} size={"small"} />
          </Card>
        {/* </div> */}

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
