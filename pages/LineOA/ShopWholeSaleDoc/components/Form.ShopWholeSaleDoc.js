import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, Row, Col, Pagination, Divider, DatePicker, Select, List, Badge } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../../util/Api";
import Head from 'next/head';
import moment from "moment";
import CarPreloader from "../../../../components/_App/CarPreloader";
import InventoryWarehouseDetail from "../../InventoryWarehouseDetail";
import { BankOutlined, DollarOutlined, CreditCardOutlined } from '@ant-design/icons'
import { isFunction, get, method } from "lodash";
import { Cookies } from 'react-cookie'

const LineOAFormShopWholeSaleDoc = ({ mode, disabledWhenDeliveryDocActive = false, calculateResult, setCouponButtonName, coupontButtonName, setCouponUse, couponUse }) => {
  const form = Form.useFormInstance()
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [formSearch] = Form.useForm();
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [productWarehouseDetail, setProductWarehouseDetail] = useState({})
  const [loading, setLoading] = useState(false);
  const [isInventoryWarehouseDetailModalVisible, setIsInventoryWarehouseDetailModalVisible] = useState(false);
  const { taxTypes } = useSelector(({ master }) => master);
  const [paymentMethod, setPaymentMethod] = useState("บัตรเครดิต/เดบิต")
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [couponList, setCouponList] = useState([]);


  const cookies = new Cookies();

  const { authUser } = useSelector(({ auth }) => auth);

  const showModal = () => {
    setIsModalOpen(true);
  };
  useEffect(() => {
    const { payment_method } = form.getFieldValue()
    // console.log("payment_method", form.getFieldValue())
    if (payment_method !== undefined) {
      setPaymentMethod(payment_method)
    } else {
      setPaymentMethod("บัตรเครดิต/เดบิต")
    }
  }, [])



  const handleOk = (value) => {
    switch (value) {
      case "cash":
        form.setFieldsValue({ payment_method: "เงินสด" })
        setPaymentMethod("เงินสด")
        break;
      case "tranfer":
        form.setFieldsValue({ payment_method: "โอนเงินสด" })
        setPaymentMethod("โอนเงินสด")
        break;
      case "credit_card":
        form.setFieldsValue({ payment_method: "บัตรเครดิต/เดบิต" })
        setPaymentMethod("บัตรเครดิต/เดบิต")
        break;
      case "cheque":
        form.setFieldsValue({ payment_method: "เช็ค" })
        setPaymentMethod("เช็ค")
        break;
      case "customer_debt":
        form.setFieldsValue({ payment_method: "ลูกหนี้การค้า" })
        setPaymentMethod("ลูกหนี้การค้า")
        break;

      default:
        form.setFieldsValue({ payment_method: "บัตรเครดิต/เดบิต" })
        setPaymentMethod("บัตรเครดิต/เดบิต")
        break;
    }
    setIsModalOpen(false)
  };
  const handleCancel = () => {
    setIsModalOpen(false)
  };


  const handlePromotionModalOk = async (value) => {
    const { list_service_product } = form.getFieldValue()
    // console.log("sss", list_service_product)


    const { data } = await API.get(`/shopStock/all?search=DISBUY4DIS500&limit=10&page=1&sort=balance_date&order=asc&status=active&filter_wyz_code=false&filter_available_balance=true&min_balance=1`)
    // console.log("data", data.data)
    let promotion_reward_array = []
    data.data.data.map((e) => {
      e.warehouse_detail.map((el, i) => {
        promotion_reward_array.push({
          amount: 1,
          cost_unit: e?.ShopProduct?.product_cost,
          dot_mfd: el?.shelf?.dot_mfd ?? null,
          dot_show: el?.shelf?.dot_mfd ?? null,
          is_discount: true,
          list_code: e?.ShopProduct?.Product?.master_path_code_id,
          list_name: e?.ShopProduct?.Product?.product_name[locale.locale],
          max_amount: 1,
          price_discount: 0,
          price_discount_percent: 0,
          price_grand_total: e?.ShopProduct?.price?.suggasted_re_sell_price?.wholesale * 1,
          price_unit: e?.ShopProduct?.price?.suggasted_re_sell_price?.wholesale,
          product_brand_name: e?.ShopProduct?.ProductBrand?.brand_name[locale.locale] ?? null,
          purchase_unit_id: el?.shelf?.purchase_unit_id,
          purchase_unit_name: el?.shelf?.PurchaseUnit?.type_name[locale.locale] ?? "รายการ",
          seq_number: list_service_product.length + i + 1,
          shelf_name: el?.shelf?.Shelf?.name[locale.locale] ?? "",
          shop_product_id: e?.ShopProduct?.id,
          shop_stock_id: e?.id,
          shop_warehouse_id: el.warehouse,
          shop_warehouse_shelf_item_id: el.shelf.item,
          warehouse_detail: e.warehouse_detail,
          warehouse_name: "",
          is_product_promotion: true,
        })
      })
    })
    setCouponUse(value.id)
    setCouponButtonName(value.title)
    const newData = list_service_product.concat(promotion_reward_array)
    form.setFieldsValue({ list_service_product: newData, is_use_coupon_michelin_500: true })
    calculateResult()
    setCouponList([])
    setIsPromotionModalOpen(false)

  };

  const handleCanclePromotion = (value) => {
    const { list_service_product } = form.getFieldValue()

    setCouponUse("")
    setCouponButtonName("ส่วนลด/คูปอง")
    form.setFieldsValue({ list_service_product: list_service_product.filter(x => x.is_product_promotion !== true), is_use_coupon_michelin_500: false })
    calculateResult()
    setCouponList([])
    setIsPromotionModalOpen(false)
  }


  const handlePromotionModalCancel = () => {
    setCouponList([])
    setIsPromotionModalOpen(false)
  };


  const showPromotionModal = async () => {
    // console.log("couponUse", couponUse)
    const { list_service_product } = form.getFieldValue()
    let user_data = cookies.get("user_data")
    let couponList = [
      {
        id: "1",
        title: 'ส่วนลด 500 บาท',
        description: "เมื่อซื้อสินค้า 4 เส้นขึ้นไป รับส่วนลด 500 บาท",
        status: false,
      },
    ];
    let couponList2 = [
      {
        id: "1",
        title: 'ส่วนลด 500 บาท',
        description: "เมื่อซื้อสินค้า 4 เส้นขึ้นไป รับส่วนลด 500 บาท",
        status: user_data.is_use_coupon_michelin_500,
      },
    ];
    let filterBrand = await list_service_product
    let sum = await filterBrand.reduce((a, b) => a + b.amount, 0)
    filterBrand.reduce((a, b) => a.amount + b.amount, 0)
    if (sum >= 4 && !user_data.is_use_coupon_michelin_500) {
      await setCouponList(await couponList)
    }
    if (user_data.is_use_coupon_michelin_500) {
      await setCouponList(await couponList2)
    }
    setIsPromotionModalOpen(true);
  };


  return (
    <>
      <Row gutter={[20, 0]}>
        <Form.Item
          hidden
          name="is_use_coupon_michelin_500"
          label="คูปอง500"
        >
        </Form.Item>

        <Col lg={8} md={12} sm={12} xs={24} hidden={true}>
          <Form.Item
            name="id"
            label="รหัสเอกสาร"
          >
            <Input style={{ width: "100%" }} disabled={true} />
          </Form.Item>
        </Col>
        <Col lg={8} md={12} sm={12} xs={24} hidden={mode === "add"}>
          <Form.Item
            name="code_id"
            label="เลขที่เอกสาร"
          >
            <Input style={{ width: "100%" }} disabled={true} />
          </Form.Item>
        </Col>
        <Col lg={8} md={12} sm={12} xs={24}>
          <Form.Item
            name="doc_date"
            label="วันที่เอกสาร"
            rules={[
              {
                required: true,
                message: "กรุณากรอกข้อมูล",
              },
            ]}
          >
            <DatePicker placeholder="เลือกวันที่" style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={mode === "view" || disabledWhenDeliveryDocActive} />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item
            name="payment_method"
            label="วิธีการชำระเงิน"
            rules={[
              {
                required: true,
                message: "กรุณากรอกข้อมูล",
              },
            ]}
          >

            <Row gutter={10}>
              <Col span={12}>
                <Button style={{ width: "100%", height: "80px", borderRadius: "10px" }}>
                  <Row>
                    <Col span={24}>
                      <Image src="/assets/images/icon/cash.svg" style={{ height: "30px" }} hidden={paymentMethod !== "เงินสด"} preview={false} />
                      <Image src="/assets/images/icon/money-transfer.svg" style={{ height: "30px" }} hidden={paymentMethod !== "โอนเงินสด"} preview={false} />
                      <BankOutlined style={{ fontSize: "30px" }} hidden={paymentMethod !== "เช็ค"} />
                      <Image src="/assets/images/icon/credit-card.svg" style={{ height: "30px" }} hidden={paymentMethod !== "บัตรเครดิต/เดบิต"} preview={false} />
                      <DollarOutlined style={{ fontSize: "30px" }} hidden={paymentMethod !== "ลูกหนี้การค้า"} />
                    </Col>
                    <Col span={24}>
                      {paymentMethod}
                    </Col>
                  </Row>
                </Button>
              </Col>
              <Col span={12}>
                <Button style={{ width: "100%", height: "80px", borderStyle: "dashed", borderRadius: "10px" }} onClick={() => showModal()}>เลือกวิธีชำระเงิน</Button>
              </Col>
            </Row>
          </Form.Item>
        </Col>
        <Col lg={8} md={12} sm={12} xs={24} hidden>
          <Form.Item
            name="tax_type_id"
            label="อัตราภาษี (%)"
          >
            <Select
              showSearch
              showArrow={false}
              filterOption={false}
              style={{ width: "100%" }}
              disabled
            >
              {taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${e.id}`}>{get(e, `detail.tax_rate_percent`, "-")}</Select.Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col span={24} style={{ textAlign: "center" }}>
          <div className="coupon">
            <Button style={{ width: "100%", height: "60px", borderStyle: "dashed", borderRadius: "10px", borderColor: "white", background: "none", color: "white" }} onClick={() => showPromotionModal()}>{coupontButtonName} </Button>
          </div>
        </Col>
      </Row>

      <Modal title="เลือกวิธีชำระเงิน" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} style={{ top: 30 }} footer={null}>
        <Row gutter={[12, 12]}>
          <Col span={24}>
            <Button
              onClick={() => handleOk("cash")}
              style={{ width: "100%", height: "80px" }}
            >
              <Row style={{ alignItems: "center" }}>
                <Col span={12}>
                  <Image src="/assets/images/icon/cash.svg" style={{ height: "60px" }} preview={false} />
                </Col>
                <Col span={12}>
                  เงินสด
                </Col>
              </Row>
            </Button>
          </Col>
          <Col span={24}>
            <Button
              onClick={() => handleOk("tranfer")}
              style={{ width: "100%", height: "80px" }}
            >
              <Row style={{ alignItems: "center" }}>
                <Col span={12}>
                  <Image src="/assets/images/icon/money-transfer.svg" style={{ height: "70px" }} preview={false} />
                </Col>
                <Col span={12}>
                  โอนเงินสด
                </Col>
              </Row>
            </Button>
          </Col>
          <Col span={24}>
            <Button
              onClick={() => handleOk("cheque")}
              style={{ width: "100%", height: "80px" }}
            >
              <Row style={{ alignItems: "center" }}>
                <Col span={12}>
                  <BankOutlined style={{ fontSize: "60px" }} />
                </Col>
                <Col span={12}>
                  เช็ค
                </Col>
              </Row>
            </Button>
          </Col>
          <Col span={24}>
            <Button
              onClick={() => handleOk("credit_card")}
              style={{ width: "100%", height: "80px" }}
            >
              <Row style={{ alignItems: "center" }}>
                <Col span={12}>
                  <Image src="/assets/images/icon/credit-card.svg" style={{ height: "60px" }} preview={false} />
                </Col>
                <Col span={12}>
                  บัตรเครดิต
                </Col>
              </Row>
            </Button>
          </Col>
          <Col span={24}>
            <Button
              onClick={() => handleOk("customer_debt")}
              style={{ width: "100%", height: "80px" }}
            >
              <Row style={{ alignItems: "center" }}>
                <Col span={12}>
                  <DollarOutlined style={{ fontSize: "60px" }} />
                </Col>
                <Col span={12}>
                  ลูกหนี้เครดิต
                </Col>
              </Row>
            </Button>
          </Col>
        </Row>
      </Modal>

      <Modal title="เลือกส่วนลด/คูปอง" onCancel={handlePromotionModalCancel} open={isPromotionModalOpen} style={{ top: 30 }} footer={null}>
        <Row gutter={[12, 12]}>
          <Col span={24}>
            {couponList.map((item) => (
              <div
                className="coupon"
                style={{ background: item.status ? "#c7c7c7" : "linear-gradient(123deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)" }}>
                <Row
                  style={{
                    padding: "10px",
                    margin: "12px",
                    background: item.status ? "#e1e1e1" : "white",
                    borderRadius: "10px",
                  }}

                  onClick={() => item.status ? console.log("used") : couponUse === "1" ? handleCanclePromotion(item) : handlePromotionModalOk(item)}
                >
                  <Col span={4} style={{ textAlign: "center" }}>
                    <CreditCardOutlined />
                  </Col>
                  <Col span={20}>
                    <Col>
                      {item.title}
                    </Col>
                    <Col style={{ color: "gray" }}>
                      {item.description}
                    </Col>
                  </Col>
                </Row>
              </div>
            ))}

          </Col>

        </Row>
      </Modal>


      <style jsx global>
        {`
          body {
              background: ${mainColor};
              color: #fff;
              overflow-y: auto;
          }
          .coupon{
              padding: 15px 6px;
              margin: 10px 0px;
              border-radius: 5px;
              background: linear-gradient(123deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%);
              -webkit-mask-image: radial-gradient(circle at 10px, transparent 10px, red 10.5px);
              -webkit-mask-position: -10px;
              -webkit-mask-size: 100% 48px;
          }
        `}
      </style>
    </>
  );
};

export default LineOAFormShopWholeSaleDoc;
