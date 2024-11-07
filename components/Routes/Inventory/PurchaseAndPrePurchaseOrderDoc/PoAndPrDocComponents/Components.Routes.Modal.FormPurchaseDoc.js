import { Col, DatePicker, Form, Input, Row, Select, Button, Modal } from 'antd'
import useFormInstance from 'antd/lib/form/hooks/useFormInstance'
import { get, isArray, debounce, isFunction, isPlainObject } from 'lodash'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'
import BusinessPartnersData from "../../../../../routes/MyData/BusinessPartnersData"

const ComponentsRoutesModalFormPurchaseDoc = ({ mode, configModal, docTypeId, onFinish, onFinishFailed, calculateResult }) => {
    const [loadingSearch, setLoadingSearch] = useState(false)
    const form = Form.useFormInstance()
    const [shopBusinessPartners, setShopBusinessPartners] = useState([])
    const { taxTypes, documentTypes } = useSelector(({ master }) => master);
    const { locale, mainColor } = useSelector(({ settings }) => settings);
    const [isBusinessPartnersDataModalVisible, setIsBusinessPartnersDataModalVisible] = useState(false);

    /**
 * Get the value of the array field at the specified index
 * @param {number} index - The index of the array.
 * @param {string} type - The type of the field.
 * @returns The `getArrListValue` function returns an array of values.
 */
    const getArrListValue = (type) => {
        try {
            const watchData = Form.useWatch(type, form)
            return isArray(watchData) ? watchData ?? [] : []
        } catch (error) {
            // console.log('error getArrListValue:>> ', error);
        }
    }

    useEffect(() => {
        const { business_partners_list } = form.getFieldValue()
        business_partners_list?.map((e) => {
            e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
        })
        setShopBusinessPartners(business_partners_list)
    }, [])

    const getShopBusinessPartnersDataListAll = async (value = "") => {
        const { data } = await API.get(`/shopBusinessPartners/all?search=${value}&limit=10&page=1&sort=partner_name.th&order=desc&status=active`);
        return data.data.data ?? []
    }

    const callBackPickBusinessPartners = async (data, type = "modal") => {
        try {
            let businessPartnerData = await getShopBusinessPartnersDataListAll(data.partner_name[locale.locale])
            businessPartnerData?.map((e) => {
                e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
            })
            switch (type) {
                case "bar":
                    break;
                default:
                    setShopBusinessPartners(businessPartnerData)
                    break;
            }

            let _model = {
                business_partner_id: data.id,
                tax_type_id: data?.other_details?.tax_type_id ?? "fafa3667-55d8-49d1-b06c-759c6e9ab064"
            }
            await form.setFieldsValue(_model)
            handleCancelBusinessPartnersDataModal()
        } catch (error) {
            console.log("callBackPickBusinessPartners", error)
        }
    }

    const handleOpenBusinessPartnersDataModal = () => {
        try {
            setIsBusinessPartnersDataModalVisible(true)
        } catch (error) {

        }
    }
    const handleCancelBusinessPartnersDataModal = () => {
        try {
            setIsBusinessPartnersDataModalVisible(false)
        } catch (error) {

        }
    }

    const onSelectPartner = (e) => {
        let find = shopBusinessPartners.find(x => x.id === e)
        callBackPickBusinessPartners(find, "bar")
    }

    const debounceOnSearch = debounce((value, type) => onSearchBusinessPartnerData(value, type), 1000)

    const onSearchBusinessPartnerData = async (e) => {
        const data = await getShopBusinessPartnersDataListAll(e)
        data?.map((e) => {
            e.partner_branch = e.other_details.branch ? e.other_details.branch === "office" ? "(สำนักงานใหญ่)" : "(" + e.other_details.branch_code + " " + e.other_details.branch_name + ")" : ""
        })
        setShopBusinessPartners(data)
    }

    return (
        <>
            {/* <Form
                form={form}
                className="pt-3"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 24 }}
                wrapperCol={{ span: 18 }}
                layout={"vertical"}
            > */}
            <Row gutter={[20]}>
                <Col lg={8} md={12} sm={12} xs={24} hidden>
                    <Form.Item name="business_partners_list" />
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="business_partner_id"
                        label={GetIntlMessages("รหัสผู้จำหน่าย")}
                        help={loadingSearch ? "กำลังโหลดข้อมูล..กรุณารอสักครู่" : null}
                        extra="พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหาผู้จำหน่าย"
                    >
                        <Select
                            showSearch
                            allowClear
                            disabled={mode === "view"}
                            onSelect={(e) => onSelectPartner(e)}
                            onSearch={(value) => debounceOnSearch(value, "search")}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >
                            {shopBusinessPartners?.map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-code-${i}-${e.id}`}>{get(e, `code_id`, "-")}</Select.Option>)}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Row>
                        <Col lg={20} md={20} sm={18} xs={18}>
                            <Form.Item
                                name="business_partner_id"
                                label={GetIntlMessages("ชื่อผู้จำหน่าย")}
                                help={loadingSearch ? "กำลังโหลดข้อมูล..กรุณารอสักครู่" : null}
                                extra="พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหาผู้จำหน่าย"
                            >
                                <Select
                                    showSearch
                                    allowClear
                                    disabled={mode === "view"}
                                    style={{ width: "98%" }}
                                    onSearch={(value) => debounceOnSearch(value, "search")}
                                    onSelect={(e) => onSelectPartner(e)}
                                    optionFilterProp="children"
                                >
                                    {shopBusinessPartners?.map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-name-${i}-${e.id}`}> {e.partner_name[locale.locale] + " " + e.partner_branch}</Select.Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col lg={4} md={4} sm={6} xs={6} style={{ paddingTop: "30.8px", justifyContent: "end" }}>
                            <Form.Item >
                                <Button
                                    type='primary'
                                    style={{ width: "100%", borderRadius: "10px" }}
                                    onClick={() => handleOpenBusinessPartnersDataModal()}
                                >
                                    เลือก
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="business_partner_id"
                        label={GetIntlMessages("ประเภทธุรกิจ")}
                    >
                        <Select disabled showArrow={false}>
                            {shopBusinessPartners?.map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-type-${i}-${e.id}`}>{get(e, `BusinessType.business_type_name.${locale.locale}`, "-")}</Select.Option>)}
                            {/* {
                                    isArray(bussinessPartnerList) && bussinessPartnerList.length > 0 ?
                                        bussinessPartnerList.map((e, index) => <Select.Option value={e.id} key={`tax-type-${index}`}>{get(e, `BusinessType.business_type_name.${locale.locale}`, "-")}</Select.Option>)
                                        : []
                                } */}

                        </Select>

                    </Form.Item>
                </Col>

                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="tax_type_id"
                        label={GetIntlMessages("ประเภทภาษี")}
                    >
                        <Select showSearch disabled={mode === "view"} onChange={() => (isFunction(calculateResult)) ? calculateResult() : null}>
                            {
                                isArray(taxTypes) && taxTypes.length > 0 ?
                                    taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${index}`}>{e?.type_name[locale.locale]}</Select.Option>)
                                    : []
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="tax_type_id"
                        label={GetIntlMessages("อัตราภาษี (%)")}
                    >
                        <Select showArrow={false} disabled>
                            {
                                isArray(taxTypes) && taxTypes.length > 0 ?
                                    taxTypes.map((e, index) => <Select.Option value={e.id} key={`tax-type-${index}`}>{e?.detail?.tax_rate_percent}</Select.Option>)
                                    : []
                            }
                        </Select>
                        {/* <Input readOnly addonAfter={"%"} /> */}
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_type_id"
                        label={GetIntlMessages("ประเภทเอกสาร")}
                    >
                        <Select showArrow={false} disabled>
                            {
                                isArray(documentTypes) && documentTypes.length > 0 ?
                                    documentTypes.map((e, index) => <Select.Option value={e.id} key={`doc-type-${index}`}>{get(e, `type_name.${locale.locale}`, "-")}</Select.Option>)
                                    : []
                            }
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="ref_doc"
                        // name="purchase_requisition_id"
                        label={GetIntlMessages("เอกสารอ้างอิง")}

                    >
                        <Input disabled={mode === "view"} />
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="doc_date"
                        label={GetIntlMessages("วันที่อ้างอิง")}
                    >
                        <DatePicker style={{ width: "100%" }} disabled={mode === "view"} format={"DD/MM/YYYY"} />
                    </Form.Item>
                </Col>
            </Row>
            {/* </Form> */}
            <Modal
                maskClosable={false}
                open={isBusinessPartnersDataModalVisible}
                onCancel={handleCancelBusinessPartnersDataModal}
                width="90vw"
                style={{ top: 5 }}
                footer={(
                    <>
                        <Button onClick={() => handleCancelBusinessPartnersDataModal()}>{GetIntlMessages("กลับ")}</Button>
                    </>
                )}
            >
                {<BusinessPartnersData title="จัดการข้อมูลผู้จำหน่าย" callBack={callBackPickBusinessPartners} />}
            </Modal>

        </>
    )
}

export default ComponentsRoutesModalFormPurchaseDoc