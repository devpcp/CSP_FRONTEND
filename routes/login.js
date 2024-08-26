import { Form, Input, Button } from 'antd';
import Head from 'next/head';
import { useDispatch } from 'react-redux';
import { Cookies } from 'react-cookie';
import Router from "next/router";
import API from '../util/Api/Api';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setAuthToken, getAuthUser, setRefreshToken } from '../redux/actions/authActions'
import Swal from "sweetalert2";
import Link from "next/link";
import GetIntlMessages from '../util/GetIntlMessages'
import CarPreloader from '../components/_App/CarPreloader'
import languageData from '../components/_App/Layout/LayoutHeader/LanguageData';
import { switchLanguage } from '../redux/actions/settingsActions';

const Login = () => {
    const [loading, setLoading] = useState(false)
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const cookies = new Cookies();
    const { authUser, token } = useSelector(({ auth }) => auth);
    const { mainColor, locale } = useSelector(({ settings }) => settings);

    useEffect(() => {
        if (authUser && token) {
            Router.push('/');
        }
        /* guest_access del */
        cookies.remove("guest_access_token", { path: '/' });
        cookies.remove("guest_refresh_token", { path: '/' });
    }, [authUser, token]);

    const onFinish = async (values) => {
        setLoading(true)
        API.post(`/login`, values).then(({data}) => {
                if (data.status !== "failed") {
                    cookies.set("access_token", data.data.access_token, { path: "/" });
                    cookies.set("refresh_token", data.data.refresh_token, { path: "/" });
                    dispatch(setAuthToken(data.data.access_token));
                    dispatch(setRefreshToken(data.data.refresh_token));
                    getAuthUser(dispatch,setLoading)
                } else {
                    setLoading(false)
                    Swal.fire({
                        icon: 'error',
                        title: 'ผิดพลาด',
                        text: data.data,
                    });
                }
        }).catch((eror) => {
            setLoading(false)
            Swal.fire({
                icon: 'error',
                title: 'ผิดพลาด',
                text: "ไม่สามารถเข้าสู่ระบบได้ ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง !!!",
            });
        })
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onClickSwitchLanguage = (language) => {
        if (language) {
            dispatch(switchLanguage(language))
        }
    }

    return (
        <>
            <Head>
                <title>{GetIntlMessages("login")}</title>
            </Head>

            <div className='language-login'>
                {languageData.map((e, i) =>
                    <>
                        {i != 0 ? <span> | </span> : ""}
                        <a onClick={() => onClickSwitchLanguage(e)} className={`${e.locale === locale.locale ? "active" : ""} `}>{e.locale.toUpperCase()}</a>
                    </>
                )}
            </div>

            <div className="page-login">
                {loading == true ?
                    <CarPreloader />
                    :
                    <div className="card">

                        <div className="card-body">
                            <div className="card-title">
                                <img src="/assets/images/csp/csp_logo_ver_2_vertical.svg" alt="" />
                                {/* <img src="/assets/images/csp/csp_logo.svg" alt="" /> */}
                            </div>
                            <h3>{GetIntlMessages("login-login")}</h3>

                            <div className='login-content'>
                                <Form
                                    form={form}
                                    onFinish={onFinish}
                                    onFinishFailed={onFinishFailed}
                                >
                                    <Form.Item
                                        className='pt-2'
                                        name="user_name"
                                        rules={[{ required: true, message: 'Please input your username!' }]}
                                    >
                                        <Input placeholder="Username" disabled={loading} />
                                    </Form.Item>

                                    <Form.Item
                                        className='pt-2'
                                        name="password"
                                        style={{ marginBottom: 5 }}
                                        rules={[{ required: true, message: 'Please input your password!' }]}
                                    >
                                        <Input.Password placeholder="Password" disabled={loading} />
                                    </Form.Item>
                                    {/* <a className='forgot-password'>{GetIntlMessages("forgot-your-password")}</a> */}

                                    <div className='pt-4 pb-4'>
                                        {/* <button htmlType="button" className="btn btn-primary">{GetIntlMessages("login")}</button> */}
                                        <Button htmlType="submit" className="btn btn-primary" loading={loading}>{GetIntlMessages("login")}</Button>
                                    </div>
                                    <span hidden>{GetIntlMessages("not-account")}
                                        <Link href={`${process.env.NEXT_PUBLIC_SERVICE}/oauth?response_type=code&client_id=${process.env.NEXT_PUBLIC_OAUTH_GUEST_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_OAUTH_GUEST_REDIRECT_URI}`}>
                                            <a className='link-register'>{GetIntlMessages("sign-up")}</a>
                                        </Link>
                                    </span>
                                </Form>
                            </div>
                        </div>
                    </div>
                }
            </div>

            <div className="footer-login">
                <div className='footer-container'>
                    <div className='footer-text'>{GetIntlMessages("system")} Car Service Platform <span>{GetIntlMessages("version")} {process.env.NEXT_PUBLIC_APP_VERSION}</span></div>
                    <div className='footer-text' style={{ textAlign: "end" }}>{GetIntlMessages("วันที่อัพเดท")} {process.env.NEXT_PUBLIC_APP_LAST_UPDATE}</div>
                </div>

            </div>

            <style jsx global>
                {`
                    body {
                        background: ${mainColor};
                        color: #fff;
                        overflow-y: auto;
                    }

                `}
            </style>
        </>
    )
}

export default Login
