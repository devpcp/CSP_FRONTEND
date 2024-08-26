import React from 'react'
import DebtorDoc from '../../components/Routes/Sales/DebtorDoc'
// import ShopSalesTransactionDoc from '../../components/Routes/Sales/ShopSalesTransactionDoc'

/* get Master documentTypes */
// 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
// 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบสั่งขาย
// e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
// b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
// 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
// 80235edb-53e0-43ee-9b3b-768e3e2e7777 = ใบส่งของชั่วคราว
// ใบรับชำระลูกหนี้ CDD, doc_type_id: 904cb8b8-bd78-40d0-94c7-00a87164bca1
// ใบวางบิลลูกหนี้ CBN, doc_type_id: 96ee646d-e46e-4823-b0a6-e71c1f922429
// ใบลดหนี้ลูกหนี้ CCN, doc_type_id: 86a35bf8-6077-4948-8fde-250048dbabbc
// ใบเพิ่มหนี้ลูกหนี้ CDN, doc_type_id: 4d3a406f-94fc-4199-bc4f-400b0121364b

const ServicePlans = () => {
    return <DebtorDoc docTypeId={`904cb8b8-bd78-40d0-94c7-00a87164bca1`}/>
}

export default ServicePlans