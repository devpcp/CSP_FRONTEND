import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../../components/Hoc/securedPage";
import Preloader from "../../components/_App/Preloader";
import { useSelector } from "react-redux";
import GetHeadTitlePermission from "../../util/GetHeadTitlePermission";
const MyData = dynamic(() => import("../../routes/MyData"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>{GetHeadTitlePermission(useSelector)}</title>
            <link rel="stylesheet" href="/assets/css/style.css" />
        </Head>
        <React.Fragment>
            <MyData />
        </React.Fragment>
    </React.Fragment>
));
