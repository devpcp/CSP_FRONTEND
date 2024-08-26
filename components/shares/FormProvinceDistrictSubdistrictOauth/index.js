import { Form, Select, Input } from 'antd';
import { isArray, isPlainObject } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../../util/Api/Oauth/Guest';
import GetIntlMessages from '../../../util/GetIntlMessages'

const FormProvinceDistrictSubdistrict = ({ form,importedComponentsLayouts, name = { province: "province_id", district: "district_id", subdistrict: "subdistrict_id", zip_code: "zip_code" }, disabled, hideZipCode , onChange }) => {

    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const [responsiveInputFieldLayouts, setResponsiveInputFieldLayouts] = useState(null)
    const { locale } = useSelector(({ settings }) => settings);

    useEffect(() => {
        init(form)
    }, [form])

    useEffect(() => {
        init(form)
    }, [onChange])

    useEffect(() => {
        if (_.isPlainObject(importedComponentsLayouts)) {
            setResponsiveInputFieldLayouts(importedComponentsLayouts)
        } else {
            setResponsiveInputFieldLayouts(null)
        }
    }, [])

    const init = async (form) => {
        try {
            // await getInitMasterData()
            if (form) {
                const provinceDataList = await getProvinceDataListAll()
                setProvinceList(provinceDataList)

                const formValue = form.getFieldValue()
                if (formValue[name.province]) {
                    const DistrictDataList = await getDistrictDataListAll(formValue[name.province])
                    setDistrictList(DistrictDataList)
                }
                if (formValue[name.district]) {
                    const SubDistrictDataList = await getSubDistrictDataListAll(formValue[name.district])
                    setSubdistrictList(SubDistrictDataList)
                }
                if (formValue[name.subdistrict]) {
                    handleSubdistrictChange(formValue[name.subdistrict], SubDistrictDataList)
                }

            }
        } catch (error) {

        }
    }

    const getInitMasterData = async () => {
        try {
            const promise1 = getProvinceDataListAll();
            const promise2 = getDistrictDataListAll();
            const promise3 = getSubDistrictDataListAll();
            const values = await Promise.all([promise1, promise2, promise3]);
            console.log(`values`, values)
        } catch (error) {

        }
    }

    const handleProvinceChange = async (value) => {
        const DistrictDataList = await getDistrictDataListAll(value)
        setDistrictList(DistrictDataList)
        if (form) {
            const formValue = {}
            formValue[name.district] = null
            formValue[name.subdistrict] = null
            formValue[name.zip_code] = null
            form.setFieldsValue(formValue);
        }

    };
    const handleDistrictChange = async (value) => {
        const SubDistrictDataList = await getSubDistrictDataListAll(value)
        setSubdistrictList(SubDistrictDataList)
        if (form) {
            const formValue = {}
            formValue[name.subdistrict] = null
            formValue[name.zip_code] = null
            form.setFieldsValue(formValue);
        }
    };
    const handleSubdistrictChange = (value, SubDistrictDataList) => {
        if (!isArray(SubDistrictDataList)) SubDistrictDataList = subdistrictList
        const find = SubDistrictDataList.find(where => where.id == value)
        const formValue = {}
        formValue[name.zip_code] = isPlainObject(find) ? find.zip_code : null
        form.setFieldsValue(formValue);
    }

    /* เรียกข้อมูล Province ทั้งหมด */
    const getProvinceDataListAll = async () => {
        const { data } = await API.get(`/master/province?sort=prov_name_th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล District ทั้งหมด */
    const getDistrictDataListAll = async (province_id = "") => {
        const { data } = await API.get(`/master/district?sort=name_th&order=asc${province_id ? `&province_id=${province_id}` : ""}`)
        return data.data
    }

    /* เรียกข้อมูล SubDistrict ทั้งหมด */
    const getSubDistrictDataListAll = async (district_id = "") => {
        const { data } = await API.get(`/master/subDistrict?sort=name_th&order=asc${district_id ? `&district_id=${district_id}` : ""}`)
        return data.data
    }

    const getNameSelect = (item, label) => {
        return item[`${label}_${locale.locale}`] ?? item[`${label}_en`];
    }


    return (
        <>
            <Form.Item {...responsiveInputFieldLayouts} name={name.province} label={GetIntlMessages("province")} >
                <Select
                    showSearch
                    placeholder="เลือกข้อมูล"
                    disabled={disabled}
                    onChange={handleProvinceChange}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {provinceList.map((e, index) => (
                        <Select.Option value={e.id} key={index}>
                            {getNameSelect(e, "prov_name")}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item {...responsiveInputFieldLayouts} name={name.district} label={GetIntlMessages("district")} >
                <Select
                    showSearch
                    placeholder="เลือกข้อมูล"
                    disabled={disabled}
                    onChange={handleDistrictChange}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {districtList != null ? districtList.map((e, index) => (
                        <Select.Option value={e.id} key={index}>
                            {getNameSelect(e, "name")}
                        </Select.Option>
                    )) : null}
                </Select>
            </Form.Item>

            <Form.Item {...responsiveInputFieldLayouts} name={name.subdistrict} label={GetIntlMessages("subdistrict")} >
                <Select
                    showSearch
                    placeholder="เลือกข้อมูล"
                    disabled={disabled}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={handleSubdistrictChange}
                >
                    {subdistrictList != null ? subdistrictList.map((e, index) => (
                        <Select.Option value={e.id} key={index}>
                            {getNameSelect(e, "name")}
                        </Select.Option>
                    )) : null}
                </Select>
            </Form.Item>

            {
                !hideZipCode ?
                    <Form.Item {...responsiveInputFieldLayouts} name={name.subdistrict} label={GetIntlMessages("zip-code")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            disabled={disabled}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onChange={handleSubdistrictChange}
                        >
                            {subdistrictList != null ? subdistrictList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.zip_code}
                                </Select.Option>
                            )) : null}
                        </Select>
                    </Form.Item> : null
            }


        </>
    )
}

export default FormProvinceDistrictSubdistrict
