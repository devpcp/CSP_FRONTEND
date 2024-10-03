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
import {
  ShoppingCartOutlined
} from '@ant-design/icons';
import axios from "axios";

const { TextArea } = Input;

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
      const res = await API.get(`/shopReports/shopStock?search=${search}&limit=${limit}&page=${page}&sort=balance_date&order=asc&status=active&min_balance=1&max_balance=999996&select_shop_ids=all`)

      if (res.data.status === "success") {
        // console.log("res.data.", res.data.data)
        const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
        try {
          data?.map((e) => {
            e.ShopProfiles.map((e2) => {
              e2?.ShopProduct?.ShopStocks[0]?.warehouse_detail?.map((ew) => {
                let sum = ew.shelf.reduce((prev, curr) => prev + (+curr.balance ?? 0), 0)
                ew.balance = sum
                ew.ShopWarehouse = warehouseList?.find(x => x?.id === ew?.warehouse)
                ew.shelf.map((e3) => {
                  e3.PurchaseUnit = productPurchaseUnitTypes?.find(x => x?.id === e3?.purchase_unit_id)
                  e3.Shelf = ew?.ShopWarehouse?.shelf?.find(x => x?.code === e3?.item)
                  e3.year = e3.dot_mfd.split("")[2] + e3.dot_mfd.split("")[3]
                })
              })
            })
          })
        } catch (error) {
          console.log("error ", error)
        }


        // data?.map((e, i) => {
        //   console.log("warehouse_detail", e.warehouse_detail)
        //   e.warehouse_detail?.map((ew, ei) => {
        //     if (e.warehouse_show.findIndex(x => x.price_show === ew.price_show) === -1) {
        //       ew.price_show = ew.price_show === 0 || ew.price_show === "0" || ew.price_show === "" || ew.price_show === null ? e.ShopProduct.price.suggasted_re_sell_price.wholesale : ew.price_show
        //       e.warehouse_show.push(ew)
        //     } else {
        //       try {
        //         let find = e.warehouse_show.find(x => x.price_show === ew.price_show)
        //         let findIndex = e.warehouse_show.findIndex(x => x.price_show === ew.price_show)
        //         let balance = e.warehouse_show[findIndex].shelf.new_balance !== undefined ? (+e.warehouse_show[findIndex].shelf.new_balance) : (+find.shelf.balance)
        //         let balance_show = e.warehouse_show[findIndex].shelf.new_balance_show !== undefined ? (+e.warehouse_show[findIndex].shelf.new_balance_show) : (+find.shelf.balance_show)
        //         e.warehouse_show[findIndex].shelf.new_balance_show = balance_show + (+ew.shelf.balance_show) > 20 ? "20" : (balance_show + (+ew.shelf.balance_show)).toLocaleString()
        //         e.warehouse_show[findIndex].shelf.new_balance = balance + (+ew.shelf.balance) > 20 ? "20" : (balance + (+ew.shelf.balance)).toLocaleString()
        //       } catch (error) {
        //         console.log("error", error)
        //       }
        //     }
        //   })
        // })
        console.log("data", data)
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
    console.log("ew.shelf.dot_show", ew.shelf.dot_show)
    try {
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
        warehouse_detail: e.warehouse_detail.filter(x => x.price_show === ew.price_show),
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
      // console.log("model", model)
      formAddToCart.setFieldsValue({ ...model })
      await setIsAddToCartModalVisible(true)
    } catch (error) {
      console.log("error", error)
    }
    // console.log("e", e)

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

            {listSearchDataTable.map((e, i) => (
              <>
                <Row key={i}>
                  <Col span={24}>
                    <b>{e.Product.master_path_code_id}</b>
                  </Col>
                  <Col span={24} hidden={!e?.Product?.ProductBrand?.details?.img_url}>
                    <Image
                      height={"35px"}
                      width={"100px"}
                      src={e?.Product?.ProductBrand?.details?.img_url} />
                  </Col>
                  <Col span={24}>
                    {e.Product.product_name[locale.locale]}
                  </Col>
                </Row>

                <Row style={{ paddingTop: "16px" }}>
                  <Col span={24}>
                    {e.ShopProfiles.filter(x => (+x.ShopProduct?.ShopStocks[0]?.balance) !== 0 && x.ShopProduct?.ShopStocks[0]?.balance !== undefined).map((ew, iw) => (

                      <div key={iw} style={{ paddingBottom: "6px" }}>
                        {console.log("ss", ew.ShopProduct?.ShopStocks[0]?.balance)}
                        <Row gutter={4}>
                          <Col span={14} style={{ display: "flex", placeContent: "start" }}>
                            {ew.shop_name.shop_local_name ? ew.shop_name.shop_local_name : ew.shop_name[locale.locale]}
                          </Col>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            {ew?.ShopProduct?.ShopStocks[0]?.balance ?? 0}
                          </Col>
                          <Col span={2} style={{ display: "flex", placeContent: "end" }}>
                            {/* {ew?.ShopProduct?.ShopStocks[0]?.balance ?? 0} */}
                          </Col>
                          <Col span={4} style={{ display: "flex", placeContent: "end" }}>
                            <Button
                              type='primary'
                              size='small'
                              style={{ border: 0 }}
                              onClick={() => addEditViewModal(ew?.ShopProduct?.ShopStocks[0])}
                              hidden={!ew?.ShopProduct?.ShopStocks[0]?.balance || +ew?.ShopProduct?.ShopStocks[0]?.balance === 0}
                            >
                              ดูคลัง
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </Col>
                </Row >
                <Divider style={{ margin: "8px 0", }} />
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

        </Card >
      </div >

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
