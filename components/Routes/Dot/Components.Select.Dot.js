import { Form, Row, Col, Select, Button, Input, AutoComplete, message } from 'antd';
import { isArray, isNaN, isPlainObject } from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../util/GetIntlMessages';
import { DateTime } from 'luxon';
import API from '../../../util/Api';
import RegexMultiPattern from '../../shares/RegexMultiPattern';
import Swal from 'sweetalert2';


const FormSelectDot = ({ name, importedComponentsLayouts, disabled, form, index, isNoStyle, docTypeId, fieldKey, field }) => {
    const [responsiveInputFieldLayouts, setResponsiveInputFieldLayouts] = useState(null)
    const [tireProductTypeGroupId, setTireProductTypeGroupId] = useState('da791822-401c-471b-9b62-038c671404ab')

    const { locale } = useSelector(({ settings }) => settings);
    // const formValue = form.getFieldValue()

    useEffect(() => {
        generateDot()

        if (isPlainObject(importedComponentsLayouts)) {
            setResponsiveInputFieldLayouts(importedComponentsLayouts)
        } else {
            setResponsiveInputFieldLayouts(null)
        }

    }, [])





    const [presentYearDot, setPresentYearDot] = useState([])
    const [lastYearDot, setLastYearDot] = useState([])
    const [resultDotArr, setResultDotArr] = useState([])

    const generateDot = async () => {
        const currentDate = DateTime.local()
        const lastYear = currentDate.minus({ year: 1 })
        const startOfYear = currentDate.startOf('year')


        const presentYear = []
        const currentYear = currentDate.toFormat('yy')
        // const currentYear = currentDate.weekYear.toString().slice(-2)
        for (let i = 1; i <= currentDate.weekNumber; i++) {
            presentYear.push({ value: `${i.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}${currentYear}` })
        }

        const newPresentYear = presentYear.map(e => { return parseInt(e.value) })
        const newArr = newPresentYear.sort((a, b) => { return b - a })
        const resultPresentYear = newArr.map(e => e.toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false }))

        const lastYearWeeks = []
        const AdLastYear = lastYear.toFormat('yy')
        // const currentYear = lastYear.weekYear.toString().slice(-2)
        for (let i = lastYear.weekNumber; i <= lastYear.weeksInWeekYear; i++) {
            lastYearWeeks.push({ value: `${i.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}${AdLastYear}` })
        }

        const newLastYear = lastYearWeeks.map(e => { return parseInt(e.value) })
        const newArrLastYear = newLastYear.sort((a, b) => { return b - a })
        const resultLastYear = newArrLastYear.map(e => e.toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false }))

        setPresentYearDot(resultPresentYear)
        setLastYearDot(resultLastYear)
        setResultDotArr([...resultPresentYear, ...resultLastYear])
    }

    const showDot = () => {
        try {
            const { product_list, quotation_product_list, shopPurchaseOrderLists } = form.getFieldValue()
            // console.log('docTypeId :>> ', docTypeId);;
            if (docTypeId === "e5871484-d096-41be-b515-b33aa715957a") {
                return quotation_product_list[index].type_group_id ?? null
            } else if (docTypeId === "941c0fc7-794b-4838-afca-2bd8884dc36d") {
                return shopPurchaseOrderLists[index].list_shop_stock[0]?.Product?.ProductType?.type_group_id ?? null
            } else {
                return product_list[index].ProductTypeGroupId ? product_list[index].ProductTypeGroupId : null
            }

        } catch (error) {
            // console.log('error showDot :>> ', error);
        }

    }
    const onChangeValue = (value) => {
        try {
            form.validateFields().then(async (values) => {

            }).catch((errorInfo) => {
                // console.log('errorInfo :>> ', errorInfo);
                const { errorFields } = errorInfo
                if (isArray(errorFields) && errorFields.length > 0) {
                    const find = errorFields.find(where => where.name.find(whereName => whereName === name[1]))

                    if (isPlainObject(find)) {
                        if (docTypeId === "e5871484-d096-41be-b515-b33aa715957a") {
                            form.getFieldValue()[find.name[0]][find.name[1]][find.name[2]] = null
                            form.setFieldsValue([find.name[0]])
                            Swal.fire(`${find.errors.map(e => e).join(" , ")}`, '', 'warning')
                        }
                    }
                }
            });
        } catch (error) {
            console.log('error :>> ', error);
        }
    }
    return (
        <>
            <Form.Item rules={[
                RegexMultiPattern("1", GetIntlMessages("ตัวเลขเท่านั้น")),
                {
                    min: 4,
                    message: GetIntlMessages("กรุณากรอกอย่างน้อย 4 ตัว")
                }
            ]}
                {...field}
                label={index >= 1 ? "" : GetIntlMessages("Dot")} noStyle={isNoStyle ?? false} name={name} fieldKey={fieldKey}
                validateTrigger={['onChange', 'onBlur']}
                // 
                {...responsiveInputFieldLayouts}
                className='form-warehouse'
            >
                {
                    showDot() === tireProductTypeGroupId ?
                        <AutoComplete
                            options={resultDotArr.map(e => { return { 'value': e } })}
                            placeholder="ค้นหาหรือเพิ่มข้อมูลใหม่"
                            disabled={disabled}
                            filterOption={(inputValue, option) =>
                                option.value.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                            }
                            // showArrow
                            allowClear
                            style={{ width: "100%" }}
                            maxLength={4}
                            onChange={onChangeValue}
                        />
                        :
                        <Input onChange={onChangeValue} maxLength={4} disabled={disabled} placeholder="เพิ่มข้อมูลใหม่" />

                }

            </Form.Item>
            <style jsx global>
                {`
                 .form-warehouse {
                    margin-bottom: 10px !important;
                 }

                `}
            </style>
        </>
    )

}

export default FormSelectDot
