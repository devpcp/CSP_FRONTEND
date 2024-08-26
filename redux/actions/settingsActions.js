import { Cookies } from 'react-cookie'
// Action Creator

export const switchLanguage = (data) => {
    const cookies = new Cookies();
    cookies.remove("locale", { path: '/' });
    cookies.set("locale", data, {
        path: "/"
    });
    return {
        type: "SWITCH_LANGUAGE",
        payload: data,
    }
};
export const setMenu = (data) => {
    return {
        type: "SET_MENU",
        payload: data,
    }
};

export const setPathName = (data) => {
    return {
        type: "SET_PATH_NAME",
        payload: data,
    }
};

export const updateWindowWidth = (data) => {
    return {
        type: "WINDOW_WIDTH",
        payload: data,
    }
};

export const toggleCollapsedSideNav = (data) => {
    return {
        type: "TOGGLE_COLLAPSED_NAV",
        payload: data,
    }
};

export const onNavStyleChange = (data) => {
    return {
        type: "NAV_STYLE",
        payload: data,
    }
};

export const setThemeType = (data) => {
    return {
        type: "THEME_TYPE",
        payload: data,
    }
};

export const setSidebar = (data) => {
    return {
        type: "SET_SIDEBAR",
        payload: data,
    }
};
