import { DownloadOutlined, ExportOutlined, ImportOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons"
import { Col, Input, Row, Form, Button, Select, DatePicker, Slider, InputNumber } from "antd"
import { isArray, isFunction, isPlainObject, get, debounce, isUndefined } from "lodash"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import GetIntlMessages from "../../../util/GetIntlMessages"
import TitlePage from '../TitlePage'

const { RangePicker } = DatePicker;
const SearchInputSharesComponents = ({ className, configSearch = { col: 3, search: [] }, SearchCustom, loading, onAdd, value, title = true }) => {
    const { permission_obj } = useSelector(({ permission }) => permission);
    const [formInputSearch] = Form.useForm();

    useEffect(() => {
        if (value) {
            if (value?.filter_balance) {
                value = { ...value, filter_balance_min: value?.filter_balance[0], filter_balance_max: value?.filter_balance[1] }
            }
            formInputSearch.setFieldsValue(value)
        }
    }, [value]);

    const add = () => {
        if (isFunction(onAdd))
            onAdd()
    }
    const onDownloadTemplate = () => {
        if (isFunction(configSearch.downloadTemplate))
            configSearch.downloadTemplate()
    }
    const onImportExcel = () => {
        if (isFunction(configSearch.importExcel))
            configSearch.importExcel()
    }
    const onExportExcel = () => {
        if (isFunction(configSearch.exportExcel)) {
            configSearch.exportExcel()
        }
    }

    const onGenQRCode = () => {
        if (isFunction(configSearch.genQRCode)) {
            configSearch.genQRCode()
        }
    }

    const search = (value) => {
        // console.log("SearchValue",value)
        // const isNumber = typeof value === "number" ? true : false
        // console.log("isNumber",isNumber)
        // if(value.length >= 5 || isNumber){
        formInputSearch.submit()
        // }
    }

    const debounceOnSearch = debounce(search, 1000)

    const reset = () => {
        formInputSearch.resetFields()
        if (isFunction(configSearch.onReset))
            configSearch.onReset()
    }

    const onFinishInputSearch = (value) => {
        if (isFunction(configSearch.onFinishSearch))
            configSearch.onFinishSearch(value)
    }

    const onFinishFailedInputSearch = (error) => {
        if (isFunction(configSearch.onFinishSearch))
            configSearch.onFinishError(error)
    }

    const onClearSearch = (type) => {
        if (isFunction(configSearch?.onClearFilterSearch))
            configSearch?.onClearFilterSearch(type)
    }

    const CountButtonImportExport = () => {
        let point = 0;
        point = (configSearch.button.download ? 1 : 0) + (configSearch.button.import ? 1 : 0) + (configSearch.button.export ? 1 : 0)
        // console.log("CountButtonImportExport",point)
        switch (point) {
            case 1:
                return 8;
            case 2:
                return 9;
            case 3:
                return 12;
        }
    }

    const CountButtonImportExportSearchInput = () => {
        let point = 0;
        point = (configSearch.button.download ? 1 : 0) + (configSearch.button.import ? 1 : 0) + (configSearch.button.export ? 1 : 0)
        // console.log("CountButtonImportExportSearchInput",point)
        switch (point) {
            case 1:
                return 16;
            case 2:
                return 15;
            case 3:
                return 12;
        }
    }

    const handleChangeSliderValue = (sliderValue, type, sliderFieldName) => {
        try {
            sliderValue === null ? sliderValue = 0 : null
            const setValue = {}
            switch (type) {
                case "inputMin":
                    setValue = [sliderValue, formInputSearch.getFieldValue()?.[sliderFieldName][1]]
                    break;
                case "inputMax":
                    setValue = [formInputSearch.getFieldValue()?.[sliderFieldName][0], sliderValue]
                    break;

                default:
                    break;
            }
            formInputSearch.setFieldsValue({ [sliderFieldName]: setValue })
            search()
        } catch (error) {

        }
    }
    const CreateInput = (item, key) => {
        switch (item.type.toLowerCase()) {
            case "input":
                return <Col md={isUndefined(item.col_md) ? configSearch.col ?? 24 : item.col_md} span={24} key={`input-${key}`}>
                    <Form.Item label={item.label} name={item.name} rules={item.rules} >
                        <Input
                            placeholder={item.placeholder}
                            disabled={item.disabled}
                            onPressEnter={() => formInputSearch.submit()}
                            onChange={(value) => debounceOnSearch(value.target.value)} />
                    </Form.Item>
                </Col>
            case "select":
                return <Col md={isUndefined(item.col_md) ? configSearch.col ?? 24 : item.col_md} span={24} key={`input-${key}`}>
                    <Form.Item label={item.label} name={item.name} key={`select-${key}`} rules={item.rules}>
                        <Select
                            placeholder={item.placeholder}
                            style={{ width: "100%" }}
                            disabled={item.disabled}
                            onChange={search}
                            allowClear={item.allowClear !== null ? item.allowClear : false}
                            onClear={!!item?.allowClear ? () => onClearSearch(item.name) : false}
                            showSearch={item.showSearch !== null ? item.showSearch : false}
                            mode={item?.mode ?? null}
                            optionFilterProp="children">
                            {
                                item.list.map((e, index) =>
                                    <Select.Option value={e.value} key={`select-option-${index}`}>
                                        {e.key}
                                    </Select.Option>)
                            }
                        </Select>
                    </Form.Item>
                </Col>
            case "rangepicker":
                return <Col md={isUndefined(item.col_md) ? configSearch.col ?? 24 : item.col_md} span={24} key={`input-${key}`}>
                    <Form.Item label={item.label} name={item.name} key={`select-${key}`} rules={item.rules}>
                        <RangePicker
                            style={{ width: "100%" }}
                            disabled={item.disabled}
                            placeholder={[GetIntlMessages("Start"), GetIntlMessages("End")]}
                            onChange={search}
                            allowClear={item.allowClear !== null ? item.allowClear : false}
                            showSearch={item.showSearch !== null ? item.showSearch : false}
                            optionFilterProp="children"
                            format={"DD/MM/YYYY"}
                        />
                    </Form.Item>
                </Col>
            case "silder":
                return (
                    <>
                        <Col md={configSearch?.sliderCol?.input ?? 24} span={24} key={`input-slider-min-${key}`}>
                            <Form.Item label={`เริ่มต้น`} name={`${item.name}_min`} key={`InputNumber-slider-min-${key}`} rules={item.rules}>
                                <InputNumber
                                    min={0}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(sliderValue) => handleChangeSliderValue(sliderValue, "inputMin", item.name)}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={configSearch?.sliderCol?.slider ?? 24} span={24} key={`slider-${key}`}>
                            <Form.Item label={item.label} name={item.name} key={`slider-range-${key}`} rules={item.rules}>
                                <Slider
                                    range
                                    defaultValue={item.defaultValue}
                                    disabled={item.disabled}
                                    min={item.minMaxValue.min}
                                    max={item.minMaxValue.max}
                                    tooltip={{ formatter: (valueSlider) => valueSlider }}
                                    marks={{ 0: "0", [item.minMaxValue.max]: { label: item.minMaxValue.max } }}
                                    onAfterChange={() => search()}
                                />
                            </Form.Item>
                        </Col>
                        <Col md={configSearch?.sliderCol?.input ?? 24} span={24} key={`input-slider-max-${key}`}>
                            <Form.Item label={`สิ้นสุด`} name={`${item.name}_max`} key={`InputNumber-slider-max-${key}`} rules={item.rules}>
                                <InputNumber
                                    min={0}
                                    style={{
                                        width: "100%"
                                    }}
                                    onChange={(sliderValue) => handleChangeSliderValue(sliderValue, "inputMax", item.name)}
                                />
                            </Form.Item>
                        </Col>
                    </>
                )
            case "monthyearpicker":
                return <Col md={isUndefined(item.col_md) ? configSearch.col ?? 24 : item.col_md} span={24} key={`input-${key}`}>
                    <Form.Item label={item.label} name={item.name} key={`select-${key}`} rules={item.rules}>
                        <DatePicker
                            picker="month"
                            style={{ width: "100%" }}
                            disabled={item.disabled}
                            placeholder={item.placeholder}
                            onChange={search}
                            allowClear={item.allowClear !== null ? item.allowClear : false}
                            showSearch={item.showSearch !== null ? item.showSearch : false}
                            optionFilterProp="children"
                            format={"MM/YYYY"}
                        />
                    </Form.Item>
                </Col>
            default: return null;
        }
    }

    const filterSearch = () => {
        if (isPlainObject(configSearch) && isArray(configSearch.search)) {
            configSearch.search.map((x) => {
                x.use === undefined ? x.use = true : null
            })

        }
        return configSearch.search.filter(x => x.use === true).map((item, key) =>
            CreateInput(item, key)
        )
    }

    return (
        <>
            <div id={`search-input`} className={`${className}`}>
                {title ? <div className="head-line-text"><TitlePage /></div> : null}
                <div className="detail-before-table" >
                    <Form
                        form={formInputSearch}
                        className="pt-3"
                        layout="vertical"
                        onFinish={onFinishInputSearch}
                        onFinishFailed={onFinishFailedInputSearch}
                    >
                        <Row gutter={[16, 4]}>
                            {filterSearch()}
                            {/* {isPlainObject(configSearch) && isArray(configSearch.search) ?
                            _column.map((x) => { x.use === undefined ? x.use = true : null })
                                configSearch.search.map((item, key) =>
                                    CreateInput(item, key))
                                : null} */}
                        </Row>

                        {SearchCustom ? <SearchCustom /> : null}
                    </Form>

                    <Row gutter={[0, 16]}>

                        <Col md={CountButtonImportExportSearchInput()} span={24} id="add-search-reset">
                            <Row justify="start" gutter={[16, 16]} >
                                <Col className="gutter-row">
                                    {
                                        permission_obj.create && configSearch.button.create != false ?

                                            <Button type="button" className={configSearch?.button?.name?.add ? "btn-configSearch-add" : "btn"} icon={<PlusOutlined />} loading={loading} onClick={add}>{get(configSearch, "button.name.add", GetIntlMessages("add-data"))}</Button>

                                            : null
                                    }
                                </Col>
                                <Col className="gutter-row" >
                                    <Button type="button" className="btn" icon={<SearchOutlined />} onClick={() => formInputSearch.submit()} loading={loading}>{GetIntlMessages("search-data")}</Button>
                                </Col>

                                <Col className="gutter-row">
                                    <Button type="button" className="btn" icon={<ReloadOutlined />} loading={loading} onClick={reset}>{GetIntlMessages("reset-data")}</Button>
                                </Col>
                            </Row>
                        </Col>

                        <Col md={CountButtonImportExport()} span={24} id="import-export">
                            <Row justify="end" gutter={[16, 16]} >
                                {configSearch.button.download ?
                                    <Col className="gutter-row">
                                        <Button className="btn" icon={<DownloadOutlined />} onClick={onDownloadTemplate}>Download</Button>
                                    </Col>
                                    : null}

                                {configSearch.button.import ?
                                    <Col className="gutter-row">
                                        <Button className="btn" icon={<ImportOutlined />} onClick={onImportExcel}>Import</Button>
                                    </Col>
                                    : null}

                                {configSearch.button.genQR ?
                                    <Col className="gutter-row">
                                        <Button className="btn" icon={<ExportOutlined />} onClick={onGenQRCode}>QR Code</Button>
                                    </Col>
                                    : null}

                                {configSearch.button.export ?
                                    <Col className="gutter-row">
                                        <Button className="btn" icon={<ExportOutlined />} onClick={onExportExcel}>Export</Button>
                                    </Col>
                                    : null}


                            </Row>
                        </Col>
                    </Row>
                </div>

            </div>

            <style jsx global>
                {`
                    #search-input .btn {
                        max-width: 90px;
                    }
                    @media only screen and (min-width: 992px) {
                        #search-input .btn {
                            max-width: 120px;
                        }
                    }
                `}
            </style>
        </>
    )
}

export default SearchInputSharesComponents
