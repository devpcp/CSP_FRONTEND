import { useState, useEffect } from 'react'
import { Button, Form, Input, message, Modal, Select, Switch } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isFunction, isPlainObject } from 'lodash';

const ComponentsModalProductTypeGroup = ({ mode, checkedIsuse, callbackIsuse, form, checkPage }) => {

    const { locale } = useSelector(({ settings }) => settings);
    const { productTypeGroup } = useSelector(({ master }) => master);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const checkPageStatus = () => {
        if (checkPage && checkPage == 'ProductTypeAndModel') {
            return true
        } else {
            return false
        }
    }
    
    const validateData = (type)=>{
        try {
            const {internal_code_id , group_type_name ,id} = form.getFieldValue()

            const newData = productTypeGroup.filter(where => where?.id !== id)

            function noWhiteSpace(value) {
                return value.replaceAll(/\s/g,'')
            }

            let dataNoWhiteSpace
            let checkLanguage = formLocale == "us" ? "en" : formLocale
            let checkErr = false
            let validateStatus
            switch (type) {
                case "internal_code_id":
                    dataNoWhiteSpace = noWhiteSpace(internal_code_id)
                    validateStatus = newData.find(where => noWhiteSpace(where.internal_code_id) == dataNoWhiteSpace)
                    if(isPlainObject(validateStatus)) checkErr = true
                    break;
                case "group_type_name":
                    dataNoWhiteSpace = noWhiteSpace(group_type_name[checkLanguage])
                    validateStatus = newData.find(where => noWhiteSpace(where.group_type_name[checkLanguage]) == dataNoWhiteSpace)
                    if(isPlainObject(validateStatus)) checkErr = true
                    break;
            
                default:
                    break;
            }
            console.log('checkErr',checkErr )
            if(checkErr == true){
                message.error(type === "internal_code_id" ? GetIntlMessages("รหัสนี้ถูกใช้ไปแล้ว"):GetIntlMessages("ชื่อนี้ถูกใช้ไปแล้ว"))
                form.setFieldsValue(type !== "internal_code_id" ?{[type] : {[checkLanguage] : null}} :{[type] : null})
            }
        } catch (error) {
            // console.log('error', error)
        }
    }

    return (
        <>
            <FormSelectLanguage config={{
                form,
                field: ["group_type_name"],
                // disabled: configModal.mode == "view"
            }} onChange={(value) => setFormLocale(value)} />

            <Form.Item
                name="internal_code_id"
                label={GetIntlMessages("รหัสภายใน")}
                // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
            >
                <Input disabled={mode == "view"} maxLength={20} showCount onBlur={()=>validateData("internal_code_id")}/>
            </Form.Item>

            <FormInputLanguage onBlurData={validateData} icon={formLocale} label={GetIntlMessages("product-type-group-name")} disabled={mode == "view"} name="group_type_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

            {checkPageStatus() == true ? null
                :
                mode !== "add" ?
                    <Form.Item name="isuse" label={GetIntlMessages("status")} >
                        <Switch disabled={mode == "view"} checked={checkedIsuse} onChange={(bool) => callbackIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                    </Form.Item> : null
            }

        </>
    )
}

export default ComponentsModalProductTypeGroup