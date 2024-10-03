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
      console.log("listData", listData)
      const shopWarehouseAllList = await getShopWarehousesAllList()

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
          {console.log("eee", e.shelf)}
          <Row key={i}>
            <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "center" }}>
              คลัง
            </Col>
            <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "center" }}>
              <b>{e?.ShopWarehouse?.name[locale.locale] ?? "-"}</b>
            </Col>
            <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "center" }}>
              จำนวนรวม
            </Col>
            <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "center" }}>
              <b>{e?.balance ?? "-"}</b>
            </Col>
          </Row>
          <Divider style={{ margin: "8px 0" }} />
          {e?.shelf?.filter(x => +x.balance !== 0).sort((a, b) => a.year - b.year).map((e2, i2) => (
            <Row key={i2}>
              <Col span={6} style={{ paddingTop: "8px" }}>
                DOT
              </Col>
              <Col span={6} style={{ paddingTop: "8px" }}>
                {e2?.dot_mfd ?? "-"}
              </Col>
              <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "center" }}>
                <b>{e2?.balance ?? "-"}</b>
              </Col>
              <Col span={6} style={{ paddingTop: "8px", display: "flex", placeContent: "end" }}>
                {e2?.PurchaseUnit?.type_name[locale.locale] ?? "-"}
              </Col>
            </Row>
          ))}
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
