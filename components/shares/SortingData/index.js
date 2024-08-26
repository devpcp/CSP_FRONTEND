import { get, isArray } from 'lodash'
import React from 'react'

/**
 * 
 * @param {array} arr - The arr you want to sorting 
 * @param {string} key - value that you want to sorting (have to be where exact the data is in array e.g Product.product_name.th)
 * @returns  array of sorted data
 */

export const SortingData = (arr, key) => {
    try {
        if(isArray(arr)){
                const resultSorting = arr.sort((a, b) => get(a , `${key}`, "").localeCompare(get(b , `${key}`, "")))
                return resultSorting ?? []
        }else{
            return []
        }
    } catch (error) {
        console.log('error :>> ', error);
    }
}

export default SortingData