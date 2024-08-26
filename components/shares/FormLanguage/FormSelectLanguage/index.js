import { InfoCircleOutlined } from '@ant-design/icons';
import { Form, Row, Col, Select, Button, Tooltip } from 'antd';
import { isArray, isPlainObject } from 'lodash';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import GetIntlMessages from '../../../../util/GetIntlMessages';
import languageData from '../../../_App/Layout/LayoutHeader/LanguageData';

const FormSelectLanguage = ({ onChange, config }) => {

    const { locale } = useSelector(({ settings }) => settings);
    const [formLocale, setFormLocale] = useState(locale.icon)
    const onChangeSelect = (value) => {
        setFormLocale(value)
        onChange(value)
    }

    const useSameLanguages = () => {
        if (isPlainObject(config)) {
            const { form, field } = config;
            if (form && isArray(field)) {
                const data = form.getFieldsValue();
                field.forEach(e => {
                    const { locale_json, list_json } = locale
                    if (!isPlainObject(e)) {
                        if (!data[e]) data[e] = locale_json;
                        const value = data[e][formLocale]
                        if (value) {
                            list_json.forEach(x => {
                                if (!data[e][x]) data[e][x] = value;
                            });
                        }
                    } else {
                        if (isArray(data[e.name])) {
                            data[e.name].forEach(value => {
                                if (!value[e.field]) value[e.field] = locale_json;
                                const dataField = value[e.field][formLocale]
                                if (value) {
                                    list_json.forEach(x => {
                                        if (!value[e.field][x]) value[e.field][x] = dataField;
                                    });
                                }
                            })
                        }
                    }
                })
            }
            form.setFieldsValue(data);
        }
    }

    return (

        <Form.Item label={GetIntlMessages("languages")} name={name} >
            <Form.List name={name}>
                {(fields, { add, remove }) => (
                    <>
                        <Row>
                            <Col span={12}>
                                <Form.Item >
                                    <Select style={{ width: "100%" }} onChange={(value) => onChangeSelect(value)} value={formLocale}>
                                        {isArray(languageData) ? languageData.map((language) =>
                                            <Select.Option value={language.icon} key={`locale-${language.languageId}`}>
                                                <img src={`/assets/images/flags/${language.icon}.png`} height={20} /> {language.name}
                                            </Select.Option>
                                        ) : null}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                {isPlainObject(config) && !config.disabled ?
                                    <Button type="link" onClick={useSameLanguages}>
                                        {GetIntlMessages("use-same-languages")}
                                        <Tooltip title={GetIntlMessages("tooltip-use-same-languages")}>
                                            <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                                        </Tooltip>
                                    </Button> : null}

                            </Col>
                        </Row>
                    </>
                )}
            </Form.List>
        </Form.Item>
    )
}

export default FormSelectLanguage
