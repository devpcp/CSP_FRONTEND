import React from 'react'
import { Layout, Row, Col } from 'antd';

const Footer = () => {
    return (
        <>
            <Row className='container-fluid'>
                <Col span={8}>
                    <div className="link" style={{ textAlign: 'start' }}>
                        <div style={{ position: 'revert', }}>
                            ระบบ CAR SERVICE PLATFORM
                        </div>
                    </div>
                </Col>
                <Col span={8}>
                    <div className="link" style={{ textAlign: 'center' }}>
                        <div style={{ position: 'revert', }}>
                            รุ่นโปรแกรม {process.env.NEXT_PUBLIC_APP_VERSION}
                        </div>
                    </div>
                </Col>
                <Col span={8}>
                    <div className="link" style={{ textAlign: 'end' }}>
                        <div style={{ position: 'revert', }}>
                            อัพเดทวันที่ {process.env.NEXT_PUBLIC_APP_LAST_UPDATE}
                        </div>
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default Footer
