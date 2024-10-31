import React from 'react'
import { Col, Form, Row, } from 'antd'
import Fieldset from '../../../../shares/Fieldset'
import { ImageMulti } from '../../../../shares/FormUpload/ImageMulti';

const ComponentsRoutesModalTab4DocImage = ({ mode }) => {
    const form = Form.useFormInstance()
    const upload_product_list = Form.useWatch(`upload_product_list`, { form, preserve: true })

    return (
        <>
            <Row gutter={[20]}>
                <Col lg={8} md={12} xs={24}>
                    <Fieldset legend={(<span style={{ paddingLeft: 10, paddingRight: 10, fontSize: "1.5rem" }}>รูปสินค้า</span>)}>
                        <ImageMulti name="upload_product_list" listType={`picture`} isfile isMultiple={true} value={upload_product_list} form={form} isShowRemoveIcon={mode !== "view"} disabled={mode === "view"} lengthUpload={10} mode={mode}  />
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