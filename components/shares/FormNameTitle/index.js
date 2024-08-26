import { useEffect, useState } from 'react';
import { Form, Select } from 'antd';
import API from '../../../util/Api'
import { useSelector } from 'react-redux';
import { isArray } from 'lodash';
import GetIntlMessages from '../../../util/GetIntlMessages';

const FormNameTitle = ({ name = "name_title", placeholder, disabled, style }) => {

    const [nameTitleList, setNameTitleList] = useState([])
    const { locale } = useSelector(({ settings }) => settings);

    useEffect(() => {
        getMasterData()
    }, [])
    const getMasterData = async () => {
        try {
            /* คำนำหน้า */
            const nameTitle = await getNameTitleListAll()
            setNameTitleList(nameTitle)
        } catch (error) {

        }
    }

    /* คำนำหน้า */
    const getNameTitleListAll = async () => {
        const { data } = await API.get(`/master/nameTitle?sort=code_id&order=asc`);
        // console.log('data.data :>> ', data.data);
        return data.data
    }

    return (
        <>
            <Form.Item name={name} label={GetIntlMessages("name-title")} style={style}>
                <Select
                    placeholder={placeholder}
                    disabled={disabled}
                    showSearch
                    filterOption={(inputValue, option) =>
                        option.children.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0
                    }
                >
                    {isArray(nameTitleList) ? nameTitleList.map((e, index) => (
                        <Select.Option value={e.id} key={index}>
                            {e.name_title[locale.locale]}
                        </Select.Option>
                    )) : null}
                </Select>
            </Form.Item>
        </>
    )
}

export default FormNameTitle