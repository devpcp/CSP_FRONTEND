import MyShop from '../../components/Routes/Components.Routes.MyShop'
import MyProfile from '../../components/Routes/Components.Routes.MyProfile'
import MyOauth from '../../components/Routes/Components.Routes.MyOauth'
import SettingShop from '../../components/Routes/Components.Routes.SettingShop'
import { Row, Col } from "antd";
import { useSelector } from 'react-redux';

const MyData = () => {
    const { permission_obj } = useSelector(({ permission }) => permission);

    return (
        <>
            <div className="mb-5">
                <MyProfile />

                {
                    permission_obj.read ?
                        <div className="pt-3">
                            <div id="emp_profile" className="pro-overview tab-pane fade show active">
                                <Row gutter={16}>
                                    <Col span="12">
                                        <MyShop />
                                    </Col>
                                    <Col span="12">
                                        <SettingShop />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        : null
                }
            </div>

            <style global>{`
               .ant-input[disabled] {
                    color: rgb(39 39 39);
                }

                .ant-select-disabled.ant-select:not(.ant-select-customize-input) .ant-select-selector {
                    color: rgb(39 39 39);
                }
                .dynamic-delete-button {
                    position: relative;
                    top: 4px;
                    margin: 0 8px;
                    color: #999;
                    font-size: 24px;
                    cursor: pointer;
                    transition: all 0.3s;
                  }
                  .dynamic-delete-button:hover {
                    color: #777;
                  }
                  .dynamic-delete-button[disabled] {
                    cursor: not-allowed;
                    opacity: 0.5;
                  }
            `}</style>
        </ >
    )
}

export default MyData
