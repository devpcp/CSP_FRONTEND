import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../../components/Hoc/securedPage";
import Preloader from "../../components/_App/Preloader";
import { Card } from 'antd';
import GetHeadTitlePermission from "../../util/GetHeadTitlePermission";
import { useSelector } from "react-redux";
const ReportReturnProduct = dynamic(() => import("../../routes/Reports/ReportReturnProduct"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>{GetHeadTitlePermission(useSelector)}</title>
        </Head>
        <React.Fragment>
            <Card className="mb-5">
                <ReportReturnProduct />
            </Card>
        </React.Fragment>
    </React.Fragment>
));
