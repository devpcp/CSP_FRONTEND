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
  Radio,
  InputNumber,
  Typography,
  Tabs
} from "antd";
import {
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  HistoryOutlined,
  TeamOutlined,
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
} from "../../components/shares/FormLanguage";
import { get, isPlainObject, isFunction } from "lodash";
import GetIntlMessages from "../../util/GetIntlMessages";
import { Cookies } from "react-cookie";
import axios from "axios";
import Fieldset from '../../components/shares/Fieldset';
import ModalFullScreen from "../../components/shares/ModalFullScreen";
import { MaskedInput, createDefaultMaskGenerator } from 'react-hook-mask';
import MultiContactor from '../../components/Routes/Modal/Components.Add.Modal.MultiContactor';
import moment from 'moment'
import TextArea from 'antd/lib/input/TextArea';
const cookies = new Cookies();
const masktel_no = createDefaultMaskGenerator('99 999 9999');
const maskmobile_no = createDefaultMaskGenerator('999 999 9999');

const { Text, Link } = Typography;

const BusinessPartnersData = ({ title = null, callBack }) => {
  const [loading, setLoading] = useState(false);

  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { locale } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon);
  const [trickerCancel, setTrickerCancel] = useState(Date.now());
  const [IsBranch, setIsBranch] = useState(false);
  const [isMultiContactorModalVisible, setIsMultiContactorModalVisible] = useState(false);
  const [MultiContactorData, setMultiContactorData] = useState({});
  const [checkedIsForeign, setCheckedIsForeign] = useState(false);
  //รูปแบบการตั้งชื่อธุรกิจ a-z, A-Z, ก-ฮ, 0-9, dot, underscore, space
  const companyNamePattern = /^[\u0E00-\u0E7Fa-zA-Zก-ฮ0-9\s._]+$/;

  const twoDigits = { minimumFractionDigits: 2, maximumFractionDigits: 2 }
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
      sort: "code_id",
      // sort: "code",
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
      sort: `partner_name.${locale.locale}`,
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
        use: true,
        render: (text, record, index) => {
          index += (configTable.page - 1) * configTable.limit;
          return index + 1;
        },
      },
      {
        title: () => GetIntlMessages("code"),
        dataIndex: "code_id",
        key: "code_id",
        width: 150,
        align: "center",
        use: true,
        render: (text, record) => {
          if (isFunction(callBack)) {
            return (
              <Link href="#" onClick={() => callBack(record)}>
                {text}
              </Link>
            )
          } else {
            return (
              <Text>{text ?? "-"}</Text>
            )
          }
        },
      },
      {
        title: () => GetIntlMessages("tax-id"),
        dataIndex: "tax_id",
        key: "tax_id",
        width: 150,
        align: "center",
        use: true,
        render: (text, record) => (text ? text : "-"),
      },
      {
        title: () => GetIntlMessages("business-type"),
        dataIndex: "BusinessType",
        key: "BusinessType",
        width: 120,
        use: true,
        align: "center",
        render: (text, record) => get(text, `business_type_name.${locale.locale}`, "-"),
      },
      {
        title: () => GetIntlMessages("business-name"),
        dataIndex: "partner_name",
        key: "partner_name",
        width: 200,
        use: true,
        render: (text, record) => get(text, `${locale.locale}`, "-"),
      },
      {
        title: () => GetIntlMessages("สำนักงาน"),
        dataIndex: "other_details",
        key: "other_details",
        width: 100,
        use: true,
        align: "center",
        render: (text, record) => text.branch ? get(text, `branch`, "-") === "office" ? "สำนักงานใหญ่" : "สาขา" + get(text, `branch_name`, "-") : "ไม่ระบุ",
      },
      {
        title: () => GetIntlMessages("tel-no"),
        dataIndex: "tel_no",
        key: "tel_no",
        width: 150,
        use: true,
        align: "center",
        render: (text, record) => displayPhoneNumber(text),
      },
      {
        title: () => GetIntlMessages("mobile-no"),
        dataIndex: "mobile_no",
        key: "mobile_no",
        width: 100,
        use: true,
        align: "center",
        render: (text, record) => displayPhoneNumber(text),
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

  const displayPhoneNumber = (data) => {
    try {
      if (data && Object.values(data).length > 0) {
        return Object.values(data)
          .filter((where) => where != null)
          .map((e) => e)
          .join(",");
      } else {
        return "-";
      }
    } catch (error) { }
  };

  /* Download Template */
  const downloadTemplate = () => {
    window.open(
      "../../templates/excel/template-ข้อมูลผู้จำหน่าย.xlsx",
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
      // console.log('fileImport', fileImport)
      if (fileImport) {
        const formData = new FormData();
        formData.append("file", fileImport.originFileObj);
        const userAuth = cookies.get("access_token");
        const token = userAuth;
        const { data } = await axios({
          method: "post",
          url: `${process.env.NEXT_PUBLIC_SERVICE}/shopBusinessPartners/addByFile`,
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

    // console.log('fileList :>> ', fileList);
    setFileImportList(fileList);
    if (fileList.length > 0) setFileImport(fileList[0]);
    else {
      setFileImport(null);
      // setFileType(null);
    }
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
      let url = `/shopBusinessPartners/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}`;
      const validateNumber = search.match(new RegExp(/^[0-9]+$/));
      const telNumber = [];
      const MobileNumber = [];
      if (validateNumber != null) {
        for (let i = 0; i < 10; i++) {
          telNumber.push(`tel_no_${i + 1}`);
        }
        for (let j = 0; j < 10; j++) {
          MobileNumber.push(`mobile_no_${j + 1}`);
        }
        url += `&jsonField.tel_no=${telNumber.map((e) => e).join(",")}`;
        url += `&jsonField.mobile_no=${MobileNumber.map((e) => e).join(",")}`;
      }

      const res = await API.get(url);
      // const res = await API.get(`/shopBusinessPartners/all?search=${search}&limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}`)
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
        console.log(`res.data`, res.data);
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
      let partner_name = {};
      const dataPartners = await API.get(`/shopBusinessPartners/byid/${id}`);

      if (dataPartners.data.status === "success") {
        partner_name = dataPartners.data.data.partner_name;
      }
      // console.log('changeStatus :>> ', status, id);

      const { data } = await API.put(`/shopBusinessPartners/put/${id}`, {
        status,
        partner_name,
      });
      if (data.status != "success") {
        message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
      } else {
        message.success("บันทึกข้อมูลสำเร็จ");
        // console.log(`search`, modelSearch.search)
        setModelSearch(modelSearch);
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
        const { data } = await API.get(`/shopBusinessPartners/byid/${id}`);
        if (data.status == "success") {
          // console.log('data :>> ', data);
          const _model = data.data;
          // console.log(`_model`, _model)
          _model.tel_no = _model.tel_no ?? {};
          _model.mobile_no = _model.mobile_no ?? {};
          _model.isuse = _model.isuse == 1 ? true : false;
          setCheckedIsuse(_model.isuse);

          _model.contact_name = isPlainObject(_model.other_details) ? _model.other_details["contact_name"] ?? null : null
          _model.contact_number = isPlainObject(_model.other_details) ? _model.other_details["contact_number"] ?? null : null
          _model.credit_term = isPlainObject(_model.other_details) ? (_model.other_details["credit_term"] ?? 0).toLocaleString(twoDigits) : null
          _model.credit_limit = isPlainObject(_model.other_details) ? (_model.other_details["credit_limit"] ?? 0).toLocaleString(twoDigits) : null
          _model.tax_type_id = isPlainObject(_model.other_details) ? _model.other_details["tax_type_id"] ?? null : null
          _model.branch = isPlainObject(_model.other_details) ? _model.other_details["branch"] ?? null : null
          _model.branch_code = isPlainObject(_model.other_details) ? _model.other_details["branch_code"] ?? null : null
          _model.branch_name = isPlainObject(_model.other_details) ? _model.other_details["branch_name"] ?? null : null
          _model.debt_amount = isPlainObject(_model.other_details) ? (_model.other_details["debt_amount"] ?? 0).toLocaleString(twoDigits) : null
          _model.debt_min_active_doc_date = isPlainObject(_model.other_details) ? _model.other_details["debt_min_active_doc_date"] !== null && _model.other_details["debt_min_active_doc_date"] !== undefined ? moment(_model.other_details["debt_min_active_doc_date"]).format("DD/MM/YYYY") : null : null
          _model.debt_due_date = isPlainObject(_model.other_details) ? _model.other_details["debt_due_date"] !== null && _model.other_details["debt_due_date"] !== undefined ? moment(_model.other_details["debt_due_date"]).format("DD/MM/YYYY") : null : null
          _model.is_foreign = isPlainObject(_model.other_details) ? _model.other_details["is_foreign"] ?? false : false
          _model.country_name = isPlainObject(_model.other_details) ? _model.other_details["country_name"] ?? null : null
          _model.note = isPlainObject(_model.other_details) ? _model.other_details["note"] ?? null : null
          setCheckedIsForeign(_model.is_foreign)
          if (isPlainObject(_model.other_details)) {
            switch (_model.other_details["branch"]) {
              case "office":
                setIsBranch(false)
                break;

              case "branch":
                setIsBranch(true)
                break;
            }
          }

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
          is_foreign: false,
          branch: "office"
        })
      }
      // if(mode === "add") form.setFieldsValue({district_id : [] , subdistrict_id : [] ,zip_code :[]})
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
    setTrickerCancel(Date.now());
    setIsModalVisible(false);
  };

  const onFinish = async (value) => {
    try {
      console.log(`value`, value)

      const _model = {
        tax_id: value.tax_id,
        bus_type_id: value.bus_type_id ?? null,
        partner_name: value.partner_name,
        tel_no: {},
        mobile_no: {},
        e_mail: value.e_mail ? value.e_mail : null,
        address: value.address,
        subdistrict_id: value.subdistrict_id ?? null,
        district_id: value.district_id ?? null,
        province_id: value.province_id ?? null,
        other_details: {
          contact_name: value.contact_name ?? null,
          contact_number: value.contact_number ?? null,
          credit_term: value.credit_term ?? null,
          credit_limit: MatchRound(+value.credit_limit) ?? null,
          tax_type_id: value.tax_type_id ?? null,
          branch: value.branch ?? null,
          branch_code: value.branch_code ?? null,
          branch_name: value.branch_name ?? null,
          debt_amount: value.debt_amount === "NaN" ? "0.00" : !!value.debt_amount ? MatchRound(+value.debt_amount) ?? "0.00" : "0.00",
          debt_min_active_doc_date: value.debt_min_active_doc_date ?? null,
          debt_due_date: value.debt_due_date ?? null,
          is_foreign: value.is_foreign ?? false,
          country_name: value.country_name ?? null,
          note: value.note ?? null
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
      console.log('_model', _model)

      let res;
      if (configModal.mode === "add") {
        _model.master_customer_code_id = "";
        res = await API.post(`/shopBusinessPartners/add`, _model);
      } else if (configModal.mode === "edit") {
        _model.status = checkedIsuse ? "active" : "block";
        res = await API.put(`/shopBusinessPartners/put/${idEdit}`, _model);
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
  const [businessTypeList, setBusinessTypeList] = useState([]);
  const [taxTypeTypeList, setTaxTypeList] = useState([]);

  const getMasterData = async () => {
    try {
      /* ประเภทธุรกิจ */
      const businessTypeDataList = await getBusinessTypeDataListAll();
      const taxTypeDatalist = await getTaxTypeDataListAll();

      setBusinessTypeList(businessTypeDataList);
      setTaxTypeList(taxTypeDatalist);
    } catch (error) { }
  };

  /* เรียกข้อมูล BusinessType ทั้งหมด */
  const getBusinessTypeDataListAll = async () => {
    const { data } = await API.get(
      `/master/businessType?sort=business_type_name.th&order=asc`
    );
    return data.data;
  };

  /* เรียกข้อมูล BusinessType ทั้งหมด */
  const getTaxTypeDataListAll = async () => {
    const { data } = await API.get(
      `/master/taxTypes/all?sort=code_id&order=asc`
    );
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
            key: GetIntlMessages("normal-status"),
            value: "active",
          },
          {
            key: GetIntlMessages("blocked-status"),
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
      download: true,
      import: true,
      export: false,
    },
    onFinishSearch,
    onFinishError,
    onReset,
    downloadTemplate,
    importExcel,
  };

  const onChangeBranch = (ev) => {
    if (ev.target.value == "branch") {
      setIsBranch(true)
    } else {
      setIsBranch(false)
    }
  }

  const handleCancelMultiContactorModal = () => {
    try {
      setIsMultiContactorModalVisible(false)
    } catch (error) {

    }
  }

  const handleChangeTabs = (key) => {

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
            ? GetIntlMessages("view-data")
            : configModal.mode == "edit"
              ? GetIntlMessages("edit-data")
              : GetIntlMessages("add-data")
            }${GetIntlMessages("ผู้จำหน่าย")}`}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ disabled: configModal.mode == "view" }}
          bodyStyle={{
            maxHeight: 600,
            overflowX: "auto",
          }}
          footer={(
            <>
              {configModal.mode !== "add" ? <Button type="link" icon={<TeamOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => { setMultiContactorData({ id: idEdit }); setIsMultiContactorModalVisible(true) }}>{"ข้อมูลผู้ติดต่อ"}</Button> : null}
              {/* {configModal.mode !== "add" ? <MultiContactor customerInfo={{ customer_type: "businessPartner", customer_id: idEdit }} /> : null} */}
              {/* <Button loading={loading} hidden={configModal.mode === "add"} type="link" icon={<HistoryOutlined style={{ fontSize: "1.2rem" }} />} onClick={() => visibleCarInfoModal()}>{GetIntlMessages("ประวัติเอกสาร")}</Button> */}
              <Button onClick={() => handleCancel()}>{GetIntlMessages("กลับ")}</Button>
              <Button type="primary" onClick={() => handleOk()}>{GetIntlMessages("บันทึก")}</Button>
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
                  label: (<span><FileTextOutlined style={{ fontSize: 18 }} /> ข้อมูลทั่วไป</span>),
                  key: '1',
                  children:
                    <Row style={{ paddingBottom: "20px" }}>
                      <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลทั่วไป`} className={"fieldset-business-customer"}>
                          <Row>
                            <Col xs={24} xl={12}>
                              <Form.Item name="tax_id" label={GetIntlMessages("tax-id")}
                                rules={[
                                  {
                                    required: !checkedIsForeign,
                                    message: "กรุณากรอกข้อมูล"
                                  },
                                  {
                                    pattern: /^[\.0-9]*$/,
                                    message: "กรอกได้เฉพาะตัวเลขเท่านั้น"
                                  },
                                  {
                                    min: 10,
                                    message: GetIntlMessages("กรุณากรอกข้อมูลให้ครบจำนวน 10-13 หลัก"),
                                  },
                                  {
                                    max: 13,
                                    message: GetIntlMessages("กรุณากรอกข้อมูลให้ครบจำนวน 10-13 หลัก"),
                                  },
                                ]}>
                                <Input disabled={configModal.mode == "view"} maxLength={13} />
                              </Form.Item>
                              <Form.Item
                                name="branch"
                                label={GetIntlMessages("สำนักงาน/สาขา")}
                                rules={[
                                  {
                                    required: true,
                                    message: GetIntlMessages("กรุณาเลือกข้อมูล")
                                  },
                                ]}
                              >
                                <Radio.Group onChange={(val) => onChangeBranch(val)} disabled={configModal.mode == "view"}>
                                  <Radio value="office"> สำนักงานใหญ่ </Radio>
                                  <Radio value="branch"> สาขา </Radio>
                                </Radio.Group>
                              </Form.Item>
                              {
                                IsBranch ?
                                  <>
                                    <Form.Item
                                      name="branch_code"
                                      label={GetIntlMessages("รหัสสาขา")}
                                      rules={
                                        [
                                          {
                                            required: IsBranch,
                                            message: "กรุณากรอกข้อมูล",
                                          },
                                          {
                                            min: 5,
                                            message: "กรุณากรอกข้อมูลให้ถูกต้อง",
                                          },
                                          {
                                            pattern: new RegExp("^[0-9]*$"),
                                            message: "กรอกได้เฉพาะตัวเลขเท่านั้น",
                                          }
                                        ]
                                      }
                                    >
                                      <Input type={'text'} disabled={configModal.mode == "view"} maxLength={5} placeholder="000001" />
                                    </Form.Item>

                                    <Form.Item
                                      name="branch_name"
                                      label={GetIntlMessages("ชื่อสาขา")}
                                      rules={
                                        [
                                          {
                                            required: IsBranch,
                                            message: "กรุณากรอกข้อมูล",
                                          },
                                        ]
                                      }
                                    >
                                      <Input type={'text'} disabled={configModal.mode == "view"} maxLength={200} placeholder="กรอกชื่อสาขา" />
                                    </Form.Item>
                                  </>
                                  : <></>

                              }

                              <Form.Item
                                name="bus_type_id"
                                label={GetIntlMessages("business-type")}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล"
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="เลือกข้อมูล"
                                  optionFilterProp="children"
                                  disabled={configModal.mode == "view"}
                                  showSearch
                                >
                                  {businessTypeList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                      {e.business_type_name[locale.locale]}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>

                              <Form.Item
                                name="tax_type_id"
                                label={GetIntlMessages("tax-type")}
                                rules={[
                                  {
                                    required: true,
                                    message: "กรุณากรอกข้อมูล"
                                  },
                                ]}
                              >
                                <Select
                                  placeholder="เลือกข้อมูล"
                                  optionFilterProp="children"
                                  showSearch
                                  disabled={configModal.mode == "view"}
                                >
                                  {taxTypeTypeList.map((e, index) => (
                                    <Select.Option value={e.id} key={index}>
                                      {e.type_name[locale.locale]}
                                    </Select.Option>
                                  ))}
                                </Select>
                              </Form.Item>

                              <FormInputLanguage
                                icon={formLocale}
                                label={GetIntlMessages("business-name")}
                                name="partner_name"
                                disabled={configModal.mode == "view"}
                              />

                              <Form.Item
                                label={GetIntlMessages("tel-no")}
                                name="tel_no"
                              >
                                <Form.List name="tel_no" >
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map((field, index) => (
                                        <Form.Item
                                          required={false}
                                          key={field.key}
                                          style={{ margin: 0 }}
                                        >
                                          <Row gutter={[0, 20]}>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 22 : 24}>
                                              <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "tel_no"]}
                                                fieldKey={[field.fieldKey, "tel_no"]}
                                                // noStyle
                                                style={{ margin: 0 }}
                                                className="mb-3"
                                              >
                                                <MaskedInput
                                                  className='ant-input'
                                                  disabled={configModal.mode == "view"}
                                                  style={{ width: '100%' }}
                                                  // style={{ width: fields.length > 1 ? '85%' : '100%' }}
                                                  maskGenerator={masktel_no}
                                                />
                                                {/* <Input disabled={configModal.mode == "view"} style={{ width: fields.length > 1 ? '85%' : '100%' }} /> */}
                                              </Form.Item>
                                            </Col>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 2 : 0}>
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
                                      <Form.Item hidden={configModal.mode === "view"}>
                                        {configModal.mode != "view" ?
                                          <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                          >
                                            {GetIntlMessages("mobile-no")}
                                          </Button> : null
                                        }
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
                              </Form.Item>

                              <Form.Item
                                label={<>{GetIntlMessages("mobile-no")}</>}
                                name="mobile_no"
                              >
                                <Form.List name="mobile_no" >
                                  {(fields, { add, remove }) => (
                                    <>
                                      {fields.map((field, index) => (
                                        <Form.Item
                                          required={false}
                                          key={field.key}
                                          style={{ margin: 0 }}
                                        >
                                          <Row gutter={[0, 20]}>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 22 : 24}>
                                              <Form.Item
                                                {...field}
                                                validateTrigger={['onChange', 'onBlur']}
                                                name={[field.name, "mobile_no"]}
                                                fieldKey={[field.fieldKey, "mobile_no"]}
                                                // noStyle
                                                style={{ margin: 0 }}
                                                // rules={[
                                                //   {
                                                //     required: field.key === 0 ? true : false,
                                                //     message: GetIntlMessages("กรุณากรอกเบอร์มือถืออย่างน้อย 1 เบอร์")
                                                //   }
                                                // ]}
                                                className="mb-3"
                                              >
                                                <MaskedInput
                                                  className='ant-input'
                                                  disabled={configModal.mode == "view"}
                                                  style={{ width: '100%' }}
                                                  maskGenerator={maskmobile_no}
                                                />
                                              </Form.Item>
                                            </Col>
                                            <Col span={fields.length > 1 && configModal.mode != "view" ? 2 : 0}>
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
                                      <Form.Item hidden={configModal.mode === "view"}>
                                        {configModal.mode != "view" ?
                                          <Button
                                            type="dashed"
                                            onClick={() => add()}
                                            block
                                            icon={<PlusOutlined />}
                                          >
                                            {GetIntlMessages("mobile-no")}
                                          </Button> : null
                                        }
                                      </Form.Item>
                                    </>
                                  )}
                                </Form.List>
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
                                    pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: "Please only English",
                                  },
                                ]}
                              >
                                <Input disabled={configModal.mode == "view"} />
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
                                onChange={addEditViewModal}
                                form={form}
                                disabled={configModal.mode == "view"}
                                mode={configModal.mode}
                                validatename={{ Province: !checkedIsForeign, District: !checkedIsForeign, Subdistrict: !checkedIsForeign, ZipCode: !checkedIsForeign }}
                              />
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
                      <Col xs={24} xl={24}>
                        <Fieldset legend={`ข้อมูลการเงิน`} className={"fieldset-business-customer"}>
                          <Form.Item
                            name="credit_limit"
                            label={GetIntlMessages("วงเงินเครดิต")}
                            rules={[
                              {
                                required: true,
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
                        {configModal.mode !== "add" ? (
                          <Fieldset legend={`ข้อมูลระบบ`} className={"fieldset-business-customer"}>

                            <Form.Item name="isuse" label={GetIntlMessages("status")}>
                              <Switch
                                disabled={configModal.mode == "view"}
                                checked={checkedIsuse}
                                onChange={(bool) => setCheckedIsuse(bool)}
                                checkedChildren={GetIntlMessages("work")}
                                unCheckedChildren={GetIntlMessages("cancel")}
                              />
                            </Form.Item>
                          </Fieldset>
                        ) : null}
                      </Col>
                    </Row>,
                },
              ]}
            />


          </Form>
        </ModalFullScreen>

        {/* Import Modal */}

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
              action={`${process.env.NEXT_PUBLIC_SERVICE}/post`}
              fileList={fileImportList}
              multiple={false}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Modal>
      </div>

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
        <MultiContactor customerInfo={{ customer_type: "businessPartners", customer_id: MultiContactorData.id }} />
      </Modal>

      <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
            `}</style>
    </>
  );
};

export default BusinessPartnersData;
