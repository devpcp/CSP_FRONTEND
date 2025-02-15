import React, { useEffect, useState, } from 'react'
import { Button, Row, Col, Modal, Select } from 'antd';
import GetIntlMessages from '../../../util/GetIntlMessages';
import SearchInput from '../../shares/SearchInput';
import TableList from '../../shares/TableList';
import { get, isArray, isEmpty, isFunction } from 'lodash';
import ModalFullScreen from '../../shares/ModalFullScreen';
import ModalViewDocument from './ModalViewDocument';
import API from '../../../util/Api';
import { useSelector } from 'react-redux';
import moment from 'moment';
import RepairOrder from '../Sales/ShopRetailDocument/RepairOrder';
import ShopServiceOrderDoc from '../Sales/ShopWholesaleDocument/ShopServiceOrderDoc';
import ImportDocuments from '../../../routes/Inventory/ImportDocuments';
import AdjustIncreaseDocuments from '../../../routes/Inventory/AdjustIncreaseDocuments';

const ProductMovement = ({ shopArr = null, mode, visibleMovementModal, setVisibleMovementModal, loading, setLoading, productData, fliterEachMovement, setFliterEachMovement }) => {



    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const { productPurchaseUnitTypes } = useSelector(({ master }) => master);
    const [columns, setColumns] = useState([])
    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const { authUser } = useSelector(({ auth }) => auth);
    const [viewDoc, setViewDoc] = useState(null)
    const [visibleViewDocument, setVisibleViewDocument] = useState(false)
    const [shopId, setShopId] = useState(null)
    const [shopProductId, setProductShopId] = useState(null)

    useEffect(() => {
        setLoading(() => true)
        if (visibleMovementModal === true) {
            if (fliterEachMovement !== undefined && !isEmpty(fliterEachMovement)) {

                console.log("test", fliterEachMovement)
                getDataSearch({
                    page: init.configTable.page,
                    limit: init.configTable.limit,
                    // product_id: productData[0]?.product_id,
                    warehouse_id: fliterEachMovement?.warehouse,
                    warehouse_item_id: fliterEachMovement?.shelf,
                    dot_mfd: fliterEachMovement?.dot_mfd,
                    purchase_unit_id: fliterEachMovement?.purchase_unit_id,
                    shop_id: fliterEachMovement?.shop_id,
                    shop_product_id: fliterEachMovement?.shop_product_id
                    // search: modelSearch.search,
                })
                setShopId(fliterEachMovement?.shop_id)
                setProductShopId(fliterEachMovement?.shop_product_id)
            } else {
                getDataSearch({
                    page: init.configTable.page,
                    limit: init.configTable.limit,
                    // product_id: productData[0]?.product_id,
                    // warehouse_id: fliterEachMovement?.warehouse,
                    // warehouse_item_id: fliterEachMovement?.shelf,
                    // dot_mfd: fliterEachMovement?.dot_mfd,
                    // purchase_unit_id: fliterEachMovement?.purchase_unit_id,
                    shop_id: authUser?.UsersProfile?.ShopsProfile?.id,
                    shop_product_id: productData[0]?.product_id
                    // search: modelSearch.search,
                })
                setShopId(authUser?.UsersProfile?.ShopsProfile?.id)
                setProductShopId(productData[0]?.product_id)
            }
        }

        getMasterData()
        setLoading(() => false)
    }, [visibleMovementModal])

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
        ],
        col: 8,
        button: {
            download: false,
            import: false,
            export: false,
        },
        // onFinishSearch,
        // onFinishError,
        // onReset,
        // downloadTemplate,
        // importExcel,
        // exportExcel,
    }

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
            hide_manage: true,
            move: false,
        },
        configSort: {
            sort: "balance_date",
            order: "ascend",
        },
        modelSearch: {
            search: "",
            status: "default",
        }
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
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 80,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: GetIntlMessages("เลขที่เอกสาร"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 140,
                render: (text, record, index) => {
                    if (record.ShopServiceOrderDoc !== null) {
                        return <Button type='link' style={{ border: 0 }} onClick={() => controlOpenViewDocument(text?.ShopServiceOrderDoc?.code_id, text?.ShopServiceOrderDoc?.DocumentType?.id, text?.shop_id)}>{get(text, `ShopServiceOrderDoc.code_id`, text?.ShopServiceOrderDoc?.code_id ?? "-") ?? "-"}</Button>
                    }
                    if (record.ShopSalesTransactionDoc !== null) {
                        return <Button type='link' style={{ border: 0 }} onClick={() => controlOpenViewDocument(text?.ShopSalesTransactionDoc?.code_id, text?.ShopServiceOrderDoc?.DocumentType?.id, text?.shop_id)}>{get(text, `ShopSalesTransactionDoc.code_id`, text?.ShopSalesTransactionDoc?.code_id ?? "-") ?? "-"}</Button>
                    }
                    if (record.ShopInventoryTransactionDoc !== null) {
                        return <Button type='link' style={{ border: 0 }} onClick={() => controlOpenViewDocument(text?.ShopInventoryTransactionDoc?.code_id, text?.ShopInventoryTransactionDoc?.DocumentType?.id, text?.shop_id)}>{get(text, `ShopInventoryTransactionDoc.code_id`, text?.ShopInventoryTransactionDoc?.code_id ?? "-") ?? "-"}</Button>
                    }
                }
            },
            {
                title: GetIntlMessages("วันที่เอกสาร"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => {
                    if (record.ShopServiceOrderDoc !== null) {
                        return moment(get(text, `ShopServiceOrderDoc.doc_date`, text?.ShopServiceOrderDoc?.doc_date ?? "-")).format("DD/MM/YYYY") ?? "-"
                    }
                    if (record.ShopSalesTransactionDoc !== null) {
                        return moment(get(text, `ShopSalesTransactionDoc.doc_date`, text?.ShopSalesTransactionDoc?.doc_date ?? "-")).format("DD/MM/YYYY") ?? "-"
                    }
                    if (record.ShopInventoryTransactionDoc !== null) {
                        return moment(get(text, `ShopInventoryTransactionDoc.doc_date`, text?.ShopInventoryTransactionDoc?.doc_date ?? "-")).format("DD/MM/YYYY") ?? "-"
                    }
                }
            },
            {
                title: GetIntlMessages("ชื่อเอกสาร"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => {
                    if (record.ShopServiceOrderDoc !== null) {
                        return get(text, `ShopServiceOrderDoc.DocumentType.type_name`, text?.ShopServiceOrderDoc?.DocumentType.type_name ?? "-") ?? "-"
                    }
                    if (record.ShopSalesTransactionDoc !== null) {
                        return get(text, `ShopSalesTransactionDoc.DocumentType.type_name`, text?.ShopSalesTransactionDoc?.DocumentType.type_name ?? "-") ?? "-"
                    }
                    if (record.ShopInventoryTransactionDoc !== null) {
                        return get(text, `ShopInventoryTransactionDoc.DocumentType.type_name`, text?.ShopInventoryTransactionDoc?.DocumentType.type_name ?? "-") ?? "-"
                    }
                }
            },
            {
                title: GetIntlMessages("ชื่อ-สกุล"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 200,
                render: (text, record, index) => {
                    if (record.ShopServiceOrderDoc !== null) {
                        return displayData("name", record, get(text, `ShopServiceOrderDoc.DocumentType`, text?.ShopServiceOrderDoc?.DocumentType ?? "-")) ?? "-"
                    }
                    if (record.ShopSalesTransactionDoc !== null) {
                        return displayData("name", record, get(text, `ShopSalesTransactionDoc.DocumentType`, text?.ShopSalesTransactionDoc?.DocumentType ?? "-")) ?? "-"
                    }
                    if (record.ShopInventoryTransactionDoc !== null) {
                        return displayData("name", record, get(text, `ShopInventoryTransactionDoc.DocumentType`, text?.ShopInventoryTransactionDoc?.DocumentType ?? "-")) ?? "-"
                    }
                }
            },
            {
                title: GetIntlMessages("คลังที่เก็บ"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => displayData("warehouse", record) ?? "-",
            },
            {
                title: GetIntlMessages("ชั้นวาง"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => displayData("shelf", record) ?? "-",
            },
            {
                title: GetIntlMessages("DOT/MFD"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 80,
                render: (text, record, index) => displayData("dot", record) ?? "-",
            },
            {
                title: GetIntlMessages("หน่วยซื้อ"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 80,
                render: (text, record, index) => displayData("purchaseUnit", record) ?? "-",
            },
            {
                title: GetIntlMessages("ยอดยกมา"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => get(text, `count_previous_stock`, "-") ?? "-",
                // render: (text, record, index) => get(text, `previousStockAmount`, "-") ?? "-",
            },
            {
                title: GetIntlMessages("+ รับ / - จ่าย"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => get(text, `count_adjust_stock`, "-") ?? "-",
                // render: (text, record, index) => get(text, `amount`, "-") ?? "-",
            },
            {
                title: GetIntlMessages("ยอดคงเหลือ"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => get(text, `count_current_stock`, "-") ?? "-",
                // render: (text, record, index) => get(text, `currentStockAmount`, "-") ?? "-",
            },
            {
                title: GetIntlMessages("หมายเหตุ"),
                dataIndex: '',
                key: '',
                align: "center",
                width: 120,
                render: (text, record, index) => get(text, `details.reasons`, "-") ?? "-",
                // render: (text, record, index) => get(text, `currentStockAmount`, "-") ?? "-",
            },
        ];
        setColumns(_column)
    }

    const displayData = (type, record, docType) => {
        try {

            // ad06eaab-6c5a-4649-aef8-767b745fab47 -> "ใบนำเข้าสินค้า"
            // 7ef3840f-3d7f-43de-89ea-dce215703c16 -> "ใบสั่งซ่อม"
            switch (type) {
                case "name":
                    const { Product, ShopInventoryTransactionDoc, ShopSalesTransactionDoc } = record
                    if (docType?.id === "ad06eaab-6c5a-4649-aef8-767b745fab47") {
                        return (
                            <div style={{ textAlign: "start" }}>{ShopInventoryTransactionDoc?.ShopBusinessPartner?.partner_name}</div>
                        )
                    } else {
                        let customer_type
                        if (record.ShopServiceOrderDoc !== null) {
                            if (!!record?.ShopServiceOrderDoc?.bus_customer_id) customer_type = "business"
                            else customer_type = "person"
                            if (!!customer_type && customer_type === "business") {
                                const { customer_name } = record?.ShopServiceOrderDoc?.ShopBusinessCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            } else {
                                const { customer_name } = record?.ShopServiceOrderDoc?.ShopPersonalCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            }
                        }
                        if (record.ShopSalesTransactionDoc !== null) {
                            if (!!record?.ShopSalesTransactionDoc?.bus_customer_id) customer_type = "business"
                            else customer_type = "person"
                            if (!!customer_type && customer_type === "business") {
                                const { customer_name } = record?.ShopSalesTransactionDoc?.ShopBusinessCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            } else {
                                const { customer_name } = record?.ShopSalesTransactionDoc?.ShopPersonalCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            }
                        }
                        if (record.ShopInventoryTransactionDoc !== null) {
                            if (!!record?.ShopSalesTransactionDoc?.bus_customer_id) customer_type = "business"
                            else customer_type = "person"
                            if (!!customer_type && customer_type === "business") {
                                const { customer_name } = record?.ShopSalesTransactionDoc?.ShopBusinessCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            } else {
                                const { customer_name } = record?.ShopSalesTransactionDoc?.ShopPersonalCustomer
                                return (
                                    <div style={{ textAlign: "start" }}>{customer_name}</div>
                                )
                            }
                        }

                    }
                case "warehouse":
                    if (!!warehouseList && isArray(warehouseList) && warehouseList.length > 0) {
                        if (record?.warehouse) {
                            return warehouseList?.find(where => where?.id === record?.warehouse)?.name[locale.locale]
                        } else {
                            return (
                                <div>{warehouseList?.find(where => where?.id === record?.warehouse_id)?.name[locale.locale]}</div>
                            )
                        }

                    }
                    break;
                case "shelf":
                    if (!!warehouseList && isArray(warehouseList) && warehouseList.length > 0) {
                        if (record?.warehouse) {
                            return warehouseList?.filter(where => where?.id === record?.warehouse)[0]?.shelf.find(where => where?.code === record?.shelf)?.name[locale.locale]
                        } else {
                            return (
                                <div>{warehouseList?.filter(where => where?.id === record?.warehouse_id)[0]?.shelf.find(where => where?.code === record?.warehouse_item_id)?.name[locale.locale]}</div>
                            )
                        }

                    }
                    break;
                case "dot":
                    return (
                        <div>{record?.dot_mfd ?? "-"}</div>
                    )
                case "purchaseUnit":
                    if (!!productPurchaseUnitTypes && isArray(productPurchaseUnitTypes) && productPurchaseUnitTypes.length > 0) {
                        return (
                            <div>{productPurchaseUnitTypes?.find(where => where?.id === record?.purchase_unit_id)?.type_name[locale.locale] ?? "-"}</div>
                        )
                    }
                    break;

                default:
                    break;
            }

        } catch (error) {

        }
    }



    useEffect(() => {
        if (permission_obj)
            setColumnsTable()
    }, [configTable.page, permission_obj, visibleMovementModal])

    const [warehouseList, setWarehouseList] = useState([])

    const getMasterData = async () => {
        try {
            setLoading(true)
            const values = await Promise.all([getWarehouseListAll()])
            setWarehouseList(values[0])
            setLoading(false)
        } catch (error) {

        }
    }

    const getWarehouseListAll = async () => {
        try {
            if (shopArr != null && shopArr.length > 0) {
                let data_ = []
                for (let index = 0; index < shopArr.length; index++) {
                    const element = shopArr[index];
                    const { data } = await API.get(`shopWarehouses/all?limit=9999&page=1&sort=code_id&order=asc&shop_id=` + element.id)
                    // data_.push(data.data.data)
                    for (let index1 = 0; index1 < data.data.data.length; index1++) {
                        const element1 = data.data.data[index1];
                        data_.push(element1)

                    }
                }
                // console.log(data_)
                return data_
            } else {
                const { data } = await API.get(`/shopWarehouses/all?limit=99999&page=1&sort=code_id&order=asc`)
                // console.log('data getWarehouseListAll :>> ', data);

                return data.status === "success" ? data.data.data ?? [] : []
            }


        } catch (error) {

        }
    }


    const handleCancelMovementModal = async () => {
        setConfigTable({ ...configTable, page: init.configTable.page, limit: init.configTable.limit })
        if (isFunction(setFliterEachMovement)) setFliterEachMovement(prevValue => { })
        setVisibleMovementModal(() => false)
        await getDataSearch({
            page: configTable.page,
            limit: configTable.limit,
            // product_id: productData[0]?.product_id,
            shop_id: fliterEachMovement?.shop_id,
            shop_product_id: fliterEachMovement?.shop_product_id
        })
    }


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        // console.log('value onFinishSearch :>> ', value);
        // setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default", filter_balance: value.filter_balance })
        getDataSearch({
            page: value.page,
            limit: value.limit,
            warehouse_id: fliterEachMovement?.warehouse,
            warehouse_item_id: fliterEachMovement?.shelf,
            dot_mfd: fliterEachMovement?.dot_mfd,
            purchase_unit_id: fliterEachMovement?.purchase_unit_id,
            shop_id: fliterEachMovement?.shop_id,
            shop_product_id: fliterEachMovement?.shop_product_id
        })

    }

    /** กดปุ่มค่าเริ่มต้น */
    const onReset = () => {
        setConfigTable(init.configTable)
        setConfigSort(init.configSort)
        setModelSearch(init.modelSearch)
        getDataSearch({
            // search: init.modelSearch.search ?? "",
            // _status: init.modelSearch.status,
            limit: init.configTable.limit,
            page: init.configTable.page,
        })
    }



    const getDataSearch = async ({ limit = configTable.limit, page = configTable.page, warehouse_id = "", warehouse_item_id = "", dot_mfd = "", purchase_unit_id = "", shop_id = "", shop_product_id = "" }) => {
        shop_id = shop_id === "" ? shopId : shop_id
        shop_product_id = shop_product_id === "" ? shopProductId : shop_product_id
        setLoading(true)
        const res = await API.get(`/shopReports/inventoryMovements/v2?limit=${limit}&page=${page}${warehouse_id ? `&warehouse_id=${warehouse_id}` : ""}${warehouse_item_id ? `&warehouse_item_id=${warehouse_item_id}` : ""}${dot_mfd ? `&dot_mfd=${dot_mfd}` : ""}${purchase_unit_id ? `&purchase_unit_id=${purchase_unit_id}` : ""}${shop_id ? `&shop_id=${shop_id}` : ""}${shop_product_id ? `&product_id=${shop_product_id}` : ""}`)
        // console.log('res :>> ', res);
        if (res.data.status === "success") {
            const { currentCount, currentPage, pages, totalCount, data } = res.data.data

            data.forEach(e => {
                e.use_fake_uuid = true
            });
            // console.log('data :>> ', data);
            if (isArray(productData) && productData.length > 0) {
                setListSearchDataTable(prevValue => [...data])
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
            }
            else {
                setListSearchDataTable(prevValue => [])
                setConfigTable({ ...configTable, page: 1, total: 0, limit: 10 })
            }
        }
        setLoading(false)
    }

    /**
     * ควบคุมการ เปิด ปิด modal แสดงข้อมูลเอกสาร
     */


    const controlOpenViewDocument = (doc_id, doc_type_id, select_shop_ids) => {
        try {
            setViewDoc({ doc_id, doc_type_id, select_shop_ids })
            setVisibleViewDocument(true)
        } catch (error) {
            // console.log('error  :>> ', error);
        }
    }


    const handleCancelViewDocument = () => {
        try {
            setVisibleViewDocument(false)
        } catch (error) {

        }
    }

    // const [searchValue, setSearchValue] = useState('');

    // const onSearch = (value) => { };

    // const onChange = (value, option) => {
    //     setSearchValue(option.children);
    // };

    // const onFocus = () => { };

    return (
        <>
            <ModalFullScreen
                title={GetIntlMessages("การเคลื่อนไหวของสินค้า")}
                visible={visibleMovementModal}
                className={`modal-padding-10px-screen`}
                CustomsButton={() => {
                    return (
                        <div>
                            <span className='pr-3'>
                                <Button loading={loading} onClick={handleCancelMovementModal} style={{ width: 100 }}>{GetIntlMessages("ปิด")}</Button>
                            </span>
                        </div>
                    )
                }}
            >
                <Row gutter={[30, 10]}>
                    <Col span={24}>
                        {fliterEachMovement === undefined ? null : fliterEachMovement?.shop_name === undefined ? null :
                            <div style={{ textAlign: "center", marginBottom: "10px", width: "100%", fontSize: "2rem" }}><span style={{ color: mainColor }}>{GetIntlMessages("ชื่อสาขา")}</span> : {!!productData && mode === "view" ? fliterEachMovement?.shop_name : null}</div>
                        }
                    </Col>
                    <Col xxl={{ span: 5, offset: 7 }} lg={10} md={10} xs={24}>
                        <div style={{ marginBottom: "10px", width: "100%", fontSize: 24 }}><span style={{ color: mainColor }}>{GetIntlMessages("รหัสสินค้า")}</span> : {!!productData && mode === "view" ? productData[0]?.productId_list[0]?.Product?.master_path_code_id : null}</div>
                    </Col>
                    <Col xxl={12} lg={12} md={12} xs={24}>
                        <div style={{ marginBottom: "10px", width: "100%", fontSize: 24 }}><span style={{ color: mainColor }}>{GetIntlMessages("ชื่อสินค้า")}</span> : {!!productData && mode === "view" ? productData[0]?.productId_list[0]?.Product?.product_name[locale.locale] ?? productData[0]?.productId_list[0]?.Product?.product_name : null}</div>
                    </Col>
                    {!!fliterEachMovement?.hasOwnProperty('warehouse') && !isEmpty(fliterEachMovement) ?
                        <>
                            <Col xxl={5} lg={5} md={12} xs={24}>
                                <div style={{ marginBottom: "10px", width: "100%", fontSize: 24, display: "flex", flexDirection: "row" }}><span style={{ color: mainColor }}>{GetIntlMessages("คลัง")}</span> &nbsp;:&nbsp; {!!fliterEachMovement && mode === "view" ? displayData("warehouse", fliterEachMovement) ?? "-" : null}</div>
                            </Col>
                            <Col xxl={5} lg={5} md={12} xs={24}>
                                <div style={{ marginBottom: "10px", width: "100%", fontSize: 24, display: "flex", flexDirection: "row" }}><span style={{ color: mainColor }}>{GetIntlMessages("ชั้นวาง")}</span> &nbsp;:&nbsp; {!!fliterEachMovement && mode === "view" ? displayData("shelf", fliterEachMovement) ?? "-" : null}</div>
                            </Col>
                            <Col xxl={5} lg={5} md={12} xs={24}>
                                <div style={{ marginBottom: "10px", width: "100%", fontSize: 24, display: "flex", flexDirection: "row" }}><span style={{ color: mainColor }}>{GetIntlMessages("DOT/MFD")}</span> &nbsp;:&nbsp; {!!fliterEachMovement && mode === "view" ? fliterEachMovement?.dot_mfd ?? "-" : null}</div>
                            </Col>
                            <Col xxl={5} lg={5} md={12} xs={24}>
                                <div style={{ marginBottom: "10px", width: "100%", fontSize: 24, display: "flex", flexDirection: "row" }}><span style={{ color: mainColor }}>{GetIntlMessages("หน่วยซื้อ")}</span> &nbsp;:&nbsp; {!!fliterEachMovement && mode === "view" ? displayData("purchaseUnit", fliterEachMovement) ?? "-" : null}</div>
                            </Col>
                            <Col xxl={4} lg={4} md={12} xs={24}>
                                <div style={{ marginBottom: "10px", width: "100%", fontSize: 24, display: "flex", flexDirection: "row" }}><span style={{ color: mainColor }}>{GetIntlMessages("จำนวน")}</span> &nbsp;:&nbsp; {!!fliterEachMovement && mode === "view" ? fliterEachMovement?.amount ?? "-" : null}</div>
                            </Col>
                        </>
                        : null}

                </Row>
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={onFinishSearch} />
            </ModalFullScreen>


            <Modal
                maskClosable={false}
                open={visibleViewDocument}
                onCancel={handleCancelViewDocument}
                style={{ top: 5 }}
                width="90vw"
                footer={(
                    <>
                        <Button onClick={() => handleCancelViewDocument()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {/* <Select
                    showSearch
                    style={{
                        width: 200,
                    }}
                    placeholder="Search to Select"
                    optionFilterProp="children"
                    filterOption={(input, option) => option.children}
                    onSearch={onSearch}
                    searchValue={searchValue}
                    onChange={onChange}
                    onFocus={onFocus}
                    disabled
                >
                    <Option value="1">Not Identified</Option>
                    <Option value="2">Closed</Option>
                    <Option value="3">Communicated</Option>
                    <Option value="4">Identified</Option>
                    <Option value="5">Resolved</Option>
                    <Option value="6">Cancelled</Option>
                </Select> */}
                {
                    viewDoc?.doc_type_id === "7ef3840f-3d7f-43de-89ea-dce215703c16" ? <RepairOrder title="ดูข้อมูลใบสั่งซ่อม" view_doc_id={viewDoc?.doc_id} docTypeId={"7ef3840f-3d7f-43de-89ea-dce215703c16"} select_shop_ids={viewDoc?.select_shop_ids} /> : null
                }
                {
                    viewDoc?.doc_type_id === "67c45df3-4f84-45a8-8efc-de22fef31978" ? <ShopServiceOrderDoc title="ดูข้อมูลใบสั่งขาย/ใบจองสินค้า" view_doc_id={viewDoc?.doc_id} docTypeId={"67c45df3-4f84-45a8-8efc-de22fef31978"} select_shop_ids={viewDoc?.select_shop_ids} /> : null
                }
                {
                    viewDoc?.doc_type_id === "ad06eaab-6c5a-4649-aef8-767b745fab47" ? <ImportDocuments title="ดูข้อมูลใบรับสินค้า" view_doc_id={viewDoc?.doc_id} select_shop_ids={viewDoc?.select_shop_ids} /> : null
                }
                {
                    viewDoc?.doc_type_id === "40501ce1-c7f0-4f6a-96a0-7cd804a2f531" ? <AdjustIncreaseDocuments title="ดูข้อมูลใบปรับลดปรับเพิ่มสินค้า" view_doc_id={viewDoc?.doc_id} select_shop_ids={viewDoc?.select_shop_ids} /> : null
                }
            </Modal>

        </>

    )
}

export default ProductMovement