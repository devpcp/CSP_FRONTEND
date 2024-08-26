export const setPermission = (data) => {
    return {
        type: "SETPERMISSION",
        payload: data
    }
}

export const setPermissionObj = (data) => {
    return {
        type: "SET_PERMISSION_OBJ",
        payload: data
    }

}