import axios from 'axios';
import { isPlainObject } from 'lodash';
import { Cookies } from 'react-cookie'

const cookies = new Cookies();
export default axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_SERVICE}`,
    headers: {
        'Content-Type': 'application/json',
    },
    transformRequest: [function (data, headers) {
        const token = cookies.get('guest_access_token');
        if (token) {
            headers.Authorization = "Bearer " + token;
        }

        const locale = cookies.get('locale');
        headers["Accept-Language"] = "th;q=1, en;q0.9";
        if (isPlainObject(locale)) {
            headers["Accept-Language"] = locale["accept_language"];
        }
        return JSON.stringify(data);
    }],
});
