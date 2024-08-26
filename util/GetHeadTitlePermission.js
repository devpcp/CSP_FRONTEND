import { isPlainObject } from 'lodash'
/**
 * @param {import('react-redux').useSelector} useSelector 
 */
const GetHeadTitlePermission = (useSelector) => {
    const { permission_obj } = useSelector(({ permission }) => permission);
    const { locale } = useSelector(({ settings }) => settings);
    return isPlainObject(permission_obj) ? permission_obj.application_name[locale.locale] : ""
}

export default GetHeadTitlePermission