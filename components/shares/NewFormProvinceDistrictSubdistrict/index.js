import { Form, Select, Input, message } from 'antd';
import { debounce, get, isArray, isPlainObject } from 'lodash';
import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../../util/Api';
import GetIntlMessages from '../../../util/GetIntlMessages'
import Swal from "sweetalert2";

const NewFormProvinceDistrictSubdistrict = ({ form, name = { province: "province_id", district: "district_id", subdistrict: "subdistrict_id", zip_code: "zip_code" }, disabled, hideZipCode, onChange, hideDistrict, hideSubdistrict, hideProvince, provinceValue, mode }) => {

    const [provinceList, setProvinceList] = useState([])
    const [districtList, setDistrictList] = useState([])
    const [subdistrictList, setSubdistrictList] = useState([])
    const { locale } = useSelector(({ settings }) => settings);

    useEffect(() => {
        init(form)
    }, [form , Form.useWatch("province_id" , form)])

    useEffect(() => {
        init(form)
    }, [onChange])

    useEffect(() => {
        // if (mode && mode === "add") {
        //     setDistrictList([])
        //     setSubdistrictList([])
        // }
        setDistrictList([])
        setSubdistrictList([])
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
                setSubdistrictList([])
                form.setFieldsValue(formValue);
            }
        } catch (error) {
            console.log('error :>>', error)
        }


    };
    const handleDistrictChange = async (value) => {
        try {
            // console.log('value', value)

            const formValue = {}
            let findDistrictData
            let findProvinceData
            const SubDistrictDataList = await getSubDistrictDataListAll(value)
            setSubdistrictList(SubDistrictDataList)

            const districtData = await getDistrictDataListAll()
            findDistrictData = districtData.find(where => where.id === value)
            if (isPlainObject(findDistrictData)) findProvinceData = provinceList.find(where => where.id === findDistrictData.province_id)
            formValue[name.province] = isPlainObject(findProvinceData) ? findProvinceData.id : null
            formValue[name.district] = isPlainObject(findDistrictData) ? findDistrictData[`name_${locale.locale}`] : null
            // console.log('SubDistrictDataList', SubDistrictDataList)
            // formValue[`subdistrict_list`] = isArray(SubDistrictDataList) ? SubDistrictDataList : null
            if (form) {
                // const formValue = {}
                formValue[name.subdistrict] = null
                formValue[name.zip_code] = null
                // form.setFieldsValue(formValue);
            }
            form.setFieldsValue(formValue);
        } catch (error) {
            console.log('error :>>', error)
        }

    };
    const handleSubdistrictChange = async (value, SubDistrictDataList) => {
        try {
            // const { subdistrict, district, province } = name
            let newData = []
            if (!isArray(SubDistrictDataList)) {
                SubDistrictDataList = subdistrictList.length > 0 ? subdistrictList ?? [] : []
                if (isArray(SubDistrictDataList)) {
                    newData = SubDistrictDataList.map(e => {
                        delete e?.[`link_name_${locale.locale}`]
                        return { ...e }
                    })
                }
            }

            const find = SubDistrictDataList.find(where => where.id == value)
            let findDistrict
            let findProvince
            const formValue = {}
            if (isPlainObject(find)) {

                const districtData = await getDistrictDataListAll()
                // const districtData = await getDistrictDataListAll(formValue[name.province])
                findDistrict = districtData.find(where => where.id === find.district_id)
                if (isPlainObject(findDistrict)) findProvince = provinceList.find(where => where.id === findDistrict.province_id)
                if (isPlainObject(findProvince)) setDistrictList(districtData.filter(where => where.province_id === findProvince.id))
            }
            formValue[name.province] = isPlainObject(findProvince) ? findProvince["id"] : null
            formValue[name.district] = isPlainObject(findDistrict) ? findDistrict["id"] : null
            formValue[name.subdistrict] = isPlainObject(find) ? find.id : null
            // formValue[name.subdistrict] = isPlainObject(find) ? find[`name_${locale.locale}`] : null
            formValue[name.zip_code] = isPlainObject(find) ? find.zip_code : null
            form.setFieldsValue(formValue);
        } catch (error) {
            console.log('error :>>', error)
        }

    }

    const debounceSearchData = debounce((value, type) => handleSearchData(value, type), 600)

    const handleSearchData = async (value, type) => {
        // console.log('value', value)

        try {
            const { subdistrict, district, province } = name
            const formValue = form.getFieldValue()

            function findData(subDistrictData, districtData, type) {
                try {
                    switch (type) {
                        case "subdistrict":
                            if (isArray(districtData)) {
                                const findDistrict = districtData.find(where => where.id === subDistrictData.district_id)
                                const findProvince = provinceList.find(where => where.id === findDistrict.province_id)
                                if (isPlainObject(findDistrict) && isPlainObject(findProvince)) return `${findDistrict[`name_${locale.locale}`]} --> ${findProvince[`prov_name_${locale.locale}`]}` ?? ""
                            }
                            break;
                        case "district":
                            if (isPlainObject(districtData)) {
                                // const findDistrict = districtData.find(where => where.id === subDistrictData.district_id)
                                const findProvince = provinceList.find(where => where.id === districtData.province_id)
                                if (isPlainObject(findProvince)) return `${findProvince[`prov_name_${locale.locale}`]}` ?? ""
                            }
                            break;
                        default:
                            break;
                    }

                    // form.setFieldsValue(formValue)

                } catch (error) {

                }
            }

            if (value.length >= 3) {
                switch (type) {
                    case "subdistrict":
                        if (!formValue[province] && !formValue[district]) {
                            const subDistrictData = await getSubDistrictDataListAll("", value)
                            const districtData = await getDistrictDataListAll()

                            const [callback1, callback2] = await Promise.all([subDistrictData, districtData])
                            if (isArray(callback1) && callback1.length > 0) {
                                callback1.forEach(e => {
                                    e,
                                        e[`link_name_${locale.locale}`] = `${e[`name_${locale.locale}`]} --> ${findData(e, callback2, type)}`
                                });
                            }
                            setSubdistrictList(callback1)

                        }

                        break;
                    case "district":
                        if (!formValue[province]) {

                            const districtData = await getDistrictDataListAll("", value)
                            const [callback1] = await Promise.all([districtData])
                            if (isArray(callback1) && callback1.length > 0) {
                                callback1.forEach(e => {
                                    e,
                                        e[`link_name_${locale.locale}`] = `${e[`name_${locale.locale}`]} --> ${findData([], e, type)}`
                                });
                            }
                            setDistrictList(callback1)
                        }

                        break;

                    default:
                        break;
                }
            }
        } catch (error) {

        }
    }

    /* เรียกข้อมูล Province ทั้งหมด */
    const getProvinceDataListAll = async () => {
        const { data } = await API.get(`/master/province?sort=prov_name_th&order=asc`)
        return data.data
    }

    /* เรียกข้อมูล District ทั้งหมด */
    const getDistrictDataListAll = async (province_id = "", search = "") => {
        const { data } = await API.get(`/master/district?sort=name_th&order=asc${search ? `&search=${search}` : ""}${province_id ? `&province_id=${province_id}` : ""}`)
        return data.data
    }

    /* เรียกข้อมูล SubDistrict ทั้งหมด */
    const getSubDistrictDataListAll = async (district_id = "", search = "") => {
        const { data } = await API.get(`/master/subDistrict?sort=name_th&order=asc${search ? `&search=${search}` : ""}${district_id ? `&district_id=${district_id}` : ""}`)
        return data.data
    }

    const getNameSelect = (item, label) => {
        return item[`${label}_${locale.locale}`] ?? item[`${label}_en`];
    }

    const [subDistrictShowPopUpCount, setSubDistrictShowPopUpCount] = useState(0)
    const [DistrictShowPopUpCount, setDistrictShowPopUpCount] = useState(0)

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

            switch (type) {
                case "subdistrict":

                    if (!formValue[name.province] || !formValue[name.district]) {
                        if (subDistrictShowPopUpCount <= 0) {
                            Toast.fire({
                                icon: 'info',
                                title: `${GetIntlMessages("warning")}`,
                                text: `ท่านสามารถพิมพ์ค้นหา "ตำบล" ที่ท่านต้องการได้เลย (ต้องพิมพ์อย่างน้อย 3 ตัว) หรือ เลือกตามลำดับดังนี้ จังหวัด -> อำเภอ -> ตำบล`,
                            })
                            setSubDistrictShowPopUpCount(subDistrictShowPopUpCount + 1)
                        }

                    }
                    break;
                case "district":
                    if (!formValue[name.province]) {
                        if (DistrictShowPopUpCount <= 0) {
                            Toast.fire({
                                icon: 'info',
                                title: `${GetIntlMessages("warning")}`,
                                text: `ท่านสามารถพิมพ์ค้นหา "อำเภอ" ที่ท่านต้องการได้เลย (ต้องพิมพ์อย่างน้อย 3 ตัว) หรือ เลือกตามลำดับดังนี้ จังหวัด -> อำเภอ -> ตำบล`,
                            })
                            setDistrictShowPopUpCount(DistrictShowPopUpCount + 1)
                        }

                    }
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

            {
                !hideProvince ?
                    <Form.Item name={name.province} label={GetIntlMessages("province")} >
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

                    : null
            }

            {!hideDistrict ?
                <Form.Item name={name.district} label={GetIntlMessages("district")} extra={`ท่านสามารถพิมพ์ค้นหา "อำเภอ" ที่ท่านต้องการได้เลย  (ต้องพิมพ์อย่างน้อย 3 ตัว)`} >
                    <Select
                        showSearch
                        placeholder="เลือกข้อมูล"
                        disabled={disabled}
                        onChange={handleDistrictChange}
                        onSearch={(e) => debounceSearchData(e, "district")}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onFocus={() => showPopUp("district")}
                    >

                        {districtList.length > 0 ? districtList.map((e, index) => (
                            <Select.Option value={e.id} key={index}>
                                {getNameSelect(e, "link_name") ?? getNameSelect(e, "name")}
                            </Select.Option>
                        )) : []}
                    </Select>
                </Form.Item>
                : null
            }

            {!hideSubdistrict ?
                <Form.Item name={name.subdistrict} label={GetIntlMessages("subdistrict")} extra={`ท่านสามารถพิมพ์ค้นหา "ตำบล" ที่ท่านต้องการได้เลย  (ต้องพิมพ์อย่างน้อย 3 ตัว)`}>
                    <Select
                        showSearch
                        placeholder="เลือกข้อมูล"
                        disabled={disabled}
                        filterOption={(input, option) =>
                            option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        onChange={handleSubdistrictChange}
                        onSearch={(e) => debounceSearchData(e, "subdistrict")}
                        onFocus={() => showPopUp("subdistrict")}
                    >
                        {subdistrictList.length > 0 ? subdistrictList.map((e, index) => (
                            <Select.Option value={e.id} key={index}>
                                {getNameSelect(e, "link_name") ?? getNameSelect(e, "name")}
                            </Select.Option>
                        )) : []}
                    </Select>
                </Form.Item>
                : null
            }

            {
                !hideZipCode ?
                    <Form.Item name={name.zip_code} label={GetIntlMessages("zip-code")} >
                        <Select
                            showSearch
                            placeholder="เลือกข้อมูล"
                            // disabled={disabled}
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            onChange={handleSubdistrictChange}
                            disabled
                        >
                            {subdistrictList.length > 0 ? subdistrictList.map((e, index) => (
                                <Select.Option value={e.id} key={index}>
                                    {/* {getZipCodeSelect(e, "zip_code")} */}
                                    {e.zip_code}
                                </Select.Option>
                            )) : []}
                        </Select>
                    </Form.Item> : null
            }


        </>
    )
}

export default NewFormProvinceDistrictSubdistrict
