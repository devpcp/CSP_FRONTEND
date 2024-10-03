import { createRef, useCallback, useEffect, useRef, useState } from "react";
import {
  message,
  Form,
  Tabs,
  Button,
} from "antd";
import API from "../../../util/Api";
import { useSelector } from "react-redux";
import SearchInput from "../../../components/shares/SearchInput";
import TableList from "../../../components/shares/TableList";
import GetIntlMessages from "../../../util/GetIntlMessages";

import FormServicePlans from "../../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.FormServicePlans";
import Tab1ServiceProduct from "../../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab1.ServiceProduct";
import Tab2Custome from "../../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab2.Custome";
import ModalFullScreen from "../../../components/shares/ModalFullScreen";
import moment from "moment";
import _, { get, isArray, isFunction, isPlainObject, isUndefined } from "lodash";
import PaymentDocs from "../../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.PaymentDocs";
import Tab4Vehicle from "../../../components/Routes/Sales/ServicePlans/Components.Routes.Modal.Tab4.Vehicle";

import { useReactToPrint } from "react-to-print";
import PrintOut from "../../../components/shares/PrintOut";

const { TabPane } = Tabs;
const ReportSalesOut = ({ title = null, parent_search_id, parent_page }) => {
  const [loading, setLoading] = useState(false);

  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { locale, mainColor, subColor } = useSelector(
    ({ settings }) => settings
  );
  const { authUser } = useSelector(({ auth }) => auth);
  const { documentTypes, paymentStatus, shopInCorporate } = useSelector(({ master }) => master);
  const [lengthShelfData, setLengthShelfData] = useState(0);
  const [taxTypesList, setTaxTypesList] = useState([]); //ประเภทภาษี

  const [dataSendToComponeteToPrint, setDataSendToComponeteToPrint] = useState(
    []
  );

  useEffect(() => {
    setModelSearch({
      per_customer_id: parent_page === "person_customer" ? parent_search_id : "",
      bus_customer_id: parent_page === "business_customer" ? parent_search_id : "",
      vehicle_customer_id: parent_page === "vehicle_customer" ? parent_search_id : "",
      shop_product_id: parent_page === "shop_product" ? parent_search_id : "",
    })
    getDataSearch({
      per_customer_id: parent_page === "person_customer" ? parent_search_id : "",
      bus_customer_id: parent_page === "business_customer" ? parent_search_id : "",
      vehicle_customer_id: parent_page === "vehicle_customer" ? parent_search_id : "",
      shop_product_id: parent_page === "shop_product" ? parent_search_id : "",
    });
  }, [parent_search_id, parent_page])

  // useEffect(() => {
  //   // console.log("documentTypes", documentTypes)
  //   getDataSearch({
  //     page: configTable.page,
  //     search: modelSearch.search,
  //     _status: modelSearch.status,
  //     select_shop_ids: modelSearch.select_shop_ids,
  //   });

  //   getMasterData();
  // }, [parentSearch]);

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
      order: "descend",
      hide_manage: true,
      column: {
        created_by: false,
        created_date: false,
        updated_by: false,
        updated_date: false,
        status: false,
      },
    },
    configSort: {
      sort: `created_date`,
      order: "descend",
    },
    modelSearch: {
      search: "",
      status: "",
      documentdate: [],
      document_type_id: "default",
      payment_paid_status: ["1", "2", "3", "4", "5"],
      select_shop_ids: authUser.UsersProfile.ShopsProfile.id,
      is_member: false,
      per_customer_id: parent_page === "person_customer" ? parent_search_id : "",
      bus_customer_id: parent_page === "business_customer" ? parent_search_id : "",
      vehicle_customer_id: parent_page === "vehicle_customer" ? parent_search_id : "",
      shop_product_id: parent_page === "shop_product" ? parent_search_id : "",
      report_sales_out_type: "list"
    },
  };

  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable);

  /** Config เรียงลำดับ ของ ตาราง */
  const [configSort, setConfigSort] = useState(init.configSort);

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch);

  const getCustomerDataTable = (record, type) => {
    // ShopPersonalCustomers ลูกค้าบุคคลธรรมดา
    // ShopBusinessCustomers ลูกค้าธุรกิจ
    const { ShopPersonalCustomers, ShopBusinessCustomers } = record;
    const model = {
      code: null,
      type: null,
      name: null,
    };
    if (isPlainObject(ShopPersonalCustomers)) {
      //ลูกค้าบุคคลธรรมดา
      const { first_name, last_name } = ShopPersonalCustomers.customer_name;
      model.code = ShopPersonalCustomers.master_customer_code_id;
      model.name = first_name[locale.locale] + " " + last_name[locale.locale];
      model.type = "ลูกค้าบุคคลธรรมดา";
    } else if (isPlainObject(ShopBusinessCustomers)) {
      // ลูกค้าธุรกิจ
      model.code = ShopBusinessCustomers.master_customer_code_id;
      model.name = ShopBusinessCustomers.customer_name[locale.locale];
      model.type = "ลูกค้าธุรกิจ";
    } else {
      return "-";
    }

    return model[type] ?? "-";
  };

  const setColumnsTable = (data) => {
    console.log("modelsearch", modelSearch)
    const _column = []
    const _columnDoc = [
      {
        title: () => GetIntlMessages("ลำดับ"),
        dataIndex: "num",
        key: "num",
        align: "center",
        width: 100,
        render: (text, record, index) => {
          index += (configTable.page - 1) * configTable.limit;
          return index + 1;
        },
      },
      {
        title: 'สาขา',
        dataIndex: 'shop_id',
        key: 'shop_id',
        width: 150,
        align: "center",
        use: shopInCorporate.length > 1,
        render: (text, render) => {
          return shopInCorporate.length > 0 ?
            shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === undefined ||
              shopInCorporate.find(x => x.id === text).shop_name?.hop_local_name === null ||
              shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === "" ? shopInCorporate.find(x => x.id === text).shop_name[locale.locale] : shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name : ""
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร"),
        dataIndex: "code_id",
        key: "code_id",
        width: 150,
        align: "center",
      },
      {
        title: () => GetIntlMessages("วันที่เอกสาร"),
        dataIndex: "doc_date",
        key: "doc_date",
        width: 200,
        align: "center",
        render: (text, record) =>
          text ? moment(text).format("DD/MM/YYYY") : "-",
      },
      {
        title: () => GetIntlMessages("ชื่อลูกค้า"),
        dataIndex: "customer_name",
        key: "customer_name",
        width: 250,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "start" }}>
            {get(
              record.ShopServiceOrderDoc,
              `customer_name`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("เลขทะเบียน"),
        dataIndex: "vehicle_registration",
        key: "vehicle_registration",
        width: 250,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "start" }}>
            {get(
              text,
              ``,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลดบาท"),
        dataIndex: "price_discount",
        key: "price_discount",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_discount`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลด %"),
        dataIndex: "price_discount_percent",
        key: "price_discount_percent",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_discount_percent`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("รวมเงิน"),
        dataIndex: "price_grand_total",
        key: "price_grand_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_grand_total`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("สถานะการชำระเงิน"),
        dataIndex: "payment_paid_status",
        key: "payment_paid_status",
        width: 150,
        align: "center",
        render: (text, record) => {
          switch (get(
            record.ShopServiceOrderDoc,
            `payment_paid_status`,
            <div style={{ textAlign: "center" }}>{"-"}</div>
          )) {
            case 1:
              return (
                <span className='color-red font-16'>ยังไม่ชำระ</span>
              )
            case 2:
              return (
                <span style={{ color: "orange", fontSize: 16 }}>ค้างชำระ</span>
              )
            case 3:
              return (
                <span className='color-green font-16'>ชำระเงินแล้ว</span>
              )
            case 4:
              return (
                <span style={{ color: "#DFFF00", fontSize: 16 }}>ชําระเกิน</span>
              )
            case 5:
              return (
                <span style={{ color: "#993333	", fontSize: 16 }}>ลูกหนี้การค้า</span>
              )

            default:
              return (
                <span> - </span>
              )
          }
        },
      },
      {
        title: () => GetIntlMessages("ประเภทการชำระ"),
        dataIndex: "payment_type",
        key: "payment_type",
        width: 150,
        align: "center",
        render: (text, record) => {
          switch (get(
            record.ShopServiceOrderDoc,
            `payment_type`,
            <div style={{ textAlign: "center" }}>{"-"}</div>
          )) {
            case 1:
              return (
                <span>เงินสด</span>
              )
            case 2:
              return (
                <span>บัตรเครดิต</span>
              )
            case 3:
              return (
                <span>เงินโอน</span>
              )
            case 4:
              return (
                <span>เช็ค</span>
              )
            case 5:
              return (
                <span>ลูกหนี้การค้า</span>
              )

            default:
              return (
                <span> - </span>
              )
          }
        },
      },
      {
        title: () => GetIntlMessages("เลขที่บัญชี"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `BankAccount.account_no`, "-")}
          </>
        ),
      },
      {
        title: () => GetIntlMessages("ชื่อบัญชี"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `BankAccount.account_name.${locale.locale}`, "-")}
          </>
        ),
      },
      {
        title: () => GetIntlMessages("วันที่รับชำระ"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `payment_paid_date`, "-") ? moment(get(text, `payment_paid_date`, "-")).format("DD/MM/YYYY") : "-"}
          </>
        ),
        // render: (text, record) => getCustomerDataTable(record, "type"),
      },
      {
        title: () => GetIntlMessages("รวมเป็นเงิน"),
        dataIndex: "price_sub_total",
        key: "price_sub_total",
        width: 150,
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_sub_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลดรวม"),
        dataIndex: "price_discount_total",
        key: "price_discount_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_discount_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ภาษีมูลค่าเพิ่ม 7 %"),
        dataIndex: "price_vat",
        key: "price_vat",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_vat`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
        dataIndex: "price_grand_total",
        key: "price_grand_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_grand_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบส่งสินค้าชั่วคราว"),
        dataIndex: "trn_code_id",
        key: "trn_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.trn_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `trn_code_id`,

                )}
              </div>
            )
          }
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ"),
        dataIndex: "abb_code_id",
        key: "abb_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.abb_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `abb_code_id`,

                )}
              </div>
            )
          }
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบกำกับภาษีเต็มรูป"),
        dataIndex: "inv_code_id",
        key: "inv_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.inv_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `inv_code_id`,

                )}
              </div>
            )
          }
        }
      },
    ];
    const _columnList = [
      {
        title: () => GetIntlMessages("ลำดับ"),
        dataIndex: "num",
        key: "num",
        align: "center",
        width: 100,
        render: (text, record, index) => {
          index += (configTable.page - 1) * configTable.limit;
          return index + 1;
        },
      },
      {
        title: 'สาขา',
        dataIndex: 'shop_id',
        key: 'shop_id',
        width: 150,
        align: "center",
        use: shopInCorporate.length > 1,
        render: (text, render) => {
          return shopInCorporate.length > 0 ?
            shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === undefined ||
              shopInCorporate.find(x => x.id === text).shop_name?.hop_local_name === null ||
              shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name === "" ? shopInCorporate.find(x => x.id === text).shop_name[locale.locale] : shopInCorporate.find(x => x.id === text).shop_name?.shop_local_name : ""
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร"),
        dataIndex: "code_id",
        key: "code_id",
        width: 150,
        align: "center",
      },
      {
        title: () => GetIntlMessages("วันที่เอกสาร"),
        dataIndex: "doc_date",
        key: "doc_date",
        width: 200,
        align: "center",
        render: (text, record) =>
          text ? moment(text).format("DD/MM/YYYY") : "-",
      },
      {
        title: () => GetIntlMessages("ชื่อลูกค้า"),
        dataIndex: "customer_name",
        key: "customer_name",
        width: 250,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "start" }}>
            {get(
              record.ShopServiceOrderDoc,
              `customer_name`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("เลขทะเบียน"),
        dataIndex: "vehicle_registration",
        key: "vehicle_registration",
        width: 250,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "start" }}>
            {get(
              record.ShopServiceOrderDoc,
              `vehicle_registration`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ชื่อสินค้า"),
        dataIndex: "product_name",
        key: "product_name",
        width: 250,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "start" }}>
            {get(
              record.ShopProduct,
              `Product.product_name`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ราคาต่อหน่วย"),
        dataIndex: "price_unit",
        key: "price_unit",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_unit`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("จำนวน"),
        dataIndex: "amount",
        key: "amount",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `amount`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("DOT"),
        dataIndex: "dot_mfd",
        key: "dot_mfd",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "center" }}>
            {get(
              record,
              `dot_mfd`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลดบาท"),
        dataIndex: "price_discount",
        key: "price_discount",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_discount`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลด %"),
        dataIndex: "price_discount_percent",
        key: "price_discount_percent",
        width: 100,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_discount_percent`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("รวมเงิน"),
        dataIndex: "price_grand_total",
        key: "price_grand_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {(+get(
              record,
              `price_grand_total`,
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )).toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("สถานะการชำระเงิน"),
        dataIndex: "payment_paid_status",
        key: "payment_paid_status",
        width: 150,
        align: "center",
        render: (text, record) => {
          switch (get(
            record.ShopServiceOrderDoc,
            `payment_paid_status`,
            <div style={{ textAlign: "center" }}>{"-"}</div>
          )) {
            case 1:
              return (
                <span className='color-red font-16'>ยังไม่ชำระ</span>
              )
            case 2:
              return (
                <span style={{ color: "orange", fontSize: 16 }}>ค้างชำระ</span>
              )
            case 3:
              return (
                <span className='color-green font-16'>ชำระเงินแล้ว</span>
              )
            case 4:
              return (
                <span style={{ color: "#DFFF00", fontSize: 16 }}>ชําระเกิน</span>
              )
            case 5:
              return (
                <span style={{ color: "#993333	", fontSize: 16 }}>ลูกหนี้การค้า</span>
              )

            default:
              return (
                <span> - </span>
              )
          }
        },
      },
      {
        title: () => GetIntlMessages("ประเภทการชำระ"),
        dataIndex: "payment_type",
        key: "payment_type",
        width: 150,
        align: "center",
        render: (text, record) => {
          switch (get(
            record.ShopServiceOrderDoc,
            `payment_type`,
            <div style={{ textAlign: "center" }}>{"-"}</div>
          )) {
            case 1:
              return (
                <span>เงินสด</span>
              )
            case 2:
              return (
                <span>บัตรเครดิต</span>
              )
            case 3:
              return (
                <span>เงินโอน</span>
              )
            case 4:
              return (
                <span>เช็ค</span>
              )
            case 5:
              return (
                <span>ลูกหนี้การค้า</span>
              )

            default:
              return (
                <span> - </span>
              )
          }
        },
      },
      {
        title: () => GetIntlMessages("เลขที่บัญชี"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `BankAccount.account_no`, "-")}
          </>
        ),
      },
      {
        title: () => GetIntlMessages("ชื่อบัญชี"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `BankAccount.account_name.${locale.locale}`, "-")}
          </>
        ),
      },
      {
        title: () => GetIntlMessages("วันที่รับชำระ"),
        dataIndex: "ShopServiceOrderDoc",
        key: "ShopServiceOrderDoc",
        width: 150,
        align: "center",
        render: (text, record) => (
          <>
            {get(text, `payment_paid_date`, "-") ? moment(get(text, `payment_paid_date`, "-")).format("DD/MM/YYYY") : "-"}
          </>
        ),
        // render: (text, record) => getCustomerDataTable(record, "type"),
      },
      {
        title: () => GetIntlMessages("รวมเป็นเงิน"),
        dataIndex: "price_sub_total",
        key: "price_sub_total",
        width: 150,
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_sub_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ส่วนลดรวม"),
        dataIndex: "price_discount_total",
        key: "price_discount_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_discount_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("ภาษีมูลค่าเพิ่ม 7 %"),
        dataIndex: "price_vat",
        key: "price_vat",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_vat`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("จำนวนเงินรวมทั้งสิ้น"),
        dataIndex: "price_grand_total",
        key: "price_grand_total",
        width: 150,
        align: "center",
        render: (text, record) => (
          <div style={{ textAlign: "end" }}>
            {get(record.ShopServiceOrderDoc, `price_grand_total`, "-").toLocaleString()}
          </div>
        ),
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบส่งสินค้าชั่วคราว"),
        dataIndex: "trn_code_id",
        key: "trn_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.trn_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `trn_code_id`,
                )}
              </div>
            )
          }
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบกำกับภาษีอย่างย่อ"),
        dataIndex: "abb_code_id",
        key: "abb_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.abb_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `abb_code_id`,
                )}
              </div>
            )
          }
        }
      },
      {
        title: () => GetIntlMessages("เลขที่เอกสาร ใบกำกับภาษีเต็มรูป"),
        dataIndex: "inv_code_id",
        key: "inv_code_id",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (record?.ShopServiceOrderDoc?.inv_code_id === "") {
            return (
              <div style={{ textAlign: "center" }}>{"-"}</div>
            )
          } else {
            return (
              <div style={{ textAlign: "center" }}>
                {get(
                  record.ShopServiceOrderDoc,
                  `inv_code_id`,
                )}
              </div>
            )
          }
        }
      },
    ];
    switch (modelSearch.report_sales_out_type) {
      case "doc":
        _column = _columnDoc
        break;
      default:
        _column = _columnList
        break;
    }

    _column.map((x) => { x.use === undefined ? x.use = true : null })
    setColumns(_column.filter(x => x.use === true));
  };

  const onClickPayment = (item) => {
    if (isPlainObject(item)) {
      addEditViewModal("view", item.id, true);
    }
  };
  const onClickAddFullInvoices = (item) => {
    if (isPlainObject(item)) {
      addEditViewModal("view", item.id, null, true);
    }
  };

  useEffect(() => {
    // console.log("documentTypes", documentTypes)
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
      select_shop_ids: modelSearch.select_shop_ids,
    });

    getMasterData();
  }, []);

  useEffect(() => {
    if (permission_obj) setColumnsTable();
  }, [
    configTable.page,
    configSort.order,
    configSort.sort,
    permission_obj,
    locale,
  ]);

  /* ค้นหา */
  const getDataSearch = async ({
    search = modelSearch.search ?? "",
    limit = configTable.limit,
    page = configTable.page,
    sort = configSort.sort,
    order = configSort.order === "descend" ? "desc" : "asc",
    _status = modelSearch.status,
    documentdate = modelSearch.documentdate,
    document_type_id = modelSearch.document_type_id ?? "67c45df3-4f84-45a8-8efc-de22fef31978,7ef3840f-3d7f-43de-89ea-dce215703c16",
    payment_paid_status = modelSearch.payment_paid_status ?? "1,2,3,4,5",
    select_shop_ids = modelSearch.select_shop_ids ?? [authUser.UsersProfile.ShopsProfile.id],
    payment_paid_date = modelSearch.payment_paid_date,
    is_member = modelSearch.is_member ?? false,
    per_customer_id = parent_page === "person_customer" ? parent_search_id : "",
    bus_customer_id = parent_page === "business_customer" ? parent_search_id : "",
    vehicle_customer_id = parent_page === "vehicle_customer" ? parent_search_id : "",
    shop_product_id = parent_page === "shop_product" ? parent_search_id : "",
    report_sales_out_type = modelSearch.report_sales_out_type ?? "list"

  }) => {
    try {
      console.log(modelSearch)
      if (page === 1) setLoading(true);

      const dateFomat = "YYYY-MM-DD";
      let start_date = "";
      let end_date = "";

      if (isArray(documentdate) && documentdate.length > 0) {
        start_date = moment(documentdate[0]?._d).format(dateFomat);
        end_date = moment(documentdate[1]?._d).format(dateFomat);
      } else {
        start_date = "";
        end_date = "";
      }

      let payment_paid_date_startDate = "";
      let payment_paid_date_endDate = "";
      if (isArray(payment_paid_date) && payment_paid_date.length > 0) {
        payment_paid_date_startDate = moment(payment_paid_date[0]?._d).format(dateFomat);
        payment_paid_date_endDate = moment(payment_paid_date[1]?._d).format(dateFomat);
      } else {
        payment_paid_date_startDate = "";
        payment_paid_date_endDate = "";
      }

      setStartDate(start_date);
      setEndDate(end_date);

      setStartPaymentPaidDate(payment_paid_date_startDate);
      setEndPaymentPaidDate(payment_paid_date_endDate);

      let url = `/shopReports/salesOut?limit=${limit}&report_sales_out_type=${report_sales_out_type}&page=${page}&sort=${sort}&order=${order}${_status ? `&status=${_status}` : ""}${search ? `&search=${search}` : ""}${start_date ? `&start_date=${start_date}` : ""}${end_date ? `&end_date=${end_date}` : ""}${payment_paid_status ? `&payment_paid_status=${payment_paid_status}` : "&payment_paid_status="}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${payment_paid_date_startDate !== "" ? `&payment_paid_date__startDate=${payment_paid_date_startDate}` : ""}${payment_paid_date_endDate !== "" ? `&payment_paid_date__endDate=${payment_paid_date_endDate}` : ""}${is_member !== "" ? `&is_member=${is_member}` : ""}`;
      url += `${per_customer_id !== "" ? `&per_customer_id=${per_customer_id}` : ""}${bus_customer_id !== "" ? `&bus_customer_id=${bus_customer_id}` : ""}${vehicle_customer_id !== "" ? `&vehicle_customer_id=${vehicle_customer_id}` : ""}${shop_product_id !== "" ? `&shop_product_id=${shop_product_id}` : ""}`
      if (select_shop_ids.length === 0) {
        setModelSearch({ select_shop_ids: authUser.UsersProfile.ShopsProfile.id, })
        select_shop_ids = authUser.UsersProfile.ShopsProfile.id
      }

      if (select_shop_ids.toString().includes("all")) {
        select_shop_ids = "all"
      }
      if (shopInCorporate.length === 1) {
        select_shop_ids = ""
      }

      console.log("document_type_id", document_type_id)
      if (document_type_id !== "default") {
        url += `&doc_type_id=${document_type_id}`;
      } else {
        url += `&doc_type_id=67c45df3-4f84-45a8-8efc-de22fef31978,7ef3840f-3d7f-43de-89ea-dce215703c16`;
      }

      const res = await API.get(url);
      // const res = await API.get(`/shopReports/salesOut?export_format=json&limit=${limit}&page=${page}&sort=${sort}&order=${order}&filter_purchase_status=${_status}&search=${search}&start_date=${start_date}&end_date=${end_date}&doc_type_id=b39bcb5d-6c72-4979-8725-c384c80a66c3`)
      if (res.data.status === "success") {
        const { currentCount, currentPage, pages, totalCount, data } =
          res.data.data;
        data.forEach((e) => {
          e.___update = false;
          if (e.purchase_status == true) {
            e.___delete = false;
          }
        });

        await setColumnsTable(data);
        setListSearchDataTable(data);
        // setTotal(totalCount);
        setConfigTable({
          ...configTable,
          page: page,
          total: totalCount,
          limit: limit,
        });
        if (page === 1) setLoading(false);
      } else {
        message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่!!!");
        if (page === 1) setLoading(false);
      }
    } catch (error) {
      console.log("error :>> ", error);
      message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!");
      if (page === 1) setLoading(false);
    }
  };

  /* เปลี่ยนสถานะ */
  const changeStatus = async (isuse, id) => {
    try {
      const { data } = await API.put(`/shopSalesTransactionDoc/put/${id}`, {
        status: isuse == 2 ? 0 : isuse,
      });
      if (data.status != "success") {
        message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
      } else {
        message.success("บันทึกข้อมูลสำเร็จ");
        getDataSearch({
          page: configTable.page,
          search: modelSearch.search,
        });
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!");
    }
  };

  /* addEditView */

  const addEditViewModal = async (mode, id, isPayment, isFullInvoices) => {
    try {
      setConfigModal({ ...configModal, mode });
      if (id) {
        const { data } = await API.get(`/shopSalesTransactionDoc/byid/${id}`);
        if (data.status == "success") {
          data.data.doc_type_id = "b39bcb5d-6c72-4979-8725-c384c80a66c3";
          setDataSendToComponeteToPrint(data.data);
          setFormValueData(data.data);
        }
      } else {
        /* init data list service product */
        const list_service_product = [];

        form.setFieldsValue({
          doc_type_id: "b39bcb5d-6c72-4979-8725-c384c80a66c3",
          status: "1",
          list_service_product,
          user_id: authUser.id,
          create: {
            customer_type: "person",
          },
        });
      }
      setActiveKeyTab("1");
      setIsModalVisible(true);
      if (isPayment) setIsModePayment(true);
      if (isFullInvoices) setIsModeFullInvoices(true);
    } catch (error) {
      console.log(`error`, error);
    }
  };

  /* Modal */
  const [configModal, setConfigModal] = useState({
    mode: "add",
    modeKey: null,
    maxHeight: 600,
    overflowX: "auto",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [checkedIsuse, setCheckedIsuse] = useState(false);
  const [form] = Form.useForm();

  const handleOk = (modeKey) => {
    setConfigModal({ ...configModal, modeKey });
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    setConfigModal({ ...configModal, mode: "add", modeKey: null });
    setIsModalVisible(false);
    setIsModeFullInvoices(false);
    setActiveKeyTab("1");
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
      select_shop_ids: value.select_shop_ids,
    });
  };

  const onFinish = async (value) => {
    try {
      const valueForm = form.getFieldValue(),
        per_customer_id =
          value.customer_type === "person" ? value.customer_id : null,
        bus_customer_id =
          value.customer_type === "business" ? value.customer_id : null;
      const { shop_id } = authUser.UsersProfile;

      const getByid = await API.get(
        `/shopSalesTransactionDoc/byid/${valueForm.id}`
      );

      const model = {
        bus_customer_id, //ลูกค้า
        per_customer_id, //ลูกค้า
        details: {
          ref_doc_sale_id: valueForm.id, //รหัสตารางข้อมูลเอกสารกำกับการขาย เป็นข้อมูลเอกสารอ้างอิงที่ใช้ออกบิล ชนิดเอกสารใบสั่งซ่อม
          customer_phone: value.customer_phone, //หมายเลขโทรศัพท์
          user_id: value.user_id, //ผู้ทำเอกสาร
          mileage: value.mileage, //เลขไมค์
          mileage_old: value.mileage_old, //เลขไมค์ครั้งก่อน
          tax_id: value.tax_id, //ประเภทภาษี
          remark: value.remark, //หมายเหตุ
          remark_inside: value.remark_inside, //หมายเหตุ (ภายใน)
          tailgate_discount: value.tailgate_discount, //ส่วนลดท้ายบิล
          list_service_product: value.list_service_product,
          avg_registration_day: value.avg_registration_day,
          calculate_result: {
            total: valueForm.total ?? 0,
            total_text: valueForm.total_text ?? 0,

            discount: valueForm.discount ?? 0,
            discount_text: valueForm.discount_text ?? 0,

            net_total: valueForm.net_total ?? 0,
            net_total_text: valueForm.net_total_text ?? 0,

            vat: valueForm.vat ?? 0,

            total_amount: valueForm.total_amount ?? 0,
          },
          remark_payment: value.remark_payment,
        },
        vehicles_customers_id: value.vehicles_customers_id, //รถ
        doc_type_id: value.doc_type_id, //ประเภทเอกสาร
        sale_type: false,
        status: 3,
        shop_id,
      };

      if (configModal.mode === "add") {
        model.doc_date = moment(new Date()).format("YYYY-MM-DD");

        /* ------------------------ add shopSalesTransactionDoc ------------------------ */
        const callback = await API.post(`/shopSalesTransactionDoc/add`, model);
        if (callback.data.status == "success") {
          const data_transaction_out = {
            doc_sale_id: callback.data.data.id,
            ref_doc_sale_id: valueForm.id,
            status: 1,
          };
          const { data } = await API.post(
            `/shopSalesTransactionOut/add`,
            data_transaction_out
          );
          if (data.status == "success") {
            setConfigModal({ ...configModal, mode: "edit" });
            form.setFieldsValue({
              id: callback.data.data.id,
              shop_id,
              list_service_product: valueForm.list_service_product,
              status: 3,
            });
            message.success("บันทึกสำเร็จ");
          } else {
            message.warning(data.data);
          }
        } else {
          message.warning("มีบางอย่างผิดพลาด !!");
        }
      } else if (configModal.mode === "view" && isModeFullInvoices == true) {
        model.doc_date = moment(new Date()).format("YYYY-MM-DD");
        model.doc_type_id = "e67f4a64-52dd-4008-9ef0-0121e7a65d48";
        model.status = 4;
        const callback = await API.post(`/shopSalesTransactionDoc/add`, model);
        if (callback.data.status == "success") {
          const data_transaction_out = {
            doc_sale_id: callback.data.data.id,
            full_invoice_doc_sale_id: valueForm.id,
            status: 2,
          };
          const { data } = await API.post(
            `/shopSalesTransactionOut/add`,
            data_transaction_out
          );
          if (data.status == "success") {
            const __model = {
              details: {
                ...getByid.data.data.details,
                full_invoice: true,
              },
            };
            await API.put(
              `/shopSalesTransactionDoc/put/${valueForm.id}`,
              __model
            );
            setConfigModal({ ...configModal, mode: "edit" });
            form.setFieldsValue({
              id: callback.data.data.id,
              shop_id,
              list_service_product: valueForm.list_service_product,
              status: "3",
            });
            message.success("บันทึกสำเร็จ");
            handleCancel();
          } else {
            message.warning(data.data);
          }
        } else {
          message.warning("มีบางอย่างผิดพลาด !!");
        }
      } else {
        model.details.payment = valueForm.payment;
        model.purchase_status = true;
        const callback = await API.put(
          `/shopSalesTransactionDoc/put/${valueForm.id}`,
          model
        );
        if (callback.data.status == "success") {
          message.success("บันทึกสำเร็จ");
          handleCancel();
          handleCancelPayment();
        } else {
          message.warning(data.data);
        }
      }
    } catch (error) {
      setLoading(false);
      message.error("มีบางอย่างผิดพลาด !!");
      console.log("error :>> ", error);
    }
  };

  const onFinishFailed = (error) => {
    message.warn("กรอกข้อมูลให้ครบถ้วน !!");
  };

  const setFormValueData = (value) => {
    const list_service_product = [];
    get(value, `details.list_service_product`, []).forEach((e) => {
      // ShopSalesTransactionOuts
      const find = get(value, `details.list_service_product`, []).find(
        (where) => where.id == e.id && where.amount == e.amount
      );
      if (isPlainObject(find)) list_service_product.push(e);
    });

    const model = {
      id: value.id,
      code_id: value.code_id,
      search_status_2: value.code_id,
      purchase_status: value.purchase_status,
      customer_type: null, //ประเภทลูกค้า
      customer_id: null, //ชื่อลูกค้า
      customer_phone: get(value, `details.customer_phone`, null), //หมายเลขโทรศัพท์
      vehicles_customers_id: value.vehicles_customers_id, //หมายเลขโทรศัพท์
      mileage: get(value, `details.mileage`, null),
      mileage_old: get(value, `details.mileage_old`, null),
      tax_id: get(value, `details.tax_id`, null), //ประเภทภาษี
      doc_type_id: value.doc_type_id,
      status: value.status.toString(),
      user_id: authUser.id,
      shop_id: value.shop_id,
      list_service_product,
      avg_registration_day: get(value, `details.avg_registration_day`, 0),
      avg_registration_month:
        get(value, `details.avg_registration_day`, 0) * 30,
      remark: get(value, `details.remark`, null), //หมายเหตุ
      remark_inside: get(value, `details.remark_inside`, null), //หมายเหตุ (ภายใน)
      tailgate_discount: get(value, `details.tailgate_discount`, 0), //ส่วนลดท้ายบิล
      payment: get(value, `details.payment`, ""),
    };
    if (value.bus_customer_id) {
      model.customer_type = "business";
      model.customer_id = value.bus_customer_id;
    } else if (value.per_customer_id) {
      model.customer_type = "person";
      model.customer_id = value.per_customer_id;
    }
    form.setFieldsValue(model);
    calculateResult();
  };

  /* master */
  const getMasterData = async () => {
    try {
      const [value1, value2] = await Promise.all([
        getShelfData(),
        getTaxTypes(),
      ]);
      setLengthShelfData(value1.length);
      if (isArray(value2)) setTaxTypesList(value2);
    } catch (error) { }
  };

  /* เรียกข้อมูล คลังสินค้า ทั้งหมด */
  const getShelfData = async () => {
    const { data } = await API.get(
      `shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc`
    );
    return data.data.data;
  };

  const onFinishError = (error) => {
    console.log(`error`, error);
  };

  /** กดปุ่มค้นหา */
  const onFinishSearch = async (value) => {
    value.select_shop_ids = isUndefined(value.select_shop_ids) ? modelSearch.select_shop_ids : value.select_shop_ids
    await setModelSearch(() => value);
    console.log("modd", modelSearch)
    getDataSearch({
      search: value.search,
      _status: value.status,
      page: init.configTable.page,
      documentdate: value.documentdate,
      document_type_id: value.document_type_id,
      payment_paid_status: value.payment_paid_status,
      select_shop_ids: value.select_shop_ids,
      payment_paid_date: value.payment_paid_date,
      is_member: value.is_member,
      report_sales_out_type: value.report_sales_out_type,
    });
  };

  /** กดปุ่มค่าเริ่มต้น */
  const onReset = () => {
    setConfigTable(init.configTable);
    setConfigSort(init.configSort);
    setModelSearch(init.modelSearch);
    console.log(init.modelSearch)
    getDataSearch({
      search: init.modelSearch.search ?? "",
      _status: init.modelSearch.status,
      documentdate: init.modelSearch.documentdate,
      document_type_id: init.modelSearch.document_type_id,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: init.configSort.order === "descend" ? "desc" : "asc",
      payment_paid_status: init.modelSearch.payment_paid_status ?? "",
      select_shop_ids: init.modelSearch.select_shop_ids,
      payment_paid_date: init.modelSearch.payment_paid_date,
      is_member: init.modelSearch.is_member
    });
  };

  /* export excel */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [startPaymentPaidDate, setStartPaymentPaidDate] = useState("");
  const [endPaymentPaidDate, setEndPaymentPaidDate] = useState("");

  const exportExcel = async () => {
    setLoading(true);

    let search = modelSearch.search ?? ""
    let _status = modelSearch.status
    let documentdate = modelSearch.documentdate
    let document_type_id = modelSearch.document_type_id ?? ["67c45df3-4f84-45a8-8efc-de22fef31978", "7ef3840f-3d7f-43de-89ea-dce215703c16"]
    let payment_paid_status = modelSearch.payment_paid_status ?? "1,2,3,4,5"
    let select_shop_ids = modelSearch.select_shop_ids ?? authUser.UsersProfile.ShopsProfile.id
    let payment_paid_date = modelSearch.payment_paid_date
    let is_member = modelSearch.is_member ?? false
    let report_sales_out_type = modelSearch.report_sales_out_type ?? "list"

    const dateFomat = "YYYY-MM-DD";
    let start_date = "";
    let end_date = "";

    if (isArray(documentdate) && documentdate.length > 0) {
      start_date = moment(documentdate[0]?._d).format(dateFomat);
      end_date = moment(documentdate[1]?._d).format(dateFomat);
    } else {
      start_date = "";
      end_date = "";
    }

    let payment_paid_date_startDate = "";
    let payment_paid_date_endDate = "";
    if (isArray(payment_paid_date) && payment_paid_date.length > 0) {
      payment_paid_date_startDate = moment(payment_paid_date[0]?._d).format(dateFomat);
      payment_paid_date_endDate = moment(payment_paid_date[1]?._d).format(dateFomat);
      payment_paid_date_startDate = "";
      payment_paid_date_endDate = "";
    }

    let url = `/shopReports/salesOut?export_format=xlsx&report_sales_out_type=${report_sales_out_type}${_status ? `&status=${_status}` : ""}${search ? `&search=${search}` : ""}${start_date ? `&start_date=${start_date}` : ""}${end_date ? `&end_date=${end_date}` : ""}${payment_paid_status ? `&payment_paid_status=${payment_paid_status}` : ""}${payment_paid_date_startDate !== "" ? `&payment_paid_date__startDate=${payment_paid_date_startDate}` : ""}${payment_paid_date_endDate !== "" ? `&payment_paid_date__endDate=${payment_paid_date_endDate}` : ""}${is_member !== "" ? `&is_member=${is_member}` : ""}${select_shop_ids !== "" ? `&select_shop_ids=${select_shop_ids}` : ""}${document_type_id !== "" ? `&doc_type_id=${document_type_id}` : ""}`;
    // console.log("document_type_id",document_type_id)
    // if (
    //   isArray(document_type_id) &&
    //   document_type_id.length > 0
    // ) {
    //   if (document_type_id.length === 1) {
    //     document_type_id.map((e) => {
    //       if (e !== "default") {
    //         url += `&doc_type_id=${e}`;
    //       }
    //     });
    //   } else {
    //     document_type_id.map((e) => {
    //       if (e !== "default") url += `&doc_type_id=${e}`;
    //     });
    //   }
    // } else {
    //   if (document_type_id !== "default")
    //     url += `&doc_type_id=${document_type_id}`;
    // }

    const res = await API.get(url);
    // const res = await API.get(`/shopReports/salesOut?export_format=xlsx&start_date=${startDate}&end_date=${endDate}`)
    if (res.data.status === "success")
      window.open(
        `${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`
      );
    else message.warn("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!");
    setLoading(false);
  };

  const customData = () => {
    if (isArray(documentTypes) && documentTypes.length > 0) {
      const newData = documentTypes
        .map((e) => {
          const model = {
            key: e.type_name[`${locale.locale}`],
            value: e.id,
          };

          return model ?? {};
        })
        .filter(
          (where) =>
            where?.value == "67c45df3-4f84-45a8-8efc-de22fef31978" ||
            where?.value == "7ef3840f-3d7f-43de-89ea-dce215703c16"
        );

      newData.unshift({
        key: `ทั้งหมด`,
        value: "default",
      });

      return newData ?? [];
    } else {
      return [];
    }
  };

  /* end export excel */

  /**
   * ตั้งค่า Form ค้นหา
   *  - search = list input ค้นหา
   *  - col = ของ antd
   *  - button = ตั้งค่าปุ่มด้านขวา
   *    - download = ปุ่ม download
   *    - import = ปุ่ม import
   *    - export = ปุ่ม export
   * */
  const configSearch = {
    search: [
      {
        index: 1,
        type: "input",
        name: "search",
        label: GetIntlMessages("search"),
        placeholder: GetIntlMessages("search"),
        list: null,
      },
      {
        index: 1,
        type: "select",
        name: "payment_paid_status",
        label: GetIntlMessages("select-paid-status"),
        placeholder: GetIntlMessages("select-paid-status"),
        showSearch: true,
        allowClear: true,
        mode: "multiple",
        list: isArray(paymentStatus) ? paymentStatus : [],
      },
      {
        index: 1,
        type: "RangePicker",
        name: "documentdate",
        label: GetIntlMessages("document-date"),
        allowClear: true,
      },
      {
        index: 1,
        type: "select",
        name: "document_type_id",
        label: "เลือกประเภทเอกสาร",
        placeholder: "เลือกประเภทเอกสาร",
        showSearch: true,
        // mode: "multiple",
        list: customData(),
      },
      {
        index: 1,
        type: "select",
        name: "select_shop_ids",
        label: "เลือกสาขา",
        placeholder: "เลือกสาขา",
        allowClear: true,
        showSearch: true,
        mode: "multiple",
        use: shopInCorporate.length > 1,
        list: [
          {
            key: `ทุกสาขา`,
            value: "all"
          },
          ...isArray(shopInCorporate) && shopInCorporate?.length > 0 ? shopInCorporate.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)?.map(e => ({
            key: e?.shop_name?.shop_local_name === undefined || e?.shop_name?.shop_local_name === null || e?.shop_name?.shop_local_name === "" ? e?.shop_name?.[`${locale.locale}`] : e?.shop_name?.shop_local_name,
            value: e?.id
          })) : []],
      },
      {
        index: 1,
        type: "RangePicker",
        name: "payment_paid_date",
        label: GetIntlMessages("วันที่รับชำระ"),
        allowClear: true,
      },
      {
        index: 1,
        type: "select",
        name: "is_member",
        showSearch: true,
        label: GetIntlMessages("เฉพาะสมาชิก"),
        list: [
          {
            key: "ใช่",
            value: true
          },
          {
            key: "ไม่ใช่",
            value: false
          },
        ],
      },
      // {
      //   index: 1,
      //   type: "select",
      //   name: "report_sales_out_type",
      //   showSearch: true,
      //   label: GetIntlMessages("รูปแบบการแสดงผล"),
      //   col_md: 6,
      //   list: [
      //     {
      //       key: "หัวเอกสาร",
      //       value: "doc"
      //     },
      //     {
      //       key: "รายการ",
      //       value: "list"
      //     },
      //   ],
      // },
    ],
    col: 8,
    button: {
      create: false,
      download: false,
      import: false,
      export: true,
    },
    onFinishSearch,
    onFinishError,
    onReset,
    exportExcel,
  };

  /* Tab */
  const [activeKeyTab, setActiveKeyTab] = useState("1");

  /* get Master documentTypes */
  const getTaxTypes = async () => {
    const { data } = await API.get(`/master/taxTypes/all`);
    return (data.status = "success" ? data.data : []);
  };

  const whereIdArray = (arr, id, type) => {
    return type === "index"
      ? arr.findIndex((where) => where.id === id)
      : arr.find((where) => where.id === id);
  };

  const calculateResult = async () => {
    const { list_service_product, tax_id, tailgate_discount } =
      form.getFieldValue();

    let total = 0,
      discount = 0,
      vat = 0,
      net_total = 0,
      total_amount = 0;

    list_service_product.forEach((e) => {
      total += Number(e.amount ?? 0) * Number(e.price ?? 0);
      discount += Number(e.discount ?? 0);
      total_amount += Number(e.amount ?? 0);
    });
    total = total - discount;

    if (tax_id && tax_id !== "fafa3667-55d8-49d1-b06c-759c6e9ab064") {
      const { detail } = whereIdArray(
        taxTypesList.length > 0 ? taxTypesList : await getTaxTypes(),
        tax_id
      );
      if (isPlainObject(detail)) {
        vat = (total * Number(detail.tax_rate_percent)) / 100;
        total = total - vat;
      }
    }

    net_total = total - Number(tailgate_discount ?? 0);

    form.setFieldsValue({
      total,
      total_text: total.toLocaleString(),

      discount,
      discount_text: discount ? discount.toLocaleString() : 0,

      net_total,
      net_total_text: net_total ? net_total.toLocaleString() : 0,

      vat,

      total_amount,
    });
  };

  /* ขำระเงิน */
  const [isModePayment, setIsModePayment] = useState(false);

  const [isModeFullInvoices, setIsModeFullInvoices] = useState(false);

  const handleOkPayment = () => { };
  const handleCancelPayment = () => {
    setIsModePayment(false);
  };

  const checkButtonPayment = () => {
    const { status, purchase_status } = form.getFieldValue();
    return status == "3" && purchase_status != true;
  };
  const checkButtonPrint = () => {
    const { status, purchase_status } = form.getFieldValue();
    return status == "3" && purchase_status == true;
  };

  /*print*/
  const componentRef = useRef(null);

  const reactToPrintContent = useCallback(() => {
    return componentRef.current;
  }, []);
  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    pageStyle: `
        @page {
            margin: 18mm 5mm 18mm 5mm;
            size: auto;
           }
           `,
  });

  return (
    <>
      <div id="page-manage">
        <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
        <SearchInput
          configSearch={configSearch}
          configModal={configModal}
          loading={loading}
          onAdd={() => addEditViewModal("add", null)}
          value={modelSearch}
          title={title !== null ? false : true}
        />
        <TableList
          columns={columns}
          data={listSearchDataTable}
          loading={loading}
          configTable={configTable}
          callbackSearch={getDataSearch}
          addEditViewModal={addEditViewModal}
          changeStatus={changeStatus}
        />

        <ModalFullScreen
          maskClosable={false}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ disabled: configModal.mode == "view" }}
          title={`ใบเสร็จรับเงิน/ใบกำกับภาษี`}
          CustomsButton={() => {
            return (
              <div>
                <span className="pr-3">
                  <Button onClick={handleCancel} style={{ width: 100 }}>
                    ยกเลิก
                  </Button>
                </span>
                <span className="pr-3">
                  <PrintOut documentId={form.getFieldValue().id} />
                </span>
                {form.getFieldValue().status == "2" ||
                  (isModeFullInvoices == true &&
                    form.getFieldValue().status == "3") ? (
                  <Button
                    type="primary"
                    onClick={() => handleOk(0)}
                    style={{ width: 100 }}
                  >
                    บันทึก
                  </Button>
                ) : (
                  ""
                )}

                {checkButtonPayment() ? (
                  <Button
                    type="primary"
                    onClick={() => setIsModePayment(true)}
                    style={{ width: 100 }}
                  >
                    รับชำระ
                  </Button>
                ) : (
                  ""
                )}
              </div>
            );
          }}
        >
          <div className="container-fluid">
            <div className="pr-5 pl-5 detail-before-table">
              <FormServicePlans
                mode={configModal.mode}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                form={form}
                taxTypesList={taxTypesList}
                calculateResult={calculateResult}
                type={2}
                addEditViewModal={addEditViewModal}
              />
            </div>

            <div className="tab-detail">
              <Tabs
                activeKey={activeKeyTab}
                onChange={(value) => setActiveKeyTab(value)}
              >
                <TabPane tab={GetIntlMessages("สินค้า / บริการ")} key="1">
                  <Tab1ServiceProduct
                    mode={configModal.mode}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    handleOk={handleOk}
                    calculateResult={calculateResult}
                    type={2}
                  />
                </TabPane>

                <TabPane tab={GetIntlMessages("ลูกค้า / การชำระเงิน")} key="2">
                  <Tab2Custome
                    mode={configModal.mode}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    type={2}
                  />
                </TabPane>

                <TabPane tab={GetIntlMessages("รถยนต์")} key="4">
                  <Tab4Vehicle
                    mode={configModal.mode}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    form={form}
                    type={2}
                  />
                </TabPane>
              </Tabs>
            </div>
          </div>
        </ModalFullScreen>

        <ModalFullScreen
          maskClosable={false}
          visible={isModePayment}
          onOk={handleOkPayment}
          onCancel={handleCancelPayment}
          title={`ชำระเงิน`}
          CustomsButton={() => {
            return (
              <div>
                <span className="pr-3">
                  <Button onClick={handleCancelPayment} style={{ width: 100 }}>
                    ยกเลิก
                  </Button>
                </span>
              </div>
            );
          }}
        >
          <div className="container-fluid">
            <div id="invoices-container">
              <div className="detail-before-table">
                <PaymentDocs
                  mode={configModal.mode}
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  form={form}
                  type={2}
                />
              </div>
            </div>
          </div>
        </ModalFullScreen>
      </div>

      {/* <style jsx global>
        {`
          .detail-before-table {
            margin-bottom: 10px;
          }
          .ant-tabs-tab {
            margin: 0 64px 0 0;
          }
          .ant-tabs-tab + .ant-tabs-tab {
            margin: 0 64px 0 0;
          }
          .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
            color: ${mainColor};
            font-weight: 500;
          }
          .ant-tabs-tab:hover {
            color: ${mainColor};
          }
          .ant-tabs-ink-bar {
            background: ${mainColor};
          }
          .modal-full-screen .ant-form-item {
            margin-bottom: 5px;
          }
          .ant-form legend {
            padding: inherit;
            font-size: x-large;
            border-bottom: 0px solid #d9d9d9;
          }
        `}
      </style> */}
    </>
  );
};

export default ReportSalesOut;
