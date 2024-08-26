import { Button, Form, Modal, Row, Col } from 'antd'
import React, { useState } from 'react'
import GetIntlMessages from '../../../util/GetIntlMessages'
import ImportDocAddEditViewModal from '../ImportDocumentModal/ImportDocAddEditViewModal'
import ModalFullScreen from '../../shares/ModalFullScreen'
import API from '../../../util/Api'
import { FileSearchOutlined, TableOutlined } from '@ant-design/icons'
import ProductMovement from '../Movement/ProductMovementV3'
import { isFunction } from 'lodash'
import Swal from 'sweetalert2'
import { useSelector } from 'react-redux'

const ModalViewShopStock = ({ mode, btnStyle, shopStockId, disabled, rowIndex = null, configBtn = { icon: <FileSearchOutlined style={{ fontSize: 20 }} />, btn_name: null }, dropDownBtnWarehouse = false, callbackSelectProduct, disabledWhenDeliveryDocActive = false }) => {

    const [loading, setLoading] = useState(false)

    const [isModalVisible, setIsModalVisible] = useState(false)
    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);
    /*Form*/
    const [form] = Form.useForm()
    const viewModal = async () => {
        try {
            if (shopStockId) {
                const { data } = await API.get(`/shopStock/byid/${shopStockId}?filter_wyz_code=false&filter_available_balance=true`)
                // console.log('data :>> ', data);
                if (data.status === "success") {
                    const product_list = data.data.map((e, index) => {
                        return {
                            // ...e,
                            unit_list: e?.ShopProduct?.Product?.ProductType?.ProductPurchaseUnitTypes ?? [],
                            product_id: e.product_id,
                            productId_list: [e?.ShopProduct],
                            amount_all: e?.balance ?? null,
                            warehouse_detail: e?.warehouse_detail.map(v => {
                                return {
                                    warehouse: v.warehouse,
                                    shelf: v.shelf.item,
                                    purchase_unit_id: v.shelf.purchase_unit_id,
                                    dot_mfd: v.shelf.dot_mfd,
                                    amount: v.shelf.balance,
                                }
                            }).filter(where => Number(where.amount) !== 0) ?? []
                            
                        }
                    })
                    
                    product_list[0]?.warehouse_detail?.sort((a, b) => a?.dot_mfd === undefined || b?.dot_mfd === undefined ? -1 : Number(a?.dot_mfd.slice(-2)) - Number(b?.dot_mfd.slice(-2)));
                    form.setFieldsValue({ product_list, ...data.data[0] })
                }
            }
            setIsModalVisible(() => true)
        } catch (error) {
            console.log('error :>> ', error);
            setIsModalVisible(() => false)
        }
    }

    const handleCancel = () => {
        try {
            form.resetFields()
            setIsModalVisible(() => false)
        } catch (error) {

        }
    }

    /**
    * ควบคุมการเปิด ปิด modal การเคลื่อนไหวสินค้า
    */
    const [visibleMovementModal, setVisibleMovementModal] = useState(false)
    const [fliterEachMovement, setFliterEachMovement] = useState({})

    const visibleEachWarehouseMovementModal = (index1, index2) => {
        try {
            const { product_list } = form.getFieldValue()
            let _model = {
                ...product_list[index1]?.warehouse_detail[index2],
                shop_id: authUser?.UsersProfile?.ShopsProfile?.id,
                shop_product_id: product_list[index1]?.product_id
            }
            setVisibleMovementModal(prevValue => true)
            setFliterEachMovement(_model)

        } catch (error) {

        }
    }

    const selectShopProductStock = (value, index1, index2) => {
        try {
            // console.log('value selectShopProductStock:>> ', value);
            const { product_list } = value
            const warehouseDeatails = product_list[index1].warehouse_detail[index2]
            const amount = Number(warehouseDeatails.amount)

            const findUnit = product_list[index1]["unit_list"].find(where => where.id === warehouseDeatails["purchase_unit_id"])
            if (isFunction(callbackSelectProduct)) {
                if (amount <= 0) {
                    Swal.fire({
                        title: 'จำนวนสินค้าไม่เพียงพอ!!',
                        icon: "warning",
                        confirmButtonText: GetIntlMessages("submit"),
                        confirmButtonColor: mainColor
                    })
                } else {
                    Swal.fire({
                        title: 'กรุณาใส่จำนวนที่ต้องการ',
                        text: `ชื่อคลัง -> ชื่อชั้นวาง -> ${warehouseDeatails["dot_mfd"]} -> ${findUnit[`type_name`][locale.locale]}`,
                        input: 'number',
                        inputAttributes: {
                            min: 0,
                            max: amount
                        },
                        // inputAttributes: {
                        //   autocapitalize: 'off'
                        // },
                        showCancelButton: true,
                        confirmButtonText: GetIntlMessages("submit"),
                        cancelButtonText: GetIntlMessages("cancel"),
                        confirmButtonColor: mainColor,
                        showLoaderOnConfirm: true,
                        inputValidator: (val) => {
                            if (!!val && (Number(val) <= 0 || Number(val) > amount)) {
                                return GetIntlMessages("ท่านใส่จำนวนสินค้ามากกว่าจำนวนที่มีอยู่ !!")
                            } else if (!val) {
                                return GetIntlMessages("กรุณาใส่จำนวนที่ต้องการ")
                            }
                        },
                        preConfirm: (val) => {
                            // console.log('val :>> ', val);
                            if (!!val) {
                                return val
                            } else {
                                return null
                            }
                            // return fetch(`//api.github.com/users/${login}`)
                            //     .then(response => {
                            //         if (!response.ok) {
                            //             throw new Error(response.statusText)
                            //         }
                            //         return response.json()
                            //     })
                            //     .catch(error => {
                            //         Swal.showValidationMessage(
                            //             `Request failed: ${error}`
                            //         )
                            //     })
                        },
                        // allowOutsideClick: () => !Swal.isLoading()
                    }).then((result) => {
                        // console.log('result :>> ', result);
                        if (result.isConfirmed) {
                            callbackSelectProduct(value, index1, index2, result.value, rowIndex)
                            handleCancel()
                        }
                    })

                }

            }
        } catch (error) {
            console.log('error :>> ', error);
        }
    }

    return (
        <>
            <Button icon={configBtn.icon} style={btnStyle ?? { width: "100%" }} disabled={disabled || !shopStockId} onClick={() => viewModal()}>
                {configBtn.btn_name}
            </Button>

            <ModalFullScreen
                visible={isModalVisible}
                hideSubmitButton
                mode={"view"}
                // onCancel={() => setIsModalVisible(() => false)}
                title={GetIntlMessages("ดูคลังสินค้า")}
                CustomsButton={() => {
                    return (
                        <>
                            <Row justify={"end"} style={{ width: "100%" }} gutter={[10]}>
                                <Col span={5}>
                                    <Button style={btnStyle ?? { width: "100%" }} onClick={() => handleCancel()}>
                                        {GetIntlMessages("ปิด")}
                                    </Button>
                                </Col>
                                <Col span={5}>
                                    <Button icon={<TableOutlined style={{ fontSize: 18 }} />} style={btnStyle ?? { width: "100%" }} onClick={() => setVisibleMovementModal(() => true)}>
                                        {GetIntlMessages("การเคลื่อนไหวสินค้า")}
                                    </Button>
                                </Col>

                            </Row>

                        </>
                    )
                }}
            >
                <Form
                    form={form}
                >
                    <ImportDocAddEditViewModal mode={"view"} pageId={"a6c9c754-0239-4abe-ad6b-8cdb6b81dcc0"} form={form} configShowMovementBtn={true} visibleEachWarehouseMovementModal={visibleEachWarehouseMovementModal} dropDownBtnWarehouse={dropDownBtnWarehouse} callbackSelectProduct={mode !== "view" && disabledWhenDeliveryDocActive === false ? selectShopProductStock : null} />
                </Form>
            </ModalFullScreen>

            <ProductMovement mode={"view"} visibleMovementModal={visibleMovementModal} setVisibleMovementModal={setVisibleMovementModal} loading={loading} setLoading={setLoading} productData={form.getFieldValue()?.product_list} fliterEachMovement={fliterEachMovement} setFliterEachMovement={setFliterEachMovement} />
        </>

    )
}

export default ModalViewShopStock