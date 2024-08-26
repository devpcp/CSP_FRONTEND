import React from 'react'

export const ArabicNumberToText = ({ convertNumber }) => {

    const changeNumber = (valueNumber) => {
        let num = CheckNumber(valueNumber);
        let NumberArray = new Array("ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า", "สิบ");
        let DigitArray = new Array("", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน");
        let BahtText = "";
        if (isNaN(num)) {
            return "ข้อมูลนำเข้าไม่ถูกต้อง";
        } else {
            if ((num - 0) > 9999999.9999) {
                return "ข้อมูลนำเข้าเกินขอบเขตที่ตั้งไว้";
            } else {
                
                num = num.split(".");
                
                if (num[1].length > 0) {
                    num[1] = num[1].substring(0, 2);
                    // console.log('num num[1]', num[1])
                }
                // let NumberLen
                let NumberLen = num[0].length - 0;
                for (let i = 0; i < NumberLen; i++) {
                    let tmp = num[0].substring(i, i + 1) - 0;
                    if (tmp != 0) {
                        if ((i == (NumberLen - 1)) && (tmp == 1)) {
                            BahtText += "เอ็ด";
                        } else
                            if ((i == (NumberLen - 2)) && (tmp == 2)) {
                                BahtText += "ยี่";
                            } else
                                if ((i == (NumberLen - 2)) && (tmp == 1)) {
                                    BahtText += "";
                                } else {
                                    BahtText += NumberArray[tmp];
                                }
                        BahtText += DigitArray[NumberLen - i - 1];
                    }
                }
                BahtText += "บาท";
                if ((num[1] == "0") || (num[1] == "00")) {
                    BahtText += "ถ้วน";
                } else {
                    let DecimalLen = num[1].length - 0;
                    for (let i = 0; i < DecimalLen; i++) {
                        let tmp = num[1].substring(i, i + 1) - 0;
                        if (tmp != 0) {
                            if ((i == (DecimalLen - 1)) && (tmp == 1)) {
                                BahtText += "เอ็ด";
                            } else
                                if ((i == (DecimalLen - 2)) && (tmp == 2)) {
                                    BahtText += "ยี่";
                                } else
                                    if ((i == (DecimalLen - 2)) && (tmp == 1)) {
                                        BahtText += "";
                                    } else {
                                        BahtText += NumberArray[tmp];
                                    }
                            BahtText += DigitArray[DecimalLen - i - 1];
                        }
                    }
                    BahtText += "สตางค์";
                }
                return `(${BahtText})`;
            }
        }
    }

    function CheckNumber(num) {
        // console.log('num', num)
        let decimal = false;
        num = num.toString();
        // Number = Number.toString();						
        num = num.replace(/ |,|บาท|฿/gi, '');
        // console.log('numarter', num)
        for (let i = 0; i < num.length; i++) {
            if (num[i] == '.') {
                decimal = true;
            }
        }
        if (decimal == false) {
            num = num + '.00';
        }
        // console.log('result num', num)
        return num
    }
    return (
        <>
            {changeNumber(convertNumber)}
        </>
    )
}

export default {
    ArabicNumberToText
}