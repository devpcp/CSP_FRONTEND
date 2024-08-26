import { isArray, isPlainObject } from 'lodash'

/**
 *
 * @param {String} data 
 * @param {Array} list 
 * @param {Object} param2 
 *  @param {String} param2.key
 *  @param {String} param2.value
 * @returns 
 */
const GetTextValueSelect = (data, list, { key, value }) => {
    if (isArray(list)) {
        const _find = list.find(where => data === where[key])
        return _find ? _find[value] : "-"
    } else {
        return "-"
    }
}

export default GetTextValueSelect