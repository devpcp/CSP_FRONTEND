import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../../components/Hoc/securedPage";
import Preloader from "../../components/_App/Preloader";
import { Card } from 'antd';
import GetHeadTitlePermission from "../../util/GetHeadTitlePermission";
import { useSelector } from "react-redux";
const ReportFinance = dynamic(() => import("../../routes/Reports/ReportFInance"), { loading: () => <Preloader /> });

export default Page(() => (
    
    <React.Fragment>
        <Head>
            <title>{GetHeadTitlePermission(useSelector)}</title>
        </Head>
        <React.Fragment>
            <Card className="mb-5">
                <ReportFinance />
            </Card>
        </React.Fragment>
    </React.Fragment>
));
