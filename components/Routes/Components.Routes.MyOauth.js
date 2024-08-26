import { useEffect, useState } from 'react'
import { Button, Form, Input, Modal, Select } from 'antd';
import API from '../../util/Api'
import { useSelector } from 'react-redux';
import { isPlainObject } from 'lodash';
import IntlMessages from '../../util/IntlMessages';
import GetTextValueSelect from '../../util/GetTextValueSelect';

const MyOauth = () => {
    const [form] = Form.useForm()
    const { oauth } = useSelector(({ auth }) => auth);
    const [clientId, setClientId] = useState(null)
    const [clientSecret, setClientSecret] = useState(null)
    const [isShow, setIsShow] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [myOauth, setMyOauth] = useState(null)

    useEffect(() => {
        getData()
    }, [oauth])

    const getData = async () => {
        try {
            if (oauth) {
                setIsShow(true)
                setUserList(await getUserListAll(false))
                setClientId(oauth.client_id)
                setClientSecret(oauth.client_secret)
                form.setFieldsValue(oauth)
                setMyOauth(oauth)
            }
        } catch (error) {
            setIsShow(false)
        }
    }

    const copy = (text) => {
        const copyText = document.getElementById(text);
        if (copyText) {
            copyText.select();
            copyText.setSelectionRange(0, 99999); /* For mobile devices */

            /* Copy the text inside the text field */
            navigator.clipboard.writeText(copyText.value);
        }

    }

    /* master */
    const [userList, setUserList] = useState([])

    /** 
     * @param {Boolean} selectInAuth 
     */
    const getUserListAll = async (selectInAuth) => {
        const { data } = await API.get(`/user/all?limit=999999&page=1&sort=user_name&order=desc&status=active&selectInAuth=${selectInAuth}`)
        return data.data.data
    }


    const handleOk = () => {
        form.submit()
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <>

            <div className="card profile-box flex-fill">
                <div className="card-body">
                    <h3 className="card-title">My Oauth
                        {/* {isShow && isPlainObject(myOauth) ? <a className="edit-icon" onClick={() => setIsModalVisible(true)}><i className="bi bi-pencil-fill" /></a> : null} */}
                    </h3>
                    {isShow && isPlainObject(myOauth) ?
                        <ul className="personal-info">
                            <li>
                                <div className="title">Client ID</div>
                                <div className="text">{(GetTextValueSelect(myOauth.user_id, userList, { key: "id", value: "user_name" })) ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">Client Secret</div>
                                <div className="text">{myOauth.client_id ?? "-"}</div>
                            </li>
                            <li>
                                <div className="title">Url Whitelist</div>
                                <div className="text">{myOauth.site_whitelist ?? "-"}</div>
                            </li>
                        </ul>
                        : <div style={{ textAlign: "center", color: "red" }}><IntlMessages id="no-consistent" /></div>}

                </div>
            </div>

            <Modal
                width={600}
                maskClosable={false}
                title={"My Dealers"}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                bodyStyle={{
                    maxHeight: 600,
                    overflowX: "auto"
                }}
            >

                <Form
                    form={form}
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 15 }}
                    layout="horizontal"
                    style={{ padding: 20 }}
                >
                    <Form.Item
                        name="user_id"
                        label="User"
                    >
                        <Select
                            disabled
                            placeholder="-"
                            optionFilterProp="children"
                        >
                            {userList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.user_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="client_id"
                        label="Client ID"
                    >
                        <div style={{ textAlign: "end", paddingBottom: 5 }}>
                            <Button onClick={() => copy("client_id")}>Copy</Button>
                        </div>
                        <Input.TextArea id={"client_id"} value={clientId} disabled rows={3} />
                    </Form.Item>

                    <Form.Item name="client_secret" label="Client Secret" >
                        <div style={{ textAlign: "end", paddingBottom: 5 }}>
                            <Button onClick={() => copy("client_secret")}>Copy</Button>
                        </div>
                        <Input.TextArea id={"client_secret"} value={clientSecret} rows={7} disabled />
                    </Form.Item>

                    <Form.Item name="site_whitelist" label="Url Whitelist" >
                        <Input disabled />
                    </Form.Item>

                </Form>

            </Modal>

        </>
    )
}

export default MyOauth
