import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Cookies } from "react-cookie";
import { setAuthToken, updateLoadUser, getAuthUser, logout, setRefreshToken } from "../redux/actions/authActions";
import { switchLanguage } from "../redux/actions/settingsActions";
import jwt_decode from "jwt-decode";

/**
 * ตรวจสอบ access_token จาก cookies ลง Redux
 * @returns 
 */
export const useAuthToken = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(true);
    const { authUser } = useSelector(({ auth }) => auth);
    useEffect(() => {
        const validateAuth = async () => {
            const cookies = new Cookies();

            const locale = cookies.get("locale");
            if (locale) dispatch(switchLanguage(locale));

            const token = cookies.get("access_token");
            const refresh_token = cookies.get("refresh_token");
            if (refresh_token) dispatch(setRefreshToken(refresh_token));
            if (token) {
                // console.log("token: =====>", token)
                dispatch(setAuthToken(token));
                try {
                    getAuthUser(dispatch)
                    return;
                } catch (err) {
                    console.error("err in auth: ", err)
                    return;
                }
            }
        };

        const checkAuth = () => {
            Promise.all([validateAuth()]).then(() => {
                setLoading(false);
                dispatch(updateLoadUser());
            });
        };
        checkAuth();
    }, [dispatch]);

    return [loading, authUser];
};

export const useAuthUser = () => {
    const { authUser } = useSelector(({ auth }) => auth);

    if (authUser) {
        return { id: 1, ...authUser };
    }
    return [null];
};

export const checkingScreen = () => {
    const dispatch = useDispatch();
    const events = [
        "load",
        "mousemove",
        "mousedown",
        "click",
        "scroll",
        "keypress"
    ]

    useEffect(() => {
        const cookies = new Cookies();
        const token = cookies.get("access_token");
        if (token) {
            let min = 60, timeout;
            const setTime = () => {
                timeout = setTimeout(() => {
                    clearTimeout(timeout);
                    logout(dispatch)
                }, min * 60 * 1000);
            }
            for (let i in events) {/*ตรวจจับทุกอีเวน์ในการเคลื่อนไหว*/
                window.addEventListener(events[i], () => {
                    clearTimeout(timeout);
                    setTime()
                });
            }

        }
    });
};


