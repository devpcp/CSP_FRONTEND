
const INIT_STATE = {
    token: null,
    refresh_token: null,
    loadUser: true,
    authUser: null,
    oauth: null,
    imageProfile: `/assets/images/profiles/avatar.jpg`,
};

const authReducer = (state = INIT_STATE, action) => {
    switch (action.type) {
        case "USER_TOKEN_SET":
            return {
                ...state, token: action.payload
            }
        case "USER_REFRESH_TOKEN_SET":
            return {
                ...state, refresh_token: action.payload
            }
        case "SET_IMAGE_PROFILE":
            return {
                ...state, imageProfile: action.payload
            }
        case "SET_OAUTH":
            return {
                ...state, oauth: action.payload
            }
        case "SET_AUTH_USER_DATA":
            return {
                ...state, authUser: action.payload, loadUser: false,
            }
        case "UPDATE_LOAD_USER": {
            return {
                ...state, loadUser: false,
            };
        }
        default:
            return {
                ...state
            }
    }
}

export default authReducer;