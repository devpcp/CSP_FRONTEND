import axios from './Api'

export const setAccessToken = token => {
	axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
};
