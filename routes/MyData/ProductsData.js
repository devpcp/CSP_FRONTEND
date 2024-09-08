import { useEffect, useState } from "react";
import Head from "next/head";
import {
  Button,
  message,
  Input,
  Modal,
  Form,
  Upload,
  Typography,
  Row,
  Col
} from "antd";
import {

  UploadOutlined,
  TableOutlined,
  ContainerOutlined,
  DownloadOutlined,
  ExportOutlined,
  ImportOutlined
} from "@ant-design/icons";
import API from "../../util/Api";
import moment from "moment";
import axios from "axios";
import { Cookies } from "react-cookie";
import { useSelector } from "react-redux";
import _, { isArray, isPlainObject, isEmpty, isFunction } from "lodash";
// import TitlePage from '../shares/TitlePage';
import ProductMovement from "../../components/Routes/Movement/ProductMovement";
import SearchInput from "../../components/shares/SearchInput";
import TableList from "../../components/shares/TableList";
import {
  FormInputLanguage,
  FormSelectLanguage,
} from "../../components/shares/FormLanguage";
import ImportDocAddEditViewModal from "../../components/Routes/ImportDocumentModal/ImportDocAddEditViewModal";
import ModalFullScreen from "../../components/shares/ModalFullScreen";
import GetIntlMessages from "../../util/GetIntlMessages";
import ProductModal from "../../components/Routes/MasterLookUp/Components.Modal.Product";
import Swal from "sweetalert2";
import Fieldset from "../../components/shares/Fieldset";
import ReportSalesOut from "./Reports/ReportSalesOut"

const { Text, Link } = Typography;

const cookies = new Cookies();
const { Search } = Input;

const ComponentsRoutesProducts = ({ title = null, callBack, listIndex }) => {
  const [loading, setLoading] = useState(false);

  const [formModal] = Form.useForm();
  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const { authUser, token } = useSelector(({ auth }) => auth);
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { locale } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon);
  const [ProductTypeGroupAllList, setProductTypeGroupAll] = useState([]);
  const [checkShopCanEditData, setcheckShopCanEditData] = useState(false);
  const [isModalPriceVisible, setIsModalPriceVisible] = useState(false);

  /* Import Excel */
  const [isModalImportPriceVisible, setIsModalImportPriceVisible] = useState(false)
  const [fileImportPrice, setFileImportPrice] = useState(null);
  const [fileImportPriceList, setFileImportPriceList] = useState([]);
  const [urlImportPriceErrorFile, setUrlImportPriceErrorFile] = useState("");
  const [editPriceType, setEditPriceType] = useState("");
  const [showModalSalesHistoryData, setShowModalSalesHistoryData] = useState(false);


  useEffect(() => {
    initProductTypeGroup(form);
    checkShopCanEdit()
  }, [form]);

  const tailformItemLayout = {
    labelCol: {
      md: { span: 12 },
    },
    wrapperCol: {
      md: { span: 24 },
    },
  };

  useEffect(() => {
    checkShopCanEdit()
    setColumnsTable()
  }, [listIndex])


  const checkShopCanEdit = async () => {
    setcheckShopCanEditData(true)
    // let shop_id = authUser?.UsersProfile?.shop_id
    // switch (shop_id) {
    //   //SCH
    //   case "1a523ad4-682e-4db2-af49-d54f176a84ad":
    //     setcheckShopCanEditData(true)
    //     break;
    //   case "218660de-50d9-4175-a976-10ff2c00152e"://MCONT
    //   case "d6bc0647-efa3-4006-8983-337f6797c20f"://MCONCX1
    //   case "2698ee1c-82ca-4683-8d95-1dfecb3e4f15"://MCONCX2
    //   case "6471a29a-76c6-43eb-b805-169b605daf42"://MONTREE
    //     setcheckShopCanEditData(true)
    //     break;
    //   //MONTREE
    //   case "d53c5ead-bc70-4952-b0fe-c171ccbc9cd0":
    //     setcheckShopCanEditData(true)
    //     break;
    //   //STV
    //   case "db945efe-17c8-4c43-a437-31204fe3b8af":
    //     setcheckShopCanEditData(true)
    //     break;
    //   case "acf96da6-f3ac-4cf4-9676-93b9b90c8e11"://MBA
    //   case "5cc9b918-ece2-4be2-b824-f7e636f44c41"://WH
    //   case "06f975b9-1e77-4e3d-99b0-8851aa84231a"://SMP
    //   case "debe36bc-dbfe-4291-b1dd-4c961b0a5740"://TPS
    //   case "585fb9c2-20b1-4c9d-a476-aa48a256efce"://MTC
    //   case "7c62d320-cf03-4e6b-b3c0-7499fd78b455"://MTC
    //     setcheckShopCanEditData(true)
    //     break;
    //   default:
    //     setcheckShopCanEditData(false)
    //     break;
    // }
  }


  const setColumnsTable = () => {
    const _column = [
      {
        title: "ลำดับ",
        dataIndex: "num",
        key: "num",
        align: "center",
        width: 100,
        use: true,
        render: (text, record, index) => {
          index += (configTable.page - 1) * configTable.limit;
          return index + 1;
        },
      },
      {
        title: "รหัสสินค้า",
        dataIndex: "Product",
        key: "Product",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (isFunction(callBack)) {
            return (
              <Link href="#" onClick={() => callBack(record, listIndex)}>
                {text.master_path_code_id}
              </Link>
            )
          } else {
            return (
              <Text>{text.master_path_code_id}</Text>
            )
          }
        },
        sorter: (a, b, c) => { },
        use: true,
        sortOrder:
          configSort.sort == "master_path_code_id" ? configSort.order : true,
        onHeaderCell: (obj) => {
          return {
            onClick: () => {
              console.log("configSort", configSort)
              console.log("obj.sortOrder", obj.sortOrder)
              getDataSearch({
                page: configTable.page,
                search: modelSearch.search,
                sort: "master_path_code_id",
                order: configSort.order !== "descend" ? "desc" : "asc",
              });
              setConfigSort({
                sort: "master_path_code_id",
                order: obj.sortOrder === "ascend" ? "descend" : "ascend",
              });
            },
          };
        },
      },
      {
        title: "รหัสบาร์โค้ด",
        dataIndex: "",
        key: "",
        width: 150,
        align: "center",
        use: true,
        render: (text, record) =>
          isPlainObject(text) &&
            text["product_bar_code"] &&
            text["product_bar_code"].length > 0 ? (
            <div style={{ textAlign: "start" }}>
              {text["product_bar_code"] ?? "-"}
            </div>
          ) : (
            "-"
          ),
      },
      {
        title: "ชื่อสินค้า",
        dataIndex: "Product",
        key: "Product",
        width: 300,
        use: true,
        render: (text, record) =>
          _.get(text, `product_name[${locale.locale}]`, "-"),
      },
      {
        title: "ประเภทสินค้า",
        dataIndex: "Product",
        key: "Product",
        width: 200,
        use: true,
        render: (text, record) =>
          isPlainObject(text)
            ? text.ProductType
              ? text.ProductType.type_name[`${locale.locale}`]
              : "-"
            : "-",
      },
      {
        title: "ยี่ห้อสินค้า",
        dataIndex: "Product",
        key: "Product",
        width: 200,
        use: true,
        render: (text, record) =>
          isPlainObject(text)
            ? text.ProductBrand
              ? text.ProductBrand.brand_name[`${locale.locale}`]
              : "-"
            : "-",
      },
      {
        title: "รุ่น",
        dataIndex: "Product",
        key: "Product",
        width: 200,
        use: true,
        render: (text, record) =>
          isPlainObject(text)
            ? text.ProductModelType
              ? text.ProductModelType.model_name[`${locale.locale}`]
              : "-"
            : "-",
      },
      {
        title: () => GetIntlMessages("เลือก"),
        dataIndex: 'cheque_number',
        key: 'cheque_number',
        width: 100,
        align: "center",
        use: _.isFunction(callBack) ?? false,
        render: (text, record) => (
          <Button onClick={() => callBack(record, listIndex)}>เลือก</Button>
        ),
      },
    ];

    setColumns(_column.filter(x => x.use === true));
  };

  /* ค่าเริ่มต้น */
  const reset = async () => {
    const _page = 1,
      _search = "";
    setPage(_page);
    setSearch(_search);
    await getDataSearch({ _page, _search });
  };

  /* ค้นหา */
  const getDataSearch = async ({
    search = modelSearch.search ?? "",
    limit = configTable.limit,
    page = configTable.page,
    sort = configSort.sort,
    order = configSort.order === "descend" ? "desc" : "asc",
    _status = modelSearch.status,
    type_group_id = modelSearch.type_group_id,
    product_type_id = modelSearch.product_type_id,
    product_brand_id = modelSearch.product_brand_id,
    product_model_id = modelSearch.product_model_id,
    tags_id = modelSearch.tags_id
  }) => {
    try {
      if (page === 1) setLoading(true);
      console.log("_status_status_status", _status)
      // const res = await API.get(`/product/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`)
      const res = await API.get(
        `shopProducts/all?limit=${limit}&page=${page}&sort=start_date&order=${order}&status=${_status}&search=${search}${type_group_id ? `&type_group_id=${type_group_id}` : ""
        }${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""
        }${product_model_id ? `&product_model_id=${product_model_id}` : ""}${tags_id.length > 0 ? `&tags=${tags_id}` : ""}`
      );
      if (res.data.status === "success") {
        const { currentCount, currentPage, pages, totalCount, data, isuse } = res.data.data;
        // console.log(`data getDataSearch`, data)
        setListSearchDataTable(data);
        // setTotal(totalCount);
        setConfigTable({
          ...configTable,
          page: page,
          total: totalCount,
          limit: limit,
          isuse: isuse,
        });
        if (page === 1) setLoading(false);
      } else {
        message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!");
        if (page === 1) setLoading(false);
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!");
      if (page === 1) setLoading(false);
    }
  };

  /* เปลี่ยนสถานะ */
  const changeStatus = async (isuse, id) => {
    try {
      // delete,active,block
      const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete";
      const { data } = await API.put(`/shopProducts/put/${id}`, { status });
      // const { data } = await API.put(`/product/put/${id}?which=${status === "management" ? "michelin data" : "my data"}`, { status })
      if (data.status != "success") {
        message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
      } else {
        message.success("บันทึกข้อมูลสำเร็จ");
        // console.log(`search`, modelSearch.search)
        getDataSearch({
          page: configTable.page,
          search: modelSearch.search,
          status: modelSearch.status,
        });
        setModelSearch(modelSearch);
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!");
    }
  };

  /* addEditView */
  const addEditViewModal = async (mode, id) => {
    // console.log('id', id);
    try {
      // setMode(_mode)

      const formValue = form.getFieldsValue();

      if (id) {
        setIsIdEdit(id);
        const { data } = await API.get(`/shopProducts/byid/${id}`);

        if (data.status) {
          const _model = data.data[0];
          // console.log('_model', _model)
          formValue.initOtherDetails = _model.Product.other_details;
          formValue.shopProductId = _model.id;

          setCheckedIsuse(_model.isuse == 1 ? true : false);
          formValue.wyz_code = _model.Product?.wyz_code
            ? _model.Product.wyz_code ?? null
            : null;
          formValue.productId = _model.Product ? _model.Product.id : null;
          formValue.product_name = _model.Product
            ? _model.Product.product_name
            : null;
          formValue.product_code = _model.Product
            ? _model.Product?.product_code ?? null
            : null;
          formValue.master_path_code_id = _model.Product ? _model.Product.master_path_code_id : null;
          formValue.product_code = _model.Product ? _model.Product.product_code != null ? _model.Product.product_code : formValue.master_path_code_id : null;
          formValue.product_bar_code = _model ? _model.product_bar_code : null;
          formValue.product_type_id = _model.Product?.ProductType
            ? _model.Product.ProductType.id
            : null;
          formValue.product_type_group_id = _model.Product?.ProductType
            ? _model.Product.ProductType.type_group_id
            : null;
          formValue.product_brand_id = _model.Product?.ProductBrand
            ? _model.Product.ProductBrand.id
            : null;
          formValue.product_model_id = _model.Product?.ProductModelType
            ? _model.Product.ProductModelType.id
            : null;
          formValue.rim_size = _model.Product.rim_size
            ? _model.Product.rim_size
            : 0;
          formValue.width = _model.Product.width ? _model.Product.width : 0;
          formValue.hight = _model.Product.hight ? _model.Product.hight : 0;
          formValue.series = _model.Product.series ? _model.Product.series : 0;
          formValue.load_index = _model.Product.load_index ? _model.Product.load_index : 0;
          formValue.speed_index = _model.Product.speed_index
            ? _model.Product.speed_index
            : 0;
          formValue.complete_size_id = _model.Product?.ProductCompleteSize
            ? _model.Product.ProductCompleteSize.id
            : null;
          setConfigModal({
            ...configModal,
            mode,
            headName: _model.Product.master_path_code_id,
          });
          // _model.product_name = _model.Product.product_name["th"] ? _model.Product.product_name["th"] : null

          /* price */
          if (_model.price) {
            (formValue.suggasted_re_sell_price_retail =
              _model.price.suggasted_re_sell_price.retail),
              (formValue.suggasted_re_sell_price_wholesale =
                _model.price.suggasted_re_sell_price.wholesale),
              (formValue.suggested_online_price_retail =
                _model.price.suggested_online_price.retail),
              (formValue.suggested_online_price_wholesale =
                _model.price.suggested_online_price.wholesale),
              (formValue.b2b_price_retail = _model.price.b2b_price.retail),
              (formValue.b2b_price_wholesale =
                _model.price.b2b_price.wholesale),
              (formValue.credit_30_price_retail =
                _model.price.credit_30_price.retail),
              (formValue.credit_30_price_wholesale =
                _model.price.credit_30_price.wholesale),
              (formValue.credit_45_price_retail =
                _model.price.credit_45_price.retail),
              (formValue.credit_45_price_wholesale =
                _model.price.credit_45_price.wholesale),
              (formValue.start_date = _model.start_date
                ? moment(_model.start_date)
                : null),
              (formValue.end_date = _model.end_date
                ? moment(_model.end_date)
                : null);

            // form.setFieldsValue(formValue)
            // console.log('formValue', formValue)
          }
          formValue.price_arr = _model.price_arr

          try {
            let price_dot_arr = _model.price_dot_arr
            const resStock = await API.get(`/shopStock/all?limit=1&page=1&product_id=${id}`)
            let dataStock = resStock.data.data.data
            let dot_stock_arr = []
            console.log("resStock", dataStock)
            if (dataStock.length > 0) {
              dataStock.map((e) => {
                e.warehouse_detail.map((e) => {
                  if (e.shelf.dot_mfd !== undefined) {
                    if (dot_stock_arr.find(x => x.price_name === e.shelf.dot_mfd) === undefined) {
                      dot_stock_arr.push(
                        {
                          price_name: e.shelf.dot_mfd,
                          price_value: null
                        })
                    }
                  }
                })
              })
            }
            if (price_dot_arr === null || price_dot_arr === undefined || price_dot_arr.length === 0) {
              formValue.price_dot_arr = dot_stock_arr
            } else {
              dot_stock_arr.map((e) => {
                if (price_dot_arr.find(x => x.price_name === e.price_name) === undefined) {
                  price_dot_arr.push(
                    {
                      price_name: e.price_name,
                      price_value: null
                    })
                }
              })
              const getVal = str => str.substring(2, 2)

              price_dot_arr.sort((a, b) => getVal(b.price_name) - getVal(a.price_name)).reverse()
              formValue.price_dot_arr = price_dot_arr
            }
          } catch (error) {
            console.log("error", error)
          }


          if (
            _model.ShopProductPriceLogs &&
            isArray(_model.ShopProductPriceLogs)
          ) {
            formValue.other_details_price_log = _model.ShopProductPriceLogs.map(
              (e, index) => {
                return {
                  suggasted_re_sell_price_retail_log:
                    e.price.suggasted_re_sell_price.retail,
                  suggasted_re_sell_price_wholesale_log:
                    e.price.suggasted_re_sell_price.wholesale,

                  suggested_online_price_retail_log:
                    e.price.suggested_online_price.retail,
                  suggested_online_price_wholesale_log:
                    e.price.suggested_online_price.wholesale,

                  b2b_price_retail_log: e.price.b2b_price.retail,
                  b2b_price_wholesale_log: e.price.b2b_price.wholesale,

                  credit_30_price_retail_log: e.price.credit_30_price.retail,
                  credit_30_price_wholesale_log:
                    e.price.credit_30_price.wholesale,

                  credit_45_price_retail_log: e.price.credit_45_price.retail,
                  credit_45_price_wholesale_log:
                    e.price.credit_45_price.wholesale,

                  start_date_log: e.start_date ? moment(e.start_date) : null,
                  end_date_log: e.end_date ? moment(e.end_date) : null,
                };
              }
            );
            // form.setFieldsValue(formValue)
          }

          //other_details detail ใน Product *ส่วนกลาง
          if (_.isPlainObject(_model.Product.other_details)) {
            formValue.cci_code = _model.Product.other_details["cci_code"];
            formValue.ccid_code = _model.Product.other_details["ccid_code"];
            formValue.cad_code = _model.Product.other_details["cad_code"];
            formValue.discount = _model.Product.other_details["discount"];
            formValue.sku = _model.Product.other_details["sku"];

            formValue.sourcing_manufacturing =
              _model.Product.other_details["sourcing_manufacturing"];
            formValue.position_front_and_rear =
              _model.Product.other_details["position_front_and_rear"];
            formValue.tl_and_tt_index =
              _model.Product.other_details["tl_and_tt_index"];
            formValue.based_price = _model.Product.other_details["based_price"];
            formValue.after_channel_discount =
              _model.Product.other_details["after_channel_discount"];
            formValue.suggested_promote_price =
              _model.Product.other_details["suggested_promote_price"];
            formValue.normal_price =
              _model.Product.other_details["normal_price"];
            formValue.benchmark_price =
              _model.Product.other_details["benchmark_price"];
            formValue.include_vat_price =
              _model.Product.other_details["include_vat_price"];
            formValue.exclude_vat_price =
              _model.Product.other_details["exclude_vat_price"];
            formValue.vehicle_types =
              _model.Product.other_details["vehicle_types"];

            if (
              _model.Product.other_details["oe_tire"] &&
              isPlainObject(_model.Product.other_details["oe_tire"])
            )
              setCheckedOeTire(
                _model.Product.other_details["oe_tire"]["status"] ?? false
              );
            if (
              _model.Product.other_details["runflat_tire"] &&
              isPlainObject(_model.Product.other_details["runflat_tire"])
            )
              setCheckedRunFlatTire(
                _model.Product.other_details["runflat_tire"]["status"] ?? false
              );
            if (
              _model.Product.other_details["others_tire_detail"] &&
              isPlainObject(_model.Product.other_details["others_tire_detail"])
            )
              setCheckedOtherTrieDetail(
                _model.Product.other_details["others_tire_detail"]["status"] ??
                false
              );

            if (
              _model.Product.other_details["oe_tire"] &&
              isPlainObject(_model.Product.other_details["oe_tire"])
            )
              formValue.remark_oe_tire =
                _model.Product.other_details["oe_tire"]["remark_oe_tire"] ?? {};
            if (
              _model.Product.other_details["runflat_tire"] &&
              isPlainObject(_model.Product.other_details["runflat_tire"])
            )
              formValue.remark_runflat_tire =
                _model.Product.other_details["runflat_tire"][
                "remark_runflat_tire"
                ] ?? {};
            if (
              _model.Product.other_details["others_tire_detail"] &&
              isPlainObject(_model.Product.other_details["others_tire_detail"])
            )
              formValue.remark_others_tire_detail =
                _model.Product.other_details["others_tire_detail"][
                "remark_others_tire_detail"
                ] ?? {};

            /* other_shops */
            if (
              _.isArray(_model.Product.other_details.other_shops) &&
              _model.Product.other_details.other_shops.length > 0
            ) {
              _model.prohand_price =
                _model.Product.other_details.other_shops[0]["prohand_price"];
              _model.ezyFit_price =
                _model.Product.other_details.other_shops[0]["ezyFit_price"];
              _model.wyz_price =
                _model.Product.other_details.other_shops[0]["wyz_price"];
              _model.auto_one_price =
                _model.Product.other_details.other_shops[0]["auto_one_price"];
              _model.ycc_price =
                _model.Product.other_details.other_shops[0]["ycc_price"];
            }

            if (_model.Product.other_details["sku"]) {
              setCheckSkuDisable(true);
            } else {
              setCheckSkuDisable(false);
            }



            // form.setFieldsValue(formValue)
          }
          //detail ใน shopProduct *เฉพาะในร้าน
          if (_.isPlainObject(_model.details)) {
            formValue.made_in = _model.details["made_in"];
            formValue.note = _model.details["note"];
            formValue.ref_url = _model.details["ref_url"];

            formValue.reorder_point = _model.details["reorder_point"];
            formValue.over_qty_point = _model.details["over_qty_point"];
            formValue.standard_margin_retail_percent = _model.details["standard_margin_retail_percent"];
            formValue.standard_margin_retail_bath = _model.details["standard_margin_retail_bath"];
            formValue.standard_margin_wholesale_percent = _model.details["standard_margin_wholesale_percent"];
            formValue.standard_margin_wholesale_bath = _model.details["standard_margin_wholesale_bath"];
            formValue.warehouse_id = _model.details["warehouse_id"];
            formValue.shelf_code = _model.details["shelf_code"];
            formValue.purchase_unit = _model.details["purchase_unit"];
            formValue.sales_unit = _model.details["sales_unit"];
            formValue.uom_arr = _model.details["uom_arr"];
          }
          formValue.latest_ini_cost = _model ? _model.latest_ini_cost : null
          formValue.latest_ini_cost_vat = _model ? _model.latest_ini_cost_vat : null
          formValue.latest_ini_code_id = _model ? _model.latest_ini_code_id : null
          formValue.latest_ini_doc_date = _model ? _model.latest_ini_doc_date ? moment(_model.latest_ini_doc_date).format("DD/MM/YYYY") : null : null
          formValue.product_total_value_no_vat = _model ? _model.product_total_value_no_vat : null
          formValue.product_total_value_vat = _model ? _model.product_total_value_vat : null
          formValue.tags = _model.tags.map((e) => (e.id)) ?? [];


          // /* isuse */
          // _model.isuse = _model.isuse == 1 ? true : false
          // setCheckedIsuse(_model.isuse)
          // console.log("formValue", formValue)
          form.setFieldsValue({ ...formValue });
          // form.setFieldsValue({ ..._model, ...formValue, start_date: valueOfStartDate, end_date: valueOfEndDate })
          // form.setFieldsValue({ ..._model, product_name: { th: _model.Product.product_name["th"] ? _model.Product.product_name["th"] : null, en: _model.Product.product_name["en"] ? _model.Product.product_name["en"] : null } })
        }
      }

      // console.log('formValue setIsIdEdit5555', formValue)
      setIsModalVisible(true);
    } catch (error) {
      console.log(`error`, error);
    }
  };

  /* Download Template */
  const downloadTemplate = () => {
    window.open(
      "../../../templates/excel/template-ข้อมูลสินค้า.xlsx",
      "_blank"
    );
  };

  /* Import Excel */
  const [isModalImportVisible, setIsModalImportVisible] = useState(false);
  const [fileImport, setFileImport] = useState(null);
  const [fileImportList, setFileImportList] = useState([]);

  const importExcel = () => {
    setIsModalImportVisible(true);
  };


  const handleImportOk = async () => {
    try {
      if (fileImport) {
        const formData = new FormData();
        formData.append("file", fileImport.originFileObj);
        const userAuth = cookies.get("userAuth");
        const token = userAuth.access_token;
        const { data } = await axios({
          method: "post",
          url: `${process.env.NEXT_PUBLIC_APIURL}/macthProduct/byfile`,
          config: { headers: { "Content-Type": "multipart/form-data" } },
          headers: { Authorization: "Bearer " + token },
          data: formData,
        });

        if (data.status == "successful") {
          message.success("บันทึกสำเร็จ");
          setFileImportList([]);
          setFileImport(null);
          setIsModalImportVisible(false);
          getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            status: modelSearch.status,
          });
        } else {
          message.error(data.data ?? "มีบางอย่างผิดพลาด !!");
        }
      } else {
        message.warning("กรุณาเลือกไฟล์");
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!");
    }
  };

  const handleImportCancel = () => {
    setIsModalImportVisible(false);
    setFileImportList([]);
    setFileImport(null);
  };

  const handleImportChange = (info) => {
    let fileList = [...info.fileList];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    fileList = fileList.slice(-1);

    if (fileList.length > 0) {
      const infoFileList = fileList[0];
      if (infoFileList.status === "done") {
        fileList = fileList.map((file) => {
          if (file.response) {
            // console.log(`file`, file)
          }
          return file;
        });
      }
    }

    // console.log('fileList :>> ', fileList);
    setFileImportList(fileList);
    if (fileList.length > 0) setFileImport(fileList[0]);
    else {
      setFileImport(null);
      // setFileType(null);
    }
  };

  /* Modal */
  const [configModal, setConfigModal] = useState({
    mode: "add",
    maxHeight: 600,
    overflowX: "auto",
    headName: "",
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idEdit, setIsIdEdit] = useState(null);
  const [checkedIsuse, setCheckedIsuse] = useState(false);
  const [checkedOeTire, setCheckedOeTire] = useState(false);
  const [checkedRunFlatTire, setCheckedRunFlatTire] = useState(false);
  const [checkedOtherTireDetail, setCheckedOtherTrieDetail] = useState(false);
  const [checkedOkAndCancle, setCheckedOkAndCancle] = useState(null);
  const [form] = Form.useForm();
  const [formImportDoc] = Form.useForm();

  const handleOk = () => {
    setLoading(true)
    form.submit();
    setCheckedOkAndCancle(() => 1);
    // setProductTypeList([]);
    // setProductModelTypeList([]);
    setCheckSkuDisable(() => false);
  };

  const handleCancel = () => {
    form.resetFields();
    setConfigModal({ ...configModal, mode: "add" });
    setIsModalVisible(() => false);
    setCheckedOkAndCancle(() => null);
    // setProductAllList([]);
    // setProductTypeList([]);
    // setProductModelTypeList([]);

    // setOnDisabledProductIdChange(false);
    // setCheckedOkAndCancle(0);
    // setCheckSkuDisable(false);
    // setCheckedOeTire(false);
    // setCheckedRunFlatTire(false);
    // setCheckedOtherTrieDetail(false);
  };

  const onFinish = async (value) => {
    console.log('value', value)
    try {
      const { productId, ShopProductId, initOtherDetails } =
        form.getFieldValue();

      const _model = {
        // product_id: formValue.product_id ?? null,
        product_code: value.product_code ?? null,
        master_path_code_id: value.master_path_code_id ?? null,
        product_bar_code: value.product_bar_code ?? null,
        product_name: value.product_name,
        product_type_id: value.product_type_group_id ?? null,
        product_type_id: value.product_type_id ?? null,
        product_brand_id: value.product_brand_id ?? null,
        product_model_id: value.product_model_id ?? null,
        rim_size: value.rim_size ?? 0,
        width: value.width ?? 0,
        hight: value.hight ?? 0,
        series: value.series ?? 0,
        load_index: value.load_index ?? 0,
        speed_index: value.speed_index ?? 0,
        complete_size_id: value.complete_size_id ?? null,
        price: {
          suggasted_re_sell_price: {
            retail: value.suggasted_re_sell_price_retail ?? null,
            wholesale: value.suggasted_re_sell_price_wholesale ?? null,
          },
          b2b_price: {
            retail: value.b2b_price_retail ?? null,
            wholesale: value.b2b_price_wholesale ?? null,
          },
          suggested_online_price: {
            retail: value.suggested_online_price_retail ?? null,
            wholesale: value.suggested_online_price_wholesale ?? null,
          },
          credit_30_price: {
            retail: value.credit_30_price_retail ?? null,
            wholesale: value.credit_30_price_wholesale ?? null,
          },
          credit_45_price: {
            retail: value.credit_45_price_retail ?? null,
            wholesale: value.credit_45_price_wholesale ?? null,
          },
        },
        price_arr: value.price_arr ?? [],

        // start_date: moment(value.other_details_price_list[0].start_date),
        // end_date:moment(value.other_details_price_list[0].end_date),
        start_date: value?.start_date ? moment(value.start_date).format("YYYY-MM-DD") : null,
        end_date: value?.end_date ? moment(value.end_date).format("YYYY-MM-DD") : null,
        tags: value.tags ?? undefined,// แท็ก
        other_details: {
          sku: value.sku ?? null,
          cci_code: value.cci_code ?? null,
          ccid_code: value.ccid_code ?? null,
          cad_code: value.cad_code ?? null,
          sourcing_manufacturing: value.sourcing_manufacturing ?? null,
          position_front_and_rear: value.position_front_and_rear ?? null,
          tl_and_tt_index: value.tl_and_tt_index ?? null,
          discount: value.discount ?? null,
          vehicle_types: value.vehicle_types,
          oe_tire: {
            status: checkedOeTire,
            remark_oe_tire: value.remark_oe_tire,
          },
          runflat_tire: {
            status: checkedRunFlatTire,
            remark_runflat_tire: value.remark_runflat_tire,
          },
          others_tire_detail: {
            status: checkedOtherTireDetail,
            remark_others_tire_detail: value.remark_others_tire_detail,
          },

          after_channel_discount:
            initOtherDetails?.after_channel_discount ?? null,
          based_price: initOtherDetails?.based_price ?? null, // Base Price = ราคาแนะนำ ( Recomment Price )
          // based_price: { retail: value.other_details_price_list[0].based_price_retail, wholesale: value.other_details_price_list[0].based_price_wholesale } ?? null, // Base Price = ราคาแนะนำ ( Recomment Price )
          // after_channel_discount: initOtherDetails?.after_channel_discount ?? null,
          suggested_promote_price:
            initOtherDetails?.suggested_promote_price ?? null, // ราคาลงสื่อ ( Promote Price )
          normal_price: initOtherDetails?.normal_price ?? null, // ราคาทั่วไป ( Normal Price )
          benchmark_price: initOtherDetails?.benchmark_price ?? null, // Benchmark
          include_vat_price: initOtherDetails?.include_vat_price ?? null, // Cost inc vat
          exclude_vat_price: initOtherDetails?.exclude_vat_price ?? null, // Cost Exc Vat
        },
        details: {

          standard_margin_retail_percent: value.standard_margin_retail_percent ?? null, // Standard Margin
          standard_margin_retail_bath: value.standard_margin_retail_bath ?? null, // Standard Margin
          standard_margin_wholesale_percent: value.standard_margin_wholesale_percent ?? null, // Standard Margin
          standard_margin_wholesale_bath: value.standard_margin_wholesale_bath ?? null, // Standard Margin
          warehouse_id: value.warehouse_id ?? null, // Default คลังสินค้า
          shelf_code: value.shelf_code ?? null, // Default ชั้นสินค้า
          reorder_point: value.reorder_point ?? null, // จำนวนขั้นต่ำที่ต้องสั่งซื้อ
          over_qty_point: value.over_qty_point ?? null, // จำนวนเพดานสินค้า
          made_in: value.made_in ?? null, // ประเทศที่ผลิต
          note: value.note ?? null,// หมายเหตุ
          ref_url: value.ref_url ?? null,// ลิ้งค์อ้างอิง
          purchase_unit: value.purchase_unit ?? null, // Default หน่วยซื้อ
          sales_unit: value.sales_unit ?? null, // Default หน่วยขาย
          uom_arr: value.uom_arr ?? [],
        }
      };

      let price_dot_arr = value.price_dot_arr;
      if (price_dot_arr?.length > 0) {
        price_dot_arr.map((e) => {
          e.dot_show = e.price_name ? e.price_name.split("")[0] + "X" + e.price_name.split("")[2] + e.price_name.split("")[3] : "XXXX"
        })
      }
      _model.price_dot_arr = price_dot_arr

      _model.other_details.other_shops =
        initOtherDetails &&
          initOtherDetails.other_shops &&
          initOtherDetails.other_shops.length > 0
          ? [
            {
              prohand_price: initOtherDetails.other_shops[0].prohand_price
                ? initOtherDetails.other_shops[0].prohand_price ?? null
                : null, // ราคา Prohands ( Prohand Price )
              ezyFit_price: initOtherDetails.other_shops[0].ezyFit_price
                ? initOtherDetails.other_shops[0].ezyFit_price ?? null
                : null, // ราคา EzyFit ( Ezyfit Price )
              wyz_price: initOtherDetails.other_shops[0].wyz_price
                ? initOtherDetails.other_shops[0].wyz_price ?? null
                : null, // ราคา wyz ( wyz Price )
              auto_one_price: initOtherDetails.other_shops[0].auto_one_price
                ? initOtherDetails.other_shops[0].auto_one_price ?? null
                : null, // ราคา auto one ( auto1 price )
              ycc_price: initOtherDetails.other_shops[0].ycc_price
                ? initOtherDetails.other_shops[0].ycc_price ?? null
                : null, // ราคา YCC ( ycc price )
            },
          ]
          : [
            {
              prohand_price: null, // ราคา Prohands ( Prohand Price )
              ezyFit_price: null, // ราคา EzyFit ( Ezyfit Price )
              wyz_price: null, // ราคา wyz ( wyz Price )
              auto_one_price: null, // ราคา auto one ( auto1 price )
              ycc_price: null, // ราคา YCC ( ycc price )
            },
          ];

      // console.log(`_model`, _model)

      let res;
      let schShopRes;
      if (configModal.mode === "add") {
        // _model.status = checkedIsuse ? "active" : "block"
        if (productId == null && ShopProductId == null) {
          res = await API.post(`/product/add?which=my data`, _model);
          if (res.data.data.id) {
            // console.log('res.data.data', res.data.data)
            _model.product_id = res.data.data.id;
            res = await API.post(`/shopProducts/add?which=my data`, _model);
            setProductAllList([]);
          }
        } else if (
          (productId !== null && ShopProductId !== null) ||
          (productId !== null && ShopProductId == null)
        ) {
          if (checkSkuDisable == true) {
            _model.product_id = productId;
            res = await API.post(`/shopProducts/add?which=my data`, _model);
            setProductAllList([]);
          } else {
            res = await API.put(`/product/put/${productId}`, {
              other_details: _model.other_details,
            });
            if (res.data.status == "success") {
              _model.product_id = productId;
              res = await API.post(`/shopProducts/add?which=my data`, _model);
              setProductAllList([]);
            }
          }
        }
      } else if (configModal.mode === "edit") {
        _model.status = checkedIsuse ? "active" : "block";
        res = await API.put(
          `/shopProducts/put/${idEdit}?which=my data`,
          _model
        );
        if (checkShopCanEditData) {
          schShopRes = await API.put(`/product/put/${productId}`, _model);
        }
        setProductAllList([]);
      }

      if (checkShopCanEditData) {
        if (res.data.status === "success") {
          message.success("บันทึกสำเร็จ");
          setIsModalVisible(!isModalVisible);
          setOnDisabledProductIdChange(false);
          // setMode("add")
          setConfigModal({ ...configModal, mode: "add" });
          form.resetFields();

          getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            status: modelSearch.status,
          });
        } else {
          message.error("มีบางอย่างผิดพลาด !!");
        }
      } else {
        if (configModal.mode === "add") {
          if (res.data.status === "success") {
            message.success("บันทึกสำเร็จ");
            setIsModalVisible(() => !isModalVisible);
            setOnDisabledProductIdChange(() => false);
            // setMode("add")
            setConfigModal({ ...configModal, mode: "add" });
            form.resetFields();

            getDataSearch({
              page: configTable.page,
              search: modelSearch.search,
              status: modelSearch.status,
            });
          } else {
            message.error("มีบางอย่างผิดพลาด !!");
          }
        } else if (configModal.mode === "edit") {
          if (
            res.data.status === "success" &&
            schShopRes.data.status === "success"
          ) {
            message.success("บันทึกสำเร็จ");
            setIsModalVisible(() => !isModalVisible);
            setOnDisabledProductIdChange(() => false);
            // setMode("add")
            setConfigModal({ ...configModal, mode: "add" });
            form.resetFields();

            getDataSearch({
              page: configTable.page,
              search: modelSearch.search,
              status: modelSearch.status,
            });
          } else {
            message.error("มีบางอย่างผิดพลาด !!");
          }
        }
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด !!");
      console.log("error", error);
    }
  };

  const onFinishFailed = (error) => {
    message.warn("กรอกข้อมูลให้ครบถ้วน !!");
  };

  /* master */
  // const [productTypeList, setProductTypeList] = useState([]);
  // const [productBrandList, setProductBrandList] = useState([]);
  // const [productModelTypeList, setProductModelTypeList] = useState([]);
  // const [productModelTypeListSearchTable, setProductModelTypeListSearchTable] =
  //   useState([]);
  // const [productCompleteSize, setProductCompleteSizeList] = useState([]);
  // const [shopProductAllList, setShopProductAllList] = useState([]);

  // const [resultSearchData, setResultSearchData] = useState([]);
  const [ProductAllList, setProductAllList] = useState([]);
  const [onDisabledProductIdChange, setOnDisabledProductIdChange] =
    useState(false);
  const [checkSkuDisable, setCheckSkuDisable] = useState(false);

  const getMasterData = async () => {
    try {

    } catch (error) { }
  };

  const getproductPurchaseUnitTypesDataListAll = async () => {
    const { data } = await API.get(`/master/productPurchaseUnitTypes/all?sort=code_id&order=asc&status=active`)
    // console.log('data.data getproductPurchaseUnitTypesDataListAll', data.data)
    return data.status === "success" ? data.data ?? [] : []
  }

  /* เรียกข้อมูล กลุ่มสินค้า ทั้งหมด */
  const getProductTypeGroupAll = async () => {
    const { data } = await API.get(
      `/productTypeGroup/all?sort=code_id&order=asc`
    );
    return data.status === "success" ? data.data.data ?? [] : [];
  };

  const onFinishError = (error) => {
    console.log(`error`, error);
  };

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
      column: {
        created_by: false,
        created_date: false,
        updated_by: false,
        updated_date: false,
        status: true,
      },
    },
    configSort: {
      sort: "master_path_code_id",
      order: "ascend",
    },
    modelSearch: {
      search: "",
      status: "active",
      type_group_id: null,
      product_type_id: null,
      product_brand_id: null,
      product_model_id: null,
      tags_id: []
    },
  };

  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable);

  /** Config เรียงลำดับ ของ ตาราง */
  const [configSort, setConfigSort] = useState(init.configSort);

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch);

  useEffect(() => {
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      status: modelSearch.status,
      type_group_id: modelSearch.type_group_id,
      product_type_id: modelSearch.product_type_id,
      product_brand_id: modelSearch.product_brand_id,
      product_model_id: modelSearch.product_model_id,
      tags_id: modelSearch.tags_id
    });
    getFilterDataSearch();
    getMasterData();
  }, []);

  const getFilterDataSearch = async () => {
    try {
      const { data } = await API.get(`/shopProducts/filter/categories`);
      if (isPlainObject(data) && !isEmpty(data)) {
        const { productTypeLists, productBrandLists, productModelLists } = data;
        setFilterProductTypes(() => productTypeLists);
        setFilterProductBrands(() => productBrandLists);
        setFilterProductModelTypes(() => productModelLists);
      }
      data = await API.get(`/shopTags/all?limit=99999&page=1&sort=run_no&order=desc&status=default`);
      let tagList = data.data.data.data
      if (isArray(tagList)) {
        setTags(() => tagList);
      }
    } catch (error) { }
  };

  useEffect(() => {
    if (permission_obj) setColumnsTable();
  }, [configTable.page, configSort.order, permission_obj]);

  const [oldTypeGroupId, setOldTypeGroupId] = useState(null);
  const [oldProductTypeId, setOldProductTypeId] = useState(null);
  const [oldBrandId, setOldBrandId] = useState(null);
  const [oldProductModel, setOldProductModelId] = useState(null);
  const [filterProductTypes, setFilterProductTypes] = useState([]);
  const [filterProductBrands, setFilterProductBrands] = useState([]);
  const [filterProductModelTypes, setFilterProductModelTypes] = useState([]);
  const [filterTags, setTags] = useState([]);
  /** กดปุ่มค้นหา */
  const onFinishSearch = async (value) => {
    try {
      console.log("val", value)
      const {
        type_group_id,
        product_type_id,
        product_brand_id,
        product_model_id,
        tags_id
      } = value;
      setOldTypeGroupId(() => type_group_id);
      setOldProductTypeId(() => product_type_id);
      setOldBrandId(() => product_brand_id);
      setOldProductModelId(() => product_model_id);

      // if (value.product_brand_id !== oldBrandId) {
      //   console.log("p")
      //   const { data } = await API.get(`/shopProducts/filter/categories?${value.type_group_id ? `product_group_id=${value.type_group_id}` : ""}${value.product_type_id ? `&product_type_id=${value.product_type_id}` : ""}${value.product_brand_id ? `&product_brand_id=${value.product_brand_id}` : ""}${value.product_model_id ? `&product_model_id=${value.product_model_id}` : ""}`)
      //   product_model_id = null
      //   setFilterProductModelTypes(data.productModelLists)
      // }
      // console.log("product_model_id", value.product_model_id)
      // if (value.product_model_id !== oldProductModel) {
      //   if (product_brand_id !== null) {
      //     console.log("A", filterProductModelTypes)
      //     console.log("filterProductModelTypes", filterProductModelTypes.find(x => x.id === value.product_model_id))
      //     product_brand_id = null
      //     product_brand_id = filterProductModelTypes.find(x => x.id === value.product_model_id).product_brand_id
      //     // const { data } = await API.get(`/shopProducts/filter/categories?${type_group_id ? `product_group_id=${type_group_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)
      //     // setFilterProductModelTypes(data.productModelLists)
      //   } else {
      //     console.log("B", filterProductModelTypes)
      //     product_brand_id = filterProductModelTypes.find(x => x.id === product_model_id).product_brand_id
      //   }
      // } else {
      //   console.log("C", filterProductModelTypes)
      //   product_brand_id = filterProductModelTypes.find(x => x.id === product_model_id).product_brand_id
      // }
      // console.log("ProductTypeGroupAllList", ProductTypeGroupAllList)
      // console.log("filterProductTypes", filterProductTypes)
      // console.log("filterProductBrands", filterProductBrands)
      // console.log("filterProductModelTypes", filterProductModelTypes)
      // if (type_group_id !== oldTypeGroupId)
      //   (product_type_id = null),
      //     (product_brand_id = null),
      //     (product_model_id = null);
      // const { data } = await API.get(`/shopProducts/filter/categories?${type_group_id ? `product_group_id=${type_group_id}` : ""}${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""}${product_model_id ? `&product_model_id=${product_model_id}` : ""}`)

      // if (
      //   type_group_id !== oldTypeGroupId ||
      //   product_type_id !== oldProductTypeId ||
      //   product_brand_id !== oldBrandId ||
      //   product_model_id !== oldProductModel
      // ) {
      //   const { data } = await API.get(
      //     `/shopProducts/filter/categories?${type_group_id ? `product_group_id=${type_group_id}` : ""
      //     }${product_type_id ? `&product_type_id=${product_type_id}` : ""}${product_brand_id ? `&product_brand_id=${product_brand_id}` : ""
      //     }${product_model_id ? `&product_model_id=${product_model_id}` : ""}`
      //   );
      //   if (isPlainObject(data) && !isEmpty(data)) {
      //     const {
      //       productGroupLists,
      //       productTypeLists,
      //       productBrandLists,
      //       productModelLists,
      //     } = data;
      //     if (productGroupLists?.length === 1)
      //       type_group_id = productGroupLists?.[0]?.id ?? null;
      //     if (productTypeLists?.length === 1)
      //       product_type_id = productTypeLists?.[0]?.id ?? null;
      //     if (productBrandLists?.length === 1)
      //       product_brand_id = productBrandLists?.[0]?.id ?? null;
      //     if (productModelLists?.length === 1)
      //       product_model_id = productModelLists?.[0]?.id ?? null;

      //     setFilterProductTypes(() => productTypeLists);
      //     setFilterProductBrands(() => productBrandLists);
      //     setFilterProductModelTypes(() => productModelLists);
      //   } else {
      //     onReset();
      //     Swal.fire("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!", "", "error");
      //   }
      // }

      const searchModel = {
        ...modelSearch,
        search: value.search,
        status: value.status !== "undefined" ? value.status : "active",
        filter_balance: value.filter_balance,
        type_group_id,
        product_type_id,
        product_brand_id,
        product_model_id,
        tags_id
      };
      setModelSearch(searchModel);

      getDataSearch({
        search: value.search,
        page: init.configTable.page,
        filter_balance: value.filter_balance,
        type_group_id,
        product_type_id,
        product_brand_id,
        product_model_id,
        tags_id,
      });

    } catch (error) {
      console.log("error", error)
    }
    // console.log('value onFinishSearch form page', value)
  };

  const onClearFilterSearch = (type) => {
    try {
      const searchModel = {
        ...modelSearch,
      };

      switch (type) {
        case "type_group_id":
          searchModel[type] = null;
          searchModel.product_type_id = null;
          searchModel.product_brand_id = null;
          searchModel.product_model_id = null;
          break;
        case "product_type_id":
          searchModel[type] = null;
          searchModel.product_brand_id = null;
          searchModel.product_model_id = null;
          break;
        case "product_brand_id":
          searchModel[type] = null;
          searchModel.product_model_id = null;
          break;
        case "product_model_id":
          searchModel[type] = null;
          break;
        case "tags_id":
          searchModel[type] = [];
          break;

        default:
          break;
      }
      setModelSearch((previousValue) => searchModel);
    } catch (error) { }
  };

  /** กดปุ่มค่าเริ่มต้น */
  const onReset = async () => {
    setConfigTable(() => init.configTable);
    setConfigSort(() => init.configSort);
    setModelSearch(() => init.modelSearch);
    setOldTypeGroupId(() => null);
    const { data } = await API.get(`/shopProducts/filter/categories`);
    if (isPlainObject(data) && !isEmpty(data)) {
      const { productTypeLists, productBrandLists, productModelLists } = data;
      setFilterProductTypes(() => productTypeLists);
      setFilterProductBrands(() => productBrandLists);
      setFilterProductModelTypes(() => productModelLists);
    }

    getDataSearch({
      search: init.modelSearch.search ?? "",
      _status: init.modelSearch.status,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: init.configSort.order === "descend" ? "desc" : "asc",
      type_group_id: init.modelSearch.type_group_id,
      product_type_id: init.modelSearch.product_type_id,
      product_brand_id: init.modelSearch.product_brand_id,
      product_model_id: init.modelSearch.product_model_id,
      tags_id: init.modelSearch.tags_id,
    });
  };

  const exportExcel = async () => {
    try {
      setLoading(true)
      const { search } = modelSearch
      const res = await API.get(`/shopProducts/all?limit=99999&page=1&search=${search}&export_format=xlsx`)
      if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
      else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
      setLoading(false)
    } catch (error) {
      console.log("exportExcel", error)
    }
  }

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
        label: "ค้นหา",
        placeholder: "ค้นหา",
        list: null,
      },

      {
        index: 1,
        type: "select",
        name: "type_group_id",
        label: "เลือกกลุ่มสินค้า",
        placeholder: "เลือกกลุ่มสินค้า",
        allowClear: true,
        showSearch: true,
        list:
          ProductTypeGroupAllList.length > 0
            ? ProductTypeGroupAllList.map((e) => ({
              key: e.group_type_name[`${locale.locale}`],
              value: e.id,
            }))
            : [
              {
                key: "ไม่พบข้อมูล",
                value: "-",
              },
            ],
      },
      {
        index: 1,
        type: "select",
        name: "product_type_id",
        label: "เลือกประเภทสินค้า",
        placeholder: "เลือกประเภทสินค้า",
        allowClear: true,
        showSearch: true,
        list:
          filterProductTypes.length > 0
            ? filterProductTypes.map((e) => ({
              key: e.type_name[`${locale.locale}`],
              value: e.id,
            }))
            : [
              {
                key: "ไม่พบข้อมูล",
                value: "",
              },
            ],
        // list: productTypeList.length > 0 ? productTypeList.map((e)=>({
        //     key: e.type_name[`${locale.locale}`],
        //     value: e.id
        // })) : [
        //     {
        //         key: "ไม่พบข้อมูล",
        //         value : "-"
        //     }
        // ],
      },
      {
        index: 1,
        type: "select",
        name: "product_brand_id",
        label: "เลือกยี่ห้อสินค้า",
        placeholder: "เลือกยี่ห้อสินค้า",
        allowClear: true,
        showSearch: true,
        list:
          filterProductBrands.length > 0
            ? filterProductBrands.map((e) => ({
              key: e.brand_name[`${locale.locale}`],
              value: e.id,
            }))
            : [
              {
                key: "ไม่พบข้อมูล",
                value: "",
              },
            ],
        // list: productBrandList.length > 0 ? productBrandList.map((e)=>({
        //     key: e.brand_name[`${locale.locale}`],
        //     value: e.id
        // })) : [
        //     {
        //         key: "ไม่พบข้อมูล",
        //         value : "-"
        //     }
        // ],
      },
      {
        index: 1,
        type: "select",
        name: "product_model_id",
        label: "เลือกรุ่นสินค้า",
        placeholder: "เลือกรุ่นสินค้า",
        allowClear: true,
        showSearch: true,
        list:
          filterProductModelTypes.length > 0
            ? filterProductModelTypes.map((e) => ({
              key: e.model_name[`${locale.locale}`],
              value: e.id,
            }))
            : [
              {
                key: "ไม่พบข้อมูล",
                value: "",
              },
            ],
        // list: productModelTypeListSearchTable.length > 0 ? productModelTypeListSearchTable.map((e)=>({
        //     key: e.model_name[`${locale.locale}`],
        //     value: e.id
        // })) : [
        //     {
        //         key: "ไม่พบข้อมูล",
        //         value : "-"
        //     }
        // ],
      },
      {
        index: 1,
        type: "select",
        name: "tags_id",
        label: "เลือกแท็ก",
        placeholder: "เลือกแท็ก",
        allowClear: true,
        showSearch: true,
        mode: "multiple",
        list:
          filterTags.length > 0
            ? filterTags.map((e) => ({
              key: e.tag_name[`${locale.locale}`],
              value: e.id,
            }))
            : [
              {
                key: "ไม่พบข้อมูล",
                value: "",
              },
            ],
      },
      {
        index: 1,
        type: "select",
        name: "status",
        label: "เลือกสถานะ",
        placeholder: "เลือกสถานะ",
        list: [
          {
            key: "ค่าเริ่มต้น",
            value: "default",
          },
          {
            key: "สถานะปกติ",
            value: "active",
          },
          {
            key: "สถานะยกเลิก",
            value: "block",
          },
          {
            key: "ถังขยะ",
            value: "delete",
          },
        ],
      },
    ],
    col: 8,
    button: {
      // download: status === 'management' ? false : true,
      // import: status === 'management' ? false : true,
      download: false,
      import: false,
      export: true,
    },
    onFinishSearch,
    onFinishError,
    onReset,
    downloadTemplate,
    importExcel,
    onClearFilterSearch,
    exportExcel
  };

  const initProductTypeGroup = async (form) => {
    try {
      if (form) {
        const ProductTypeGroup = await getProductTypeGroupAll();
        setProductTypeGroupAll(ProductTypeGroup);

        // const formValue = form.getFieldsValue();
        // if (formValue[product_type_group_id]) {
        //   const ProductTypeList = await getProductTypeListAll(
        //     formValue[product_type_group_id]
        //   );
        //   setProductTypeList(ProductTypeList);
        // }
      }
    } catch (error) { }
  };

  const getCheckOkAndCancle = (value) => {
    setCheckedOkAndCancle(value);
  };

  const switchTireStatus = (value, type) => {
    switch (type) {
      case "oe_tire":
        setCheckedOeTire(value);
        break;
      case "runflat_tire":
        setCheckedRunFlatTire(value);
        break;
      case "others_tire_detail":
        setCheckedOtherTrieDetail(value);
        break;

      default:
        setCheckedOeTire(false);
        setCheckedRunFlatTire(false);
        setCheckedOtherTrieDetail(false);
        break;
    }
  };
  const checkedTireStatus = {
    oe_tire_status_checked: checkedOeTire,
    runflat_tire_checked: checkedRunFlatTire,
    others_tire_detail_checked: checkedOtherTireDetail,
  };

  const [isInventoryModalVisible, setIsInventoryModalVisible] = useState(false);

  const handleInventoryButtonClick = async () => {
    setLoading(() => true)
    const { product_type_group_id, product_type_id, product_brand_id, product_model_id, product_name } = form.getFieldValue()
    // const { data } = await API.get(
    //   `/shopReports/inventoryMovements/v2?limit=10&page=1&product_id=${idEdit}`
    // );
    const { data } = await API.get(
      `/shopStock/all?search=${product_name[locale.locale]
      }&limit=10&page=1&sort=balance_date&order=asc&status=active${!!product_type_group_id ? `&type_group_id=${product_type_group_id}` : ""
      }${!!product_type_id ? `&product_type_id=${product_type_id}` : ""}${!!product_brand_id ? `&product_brand_id=${product_brand_id}` : ""
      }${!!product_model_id ? `&product_model_id=${product_model_id}` : ""
      }&filter_wyz_code=false&filter_available_balance=false`
    );

    if (data.status === "success" && isArray(data.data.data) && data.data.data.length > 0) {
      const initData = {
        product_list: []
      }
      const productId_list = []
      productId_list.push(data.data.data[0].ShopProduct)
      const newWarehouse_detail = data.data.data[0].warehouse_detail.filter(where => where.shelf.balance != 0)

      initData.product_list.push({
        product_id: data.data.data[0].ShopProduct.id, product_name: null, amount_all: data.data.data[0].balance, total_price: null,
        warehouse_detail: newWarehouse_detail.map((e, index) => {
          return { warehouse: e.warehouse, shelf: e.shelf.item, dot_mfd: e.shelf.dot_mfd, amount: e.shelf.balance, purchase_unit_id: e.shelf.purchase_unit_id }
        }),
        ProductTypeGroupId: data.data.data[0].ShopProduct.Product.ProductType.type_group_id,
        productId_list: productId_list,
        unit_list: await getproductPurchaseUnitTypesDataListAll()
      })
      formImportDoc.setFieldsValue(initData)
    }
    setLoading(() => false)
    setIsInventoryModalVisible(() => true);
  };

  const handleInventoryModalCancel = () => {
    setIsInventoryModalVisible(false);
    formImportDoc.resetFields()
  };

  /**
 * ควบคุมการเปิด ปิด modal การเคลื่อนไหวสินค้า
 */
  const [visibleMovementModal, setVisibleMovementModal] = useState(false);
  const [fliterEachMovement, setFliterEachMovement] = useState({});

  const visibleEachWarehouseMovementModal = (index1, index2) => {
    try {
      const { product_list } = formImportDoc.getFieldValue();
      setVisibleMovementModal((prevValue) => true);
      setFliterEachMovement(
        (prevValue) => product_list[index1]?.warehouse_detail[index2]
      );
    } catch (error) { }
  };

  const exportPrice = async (type) => {
    try {
      setLoading(true)
      const { search } = modelSearch
      let res
      switch (type) {
        case "price_base":
          res = await API.get(`/shopProducts/priceBaseReport?limit=99999&page=1&search=${search}&export_format=xlsx`)
          break;
        case "price_arr":
          res = await API.get(`/shopProducts/priceArrReport?limit=99999&page=1&search=${search}&export_format=xlsx`)
          break;
        case "price_dot":
          res = await API.get(`/shopProducts/priceDotReport?limit=99999&page=1&search=${search}&export_format=xlsx`)
          break;

      }
      if (res.data.status === "success") window.open(`${process.env.NEXT_PUBLIC_DIRECTORY}/assets/${res.data.data}`)
      else message.warn('มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!');
      setLoading(false)
    } catch (error) {
      console.log("exportExcel", error)
    }
  }




  const importPrice = () => {
    setIsModalImportVisible(true)
  }

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const handleImportPriceOpen = (type) => {
    setEditPriceType(type)
    setIsModalImportPriceVisible(true)
  }

  const handleImportPriceCancel = () => {
    setIsModalImportPriceVisible(false)
    setFileImportPriceList([])
    setFileImportPrice(null)
  }

  const handleImportPriceOk = async () => {
    try {
      if (fileImportPrice) {
        setLoading(true)
        const formData = new FormData();
        formData.append("file", fileImportPrice.originFileObj);
        let res
        switch (editPriceType) {
          case "price_base":
            res = await axios({
              method: "post",
              url: `${process.env.NEXT_PUBLIC_SERVICE}/shopProducts/addPriceBaseByFile`,
              config: { headers: { "Content-Type": "multipart/form-data" } },
              headers: { Authorization: "Bearer " + token },
              data: formData,
            });
            break;
          case "price_arr":
            res = await axios({
              method: "post",
              url: `${process.env.NEXT_PUBLIC_SERVICE}/shopProducts/addPriceArrByFile`,
              config: { headers: { "Content-Type": "multipart/form-data" } },
              headers: { Authorization: "Bearer " + token },
              data: formData,
            });
            break;
          case "price_dot":
            res = await axios({
              method: "post",
              url: `${process.env.NEXT_PUBLIC_SERVICE}/shopProducts/addPriceDotByFile`,
              config: { headers: { "Content-Type": "multipart/form-data" } },
              headers: { Authorization: "Bearer " + token },
              data: formData,
            });
            break;

        }
        // const { data } = await axios({
        //   method: "post",
        //   url: `${process.env.NEXT_PUBLIC_SERVICE}/shopProducts/addPriceDotByFile`,
        //   config: { headers: { "Content-Type": "multipart/form-data" } },
        //   headers: { Authorization: "Bearer " + token },
        //   data: formData,
        // });

        if (res.data.status == "success") {
          message.success("บันทึกสำเร็จ")
          setFileImportPriceList([])
          setFileImportPrice(null)
          setIsModalImportPriceVisible(false)
          getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            _status: modelSearch.status,
          })
          setLoading(false)
        } else {
          setLoading(true)
          message.error('มีบางอย่างผิดพลาด !!');
          setUrlImportPriceErrorFile(process.env.NEXT_PUBLIC_DIRECTORY + res.data.data.filePath)
          setLoading(false)
        }

      } else {
        message.warning("กรุณาเลือกไฟล์")
      }
    } catch (error) {
      console.log("error Import", error)
      message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
    }
  }

  const handleImportPriceChange = (info) => {
    setUrlImportPriceErrorFile("")
    let fileList = [...info.fileList];
    // 1. Limit the number of uploaded files
    // Only to show two recent uploaded files, and old ones will be replaced by the new
    fileList = fileList.slice(-1);

    if (fileList.length > 0) {
      const infoFileList = fileList[0];
      if (infoFileList.status === "done") {
        fileList = fileList.map((file) => {
          if (file.response) {
            // console.log(`file`, file)
          }
          return file;
        });
      }
    }

    // console.log('fileList :>> ', fileList);
    setFileImportPriceList(fileList);
    if (fileList.length > 0) setFileImportPrice(fileList[0]);
    else {
      setFileImportPrice(null);
      // setFileType(null);
    }
  };

  /* Download File Error */
  const downloadFileError = () => {
    window.open(urlImportErrorFile, '_blank');
  }

  const handleOpenPriceModal = () => {
    setIsModalPriceVisible(true)
  }

  const handleCancelPriceModal = () => {
    setIsModalPriceVisible(false)
  }

  const handleOpenSalesHistoryDataModal = () => {
    setShowModalSalesHistoryData(true)
  }

  const handleCancelSalesHistoryDataModal = () => {
    setShowModalSalesHistoryData(false)
  }

  return (

    <>
      <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>

      <SearchInput
        configSearch={configSearch}
        configModal={configModal}
        loading={loading}
        onAdd={() => addEditViewModal("add")}
        value={modelSearch}
        title={title !== null ? false : true}
      />
      <Row gutter={16} justify={"end"} style={{ paddingBottom: "8px" }}>
        <Col style={{ textAlign: "end" }}>
          <Button onClick={() => handleOpenPriceModal()}>Import/Export ราคา</Button>
        </Col>
      </Row>

      <TableList
        columns={columns}
        data={listSearchDataTable}
        loading={loading}
        configTable={configTable}
        callbackSearch={getDataSearch}
        addEditViewModal={addEditViewModal}
        changeStatus={changeStatus}
      />

      {/* Modal Form */}
      <ModalFullScreen
        maskClosable={false}
        title={`${configModal.mode == "view"
          ? `ดูข้อมูล รหัสสินค้า ${configModal.headName}`
          : configModal.mode == "edit"
            ? `แก้ไขข้อมูล รหัสสินค้า ${configModal.headName}`
            : "เพิ่มข้อมูล"
          } `}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{ disabled: configModal.mode == "view" }}
        CustomsButton={() => {
          return (
            <div>
              <span className="pr-3">
                <Button
                  loading={loading}
                  onClick={handleCancel}
                  style={{ width: 100 }}
                >
                  {GetIntlMessages("ปิด")}
                </Button>
              </span>

              {configModal.mode === "view" ? null
                :
                <span className="pr-3">
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleOk}
                    style={{ width: 100 }}
                  >
                    {GetIntlMessages("บันทึก")}
                  </Button>
                </span>
              }

              {configModal.mode !== "add" ? (
                <span className="pr-3">
                  <Button
                    type="secondary"
                    loading={loading}
                    onClick={handleInventoryButtonClick}
                    style={{ width: 120 }}
                    icon={<ContainerOutlined style={{ fontSize: 16 }} />}
                  >
                    {GetIntlMessages("คลังสินค้า")}
                  </Button>
                </span>
              ) : null}
            </div>
          );
        }}
        footer={(
          <>
            <Button type="link" hidden={configModal.mode === "add"} onClick={() => handleOpenSalesHistoryDataModal()} icon={<TableOutlined />}>ประวัติการขาย</Button>
            <Button onClick={() => handleCancel()}>{GetIntlMessages("กลับ")}</Button>
            <Button hidden={configModal.mode === "view"} type="primary" loading={loading} onClick={() => handleOk()}>{GetIntlMessages("บันทึก")}</Button>
          </>
        )}
      >
        <Form
          form={form}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <ProductModal
            form={form}
            mode={configModal.mode}
            checkedOkAndCancle={checkedOkAndCancle}
            status={`productShop`}
            checkedIsuse={checkedIsuse}
            getCheckOkAndCancle={getCheckOkAndCancle}
            switchTireStatus={switchTireStatus}
            checkedTireStatus={checkedTireStatus}
          />
        </Form>
      </ModalFullScreen>

      <Modal
        maskClosable={false}
        title={`Import`}
        visible={isModalImportVisible}
        onOk={handleImportOk}
        onCancel={handleImportCancel}
      >
        <Form.Item label="Import Excel">
          <Upload
            onChange={handleImportChange}
            action={`${process.env.NEXT_PUBLIC_APIURL}/post`}
            fileList={fileImportList}
            multiple={false}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          >
            <Button icon={<UploadOutlined />}>Upload</Button>
          </Upload>
        </Form.Item>
      </Modal>

      <ModalFullScreen
        maskClosable={false}
        title={`${configModal.mode == "view"
          ? "ดูข้อมูล"
          : configModal.mode == "edit"
            ? "แก้ไขข้อมูล"
            : "เพิ่มข้อมูล"
          } รหัสสินค้า ${configModal.headName}`}
        visible={isInventoryModalVisible}
        CustomsButton={() => {
          return (
            <>
              <div>
                <span className='pr-3'>
                  <Button loading={loading} onClick={handleInventoryModalCancel} style={{ width: 100 }}>{GetIntlMessages("ปิด")}</Button>
                </span>
                {
                  configModal.mode !== "add" && isArray(formImportDoc.getFieldValue()?.product_list) && formImportDoc.getFieldValue()?.product_list.length > 0 ?
                    <span className='pr-3'>
                      <Button icon={<TableOutlined style={{ fontSize: 20 }} />} loading={loading} onClick={() => setVisibleMovementModal(() => true)} style={{ width: "100" }}>{GetIntlMessages("การเคลื่อนไหวของสินค้า")}</Button>
                    </span>
                    : null
                }

              </div>
              <div>

              </div>
            </>


          )
        }}
      >
        <Form
          form={formImportDoc}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          layout="horizontal"
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        >
          <ImportDocAddEditViewModal pageId={"a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0"} form={formImportDoc} mode={"view"} visibleEachWarehouseMovementModal={visibleEachWarehouseMovementModal} />

        </Form>
      </ModalFullScreen>

      <ProductMovement
        mode={"view"}
        visibleMovementModal={visibleMovementModal}
        setVisibleMovementModal={setVisibleMovementModal}
        loading={loading}
        setLoading={setLoading}
        productData={formImportDoc.getFieldValue()?.product_list}
        fliterEachMovement={fliterEachMovement}
        setFliterEachMovement={setFliterEachMovement}
      />

      <Modal
        width={850}
        maskClosable={false}
        title={`นำเข้าข้อมูล`}
        open={isModalImportPriceVisible} onOk={handleImportPriceOk} onCancel={handleImportPriceCancel}
        okButtonProps={{ loading: loading }}
        bodyStyle={{
          maxHeight: "80vh",
          overflowX: "auto",
        }}
      >
        <Row style={{ textAlign: "center" }}>
          <Col xs={24}>
            <div style={{ padding: "0 0 8px 0" }}>เลือกไฟล์</div>
            <Upload
              onChange={handleImportPriceChange}
              customRequest={dummyRequest}
              fileList={fileImportPriceList}
              multiple={false}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
            <div
              hidden={urlImportPriceErrorFile === ""}
              style={{
                padding: "16px 0px",
                margin: "16px 0 0 0",
                color: "red",
                border: "1px solid red",
                borderRadius: "10px"
              }}>
              <div style={{ padding: "0 0 8px 0" }} hidden={urlImportPriceErrorFile === ""}>
                เกิดข้อผิดพลาด ดาวน์โหลดไฟล์เพื่อตรวจสอบ
              </div>
              <Button hidden={urlImportPriceErrorFile === ""} icon={<DownloadOutlined />} onClick={downloadFileError}>Download</Button>
            </div>
          </Col>
          <Col md={12} xs={24}>

          </Col>
        </Row>
      </Modal >


      <Modal
        maskClosable={false}
        // title={`ข้อมูลรถยนต์`}
        open={isModalPriceVisible}
        onCancel={() => handleCancelPriceModal()}
        width="50vw"
        footer={(
          <>
            <Button onClick={() => handleCancelPriceModal()}>{GetIntlMessages("กลับ")}</Button>
          </>
        )}
      >
        <Row gutter={8}>
          <Col md={8} xl={8}>
            <Fieldset legend="ราคาพื้นฐาน">
              <Row gutter={20}>
                <Col span={12}>
                  <Button onClick={() => exportPrice("price_base")} ><ExportOutlined />Export</Button>
                </Col>
                <Col span={12}>
                  <Button onClick={() => handleImportPriceOpen("price_base")} ><ImportOutlined />Import</Button>
                </Col>
              </Row>
            </Fieldset>
          </Col>
          <Col span={8}>
            <Fieldset legend="ร่องราคา">
              <Row gutter={20}>
                <Col span={12}>
                  <Button onClick={() => exportPrice("price_arr")}><ExportOutlined />Export </Button>
                </Col>
                <Col span={12}>
                  <Button onClick={() => handleImportPriceOpen("price_arr")}><ImportOutlined />Import</Button>
                </Col>
              </Row>
            </Fieldset>
          </Col>
          <Col span={8}>
            <Fieldset legend="ราคาราย DOT">
              <Row gutter={20}>
                <Col span={12}>
                  <Button onClick={() => exportPrice("price_dot")}><ExportOutlined />Export</Button>
                </Col>
                <Col span={12}>
                  <Button onClick={() => handleImportPriceOpen("price_dot")}><ImportOutlined />Import</Button>
                </Col>
              </Row>
            </Fieldset>
          </Col>
        </Row>
      </Modal>

      <Modal
        maskClosable={false}
        // title={`ข้อมูลรถยนต์`}
        open={showModalSalesHistoryData}
        onCancel={() => handleCancelSalesHistoryDataModal()}
        style={{ top: 5 }}
        width="90vw"
        footer={(
          <>
            <Button onClick={() => handleCancelSalesHistoryDataModal()}>{GetIntlMessages("กลับ")}</Button>
          </>
        )}
      >
        <ReportSalesOut title="ประวัติการขาย" parent_search_id={idEdit} parent_page={"shop_product"} />
      </Modal>
      <style global>{`
               
                .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }
                .dynamic-delete-button {
                    position: relative;
                    top: 4px;
                    margin: 0 8px;
                    color: #999;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                  }
                  .dynamic-delete-button:hover {
                    color: #777;
                  }
                  .dynamic-delete-button[disabled] {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }

            `}</style>
    </>
  );
};

export default ComponentsRoutesProducts;
