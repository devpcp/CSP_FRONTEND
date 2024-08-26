import { useEffect, useState } from 'react'
import { message, Modal, Form, Row, Col, Image, Select, Input, DatePicker, Button } from 'antd';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import SearchInput from '../../components/shares/SearchInput'
import TableList from '../../components/shares/TableList'
import { FormInputLanguage, } from '../../components/shares/FormLanguage';
import { get } from 'lodash';
import GetIntlMessages from '../../util/GetIntlMessages';
import ImageSingleShares from '../../components/shares/FormUpload/ImageSingle';
import { CheckImage, UploadImageSingle } from '../../components/shares/FormUpload/API';
import FormProvinceDistrictSubdistrict from "../../components/shares/FormProvinceDistrictSubdistrict";
import Fieldset from '../../components/shares/Fieldset';
import EmployeeData from './EmployeeData';

const TransportVehicleData = ({ title = null }) => {

  const [loading, setLoading] = useState(false);
  // const { authUser, imageProfile } = useSelector(({ auth }) => auth);
  const [listSearchDataTable, setListSearchDataTable] = useState([])
  const [columns, setColumns] = useState([])
  const { permission_obj } = useSelector(({ permission }) => permission);
  const { locale } = useSelector(({ settings }) => settings);
  const [formLocale, setFormLocale] = useState(locale.icon)
  const [imgEmpUrl, setImgEmpUrl] = useState(false)
  const { vehicleColors, vehicleType, vehicleBrand, vehicleModelType, province } = useSelector(({ master }) => master);
  const [productCompleteSize, setProductCompleteSizeList] = useState([])
  const [isBankAccountDataModalVisible, setIsBankAccountDataModalVisible] = useState(false);

  const validateNumberandEn = "^[a-zA-Z0-9_.-]*$";
  const validateNumber = "^[0-9]*$";
  const dateFormat = "DD/MM/YYYY";


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
        status: false
      }
    },
    configSort: {
      sort: `updated_date`,
      order: "descend",
    },
    modelSearch: {
      search: "",
      status: "default",
    },
  }

  /** Config ตาราง */
  const [configTable, setConfigTable] = useState(init.configTable)

  /** Config เรียงลำดับ ของ ตาราง */
  const [configSort, setConfigSort] = useState(init.configSort)

  /** ตัวแปล Search */
  const [modelSearch, setModelSearch] = useState(init.modelSearch)



  const setColumnsTable = () => {
    const _column = [
      {
        title: () => GetIntlMessages("order"),
        dataIndex: 'num',
        key: 'num',
        align: "center",
        width: "100",
        render: (text, record, index) => {
          index += ((configTable.page - 1) * configTable.limit)
          return index + 1
        },
      },

      {
        title: () => GetIntlMessages("ทะเบียนรถ"),
        dataIndex: 'tag_name',
        key: 'tag_name',
        width: "200",
        render: (text, record) => get(text, `${locale.locale}`, "-"),
      },
      {
        title: () => GetIntlMessages("จังหวัด"),
        dataIndex: 'tag_name',
        key: 'tag_name',
        width: "200",
        render: (text, record) => get(text, `${locale.locale}`, "-"),
      },
      {
        title: () => GetIntlMessages("ยี่ห้อ"),
        dataIndex: 'tag_name',
        key: 'tag_name',
        width: "200",
        render: (text, record) => get(text, `${locale.locale}`, "-"),
      },
      {
        title: () => GetIntlMessages("รุ่น"),
        dataIndex: 'tag_name',
        key: 'tag_name',
        width: "200",
        render: (text, record) => get(text, `${locale.locale}`, "-"),
      },

    ];

    setColumns(_column)
  }


  useEffect(() => {
    getDataSearch({
      page: configTable.page,
      search: modelSearch.search,
      _status: modelSearch.status,
      department_id: modelSearch.department_id
    })

    getMasterData()
  }, [])

  useEffect(() => {
    if (permission_obj)
      setColumnsTable()

  }, [configTable.page, configSort.order, configSort.sort, permission_obj, locale])



  /* เรียกข้อมูล ขนาดไซส์สำเร็จรูป ทั้งหมด */
  const getProductCompleteSizeListAll = async () => {
    // const { data } = await API.get(`/productCompleteSize/all?limit=999999&page=1&sort=code_id&order=asc&which=${(status === "management") ? "michelin data" : "my data"}`)
    const { data } = await API.get(`/productCompleteSize/all?limit=999999&page=1&sort=complete_size_name.th&order=asc`)
    return data.data
  }

  /* ค้นหา */
  const getDataSearch = async ({ search = modelSearch.search ?? "", department_id = modelSearch.department_id ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status }) => {
    try {
      if (page === 1) setLoading(true)

      let url = `/tags/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}${department_id ? `&department_id=${department_id}` : ""}`

      const res = await API.get(url)
      if (res.data.status === "success") {
        const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
        setListSearchDataTable(data)
        // setTotal(totalCount);
        setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
        if (page === 1) setLoading(false)
      } else {
        // console.log(`res.data`, res.data)
        message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        if (page === 1) setLoading(false)
      }
    } catch (error) {
      console.log('error :>> ', error);
      message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
      if (page === 1) setLoading(false)
    }
  }

  /* เปลี่ยนสถานะ */
  const changeStatus = async (isuse, id) => {
    try {
      // delete,active,block
      const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
      // console.log('changeStatus :>> ', status, id);

      const { data } = await API.put(`/tags/put/${id}`, { status })
      if (data.status != "success") {
        message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
      } else {
        message.success("บันทึกข้อมูลสำเร็จ");
        console.log(`search`, modelSearch.search)
        getDataSearch({
          page: configTable.page,
          search: modelSearch.search,
        })
      }

    } catch (error) {
      message.error('มีบางอย่างผิดพลาด แก้ไขไม่สำเร็จ !!');
    }
  }

  /* addEditView */
  const addEditViewModal = async (mode, id) => {
    try {
      // setMode(_mode)
      setImgEmpUrl("/assets/images/profiles/avatar.jpg")
      setConfigModal({ ...configModal, mode })
      if (id) {
        setIsIdEdit(id)
        const { data } = await API.get(`/tags/byid/${id}`)
        if (data.status == "success") {
          const _model = data.data
          const urlImg = await CheckImage({
            directory: "tags",
            name: id,
            fileDirectoryId: id,
          })
          setImgEmpUrl(urlImg)
          form.setFieldsValue(_model)
        }

      }

      setIsModalVisible(true)
    } catch (error) {
      console.log(`error`, error)
    }
  }


  /* Modal */
  const [configModal, setConfigModal] = useState({
    mode: "add",
    maxHeight: 600,
    overflowX: "auto",
  })

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idEdit, setIsIdEdit] = useState(null);
  const [form] = Form.useForm();

  const handleOk = () => {
    form.submit()
  }

  const handleCancel = () => {
    form.resetFields()
    setConfigModal({ ...configModal, mode: 'add' })
    setIsModalVisible(false)
  }

  const onFinish = async (value) => {
    try {
      console.log(value)

      if (value.upload) {
        // await UploadImageSingle(value.upload.file, { name: idEdit, directory: "tags" })

        // const urlImg = await CheckImage({
        //   directory: "tags",
        //   name: idEdit,
        //   fileDirectoryId: idEdit,
        // })
        setImgEmpUrl(urlImg)
        // dispatch(setImageProfile(urlImg));
      }

      const _model = {
        tag_name: value.tag_name,
        tag_type: 0,
      }

      // let res
      // if (configModal.mode === "add") {
      //   res = await API.post(`/tags/add`, _model)
      // } else if (configModal.mode === "edit") {
      //   res = await API.put(`/tags/put/${idEdit}`, _model)
      // }

      // if (res.data.status == "success") {
      //   message.success('บันทึกสำเร็จ');
      //   setIsModalVisible(false)
      //   setConfigModal({ ...configModal, mode: "add" })
      //   form.resetFields()
      //   getDataSearch({
      //     page: configTable.page,
      //     search: modelSearch.search,
      //   })
      // } else {
      //   message.error('มีบางอย่างผิดพลาด !!');
      // }

    } catch (error) {
      message.error('มีบางอย่างผิดพลาด !!');
      console.log('error :>> ', error);
    }
  }

  const onFinishFailed = (error) => {
    // message.warn('กรอกข้อมูลให้ครบถ้วน !!');
  }

  /* master */

  const getMasterData = async () => {
    try {
      const promise1 = getProductCompleteSizeListAll(); // ขนาดไซส์สำเร็จรูป
      Promise.all([promise1,]).then((values) => {
        setProductCompleteSizeList(values[0])
      });
    } catch (error) {
      console.log("error", error)
    }
  }


  const onFinishError = (error) => {
    console.log(`error`, error)
  }

  /** กดปุ่มค้นหา */
  const onFinishSearch = (value) => {
    setModelSearch(value)
    getDataSearch({ search: value.search, _status: value.status, page: init.configTable.page })
  }

  /** กดปุ่มค่าเริ่มต้น */
  const onReset = () => {
    setConfigTable(init.configTable)
    setConfigSort(init.configSort)
    setModelSearch(init.modelSearch)
    getDataSearch({
      search: init.modelSearch.search ?? "",
      _status: init.modelSearch.status,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: (init.configSort.order === "descend" ? "desc" : "asc"),
    })
  }

  /** กดปุ่มเครียร์ Dropdown */
  // const onClearFilterSearch = (type) => {
  //     try {
  //         const searchModel = {
  //             ...modelSearch
  //         }

  //         switch (type) {
  //             case "department_id":
  //                 searchModel[type] = null
  //                 searchModel.department_id = null
  //                 break;
  //             default:
  //                 break;
  //         }
  //         setModelSearch((previousValue) => searchModel);
  //     } catch (error) {

  //     }
  // }

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
      download: false,
      import: false,
      export: false,
    },
    onFinishSearch,
    onFinishError,
    onReset,
  }

  const onChangeVehicleType = async (value) => {
    try {
      const { vehicle_brand_id } = form.getFieldValue();
      form.setFieldsValue({
        vehicle_model_id: null,
      });
    } catch (error) {
      console.log("error", error);
    }
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
      // setVehicleModelType(() => modelTypeList);
    } catch (error) {
      console.log("error", error);
    }
  };

  const getVehicleModelTypeBybrandid = async (
    vehicles_brand_id = "",
    vehicles_type_id = ""
  ) => {
    if (vehicles_brand_id) {
      const { data } = await API.get(
        `/master/vehicleModelType/all?limit=99999&page=1&sort=code_id&dropdown=true&order=asc&status=active${vehicles_brand_id ? `&vehicles_brand_id=${vehicles_brand_id}` : ""
        }${vehicles_type_id ? `&vehicles_type_id=${vehicles_type_id}` : ""}`
      );
      // const { data } = await API.get(`/master/vehicleModelType/bybrandid/${id}`);
      return data.status == "success" ? data.data.data : [];
    }
  };

  const onChangeVehicleColor = async (value) => {
    try {
      const { vehicle_color_id } = form.getFieldValue();
    } catch (error) {
      console.log("error", error);
    }
  };
  const handleCancelCarInfoModal = () => {
    try {
      setIsBankAccountDataModalVisible(false)
    } catch (error) {

    }
  }
  const callback = (data) => {
    setIsBankAccountDataModalVisible(false)
    console.log("callback", data)
    form.setFieldsValue({
      employee_driver_id: data.id,
      employee_driver_name: data.UsersProfile.fname[locale.locale] + " " + data.UsersProfile.lname[locale.locale],
    });
  }

  return (
    <>

      <div id="page-manage">
        <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
        <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} value={modelSearch} title={title !== null ? false : true} />
        <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />

        <Modal
          maskClosable={false}
          centered
          title={`${configModal.mode == "view" ? "ดูข้อมูล" : configModal.mode == "edit" ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล"}รถขนส่ง`}
          visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
          okButtonProps={{ disabled: configModal.mode == "view" }}
          bodyStyle={{
            maxHeight: "80vh",
            overflowX: "auto",
            borderRadius: "30px"
          }}
          width={"80vw"}
        >
          <Form
            form={form}
            labelCol={{ xl: 5, xs: 7 }}
            wrapperCol={{ xl: 19, xs: 17 }}
            layout="horizontal"
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >

            {/* <Fieldset legend={`ข้อมูลเช็ค`} className={"fieldset-business-customer"}> */}
            <Row style={{ paddingBottom: "20px" }}>
              <Col xs={24} xl={12}>
                {/* <Image
                  width={200}
                  src={imgEmpUrl}
                /> */}

                <Form.Item
                  name="registration"
                  rules={[
                    {
                      required: true,
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
                    disabled={false}
                    placeholder='1กข 1234'
                  />
                </Form.Item>
                <FormProvinceDistrictSubdistrict
                  name={{ province: "province_name" }}
                  form={form}
                  disabled={false}
                  hideDistrict={true}
                  hideSubdistrict={true}
                  hideZipCode={true}
                  provinceValue="name"
                  validatename={{ Province: true }}
                />
                <Form.Item
                  name='employee_driver_id'
                  label={GetIntlMessages("พนักงานประจำรถ")}
                  hidden
                >
                  <Input hidden />
                </Form.Item>
                <Form.Item
                  name='employee_driver_name'
                  label={GetIntlMessages("พนักงานประจำรถ")}
                >
                  <Input disabled addonAfter={
                    <Button
                      type='text'
                      size='small'
                      style={{ border: 0 }}
                      onClick={() => setIsBankAccountDataModalVisible(true)}
                    >
                      เลือก
                    </Button>
                  } />
                </Form.Item>
                <Form.Item
                  name="vehicle_type_id"
                  label={GetIntlMessages(`vehicle-type`)}
                  rules={[
                    {
                      required: false,
                      message: GetIntlMessages(
                        `fill-out-the-information-completely`
                      ),
                    },
                  ]}
                >
                  <Select
                    disabled={false}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onChange={onChangeVehicleType}
                    style={{ width: "100%" }}
                    placeholder='เลือกข้อมูล'
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
                      required: false,
                      message: GetIntlMessages(
                        `fill-out-the-information-completely`
                      ),
                    },
                  ]}
                >
                  <Select
                    disabled={false}
                    showSearch
                    filterOption={(input, option) =>
                      option.children
                        .toLowerCase()
                        .toString()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                    style={{ width: "100%" }}
                    placeholder='เลือกข้อมูล'
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
                      required: false,
                      message: GetIntlMessages(
                        `fill-out-the-information-completely`
                      ),
                    },
                  ]}
                >
                  <Select
                    disabled={false}
                    showSearch
                    optionFilterProp="children"
                    style={{ width: "100%" }}
                    placeholder='เลือกข้อมูล'
                  >
                    {vehicleModelType.map((e) => (
                      <Select.Option key={e.id} value={e.id}>
                        {e.model_name[locale.locale]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="tyre_size_front"
                  label={GetIntlMessages(`ไซต์ยางหน้า`)}
                  rules={[
                    {
                      pattern: validateNumberandEn,
                      message: GetIntlMessages(`enter-your-engine-number`),
                    },
                  ]}

                >
                  <Select
                    dropdownMatchSelectWidth={false}
                    placeholder="เลือกข้อมูล"
                    showSearch
                    optionFilterProp="children">
                    {productCompleteSize.map((e, index) => (<Select.Option key={`size-${index}-${e.id}`} value={e.id}>{e.complete_size_name[locale.locale]}</Select.Option>))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="tyre_size_rear"
                  label={GetIntlMessages(`ไซต์ยางหลัง`)}
                  rules={[
                    {
                      pattern: validateNumberandEn,
                      message: GetIntlMessages(`enter-your-engine-number`),
                    },
                  ]}

                >
                  <Select
                    dropdownMatchSelectWidth={false}
                    placeholder="เลือกข้อมูล"
                    showSearch
                    optionFilterProp="children">
                    {productCompleteSize.map((e, index) => (<Select.Option key={`size-${index}-${e.id}`} value={e.id}>{e.complete_size_name[locale.locale]}</Select.Option>))}
                  </Select>
                </Form.Item>

              </Col>
              <Col xs={24} xl={12}>
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
                    disabled={false}
                    placeholder='กรอกข้อมูล'
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
                    disabled={false}
                    placeholder='กรอกข้อมูล'
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
                    disabled={false}
                    placeholder='กรอกข้อมูล'
                  />
                </Form.Item>

                <Form.Item
                  name="color"
                  label={GetIntlMessages(`color-car`)}
                  rules={[
                    {
                      required: false,
                      message: GetIntlMessages(
                        `fill-out-the-information-completely`
                      ),
                    },
                  ]}
                >
                  <Select
                    disabled={false}
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                      0
                    }
                    onChange={onChangeVehicleColor}
                    style={{ width: "100%" }}
                    placeholder='เลือกข้อมูล'
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
                      required: true,
                      message: GetIntlMessages("please-fill-out")
                    },
                    {
                      pattern: validateNumber,
                      message: GetIntlMessages(`only-number`),
                    },
                  ]}
                >
                  <Input
                    type={"text"}
                    maxLength={8}
                    disabled={configModal.mode === "add" ? false : true}
                    placeholder='กรอกข้อมูล'
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
                    disabled={true}
                    placeholder='กรอกข้อมูล'
                  />
                </Form.Item>


                <Form.Item name="remark" label={GetIntlMessages(`remark`)}>
                  <Input.TextArea
                    rows={5}
                    maxLength={200}
                    disabled={false}
                    placeholder='กรอกข้อมูล'
                  />
                </Form.Item>

              </Col>
            </Row>
            {/* </Fieldset> */}

          </Form>
        </Modal>
        <Modal
          maskClosable={false}
          open={isBankAccountDataModalVisible}
          onCancel={handleCancelCarInfoModal}
          width="90vw"
          footer={(
            <>
              <Button onClick={() => handleCancelCarInfoModal()}>{GetIntlMessages("กลับ")}</Button>
            </>
          )}
        >
          <EmployeeData title="จัดการข้อมูลพนักงาน" callBack={callback} />
        </Modal>

      </div>
      <style global>{`
                .fieldset-business-customer{
                    padding: 8px;
                }
              
            `}</style>
    </>
  )
}

export default TransportVehicleData
