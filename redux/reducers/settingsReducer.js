// const { innerWidth: width, innerHeight: height } = window;
const INIT_STATE = {
    width: 1367,
    pathname: '',
    mainColor: "#04afe3",
    subColor: "#ffcc00",
    sidebar: {
        open: false,
        secondaryNavOpen: false
    },
    locale: {
        languageId: "thailand",
        locale: "th",
        name: "ไทย",
        icon: "th",
        locale_json: {
            en: null,
            th: null,
        },
        list_json: ["en", "th"],
        accept_language: "th;q=1, en;q0.9"
    },
    menu: []
};

const userReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case "SWITCH_LANGUAGE":
            return {
                ...state, locale: action.payload
            }
        case "SET_MENU":
            return {
                ...state, menu: action.payload
            }
        case "SET_PATH_NAME":
            return {
                ...state, pathname: action.payload
            }
        case "WINDOW_WIDTH":
            return {
                ...state, width: action.payload
            }
        case "SET_SIDEBAR":
            return {
                ...state, sidebar: action.payload
            }
        default:
            return {
                ...state
            }
    }
}

export default userReducer;