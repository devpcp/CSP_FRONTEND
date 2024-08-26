import API from '../../util/Api'
import Api from '../../util/Api/Api'
import { setPermission } from './permissionActions';
import { setMenu } from './settingsActions';
import { Cookies } from 'react-cookie'
import { CheckImage } from '../../components/shares/FormUpload/API';
import { getAllMasterData } from './masterAction';
import { isFunction } from 'lodash';

// Action Creator

export const setAuthUser = (user) => {
    return {
        type: "SET_AUTH_USER_DATA",
        payload: user,
    };
};

export const setImageProfile = (data) => {
    return {
        type: "SET_IMAGE_PROFILE",
        payload: data,
    };
};

export const setOauth = (data) => {
    return {
        type: "SET_OAUTH",
        payload: data,
    };
};

export const setAuthToken = (access_token) => {
    return {
        type: "USER_TOKEN_SET",
        payload: access_token,
    }
};

export const setRefreshToken = (refresh_token) => {
    return {
        type: "USER_REFRESH_TOKEN_SET",
        payload: refresh_token,
    }
};

export const updateLoadUser = () => {
    return {
        type: "UPDATE_LOAD_USER",
    }
};

export const refreshToken = async (dispatch) => {
    try {
        const cookies = new Cookies();
        const refresh_token = cookies.get("refresh_token");
        const { data } = await Api.post(`/token/access_token`, { refresh_token })
        // console.log('data.data :>> ', data.data);
        cookies.remove("access_token", { path: '/' });
        if (data.data.access_token) {
            cookies.set("access_token", data.data.access_token, { path: "/" });
            if (dispatch) {
                dispatch(setAuthToken(data.data.access_token));
                getAuthUser(dispatch)
            }
            return data.data.access_token
        } else {
            logout(dispatch)
            return null
        }
    } catch (error) {
        logout(dispatch)
        return error
    }

};

/**
 * ดึงข้อมูลส่วนตัว
 * @param {import('redux').Dispatch} dispatch 
 */
export const getAuthUser = (dispatch,setLoading) => {
    if(isFunction(setLoading)) setLoading(true);
    API.get(`${process.env.NEXT_PUBLIC_SERVICE_API_ME}`).then(({ data }) => {
        if (data.status == "success") {
            dispatch(setAuthUser(data.data));
            CheckImage({
                directory: "profiles",
                name: data.data.id,
                fileDirectoryId: data.data.id,
            }).then((res) => {
                dispatch(setImageProfile(res));
            })
            dispatch(setPermission(data.data.Permission));
            dispatch(setOauth(data.data.Oauth));
            dispatch(setMenu(data.data.MenuList));
            getAllMasterData(dispatch)
            if(isFunction(setLoading)) setLoading(false);
        } else {
            logout(dispatch)
            if(isFunction(setLoading)) setLoading(false);
        }
    }).catch((error) => {
        if(isFunction(setLoading)) setLoading(true);
        logout(dispatch)
        if(isFunction(setLoading)) setLoading(false);
    });
};

/**
 * ออกจากระบบ
 * @param {import('redux').Dispatch} dispatch 
 */
export const logout = (dispatch) => {
    const cookies = new Cookies();
    const token = cookies.get("access_token");
    if (token && (token != undefined && token != "undefined")) {
        Api.get('/logout').then(async (data) => {
            removeCookieUserAuth(dispatch)
        }).catch((eror) => {
            console.log(`eror`, eror)
            removeCookieUserAuth(dispatch)
        })
    } else {
        removeCookieUserAuth(dispatch)
    }
};

/**
 * @param {import('redux').Dispatch} dispatch 
 */
const removeCookieUserAuth = (dispatch) => {
    const cookies = new Cookies();
    cookies.remove("access_token", { path: '/' });
    cookies.remove("refresh_token", { path: '/' });
    if (dispatch) {
        dispatch(updateLoadUser());
        dispatch(setAuthToken(null));
        dispatch(setAuthUser(null));
        dispatch(setPermission(null));
        dispatch(setOauth(null));
        dispatch(updateLoadUser());
    }
    location.reload()
}

