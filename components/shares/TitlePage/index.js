import { useSelector } from 'react-redux';
import { isPlainObject } from 'lodash'

const TitlePage = ({ text }) => {
    try {
        const { permission_obj } = useSelector(({ permission }) => permission);
        const { locale } = useSelector(({ settings }) => settings);
        return (isPlainObject(permission_obj) ? text ?? isPlainObject(locale) ? permission_obj["application_name"][locale.locale] ?? null: null : null)
    } catch (error) {
        // console.log('error TitlePage:>> ', error);
    }
   
}

export default TitlePage
