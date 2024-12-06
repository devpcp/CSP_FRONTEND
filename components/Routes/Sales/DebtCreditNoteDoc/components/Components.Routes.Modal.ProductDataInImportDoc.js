import { useEffect, useState } from "react";
import { Button, Table } from "antd";
import GetIntlMessages from "../../../../../util/GetIntlMessages";
import { get } from "lodash";
import { useSelector } from "react-redux";

const ComponentsProductDataInImportDoc = ({ title = null, callBack, listData, listIndex }) => {
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState([]);
    const { locale } = useSelector(({ settings }) => settings);

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
            sort: "id",
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
        setColumnsTable()
    }, [listIndex]);

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
                    // index += (configTable.page - 1) * configTable.limit;
                    return index + 1;
                },
            },
            {
                title: "รหัสสินค้า",
                dataIndex: "ShopProduct",
                key: "ShopProduct",
                width: 150,
                align: "center",
                render: (text, record) => get(text, "Product.master_path_code_id", "-"),
                use: true
            },
            {
                title: "ชื่อสินค้า",
                dataIndex: "ShopProduct",
                key: "ShopProduct",
                width: 300,
                use: true,
                render: (text, record) => get(text, `Product.product_name.${locale.locale}`, "-"),
            },
            {
                title: "ประเภทสินค้า",
                dataIndex: "ShopProduct",
                key: "ShopProduct",
                width: 150,
                use: true,
                render: (text, record) => get(text, `Product.ProductType.type_name.${locale.locale}`, "-"),
            },
            {
                title: "ยี่ห้อสินค้า",
                dataIndex: "ShopProduct",
                key: "ShopProduct",
                width: 150,
                use: true,
                render: (text, record) => get(text, `Product.ProductBrand.brand_name.${locale.locale}`, "-"),
            },
            {
                title: "รุ่น",
                dataIndex: "ShopProduct",
                key: "ShopProduct",
                width: 150,
                use: true,
                render: (text, record) => get(text, `Product.ProductModelType.model_name.${locale.locale}`, "-"),
            },
            {
                title: "ราคาต่อหน่วย",
                dataIndex: "price_unit",
                key: "price_unit",
                width: 100,
                use: true,
                render: (text, record) => <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
            },
            {
                title: "จำนวน",
                dataIndex: "amount",
                key: "amount",
                width: 100,
                use: true,
                render: (text, record) => text ? <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div> : "-"
            },
            {
                title: "ส่วนลดต่อรายการ (บาท)",
                dataIndex: "price_discount",
                key: "price_discount",
                width: 100,
                use: true,
                render: (text, record) => <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
            },
            {
                title: "รวมเงิน",
                dataIndex: "price_grand_total",
                key: "price_grand_total",
                width: 100,
                use: true,
                render: (text, record) => <div style={{ textAlign: "end" }}>{(+text).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>,
            },
            {
                title: () => <Button onClick={callBackSelectAll}>{GetIntlMessages("เลือกทั้งหมด")}</Button>,
                dataIndex: '',
                key: '',
                width: 100,
                align: "center",
                use: _.isFunction(callBack) ?? false,
                render: (text, record) => (
                    <Button onClick={() => callBack(record, listIndex, "ProductDataImportDoc")}>เลือก</Button>
                ),
            },
        ];

        setColumns(_column.filter(x => x.use === true));
    };

    const callBackSelectAll = () => {
        try {
            for (let index = 0; index < listData.length; index++) {
                const e = listData[index];
                callBack(e, index, "ProductDataImportDoc")
            }
        } catch (error) {
            console.log("callBackSelectAll : ", error)
        }

    }


    return (

        <>
            <div className="head-line-text" hidden={title === null ? true : false}>{title}</div>
            {/* <SearchInput
                configSearch={configSearch}
                configModal={configModal}
                loading={loading}
                onAdd={() => addEditViewModal("add")}
                value={modelSearch}
                title={title !== null ? false : true}
            /> */}

            <div id="table-list">
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={listData}
                    rowClassName={() => 'editable-row'}
                    bordered
                    pagination={false}
                    loading={loading}
                />
            </div>
        </>
    );
};

export default ComponentsProductDataInImportDoc;
