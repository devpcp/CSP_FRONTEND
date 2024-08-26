import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, Row, Col, Pagination, Divider } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";
import CarPreloader from "../../../components/_App/CarPreloader";
import InventoryWarehouseDetail from "../InventoryWarehouseDetail";
import { isFunction, isArray, isPlainObject } from "lodash";
import LineOAFormShopWholeSaleDoc from "./components/Form.ShopWholeSaleDoc"
import LineOAListShopWholeSaleDoc from "./components/List.ShopWholeSaleDoc"
import { CloudSyncOutlined } from "@ant-design/icons";

const LineOAShopWholeSaleDoc = ({ title = null, callBack, productWarehousePick, callBackOnFinish }) => {
  const { authUser } = useSelector(({ auth }) => auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [formSearch] = Form.useForm();
  const [form] = Form.useForm();
  const [idEdit, setIsIdEdit] = useState(null);
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [productWarehouseDetail, setProductWarehouseDetail] = useState({})
  const [loading, setLoading] = useState(false);
  const [carPreLoading, setCarPreLoading] = useState(false);
  const cookies = new Cookies();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [disabledWhenDeliveryDocActive, setDisabledWhenDeliveryDocActive] = useState(false)
  const { taxTypes, } = useSelector(({ master }) => master);
  const [coupontButtonName, setCouponButtonName] = useState("ส่วนลด/คูปอง");
  const [couponUse, setCouponUse] = useState("");


  useEffect(() => {
    if (isFunction(callBack)) {
      addEditViewModal("add", null)
      let listServiceProduct = []
      console.log("productWarehousePick", productWarehousePick)
      productWarehousePick.map((e, i) => {
        let amount = e.amount

        e.warehouse_detail.map((el, i) => {
          console.log("amount", amount)
          if (amount >= 0) {
            let new_amount = (amount - el.shelf.balance) <= 0 ? amount : el.shelf.balance
            console.log("new_amount", new_amount)
            if (new_amount !== 0) {
              listServiceProduct.push({
                ...e,
                amount: new_amount,
                dot_mfd: el.shelf.dot_mfd,
                dot_show: el.shelf.dot_show,
                price_grand_total: e.price_unit * new_amount,
                purchase_unit_id: el.shelf.purchase_unit_id,
                purchase_unit_name: el.shelf.PurchaseUnit.type_name[locale.locale],
                seq_number: i + 1,
                shelf_name: el.shelf.Shelf.name[locale.locale],
                shop_warehouse_id: el.warehouse,
                shop_warehouse_shelf_item_id: el.shelf.item,
              })
              amount = amount - el.shelf.balance
            }
          }
        })
      })
      console.log("listServiceProduct", listServiceProduct)
      const model = {
        list_service_product: listServiceProduct
      }
      form.setFieldsValue({ ...model })
      calculateResult()
    }
  }, [callBack])

  /**
     * ค่าเริ่มต้นของ
     *  - configTable = Config ตาราง
     *  - configSort = เรียงลำดับ ของ ตาราง
     *  - modelSearch = ตัวแปล Search
     */
  const init = {
    configTable: {
      page: 1,
      total: 0,
      limit: 10,
      sort: "code",
      order: "ascend",
    },
    configSort: {
      sort: "created_date",
      order: "descend",
    },
    modelSearch: {
      search: "",
      status: "active",
    }
  }
  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable)

  const [configSort, setConfigSort] = useState(init.configSort)

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch)

  const [configModal, setConfigModal] = useState({
    mode: "add",
    modeKey: null,
    maxHeight: 600,
    overflowX: "auto",
  })


  /* ค้นหา */
  const getDataSearch = async ({ search = modelSearch.search ?? "", filter_balance = modelSearch.filter_balance ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _which = (status === "management") ? "michelin data" : "my data", type_group_id = modelSearch.type_group_id ?? "", product_type_id = modelSearch.product_type_id ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "", bus_customer_id = modelSearch.bus_customer_id ?? "", per_customer_id = modelSearch.per_customer_id ?? "" }) => {
    try {
      if (page === 1) setLoading(true)
      let user_data = cookies.get("user_data")
      if (user_data.customer_type === "personal") {
        per_customer_id = user_data.id
      } else {
        bus_customer_id = user_data.id
      }

      const res = await API.get(`/shopServiceOrderDoc/all?&doc_sales_type=2&limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&status=active${!!type_group_id ? `&type_group_id=${type_group_id}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id}` : ""}${!!bus_customer_id ? `&bus_customer_id=${bus_customer_id}` : ""}${!!per_customer_id ? `&per_customer_id=${per_customer_id}` : ""}`)

      if (res.data.status === "success") {
        // console.log("res.data.", res.data.data)
        const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
        const newData = data
        setListSearchDataTable(newData)
        setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
        if (page === 1) setLoading(false)
      } else {
        Modal.error({
          title: 'เกิดข้อผิดพลาด',
          centered: true,
          footer: null,
        });
        if (page === 1) setLoading(false)
      }
    } catch (error) {
      Modal.error({
        title: 'เกิดข้อผิดพลาด',
        content: error,
        centered: true,
        footer: null,
      });
      if (page === 1) setLoading(false)
    }
  }



  const onFinishSearch = async (value) => {
    try {
      getDataSearch({
        search: value.search
      })
    } catch (error) {

    }
  }

  const onFinishSearchFailed = (errorInfo) => {
    Modal.error({
      title: 'เกิดข้อผิดพลาด',
      content: errorInfo,
      centered: true,
      footer: null,
    });
  };

  const onChangePage = (page, size) => {
    // console.log("onChangePage", page, size)
    getDataSearch({
      search: modelSearch.search,
      page: page,
      limit: size,
    })
  }


  /* addEditView */
  const addEditViewModal = async (mode, id,) => {
    try {
      // console.log("id", id)
      setConfigModal({ ...configModal, mode })
      if (id) {
        const { data } = await API.get(`/shopServiceOrderDoc/byId/${id}`)
        if (data.status == "success") {
          setIsIdEdit(id)
          setFormValueData(data.data)
        }
      } else {
        form.setFieldsValue({
          doc_date: moment(new Date()),
          tax_type_id: "8c73e506-31b5-44c7-a21b-3819bb712321",
          list_service_product: []
        })
      }
      setIsModalVisible(true)
      setLoading(false)
    }
    catch (error) {

    }
  }

  const setFormValueData = (value) => {
    try {
      // console.log('value :>> ', value);
      const { ShopServiceOrderLists } = value
      let list_service_product = ShopServiceOrderLists.map((e) => {
        return {
          id: e.id,
          list_code: e.details.meta_data.ShopProduct.Product.master_path_code_id,
          list_name: e.details.meta_data.ShopProduct.Product.product_name[locale.locale],
          shop_stock_id: e.details.meta_data.ShopStock.id,
          seq_number: e.seq_number,
          shop_product_id: e.details.meta_data.ShopProduct.id,
          shop_warehouse_id: e.details.meta_data.ShopStock.shop_warehouse_id,
          warehouse_name: e.details.meta_data.ShopStock.ShopWarehouse.name,
          shop_warehouse_shelf_item_id: e.details.meta_data.ShopStock.ShopWarehouse.ShopWarehouseSelfItem.id,
          shelf_name: e.details.meta_data.ShopStock.ShopWarehouse.ShopWarehouseSelfItem.name,
          purchase_unit_id: e.details.meta_data.ProductPurchaseUnitType.id,
          purchase_unit_name: e.details.meta_data.ProductPurchaseUnitType.type_name[locale.locale],
          dot_mfd: e.dot_mfd,
          dot_show: e?.dot_mfd ? e?.dot_mfd.split("")[0] + "X" + e?.dot_mfd.split("")[2] + e?.dot_mfd.split("")[3] : "XXXX",
          amount: e.amount,
          cost_unit: e.cost_unit,
          price_unit: e.price_unit,
          price_discount: e.price_discount,
          price_discount_percent: e.price_discount_percent,
          price_grand_total: e.price_grand_total,
          is_discount: false
        }
      })
      const model = {
        id: value.id,
        code_id: value.code_id,
        doc_date: moment(value.doc_date),
        tax_type_id: value.tax_type_id,
        remark: value.details.remark,
        remark_inside: value.details.remark_inside,
        price_discount_bill: value.price_discount_bill,
        price_sub_total: value.price_sub_total,
        price_discount_total: value.price_discount_total,
        price_amount_total: value.price_amount_total,
        price_before_vat: value.price_before_vat,
        price_vat: value.price_vat,
        price_grand_total: value.price_grand_total,
        list_service_product: list_service_product,
        payment_method: value.details.payment_method
      }
      const DeliveryOrderDocsStatus = value?.ShopTemporaryDeliveryOrderDocs.some(where => where.status === 1) ?? false, taxInvoiceDocsStatus = value?.ShopTaxInvoiceDocs.some(where => where.status === 1) ?? false;
      setDisabledWhenDeliveryDocActive(DeliveryOrderDocsStatus)
      form.setFieldsValue({ ...model })
    } catch (error) {
      console.log('error setFormValueData:>> ', error);
    }
  }


  const onFinish = async (values) => {
    try {
      // console.log("values", values)
      setLoading(true)
      setCarPreLoading(true)
      const { price_discount_bill, price_discount_before_pay, payment_method, price_sub_total, price_discount_total, price_amount_total, price_before_vat, price_vat, price_grand_total, is_use_coupon_michelin_500 } = values


      let user_data = cookies.get("user_data")
      let line_data = cookies.get("line_data")
      const model = {
        shop_id: authUser?.UsersProfile?.shop_id,
        [user_data.customer_type === 'personal' ? "per_customer_id" : "bus_customer_id"]: user_data.id,
        doc_type_id: "67c45df3-4f84-45a8-8efc-de22fef31978",
        doc_date: moment(values.doc_date).format("YYYY-MM-DD"),
        tax_type_id: values.tax_type_id,
        doc_sales_type: 2,
        price_discount_bill: !!price_discount_bill ? MatchRound(price_discount_bill) : "0.00",
        price_discount_before_pay: !!price_discount_before_pay ? MatchRound(price_discount_before_pay) : "0.00",
        price_sub_total: !!price_sub_total ? MatchRound(price_sub_total) : "0.00",
        price_discount_total: !!price_discount_total ? MatchRound(price_discount_total) : "0.00",
        price_amount_total: !!price_amount_total ? MatchRound(price_amount_total) : "0.00",
        price_before_vat: !!price_before_vat ? MatchRound(price_before_vat) : "0.00",
        price_vat: !!price_vat ? MatchRound(price_vat) : "0.00",
        price_grand_total: !!price_grand_total ? MatchRound(price_grand_total) : "0.00",
        details: {
          remark: values?.remark ?? null,
          remark_inside: values?.remark_inside === undefined ? "" + "จ่ายโดย " + payment_method : values?.remark_inside + "จ่ายโดย " + payment_method,
          user_line_id: line_data.uid,
          payment_method,
          is_use_coupon_michelin_500
        },
        shopServiceOrderLists: !!values.list_service_product && values.list_service_product.length > 0 ?
          values.list_service_product.map((e, index) => {
            const modelServiceLists = {
              seq_number: index + 1,
              shop_id: authUser?.UsersProfile?.shop_id,
              shop_stock_id: e.shop_stock_id,
              shop_product_id: e?.shop_product_id,
              shop_warehouse_id: e?.shop_warehouse_id,
              shop_warehouse_shelf_item_id: e.shop_warehouse_shelf_item_id,
              purchase_unit_id: e.purchase_unit_id,
              dot_mfd: !!e?.dot_mfd && e?.dot_mfd !== "-" ? e?.dot_mfd : null,
              amount: e.amount,
              cost_unit: !!e?.product_cost && e?.product_cost !== "null" && e?.product_cost !== "-" ? takeOutComma(e?.product_cost) : "0.00",
              price_unit: e?.price_unit ?? "0.00",
              price_discount: e?.price_discount ?? "0.00",
              price_discount_percent: e?.price_discount_percent ?? "0.00",
              price_grand_total: e?.price_grand_total ?? "0.00",
            }
            if (configModal.mode !== "add") modelServiceLists.id = e.id
            return {
              ...modelServiceLists
            }
          })
          : []
      }
      console.log('model :>> ', model);
      let res
      if (configModal.mode === "add") {
        res = await API.post(`/shopServiceOrderDoc/add`, model)
        if (res.data.status === "success") {
          callLineNotify("add", res.data.data.ShopServiceOrderDoc)
          callLineBot("add", res.data.data)
        }
      } else if (configModal.mode === "edit") {
        const { id } = form.getFieldValue()
        model.status = 1
        res = await API.put(`/shopServiceOrderDoc/put/${id}`, model)
        if (res.data.status === "success") {
          callLineNotify("edit", res.data.data.ShopServiceOrderDoc.previous)
        }
      }
      let resCustomer
      if (is_use_coupon_michelin_500) {
        let url = user_data.customer_type === 'personal' ? "shopPersonalCustomers" : "shopBusinessCustomers"

        const { data } = await API.get(`/${url}/byid/${user_data.id}`);
        if (data.status == "success") {
          const _model = data.data;
          _model.other_details.is_use_coupon_michelin_500 = is_use_coupon_michelin_500
          const _modelUpdate = {
            other_details: _model.other_details
          }
          resCustomer = await API.put(`/${url}/put/${user_data.id}`, _modelUpdate);

          let userData = {
            id: _model.id,
            customer_name: _model.bus_type_id ? _model.customer_name[locale.locale] : `${_model.customer_name.first_name[locale.locale]} ${_model.customer_name.last_name[locale.locale]}`,
            customer_type: _model.bus_type_id ? "business" : "personal",
            is_use_coupon_michelin_500: _model.other_details.is_use_coupon_michelin_500 ?? false
          }
          cookies.set("user_data", userData, { path: "/" });

        }
      }


      if (isFunction(callBack)) {
        localStorage.removeItem("product_pick");
        callBackOnFinish()
      }
      setIsModalVisible(false)
      setLoading(false)
      setCarPreLoading(false)
      handleCancelModal()
      setCouponButtonName("ส่วนลด/คูปอง")
    } catch (error) {
      console.log("error", error)
    }
  }

  const onFinishFailed = (errorInfo) => {
    Modal.error({
      title: 'เกิดข้อผิดพลาด',
      content: errorInfo,
      centered: true,
      footer: null,
    });
  };

  const callLineNotify = async (type, response) => {
    // console.log("response", response)
    let url = response.bus_customer_id !== null ? "shopBusinessCustomers" : "shopPersonalCustomers"
    let id = response.bus_customer_id !== null ? response.bus_customer_id : response.per_customer_id
    const { data } = await API.get(`/${url}/byid/${id}`)
    let customer_name = ""
    // console.log("datasssssssssss", data)
    if (data.status == "success") {
      switch (url) {
        case "shopBusinessCustomers":
          customer_name = data.data.customer_name[locale.locale]
          break;
        case "shopPersonalCustomers":
          customer_name = `${data.data.customer_name.first_name[locale.locale]} ${data.data.customer_name.last_name[locale.locale]}`
          break;
        default:
          customer_name = ""
          break;
      }
    }
    console.log("customer_name", customer_name)
    let _model = {
      message: await type === "add" ? `\n${customer_name}\nลูกค้าสร้างใบจองสินค้า\nเลขที่ ${response.code_id}` : `\nลูกค้าแก้ไขใบจองสินค้า\nเลขที่ ${response.code_id}`
    }
    // console.log("_model", _model)
    let res = await API.post(`/line/notify`, _model)

    if (res.data.status == "success") {
      // console.log("res", res)
    }
  }

  const callLineBot = async (type, response) => {
    let line_data = cookies.get("line_data")
    // console.log("responsessssssssssssssssssssssssssssssssss", response)
    let url = response.ShopServiceOrderDoc.bus_customer_id !== null ? "shopBusinessCustomers" : "shopPersonalCustomers"
    let id = response.ShopServiceOrderDoc.bus_customer_id !== null ? response.ShopServiceOrderDoc.bus_customer_id : response.ShopServiceOrderDoc.per_customer_id
    const { data } = await API.get(`/${url}/byid/${id}`)
    let customer_name = ""

    if (data.status == "success") {
      switch (url) {
        case "shopBusinessCustomers":
          customer_name = data.data.customer_name[locale.locale]
          break;
        case "shopPersonalCustomers":
          customer_name = `${data.data.customer_name.first_name[locale.locale]} ${data.data.customer_name.last_name[locale.locale]}`
          break;
        default:
          customer_name = ""
          break;
      }
    }

    response.ShopServiceOrderLists.map((e) => { `\n${e.details.meta_data.ShopProduct.Product.product_name[locale.locale]}\n${e.amount} เส้น` })
    let _model = {
      messages: [
        {
          text: `${customer_name}\n${response.ShopServiceOrderLists.map((e) => (`\n${e.details.meta_data.ShopProduct.Product.product_name[locale.locale]}\n${e.amount} เส้น`))}\n\nวันที่ ${moment(response.ShopServiceOrderDoc.created_date).format("DD/MM/YYYY HH:mm น.")}\nเลขที่เอกสาร ${response.ShopServiceOrderDoc.code_id}\n\nระบบได้ดำเนินการสั่งซื้อสินค้าเรียบร้อย\nขอบคุณค่ะ`,
          type: "text"
        }
      ]
    }
    // console.log("_model", _model)
    let res = await API.post(`/line/message/${line_data.uid}`, _model)

    if (res.data.status == "success") {
      // console.log("res", res)
    }
  }

  const handleCancelModal = () => {
    setCarPreLoading(() => true)
    form.resetFields()
    setConfigModal({ ...configModal, mode: 'add', modeKey: null })
    setIsModalVisible(false)
    setDisabledWhenDeliveryDocActive(false)
    setIsIdEdit(null)

    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
    })
    //  window.location.reload()
    setCarPreLoading(false)
    setLoading(() => false)
  }

  const calculateResult = () => {
    try {

      const { list_service_product, price_discount_bill, tax_type_id } = form.getFieldValue()
      price_discount_bill = !!price_discount_bill ? Number(price_discount_bill) : null
      let price_sub_total = 0, price_discount_total = 0, price_amount_total = 0, price_before_vat = 0, price_grand_total = 0, price_vat = 0, price_discount_before_pay = 0;
      // console.log("test", list_service_product)

      // console.log("tax_type_id", tax_type_id)
      function summaryFromTable(arr, key, mutiplyWithAmount = false) {
        try {
          if (key === "price_unit") {
            let discount_arr = arr.filter(x => x.is_discount === true)
            // console.log("discount_arr", discount_arr)
            if (discount_arr.length > 0) {
              if (mutiplyWithAmount) {
                return discount_arr.reduce((prevValue, currentValue) => prevValue + (Math.abs(Number((currentValue?.[key] ?? 0)) * (Number(currentValue?.["amount"] ?? 0)))), 0)
              } else {
                // console.log("rrr", discount_arr)
                return discount_arr.reduce((prevValue, currentValue) => prevValue + Math.abs(Number((currentValue?.[key] ?? 0)), 0))
              }
            } else {
              return 0
            }
          } else {
            if (mutiplyWithAmount) {
              // console.log("key", key)
              // console.log("ss",arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0))
              return arr.reduce((prevValue, currentValue) => prevValue + (Number((currentValue?.[key] ?? 0) * (Number(currentValue?.["amount"] ?? 0)))), 0)
            } else {
              // console.log("dd", arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0))
              return arr.reduce((prevValue, currentValue) => prevValue + Number((currentValue?.[key] ?? 0)), 0)
            }
          }
        } catch (error) {
          console.log("summaryFromTable", error)
        }

      }
      // console.log("list_service_product", list_service_product)
      if (!!list_service_product && isArray(list_service_product) && list_service_product.length > 0) {
        price_discount_total = Number(summaryFromTable(list_service_product, "price_discount", true)) + (Number(price_discount_bill) ?? 0) + Number(summaryFromTable(list_service_product, "price_unit", true))
        price_sub_total = summaryFromTable(list_service_product, "price_grand_total", false) + (price_discount_total - price_discount_bill)
        price_amount_total = price_sub_total - price_discount_total
        // console.log("price_discount_total", price_discount_total)
        // console.log("price_sub_total", price_sub_total)
        // console.log("price_amount_total", price_amount_total)
        const { detail } = taxTypes.find(where => where.id === tax_type_id)
        console.log(detail)
        let taxRate = 0
        if (Number(detail.tax_rate_percent) > 9) {
          taxRate = Number(`1${detail.tax_rate_percent}`)
        } else {
          taxRate = Number(`10${detail.tax_rate_percent}`)
        }

        switch (tax_type_id) {
          case "8c73e506-31b5-44c7-a21b-3819bb712321":
            if (isPlainObject(detail)) {
              price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / taxRate)))
              price_before_vat = price_amount_total - price_vat
              price_grand_total = price_amount_total
            }
            break;
          default:
            if (isPlainObject(detail)) {
              price_vat = ((price_amount_total * ((Number(detail.tax_rate_percent)) / 100)))
              price_grand_total = price_amount_total + price_vat
              price_before_vat = price_amount_total
            }
            break;
        }
      }
      let _model = {
        price_discount_bill: !!price_discount_bill ? MatchRound(price_discount_bill) : null,
        price_sub_total,
        price_discount_total,
        price_amount_total,
        price_vat,
        price_before_vat,
        price_grand_total,
        price_discount_before_pay
      }
      // console.log("modeCal", _model)
      form.setFieldsValue(_model)
    } catch (error) {
      console.log('error calculateResult :>> ', error);
    }
  }

  useEffect(() => {
    setCouponUse("")
    setCouponButtonName("ส่วนลด/คูปอง")
  }, [isModalVisible])

  const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

  return (
    <>
      <Head>
        <title>{"ใบจองสินค้า"}</title>
      </Head>

      <div style={{ display: "flex", width: isFunction(callBack) ? null : "100vw", paddingTop: "20px", paddingBottom: "20px", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: isFunction(callBack) ? "100%" : "90%", borderRadius: "30px", border: isFunction(callBack) ? "0px" : "" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>ใบจองสินค้า</h3>
          </div>
          <Form
            form={formSearch}
            onFinish={onFinishSearch}
            onFinishFailed={onFinishSearchFailed}
          >

            <Form.Item
              className='pt-2'
              name="search"
            >
              <Input
                placeholder="ค้นหา"
                maxLength={10}
                addonAfter={
                  <Button
                    type='text'
                    size='small'
                    htmlType="submit"
                    style={{ border: 0 }}
                  >
                    ค้นหา
                  </Button>
                } />

            </Form.Item>
            <Row style={{ paddingBottom: "16px" }} gutter={8}>
              <Col span={20}>
              </Col>
              <Col span={4}>
                <Button
                  type='primary'
                  size='small'
                  style={{ border: 0, width: "100%" }}
                  onClick={() => addEditViewModal("add", null)}
                >
                  สร้าง
                </Button>
              </Col>
            </Row>
          </Form>
          <div hidden={loading === false}>
            <CarPreloader />
          </div>
          <div hidden={loading === true} >

            {listSearchDataTable.map((e, i) => (
              <div key={i}>
                <Row gutter={8}>
                  <Col
                    span={20}
                  // span={e?.ShopTemporaryDeliveryOrderDocs.some(where => where.status === 1) ? 20 : 16}
                  >
                    {e.code_id}
                  </Col>
                  <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                    <Button
                      type='primary'
                      size='small'
                      style={{ border: 0, width: "100%" }}
                      onClick={() => addEditViewModal("view", e.id)}
                    >
                      ดู
                    </Button>
                  </Col>
                  {/* <Col span={4} style={{ display: "flex", placeContent: "end" }} hidden={e?.ShopTemporaryDeliveryOrderDocs.some(where => where.status === 1)}>
                    <Button
                      type='primary'
                      size='small'
                      style={{ border: 0, width: "100%" }}
                      onClick={() => addEditViewModal("edit", e.id)}
                    >
                      แก้ไข
                    </Button>
                  </Col> */}
                  <Col span={24} style={{ paddingTop: "8px" }}>
                    วันที่เอกสาร {moment(e.doc_date).format("DD/MM/YYYY")}
                  </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
              </div>
            ))}
          </div>
          <div hidden={listSearchDataTable.length === 0}>
            <Pagination
              defaultCurrent={configTable.page}
              total={configTable.total}
              onChange={onChangePage}
              showSizeChanger
            />
          </div>

        </Card>
      </div>


      <Modal
        maskClosable={false}
        open={isModalVisible}
        onCancel={handleCancelModal}
        width="100vw"
        style={{ top: 5 }}
        closable
        footer={(
          <>
            <Button type="primary" onClick={() => form.submit()} disabled={configModal.mode === "view"}>{"บันทึก"}</Button>
            <Button onClick={() => handleCancelModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <Form
          form={form}
          labelCol={{ span: 24 }}
          wrapperCol={{ span: 24 }}
          layout={"vertical"}
          labelWrap
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <Row>
            <Col>
              <div className="head-line-text" >{configModal.mode === "view" ? "ดูเอกสาร" : configModal.mode === "add" ? "สร้างเอกสาร" : "แก้ไขเอกสาร"}</div>
            </Col>
          </Row>
          <LineOAFormShopWholeSaleDoc mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} calculateResult={calculateResult} setCouponButtonName={setCouponButtonName} coupontButtonName={coupontButtonName} setCouponUse={setCouponUse} couponUse={couponUse} />
          <LineOAListShopWholeSaleDoc mode={configModal.mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} calculateResult={calculateResult} />
        </Form>

      </Modal>


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

export default LineOAShopWholeSaleDoc;
