import React from 'react'

/**
 * 
 * @param {*} value - value that you want to change
 * @returns - value with comma , 2 decimal and round up number (e.g. 1234.56 -> 1,234.60)
 */
export const RoundingNumber = (value) => {
    try {
        if (!!value) {
            const newValue = value.toString().replaceAll(",", "")
            return Number(newValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        } else {
            return null
        }
    } catch (error) {
        console.log('error :>> ', error);
    }

}
/**
 * 
 * @param {*} value - value that you want to change
 * @returns value with comma , 2 decimal and no rounding number (e.g. 1234.56 -> 1,234.56)
 */
export const NoRoundingNumber = (value) => {
    try {
        Number.prototype.toFixedNoRounding = function (n) {
            const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
            const a = this.toString().match(reg)[0];
            const dot = a.indexOf(".");
            if (dot === -1) { // integer, insert decimal dot and pad up zeros
                return a + "." + "0".repeat(n);
            }
            const b = n - (a.length - dot) + 1;
            return b > 0 ? (a + "0".repeat(b)) : a;
        }

        const newValue = value.toString().replaceAll(",", "")
        if (value) {
            return Number(newValue).toFixedNoRounding(2).toString()
            // return Number(newValue).toFixedNoRounding(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        } else {
            return null
        }
    } catch (error) {

    }
}
/**
 * 
 * @param {string} value - A value that you want to take comma out -> ( , )
 * @returns value without comma
 */
export const takeOutComma = (value) => {
    try {
        if(!!value){
            return value.toString().replaceAll(",","")
        }else{
            return null
        }
    } catch (error) {

    }
}

export default {
    RoundingNumber,
    NoRoundingNumber,
    takeOutComma
}