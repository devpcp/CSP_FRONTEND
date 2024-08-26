import { useEffect, useState } from 'react'
import { Row, Col, Card, Avatar, Form, Select, Button, Input, message, Switch, DatePicker, Empty, Space, Divider, Modal, Table } from 'antd';
import { Chart } from "react-google-charts";
import API from '../util/Api'
import { ReloadOutlined, ScanOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from "next/router";
import { isPlainObject, debounce, isArray } from 'lodash';
import moment from "moment";
import CarPreloader from '../components/_App/CarPreloader'
import { QrReader } from 'react-qr-reader';
import GetIntlMessages from '../util/GetIntlMessages';
import { get } from 'lodash';

const CheckStock = () => {
    const router = useRouter();
    const { locale } = useSelector(({ settings }) => settings);
    const { shopInCorporate } = useSelector(({ master }) => master);
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { authUser } = useSelector(({ auth }) => auth);
    const [loadingPage, setLoadingPage] = useState(false);
    const [productData, setProductData] = useState({})
    let { product_id } = router.query;
    const [data, setData] = useState('No result');
    const [openCamera, setOpenCamera] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [columns, setColumns] = useState([])
    const [loading, setLoading] = useState(false);
    const [textError, setTextError] = useState('');

    const [shopWareHouseList, setShopWareHouseList] = useState([])

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
    // /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    useEffect(() => {
        setColumnsTable()
        getMasterData()
    }, []);



    const getShopStockByid = async (id) => {

        const { data } = await API.get(`/shopStock/all?center_product_id=${id}`)
        return data.data.data[0]
    }

    const onScanSuccess = async (id) => {
        try {
            let data = await getShopStockByid(id)
            // console.log("data", data)
            // console.log("shopWareHouseList", shopWareHouseList)
            setData(id)
            if (isPlainObject(data)) {
                await handleOk()
            }
            if (data) {
                await setProductData(data)
                await setLoadingPage(false)
            }

        } catch (error) {

        }
    }

    const getMasterData = async () => {
        try {
            const promise1 = getShopWareHouseListAll(); // คลัง
            Promise.all([promise1]).then((values) => {
                // console.log(values)
                setShopWareHouseList(values[0])
            });
        } catch (error) {

        }
    }

    /* เรียกข้อมูล คลัง ชั้น ทั้งหมด */
    const getShopWareHouseListAll = async () => {
        const { data } = await API.get(`/shopWarehouses/all?limit=99999&page=1&sort=code_id&order=asc`)
        return data.status === "success" ? data.data.data ?? [] : []
    }

    const setColumnsTable = () => {
        const _column = [
            // {
            //     title: () => GetIntlMessages("order"),
            //     dataIndex: 'num',
            //     key: 'num',
            //     align: "center",
            //     width: "10%",
            //     render: (text, record, index) => {
            //         index += ((configTable.page - 1) * configTable.limit)
            //         return index + 1
            //     },
            // },

            {
                title: () => GetIntlMessages("คลัง"),
                dataIndex: 'warehouse',
                key: 'warehouse',
                // width: "80%",
                render: (text, record) => {
                    if (shopWareHouseList.length === 0) {
                        getMasterData()
                    }
                    return shopWareHouseList.length > 0 ?
                        shopWareHouseList.find(x => x.id === text).name?.[locale.locale] === undefined ||
                            shopWareHouseList.find(x => x.id === text).name?.[locale.locale] === null ||
                            shopWareHouseList.find(x => x.id === text).name?.[locale.locale] === "" ? shopWareHouseList.find(x => x.id === text).name?.[locale.locale] : shopWareHouseList.find(x => x.id === text).name?.[locale.locale] : ""
                }
            },
            {
                title: () => GetIntlMessages("ชั้น"),
                dataIndex: 'shelf',
                key: 'shelf',
                // width: "80%",
                render: (text, record) => {
                    return record.shelf.item ?? "-"
                }
            },
            {
                title: () => GetIntlMessages("DOT"),
                dataIndex: 'dot_mfd',
                key: 'dot_mfd',
                // width: "80%",
                render: (text, record) => {
                    return record.shelf.dot_mfd ?? "-"
                }
            },
            {
                title: () => GetIntlMessages("คงเหลือ"),
                dataIndex: 'shelf',
                key: 'shelf',
                align: "center",
                sorter: (a, b) => a.shelf.balance - b.shelf.balance,
                render: (text, record) => {
                    return (
                        <div style={{ textAlign: "end" }}>{record.shelf.balance.toLocaleString() ?? "-"}</div>
                    )
                }
            },

        ];

        setColumns(_column)
    }


    const scanOverlay = () => (
        <>

            <svg viewBox="0 0 100 100" className="scanOverlay">
                <path fill="none" d="M13,0 L0,0 L0,13" stroke="rgba(255, 0, 0, 9.9)" stroke-width="3"></path>
                <path fill="none" d="M0,87 L0,100 L13,100" stroke="rgba(255, 0, 0, 0.9)" stroke-width="3" ></path>
                <path fill="none" d="M87,100 L100,100 L100,87" stroke="rgba(255, 0, 9, 0.9)" stroke-width="3"></path>
                <path fill="none" d="M100,13 L100,0 87,0" stroke="rgba(255, 0, 0, 0.9)" stroke-width="3" ></path>
            </svg>

        </>
    )

    const openScan = async () => {
        await showModal()
        await setOpenCamera(!openCamera)

    }



    const showModal = async () => {
        await setIsModalOpen(true);
    };

    const handleOk = async () => {
        await setOpenCamera(!openCamera)
        await setIsModalOpen(false);
    };

    const handleCancel = async () => {
        await setOpenCamera(!openCamera)
        await setIsModalOpen(false);
    };


    if (loadingPage) {
        return (
            <CarPreloader />
        );
    } else {
        return (
            <>
                {/* <h1>ผลการสแกน {data}</h1> */}
                <Card>
                    <div style={{ fontSize: "1.4rem", textAlign: "center" }}>
                        เช็คสต๊อคสินค้า
                        <Button type='text' onClick={() => openScan()} size='large' icon={<ScanOutlined />}>
                        </Button>
                    </div>
                    <Divider dashed style={{ borderWidth: "2px", borderColor: "rgb(0 0 0 / 25%)" }} />
                    <Row style={{ textAlign: "center" }}>
                        <Col span={24}>
                            <div style={{ fontSize: "14px" }}>
                                <div style={{ fontWeight: "bold" }}>ชื่อสินค้า </div> {productData?.ShopProduct?.Product?.product_name[locale.locale]}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ fontSize: "14px" }}>
                                <div style={{ fontWeight: "bold" }}>ประเภทสินค้า </div> {productData?.ShopProduct?.Product?.ProductType?.type_name[locale.locale]}
                            </div>
                        </Col>

                        <Col span={24}>
                            <div style={{ fontSize: "14px" }}>
                                <div style={{ fontWeight: "bold" }}>ยี่ห้อ </div> {productData?.ShopProduct?.Product?.ProductBrand?.brand_name[locale.locale]}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div style={{ fontSize: "14px" }}>
                                <div style={{ fontWeight: "bold" }}>รุ่น </div> {productData?.ShopProduct?.Product?.ProductModelType?.model_name[locale.locale]}
                            </div>
                        </Col>
                        <Col span={24}>
                            <Table columns={columns} dataSource={productData?.warehouse_detail?.length > 0 ? productData?.warehouse_detail : null} />;
                        </Col>
                    </Row>
                </Card>
                <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                    {openCamera ?
                        <div style={{ alignContent: "center", alignItems: "center" }}>
                            <QrReader
                                constraints={{
                                    facingMode: 'environment',
                                    aspectRatio: { ideal: 1 }
                                }}
                                // delay={300}
                                onResult={(result, error) => {
                                    if (!!result) {
                                        onScanSuccess(result?.text)
                                    }
                                    if (!!error) {
                                        console.info("errr", error);
                                    }
                                }}

                                ViewFinder={scanOverlay}
                            >
                            </QrReader>
                        </div>
                        : ""
                    }
                    <div>{textError}</div>
                </Modal>
                <style jsx global>
                    {`
                    body{
                        background: #04afe3;
                    }
                    .scanOverlay{
                        top: 0px;
                        left: Opx;
                        z-index: 1;
                        box-sizing: border-box;
                        border: 50px solid transparent;
                        position: absolute;
                        width: 100%;
                        height: 100%;
                    }
                `}
                </style>

            </>
        )
    }

}

export default CheckStock
