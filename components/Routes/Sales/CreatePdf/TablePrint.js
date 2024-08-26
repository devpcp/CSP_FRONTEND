import { isArray } from 'lodash';
import { useSelector } from 'react-redux';
import { Table } from 'reactstrap';
import GetIntlMessages from '../../../../util/GetIntlMessages';

const TablePrint = ({ columns, dataSource = [], pagination = false, docTypeId }) => {

    const importcertificate = '054fada4-1025-4d0a-bdff-53cb6091c406'; //ใบนำเข้า
    const temporaryinvoice = '67c45df3-4f84-45a8-8efc-de22fef31978'; //ใบส่งซ่อม
    const fullreceipt = 'e67f4a64-52dd-4008-9ef0-0121e7a65d48'; //ใบเสร็จเต็มรูป
    const summaryreceipt = 'b39bcb5d-6c72-4979-8725-c384c80a66c3'; //ใบเสร็จอย่างย่อ
    const repairorder = '7ef3840f-3d7f-43de-89ea-dce215703c16'; //ใบสั่งซ่อม

    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale, mainColor } = useSelector(({ settings }) => settings);

    const getDisplayProductDetails = (value) => {
        try {
            if (isArray(value.list_shop_stock)) {
                const findProduct = value.list_shop_stock.find(where => where.product_id == value.product_id)
                const { Product, price, product_bar_code } = findProduct.ShopProduct
                const displayData = `${GetIntlMessages("code")} : ${Product?.master_path_code_id} | ${GetIntlMessages("product-name")} : ${Product?.product_name[locale.locale]}`
                return displayData ?? ""
            }
        } catch (error) {

        }
    }

    const getEachRowTotalPrice = (price, amount) => {
        try {
            let resultPrice = 0
            if (price && amount) resultPrice = Number(price) * Number(amount)
            return resultPrice.toLocaleString()
        } catch (error) {

        }

    }

    return (
        <Table>
            <thead className="table-header-color" >
                <tr>
                    {columns.map((e, index) => {
                        return (
                            <th className={`text-${e?.align ?? "center"}`} style={{ width: e?.width }}>{e?.title} </th>
                        )
                    })}
                </tr>
            </thead>
            <tbody>
                {
                    dataSource.map((o, i) => {
                        switch (docTypeId) {
                            case temporaryinvoice:
                                return (
                                    <tr key={"lst_" + i++ + ""}>
                                        <th className="text-center">{i + 1}</th>
                                        <td className="text-left">{getDisplayProductDetails(o)}</td>
                                        <td className="text-left">{o?.price ?? ""}</td>
                                        <td className="text-left">{o?.amount ?? ""}</td>
                                        <td className="text-left">{o?.amount ?? ""}</td>
                                        <td className="text-left">{getEachRowTotalPrice(o?.price, o?.amount)}</td>
                                    </tr>
                                )
                            case repairorder:
                                return (
                                    <tr key={"lst_" + i++ + ""}>
                                        <th className="text-center">{i + 1}</th>
                                        <td className="text-left">{getDisplayProductDetails(o)}</td>
                                        <td className="text-left">{o?.price ?? ""}</td>
                                        <td className="text-left">{o?.amount ?? ""}</td>
                                        <td className="text-left">{o?.price ?? ""}</td>
                                        <td className="text-left">{o?.amount ?? ""}</td>
                                        <td className="text-left">{getEachRowTotalPrice(o?.price, o?.amount)}</td>
                                    </tr>
                                )
                                case summaryreceipt:
                                    return (
                                        <tr key={"lst_" + i++ + ""}>
                                            <th className="text-center">{i + 1}</th>
                                            <td className="text-left">{getDisplayProductDetails(o)}</td>
                                            <td className="text-left">{o?.price ?? ""}</td>
                                        </tr>
                                    )
                                
                            default:
                                break;
                        }

                    })
                }
            </tbody>
        </Table>




        // <Table >
        //     <thead >
        //         <tr>
        //             <th className="text-center" style={{ width: "10%" }}>#</th>
        //             <th className="text-center" style={{ width: "20%" }}>รายละเอียด</th>
        //             <th className="text-center" style={{ width: "20%" }}>จำนวน</th>
        //             <th className="text-center" style={{ width: "20%" }}>ราคาต่อหน่วย<span className="text-danger"></span></th>
        //             <th className="text-center" style={{ width: "30%" }}>ส่วนลด</th>
        //             <th className="text-center" style={{ width: "30%" }}>มูลค่า</th>

        //         </tr>
        //     </thead>
        //     <tbody>
        //         {
        //             dataSource.map((o, i) => {
        //                 return (
        //                     <tr key={"lst_" + i++ + ""}>
        //                         <td className="text-center">{i++}</td>
        //                         <td className="text-left">{o.t1}</td>
        //                         <td className="text-left">{o.t2}</td>
        //                         <td className="text-left">{o.t3}</td>
        //                         <td className="text-left">{o.t4}</td>
        //                         <td className="text-left">{o.t5}</td>
        //                     </tr>
        //                 )
        //             })
        //         }
        //     </tbody>
        // </Table>
    );
};

export default TablePrint;
