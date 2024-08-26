import { Form, Select, Input } from 'antd';
import { isArray, isPlainObject } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../../util/Api';
import GetIntlMessages from '../../../util/GetIntlMessages'
import Swal from "sweetalert2";

const FormProvinceDistrictSubdistrictSecond = ({ form, name = { province: "province_second_id", district: "district_second_id", subdistrict: "subdistrict_second_id", zip_code: "zip_second_code" }, disabled, hideZipCode, onChange, hideDistrict, hideSubdistrict, provinceValue, mode,
    validatename = {
        Province: false,
        District: false,
        Subdistrict: false
    } }) => {

    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const { locale } = useSelector(({ settings }) => settings);

    const modalMode = Form.useWatch("mode", { form, preserve: true })

    useEffect(() => {
        init(form)
    }, [form])

    useEffect(() => {
        init(form)
    }, [onChange, modalMode])

    useEffect(() => {
        if (mode && mode === "add") {
            setDistrictList([])
            setSubdistrictList([])
        }
    }, [mode, onChange])



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
            // console.log(`values`, values)
        } catch (error) {

        }
    }

    const handleProvinceChange = async (value) => {
        try {
            const DistrictDataList = await getDistrictDataListAll(value)
            setDistrictList(DistrictDataList)
            if (form) {
                const formValue = {}
                formValue[name.district] = null
                formValue[name.subdistrict] = null
                formValue[name.zip_code] = null
                form.setFieldsValue(formValue);
            }
        } catch (error) {
            console.log('error :>>', error)
        }


    };
    const handleDistrictChange = async (value) => {
        try {
            const SubDistrictDataList = await getSubDistrictDataListAll(value)
            setSubdistrictList(SubDistrictDataList)
            if (form) {
                const formValue = {}
                formValue[name.subdistrict] = null
                formValue[name.zip_code] = null
                form.setFieldsValue(formValue);
            }
        } catch (error) {
            console.log('error :>>', error)
        }

    };
    const handleSubdistrictChange = (value, SubDistrictDataList) => {
        try {
            if (!isArray(SubDistrictDataList)) SubDistrictDataList = subdistrictList.length > 0 ? subdistrictList ?? [] : []
            const find = SubDistrictDataList.find(where => where.id == value)
            const formValue = {}
            formValue[name.zip_code] = isPlainObject(find) ? find.zip_code : null
            form.setFieldsValue(formValue);
        } catch (error) {
            console.log('error :>>', error)
        }

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

    const showPopUp = (type) => {
        try {
            const formValue = form.getFieldValue()
            const Toast = Swal.mixin({
                toast: true,
                position: 'middle',
                showConfirmButton: true,
                // timer: 3000,
                // timerProgressBar: true,
                didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer)
                    toast.addEventListener('mouseleave', Swal.resumeTimer)
                },
                width: "50rem"
            })
            console.log('formValue[name.province] :>> ', formValue[name.province]);
            switch (type) {
                case "subdistrict":
                    if (!formValue[name.province] || !formValue[name.district]) Toast.fire({
                        icon: 'warning',
                        title: `${GetIntlMessages("warning")}`,
                        text: `${GetIntlMessages("กรุณาเลือก จังหวัด -> อำเภอ")}`,
                    })
                    break;
                case "district":
                    if (!formValue[name.province]) Toast.fire({
                        icon: 'warning',
                        title: `${GetIntlMessages("warning")}`,
                        text: `${GetIntlMessages("กรุณาเลือก จังหวัด")}`,
                    })
                    break;
                case "zip-code":
                    if (!formValue[name.subdistrict]) Toast.fire({
                        icon: 'warning',
                        title: `${GetIntlMessages("warning")}`,
                        text: `${GetIntlMessages("กรุณาเลือก ตำบล")}`,
                    })
                    break;

                default:
                    break;
            }
        } catch (error) {
            // console.log('error :>> ', error);
        }
    }


    return (
        <>
            <Form.Item name={name.province} label={GetIntlMessages("province")}
                rules={[{
                    required: validatename.Province,
                    message: GetIntlMessages(`enter-your-province`)
                }]} >
                <Select
                    showSearch
                    placeholder="เลือกข้อมูล"
                    disabled={disabled}
                    onChange={handleProvinceChange}
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {provinceList.length > 0 ? provinceList.map((e, index) => (
                        <Select.Option value={provinceValue == "name" ? e[`prov_name_${locale.locale}`] : e.id} key={index}>
                            {getNameSelect(e, "prov_name")}
                        </Select.Option>
                    )) : []}
                </Select>
            </Form.Item>

            {!hideDistrict ?
                <Form.Item name={name.district} label={GetIntlMessages("district")}
                    rules={[{
                        required: validatename.District,
                        message: GetIntlMessages(`enter-your-district`)
                    }]} >
                    <Select
                        showSearch
                        placeholder="เลือกข้อมูล"
                        disabled={disabled}
                        onChange={handleDistrictChange}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onFocus={() => showPopUp("district")}
                    >
                        {districtList.length > 0 ? districtList.map((e, index) => (
                            <Select.Option value={e.id} key={index}>
                                {getNameSelect(e, "name")}
                            </Select.Option>
                        )) : []}
                    </Select>
                </Form.Item>
                : null
            }

            {!hideSubdistrict ?
                <Form.Item name={name.subdistrict} label={GetIntlMessages("subdistrict")}
                    rules={[{
                        required: validatename.Subdistrict,
                        message: GetIntlMessages(`enter-your-province`)
                    }]} >
                    <Select
                        showSearch
                        placeholder="เลือกข้อมูล"
                        disabled={disabled}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={handleSubdistrictChange}
                        onFocus={() => showPopUp("subdistrict")}
                    >
                        {subdistrictList.length > 0 ? subdistrictList.map((e, index) => (
                            <Select.Option value={e.id} key={index}>
                                {getNameSelect(e, "name")}
                            </Select.Option>
                        )) : []}
                    </Select>
                </Form.Item>
                : null
            }
            {
                !hideZipCode ?
                    <Form.Item name={name.subdistrict} label={GetIntlMessages("zip-code")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            disabled={disabled}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onChange={handleSubdistrictChange}
                            onFocus={() => showPopUp("zip-code")}
                        >
                            {subdistrictList.length > 0 ? subdistrictList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {e.zip_code}
                                </Select.Option>
                            )) : []}
                        </Select>
                    </Form.Item> : null
            }


        </>
    )
}

export default FormProvinceDistrictSubdistrictSecond
