import React from 'react'
import TemporaryDeliveryOrderDocWholeSale from '../../components/Routes/Sales/ShopWholesaleDocument/ShopTemporaryDeliveryOrderDocWholeSale'
// import ShopSalesTransactionDoc from '../../components/Routes/Sales/ShopSalesTransactionDoc'

/* get Master documentTypes */
// 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
// 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบสั่งขาย
// e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
// b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
// 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
// 80235edb-53e0-43ee-9b3b-768e3e2e7777 = ใบส่งของชั่วคราว

const ServicePlans = () => {
    return <TemporaryDeliveryOrderDocWholeSale docTypeId={`80235edb-53e0-43ee-9b3b-768e3e2e7777`}/>
}

export default ServicePlans