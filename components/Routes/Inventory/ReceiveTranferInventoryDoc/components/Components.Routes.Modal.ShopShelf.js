import { useEffect, useState } from "react";
import { Button, Table, Typography } from "antd";
import GetIntlMessages from "../../../../../util/GetIntlMessages";
import { get } from "lodash";
import { useSelector } from "react-redux";
import API from '../../../../../util/Api'
import { isFunction } from "lodash";

const { Text, Link } = Typography;

const ComponentsRoutesModalShopShelf = ({ title = null, callBack, listData, listIndex }) => {
    const [loading, setLoading] = useState(false);
    const [columns, setColumns] = useState([]);
    const { locale } = useSelector(({ settings }) => settings);

    const { productPurchaseUnitTypes } = useSelector(({ master }) => master);
    useEffect(() => {
        setColumnsTable()
    }, [listIndex]);

    useEffect(() => {
        // getMasterData()
        setColumnsTable()
    }, [listData])

    const getMasterData = async () => {
        try {
            const shopWarehouseAllList = await getShopWarehousesAllList()
            Promise.all(listData?.map((e) => {
                e.ShopWarehouse = shopWarehouseAllList?.find(x => x?.id === e?.warehouse)
                e.shelf.PurchaseUnit = productPurchaseUnitTypes?.find(x => x?.id === e?.shelf?.purchase_unit_id)
                e.shelf.Shelf = e?.ShopWarehouse?.shelf?.find(x => x?.code === e?.shelf?.item)
            }))
            await setColumnsTable()
        } catch (error) {
            console.log("getMasterData : ", error)
        }
    }

    const getShopWarehousesAllList = async () => {
        try {
            const { data } = await API.get(`shopWarehouses/all?limit=9999999&page=1&sort=code_id&order=asc`)
            return data.status === "success" ? data.data.data ?? [] : []
        } catch (error) {
            console.log("getShopWarehousesAllList : ", error)
        }
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
                title: "รหัสชั้น",
                dataIndex: "code",
                key: "code",
                width: 300,
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
                            <Text>{text}</Text>
                        )
                    }
                },
            },
            {
                title: "ชั้น",
                dataIndex: "",
                key: "",
                width: 300,
                use: true,
                render: (text, record) => get(text, `name.${locale.locale}`, "-"),
            },
            {
                title: () => GetIntlMessages("เลือก"),
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

export default ComponentsRoutesModalShopShelf;
