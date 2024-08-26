import React from 'react'
import PurchaseAndPrePurchaseOrderDoc from '../../components/Routes/Inventory/PurchaseAndPrePurchaseOrderDoc'

/* get Master documentTypes */
// 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
// 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบส่งของชั่วคราว
// e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
// b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
// 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
// 941c0fc7-794b-4838-afca-2bd8884dc36d = ใบสั่งซื้อ

const PurchaseOrder = () => {
    return <PurchaseAndPrePurchaseOrderDoc docTypeId="941c0fc7-794b-4838-afca-2bd8884dc36d" />
}

export default PurchaseOrder