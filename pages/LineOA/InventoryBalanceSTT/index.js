import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, Row, Col, Pagination, Divider, InputNumber, Badge, message } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";
import CarPreloader from "../../../components/_App/CarPreloader";
import InventoryWarehouseDetail from "../InventoryWarehouseDetail";
import { isFunction, isArray, isUndefined } from "lodash";
import ShopWholeSaleDoc from "../ShopWholeSaleDoc"
import {
  ShoppingCartOutlined
} from '@ant-design/icons';
import axios from "axios";

const { TextArea } = Input;
const { Text, Link } = Typography;

const LineOAInventoryBalance = ({ callBack }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [formSearch] = Form.useForm();
  const [formAddToCart] = Form.useForm();
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [productWarehouseDetail, setProductWarehouseDetail] = useState({})
  const [loading, setLoading] = useState(false);
  const [isInventoryWarehouseDetailModalVisible, setIsInventoryWarehouseDetailModalVisible] = useState(false);
  const [warehouseList, setWarehouseList] = useState([])
  const { productPurchaseUnitTypes } = useSelector(({ master }) => master);
  const [isShopWholeSaleDocModalVisible, setIsShopWholeSaleDocModalVisible] = useState(false);
  const [productWarehousePick, setProductWarehousePick] = useState([])
  const [isAddToCartModalVisible, setIsAddToCartModalVisible] = useState(false);
  const [isCartModalVisible, setIsCartModalVisible] = useState(false);
  const [cartList, setCartList] = useState([])
  const cookies = new Cookies();
  const userData = cookies.get("user_data")
  // const cookie = new Cookies();

  useEffect(() => {
    getMasterData()
  }, [])

  const getMasterData = async () => {
    try {
      const shopWarehouseAllList = await getShopWarehousesAllList()
      await setWarehouseList(shopWarehouseAllList)
    } catch (error) {
      console.log("getMasterData : ", error)
    }
  }


  const formatNumber = (val, isUseDecimals = true) => {
    try {
      if (isUseDecimals) {
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      } else {
        return Number(val).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      }

    } catch (error) {

    }
  }

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
      sort: "balance_date",
      order: "ascend",
    },
    modelSearch: {
      search: "",
      status: "active",
      type_group_id: null,
      product_type_id: null,
      product_brand_id: null,
      product_model_id: null,
      filter_balance: [1, 999999]
    }
  }
  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable)

  const [configSort, setConfigSort] = useState(init.configSort)

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch)



  /* ค้นหา */
  const getDataSearch = async ({ search = modelSearch.search ?? "", filter_balance = modelSearch.filter_balance ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _which = (status === "management") ? "michelin data" : "my data", type_group_id = modelSearch.type_group_id ?? "", product_type_id = modelSearch.product_type_id ?? "", product_brand_id = modelSearch.product_brand_id ?? "", product_model_id = modelSearch.product_model_id ?? "" }) => {
    try {
      if (page === 1) setLoading(true)
      const res = await API.get(`/shopStock/all?filter_available_balance=true&type_group_id=da791822-401c-471b-9b62-038c671404ab&limit=${limit}&page=${page}&sort=${sort}&order=${order}&search=${search}&status=active&min_balance=${filter_balance[0]}&max_balance=${filter_balance[1]}${!!type_group_id ? `&type_group_id=${type_group_id}` : ""}${!!product_type_id ? `&product_type_id=${product_type_id}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${!!product_model_id ? `&product_model_id=${product_model_id}` : ""}`)

      if (res.data.status === "success") {
        // console.log("res.data.", res.data.data)
        const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
        let yearNow = moment(Date.now()).format("YY")
        data?.map((e) => {
          e.warehouse_show = []
          e.warehouse_detail?.map((ew) => {

            ew.ShopWarehouse = warehouseList?.find(x => x?.id === ew?.warehouse)
            ew.shelf.PurchaseUnit = productPurchaseUnitTypes?.find(x => x?.id === ew?.shelf?.purchase_unit_id)
            ew.shelf.balance_show = ew.shelf.balance >= 20 ? 20 : ew.shelf.balance
            ew.shelf.Shelf = ew?.ShopWarehouse?.shelf?.find(x => x?.code === ew?.shelf?.item)
            ew.price_show = getPriceShow(e, ew)
            // ew.shelf.dot_show = ew.shelf.dot_mfd ? ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] === yearNow ? ew.shelf.dot_mfd.split("")[0] + "X" + ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] : ew.shelf.dot_mfd : ""
            ew.shelf.dot_show = ew.shelf.dot_mfd ? ew.shelf.dot_mfd.split("")[0] + "X" + ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] : ""
          })
          console.log("e", e.warehouse_detail)
          e.warehouse_detail.sort((a, b) => a?.shelf?.dot_mfd === undefined || b?.shelf?.dot_mfd === undefined ? -1 : Number(b?.shelf?.dot_mfd.slice(-2)) - Number(a?.shelf?.dot_mfd.slice(-2)))
          // e.warehouse_detail.sort((a, b) => a.price_show - b.price_show)

        })

        data?.map((e, i) => {
          try {
            e.warehouse_detail?.map((ew, ei) => {
              if (ew.shelf.dot_mfd) {
                if (e.warehouse_show.find(x => x.shelf.dot_show.split("")[2] + x.shelf.dot_show.split("")[3] === ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3])) {
                  // if (ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] === yearNow) {
                  if (e.warehouse_show.findIndex(x => x.price_show === ew.price_show) === -1) {
                    e.warehouse_show.push(ew)
                  } else {
                    try {
                      let find = e.warehouse_show.find(x => x.price_show === ew.price_show)
                      let findIndex = e.warehouse_show.findIndex(x => x.price_show === ew.price_show)
                      let balance = e.warehouse_show[findIndex].shelf.new_balance !== undefined ? (+e.warehouse_show[findIndex].shelf.new_balance) : (+find.shelf.balance)
                      let balance_show = e.warehouse_show[findIndex].shelf.new_balance_show !== undefined ? (+e.warehouse_show[findIndex].shelf.new_balance_show) : (+find.shelf.balance_show)
                      e.warehouse_show[findIndex].shelf.new_balance_show = balance_show + (+ew.shelf.balance_show) > 20 ? "20>" : (balance_show + (+ew.shelf.balance_show)).toLocaleString()
                      e.warehouse_show[findIndex].shelf.new_balance = balance + (+ew.shelf.balance) > 20 ? "20" : (balance + (+ew.shelf.balance)).toLocaleString()
                    } catch (error) {
                      console.log("error", error)
                    }
                  }
                } else {
                  e.warehouse_show.push(ew)
                }
              } else {
                e.warehouse_show.push(ew)
              }
            })
          } catch (error) {
            console.log("error", error)
          }
        })

        setListSearchDataTable(data)
        // console.log(data)
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

  const getPriceShow = (product_data, warehouse_data) => {
    try {
      let price_arr = []
      let find_price = []

      if (isArray(product_data?.ShopProduct?.price_arr) && product_data?.ShopProduct?.price_arr.length > 0) {
        price_arr = product_data?.ShopProduct?.price_arr
      } else {
        return +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
      }
      console.log("price_arr", price_arr)
      if (isArray(userData.tags) && userData.tags.length > 0) {
        userData.tags.map((e) => {
          if (price_arr.find(x => x?.price_name === e?.tag_name) !== undefined) {
            find_price.push(price_arr.find(x => x?.price_name === e?.tag_name))
          }
        })
      }
      if (find_price.length === 0) {
        find_price.push({
          price_name: "default",
          price_value: +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
        })
      }
      find_price.sort((a, b) => +a?.price_value - +b?.price_value)
    } catch (error) {
      console.log("error", error)
    }
    console.log("ffff", find_price)
    return +find_price[0]?.price_value

    // if (product_data?.ShopProduct?.price_dot_arr) {
    //   if (product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === "" || product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === undefined || +product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === 0) {
    //     return +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
    //   } else {
    //     return +product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value
    //   }
    // } else {
    //   return +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
    // }
    // if (product_data?.ShopProduct?.price_dot_arr) {
    //   if (product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === "" || product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === undefined || +product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value === 0) {
    //     return +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
    //   } else {
    //     return +product_data?.ShopProduct?.price_dot_arr?.find(x => x.price_name === warehouse_data.shelf.dot_mfd)?.price_value
    //   }
    // } else {
    //   return +product_data.ShopProduct.price.suggasted_re_sell_price.wholesale
    // }
  }

  const getShopWarehousesAllList = async () => {
    try {
      const { data } = await API.get(`shopWarehouses/all?limit=9999999&page=1&sort=code_id&order=asc`)
      return data.status === "success" ? data.data.data ?? [] : []
    } catch (error) {
      console.log("getShopWarehousesAllList : ", error)
    }
  }

  /* addEditView */
  const addEditViewModal = async (e) => {
    await setIsInventoryWarehouseDetailModalVisible(true)
    await setProductWarehouseDetail(e)
  };

  /* addEditView */
  const addEditViewShopWholeSaleDocModal = async (e, ew) => {
    const model = {
      list_code: e.ShopProduct.Product.master_path_code_id,
      list_name: e.ShopProduct.Product.product_name[locale.locale],
      shop_stock_id: e.id,
      seq_number: 1,
      shop_product_id: e.ShopProduct.id,
      shop_warehouse_id: ew.warehouse,
      warehouse_name: ew.ShopWarehouse.name[locale.locale],
      shop_warehouse_shelf_item_id: ew.shelf.item,
      shelf_name: ew.shelf.Shelf.name[locale.locale],
      purchase_unit_id: ew.shelf.purchase_unit_id,
      purchase_unit_name: ew.shelf.PurchaseUnit?.type_name[locale.locale],
      dot_mfd: ew.shelf.dot_mfd,
      dot_show: ew.shelf.dot_mfd ? ew.shelf.dot_mfd.split("")[0] + "X" + ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] : "XXXX",
      amount: ew.shelf.balance >= 4 ? 4 : ew.shelf.balance,
      cost_unit: e.ShopProduct.product_cost,
      price_unit: e.ShopProduct.price.suggasted_re_sell_price.wholesale,
      price_discount: 0,
      price_discount_percent: 0,
      price_grand_total: 0,
      is_discount: false
    }

    model.price_grand_total = model.amount * model.price_unit
    await setIsShopWholeSaleDocModalVisible(true)
    // console.log("model", model)
    await setProductWarehousePick(model)
  };

  const onFinishSearch = async (value) => {
    try {
      if (value.search === null || value.search === "" || isUndefined(value.search)) {
        Modal.warning({
          title: 'กรุณากรอกข้อมูล',
        });
      } else {
        getDataSearch({
          search: value.search
        })
      }

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
    getDataSearch({
      search: formSearch.getFieldValue().search,
      page: page,
      limit: size,
    })
  }

  const onReset = () => {
    setConfigTable(init.configTable)
    setConfigSort(init.configSort)
    // setModelSearch(init.modelSearch)
    getDataSearch({
      search: formSearch.getFieldValue().search ?? "",
      _status: init.modelSearch.status,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: (init.configSort.order === "descend" ? "desc" : "asc"),
    })
  }

  const handleCancelInventoryWarehouseDetailModal = () => {
    try {
      setIsInventoryWarehouseDetailModalVisible(false)
    } catch (error) {
      console.log("handleCancelInventoryWarehouseDetailModal : ", error)
    }
  }

  const handleCancelShopWholeSaleDocModal = () => {
    try {
      setIsShopWholeSaleDocModalVisible(false)
      onReset()
    } catch (error) {
      console.log("handleCancelShopWholeSaleDocModal : ", error)
    }
  }

  const handleCancelAddToCartModal = () => {
    try {
      setIsAddToCartModalVisible(false)
      onReset()
    } catch (error) {
      console.log("handleCancelAddToCartModal : ", error)
    }
  }

  const callbackWareHouse = (data) => {
    // console.log("callback Data", data)
    let _callBackData = {
      ...productWarehouseDetail,
      select_warehouse: { ...data },
    }
    callBack(_callBackData)
    setIsInventoryWarehouseDetailModalVisible(false)
  }

  const callbackShopWholeSaleDoc = (data) => {
    // console.log("callback Data", data)
    let _callBackData = {
      ...productWarehouseDetail,
      select_warehouse: { ...data },
    }
    callBack(_callBackData)
    setIsShopWholeSaleDocModalVisible(false)
  }

  const addEditViewAddToCartModal = async (e, ew) => {
    try {
      console.log("ew", ew.shelf.dot_show)
      console.log("ewssss", e.warehouse_detail)
      let yearNow = moment(Date.now()).format("YY")
      const model = {
        list_code: e.ShopProduct.Product.master_path_code_id,
        list_name: e.ShopProduct.Product.product_name[locale.locale],
        shop_stock_id: e.id,
        seq_number: 1,
        shop_product_id: e.ShopProduct.id,
        shop_warehouse_id: ew.warehouse,
        warehouse_name: ew.ShopWarehouse.name[locale.locale],
        shop_warehouse_shelf_item_id: ew.shelf.item,
        shelf_name: ew.shelf.Shelf.name[locale.locale],
        purchase_unit_id: ew.shelf.purchase_unit_id,
        purchase_unit_name: ew.shelf.PurchaseUnit?.type_name[locale.locale],
        dot_mfd: ew.shelf.dot_mfd,
        dot_show: ew.shelf.dot_mfd ? ew.shelf.dot_mfd.split("")[0] + "X" + ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] : "XXXX",
        amount: (ew.shelf.new_balance === undefined ? +ew.shelf.balance : +ew.shelf.new_balance) >= 4 ? 4 : ew.shelf.new_balance === undefined ? +ew.shelf.balance : +ew.shelf.new_balance,
        max_amount: (ew.shelf.new_balance === undefined ? +ew.shelf.balance : +ew.shelf.new_balance) >= 20 ? 20 : ew.shelf.new_balance === undefined ? +ew.shelf.balance : +ew.shelf.new_balance,
        cost_unit: e.ShopProduct.product_cost,
        price_unit: ew.price_show,
        price_discount: 0,
        price_discount_percent: 0,
        price_grand_total: 0,
        is_discount: false,
        warehouse_detail: e.warehouse_detail.filter(x => x.shelf.dot_show.split("")[2] + x.shelf.dot_show.split("")[3] === ew.shelf.dot_show.split("")[2] + ew.shelf.dot_show.split("")[3]),
        // warehouse_detail: yearNow === ew.shelf.dot_mfd.split("")[2] + ew.shelf.dot_mfd.split("")[3] ? e.warehouse_detail.filter(x => x.shelf.dot_mfd ? x.price_show === ew.price_show && yearNow === x.shelf.dot_mfd.split("")[2] + x.shelf.dot_mfd.split("")[3] : x.price_show === ew.price_show) : e.warehouse_detail.filter(x => x.shelf.dot_show === ew.shelf.dot_show),
        product_brand_name: e?.ShopProduct?.Product?.ProductBrand?.brand_name[locale.locale] ?? null,
      }
      model.price_grand_total = model.amount * model.price_unit


      const product_pick_arr = JSON.parse(localStorage.getItem("product_pick"))
      if (product_pick_arr !== null) {
        let checkProduct = product_pick_arr.find(x => x.shop_stock_id === e.id && x.shop_product_id === e.ShopProduct.id && x.shop_warehouse_id === ew.warehouse && x.shop_warehouse_shelf_item_id === ew.shelf.item && x.dot_mfd === ew.shelf.dot_mfd)
        if (!isUndefined(checkProduct)) {
          // console.log("checkProduct", checkProduct)
          model.max_amount = +model.max_amount - +checkProduct.amount
        }
      }
      console.log("model", model)
      formAddToCart.setFieldsValue({ ...model })
      await setIsAddToCartModalVisible(true)
    } catch (error) {
      console.log("error", error)
    }
  }


  const onFinishAddToCart = async (value) => {
    try {
      let arr = []
      const product_pick_arr = JSON.parse(localStorage.getItem("product_pick"))
      if (isArray(product_pick_arr)) {
        // console.log("value", value)
        let checkProduct = product_pick_arr.find(x => x.shop_stock_id === value.shop_stock_id && x.shop_product_id === value.shop_product_id && x.shop_warehouse_id === value.shop_warehouse_id && x.shop_warehouse_shelf_item_id === value.shop_warehouse_shelf_item_id && x.dot_mfd === value.dot_mfd)
        // console.log("checkProduct", checkProduct)
        if (checkProduct) {
          product_pick_arr[checkProduct.seq_number - 1].amount = product_pick_arr[checkProduct.seq_number - 1].amount + value.amount
          arr = [...product_pick_arr]
          // console.log("arar", arr)
        } else {
          value.seq_number = product_pick_arr.length + 1
          arr = [...product_pick_arr, value]
        }
      } else {
        arr = [{ ...value }]
      }
      localStorage.setItem("product_pick", JSON.stringify(arr))
      setCartList(arr)
    } catch (error) {
      console.log("error", error)
    }
  }

  const onFinishAddToCartFailed = () => {

  }

  const onChangeAmount = async () => {
    const { price_grand_total, amount, price_unit } = formAddToCart.getFieldValue()
    price_grand_total = amount * price_unit
    formAddToCart.setFieldsValue({
      price_grand_total,
    })
  }


  const handleCancelCartModal = () => {
    try {
      setIsCartModalVisible(false)
      onReset()
    } catch (error) {
      console.log("handleCancelAddToCartModal : ", error)
    }

  }
  const addEditViewCartModal = () => {
    try {
      // console.log("cartList", cartList)
      if (typeof window !== 'undefined') {
        const item = JSON.parse(localStorage.getItem('product_pick'))
        setCartList(item)
        setIsCartModalVisible(true)
      }
    } catch (error) {
      console.log("error", error)
    }
  }

  const handleDeleteCartAll = () => {
    setCartList([])
    localStorage.removeItem("product_pick")
  }

  const handleDeleteCart = (i) => {
    try {
      Modal.confirm({
        title: 'แจ้งเตือน',
        content: `ท่านต้องการลบสินค้ารายการที่ ${i + 1}`,
        centered: true,
        cancelText: "กลับ",
        okText: "ยืนยัน",
        onOk: () => {
          const item = JSON.parse(localStorage.getItem('product_pick'))
          item.splice(i, 1);
          setCartList(item)
          localStorage.setItem("product_pick", JSON.stringify(item))
        },
      });

    } catch (error) {
      console.log("handleDeleteCart error", error)
    }
  }

  const handleCreateWholeSaleDoc = async () => {
    const item = JSON.parse(localStorage.getItem('product_pick'))
    await setIsShopWholeSaleDocModalVisible(true)
    await setProductWarehousePick(item)
    await setIsCartModalVisible(false)
  }

  const callBackOnFinishCreateWholeSaleDoc = () => {
    try {
      // console.log("callBackOnFinishCreateWholeSaleDoc")
      setCartList([])
      // console.log("cartList", cartList)
    } catch (error) {
      console.log("error", error)
    }
  }

  const addToCart = () => {
    try {
      formAddToCart.validateFields().then(async () => {
        formAddToCart.submit()
        handleCancelAddToCartModal()
      }).catch((errorInfo) => {
        console.log("errorInfo", errorInfo)
      });
    } catch (error) {

    }
  }


  return (
    <>
      <Head>
        <title>{"สินค้าคงเหลือ"}</title>
      </Head>

      <div style={{ display: "flex", width: isFunction(callBack) ? "" : "100vw", paddingTop: "20px", paddingBottom: "20px", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
        <Card style={{ width: isFunction(callBack) ? "100%" : "90%", border: 0, borderRadius: "30px" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <h3>สินค้าคงเหลือ</h3>
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
                placeholder="พิมพ์ หน้า แก้ม ขอบ เช่น 2154517"
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
          </Form>
          <div hidden={loading === false}>
            <CarPreloader />
          </div>
          <div hidden={loading === true} >
            <div hidden={listSearchDataTable?.length === 0} style={{ display: "flex", justifyContent: "end", paddingBottom: "8px" }}>
              <Badge count={cartList?.length}>
                <Button
                  type='primary'
                  size='small'
                  style={{ border: 0 }}
                  onClick={() => addEditViewCartModal()}
                >
                  ตะกร้า
                </Button>
              </Badge>

            </div>

            {/* <Divider style={{ margin: "8px 0" }} /> */}
            {listSearchDataTable.map((e, i) => (
              <>

                <Row key={i}>
                  <Col span={24}>
                    <b>{e.ShopProduct.Product.master_path_code_id}</b>
                  </Col>
                  <Col span={24} hidden={!e.ShopProduct?.Product?.ProductBrand?.details?.img_url}>
                    {/* <div style={{ width: "100px", height: "35px" }}> */}
                    <Image
                      height={"35px"}
                      width={"100px"}
                      src={e.ShopProduct?.Product?.ProductBrand?.details?.img_url} />
                    {/* </div> */}
                  </Col>
                  {/* <Col span={24}>
                    <b>{e.ShopProduct?.Product?.ProductBrand?.brand_name[locale.locale] ?? "-"}</b>
                  </Col> */}
                  <Col span={14}>
                    {e.ShopProduct.Product.product_name[locale.locale]}
                  </Col>
                  <Col span={10} style={{ display: "flex", placeContent: "end" }}>

                    <Button
                      type='primary'
                      size='small'
                      style={{ border: 0 }}
                      onClick={() => addEditViewModal(e)}
                      hidden={!isFunction(callBack)}
                    >
                      ดูคลัง
                    </Button>
                  </Col>
                  <Col span={24} hidden={isFunction(callBack)}>
                    {e.warehouse_show.map((ew, iw) => (
                      <div key={iw} style={{ paddingBottom: "6px" }}>
                        <Row gutter={4}>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            DOT
                          </Col>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            {ew.shelf.dot_show}
                            {/* {ew.shelf.dot_show.split("X")[0]}X<span style={{ color: "red" }}>{ew.shelf.dot_show.split("X")[1]}</span> */}
                          </Col>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            {ew.shelf.new_balance_show ?? ew.shelf.balance_show}  {ew.shelf.PurchaseUnit?.type_name[locale.locale]}
                          </Col>
                          <Col span={8} style={{ display: "flex", placeContent: "end" }}>
                            <div hidden={isFunction(callBack)}>
                              <labe style={{ color: "#094" }}>{(+ew.price_show).toLocaleString()}</labe> บาท
                            </div>
                          </Col>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            <Button
                              type='primary'
                              size='small'
                              style={{ border: 0 }}
                              onClick={() => addEditViewAddToCartModal(e, ew)}
                            >
                              จอง
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
              </>
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
        open={isInventoryWarehouseDetailModalVisible}
        onCancel={handleCancelInventoryWarehouseDetailModal}
        width="100vw"
        style={{ top: 5 }}
        closable
        footer={(
          <>
            <Button onClick={() => handleCancelInventoryWarehouseDetailModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <InventoryWarehouseDetail title="ดูคลังสินค้า" productWarehouseDetail={productWarehouseDetail} callBack={isFunction(callBack) ? callbackWareHouse : null} />
      </Modal>

      <Modal
        maskClosable={false}
        open={isShopWholeSaleDocModalVisible}
        onCancel={handleCancelShopWholeSaleDocModal}
        width="100vw"
        style={{ top: 5, }}
        closable
        bodyStyle={{ padding: "0" }}
        footer={(
          <>
            <Button onClick={() => handleCancelShopWholeSaleDocModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <ShopWholeSaleDoc title="สร้างใบจองสินค้า" productWarehousePick={productWarehousePick} callBack={callbackShopWholeSaleDoc} callBackOnFinish={callBackOnFinishCreateWholeSaleDoc} />
      </Modal>

      <Modal
        maskClosable={false}
        open={isAddToCartModalVisible}
        onCancel={handleCancelAddToCartModal}
        width="100vw"
        style={{ top: 5, }}
        closable
        bodyStyle={{ padding: "0" }}
        footer={(
          <>
            <Button type="primary" onClick={() => addToCart()}>{"เพิ่มลงตะกร้า"}</Button>
            <Button onClick={() => handleCancelAddToCartModal()}>{"กลับ"}</Button>
          </>
        )}
      >

        <div style={{ display: "flex", paddingTop: "20px", paddingBottom: "20px", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
          <Card style={{ width: "90%", borderRadius: "30px", border: "0px" }}>

            <Form
              form={formAddToCart}
              onFinish={onFinishAddToCart}
              onFinishFailed={onFinishAddToCartFailed}
            >
              <Row>
                <Col span={24}>
                  <div style={{ color: "#40a9ff", fontSize: "18px" }}>เพิ่มสินค้าลงตะกร้า</div>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item name="id" label="ลำดับ" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="seq_number" label="ลำดับ">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="shop_product_id" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24}>
                  <Form.Item style={{ margin: "4px" }} name="list_code" label="รหัส">
                    <Input
                      disabled
                    />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24}>
                  <Form.Item style={{ margin: "4px" }} name="list_name" label="ชื่อ">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="product_brand_name" label="ยี่ห้อ">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="shop_stock_id" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="shop_warehouse_id" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="warehouse_name" label="คลัง">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="shop_warehouse_shelf_item_id" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="shelf_name" label="ชั้น">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col md={12} lg={12} sm={12} xs={12} hidden>
                  <Form.Item style={{ margin: "4px" }} name="dot_mfd" label="DOT" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col md={12} lg={12} sm={12} xs={12} hidden>
                  <Form.Item style={{ margin: "4px" }} name="dot_show" label="DOT">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col md={12} lg={12} sm={12} xs={12} hidden>
                  <Form.Item style={{ margin: "4px" }} name="max_amount" label="จำนวน" >
                    <InputNumber disabled />
                  </Form.Item>
                </Col>
                <Col md={12} lg={12} sm={12} xs={12}>
                  <Form.Item
                    style={{ margin: "4px" }}
                    name="amount"
                    label="จำนวน"
                    rules={[
                      { required: true, message: 'กรุณากรอกข้อมูล!' },
                      { type: "integer", message: "ตัวเลขเท่านั้น" },
                      {
                        type: 'number',
                        min: 0,
                        max: formAddToCart.getFieldValue().max_amount,
                        message: "เลือกสินค้าครบกำหนดแล้ว"
                      }
                    ]}>
                    <InputNumber style={{ width: "100%" }} onChange={onChangeAmount} max={formAddToCart.getFieldValue().max_amount} min={0} />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="purchase_unit_id" label="หน่วย" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="purchase_unit_name" label="หน่วย">
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="cost_unit" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12} >
                  <Form.Item style={{ margin: "4px" }} name="price_unit" label="ราคาต่อหน่วย" >
                    <InputNumber style={{ width: "100%" }} formatter={(value) => !!value ? formatNumber(value) : ""} disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={12} hidden>
                  <Form.Item style={{ margin: "4px" }} name="is_discount" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="price_discount" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>
                <Col lg={12} md={12} sm={12} xs={24} hidden>
                  <Form.Item style={{ margin: "4px" }} name="price_discount_percent" label="ต้นทุน" >
                    <TextArea autoSize disabled />
                  </Form.Item>
                </Col>

                <Col lg={12} md={12} sm={12} xs={24}>
                  <Form.Item style={{ margin: "4px" }} name="price_grand_total" label="ราคารวม" >
                    <InputNumber style={{ width: "100%" }} formatter={(value) => !!value ? formatNumber(value) : ""} disabled />
                  </Form.Item>
                </Col>

                <Form.Item name="warehouse_detail" hidden>
                  <Input ></Input>
                </Form.Item>
              </Row>
            </Form>
          </Card>
        </div>

      </Modal>




      <Modal maskClosable={false}
        open={isCartModalVisible}
        onCancel={handleCancelCartModal}
        style={{ top: 5, }}
        closable
        bodyStyle={{ padding: "0" }}
        footer={(
          <>
            <Button type="primary" onClick={() => handleCreateWholeSaleDoc()} disabled={cartList === null || cartList?.length === 0}>{"สร้างใบจอง"}</Button>
            <Button onClick={() => handleCancelCartModal()}>{"กลับ"}</Button>
          </>
        )}
      >

        <div style={{ display: "flex", paddingTop: "20px", paddingBottom: "20px", alignItems: "center", alignContent: "center", justifyContent: "center" }}>
          <Card style={{ width: "90%", borderRadius: "30px", border: "0px" }}>

            <Row>
              <Col span={16}><div style={{ color: "#40a9ff", fontSize: "22px" }}>ตะกร้า</div></Col>
              <Col span={8}>
                <Button
                  type='primary'
                  size='small'
                  style={{ border: 0, width: "100%" }}
                  danger
                  onClick={() => handleDeleteCartAll()}
                >
                  ลบทั้งหมด
                </Button>
              </Col>
            </Row>

            {cartList?.length > 0 ? cartList?.map((e, i) => (
              <>
                <Row key={i} gutter={8} >
                  <Col span={20}>
                    <b>รายการที่ {e.seq_number} {e?.list_code}</b>
                  </Col>
                  <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                    <Button
                      type='primary'
                      size='small'
                      style={{ border: 0, width: "100%" }}
                      danger
                      onClick={() => handleDeleteCart(i)}
                    >
                      ลบ
                    </Button>
                  </Col>
                  <Col span={24} style={{ paddingTop: "8px" }}>
                    {e?.list_name}
                  </Col>

                  <Col span={24} style={{ paddingTop: "8px" }}>
                    DOT <b>{e.dot_show ?? "-"}</b>
                  </Col>
                  <Col span={12} style={{ paddingTop: "8px" }}>
                    จำนวน <b>{e.amount ?? "-"}</b>
                  </Col>
                  <Col span={12} style={{ paddingTop: "8px" }}>
                    หน่วย <b>{e.purchase_unit_name ?? "-"}</b>
                  </Col>
                  <Col span={12} style={{ paddingTop: "8px" }}>
                    ราคา <b>{(+e.price_unit).toLocaleString() ?? "-"}</b>
                  </Col>
                  <Col span={12} style={{ paddingTop: "8px" }}>
                    ราคารวม <b>{(+e.price_unit * +e.amount).toLocaleString() ?? "-"}</b>
                  </Col>
                </Row>
                <Divider style={{ margin: "8px 0" }} />
              </>
            )) : <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>ไม่พบรายการ</div>}
          </Card>
        </div>
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

export default LineOAInventoryBalance;
