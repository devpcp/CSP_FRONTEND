import GetIntlMessages from '../../../util/GetIntlMessages';

/**
 * 
 * @param {*} type -> Which pattern regex you want to use (e.g. "1") 
 ** type 1 -> Only number 
 ** type 2 -> Only number , space , dot , underscore and dash
 ** type 3 -> Only number , space , dot , underscore and character -> Eng , TH
 ** type 4 -> Only number  , dot and comma
 ** type 5 -> Only number , space , dot , underscore , bracket () ,and character -> Eng , TH
 ** default -> The field will turn to mandatory field
 * @param {*} message -> Message that you want it to alert when it meet condition.
 * @returns An object that include pattern of regex you choose and message -> {pattern : ... , message : ...}
 */
export const RegexMultiPattern = (type , message , required = false) => {
    try {
        switch (type) {
            case "1":
                return {required, pattern: /^(?!,$)[\d]+$/, message }
            case "2":
                return {required, pattern: /^(?!,$)[\d,. _-]+$/, message }
            case "3":
                return {required, pattern: /^[a-zA-Z0-9_.\u0E00-\u0E7F ]+$/, message }
            case "4":
                return {required, pattern: /^(?!\s*$)[\d,.]+$/, message }
            case "5":
                return {required, pattern: /^[a-zA-Z0-9_.\u0E00-\u0E7F ()]+$/, message }
        
            default: return {required : true , message : message ?? GetIntlMessages("please-fill-out")}
        }
    } catch (error) {
        
    }
}

export default RegexMultiPattern
