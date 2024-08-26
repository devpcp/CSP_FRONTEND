const INIT_STATE = {
  permission: [],
  permission_obj: null,
};

const permissionReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case "SETPERMISSION": {
      return {
        ...state,
        permission: action.payload,
      };
    }
    case "SET_PERMISSION_OBJ": {
      return {
        ...state,
        permission_obj: action.payload,
      };
    }
    default:
      return {
        ...state
      }
  }
}

export default permissionReducer;