import { Cookies } from "react-cookie";
import { isPlainObject } from 'lodash'
import lngProvider from '../lngProvider'

const GetIntlMessages = (id) => {
    const cookie = new Cookies();
    const locale = isPlainObject(cookie.get('locale')) ? cookie.get('locale').locale : "th";
    return lngProvider[locale]["messages"][id] ?? id
}

export default GetIntlMessages