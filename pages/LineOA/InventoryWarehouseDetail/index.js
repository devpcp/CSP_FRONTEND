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
import { isFunction } from "lodash";

const LineOAInventoryWarehouseDetail = ({ title = null, callBack, productWarehouseDetail }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { mainColor, locale } = useSelector(({ settings }) => settings);
  const [formSearch] = Form.useForm();
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [loading, setLoading] = useState(false);
  const { productPurchaseUnitTypes } = useSelector(({ master }) => master);
  const { authUser, imageProfile } = useSelector(({ auth }) => auth);
  useEffect(() => {
    // console.log("authUser", authUser)
    getMasterData(productWarehouseDetail.warehouse_detail)
  }, [productWarehouseDetail])

  const getMasterData = async (listData) => {
    try {
      const shopWarehouseAllList = await getShopWarehousesAllList()
      listData?.map((e) => {
        e.ShopWarehouse = shopWarehouseAllList?.find(x => x?.id === e?.warehouse)
        e.shelf.PurchaseUnit = productPurchaseUnitTypes?.find(x => x?.id === e?.shelf?.purchase_unit_id)
        e.shelf.Shelf = e?.ShopWarehouse?.shelf?.find(x => x?.code === e?.shelf?.item)
      })
      await setListSearchDataTable(listData)
      // console.log("productWarehouseDetail.warehouse_detail", listData)
    } catch (error) {
      console.log("getMasterData : ", error)
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

  return (
    <>
      <Head>
        <title>{"คลังสินค้า"}</title>
      </Head>



      <div style={{ display: "flex", justifyContent: "center" }}>
        <h3>คลังสินค้า</h3>
      </div>
      {listSearchDataTable?.map((e, i) => (
        <>
          <Row key={i}>
            {/* <Col span={20} style={{ fontSize: "18px" }}>
              <b>{e.ShopWarehouse.name[locale.locale]}</b>
            </Col> */}
            <Col span={20} style={{ paddingTop: "8px" }}>
              DOT <b>{e.shelf.dot_mfd ?? "-"}</b>
            </Col>
            <Col span={4}>
              <Button
                type='primary'
                size='small'
                style={{ border: 0 }}
                hidden={!isFunction(callBack)}
                onClick={() => callBack(e)}
              >
                เลือก
              </Button>
            </Col>
            {/* <Col span={12} style={{ paddingTop: "8px" }}>
              ชั้น <b>{e.shelf.Shelf.name[locale.locale] ?? "-"}</b>
            </Col> */}
            <Col span={12} style={{ paddingTop: "8px" }}>
              จำนวน <b>{e.shelf.balance ?? "-"}</b>
            </Col>

            <Col span={12} style={{ paddingTop: "8px" }}>
              หน่วย <b>{e.shelf.PurchaseUnit.type_name[locale.locale] ?? "-"}</b>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
        </>
      ))}
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

export default LineOAInventoryWarehouseDetail;
