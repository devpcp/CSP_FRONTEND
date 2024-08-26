import React, { useState, useEffect, forwardRef } from 'react'
import { Button, Form, Input, Modal, message, Row, Col, Layout, Divider, Table } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../util/GetIntlMessages';
import { get, isArray, isFunction, isPlainObject } from 'lodash';
import moment from 'moment';

import { CheckImage, UploadImageSingle } from '../../../shares/FormUpload/API';
import { ArabicNumberToText } from '../../../shares/NumberToCharacter';
import { useForm } from 'antd/lib/form/Form';

const ComponentToPrint = React.forwardRef((props, ref) => {
    // console.log('props', props)
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm()

    const [data, setData] = useState([])
    const [columns, setColumns] = useState([])
    const [ImgLogo, setImgLogo] = useState("")

    const { locale, mainColor, subColor } = useSelector(({ settings }) => settings);
    const { authUser } = useSelector(({ auth }) => auth);

    useEffect(() => {
        if (props.tableData && isPlainObject(props.tableData)) {
            setData([props.tableData])
        }
        setColumnsTable()
        checkLogo()
        // dataTable()

    }, [props.tableData])

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
            order: "descend",
            column: {
                created_by: true,
                created_date: true,
                updated_by: true,
                updated_date: true,
                status: false
            }
        },
        configSort: {
            sort: `created_date`,
            order: "descend",
        },
        modelSearch: {
            search: "",
            status: "3",
        },
    }

    /** Config ตาราง */
    const [configTable, setConfigTable] = useState(init.configTable)

    /** Config เรียงลำดับ ของ ตาราง */
    const [configSort, setConfigSort] = useState(init.configSort)

    /** ตัวแปล Search */
    const [modelSearch, setModelSearch] = useState(init.modelSearch)

    const setColumnsTable = () => {
        const _column = [
            {
                title: () => GetIntlMessages("order"),
                dataIndex: 'num',
                key: 'num',
                align: "center",
                width: 50,
                render: (text, record, index) => {
                    index += ((configTable.page - 1) * configTable.limit)
                    return index + 1
                },
            },

            {
                title: () => GetIntlMessages("รายละเอียด"),
                dataIndex: '',
                key: '',
                width: 250,
                // align: "center",
                render: (text, record) => customDetails(text),
                // render: (text, record) => `${text.details.payment.type_text} ${text.DocumentTypes.type_name[locale.locale]} เลขที่ ${text.code_id} มูลค่า ${text.details.calculate_result.net_total_text} บาท `,
            },
            {
                title: () => GetIntlMessages("ยอดชำระ"),
                dataIndex: '',
                key: '',
                width: 120,
                // align: "center",
                render: (text, record) => isPlainObject(text.details.payment) ? Number(text.details.payment.cash).toLocaleString() : "-",
            },

        ];
        setColumns(_column)
    }


    const customDetails = (value) => {
        // console.log('value customDetails', value)
        try {
            return `${value.details?.payment.type_text ?? "-"} ${value.DocumentTypes.type_name[locale.locale]} เลขที่ ${value.code_id} มูลค่า ${value.details.calculate_result.net_total_text} บาท `
        } catch (error) {
            
        }
        
    }

    /*เผื่อใช้ในกรณีที่ทำ table เอง โดยไม่ใช้ table ของ ant*/
    // const dataTable = () => {
    //     if (isPlainObject(props.tableData)) {
    //         const { print_invoices } = form.getFieldsValue()
    //         print_invoices = []
    //         const obj = {
    //             details: `${props.tableData.details.payment.type_text} ${props.tableData.DocumentTypes.type_name[locale.locale]} เลขที่ ${props.tableData.code_id} มูลค่า ${props.tableData.details.calculate_result.net_total_text ?? "-"} บาท `,
    //             net_total: props.tableData.details.calculate_result.net_total ?? "-",
    //         }
    //         print_invoices.push(obj)
    //         form.setFieldsValue({ print_invoices })
    //     }
    // }

    const checkLogo = async () => {
        try {
            const urlImg = await CheckImage({
                directory: "profiles",
                name: authUser.id,
                fileDirectoryId: authUser.id,
            })
            setImgLogo(urlImg)
        } catch (error) {

        }
    }

    const phoneNumberToArray = (phoneType) => {
        const newArrMoblie = []
        // console.log('phoneType', phoneType)
        if (isPlainObject(props.tableData) && phoneType == "mobile") {
            newArrMoblie = Object.values(props.tableData.ShopsProfiles.mobile_no);
            return newArrMoblie ?? []
        } else if (isPlainObject(props.tableData) && phoneType == "telephone") {
            newArrMoblie = Object.values(props.tableData.ShopsProfiles.tel_no);
            return newArrMoblie ?? []
        }
        return []
    }

    const netTotalWithOutVat = () => {
        let result
        if (isPlainObject(props.tableData)) {
            const netTotal = props.tableData.details.calculate_result.net_total
            const vat = props.tableData.details.calculate_result.vat
            result = netTotal - vat
            return result.toLocaleString() ?? 0
        }
    }


    return (

        <>
            <div ref={ref} style={{ width: "100%", height: "100%" }}>
                <page size={props.size} style={{  width: "100%", height: "100%", paddingLeft: "30px", paddingRight: "30px" }}>

                    <div id="hearder-print-invoices" style={{ width: "100%", height: "25%" }}>

                        <Row gutter={[30, 10]}>
                            <Col span={8}>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <img style={{ width: "150px", height: "150px" }} src={ImgLogo} />
                                    <div style={{ marginTop: "15px" }}>
                                        {isPlainObject(props.tableData) ?
                                            <Row>
                                                <Col span={24}>
                                                    {props.tableData.ShopsProfiles.shop_name[locale.locale]}
                                                    {/* บริษัท โปรคอนซัลท์พลัส จำกัด (สำนักงานใหญ่) */}
                                                </Col>
                                                <Col span={24}>
                                                    {`
                                    ที่อยู่ ${props.tableData.ShopsProfiles.address ? props.tableData.ShopsProfiles.address[locale.locale] ?? "-" : "-"}
                                    แขวง/ตำบล ${props.tableData.ShopsProfiles.SubDistrict ? props.tableData.ShopsProfiles.SubDistrict[`name_${locale.locale}`] ?? "-" : "-"}
                                    เขต/อำเภอ ${props.tableData.ShopsProfiles.District ? props.tableData.ShopsProfiles.District[`name_${locale.locale}`] ?? "-" : "-"}
                                    จังหวัด ${props.tableData.ShopsProfiles.Province ? props.tableData.ShopsProfiles.Province[`prov_name_${locale.locale}`] ?? "-" : "-"}
                                    รหัสไปรษณีย์ ${props.tableData.ShopsProfiles.SubDistrict ? props.tableData.ShopsProfiles.SubDistrict["zip_code"] ?? "-" : "-"}
                                `}
                                                </Col>
                                                <Col span={24}>
                                                    {`เลขประจำตัวผู้เสียภาษี ${props.tableData.ShopsProfiles.tax_code_id ?? "-"}`}
                                                </Col>
                                                <Col span={24}>
                                                    โทร : {phoneNumberToArray('telephone').map((e, index) => {
                                                        return e
                                                    }).join(',')}
                                                </Col>
                                                <Col span={24}>
                                                    เบอร์มือถือ : {phoneNumberToArray('mobile').map((e, index) => {
                                                        return e
                                                    }).join(',')}
                                                </Col>
                                            </Row>
                                            : null}
                                    </div>

                                </div>

                            </Col>
                            <Col span={10} offset={6}>
                                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <div style={{ fontSize: "25px", color: mainColor }}>
                                        ใบกับกำภาษีอย่างย่อ/ใบเสร็จรับเงิน
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "center", color: mainColor }}>ต้นฉบับ</div>
                                </div>
                                <Divider />
                                <Row>
                                    <Col span={8} style={{ color: mainColor }}>เลขที่</Col>
                                    <Col span={16}>{isPlainObject(props.tableData) ? props.tableData.code_id : null}</Col>

                                    <Col span={8} style={{ color: mainColor }}>วันที่ </Col>
                                    <Col span={16}>{moment(new Date).format('DD/MM/YYYY')}</Col>

                                    <Col span={8} style={{ color: mainColor }}>พนักงานขาย</Col>
                                    <Col span={16}>{`${authUser.UsersProfile?.fname[locale.locale]} ${authUser.UsersProfile?.lname[locale.locale]}`}</Col>

                                    <Col span={8} style={{ color: mainColor }}>อ้างอิง</Col>
                                    <Col span={16}>{isPlainObject(props.tableData) &&  isArray(props.tableData.ShopSalesTransactionOuts) && props.tableData.ShopSalesTransactionOuts.lenght > 0 ? props.tableData.ShopSalesTransactionOuts[0].ShopSalesTransactionDocRef.code_id : null}</Col>
                                </Row>
                                <Divider />
                                <Row>
                                    <Col span={8} style={{ color: mainColor }}>*ชื่องาน*</Col>
                                    <Col span={16}> *ชุดกล้อง Reolink RLKB-B00B4 (POE)*</Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    <div id="content-print-invoices" style={{ width: "100%", height: "55%" }}>
                        <Row>
                            <Col span={24}>
                                <Table
                                    id='table-print'
                                    columns={columns} dataSource={data}
                                    pagination={false}
                                />

                            </Col>
                        </Row>
                        <Row justify={'space-between'} style={{ paddingTop: "30px" }}>
                            <Col span={12}>
                                <br />
                                <br />
                                <br />
                                <br />
                                <div >{<ArabicNumberToText convertNumber={isPlainObject(props.tableData) ? props.tableData.details.calculate_result.net_total_text : 0} />}</div>
                            </Col>
                            <Col span={8} offset={4}>
                                <Row justify={'space-between'}>
                                    <Col span={12} style={{ color: mainColor }}>รวมทั้งสิ้น</Col>
                                    <Col span={12} style={{ textAlign: "end" }}>
                                        {isPlainObject(props.tableData) ?
                                            `${props.tableData.details.calculate_result.net_total_text} บาท `
                                            : null}
                                    </Col>

                                    <Col span={12} style={{ color: mainColor }}>ภาษีมูลค่าเพิ่ม</Col>
                                    <Col span={12} style={{ textAlign: "end" }}>
                                        {isPlainObject(props.tableData) ?
                                            `${props.tableData.details.calculate_result.vat.toLocaleString()} บาท`
                                            : null}
                                    </Col>

                                    <Col span={12} style={{ color: mainColor }}>ราคาไม่รวมภาษีมูลค่าเพิ่ม</Col>
                                    <Col span={12} style={{ textAlign: "end" }}>{netTotalWithOutVat()} บาท</Col>
                                    <br />
                                    <br />
                                    <Col span={24}>
                                        <div style={{ backgroundColor: "rgb(220,220,220)", color: mainColor }}>
                                            ยอดชำระทั้งหมด : {isPlainObject(props.tableData) ? `${props.tableData.details.calculate_result.net_total_text} บาท ` : null}
                                        </div>
                                    </Col>
                                </Row>

                            </Col>
                        </Row>
                        <Row style={{ paddingTop: "40px" }}>
                            <Col span={24} style={{ color: mainColor }}>
                                หมายเหตุ
                            </Col>
                            <Col span={24}>
                                1.กรณีชำระเงินโดยเช็ค กรุณาสั่งจ่ายเช็คขีดคร่อมในนาม "บ." เท่านั้น
                            </Col>
                            <Col span={24}>
                                2.กรณีชำระเงินโดยการโอน กรุณาโอนที่ธนาคารกรุงเทพ เลขที่บัญชี 245-0-84380-6 ชื่อบัญชี บจ.โปรคอนซัลท์พลัส เท่านั้น
                            </Col>
                            <Col span={24}>
                                3.บริษัทฯ ขอสงวนสิทธิ์ในการแก้ไขใบกำกับภาษีภายใน 7 วันนับจากวันที่ระบุในใบกำกับภาษี (ผิด ตก ยกเว้น E. & OE.)
                            </Col>
                        </Row>
                        {isPlainObject(props.tableData) ?
                            <Row>
                                <Col span={24}>
                                    {props.tableData.details.remark}
                                </Col>
                            </Row>
                            : null}
                        {isPlainObject(props.tableData) ?
                            <Row>
                                <Col span={24}>
                                    {props.tableData.details.remark_inside}
                                </Col>
                            </Row>
                            : null}
                    </div>

                    <div id="footer-print-invoices" style={{ postion: "fixed", bottom: "0px", width: "100%", height: "18%" }}>
                        <Row gutter={[10, 30]}>
                            <Col span={24}>
                                การชำระเงินจะสมบูรณ์เมื่อบริษัทได้รับเงินเรียบร้อยแล้ว เงินสด / เช็ค / โอนเงิน / บัตรครดิต /
                            </Col>
                            <Col span={24}>
                                <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
                                    <span >ธนาคาร</span> <div style={{ width: "25%", borderBottom: "0.8px solid rgb(220,220,220)" }} />
                                    <span >เลขที่</span> <div style={{ width: "25%", borderBottom: "0.8px solid rgb(220,220,220)" }} />
                                    <span >วันที่</span> <div style={{ width: "15%", borderBottom: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>{moment(new Date).format('DD/MM/YYYY')}</div>
                                    <span >จำนวนเงิน</span> <div style={{ width: "17%", borderBottom: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>{isPlainObject(props.tableData) ? `${props.tableData.details.calculate_result.net_total_text}` : null}</div>
                                </div>
                            </Col>

                            <Col span={24}>
                                <Row justify='space-between'>
                                    <Col span={12}>
                                        ในนาม {isPlainObject(props.tableData) && isPlainObject(props.tableData.ShopPersonalCustomers) ? `คุณ ${props.tableData.ShopPersonalCustomers.customer_name.first_name[locale.locale]} ${props.tableData.ShopPersonalCustomers.customer_name.last_name[locale.locale]}` ?? "-"
                                            : isPlainObject(props.tableData) && isPlainObject(props.tableData.ShopBusinessCustomers) ? `${props.tableData.ShopBusinessCustomers.customer_name[locale.locale]} ` ?? "-" : null}
                                    </Col>
                                    <Col span={12} style={{ textAlign: "end" }}>ในนาม {isPlainObject(props.tableData) ? props.tableData.ShopsProfiles.shop_name[locale.locale] : null} </Col>
                                </Row>
                            </Col>
                        </Row>
                    </div>

                    <div id='footer-signature-printprint-invoices' style={{ postion: "fixed", bottom: "0px", width: "100%" }}>
                        <Row>
                            <Col span={4}><div style={{ borderTop: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>ผู้จ่ายเงิน</div></Col>
                            <Col span={4} offset={1}><div style={{ borderTop: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>วันที่</div></Col>
                            <Col span={4} offset={1}><div></div></Col>
                            <Col span={4} offset={1}><div style={{ borderTop: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>ผู้รับเงิน</div></Col>
                            <Col span={4} offset={1}><div style={{ borderTop: "0.8px solid rgb(220,220,220)", textAlign: "center" }}>วันที่</div></Col>
                        </Row>
                    </div>

                </page>

                
            </div>
        </>
    )
});

export default ComponentToPrint;