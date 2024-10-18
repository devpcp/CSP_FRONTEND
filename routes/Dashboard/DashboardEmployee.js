import { useEffect, useState } from 'react'
import { Row, Col, Card, Avatar, Form, Select, Button, Input, message, Switch, DatePicker, Empty, Table, Tooltip as TooltipAntd } from 'antd';
import { Chart } from "react-google-charts";
import API from '../../util/Api'
import { ReloadOutlined, ScanOutlined, LoadingOutlined } from '@ant-design/icons';
import CarPreloader from '../../components/_App/CarPreloader'
import { useDispatch, useSelector } from 'react-redux';
import { RoundingNumber } from '../../components/shares/ConvertToCurrency';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useRouter } from "next/router";
// import Chart from 'chart.js/auto';
import { isPlainObject, debounce, isArray } from 'lodash';
import moment from "moment";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    ChartDataLabels
);

const titlestyle = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: "rgb(64, 169, 255)",
    fontSize: "18px",
    fontWeight: "600"
}

const subtitlestyle = {
    color: '#6b6b6b',
    fontSize: "14px"
}

const highlightStyle = {
    textAlign: "center",
    backgroundColor: "#F4F4F4",
    padding: "4px 0"
}

const dashboardBtnImg = {
    padding: "8px 8px"
}

const { Option } = Select;


const DashboardEmployee = () => {
    const { RangePicker } = DatePicker;
    const router = useRouter();
    const { locale } = useSelector(({ settings }) => settings);
    const { shopInCorporate } = useSelector(({ master }) => master);
    const { authUser } = useSelector(({ auth }) => auth);
    const [dashboard, setDashboard] = useState({})
    const [loading, setLoading] = useState(false)
    const [organizationList, setOrganizationList] = useState([])
    const [graptopserch, setGraptopserch] = useState([]);
    const [grapuser, setGrapuser] = useState([]);
    const [grapdata, setGrapdata] = useState([]);
    const [time, setTime] = useState(0);
    const [chartData, setChartData] = useState([]);
    const [vehicleData, setVehicleData] = useState([]);
    const [productStockData, setProductStockData] = useState([]);
    const [colorGroup, setColorGroup] = useState([
        '#40A9FF',
        '#C96868',
        '#7EACB5',
        '#FADFA1',
        '#FF885B',
        '#FABC3F',
        '#0D7C66',
        '#00712D',
        '#694F8E',
        '#B692C2',
        '#BEC6A0',
        '#708871',
        '#F6FB7A',
        '#FFF455',])
    const [dataChartBrandSales, setDataChartBrandSales] = useState({ labels: [], datasets: [] });
    const [dataChartDailyInfo, setDataChartDailyInfo] = useState({});
    const [dataChartCompareMonthlySales, setDataChartCompareMonthlySales] = useState({ labels: [], datasets: [] });
    const [dataChartCompareSalesTarget, setDataChartCompareSalesTarget] = useState({ labels: [], datasets: [] });
    const [dataChartNumberOfUserThisMonth, setDataChartNumberOfUserThisMonth] = useState({ labels: [], datasets: [] });
    const [dataChartBrandSalesOnlyTire, setDataChartBrandSalesOnlyTire] = useState({ labels: [], datasets: [] });
    const [dataChartBrandSalesOnlySpare, setDataChartBrandSalesOnlySpare] = useState({ labels: [], datasets: [] });
    const [dataTypeSales, setDataChartTypeSales] = useState({ labels: [], datasets: [] });
    const [dataChartDailyFinanceInfo, setDataChartDailyFinanceInfo] = useState({});
    const [dataNumberOfIncomeThisMonth, setDataChartNumberOfIncomeThisMonth] = useState({ labels: [], datasets: [] });
    const [dataChangeBrandTireOfSpare, setDataChangeBrandTireOfSpare] = useState(true);
    const [dataChartCompareYearlySalesTireAmount, setDataChartCompareYearlySalesTireAmount] = useState({ labels: [], datasets: [] });
    const [dataChartCompareYearlySalesSpareAmount, setDataChartCompareYearlySalesSpareAmount] = useState({ labels: [], datasets: [] });
    const [dataNumberOfSalesTireAmountByMonth, setDataNumberOfSalesTireAmountByMonth] = useState({ labels: [], datasets: [] });
    const [dataNumberOfSalesSpareAmountByMonth, setDataNumberOfSalesSpareAmountByMonth] = useState({ labels: [], datasets: [] });
    const [dataTopSizeSales, setDataTopSizeSales] = useState({ labels: [], datasets: [] });
    const [dataTopTypeTire, setDataTopTypeTire] = useState({ labels: [], datasets: [] });
    const [dataTopTypeSpare, setDataTopTypeSpare] = useState({ labels: [], datasets: [] });
    const [dataTopTypeService, setDataTopTypeService] = useState({ labels: [], datasets: [] });
    const [dataTopCustomer, setDataTopCustomer] = useState({ labels: [], datasets: [] });
    const [dataChangeCompareYearly, setDataChangeCompareYearly] = useState("income");
    const [dataChangeNumberOfSales, setDataNumberOfSales] = useState("income");
    const [whichTopProduct, setWhichTopProduct] = useState("tire");
    const [dataTopTypeOrderCeilingTire, setDataTopTypeOrderCeilingTire] = useState({ labels: [], datasets: [] });
    const [dataTopTypeOrderCeilingSpare, setDataTopTypeOrderCeilingSpare] = useState({ labels: [], datasets: [] });
    const [dataTopTypeOrderCeilingService, setDataTopTypeOrderCeilingService] = useState({ labels: [], datasets: [] });

    const [form] = Form.useForm();
    const [checkLoad, setCheckLoad] = useState(1);
    const [modelSearch, setModelSearch] = useState(1);

    const dispatch = useDispatch();

    const initialSearch = {
        organization: null,
        datatype: null,
        tag: null,
        start_date: moment(Date.now()).format("YYYY-MM-DD"),
        end_date: moment(Date.now()).format("YYYY-MM-DD"),
        start_year_month: moment(Date.now()).format("YYYY-MM"),
        end_year_month: moment(Date.now()).format("YYYY-MM"),
        start_month: moment(Date.now()).format("MM"),
        end_month: moment(Date.now()).format("MM"),
        start_year: moment(Date.now()).format("YYYY"),
        end_year: moment(Date.now()).format("YYYY"),
        filter_date: [moment(Date.now()), moment(Date.now())],
    }
    /* ค่าเริ่มต้น */
    const reset = async () => {
        form.setFieldsValue(initialSearch)
        await GetDashBoard(initialSearch)
    }

    const onFinish = async (value) => {
        await GetDashBoard(value)
    }

    useEffect(() => {
        init()
    }, [shopInCorporate]);

    const init = async () => {
        try {

            let shopInCorporateData = await shopInCorporate
            setLoading(true)
            if (checkLoad > 1 || (checkLoad === 1 && shopInCorporateData.length > 0)) {
                if (shopInCorporateData.length === 0) {
                    if (authUser?.UsersProfile !== null) {
                        shopInCorporateData.push(authUser?.UsersProfile?.ShopsProfile)
                    }
                    initialSearch.select_shop_ids = shopInCorporateData?.length > 1 ? authUser?.UsersProfile?.ShopsProfile?.id ?? null : null
                    form.setFieldsValue(initialSearch)
                    setModelSearch(initialSearch)
                    await GetDashBoard(initialSearch);
                } else {
                    initialSearch.select_shop_ids = authUser?.UsersProfile?.ShopsProfile?.id ?? null
                    form.setFieldsValue(initialSearch)
                    setModelSearch(initialSearch)
                    await GetDashBoard(initialSearch);
                }
            } else {
                setCheckLoad(checkLoad + 1)
            }


        } catch (error) {
            setLoading(false)
            message.error('มีบางอย่างผิดพลาด !!');
        }
    }

    const GetDashBoard = async (model_search) => {
        setLoading(true)
        let url = '/dashboard/config', urlCall
        API.get(url).then(({ data: { data } }) => {
            setChartData(data)
            data.map((item, index) => {
                switch (item.api) {
                    case "api/dashboard/brandSales":
                        urlCall = `/dashboard/brandSales?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartBrandSales(urlCall)
                        break;
                    case "api/dashboard/dailyInfo":
                        urlCall = `/dashboard/dailyInfo?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartDailyInfo(urlCall)
                        break;
                    case "api/dashboard/compareMonthlySales":
                        urlCall = `/dashboard/compareMonthlySales?`;

                        if (model_search.start_year) urlCall += `&start_year=${model_search.start_year}`
                        if (model_search.end_year) urlCall += `&end_year=${model_search.end_year}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartCompareMonthlySales(urlCall)
                        break;
                    case "api/dashboard/compareSalesTarget":
                        urlCall = `/dashboard/compareSalesTarget?`;

                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartCompareSalesTarget(urlCall)
                        break;
                    case "api/dashboard/numberOfUserThisMonth":
                        urlCall = `/dashboard/numberOfUserThisMonth?`;
                        if (model_search.start_year_month) urlCall += `&start_year_month=${model_search.start_year_month}`
                        if (model_search.end_year_month) urlCall += `&end_year_month=${model_search.end_year_month}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartNumberOfUserThisMonth(urlCall)
                        break;
                    case "api/dashboard/brandSalesOnlyTire":
                        urlCall = `/dashboard/brandSalesOnlyTire?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartBrandSalesOnlyTire(urlCall)
                        break;
                    case "api/dashboard/brandSalesOnlySpare":
                        urlCall = `/dashboard/brandSalesOnlySpare?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartBrandSalesOnlySpare(urlCall)
                        break;
                    case "api/dashboard/typeSales":
                        urlCall = `/dashboard/typeSales?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartTypeSales(urlCall)
                        break;
                    case "api/dashboard/dailyFinanceInfo":
                        urlCall = `/dashboard/dailyFinanceInfo?`;

                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartDailyFinanceInfo(urlCall)
                        break;
                    case "api/dashboard/numberOfIncomeThisMonth":
                        urlCall = `/dashboard/numberOfIncomeThisMonth?`;
                        if (model_search.start_year_month) urlCall += `&start_year_month=${model_search.start_year_month}`
                        if (model_search.end_year_month) urlCall += `&end_year_month=${model_search.end_year_month}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartNumberOfIncomeThisMonth(urlCall)
                        break;
                    case "api/dashboard/compareYearlySalesTireAmount":
                        urlCall = `/dashboard/compareYearlySalesTireAmount?`;

                        if (model_search.start_year) urlCall += `&start_year=${model_search.start_year}`
                        if (model_search.end_year) urlCall += `&end_year=${model_search.end_year}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartCompareYearlySalesTireAmount(urlCall)
                        break;
                    case "api/dashboard/compareYearlySalesSpareAmount":
                        urlCall = `/dashboard/compareYearlySalesSpareAmount?`;

                        if (model_search.start_year) urlCall += `&start_year=${model_search.start_year}`
                        if (model_search.end_year) urlCall += `&end_year=${model_search.end_year}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartCompareYearlySalesSpareAmount(urlCall)
                        break;
                    case "api/dashboard/numberOfSalesTireAmountByMonth":
                        urlCall = `/dashboard/numberOfSalesTireAmountByMonth?`;

                        if (model_search.start_year_month) urlCall += `&start_year_month=${model_search.start_year_month}`
                        if (model_search.end_year_month) urlCall += `&end_year_month=${model_search.end_year_month}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartNumberOfSalesTireAmountByMonth(urlCall)
                        break;
                    case "api/dashboard/numberOfSalesSpareAmountByMonth":
                        urlCall = `/dashboard/numberOfSalesSpareAmountByMonth?`;

                        if (model_search.start_year_month) urlCall += `&start_year_month=${model_search.start_year_month}`
                        if (model_search.end_year_month) urlCall += `&end_year_month=${model_search.end_year_month}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`

                        chartNumberOfSalesSpareAmountByMonth(urlCall)
                        break;
                    case "api/dashboard/topSizeSales":
                        urlCall = `/dashboard/topSizeSales?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopSizeSales(urlCall)
                        break;
                    case "api/dashboard/topType/tire":
                        urlCall = `/dashboard/topType/tire?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeTire(urlCall)
                        break;
                    case "api/dashboard/topType/spaire":
                        urlCall = `/dashboard/topType/spaire?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeSpare(urlCall)
                        break;
                    case "api/dashboard/topType/service":
                        urlCall = `/dashboard/topType/service?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeService(urlCall)
                        break;
                    case "api/dashboard/topCustomer":
                        urlCall = `/dashboard/topCustomer?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopCustomer(urlCall)
                        break;
                    case "api/dashboard/topTypeOrderCeiling/tire":
                        urlCall = `/dashboard/topTypeOrderCeiling/tire?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeOrderCeilingTire(urlCall)
                        break;
                    case "api/dashboard/topTypeOrderCeiling/spaire":
                        urlCall = `/dashboard/topTypeOrderCeiling/spaire?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeOrderCeilingSpare(urlCall)
                        break;
                    case "api/dashboard/topTypeOrderCeiling/service":
                        urlCall = `/dashboard/topTypeOrderCeiling/service?`;
                        if (model_search.start_date) urlCall += `&start_date=${model_search.start_date}`
                        if (model_search.end_date) urlCall += `&end_date=${model_search.end_date}`
                        if (model_search.select_shop_ids) urlCall += `&select_shop_ids=${model_search.select_shop_ids}`
                        chartTopTypeOrderCeilingService(urlCall)
                        break;
                    default:
                        break;
                }
            })
        }).catch((err) => {
            console.log(err);

        });
    }

    const [onLoadBrandSales, setOnLoadBrandSales] = useState(false);
    const [onLoadBrandSalesOnlyTire, setOnLoadBrandSalesOnlyTire] = useState(false);
    const [onLoadBrandSalesOnlySpare, setOnLoadBrandSalesOnlySpare] = useState(false);
    const [onLoadTypeSales, setOnLoadTypeSales] = useState(false);
    const [onLoadDailyInfo, setOnLoadDailyInfo] = useState(false);
    const [onLoadDailyFinanceInfo, setOnLoadDailyFinanceInfo] = useState(false);
    const [onLoadCompareMonthlySales, setOnLoadCompareMonthlySales] = useState(false);
    const [onLoadCompareSalesTarget, setOnLoadCompareSalesTarget] = useState(false);
    const [onLoadNumberOfUserThisMonth, setOnLoadNumberOfUserThisMonth] = useState(false);
    const [onLoadNumberOfIncomeThisMonth, setOnLoadNumberOfIncomeThisMonth] = useState(false);
    const [onLoadCompareYearlySalesTireAmount, setOnLoadCompareYearlySalesTireAmount] = useState(false);
    const [onLoadCompareYearlySalesSpareAmount, setOnLoadCompareYearlySalesSpareAmount] = useState(false);
    const [onLoadNumberOfSalesTireAmountByMonth, setOnLoadNumberOfSalesTireAmountByMonth] = useState(false);
    const [onLoadNumberOfSalesSpareAmountByMonth, setOnLoadNumberOfSalesSpareAmountByMonth] = useState(false);
    const [onLoadTopSizeSales, setOnLoadTopSizeSales] = useState(false);
    const [onLoadTopTypeTire, setOnLoadTopTypeTire] = useState(false);
    const [onLoadTopTypeSpare, setOnLoadTopTypeSpare] = useState(false);
    const [onLoadTopTypeService, setOnLoadTopTypeService] = useState(false);
    const [onLoadTopCustomer, setOnLoadTopCustomer] = useState(false);
    const [onLoadTopTypeOrderCeilingTire, setOnLoadTopTypeOrderCeilingTire] = useState(false);
    const [onLoadTopTypeOrderCeilingSpare, setOnLoadTopTypeOrderCeilingSpare] = useState(false);
    const [onLoadTopTypeOrderCeilingService, setOnLoadTopTypeOrderCeilingService] = useState(false);

    const chartBrandSales = (apiPath) => {
        setOnLoadBrandSales(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = {
                labels: data.map((item, index) => item.brand_name),
                datasets: [
                    {
                        label: 'ยอดขาย',
                        data: data.map((item, index) => item.sales),
                        // data: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)],
                        backgroundColor: data.map((item, index) => item.color),
                    },
                ],
            };
            setDataChartBrandSales(dtChart)
            setOnLoadBrandSales(false)
            // console.log("dtChartdtChart", dtChart)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartBrandSalesOnlyTire = (apiPath) => {
        setOnLoadBrandSalesOnlyTire(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = {
                labels: data.map((item, index) => item.brand_name),
                datasets: [
                    {
                        label: 'ยอดขาย',
                        data: data.map((item, index) => item.sales),
                        // data: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)],
                        backgroundColor: data.map((item, index) => item.color),
                    },
                ],
            };
            setDataChartBrandSalesOnlyTire(dtChart)
            setOnLoadBrandSalesOnlyTire(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartBrandSalesOnlySpare = (apiPath) => {
        setOnLoadBrandSalesOnlySpare(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = {
                labels: data.map((item, index) => item.brand_name),
                datasets: [
                    {
                        label: 'ยอดขาย',
                        data: data.map((item, index) => item.sales),
                        // data: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)],
                        backgroundColor: data.map((item, index) => item.color),
                    },
                ],
            };
            setDataChartBrandSalesOnlySpare(dtChart)
            setOnLoadBrandSalesOnlySpare(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartTypeSales = (apiPath) => {
        setOnLoadTypeSales(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = {
                labels: data.map((item, index) => item.type_name),
                datasets: [
                    {
                        label: 'ยอดขาย',
                        data: data.map((item, index) => item.sales),
                        // data: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)],
                        backgroundColor: data.map((item, index) => item.color),
                    },
                ],
            };
            setDataChartTypeSales(dtChart)
            setOnLoadTypeSales(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartDailyInfo = (apiPath) => {
        setOnLoadDailyInfo(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data;
            setDataChartDailyInfo(dtChart)
            setOnLoadDailyInfo(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartDailyFinanceInfo = (apiPath) => {
        setOnLoadDailyFinanceInfo(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data;
            setDataChartDailyFinanceInfo(dtChart)
            setOnLoadDailyFinanceInfo(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartCompareMonthlySales = (apiPath) => {
        setOnLoadCompareMonthlySales(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data;
            setDataChartCompareMonthlySales(dtChart)
            setOnLoadCompareMonthlySales(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartCompareSalesTarget = (apiPath) => {
        setOnLoadCompareSalesTarget(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = {
                labels: data.map((item, index) => item.brand_name),
                datasets: [
                    {
                        label: 'ยอดขาย',
                        data: data.map((item, index) => item.sales),
                        // data: [Math.floor(Math.random() * 100), Math.floor(Math.random() * 1000), Math.floor(Math.random() * 1000)],
                        backgroundColor: data.map((item, index) => item.color),
                    },
                ],
            };
            setDataChartCompareSalesTarget(dtChart)
            setOnLoadCompareSalesTarget(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartNumberOfUserThisMonth = (apiPath) => {
        setOnLoadNumberOfUserThisMonth(true)
        API.get(apiPath).then(({ data: { data } }) => {
            console.log("chartNumberOfUserThisMonth", data)
            data.datasets.map((e, i) => {
                try {
                    e.backgroundColor = colorGroup[i]
                    e.borderColor = colorGroup[i]
                } catch (error) {
                    console.log("erorr", errorF)
                }
            })
            var dtChart = data
            setDataChartNumberOfUserThisMonth(dtChart)
            setOnLoadNumberOfUserThisMonth(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartNumberOfIncomeThisMonth = (apiPath) => {
        setOnLoadNumberOfIncomeThisMonth(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            data.datasets.map((e, i) => {
                try {
                    e.backgroundColor = i === 0 ? "#ffcc00" : colorGroup[i]
                    e.borderColor = i === 0 ? "#ffcc00" : colorGroup[i]
                } catch (error) {
                    console.log("erorr", errorF)
                }
            })
            var dtChart = data
            setDataChartNumberOfIncomeThisMonth(dtChart)
            setOnLoadNumberOfIncomeThisMonth(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartCompareYearlySalesTireAmount = (apiPath) => {
        setOnLoadCompareYearlySalesTireAmount(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data[0];
            setDataChartCompareYearlySalesTireAmount(dtChart)
            setOnLoadCompareYearlySalesTireAmount(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartCompareYearlySalesSpareAmount = (apiPath) => {
        setOnLoadCompareYearlySalesSpareAmount(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data[0];
            setDataChartCompareYearlySalesSpareAmount(dtChart)
            setOnLoadCompareYearlySalesSpareAmount(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartNumberOfSalesTireAmountByMonth = (apiPath) => {
        setOnLoadNumberOfSalesTireAmountByMonth(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data[0]
            setDataNumberOfSalesTireAmountByMonth(dtChart)
            setOnLoadNumberOfSalesTireAmountByMonth(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartNumberOfSalesSpareAmountByMonth = (apiPath) => {
        setOnLoadNumberOfSalesSpareAmountByMonth(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = data[0]
            setDataNumberOfSalesSpareAmountByMonth(dtChart)
            setOnLoadNumberOfSalesSpareAmountByMonth(false)
        }).catch((err) => {
            console.log(err);

        });
    }

    const chartTopSizeSales = (apiPath) => {
        setOnLoadTopSizeSales(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopSizeSales(dtChart)
            setOnLoadTopSizeSales(false)
        }).catch((err) => {
            console.log(err);

        });
    }
    const chartTopTypeTire = (apiPath) => {
        setOnLoadTopTypeTire(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeTire(dtChart)
            setOnLoadTopTypeTire(false)
        }).catch((err) => {
            console.log(err);

        });
    }
    const chartTopTypeSpare = (apiPath) => {
        setOnLoadTopTypeSpare(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeSpare(dtChart)
            setOnLoadTopTypeSpare(false)
        }).catch((err) => {
            console.log(err);

        });
    }
    const chartTopTypeService = (apiPath) => {
        setOnLoadTopTypeService(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeService(dtChart)
            setOnLoadTopTypeService(false)
        }).catch((err) => {
            console.log(err);

        });
    }
    const chartTopCustomer = (apiPath) => {
        setOnLoadTopCustomer(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopCustomer(dtChart)
            setOnLoadTopCustomer(false)
        }).catch((err) => {
            console.log(err);

        });
    }
    const chartTopTypeOrderCeilingTire = (apiPath) => {
        setOnLoadTopTypeOrderCeilingTire(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeOrderCeilingTire(dtChart)
            setOnLoadTopTypeOrderCeilingTire(false)
        }).catch((err) => {
            console.log(err);
        });
    }
    const chartTopTypeOrderCeilingSpare = (apiPath) => {
        setOnLoadTopTypeOrderCeilingSpare(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeOrderCeilingSpare(dtChart)
            setOnLoadTopTypeOrderCeilingSpare(false)
        }).catch((err) => {
            console.log(err);
        });
    }
    const chartTopTypeOrderCeilingService = (apiPath) => {
        setOnLoadTopTypeOrderCeilingService(true)
        API.get(apiPath).then(({ data: { data } }) => {
            // console.log(data)
            var dtChart = isArray(data) && data.length > 0 ? data : []
            setDataTopTypeOrderCeilingService(dtChart)
            setOnLoadTopTypeOrderCeilingService(false)
        }).catch((err) => {
            console.log(err);
        });
    }


    const options = {
        responsive: true,
        height: 100,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Bar Chart',
            },
            datalabels: {
                display: false
            }
        },
        maintainAspectRatio: false
    };

    const pieOptions = {
        responsive: true,
        height: 100,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: false,
                text: 'Chart.js Bar Chart',
            },
            datalabels: {
                formatter: (value, ctx) => {
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.map(data => {
                        sum += data;
                    });
                    let percentage = MatchRound(value * 100 / sum) + "%";
                    return percentage;
                },
                color: '#000000',
            }
        },
        maintainAspectRatio: false
    };

    const debounceOnSearchRegistration = debounce((value) => getVehicleRegistration(value), 600)
    const debounceOnSearchProductStock = debounce((value) => getProductStock(value), 600)

    const getVehicleRegistration = async (search) => {
        try {
            const res = await API.get(
                `/shopVehicleCustomer/all?limit=10&page=0&sort=created_date&order=asc&status=active&search=${search}`
            );
            if (res.data.status = "success") {
                res.data.data.data.forEach(e => {
                    const isPersonal = isPlainObject(e.ShopPersonalCustomer) ? true : false;
                    const name = isPersonal ?
                        `${e.ShopPersonalCustomer.customer_name.first_name[locale.locale] ?? "-"} ${e.ShopPersonalCustomer.customer_name.last_name[locale.locale] ?? ""}` :
                        `${e.ShopBusinessCustomer.customer_name[locale.locale] ?? "-"}`;

                    const mobile_no = Object.entries(e[isPersonal ? `ShopPersonalCustomer` : `ShopBusinessCustomer`].mobile_no).map((x) => x[1]);
                    const vehicles_registration = `${isPlainObject(e.details) ? e.details.registration : "-"}`;
                    e.value_name = `${vehicles_registration} -> ${name} -> ${mobile_no.toString()}`
                    e.customer_type = isPersonal ? "person" : "business";
                    e.mobile_no = mobile_no.length > 0 ? mobile_no[0] : null;
                    e.customer_id = e[`Shop${isPersonal ? "Personal" : "Business"}Customer`].id;
                })
                setVehicleData(() => res.data.data.data)
            }
        } catch (error) {
            console.log('error', error)
        }
    }


    const goToVehicleRegistration = async (search) => {
        router.push({
            pathname: "MyData/VehicleRegistrationData/",
            query: { search: search }
        })
    }

    const getProductStock = async (search) => {
        try {
            const res = await API.get(
                `/shopStock/all?limit=10&page=0&sort=balance_date&order=asc&status=active&search=${search}&min_balance=1&max_balance=999999`
            );
            if (res.data.status = "success") {
                setProductStockData(() => res.data.data.data)
            }
        } catch (error) {
            console.log('error', error)
        }
    }

    const goToProductStock = async (search) => {
        router.push({
            pathname: "Inventory/Balances/",
            query: { search: search }
        })
    }


    /** กดปุ่มค้นหา */
    const onFinishSearch = (value) => {
        const select_shop_ids = null;
        const start_date = null;
        const end_date = null;
        const start_year_month = null;
        const end_year_month = null;
        const start_month = null;
        const end_month = null;
        const start_year = null;
        const end_year = null;

        if (isArray(value.select_shop_ids) && value.select_shop_ids.length > 0 || typeof (value.select_shop_ids) === "string") {
            select_shop_ids = value.select_shop_ids
        } else {
            select_shop_ids = ["all"]
        }
        if (isArray(value.filter_date)) {
            start_date = moment(value.filter_date[0]._d).format('YYYY-MM-DD')
            end_date = moment(value.filter_date[1]._d).format('YYYY-MM-DD')
            start_year_month = moment(value.filter_date[0]._d).format('YYYY-MM')
            end_year_month = moment(value.filter_date[1]._d).format('YYYY-MM')
            start_month = moment(value.filter_date[0]._d).format('MM')
            end_month = moment(value.filter_date[1]._d).format('MM')
            start_year = moment(value.filter_date[0]._d).format('YYYY')
            end_year = moment(value.filter_date[1]._d).format('YYYY')


        }
        const model_search = {
            select_shop_ids: select_shop_ids,
            start_date: start_date,
            end_date: end_date,
            start_year_month: start_year_month,
            end_year_month: end_year_month,
            start_month: start_month,
            end_month: end_month,
            start_year: start_year,
            end_year: end_year,
        }
        setModelSearch(model_search)
        GetDashBoard(model_search)
    }

    const onFinishSearchFail = (error) => {
        console.log(`error`, error)
    }

    const EmptyData = () => (
        <Row gutter={[10, 10]} style={{ height: "300px", justifyContent: "center", alignContent: "center" }}>
            <Col>
                <Empty />
            </Col>
        </Row>
    )



    const columnsTopSizeSales = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        {
            title: 'ไซต์',
            dataIndex: 'complete_size_name',
            key: 'complete_size_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนลูกค้าที่ซื้อ',
            dataIndex: 'amount_ad_purchased',
            key: 'amount_ad_purchased',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
    ]
    const columnsTopTypeTire = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        // {
        //     title: 'product_code',
        //     dataIndex: 'product_code',
        //     key: 'product_code',
        // },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'product_name',
            key: 'product_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนลูกค้าที่ซื้อ',
            dataIndex: 'amount_ad_purchased',
            key: 'amount_ad_purchased',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
    ]
    const columnsTopTypeSpare = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        // {
        //     title: 'product_code',
        //     dataIndex: 'product_code',
        //     key: 'product_code',
        // },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'product_name',
            key: 'product_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนลูกค้าที่ซื้อ',
            dataIndex: 'amount_ad_purchased',
            key: 'amount_ad_purchased',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
    ]
    const columnsTopTypeService = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        // {
        //     title: 'product_code',
        //     dataIndex: 'product_code',
        //     key: 'product_code',
        // },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'product_name',
            key: 'product_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวน',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนลูกค้าที่ซื้อ',
            dataIndex: 'amount_ad_purchased',
            key: 'amount_ad_purchased',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
    ]
    const columnsTopCustomer = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        {
            title: 'ชื่อลูกค้า',
            dataIndex: 'customer_name',
            key: 'customer_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนบิล',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
        {
            title: 'มูลค่า',
            dataIndex: 'amount_ad_purchased',
            key: 'amount_ad_purchased',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{(+text).toLocaleString() ?? "-"}</div>
                )
            }
        },
    ]
    const columnsTopTypeOrderCeiling = [
        {
            title: 'ลำดับ',
            dataIndex: 'no',
            key: 'no',
            align: "center",
        },
        // {
        //     title: 'product_code',
        //     dataIndex: 'product_code',
        //     key: 'product_code',
        // },
        {
            title: 'ชื่อสินค้า',
            dataIndex: 'product_name',
            key: 'product_name',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "start" }}>{text ?? "-"}</div>
                )
            }
        },
        {
            title: 'จำนวนคงเหลือ',
            dataIndex: 'amount',
            key: 'amount',
            align: "center",
            render: (text, record) => {
                let reorder_point = record?.reorder_point
                let over_qty_point = record?.over_qty_point
                return (
                    <>
                        <TooltipAntd title={reOrderPointColor(reorder_point, over_qty_point, +text) === "red" ? <div style={{ textAlign: "center" }}>จำนวนสินค้าต่ำกว่าจุดสั่งซื้อ <br></br>จุดสั่งซื้อคือ {reorder_point} </div> : reOrderPointColor(reorder_point, over_qty_point, +text) === "orange" ? <div style={{ textAlign: "center" }}>จำนวนสินค้าสูงเกินกว่าเพดานสินค้า <br></br>เพดานสินค้าซื้อคือ {over_qty_point} </div> : ""}>
                            <span
                                style={{
                                    color: reOrderPointColor(reorder_point, over_qty_point, +text),
                                    fontSize: reOrderPointColor(reorder_point, over_qty_point, +text) === "red" || reOrderPointColor(reorder_point, over_qty_point, +text) === "orange" ? "16px" : "",
                                    fontWeight: reOrderPointColor(reorder_point, over_qty_point, +text) === "red" || reOrderPointColor(reorder_point, over_qty_point, +text) === "orange" ? "700" : "",
                                }}>

                                {text ? Number(text).toLocaleString() : "0"}
                            </span>
                        </TooltipAntd>

                    </>
                )
            }
        },
        {
            title: 'จุดสั่งซื้อ',
            dataIndex: 'reorder_point',
            key: 'reorder_point',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{text ? (+text).toLocaleString() ?? "-" : "-"}</div>
                )
            }
        },
        {
            title: 'จุดเพดานสินค้า',
            dataIndex: 'over_qty_point',
            key: 'over_qty_point',
            align: "center",
            render: (text, record) => {
                return (
                    <div style={{ textAlign: "end" }}>{text ? (+text).toLocaleString() ?? "-" : "-"}</div>
                )
            }
        },
    ]

    const reOrderPointColor = (reorder_point, over_qty_point, qty) => {
        if ((reorder_point !== undefined && reorder_point !== null) || (over_qty_point !== undefined && over_qty_point !== null)) {
            if (qty < reorder_point) {
                return "red"
            } else if (qty > over_qty_point) {
                return "orange"
            } else {
                return ""
            }
        } else {
            return ""
        }
    }

    const MatchRound = (value) => (Math.round(+value * 100) / 100).toFixed(2)

    return (
        <>
            <div style={{ margin: 10, marginLeft: -10 }}>
            </div>

            <Row gutter={[10, 10]} style={{ paddingBottom: "30px" }}>
                <Col lg={24} md={24} xs={24}>
                    <Card hoverable bordered={false} title={<div style={titlestyle}><span>ค้นหา</span></div>} >
                        <Form
                            form={form}
                            labelCol={{ span: 6 }}
                            wrapperCol={{ span: 18 }}
                            layout="horizontal"
                            onFinish={onFinishSearch}
                            onFinishFailed={onFinishSearchFail}
                        >
                            <Row gutter={[10, 10]} hidden={isArray(shopInCorporate) ? shopInCorporate.length <= 1 ? true : false : false} >
                                <Col lg={10} md={10} xs={24}>
                                    <Form.Item
                                        name="select_shop_ids"
                                        label={"ค้นหาสาขา"}
                                    >
                                        <Select
                                            showSearch
                                            mode="multiple"
                                            filterOption={false}
                                            notFoundContent={null}
                                            style={{ width: "100%" }}
                                            placeholder="ทุกสาขา"
                                        >
                                            {shopInCorporate.sort((a, b) => a.shop_config.shop_order_number - b.shop_config.shop_order_number)?.map((e) => (
                                                <Select.Option key={e.id} value={e.id}>
                                                    {e?.shop_name?.shop_local_name === undefined || e?.shop_name?.shop_local_name === null || e?.shop_name?.shop_local_name === "" ? e?.shop_name?.[`${locale.locale}`] : e?.shop_name?.shop_local_name}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col lg={10} md={10} xs={24}>
                                    <Form.Item
                                        name="filter_date"
                                        label={"ค้นหาวันที่"}
                                    >
                                        <RangePicker format={'DD/MM/YYYY'} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col lg={4} md={4} xs={24} style={{ textAlign: "center" }} >
                                    <Button type="primary" style={{ width: 150 }} htmlType="submit">ค้นหา</Button>
                                </Col>
                            </Row>
                            <Row gutter={[10, 10]} hidden={isArray(shopInCorporate) ? shopInCorporate.length <= 1 ? false : true : true}>
                                <Col span={5}></Col>
                                <Col lg={10} md={10} xs={24}>
                                    <Form.Item
                                        name="filter_date"
                                        label={"ค้นหาวันที่"}
                                    >
                                        <RangePicker format={'DD/MM/YYYY'} style={{ width: "100%" }} />
                                    </Form.Item>
                                </Col>
                                <Col lg={4} md={4} xs={24} style={{ textAlign: "center" }} >
                                    <Button type="primary" style={{ width: 150 }} htmlType="submit">ค้นหา</Button>
                                </Col>
                                <Col span={5}></Col>
                            </Row>
                        </Form>
                    </Card>
                </Col>

                <Col lg={12} md={24} xs={24}>
                    <Card hoverable bordered={false} title={
                        <>
                            <div style={titlestyle}>เมนูลัด</div>
                            <div style={{ height: "22px" }}></div>
                        </>
                    } >
                        <Row gutter={[10, 10]} style={{ height: "300px" }} >
                            <Col lg={12} md={12} xs={12}>
                                <Select
                                    showSearch
                                    filterOption={false}
                                    notFoundContent={null}
                                    onSearch={(value) => debounceOnSearchRegistration(value)}
                                    onSelect={(value) => goToVehicleRegistration(value)}
                                    style={{ width: "100%" }}
                                    placeholder="ค้นหาทะเบียนรถ"
                                >
                                    {vehicleData.map((e) => (
                                        <Select.Option key={e.id} value={e.details.registration}>
                                            {e.value_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col lg={12} md={12} xs={12}>
                                <Select
                                    showSearch
                                    filterOption={false}
                                    notFoundContent={null}
                                    onSearch={(value) => debounceOnSearchProductStock(value)}
                                    onSelect={(value) => goToProductStock(value)}
                                    style={{ width: "100%" }}
                                    placeholder="ค้นหาสินค้าคงคลัง"
                                >
                                    {productStockData.map((e) => (
                                        <Select.Option key={e.id} value={e.ShopProduct.Product.product_name[locale.locale]}>
                                            {e.ShopProduct.Product.product_name[locale.locale]}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Sales/ShopQuotation/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_quatation_icon.svg"}></img>
                                    <br></br>
                                    ใบเสนอราคา
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Sales/ServicePlans/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_service_plan_icon.svg"}></img>
                                    <br></br>
                                    ใบสั่งซ่อม
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Sales/TemporaryInvoices/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_temporay_invoice_icon.svg"}></img>
                                    <br></br>
                                    ใบสั่งขาย
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Inventory/Balances/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_inventory_balance_icon.svg"}></img>
                                    <br></br>สินค้าคงคลัง
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "MyData/Reports/ReportShopLegacySalesOut/"
                                    // pathname: "MyData/ReportSalesOut/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_report_sales_icon.svg"}></img>
                                    <br></br>
                                    ข้อมูลระบบเก่า
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Inventory/ImportDocuments/"
                                })}>
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_import_document_icon.svg"}></img>
                                    <br></br>
                                    ใบรับสินค้า
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8} style={{ textAlign: "center" }}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "CheckStock/"
                                })} >
                                    <div style={dashboardBtnImg} ><ScanOutlined style={{ fontSize: "35px" }} /></div>
                                    สแกนเช็คสต๊อค
                                </Button>
                            </Col>
                            <Col lg={8} md={8} xs={8} style={{ textAlign: "center" }}>
                                <Button type='primary' className='dashboard-btn' onClick={() => router.push({
                                    pathname: "Inventory/BalancesAllBranch/"
                                })} >
                                    <img style={dashboardBtnImg} src={"/assets/images/icon/dashboard_inventory_balance_icon.svg"}></img>
                                    <br></br>คงคลัง (ทุกสาขา)
                                </Button>
                            </Col>
                            <Col lg={12} md={12} xs={12}>
                                <labels></labels>
                            </Col>
                            <Col lg={12} md={12} xs={12}>
                                <labels></labels>
                            </Col>
                        </Row>
                    </Card>
                </Col>



                <Col lg={8} md={24} xs={24} hidden>
                    <Card hoverable bordered={false}
                        title={
                            <>
                                <div style={titlestyle}>ข้อมูลการเงิน</div>
                                <div style={subtitlestyle}>{modelSearch.start_date === modelSearch.end_date ? `ข้อมูล ${moment(modelSearch.start_date).format("DD")}/${moment(modelSearch.start_date).format("MM")}/${moment(modelSearch.start_date).format("YYYY")}` : `ข้อมูล ${moment(modelSearch.start_date).format("DD")}/${moment(modelSearch.start_date).format("MM")}/${moment(modelSearch.start_date).format("YYYY")} ถึง ${moment(modelSearch.end_date).format("DD")}/${moment(modelSearch.end_date).format("MM")}/${moment(modelSearch.end_date).format("YYYY")}`} </div>
                            </>
                        }>
                        <Row gutter={[10, 10]} style={{ height: "300px", justifyContent: "center", alignContent: "center" }}>
                            {
                                onLoadDailyFinanceInfo ?
                                    <CarPreloader />
                                    :
                                    isPlainObject(dataChartDailyFinanceInfo) ?
                                        <>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>

                                                <div style={highlightStyle}>
                                                    ยอดขายสินค้า
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}>{dataChartDailyFinanceInfo.product_sales == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.product_sales) ?? 0}</span></labels>
                                                    {/* <labels style={{ fontSize: "2em", color: "#40a9ff" }}>{(dataChartDailyFinanceInfo.product_sales == null ? 0 : dataChartDailyFinanceInfo.product_sales).toLocaleString((undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</labels> */}
                                                    <br></br>บาท
                                                </div>

                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center", position: "relative" }}>
                                                <div style={highlightStyle}>
                                                    ต้นทุนสินค้า
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}>{dataChartDailyFinanceInfo.product_cost == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.product_cost) ?? 0}</span></labels>
                                                    <br></br>บาท
                                                </div>

                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    กำไรจากสินค้า
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}>{dataChartDailyFinanceInfo.product_profit == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.product_profit) ?? 0}</span></labels>
                                                    <br></br>บาท
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    % กำไรจากสินค้า
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}></span>{dataChartDailyFinanceInfo.product_profit_percent == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.product_profit_percent) ?? 0}</labels>
                                                    <br></br>เปอร์เซ็นต์
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    ค่าบริการ
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}>{dataChartDailyFinanceInfo.service_fee == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.service_fee) ?? 0}</span></labels>
                                                    <br></br>บาท
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    รวมรายรับทั้งหมด
                                                    <br></br>
                                                    <labels style={{ fontSize: 30, color: "#40a9ff" }}><span style={{ fontSize: dataChartDailyFinanceInfo.product_sales > 1000000 ? "1.2" : "1.6rem" }}>{dataChartDailyFinanceInfo.total_income == null ? 0 : RoundingNumber(dataChartDailyFinanceInfo.total_income) ?? 0}</span></labels>
                                                    <br></br>บาท
                                                </div>
                                            </Col>
                                        </>
                                        :
                                        <EmptyData />
                            }
                        </Row>
                    </Card>
                </Col>



                <Col lg={12} md={24} xs={24} >
                    <Card hoverable bordered={false}
                        title={
                            <>
                                <div style={titlestyle}>ข้อมูลทั่วไป</div>
                                <div style={subtitlestyle}>{modelSearch.start_date === modelSearch.end_date ? `ข้อมูล ${moment(modelSearch.start_date).format("DD")}/${moment(modelSearch.start_date).format("MM")}/${moment(modelSearch.start_date).format("YYYY")}` : `ข้อมูล ${moment(modelSearch.start_date).format("DD")}/${moment(modelSearch.start_date).format("MM")}/${moment(modelSearch.start_date).format("YYYY")} ถึง ${moment(modelSearch.end_date).format("DD")}/${moment(modelSearch.end_date).format("MM")}/${moment(modelSearch.end_date).format("YYYY")}`} </div>
                            </>
                        }>
                        <Row gutter={[10, 10]} style={{ height: "300px", justifyContent: "center", alignContent: "center" }}>
                            {
                                onLoadDailyInfo ?
                                    <CarPreloader />
                                    : isPlainObject(dataChartDailyInfo) ?
                                        <>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    จำนวนลูกค้า
                                                    <br></br>
                                                    <labels style={{ fontSize: 50, color: "#40a9ff" }}>{dataChartDailyInfo.customer == null ? 0 : dataChartDailyInfo.customer.toLocaleString()}</labels>
                                                    <br></br>คน
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    จำนวนยางที่ใช้
                                                    <br></br>
                                                    <labels style={{ fontSize: 50, color: "#40a9ff" }}>{dataChartDailyInfo.tire == null ? 0 : dataChartDailyInfo.tire.toLocaleString()}</labels>
                                                    <br></br>เส้น
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    จำนวนอะไหล่ที่ใช้
                                                    <br></br>
                                                    <labels style={{ fontSize: 50, color: "#40a9ff" }}>{dataChartDailyInfo.spares == null ? 0 : dataChartDailyInfo.spares.toLocaleString()}</labels>
                                                    <br></br>รายการ
                                                </div>
                                            </Col>
                                            <Col lg={12} md={12} xs={12} style={{ textAlign: "center" }}>
                                                <div style={highlightStyle}>
                                                    ลูกค้าที่กลับมาในเดือน
                                                    <br></br>
                                                    <labels style={{ fontSize: 50, color: "#40a9ff" }}>{dataChartDailyInfo.customer_return == null ? 0 : dataChartDailyInfo.customer_return.toLocaleString()}</labels>
                                                    <br></br>คน
                                                </div>
                                            </Col>
                                        </>
                                        :
                                        <EmptyData />
                            }
                        </Row>
                    </Card>
                </Col>


            </Row >
            <style jsx global>
                {`
                .ant-switch{
                    background: #04afe3 !important;
                }
                .ant-switch.ant-switch-checked {
                    background: #ffcc00 !important;
                }
                    .ant-card{
                        border-radius: 8px !important;
                    }
                `}
            </style>
        </>
    )
}

export default DashboardEmployee
