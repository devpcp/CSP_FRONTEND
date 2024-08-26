const INIT_STATE = {
  customerList: [],
  vehicleList: [],
};

const permissionReducer = (state = INIT_STATE, action) => {
  switch (action.type) {
    case "SET_CUSTOMERLIST": {
      return {
        ...state,
        customerList: action.payload,
      };
    }
    case "SET_VEHICLELIST": {
      return {
        ...state,
        vehicleList: action.payload,
      };
    }
    default:
      return {
        ...state
      }
  }
}

export default permissionReducer;