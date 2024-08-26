import { Row, Col } from "antd";
import React from "react";
// import 'antd/dist/antd.css';

const Signature = ({props,locale}) => {
    const CheckValue = (val, val2 = null) => {
        return val ? 'ในนาม ' + val[locale.locale] ?? val2 : val2;
    };

    return (
        <div className="footer-signature">
            <Row>
                <Col span={12}>
                    {CheckValue(props.tableData.ShopsProfiles.shop_name)}
                </Col>

                <Col span={12} style={{ textAlign: "end" }}>
                    {CheckValue(props.tableData.ShopsProfiles.shop_name)}
                </Col>
            </Row>
            <Row style={{ paddingTop: "150px" }}>
                <Col span={4}>
                    <div className="underlineSignature">ผู้จ่ายเงิน</div>
                </Col>
                <Col span={4} offset={1}>
                    <div className="underlineSignature">วันที่</div>
                </Col>
                <Col span={4} offset={1}> <div></div>
                </Col>
                <Col span={4} offset={1}>
                    <div className="underlineSignature">ผู้รับเงิน</div>
                </Col>
                <Col span={4} offset={1}>
                    <div className="underlineSignature">วันที่</div>
                </Col>
            </Row>
        </div>

    );
};

export default Signature;
