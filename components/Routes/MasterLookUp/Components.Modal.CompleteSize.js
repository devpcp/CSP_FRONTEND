import { useState, useEffect } from 'react'
import { Button, Form, Input, Modal, Select, Switch } from 'antd'
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import FormSelectLanguage from '../../shares/FormLanguage/FormSelectLanguage'
import FormInputLanguage from '../../shares/FormLanguage/FormInputLanguage'
import API from '../../../util/Api'
import { isFunction } from 'lodash';

const ComponentsModalCompleteSize= ({ mode, checkedIsuse, callbackIsuse, form, checkPage }) => {

    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)

    const checkPageStatus = () => {
        if (checkPage && checkPage == 'productMaster') {
            return true
        } else {
            return false
        }
    }

    return (
        <>
            <FormSelectLanguage config={{
                form,
                field: ["complete_size_name"],
                // disabled: configModal.mode == "view"
            }} onChange={(value) => setFormLocale(value)} />

            <Form.Item
                name="code_id"
                label={GetIntlMessages("code")}
            // rules={[{ required: true, message: "กรุณาเลือกข้อมูล !!" }]}
            >
                <Input disabled={mode == "view"} />
            </Form.Item>

            <FormInputLanguage icon={formLocale} label={GetIntlMessages("complete-size")} disabled={mode == "view"} name="complete_size_name" rules={[{ required: true, message: GetIntlMessages("please-fill-out") }]} />

            {/* {configModal.mode !== "add" ?
                <Form.Item name="isuse" label={GetIntlMessages("status")} >
                    <Switch disabled={mode == "view"} checked={checkedIsuse} onChange={(bool) => setCheckedIsuse(bool)} checkedChildren={GetIntlMessages("work")} unCheckedChildren={GetIntlMessages("cancel")} />
                </Form.Item> : null
            } */}

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

export default ComponentsModalCompleteSize