import { useEffect, useState } from "react";
import { Typography, Image, Form, Input, Modal, Button, Card, Row, Col, Pagination, Divider, DatePicker, InputNumber } from "antd";
import React from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../../util/Api";
import Head from 'next/head';
import { Cookies } from 'react-cookie'
import moment from "moment";
import CarPreloader from "../../../../components/_App/CarPreloader";
import InventoryBalance from "../../InventoryBalance";
import { isFunction } from "lodash";
import Fieldset from "../../../../components/shares/Fieldset";
import GetIntlMessages from '../../../../util/GetIntlMessages'
const { TextArea } = Input;

const LineOAListShopWholeSaleDoc = ({ mode, disabledWhenDeliveryDocActive = false, calculateResult }) => {
  const form = Form.useFormInstance()
  const [formEdit] = Form.useForm();
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [formSearch] = Form.useForm();
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [productWarehouseDetail, setProductWarehouseDetail] = useState({})
  const [loading, setLoading] = useState(false);
  const [isInventoryBalanceModalVisible, setIsInventoryBalanceModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { taxTypes } = useSelector(({ master }) => master);
  const checkTaxId = Form.useWatch("tax_type_id", form)


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

  const handleAdd = () => {
    const { list_service_product } = form.getFieldValue()
    const newData = {
      list_code: null,
      list_name: null,
      shop_stock_id: null,
      seq_number: list_service_product ? list_service_product?.length + 1 : 1,
      shop_product_id: null,
      shop_warehouse_id: null,
      warehouse_name: null,
      shop_warehouse_shelf_item_id: null,
      shelf_name: null,
      purchase_unit_id: null,
      purchase_unit_name: null,
      dot_mfd: null,
      dot_show: null,
      amount: null,
      cost_unit: null,
      price_unit: null,
      price_discount: null,
      price_discount_percent: null,
      price_grand_total: null,
      is_discount: false
    }
    list_service_product = !!list_service_product ? [...list_service_product, newData] : [newData]
    form.setFieldsValue({ list_service_product })
  }

  const handleEdit = async (e, index) => {
    console.log("editmodal", e)
    formEdit.setFieldsValue({
      ...e
    })
    setIsEditModalVisible(true)

  }


  const handleDelete = (id, index) => {
    Modal.warning({
      title: 'ต้องการลบรายการที่ ' + (index + 1),
      centered: true,
      footer: null,
      closable: true,
      okText: "ยืนยัน",
      onOk: () => {
        const { list_service_product } = form.getFieldValue()
        list_service_product.splice(index, 1)

        for (let i = 0; i < list_service_product.length; i++) {
          form.setFieldsValue({ [i]: { ...list_service_product[i] } })
        }

        delete form.getFieldValue()[list_service_product.length]
        form.setFieldsValue({ list_service_product })
      }
    });

  }

  const callBackInventoryBalance = (data) => {

    console.log("callback callBackInventoryBalance", data)
    const model_callback = {
      list_code: data.ShopProduct.Product.master_path_code_id,
      list_name: data.ShopProduct.Product.product_name[locale.locale],
      shop_stock_id: data.id,
      shop_product_id: data.ShopProduct.id,
      shop_warehouse_id: data.select_warehouse.warehouse,
      warehouse_name: data.select_warehouse.ShopWarehouse.name[locale.locale],
      shop_warehouse_shelf_item_id: data.select_warehouse.shelf.item,
      shelf_name: data.select_warehouse.shelf.Shelf.name[locale.locale],
      purchase_unit_id: data.select_warehouse.shelf.purchase_unit_id,
      purchase_unit_name: data.select_warehouse.shelf.PurchaseUnit.type_name[locale.locale],
      dot_mfd: data.select_warehouse.shelf.dot_mfd ?? null,
      dot_show: data.select_warehouse.shelf.dot_mfd ? data.select_warehouse.shelf.dot_mfd.split("")[0] + "X" + data.select_warehouse.shelf.dot_mfd.split("")[2] + data.select_warehouse.shelf.dot_mfd.split("")[3] : "XXXX",
      amount: data.select_warehouse.shelf.balance ?? 0,
      max_amount: data.select_warehouse.shelf.balance ?? 0,
      cost_unit: data.product_cost,
      price_unit: "0.00",
      price_discount: "0.00",
      price_discount_percent: "0.00",
      price_grand_total: "0.00",
      is_discount: false

    }
    formEdit.setFieldsValue(model_callback)
    setIsInventoryBalanceModalVisible(false)
  }

  const handleCancelInventoryBalanceModal = () => {
    try {
      setIsInventoryBalanceModalVisible(false)
    } catch (error) {
      console.log("handleCancelInventoryBalanceModal : ", error)
    }
  }

  const onFinishEdit = (value) => {
    try {
      console.log("value", value)
      let index = value.seq_number - 1
      value.price_grand_total = value.amount * value.price_unit
      const { list_service_product } = form.getFieldValue()
      list_service_product[index] = { ...value }

      form.setFieldsValue({
        list_service_product,
      })
      setIsEditModalVisible(false)
      calculateResult()
    } catch (error) {

    }
  }

  const onFinishEditFailed = () => {
    try {

    } catch (error) {

    }
  }


  const handleCancelEditModal = () => {
    try {
      setIsEditModalVisible(false)
    } catch (error) {
      console.log("handleCancelEditModal : ", error)
    }
  }

  const showInventoryBalanceModal = (index) => {
    setIsInventoryBalanceModalVisible(true)
  }

  const onChangeAmount = async () => {
    const { price_grand_total, amount, price_unit } = formEdit.getFieldValue()
    // console.log("price_grand_total", price_grand_total)
    price_grand_total = amount * price_unit
    // console.log("price_grand_total", price_grand_total)
    formEdit.setFieldsValue({
      price_grand_total,
    })
  }

  return (
    <>
      <Form.Item name={`list_service_product`} hidden />

      <div style={{ color: "#40a9ff", fontSize: "18px" }}>
        <Row gutter={8}>
          <Col span={20}>
            รายการสินค้า
          </Col>
          <Col span={4} >
            {/* <Button
              type='primary'
              size='small'
              style={{ border: 0, width: "100%" }}
              onClick={handleAdd}
              hidden={mode === "view" || disabledWhenDeliveryDocActive}
            >
              เพิ่ม
            </Button> */}
          </Col>
        </Row>
      </div>
      <Divider style={{ margin: "8px 0", border: "1px solid #ffcc00 " }} />
      {/* <Row style={{ justifyContent: "center" }} hidden={!form.getFieldValue().list_service_product.length === 0}>
        <Col >ไม่พบข้อมูล</Col>
      </Row> */}
      {Form.useWatch("list_service_product", form)?.map((e, i) => (
        <>
          <Row key={i} gutter={8} >
            <Col span={16}>
              <b>{e?.list_code}</b>
            </Col>
            <Col span={4} >
              {/* <Button
                type='primary'
                size='small'
                style={{ border: 0, width: "100%" }}
                hidden={mode === "view" || disabledWhenDeliveryDocActive}
                onClick={() => handleEdit(e, i)}
              >
                แก้ไข
              </Button> */}

            </Col>
            <Col span={4} style={{ display: "flex", placeContent: "end" }}>
              {/* <Button
                type='primary'
                size='small'
                style={{ border: 0, width: "100%" }}
                hidden={mode === "view" || disabledWhenDeliveryDocActive}
                onClick={() => handleDelete(e.id, i)}
              >
                ลบ
              </Button> */}
            </Col>
            <Col span={24} style={{ paddingTop: "8px" }}>
              {e?.list_name}
            </Col>
            <Col span={24} style={{ paddingTop: "8px" }}>
              ราคา <b>{(+e.price_unit).toLocaleString() ?? "-"}</b>
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
            <Col span={24} style={{ paddingTop: "8px" }}>
              ราคารวม <b>{(+e.price_unit * +e.amount).toLocaleString() ?? "-"}</b>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
        </>
      ))}
      <Divider style={{ margin: "8px 0", border: "1px solid #ffcc00 " }} />
      <div style={{ color: "#40a9ff", fontSize: "18px" }}>
        <Row gutter={8}>
          <Col span={20}>
          </Col>
          <Col span={4} >
            {/* <Button
              type='primary'
              size='small'
              style={{ border: 0, width: "100%" }}
              onClick={handleAdd}
              hidden={mode === "view" || disabledWhenDeliveryDocActive}
            >
              เพิ่ม
            </Button> */}
          </Col>
        </Row>
      </div>
      <div hidden>


        <Fieldset style={{ marginTop: "20px" }} legend={`สรุปรายการ`}>
          <Row gutter={[10, 10]}>
            <Col lg={12} md={12} xs={24}>
              <Form.Item label={GetIntlMessages("หมายเหตุ")} name="remark">
                <Input.TextArea style={{ width: "100%", }} rows={3} disabled={mode === "view" || disabledWhenDeliveryDocActive} />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} xs={24} hidden>
              <Form.Item label={GetIntlMessages("หมายเหตุภายใน")} name="remark_inside">
                <Input.TextArea style={{ width: "100%", }} rows={3} disabled={mode === "view" || disabledWhenDeliveryDocActive} />
              </Form.Item>
            </Col>

            <Col lg={{ span: 6, offset: 6 }} md={{ span: 6, offset: 6 }} xs={24} >
              <Form.Item label={GetIntlMessages("ส่วนลดท้ายบิล")} stringMode min={0} precision={2} name="price_discount_bill" hidden>
                <InputNumber style={{ width: "100%", textAlign: "end" }}
                  // formatter={(value) => !!value ? formatNumber(value) : ""}
                  formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                  onBlur={() => calculateResult()}
                  disabled={mode === "view" || disabledWhenDeliveryDocActive}
                />
              </Form.Item>
              {/* <Form.Item label={GetIntlMessages("ส่วนลดก่อนชำระเงิน")} stringMode min={0} precision={2} name="price_discount_before_pay">
              <InputNumber style={{ width: "100%", textAlign: "end" }} disabled
                formatter={(value) => !!value ? formatNumber(value) : ""}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item> */}
              <Form.Item label={GetIntlMessages("รวมเป็นเงิน")} stringMode min={0} precision={2} name="price_sub_total">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label={GetIntlMessages("ส่วนลดรวม")} stringMode min={0} precision={2} name="price_discount_total">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label={GetIntlMessages("ราคาหลังหักส่วนลด")} stringMode min={0} precision={2} name="price_amount_total">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label={GetIntlMessages("ราคาก่อนรวมภาษี")} stringMode min={0} precision={2} name="price_before_vat">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label={GetIntlMessages(`ภาษีมูลค่าเพิ่ม ${taxTypes.find(where => where.id === checkTaxId)?.[`detail`]["tax_rate_percent"] ?? null} %`)} stringMode min={0} precision={2} name="price_vat">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
              <Form.Item label={GetIntlMessages("จำนวนเงินรวมทั้งสิ้น")} stringMode name="price_grand_total">
                <InputNumber disabled style={{ width: "100%", textAlign: "end" }}
                  formatter={(value) => !!value ? formatNumber(value) : ""}
                  parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Fieldset>
      </div>
      <Row>
        <Col span={24}>
          <Form.Item label={GetIntlMessages("หมายเหตุ")} name="remark">
            <Input.TextArea style={{ width: "100%", }} rows={3} disabled={mode === "view" || disabledWhenDeliveryDocActive} />
          </Form.Item>
        </Col>
        <Col span={16}>
          รวมเป็นเงิน
        </Col>
        <Col span={8} style={{ textAlign: "end" }}>
          {formatNumber(Form.useWatch("price_sub_total", form) ?? "0.00")}
        </Col>
        <Col span={16}>
          ส่วนลดรวม
        </Col>
        <Col span={8} style={{ textAlign: "end", color: Form.useWatch("price_discount_total", form) ?? "0.00" === "0.00" ? "" : "red" }}>
          {Form.useWatch("price_discount_total", form) ?? "0.00" === "0.00" ? "" : "-"}{formatNumber(Form.useWatch("price_discount_total", form) ?? "0.00")}
        </Col>
        <Col span={16}>
          จำนวนเงินรวมทั้งสิ้น
        </Col>
        <Col span={8} style={{ textAlign: "end" }}>
          {formatNumber(Form.useWatch("price_grand_total", form) ?? "0.00")}
        </Col>
      </Row>
      <Modal
        maskClosable={false}
        open={isInventoryBalanceModalVisible}
        onCancel={handleCancelInventoryBalanceModal}
        width="100vw"
        style={{ top: 5 }}
        closable
        footer={(
          <>
            <Button onClick={() => handleCancelInventoryBalanceModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <InventoryBalance callBack={callBackInventoryBalance} />
      </Modal>

      <Modal
        maskClosable={false}
        open={isEditModalVisible}
        onCancel={handleCancelEditModal}
        width="100vw"
        style={{ top: 5 }}
        closable
        footer={(
          <>
            <Button onClick={() => formEdit.submit()}>{"บันทึก"}</Button>
            <Button onClick={() => handleCancelEditModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <div style={{ paddingTop: "20px" }}></div>
        <Form
          form={formEdit}
          onFinish={onFinishEdit}
          onFinishFailed={onFinishEditFailed}
          labelCol={{
            span: 8,
          }}
        >
          <div className="head-line-text" >{"แก้ไขสินค้ารายการที่ " + formEdit.getFieldValue().seq_number}</div>
          <Row>
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
                  addonAfter={
                    <Button
                      disabled={mode === "view"}
                      type='text'
                      size='small'
                      style={{ border: 0 }}
                      onClick={() => showInventoryBalanceModal(formEdit.getFieldValue().seq_number)} >
                      เลือก
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24}>
              <Form.Item style={{ margin: "4px" }} name="list_name" label="ชื่อ">
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
            <Col lg={12} md={12} sm={12} xs={24}>
              <Form.Item style={{ margin: "4px" }} name="warehouse_name" label="คลัง">
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24} hidden>
              <Form.Item style={{ margin: "4px" }} name="shop_warehouse_shelf_item_id" label="ต้นทุน" >
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24}>
              <Form.Item style={{ margin: "4px" }} name="shelf_name" label="ชั้น">
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col md={12} lg={12} sm={12} xs={12}>
              <Form.Item style={{ margin: "4px" }} name="dot_mfd" label="DOT" hidden>
                <TextArea autoSize disabled />
              </Form.Item>
              <Form.Item style={{ margin: "4px" }} name="dot_show" label="DOT">
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col md={12} lg={12} sm={12} xs={12} hidden>
              <Form.Item style={{ margin: "4px" }} name="max_amount" label="จำนวน" >
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col md={12} lg={12} sm={12} xs={12}>
              <Form.Item style={{ margin: "4px" }} name="amount" label="จำนวน">
                <InputNumber style={{ width: "100%" }} onChange={onChangeAmount} max={formEdit.getFieldValue().max_amount} />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24} hidden>
              <Form.Item style={{ margin: "4px" }} name="purchase_unit_id" label="หน่วย" >
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24}>
              <Form.Item style={{ margin: "4px" }} name="purchase_unit_name" label="หน่วย">
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24} hidden>
              <Form.Item style={{ margin: "4px" }} name="cost_unit" label="ต้นทุน" >
                <TextArea autoSize disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24}>
              <Form.Item style={{ margin: "4px" }} name="price_unit" label="ราคาต่อหน่วย" >
                <InputNumber style={{ width: "100%" }} formatter={(value) => !!value ? formatNumber(value) : ""} disabled />
              </Form.Item>
            </Col>
            <Col lg={12} md={12} sm={12} xs={24} hidden>
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

          </Row>
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

export default LineOAListShopWholeSaleDoc;
