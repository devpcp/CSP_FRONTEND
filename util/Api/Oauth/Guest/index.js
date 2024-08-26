import Api from './Api'
import { Cookies } from 'react-cookie'

const apiPost = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.post(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            console.log('eror', eror)
            refreshTokenOauthGuest().then((res) => {
                Api.post(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {

                reject(eror)
            })
        })
    });
}

const apiGet = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.get(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshTokenOauthGuest().then((res) => {
                Api.get(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {

                reject(eror)
            })
        })
    });
}

const apiPut = (url, data) => {
    return new Promise((resolve, reject) => {
        Api.put(url, data).then((res) => {
            resolve(res);
        }).catch((eror) => {
            refreshTokenOauthGuest().then((res) => {
                Api.put(url, data).then((res) => {
                    resolve(res);
                }).catch((eror) => {
                    reject(eror)
                })
            }).catch((eror) => {

                reject(eror)
            })
        })
    });
}

export const refreshTokenOauthGuest = async (dispatch) => {
    try {
        const cookies = new Cookies();
        const guest_refresh_token = cookies.get("guest_refresh_token");
        const { data } = await Api.post(`/oauth/token`, {
            grant_type: "refresh_token",
            refresh_token: guest_refresh_token,
            client_id: process.env.NEXT_PUBLIC_OAUTH_GUEST_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_OAUTH_GUEST_CLIENT_SECRET,
        })

        cookies.remove("guest_access_token", { path: '/' });

        if (data.data.access_token) {
            cookies.set("guest_access_token", data.data.access_token, { path: "/" });
            return data.data.access_token
        } else {
            return null
        }
    } catch (error) {
        return error
    }

};

export default {
    post: apiPost,
    get: apiGet,
    put: apiPut,
}