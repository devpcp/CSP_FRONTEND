import React from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import Page from "../components/Hoc/securedPage";
import Preloader from "../components/_App/Preloader";
const Dashboard = dynamic(() => import("../routes/Dashboard"), { loading: () => <Preloader /> });

export default Page(() => (
    <React.Fragment>
        <Head>
            <title>Dashboard</title>
        </Head>
        <React.Fragment>
            <Dashboard />
        </React.Fragment>
    </React.Fragment>
));
