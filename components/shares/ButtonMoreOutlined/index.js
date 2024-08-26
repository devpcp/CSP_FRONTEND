import { Dropdown, Menu, Popconfirm } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";
import IntlMessages from "../../../util/IntlMessages";
import { useEffect } from "react";
import { isFunction } from "lodash";
import GetIntlMessages from "../../../util/GetIntlMessages";
const ButtonMoreOutlined = ({ item, handleView, handleEdit, handleDel, isUseSwalFireOnDel, handleBlock}) => {
    const { permission_obj } = useSelector(({ permission }) => permission);
    return (
        <Dropdown
            overlay={
                <Menu>
                    {
                        isFunction(handleView) && permission_obj.read && item.___read !== false ?
                            <Menu.Item key="view-data" onClick={handleView}>
                                <IntlMessages id={"view-data"} />
                            </Menu.Item> : null
                    }
                    {
                        isFunction(handleEdit) && permission_obj.update && item.___update !== false ?
                            <Menu.Item key="edit-data" onClick={handleEdit}>
                                <IntlMessages id={"edit-data"} />
                            </Menu.Item> : null
                    }
                    {
                        isFunction(handleDel) && permission_obj.delete && item.___delete !== false ?
                            isUseSwalFireOnDel ?
                                <Menu.Item key="delete-data" onClick={handleDel}>
                                    <IntlMessages id={"delete-data"} />
                                </Menu.Item>
                                :
                                <Popconfirm Popconfirm placement="top" title={<IntlMessages id={"delete-confirm"} />} onConfirm={handleDel} okText={<IntlMessages id={"submit"} />} cancelText={<IntlMessages id={"cancel"} />}>
                                    <Menu.Item key="delete-data">
                                        <IntlMessages id={"delete-data"} />
                                    </Menu.Item>
                                </Popconfirm>
                            : null
                    }
                    {
                        isFunction(handleBlock) && item.___block !== false?
                            <Menu.Item key="delete-data" onClick={handleBlock}>
                                {GetIntlMessages('ยกเลิกเอกสาร')}
                            </Menu.Item>
                            : null
                    }
                </Menu>
            }
            placement="bottomLeft"
            trigger={["click"]}
            arrow
        >
            <MoreOutlined />
        </Dropdown>
    )
}

export default ButtonMoreOutlined
