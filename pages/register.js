import Page from '../components/Hoc/defaultPage';
import asyncComponent from '../util/asyncComponent'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react';
import Preloader from '../components/_App/Preloader';
import Api from '../util/Api/Oauth/Guest/Api';
import { Cookies } from 'react-cookie'

const Register = asyncComponent(() => import('../routes/register'));

export default Page(() => {
    const Router = useRouter();
    const { code } = Router.query;
    const [loading, setLoading] = useState(true);
    const cookies = new Cookies();
    useEffect(() => {
        if (code) {
            callbackOauth(code)
        }
    }, [code])

    const callbackOauth = async (code) => {
        try {
            const { data } = await Api.post(`/oauth/token`, {
                grant_type: "authorization_code",
                code,
                client_id: process.env.NEXT_PUBLIC_OAUTH_GUEST_CLIENT_ID,
                client_secret: process.env.NEXT_PUBLIC_OAUTH_GUEST_CLIENT_SECRET,
            })
            if (data.status === "success") {
                cookies.set("guest_access_token", data.data.access_token, { path: "/" });
                cookies.set("guest_refresh_token", data.data.refresh_token, { path: "/" });
                getAuthUser()
                // setLoading(false);
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    const getAuthUser = async () => {
        try {
            const { data } = await Api.get(`${process.env.NEXT_PUBLIC_SERVICE_API_ME}`)
            if (data.status === "success") {
                setLoading(false);
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    return (loading ? <Preloader /> : <Register />)
});
