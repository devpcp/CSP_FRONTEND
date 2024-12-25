import { useEffect, useState } from "react";
import {
  message,
  Input,
  Modal,
  Select,
  Form,
  Switch,
  Divider,
  Space,
  DatePicker,
  Typography
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import API from "../../../util/Api";
import { useSelector } from "react-redux";
import SearchInput from "../../../components/shares/SearchInput";
import TableList from "../../../components/shares/TableList";
import SortingData from "../../../components/shares/SortingData";
import { get, isPlainObject, isArray, debounce, isFunction } from "lodash";
import isUUID from "is-uuid";
import GetIntlMessages from "../../../util/GetIntlMessages";
import ModalBusinessCustomers from "../../../components/Routes/Modal/Components.Select.Modal.BusinessCustomers";
import ModalPersonalCustomers from "../../../components/Routes/Modal/Components.Select.Modal.PersonalCustomers";
import FormProvinceDistrictSubdistrict from "../../../components/shares/FormProvinceDistrictSubdistrict";
import moment, { isMoment } from "moment";
import Swal from "sweetalert2";
import { useRouter } from "next/router";

const { Text, Link } = Typography;

export const validateNumberandEn = "^[a-zA-Z0-9_.-]*$";
export const validateNumber = "^[0-9]*$";
export const dateFormat = "DD/MM/YYYY";


const ComponentRoutesVehicleTable = ({ cus_id, cus_type, cus_data, title = null, callBack }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingGetCustomer, setLoadingGetCustomer] = useState(false);

  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { vehicleColors } = useSelector(({ master }) => master);

  const { locale } = useSelector(({ settings }) => settings);
  const [open, setOpen] = useState(false);
  const [optFields, setFields] = useState({
    required: false,
    disabled: false,
  });
  const { search } = router.query

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
      sort: `code_id`,
      order: "ascend",
    },
    modelSearch: {
      search: "",
      status: "active",
    },
  };

  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable);

  /** Config เรียงลำดับ ของ ตาราง */
  const [configSort, setConfigSort] = useState(init.configSort);

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch);

  const setColumnsTable = () => {
    const _column = [
      {
        title: () => GetIntlMessages("order"),
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
        title: () => GetIntlMessages("registration"),
        dataIndex: "details",
        key: "details",
        width: 150,
        align: "center",
        render: (text, record) => {
          if (isFunction(callBack)) {
            return (
              <Link href="#" onClick={() => callBack(record)}>
                {text["registration"]}
              </Link>
            )
          } else {
            return (
              <Text>{text["registration"]}</Text>
            )
          }
        },
      },
      {
        title: () => GetIntlMessages("customer"),
        dataIndex: "custome",
        key: "custome",
        width: 200,
        render: (text, record) => {
          try {
            let value = "-";
            if (isPlainObject(record.ShopPersonalCustomer)) {
              const { first_name, last_name } =
                record.ShopPersonalCustomer.customer_name;
              value = `${first_name[locale.locale] ?? "-"} ${last_name[locale.locale] ?? "-"
                }`;
            } else if (isPlainObject(record.ShopBusinessCustomer)) {
              const { customer_name } = record.ShopBusinessCustomer;
              value = `${customer_name[locale.locale] ?? "-"}`;
            }
            return value;
          } catch (error) {
            return "-";
          }
        },
      },
      {
        title: () => GetIntlMessages("province"),
        dataIndex: "details",
        key: "details",
        width: 150,
        align: "center",
        render: (text, record) =>
          isPlainObject(text) ? text["province_name"] : "-",
      },
      {
        title: () => GetIntlMessages("brand"),
        dataIndex: "VehicleBrand",
        key: "VehicleBrand",
        width: 250,
        render: (text, record) =>
          isPlainObject(text)
            ? get(text, `brand_name.${locale.locale}`, "-")
            : "-",
      },
      {
        title: () => GetIntlMessages("color-car"),
        dataIndex: "details",
        key: "details",
        width: 100,
        align: "center",
        render: (text, record) =>
          isPlainObject(text)
            ? get(text, `vehicle_color_name.${locale.locale}`, "-")
            : "-",
      },

      {
        title: () => GetIntlMessages("mileage"),
        dataIndex: "details",
        key: "details",
        width: 150,

        render: (text, record) =>
          isPlainObject(text)
            ? text["mileage"]
              ? Number(text["mileage"]).toLocaleString()
              : "-"
            : "-",
      },
      {
        title: () => GetIntlMessages("type"),
        dataIndex: "VehicleType",
        key: "VehicleType",
        width: 250,
        render: (text, record) =>
          isPlainObject(text)
            ? get(text, `type_name.${locale.locale}`, "-")
            : "-",
      },
      // {
      //     title: () => GetIntlMessages("model"),
      //     dataIndex: 'VehicleModelType',
      //     key: 'VehicleModelType',
      //     width: 200,
      //     render: (text, record) => isPlainObject(text) ? get(text, `model_name.${locale.locale}`, "-") : "-",
      // },
    ];

    setColumns(_column);
  };

  useEffect(() => {

    if (search) {
      setModelSearch({
        search: search
      })
      getDataSearch({
        page: configTable.page,
        search: search,
        _status: modelSearch.status,
      });
    } else {
      setModelSearch
      getDataSearch({
        page: configTable.page,
        search: modelSearch.search,
        _status: modelSearch.status,
      });
    }
    // if(configModal.mode === "add") form.setFieldsValue({vehicle_type_id : "6b4df7a3-4fc9-4cc4-bd87-0b923fe686ae"})
    // getMasterData()
  }, []);

  useEffect(() => {
    if (permission_obj) setColumnsTable();
  }, [
    configTable.page,
    configSort.order,
    configSort.sort,
    permission_obj,
    locale
  ]);

  useEffect(() => {
    setConfigTable(init.configTable)
    setConfigSort(init.configSort)
    setModelSearch(init.modelSearch)
    console.log("cus_id", cus_id)
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
    });
  }, [cus_id])

  /* ค้นหา */
  const getDataSearch = async ({
    search = modelSearch.search ?? "",
    limit = configTable.limit,
    page = configTable.page,
    sort = configSort.sort,
    order = configSort.order === "descend" ? "desc" : "asc",
    _status = modelSearch.status,
  }) => {
    try {
      if (page === 1) setLoading(true);
      const res = await API.get(
        `/shopVehicleCustomer/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${cus_type === "person" ? `&per_customer_id=${cus_id}` : ""}${cus_type === "business" ? `&bus_customer_id=${cus_id}` : ""}`
      );
      if (res.data.status === "success") {
        const { currentCount, currentPage, pages, totalCount, data } =
          res.data.data;
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
        // console.log(`res.data`, res.data)
        message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!");
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
      // delete,active,block
      const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete";
      // console.log('changeStatus :>> ', status, id);
      if (isuse != 2) {
        const { data } = await API.put(`/shopVehicleCustomer/put/${id}`, {
          status,
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
      } else {
        Swal.fire({
          title: GetIntlMessages("delete-confirm"),
          text: "",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#04afe3",
          cancelButtonColor: "#d33",
          confirmButtonText: "ยืนยัน",
          cancelButtonText: "ยกเลิก",
        }).then(async (result) => {
          if (result.isConfirmed) {
            const { data } = await API.put(`/shopVehicleCustomer/put/${id}`, {
              status,
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
          }
        });
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!");
    }
  };

  /* addEditView */
  const addEditViewModal = async (mode, id) => {
    try {
      setLoading(true);
      await getMasterData();
      setConfigModal({ ...configModal, mode });

      if (cus_id) {
        const model = {}
        console.log("cus_id", cus_id)
        console.log("cus_data", cus_data)
        if (cus_type === "person") {
          const { data } = await getCustomerPerson({ search: cus_data.customer_name.first_name[locale.locale] + " " + cus_data.customer_name.last_name[locale.locale], limit: 10 });
          const new_data = data.map((e) => {
            const newData = { ...e, customer_name: {} };
            locale.list_json.forEach((x) => {
              newData.customer_name[x] = e.customer_name
                ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"
                }`
                : "";
              return newData;
            });
            return newData;
          });
          setCustomerList(new_data);
        } else
          if (cus_type === "business") {
            const { data } = await getCustomerBusiness({ search: cus_data.customer_name[locale.locale], limit: 10 });
            setCustomerList(data);
          }
        form.setFieldsValue({ customer_id: cus_id });
      }

      if (id) {
        setIsIdEdit(id);
        const { data } = await API.get(`/shopVehicleCustomer/byid/${id}`);
        if (data.status == "success") {
          // console.log('data :>> ',  data.data);
          const _model = isArray(data.data) && data.data.length > 0 ? data.data[0] : {};
          if (_model.per_customer_id) {
            const { data } = await getCustomerPerson({ search: "", limit: 1 });
            const new_data = data.map((e) => {
              const newData = { ...e, customer_name: {} };
              locale.list_json.forEach((x) => {
                newData.customer_name[x] = e.customer_name
                  ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"
                  }`
                  : "";
                return newData;
              });
              return newData;
            });
            setCustomerList(new_data);
            _model.customer_type = "person";
            _model.customer_id = _model.per_customer_id;
          } else if (_model.bus_customer_id) {
            const { data } = await getCustomerBusiness({ search: "", limit: 1 });
            setCustomerList(data);
            _model.customer_type = "business";
            _model.customer_id = _model.bus_customer_id;
          }
          _model.color = _model.details.color;
          _model.mileage = _model.details.mileage;
          _model.province_name = _model.details.province_name;
          _model.registration = _model.details.registration;
          _model.mileage_first = _model.details.mileage_first;
          _model.remark = _model.details.remark;
          _model.serial_number = _model.details.serial_number ?? "";
          _model.chassis_number = _model.details.chassis_number ?? "";
          _model.cc_engine_size = _model.details.cc_engine_size ?? "";
          _model.avg_registration_day =
            _model.details.avg_registration_day ?? "";
          _model.isuse = _model.isuse == 1 ? true : false;
          setCheckedIsuse(_model.isuse);

          // console.log(`_model`, _model)
          setVehicleModelType(
            await getVehicleModelTypeBybrandid(_model.vehicle_brand_id)
          );
          // setVehicleColorType(
          //   await getVehicleColorTypeBycolorid(_model.vehicle_color_name)
          // );

          form.setFieldsValue(_model);

          form.setFieldsValue({
            service_date_first:
              _model.details.service_date_first != ""
                ? moment(
                  new Date(_model.details.service_date_first),
                  dateFormat
                ) ?? null
                : null,
            service_date_last:
              _model.details.service_date_last != ""
                ? moment(
                  new Date(_model.details.service_date_last),
                  dateFormat
                ) ?? null
                : null,
          });
        }
      }
      if (mode === "add") {
        if (configModal.mode === "add") {
          form.setFieldsValue({
            vehicle_type_id: "6b4df7a3-4fc9-4cc4-bd87-0b923fe686ae",
            vehicle_brand_id: "240e017f-b900-4298-be95-06935bfe9511",
            vehicle_model_id: "78661798-8985-452b-b444-629e669381ef",
            customer_type: cus_type,
          });
          onChangeVehicleBrand("240e017f-b900-4298-be95-06935bfe9511", true);
        }
      }
      if (mode == "view") {
        setFields({
          disabled: true,
          required: false,
        });
      } else {
        setFields({
          disabled: false,
          required: true,
        });
      }
      setIsModalVisible(true);

      setLoading(false);
    } catch (error) {
      console.log(`error`, error);
    }
  };

  /* Modal */
  const [configModal, setConfigModal] = useState({
    mode: "add",
    maxHeight: 600,
    overflowX: "auto",
  });

  // useEffect(() => {
  //     if(configModal.mode === "add"){
  //         form.setFieldsValue({
  //             vehicle_type_id : "6b4df7a3-4fc9-4cc4-bd87-0b923fe686ae",
  //             vehicle_model_id: "78661798-8985-452b-b444-629e669381ef"
  //         })
  //         onChangeVehicleBrand("240e017f-b900-4298-be95-06935bfe9511", true)

  //     }
  // },[configModal.mode])

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idEdit, setIsIdEdit] = useState(null);
  const [checkedIsuse, setCheckedIsuse] = useState(false);
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    setConfigModal({ ...configModal, mode: "add" });
    setVehicleModelType(() => []);
    setIsModalVisible(false);
  };

  const onFinish = async (value) => {
    try {
      // console.log(`value`, value)
      setLoading(true);
      const _model = {
        details: {
          color: value.color ?? "",
          province_name: value.province_name ?? "",
          registration: value.registration ?? "",
          remark: value.remark ?? "",
          serial_number: value.serial_number ?? "",
          chassis_number: value.chassis_number ?? "",
          cc_engine_size: value.cc_engine_size ?? "",
          mileage_first: value.mileage_first ?? "",
          mileage: value.mileage ?? "",
          service_date_first: value.service_date_first ?? "",
          avg_registration_day: value.avg_registration_day ?? "",
          service_date_last: value.service_date_last ?? "",
        },
        vehicle_type_id: value.vehicle_type_id,
        vehicle_brand_id: value.vehicle_brand_id,
        vehicle_model_id: value.vehicle_model_id,
        vehicle_color_id: value.vehicle_color_id,
      };

      if (value.customer_type === "person") {
        // _model.bus_customer_id = null
        _model.per_customer_id = value.customer_id;
      }
      else if (value.customer_type === "business") {
        _model.bus_customer_id = value.customer_id;
        // _model.per_customer_id = null
      }

      // console.log('_model', _model)

      let res;
      if (configModal.mode === "add") {
        _model.master_customer_code_id = "";
        res = await API.post(`/shopVehicleCustomer/add`, _model);
      } else if (configModal.mode === "edit") {
        _model.status = checkedIsuse ? "active" : "block";
        res = await API.put(`/shopVehicleCustomer/put/${idEdit}`, _model);
      }

      if (res.data.status == "success") {
        message.success("บันทึกสำเร็จ");
        setIsModalVisible(false);

        setConfigModal({ ...configModal, mode: "add" });
        form.resetFields();
        getDataSearch({
          page: configTable.page,
          search: modelSearch.search,
        });
      } else {
        message.error("ขออภัย ข้อมูลทะเบียนรถในจังหวัดนี้มีอยู่แล้ว");
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      message.error("มีบางอย่างผิดพลาด !!");
      console.log("error :>> ", error);
    }
  };

  const onFinishFailed = (error) => {
    // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
  };

  const onFinishError = (error) => {
    console.log(`error`, error);
  };

  /** กดปุ่มค้นหา */
  const onFinishSearch = (value) => {
    setModelSearch(value);
    getDataSearch({
      search: value.search,
      _status: value.status,
      page: init.configTable.page,
    });
  };

  /** กดปุ่มค่าเริ่มต้น */
  const onReset = () => {
    setConfigTable(init.configTable);
    setConfigSort(init.configSort);
    setModelSearch(init.modelSearch);
    getDataSearch({
      search: init.modelSearch.search ?? "",
      _status: init.modelSearch.status,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: init.configSort.order === "descend" ? "desc" : "asc",
    });
  };

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
        name: "status",
        label: GetIntlMessages("select-status"),
        placeholder: GetIntlMessages("select-status"),
        list: [
          {
            key: GetIntlMessages("all-status"),
            value: "default",
          },
          {
            key: GetIntlMessages("work"),
            value: "active",
          },
          {
            key: GetIntlMessages("cancel"),
            value: "block",
          },
          {
            key: GetIntlMessages("delete-status"),
            value: "delete",
          },
        ],
      },
    ],
    col: 8,
    button: {
      download: false,
      import: false,
      export: false,
    },
    onFinishSearch,
    onFinishError,
    onReset,
  };

  /*  */
  const [customerListAll, setCustomerListAll] = useState([]); //รายชื่อลูกค้า
  const [customerList, setCustomerList] = useState([]); //รายชื่อลูกค้า
  const [vehicleType, setVehicleType] = useState([]); //ประเภท ยานพาหนะ
  const [vehicleBrand, setVehicleBrand] = useState([]); //ยี่ห้อ ยานพาหนะ
  const [vehicleModelType, setVehicleModelType] = useState([]); //รุ่น ยานพาหนะ
  const [vehicleColor, setVehicleColorType] = useState([]); //รุ่น ยานพาหนะ

  const debounceOnSearchCustomer = debounce(
    (value, type) => onChangeCustomerId(value, type),
    1000
  );
  const onChangeCustomerId = async (value, type) => {
    try {
      // console.log('value :>> ', value);
      setLoadingGetCustomer(() => true);
      const { customer_type } = form.getFieldValue();
      let res;
      if (type === "onSearch") {
        if (!!customer_type && customer_type === "business" && !!value) {
          res = await API.get(
            `/shopBusinessCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active`
          );

          if (res.data.status === "success")
            setCustomerList(() =>
              SortingData(res.data.data.data, `customer_name.${locale.locale}`)
            );
          else setCustomerList(() => []);
        } else if (!!customer_type && customer_type === "person" && !!value) {
          res = await API.get(
            `/shopPersonalCustomers/all?search=${value}&limit=50&page=1&sort=customer_name.th&order=desc&status=active`
          );
          if (res.data.status === "success") {
            const new_data = res.data.data.data.map((e) => {
              const newData = { ...e, customer_name: {} };
              locale.list_json.forEach((x) => {
                newData.customer_name[x] = e.customer_name
                  ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"
                  }`
                  : "";
                return newData;
              });
              return newData;
            });
            setCustomerList(() =>
              SortingData(new_data, `customer_name.${locale.locale}`)
            );
          } else {
            setCustomerList(() => []);
          }
        } else {
          setCustomerList(() => []);
        }
      }
      setLoadingGetCustomer(() => false);
    } catch (error) { }
    // const find = customerList.find(where => where.id === value);
    // if (isPlainObject(find)) {
    //     form.setFieldsValue({
    //         customer_type: find.customer_type
    //     })
    // }
  };

  const onChangeCustomerType = async (value) => {
    // console.log('value', value)
    /* new */
    form.setFieldsValue({
      customer_id: null,
    });
    setCustomerList(() => []);
    /* old */
    // const filter = customerListAll.filter(where => where.customer_type === value);
    // if (isArray(filter)) {
    //     form.setFieldsValue({
    //         customer_id: null
    //     })
    //     setCustomerList(filter)
    // }
  };

  const callbackModalCustomers = async (item) => {
    try {
      getMasterData();
      const { customer_type } = form.getFieldValue();
      if (customer_type) await onChangeCustomerType(customer_type);
      form.setFieldsValue({
        customer_id: item.id,
      });
    } catch (error) { }
  };

  const checkValueCustomerType = () => {
    const { customer_type } = form.getFieldValue();
    return customer_type;
  };

  const onChangeVehicleBrand = async (value, isSetDefault) => {
    try {
      const { vehicle_type_id } = form.getFieldValue();
      if (isSetDefault !== true)
        form.setFieldsValue({
          vehicle_model_id: null,
        });
      let modelTypeList = [];
      if (!!vehicle_type_id)
        modelTypeList = await getVehicleModelTypeBybrandid(
          value,
          vehicle_type_id
        );
      setVehicleModelType(() => modelTypeList);
    } catch (error) {
      console.log("error", error);
    }
  };
  const onChangeVehicleType = async (value) => {
    try {
      const { vehicle_brand_id } = form.getFieldValue();
      form.setFieldsValue({
        vehicle_model_id: null,
      });
      if (vehicle_brand_id)
        setVehicleModelType(
          await getVehicleColorTypeBycolorid(vehicle_brand_id, value)
        );
    } catch (error) {
      console.log("error", error);
    }
  };

  const onChangeVehicleColor = async (value) => {
    try {
      const { vehicle_color_id } = form.getFieldValue();
      // form.setFieldsValue({
      //   vehicle_color_id: null,
      // });
      // if (vehicle_color_id)
      //   setVehicleColorType(
      //     await getVehicleModelTypeBybrandid(vehicle_color_id, value)
      //   );
    } catch (error) {
      console.log("error", error);
    }
  };

  /* master */
  const getMasterData = async () => {
    try {
      const [value1, value2] = await Promise.all([
        getVehicleType(),
        getVehicleBrand(),
      ]);
      // const [value1, value2, value3, value4] = await Promise.all([getVehicleType(), getVehicleBrand(), getCustomerPerson(), getCustomerBusiness()])
      if (isArray(value1))
        setVehicleType(SortingData(value1, `type_name.${locale.locale}`));
      if (isArray(value2)) setVehicleBrand(value2);
      // if (isArray(value3.data) && isArray(value4.data)) {
      //     const new_data = SortingData(sumArrayPersonAndBusiness(value3.data, value4.data), `customer_name.${locale.locale}`)
      //     setCustomerList(new_data);
      //     setCustomerListAll(new_data);
      // }
    } catch (error) {
      console.log("error", error);
    }
  };

  const sumArrayPersonAndBusiness = (personList, businessList) => {
    const new_person_list = personList.map((e) => {
      const newPersonList = { ...e, customer_name: {} };
      locale.list_json.forEach((x) => {
        newPersonList.customer_name[x] = e.customer_name
          ? `${e.customer_name.first_name[x] ?? "-"} ${e.customer_name.last_name[x] ?? "-"
          }`
          : "";
        newPersonList.customer_type = "person";
        return newPersonList;
      });
      return newPersonList;
    });
    businessList.forEach((e) => (e.customer_type = "business"));
    const arr = [...new_person_list, ...businessList];
    // console.log('arr', arr)
    return arr;
  };

  /* get Master shopPersonalCustomers */
  const getCustomerPerson = async ({ search = "", limit = "99999" }) => {
    const { data } = await API.get(
      `/shopPersonalCustomers/all?limit=${limit}&page=1${search != "" ? `&search=${search}` : ""}`
    );
    return (data.status = "success" ? data.data : []);
  };

  /* get Master shopBusinessCustomers */
  const getCustomerBusiness = async ({ search = "", limit = "99999" }) => {
    const { data } = await API.get(
      `/shopBusinessCustomers/all?limit=${limit}&page=1${search != "" ? `&search=${search}` : ""}`
    );
    return (data.status = "success" ? data.data : []);
  };

  /* get Master getVehicleType (ประเภท ยานพาหนะ) */
  const getVehicleType = async () => {
    const { data } = await API.get(
      `/master/vehicleType/all?limit=0&page=0&sort=created_date&order=asc&status=active`
    );
    // const { data } = await API.get(`/master/vehicleType/all`);
    return (data.status = "success" ? data.data : []);
  };

  /* get Master getVehicleBrand (ยี่ห้อ ยานพาหนะ) */
  const getVehicleBrand = async () => {
    const { data } = await API.get(
      `/master/vehicleBrand?limit=0&page=0&sort=brand_name.th&order=asc&status=active`
    );
    // const { data } = await API.get(`/master/vehicleBrand/all`);
    return (data.status = "success" ? data.data : []);
  };

  /* get Master getVehicleModelTypeBybrandid (รุ่น ยานพาหนะ) */
  const getVehicleModelTypeBybrandid = async (
    vehicles_brand_id = "",
    vehicles_type_id = ""
  ) => {
    if (isUUID.v4(vehicles_brand_id)) {
      const { data } = await API.get(
        `/master/vehicleModelType/all?limit=99999&page=1&sort=code_id&order=asc&status=active${vehicles_brand_id ? `&vehicles_brand_id=${vehicles_brand_id}` : ""
        }${vehicles_type_id ? `&vehicles_type_id=${vehicles_type_id}` : ""}`
      );
      // const { data } = await API.get(`/master/vehicleModelType/bybrandid/${id}`);
      return data.status == "success" ? data.data.data : [];
    }
  };

  /* get Master getVehicleColor (สี ยานพาหนะ) */
  const getVehicleColor = async () => {
    const { data } = await API.get(
      `/master/vehicleColor?sort=order_by&order=desc&status=default`
    );
    return (data.status = "success" ? data.data : []);
  };

  return (
    <>
      <div id="page-manage">
        <div className="head-line-text">ข้อมูลรถยนต์</div>
        <SearchInput
          configSearch={configSearch}
          configModal={configModal}
          loading={loading}
          onAdd={() => addEditViewModal("add")}
          value={modelSearch}
          title={false}
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

        <Modal
          width={750}
          maskClosable={false}
          title={`${configModal.mode == "view"
            ? GetIntlMessages("view-data")
            : configModal.mode == "edit"
              ? GetIntlMessages("edit-data")
              : GetIntlMessages("add-data")
            } ข้อมูลทะเบียนรถ`}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ disabled: configModal.mode == "view" || loading }}
          bodyStyle={{
            maxHeight: 600,
            overflowX: "auto",
          }}
        >
          <Form
            form={form}
            initialValues={{
              vehicle_type_id: "6b4df7a3-4fc9-4cc4-bd87-0b923fe686ae",
              vehicle_brand_id: "240e017f-b900-4298-be95-06935bfe9511",
            }}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 15 }}
            layout="horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              name="customer_type"
              label={GetIntlMessages(`customer-type`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <Select
                // disabled={optFields.disabled}
                disabled
                style={{ width: "100%" }}
                onChange={onChangeCustomerType}
              >
                <Select.Option value="person">บุคคลธรรมดา</Select.Option>
                <Select.Option value="business">ธุรกิจ</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="customer_id"
              label={GetIntlMessages(`customer`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
              extra={GetIntlMessages(
                "เลือกประเภทลูกค้าที่ต้องการ และ พิมพ์อย่างน้อย 1 ตัวเพื่อหาชื่อลูกค้า"
              )}
            >
              <Select
                // disabled={optFields.disabled}
                disabled
                style={{ width: "100%" }}
                loading={loadingGetCustomer}
                showSearch
                open={open}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onDropdownVisibleChange={(visible) => setOpen(visible)}
                onChange={(value) => onChangeCustomerId(value, "onChange")}
                onSearch={(value) =>
                  debounceOnSearchCustomer(value, "onSearch")
                }
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    {checkValueCustomerType() ? (
                      <>
                        <Divider style={{ margin: "8px 0" }} />
                        <Space
                          align="center"
                          style={{ padding: "0 8px 4px" }}
                          onClick={() => setOpen(false)}
                        >
                          {checkValueCustomerType() === "business" ? (
                            <ModalBusinessCustomers
                              textButton={GetIntlMessages(`เพิ่มข้อมูล`)}
                              icon={<PlusOutlined />}
                              callback={callbackModalCustomers}
                            />
                          ) : (
                            <ModalPersonalCustomers
                              textButton={GetIntlMessages(`เพิ่มข้อมูล`)}
                              icon={<PlusOutlined />}
                              callback={callbackModalCustomers}
                            />
                          )}
                        </Space>
                      </>
                    ) : null}
                  </>
                )}
              >
                {customerList.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.customer_name[locale.locale]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="vehicle_type_id"
              label={GetIntlMessages(`vehicle-type`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <Select
                disabled={optFields.disabled}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onChange={onChangeVehicleType}
                style={{ width: "100%" }}
              >
                {vehicleType.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.type_name[locale.locale]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="vehicle_brand_id"
              label={GetIntlMessages(`brand`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <Select
                disabled={optFields.disabled}
                showSearch
                filterOption={(input, option) =>
                  option.children
                    .toLowerCase()
                    .toString()
                    .indexOf(input.toLowerCase()) >= 0
                }
                style={{ width: "100%" }}
                onChange={onChangeVehicleBrand}
              >
                {vehicleBrand.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.brand_name[locale.locale]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="vehicle_model_id"
              label={GetIntlMessages(`model`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <Select
                disabled={optFields.disabled}
                showSearch
                optionFilterProp="children"
                style={{ width: "100%" }}
              >
                {vehicleModelType.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.model_name[locale.locale]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <FormProvinceDistrictSubdistrict
              name={{ province: "province_name" }}
              form={form}
              disabled={optFields.disabled}
              hideDistrict={true}
              hideSubdistrict={true}
              hideZipCode={true}
              provinceValue="name"
              validatename={{ Province: optFields.required }}
            />
            <Form.Item
              name="registration"
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
              label={GetIntlMessages(`registration`)}
            >
              <Input
                type={"text"}
                maxLength={200}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="serial_number"
              label={GetIntlMessages(`เลขเครื่องยนต์`)}
              rules={[
                {
                  pattern: validateNumberandEn,
                  message: GetIntlMessages(`enter-your-engine-number`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={17}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="chassis_number"
              label={GetIntlMessages(`เลขตัวถัง`)}
              rules={[
                {
                  pattern: validateNumberandEn,
                  message: GetIntlMessages(`enter-your-engine-size`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={200}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="cc_engine_size"
              label={GetIntlMessages(`ขนาดเครื่องยนต์ CC`)}
              rules={[
                {
                  pattern: validateNumber,
                  message: GetIntlMessages(`enter-your-engine-size`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={200}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="color"
              label={GetIntlMessages(`color-car`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <Select
                disabled={optFields.disabled}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onChange={onChangeVehicleColor}
                style={{ width: "100%" }}
              >
                {vehicleColors.map((e) => (
                  <Select.Option key={e.id} value={e.id}>
                    {e.vehicle_color_name[locale.locale]}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="mileage_first"
              label={GetIntlMessages(`เลขไมค์ครั้งแรก`)}
              rules={[
                {
                  // required: optFields.required,
                  pattern: validateNumber,
                  message: GetIntlMessages(`only-number`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={8}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="mileage"
              label={GetIntlMessages(`เลขไมค์ครั้งล่าสุด`)}
              rules={[
                {
                  pattern: validateNumber,
                  message: GetIntlMessages(`enter-your-last-mic-number`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={8}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="service_date_first"
              label={GetIntlMessages(`วันที่เข้ามาใช้บริการครั้งแรก`)}
              rules={[
                {
                  required: optFields.required,
                  message: GetIntlMessages(
                    `fill-out-the-information-completely`
                  ),
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format={dateFormat}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="service_date_last"
              label={GetIntlMessages(`วันที่เข้ามาใช้บริการล่าสุด`)}
            >
              <DatePicker
                style={{ width: "100%" }}
                format={dateFormat}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item
              name="avg_registration_day"
              label={GetIntlMessages(`average-mic-day`)}
              rules={[
                {
                  pattern: validateNumber,
                  message: GetIntlMessages(`enter-your-average-mic-day`),
                },
              ]}
            >
              <Input
                type={"text"}
                maxLength={200}
                disabled={optFields.disabled}
              />
            </Form.Item>

            <Form.Item name="remark" label={GetIntlMessages(`remark`)}>
              <Input.TextArea
                rows={5}
                maxLength={200}
                disabled={optFields.disabled}
              />
            </Form.Item>

            {configModal.mode !== "add" ? (
              <Form.Item name="isuse" label={GetIntlMessages("status")}>
                <Switch
                  disabled={configModal.mode == "view"}
                  checked={checkedIsuse}
                  onChange={(bool) => setCheckedIsuse(bool)}
                  checkedChildren={GetIntlMessages("work")}
                  unCheckedChildren={GetIntlMessages("cancel")}
                />
              </Form.Item>
            ) : null}
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default ComponentRoutesVehicleTable;
