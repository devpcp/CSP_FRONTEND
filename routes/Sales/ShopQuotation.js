import React from 'react'
import ShopQuotationComponent from '../../components/Routes/Sales/Quotation/ShopQuotation'

/* get Master documentTypes */
// 054fada4-1025-4d0a-bdff-53cb6091c406 = ใบนำเข้า
// 67c45df3-4f84-45a8-8efc-de22fef31978 = ใบส่งของชั่วคราว
// e67f4a64-52dd-4008-9ef0-0121e7a65d48 = ใบเสร็จเต็มรูป
// b39bcb5d-6c72-4979-8725-c384c80a66c3 = ใบเสร็จอย่างย่อ
// 7ef3840f-3d7f-43de-89ea-dce215703c16 = ใบสั่งซ่อม
// e5871484-d096-41be-b515-b33aa715957a = ใบเสนอราคา
export const docTypeIdQuotation = "e5871484-d096-41be-b515-b33aa715957a";
export const menuIdQuotationRetail = "d81cb548-c0f1-4ee5-96c7-44897fa3e35d";
  

const ShopQuotation = () => {
    return <ShopQuotationComponent docTypeId={docTypeIdQuotation} menuId={menuIdQuotationRetail}/>
}

export default ShopQuotation