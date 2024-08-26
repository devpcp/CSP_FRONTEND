import React from 'react'
import { Row, Col } from 'antd';
import CarPreloader from './CarPreloader';

const ComingSoonAnimated = () => {
    return (
        <>
            <Row gutter={[20,10]} justify="center" style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Col className='bouncing-text' xxl={{ span: 4, offset: 10 }} lg={{ span: 14, offset: 10 }} md={{ span: 16, offset: 8 }} sm={{ span: 16, offset: 8 }} xs={24}>
                    <div className="c">C</div>
                    <div className="o-1">o</div>
                    <div className="m-1">m</div>
                    <div className="i">i</div>
                    <div className="n-1">n</div>
                    <div className="g">g</div>
                </Col>
                <Col className='bouncing-text' xxl={{ span: 10, offset: 0 }} lg={{ span: 12, offset: 10 }} md={{ span: 14, offset: 10 }} sm={{ span: 14, offset: 8 }} xs={{ span: 20, offset: 4 }}>
                    <div className="s">s</div>
                    <div className="o-2">o</div>
                    <div className="o-3">o</div>
                    <div className="n-2">n</div>
                    <div className="dot-1">.</div>
                    <div className="dot-2">.</div>
                    <div className="dot-3">.</div>
                    <div class="shadow"></div>
                    <div class="shadow-two"></div>
                </Col>
            </Row>

        </>
    )
}

export default ComingSoonAnimated