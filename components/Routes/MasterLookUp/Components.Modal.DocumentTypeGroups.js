import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Select, Switch } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isFunction } from 'lodash';

const ComponentsModalDocumentTypeGroups = ({ mode, checkedIsuse, callbackIsuse, form, checkPage }) => {

    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const checkPageStatus = () => {
        if (checkPage && checkPage == 'DocmentTypeGroup') {
            return true
        } else {
            return false
        }
    }

    return (
        <>
            <FormSelectLanguage config={{
                form,
                field: ["group_type_name"],
                // disabled: mode == "view"
            }} onChange={(value) => setFormLocale(value)} />

            <div hidden>
                <Form.Item
                    name="code_id"
                    label={GetIntlMessages("code")}
                // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
                >
                    <Input disabled={mode == "view"} />
                </Form.Item>
            </div>


            <FormInputLanguage icon={formLocale} label={GetIntlMessages("document-type-group")} disabled={mode == "view"} name="group_type_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

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

export default ComponentsModalDocumentTypeGroups