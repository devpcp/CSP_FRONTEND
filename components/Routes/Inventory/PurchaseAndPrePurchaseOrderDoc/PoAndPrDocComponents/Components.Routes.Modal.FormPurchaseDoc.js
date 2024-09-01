import { Col, DatePicker, Form, Input, Row, Select } from 'antd'
import useFormInstance from 'antd/lib/form/hooks/useFormInstance'
import { get, isArray, debounce, isFunction, isPlainObject } from 'lodash'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import API from '../../../../../util/Api'
import GetIntlMessages from '../../../../../util/GetIntlMessages'

const ComponentsRoutesModalFormPurchaseDoc = ({ mode, configModal, docTypeId, onFinish, onFinishFailed, calculateResult }) => {
    const [loadingSearch, setLoadingSearch] = useState(false)
    const form = Form.useFormInstance()

    const { taxTypes, documentTypes } = useSelector(({ master }) => master);
    const { locale, mainColor } = useSelector(({ settings }) => settings);

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

    const debounceOnSearch = debounce((value, type) => searchSelectClear(value, type), 800)
    const searchSelectClear = async (value, type) => {
        try {
            setLoadingSearch(() => true)
            const { business_partners_list } = form.getFieldValue()
            switch (type) {
                case "search":
                    if (!!value) {
                        const { data } = await API.get(`/shopBusinessPartners/all?search=${value}&limit=50&page=1&sort=partner_name.th&order=desc&status=active`);
                        if (data.status === "success") {
                            // setBussinessPartnerList(() => data.data.data)
                            business_partners_list = data.data.data ?? []

                        }
                    }

                    break;

                default:
                    break;
            }

            form.setFieldsValue({ business_partners_list })
            setLoadingSearch(() => false)
        } catch (error) {
            // console.log('error :>> ', error);
        }
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
                        <Select showSearch allowClear disabled={mode === "view"}
                            onSearch={(value) => debounceOnSearch(value, "search")}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        // filterOption={false}
                        >
                            {getArrListValue("business_partners_list").map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-code-${i}-${e.id}`}>{get(e, `code_id`, "-")}</Select.Option>)}
                            {/* {
                                    isArray(bussinessPartnerList) && bussinessPartnerList.length > 0 ?
                                        bussinessPartnerList.map((e, index) => <Select.Option value={e.id} key={`tax-type-${index}`}>{get(e, `code_id`, "-")}</Select.Option>)
                                        : []
                                } */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="business_partner_id"
                        label={GetIntlMessages("ชื่อผู้จำหน่าย")}
                        help={loadingSearch ? "กำลังโหลดข้อมูล..กรุณารอสักครู่" : null}
                        extra="พิมพ์อย่างน้อย 1 ตัวเพื่อค้นหาผู้จำหน่าย"
                    >
                        <Select showSearch allowClear disabled={mode === "view"}
                            onSearch={(value) => debounceOnSearch(value, "search")}
                            // filterOption={false}
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >
                            {getArrListValue("business_partners_list").map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-name-${i}-${e.id}`}>{get(e, `partner_name.${locale.locale}`, "-")}</Select.Option>)}
                            {/* {
                                    isArray(bussinessPartnerList) && bussinessPartnerList.length > 0 ?
                                        bussinessPartnerList.map((e, index) => <Select.Option value={e.id} key={`tax-type-${index}`}>{get(e, `partner_name.${locale.locale}`, "-")}</Select.Option>)
                                        : []
                                } */}
                        </Select>
                    </Form.Item>
                </Col>
                <Col lg={8} md={12} sm={12} xs={24}>
                    <Form.Item
                        name="business_partner_id"
                        label={GetIntlMessages("ประเภทธุรกิจ")}
                    >
                        <Select disabled showArrow={false}>
                            {getArrListValue("business_partners_list").map((e, i) => <Select.Option value={e.id} key={`bussiness-partner-type-${i}-${e.id}`}>{get(e, `BusinessType.business_type_name.${locale.locale}`, "-")}</Select.Option>)}
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

        </>
    )
}

export default ComponentsRoutesModalFormPurchaseDoc