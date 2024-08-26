import { Row, Col, Form, Input, Select, Button } from "antd";
import { isArray, isPlainObject, get, isFunction } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import GetIntlMessages from "../../../../util/GetIntlMessages";
import moment from "moment";
import API from "../../../../util/Api";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import ComponentsDiscount from "../Invoices/Discount/Components.Routes.Modal.Discount";
import Promotions from "../Invoices/DocumentsAndPromotions/Components.Routes.Modal.Promotions";
import DepositReceipt from "../Invoices/DocumentsAndPromotions/Components.Routes.Modal.DepositReceipt";
import ComponentsPayWithCash from "../Invoices/Payment/Components.Routes.Modal.PayWith.Cash";
import ComponentsPayWithCreditCard from "../Invoices/Payment/Components.Routes.Modal.PayWith.CreaditCard";
import ComponentsPayWithCashTransfer from "../Invoices/Payment/Components.Routes.Modal.PayWith.CashTransfer";

/**
 *
 * @param {object} obj
 * @param {import('antd').FormInstance} obj.form
 * @returns
 */
const PaymentDocs = ({
  mode,
  form,
  onFinish,
  onFinishFailed,
  type,
  loading,
}) => {
  const { locale, subColor } = useSelector(({ settings }) => settings);

  /**
   * Get the value of the array field at the specified index
   * @param {number} index - The index of the array.
   * @param {string} type - The type of the field.
   * @returns The `getArrListValue` function returns an array of values.
   */
  const getArrListValue = (index, type) => {
    const { list_service_product } = form.getFieldsValue();
    if (list_service_product && !isPlainObject(list_service_product[index]))
      list_service_product = {};
    return isArray(list_service_product)
      ? list_service_product[index][type] ?? []
      : [];
  };

  const getValue = (index, type) => {
    const { list_service_product } = form.getFieldsValue();
    if (list_service_product && !isPlainObject(list_service_product[index]))
      list_service_product = {};
    return isArray(list_service_product)
      ? list_service_product[index][type] ?? ""
      : "";
  };

  const getValueForm = (type) => {
    const _form = form.getFieldValue();
    return _form[type] ?? "";
  };
  /**
   *  - type
   *    - 1 = เงินสด
   *    - 2 = เครดิต
   *    - 3 = โอนเงินสด
   * @param {Number} type
   * @param {*} value
   * @param {boolean} isPrintInvoices
   */
  const callbackPayment = (type, value, isPrintInvoices) => {
    try {
      const currentDate = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
      switch (type) {
        case 1:
          form.setFieldsValue({
            payment: {
              ...value,
              type,
              type_text: "เงินสด",
              payment_date: currentDate,
            },
          });
          if (isFunction(onFinish)) onFinish(form.getFieldValue(), isPrintInvoices);
          break;
        case 2:
          form.setFieldsValue({
            payment: {
              ...value,
              type,
              type_text: "เครดิต/เดบิต",
              payment_date: currentDate,
            },
          });
          if (isFunction(onFinish)) onFinish(form.getFieldValue(), isPrintInvoices);
          break;
        case 3:
          form.setFieldsValue({
            payment: {
              ...value,
              type,
              type_text: "โอนเงินสด",
              payment_date: currentDate,
            },
          });
          if (isFunction(onFinish)) onFinish(form.getFieldValue(), isPrintInvoices);
          break;

        default:
          break;
      }
      // if (type == 1) {
      //   // เงินสด
      //   // console.log('value', value)
      //   form.setFieldsValue({
      //     payment: {
      //       ...value,
      //       type,
      //       type_text: "เงินสด",
      //     },
      //   });
      //   if (isFunction(onFinish)) onFinish(form.getFieldValue(), isPrintInvoices);
      // }
    } catch (error) {
      // console.log('error callbackPayment:>> ', error);
    }

  };

  const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)
  
  return (
    <Row>
      <Col lg={12} md={24} sm={24} xs={24} style={{ paddingRight: 20 }}>
        <div className="invoices-totalprice pt-3 pb-2">
          <div>ราคารวม</div>
          <div>{getValueForm("total_text")} บาท</div>
        </div>

        <div className="invoices-price-paid">
          <div className="invoices-text-detail">
            ราคาทั้งหมดที่ต้องจ่าย (บาท)
          </div>
          <div className="invoices-text-price">
            {getValueForm("net_total_text")} บาท
          </div>
        </div>

        <div className="invoices-price-detail">
          <div className="invoices-discount-coupon">
            <div className="invoices-text-discount-detail">
              ส่วนลดคูปอง (บาท)
            </div>
            <div className="invoices-text-discount-price">
              {Number(0).toFixed(2)}
            </div>
          </div>
          <div className="invoices-discount-other">
            <div className="invoices-text-discount-detail">
              ส่วนลดอื่นๆ (บาท)
            </div>
            <div className="invoices-text-discount-price">
              {getValueForm("discount_text")}
            </div>
          </div>
        </div>

        {/* รายการสินค้า */}
        <div className="pt-5">
          <Form form={form}>
            <Form.List name="list_service_product">
              {(fields, { add, remove }) => (
                <>
                  <div id="payment-docs-data-table">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>{GetIntlMessages(`ชื่อสินค้า`)}</th>
                            <th>{GetIntlMessages(`จำนวน`)}</th>
                            <th>{GetIntlMessages(`ราคา/หน่วย`)}</th>
                            <th>{GetIntlMessages(`ราคารวม`)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.length > 0 ? (
                            fields.map((field, index) => (
                              <tr key={`key-${index}`}>
                                <td>
                                  <Form.Item
                                    {...field}
                                    validateTrigger={["onChange", "onBlur"]}
                                    name={[field.name, "shop_stock_id"]}
                                    fieldKey={[field.fieldKey, "shop_stock_id"]}
                                  >
                                    <Select
                                      showSearch
                                      showArrow={false}
                                      onSearch={(value) =>
                                        handleSearchShopStock(value, index)
                                      }
                                      onChange={(value) =>
                                        selectProduct(value, index)
                                      }
                                      filterOption={false}
                                      notFoundContent={null}
                                      style={{ width: "100%" }}
                                      disabled={
                                        getValue(index, "id") || mode == "view"
                                      }
                                    >
                                      {getArrListValue(
                                        index,
                                        "list_shop_stock"
                                      ).map((e) => (
                                        <Select.Option
                                          value={e.id}
                                          key={`product-name-${e.id}`}
                                        >
                                          {get(
                                            e,
                                            `ShopProduct.Product.product_name.${[
                                              locale.locale,
                                            ]}`,
                                            "-"
                                          )}
                                        </Select.Option>
                                      ))}
                                    </Select>
                                  </Form.Item>
                                </td>

                                <td>
                                  {Number(
                                    getValue(index, "amount")
                                  ).toLocaleString()}
                                </td>

                                <td>
                                  {Number(
                                    getValue(index, "price")
                                  ).toLocaleString()}
                                </td>

                                <td>
                                  {Number(
                                    getValue(index, "price") *
                                    getValue(index, "amount")
                                  ).toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </Form.List>
          </Form>
        </div>

        {/* รายการส่วนลด */}
        <div className="pt-4">
          <Form form={form}>
            <Form.List name="list_service_product_discount">
              {(fields, { add, remove }) => (
                <>
                  <div id="discount-data-table">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>{GetIntlMessages(`รายการส่วนลด`)}</th>
                            <th>{GetIntlMessages(`จำนวน`)}</th>
                            <th>{GetIntlMessages(`ราคา`)}</th>
                            <th>{GetIntlMessages(`ลบ`)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.length > 0 ? (
                            fields.map((field, index) => (
                              <tr key={`key-${index}`}>
                                <td></td>

                                <td></td>

                                <td></td>

                                <td></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </Form.List>
          </Form>
        </div>

        {/* รายการมัดจำ */}
        <div className="pt-4">
          <Form form={form}>
            <Form.List name="list_service_product_deposit">
              {(fields, { add, remove }) => (
                <>
                  <div id="deposit-data-table">
                    <div className="table-responsive">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>{GetIntlMessages(`เลขที่มัดจำ`)}</th>
                            <th>{GetIntlMessages(`จำนวนเงิน`)}</th>
                            <th>{GetIntlMessages(`ลบ`)}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fields.length > 0 ? (
                            fields.map((field, index) => (
                              <tr key={`key-${index}`}>
                                <td></td>

                                <td></td>

                                <td></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="13">ไม่มีข้อมูล กดเพิ่มรายการ</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </Form.List>
          </Form>
        </div>
      </Col>

      <Col lg={12} md={24} sm={24} xs={24} style={{ paddingLeft: 20 }}>
        <div className="pt-3 pb-2">
          <div className="border-bottom pb-2">รูปแบบการชำระเงิน</div>
          <div className="p-3">
            <Row>
              <Col lg={6} md={12} sm={12} xs={12}>
                <div className="pr-5 pb-3">
                  <ComponentsPayWithCash
                    icon={"/assets/images/icon/cash.svg"}
                    textButton={"เงินสด"}
                    initForm={form}
                    total={getValueForm("net_total")}
                    callback={callbackPayment}
                    loading={loading}
                  />
                </div>
              </Col>
              <Col lg={6} md={12} sm={12} xs={12}>
                <div className="pr-5 pb-3">
                  <ComponentsPayWithCreditCard
                    icon={"/assets/images/icon/credit-card.svg"}
                    textButton={"เครดิต/เดบิต"}
                    initForm={form}
                    total={getValueForm("net_total")}
                    callback={callbackPayment}
                    loading={loading}
                  // disabled
                  />
                </div>
              </Col>
              <Col lg={6} md={12} sm={12} xs={12}>
                <div className="pr-5 pb-3">
                  <ComponentsPayWithCashTransfer
                    icon={"/assets/images/icon/money-transfer.svg"}
                    textButton={"โอนเงินสด"}
                    initForm={form}
                    total={getValueForm("net_total")}
                    callback={callbackPayment}
                    loading={loading}
                  // disabled
                  />
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <div className="pt-3 pb-2">
          <div className="border-bottom pb-2">จัดการเอกสาร/โปรโมชั่น</div>
          <div className="p-3 flex-container-herder">
            <div className="pr-5">
              <Promotions
                icon={"/assets/images/icon/promotion.svg"}
                textButton={"โปรโมชั่น"}
                disabled
              />
            </div>
            {/* <div className="pr-5">
                     <DepositReceipt textButton={"หักเงินมัดจำ"} disabled />
                  </div> */}
          </div>
        </div>

        <div className="pt-3 pb-2">
          <div className="border-bottom pb-2">รายการส่วนลด</div>
          <div className="p-3 flex-container-herder">
            <div className="pr-5">
              <ComponentsDiscount
                icon={"/assets/images/icon/discount.svg"}
                textButton={"ส่วนลด"}
                disabled
              />
            </div>
          </div>
        </div>


      </Col>
    </Row>
  );
};

export default PaymentDocs;
