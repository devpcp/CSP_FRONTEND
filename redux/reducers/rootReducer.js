import { combineReducers } from 'redux'
import authReducer from './authReducer';
import settingsReducer from './settingsReducer';
import permissionReducer from './permissionReducer';
import servicePlansReducer from './servicePlansReducer';
import masterReducer from './masterReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    settings: settingsReducer,
    permission: permissionReducer,
    servicePlans: servicePlansReducer,
    master: masterReducer,
})

export default rootReducer;