import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../../components/Hoc/securedPage";
import Preloader from "../../components/_App/Preloader";
import { Card } from 'antd';
import { useSelector } from "react-redux";
import GetHeadTitlePermission from "../../util/GetHeadTitlePermission";
const Dealers = dynamic(() => import("../../routes/MichelinDataManagement/Dealers"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>{GetHeadTitlePermission(useSelector)}</title>
        </Head>
        <React.Fragment>
            <Card className="mb-5">
                <Dealers />
            </Card>
        </React.Fragment>
    </React.Fragment>
));
