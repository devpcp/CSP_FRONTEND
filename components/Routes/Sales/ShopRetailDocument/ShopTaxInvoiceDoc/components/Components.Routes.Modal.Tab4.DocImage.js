import React from 'react'
import { Col, Form, Row, } from 'antd'
import Fieldset from '../../../../../shares/Fieldset'
import { ImageMulti } from '../../../../../shares/FormUpload/ImageMulti';

const ComponentsRoutesModalTab4DocImage = ({ mode, disabledWhenDeliveryDocActive = false }) => {
    const form = Form.useFormInstance()
    const upload_car_list = Form.useWatch(`upload_car_list`, { form, preserve: true })
    const upload_product_list = Form.useWatch(`upload_product_list`, { form, preserve: true })
    const upload_payment_list = Form.useWatch(`upload_payment_list`, { form, preserve: true })

    return (
        <>
            <Row gutter={[20]}>
                <Col lg={8} md={12} xs={24}>
                    <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>รูปรถที่ซ่อม</span>)}>
                        <ImageMulti name="upload_car_list" listType={`picture`} isfile isMultiple={true} value={upload_car_list} form={form} isShowRemoveIcon={mode !== "view"} disabled={true} lengthUpload={10} mode={mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />
                    </Fieldset>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>รูปสินค้า</span>)}>
                        <ImageMulti name="upload_product_list" listType={`picture`} isfile isMultiple={true} value={upload_product_list} form={form} isShowRemoveIcon={mode !== "view"} disabled={true} lengthUpload={10} mode={mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />
                    </Fieldset>
                </Col>
                <Col lg={8} md={12} xs={24}>
                    <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>รูปการชำระเงิน</span>)}>
                        <ImageMulti name="upload_payment_list" listType={`picture`} isfile isMultiple={true} value={upload_payment_list} form={form} isShowRemoveIcon={mode !== "view"} disabled={true} lengthUpload={10} mode={mode} disabledWhenDeliveryDocActive={disabledWhenDeliveryDocActive} />
                    </Fieldset>
                </Col>
            </Row >
            <style>{`
                .ant-btn-icon-only.ant-btn-sm {
                    padding: 0 !important;
                  }
            `}</style>
        </>
    )
}

export default ComponentsRoutesModalTab4DocImage