import { Modal, Row, Col, Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { isEmpty, isPlainObject } from 'lodash';
import GetIntlMessages from '../../../util/GetIntlMessages'
import PrintOut from '../PrintOut';

const ModalFullScreen = ({ visible, title, onOk, onCancel, okButtonProps, className, children, footer, okButtonDropdown = false, CustomsButton = false, hideSubmitButton, closeX = false, loading = false, mode, showPrintOutButton = { status: false, morePrintOuts: {} } }) => {

    const TitleModal = () => {
        return (
            <div>
                <Row>
                    <Col span={12}>
                        <div className={window.visualViewport.width < 600 ? "head-line-text-width-less-than-600" : "head-line-text"}>{title}</div>
                    </Col>
                    <Col span={12} style={{
                        display: "flex",
                        justifyContent: "end"
                    }}>
                        {CustomsButton ?
                            <CustomsButton /> :
                            <>
                                <span className='pr-3'>
                                    <Button onClick={onCancel} style={{ width: 100 }}>{GetIntlMessages(mode === "view" ? "ปิด" : "กลับ")}</Button>
                                </span>

                                {isPlainObject(okButtonProps) && okButtonProps.disabled ?
                                    <Button disabled={true} style={{ width: 100 }}>บันทึก</Button>
                                    :
                                    okButtonDropdown ? <Dropdown.Button
                                        htmlType="submit"
                                        type='primary'
                                        icon={<DownOutlined />}
                                        onClick={() => onOk(0)}
                                        onEnter
                                        loading={loading}
                                        overlay={
                                            (
                                                <Menu >
                                                    <Menu.Item onClick={() => onOk(1)} key="1">บันทึกแล้วสร้างใหม่</Menu.Item>
                                                    <Menu.Item onClick={() => onOk(2)} key="2">บันทึกแล้วปิด</Menu.Item>
                                                </Menu>
                                            )
                                        }
                                    >
                                        บันทึก
                                    </Dropdown.Button> : hideSubmitButton ? null : <Button loading={loading} type='primary' onClick={() => onOk(0)} style={{ width: 100, marginRight: "10px" }}>บันทึก</Button>
                                }
                                {isPlainObject(showPrintOutButton) && showPrintOutButton.status === true && (mode !== "add") ?
                                    <PrintOut
                                        documentId={showPrintOutButton.id}
                                        morePrintOuts={
                                            isPlainObject(showPrintOutButton.morePrintOuts) && !isEmpty(showPrintOutButton.morePrintOuts) ?
                                                showPrintOutButton.morePrintOuts
                                                : null
                                        }
                                    />
                                    : null}
                            </>
                        }
                    </Col>
                </Row>
            </div>
        )
    }

    return (
        <>
            <Modal
                className={`modal-full-screen ${className ?? ""}`}
                maskClosable={false}
                visible={visible} onOk={onOk} onCancel={onCancel}
                title={<TitleModal />}
                footer={footer ?? null}
            >
                {children}
            </Modal>
            <style jsx global>
                {`
                    .ant-modal-close{
                        display: ${!closeX ? "none" : "block"};
                    }
                    .ant-modal-header {
                        padding: ${closeX ? "20px 30px 0px 30px" : "16px 24px"};
                        border-bottom: ${closeX ? "0px" : "1px"} solid #f0f0f0;
                    }
                `}
            </style>
        </>
    )
}

export default ModalFullScreen