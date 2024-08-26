import { useEffect, useState } from 'react'
import Head from 'next/head';
import { Table, Button, Row, Col, Popconfirm, message, Tooltip, Input, Modal, Select, Form, Switch, Transfer, Upload } from 'antd';
import { CheckCircleOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined, StopOutlined, PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import API from '../../util/Api'
import moment from 'moment';
import axios from 'axios';
import { Cookies } from "react-cookie";
import { useSelector } from 'react-redux';
import _, { constant, get, isArray, isPlainObject } from 'lodash'
import TitlePage from '../shares/TitlePage';
import SearchInput from '../shares/SearchInput'
import TableList from '../shares/TableList'
import ModalFullScreen from '../shares/ModalFullScreen';
import ProductModal from '../Routes/MasterLookUp/Components.Modal.Product';
import GetIntlMessages from '../../util/GetIntlMessages'

const cookies = new Cookies();
const { Search } = Input;

const ComponentsRoutesProducts = ({ status }) => {
    const [loading, setLoading] = useState(false);

    const [listSearchDataTable, setListSearchDataTable] = useState([])
    const [columns, setColumns] = useState([])
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);



    const setColumnsTable = () => {
        const _column = [
            {
                title: 'ลำดับ',
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 100,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },
            {
                title: 'CAI Code',
                dataIndex: 'master_path_code_id',
                key: 'master_path_code_id',
                width: 150,
                align: "center",
                render: (text, record) => <div style={{textAlign : "start"}}>{text ?? "-"}</div>,
                sorter: (a, b, c) => { },
                sortOrder: configSort.sort == "master_path_code_id" ? configSort.order : true,
                onHeaderCell: (obj) => {
                    return {
                        onClick: () => {
                            getDataSearch({
                                page: configTable.page,
                                search: modelSearch.search,
                                sort: "master_path_code_id",
                                order: configSort.order !== "descend" ? "desc" : "asc",
                            })
                            // setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
                            setConfigSort({ sort: "master_path_code_id", order: obj.sortOrder === "ascend" ? "descend" : "ascend" })
                        }
                    };
                }
            },
            {
                title: 'รหัสสินค้าจากต้วแทน',
                dataIndex: 'custom_path_code_id',
                key: 'custom_path_code_id',
                width: 150,
                align: "center",
                render: (text, record) => <div style={{textAlign : "start"}}>{text ?? "-"}</div>,
            },
            {
                title: 'ชื่อสินค้า',
                dataIndex: 'product_name',
                key: 'product_name',
                width: 300,
                // render: (text, record) => console.log('text', text),
                render: (text, record) => text ? text[locale.locale] : "-",
            },
            {
                title: 'สินค้าประเภท',
                dataIndex: 'ProductType',
                key: 'ProductType',
                width: 200,
                render: (text, record) => text ? text.type_name[locale.locale] : "-",
            },
            {
                title: 'ยี่ห้อสินค้า',
                dataIndex: 'ProductBrand',
                key: 'ProductBrand',
                width: 200,
                render: (text, record) => text ? text.brand_name[locale.locale] : "-",
            },
            {
                title: 'Model รุ่น',
                dataIndex: 'ProductModelType',
                key: 'ProductModelType',
                width: 200,
                render: (text, record) => text ? text.model_name ? text.model_name[locale.locale] : "-" : "-",
            },
            {
                title: 'ความกว้างจากขอบยาง',
                dataIndex: 'rim_size',
                key: 'rim_size',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ความกว้าง',
                dataIndex: 'width',
                key: 'width',
                width: 300,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ความสูง',
                dataIndex: 'hight',
                key: 'hight',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ความสูงแก้มยาง',
                dataIndex: 'series',
                key: 'series',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ดัชนีน้ำหนักสินค้า',
                dataIndex: 'load_index',
                key: 'load_index',
                width: 150,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ดัชนีความเร็ว',
                dataIndex: 'speed_index',
                key: 'speed_index',
                width: 200,
                render: (text, record) => text ?? "-",
            },
            {
                title: 'ขนาดไซส์สำเร็จรูป',
                dataIndex: 'ProductCompleteSize',
                key: 'ProductCompleteSize',
                width: 200,
                // render: (text, record) => console.log('text', text),
                render: (text, record) => isPlainObject(text) ? text.complete_size_name[locale.locale] ?? "-" : "-",
            },

            /* JSON Other Details */
            {
                title: 'CCI Code',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                // render: (text, record) => get(text , `cci_code` , "-"),
                render: (text, record) => text["cci_code"] && text["cci_code"].length > 0 ? text["cci_code"] ?? "-": "-",
            },
            {
                title: 'CCID Code',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text["ccid_code"] && text["ccid_code"].length > 0 ? text["ccid_code"] ?? "-" : "-",
            },
            {
                title: 'CAD Code',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text["cad_code"] && text["cad_code"].length > 0 ? text["cad_code"]  ?? "-": "-",
            },
            {
                title: 'Sourcing Manufacturing',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text["sourcing_manufacturing"] && text["sourcing_manufacturing"].length > 0 ? text["sourcing_manufacturing"] ?? "-" : "-",
            },
            {
                title: 'Position F/R',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text["position_front_and_rear"] && text["position_front_and_rear"].length > 0  ? text["position_front_and_rear"] ?? "-" : "-",
            },
            {
                title: 'TL/TT Index',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => text["tl_and_tt_index"] && text["tl_and_tt_index"] .length > 0  ? text["tl_and_tt_index"] ?? "-" : "-",
            },
            {
                title: 'Based Price',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => displayPrice(text, "based_price"),
                // render: (text, record) => text["based_price"] && text["based_price"].length > 0 ? text["based_price"] ?? "-" : "-",
            },
            {
                title: 'After Channel Discount',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => displayPrice(text, "after_channel_discount"),
                // render: (text, record) => text["after_channel_discount"] && text["after_channel_discount"].length > 0  ? text["after_channel_discount"] ?? "-" : "-",
            },
            {
                title: 'Suggasted Resell Price',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) => displayPrice(text, "suggasted_re_sell_price"),
                // render: (text, record) => text["suggasted_re_sell_price"] && text["suggasted_re_sell_price"].length > 0 ? text["suggasted_re_sell_price"] ?? "-" : "-",
            },
            {
                title: 'Suggasted Online Price',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 200,
                render: (text, record) =>  displayPrice(text, "suggested_online_price"),
                // render: (text, record) => text["suggested_online_price"] && text["suggested_online_price"].length > 0 ? text["suggested_online_price"] ?? "-" : "-",
            },

            /* new */
            {
                title: 'ราคาแนะนำ',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => displayPrice(text, "based_price"),
                // render: (text, record) => text["based_price"] && text["based_price"].length > 0 ? text["based_price"] ?? "-" : "-"
            },
            {
                title: 'ราคาลงสื่อ',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => displayPrice(text, "suggested_promote_price"),
                // render: (text, record) => text["suggested_promote_price"] && text["suggested_promote_price"].length > 0 ? text["suggested_promote_price"] ?? "-" : "-"
            },
            {
                title: 'ราคา Prohands',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => checkOtherShopPrice(text , "prohand_price"),
            },
            {
                title: 'ราคา EzyFit',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => checkOtherShopPrice(text , "ezyFit_price"),
            },
            {
                title: 'ราคา wyz',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => checkOtherShopPrice(text , "wyz_price"),
            },
            {
                title: 'ราคา auto one',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => checkOtherShopPrice(text , "auto_one_price"),
            },
            {
                title: 'ราคา YCC',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => checkOtherShopPrice(text , "ycc_price"),
            },
            {
                title: 'ราคาทั่วไป',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => displayPrice(text , "normal_price")
                // render: (text, record) => _.isPlainObject(text) && text["normal_price"] && text["normal_price"].length > 0 ? text["normal_price"] ?? "-": "-"
            },
            {
                title: 'Benchmark',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => displayPrice(text , "benchmark_price")
                // render: (text, record) => _.isPlainObject(text) && text["benchmark_price"] && text["benchmark_price"].length > 0 ? text["benchmark_price"] ?? "-": "-"
            },
            {
                title: 'Cost inc vat',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",
                render: (text, record) => displayPrice(text , "include_vat_price")
                // render: (text, record) => _.isPlainObject(text) && text["include_vat_price"] && text["include_vat_price"].length > 0 ? text["include_vat_price"] ?? "-": "-"
            },
            {
                title: 'Cost Exc Vat',
                dataIndex: 'other_details',
                key: 'other_details',
                width: 150,
                align: "center",           
                render: (text, record) => displayPrice(text , "exclude_vat_price")
                // render: (text, record) => _.isPlainObject(text) && text["exclude_vat_price"] && text["exclude_vat_price"].length > 0 ? text["exclude_vat_price"] ?? "-": "-"
            },
            {
                title: 'วันที่ส่งข้อมูล',
                dataIndex: 'balance_date',
                key: 'balance_date',
                width: 150,
                render: (text, record) => text ? moment(text).format("DD/MM/YYYY HH:mm:ss") : "-",
            },

        ];

        setColumns(_column)
    }

    const checkOtherShopPrice =(value , type)=>{
        if(isPlainObject(value)){
            if(value.other_shops && isArray(value.other_shops) && value.other_shops.length > 0){
                if(value.other_shops[value.other_shops.length - 1][type] && value.other_shops[value.other_shops.length - 1][type].length > 0){
                    return <div style={{textAlign : "end"}}>{Number(value.other_shops[value.other_shops.length - 1][type]).toLocaleString(undefined, {minimumFractionDigits : 2 , maximumFractionDigits : 2})}</div>
                }else{
                    return "-"
                }
            }else{
                return "-"
            }
        }else{
            return "-"
        }
    }

    const displayPrice=(value,type,priceType)=>{
        try {
            let numberValue
            if(value && priceType){
                numberValue = Number(get(value , `${type}.${priceType}`, "-"))
                return <div style={{textAlign : "end"}}>{numberValue != 0 ? numberValue.toLocaleString(undefined, {minimumFractionDigits : 2 , maximumFractionDigits : 2}) : "-"}</div>
            }else if(value && !priceType){
                numberValue = Number(get(value , `${type}`, "-"))
                console.log('numberValue', numberValue)
                return <div style={{textAlign : "end"}}>{numberValue != 0 && !isNaN(numberValue) ? numberValue.toLocaleString(undefined, {minimumFractionDigits : 2 , maximumFractionDigits : 2}) : "-"}</div> 
            }else {
                return "-"
            }
        } catch (error) {
            console.log('error :>>', error)
        }
    }


    /* ค่าเริ่มต้น */
    const reset = async () => {
        const _page = 1, _search = "";
        setPage(_page)
        setSearch(_search)
        await getDataSearch({ _page, _search })
    }

    /* ค้นหา */
    // const getDataSearch = async ({ _search = "", _limit = limit, _page = 1, _sort = "product_name.th", _order = sortOrder === "descend" ? "desc" : "asc", _status = "default", _which = (status === "management") ? "michelin data" : "my data" }) => {
    const getDataSearch = async ({ search = modelSearch.search ?? "", limit = configTable.limit, page = configTable.page, sort = configSort.sort, order = (configSort.order === "descend" ? "desc" : "asc"), _status = modelSearch.status, _which = (status === "management") ? "michelin data" : "my data" }) => {
        try {
            if (page === 1) setLoading(true)
            const res = await API.get(`/product/all?limit=${limit}&page=${page}&sort=${sort}&order=${order}&status=${_status}&search=${search}&which=${_which}`)
            if (res.data.status === "success") {
                const { currentCount, currentPage, pages, totalCount, data } = res.data.data;
                // console.log(`data`, data)
                setListSearchDataTable(data)
                // setTotal(totalCount);
                setConfigTable({ ...configTable, page: page, total: totalCount, limit: limit })
                if (page === 1) setLoading(false)
            } else {
                message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
                if (page === 1) setLoading(false)
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
            if (page === 1) setLoading(false)
        }
    }

    /* เปลี่ยนสถานะ */
    const changeStatus = async (isuse, id) => {
        try {
            // delete,active,block
            const status = isuse == 1 ? "active" : isuse == 0 ? "block" : "delete"
            const { data } = await API.put(`/product/put/${id}?which=${status === "management" ? "michelin data" : "my data"}`, { status })
            if (data.status != "successful") {
                message.warning("ไม่สามารถบันทึกข้อมูลมูลได้ มีบางอย่างผิดพลาด");
            } else {
                message.success("บันทึกข้อมูลสำเร็จ");
                // console.log(`search`, modelSearch.search)
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    status: modelSearch.status,
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
            setConfigModal({ ...configModal, mode })
            if (id) {
                setIsIdEdit(id)
                const { data } = await API.get(`/product/byid/${id}`)
                if (data.status) {
                    const _model = data.data[0]
                    // console.log(`_model`, _model)
                    _model.product_type_group_id = _model.ProductType ? _model.ProductType.type_group_id ?? "" : ""
                    // _model.product_name = _model.product_name 

                    /* other_details */
                    if (_.isPlainObject(_model.other_details)) {
                        _model.initOtherDetails = _model.other_details

                        _model.sku = _model.other_details["sku"];
                        _model.discount = _model.other_details["discount"];
                        _model.cci_code = _model.other_details["cci_code"];
                        _model.ccid_code = _model.other_details["ccid_code"];
                        _model.cad_code = _model.other_details["cad_code"];
                        _model.sourcing_manufacturing = _model.other_details["sourcing_manufacturing"];
                        _model.position_front_and_rear = _model.other_details["position_front_and_rear"];
                        _model.tl_and_tt_index = _model.other_details["tl_and_tt_index"];
                        _model.based_price = _model.other_details["based_price"];
                        _model.after_channel_discount = _model.other_details["after_channel_discount"];
                        _model.suggasted_re_sell_price = _model.other_details["suggasted_re_sell_price"];
                        _model.suggested_online_price = _model.other_details["suggested_online_price"];

                        /* new */
                        _model.suggested_promote_price = _model.other_details["suggested_promote_price"]
                        _model.normal_price = _model.other_details["normal_price"]
                        _model.benchmark_price = _model.other_details["benchmark_price"]
                        _model.include_vat_price = _model.other_details["include_vat_price"]
                        _model.exclude_vat_price = _model.other_details["exclude_vat_price"]
                        _model.vehicle_types = _model.other_details["vehicle_types"]

                        if(_model.other_details["oe_tire"] && isPlainObject(_model.other_details["oe_tire"])) setCheckedOeTire(_model.other_details["oe_tire"]["status"] ?? false)
                        if(_model.other_details["runflat_tire"] && isPlainObject(_model.other_details["runflat_tire"])) setCheckedRunFlatTire(_model.other_details["runflat_tire"]["status"] ?? false)
                        if(_model.other_details["others_tire_detail"] && isPlainObject(_model.other_details["others_tire_detail"])) setCheckedOtherTrieDetail(_model.other_details["others_tire_detail"]["status"] ?? false)
                        
                        if(_model.other_details["oe_tire"] && isPlainObject(_model.other_details["oe_tire"])) _model.remark_oe_tire = _model.other_details["oe_tire"]["remark_oe_tire"] ?? {}
                        if(_model.other_details["runflat_tire"] && isPlainObject(_model.other_details["runflat_tire"])) _model.remark_runflat_tire = _model.other_details["runflat_tire"]["remark_runflat_tire"] ?? {}
                        if(_model.other_details["others_tire_detail"] && isPlainObject(_model.other_details["others_tire_detail"])) _model.remark_others_tire_detail = _model.other_details["others_tire_detail"]["remark_others_tire_detail"] ?? {}

                        /* central_price*/
                        if (_model.other_details.central_price && isPlainObject(_model.other_details.central_price)) {
                            _model.suggasted_re_sell_price_retail = _model.other_details.central_price.suggasted_re_sell_price.retail,
                                _model.suggasted_re_sell_price_wholesale = _model.other_details.central_price.suggasted_re_sell_price.wholesale,
                                _model.suggested_online_price_retail = _model.other_details.central_price.suggested_online_price.retail,
                                _model.suggested_online_price_wholesale = _model.other_details.central_price.suggested_online_price.wholesale,
                                _model.b2b_price_retail = _model.other_details.central_price.b2b_price.retail,
                                _model.b2b_price_wholesale = _model.other_details.central_price.b2b_price.wholesale,
                                _model.credit_30_price_retail = _model.other_details.central_price.credit_30_price.retail,
                                _model.credit_30_price_wholesale = _model.other_details.central_price.credit_30_price.wholesale,
                                _model.credit_45_price_retail = _model.other_details.central_price.credit_45_price.retail,
                                _model.credit_45_price_wholesale = _model.other_details.central_price.credit_45_price.wholesale

                                _model.purchase_unit = _model.other_details["purchase_unit"];
                                _model.sales_unit = _model.other_details["sales_unit"];
                        }

                        /* other_shops */
                        if (_.isArray(_model.other_details.other_shops) && _model.other_details.other_shops.length > 0) {

                            _model.prohand_price = _model.other_details.other_shops[0]["prohand_price"]
                            _model.ezyFit_price = _model.other_details.other_shops[0]["ezyFit_price"]
                            _model.wyz_price = _model.other_details.other_shops[0]["wyz_price"]
                            _model.auto_one_price = _model.other_details.other_shops[0]["auto_one_price"]
                            _model.ycc_price = _model.other_details.other_shops[0]["ycc_price"]
                        }
                    }


                    /* isuse */
                    _model.isuse = _model.isuse == 1 ? true : false
                    setCheckedIsuse(_model.isuse)

                    form.setFieldsValue(_model)
                }
                // console.log('form.getFieldValue()', form.getFieldValue())
            }
            setIsModalVisible(true)
        } catch (error) {
            console.log(`error`, error)
        }
    }


    /* Download Template */
    const downloadTemplate = () => {
        window.open('../../../templates/excel/template-ข้อมูลสินค้า.xlsx', '_blank');
    }

    /* Import Excel */
    const [isModalImportVisible, setIsModalImportVisible] = useState(false)
    const [fileImport, setFileImport] = useState(null);
    const [fileImportList, setFileImportList] = useState([]);

    const importExcel = () => {
        setIsModalImportVisible(true)
    }

    const handleImportOk = async () => {
        try {
            if (fileImport) {
                const formData = new FormData();
                formData.append("file", fileImport.originFileObj);
                const userAuth = cookies.get("userAuth");
                const token = userAuth.access_token
                const { data } = await axios({
                    method: "post",
                    url: `${process.env.NEXT_PUBLIC_APIURL}/macthProduct/byfile`,
                    config: { headers: { "Content-Type": "multipart/form-data" } },
                    headers: { Authorization: "Bearer " + token },
                    data: formData,
                });

                if (data.status == "successful") {
                    message.success("บันทึกสำเร็จ")
                    setFileImportList([])
                    setFileImport(null)
                    setIsModalImportVisible(false)
                    getDataSearch({
                        page: configTable.page,
                        search: modelSearch.search,
                        status: modelSearch.status,
                    })
                } else {
                    message.error(data.data ?? 'มีบางอย่างผิดพลาด !!');
                }

            } else {
                message.warning("กรุณาเลือกไฟล์")
            }
        } catch (error) {
            message.error("มีบางอย่างผิดพลาดกรุณาติดต่อเจ้าหน้าที่ !!!")
        }
    }

    const handleImportCancel = () => {
        setIsModalImportVisible(false)
        setFileImportList([])
        setFileImport(null)
    }

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
        modeKey: null,
        overflowX: "auto",
    })
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [idEdit, setIsIdEdit] = useState(null);
    const [checkedIsuse, setCheckedIsuse] = useState(false);
    const [checkedOeTire, setCheckedOeTire] = useState(false);
    const [checkedRunFlatTire, setCheckedRunFlatTire] = useState(false);
    const [checkedOtherTireDetail, setCheckedOtherTrieDetail] = useState(false);
    const [checkedOkAndCancle, setCheckedOkAndCancle] = useState(null);
    const [form] = Form.useForm();

    const switchTireStatus =(value,type)=>{

        switch (type) {
            case "oe_tire":
                setCheckedOeTire(value)
                break;
            case "runflat_tire":
                setCheckedRunFlatTire(value)
                break;
            case "others_tire_detail":
                setCheckedOtherTrieDetail(value)
                break;
        
            default:
                setCheckedOeTire(false)
                setCheckedRunFlatTire(false)
                setCheckedOtherTrieDetail(false)
                break;
        }
    }
    const checkedTireStatus = {
        oe_tire_status_checked : checkedOeTire,
        runflat_tire_checked : checkedRunFlatTire,
        others_tire_detail_checked : checkedOtherTireDetail,
    }

    const handleOk = (modeKey) => {
        form.submit()
        setConfigModal({ ...configModal, modeKey })
        setCheckedOkAndCancle(1)
    }

    const handleCancel = () => {    
        setCheckedOkAndCancle(0)
        form.resetFields()
        setIsModalVisible(false)
        setCheckedOeTire(false)
        setCheckedRunFlatTire(false)
        setCheckedOtherTrieDetail(false)
        setConfigModal({ ...configModal, mode: "add" })

    }

    const getCheckOkAndCancle = (value) => {
        setCheckedOkAndCancle(value)
    }

    const onFinish = async (value) => {
        try {
            // console.log(`value`, value)
            const {
                productId,
                ShopProductId,
                initOtherDetails,
                normal_price,
                suggested_promote_price,
                based_price,
                benchmark_price,
                include_vat_price,
                exclude_vat_price,
            } = form.getFieldValue();

            const _model = {
                product_code: value.product_code,
                master_path_code_id: value.master_path_code_id ?? null,
                custom_path_code_id: value.custom_path_code_id ?? null,
                product_name: value.product_name,
                // product_name: {
                //     th: value.product_name,
                //     en: null
                // },
                product_type_id: value.product_type_id,
                product_brand_id: value.product_brand_id,
                product_model_id: value.product_model_id,
                rim_size: value.rim_size ?? 0,
                width: value.width ?? 0,
                hight: value.hight ?? 0,
                series: value.series ?? 0,
                load_index: value.load_index ?? 0,
                speed_index: value.speed_index ?? 0,
                complete_size_id: value.complete_size_id,

                other_details: {
                    sku: value.sku,
                    discount: value.discount,
                    cci_code: value.cci_code,
                    ccid_code: value.ccid_code,
                    cad_code: value.cad_code,
                    sourcing_manufacturing: value.sourcing_manufacturing,
                    position_front_and_rear: value.position_front_and_rear,
                    tl_and_tt_index: value.tl_and_tt_index,
                    based_price: value.based_price ? value.based_price : isPlainObject(initOtherDetails) ? initOtherDetails.based_price : null, // Base Price = ราคาแนะนำ ( Recomment Price )
                    after_channel_discount: value.after_channel_discount ? value.after_channel_discount : isPlainObject(initOtherDetails) ? initOtherDetails.after_channel_discount : null,
                    suggasted_re_sell_price: value.suggasted_re_sell_price ? value.suggasted_re_sell_price : isPlainObject(initOtherDetails) ? initOtherDetails.suggasted_re_sell_price : null,
                    suggested_online_price: value.suggested_online_price ? value.suggested_online_price : isPlainObject(initOtherDetails) ? initOtherDetails.suggested_online_price : null,
                    vehicle_types : value.vehicle_types,
                    oe_tire : {
                        status : checkedOeTire,
                        remark_oe_tire : value.remark_oe_tire
                    },
                    runflat_tire : {
                        status : checkedRunFlatTire,
                        remark_runflat_tire : value.remark_runflat_tire
                    },
                    others_tire_detail : {
                        status : checkedOtherTireDetail,
                        remark_others_tire_detail : value.remark_others_tire_detail
                    },

                    central_price: {
                        suggasted_re_sell_price: { retail: value.suggasted_re_sell_price_retail, wholesale: value.suggasted_re_sell_price_wholesale },
                        b2b_price: { retail: value.b2b_price_retail, wholesale: value.b2b_price_wholesale },
                        suggested_online_price: { retail: value.suggested_online_price_retail, wholesale: value.suggested_online_price_wholesale },
                        credit_30_price: { retail: value.credit_30_price_retail, wholesale: value.credit_30_price_wholesale },
                        credit_45_price: { retail: value.credit_45_price_retail, wholesale: value.credit_45_price_wholesale },
                    },

                    /* new */
                    suggested_promote_price: value.suggested_promote_price ? value.suggested_promote_price : suggested_promote_price ? suggested_promote_price : null, // ราคาลงสื่อ ( Promote Price )
                    normal_price: value.normal_price ? value.normal_price : normal_price ? normal_price : null, // ราคาทั่วไป ( Normal Price )
                    benchmark_price: value.benchmark_price ? value.benchmark_price : benchmark_price ? benchmark_price : null, // Benchmark
                    include_vat_price: value.include_vat_price ? value.include_vat_price : include_vat_price ? include_vat_price : null, // Cost inc vat
                    exclude_vat_price: value.exclude_vat_price ? value.exclude_vat_price : exclude_vat_price ? exclude_vat_price : null, // Cost Exc Vat

                    purchase_unit: value.purchase_unit ?? null, // Default หน่วยซื้อ
                    sales_unit: value.sales_unit ?? null, // Default หน่วยขาย
                }
            }

            _model.other_details.other_shops = initOtherDetails && initOtherDetails.other_shops && initOtherDetails.other_shops.length > 0 ? [{
                prohand_price: value.prohand_price ? value.prohand_price : isArray(initOtherDetails.other_shops) ? initOtherDetails.other_shops[0].prohand_price ?? "" : "",// ราคา Prohands ( Prohand Price )
                ezyFit_price: value.ezyFit_price ? value.ezyFit_price : isArray(initOtherDetails.other_shops) ? initOtherDetails.other_shops[0].ezyFit_price ?? '' : null, // ราคา EzyFit ( Ezyfit Price )
                wyz_price: value.wyz_price ? value.wyz_price : isArray(initOtherDetails.other_shops) ? initOtherDetails.other_shops[0].wyz_price ?? '' : null, // ราคา wyz ( wyz Price )
                auto_one_price: value.auto_one_price ? value.auto_one_price : isArray(initOtherDetails.other_shops) ? initOtherDetails.other_shops[0].auto_one_price ?? '' : null, // ราคา auto one ( auto1 price )
                ycc_price: value.ycc_price ? value.ycc_price : isArray(initOtherDetails.other_shops) ? initOtherDetails.other_shops[0].ycc_price ?? '' : null // ราคา YCC ( ycc price )
            }] : [{
                prohand_price: null,// ราคา Prohands ( Prohand Price )
                ezyFit_price: null, // ราคา EzyFit ( Ezyfit Price )
                wyz_price: null, // ราคา wyz ( wyz Price )
                auto_one_price: null, // ราคา auto one ( auto1 price )
                ycc_price: null // ราคา YCC ( ycc price )
            }]

            // console.log(`_model`, _model)
            let res
            if (configModal.mode == "add" && productId == null) {
                res = await API.post(`/product/add?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            } else if (configModal.mode == "add" && productId !== null) {
                res = await API.put(`/product/put/${productId}?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            } else if (configModal.mode == "edit") {
                _model.status = checkedIsuse ? "active" : "block"
                res = await API.put(`/product/put/${idEdit}?which=${status === "management" ? "michelin data" : "my data"}`, _model)
            }
            if (res.data.status == "success") {
                message.success('บันทึกสำเร็จ');
                setIsModalVisible(!isModalVisible)
                // setMode("add")
                form.resetFields()

                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                });
            } else {
                message.error('มีบางอย่างผิดพลาด !!');
            }

            if (configModal.modeKey == 1) {
                form.resetFields()
                setConfigModal({ ...configModal, mode: 'add', modeKey: null })
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                addEditViewModal("add")
            } else if (configModal.modeKey == 2) {
                handleCancel()
            } else if (configModal.modeKey == 0) {
                setConfigModal({ ...configModal, mode: 'edit', modeKey: null })
                getDataSearch({
                    page: configTable.page,
                    search: modelSearch.search,
                    _status: modelSearch.status,
                })
                addEditViewModal("edit", res.data.data.id)
            }

        } catch (error) {
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const onFinishFailed = (error) => {
        message.warn('กรอกข้อมูลให้ครบถ้วน !!');
    }


    /* master */
    const [productTypeList, setProductTypeList] = useState([])
    const [productBrandList, setProductBrandList] = useState([])
    const [productModelTypeList, setProductModelTypeList] = useState([])
    const [productCompleteSize, setProductCompleteSizeList] = useState([])

    const getMasterData = async () => {
        try {
            setProductTypeList(await getProductTypeListAll()) // สินค้าประเภท
            setProductBrandList(await getProductBrandListAll()) // ยี่ห้อสินค้า
            setProductModelTypeList(await getProductModelTypeListAll()) // Model รุ่น
            setProductCompleteSizeList(await getProductCompleteSizeListAll()) // ขนาดไซส์สำเร็จรูป
        } catch (error) {

        }
    }

    /* เรียกข้อมูล สินค้าประเภท ทั้งหมด */
    const getProductTypeListAll = async () => {
        const { data } = await API.get(`/productType/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
        return data.data
    }

    /* เรียกข้อมูล ยี่ห้อสินค้า ทั้งหมด */
    const getProductBrandListAll = async () => {
        const { data } = await API.get(`/productBrand/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
        return data.data
    }

    /* เรียกข้อมูล Model รุ่น ทั้งหมด */
    // const getProductModelTypeListAll = async () => {
    //     const { data } = await API.get(`/productModelType/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
    //     return data.data
    // }

    /* เรียกข้อมูล ขนาดไซส์สำเร็จรูป ทั้งหมด */
    const getProductCompleteSizeListAll = async () => {
        const { data } = await API.get(`/productCompleteSize/all?limit=999999&page=1&sort=code_id&order=desc&which=${(status === "management") ? "michelin data" : "my data"}`)
        return data.data
    }

    const onFinishError = (error) => {
        console.log(`error`, error)
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
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: true
            }
        },
        configSort: {
            sort: "master_path_code_id",
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

    useEffect(() => {
        getDataSearch({
            page: configTable.page,
            search: modelSearch.search,
            status: modelSearch.status,
        })
        getMasterData()
    }, [])

    useEffect(() => {
        if (permission_obj)
            setColumnsTable()
    }, [configTable.page, configSort.order, permission_obj])




    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        setModelSearch({ ...modelSearch, search: value.search, status: value.status == "undefined" ? modelSearch.status : "default" })
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
                        key: "สถานะปิดกั้น",
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
            download: status === 'management' ? false : true,
            import: status === 'management' ? false : true,
            export: false,
        },
        onFinishSearch,
        onFinishError,
        onReset,
        downloadTemplate,
        importExcel,
    }
    const onCreate = () => {
        setIsModalVisible(true)
        setConfigModal({ ...configModal, mode: 'add' })
    }


    return (
        <>
            <>
                <SearchInput configSearch={configSearch} configModal={configModal} loading={loading} onAdd={() => addEditViewModal("add")} />
                <TableList columns={columns} data={listSearchDataTable} loading={loading} configTable={configTable} callbackSearch={getDataSearch} addEditViewModal={addEditViewModal} changeStatus={changeStatus} />


                {/* Modal Form */}
                <ModalFullScreen
                    maskClosable={false}
                    title={`${configModal.mode == "view" ? GetIntlMessages("view-data") : configModal.mode == "edit" ? GetIntlMessages("edit-data") : GetIntlMessages("add-data")} ${GetIntlMessages("สินค้า")}`}
                    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
                    okButtonProps={{ disabled: configModal.mode == "view" }}
                    okButtonDropdown
                >
                    <Form
                        form={form}
                        labelCol={{ span: 8 }}
                        wrapperCol={{ span: 16 }}
                        layout="horizontal"
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                    >
                        <ProductModal form={form} mode={configModal.mode} checkedOkAndCancle={checkedOkAndCancle} status={`productMaster`} checkedIsuse={checkedIsuse} getCheckOkAndCancle={getCheckOkAndCancle} switchTireStatus={switchTireStatus} checkedTireStatus={checkedTireStatus}/>
                    </Form>
                </ModalFullScreen>

                {/* Import Modal */}

                <Modal
                    maskClosable={false}
                    title={`Import`}
                    visible={isModalImportVisible} onOk={handleImportOk} onCancel={handleImportCancel}
                >
                    <Form.Item label="Import Excel"  >
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
            </>

            <style global>{`
               th {
                    text-align: center !important;
                }

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
    )
}

export default ComponentsRoutesProducts
