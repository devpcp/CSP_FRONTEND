import moment from "moment";
import { useEffect, useState } from "react";
import { message, Form, Input, Modal, Switch, Button, Row, Col, Typography } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

import SearchInput from "../../../components/shares/SearchInput";
import TableList from "../../../components/shares/TableList";

import API from "../../../util/Api";
import FormSelectLanguage from "../../../components/shares/FormLanguage/FormSelectLanguage";
import { useSelector } from "react-redux";
import FormInputLanguage from "../../../components/shares/FormLanguage/FormInputLanguage";
import GetIntlMessages from "../../../util/GetIntlMessages";
import { isArray, isPlainObject, isFunction } from "lodash";

const { Text, Link } = Typography;

const WarehousesDatasManagement = ({ title = null, callBack, listIndex }) => {
  const [loading, setLoading] = useState(false);
  const { locale } = useSelector(({ settings }) => settings);

  const [listSearchDataTable, setListSearchDataTable] = useState([]);
  const [columns, setColumns] = useState([]);
  const [formLocale, setFormLocale] = useState(locale.icon);

  const init = {
    configTable: {
      page: 1,
      total: 0,
      limit: 10,
      sort: "code_id",
      order: "ascend",
    },
    configSort: {
      sort: "code_id",
      order: "ascend",
    },
    modelSearch: {
      search: null,
      status: "default",
    },
  };

  const [configTable, setConfigTable] = useState(init.configTable);

  const [configSort, setConfigSort] = useState(init.configSort);

  const [modelSearch, setModelSearch] = useState(init.modelSearch);

  useEffect(() => {
    getDataSearch({});
  }, []);

  useEffect(() => {
    setColumnsTable();
  }, [configTable.page, configSort.order, configSort.sort]);

  useEffect(() => {
    setColumnsTable()
  }, [listIndex]);

  /* configSearch */
  const setColumnsTable = () => {
    const _column = [
      {
        title: () => GetIntlMessages("no-num"),
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
        title: () => GetIntlMessages("warehouses-code"),
        dataIndex: "code_id",
        key: "code_id",
        width: 150,
        align: "center",
        sorter: (a, b, c) => { },
        sortOrder: configSort.sort == "code_id" ? configSort.order : false,
        onHeaderCell: (obj) => {
          return {
            onClick: () => {
              getDataSearch({
                sort: "code_id",
                order: configSort.order !== "descend" ? "desc" : "asc",
              });
              setConfigSort({
                sort: "code_id",
                order: configSort.order === "ascend" ? "descend" : "ascend",
              });
            },
          };
        },
        render: (text, record) => {
          if (isFunction(callBack)) {
            return (
              <Link href="#" onClick={() => callBack(record, listIndex)}>
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
        title: () => GetIntlMessages("warehouses-name"),
        dataIndex: "name",
        key: "name",
        width: 250,
        align: "center",
        render: (text, record, index) => {
          return isPlainObject(text) ? text[locale.locale] : "-";
        },
      },
      {
        title: () => GetIntlMessages("shelf"),
        dataIndex: "shelf_total",
        key: "shelf_total",
        width: 100,
        align: "center",
      },

      {
        title: () => GetIntlMessages("created-by"),
        dataIndex: "created_by",
        key: "created_by",
        width: 200,
      },
      {
        title: () => GetIntlMessages("created-date"),
        dataIndex: "created_date",
        key: "created_date",
        width: 150,
        render: (text, record) =>
          text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
      },
      {
        title: () => GetIntlMessages("updated-by"),
        dataIndex: "updated_by",
        key: "updated_by",
        width: 150,
        render: (text, record) => (text ? text : "-"),
      },
      {
        title: () => GetIntlMessages("updated-date"),
        dataIndex: "updated_date",
        key: "updated_date",
        width: 150,
        render: (text, record) =>
          text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
      },
      {
        title: () => GetIntlMessages("เลือก"),
        dataIndex: 'cheque_number',
        key: 'cheque_number',
        width: 100,
        align: "center",
        use: isFunction(callBack) ?? false,
        render: (text, record) => (
          <Button onClick={() => callBack(record, listIndex)}>เลือก</Button>
        ),
      },
    ];

    _column.map((x) => { x.use === undefined ? x.use = true : null })
    setColumns(_column.filter(x => x.use === true));
  };

  const getDataSearch = async ({
    search = modelSearch.search ?? "",
    limit = configTable.limit,
    page = configTable.page,
    sort = configSort.sort,
    order = configSort.order === "descend" ? "desc" : "asc",
    status = modelSearch.status,
  }) => {
    try {
      if (page === 1) setLoading(true);
      const res = await API.get(
        `/shopWarehouses/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${status}&search=${search}`
      );
      if (res.data.status === "success") {
        const { totalCount, data } = res.data.data;
        setListSearchDataTable(data);
        setConfigTable({
          ...configTable,
          page: page,
          total: totalCount,
          limit: limit,
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

  const onFinishSearch = (value) => {
    setModelSearch({ ...modelSearch, search: value.search });
    getDataSearch({ search: value.search });
  };

  const onReset = () => {
    setConfigTable(init.configTable);
    setConfigSort(init.configSort);
    setModelSearch(init.modelSearch);

    getDataSearch({
      search: init.modelSearch.search ?? "",
      status: init.modelSearch.status,
      limit: init.configTable.limit,
      page: init.configTable.page,
      sort: init.configSort.sort,
      order: init.configSort.order === "descend" ? "desc" : "asc",
    });
  };

  const onFinishError = (error) => {
    console.log(`error`, error);
  };

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

  /* addEditView */
  const addEditViewModal = async (mode, id) => {
    try {
      setConfigModal({ ...configModal, mode });
      if (id) {
        setIsIdEdit(id);
        const { data } = await API.get(`/shopWarehouses/byid/${id}`);
        if (
          data.status == "success" &&
          isArray(data.data) &&
          data.data.length > 0
        ) {
          data.data[0].shelf.map((v) => {
            if (v.status == "active") {
              v.status = true;
            } else {
              v.status = false;
            }
          });
          formModal.setFieldsValue(data.data[0]);
        }
      }
      setIsModalVisible(true);
    } catch (error) {
      console.log(`error`, error);
    }
  };
  /* configModal */
  const [configModal, setConfigModal] = useState({
    mode: "add",
    maxHeight: 600,
    overflowX: "auto",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [idEdit, setIsIdEdit] = useState(null);
  const [checkedIsuse, setCheckedIsuse] = useState(false);
  const [formModal] = Form.useForm();

  const handleOkModal = () => {
    formModal.submit();
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setConfigModal({ ...configModal, mode: "add" });
    formModal.resetFields();
  };

  const onFinish = async (val) => {
    try {
      const _model = {
        code_id: val.code_id,
        name: val.name,
        shelf: val.shelf
          ? val.shelf.map((e, index) => {
            return { ...e, item: index + 1 };
          })
          : [],
      };

      let res;
      if (configModal.mode === "add") {
        _model.shelf.map((v) => {
          v.status = "active";
        });
        res = await API.post(`/shopWarehouses/add`, _model);
      } else if (configModal.mode === "edit") {
        _model.shelf.map((v) => {
          if (v.status) {
            v.status = "active";
          } else {
            v.status = "block";
          }
        });

        _model.status = checkedIsuse ? "active" : "block";
        res = await API.put(`/shopWarehouses/put/${idEdit}`, _model);
      }

      console.log(`res.data`, res.data);
      if (res.data.status == "success") {
        message.success("บันทึกสำเร็จ");
        handleCancelModal();
        getDataSearch({});
      } else {
        message.error(
          locale.locale !== "th" ? res.data.data : "รหัสชั้นวางซ้ำ !!"
        );
      }
    } catch (error) {
      message.error("มีบางอย่างผิดพลาด !!");
    }
  };

  const onFinishFailed = (error) => {
    message.warn("กรอกข้อมูลให้ครบถ้วน !!");
  };
  const EventFormlst = (fields, field, remove) => {
    // if (fields.length > 1) {
    if (configModal.mode == "add") {
      return (
        <MinusCircleOutlined
          className="dynamic-delete-button"
          style={{ fontSize: 18, paddingLeft: 10 }}
          onClick={() => remove(field.name)}
        />
      );
    } else if (configModal.mode == "edit") {
      return (
        <Form.Item
          validateTrigger={["onChange", "onBlur"]}
          name={[field.name, "status"]}
          fieldKey={[field.fieldKey, "status"]}
          valuePropName="checked"
        >
          <Switch
            checkedChildren={GetIntlMessages("active")}
            unCheckedChildren={GetIntlMessages("block")}
            disabled={configModal.mode == "view"}
          />
        </Form.Item>
      );
    }
    // }
  };

  return (
    <>
      <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
      <SearchInput
        configSearch={configSearch}
        configModal={configModal}
        loading={loading}
        onAdd={() => setIsModalVisible(true)}
        title={title !== null ? false : true}
      />
      <TableList
        columns={columns}
        data={listSearchDataTable}
        loading={loading}
        configTable={configTable}
        callbackSearch={getDataSearch}
        addEditViewModal={addEditViewModal}
        hideManagement={isFunction(callBack) ?? false}
      />

      <Modal
        width={650}
        maskClosable={false}
        title={`${configModal.mode == "view"
          ? "ดูข้อมูล"
          : configModal.mode == "edit"
            ? "แก้ไขข้อมูล"
            : "เพิ่มข้อมูล"
          }`}
        visible={isModalVisible}
        onOk={handleOkModal}
        onCancel={handleCancelModal}
        okButtonProps={{ disabled: configModal.mode == "view" }}
        bodyStyle={{
          maxHeight: configModal.maxHeight ?? 600,
          overflowX: configModal.overflowX ?? "auto",
        }}
      >
        <h3>{GetIntlMessages("warehouses")}</h3>
        <hr />
        <Form
          form={formModal}
          labelCol={{ span: 7 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
        >
          <FormSelectLanguage
            config={
              configModal.mode != "view"
                ? {
                  form: formModal,
                  field: ["name", { name: "shelf", field: "name" }],
                }
                : null
            }
            onChange={(value) => setFormLocale(value)}
          />

          <Form.Item
            rules={[
              {
                required: true,
                message: "กรุณากรอกรหัสคลังสินค้า !!!",
              },
            ]}
            name="code_id"
            type="text"
            label={GetIntlMessages("warehouses-code")}
          >
            <Input
              disabled={
                configModal.mode == "view" || configModal.mode == "edit"
              }
            />
          </Form.Item>

          <FormInputLanguage
            disabled={configModal.mode == "view"}
            icon={formLocale}
            label={GetIntlMessages("warehouses-name")}
            name="name"
            rules={[
              {
                required: true,
                message: "กรุณากรอกชื่อคลังสินค้า !!!",
              },
            ]}
          />
          <h3>{GetIntlMessages("shelf")}</h3>
          <hr />
          <Form.Item label=" " name="shelf">
            <Form.List name="shelf">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item required={false} key={field.key}>
                      <Row>
                        <Col span={22} style={{ width: "100%" }}>
                          <Form.Item label={GetIntlMessages("no-num")}>
                            <Input
                              placeholder={GetIntlMessages("no-num")}
                              value={index + 1}
                              disabled={true}
                              style={{ width: "50%" }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ width: "100%" }}>
                          {EventFormlst(fields, field, remove)}
                        </Col>
                      </Row>
                      <Form.Item
                        validateTrigger={["onChange", "onBlur"]}
                        name={[field.name, "code"]}
                        fieldKey={[field.fieldKey, "code"]}
                        label={GetIntlMessages("shelf-code")}
                        rules={[
                          {
                            required: true,
                            message: "กรุณากรอกรหัสชั้นสินค้า !!!",
                          },
                        ]}
                      >
                        <Input
                          placeholder={GetIntlMessages("shelf-code")}
                          disabled={
                            configModal.mode == "view"
                          }
                        />
                      </Form.Item>

                      <FormInputLanguage
                        disabled={configModal.mode == "view"}
                        icon={formLocale}
                        label={GetIntlMessages("shelf-name")}
                        placeholder={GetIntlMessages("shelf-name")}
                        name={[field.name, "name"]}
                        rules={[
                          {
                            required: true,
                            message: "กรุณากรอกชื่อชั้นสินค้า !!!",
                          },
                        ]}
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    {configModal.mode != "view" ? (
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        {GetIntlMessages("add-data")} {GetIntlMessages("shelf")}
                      </Button>
                    ) : null}
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default WarehousesDatasManagement;
