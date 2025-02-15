import { useEffect, useState } from "react";
import {
  Button,
  message,
  Input,
  Modal,
  Select,
  Form,
  Switch,
  Upload,
  Row,
  Col,
  Table,
  InputNumber,
  Image,
  Divider,
  Typography,
  Tabs
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  CarOutlined,
  TeamOutlined,
  SearchOutlined,
  TagsOutlined,
  FileTextOutlined,
  TableOutlined
} from "@ant-design/icons";
import API from "../../util/Api";
import { useSelector } from "react-redux";
import SearchInput from "../../components/shares/SearchInput";
import TableList from "../../components//shares/TableList";
import FormProvinceDistrictSubdistrict from "../../components/shares/FormProvinceDistrictSubdistrict";
import {
  FormInputLanguage,
  FormSelectLanguage,
} from "../../components/shares/FormLanguage";
import { get, isPlainObject, isArray, isFunction } from "lodash";
import GetIntlMessages from "../../util/GetIntlMessages";
import { MaskedInput, createDefaultMaskGenerator } from "react-hook-mask";
import { Cookies } from "react-cookie";
import axios from "axios";
import Swal from "sweetalert2";
import Fieldset from '../../components/shares/Fieldset';
import ModalFullScreen from "../../components/shares/ModalFullScreen";
import VehicleTableData from '../../components/Routes/Vehicle/Components.Routes.VehicleTable';
import MultiShipTo from '../../components/Routes/Modal/Components.Add.Modal.MultiShipTo';
import MultiContactor from '../../components/Routes/Modal/Components.Add.Modal.MultiContactor';
import EmployeeData from './EmployeeData';
import moment from 'moment'
import TextArea from 'antd/lib/input/TextArea';
import TagsData from "../../routes/Setting/TagsData"
import ReportSalesOut from "./Reports/ReportSalesOut"

const { Text, Link } = Typography;

const cookies = new Cookies();

const PersonalCustomersData = ({ title = null, callBack }) => {
  const masktel_no = createDefaultMaskGenerator("999 999 9999");
  const maskmobile_no = createDefaultMaskGenerator("999 999 9999");

  const [loading, setLoading] = useState(false);

  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon);
  const [isIdEditData, setIsIdEditData] = useState({});
  const [checkedIsMember, setCheckedIsMember] = useState(false);
  const [checkedIsForeign, setCheckedIsForeign] = useState(false);
  const [isMultiContactorModalVisible, setIsMultiContactorModalVisible] = useState(false);
  const [MultiContactorData, setMultiContactorData] = useState({});
  const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  const [lineData, setLineData] = useState(null);
  const [isLineModalVisible, setIsLineModalVisible] = useState(false);
  const [showModalTagsData, setShowModalTagsData] = useState(false);
  const [showModalSalesHistoryData, setShowModalSalesHistoryData] = useState(false);
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
      sort: `customer_name.${locale.locale}`,
      order: "ascend",
    },
    modelSearch: {
      search: "",
      status: "all",
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
        use: true,
        render: (text, record, index) => {
          index += (configTable.page - 1) * configTable.limit;
          return index + 1;
        },
      },
      {
        title: () => GetIntlMessages("code"),
        dataIndex: "master_customer_code_id",
        key: "master_customer_code_id",
        width: 150,
        use: true,
        align: "center",
        sorter: true,
        render: (text, record) => {
          if (isFunction(callBack)) {
            return (
              <Link href="#" onClick={() => callBack(record)}>
                {text}
              </Link>
            )
          } else {
            return (
              <Text>{text}</Text>
            )
          }
        },
      },

      {
        title: () => GetIntlMessages("name-surname"),
        dataIndex: "customer_name",
        key: "customer_name.th",
        width: 200,
        use: true,
        sorter: true,
        render: (text, record) =>
          `${get(record, `NameTitle.initials.${locale.locale}`, "")} ${get(
            text,
            `first_name.${locale.locale}`,
            "-"
          )} ${get(text, `last_name.${locale.locale}`, "-")}`,
      },
      {
        title: () => GetIntlMessages("tel-no"),
        dataIndex: "tel_no",
        key: "tel_no",
        width: 200,
        use: true,
        render: (text, record) => {
          if (text) {
            const arr = [];
            for (const [key, value] of Object.entries(text)) {
              if (value) arr.push(value);
            }
            return arr.length <= 0 ? "-" : arr.toString();
          } else return "-";
        },
      },
      {
        title: () => GetIntlMessages("mobile-no"),
        dataIndex: "mobile_no",
        key: "mobile_no",
        width: 200,
        use: true,
        render: (text, record) => {
          if (text) {
            const arr = [];
            for (const [key, value] of Object.entries(text)) {
              if (value) arr.push(value);
            }
            return arr.length <= 0 ? "-" : arr.toString();
          } else return "-";
        },
      },
      {
        title: () => GetIntlMessages("email"),
        dataIndex: "e_mail",
        key: "e_mail",
        width: 150,
        use: true,
        render: (text, record) => text ?? "-",
      },
      {
        title: () => GetIntlMessages("id-card"),
        dataIndex: "id_card_number",
        key: "id_card_number",
        width: 150,
        use: true,
        align: "center",
        render: (text, record) => (text ? text : "-"),
      },
      {
        title: () => "ข้อมูลรถยนต์",
        dataIndex: 'id',
        key: 'id',
        width: 50,
        use: true,
        align: "center",
        render: (text, record) => <Button loading={loading} type="link" icon={<CarOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => { setIsIdEdit(text), setIsIdEditData(record); setIsCarInfoModalVisible(true) }}>{ }</Button>
      },
      {
        title: () => GetIntlMessages("contact-name"),
        dataIndex: "other_details",
        key: "other_details",
        width: 80,
        align: "center",
        use: true,
        render: (text, record) => <Button type="link" icon={<TeamOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => { setMultiContactorData(record); setIsMultiContactorModalVisible(true) }}>{ }</Button>
      },
      {
        title: () => GetIntlMessages("สถานะสมาชิก"),
        dataIndex: 'other_details',
        key: 'other_details',
        width: 150,
        use: true,
        align: "center",
        render: (text, record) => get(text, "is_member", "-") === true ? "ใช่" : "ไม่ใช่"
      },
      {
        title: () => GetIntlMessages("เลือก"),
        dataIndex: '',
        key: '',
        width: 100,
        align: "center",
        use: isFunction(callBack) ?? false,
        render: (text, record) => (
          <Button onClick={() => callBack(record)}>เลือก</Button>
        ),
      },
    ];

    _column.map((x) => { x.use === undefined ? x.use = true : null })
    setColumns(_column.filter(x => x.use === true));
  };

  useEffect(() => {
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
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
  }) => {
    try {
      if (page === 1) setLoading(true);

      function noWhiteSpace(value) {
        return value.replaceAll(/\s/g, "");
      }
      const noWhiteSpaceValue = noWhiteSpace(search);
      const checkIsOnlyNumber = noWhiteSpaceValue.match(/^\d+$/);
      let url = `/shopPersonalCustomers/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}`;
      if (checkIsOnlyNumber != null) {
        const mobileNo = [];
        const telNo = [];
        for (let i = 0; i < 10; i++) {
          mobileNo.push({ mobile_no: `mobile_no_${i + 1}` });
          telNo.push({ tel_no: `tel_no_${i + 1}` });
        }
        url += `&jsonField.mobile_no=${mobileNo
          .map((e) => e.mobile_no)
          .join(",")}&jsonField.tel_no=${telNo.map((e) => e.tel_no).join(",")}`;
      }
      const res = await API.get(url);
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

  const [isModalImportVisible, setIsModalImportVisible] = useState(false);
  const [fileImport, setFileImport] = useState(null);
  const [fileImportList, setFileImportList] = useState([]);

  const importExcel = () => {
    setIsModalImportVisible(true);
  };

  const handleImportOk = async () => {
    try {
      console.log("fileImport", fileImport);
      if (fileImport) {
        const formData = new FormData();
        formData.append("file", fileImport.originFileObj);
        const userAuth = cookies.get("access_token");
        const token = userAuth;
        const { data } = await axios({
          method: "post",
          url: `${process.env.NEXT_PUBLIC_SERVICE}/shopPersonalCustomers/addByFile`,
          config: { headers: { "Content-Type": "multipart/form-data" } },
          headers: { Authorization: "Bearer " + token },
          data: formData,
        });

        if (data.status == "success") {
          message.success("บันทึกสำเร็จ");
          setFileImportList([]);
          setFileImport(null);
          setIsModalImportVisible(false);
          getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
          });
        } else {
          message.error(data.data ?? "มีบางอย่างผิดพลาด !!");
        }
      } else {
        message.warning("กรุณาเลือกไฟล์");
      }
    } catch (error) {
      console.log("error", error);
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
            console.log(`file`, file);
          }
          return file;
        });
      }
    }

    //console.log("fileList :>> ", fileList);
    setFileImportList(fileList);
    if (fileList.length > 0) setFileImport(fileList[0]);
    else {
      setFileImport(null);
      // setFileType(null);
    }
  };

  /* เปลี่ยนสถานะ */
  const changeStatus = async (isuse, id) => {
    try {
      // delete,active,block
      const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete";
      // console.log('changeStatus :>> ', status, id);

      const { data } = await API.put(`/shopPersonalCustomers/put/${id}`, {
        status,
      });
      if (data.status != "success") {
        message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
      } else {
        message.success("บันทึกข้อมูลสำเร็จ");
        console.log(`search`, modelSearch.search);
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
  const addEditViewModal = async (mode, id) => {
    try {
      // setMode(_mode)
      setConfigModal({ ...configModal, mode });
      if (id) {
        setIsIdEdit(id);
        const { data } = await API.get(`/shopPersonalCustomers/byid/${id}`);
        if (data.status == "success") {
          // console.log('data :>> ', data);
          const _model = data.data;
          // console.log(`_model`, _model)
          _model.first_name = get(_model, "customer_name.first_name");
          _model.last_name = get(_model, "customer_name.last_name");
          _model.tel_no = _model.tel_no ?? {};
          _model.mobile_no = _model.mobile_no ?? {};
          _model.isuse = _model.isuse == 1 ? true : false;
          _model.contact_name = _model?.other_details?.contact_name ?? null;
          _model.contact_number = _model?.other_details?.contact_number ?? null;
          _model.match_ad_michelin = isPlainObject(_model.other_details) ? _model.other_details["match_ad_michelin"] ?? null : null
          _model.code_from_old_system = isPlainObject(_model.other_details) ? _model.other_details["code_from_old_system"] ?? null : null
          _model.credit_term = isPlainObject(_model.other_details) ? (_model.other_details["credit_term"] ?? 0).toLocaleString(twoDigits) : null
          _model.credit_limit = isPlainObject(_model.other_details) ? (_model.other_details["credit_limit"] ?? 0).toLocaleString(twoDigits) : null
          _model.debt_amount = isPlainObject(_model.other_details) ? (_model.other_details["debt_amount"] ?? 0).toLocaleString(twoDigits) : null
          _model.debt_min_active_doc_date = isPlainObject(_model.other_details) ? _model.other_details["debt_min_active_doc_date"] !== null ? moment(_model.other_details["debt_min_active_doc_date"]).format("DD/MM/YYYY") : null : null
          _model.debt_due_date = isPlainObject(_model.other_details) ? _model.other_details["debt_due_date"] !== null ? moment(_model.other_details["debt_due_date"]).format("DD/MM/YYYY") : null : null
          _model.employee_sales_man_id = isPlainObject(_model.other_details) ? _model.other_details["employee_sales_man_id"] ?? null : null
          _model.employee_sales_man_name = isPlainObject(_model.other_details) ? _model.other_details["employee_sales_man_name"] ?? null : null
          _model.line_data = isPlainObject(_model.other_details) ? _model.other_details["line_data"] ?? null : null
          _model.line_mobile_number = isPlainObject(_model.other_details) ? _model.other_details["line_mobile_number"] ?? null : null
          _model.line_register_date = isPlainObject(_model.other_details) ? _model.other_details["line_register_date"] ?? null : null
          _model.line_user_id = isPlainObject(_model.other_details) ? _model.other_details["line_user_id"] ?? null : null
          _model.is_foreign = isPlainObject(_model.other_details) ? _model.other_details["is_foreign"] ?? false : false
          _model.country_name = isPlainObject(_model.other_details) ? _model.other_details["country_name"] ?? null : null
          setLineData(_model.line_data)
          setCheckedIsuse(_model.isuse);
          setCheckedIsForeign(_model.is_foreign)
          _model.is_member = isPlainObject(_model.other_details) ? _model.other_details["is_member"] ?? null : null
          _model.other_member = isPlainObject(_model.other_details) ? _model.other_details["other_member"] ?? null : null
          _model.line_arr = isPlainObject(_model.other_details) ? _model.other_details["line_arr"] ?? null : null
          _model.note = isPlainObject(_model.other_details) ? _model.other_details["note"] ?? null : null
          _model.tags = _model.tags.map((e) => (e.id)) ?? [];
          setCheckedIsMember(_model.is_member)
          _model.latitude = isPlainObject(_model.other_details) ? _model.other_details["latitude"] ?? null : null
          _model.longitude = isPlainObject(_model.other_details) ? _model.other_details["longitude"] ?? null : null

          _model.contact_name = isPlainObject(_model.other_details)
            ? _model.other_details["contact_name"]
            : null;

          if (_model.tel_no) {
            _model.tel_no = Object.entries(_model.tel_no).map((e) => ({
              tel_no: e[1],
            }));
            // await setTelNo([..._model.tel_no])
          }
          //จัด object mobile_no ใหม่
          if (_model.mobile_no) {
            _model.mobile_no = Object.entries(_model.mobile_no).map((e) => ({
              mobile_no: e[1],
            }));
            // await setMobileNo([..._model.mobile_no])
          }
          form.setFieldsValue(_model);
        }
      } else {
        form.setFieldsValue({
          name_title_id: "ac41990b-cdfb-48b4-bd79-fd4c275cec8c",
          is_foreign: false
        })
      }
      form.setFieldsValue({ mode })
      setIsModalVisible(true);
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
    setIsModalVisible(false);
  };

  const onFinish = async (value) => {
    console.log("val", value)
    try {
      value.customer_name = {
        first_name: value.first_name,
        last_name: value.last_name,
      };

      const _model = {
        id_card_number: value.id_card_number,
        name_title_id: value.name_title_id ?? null,
        customer_name: value.customer_name,
        tel_no: {},
        mobile_no: {},
        e_mail: value.e_mail ? value.e_mail : null,
        address: value.address,
        subdistrict_id: value.subdistrict_id ?? null,
        district_id: value.district_id ?? null,
        province_id: value.province_id ?? null,
        tags: value.tags ?? undefined,
        other_details: {
          contact_name: value.contact_name ?? null,
          contact_number: value.contact_number ?? null,
          match_ad_michelin: value.match_ad_michelin ?? null,
          code_from_old_system: value.code_from_old_system ?? null,
          credit_term: value.credit_term ?? null,
          credit_limit: MatchRound(+value.credit_limit) ?? null,
          is_member: value.is_member ?? false,
          other_member: value.other_member ?? null,
          employee_sales_man_id: value.employee_sales_man_id ?? null,
          employee_sales_man_name: value.employee_sales_man_name ?? null,
          debt_amount: value.debt_amount === "NaN" ? "0.00" : !!value.debt_amount ? MatchRound(+value.debt_amount) ?? "0.00" : "0.00",
          debt_min_active_doc_date: value.debt_min_active_doc_date ?? null,
          debt_due_date: value.debt_due_date ?? null,
          line_mobile_number: value.line_mobile_number ?? null,
          line_user_id: value.line_user_id ?? null,
          line_register_date: value.line_register_date ?? null,
          line_data: value.line_data ?? null,
          is_foreign: value.is_foreign ?? false,
          country_name: value.country_name ?? null,
          line_arr: value.line_arr ?? null,
          note: value.note ?? null,
          latitude: value.latitude ?? null,
          longitude: value.longitude ?? null,
        },
      };

      if (value.mobile_no)
        value.mobile_no.forEach(
          (e, i) => (_model.mobile_no[`mobile_no_${i + 1}`] = e.mobile_no)
        );
      else value.mobile_no = [];

      if (value.tel_no)
        value.tel_no.forEach(
          (e, i) => (_model.tel_no[`tel_no_${i + 1}`] = e.tel_no)
        );
      else value.tel_no = [];

      let res;
      if (configModal.mode === "add") {
        _model.master_customer_code_id = "";
        res = await API.post(`/shopPersonalCustomers/add`, _model);
      } else if (configModal.mode === "edit") {
        _model.status = checkedIsuse ? "active" : "block";
        res = await API.put(`/shopPersonalCustomers/put/${idEdit}`, _model);
      }

      if (res.data.status == "success") {
        message.success("บันทึกสำเร็จ");
        setIsModalVisible(false);
        setConfigModal({ ...configModal, mode: "add" });
        form.resetFields();

        let search = modelSearch.search
        if (isFunction(callBack)) {
          search = res.data.data.customer_name.first_name[locale.locale] + " " + res.data.data.customer_name.last_name[locale.locale]
        }
        let _searchModel = {
          ...init.modelSearch,
          search: search,
        }
        setModelSearch(_searchModel)
        getDataSearch({
          page: configTable.page,
          search: search,
        });
      } else {
        message.error("มีบางอย่างผิดพลาด !!");
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด !!");
      console.log("error :>> ", error);
    }
  };

  const onFinishFailed = (error) => {
    // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
  };

  /* master */
  const [nameTitleList, setNameTitleList] = useState([]);
  const [tagsList, setTagsList] = useState([])

  /* Download Template */
  const downloadTemplate = () => {
    window.open(
      "../../templates/excel/template-ข้อมูลลูกค้าธรรมดา.xlsx",
      "_blank"
    );
  };


  const getMasterData = async () => {
    try {
      const promise1 = getNameTitleListAll();
      const promise2 = getTagsListAll();

      Promise.all([promise1, promise2,]).then((values) => {
        setNameTitleList(values[0])
        setTagsList(values[1])
      });
    } catch (error) {

    }
  }

  const getTagsListAll = async () => {
    const { data } = await API.get(`/shopTags/all?limit=99999&page=1&sort=run_no&order=asc&status=default`)
    return data.status === "success" ? data.data.data ?? [] : []
  }

  /* คำนำหน้า */
  const getNameTitleListAll = async () => {
    const { data } = await API.get(`/master/nameTitle?sort=code_id&order=asc`);
    // console.log('data.data :>> ', data.data);
    return data.data;
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

  const exportExcel = async () => {
    try {
      setLoading(true)
      const { search } = modelSearch
      const res = await API.get(`/shopPersonalCustomers/all?limit=99999&page=1&search=${search}&export_format=xlsx`)
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
            value: "all",
          },
          {
            key: GetIntlMessages("ใช้งาน"),
            value: "active",
          },
          {
            key: GetIntlMessages("ยกเลิกการใช้งานข้อมูล"),
            value: "block",
          },
          {
            key: GetIntlMessages("ลบข้อมูลลงถังขยะ"),
            value: "delete",
          },
          {
            key: GetIntlMessages("ไม่ใช้งาน"),
            value: "non-active",
          },
        ],
      },
    ],
    col: 8,
    button: {
      download: true,
      import: true,
      export: true,
    },
    onFinishSearch,
    onFinishError,
    onReset,
    downloadTemplate,
    importExcel,
    exportExcel
  };



  const onCreate = () => {
    setIsModalVisible(true);
    setConfigModal({ ...configModal, mode: "add" });
  };

  /*Car Modal Info*/
  const [isCarInfoModalVisible, setIsCarInfoModalVisible] = useState(false);
  const [isSalesManModalVisible, setIsSalesManModalVisible] = useState(false);
  const [carInfo, setCarInfo] = useState([]);
  // const [idEdit, setIsIdEdit] = useState(null);
  // const [checkedIsuse, setCheckedIsuse] = useState(false);
  // const [form] = Form.useForm();

  const carInFoColumns = [
    {
      title: GetIntlMessages("order"),
      align: "center",
      render: (tex, record, index) => index + 1
    },
    {
      title: GetIntlMessages("code"),
      key: "code_id",
      dataIndex: "code_id",
      align: "center",
    },
    {
      title: GetIntlMessages("ทะเบียนรถ"),
      key: "details",
      dataIndex: "details",
      align: "center",
      render: (text, record, index) => get(text, `registration`, "-")
    },
    {
      title: GetIntlMessages("province"),
      key: "details",
      dataIndex: "details",
      align: "center",
      render: (text, record, index) => get(text, `province_name`, "-")
    },
    {
      title: GetIntlMessages("ยี่ห้อ"),
      key: "VehicleBrand",
      dataIndex: "VehicleBrand",
      align: "center",
      render: (text, record, index) => get(text, `brand_name.${locale.locale}`, "-")
    },
    {
      title: GetIntlMessages("รุ่น"),
      key: "VehicleModelType",
      dataIndex: "VehicleModelType",
      align: "center",
      render: (text, record, index) => get(text, `model_name.${locale.locale}`, "-")
    },
    {
      title: GetIntlMessages("ประเภทรถ"),
      key: "VehicleType",
      dataIndex: "VehicleType",
      align: "center",
      render: (text, record, index) => get(text, `type_name.${locale.locale}`, "-")
    },
    {
      title: GetIntlMessages("เลขไมล์ล่าสุด"),
      key: "details",
      dataIndex: "details",
      align: "center",
      render: (text, record, index) => Number(get(text, `mileage`, "-")).toLocaleString()
    },
  ]

  const visibleCarInfoModal = async () => {
    try {
      setLoading(true)
      const { id } = form.getFieldValue()
      if (!!id) {
        const { data } = await API.get(`/shopVehicleCustomer/all?per_customer_id=${id}&limit=99999999&page=1&sort=created_date&order=desc&status=active`)
        if (data.status === "success") {
          setCarInfo(() => [...data.data.data])
          setIsCarInfoModalVisible(true)
        } else {
          Swal.fire('โหลดข้อมูลไม่สำเร็จ !!', 'กรุณาติดจ่อเจ้าหน้าที่', 'error')
        }
      }

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  const handleCancelCarInfoModal = () => {
    try {
      setIsCarInfoModalVisible(false)
    } catch (error) {

    }
  }
  /*End Car Modal Info*/

  const handleCancelSalesManModal = () => {
    try {
      setIsSalesManModalVisible(false)
    } catch (error) {

    }
  }

  const callBackSalesMan = (data) => {
    setIsSalesManModalVisible(false)
    // console.log("callback", data)
    form.setFieldsValue({
      employee_sales_man_id: data.id,
      employee_sales_man_name: data.UsersProfile.fname[locale.locale] + " " + data.UsersProfile.lname[locale.locale] + `${data.UsersProfile.details.nickname ? ` (${data.UsersProfile.details.nickname})` : ""}`,
    });
  }

  const handleCancelMultiContactorModal = () => {
    try {
      setIsMultiContactorModalVisible(false)
    } catch (error) {

    }
  }

  const handleCancelLineModal = () => {
    setIsLineModalVisible(false)
  }

  const handleCancelTagsModal = async () => {
    try {
      let data = await getTagsListAll();
      await setTagsList(data);
      await setShowModalTagsData(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleChangeTabs = (key) => {

  }

  const handleOpenSalesHistoryDataModal = () => {
    setShowModalSalesHistoryData(true)
  }

  const handleCancelSalesHistoryDataModal = () => {
    setShowModalSalesHistoryData(false)
  }

  const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

  return (
    <>
      <div id="page-manage">
        <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
        <SearchInput
          configSearch={configSearch}
          configModal={configModal}
          loading={loading}
          onAdd={() => addEditViewModal("add")}
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
          // width={750}
          maskClosable={false}
          title={`${configModal.mode == "view"
            ? "ดูข้อมูล"
            : configModal.mode == "edit"
              ? "แก้ไขข้อมูล"
              : "เพิ่มข้อมูล"
            }ลูกค้าบุคคลธรรมดา`}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          hideSubmitButton={configModal.mode === "view"}
          // okButtonProps={{ disabled: configModal.mode == "view" }}
          bodyStyle={{
            maxHeight: 600,
            overflowX: "auto",
          }}
          footer={(
            <>
              <Button type="link" hidden={configModal.mode === "add"} onClick={() => handleOpenSalesHistoryDataModal()} icon={<TableOutlined />}>ประวัติการขาย</Button>
              {configModal.mode !== "add" ? <Button type="link" icon={<TeamOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => { setMultiContactorData({ id: idEdit }); setIsMultiContactorModalVisible(true) }}>{"ข้อมูลผู้ติดต่อ"}</Button> : null}
              {configModal.mode !== "add" ? <MultiShipTo customerInfo={{ customer_type: "personal", customer_id: idEdit }} /> : null}
              <Button loading={loading} hidden={configModal.mode === "add"} type="link" icon={<CarOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => visibleCarInfoModal()}>{GetIntlMessages("ข้อมูลรถยนต์")}</Button>
              <Button onClick={() => handleCancel()}>{GetIntlMessages("กลับ")}</Button>
              <Button hidden={configModal.mode === "view"} type="primary" loading={loading} onClick={() => handleOk()}>{GetIntlMessages("บันทึก")}</Button>
            </>
          )}
        >
          <Form
            form={form}
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 19 }}
            layout="horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            initialValues={{ mobile_no: [null] }}
          >
            <Tabs
              defaultActiveKey="1"
              onChange={handleChangeTabs}
              items={[
                {
                  label: (<span><FileTextOutlined style={{ fontSize: 18 }} /> ข้อมูลลูกค้า</span>),
                  key: '1',
                  children:
                    <Row>
                      <Col span={24}>
                        <Fieldset legend={`ข้อมูลลูกค้า`} className={"fieldset-business-customer"}>
                          <Row>
                            <Col xs={24} xl={12}>

                              {configModal.mode != "add" ? (
                                <Form.Item
                                  name="master_customer_code_id"
                                  type="text"
                                  label={GetIntlMessages("code")}
                                >
                                  <Input disabled={true} />
                                </Form.Item>
                              ) : null}

                              <Form.Item
                                name="id_card_number"
                                label={GetIntlMessages("id-card")}
                                rules={[
                                  {
                                    min: 13,
                                    message: GetIntlMessages("enter-your-id-card-13-digits"),
                                  },
                                  {
                                    pattern: new RegExp("^[0-9]*$"),
                                    message: GetIntlMessages("enter-your-id-card"),
                                  },
                                ]}
                              >
                                <Input
                                  type={`text`}
                                  min={0}
                                  showCount
                                  disabled={configModal.mode == "view"}
                                  minLength={10}
                                  maxLength={13}
                                />
                              </Form.Item>

                              <Form.Item name="name_title_id" label={GetIntlMessages("prefix")}>
                                <Select
                                  placeholder="เลือกข้อมูล"
                                  optionFilterProp="children"
                                  showSearch
                                  // disabled
                                  disabled={configModal.mode == "view"}
                                >
                                  {isArray(nameTitleList)
                                    ? nameTitleList.map((e, index) => (
                                      <Select.Option value={e.id} key={index}>
                                        {e.name_title[locale.locale]}
                                      </Select.Option>
                                    ))
                                    : null}
                                </Select>
                              </Form.Item>

                              <FormInputLanguage
                                icon={formLocale}
                                label={GetIntlMessages("name")}
                                name="first_name"
                                rules={[
                                  { required: true, message: GetIntlMessages("please-fill-out") },
                                ]}
                                disabled={configModal.mode == "view"}
                              />

                              <FormInputLanguage
                                icon={formLocale}
                                label={GetIntlMessages("surname")}
                                name="last_name"
                                rules={[
                                  { required: true, message: GetIntlMessages("please-fill-out") },
                                ]}
                                disabled={configModal.mode == "view"}
                              />

                              <Form.Item label={GetIntlMessages("tel-no")} name="tel_no" style={{ margin: 0 }}>
                                <Form.List name="tel_no">
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map((field, index) => (
                                        <Form.Item required={false} key={field.key}>
                                          <Form.Item
                                            {...field}
                                            validateTrigger={["onChange", "onBlur"]}
                                            name={[field.name, "tel_no"]}
                                            fieldKey={[field.fieldKey, "tel_no"]}
                                            noStyle
                                          >
                                            <MaskedInput
                                              className="ant-input"
                                              disabled={configModal.mode == "view"}
                                              style={{
                                                width: fields.length > 1 ? "85%" : "100%",
                                              }}
                                              maskGenerator={masktel_no}
                                            />

                                            {/* <Input type={`text`} min={0} disabled={configModal.mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} maxLength={20} /> */}
                                          </Form.Item>
                                          {fields.length > 1 && configModal.mode != "view" ? (
                                            <MinusCircleOutlined
                                              className="dynamic-delete-button"
                                              onClick={() => remove(field.name)}
                                            />
                                          ) : null}
                                        </Form.Item>
                                      ))}
                                      <Form.Item hidden={configModal.mode === "view"} className="mt-2">
                                        {configModal.mode != "view" ? (
                                          <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                          >
                                            {GetIntlMessages("tel-no")}
                                          </Button>
                                        ) : null}
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>
                              <Form.Item label={<>{GetIntlMessages("mobile-no")}</>} name="mobile_no">
                                <Form.List name="mobile_no"
                                  rules={[
                                    {
                                      required: false
                                    }
                                  ]}
                                >
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map((field, index) => (
                                        <Form.Item required={false} key={field.key} style={{ margin: 0 }}>
                                          <Row gutter={[0, 20]}>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 22 : 24}>
                                              <Form.Item
                                                {...field}
                                                validateTrigger={["onChange", "onBlur"]}
                                                name={[field.name, "mobile_no"]}
                                                fieldKey={[field.fieldKey, "mobile_no"]}
                                                rules={[
                                                  // {
                                                  //   required: field.fieldKey === 0 ? true : false,
                                                  //   message: "กรุณาใส่เบอร์มือถืออย่างน้อย 1 เบอร์",
                                                  // },
                                                  {
                                                    min: 10,
                                                    message: "กรุณาใส่เบอร์มือถือให้ครบ 10 หลัก !!",
                                                  }
                                                ]}
                                                style={{ marginBottom: "24px" }}
                                              >
                                                <MaskedInput
                                                  className="ant-input"
                                                  disabled={configModal.mode == "view"}
                                                  style={{
                                                    width: "100%",
                                                    // width: fields.length > 1 ? "85%" : "100%",
                                                  }}
                                                  maskGenerator={maskmobile_no}
                                                />
                                                {/* <Input type={`text`} min={0} disabled={configModal.mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} maxLength={10} /> */}
                                              </Form.Item>
                                            </Col>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 2 : 0} style={{ display: "flex", alignItems: "center" }}>
                                              {fields.length > 1 && configModal.mode != "view" ? (
                                                <MinusCircleOutlined
                                                  className="dynamic-delete-button"
                                                  onClick={() => remove(field.name)}
                                                />
                                              ) : null}
                                            </Col>
                                          </Row>


                                        </Form.Item>
                                      ))}
                                      <Form.Item hidden={configModal.mode === "view"} className="mt-2">
                                        {configModal.mode != "view" ? (
                                          <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                          >
                                            {GetIntlMessages("mobile-no")}
                                          </Button>
                                        ) : null}
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>


                              <Form.Item
                                name='employee_sales_man_id'
                                label={GetIntlMessages("พนักงานขาย")}
                                hidden
                              >
                                <Input hidden />
                              </Form.Item>
                              <Form.Item
                                name='employee_sales_man_name'
                                label={GetIntlMessages("พนักงานขาย")}
                              >
                                <Input disabled addonAfter={
                                  <Button
                                    type='text'
                                    size='small'
                                    style={{ border: 0 }}
                                    onClick={() => setIsSalesManModalVisible(true)}
                                  >
                                    เลือก
                                  </Button>
                                } />
                              </Form.Item>
                              <Form.Item name="note" label={"หมายเหตุ"} >
                                <TextArea
                                  placeholder="กรอกหมายเหตุ"
                                  rows={4}
                                  disabled={configModal.mode == "view"}
                                  showCount
                                  maxLength={200}
                                >
                                </TextArea>
                              </Form.Item>
                            </Col>

                            <Col xs={24} xl={12}>


                              <Form.Item
                                name="e_mail"
                                label={GetIntlMessages("email")}
                                rules={[
                                  {
                                    type: "email",
                                    message: GetIntlMessages("enter-your-email"),
                                  },
                                ]}
                              >
                                <Input
                                  type={"text"}
                                  maxLength={200}
                                  disabled={configModal.mode == "view"}
                                />
                              </Form.Item>

                              <FormInputLanguage
                                isTextArea
                                icon={formLocale}
                                label={GetIntlMessages("address")}
                                name="address"
                                disabled={configModal.mode == "view"}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล"
                                  }
                                ]}
                              />

                              <FormProvinceDistrictSubdistrict
                                form={form}
                                disabled={configModal.mode == "view"}
                                validatename={{ Province: !checkedIsForeign, District: !checkedIsForeign, Subdistrict: !checkedIsForeign, ZipCode: !checkedIsForeign }}
                              />
                              <Form.Item
                                name="is_member"
                                label={GetIntlMessages("สถานะเป็นสมาชิก")}
                                rules={[
                                  {
                                    required: false,
                                    message: "กรุณากรอกข้อมูล"
                                  }
                                ]}
                              >
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsMember} onChange={(bool) => setCheckedIsMember(bool)} checkedChildren={GetIntlMessages("เป็นสมาชิก")} unCheckedChildren={GetIntlMessages("ไม่เป็นสมาชิก")} />
                              </Form.Item>
                              <Form.Item
                                name="is_foreign"
                                label={GetIntlMessages("สถานะต่างประเทศ")}
                                rules={[
                                  {
                                    required: false,
                                    message: "กรุณากรอกข้อมูล"
                                  }
                                ]}
                              >
                                <Switch disabled={configModal.mode == "view"} checked={checkedIsForeign} onChange={(bool) => setCheckedIsForeign(bool)} checkedChildren={GetIntlMessages("ต่างประเทศ")} unCheckedChildren={GetIntlMessages("ในประเทศ")} />
                              </Form.Item>
                              <Form.Item
                                name="country_name"
                                label={GetIntlMessages("ประเทศ")}
                                rules={[
                                  {
                                    required: checkedIsForeign,
                                    message: "กรุณากรอกข้อมูล"
                                  }
                                ]}
                              >
                                <Input disabled={configModal.mode == "view"} />
                              </Form.Item>
                              <Form.Item
                                name="tags"
                                label="แท็ก"
                              >
                                <Select
                                  disabled={configModal.mode == "view"}
                                  mode="multiple"
                                  allowClear
                                  style={{ width: '100%' }}
                                  placeholder="เลือกข้อมูล"
                                  filterOption={(inputValue, option) => {
                                    if (_.isPlainObject(option)) {
                                      if (option.children) {
                                        return option.children.toString().toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                                      }
                                    }
                                  }}
                                  dropdownRender={(menu) => (
                                    <>
                                      {menu}
                                      <>
                                        <Divider style={{ margin: "8px 0" }} />

                                        <Button onClick={() => setShowModalTagsData(true)}><TagsOutlined />จัดการข้อมูลแท๊ก</Button>
                                      </>
                                    </>
                                  )}

                                >
                                  {isArray(tagsList) && tagsList.length > 0 ? tagsList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                      {e.tag_name[locale.locale]}
                                    </Select.Option>
                                  ))
                                    : null
                                  }
                                </Select>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Fieldset>
                      </Col>
                    </Row>,
                },
                {
                  label: (<span><TableOutlined style={{ fontSize: 18 }} /> ข้อมูลการเงิน</span>),
                  key: '2',
                  children:
                    <Row>
                      <Col xs={24} xl={12}>
                        <Fieldset legend={`ข้อมูลการเงิน`} className={"fieldset-business-customer"}>
                          <Form.Item
                            name="credit_limit"
                            label={GetIntlMessages("วงเงินเครดิต")}
                            rules={[
                              {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                              },
                              {
                                pattern: /^[\.0-9]*$/,
                                message: "กรอกได้เฉพาะตัวเลขเท่านั้น"
                              }
                            ]}
                          >
                            <InputNumber
                              min={0}
                              disabled={configModal.mode === "view"}
                              stringMode
                              style={{ width: "100%" }}
                              precision={2}
                              formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              className='ant-input-number-after-addon-10-percent'
                              addonAfter={`บาท`}
                            />

                          </Form.Item>
                          <Form.Item
                            name="credit_term"
                            label={GetIntlMessages("จำนวนวันเครดิต")}
                            rules={[
                              {
                                required: true,
                                message: "กรุณากรอกข้อมูล"
                              },
                              {
                                pattern: /^[\.0-9]*$/,
                                message: "กรอกได้เฉพาะตัวเลขเท่านั้น"
                              }
                            ]}
                          >
                            <InputNumber
                              min={0}
                              disabled={configModal.mode === "view"}
                              stringMode
                              style={{ width: "100%" }}
                              precision={2}
                              formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              className='ant-input-number-after-addon-10-percent'
                              addonAfter={`วัน`}
                            />
                          </Form.Item>
                          <Form.Item
                            name="debt_amount"
                            label={GetIntlMessages("หนี้สินทั้งหมด")}
                          >
                            <InputNumber
                              min={0}
                              disabled
                              stringMode
                              style={{ width: "100%" }}
                              precision={2}
                              formatter={(value) => !!value && value.length > 0 ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ""}
                              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                              className='ant-input-number-after-addon-10-percent'
                              addonAfter={`บาท`}
                            />
                          </Form.Item>
                          <Form.Item
                            name="debt_min_active_doc_date"
                            label={GetIntlMessages("วันที่บันทึกหนี้ครั้งแรก")}
                          >
                            <Input className='price-align' disabled />
                          </Form.Item>
                          <Form.Item
                            name="debt_due_date"
                            label={GetIntlMessages("วันครบกำหนดบันทึกหนี้ครั้งแรก")}
                          >
                            <Input className='price-align' disabled />
                          </Form.Item>


                        </Fieldset>
                      </Col>
                    </Row>,
                },
                {
                  label: (<span><TableOutlined style={{ fontSize: 18 }} /> ข้อมูลระบบ</span>),
                  key: '3',
                  children:
                    <Row>
                      <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลระบบ`} className={"fieldset-business-customer"}>
                          <Row>
                            <Col xs={24} md={12} xl={12}>
                              <Form.Item
                                name="latitude"
                                label={GetIntlMessages("ละติจูด")}
                              >
                                <Input disabled={configModal.mode == "view"} />
                              </Form.Item>
                            </Col>

                            <Col xs={24} md={12} xl={12}>
                              <Form.Item
                                name="longitude"
                                label={GetIntlMessages("ลองจิจูด")}
                              >
                                <Input disabled={configModal.mode == "view"} />
                              </Form.Item>
                            </Col>

                            <Col xs={24} md={12} xl={12}>
                              <Form.Item
                                label={GetIntlMessages("สถานะเป็นสมาชิกอื่น ๆ")}
                              >
                                <Form.List name="other_member">
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} style={{ display: 'flex', marginBottom: 8, alignContent: "center" }} align="baseline">

                                          <Col span={11} style={{ paddingRight: "4px" }}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'other_member_name']}
                                              rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
                                            >
                                              <Input placeholder="ชื่อผู้จำหน่าย" />
                                            </Form.Item>
                                          </Col>
                                          <Col span={11} style={{ paddingLeft: "4px" }}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'other_member_code']}
                                              rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
                                            >
                                              <Input placeholder="รหัสสมาชิกจากผู้จำหน่าย" />
                                            </Form.Item>
                                          </Col>
                                          <Col span={2} style={{ textAlign: "center" }}>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                          </Col>
                                        </Row>
                                      ))}
                                      <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                          เพิ่มข้อมูล
                                        </Button>
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>



                            </Col>

                            <Col xs={24} md={12} xl={12}>
                              <Form.Item
                                name="code_from_old_system"
                                label={GetIntlMessages("รหัสจากระบบเก่า")}
                              >
                                <Input disabled={configModal.mode == "view"} />
                              </Form.Item>
                            </Col>

                            <Col xs={24} md={12} xl={12}>
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
                            </Col>
                            <Col xs={24} md={12} xl={12}>
                              <Form.Item
                                label={GetIntlMessages("ข้อมูล LINE")}
                              >
                                <Form.List name="line_arr" >
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map(({ key, name, ...restField }) => (
                                        <Row key={key} style={{ display: 'flex', marginBottom: 8, alignContent: "center" }} align="baseline">

                                          <Col span={24} style={{ paddingRight: "4px" }}>
                                            <Form.Item
                                              {...restField}
                                              label="เบอร์ที่ลงทะเบียนระบบไลน์"
                                              name={[name, 'line_mobile_number']}
                                            // rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
                                            >
                                              <MaskedInput
                                                className='ant-input'
                                                disabled={configModal.mode == "view"}
                                                style={{ width: '100%' }}
                                                maskGenerator={maskmobile_no}
                                              />
                                            </Form.Item>
                                          </Col>
                                          <Col span={24} style={{ paddingLeft: "4px" }}>
                                            <Form.Item
                                              {...restField}
                                              label="วันที่ลงทะเบียนไลน์"
                                              name={[name, 'line_register_date']}
                                            // rules={[{ required: true, message: 'กรุณากรอกข้อมูล' }]}
                                            >
                                              <Input
                                                disabled
                                                addonAfter={
                                                  <Button
                                                    type='text'
                                                    size='small'
                                                    style={{ border: 0 }}
                                                    disabled={form.getFieldValue().line_register_date === null}
                                                    onClick={() => setIsLineModalVisible(true)}
                                                  >
                                                    <SearchOutlined />
                                                  </Button>
                                                } />
                                            </Form.Item>
                                          </Col>
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'line_data']}
                                          >
                                            <Input hidden />
                                          </Form.Item>
                                          <Form.Item
                                            {...restField}
                                            name={[name, 'line_user_id']}
                                          >
                                            <Input hidden />
                                          </Form.Item>
                                          <Col span={24} style={{ textAlign: "end" }}>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                          </Col>
                                        </Row>
                                      ))}
                                      <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                          เพิ่มข้อมูล
                                        </Button>
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>
                            </Col>
                          </Row>
                        </Fieldset>
                      </Col>
                    </Row>,
                },
              ]}
            />
            <Form.Item name="credit_limit" hidden />
            <Form.Item name="credit_term" hidden />

            <Form.Item name="longitude" hidden />
            <Form.Item name="latitude" hidden />
            <Form.Item name="line_arr" hidden />
            <Form.Item name="code_from_old_system" hidden />
            <Form.Item name="other_member" hidden />
          </Form>
        </ModalFullScreen>

        {/* Import Modal */}

        <Modal
          maskClosable={false}
          title={`Import`}
          open={isModalImportVisible}
          onOk={handleImportOk}
          onCancel={handleImportCancel}
        >
          <Form.Item label="Import Excel">
            <Upload
              onChange={handleImportChange}
              action={`${process.env.NEXT_PUBLIC_SERVICE}/post`}
              fileList={fileImportList}
              multiple={false}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Modal>

        {/* Car Mdal Info */}
        <Modal
          maskClosable={false}
          // title={`ข้อมูลรถยนต์`}
          open={isCarInfoModalVisible}
          onCancel={handleCancelCarInfoModal}
          width="90vw"
          style={{ top: 16 }}
          footer={(
            <>
              <Button onClick={() => handleCancelCarInfoModal()}>{GetIntlMessages("กลับ")}</Button>
            </>
          )}
        >
          <VehicleTableData cus_id={idEdit} cus_type={"person"} cus_data={isIdEditData} />
          {/* <Table
                        id="table-list"
                        dataSource={carInfo}
                        columns={carInFoColumns}
                        pagination={false}
                    /> */}
        </Modal>
        {/* End Car Mdal Info */}
      </div>

      <Modal
        maskClosable={false}
        open={isSalesManModalVisible}
        onCancel={handleCancelSalesManModal}
        width="90vw"
        footer={(
          <>
            <Button onClick={() => handleCancelSalesManModal()}>{GetIntlMessages("กลับ")}</Button>
          </>
        )}
      >
        <EmployeeData title="จัดการข้อมูลพนักงาน" callBack={callBackSalesMan} filter_department_id="2e885a03-bcd5-449a-99d4-9422526516de" />
      </Modal>

      <Modal
        maskClosable={false}
        open={isMultiContactorModalVisible}
        onCancel={handleCancelMultiContactorModal}
        width="90vw"
        footer={(
          <>
            <Button onClick={() => handleCancelMultiContactorModal()}>{GetIntlMessages("กลับ")}</Button>
          </>
        )}
      >
        <MultiContactor customerInfo={{ customer_type: "personal", customer_id: MultiContactorData.id }} />
      </Modal>

      <Modal
        maskClosable={false}
        open={isLineModalVisible}
        onCancel={handleCancelLineModal}
        width="30vw"
        closable
        footer={(
          <>
            <Button onClick={() => handleCancelLineModal()}>{"กลับ"}</Button>
          </>
        )}
      >
        <Row style={{ justifyContent: "center", alignItems: "center", paddingBottom: "8px" }}>
          <Image
            width={200}
            src={lineData?.pictureUrl}
          />
        </Row>
        <Row style={{ justifyContent: "center", alignItems: "center" }}>
          {lineData?.displayName}
        </Row>
      </Modal>
      <Modal
        maskClosable={false}
        // title={`ข้อมูลรถยนต์`}
        open={showModalTagsData}
        onCancel={() => handleCancelTagsModal()}
        width="90vw"
        footer={(
          <>
            <Button onClick={() => handleCancelTagsModal()}>{GetIntlMessages("กลับ")}</Button>
          </>
        )}
      >
        <TagsData title="จัดการข้อมูลแท็ก" />
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
        <ReportSalesOut title="ประวัติการขาย" parent_search_id={idEdit} parent_page={"person_customer"} />
      </Modal>



      <style global>
        {`
                .fieldset-business-customer{
                    padding: 8px;
                }
            `}
      </style>
    </>
  );
};

export default PersonalCustomersData;
